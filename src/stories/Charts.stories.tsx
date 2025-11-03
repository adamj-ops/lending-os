import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ApprovalTrendCard, MonthlyMetricsChart, RiskDistributionPie } from '@/components/charts';

const meta = {
  title: 'Charts/Examples',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

export const ApprovalTrend: StoryObj = {
  render: () => <ApprovalTrendCard />,
  parameters: {
    docs: {
      description: {
        story: 'Line chart showing loan approval trends over the last 6 months with Colosseum brand colors (cyan for approvals, red for rejections).',
      },
    },
  },
};

export const MonthlyMetrics: StoryObj = {
  render: () => <MonthlyMetricsChart />,
  parameters: {
    docs: {
      description: {
        story: 'Bar chart displaying monthly funding vs defaults with Colosseum theme (cyan bars for funded amounts, red bars for defaults).',
      },
    },
  },
};

export const RiskDistribution: StoryObj = {
  render: () => <RiskDistributionPie />,
  parameters: {
    docs: {
      description: {
        story: 'Pie chart showing portfolio risk distribution using brand colors (green for low risk, cyan for medium, orange for high).',
      },
    },
  },
};

export const AllCharts: StoryObj = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <ApprovalTrendCard />
      <MonthlyMetricsChart />
      <RiskDistributionPie />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All three example charts displayed in a responsive grid layout as they would appear in the portfolio dashboard.',
      },
    },
  },
};

