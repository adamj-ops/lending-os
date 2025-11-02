import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';
import { forecastLoan } from '@/lib/ai/forecast';
import { requireOrganization } from '@/lib/clerk-server';

// Mock dependencies
vi.mock('@/lib/ai/forecast');
vi.mock('@/lib/clerk-server');

describe('POST /api/v1/analytics/forecast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 if not authenticated', async () => {
      vi.mocked(requireOrganization).mockRejectedValue(new Error('Unauthorized'));

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/analytics/forecast'),
        {
          method: 'POST',
          body: JSON.stringify({
            principal: 100000,
            rate: 0.05,
            termMonths: 12,
            category: 'commercial',
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });

    it('should proceed if authenticated', async () => {
      vi.mocked(requireOrganization).mockResolvedValue({
        user: { id: 'user-1' },
        session: {},
        organizationId: 'org-1',
      } as any);

      vi.mocked(forecastLoan).mockResolvedValue({
        riskScore: 0.3,
        riskRating: 'LOW',
        projectedROI: 0.08,
        confidence: 0.85,
        factors: [],
      } as any);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/analytics/forecast'),
        {
          method: 'POST',
          body: JSON.stringify({
            principal: 100000,
            rate: 0.05,
            termMonths: 12,
            category: 'commercial',
          }),
        }
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(requireOrganization).toHaveBeenCalled();
    });
  });

  describe('Input Validation', () => {
    beforeEach(() => {
      vi.mocked(requireOrganization).mockResolvedValue({
        user: { id: 'user-1' },
        session: {},
        organizationId: 'org-1',
      } as any);
    });

    it('should return 400 if principal is missing', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/analytics/forecast'),
        {
          method: 'POST',
          body: JSON.stringify({
            rate: 0.05,
            termMonths: 12,
            category: 'commercial',
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 400 if rate is missing', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/analytics/forecast'),
        {
          method: 'POST',
          body: JSON.stringify({
            principal: 100000,
            termMonths: 12,
            category: 'commercial',
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 400 if termMonths is missing', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/analytics/forecast'),
        {
          method: 'POST',
          body: JSON.stringify({
            principal: 100000,
            rate: 0.05,
            category: 'commercial',
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 400 if category is missing', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/analytics/forecast'),
        {
          method: 'POST',
          body: JSON.stringify({
            principal: 100000,
            rate: 0.05,
            termMonths: 12,
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required fields');
    });

    it('should accept valid input with all required fields', async () => {
      vi.mocked(forecastLoan).mockResolvedValue({
        riskScore: 0.3,
        riskRating: 'LOW',
        projectedROI: 0.08,
        confidence: 0.85,
        factors: [],
      } as any);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/analytics/forecast'),
        {
          method: 'POST',
          body: JSON.stringify({
            principal: 100000,
            rate: 0.05,
            termMonths: 12,
            category: 'commercial',
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(forecastLoan).toHaveBeenCalled();
    });

    it('should accept optional fields', async () => {
      vi.mocked(forecastLoan).mockResolvedValue({
        riskScore: 0.3,
        riskRating: 'LOW',
        projectedROI: 0.08,
        confidence: 0.85,
        factors: [],
      } as any);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/analytics/forecast'),
        {
          method: 'POST',
          body: JSON.stringify({
            principal: 100000,
            rate: 0.05,
            termMonths: 12,
            category: 'commercial',
            ltv: 0.75,
            borrowerCreditScore: 720,
            propertyValue: 133333,
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(forecastLoan).toHaveBeenCalledWith(
        expect.objectContaining({
          principal: 100000,
          rate: 0.05,
          termMonths: 12,
          category: 'commercial',
          ltv: 0.75,
          borrowerCreditScore: 720,
          propertyValue: 133333,
        })
      );
    });
  });

  describe('Forecast Generation', () => {
    beforeEach(() => {
      vi.mocked(requireOrganization).mockResolvedValue({
        user: { id: 'user-1' },
        session: {},
        organizationId: 'org-1',
      } as any);
    });

    it('should return forecast data on success', async () => {
      const mockForecast = {
        riskScore: 0.3,
        riskRating: 'LOW' as const,
        projectedROI: 0.08,
        confidence: 0.85,
        factors: [
          { factor: 'Credit Score', impact: 'positive', weight: 0.3 },
          { factor: 'LTV', impact: 'neutral', weight: 0.2 },
        ],
      };

      vi.mocked(forecastLoan).mockResolvedValue(mockForecast);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/analytics/forecast'),
        {
          method: 'POST',
          body: JSON.stringify({
            principal: 100000,
            rate: 0.05,
            termMonths: 12,
            category: 'commercial',
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockForecast);
      expect(data.data.riskScore).toBe(0.3);
      expect(data.data.riskRating).toBe('LOW');
      expect(data.data.projectedROI).toBe(0.08);
      expect(data.data.confidence).toBe(0.85);
      expect(data.data.factors).toHaveLength(2);
    });

    it('should handle high risk scenarios', async () => {
      const mockForecast = {
        riskScore: 0.85,
        riskRating: 'HIGH' as const,
        projectedROI: 0.02,
        confidence: 0.75,
        factors: [
          { factor: 'Credit Score', impact: 'negative', weight: 0.4 },
          { factor: 'High LTV', impact: 'negative', weight: 0.35 },
        ],
      };

      vi.mocked(forecastLoan).mockResolvedValue(mockForecast);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/analytics/forecast'),
        {
          method: 'POST',
          body: JSON.stringify({
            principal: 500000,
            rate: 0.12,
            termMonths: 6,
            category: 'bridge',
            ltv: 0.95,
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.riskRating).toBe('HIGH');
      expect(data.data.riskScore).toBeGreaterThan(0.7);
    });

    it('should handle medium risk scenarios', async () => {
      const mockForecast = {
        riskScore: 0.5,
        riskRating: 'MEDIUM' as const,
        projectedROI: 0.05,
        confidence: 0.8,
        factors: [],
      };

      vi.mocked(forecastLoan).mockResolvedValue(mockForecast);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/analytics/forecast'),
        {
          method: 'POST',
          body: JSON.stringify({
            principal: 250000,
            rate: 0.08,
            termMonths: 24,
            category: 'term',
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.riskRating).toBe('MEDIUM');
    });

    it('should pass all input parameters to forecastLoan', async () => {
      vi.mocked(forecastLoan).mockResolvedValue({
        riskScore: 0.3,
        riskRating: 'LOW',
        projectedROI: 0.08,
        confidence: 0.85,
        factors: [],
      } as any);

      const input = {
        principal: 100000,
        rate: 0.05,
        termMonths: 12,
        category: 'commercial' as const,
        ltv: 0.75,
        borrowerCreditScore: 720,
        propertyValue: 133333,
      };

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/analytics/forecast'),
        {
          method: 'POST',
          body: JSON.stringify(input),
        }
      );

      await POST(request);

      expect(forecastLoan).toHaveBeenCalledWith(input);
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

    it('should return 500 if forecast generation fails', async () => {
      vi.mocked(forecastLoan).mockRejectedValue(new Error('AI service unavailable'));

      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/analytics/forecast'),
        {
          method: 'POST',
          body: JSON.stringify({
            principal: 100000,
            rate: 0.05,
            termMonths: 12,
            category: 'commercial',
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to generate forecast');
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/analytics/forecast'),
        {
          method: 'POST',
          body: 'invalid json',
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });

    it('should handle empty request body', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/analytics/forecast'),
        {
          method: 'POST',
          body: JSON.stringify({}),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required fields');
    });

    it('should handle null values in required fields', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/analytics/forecast'),
        {
          method: 'POST',
          body: JSON.stringify({
            principal: null,
            rate: null,
            termMonths: null,
            category: null,
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('Different Loan Categories', () => {
    beforeEach(() => {
      vi.mocked(requireOrganization).mockResolvedValue({
        user: { id: 'user-1' },
        session: {},
        organizationId: 'org-1',
      } as any);

      vi.mocked(forecastLoan).mockResolvedValue({
        riskScore: 0.3,
        riskRating: 'LOW',
        projectedROI: 0.08,
        confidence: 0.85,
        factors: [],
      } as any);
    });

    it('should handle commercial loans', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/analytics/forecast'),
        {
          method: 'POST',
          body: JSON.stringify({
            principal: 500000,
            rate: 0.06,
            termMonths: 36,
            category: 'commercial',
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle bridge loans', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/analytics/forecast'),
        {
          method: 'POST',
          body: JSON.stringify({
            principal: 300000,
            rate: 0.10,
            termMonths: 12,
            category: 'bridge',
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle construction loans', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/analytics/forecast'),
        {
          method: 'POST',
          body: JSON.stringify({
            principal: 1000000,
            rate: 0.08,
            termMonths: 24,
            category: 'construction',
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle term loans', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/v1/analytics/forecast'),
        {
          method: 'POST',
          body: JSON.stringify({
            principal: 750000,
            rate: 0.05,
            termMonths: 60,
            category: 'term',
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
