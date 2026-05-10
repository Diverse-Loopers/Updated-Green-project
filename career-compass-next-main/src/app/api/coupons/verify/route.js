import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  try {
    const { code, courseId } = await req.json();

    if (!code) {
      return NextResponse.json({ valid: false, message: 'Please enter a coupon code' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !coupon) {
      return NextResponse.json({ valid: false, message: 'Invalid coupon code' });
    }

    // Check course-specific
    if (coupon.course_id && coupon.course_id !== courseId) {
      return NextResponse.json({ valid: false, message: 'This coupon is not valid for this course' });
    }

    // Check validity dates
    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return NextResponse.json({ valid: false, message: 'Coupon is not yet active' });
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return NextResponse.json({ valid: false, message: 'Coupon has expired' });
    }

    // Check usage limit
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json({ valid: false, message: 'Coupon usage limit has been reached' });
    }

    return NextResponse.json({
      valid: true,
      discount_percent: coupon.discount_percent,
      message: `${coupon.discount_percent}% discount applied!`
    });

  } catch (err) {
    console.error('Coupon verify error:', err);
    return NextResponse.json({ valid: false, message: 'Server error' }, { status: 500 });
  }
}
