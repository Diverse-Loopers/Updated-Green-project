'use client';
import { useState } from 'react';
import { Check, X, Zap, Crown, Building2, ArrowLeft, Star, Mail } from 'lucide-react';
import { PRICING_FEATURES } from '@/lib/planLimits';
import { supabase } from '@/lib/supabase';
import Footer from '@/components/ui/Footer';
import './pricing.css';

export default function LoopMailPricing() {
    const [showEnterprise, setShowEnterprise] = useState(false);
    const [entForm, setEntForm] = useState({ name: '', email: '', company: '', phone: '', message: '' });
    const [entSubmitting, setEntSubmitting] = useState(false);
    const [entSuccess, setEntSuccess] = useState(false);

    // Check if user has an active, onboarded subscription — if yes, go to app
    const checkAndRedirect = async (targetPlan) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user?.user_metadata?.is_business) {
            window.location.href = '/products/login?redirect=/products/loopmail/onboarding?plan=' + targetPlan;
            return;
        }

        // Check existing active subscription
        try {
            const { createClient } = await import('@supabase/supabase-js');
            const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
            const { data: sub } = await supabase.from('client_subscriptions')
                .select('plan, status, onboarding_status')
                .eq('user_id', session.user.id)
                .eq('product_slug', 'loopmail')
                .eq('status', 'active')
                .eq('onboarding_status', 'active')
                .single();

            if (sub) {
                // Already has active subscription — go to app
                window.location.href = '/products/loopmail/app';
                return;
            }
        } catch {}

        // No active subscription — go to onboarding
        window.location.href = '/products/loopmail/onboarding?plan=' + targetPlan;
    };

    const handleGetBasic = () => checkAndRedirect('basic');
    const handleGetPremium = () => checkAndRedirect('premium');
    const handleGetEnterprise = () => checkAndRedirect('enterprise');

    const handleEnterprise = async (e) => {
        e.preventDefault();
        setEntSubmitting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch('/api/loopmail/enterprise-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(session ? { 'Authorization': `Bearer ${session.access_token}` } : {}) },
                body: JSON.stringify(entForm)
            });
            const data = await res.json();
            if (data.success) {
                setEntSuccess(true);
                setTimeout(() => { setShowEnterprise(false); setEntSuccess(false); setEntForm({ name: '', email: '', company: '', phone: '', message: '' }); }, 3000);
            }
        } catch { }
        setEntSubmitting(false);
    };

    const renderCellValue = (val) => {
        if (val === true) return <Check style={{ width: 18, height: 18, color: '#16a34a' }} />;
        if (val === false) return <X style={{ width: 18, height: 18, color: '#cbd5e1' }} />;
        return <span>{val}</span>;
    };

    return (
        <>
            <div className="pricing-page">
                {/* Hero */}
                <div className="pricing-hero">
                    <a href="/products/loopmail" className="pricing-back">
                        <ArrowLeft style={{ width: 16, height: 16 }} /> Back to LoopMail
                    </a>
                    <div className="pricing-hero-badge">
                        <Mail style={{ width: 14, height: 14 }} /> LoopMail Pricing
                    </div>
                    <h1>Choose the Perfect Plan<br /><span className="green">for Your Business</span></h1>
                    <p className="pricing-hero-sub">Start free, upgrade when you grow. No hidden fees, no contracts.</p>
                </div>

                {/* Plan Cards */}
                <div className="pricing-cards">
                    {/* BASIC */}
                    <div className="pricing-card">
                        <div className="pricing-card-icon" style={{ background: '#f1f5f9' }}>
                            <Zap style={{ width: 24, height: 24, color: '#64748b' }} />
                        </div>
                        <h3>Basic</h3>
                        <div className="pricing-card-price">
                            <span className="amount">Free</span>
                        </div>
                        <p className="pricing-card-desc">Get started with email campaigns. Perfect for individuals and small teams.</p>
                        <ul className="pricing-card-features">
                            <li><Check style={{ width: 14, height: 14, color: '#16a34a' }} /> 5 Campaigns / month</li>
                            <li><Check style={{ width: 14, height: 14, color: '#16a34a' }} /> 500 Contacts</li>
                            <li><Check style={{ width: 14, height: 14, color: '#16a34a' }} /> Standard Sending Queue</li>
                            <li><Check style={{ width: 14, height: 14, color: '#16a34a' }} /> Basic Open Analytics</li>
                            <li><X style={{ width: 14, height: 14, color: '#cbd5e1' }} /> No Rich Editor</li>
                            <li><X style={{ width: 14, height: 14, color: '#cbd5e1' }} /> No Attachments</li>
                        </ul>
                        <button className="pricing-card-btn basic" onClick={handleGetBasic}>
                            Get Started Free
                        </button>
                    </div>

                    {/* PREMIUM */}
                    <div className="pricing-card featured">
                        <div className="pricing-card-badge">Most Popular</div>
                        <div className="pricing-card-icon" style={{ background: '#dcfce7' }}>
                            <Crown style={{ width: 24, height: 24, color: '#16a34a' }} />
                        </div>
                        <h3>Premium</h3>
                        <div className="pricing-card-price">
                            <span className="amount">₹1,500</span>
                            <span className="period">/ month</span>
                        </div>
                        <p className="pricing-card-desc">Advanced features for growing businesses that need professional email marketing.</p>
                        <ul className="pricing-card-features">
                            <li><Check style={{ width: 14, height: 14, color: '#16a34a' }} /> 25 Campaigns / month</li>
                            <li><Check style={{ width: 14, height: 14, color: '#16a34a' }} /> 1,00,000 Contacts</li>
                            <li><Check style={{ width: 14, height: 14, color: '#16a34a' }} /> High-Speed Delivery</li>
                            <li><Check style={{ width: 14, height: 14, color: '#16a34a' }} /> Rich Text Editor + Images</li>
                            <li><Check style={{ width: 14, height: 14, color: '#16a34a' }} /> File Attachments</li>
                            <li><Check style={{ width: 14, height: 14, color: '#16a34a' }} /> Advanced Analytics</li>
                            <li><Check style={{ width: 14, height: 14, color: '#16a34a' }} /> SMTP Integration</li>
                            <li><Check style={{ width: 14, height: 14, color: '#16a34a' }} /> Up to 5 Team Members</li>
                        </ul>
                        <button className="pricing-card-btn premium" onClick={handleGetPremium}>
                            Subscribe Now
                        </button>
                    </div>

                    {/* ENTERPRISE */}
                    <div className="pricing-card">
                        <div className="pricing-card-icon" style={{ background: '#ede9fe' }}>
                            <Building2 style={{ width: 24, height: 24, color: '#6366f1' }} />
                        </div>
                        <h3>Enterprise</h3>
                        <div className="pricing-card-price">
                            <span className="amount">Custom</span>
                        </div>
                        <p className="pricing-card-desc">Unlimited scale for large organizations. Dedicated infrastructure and support.</p>
                        <ul className="pricing-card-features">
                            <li><Check style={{ width: 14, height: 14, color: '#16a34a' }} /> Unlimited Campaigns</li>
                            <li><Check style={{ width: 14, height: 14, color: '#16a34a' }} /> Unlimited Contacts</li>
                            <li><Check style={{ width: 14, height: 14, color: '#16a34a' }} /> Priority Dedicated Delivery</li>
                            <li><Check style={{ width: 14, height: 14, color: '#16a34a' }} /> Full White Label</li>
                            <li><Check style={{ width: 14, height: 14, color: '#16a34a' }} /> API Access</li>
                            <li><Check style={{ width: 14, height: 14, color: '#16a34a' }} /> Dedicated IP</li>
                            <li><Check style={{ width: 14, height: 14, color: '#16a34a' }} /> 24×7 Priority Support</li>
                            <li><Check style={{ width: 14, height: 14, color: '#16a34a' }} /> SLA Guarantee</li>
                        </ul>
                        <button className="pricing-card-btn enterprise" onClick={handleGetEnterprise}>
                            Contact Sales
                        </button>
                    </div>
                </div>

                {/* Full Comparison Table */}
                <div className="pricing-comparison">
                    <h2>Full Feature Comparison</h2>
                    <div className="pricing-table-wrap">
                        <table className="pricing-table">
                            <thead>
                                <tr>
                                    <th>Features</th>
                                    <th>Basic</th>
                                    <th className="featured-col">Premium</th>
                                    <th>Enterprise</th>
                                </tr>
                            </thead>
                            <tbody>
                                {PRICING_FEATURES.map((row, i) => (
                                    <tr key={i}>
                                        <td className="feature-name">{row.label}</td>
                                        <td>{renderCellValue(row.basic)}</td>
                                        <td className="featured-col">{renderCellValue(row.premium)}</td>
                                        <td>{renderCellValue(row.enterprise)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FAQ */}
                <div className="pricing-faq">
                    <h2>Frequently Asked Questions</h2>
                    <div className="faq-grid">
                        <div className="faq-item">
                            <h4>Can I upgrade or downgrade anytime?</h4>
                            <p>Yes! You can upgrade from Basic to Premium instantly. Downgrades take effect at the end of your billing cycle.</p>
                        </div>
                        <div className="faq-item">
                            <h4>What payment methods do you accept?</h4>
                            <p>We accept UPI, Credit/Debit Cards, Net Banking, and Wallets via Razorpay secure checkout.</p>
                        </div>
                        <div className="faq-item">
                            <h4>Is there a free trial for Premium?</h4>
                            <p>The Basic plan is free forever. Premium features are available only after subscribing.</p>
                        </div>
                        <div className="faq-item">
                            <h4>What happens when my subscription expires?</h4>
                            <p>Your account downgrades to Basic. All data is preserved but premium features are locked.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enterprise Contact Modal */}
            {showEnterprise && (
                <div className="pricing-modal-overlay" onClick={() => setShowEnterprise(false)}>
                    <div className="pricing-modal" onClick={e => e.stopPropagation()}>
                        {entSuccess ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 8 }}>Thank You!</h3>
                                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Our sales team will reach out within 24 hours.</p>
                            </div>
                        ) : (
                            <>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 4, color: '#0f172a' }}>
                                    <Building2 style={{ width: 20, height: 20, display: 'inline', verticalAlign: 'middle', marginRight: 8, color: '#6366f1' }} />
                                    Enterprise Inquiry
                                </h3>
                                <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 20 }}>Fill in your details and we&apos;ll get back within 24 hours.</p>
                                <form onSubmit={handleEnterprise}>
                                    <input className="pricing-modal-input" placeholder="Full Name *" required value={entForm.name} onChange={e => setEntForm({ ...entForm, name: e.target.value })} />
                                    <input className="pricing-modal-input" type="email" placeholder="Business Email *" required value={entForm.email} onChange={e => setEntForm({ ...entForm, email: e.target.value })} />
                                    <input className="pricing-modal-input" placeholder="Company Name" value={entForm.company} onChange={e => setEntForm({ ...entForm, company: e.target.value })} />
                                    <input className="pricing-modal-input" placeholder="Phone Number" value={entForm.phone} onChange={e => setEntForm({ ...entForm, phone: e.target.value })} />
                                    <textarea className="pricing-modal-input" rows={3} placeholder="Tell us about your requirements..." value={entForm.message} onChange={e => setEntForm({ ...entForm, message: e.target.value })} />
                                    <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                                        <button type="submit" className="pricing-card-btn premium" disabled={entSubmitting} style={{ flex: 1 }}>
                                            {entSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                                        </button>
                                        <button type="button" className="pricing-card-btn basic" onClick={() => setShowEnterprise(false)} style={{ flex: 0.5 }}>Cancel</button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}
