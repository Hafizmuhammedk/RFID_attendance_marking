import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ClipboardList, Users, CreditCard, BarChart3,
  ArrowRight, TrendingUp, UserCheck, ShieldX,
} from 'lucide-react';
import { useAttendanceContext } from '@/context/AttendanceContext';
import { useESP32Status } from '@/hooks/useESP32Status';
import { useAuth } from '@/hooks/useAuth';
import { ESP32StatusIndicator } from '@/components/ui/ESP32StatusIndicator';
import { LiveBadge } from '@/components/attendance/LiveBadge';
import { Badge, getStatusBadgeVariant } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { records, isLoading, enrollmentStep } = useAttendanceContext();
  const { status, lastSeen } = useESP32Status();
  const { user } = useAuth();

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayRecords = records.filter((r) => r.date === today);
  const checkInsToday = todayRecords.filter((r) => r.status === 'check-in').length;
  const deniedToday   = todayRecords.filter((r) => r.status === 'denied').length;
  const presentToday  = new Set(todayRecords.map((r) => r.cardUID)).size;
  const recentRecords = records.slice(0, 8);

  const quickStats = [
    { label: 'Total Records',    value: records.length, icon: TrendingUp,  color: 'text-brand-600',   bg: 'bg-brand-50',   border: 'border-brand-100' },
    { label: 'Present Today',    value: presentToday,   icon: UserCheck,   color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Check-Ins Today',  value: checkInsToday,  icon: ClipboardList, color: 'text-blue-600',  bg: 'bg-blue-50',   border: 'border-blue-100' },
    { label: 'Denied Today',     value: deniedToday,    icon: ShieldX,     color: 'text-red-600',     bg: 'bg-red-50',    border: 'border-red-100' },
  ];

  const navCards = [
    { label: 'Attendance',  desc: 'View live scan log',      icon: ClipboardList, path: '/attendance', color: 'text-blue-600',    bg: 'bg-blue-50'   },
    { label: 'Enrollment',  desc: 'Register new RFID cards', icon: CreditCard,    path: '/enrollment', color: 'text-amber-600',   bg: 'bg-amber-50'  },
    { label: 'Users',       desc: 'Manage registered cards', icon: Users,         path: '/users',      color: 'text-emerald-600', bg: 'bg-emerald-50'},
    { label: 'Analytics',   desc: 'Charts & trends',         icon: BarChart3,     path: '/analytics',  color: 'text-purple-600',  bg: 'bg-purple-50' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting + live badge */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Good {getGreeting()}, {user?.email?.split('@')[0] ?? 'Admin'} 👋
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {format(new Date(), "EEEE, MMMM d, yyyy · HH:mm")}
          </p>
        </div>
        <LiveBadge />
      </div>

      {/* ESP32 status */}
      <ESP32StatusIndicator status={status} lastSeen={lastSeen} />

      {/* Enrollment active notice */}
      {enrollmentStep !== 'idle' && (
        <div
          className="flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 cursor-pointer"
          onClick={() => navigate('/enrollment')}
        >
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-sm font-semibold text-amber-800">
              Enrollment mode is active — click to manage
            </span>
          </div>
          <ArrowRight className="h-4 w-4 text-amber-600" />
        </div>
      )}

      {/* Quick stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {quickStats.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className={`rounded-xl border ${border} ${bg} p-4 shadow-card`}>
            <div className={`h-8 w-8 rounded-lg bg-white/70 flex items-center justify-center mb-3 shadow-sm`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
            <p className="text-xs font-medium text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Nav shortcuts */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {navCards.map(({ label, desc, icon: Icon, path, color, bg }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card text-left hover:shadow-elevated hover:border-slate-300 transition-all duration-150"
          >
            <div className={`h-9 w-9 rounded-lg ${bg} flex items-center justify-center`}>
              <Icon className={`h-4.5 w-4.5 ${color}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{label}</p>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all mt-auto" />
          </button>
        ))}
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
          <button
            onClick={() => navigate('/attendance')}
            className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            View all <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        {recentRecords.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-400">
            No records yet. Scan an RFID card to get started.
          </p>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentRecords.map((record) => (
              <div
                key={`${record.cardUID}-${record.timestamp}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-brand-700">
                    {record.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{record.name}</p>
                  <p className="uid-text text-slate-400 truncate">{record.cardUID}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <Badge variant={getStatusBadgeVariant(record.status)} dot>
                    {record.status}
                  </Badge>
                  <span className="text-xs text-slate-400 font-mono">
                    {format(new Date(record.timestamp), 'HH:mm:ss')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

export default HomePage;
