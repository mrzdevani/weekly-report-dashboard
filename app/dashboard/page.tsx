'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { SummaryCard } from '@/components/SummaryCard';
import { HighUtilRegionChart } from '@/components/charts/HighUtilRegionChart';
import { WeeklyTrendChart } from '@/components/charts/WeeklyTrendChart';
import { UtilDistributionChart } from '@/components/charts/UtilDistributionChart';
import { DataTable } from '@/components/DataTable';
import { getDashboardData, DashboardResponseData } from '@/services/api';
import {
  Radio,
  AlertTriangle,
  CheckCircle,
  Activity,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { HIGH_UTILIZATION_THRESHOLD } from '@/lib/config';

export default function OverviewPage() {
  const [data, setData] = useState<DashboardResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string>('');

  const loadData = async (week?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDashboardData({ week });
      setData(res);
      if (!selectedWeek && res.summary.latestWeek) {
        setSelectedWeek(res.summary.latestWeek);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const summary = data?.summary;

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Dashboard Overview"
        subtitle="Ringkasan pemantauan utilisasi microwave link seluruh wilayah"
        period={summary?.latestWeek || 'W34'}
      />

      <main className="flex-1 p-8 space-y-6">
        {/* Controls / Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Filter className="w-4 h-4 text-blue-600" />
              <span>Filter Periode:</span>
            </div>

            <select
              value={selectedWeek}
              onChange={(e) => {
                setSelectedWeek(e.target.value);
                loadData(e.target.value);
              }}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {(summary?.detectedWeeks || ['W31', 'W32', 'W33', 'W34']).map((wk) => (
                <option key={wk} value={wk}>
                  Minggu {wk}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadData(selectedWeek)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Muat Ulang</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <SummaryCard
            title="Total Link"
            value={summary?.totalLinks ?? (loading ? '...' : 0)}
            subtitle="Link Terdata"
            icon={Radio}
            variant="default"
            trendText="Total microwave link terdaftar"
          />

          <SummaryCard
            title={`High Util (≥${HIGH_UTILIZATION_THRESHOLD}%)`}
            value={summary?.highUtilizationCount ?? (loading ? '...' : 0)}
            subtitle="Perlu Tindakan"
            icon={AlertTriangle}
            variant="danger"
            trendText="Beban link kapasitas tinggi (kritis)"
          />

          <SummaryCard
            title={`Normal Util (<${HIGH_UTILIZATION_THRESHOLD}%)`}
            value={summary?.normalUtilizationCount ?? (loading ? '...' : 0)}
            subtitle="Kondisi Sehat"
            icon={CheckCircle}
            variant="success"
            trendText="Kapasitas transmisi dalam batas aman"
          />

          <SummaryCard
            title="Rata-rata Utilisasi"
            value={
              typeof summary?.averageUtilization === 'number'
                ? `${summary.averageUtilization.toFixed(1)}%`
                : loading
                ? '...'
                : '0%'
            }
            subtitle={`Periode ${summary?.latestWeek || 'W34'}`}
            icon={Activity}
            variant="info"
            trendText="Rata-rata seluruh link numerik"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Chart 1: High Util per Region */}
          <div className="lg:col-span-1">
            <HighUtilRegionChart data={data?.regionComparison || []} />
          </div>

          {/* Chart 2: Weekly Trend */}
          <div className="lg:col-span-2">
            <WeeklyTrendChart data={data?.trend || []} />
          </div>
        </div>

        {/* Chart 3: Distribution */}
        <div className="grid grid-cols-1 gap-5">
          <UtilDistributionChart data={data?.distribution || []} />
        </div>

        {/* Data Table */}
        <div className="pt-2">
          <DataTable
            data={data?.items || []}
            title="Daftar Seluruh Microwave Link (Prioritas High Util di Atas)"
            subtitle="Klik header kolom untuk mengurutkan data atau gunakan pencarian untuk memfilter link"
          />
        </div>
      </main>
    </div>
  );
}
