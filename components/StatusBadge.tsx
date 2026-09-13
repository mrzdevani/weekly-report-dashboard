import React from 'react';
import { UtilizationStatus } from '@/lib/config';

interface StatusBadgeProps {
  status?: UtilizationStatus | string;
  value?: number | null;
  level?: string | null;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, value, level, showIcon = true }) => {
  let displayStatus = status || 'Normal';
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let dotColor = 'bg-emerald-500';

  if (displayStatus === 'High' || level?.toLowerCase().includes('high') || level?.toLowerCase().includes('critical')) {
    badgeColor = 'bg-red-50 text-red-700 border-red-200';
    dotColor = 'bg-red-500';
    displayStatus = 'High';
  } else if (displayStatus === 'Warning' || level?.toLowerCase().includes('medium')) {
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColor = 'bg-amber-500';
    displayStatus = 'Warning';
  } else if (displayStatus === 'Normal' || level?.toLowerCase().includes('low')) {
    badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotColor = 'bg-emerald-500';
    displayStatus = 'Normal';
  } else {
    badgeColor = 'bg-slate-50 text-slate-600 border-slate-200';
    dotColor = 'bg-slate-400';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeColor}`}
    >
      {showIcon && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      <span>{level ? `${displayStatus} (${level})` : displayStatus}</span>
    </span>
  );
};
