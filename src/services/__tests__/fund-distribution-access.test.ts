import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FundService } from '../fund.service';
import { db } from '@/db/client';

vi.mock('@/db/client', () => ({
  db: {
    select: vi.fn(),
  },
}));

describe('FundService.getFundDistributions - Org Scoping', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return distributions for fund in same organization', async () => {
    const mockDistributions = [
      { 
        id: 'dist-1', 
        fundId: 'fund-1', 
        totalAmount: '10000',
        distributionDate: new Date('2025-01-15'),
        distributionType: 'return_of_capital',
        status: 'completed',
        notes: 'Test distribution 1',
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-15'),
      },
      { 
        id: 'dist-2', 
        fundId: 'fund-1', 
        totalAmount: '5000',
        distributionDate: new Date('2025-01-10'),
        distributionType: 'return_of_capital',
        status: 'completed',
        notes: 'Test distribution 2',
        createdAt: new Date('2025-01-10'),
        updatedAt: new Date('2025-01-10'),
      },
    ];

    const mockQuery = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue(mockDistributions),
    };

    vi.mocked(db.select).mockReturnValue(mockQuery as any);

    const result = await FundService.getFundDistributions('fund-1', 'org-1');

    expect(result).toEqual(mockDistributions);
    expect(result.length).toBe(2);
    
    // Verify query chain was called correctly
    expect(db.select).toHaveBeenCalledWith({
      id: expect.anything(),
      fundId: expect.anything(),
      distributionDate: expect.anything(),
      totalAmount: expect.anything(),
      distributionType: expect.anything(),
      status: expect.anything(),
      notes: expect.anything(),
      createdAt: expect.anything(),
      updatedAt: expect.anything(),
    });
    expect(mockQuery.from).toHaveBeenCalled();
    expect(mockQuery.innerJoin).toHaveBeenCalled();
    expect(mockQuery.where).toHaveBeenCalled();
    expect(mockQuery.orderBy).toHaveBeenCalled();
  });

  it('should return empty array for fund in different organization', async () => {
    // Mock query returns empty when org doesn't match
    const mockQuery = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([]),
    };

    vi.mocked(db.select).mockReturnValue(mockQuery as any);

    const result = await FundService.getFundDistributions('fund-2', 'org-1');

    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });

  it('should return empty array for non-existent fund', async () => {
    const mockQuery = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([]),
    };

    vi.mocked(db.select).mockReturnValue(mockQuery as any);

    const result = await FundService.getFundDistributions('nonexistent', 'org-1');

    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });

  it('should return empty array when fund has no distributions', async () => {
    const mockQuery = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([]),
    };

    vi.mocked(db.select).mockReturnValue(mockQuery as any);

    const result = await FundService.getFundDistributions('fund-1', 'org-1');

    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });

  it('should handle database errors gracefully', async () => {
    const mockQuery = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockRejectedValue(new Error('Database connection failed')),
    };

    vi.mocked(db.select).mockReturnValue(mockQuery as any);

    await expect(
      FundService.getFundDistributions('fund-1', 'org-1')
    ).rejects.toThrow('Database connection failed');
  });
});
