'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { RegionHighUtilData } from '@/types';

interface HighUtilRegionChartProps {
  data: RegionHighUtilData[];
  title?: string;
}

export const HighUtilRegionChart: React.FC<HighUtilRegionChartProps> = ({
  data,
  title = 'High Utilization Link per Region (≥ 80%)',
}) => {
  const barColors = ['#3b82f6', '#0ea5e9', '#6366f1', '#8b5cf6'];

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">Jumlah link dengan utilitas di atas 80%</p>
        </div>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="region"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as RegionHighUtilData;
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-lg text-xs">
                      <p className="font-bold mb-1">{item.region}</p>
                      <p className="text-red-300">
                        High Util (&ge;80%): <span className="font-bold">{item.highCount} link</span>
                      </p>
                      <p className="text-slate-300">
                        Total Link: <span className="font-medium">{item.totalLinks}</span>
                      </p>
                      <p className="text-slate-300">
                        Rata-rata: <span className="font-medium">{item.avgUtil}%</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="highCount" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
