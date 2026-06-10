import React, { useState } from 'react';
import { useAttendanceContext } from '@/context/AttendanceContext';
import { useESP32Status } from '@/hooks/useESP32Status';
import { useAuth } from '@/hooks/useAuth';
import { ESP32StatusIndicator } from '@/components/ui/ESP32StatusIndicator';
import { Button } from '@/components/ui/Button';
import { stopEnrollmentMode } from '@/services/firebase/enrollment';
import { format } from 'date-fns';
import {
  Shield,
  Database,
  Cpu,
  User,
  LogOut,
  UserPlus,
  Eye,
  EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Create admin via Firebase Auth REST API ────────────────────
async function createAdminUser(email: string, password: string): Promise<void> {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: false }),
  });
  const data = await res.json();
  if (data.error) {
    const msg: Record<string, string> = {
      EMAIL_EXISTS:                'This email is already registered.',
      WEAK_PASSWORD:               'Password must be at least 6 characters.',
      INVALID_EMAIL:               'Invalid email address.',
      TOO_MANY_ATTEMPTS_TRY_LATER: 'Too many attempts. Try again later.',
    };
    throw new Error(msg[data.error.message] ?? data.error.message);
  }
}

const SettingsPage: React.FC = () => {
  const { system, enrollmentStep, dispatch } = useAttendanceContext();
  const { status, lastSeen, lastHeartbeat }  = useESP32Status();
  const { user, logout }                     = useAuth();

  const [isCancelling, setIsCancelling] = useState(false);
  const [newEmail,     setNewEmail]     = useState('');
  const [newPassword,  setNewPassword]  = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating,   setIsCreating]   = useState(false);

  const isEnrollmentActive = enrollmentStep !== 'idle';

  const handleForceStopEnrollment = async () => {
    setIsCancelling(true);
    try {
      await stopEnrollmentMode();
      dispatch({ type: 'SET_ENROLLMENT_STEP', payload: 'idle' });
      dispatch({ type: 'SET_PENDING_UID',      payload: '' });
      toast.success('Enrollment mode forcefully stopped');
    } catch {
      toast.error('Failed to stop enrollment mode');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newPassword.trim()) {
      toast.error('Email and password are required');
      return;
    }
    setIsCreating(true);
    try {
      await createAdminUser(newEmail.trim(), newPassword);
      toast.success(`Admin created: ${newEmail.trim()}`);
      setNewEmail('');
      setNewPassword('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create admin');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

      {/* ── ESP32 Status ─────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <Cpu className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900">ESP32 Device Status</h2>
        </div>
        <div className="p-5 space-y-4">
          <ESP32StatusIndicator status={status} lastSeen={lastSeen} />
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5">
              <p className="text-slate-500 mb-0.5">Last Heartbeat</p>
              <p className="font-semibold text-slate-900">
                {lastHeartbeat ? format(new Date(lastHeartbeat), 'HH:mm:ss, MMM d') : 'Never received'}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5">
              <p className="text-slate-500 mb-0.5">Enroll Mode (RTDB)</p>
              <p className={`font-semibold ${system?.enrollMode ? 'text-amber-600' : 'text-emerald-600'}`}>
                {system?.enrollMode ? '⚠ Active' : '✓ Inactive'}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5">
              <p className="text-slate-500 mb-0.5">Pending Card UID</p>
              <p className="font-mono font-semibold text-slate-900 text-xs">
                {system?.pendingCardUID || '— none —'}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5">
              <p className="text-slate-500 mb-0.5">RTDB Status Flag</p>
              <p className="font-semibold text-slate-900">{system?.esp32Status ?? 'unknown'}</p>
            </div>
          </div>

          {isEnrollmentActive && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs font-semibold text-amber-700 mb-2">
                ⚠ Enrollment mode is currently active
              </p>
              <Button variant="amber" size="sm" isLoading={isCancelling} onClick={handleForceStopEnrollment}>
                Force Stop Enrollment
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ── Add Admin User ───────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <UserPlus className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900">Add Admin User</h2>
        </div>
        <div className="p-5">
          <p className="text-xs text-slate-500 mb-4">
            Create a new admin account that can log into this dashboard.
          </p>
          <form onSubmit={handleCreateAdmin} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm
                           text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2
                           focus:ring-brand-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Password <span className="text-slate-400">(min. 6 characters)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm
                             text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2
                             focus:ring-brand-500 focus:border-transparent transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isCreating}
              leftIcon={<UserPlus className="h-3.5 w-3.5" />}
              className="w-full"
            >
              Create Admin Account
            </Button>
          </form>
        </div>
      </section>

      {/* ── Firebase Config ──────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <Database className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900">Firebase Configuration</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { label: 'Project ID',   value: import.meta.env.VITE_FIREBASE_PROJECT_ID },
            { label: 'Database URL', value: import.meta.env.VITE_FIREBASE_DATABASE_URL },
            { label: 'Auth Domain',  value: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-5 py-3">
              <span className="text-xs font-medium text-slate-500">{label}</span>
              <span className="text-xs font-mono text-slate-700 truncate max-w-xs text-right">
                {value || '— not set —'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Security & Access ────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <Shield className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900">Security & Access</h2>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
            <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-brand-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">{user?.email}</p>
              <p className="text-xs text-slate-500">Authenticated administrator</p>
            </div>
          </div>
          <Button variant="danger" size="sm" leftIcon={<LogOut className="h-3.5 w-3.5" />} onClick={logout}>
            Sign Out
          </Button>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 space-y-1">
            <p><span className="font-semibold text-slate-700">RTDB Rules:</span> system/ and users/ require auth. attendance/ write is open for ESP32.</p>
            <p><span className="font-semibold text-slate-700">Auth:</span> Firebase Email/Password — admin-only access.</p>
          </div>
        </div>
      </section>

      <div className="text-center text-xs text-slate-400 pb-2 space-y-0.5">
        <p>RFID Attendance System v2.0</p>
        <p>ESP32 + MFRC522 + Firebase RTDB + React 18 + Vite + Tailwind CSS</p>
      </div>
    </div>
  );
};

export default SettingsPage;
