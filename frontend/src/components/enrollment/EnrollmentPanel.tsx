import React from 'react';
import { CreditCard, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import CardScanWaiting from './CardScanWaiting';
import EnrollmentForm from './EnrollmentForm';
import EnrollmentSuccess from './EnrollmentSuccess';
import { useEnrollment } from '@/hooks/useEnrollment';

const STEP_LABELS: Record<string, string> = {
  idle:    'Ready',
  waiting: 'Waiting for Card',
  form:    'Fill Details',
  success: 'Complete',
};

const EnrollmentPanel: React.FC = () => {
  const { enrollmentStep, startEnrollment } = useEnrollment();

  const steps = ['idle', 'waiting', 'form', 'success'];
  const currentIndex = steps.indexOf(enrollmentStep);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
      {/* Header */}
      <div
        className={`px-6 py-4 border-b transition-colors duration-300 ${
          enrollmentStep !== 'idle'
            ? 'bg-amber-50 border-amber-200'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${
                enrollmentStep !== 'idle' ? 'bg-amber-100' : 'bg-brand-100'
              }`}
            >
              <CreditCard
                className={`h-5 w-5 ${
                  enrollmentStep !== 'idle' ? 'text-amber-600' : 'text-brand-600'
                }`}
              />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Card Enrollment</h2>
              <p className="text-xs text-slate-500">
                Step: <span className="font-semibold">{STEP_LABELS[enrollmentStep]}</span>
              </p>
            </div>
          </div>

          {/* Step progress dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((step, i) => (
              <div
                key={step}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i <= currentIndex
                    ? 'bg-brand-500 w-6'
                    : 'bg-slate-200 w-2'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {enrollmentStep === 'idle' && (
          <div className="flex flex-col items-center py-8 gap-4 text-center animate-fade-in">
            <div className="h-16 w-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-brand-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Enroll a New Card
              </h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Click "Start Enrollment" to put the ESP32 into enrollment mode.
                Then scan the new RFID card to register it.
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={startEnrollment}
              leftIcon={<Play className="h-4 w-4" />}
            >
              Start Enrollment
            </Button>
          </div>
        )}

        {enrollmentStep === 'waiting' && <CardScanWaiting />}
        {enrollmentStep === 'form'    && <EnrollmentForm />}
        {enrollmentStep === 'success' && <EnrollmentSuccess />}
      </div>
    </div>
  );
};

export default EnrollmentPanel;
