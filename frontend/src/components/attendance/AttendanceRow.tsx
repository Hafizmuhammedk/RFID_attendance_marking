import React from 'react';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import type { AttendanceRecord } from '@/types';
import { Badge, getStatusBadgeVariant } from '@/components/ui/Badge';

interface AttendanceRowProps {
  record: AttendanceRecord;
  onDelete?: (record: AttendanceRecord) => void;
  index: number;
}

const AttendanceRow: React.FC<AttendanceRowProps> = ({ record, onDelete, index }) => {
  const time = format(new Date(record.timestamp), 'HH:mm:ss');
  const date = format(new Date(record.timestamp), 'MMM d, yyyy');

  return (
    <tr
      className={`transition-colors hover:bg-slate-50 ${
        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
      }`}
    >
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{record.name}</p>
          <p className="text-xs text-slate-400 uid-text">{record.cardUID}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-700">{date}</td>
      <td className="px-4 py-3 font-mono text-sm text-slate-700 font-medium">{time}</td>
      <td className="px-4 py-3">
        <Badge variant={getStatusBadgeVariant(record.status)} dot>
          {record.status}
        </Badge>
      </td>
      {onDelete && (
        <td className="px-4 py-3">
          <button
            onClick={() => onDelete(record)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            aria-label={`Delete record for ${record.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </td>
      )}
    </tr>
  );
};

export default AttendanceRow;
