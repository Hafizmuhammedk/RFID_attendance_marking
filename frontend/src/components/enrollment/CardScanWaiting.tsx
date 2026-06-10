import React from 'react';
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useEnrollment } from '@/hooks/useEnrollment';

const CardScanWaiting: React.FC = () => {
  const { cancelEnrollment } = useEnrollment();

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-8 animate-fade-in">
      {/* Animated card scan illustration */}
      <div className="relative flex items-center justify-center">
        {/* Outer ping rings */}
        <div className="absolute h-40 w-40 rounded-full border-2 border-brand-300/30 animate-ping" style={{ animationDuration: '2s' }} />
        <div className="absolute h-32 w-32 rounded-full border-2 border-brand-400/40 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
        {/* Inner glow circle */}
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-brand-600/10 border-2 border-brand-400/50">
          <div className="absolute inset-0 rounded-full bg-brand-500/5 animate-pulse" />
          <CreditCard className="h-10 w-10 text-brand-500" />
        </div>
      </div>

      {/* Text */}
      <div className="text-center max-w-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          Waiting for Card Scan
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed">
          Place the new RFID card on the reader connected to the ESP32.
          The system will automatically detect it.
        </p>
      </div>

      {/* Cancel */}
      <Button variant="secondary" size="sm" onClick={cancelEnrollment}>
        Cancel Enrollment
      </Button>
    </div>
  );
};

export default CardScanWaiting;
