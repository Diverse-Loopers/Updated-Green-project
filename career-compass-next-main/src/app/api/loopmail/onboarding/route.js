import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateOrgEmail } from '@/lib/emailValidation';
import { sendOnboardingEmails } from '@/lib/sendOnboardingEmails';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function getUser(req) {
    const auth = req.headers.get('authorization');
    if (!auth) return null;
    const token = auth.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
}

// POST — Submit onboarding form
export async function POST(req) {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    // Verify business user
    if (user.user_metadata?.is_business !== true) {
        return NextResponse.json({ success: false, error: 'Business account required' }, { status: 403 });
    }

    const body = await req.json();
    const {
        plan, full_name, organization, work_email, phone,
        billing_address, country, company_size, industry,
        gst_number, monthly_sending,
    } = body;

    // ── Validate required fields ──
    const missing = [];
    if (!full_name?.trim()) missing.push('Full Name');
    if (!organization?.trim()) missing.push('Organization Name');
    if (!work_email?.trim()) missing.push('Work Email');
    if (!phone?.trim()) missing.push('Phone Number');
    if (!billing_address?.trim()) missing.push('Billing Address');
    if (!country?.trim()) missing.push('Country');
    if (!company_size?.trim()) missing.push('Company Size');
    if (!industry?.trim()) missing.push('Industry');
    if (missing.length > 0) {
        return NextResponse.json({ success: false, error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 });
    }

    // ── Validate email domain ──
    const emailCheck = validateOrgEmail(work_email);
    if (!emailCheck.valid) {
        return NextResponse.json({ success: false, error: emailCheck.error }, { status: 400 });
    }

    // ── Validate plan ──
    if (!['basic', 'premium', 'enterprise'].includes(plan)) {
        return NextResponse.json({ success: false, error: 'Invalid plan selected' }, { status: 400 });
    }

    // ── Check if already has active subscription ──
    const { data: existingSub } = await supabase
        .from('client_subscriptions').select('*')
        .eq('user_id', user.id).eq('product_slug', 'loopmail')
        .eq('status', 'active').eq('onboarding_status', 'active')
        .single();

    if (existingSub) {
        return NextResponse.json({
            success: true,
            already_subscribed: true,
            plan: existingSub.plan,
            redirect: '/products/loopmail/app'
        });
    }

    // ── Update client profile with onboarding data ──
    const profileData = {
        full_name: full_name.trim(),
        company_name: organization.trim(),
        work_email: work_email.trim(),
        phone: phone.trim(),
        billing_address: billing_address.trim(),
        country: country.trim(),
        company_size: company_size.trim(),
        industry: industry.trim(),
        gst_number: (gst_number || '').trim(),
        monthly_sending: (monthly_sending || '').trim(),
    };

    await supabase.from('client_profiles').upsert({
        id: user.id,
        ...profileData,
        is_business_client: true,
    }, { onConflict: 'id' });

    const onboardingData = { ...profileData, submitted_at: new Date().toISOString() };

    // ── BASIC PLAN — activate immediately (free) ──
    if (plan === 'basic') {
        await supabase.from('client_subscriptions').upsert({
            user_id: user.id,
            product_slug: 'loopmail',
            status: 'active',
            plan: 'basic',
            onboarding_status: 'active',
            onboarding_data: onboardingData,
            amount_paid: 0,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,product_slug' });

        // Send welcome + how-to emails (fire-and-forget)
        sendOnboardingEmails({
            accountEmail: user.email,
            workEmail: work_email.trim(),
            data: { ...profileData, plan: 'basic', product: 'LoopMail', transaction_id: 'FREE-' + Date.now() },
        }).catch(err => console.error('Onboarding email error:', err));

        return NextResponse.json({
            success: true,
            plan: 'basic',
            redirect: '/products/loopmail/app',
            message: 'Basic plan activated successfully!'
        });
    }

    // ── PREMIUM PLAN — create Razorpay order ──
    if (plan === 'premium') {
        // Save onboarding data first (pending state)
        await supabase.from('client_subscriptions').upsert({
            user_id: user.id,
            product_slug: 'loopmail',
            status: 'active',
            plan: 'premium',
            onboarding_status: 'pending_payment',
            onboarding_data: onboardingData,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,product_slug' });

        try {
            const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET,
            });

            const order = await razorpay.orders.create({
                amount: 150000, // ₹1500 in paise
                currency: 'INR',
                receipt: `lm_${user.id.substring(0, 8)}_${Date.now()}`,
                notes: { user_id: user.id, plan: 'premium', product: 'loopmail' },
            });

            return NextResponse.json({
                success: true,
                plan: 'premium',
                requires_payment: true,
                order_id: order.id,
                amount: order.amount,
                currency: order.currency,
                key_id: process.env.RAZORPAY_KEY_ID,
                user_email: work_email,
                user_name: full_name,
            });
        } catch (err) {
            return NextResponse.json({ success: false, error: 'Payment gateway error: ' + err.message }, { status: 500 });
        }
    }

    // ── ENTERPRISE PLAN — create inquiry ──
    if (plan === 'enterprise') {
        await supabase.from('enterprise_leads').insert({
            user_id: user.id,
            full_name: full_name.trim(),
            email: work_email.trim(),
            company: organization.trim(),
            phone: phone.trim(),
            message: `Industry: ${industry}, Size: ${company_size}, Monthly: ${monthly_sending || 'N/A'}, GST: ${gst_number || 'N/A'}, Billing: ${billing_address}`,
            product_slug: 'loopmail',
            status: 'new',
        });

        return NextResponse.json({
            success: true,
            plan: 'enterprise',
            inquiry_submitted: true,
            message: 'Our team will contact you within 24 hours to set up your Enterprise plan.'
        });
    }

    return NextResponse.json({ success: false, error: 'Invalid plan' }, { status: 400 });
}

// PUT — Verify premium payment
export async function PUT(req) {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');

    if (expected !== razorpay_signature) {
        return NextResponse.json({ success: false, error: 'Payment verification failed' }, { status: 400 });
    }

    // Activate subscription
    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + 1);

    await supabase.from('client_subscriptions').upsert({
        user_id: user.id,
        product_slug: 'loopmail',
        status: 'active',
        plan: 'premium',
        onboarding_status: 'active',
        payment_id: razorpay_payment_id,
        razorpay_order_id,
        amount_paid: 1500,
        currency: 'INR',
        renewal_date: renewalDate.toISOString(),
        updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,product_slug' });

    // Fetch onboarding data for email
    const { data: subData } = await supabase
        .from('client_subscriptions').select('onboarding_data')
        .eq('user_id', user.id).eq('product_slug', 'loopmail').single();
    const od = subData?.onboarding_data || {};

    // Send welcome + how-to emails (fire-and-forget)
    sendOnboardingEmails({
        accountEmail: user.email,
        workEmail: od.work_email || user.email,
        data: {
            full_name: od.full_name || '', organization: od.company_name || '',
            plan: 'premium', product: 'LoopMail', transaction_id: razorpay_payment_id,
            work_email: od.work_email || '', billing_address: od.billing_address || '',
            industry: od.industry || '', company_size: od.company_size || '',
            country: od.country || '', phone: od.phone || '', gst_number: od.gst_number || '',
        },
    }).catch(err => console.error('Onboarding email error:', err));

    return NextResponse.json({
        success: true,
        plan: 'premium',
        redirect: '/products/loopmail/app',
        message: 'Premium plan activated! Redirecting to LoopMail...'
    });
}
