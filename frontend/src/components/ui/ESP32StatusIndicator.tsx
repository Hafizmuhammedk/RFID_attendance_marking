import React from 'react';
import { Wifi, WifiOff, HelpCircle } from 'lucide-react';
import type { ESP32StatusType } from '@/types';

interface ESP32StatusIndicatorProps {
  status: ESP32StatusType;
  lastSeen: string | null;
  compact?: boolean;
}

export const ESP32StatusIndicator: React.FC<ESP32StatusIndicatorProps> = ({
  status,
  lastSeen,
  compact = false,
}) => {
  const isOnline = status === 'online';
  const isUnknown = status === 'unknown';

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <span
          className={`h-2 w-2 rounded-full flex-shrink-0 ${
            isOnline
              ? 'bg-emerald-400 animate-pulse'
              : isUnknown
                ? 'bg-slate-300'
                : 'bg-red-400'
          }`}
        />
        <span
          className={`text-xs font-medium ${
            isOnline ? 'text-emerald-600' : isUnknown ? 'text-slate-400' : 'text-red-500'
          }`}
        >
          ESP32 {isOnline ? 'Online' : isUnknown ? 'Unknown' : 'Offline'}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
        isOnline
          ? 'border-emerald-200 bg-emerald-50'
          : isUnknown
            ? 'border-slate-200 bg-slate-50'
            : 'border-red-200 bg-red-50'
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          isOnline ? 'bg-emerald-100' : isUnknown ? 'bg-slate-100' : 'bg-red-100'
        }`}
      >
        {isUnknown ? (
          <HelpCircle className="h-5 w-5 text-slate-400" />
        ) : isOnline ? (
          <Wifi className="h-5 w-5 text-emerald-600" />
        ) : (
          <WifiOff className="h-5 w-5 text-red-500" />
        )}
      </div>
      <div>
        <p
          className={`text-sm font-semibold ${
            isOnline ? 'text-emerald-700' : isUnknown ? 'text-slate-600' : 'text-red-700'
          }`}
        >
          ESP32 {isOnline ? 'Online' : isUnknown ? 'Status Unknown' : 'Offline'}
        </p>
        <p className="text-xs text-slate-500">
          {lastSeen ? `Last seen: ${lastSeen}` : 'No heartbeat received yet'}
        </p>
      </div>
      {isOnline && (
        <span className="ml-auto h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
      )}
    </div>
  );
};
