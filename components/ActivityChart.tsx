'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const mockChartData = [
  { day: 'Lun', visites: 18, messages: 8 },
  { day: 'Mar', visites: 20, messages: 10 },
  { day: 'Mer', visites: 15, messages: 7 },
  { day: 'Jeu', visites: 19, messages: 9 },
  { day: 'Ven', visites: 20, messages: 10 },
  { day: 'Sam', visites: 5, messages: 2 },
  { day: 'Dim', visites: 8, messages: 4 },
];

export const ActivityChart: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-72 w-full bg-gray-50 animate-pulse rounded-lg flex items-center justify-center text-xs text-gray-400">
        Chargement du graphique...
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={mockChartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          barGap={6}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              fontSize: '12px',
            }}
            cursor={{ fill: 'rgba(243, 242, 239, 0.6)' }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
            formatter={(value) => (
              <span className="text-xs text-gray-600 font-medium capitalize">
                {value === 'visites' ? 'Visites de profil' : 'Messages envoyés'}
              </span>
            )}
          />
          <Bar
            dataKey="visites"
            name="visites"
            fill="#0a66c2"
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
          <Bar
            dataKey="messages"
            name="messages"
            fill="#38bdf8"
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;
