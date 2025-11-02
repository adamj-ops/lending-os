import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { NextRequest } from 'next/server';
import { AnalyticsService } from '@/services/analytics.service';
import { requireOrganization } from '@/lib/clerk-server';

vi.mock('@/services/analytics.service', () => ({
  AnalyticsService: {
    getLoanKpis: vi.fn(),
  },
}));

// Mock the auth server
vi.mock('@/lib/clerk-server');

describe('GET /api/v1/loans/analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock auth for all tests
    vi.mocked(requireOrganization).mockResolvedValue({
      user: { id: 'user-1' },
      session: {},
      organizationId: 'org-1',
    } as any);
  });

  it('should return loan KPIs and series data', async () => {
    const mockData = [
      {
        snapshotDate: '2025-01-15',
        activeCount: 10,
        delinquentCount: 1,
        avgLtv: '0.75',
        totalPrincipal: '500000',
        interestAccrued: '5000',
      },
    ];

    vi.mocked(AnalyticsService.getLoanKpis).mockResolvedValue(mockData);

    const request = new NextRequest(
      new URL('http://localhost:3000/api/v1/loans/analytics')
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('kpis');
    expect(data).toHaveProperty('series');
    expect(data.kpis.activeCount).toBe(10);
  });

  it('should handle empty data gracefully', async () => {
    vi.mocked(AnalyticsService.getLoanKpis).mockResolvedValue([]);

    const request = new NextRequest(
      new URL('http://localhost:3000/api/v1/loans/analytics')
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.kpis.activeCount).toBe(0);
    expect(data.kpis.delinquentCount).toBe(0);
  });

  it('should return error on service failure', async () => {
    vi.mocked(AnalyticsService.getLoanKpis).mockRejectedValue(
      new Error('Service unavailable')
    );

    const request = new NextRequest(
      new URL('http://localhost:3000/api/v1/loans/analytics')
    );

    const response = await GET(request);

    expect(response.status).toBe(500);
  });
});

