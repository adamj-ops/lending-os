"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartCard } from './ChartCard';

const mockData = [
  { name: 'Low Risk', value: 45 },
  { name: 'Medium Risk', value: 35 },
  { name: 'High Risk', value: 20 },
];

const COLORS = [
  'oklch(var(--brand-success-500))',  // Green for low risk
  'oklch(var(--brand-primary-500))',  // Teal for medium risk  
  'oklch(var(--brand-accent-500))',   // Orange for high risk
];

export function RiskDistributionPie() {
  return (
    <ChartCard title="Risk Distribution" subtitle="Portfolio breakdown">
      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={mockData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelStyle={{ fill: '#f1f5f9', fontSize: '12px', fontWeight: 600 }}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {mockData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b',
              border: '1px solid oklch(var(--brand-primary-500))',
              borderRadius: '6px',
              color: '#f1f5f9',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
            }}
            itemStyle={{ color: '#cbd5e1' }}
          />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

