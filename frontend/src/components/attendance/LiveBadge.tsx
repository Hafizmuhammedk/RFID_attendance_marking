import React from 'react';

export const LiveBadge: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
      </div>
      <span className="text-xs font-bold tracking-widest text-emerald-600 uppercase">Live</span>
    </div>
  );
};
