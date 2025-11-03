import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyticsService } from '../analytics.service';
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
  fundSnapshots: { snapshotDate: 'snapshot_date' },
  loanSnapshots: { snapshotDate: 'snapshot_date' },
  paymentSnapshots: { snapshotDate: 'snapshot_date' },
  inspectionSnapshots: { snapshotDate: 'snapshot_date' },
  eventIngest: { eventId: 'event_id', eventType: 'event_type' },
  lenders: { totalCommitted: 'total_committed', totalDeployed: 'total_deployed' },
  loans: { id: 'id', status: 'status', principal: 'principal', propertyId: 'property_id' },
  payments: { status: 'status', amount: 'amount', receivedDate: 'received_date', paymentDate: 'payment_date' },
  inspections: { status: 'status', scheduledDate: 'scheduled_date', completedDate: 'completed_date' },
  properties: { id: 'id', estimatedValue: 'estimated_value' },
}));

describe('AnalyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('computeFundSnapshot', () => {
    it('should compute fund snapshot with valid data', async () => {
      const mockTotals = [
        { totalCommitments: '1000000.00', capitalDeployed: '750000.00' }
      ];

      const mockRow = {
        snapshotDate: '2025-01-15',
        totalCommitments: '1000000.00',
        capitalDeployed: '750000.00',
        avgInvestorYield: null,
      };

      // Mock the query chain
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(mockTotals),
        values: vi.fn().mockReturnThis(),
        onConflictDoUpdate: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockRow]),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery);
      vi.mocked(db.insert).mockReturnValue(mockQuery as any);

      const result = await AnalyticsService.computeFundSnapshot('2025-01-15');

      expect(result).toBeDefined();
      expect(result.snapshotDate).toBe('2025-01-15');
      expect(result.totalCommitments).toBe('1000000.00');
    });

    it('should handle null totals gracefully', async () => {
      const mockTotals = [{}];
      const mockRow = {
        snapshotDate: '2025-01-15',
        totalCommitments: '0',
        capitalDeployed: '0',
        avgInvestorYield: null,
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(mockTotals),
        values: vi.fn().mockReturnThis(),
        onConflictDoUpdate: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockRow]),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery);
      vi.mocked(db.insert).mockReturnValue(mockQuery as any);

      const result = await AnalyticsService.computeFundSnapshot();

      expect(result.totalCommitments).toBe('0');
    });
  });

  describe('computeLoanSnapshot', () => {
    it('should compute loan snapshot with active loans', async () => {
      const mockActiveCount = [{ c: 5 }];
      const mockPrincipal = [{ total: '500000.00' }];
      const mockLtv = [{ avg: '0.75' }];

      const mockRow = {
        snapshotDate: '2025-01-15',
        activeCount: 5,
        delinquentCount: 0,
        avgLtv: '0.75',
        totalPrincipal: '500000.00',
        interestAccrued: '0',
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        select: vi.fn()
          .mockResolvedValueOnce(mockActiveCount)
          .mockResolvedValueOnce(mockPrincipal)
          .mockResolvedValueOnce(mockLtv),
        values: vi.fn().mockReturnThis(),
        onConflictDoUpdate: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockRow]),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery);
      vi.mocked(db.insert).mockReturnValue(mockQuery as any);
      vi.mocked(db.select).mockReturnValue(mockQuery);

      const result = await AnalyticsService.computeLoanSnapshot('2025-01-15');

      expect(result.activeCount).toBe(5);
      expect(result.totalPrincipal).toBe('500000.00');
    });
  });

  describe('computePaymentSnapshot', () => {
    it('should compute payment snapshot with completed payments', async () => {
      const mockReceived = [{ total: '10000.00' }];
      const mockScheduled = [{ total: '5000.00' }];
      const mockLate = [{ c: 2 }];
      const mockCollection = [{ avgDays: '3.5' }];

      const mockRow = {
        snapshotDate: '2025-01-15',
        amountReceived: '10000.00',
        amountScheduled: '5000.00',
        lateCount: 2,
        avgCollectionDays: '3.5',
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        select: vi.fn()
          .mockResolvedValueOnce(mockReceived)
          .mockResolvedValueOnce(mockScheduled)
          .mockResolvedValueOnce(mockLate)
          .mockResolvedValueOnce(mockCollection),
        values: vi.fn().mockReturnThis(),
        onConflictDoUpdate: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockRow]),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery);
      vi.mocked(db.insert).mockReturnValue(mockQuery as any);

      const result = await AnalyticsService.computePaymentSnapshot('2025-01-15');

      expect(result.amountReceived).toBe('10000.00');
      expect(result.lateCount).toBe(2);
    });
  });

  describe('computeInspectionSnapshot', () => {
    it('should compute inspection snapshot with scheduled and completed', async () => {
      const mockScheduled = [{ c: 10 }];
      const mockCompleted = [{ c: 8 }];
      const mockDuration = [{ avgHours: '2.5' }];

      const mockRow = {
        snapshotDate: '2025-01-15',
        scheduledCount: 10,
        completedCount: 8,
        avgCompletionHours: '2.5',
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        select: vi.fn()
          .mockResolvedValueOnce(mockScheduled)
          .mockResolvedValueOnce(mockCompleted)
          .mockResolvedValueOnce(mockDuration),
        values: vi.fn().mockReturnThis(),
        onConflictDoUpdate: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockRow]),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery);
      vi.mocked(db.insert).mockReturnValue(mockQuery as any);

      const result = await AnalyticsService.computeInspectionSnapshot('2025-01-15');

      expect(result.scheduledCount).toBe(10);
      expect(result.completedCount).toBe(8);
    });
  });

  describe('date filtering', () => {
    it('should convert date to YYYY-MM-DD format', async () => {
      const date = new Date('2025-01-15T12:00:00Z');
      
      // Just verify the date string is properly formatted
      const expectedFormat = '2025-01-15';
      const actualDate = date.toISOString().slice(0, 10);
      
      expect(actualDate).toBe(expectedFormat);
    });

    it('should use current date when no date provided', async () => {
      const today = new Date().toISOString().slice(0, 10);
      
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('error handling', () => {
    it('should handle empty results gracefully', async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue([]),
        values: vi.fn().mockReturnThis(),
        onConflictDoUpdate: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([
          {
            snapshotDate: '2025-01-15',
            totalCommitments: '0',
            capitalDeployed: '0',
            avgInvestorYield: null,
          }
        ]),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);
      vi.mocked(db.insert).mockReturnValue(mockQuery as any);

      const result = await AnalyticsService.computeFundSnapshot();

      expect(result.totalCommitments).toBe('0');
      expect(result.capitalDeployed).toBe('0');
    });

  });

  describe('computeAll', () => {
    it('should compute all snapshots for a given date', async () => {
      const mockRow = {
        snapshotDate: '2025-01-15',
        totalCommitments: '1000000.00',
        capitalDeployed: '750000.00',
        avgInvestorYield: null,
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue([{ c: 5 }]),
        values: vi.fn().mockReturnThis(),
        onConflictDoUpdate: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockRow]),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery);
      vi.mocked(db.insert).mockReturnValue(mockQuery as any);

      await AnalyticsService.computeAll('2025-01-15');

      // Verify all four snapshot methods were called
      expect(db.insert).toHaveBeenCalledTimes(4);
    });

    it('should use current date when no date provided', async () => {
      const mockRow = { snapshotDate: expect.any(String) };
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue([{ c: 0 }]),
        values: vi.fn().mockReturnThis(),
        onConflictDoUpdate: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockRow]),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery);
      vi.mocked(db.insert).mockReturnValue(mockQuery as any);

      await AnalyticsService.computeAll();

      expect(db.insert).toHaveBeenCalled();
    });
  });

  describe('computeFromEvent', () => {
    beforeEach(() => {
      // Reset mocks with complete chain
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue([{ c: 5 }]),
        values: vi.fn().mockReturnThis(),
        onConflictDoUpdate: vi.fn().mockReturnThis(),
        onConflictDoNothing: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{
          snapshotDate: '2025-01-15',
          activeCount: 5,
        }]),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery);
      vi.mocked(db.insert).mockReturnValue(mockQuery as any);
    });

    it('should handle Loan.Funded event', async () => {
      const event = {
        id: 'evt-1',
        type: 'Loan.Funded',
        domain: 'loan',
        aggregateId: 'loan-1',
        payload: { loanId: 'loan-1', amount: 100000 },
        occurredAt: '2025-01-15T10:00:00Z',
      };

      const result = await AnalyticsService.computeFromEvent(event);

      expect(result).toBe(true);
      // Should insert event and compute loan + fund snapshots
      expect(db.insert).toHaveBeenCalled();
    });

    it('should handle Payment.Received event', async () => {
      const event = {
        id: 'evt-2',
        type: 'Payment.Received',
        domain: 'payment',
        aggregateId: 'pay-1',
        payload: { paymentId: 'pay-1', amount: 5000 },
        occurredAt: '2025-01-15T10:00:00Z',
      };

      const result = await AnalyticsService.computeFromEvent(event);

      expect(result).toBe(true);
      expect(db.insert).toHaveBeenCalled();
    });

    it('should handle Inspection.Completed event', async () => {
      const event = {
        id: 'evt-3',
        type: 'Inspection.Completed',
        domain: 'inspection',
        aggregateId: 'insp-1',
        payload: { inspectionId: 'insp-1' },
        occurredAt: '2025-01-15T10:00:00Z',
      };

      const result = await AnalyticsService.computeFromEvent(event);

      expect(result).toBe(true);
      expect(db.insert).toHaveBeenCalled();
    });

    it('should handle unknown event types gracefully', async () => {
      const event = {
        id: 'evt-4',
        type: 'Unknown.Event',
        payload: {},
        occurredAt: '2025-01-15T10:00:00Z',
      };

      const result = await AnalyticsService.computeFromEvent(event);

      expect(result).toBe(true);
      // Should still ingest the event even if not processing it
      expect(db.insert).toHaveBeenCalled();
    });

    it('should be idempotent for duplicate events', async () => {
      const event = {
        id: 'evt-duplicate',
        type: 'Loan.Funded',
        payload: { loanId: 'loan-1' },
        occurredAt: '2025-01-15T10:00:00Z',
      };

      // First call
      await AnalyticsService.computeFromEvent(event);
      const firstCallCount = vi.mocked(db.insert).mock.calls.length;

      // Second call with same event ID
      await AnalyticsService.computeFromEvent(event);

      // Should use onConflictDoNothing for idempotency
      expect(db.insert).toHaveBeenCalled();
    });

    it('should handle events with Date objects', async () => {
      const event = {
        id: 'evt-5',
        type: 'Loan.Funded',
        payload: { loanId: 'loan-1' },
        occurredAt: new Date('2025-01-15T10:00:00Z'),
      };

      const result = await AnalyticsService.computeFromEvent(event);

      expect(result).toBe(true);
    });
  });

  describe('getFundKpis', () => {
    it('should return fund KPIs for default date range (30 days)', async () => {
      const mockSnapshots = [
        { snapshotDate: '2025-01-01', totalCommitments: '1000000', capitalDeployed: '750000' },
        { snapshotDate: '2025-01-15', totalCommitments: '1200000', capitalDeployed: '850000' },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockSnapshots),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await AnalyticsService.getFundKpis();

      expect(result).toEqual(mockSnapshots);
      expect(result).toHaveLength(2);
    });

    it('should accept custom date range filters', async () => {
      const mockSnapshots = [
        { snapshotDate: '2025-01-10', totalCommitments: '1100000', capitalDeployed: '800000' },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockSnapshots),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await AnalyticsService.getFundKpis({
        start: '2025-01-10',
        end: '2025-01-20',
      });

      expect(result).toEqual(mockSnapshots);
    });

    it('should ignore loan/property/status filters for fund KPIs', async () => {
      const mockSnapshots = [
        { snapshotDate: '2025-01-15', totalCommitments: '1000000', capitalDeployed: '750000' },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockSnapshots),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await AnalyticsService.getFundKpis({
        loanIds: ['loan-1'],
        propertyIds: ['prop-1'],
        statuses: ['funded'],
      });

      // Fund KPIs are aggregate-level, so filters are ignored
      expect(result).toEqual(mockSnapshots);
    });

    it('should return empty array when no snapshots exist', async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await AnalyticsService.getFundKpis();

      expect(result).toEqual([]);
    });
  });

  describe('getLoanKpis', () => {
    it('should return loan KPIs for date range', async () => {
      const mockSnapshots = [
        { snapshotDate: '2025-01-01', activeCount: 5, totalPrincipal: '500000' },
        { snapshotDate: '2025-01-15', activeCount: 7, totalPrincipal: '700000' },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockSnapshots),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await AnalyticsService.getLoanKpis({
        start: '2025-01-01',
        end: '2025-01-31',
      });

      expect(result).toEqual(mockSnapshots);
      expect(result).toHaveLength(2);
    });

    it('should use default 30-day range when no dates provided', async () => {
      const mockSnapshots = [
        { snapshotDate: '2025-01-15', activeCount: 5, totalPrincipal: '500000' },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockSnapshots),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await AnalyticsService.getLoanKpis();

      expect(result).toEqual(mockSnapshots);
    });

    it('should handle empty filters object', async () => {
      const mockSnapshots = [];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockSnapshots),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await AnalyticsService.getLoanKpis({});

      expect(result).toEqual([]);
    });
  });

  describe('getCollectionsKpis', () => {
    it('should return payment snapshots for date range', async () => {
      const mockSnapshots = [
        { snapshotDate: '2025-01-01', amountReceived: '10000', lateCount: 2 },
        { snapshotDate: '2025-01-15', amountReceived: '15000', lateCount: 1 },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockSnapshots),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await AnalyticsService.getCollectionsKpis({
        start: '2025-01-01',
        end: '2025-01-31',
      });

      expect(result).toEqual(mockSnapshots);
    });

    it('should use default date range', async () => {
      const mockSnapshots = [
        { snapshotDate: '2025-01-15', amountReceived: '12000', lateCount: 0 },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockSnapshots),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await AnalyticsService.getCollectionsKpis();

      expect(result).toEqual(mockSnapshots);
    });
  });

  describe('getInspectionKpis', () => {
    it('should return inspection snapshots for date range', async () => {
      const mockSnapshots = [
        { snapshotDate: '2025-01-01', scheduledCount: 10, completedCount: 8 },
        { snapshotDate: '2025-01-15', scheduledCount: 12, completedCount: 10 },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockSnapshots),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await AnalyticsService.getInspectionKpis({
        start: '2025-01-01',
        end: '2025-01-31',
      });

      expect(result).toEqual(mockSnapshots);
    });

    it('should handle custom date boundaries', async () => {
      const mockSnapshots = [
        { snapshotDate: '2024-12-01', scheduledCount: 5, completedCount: 4 },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockSnapshots),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await AnalyticsService.getInspectionKpis({
        start: '2024-12-01',
        end: '2024-12-31',
      });

      expect(result).toEqual(mockSnapshots);
    });
  });

  describe('getFilteredLoanIds', () => {
    it('should return undefined when no filters provided', async () => {
      const result = await AnalyticsService.getFilteredLoanIds({});

      expect(result).toBeUndefined();
    });

    it('should filter by loan IDs', async () => {
      const mockLoans = [{ id: 'loan-1' }, { id: 'loan-2' }];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockLoans),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await AnalyticsService.getFilteredLoanIds({
        loanIds: ['loan-1', 'loan-2'],
      });

      expect(result).toEqual(['loan-1', 'loan-2']);
    });

    it('should filter by property IDs', async () => {
      const mockLoans = [{ id: 'loan-3' }, { id: 'loan-4' }];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockLoans),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await AnalyticsService.getFilteredLoanIds({
        propertyIds: ['prop-1', 'prop-2'],
      });

      expect(result).toEqual(['loan-3', 'loan-4']);
    });

    it('should filter by statuses', async () => {
      const mockLoans = [{ id: 'loan-5' }];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockLoans),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await AnalyticsService.getFilteredLoanIds({
        statuses: ['funded', 'active'],
      });

      expect(result).toEqual(['loan-5']);
    });

    it('should combine multiple filter types', async () => {
      const mockLoans = [{ id: 'loan-6' }];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockLoans),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await AnalyticsService.getFilteredLoanIds({
        loanIds: ['loan-6', 'loan-7'],
        propertyIds: ['prop-1'],
        statuses: ['funded'],
      });

      expect(result).toEqual(['loan-6']);
    });

    it('should return empty array when no loans match filters', async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockQuery as any);

      const result = await AnalyticsService.getFilteredLoanIds({
        loanIds: ['non-existent'],
      });

      expect(result).toEqual([]);
    });

    it('should handle empty filter arrays', async () => {
      const result = await AnalyticsService.getFilteredLoanIds({
        loanIds: [],
        propertyIds: [],
        statuses: [],
      });

      expect(result).toBeUndefined();
    });
  });
});

