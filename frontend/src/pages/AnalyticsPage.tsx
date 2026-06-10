import React, { useState } from 'react';
import { useAttendanceContext } from '@/context/AttendanceContext';
import SummaryCards from '@/components/analytics/SummaryCards';
import DailyChart from '@/components/analytics/DailyChart';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BarChart3 } from 'lucide-react';
import type { AttendanceRecord } from '@/types';

const DAY_OPTIONS = [7, 14, 30];

// ── Top attendees inline component ───────────────────────
const TopUsersTable: React.FC<{ records: AttendanceRecord[] }> = ({ records }) => {
  const countMap: Record<string, { name: string; count: number }> = {};
  records
    .filter((r) => r.status === 'check-in')
    .forEach((r) => {
      if (!countMap[r.cardUID]) countMap[r.cardUID] = { name: r.name, count: 0 };
      countMap[r.cardUID].count++;
    });

  const top = Object.entries(countMap)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10);

  if (top.length === 0) return null;

  const maxCount = top[0]?.[1].count ?? 1;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Top Attendees (All Time)</h3>
      <div className="space-y-3">
        {top.map(([uid, { name, count }], idx) => (
          <div key={uid} className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 w-5 tabular-nums">{idx + 1}</span>
            <div className="h-7 w-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-brand-700">{name.charAt(0)}</span>
            </div>
            <span className="flex-1 text-sm font-medium text-slate-700 truncate">{name}</span>
            <div className="flex items-center gap-2">
              <div
                className="h-1.5 rounded-full bg-brand-400 transition-all"
                style={{ width: `${Math.max(8, (count / maxCount) * 80)}px` }}
              />
              <span className="text-xs font-bold text-brand-600 tabular-nums w-8 text-right">
                {count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────
const AnalyticsPage: React.FC = () => {
  const { records, isLoading } = useAttendanceContext();
  const [days, setDays] = useState<number>(7);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-slate-400" />
          <p className="text-sm font-medium text-slate-600">
            Based on{' '}
            <span className="font-bold text-slate-900">{records.length}</span> total records
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                days === d ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      <SummaryCards records={records} />
      <DailyChart records={records} days={days} />
      <TopUsersTable records={records} />
    </div>
  );
};

export default AnalyticsPage;
