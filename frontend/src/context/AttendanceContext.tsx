import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useMemo,
  type ReactNode,
} from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '@/config/firebase';
import type {
  AttendanceContextState,
  AttendanceAction,
  AttendanceRecord,
  SystemState,
  AppUser,
} from '@/types';
import toast from 'react-hot-toast';

// ── Reducer ───────────────────────────────────────────────

const initialState: AttendanceContextState = {
  records: [],
  system: null,
  users: [],
  enrollmentStep: 'idle',
  pendingCardUID: '',
  isLoading: true,
  timeoutAt: null,
};

function attendanceReducer(
  state: AttendanceContextState,
  action: AttendanceAction
): AttendanceContextState {
  switch (action.type) {
    case 'SET_RECORDS':
      return { ...state, records: action.payload };
    case 'SET_SYSTEM':
      return { ...state, system: action.payload };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'SET_ENROLLMENT_STEP':
      return { ...state, enrollmentStep: action.payload };
    case 'SET_PENDING_UID':
      return { ...state, pendingCardUID: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_TIMEOUT_AT':
      return { ...state, timeoutAt: action.payload };
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────

interface AttendanceContextValue extends AttendanceContextState {
  dispatch: React.Dispatch<AttendanceAction>;
}

const AttendanceContext = createContext<AttendanceContextValue | null>(null);

// ── Helper: parse RTDB attendance snapshot ────────────────

function parseAttendanceSnapshot(data: Record<string, Record<string, AttendanceRecord>>): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  Object.entries(data).forEach(([_date, dateGroup]) => {
    Object.entries(dateGroup).forEach(([recordId, record]) => {
      // ESP32 writes Unix seconds; normalize to ms for all JS Date usage.
      // Values < 10_000_000_000 are seconds (year < ~2286 in ms), multiply by 1000.
      const ts = record.timestamp;
      records.push({
        ...record,
        recordId,                                              // preserve Firebase key for delete
        timestamp: ts < 10_000_000_000 ? ts * 1000 : ts,
      });
    });
  });
  return records.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * AttendanceProvider — sets up three permanent real-time RTDB listeners:
 *   1. attendance/ — all attendance records
 *   2. system/     — ESP32 status, enrollMode, pendingCardUID
 *   3. users/      — all registered users
 *
 * When pendingCardUID changes from '' to a UID while enrollMode is true,
 * automatically transitions enrollment step to 'form'.
 */
export const AttendanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(attendanceReducer, initialState);
  const prevPendingUID = useRef<string>('');

  useEffect(() => {
    // ── Listener 1: attendance ─────────────────────────
    const attendanceRef = ref(database, 'attendance');
    const unsubAttendance = onValue(
      attendanceRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val() as Record<string, Record<string, AttendanceRecord>>;
          dispatch({ type: 'SET_RECORDS', payload: parseAttendanceSnapshot(data) });
        } else {
          dispatch({ type: 'SET_RECORDS', payload: [] });
        }
        dispatch({ type: 'SET_LOADING', payload: false });
      },
      (error) => {
        console.error('[RTDB] Attendance listener error:', error);
        toast.error('Failed to load attendance data');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    );

    // ── Listener 2: system ────────────────────────────
    const systemRef = ref(database, 'system');
    const unsubSystem = onValue(
      systemRef,
      (snapshot) => {
        if (!snapshot.exists()) return;
        const system = snapshot.val() as SystemState;
        dispatch({ type: 'SET_SYSTEM', payload: system });

        // Detect pendingCardUID change (empty → UID) while in enrollment mode
        const newUID = system.pendingCardUID ?? '';
        const oldUID = prevPendingUID.current;
        if (system.enrollMode && newUID !== '' && oldUID !== newUID) {
          dispatch({ type: 'SET_PENDING_UID', payload: newUID });
          dispatch({ type: 'SET_ENROLLMENT_STEP', payload: 'form' });
          toast.success(`Card detected: ${newUID}`);
        }
        prevPendingUID.current = newUID;
      },
      (error) => {
        console.error('[RTDB] System listener error:', error);
      }
    );

    // ── Listener 3: users ─────────────────────────────
    const usersRef = ref(database, 'users');
    const unsubUsers = onValue(
      usersRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          dispatch({ type: 'SET_USERS', payload: [] });
          return;
        }
        const data = snapshot.val() as Record<string, AppUser>;
        const users = Object.values(data).sort((a, b) => a.name.localeCompare(b.name));
        dispatch({ type: 'SET_USERS', payload: users });
      },
      (error) => {
        console.error('[RTDB] Users listener error:', error);
      }
    );

    return () => {
      off(attendanceRef);
      off(systemRef);
      off(usersRef);
      unsubAttendance();
      unsubSystem();
      unsubUsers();
    };
  }, []);

  // Build a fast cardUID → name lookup from the users list
  const userNameMap = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    state.users.forEach((u) => {
      if (u.cardUID) map[u.cardUID] = u.name;
    });
    return map;
  }, [state.users]);

  // Enrich attendance records with the real name from users/
  // The ESP32 writes the raw UID as the name at scan-time, so we patch it here.
  const enrichedRecords = useMemo<AttendanceRecord[]>(
    () =>
      state.records.map((r) => ({
        ...r,
        name: userNameMap[r.cardUID] ?? r.name,
      })),
    [state.records, userNameMap]
  );

  return (
    <AttendanceContext.Provider value={{ ...state, records: enrichedRecords, dispatch }}>
      {children}
    </AttendanceContext.Provider>
  );
};

export function useAttendanceContext(): AttendanceContextValue {
  const ctx = useContext(AttendanceContext);
  if (!ctx) throw new Error('useAttendanceContext must be used within AttendanceProvider');
  return ctx;
}
