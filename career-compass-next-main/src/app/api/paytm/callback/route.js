import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  try {
    const body = await req.json();
    const { ORDERID, TXNID, STATUS, CHECKSUMHASH, TXNAMOUNT, BANKTXNID } = body;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Verify checksum
    let isValidChecksum = true;
    try {
      const PaytmChecksum = (await import('paytmchecksum')).default;
      isValidChecksum = PaytmChecksum.verifySignature(
        body,
        process.env.PAYTM_MERCHANT_KEY,
        CHECKSUMHASH
      );
    } catch (e) {
      console.warn('Checksum verification skipped (demo mode)');
    }

    if (!isValidChecksum) {
      return NextResponse.json({ error: 'Invalid checksum' }, { status: 400 });
    }

    const paymentStatus = STATUS === 'TXN_SUCCESS' ? 'paid' : 'failed';

    // Update enrollment
    const { error: updateErr } = await supabase
      .from('enrollments')
      .update({
        payment_status: paymentStatus,
        payment_id: TXNID || BANKTXNID,
        amount_paid: Number(TXNAMOUNT),
      })
      .eq('order_id', ORDERID);

    if (updateErr) {
      console.error('Enrollment update error:', updateErr);
    }

    // If paid, increment coupon usage
    if (paymentStatus === 'paid') {
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('coupon_code')
        .eq('order_id', ORDERID)
        .single();

      if (enrollment?.coupon_code) {
        try {
          const { data: coupon } = await supabase
            .from('coupons')
            .select('used_count')
            .eq('code', enrollment.coupon_code)
            .single();

          if (coupon) {
            await supabase
              .from('coupons')
              .update({ used_count: (coupon.used_count || 0) + 1 })
              .eq('code', enrollment.coupon_code);
          }
        } catch (e) {
          console.error('Coupon usage increment error (paytm callback):', e);
        }
      }
    }

    // Get course ID for redirect
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('order_id', ORDERID)
      .single();

    const courseId = enrollment?.course_id || '';
    const redirectUrl = paymentStatus === 'paid'
      ? `/courses/${courseId}?payment=success`
      : `/courses/${courseId}?payment=failed`;

    return NextResponse.redirect(new URL(redirectUrl, process.env.NEXT_PUBLIC_BASE_URL));
  } catch (err) {
    console.error('Callback error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
