import React from 'react';
import { ClipboardList } from 'lucide-react';
import type { AttendanceRecord } from '@/types';
import AttendanceRow from './AttendanceRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  isLoading: boolean;
  onDelete?: (record: AttendanceRecord) => void;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({
  records,
  isLoading,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No attendance records"
        description="Records will appear here in real-time as cards are scanned by the ESP32."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead>
          <tr className="bg-slate-50">
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Name / Card UID
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Time
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Status
            </th>
            {onDelete && (
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Action
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {records.map((record, index) => (
            <AttendanceRow
              key={`${record.cardUID}-${record.timestamp}`}
              record={record}
              onDelete={onDelete}
              index={index}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;
