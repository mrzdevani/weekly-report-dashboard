import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'danger' | 'success' | 'info';
  percentage?: number;
  trendText?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  trendText,
}) => {
  const variantStyles = {
    default: {
      bg: 'bg-white',
      border: 'border-slate-200',
      iconBg: 'bg-slate-100 text-slate-700',
      valueColor: 'text-slate-900',
    },
    danger: {
      bg: 'bg-white',
      border: 'border-red-200',
      iconBg: 'bg-red-50 text-red-600',
      valueColor: 'text-red-600',
    },
    success: {
      bg: 'bg-white',
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-50 text-emerald-600',
      valueColor: 'text-emerald-700',
    },
    info: {
      bg: 'bg-white',
      border: 'border-blue-200',
      iconBg: 'bg-blue-50 text-blue-600',
      valueColor: 'text-blue-900',
    },
  };

  const style = variantStyles[variant];

  return (
    <div className={`p-5 rounded-xl border ${style.border} ${style.bg} shadow-sm transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={`p-2 rounded-lg ${style.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className={`text-3xl font-bold tracking-tight ${style.valueColor}`}>{value}</span>
        {subtitle && <span className="text-xs text-slate-500 font-medium">{subtitle}</span>}
      </div>

      {trendText && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-xs text-slate-500">
          <span>{trendText}</span>
        </div>
      )}
    </div>
  );
};
