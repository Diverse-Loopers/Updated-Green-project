import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { courseId, userId, userName, userEmail, userPhone, couponCode } = await req.json();

    if (!courseId || !userId) {
      return NextResponse.json({ success: false, error: 'Course and user required' }, { status: 400 });
    }

    // Get course details
    const { data: course } = await supabase
      .from('courses')
      .select('id, title, price')
      .eq('id', courseId)
      .single();

    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
    }

    let finalAmount = course.price || 0;
    let discountAmount = 0;
    let appliedCoupon = null;

    // Apply coupon if provided
    if (couponCode) {
      try {
        const { data: coupon } = await supabase
          .from('coupons')
          .select('*')
          .eq('code', couponCode.toUpperCase().trim())
          .eq('is_active', true)
          .maybeSingle();

        if (!coupon) {
          return NextResponse.json({ success: false, error: 'Invalid or inactive coupon code' }, { status: 400 });
        }

        // Check course-specific coupon
        if (coupon.course_id && coupon.course_id !== courseId) {
          return NextResponse.json({ success: false, error: 'This coupon is not valid for this course' }, { status: 400 });
        }

        // Check date validity
        const now = new Date();
        if (coupon.valid_from && new Date(coupon.valid_from) > now) {
          return NextResponse.json({ success: false, error: 'Coupon is not yet active' }, { status: 400 });
        }
        if (coupon.valid_until && new Date(coupon.valid_until) < now) {
          return NextResponse.json({ success: false, error: 'Coupon has expired' }, { status: 400 });
        }

        // Check usage limit
        if (coupon.max_uses && (coupon.used_count || 0) >= coupon.max_uses) {
          return NextResponse.json({ success: false, error: 'Coupon usage limit has been reached' }, { status: 400 });
        }

        discountAmount = Math.round((finalAmount * coupon.discount_percent) / 100);
        finalAmount = Math.max(0, finalAmount - discountAmount);
        appliedCoupon = coupon.code;
      } catch (couponErr) {
        console.error('Coupon validation error:', couponErr);
        return NextResponse.json({ success: false, error: 'Error validating coupon' }, { status: 500 });
      }
    }

    // If free after discount, auto-enroll
    if (finalAmount <= 0) {
      await supabase.from('enrollments').upsert({
        user_id: userId,
        course_id: courseId,
      }, { onConflict: 'user_id,course_id' });

      try {
        await supabase.from('payments').insert({
          user_id: userId,
          user_name: userName,
          user_email: userEmail,
          user_phone: userPhone,
          course_id: courseId,
          course_title: course.title,
          amount: 0,
          currency: 'INR',
          coupon_code: appliedCoupon,
          discount_amount: discountAmount,
          gateway: 'free',
          transaction_id: 'FREE-' + Date.now(),
          status: 'success',
          paid_at: new Date().toISOString(),
        });
      } catch {}

      // Increment coupon usage for free enrollments
      if (appliedCoupon) {
        try {
          const { data: currentCoupon } = await supabase
            .from('coupons')
            .select('used_count')
            .eq('code', appliedCoupon)
            .single();
          if (currentCoupon) {
            await supabase
              .from('coupons')
              .update({ used_count: (currentCoupon.used_count || 0) + 1 })
              .eq('code', appliedCoupon);
          }
        } catch (e) {
          console.error('Coupon usage increment error (free):', e);
        }
      }

      return NextResponse.json({ success: true, free: true });
    }

    // Get Razorpay credentials — try payment_settings table first, fallback to env
    let keyId = process.env.RAZORPAY_KEY_ID;
    let keySecret = process.env.RAZORPAY_KEY_SECRET;

    try {
      const { data: gatewaySetting } = await supabase
        .from('payment_settings')
        .select('*')
        .eq('is_active', true)
        .eq('gateway_name', 'razorpay')
        .maybeSingle();

      if (gatewaySetting) {
        keyId = gatewaySetting.api_key;
        keySecret = gatewaySetting.api_secret;
      }
    } catch {
      // payment_settings table may not exist — use env vars
    }

    if (!keyId || !keySecret) {
      return NextResponse.json({ 
        success: false, 
        error: 'Payment gateway not configured. Please contact admin.' 
      }, { status: 500 });
    }

    // Create Razorpay order using direct HTTP API (better error handling than SDK)
    const amountInPaise = Math.max(100, Math.round(finalAmount * 100));

    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(keyId + ':' + keySecret).toString('base64'),
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${courseId.substring(0, 8)}_${Date.now()}`,
        notes: {
          courseId,
          userId,
          couponCode: appliedCoupon || '',
        },
      }),
    });

    const rzpData = await rzpRes.json();

    if (!rzpRes.ok) {
      console.error('Razorpay API error:', rzpRes.status, JSON.stringify(rzpData));
      const errMsg = rzpData?.error?.description || rzpData?.error?.reason || `Razorpay error (${rzpRes.status}): Invalid API credentials or configuration`;
      return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
    }

    // Record pending payment
    try {
      await supabase.from('payments').insert({
        user_id: userId,
        user_name: userName,
        user_email: userEmail,
        user_phone: userPhone,
        course_id: courseId,
        course_title: course.title,
        amount: finalAmount,
        currency: 'INR',
        coupon_code: appliedCoupon,
        discount_amount: discountAmount,
        gateway: 'razorpay',
        transaction_id: rzpData.id,
        status: 'pending',
      });
    } catch {}

    return NextResponse.json({
      success: true,
      orderId: rzpData.id,
      amount: finalAmount,
      amountInPaise,
      currency: 'INR',
      keyId,
      courseTitle: course.title,
      discount: discountAmount,
      coupon: appliedCoupon,
    });

  } catch (err) {
    console.error('Create order error:', err?.message || err?.statusMessage || JSON.stringify(err));
    return NextResponse.json({ 
      success: false, 
      error: err?.message || 'Failed to create order. Check server logs.' 
    }, { status: 500 });
  }
}
