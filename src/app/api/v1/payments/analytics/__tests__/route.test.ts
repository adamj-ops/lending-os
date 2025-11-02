import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { NextRequest } from 'next/server';
import { AnalyticsService } from '@/services/analytics.service';
import { requireOrganization } from '@/lib/clerk-server';

// Mock dependencies
vi.mock('@/services/analytics.service');
vi.mock('@/lib/clerk-server');

describe('GET /api/v1/payments/analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should return 500 if not authenticated', async () => {
      vi.mocked(requireOrganization).mockRejectedValue(new Error('Unauthorized'));

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/payments/analytics')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should proceed if authenticated', async () => {
      vi.mocked(requireOrganization).mockResolvedValue({
        user: { id: 'user-1' },
        session: {},
        organizationId: 'org-1',
      } as any);

      vi.mocked(AnalyticsService.getCollectionsKpis).mockResolvedValue([]);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/payments/analytics')
      );

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(requireOrganization).toHaveBeenCalled();
    });
  });

  describe('Payment Analytics Data', () => {
    beforeEach(() => {
      vi.mocked(requireOrganization).mockResolvedValue({
        user: { id: 'user-1' },
        session: {},
        organizationId: 'org-1',
      } as any);
    });

    it('should return payment KPIs with data', async () => {
      const mockData = [
        {
          snapshotDate: '2025-01-01',
          amountReceived: '10000.00',
          amountScheduled: '5000.00',
          lateCount: 2,
          avgCollectionDays: '3.5',
        },
        {
          snapshotDate: '2025-01-15',
          amountReceived: '15000.00',
          amountScheduled: '7000.00',
          lateCount: 1,
          avgCollectionDays: '2.8',
        },
      ];

      vi.mocked(AnalyticsService.getCollectionsKpis).mockResolvedValue(mockData);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/payments/analytics')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.kpis).toBeDefined();
      expect(data.kpis.snapshotDate).toBe('2025-01-15');
      expect(data.kpis.amountReceived).toBe('15000.00');
      expect(data.kpis.amountScheduled).toBe('7000.00');
      expect(data.kpis.lateCount).toBe(1);
      expect(data.kpis.avgCollectionDays).toBe('2.8');
      expect(data.series).toEqual(mockData);
    });

    it('should return default values when no data exists', async () => {
      vi.mocked(AnalyticsService.getCollectionsKpis).mockResolvedValue([]);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/payments/analytics')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.kpis).toEqual({
        snapshotDate: null,
        amountReceived: '0',
        amountScheduled: '0',
        lateCount: 0,
        avgCollectionDays: null,
      });
      expect(data.series).toEqual([]);
    });

    it('should return latest snapshot in kpis', async () => {
      const mockData = [
        {
          snapshotDate: '2025-01-01',
          amountReceived: '10000.00',
          amountScheduled: '5000.00',
          lateCount: 2,
          avgCollectionDays: '3.5',
        },
        {
          snapshotDate: '2025-01-10',
          amountReceived: '12000.00',
          amountScheduled: '6000.00',
          lateCount: 1,
          avgCollectionDays: '3.0',
        },
        {
          snapshotDate: '2025-01-20',
          amountReceived: '15000.00',
          amountScheduled: '7000.00',
          lateCount: 0,
          avgCollectionDays: '2.5',
        },
      ];

      vi.mocked(AnalyticsService.getCollectionsKpis).mockResolvedValue(mockData);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/payments/analytics')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(data.kpis.snapshotDate).toBe('2025-01-20');
      expect(data.kpis.amountReceived).toBe('15000.00');
    });
  });

  describe('Query Parameters', () => {
    beforeEach(() => {
      vi.mocked(requireOrganization).mockResolvedValue({
        user: { id: 'user-1' },
        session: {},
        organizationId: 'org-1',
      } as any);

      vi.mocked(AnalyticsService.getCollectionsKpis).mockResolvedValue([]);
    });

    it('should accept start and end date parameters', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/payments/analytics?start=2025-01-01&end=2025-01-31')
      );

      await GET(request);

      expect(AnalyticsService.getCollectionsKpis).toHaveBeenCalledWith(
        expect.objectContaining({
          start: '2025-01-01',
          end: '2025-01-31',
        })
      );
    });

    it('should accept loanIds parameter', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/payments/analytics?loanIds=loan-1,loan-2,loan-3')
      );

      await GET(request);

      expect(AnalyticsService.getCollectionsKpis).toHaveBeenCalledWith(
        expect.objectContaining({
          loanIds: ['loan-1', 'loan-2', 'loan-3'],
        })
      );
    });

    it('should accept propertyIds parameter', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/payments/analytics?propertyIds=prop-1,prop-2')
      );

      await GET(request);

      expect(AnalyticsService.getCollectionsKpis).toHaveBeenCalledWith(
        expect.objectContaining({
          propertyIds: ['prop-1', 'prop-2'],
        })
      );
    });

    it('should accept statuses parameter', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/payments/analytics?statuses=completed,pending')
      );

      await GET(request);

      expect(AnalyticsService.getCollectionsKpis).toHaveBeenCalledWith(
        expect.objectContaining({
          statuses: ['completed', 'pending'],
        })
      );
    });

    it('should accept fundIds parameter', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/payments/analytics?fundIds=fund-1,fund-2')
      );

      await GET(request);

      expect(AnalyticsService.getCollectionsKpis).toHaveBeenCalledWith(
        expect.objectContaining({
          fundIds: ['fund-1', 'fund-2'],
        })
      );
    });

    it('should accept multiple filter parameters', async () => {
      const request = new NextRequest(
        new URL(
          'http://localhost:3000/api/v1/payments/analytics?start=2025-01-01&end=2025-01-31&loanIds=loan-1,loan-2&statuses=completed'
        )
      );

      await GET(request);

      expect(AnalyticsService.getCollectionsKpis).toHaveBeenCalledWith({
        start: '2025-01-01',
        end: '2025-01-31',
        loanIds: ['loan-1', 'loan-2'],
        propertyIds: undefined,
        statuses: ['completed'],
        fundIds: undefined,
      });
    });

    it('should filter out empty values in comma-separated lists', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/payments/analytics?loanIds=loan-1,,loan-2,')
      );

      await GET(request);

      expect(AnalyticsService.getCollectionsKpis).toHaveBeenCalledWith(
        expect.objectContaining({
          loanIds: ['loan-1', 'loan-2'],
        })
      );
    });

    it('should work without query parameters', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/payments/analytics')
      );

      await GET(request);

      expect(AnalyticsService.getCollectionsKpis).toHaveBeenCalledWith({
        start: undefined,
        end: undefined,
        loanIds: undefined,
        propertyIds: undefined,
        statuses: undefined,
        fundIds: undefined,
      });
    });
  });

  describe('Cache Headers', () => {
    beforeEach(() => {
      vi.mocked(requireOrganization).mockResolvedValue({
        user: { id: 'user-1' },
        session: {},
        organizationId: 'org-1',
      } as any);

      vi.mocked(AnalyticsService.getCollectionsKpis).mockResolvedValue([]);
    });

    it('should set Cache-Control header', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/payments/analytics')
      );

      const response = await GET(request);

      expect(response.headers.get('Cache-Control')).toBe(
        's-maxage=300, stale-while-revalidate=600'
      );
    });

    it('should set X-Cache-Tags header', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/payments/analytics')
      );

      const response = await GET(request);

      expect(response.headers.get('X-Cache-Tags')).toBe('analytics:payments,analytics:*');
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
      vi.mocked(AnalyticsService.getCollectionsKpis).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/payments/analytics')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to load payment analytics');
      expect(data.details).toBe('Database connection failed');
    });

    it('should handle non-Error exceptions', async () => {
      vi.mocked(AnalyticsService.getCollectionsKpis).mockRejectedValue('Unexpected error');

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/payments/analytics')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to load payment analytics');
      expect(data.details).toBe('Unexpected error');
    });

    it('should handle service returning null values', async () => {
      const mockData = [
        {
          snapshotDate: '2025-01-15',
          amountReceived: null,
          amountScheduled: null,
          lateCount: null,
          avgCollectionDays: null,
        },
      ];

      vi.mocked(AnalyticsService.getCollectionsKpis).mockResolvedValue(mockData as any);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/payments/analytics')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.kpis).toBeDefined();
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
      const mockData = [
        {
          snapshotDate: '2025-01-15',
          amountReceived: '15000.00',
          amountScheduled: '7000.00',
          lateCount: 1,
          avgCollectionDays: '2.8',
        },
      ];

      vi.mocked(AnalyticsService.getCollectionsKpis).mockResolvedValue(mockData);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/payments/analytics')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty('kpis');
      expect(data).toHaveProperty('series');
      expect(data.kpis).toHaveProperty('snapshotDate');
      expect(data.kpis).toHaveProperty('amountReceived');
      expect(data.kpis).toHaveProperty('amountScheduled');
      expect(data.kpis).toHaveProperty('lateCount');
      expect(data.kpis).toHaveProperty('avgCollectionDays');
    });

    it('should return series data as array', async () => {
      const mockData = [
        {
          snapshotDate: '2025-01-01',
          amountReceived: '10000.00',
          amountScheduled: '5000.00',
          lateCount: 2,
          avgCollectionDays: '3.5',
        },
        {
          snapshotDate: '2025-01-15',
          amountReceived: '15000.00',
          amountScheduled: '7000.00',
          lateCount: 1,
          avgCollectionDays: '2.8',
        },
      ];

      vi.mocked(AnalyticsService.getCollectionsKpis).mockResolvedValue(mockData);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/payments/analytics')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(Array.isArray(data.series)).toBe(true);
      expect(data.series).toHaveLength(2);
      expect(data.series[0]).toEqual(mockData[0]);
      expect(data.series[1]).toEqual(mockData[1]);
    });
  });
});
