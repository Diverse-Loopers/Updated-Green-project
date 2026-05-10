import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET: Fetch all payments for sales dashboard
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Compute stats
    const successful = (data || []).filter(p => p.status === 'success');
    const totalRevenue = successful.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalTransactions = successful.length;
    const avgOrderValue = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;
    const couponsUsed = successful.filter(p => p.coupon_code).length;

    // Course Analytics
    const courseMap = {};
    successful.forEach(p => {
      const title = p.course_title || 'Unknown Course';
      if (!courseMap[title]) {
        courseMap[title] = { revenue: 0, enrollments: 0, coupons: 0 };
      }
      courseMap[title].revenue += (p.amount || 0);
      courseMap[title].enrollments += 1;
      if (p.coupon_code) courseMap[title].coupons += 1;
    });

    const courseAnalytics = Object.keys(courseMap).map(title => ({
      course_title: title,
      ...courseMap[title]
    })).sort((a, b) => b.revenue - a.revenue);

    // Last 7 days revenue
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayRevenue = successful
        .filter(p => p.paid_at && p.paid_at.startsWith(dateStr))
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      last7Days.push({
        date: dateStr,
        label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        revenue: dayRevenue,
      });
    }

    return NextResponse.json({
      success: true,
      payments: data || [],
      stats: { totalRevenue, totalTransactions, avgOrderValue, couponsUsed },
      chart: last7Days,
      courseAnalytics,
    });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Manage payment settings
export async function POST(req) {
  try {
    const { action, ...body } = await req.json();

    if (action === 'get-settings') {
      const { data } = await supabase
        .from('payment_settings')
        .select('*')
        .order('created_at', { ascending: false });
      return NextResponse.json({ success: true, settings: data || [] });
    }

    if (action === 'save-settings') {
      const { gateway_name, api_key, api_secret } = body;
      if (!gateway_name || !api_key || !api_secret) {
        return NextResponse.json({ success: false, error: 'All fields required' }, { status: 400 });
      }

      // Upsert: update if exists, insert if not
      const { data: existing } = await supabase
        .from('payment_settings')
        .select('id')
        .eq('gateway_name', gateway_name)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('payment_settings')
          .update({ api_key, api_secret })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('payment_settings')
          .insert({ gateway_name, api_key, api_secret, is_active: false });
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'activate-gateway') {
      const { gateway_name } = body;
      // Deactivate all first
      await supabase.from('payment_settings').update({ is_active: false }).neq('id', '');
      // Activate selected
      await supabase.from('payment_settings').update({ is_active: true }).eq('gateway_name', gateway_name);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete-settings') {
      const { id } = body;
      await supabase.from('payment_settings').delete().eq('id', id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
