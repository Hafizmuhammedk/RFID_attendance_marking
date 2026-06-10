import React from 'react';
import { CheckCircle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useEnrollment } from '@/hooks/useEnrollment';
import { useAttendanceContext } from '@/context/AttendanceContext';

const EnrollmentSuccess: React.FC = () => {
  const { pendingCardUID, resetEnrollment, startEnrollment } = useEnrollment();
  const { users } = useAttendanceContext();

  // Find the newly enrolled user
  const enrolledUser = users.find((u) => u.cardUID === pendingCardUID);

  return (
    <div className="flex flex-col items-center justify-center py-10 gap-6 animate-fade-in text-center">
      {/* Success icon */}
      <div className="relative">
        <div className="h-24 w-24 rounded-full bg-emerald-50 flex items-center justify-center border-4 border-emerald-100">
          <CheckCircle className="h-12 w-12 text-emerald-500" />
        </div>
        <div className="absolute -inset-2 rounded-full border-2 border-emerald-200/60 animate-ping" style={{ animationDuration: '2s' }} />
      </div>

      {/* Info */}
      <div className="max-w-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-1">Card Enrolled!</h3>
        {enrolledUser ? (
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{enrolledUser.name}</span>{' '}
            ({enrolledUser.role}) has been successfully registered.
          </p>
        ) : (
          <p className="text-sm text-slate-600">The card has been successfully registered.</p>
        )}
      </div>

      {/* Card UID pill */}
      <div className="rounded-full bg-slate-100 border border-slate-200 px-5 py-2">
        <p className="uid-text text-slate-700">{pendingCardUID}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 w-full max-w-xs">
        <Button
          variant="secondary"
          onClick={resetEnrollment}
          className="flex-1"
        >
          Done
        </Button>
        <Button
          variant="primary"
          onClick={async () => {
            resetEnrollment();
            await startEnrollment();
          }}
          leftIcon={<UserPlus className="h-4 w-4" />}
          className="flex-1"
        >
          Enroll Another
        </Button>
      </div>
    </div>
  );
};

export default EnrollmentSuccess;
