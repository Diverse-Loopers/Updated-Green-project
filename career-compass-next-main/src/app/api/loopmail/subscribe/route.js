import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PLAN_PRICES = {
    premium: { amount: 150000, currency: 'INR', label: 'LoopMail Premium' }, // amount in paise
};

function getUserFromToken(req) {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return null;
    return auth.slice(7);
}

// POST — Create Razorpay order for subscription
export async function POST(req) {
    try {
        const token = getUserFromToken(req);
        if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
        if (authErr || !user) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

        const { plan, product } = await req.json();
        if (!plan || !PLAN_PRICES[plan]) {
            return NextResponse.json({ success: false, error: 'Invalid plan' }, { status: 400 });
        }

        const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
        const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!razorpayKeyId || !razorpaySecret) {
            return NextResponse.json({ success: false, error: 'Payment gateway not configured' }, { status: 500 });
        }

        const rzp = new Razorpay({ key_id: razorpayKeyId, key_secret: razorpaySecret });

        const order = await rzp.orders.create({
            amount: PLAN_PRICES[plan].amount,
            currency: PLAN_PRICES[plan].currency,
            receipt: `loopmail_${plan}_${user.id.slice(0, 8)}_${Date.now()}`,
            notes: { user_id: user.id, plan, product: product || 'loopmail' }
        });

        return NextResponse.json({
            success: true,
            order,
            razorpayKey: razorpayKeyId,
        });
    } catch (err) {
        console.error('Subscribe error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// PUT — Verify payment and activate subscription
export async function PUT(req) {
    try {
        const token = getUserFromToken(req);
        if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
        if (authErr || !user) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, product } = await req.json();

        // Verify signature
        const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
        const expectedSignature = crypto
            .createHmac('sha256', razorpaySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ success: false, error: 'Invalid payment signature' }, { status: 400 });
        }

        // Calculate renewal date (30 days from now)
        const renewalDate = new Date();
        renewalDate.setDate(renewalDate.getDate() + 30);

        // Upsert subscription
        const { error: subErr } = await supabase
            .from('client_subscriptions')
            .upsert({
                user_id: user.id,
                product_slug: product || 'loopmail',
                plan: plan || 'premium',
                status: 'active',
                payment_id: razorpay_payment_id,
                razorpay_order_id: razorpay_order_id,
                amount_paid: PLAN_PRICES[plan]?.amount || 150000,
                currency: 'INR',
                renewal_date: renewalDate.toISOString(),
                started_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                cancelled_at: null,
            }, { onConflict: 'user_id,product_slug' });

        if (subErr) {
            console.error('Subscription update error:', subErr);
            return NextResponse.json({ success: false, error: 'Failed to activate subscription' }, { status: 500 });
        }

        // Also update client_profiles plan
        await supabase
            .from('client_profiles')
            .update({ plan: plan || 'premium', updated_at: new Date().toISOString() })
            .eq('id', user.id);

        return NextResponse.json({ success: true, message: 'Subscription activated!' });
    } catch (err) {
        console.error('Payment verify error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
