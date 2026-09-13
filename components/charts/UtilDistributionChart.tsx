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
import { DistributionDataPoint } from '@/types';

interface UtilDistributionChartProps {
  data: DistributionDataPoint[];
  title?: string;
}

export const UtilDistributionChart: React.FC<UtilDistributionChartProps> = ({
  data,
  title = 'Distribusi Utilisasi Link (Utilization Distribution)',
}) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">
            Sebaran tingkat beban microwave link berdasarkan kategori persentase
          </p>
        </div>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="range"
              tick={{ fill: '#64748b', fontSize: 10 }}
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
                  const item = payload[0].payload as DistributionDataPoint;
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-lg text-xs">
                      <p className="font-bold mb-1">{item.range}</p>
                      <p className="text-slate-200">
                        Jumlah Link: <span className="font-bold">{item.count}</span>
                      </p>
                      <p className="text-slate-300">
                        Proporsi: <span className="font-medium">{item.percentage}%</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
