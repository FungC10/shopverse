import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { env } from '@/lib/env';

export async function GET(req: NextRequest) {
  // Check if feature is enabled
  if (!env.NEXT_PUBLIC_ENABLE_PROMO_CODES) {
    return NextResponse.json({ valid: false, error: 'Promo codes are not enabled' }, { status: 400 });
  }

  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code || code.length < 3) {
    return NextResponse.json({ valid: false });
  }

  try {
    // Check if coupon exists in Stripe
    const coupons = await stripe.coupons.list({ code: code.toUpperCase(), limit: 1 });
    
    if (coupons.data.length === 0) {
      return NextResponse.json({ valid: false });
    }

    const coupon = coupons.data[0];

    // Check if coupon is valid (not expired, not archived)
    const isValid = coupon.valid && !coupon.deleted;

    return NextResponse.json({
      valid: isValid,
      discount: coupon.percent_off || coupon.amount_off,
      discountType: coupon.percent_off ? 'percentage' : 'fixed',
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}

