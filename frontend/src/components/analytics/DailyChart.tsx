import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays } from 'date-fns';
import type { AttendanceRecord, DailyAttendancePoint } from '@/types';

interface DailyChartProps {
  records: AttendanceRecord[];
  days?: number;
}

const DailyChart: React.FC<DailyChartProps> = ({ records, days = 7 }) => {
  const chartData = useMemo<DailyAttendancePoint[]>(() => {
    const result: DailyAttendancePoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayRecords = records.filter((r) => r.date === dateStr);
      result.push({
        date: format(date, 'MMM d'),
        checkIns:  dayRecords.filter((r) => r.status === 'check-in').length,
        checkOuts: dayRecords.filter((r) => r.status === 'check-out').length,
        denied:    dayRecords.filter((r) => r.status === 'denied').length,
      });
    }
    return result;
  }, [records, days]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">
        Attendance Trend — Last {days} Days
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
          <defs>
            <linearGradient id="colorCheckIn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorCheckOut" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorDenied" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '12px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
          <Area
            type="monotone"
            dataKey="checkIns"
            name="Check In"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#colorCheckIn)"
            dot={{ r: 3, fill: '#10b981' }}
          />
          <Area
            type="monotone"
            dataKey="checkOuts"
            name="Check Out"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#colorCheckOut)"
            dot={{ r: 3, fill: '#3b82f6' }}
          />
          <Area
            type="monotone"
            dataKey="denied"
            name="Denied"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#colorDenied)"
            dot={{ r: 3, fill: '#ef4444' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailyChart;
