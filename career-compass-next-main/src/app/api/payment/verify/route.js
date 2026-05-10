import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId, userId } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Missing payment details' }, { status: 400 });
    }

    // Get Razorpay secret — try payment_settings first, fallback to env
    let keySecret = process.env.RAZORPAY_KEY_SECRET;

    try {
      const { data: gatewaySetting } = await supabase
        .from('payment_settings')
        .select('api_secret')
        .eq('is_active', true)
        .eq('gateway_name', 'razorpay')
        .maybeSingle();

      if (gatewaySetting) {
        keySecret = gatewaySetting.api_secret;
      }
    } catch {
      // Table may not exist — use env
    }

    if (!keySecret) {
      return NextResponse.json({ success: false, error: 'Gateway config not found' }, { status: 500 });
    }

    // Verify Razorpay signature: HMAC-SHA256(order_id + "|" + payment_id, secret)
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Mark payment as failed
      try {
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('transaction_id', razorpay_order_id);
      } catch {}

      return NextResponse.json({ success: false, error: 'Payment verification failed — signature mismatch' }, { status: 400 });
    }

    // Payment verified — update payment record
    try {
      await supabase
        .from('payments')
        .update({
          status: 'success',
          transaction_id: razorpay_payment_id,
          paid_at: new Date().toISOString(),
        })
        .eq('transaction_id', razorpay_order_id);
    } catch {}

    // Auto-enroll user in the course
    if (courseId && userId) {
      await supabase
        .from('enrollments')
        .upsert({
          user_id: userId,
          course_id: courseId,
        }, { onConflict: 'user_id,course_id' });

      // Increment coupon usage if one was used
      try {
        const { data: payment } = await supabase
          .from('payments')
          .select('coupon_code')
          .eq('transaction_id', razorpay_payment_id)
          .maybeSingle();

        if (payment?.coupon_code) {
          // Fetch current count and increment directly using the correct column
          const { data: coupon } = await supabase
            .from('coupons')
            .select('used_count')
            .eq('code', payment.coupon_code)
            .single();

          if (coupon) {
            await supabase
              .from('coupons')
              .update({ used_count: (coupon.used_count || 0) + 1 })
              .eq('code', payment.coupon_code);
          }
        }
      } catch (e) {
        console.error('Coupon usage increment error:', e);
      }
    }

    return NextResponse.json({ success: true, message: 'Payment verified and enrollment complete' });

  } catch (err) {
    console.error('Payment verify error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
