import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  try {
    const { courseId, couponCode, userId } = await req.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Fetch course
    const { data: course, error: courseErr } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseErr || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    let finalAmount = Number(course.price) || 0;
    let discountApplied = 0;

    // Validate coupon if provided
    if (couponCode) {
      const { data: coupon, error: couponErr } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (couponErr || !coupon) {
        return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 });
      }

      // Check course-specific
      if (coupon.course_id && coupon.course_id !== courseId) {
        return NextResponse.json({ error: 'Coupon not valid for this course' }, { status: 400 });
      }

      // Check expiry
      if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
        return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 });
      }

      // Check usage limit
      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 });
      }

      discountApplied = (finalAmount * coupon.discount_percent) / 100;
      finalAmount = Math.max(0, finalAmount - discountApplied);
    }

    // Generate order ID
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create enrollment record
    await supabase.from('enrollments').upsert({
      user_id: userId,
      course_id: courseId,
      payment_status: finalAmount === 0 ? 'paid' : 'pending',
      order_id: orderId,
      amount_paid: finalAmount,
      coupon_code: couponCode || null,
      discount_applied: discountApplied,
    }, { onConflict: 'user_id,course_id' });

    // If free after discount, mark as paid immediately
    if (finalAmount === 0) {
      if (couponCode) {
        await supabase.rpc('increment_coupon_usage', { coupon_code: couponCode.toUpperCase() });
      }
      return NextResponse.json({
        success: true,
        free: true,
        orderId,
        message: 'Enrolled successfully (free with coupon)!'
      });
    }

    // For Paytm integration — generate transaction token
    // Using staging environment
    const paytmHost = process.env.PAYTM_ENV === 'production'
      ? 'https://securegw.paytm.in'
      : 'https://securegw-stage.paytm.in';

    const paytmParams = {
      body: {
        requestType: 'Payment',
        mid: process.env.PAYTM_MID,
        websiteName: process.env.PAYTM_WEBSITE || 'WEBSTAGING',
        orderId: orderId,
        callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/paytm/callback`,
        txnAmount: {
          value: finalAmount.toFixed(2),
          currency: 'INR',
        },
        userInfo: {
          custId: userId,
        },
      },
    };

    // Generate checksum
    let checksum;
    try {
      const PaytmChecksum = (await import('paytmchecksum')).default;
      checksum = await PaytmChecksum.generateSignature(
        JSON.stringify(paytmParams.body),
        process.env.PAYTM_MERCHANT_KEY
      );
    } catch (e) {
      console.error('Checksum generation failed:', e);
      // In staging/demo mode, return mock response
      return NextResponse.json({
        success: true,
        demo: true,
        orderId,
        amount: finalAmount,
        discount: discountApplied,
        message: 'Demo mode: Payment simulated successfully'
      });
    }

    // Call Paytm initiate transaction API
    try {
      const response = await fetch(
        `${paytmHost}/theia/api/v1/initiateTransaction?mid=${process.env.PAYTM_MID}&orderId=${orderId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...paytmParams,
            head: { signature: checksum },
          }),
        }
      );

      const result = await response.json();

      if (result.body?.resultInfo?.resultStatus === 'S') {
        return NextResponse.json({
          success: true,
          txnToken: result.body.txnToken,
          orderId,
          amount: finalAmount,
          discount: discountApplied,
          mid: process.env.PAYTM_MID,
        });
      } else {
        // Fallback to demo mode
        return NextResponse.json({
          success: true,
          demo: true,
          orderId,
          amount: finalAmount,
          discount: discountApplied,
          message: 'Demo mode: Payment gateway not configured. Payment simulated.'
        });
      }
    } catch (fetchErr) {
      // Paytm not reachable — demo mode
      return NextResponse.json({
        success: true,
        demo: true,
        orderId,
        amount: finalAmount,
        discount: discountApplied,
        message: 'Demo mode: Payment simulated successfully'
      });
    }

  } catch (err) {
    console.error('Payment initiation error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
