import { useEffect, useState, useMemo, useRef } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/config/firebase';
import { isESP32Online } from '@/services/firebase/enrollment';
import type { SystemState, ESP32StatusType } from '@/types';

interface ESP32StatusResult {
  status: ESP32StatusType;
  lastHeartbeat: number | null;
  lastSeen: string | null;
}

/**
 * Hook that watches system/ in real-time.
 * Returns 'online' if last heartbeat was within 65 seconds, 'offline' otherwise.
 * The ESP32 sends its heartbeat every 30 seconds.
 */
export function useESP32Status(): ESP32StatusResult {
  const [systemData, setSystemData] = useState<SystemState | null>(null);
  const [tick, setTick]             = useState(0);
  const dataRef                     = useRef<SystemState | null>(null);

  // ── Stable Firebase subscription (never re-subscribes) ──────
  useEffect(() => {
    const systemRef = ref(database, 'system');
    const unsubscribe = onValue(systemRef, (snapshot) => {
      const val = snapshot.exists() ? (snapshot.val() as SystemState) : null;
      dataRef.current = val;
      setSystemData(val);
    });
    return () => unsubscribe();
  }, []); // empty deps → subscribes once, never re-subscribes

  // ── Re-evaluate every 5 s so offline transition is detected ─
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(id);
  }, []);

  // ── Compute status from latest data + current time ───────────
  const status = useMemo<ESP32StatusType>(() => {
    if (!systemData) return 'offline';
    const hb = systemData.lastHeartbeat;
    // Only trust a recent heartbeat (Unix seconds from ESP32, within 65 s)
    if (hb && isESP32Online(hb)) return 'online';
    return 'offline';
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [systemData, tick]);

  const lastHeartbeat = systemData?.lastHeartbeat ?? null;

  const lastSeen = lastHeartbeat
    ? new Date(lastHeartbeat * 1000).toLocaleTimeString('en-IN', {
        hour:   '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : null;

  return { status, lastHeartbeat, lastSeen };
}
