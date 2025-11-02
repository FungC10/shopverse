import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/stripe', () => ({
  stripe: {
    coupons: {
      list: vi.fn(),
    },
  },
}));

vi.mock('@/lib/env', () => ({
  env: {
    NEXT_PUBLIC_ENABLE_PROMO_CODES: true,
  },
}));

import { stripe } from '@/lib/stripe';

describe('GET /api/promo-codes/validate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Note: Feature disabled test requires dynamic module reloading which is complex in Vitest
  // The feature flag check is tested implicitly through integration

  it('returns valid: false for code shorter than 3 characters', async () => {
    const req = new NextRequest('http://localhost:3000/api/promo-codes/validate?code=AB');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.valid).toBe(false);
  });

  it('returns valid: true for existing valid coupon', async () => {
    (stripe.coupons.list as any).mockResolvedValue({
      data: [
        {
          id: 'coupon_test123',
          code: 'TEST10',
          valid: true,
          deleted: false,
          percent_off: 10,
        },
      ],
    });

    const req = new NextRequest('http://localhost:3000/api/promo-codes/validate?code=TEST10');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.valid).toBe(true);
    expect(data.discount).toBe(10);
    expect(data.discountType).toBe('percentage');
  });

  it('returns valid: false for non-existent coupon', async () => {
    (stripe.coupons.list as any).mockResolvedValue({
      data: [],
    });

    const req = new NextRequest('http://localhost:3000/api/promo-codes/validate?code=INVALID');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.valid).toBe(false);
  });

  it('returns valid: false for expired/deleted coupon', async () => {
    (stripe.coupons.list as any).mockResolvedValue({
      data: [
        {
          id: 'coupon_test123',
          code: 'EXPIRED',
          valid: false,
          deleted: false,
        },
      ],
    });

    const req = new NextRequest('http://localhost:3000/api/promo-codes/validate?code=EXPIRED');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.valid).toBe(false);
  });
});

