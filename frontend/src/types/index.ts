// ============================================================
// ALL APPLICATION TYPESCRIPT TYPES & INTERFACES
// ============================================================

/** Role options for a registered user */
export type UserRole = 'student' | 'staff' | 'admin' | 'guest';

/** Attendance event types */
export type AttendanceStatus = 'check-in' | 'check-out' | 'denied';

/** ESP32 device connectivity status */
export type ESP32StatusType = 'online' | 'offline' | 'unknown';

// ── Firebase RTDB Data Models ─────────────────────────────

/**
 * Registered user / card holder stored at users/{cardUID}
 */
export interface AppUser {
  cardUID: string;
  name: string;
  employeeId: string;
  role: UserRole;
  department: string;
  notes?: string;
  enrolledAt: number;       // Unix ms timestamp
  enrolledBy: string;       // Admin email
  isActive: boolean;
}

/**
 * Single attendance event stored at attendance/{date}/{recordId}
 */
export interface AttendanceRecord {
  recordId: string;         // Firebase key: "{UID_no_colons}_{timestamp_secs}"
  cardUID: string;
  userId: string;
  name: string;
  timestamp: number;        // Unix ms timestamp (normalized from seconds on read)
  status: AttendanceStatus;
  date: string;             // ISO date string: "2026-05-12"
}

/**
 * System-level state stored at system/
 */
export interface SystemState {
  enrollMode: boolean;
  lastHeartbeat: number;    // Unix SECONDS from ESP32
  esp32Status: ESP32StatusType;
  pendingCardUID: string;
}

// ── Enrollment Flow State ─────────────────────────────────

export type EnrollmentStep = 'idle' | 'waiting' | 'form' | 'success';

export interface EnrollmentState {
  step: EnrollmentStep;
  pendingCardUID: string;
  timeoutAt: number | null; // Unix ms timestamp when timeout fires
}

// ── Auth ──────────────────────────────────────────────────

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

// ── UI / Filter State ─────────────────────────────────────

export interface AttendanceFilters {
  date: string;             // "YYYY-MM-DD" or "" for all
  search: string;           // name or cardUID search term
  status: AttendanceStatus | '';
}

// ── Analytics ─────────────────────────────────────────────

export interface DailyAttendancePoint {
  date: string;             // "May 12"
  checkIns: number;
  checkOuts: number;
  denied: number;
}

export interface AttendanceSummary {
  totalToday: number;
  presentToday: number;
  uniqueUsers: number;
  deniedToday: number;
}

// ── Context Actions (useReducer) ──────────────────────────

export type AttendanceAction =
  | { type: 'SET_RECORDS'; payload: AttendanceRecord[] }
  | { type: 'SET_SYSTEM'; payload: SystemState }
  | { type: 'SET_USERS'; payload: AppUser[] }
  | { type: 'SET_ENROLLMENT_STEP'; payload: EnrollmentStep }
  | { type: 'SET_PENDING_UID'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TIMEOUT_AT'; payload: number | null };

export interface AttendanceContextState {
  records: AttendanceRecord[];
  system: SystemState | null;
  users: AppUser[];
  enrollmentStep: EnrollmentStep;
  pendingCardUID: string;
  isLoading: boolean;
  timeoutAt: number | null;
}
