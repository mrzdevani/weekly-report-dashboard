'use client';

import React from 'react';
import { Calendar, Database } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

interface HeaderProps {
  title: string;
  subtitle?: string;
  period?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  period = 'W34',
}) => {
  const isDbLive = isSupabaseConfigured();

  return (
    <header className="h-16 px-8 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 sticky top-0 z-10 shadow-xs">
      <div>
        <h2 className="text-lg font-bold text-slate-900 leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Active Period Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Periode: {period}</span>
        </div>

        {/* Database Status Indicator */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
            isDbLive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}
          title={
            isDbLive
              ? 'Terhubung ke Supabase PostgreSQL'
              : 'Berjalan dalam Local/In-Memory Mode (Data Siap Pakai)'
          }
        >
          <Database className="w-3.5 h-3.5" />
          <span>{isDbLive ? 'Supabase Live' : 'Dev / Memory Mode'}</span>
        </div>
      </div>
    </header>
  );
};
