import { ref, remove } from "firebase/database";
import { database } from "@/config/firebase";
import type { AttendanceFilters, AttendanceRecord } from "@/types";

/** Returns today's date as "YYYY-MM-DD" in local time */
export function getTodayDateString(): string {
  const now = new Date();
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day   = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Permanently removes a single attendance record from RTDB.
 * Records are stored at attendance/{date}/{recordId}.
 *
 * @param date     - ISO date string, e.g. "2026-05-15"
 * @param recordId - The Firebase key (e.g. "06DDCA06_1747323900")
 */
export async function deleteAttendanceRecord(
  date: string,
  recordId: string
): Promise<void> {
  const recordRef = ref(database, `attendance/${date}/${recordId}`);
  await remove(recordRef);
}

/**
 * Pure filter function — no Firebase I/O.
 * Filters an array of AttendanceRecord objects based on the provided criteria.
 */
export function filterAttendanceRecords(
  records: AttendanceRecord[],
  filters: AttendanceFilters
): AttendanceRecord[] {
  return records.filter((record) => {
    // ── Date filter ────────────────────────────────────────────
    if (filters.date && record.date !== filters.date) return false;

    // ── Status filter ──────────────────────────────────────────
    if (filters.status && record.status !== filters.status) return false;

    // ── Search filter (name or cardUID, case-insensitive) ──────
    if (filters.search) {
      const query = filters.search.toLowerCase();
      const matchesName    = record.name?.toLowerCase().includes(query);
      const matchesCardUID = record.cardUID?.toLowerCase().includes(query);
      if (!matchesName && !matchesCardUID) return false;
    }

    return true;
  });
}
