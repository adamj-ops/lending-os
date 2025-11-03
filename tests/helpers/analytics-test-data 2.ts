/**
 * Test Data Factories for Analytics Tests
 *
 * Provides reusable mock data builders for analytics service tests
 */

export const mockFundSnapshot = (overrides?: Partial<{
  snapshotDate: string;
  totalCommitments: string;
  capitalDeployed: string;
  avgInvestorYield: string | null;
}>) => ({
  snapshotDate: '2025-01-15',
  totalCommitments: '1000000.00',
  capitalDeployed: '750000.00',
  avgInvestorYield: null,
  ...overrides,
});

export const mockLoanSnapshot = (overrides?: Partial<{
  snapshotDate: string;
  activeCount: number;
  delinquentCount: number;
  avgLtv: string | null;
  totalPrincipal: string;
  interestAccrued: string;
}>) => ({
  snapshotDate: '2025-01-15',
  activeCount: 5,
  delinquentCount: 0,
  avgLtv: '0.75',
  totalPrincipal: '500000.00',
  interestAccrued: '0',
  ...overrides,
});

export const mockPaymentSnapshot = (overrides?: Partial<{
  snapshotDate: string;
  amountReceived: string;
  amountScheduled: string;
  lateCount: number;
  avgCollectionDays: string | null;
}>) => ({
  snapshotDate: '2025-01-15',
  amountReceived: '10000.00',
  amountScheduled: '5000.00',
  lateCount: 2,
  avgCollectionDays: '3.5',
  ...overrides,
});

export const mockInspectionSnapshot = (overrides?: Partial<{
  snapshotDate: string;
  scheduledCount: number;
  completedCount: number;
  avgCompletionHours: string | null;
}>) => ({
  snapshotDate: '2025-01-15',
  scheduledCount: 10,
  completedCount: 8,
  avgCompletionHours: '2.5',
  ...overrides,
});

export const mockFundPerformance = (overrides?: Partial<{
  fundId: string;
  fundName: string;
  totalCommitted: number;
  totalDeployed: number;
  totalReturned: number;
  netDeployed: number;
  deploymentRate: number;
  returnRate: number;
  irr: number | null;
  moic: number | null;
  avgDeploymentDays: number | null;
  avgReturnDays: number | null;
  startDate: Date;
  endDate: Date;
}>) => ({
  fundId: 'fund-1',
  fundName: 'Test Fund',
  totalCommitted: 1000000,
  totalDeployed: 750000,
  totalReturned: 100000,
  netDeployed: 650000,
  deploymentRate: 75,
  returnRate: 13.33,
  irr: 8.5,
  moic: 1.13,
  avgDeploymentDays: 30,
  avgReturnDays: 90,
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  ...overrides,
});

export const mockPortfolioSummary = (overrides?: Partial<{
  organizationId: string;
  totalFunds: number;
  activeFunds: number;
  totalAUM: number;
  totalCommitted: number;
  totalDeployed: number;
  totalReturned: number;
  portfolioIRR: number | null;
  portfolioMOIC: number | null;
}>) => ({
  organizationId: 'org-1',
  totalFunds: 3,
  activeFunds: 2,
  totalAUM: 5000000,
  totalCommitted: 10000000,
  totalDeployed: 7500000,
  totalReturned: 1000000,
  portfolioIRR: 12.5,
  portfolioMOIC: 1.13,
  byFundType: [],
  topFunds: [],
  ...overrides,
});

export const mockForecast = (overrides?: Partial<{
  riskScore: number;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
  projectedROI: number;
  confidence: number;
}>) => ({
  riskScore: 0.3,
  riskRating: 'LOW' as const,
  projectedROI: 0.08,
  confidence: 0.85,
  factors: [],
  ...overrides,
});

export const mockDomainEvent = (overrides?: Partial<{
  id: string;
  type: string;
  domain: string;
  aggregateId: string;
  payload: Record<string, any>;
  occurredAt: string | Date;
}>) => ({
  id: 'evt-1',
  type: 'Loan.Funded',
  domain: 'loan',
  aggregateId: 'loan-1',
  payload: { loanId: 'loan-1', amount: 100000 },
  occurredAt: '2025-01-15T10:00:00Z',
  ...overrides,
});

/**
 * Mock session for authentication
 */
export const mockSession = (overrides?: Partial<{
  user: { id: string };
  organizationId: string;
}>) => ({
  user: { id: 'user-1' },
  session: {},
  organizationId: 'org-1',
  ...overrides,
});

/**
 * Generate a series of snapshots over time
 */
export const generateSnapshotSeries = <T extends { snapshotDate: string }>(
  factory: (date: string, index: number) => T,
  count: number,
  startDate: Date = new Date('2025-01-01')
): T[] => {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().slice(0, 10);
    return factory(dateStr, i);
  });
};

/**
 * Mock cash flows for IRR calculations
 */
export const mockCashFlows = (scenarios: 'simple' | 'complex' | 'irregular' = 'simple') => {
  if (scenarios === 'simple') {
    return [
      { date: new Date('2024-01-01'), amount: '1000000', type: 'outflow' },
      { date: new Date('2024-12-31'), amount: '1100000', type: 'inflow' },
    ];
  }

  if (scenarios === 'complex') {
    return [
      { date: new Date('2024-01-01'), amount: '500000', type: 'outflow' },
      { date: new Date('2024-03-01'), amount: '500000', type: 'outflow' },
      { date: new Date('2024-06-01'), amount: '300000', type: 'inflow' },
      { date: new Date('2024-09-01'), amount: '400000', type: 'inflow' },
      { date: new Date('2024-12-31'), amount: '450000', type: 'inflow' },
    ];
  }

  // irregular
  return [
    { date: new Date('2024-01-15'), amount: '750000', type: 'outflow' },
    { date: new Date('2024-04-22'), amount: '250000', type: 'outflow' },
    { date: new Date('2024-07-10'), amount: '200000', type: 'inflow' },
    { date: new Date('2024-11-05'), amount: '900000', type: 'inflow' },
  ];
};
