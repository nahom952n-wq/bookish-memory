import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPromoCodeValidator } from '@/lib/promo/promoValidator';

export async function POST(req: NextRequest) {
  try {
    const { code, purchaseAmount = 0 } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Promo code is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const promoValidator = getPromoCodeValidator();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate promo code
    const validation = await promoValidator.validatePromoCode(
      code,
      purchaseAmount,
      user?.id
    );

    if (!validation.valid) {
      return NextResponse.json(
        {
          valid: false,
          error: validation.error || 'Invalid promo code',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      code: validation.code?.code,
      discountType: validation.code?.discount_type,
      discountValue: validation.code?.discount_value,
      discount: validation.discount,
      message: `${validation.code?.description || 'Promo applied'}`,
    });
  } catch (error) {
    console.error('[Promo Validate] Error:', error);
    return NextResponse.json(
      { error: 'Failed to validate promo code' },
      { status: 500 }
    );
  }
}
