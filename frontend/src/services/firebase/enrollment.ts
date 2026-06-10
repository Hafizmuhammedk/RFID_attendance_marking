import { ref, set, get } from "firebase/database";
import { database } from "@/config/firebase";

/** Heartbeat threshold: 30 s — ESP32 sends every 15 s.
 *  If no heartbeat arrives within 30 s (2× interval), device is offline.
 */
const HEARTBEAT_THRESHOLD_MS = 30_000;

/**
 * Returns true if the given Unix-SECONDS timestamp is within the last 65 seconds.
 * The ESP32 sends Unix seconds (not ms) to avoid 32-bit overflow on the MCU.
 */
export function isESP32Online(lastHeartbeat: number): boolean {
  return Date.now() - lastHeartbeat * 1000 < HEARTBEAT_THRESHOLD_MS;
}

/**
 * Writes enrollMode = true to system/ in RTDB, signalling the ESP32 to
 * listen for the next card scan and write it as pendingCardUID.
 */
export async function startEnrollmentMode(): Promise<void> {
  const enrollRef = ref(database, "system/enrollMode");
  await set(enrollRef, true);
}

/**
 * Clears enrollment mode: sets enrollMode = false and clears pendingCardUID.
 */
export async function stopEnrollmentMode(): Promise<void> {
  const systemRef = ref(database, "system");
  const snapshot  = await get(systemRef);
  const current   = snapshot.exists() ? snapshot.val() : {};

  await set(systemRef, {
    ...current,
    enrollMode:     false,
    pendingCardUID: "",
  });
}
