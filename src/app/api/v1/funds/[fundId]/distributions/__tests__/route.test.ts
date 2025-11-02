import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { NextRequest } from 'next/server';
import { FundService } from '@/services/fund.service';
import { requireOrganization } from '@/lib/clerk-server';

vi.mock('@/services/fund.service');
vi.mock('@/lib/clerk-server');
vi.mock('@/db/client', () => ({
  db: {
    select: vi.fn(),
  },
}));

describe('GET /api/v1/funds/[fundId]/distributions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return distributions for authorized access', async () => {
    vi.mocked(requireOrganization).mockResolvedValue({
      user: { id: 'user-1' },
      session: {},
      organizationId: 'org-1',
    } as any);

    vi.mocked(FundService.getFundById).mockResolvedValue({
      id: 'fund-1',
      organizationId: 'org-1',
      name: 'Test Fund',
      fundType: 'private_equity',
      totalCapacity: '1000000',
      inceptionDate: new Date('2025-01-01'),
      strategy: 'Growth',
      targetReturn: '12',
      managementFeeBps: 200,
      performanceFeeBps: 2000,
      status: 'active',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    } as any);

    vi.mocked(FundService.getFundDistributions).mockResolvedValue([
      { 
        id: 'dist-1', 
        fundId: 'fund-1', 
        totalAmount: '10000',
        distributionDate: new Date('2025-01-15'),
        distributionType: 'return_of_capital',
        status: 'completed',
        notes: 'Test distribution',
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-15'),
      },
    ] as any);

    const request = new NextRequest(
      new URL('http://localhost:3000/api/v1/funds/fund-1/distributions')
    );

    const response = await GET(request, { params: { fundId: 'fund-1' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.distributions).toHaveLength(1);
    expect(data.count).toBe(1);
    expect(data.distributions[0].id).toBe('dist-1');
    expect(FundService.getFundById).toHaveBeenCalledWith('fund-1', 'org-1');
    expect(FundService.getFundDistributions).toHaveBeenCalledWith('fund-1', 'org-1');
  });

  it('should return 404 for fund in different organization', async () => {
    vi.mocked(requireOrganization).mockResolvedValue({
      user: { id: 'user-1' },
      session: {},
      organizationId: 'org-1',
    } as any);

    vi.mocked(FundService.getFundById).mockResolvedValue(null); // Fund not found in org

    const request = new NextRequest(
      new URL('http://localhost:3000/api/v1/funds/fund-2/distributions')
    );

    const response = await GET(request, { params: { fundId: 'fund-2' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toMatchObject({
      code: 404,
      message: 'Fund not found',
    });
    expect(data.traceId).toBeDefined();
    expect(FundService.getFundById).toHaveBeenCalledWith('fund-2', 'org-1');
    expect(FundService.getFundDistributions).not.toHaveBeenCalled();
  });

  it('should return 500 for service errors', async () => {
    vi.mocked(requireOrganization).mockResolvedValue({
      user: { id: 'user-1' },
      session: {},
      organizationId: 'org-1',
    } as any);

    vi.mocked(FundService.getFundById).mockRejectedValue(
      new Error('Database connection failed')
    );

    const request = new NextRequest(
      new URL('http://localhost:3000/api/v1/funds/fund-1/distributions')
    );

    const response = await GET(request, { params: { fundId: 'fund-1' } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toMatchObject({
      code: 500,
      message: 'Failed to fetch distributions',
    });
    expect(data.traceId).toBeDefined();
  });

  it('should handle empty distributions for valid fund', async () => {
    vi.mocked(requireOrganization).mockResolvedValue({
      user: { id: 'user-1' },
      session: {},
      organizationId: 'org-1',
    } as any);

    vi.mocked(FundService.getFundById).mockResolvedValue({
      id: 'fund-1',
      organizationId: 'org-1',
      name: 'Test Fund',
      fundType: 'private_equity',
      totalCapacity: '1000000',
      inceptionDate: new Date('2025-01-01'),
      strategy: 'Growth',
      targetReturn: '12',
      managementFeeBps: 200,
      performanceFeeBps: 2000,
      status: 'active',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    } as any);

    vi.mocked(FundService.getFundDistributions).mockResolvedValue([]);

    const request = new NextRequest(
      new URL('http://localhost:3000/api/v1/funds/fund-1/distributions')
    );

    const response = await GET(request, { params: { fundId: 'fund-1' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.distributions).toEqual([]);
    expect(data.count).toBe(0);
    expect(FundService.getFundById).toHaveBeenCalledWith('fund-1', 'org-1');
    expect(FundService.getFundDistributions).toHaveBeenCalledWith('fund-1', 'org-1');
  });

  it('should return 500 if getFundDistributions throws error', async () => {
    vi.mocked(requireOrganization).mockResolvedValue({
      user: { id: 'user-1' },
      session: {},
      organizationId: 'org-1',
    } as any);

    vi.mocked(FundService.getFundById).mockResolvedValue({
      id: 'fund-1',
      organizationId: 'org-1',
      name: 'Test Fund',
      fundType: 'private_equity',
      totalCapacity: '1000000',
      inceptionDate: new Date('2025-01-01'),
      strategy: 'Growth',
      targetReturn: '12',
      managementFeeBps: 200,
      performanceFeeBps: 2000,
      status: 'active',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    } as any);

    vi.mocked(FundService.getFundDistributions).mockRejectedValue(
      new Error('Distribution query failed')
    );

    const request = new NextRequest(
      new URL('http://localhost:3000/api/v1/funds/fund-1/distributions')
    );

    const response = await GET(request, { params: { fundId: 'fund-1' } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toMatchObject({
      code: 500,
      message: 'Failed to fetch distributions',
    });
    expect(data.traceId).toBeDefined();
  });
});
