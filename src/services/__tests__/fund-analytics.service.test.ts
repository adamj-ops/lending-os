import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FundAnalyticsService } from '../fund-analytics.service';
import { db } from '@/db/client';
import { sql } from 'drizzle-orm';

// Mock the database
vi.mock('@/db/client', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}));

// Mock schema exports
vi.mock('@/db/schema', () => ({
  funds: {
    id: 'id',
    name: 'name',
    organizationId: 'organization_id',
    inceptionDate: 'inception_date',
    status: 'status',
    fundType: 'fund_type',
    totalCommitted: 'total_committed',
    totalDeployed: 'total_deployed',
    totalReturned: 'total_returned',
  },
  fundCommitments: {
    fundId: 'fund_id',
    committedAmount: 'committed_amount',
    commitmentDate: 'commitment_date',
    status: 'status',
  },
  fundCalls: {},
  fundDistributions: {},
  fundLoanAllocations: {
    id: 'id',
    fundId: 'fund_id',
    loanId: 'loan_id',
    allocatedAmount: 'allocated_amount',
    returnedAmount: 'returned_amount',
    allocationDate: 'allocation_date',
    fullReturnDate: 'full_return_date',
  },
  lenders: {},
  loans: {
    id: 'id',
    borrowerId: 'borrower_id',
    principal: 'principal',
  },
}));

describe('FundAnalyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateFundPerformance', () => {
    it('should return null if fund not found', async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await FundAnalyticsService.calculateFundPerformance('non-existent-fund');

      expect(result).toBeNull();
    });

    it('should calculate fund performance with valid data', async () => {
      const mockFund = {
        id: 'fund-1',
        name: 'Test Fund',
        inceptionDate: '2024-01-01',
        organizationId: 'org-1',
        status: 'active',
        totalCommitted: '1000000',
        totalDeployed: '750000',
        totalReturned: '100000',
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockFund]),
        innerJoin: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        select: vi.fn()
          .mockResolvedValueOnce([{ total: '1000000' }]) // committed
          .mockResolvedValueOnce([{ total: '750000' }]) // deployed
          .mockResolvedValueOnce([{ total: '100000' }]) // returned
          .mockResolvedValueOnce([{ avgDays: '30' }]) // avgDeploymentDays
          .mockResolvedValueOnce([{ avgDays: '90' }]) // avgReturnDays
          .mockResolvedValueOnce([]) // IRR commitments
          .mockResolvedValueOnce([]), // IRR returns
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await FundAnalyticsService.calculateFundPerformance('fund-1');

      expect(result).not.toBeNull();
      expect(result?.fundId).toBe('fund-1');
      expect(result?.fundName).toBe('Test Fund');
      expect(result?.totalCommitted).toBe(1000000);
      expect(result?.totalDeployed).toBe(750000);
      expect(result?.totalReturned).toBe(100000);
      expect(result?.netDeployed).toBe(650000);
      expect(result?.deploymentRate).toBe(75); // 750000 / 1000000 * 100
      expect(result?.returnRate).toBeCloseTo(13.33, 2); // 100000 / 750000 * 100
      expect(result?.moic).toBeCloseTo(0.133, 3); // 100000 / 750000
      expect(result?.avgDeploymentDays).toBe(30);
      expect(result?.avgReturnDays).toBe(90);
    });

    it('should handle zero committed capital', async () => {
      const mockFund = {
        id: 'fund-2',
        name: 'Empty Fund',
        inceptionDate: '2024-01-01',
        organizationId: 'org-1',
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockFund]),
        innerJoin: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        select: vi.fn()
          .mockResolvedValueOnce([{ total: '0' }])
          .mockResolvedValueOnce([{ total: '0' }])
          .mockResolvedValueOnce([{ total: '0' }])
          .mockResolvedValueOnce([{ avgDays: null }])
          .mockResolvedValueOnce([{ avgDays: null }])
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await FundAnalyticsService.calculateFundPerformance('fund-2');

      expect(result?.deploymentRate).toBe(0);
      expect(result?.returnRate).toBe(0);
      expect(result?.moic).toBeNull();
    });

    it('should accept custom date range', async () => {
      const mockFund = {
        id: 'fund-3',
        name: 'Custom Date Fund',
        inceptionDate: '2024-01-01',
        organizationId: 'org-1',
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockFund]),
        innerJoin: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        select: vi.fn()
          .mockResolvedValueOnce([{ total: '500000' }])
          .mockResolvedValueOnce([{ total: '400000' }])
          .mockResolvedValueOnce([{ total: '50000' }])
          .mockResolvedValueOnce([{ avgDays: null }])
          .mockResolvedValueOnce([{ avgDays: null }])
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const result = await FundAnalyticsService.calculateFundPerformance('fund-3', startDate, endDate);

      expect(result?.startDate).toEqual(startDate);
      expect(result?.endDate).toEqual(endDate);
    });

    it('should calculate MOIC correctly with multiple scenarios', async () => {
      const mockFund = {
        id: 'fund-moic',
        name: 'MOIC Test Fund',
        inceptionDate: '2024-01-01',
        organizationId: 'org-1',
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockFund]),
        innerJoin: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        select: vi.fn()
          .mockResolvedValueOnce([{ total: '1000000' }])
          .mockResolvedValueOnce([{ total: '1000000' }]) // deployed
          .mockResolvedValueOnce([{ total: '1500000' }]) // returned (1.5x)
          .mockResolvedValueOnce([{ avgDays: null }])
          .mockResolvedValueOnce([{ avgDays: null }])
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await FundAnalyticsService.calculateFundPerformance('fund-moic');

      expect(result?.moic).toBe(1.5);
    });
  });

  describe('calculateIRR (via calculateFundPerformance)', () => {
    it('should return null when insufficient cash flows', async () => {
      const mockFund = {
        id: 'fund-irr-empty',
        name: 'Empty IRR Fund',
        inceptionDate: '2024-01-01',
        organizationId: 'org-1',
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockFund]),
        innerJoin: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        select: vi.fn()
          .mockResolvedValueOnce([{ total: '100000' }])
          .mockResolvedValueOnce([{ total: '100000' }])
          .mockResolvedValueOnce([{ total: '0' }])
          .mockResolvedValueOnce([{ avgDays: null }])
          .mockResolvedValueOnce([{ avgDays: null }])
          .mockResolvedValueOnce([]) // No commitments
          .mockResolvedValueOnce([]), // No returns
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await FundAnalyticsService.calculateFundPerformance('fund-irr-empty');

      expect(result?.irr).toBeNull();
    });

    it('should calculate IRR with valid cash flows', async () => {
      const mockFund = {
        id: 'fund-irr',
        name: 'IRR Fund',
        inceptionDate: '2024-01-01',
        organizationId: 'org-1',
      };

      const mockCommitments = [
        { date: new Date('2024-01-01'), amount: '1000000', type: 'outflow' },
      ];

      const mockReturns = [
        { date: new Date('2024-12-31'), amount: '1100000', type: 'inflow' },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockFund]),
        innerJoin: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        select: vi.fn()
          .mockResolvedValueOnce([{ total: '1000000' }])
          .mockResolvedValueOnce([{ total: '1000000' }])
          .mockResolvedValueOnce([{ total: '1100000' }])
          .mockResolvedValueOnce([{ avgDays: null }])
          .mockResolvedValueOnce([{ avgDays: null }])
          .mockResolvedValueOnce(mockCommitments)
          .mockResolvedValueOnce(mockReturns),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await FundAnalyticsService.calculateFundPerformance('fund-irr');

      // 10% return over 1 year should be close to 10% IRR
      expect(result?.irr).not.toBeNull();
      expect(result?.irr).toBeGreaterThan(5);
      expect(result?.irr).toBeLessThan(15);
    });
  });

  describe('getPortfolioSummary', () => {
    it('should return null if no funds exist', async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await FundAnalyticsService.getPortfolioSummary('org-1');

      expect(result).toBeNull();
    });

    it('should aggregate portfolio summary across multiple funds', async () => {
      const mockFunds = [
        {
          id: 'fund-1',
          name: 'Fund 1',
          organizationId: 'org-1',
          status: 'active',
          fundType: 'private',
          totalCommitted: '1000000',
          totalDeployed: '750000',
          totalReturned: '100000',
          inceptionDate: '2024-01-01',
        },
        {
          id: 'fund-2',
          name: 'Fund 2',
          organizationId: 'org-1',
          status: 'active',
          fundType: 'syndicated',
          totalCommitted: '2000000',
          totalDeployed: '1500000',
          totalReturned: '200000',
          inceptionDate: '2024-01-01',
        },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockFunds),
        limit: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        select: vi.fn()
          // For each fund's calculateFundPerformance calls
          .mockResolvedValue([{ total: '0' }]),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await FundAnalyticsService.getPortfolioSummary('org-1');

      expect(result).not.toBeNull();
      expect(result?.organizationId).toBe('org-1');
      expect(result?.totalFunds).toBe(2);
      expect(result?.activeFunds).toBe(2);
      expect(result?.totalAUM).toBe(1950000); // (750000 - 100000) + (1500000 - 200000)
      expect(result?.totalCommitted).toBe(3000000);
      expect(result?.totalDeployed).toBe(2250000);
      expect(result?.totalReturned).toBe(300000);
    });

    it('should group funds by type', async () => {
      const mockFunds = [
        {
          id: 'fund-1',
          name: 'Fund 1',
          organizationId: 'org-1',
          status: 'active',
          fundType: 'private',
          totalCommitted: '1000000',
          totalDeployed: '750000',
          totalReturned: '100000',
          inceptionDate: '2024-01-01',
        },
        {
          id: 'fund-2',
          name: 'Fund 2',
          organizationId: 'org-1',
          status: 'active',
          fundType: 'private',
          totalCommitted: '500000',
          totalDeployed: '400000',
          totalReturned: '50000',
          inceptionDate: '2024-01-01',
        },
        {
          id: 'fund-3',
          name: 'Fund 3',
          organizationId: 'org-1',
          status: 'active',
          fundType: 'syndicated',
          totalCommitted: '2000000',
          totalDeployed: '1500000',
          totalReturned: '200000',
          inceptionDate: '2024-01-01',
        },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockFunds),
        limit: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue([{ total: '0' }]),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await FundAnalyticsService.getPortfolioSummary('org-1');

      expect(result?.byFundType).toBeDefined();
      const privateType = result?.byFundType.find(t => t.fundType === 'private');
      expect(privateType?.count).toBe(2);

      const syndicatedType = result?.byFundType.find(t => t.fundType === 'syndicated');
      expect(syndicatedType?.count).toBe(1);
    });

    it('should handle funds with only active status', async () => {
      const mockFunds = [
        {
          id: 'fund-1',
          name: 'Fund 1',
          organizationId: 'org-1',
          status: 'active',
          fundType: 'private',
          totalCommitted: '1000000',
          totalDeployed: '750000',
          totalReturned: '100000',
          inceptionDate: '2024-01-01',
        },
        {
          id: 'fund-2',
          name: 'Fund 2',
          organizationId: 'org-1',
          status: 'closed',
          fundType: 'private',
          totalCommitted: '500000',
          totalDeployed: '500000',
          totalReturned: '500000',
          inceptionDate: '2024-01-01',
        },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockFunds),
        limit: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue([{ total: '0' }]),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await FundAnalyticsService.getPortfolioSummary('org-1');

      expect(result?.totalFunds).toBe(2);
      expect(result?.activeFunds).toBe(1);
    });
  });

  describe('getFundComparison', () => {
    it('should return comparison data for multiple funds', async () => {
      const mockFund1 = {
        id: 'fund-1',
        name: 'Fund 1',
        inceptionDate: '2024-01-01',
        organizationId: 'org-1',
      };

      const mockFund2 = {
        id: 'fund-2',
        name: 'Fund 2',
        inceptionDate: '2024-01-01',
        organizationId: 'org-1',
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn()
          .mockResolvedValueOnce([mockFund1])
          .mockResolvedValueOnce([mockFund2]),
        innerJoin: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue([{ total: '0' }]),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await FundAnalyticsService.getFundComparison(['fund-1', 'fund-2']);

      expect(result).toHaveLength(2);
    });

    it('should filter out null performances', async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await FundAnalyticsService.getFundComparison(['non-existent-1', 'non-existent-2']);

      expect(result).toHaveLength(0);
    });

    it('should accept custom date range', async () => {
      const mockFund = {
        id: 'fund-1',
        name: 'Fund 1',
        inceptionDate: '2024-01-01',
        organizationId: 'org-1',
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockFund]),
        innerJoin: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue([{ total: '0' }]),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const result = await FundAnalyticsService.getFundComparison(['fund-1'], startDate, endDate);

      expect(result[0]?.startDate).toEqual(startDate);
      expect(result[0]?.endDate).toEqual(endDate);
    });
  });

  describe('getDeploymentTimeline', () => {
    it('should return empty array if fund not found', async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await FundAnalyticsService.getDeploymentTimeline('non-existent-fund');

      expect(result).toEqual([]);
    });

    it('should return deployment timeline with allocations and returns', async () => {
      const mockFund = {
        id: 'fund-1',
        name: 'Fund 1',
        inceptionDate: '2024-01-01',
        organizationId: 'org-1',
      };

      const mockAllocations = [
        { date: new Date('2024-01-15'), amount: '100000' },
        { date: new Date('2024-02-15'), amount: '150000' },
      ];

      const mockReturns = [
        { date: new Date('2024-03-15'), amount: '50000' },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockFund]),
        orderBy: vi.fn()
          .mockResolvedValueOnce(mockAllocations)
          .mockResolvedValueOnce(mockReturns),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await FundAnalyticsService.getDeploymentTimeline('fund-1');

      expect(result).toHaveLength(3);
      expect(result[0].allocated).toBe(100000);
      expect(result[1].allocated).toBe(150000);
      expect(result[2].returned).toBe(50000);
    });

    it('should aggregate multiple transactions on the same date', async () => {
      const mockFund = {
        id: 'fund-1',
        name: 'Fund 1',
        inceptionDate: '2024-01-01',
        organizationId: 'org-1',
      };

      const mockAllocations = [
        { date: new Date('2024-01-15'), amount: '100000' },
        { date: new Date('2024-01-15'), amount: '50000' },
      ];

      const mockReturns = [
        { date: new Date('2024-01-15'), amount: '25000' },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockFund]),
        orderBy: vi.fn()
          .mockResolvedValueOnce(mockAllocations)
          .mockResolvedValueOnce(mockReturns),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await FundAnalyticsService.getDeploymentTimeline('fund-1');

      expect(result).toHaveLength(1);
      expect(result[0].allocated).toBe(150000);
      expect(result[0].returned).toBe(25000);
    });

    it('should handle custom date range', async () => {
      const mockFund = {
        id: 'fund-1',
        name: 'Fund 1',
        inceptionDate: '2024-01-01',
        organizationId: 'org-1',
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockFund]),
        orderBy: vi.fn()
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const startDate = new Date('2024-06-01');
      const endDate = new Date('2024-12-31');

      const result = await FundAnalyticsService.getDeploymentTimeline('fund-1', startDate, endDate);

      expect(result).toEqual([]);
    });

    it('should sort timeline by date', async () => {
      const mockFund = {
        id: 'fund-1',
        name: 'Fund 1',
        inceptionDate: '2024-01-01',
        organizationId: 'org-1',
      };

      const mockAllocations = [
        { date: new Date('2024-03-15'), amount: '100000' },
        { date: new Date('2024-01-15'), amount: '150000' },
      ];

      const mockReturns = [
        { date: new Date('2024-02-15'), amount: '50000' },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockFund]),
        orderBy: vi.fn()
          .mockResolvedValueOnce(mockAllocations)
          .mockResolvedValueOnce(mockReturns),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await FundAnalyticsService.getDeploymentTimeline('fund-1');

      // Should be sorted by date
      expect(result[0].date.getTime()).toBeLessThan(result[1].date.getTime());
      expect(result[1].date.getTime()).toBeLessThan(result[2].date.getTime());
    });
  });

  describe('getTopInvestments', () => {
    it('should return top investments by MOIC', async () => {
      const mockAllocations = [
        {
          id: 'alloc-1',
          loanId: 'loan-1',
          allocatedAmount: '100000',
          returnedAmount: '150000',
          allocationDate: new Date('2024-01-01'),
          fullReturnDate: new Date('2024-12-31'),
        },
        {
          id: 'alloc-2',
          loanId: 'loan-2',
          allocatedAmount: '200000',
          returnedAmount: '250000',
          allocationDate: new Date('2024-01-01'),
          fullReturnDate: new Date('2024-12-31'),
        },
        {
          id: 'alloc-3',
          loanId: 'loan-3',
          allocatedAmount: '50000',
          returnedAmount: '100000',
          allocationDate: new Date('2024-01-01'),
          fullReturnDate: new Date('2024-12-31'),
        },
      ];

      const mockLoans = [
        { id: 'loan-1', borrowerId: 'b1', principal: '100000' },
        { id: 'loan-2', borrowerId: 'b2', principal: '200000' },
        { id: 'loan-3', borrowerId: 'b3', principal: '50000' },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn()
          .mockResolvedValueOnce(mockAllocations)
          .mockResolvedValueOnce(mockLoans),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await FundAnalyticsService.getTopInvestments('fund-1', 3);

      expect(result).toHaveLength(3);
      // Should be sorted by MOIC descending
      expect(result[0].moic).toBeGreaterThanOrEqual(result[1].moic);
      expect(result[1].moic).toBeGreaterThanOrEqual(result[2].moic);
      expect(result[0].moic).toBe(2); // loan-3: 100000 / 50000
      expect(result[1].moic).toBe(1.5); // loan-1: 150000 / 100000
      expect(result[2].moic).toBe(1.25); // loan-2: 250000 / 200000
    });

    it('should calculate IRR for completed investments', async () => {
      const mockAllocations = [
        {
          id: 'alloc-1',
          loanId: 'loan-1',
          allocatedAmount: '100000',
          returnedAmount: '150000',
          allocationDate: new Date('2024-01-01'),
          fullReturnDate: new Date('2025-01-01'),
        },
      ];

      const mockLoans = [
        { id: 'loan-1', borrowerId: 'b1', principal: '100000' },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn()
          .mockResolvedValueOnce(mockAllocations)
          .mockResolvedValueOnce(mockLoans),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await FundAnalyticsService.getTopInvestments('fund-1', 5);

      expect(result).toHaveLength(1);
      expect(result[0].irr).not.toBeNull();
      // 50% return over 1 year should be close to 50% IRR
      expect(result[0].irr).toBeGreaterThan(40);
      expect(result[0].irr).toBeLessThan(60);
    });

    it('should return null IRR for incomplete investments', async () => {
      const mockAllocations = [
        {
          id: 'alloc-1',
          loanId: 'loan-1',
          allocatedAmount: '100000',
          returnedAmount: '0',
          allocationDate: new Date('2024-01-01'),
          fullReturnDate: null,
        },
      ];

      const mockLoans = [
        { id: 'loan-1', borrowerId: 'b1', principal: '100000' },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn()
          .mockResolvedValueOnce(mockAllocations)
          .mockResolvedValueOnce(mockLoans),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await FundAnalyticsService.getTopInvestments('fund-1', 5);

      expect(result).toHaveLength(1);
      expect(result[0].irr).toBeNull();
    });

    it('should respect the limit parameter', async () => {
      const mockAllocations = Array.from({ length: 10 }, (_, i) => ({
        id: `alloc-${i}`,
        loanId: `loan-${i}`,
        allocatedAmount: '100000',
        returnedAmount: `${100000 + i * 10000}`,
        allocationDate: new Date('2024-01-01'),
        fullReturnDate: new Date('2024-12-31'),
      }));

      const mockLoans = Array.from({ length: 10 }, (_, i) => ({
        id: `loan-${i}`,
        borrowerId: `b${i}`,
        principal: '100000',
      }));

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn()
          .mockResolvedValueOnce(mockAllocations)
          .mockResolvedValueOnce(mockLoans),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await FundAnalyticsService.getTopInvestments('fund-1', 3);

      expect(result).toHaveLength(3);
    });

    it('should use default limit of 5', async () => {
      const mockAllocations = Array.from({ length: 10 }, (_, i) => ({
        id: `alloc-${i}`,
        loanId: `loan-${i}`,
        allocatedAmount: '100000',
        returnedAmount: `${100000 + i * 10000}`,
        allocationDate: new Date('2024-01-01'),
        fullReturnDate: new Date('2024-12-31'),
      }));

      const mockLoans = Array.from({ length: 10 }, (_, i) => ({
        id: `loan-${i}`,
        borrowerId: `b${i}`,
        principal: '100000',
      }));

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn()
          .mockResolvedValueOnce(mockAllocations)
          .mockResolvedValueOnce(mockLoans),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await FundAnalyticsService.getTopInvestments('fund-1');

      expect(result).toHaveLength(5);
    });

    it('should filter out allocations without matching loans', async () => {
      const mockAllocations = [
        {
          id: 'alloc-1',
          loanId: 'loan-1',
          allocatedAmount: '100000',
          returnedAmount: '150000',
          allocationDate: new Date('2024-01-01'),
          fullReturnDate: new Date('2024-12-31'),
        },
        {
          id: 'alloc-2',
          loanId: 'loan-non-existent',
          allocatedAmount: '200000',
          returnedAmount: '250000',
          allocationDate: new Date('2024-01-01'),
          fullReturnDate: new Date('2024-12-31'),
        },
      ];

      const mockLoans = [
        { id: 'loan-1', borrowerId: 'b1', principal: '100000' },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn()
          .mockResolvedValueOnce(mockAllocations)
          .mockResolvedValueOnce(mockLoans),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await FundAnalyticsService.getTopInvestments('fund-1', 5);

      expect(result).toHaveLength(1);
      expect(result[0].loanId).toBe('loan-1');
    });

    it('should handle zero allocated amount', async () => {
      const mockAllocations = [
        {
          id: 'alloc-1',
          loanId: 'loan-1',
          allocatedAmount: '0',
          returnedAmount: '100000',
          allocationDate: new Date('2024-01-01'),
          fullReturnDate: new Date('2024-12-31'),
        },
      ];

      const mockLoans = [
        { id: 'loan-1', borrowerId: 'b1', principal: '100000' },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn()
          .mockResolvedValueOnce(mockAllocations)
          .mockResolvedValueOnce(mockLoans),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await FundAnalyticsService.getTopInvestments('fund-1', 5);

      expect(result).toHaveLength(1);
      expect(result[0].moic).toBe(0);
    });
  });
});
