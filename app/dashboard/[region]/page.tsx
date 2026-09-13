'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { SummaryCard } from '@/components/SummaryCard';
import { WeeklyTrendChart } from '@/components/charts/WeeklyTrendChart';
import { UtilDistributionChart } from '@/components/charts/UtilDistributionChart';
import { DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { getDashboardData, DashboardResponseData } from '@/services/api';
import { REGIONS, HIGH_UTILIZATION_THRESHOLD } from '@/lib/config';
import { Radio, AlertTriangle, CheckCircle, Activity, RefreshCw } from 'lucide-react';

export default function RegionDashboardPage() {
  const params = useParams();
  const regionSlug = (params?.region as string) || 'bali';
  const regionInfo = REGIONS[regionSlug] || {
    slug: regionSlug,
    name: regionSlug.toUpperCase(),
    shortName: regionSlug.toUpperCase(),
    description: `Wilayah ${regionSlug}`,
  };

  const [data, setData] = useState<DashboardResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDashboardData({ province: regionSlug });
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data region.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [regionSlug]);

  const summary = data?.summary;
  const hasData = (data?.items && data.items.length > 0) || false;

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title={`Dashboard Region: ${regionInfo.name}`}
        subtitle={`Monitoring utilisasi dan kesehatan microwave link wilayah ${regionInfo.shortName}`}
        period={summary?.latestWeek || 'W34'}
      />

      <main className="flex-1 p-8 space-y-6">
        {/* Controls */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-700">Wilayah:</span>{' '}
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {regionInfo.name}
            </span>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Muat Ulang</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Empty State Check */}
        {!loading && !hasData ? (
          <EmptyState
            title="Tidak ada data untuk region ini."
            description={`Belum ada data microwave link yang terdaftar untuk wilayah ${regionInfo.name}. Silakan upload file Excel laporan.`}
          />
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <SummaryCard
                title="Total Link"
                value={summary?.totalLinks ?? (loading ? '...' : 0)}
                subtitle={`Link di ${regionInfo.shortName}`}
                icon={Radio}
                variant="default"
              />

              <SummaryCard
                title={`High Util (≥${HIGH_UTILIZATION_THRESHOLD}%)`}
                value={summary?.highUtilizationCount ?? (loading ? '...' : 0)}
                subtitle="Perlu Tindakan Segera"
                icon={AlertTriangle}
                variant="danger"
              />

              <SummaryCard
                title={`Normal Util (<${HIGH_UTILIZATION_THRESHOLD}%)`}
                value={summary?.normalUtilizationCount ?? (loading ? '...' : 0)}
                subtitle="Kondisi Operasional Baik"
                icon={CheckCircle}
                variant="success"
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
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <WeeklyTrendChart
                data={data?.trend || []}
                title={`Tren Utilisasi Mingguan - ${regionInfo.shortName}`}
                isRegional={true}
              />
              <UtilDistributionChart
                data={data?.distribution || []}
                title={`Distribusi Utilisasi - ${regionInfo.shortName}`}
              />
            </div>

            {/* Data Table */}
            <div className="pt-2">
              <DataTable
                data={data?.items || []}
                title={`Daftar Microwave Link - ${regionInfo.name}`}
                subtitle="Daftar seluruh link yang beroperasi di wilayah ini, diurutkan berdasarkan utilisasi tertinggi"
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
