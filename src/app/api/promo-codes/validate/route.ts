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
    // Check if promotion code exists in Stripe
    // Note: promotionCodes.list() accepts a code parameter, coupons.list() does not
    const promotionCodes = await stripe.promotionCodes.list({ 
      code: code.toUpperCase(), 
      limit: 1,
      active: true,
    });
    
    if (promotionCodes.data.length === 0) {
      return NextResponse.json({ valid: false });
    }

    const promotionCode = promotionCodes.data[0];
    const coupon = promotionCode.coupon;

    // Check if coupon is valid (not expired, not archived)
    const isValid = coupon.valid && !coupon.deleted && promotionCode.active;

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

