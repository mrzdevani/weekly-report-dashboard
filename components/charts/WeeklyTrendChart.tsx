'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendDataPoint } from '@/types';
import { HIGH_UTILIZATION_THRESHOLD } from '@/lib/config';

interface WeeklyTrendChartProps {
  data: TrendDataPoint[];
  title?: string;
  isRegional?: boolean;
}

export const WeeklyTrendChart: React.FC<WeeklyTrendChartProps> = ({
  data,
  title = 'Tren Utilisasi Mingguan (Weekly Trend)',
  isRegional = false,
}) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">
            Perkembangan rata-rata utilisasi microwave link antar minggu
          </p>
        </div>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              unit="%"
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg text-xs space-y-1">
                      <p className="font-bold border-b border-slate-700 pb-1 text-slate-200">
                        Minggu {label}
                      </p>
                      {payload.map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4">
                          <span style={{ color: entry.color }}>{entry.name}:</span>
                          <span className="font-mono font-bold">
                            {typeof entry.value === 'number' ? `${entry.value.toFixed(2)}%` : entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              height={32}
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', color: '#64748b' }}
            />
            <ReferenceLine
              y={HIGH_UTILIZATION_THRESHOLD}
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{
                value: `Threshold ${HIGH_UTILIZATION_THRESHOLD}%`,
                fill: '#ef4444',
                fontSize: 10,
                position: 'insideTopRight',
              }}
            />
            <Line
              type="monotone"
              dataKey="averageUtilization"
              name="Rata-rata Utilisasi"
              stroke="#1e40af"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#1e40af' }}
              activeDot={{ r: 6 }}
            />
            {!isRegional && (
              <>
                <Line
                  type="monotone"
                  dataKey="baliAvg"
                  name="Bali"
                  stroke="#0284c7"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="ntbAvg"
                  name="NTB"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="nttAvg"
                  name="NTT"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="jawaTimurAvg"
                  name="Jatim"
                  stroke="#8b5cf6"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={{ r: 3 }}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
