import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { NextRequest } from 'next/server';
import { AnalyticsService } from '@/services/analytics.service';
import { requireOrganization } from '@/lib/clerk-server';

// Mock the analytics service
vi.mock('@/services/analytics.service', () => ({
  AnalyticsService: {
    getFundKpis: vi.fn(),
    getFundTimeline: vi.fn(),
  },
}));

// Mock the auth server
vi.mock('@/lib/clerk-server');

describe('GET /api/v1/funds/analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock auth for all tests
    vi.mocked(requireOrganization).mockResolvedValue({
      user: { id: 'user-1' },
      session: {},
      organizationId: 'org-1',
    } as any);
  });

  it('should return fund KPIs and timeline data', async () => {
    const mockLatestKpis = {
      snapshotDate: '2025-01-15',
      totalCommitments: '1000000',
      capitalDeployed: '750000',
      avgInvestorYield: '10.5',
    };

    // Timeline is ordered oldest to newest, latest is last element
    const mockTimeline = [
      { snapshotDate: '2025-01-14', totalCommitments: '950000', capitalDeployed: '700000', avgInvestorYield: null },
      mockLatestKpis,
    ];

    vi.mocked(AnalyticsService.getFundKpis).mockResolvedValue(mockTimeline);

    const request = new NextRequest(
      new URL('http://localhost:3000/api/v1/funds/analytics?start=2025-01-01&end=2025-01-31')
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('kpis');
    expect(data).toHaveProperty('series');
    expect(data.kpis.totalCommitments).toBe(mockLatestKpis.totalCommitments);
    expect(data.series).toEqual(mockTimeline);
  });

  it('should handle missing parameters gracefully', async () => {
    const mockKpis = {
      snapshotDate: '2025-01-15',
      totalCommitments: '0',
      capitalDeployed: '0',
      avgInvestorYield: null,
    };

    const mockTimeline: any[] = [];

    vi.mocked(AnalyticsService.getFundKpis).mockResolvedValue(mockKpis);
    vi.mocked(AnalyticsService.getFundTimeline).mockResolvedValue(mockTimeline);

    const request = new NextRequest(
      new URL('http://localhost:3000/api/v1/funds/analytics')
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('kpis');
    expect(data).toHaveProperty('series');
  });

  it('should return error when service fails', async () => {
    vi.mocked(AnalyticsService.getFundKpis).mockRejectedValue(
      new Error('Database connection failed')
    );

    const request = new NextRequest(
      new URL('http://localhost:3000/api/v1/funds/analytics')
    );

    const response = await GET(request);

    expect(response.status).toBe(500);
  });

  it('should include cache headers', async () => {
    const mockKpis = {
      snapshotDate: '2025-01-15',
      totalCommitments: '1000000',
      capitalDeployed: '750000',
      avgInvestorYield: '10.5',
    };

    vi.mocked(AnalyticsService.getFundKpis).mockResolvedValue(mockKpis);
    vi.mocked(AnalyticsService.getFundTimeline).mockResolvedValue([]);

    const request = new NextRequest(
      new URL('http://localhost:3000/api/v1/funds/analytics')
    );

    const response = await GET(request);

    expect(response.headers.get('X-Cache-Tags')).toBeTruthy();
    expect(response.headers.get('X-Cache-Tags')).toContain('analytics:funds');
  });
});

