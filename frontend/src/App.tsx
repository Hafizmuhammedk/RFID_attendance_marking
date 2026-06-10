import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { AttendanceProvider } from '@/context/AttendanceContext';
import AuthGuard from '@/components/layout/AuthGuard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Lazy-load pages to reduce initial bundle size
const LoginPage      = lazy(() => import('@/pages/LoginPage'));
const DashboardPage  = lazy(() => import('@/pages/DashboardPage'));
const HomePage       = lazy(() => import('@/pages/HomePage'));
const AttendancePage = lazy(() => import('@/pages/AttendancePage'));
const EnrollmentPage = lazy(() => import('@/pages/EnrollmentPage'));
const UsersPage      = lazy(() => import('@/pages/UsersPage'));
const AnalyticsPage  = lazy(() => import('@/pages/AnalyticsPage'));
const SettingsPage   = lazy(() => import('@/pages/SettingsPage'));

const PageLoader: React.FC = () => (
  <div className="flex h-full w-full items-center justify-center py-20">
    <LoadingSpinner size="lg" />
  </div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AttendanceProvider>
          {/* Global toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f8fafc',
                fontSize: '13px',
                fontWeight: '500',
                borderRadius: '10px',
                border: '1px solid #334155',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                maxWidth: '360px',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#f8fafc' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#f8fafc' },
              },
            }}
          />

          <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center bg-slate-50">
              <LoadingSpinner size="lg" />
            </div>
          }>
            <Routes>
              {/* Public route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected routes — all children rendered inside DashboardPage shell */}
              <Route
                path="/"
                element={
                  <AuthGuard>
                    <DashboardPage />
                  </AuthGuard>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard"  element={<Suspense fallback={<PageLoader />}><HomePage /></Suspense>} />
                <Route path="attendance" element={<Suspense fallback={<PageLoader />}><AttendancePage /></Suspense>} />
                <Route path="enrollment" element={<Suspense fallback={<PageLoader />}><EnrollmentPage /></Suspense>} />
                <Route path="users"      element={<Suspense fallback={<PageLoader />}><UsersPage /></Suspense>} />
                <Route path="analytics"  element={<Suspense fallback={<PageLoader />}><AnalyticsPage /></Suspense>} />
                <Route path="settings"   element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </AttendanceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
