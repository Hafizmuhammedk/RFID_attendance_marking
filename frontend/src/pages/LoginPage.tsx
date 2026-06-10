import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Cpu, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const LoginPage: React.FC = () => {
  const { user, login, isLoading } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors]     = useState({ email: '', password: '' });

  if (user) return <Navigate to="/dashboard" replace />;

  const validate = () => {
    const errs = { email: '', password: '' };
    if (!email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email address';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return !errs.email && !errs.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch {
      // toast shown in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-sidebar p-12">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-600 flex items-center justify-center">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">RFID Attendance</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Real-time Attendance
            <br />
            <span className="text-brand-400">Management System</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mb-8">
            Powered by ESP32 + MFRC522 RFID reader and Firebase Realtime Database.
            Monitor attendance live, enroll cards, and analyze trends.
          </p>
          <div className="flex flex-col gap-3">
            {[
              'Real-time attendance tracking via RTDB',
              'RFID card enrollment with one click',
              'Live ESP32 device status monitoring',
              'Analytics charts and attendance trends',
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-brand-600/20 flex items-center justify-center flex-shrink-0">
                  <div className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                </div>
                <span className="text-sm text-slate-400">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-600">
          RFID Attendance System v2.0 — ESP32 + Firebase
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex flex-1 items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-9 w-9 rounded-xl bg-brand-600 flex items-center justify-center">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-slate-900">RFID Attendance</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Admin Sign In</h2>
          <p className="text-sm text-slate-500 mb-8">
            Enter your credentials to access the admin panel
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              id="login-email"
              label="Email Address"
              type="email"
              placeholder="admin@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              leftAddon={<Mail className="h-3.5 w-3.5" />}
              required
              autoComplete="email"
            />

            <Input
              id="login-password"
              label="Password"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              leftAddon={<Lock className="h-3.5 w-3.5" />}
              rightAddon={
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="pointer-events-auto"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              }
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting || isLoading}
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Admin access only · Powered by Firebase Auth
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
