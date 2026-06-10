import React from 'react';
import EnrollmentPanel from '@/components/enrollment/EnrollmentPanel';
import { Info } from 'lucide-react';

const EnrollmentPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
        <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-700 space-y-0.5">
          <p className="font-semibold">How enrollment works</p>
          <p>
            Click <strong>Start Enrollment</strong> → the ESP32 enters enrollment mode →
            scan the RFID card on the reader → fill in user details → click{' '}
            <strong>Enroll Card</strong>. The card is then registered in Firebase.
          </p>
        </div>
      </div>

      <EnrollmentPanel />
    </div>
  );
};

export default EnrollmentPage;
