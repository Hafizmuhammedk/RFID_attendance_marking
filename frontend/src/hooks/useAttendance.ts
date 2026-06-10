import { useMemo } from 'react';
import { useAttendanceContext } from '@/context/AttendanceContext';
import { filterAttendanceRecords } from '@/services/firebase/attendance';
import type { AttendanceFilters, AttendanceRecord } from '@/types';

/**
 * Hook for accessing and filtering attendance records from context.
 * @param filters — optional filter criteria; pass undefined to get all records
 * @returns { records, isLoading }
 */
export function useAttendance(filters?: AttendanceFilters): {
  records: AttendanceRecord[];
  isLoading: boolean;
} {
  const { records, isLoading } = useAttendanceContext();

  const filteredRecords = useMemo(() => {
    if (!filters) return records;
    return filterAttendanceRecords(records, filters);
  }, [records, filters]);

  return { records: filteredRecords, isLoading };
}
