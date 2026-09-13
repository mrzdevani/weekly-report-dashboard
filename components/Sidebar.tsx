'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  UploadCloud,
  Radio,
  FileSpreadsheet,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const DASHBOARD_ITEMS: NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Bali', href: '/dashboard/bali', icon: MapPin },
  { label: 'NTB', href: '/dashboard/ntb', icon: MapPin },
  { label: 'NTT', href: '/dashboard/ntt', icon: MapPin },
  { label: 'Jawa Timur', href: '/dashboard/jawa-timur', icon: MapPin },
];

const REPORT_ITEMS: NavItem[] = [
  { label: 'Upload Report', href: '/dashboard/upload', icon: UploadCloud },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname === href;
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 min-h-screen border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800 bg-slate-950/60">
        <div className="p-2 bg-blue-600 rounded-lg text-white shadow-sm">
          <Radio className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-white leading-tight">
            MW Link Tracker
          </h1>
          <p className="text-[11px] text-slate-400">Weekly Report Dashboard</p>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 py-5 px-3 space-y-6 overflow-y-auto">
        {/* Dashboard Section */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Dashboard</span>
          </div>
          <nav className="space-y-1">
            {DASHBOARD_ITEMS.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {active && <ChevronRight className="w-4 h-4 text-blue-200" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Reports Section */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Report</span>
          </div>
          <nav className="space-y-1">
            {REPORT_ITEMS.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {active && <ChevronRight className="w-4 h-4 text-blue-200" />}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400">
        <div className="flex items-center gap-2 mb-1">
          <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold text-slate-300">Bali Nusra & Jatim</span>
        </div>
        <p className="text-slate-500">Threshold High Util: &ge; 80%</p>
      </div>
    </aside>
  );
};
