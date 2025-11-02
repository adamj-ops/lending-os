import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { NextRequest } from 'next/server';
import { FundAnalyticsService } from '@/services/fund-analytics.service';
import { requireOrganization } from '@/lib/clerk-server';

// Mock dependencies
vi.mock('@/services/fund-analytics.service');
vi.mock('@/lib/clerk-server');

describe('GET /api/v1/funds/analytics/portfolio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 if not authenticated', async () => {
      vi.mocked(requireOrganization).mockRejectedValue(new Error('Unauthorized'));

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/funds/analytics/portfolio')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.code).toBe(401);
      expect(data.message).toBe('Unauthorized');
      expect(data.traceId).toBeDefined();
    });

    it('should proceed if authenticated', async () => {
      vi.mocked(requireOrganization).mockResolvedValue({
        user: { id: 'user-1' },
        session: {},
        organizationId: 'org-1',
      } as any);

      const mockSummary = {
        organizationId: 'org-1',
        totalFunds: 2,
        activeFunds: 2,
        totalAUM: 1000000,
        totalCommitted: 2000000,
        totalDeployed: 1500000,
        totalReturned: 200000,
        portfolioIRR: 8.5,
        portfolioMOIC: 1.13,
        byFundType: [],
        topFunds: [],
      };

      vi.mocked(FundAnalyticsService.getPortfolioSummary).mockResolvedValue(mockSummary);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/funds/analytics/portfolio')
      );

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(requireOrganization).toHaveBeenCalled();
    });
  });

  describe('Portfolio Summary Data', () => {
    beforeEach(() => {
      vi.mocked(requireOrganization).mockResolvedValue({
        user: { id: 'user-1' },
        session: {},
        organizationId: 'org-1',
      } as any);
    });

    it('should return portfolio summary for organization', async () => {
      const mockSummary = {
        organizationId: 'org-1',
        totalFunds: 3,
        activeFunds: 2,
        totalAUM: 5000000,
        totalCommitted: 10000000,
        totalDeployed: 7500000,
        totalReturned: 1000000,
        portfolioIRR: 12.5,
        portfolioMOIC: 1.13,
        byFundType: [
          {
            fundType: 'private' as const,
            count: 2,
            totalAUM: 3000000,
            avgIRR: 13.0,
          },
          {
            fundType: 'syndicated' as const,
            count: 1,
            totalAUM: 2000000,
            avgIRR: 11.0,
          },
        ],
        topFunds: [
          {
            fundId: 'fund-1',
            fundName: 'Top Fund',
            aum: 2000000,
            irr: 15.0,
            moic: 1.25,
          },
        ],
      };

      vi.mocked(FundAnalyticsService.getPortfolioSummary).mockResolvedValue(mockSummary);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/funds/analytics/portfolio')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.organizationId).toBe('org-1');
      expect(data.totalFunds).toBe(3);
      expect(data.activeFunds).toBe(2);
      expect(data.totalAUM).toBe(5000000);
      expect(data.totalCommitted).toBe(10000000);
      expect(data.totalDeployed).toBe(7500000);
      expect(data.totalReturned).toBe(1000000);
      expect(data.portfolioIRR).toBe(12.5);
      expect(data.portfolioMOIC).toBe(1.13);
    });

    it('should return 404 if no funds exist for organization', async () => {
      vi.mocked(FundAnalyticsService.getPortfolioSummary).mockResolvedValue(null);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/funds/analytics/portfolio')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.code).toBe(404);
      expect(data.message).toBe('No funds found for organization');
      expect(data.traceId).toBeDefined();
    });

    it('should include fund type breakdowns', async () => {
      const mockSummary = {
        organizationId: 'org-1',
        totalFunds: 5,
        activeFunds: 4,
        totalAUM: 10000000,
        totalCommitted: 15000000,
        totalDeployed: 12000000,
        totalReturned: 2000000,
        portfolioIRR: 10.0,
        portfolioMOIC: 1.17,
        byFundType: [
          {
            fundType: 'private' as const,
            count: 3,
            totalAUM: 6000000,
            avgIRR: 11.0,
          },
          {
            fundType: 'syndicated' as const,
            count: 1,
            totalAUM: 3000000,
            avgIRR: 9.0,
          },
          {
            fundType: 'institutional' as const,
            count: 1,
            totalAUM: 1000000,
            avgIRR: 8.5,
          },
        ],
        topFunds: [],
      };

      vi.mocked(FundAnalyticsService.getPortfolioSummary).mockResolvedValue(mockSummary);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/funds/analytics/portfolio')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.byFundType).toHaveLength(3);
      expect(data.byFundType[0].fundType).toBe('private');
      expect(data.byFundType[0].count).toBe(3);
      expect(data.byFundType[0].totalAUM).toBe(6000000);
      expect(data.byFundType[0].avgIRR).toBe(11.0);
    });

    it('should include top performing funds', async () => {
      const mockSummary = {
        organizationId: 'org-1',
        totalFunds: 5,
        activeFunds: 5,
        totalAUM: 10000000,
        totalCommitted: 15000000,
        totalDeployed: 12000000,
        totalReturned: 2000000,
        portfolioIRR: 10.0,
        portfolioMOIC: 1.17,
        byFundType: [],
        topFunds: [
          {
            fundId: 'fund-1',
            fundName: 'Top Performer',
            aum: 3000000,
            irr: 18.5,
            moic: 1.5,
          },
          {
            fundId: 'fund-2',
            fundName: 'Second Best',
            aum: 2500000,
            irr: 15.0,
            moic: 1.35,
          },
          {
            fundId: 'fund-3',
            fundName: 'Third Place',
            aum: 2000000,
            irr: 12.0,
            moic: 1.25,
          },
        ],
      };

      vi.mocked(FundAnalyticsService.getPortfolioSummary).mockResolvedValue(mockSummary);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/funds/analytics/portfolio')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.topFunds).toHaveLength(3);
      expect(data.topFunds[0].fundName).toBe('Top Performer');
      expect(data.topFunds[0].irr).toBe(18.5);
      expect(data.topFunds[0].moic).toBe(1.5);
    });

    it('should handle organization with single fund', async () => {
      const mockSummary = {
        organizationId: 'org-1',
        totalFunds: 1,
        activeFunds: 1,
        totalAUM: 1000000,
        totalCommitted: 1500000,
        totalDeployed: 1200000,
        totalReturned: 200000,
        portfolioIRR: 9.0,
        portfolioMOIC: 1.17,
        byFundType: [
          {
            fundType: 'private' as const,
            count: 1,
            totalAUM: 1000000,
            avgIRR: 9.0,
          },
        ],
        topFunds: [
          {
            fundId: 'fund-1',
            fundName: 'Only Fund',
            aum: 1000000,
            irr: 9.0,
            moic: 1.17,
          },
        ],
      };

      vi.mocked(FundAnalyticsService.getPortfolioSummary).mockResolvedValue(mockSummary);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/funds/analytics/portfolio')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalFunds).toBe(1);
      expect(data.activeFunds).toBe(1);
    });

    it('should handle null IRR or MOIC values', async () => {
      const mockSummary = {
        organizationId: 'org-1',
        totalFunds: 1,
        activeFunds: 1,
        totalAUM: 1000000,
        totalCommitted: 1500000,
        totalDeployed: 1200000,
        totalReturned: 0,
        portfolioIRR: null,
        portfolioMOIC: null,
        byFundType: [],
        topFunds: [],
      };

      vi.mocked(FundAnalyticsService.getPortfolioSummary).mockResolvedValue(mockSummary);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/funds/analytics/portfolio')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.portfolioIRR).toBeNull();
      expect(data.portfolioMOIC).toBeNull();
    });
  });

  describe('Organization Filtering', () => {
    it('should use organizationId from session', async () => {
      vi.mocked(requireOrganization).mockResolvedValue({
        user: { id: 'user-1' },
        session: {},
        organizationId: 'org-123',
      } as any);

      const mockSummary = {
        organizationId: 'org-123',
        totalFunds: 1,
        activeFunds: 1,
        totalAUM: 1000000,
        totalCommitted: 1500000,
        totalDeployed: 1200000,
        totalReturned: 200000,
        portfolioIRR: 9.0,
        portfolioMOIC: 1.17,
        byFundType: [],
        topFunds: [],
      };

      vi.mocked(FundAnalyticsService.getPortfolioSummary).mockResolvedValue(mockSummary);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/funds/analytics/portfolio')
      );

      await GET(request);

      expect(FundAnalyticsService.getPortfolioSummary).toHaveBeenCalledWith('org-123');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      vi.mocked(requireOrganization).mockResolvedValue({
        user: { id: 'user-1' },
        session: {},
        organizationId: 'org-1',
      } as any);
    });

    it('should return 500 on service error', async () => {
      vi.mocked(FundAnalyticsService.getPortfolioSummary).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/funds/analytics/portfolio')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.code).toBe(500);
      expect(data.message).toBe('Failed to fetch portfolio analytics');
      expect(data.traceId).toBeDefined();
    });

    it('should include traceId in all error responses', async () => {
      vi.mocked(FundAnalyticsService.getPortfolioSummary).mockResolvedValue(null);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/funds/analytics/portfolio')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(data.traceId).toBeDefined();
      expect(typeof data.traceId).toBe('string');
      expect(data.traceId.length).toBeGreaterThan(0);
    });

    it('should handle unexpected errors gracefully', async () => {
      vi.mocked(FundAnalyticsService.getPortfolioSummary).mockRejectedValue(
        'Unexpected string error'
      );

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/funds/analytics/portfolio')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.code).toBe(500);
      expect(data.message).toBe('Failed to fetch portfolio analytics');
    });
  });

  describe('Response Format', () => {
    beforeEach(() => {
      vi.mocked(requireOrganization).mockResolvedValue({
        user: { id: 'user-1' },
        session: {},
        organizationId: 'org-1',
      } as any);
    });

    it('should have correct response structure', async () => {
      const mockSummary = {
        organizationId: 'org-1',
        totalFunds: 2,
        activeFunds: 2,
        totalAUM: 1000000,
        totalCommitted: 2000000,
        totalDeployed: 1500000,
        totalReturned: 200000,
        portfolioIRR: 8.5,
        portfolioMOIC: 1.13,
        byFundType: [],
        topFunds: [],
      };

      vi.mocked(FundAnalyticsService.getPortfolioSummary).mockResolvedValue(mockSummary);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/funds/analytics/portfolio')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty('organizationId');
      expect(data).toHaveProperty('totalFunds');
      expect(data).toHaveProperty('activeFunds');
      expect(data).toHaveProperty('totalAUM');
      expect(data).toHaveProperty('totalCommitted');
      expect(data).toHaveProperty('totalDeployed');
      expect(data).toHaveProperty('totalReturned');
      expect(data).toHaveProperty('portfolioIRR');
      expect(data).toHaveProperty('portfolioMOIC');
      expect(data).toHaveProperty('byFundType');
      expect(data).toHaveProperty('topFunds');
    });

    it('should return valid JSON', async () => {
      const mockSummary = {
        organizationId: 'org-1',
        totalFunds: 1,
        activeFunds: 1,
        totalAUM: 1000000,
        totalCommitted: 1500000,
        totalDeployed: 1200000,
        totalReturned: 200000,
        portfolioIRR: 9.0,
        portfolioMOIC: 1.17,
        byFundType: [],
        topFunds: [],
      };

      vi.mocked(FundAnalyticsService.getPortfolioSummary).mockResolvedValue(mockSummary);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/funds/analytics/portfolio')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(() => JSON.stringify(data)).not.toThrow();
    });
  });
});
