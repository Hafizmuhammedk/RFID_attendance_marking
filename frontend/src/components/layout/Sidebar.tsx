import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  CreditCard,
  Users,
  BarChart3,
  Settings,
  Cpu,
  LogOut,
  Wifi,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAttendanceContext } from '@/context/AttendanceContext';
import { useESP32Status } from '@/hooks/useESP32Status';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',   path: '/dashboard',  icon: LayoutDashboard },
  { label: 'Attendance',  path: '/attendance', icon: ClipboardList },
  { label: 'Enrollment',  path: '/enrollment', icon: CreditCard },
  { label: 'Users',       path: '/users',      icon: Users },
  { label: 'Analytics',   path: '/analytics',  icon: BarChart3 },
  { label: 'Settings',    path: '/settings',   icon: Settings },
];

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { enrollmentStep } = useAttendanceContext();
  const { status } = useESP32Status();
  const isEnrollmentActive = enrollmentStep !== 'idle';

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-white flex-shrink-0">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
          <Cpu className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">RFID Attendance</p>
          <p className="text-xs text-slate-400">Admin Panel v2.0</p>
        </div>
      </div>

      {/* Enrollment Active Banner */}
      {isEnrollmentActive && (
        <div className="mx-3 mt-3 rounded-lg bg-amber-500/20 border border-amber-500/40 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-semibold text-amber-300">Enrollment Active</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-sidebar-hover hover:text-white'
              }`
            }
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
            {label === 'Enrollment' && isEnrollmentActive && (
              <span className="ml-auto h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* ESP32 Status */}
      <div className="mx-3 mb-3 rounded-lg bg-slate-800/50 border border-slate-700/30 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Wifi className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">ESP32</span>
          <div className="ml-auto flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                status === 'online'
                  ? 'bg-emerald-400 animate-pulse'
                  : status === 'offline'
                    ? 'bg-red-400'
                    : 'bg-slate-500'
              }`}
            />
            <span
              className={`text-xs font-medium ${
                status === 'online'
                  ? 'text-emerald-400'
                  : status === 'offline'
                    ? 'text-red-400'
                    : 'text-slate-400'
              }`}
            >
              {status === 'online' ? 'Online' : status === 'offline' ? 'Offline' : 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* User / Logout */}
      <div className="border-t border-slate-700/50 px-3 py-3">
        <div className="flex items-center gap-3 mb-2 px-2">
          <div className="h-8 w-8 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">
              {user?.email?.[0]?.toUpperCase() ?? 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.email ?? 'Admin'}</p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors duration-150"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
