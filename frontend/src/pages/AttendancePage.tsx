import React, { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { useAttendance } from '@/hooks/useAttendance';
import { useAttendanceContext } from '@/context/AttendanceContext';
import AttendanceTable from '@/components/attendance/AttendanceTable';
import FilterBar from '@/components/attendance/FilterBar';
import { LiveBadge } from '@/components/attendance/LiveBadge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { AttendanceFilters, AttendanceRecord } from '@/types';
import { deleteAttendanceRecord, getTodayDateString } from '@/services/firebase/attendance';
import toast from 'react-hot-toast';

const AttendancePage: React.FC = () => {
  const [filters, setFilters] = useState<AttendanceFilters>({
    date: getTodayDateString(),
    search: '',
    status: '',
  });
  const [deleteTarget, setDeleteTarget] = useState<AttendanceRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { records, isLoading } = useAttendance(filters);
  const { records: allRecords } = useAttendanceContext();

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteAttendanceRecord(
        deleteTarget.date,
        deleteTarget.recordId,
      );
      toast.success('Record deleted');
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete record');
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">
            {allRecords.length} total records · {records.length} shown
          </p>
        </div>
        <LiveBadge />
      </div>

      {/* Filters */}
      <FilterBar filters={filters} onChange={setFilters} />

      {/* Table */}
      <AttendanceTable
        records={records}
        isLoading={isLoading}
        onDelete={(record) => setDeleteTarget(record)}
      />

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Record"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-700">
          Delete attendance record for{' '}
          <span className="font-semibold">{deleteTarget?.name}</span> at{' '}
          <span className="font-semibold">
            {deleteTarget ? format(new Date(deleteTarget.timestamp), 'HH:mm:ss, MMM d') : ''}
          </span>
          ?
        </p>
        <p className="mt-2 text-xs text-red-500">This cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default AttendancePage;
