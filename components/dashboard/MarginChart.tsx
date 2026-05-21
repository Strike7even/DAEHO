'use client';

import { useEffect, useState } from 'react';
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

interface ChartData {
  lot: string;
  marginRate: number;
}

export default function MarginChart({ data }: { data: ChartData[] }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const el = document.documentElement;
    setIsDark(el.classList.contains('dark'));
    const obs = new MutationObserver(() => setIsDark(el.classList.contains('dark')));
    obs.observe(el, { attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm">
        데이터가 없습니다
      </div>
    );
  }

  const gridColor = isDark ? '#374151' : '#f0f0f0';
  const tickColor = isDark ? '#9ca3af' : '#374151';

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 32 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis
          dataKey="lot"
          tick={{ fontSize: 11, fill: tickColor }}
          angle={-35}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          tickFormatter={(v: number) => `${v.toFixed(1)}%`}
          tick={{ fontSize: 11, fill: tickColor }}
          domain={[0, 'auto']}
          width={55}
        />
        <Tooltip
          contentStyle={isDark ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#f3f4f6' } : undefined}
          formatter={(value) => {
            const n = Number(value);
            return [`${isNaN(n) ? '0.0' : n.toFixed(1)}%`, '마진율'];
          }}
          labelFormatter={(label) => `로트: ${String(label)}`}
        />
        <Bar dataKey="marginRate" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={
                entry.marginRate >= 20
                  ? '#22c55e'
                  : entry.marginRate >= 10
                    ? '#3b82f6'
                    : '#ef4444'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
