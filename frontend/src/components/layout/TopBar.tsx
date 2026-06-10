import React from 'react';
import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { useAttendanceContext } from '@/context/AttendanceContext';
import { LiveBadge } from '@/components/attendance/LiveBadge';
import { ESP32StatusIndicator } from '@/components/ui/ESP32StatusIndicator';
import { useESP32Status } from '@/hooks/useESP32Status';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':  'Dashboard',
  '/attendance': 'Attendance Log',
  '/enrollment': 'Card Enrollment',
  '/users':      'Registered Users',
  '/analytics':  'Analytics',
  '/settings':   'System Settings',
};

const TopBar: React.FC = () => {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? 'RFID System';
  const { enrollmentStep } = useAttendanceContext();
  const { status, lastSeen } = useESP32Status();
  const isEnrollmentActive = enrollmentStep !== 'idle';

  return (
    <header
      className={`flex h-16 items-center justify-between border-b px-6 bg-white transition-all duration-300 ${
        isEnrollmentActive
          ? 'border-amber-300 bg-amber-50/50'
          : 'border-slate-200'
      }`}
    >
      {/* Left: Page title */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        {isEnrollmentActive && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            ENROLLMENT MODE
          </span>
        )}
      </div>

      {/* Right: Status indicators */}
      <div className="flex items-center gap-4">
        <ESP32StatusIndicator status={status} lastSeen={lastSeen} compact />
        <LiveBadge />
        <div className="h-4 w-px bg-slate-200" />
        <p className="text-xs text-slate-500 font-medium">
          {format(new Date(), 'EEE, MMM d · HH:mm')}
        </p>
      </div>
    </header>
  );
};

export default TopBar;
