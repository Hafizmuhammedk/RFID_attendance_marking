import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { AttendanceFilters, AttendanceStatus } from '@/types';
import { format } from 'date-fns';

interface FilterBarProps {
  filters: AttendanceFilters;
  onChange: (filters: AttendanceFilters) => void;
}

const STATUS_OPTIONS: { label: string; value: AttendanceStatus | '' }[] = [
  { label: 'All Statuses', value: '' },
  { label: 'Check In',     value: 'check-in' },
  { label: 'Check Out',    value: 'check-out' },
  { label: 'Denied',       value: 'denied' },
];

const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange }) => {
  const hasActiveFilters =
    filters.search !== '' || filters.date !== '' || filters.status !== '';

  const handleReset = () => {
    onChange({ search: '', date: '', status: '' });
  };

  return (
    <div className="flex flex-wrap items-end gap-3 p-4 bg-white border border-slate-200 rounded-xl">
      {/* Search */}
      <div className="flex-1 min-w-48">
        <Input
          id="attendance-search"
          label="Search"
          placeholder="Name or card UID..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          leftAddon={<Search className="h-3.5 w-3.5" />}
        />
      </div>

      {/* Date picker */}
      <div className="w-44">
        <Input
          id="attendance-date"
          label="Date"
          type="date"
          value={filters.date}
          max={format(new Date(), 'yyyy-MM-dd')}
          onChange={(e) => onChange({ ...filters, date: e.target.value })}
        />
      </div>

      {/* Status select */}
      <div className="w-44 flex flex-col gap-1.5">
        <label htmlFor="attendance-status" className="text-sm font-medium text-slate-700">
          Status
        </label>
        <select
          id="attendance-status"
          value={filters.status}
          onChange={(e) =>
            onChange({ ...filters, status: e.target.value as AttendanceStatus | '' })
          }
          className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="md"
          onClick={handleReset}
          leftIcon={<X className="h-3.5 w-3.5" />}
          className="self-end"
        >
          Clear
        </Button>
      )}
    </div>
  );
};

export default FilterBar;
