"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartCard } from './ChartCard';

const mockData = [
  { month: 'Jan', funded: 25000, defaulted: 500 },
  { month: 'Feb', funded: 32000, defaulted: 300 },
  { month: 'Mar', funded: 28000, defaulted: 450 },
  { month: 'Apr', funded: 35000, defaulted: 200 },
  { month: 'May', funded: 40000, defaulted: 350 },
  { month: 'Jun', funded: 38000, defaulted: 150 },
];

export function MonthlyMetricsChart() {
  return (
    <ChartCard title="Monthly Funding vs Defaults" subtitle="Amount in USD">
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mockData} barCategoryGap={20}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
          <XAxis 
            dataKey="month" 
            stroke="#94a3b8"
            tick={{ fontSize: 12, fill: '#94a3b8' }}
            axisLine={{ stroke: '#475569' }}
          />
          <YAxis 
            stroke="#94a3b8"
            tick={{ fontSize: 12, fill: '#94a3b8' }}
            axisLine={{ stroke: '#475569' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b',
              border: '1px solid oklch(var(--brand-primary-500))',
              borderRadius: '6px',
              color: '#f1f5f9',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
            }}
            labelStyle={{ color: '#f1f5f9', fontWeight: 600, marginBottom: '4px' }}
            itemStyle={{ color: '#cbd5e1' }}
          />
          <Bar 
            dataKey="funded" 
            fill="oklch(var(--brand-primary-500))"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="defaulted" 
            fill="oklch(var(--brand-danger-500))"
            radius={[4, 4, 0, 0]}
          />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

