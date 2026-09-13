'use client';

import React, { useState, useMemo } from 'react';
import { UtilizationData } from '@/types';
import { StatusBadge } from './StatusBadge';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { HIGH_UTILIZATION_THRESHOLD } from '@/lib/config';

interface DataTableProps {
  data: UtilizationData[];
  title?: string;
  subtitle?: string;
}

type SortField = 'link_id' | 'province' | 'micro_cluster' | 'util_avg' | 'status';
type SortDirection = 'asc' | 'desc';

export const DataTable: React.FC<DataTableProps> = ({
  data,
  title = 'Data Microwave Link',
  subtitle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'HIGH' | 'WARNING' | 'NORMAL'>('ALL');
  const [sortField, setSortField] = useState<SortField>('util_avg');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Filter logic
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Status filter
      if (statusFilter === 'HIGH') {
        if (typeof item.util_avg === 'number') {
          if (item.util_avg < HIGH_UTILIZATION_THRESHOLD) return false;
        } else if (item.status !== 'High') {
          return false;
        }
      } else if (statusFilter === 'WARNING') {
        if (item.status !== 'Warning') return false;
      } else if (statusFilter === 'NORMAL') {
        if (item.status !== 'Normal') return false;
      }

      // Search term
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        item.link_id.toLowerCase().includes(term) ||
        (item.ref_link_id && item.ref_link_id.toLowerCase().includes(term)) ||
        (item.site_name && item.site_name.toLowerCase().includes(term)) ||
        (item.micro_cluster && item.micro_cluster.toLowerCase().includes(term)) ||
        (item.province && item.province.toLowerCase().includes(term)) ||
        (item.transport_type && item.transport_type.toLowerCase().includes(term))
      );
    });
  }, [data, searchTerm, statusFilter]);

  // Sort logic
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'util_avg') {
        valA = typeof a.util_avg === 'number' ? a.util_avg : -1;
        valB = typeof b.util_avg === 'number' ? b.util_avg : -1;
      } else {
        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortField, sortDirection]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-5 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter Buttons */}
            <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('ALL');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({data.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('HIGH');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  statusFilter === 'HIGH'
                    ? 'bg-red-50 text-red-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-red-600'
                }`}
              >
                High Util &ge;80%
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('NORMAL');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  statusFilter === 'NORMAL'
                    ? 'bg-emerald-50 text-emerald-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-emerald-600'
                }`}
              >
                Normal
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari link ID, site, cluster..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-56 pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
            <tr>
              <th
                onClick={() => handleSort('link_id')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Link ID / Site ID</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Ref Link ID</th>
              <th
                onClick={() => handleSort('province')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Provinsi / Region</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('micro_cluster')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Micro Cluster</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Transport</th>
              <th
                onClick={() => handleSort('util_avg')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Util AVG</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('status')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors text-center"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-center">Riwayat Minggu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  Tidak ada data yang sesuai dengan kriteria pencarian.
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => {
                const isHigh =
                  typeof row.util_avg === 'number' && row.util_avg >= HIGH_UTILIZATION_THRESHOLD;

                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isHigh ? 'bg-red-50/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      <div>{row.link_id}</div>
                      {row.site_name && row.site_name !== row.link_id && (
                        <div className="text-[11px] font-sans font-normal text-slate-500">
                          {row.site_name}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {row.ref_link_id || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {row.province || row.region}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{row.micro_cluster || '-'}</td>
                    <td className="py-3 px-4 text-[11px] text-slate-500">{row.transport_type || '-'}</td>
                    <td className="py-3 px-4 text-right">
                      {typeof row.util_avg === 'number' ? (
                        <span
                          className={`font-mono font-bold text-sm ${
                            row.util_avg >= HIGH_UTILIZATION_THRESHOLD
                              ? 'text-red-600'
                              : row.util_avg >= 70
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                          }`}
                        >
                          {row.util_avg.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">
                          {row.status ? `[${row.status}]` : 'N/A'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge
                        status={row.status}
                        value={row.util_avg}
                        level={row.util_avg === null ? row.status : undefined}
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {row.weekly_history && row.weekly_history.length > 0 ? (
                          row.weekly_history.map((wh, i) => (
                            <span
                              key={i}
                              title={`${wh.week}: ${
                                wh.utilization_value !== null
                                  ? `${wh.utilization_value}%`
                                  : wh.utilization_level || 'N/A'
                              }`}
                              className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${
                                wh.utilization_value !== null
                                  ? wh.utilization_value >= HIGH_UTILIZATION_THRESHOLD
                                    ? 'bg-red-50 text-red-700 border-red-200 font-bold'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                  : wh.utilization_level?.toLowerCase().includes('high')
                                  ? 'bg-red-50 text-red-600 border-red-200'
                                  : 'bg-slate-50 text-slate-500 border-slate-200'
                              }`}
                            >
                              {wh.week}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-[10px]">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
        <div>
          Menampilkan{' '}
          <span className="font-semibold text-slate-700">
            {sortedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
          </span>{' '}
          sampai{' '}
          <span className="font-semibold text-slate-700">
            {Math.min(currentPage * itemsPerPage, sortedData.length)}
          </span>{' '}
          dari <span className="font-semibold text-slate-700">{sortedData.length}</span> links
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-medium text-slate-700">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
