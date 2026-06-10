import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { useAttendanceContext } from '@/context/AttendanceContext';

const DashboardPage: React.FC = () => {
  const { enrollmentStep } = useAttendanceContext();
  const isEnrollmentActive = enrollmentStep !== 'idle';

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div
        className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${
          isEnrollmentActive ? 'ring-4 ring-inset ring-amber-400/30' : ''
        }`}
      >
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
