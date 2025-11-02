import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { NextRequest } from 'next/server';
import { AnalyticsService } from '@/services/analytics.service';
import { requireOrganization } from '@/lib/clerk-server';

// Mock dependencies
vi.mock('@/services/analytics.service');
vi.mock('@/lib/clerk-server');

describe('GET /api/v1/inspections/analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should return 500 if not authenticated', async () => {
      vi.mocked(requireOrganization).mockRejectedValue(new Error('Unauthorized'));

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/inspections/analytics')
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

      vi.mocked(AnalyticsService.getInspectionKpis).mockResolvedValue([]);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/inspections/analytics')
      );

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(requireOrganization).toHaveBeenCalled();
    });
  });

  describe('Inspection Analytics Data', () => {
    beforeEach(() => {
      vi.mocked(requireOrganization).mockResolvedValue({
        user: { id: 'user-1' },
        session: {},
        organizationId: 'org-1',
      } as any);
    });

    it('should return inspection KPIs with data', async () => {
      const mockData = [
        {
          snapshotDate: '2025-01-01',
          scheduledCount: 10,
          completedCount: 8,
          avgCompletionHours: '24.5',
        },
        {
          snapshotDate: '2025-01-15',
          scheduledCount: 12,
          completedCount: 10,
          avgCompletionHours: '22.3',
        },
      ];

      vi.mocked(AnalyticsService.getInspectionKpis).mockResolvedValue(mockData);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/inspections/analytics')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.kpis).toBeDefined();
      expect(data.kpis.snapshotDate).toBe('2025-01-15');
      expect(data.kpis.scheduledCount).toBe(12);
      expect(data.kpis.completedCount).toBe(10);
      expect(data.kpis.avgCompletionHours).toBe('22.3');
      expect(data.series).toEqual(mockData);
    });

    it('should return default values when no data exists', async () => {
      vi.mocked(AnalyticsService.getInspectionKpis).mockResolvedValue([]);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/inspections/analytics')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.kpis).toEqual({
        snapshotDate: null,
        scheduledCount: 0,
        completedCount: 0,
        avgCompletionHours: null,
      });
      expect(data.series).toEqual([]);
    });

    it('should return latest snapshot in kpis', async () => {
      const mockData = [
        {
          snapshotDate: '2025-01-01',
          scheduledCount: 10,
          completedCount: 8,
          avgCompletionHours: '24.5',
        },
        {
          snapshotDate: '2025-01-10',
          scheduledCount: 15,
          completedCount: 12,
          avgCompletionHours: '20.0',
        },
        {
          snapshotDate: '2025-01-20',
          scheduledCount: 20,
          completedCount: 18,
          avgCompletionHours: '18.5',
        },
      ];

      vi.mocked(AnalyticsService.getInspectionKpis).mockResolvedValue(mockData);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/inspections/analytics')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(data.kpis.snapshotDate).toBe('2025-01-20');
      expect(data.kpis.scheduledCount).toBe(20);
      expect(data.kpis.completedCount).toBe(18);
    });
  });

  describe('Query Parameters', () => {
    beforeEach(() => {
      vi.mocked(requireOrganization).mockResolvedValue({
        user: { id: 'user-1' },
        session: {},
        organizationId: 'org-1',
      } as any);

      vi.mocked(AnalyticsService.getInspectionKpis).mockResolvedValue([]);
    });

    it('should accept start and end date parameters', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/inspections/analytics?start=2025-01-01&end=2025-01-31')
      );

      await GET(request);

      expect(AnalyticsService.getInspectionKpis).toHaveBeenCalledWith(
        expect.objectContaining({
          start: '2025-01-01',
          end: '2025-01-31',
        })
      );
    });

    it('should accept loanIds parameter', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/inspections/analytics?loanIds=loan-1,loan-2,loan-3')
      );

      await GET(request);

      expect(AnalyticsService.getInspectionKpis).toHaveBeenCalledWith(
        expect.objectContaining({
          loanIds: ['loan-1', 'loan-2', 'loan-3'],
        })
      );
    });

    it('should accept propertyIds parameter', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/inspections/analytics?propertyIds=prop-1,prop-2')
      );

      await GET(request);

      expect(AnalyticsService.getInspectionKpis).toHaveBeenCalledWith(
        expect.objectContaining({
          propertyIds: ['prop-1', 'prop-2'],
        })
      );
    });

    it('should accept statuses parameter', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/inspections/analytics?statuses=scheduled,completed')
      );

      await GET(request);

      expect(AnalyticsService.getInspectionKpis).toHaveBeenCalledWith(
        expect.objectContaining({
          statuses: ['scheduled', 'completed'],
        })
      );
    });

    it('should accept fundIds parameter', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/inspections/analytics?fundIds=fund-1,fund-2')
      );

      await GET(request);

      expect(AnalyticsService.getInspectionKpis).toHaveBeenCalledWith(
        expect.objectContaining({
          fundIds: ['fund-1', 'fund-2'],
        })
      );
    });

    it('should accept multiple filter parameters', async () => {
      const request = new NextRequest(
        new URL(
          'http://localhost:3000/api/v1/inspections/analytics?start=2025-01-01&end=2025-01-31&propertyIds=prop-1&statuses=completed'
        )
      );

      await GET(request);

      expect(AnalyticsService.getInspectionKpis).toHaveBeenCalledWith({
        start: '2025-01-01',
        end: '2025-01-31',
        loanIds: undefined,
        propertyIds: ['prop-1'],
        statuses: ['completed'],
        fundIds: undefined,
      });
    });

    it('should work without query parameters', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/inspections/analytics')
      );

      await GET(request);

      expect(AnalyticsService.getInspectionKpis).toHaveBeenCalledWith({
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

      vi.mocked(AnalyticsService.getInspectionKpis).mockResolvedValue([]);
    });

    it('should set Cache-Control header', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/inspections/analytics')
      );

      const response = await GET(request);

      expect(response.headers.get('Cache-Control')).toBe(
        's-maxage=300, stale-while-revalidate=600'
      );
    });

    it('should set X-Cache-Tags header', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/inspections/analytics')
      );

      const response = await GET(request);

      expect(response.headers.get('X-Cache-Tags')).toBe('analytics:inspections,analytics:*');
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
      vi.mocked(AnalyticsService.getInspectionKpis).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/inspections/analytics')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to load inspection analytics');
      expect(data.details).toBe('Database connection failed');
    });

    it('should handle non-Error exceptions', async () => {
      vi.mocked(AnalyticsService.getInspectionKpis).mockRejectedValue('Unexpected error');

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/inspections/analytics')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to load inspection analytics');
      expect(data.details).toBe('Unexpected error');
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
          scheduledCount: 12,
          completedCount: 10,
          avgCompletionHours: '22.3',
        },
      ];

      vi.mocked(AnalyticsService.getInspectionKpis).mockResolvedValue(mockData);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/inspections/analytics')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty('kpis');
      expect(data).toHaveProperty('series');
      expect(data.kpis).toHaveProperty('snapshotDate');
      expect(data.kpis).toHaveProperty('scheduledCount');
      expect(data.kpis).toHaveProperty('completedCount');
      expect(data.kpis).toHaveProperty('avgCompletionHours');
    });

    it('should return series data as array', async () => {
      const mockData = [
        {
          snapshotDate: '2025-01-01',
          scheduledCount: 10,
          completedCount: 8,
          avgCompletionHours: '24.5',
        },
        {
          snapshotDate: '2025-01-15',
          scheduledCount: 12,
          completedCount: 10,
          avgCompletionHours: '22.3',
        },
      ];

      vi.mocked(AnalyticsService.getInspectionKpis).mockResolvedValue(mockData);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/inspections/analytics')
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
