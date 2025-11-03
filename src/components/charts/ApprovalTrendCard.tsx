"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartCard } from './ChartCard';

// Mock data - replace with real API data
const mockData = [
  { month: 'Jan', approvals: 12, rejections: 3 },
  { month: 'Feb', approvals: 15, rejections: 2 },
  { month: 'Mar', approvals: 18, rejections: 4 },
  { month: 'Apr', approvals: 14, rejections: 2 },
  { month: 'May', approvals: 20, rejections: 3 },
  { month: 'Jun', approvals: 22, rejections: 1 },
];

export function ApprovalTrendCard() {
  return (
    <ChartCard title="Approval Trends" subtitle="Last 6 months">
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
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
          <Line 
            type="monotone" 
            dataKey="approvals" 
            stroke="oklch(var(--brand-primary-600))"
            strokeWidth={2}
            dot={{ fill: 'oklch(var(--brand-primary-500))', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'oklch(var(--brand-accent-500))', strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="rejections" 
            stroke="oklch(var(--brand-danger-500))"
            strokeWidth={2}
            dot={{ fill: 'oklch(var(--brand-danger-500))', r: 4 }}
          />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

