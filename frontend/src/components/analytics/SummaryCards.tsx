import React, { useMemo } from 'react';
import { Users, UserCheck, TrendingUp, ShieldX } from 'lucide-react';
import type { AttendanceRecord } from '@/types';
import { format } from 'date-fns';

interface SummaryCardsProps {
  records: AttendanceRecord[];
}

interface StatCard {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ records }) => {
  const today = format(new Date(), 'yyyy-MM-dd');

  const stats = useMemo(() => {
    const todayRecords = records.filter((r) => r.date === today);
    const uniqueToday  = new Set(todayRecords.map((r) => r.cardUID)).size;
    const checkInsToday = todayRecords.filter((r) => r.status === 'check-in').length;
    const deniedToday   = todayRecords.filter((r) => r.status === 'denied').length;
    const totalAll      = records.length;

    return { uniqueToday, checkInsToday, deniedToday, totalAll };
  }, [records, today]);

  const cards: StatCard[] = [
    {
      label:       'Total Records',
      value:       stats.totalAll,
      icon:        TrendingUp,
      color:       'text-brand-600',
      bgColor:     'bg-brand-50',
      borderColor: 'border-brand-100',
    },
    {
      label:       'Present Today',
      value:       stats.uniqueToday,
      icon:        UserCheck,
      color:       'text-emerald-600',
      bgColor:     'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
    {
      label:       'Check-Ins Today',
      value:       stats.checkInsToday,
      icon:        Users,
      color:       'text-blue-600',
      bgColor:     'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      label:       'Denied Today',
      value:       stats.deniedToday,
      icon:        ShieldX,
      color:       'text-red-600',
      bgColor:     'bg-red-50',
      borderColor: 'border-red-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, color, bgColor, borderColor }) => (
        <div
          key={label}
          className={`rounded-xl border ${borderColor} ${bgColor} p-4 shadow-card`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`h-9 w-9 rounded-lg bg-white/70 flex items-center justify-center shadow-sm`}>
              <Icon className={`h-4.5 w-4.5 ${color}`} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${color} tabular-nums`}>{value}</p>
          <p className="text-xs font-medium text-slate-500 mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
