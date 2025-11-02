import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { NextRequest } from 'next/server';
import { AnalyticsService } from '@/services/analytics.service';

vi.mock('@/services/analytics.service', () => ({
  AnalyticsService: {
    computeAll: vi.fn(),
  },
}));

// Mock Next.js revalidateTag to avoid static generation store errors
vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}));

describe('GET /api/cron/snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should compute snapshots with valid authorization', async () => {
    process.env.CRON_SECRET = 'test-secret';

    const mockResults = {
      funds: { success: true, date: '2025-01-15' },
      loans: { success: true, date: '2025-01-15' },
      payments: { success: true, date: '2025-01-15' },
      inspections: { success: true, date: '2025-01-15' },
    };

    vi.mocked(AnalyticsService.computeAll).mockResolvedValue(mockResults);

    const request = new NextRequest(
      new URL('http://localhost:3000/api/cron/snapshots'),
      {
        headers: {
          authorization: 'Bearer test-secret',
        },
      }
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(AnalyticsService.computeAll).toHaveBeenCalledOnce();
  });

  it('should reject unauthorized requests', async () => {
    process.env.CRON_SECRET = 'test-secret';

    const request = new NextRequest(
      new URL('http://localhost:3000/api/cron/snapshots'),
      {
        headers: {
          authorization: 'Bearer wrong-secret',
        },
      }
    );

    const response = await GET(request);

    expect(response.status).toBe(401);
    expect(AnalyticsService.computeAll).not.toHaveBeenCalled();
  });

  it('should handle computation errors gracefully', async () => {
    process.env.CRON_SECRET = 'test-secret';

    vi.mocked(AnalyticsService.computeAll).mockRejectedValue(
      new Error('Computation failed')
    );

    const request = new NextRequest(
      new URL('http://localhost:3000/api/cron/snapshots'),
      {
        headers: {
          authorization: 'Bearer test-secret',
        },
      }
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeTruthy();
  });
});

