import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { NextRequest } from 'next/server';
import { FundAnalyticsService } from '@/services/fund-analytics.service';
import { requireOrganization } from '@/lib/clerk-server';

// Mock dependencies
vi.mock('@/services/fund-analytics.service');
vi.mock('@/lib/clerk-server');

describe('GET /api/v1/funds/[fundId]/analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 if not authenticated', async () => {
      vi.mocked(requireOrganization).mockRejectedValue(new Error('Unauthorized'));

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/funds/fund-1/analytics')
      );

      const params = Promise.resolve({ fundId: 'fund-1' });
      const response = await GET(request, { params });
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

      const mockPerformance = {
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
      };

      vi.mocked(FundAnalyticsService.calculateFundPerformance).mockResolvedValue(mockPerformance);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/funds/fund-1/analytics')
      );

      const params = Promise.resolve({ fundId: 'fund-1' });
      const response = await GET(request, { params });

      expect(response.status).toBe(200);
      expect(requireOrganization).toHaveBeenCalled();
    });
  });

  describe('Fund Performance Data', () => {
    beforeEach(() => {
      vi.mocked(requireOrganization).mockResolvedValue({
        user: { id: 'user-1' },
        session: {},
        organizationId: 'org-1',
      } as any);
    });

    it('should return fund performance metrics', async () => {
      const mockPerformance = {
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
      };

      vi.mocked(FundAnalyticsService.calculateFundPerformance).mockResolvedValue(mockPerformance);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/funds/fund-1/analytics')
      );

      const params = Promise.resolve({ fundId: 'fund-1' });
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.fundId).toBe('fund-1');
      expect(data.fundName).toBe('Test Fund');
      expect(data.totalCommitted).toBe(1000000);
      expect(data.totalDeployed).toBe(750000);
      expect(data.totalReturned).toBe(100000);
      expect(data.netDeployed).toBe(650000);
      expect(data.deploymentRate).toBe(75);
      expect(data.returnRate).toBe(13.33);
      expect(data.irr).toBe(8.5);
      expect(data.moic).toBe(1.13);
    });

    it('should return 404 if fund not found', async () => {
      vi.mocked(FundAnalyticsService.calculateFundPerformance).mockResolvedValue(null);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/funds/non-existent/analytics')
      );

      const params = Promise.resolve({ fundId: 'non-existent' });
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.code).toBe(404);
      expect(data.message).toBe('Fund not found');
      expect(data.traceId).toBeDefined();
    });

    it('should use fundId from URL params', async () => {
      const mockPerformance = {
        fundId: 'fund-123',
        fundName: 'Specific Fund',
        totalCommitted: 2000000,
        totalDeployed: 1500000,
        totalReturned: 200000,
        netDeployed: 1300000,
        deploymentRate: 75,
        returnRate: 13.33,
        irr: 10.0,
        moic: 1.13,
        avgDeploymentDays: 25,
        avgReturnDays: 85,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      };

      vi.mocked(FundAnalyticsService.calculateFundPerformance).mockResolvedValue(mockPerformance);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/funds/fund-123/analytics')
      );

      const params = Promise.resolve({ fundId: 'fund-123' });
      await GET(request, { params });

      expect(FundAnalyticsService.calculateFundPerformance).toHaveBeenCalledWith(
        'fund-123',
        undefined,
        undefined
      );
    });
  });

  describe('Date Range Filtering', () => {
    beforeEach(() => {
      vi.mocked(requireOrganization).mockResolvedValue({
        user: { id: 'user-1' },
        session: {},
        organizationId: 'org-1',
      } as any);

      const mockPerformance = {
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
      };

      vi.mocked(FundAnalyticsService.calculateFundPerformance).mockResolvedValue(mockPerformance);
    });

    it('should accept startDate parameter', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/funds/fund-1/analytics?startDate=2024-01-01')
      );

      const params = Promise.resolve({ fundId: 'fund-1' });
      await GET(request, { params });

      expect(FundAnalyticsService.calculateFundPerformance).toHaveBeenCalledWith(
        'fund-1',
        new Date('2024-01-01'),
        undefined
      );
    });

    it('should accept endDate parameter', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/funds/fund-1/analytics?endDate=2024-12-31')
      );

      const params = Promise.resolve({ fundId: 'fund-1' });
      await GET(request, { params });

      expect(FundAnalyticsService.calculateFundPerformance).toHaveBeenCalledWith(
        'fund-1',
        undefined,
        new Date('2024-12-31')
      );
    });

    it('should accept both startDate and endDate parameters', async () => {
      const request = new NextRequest(
        new URL(
          'http://localhost:3000/api/v1/funds/fund-1/analytics?startDate=2024-01-01&endDate=2024-12-31'
        )
      );

      const params = Promise.resolve({ fundId: 'fund-1' });
      await GET(request, { params });

      expect(FundAnalyticsService.calculateFundPerformance).toHaveBeenCalledWith(
        'fund-1',
        new Date('2024-01-01'),
        new Date('2024-12-31')
      );
    });

    it('should work without date parameters', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/funds/fund-1/analytics')
      );

      const params = Promise.resolve({ fundId: 'fund-1' });
      await GET(request, { params });

      expect(FundAnalyticsService.calculateFundPerformance).toHaveBeenCalledWith(
        'fund-1',
        undefined,
        undefined
      );
    });

    it('should handle invalid date formats gracefully', async () => {
      const request = new NextRequest(
        new URL(
          'http://localhost:3000/api/v1/funds/fund-1/analytics?startDate=invalid-date&endDate=also-invalid'
        )
      );

      const params = Promise.resolve({ fundId: 'fund-1' });
      const response = await GET(request, { params });

      // Should still call service (Date constructor will create Invalid Date)
      expect(response.status).toBe(200);
      expect(FundAnalyticsService.calculateFundPerformance).toHaveBeenCalled();
    });
  });

  describe('Performance Metrics', () => {
    beforeEach(() => {
      vi.mocked(requireOrganization).mockResolvedValue({
        user: { id: 'user-1' },
        session: {},
        organizationId: 'org-1',
      } as any);
    });

    it('should include IRR and MOIC metrics', async () => {
      const mockPerformance = {
        fundId: 'fund-1',
        fundName: 'High Performer',
        totalCommitted: 5000000,
        totalDeployed: 4000000,
        totalReturned: 5000000,
        netDeployed: -1000000,
        deploymentRate: 80,
        returnRate: 125,
        irr: 25.5,
        moic: 1.25,
        avgDeploymentDays: 20,
        avgReturnDays: 60,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      };

      vi.mocked(FundAnalyticsService.calculateFundPerformance).mockResolvedValue(mockPerformance);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/funds/fund-1/analytics')
      );

      const params = Promise.resolve({ fundId: 'fund-1' });
      const response = await GET(request, { params });
      const data = await response.json();

      expect(data.irr).toBe(25.5);
      expect(data.moic).toBe(1.25);
    });

    it('should handle null IRR and MOIC values', async () => {
      const mockPerformance = {
        fundId: 'fund-1',
        fundName: 'New Fund',
        totalCommitted: 1000000,
        totalDeployed: 0,
        totalReturned: 0,
        netDeployed: 0,
        deploymentRate: 0,
        returnRate: 0,
        irr: null,
        moic: null,
        avgDeploymentDays: null,
        avgReturnDays: null,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      };

      vi.mocked(FundAnalyticsService.calculateFundPerformance).mockResolvedValue(mockPerformance);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/funds/fund-1/analytics')
      );

      const params = Promise.resolve({ fundId: 'fund-1' });
      const response = await GET(request, { params });
      const data = await response.json();

      expect(data.irr).toBeNull();
      expect(data.moic).toBeNull();
    });

    it('should include deployment and return metrics', async () => {
      const mockPerformance = {
        fundId: 'fund-1',
        fundName: 'Test Fund',
        totalCommitted: 10000000,
        totalDeployed: 8000000,
        totalReturned: 2000000,
        netDeployed: 6000000,
        deploymentRate: 80,
        returnRate: 25,
        irr: 12.0,
        moic: 1.25,
        avgDeploymentDays: 45,
        avgReturnDays: 120,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      };

      vi.mocked(FundAnalyticsService.calculateFundPerformance).mockResolvedValue(mockPerformance);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/funds/fund-1/analytics')
      );

      const params = Promise.resolve({ fundId: 'fund-1' });
      const response = await GET(request, { params });
      const data = await response.json();

      expect(data.avgDeploymentDays).toBe(45);
      expect(data.avgReturnDays).toBe(120);
      expect(data.deploymentRate).toBe(80);
      expect(data.returnRate).toBe(25);
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
      vi.mocked(FundAnalyticsService.calculateFundPerformance).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/funds/fund-1/analytics')
      );

      const params = Promise.resolve({ fundId: 'fund-1' });
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.code).toBe(500);
      expect(data.message).toBe('Failed to fetch fund analytics');
      expect(data.traceId).toBeDefined();
    });

    it('should include traceId in all error responses', async () => {
      vi.mocked(FundAnalyticsService.calculateFundPerformance).mockResolvedValue(null);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/funds/non-existent/analytics')
      );

      const params = Promise.resolve({ fundId: 'non-existent' });
      const response = await GET(request, { params });
      const data = await response.json();

      expect(data.traceId).toBeDefined();
      expect(typeof data.traceId).toBe('string');
      expect(data.traceId.length).toBeGreaterThan(0);
    });

    it('should handle unexpected errors gracefully', async () => {
      vi.mocked(FundAnalyticsService.calculateFundPerformance).mockRejectedValue(
        'Unexpected string error'
      );

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/funds/fund-1/analytics')
      );

      const params = Promise.resolve({ fundId: 'fund-1' });
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.code).toBe(500);
      expect(data.message).toBe('Failed to fetch fund analytics');
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
      const mockPerformance = {
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
      };

      vi.mocked(FundAnalyticsService.calculateFundPerformance).mockResolvedValue(mockPerformance);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/funds/fund-1/analytics')
      );

      const params = Promise.resolve({ fundId: 'fund-1' });
      const response = await GET(request, { params });
      const data = await response.json();

      expect(data).toHaveProperty('fundId');
      expect(data).toHaveProperty('fundName');
      expect(data).toHaveProperty('totalCommitted');
      expect(data).toHaveProperty('totalDeployed');
      expect(data).toHaveProperty('totalReturned');
      expect(data).toHaveProperty('netDeployed');
      expect(data).toHaveProperty('deploymentRate');
      expect(data).toHaveProperty('returnRate');
      expect(data).toHaveProperty('irr');
      expect(data).toHaveProperty('moic');
      expect(data).toHaveProperty('avgDeploymentDays');
      expect(data).toHaveProperty('avgReturnDays');
      expect(data).toHaveProperty('startDate');
      expect(data).toHaveProperty('endDate');
    });

    it('should return valid JSON', async () => {
      const mockPerformance = {
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
      };

      vi.mocked(FundAnalyticsService.calculateFundPerformance).mockResolvedValue(mockPerformance);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/funds/fund-1/analytics')
      );

      const params = Promise.resolve({ fundId: 'fund-1' });
      const response = await GET(request, { params });
      const data = await response.json();

      expect(() => JSON.stringify(data)).not.toThrow();
    });
  });
});
