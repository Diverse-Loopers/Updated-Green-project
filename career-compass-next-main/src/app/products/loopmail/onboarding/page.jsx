'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { validateOrgEmail } from '@/lib/emailValidation';
import './onboarding.css';

const PLAN_INFO = {
    basic: { label: 'Basic', price: 'Free', priceLabel: 'Forever free' },
    premium: { label: 'Premium', price: '₹1,500/mo', priceLabel: 'Billed monthly' },
    enterprise: { label: 'Enterprise', price: 'Custom', priceLabel: 'Contact sales' },
};

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
const INDUSTRIES = [
    'Technology', 'E-commerce', 'Education', 'Healthcare', 'Finance & Banking',
    'Real Estate', 'Manufacturing', 'Marketing & Advertising', 'Consulting',
    'Media & Entertainment', 'Non-profit', 'Government', 'Legal', 'Other',
];
const MONTHLY_SENDING = [
    'Under 1,000 emails', '1,000 - 5,000 emails', '5,000 - 25,000 emails',
    '25,000 - 100,000 emails', '100,000+ emails',
];

export default function OnboardingPage() {
    return (
        <Suspense fallback={<div className="ob-page"><div style={{ textAlign: 'center', padding: '100px 0', color: '#64748b' }}>Loading...</div></div>}>
            <OnboardingContent />
        </Suspense>
    );
}

function OnboardingContent() {
    const searchParams = useSearchParams();
    const [plan, setPlan] = useState(searchParams.get('plan') || 'basic');
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [session, setSession] = useState(null);
    const [result, setResult] = useState(null); // { type: 'success'|'pending'|'error', title, message }
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');

    // Form fields
    const [form, setForm] = useState({
        full_name: '', organization: '', work_email: '', phone: '',
        billing_address: '', country: 'India', company_size: '',
        industry: '', gst_number: '', monthly_sending: '',
    });

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session: s } }) => {
            if (!s || s.user?.user_metadata?.is_business !== true) {
                window.location.href = '/products/login?redirect=/products/loopmail/onboarding?plan=' + plan;
                return;
            }
            setSession(s);
            // Pre-fill from user metadata
            const meta = s.user.user_metadata || {};
            setForm(f => ({
                ...f,
                full_name: meta.username || meta.full_name || '',
                organization: meta.company || '',
                work_email: s.user.email || '',
            }));
            setChecking(false);
        });
    }, [plan]);

    const updateField = (key, value) => {
        setForm(f => ({ ...f, [key]: value }));
        if (key === 'work_email') {
            const check = validateOrgEmail(value);
            setEmailError(check.valid ? '' : check.error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Frontend email validation
        const emailCheck = validateOrgEmail(form.work_email);
        if (!emailCheck.valid) {
            setEmailError(emailCheck.error);
            return;
        }

        setLoading(true);
        try {
            const token = session?.access_token;
            const res = await fetch('/api/loopmail/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ ...form, plan }),
            });
            const data = await res.json();

            if (!data.success) {
                setError(data.error || 'Something went wrong');
                setLoading(false);
                return;
            }

            // Already subscribed
            if (data.already_subscribed) {
                window.location.href = data.redirect;
                return;
            }

            // Basic — activated immediately
            if (data.plan === 'basic' && data.redirect) {
                setResult({ type: 'success', title: 'Welcome to LoopMail!', message: data.message, redirect: data.redirect });
                setLoading(false);
                return;
            }

            // Premium — open Razorpay
            if (data.requires_payment) {
                openRazorpay(data);
                return;
            }

            // Enterprise — inquiry submitted
            if (data.inquiry_submitted) {
                setResult({ type: 'pending', title: 'Enterprise Inquiry Submitted', message: data.message });
                setLoading(false);
                return;
            }
        } catch (err) {
            setError('Network error. Please try again.');
            setLoading(false);
        }
    };

    const openRazorpay = (data) => {
        if (typeof window === 'undefined' || !window.Razorpay) {
            // Load Razorpay script
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => launchRazorpay(data);
            document.body.appendChild(script);
        } else {
            launchRazorpay(data);
        }
    };

    const launchRazorpay = (data) => {
        const options = {
            key: data.key_id,
            amount: data.amount,
            currency: data.currency,
            name: 'Diverse Loopers',
            description: 'LoopMail Premium Plan',
            order_id: data.order_id,
            prefill: { email: data.user_email, name: data.user_name },
            theme: { color: '#16a34a' },
            handler: async (response) => {
                // Verify payment
                const verifyRes = await fetch('/api/loopmail/onboarding', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
                    body: JSON.stringify(response),
                });
                const verifyData = await verifyRes.json();
                if (verifyData.success) {
                    setResult({ type: 'success', title: 'Premium Plan Activated!', message: verifyData.message, redirect: verifyData.redirect });
                } else {
                    setResult({ type: 'error', title: 'Payment Verification Failed', message: verifyData.error });
                }
                setLoading(false);
            },
            modal: {
                ondismiss: () => {
                    setError('Payment cancelled. Please try again.');
                    setLoading(false);
                },
            },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    if (checking) {
        return (
            <div className="ob-page">
                <div style={{ textAlign: 'center', padding: '100px 0', color: '#64748b' }}>
                    <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
                    Checking your account...
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    // Show result screen
    if (result) {
        return (
            <div className="ob-page">
                <div className="ob-card" style={{ maxWidth: 500 }}>
                    <div className="ob-result">
                        <div className={`ob-result-icon ${result.type}`}>
                            {result.type === 'success' ? '✓' : result.type === 'pending' ? '⏳' : '✕'}
                        </div>
                        <h2>{result.title}</h2>
                        <p>{result.message}</p>
                        {result.redirect && (
                            <a href={result.redirect}>Open LoopMail →</a>
                        )}
                        {result.type === 'pending' && (
                            <a href="/products/loopmail/pricing">Back to Pricing</a>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="ob-page">
            <a href="/products/loopmail/pricing" className="ob-back">← Back to Pricing</a>

            <div className="ob-header">
                <div className="ob-badge">🚀 LoopMail Onboarding</div>
                <h1 className="ob-title">Complete Your Setup</h1>
                <p className="ob-subtitle">Fill in your business details to activate your LoopMail plan</p>
            </div>

            {/* Plan Selector */}
            <div className="ob-plan-strip">
                {Object.entries(PLAN_INFO).map(([key, info]) => (
                    <button
                        key={key}
                        className={`ob-plan-chip ${plan === key ? 'active' : ''}`}
                        onClick={() => setPlan(key)}
                        type="button"
                    >
                        {info.label}
                        <span className="chip-price">{info.price}</span>
                    </button>
                ))}
            </div>

            <div className="ob-card">
                <div className="ob-card-header">
                    <div className="ob-card-icon">📋</div>
                    <div>
                        <h2>Business Information</h2>
                        <p>We need this to set up your account and generate invoices</p>
                    </div>
                </div>

                <form className="ob-form" onSubmit={handleSubmit}>
                    {error && <div className="ob-error-bar">⚠️ {error}</div>}

                    <div className="ob-form-grid">
                        <div className="ob-field">
                            <label>Full Name <span className="required">*</span></label>
                            <input type="text" value={form.full_name} onChange={e => updateField('full_name', e.target.value)} placeholder="John Doe" required />
                        </div>
                        <div className="ob-field">
                            <label>Organization Name <span className="required">*</span></label>
                            <input type="text" value={form.organization} onChange={e => updateField('organization', e.target.value)} placeholder="Acme Corp" required />
                        </div>
                        <div className="ob-field">
                            <label>Official Work Email <span className="required">*</span></label>
                            <input type="email" value={form.work_email} onChange={e => updateField('work_email', e.target.value)} placeholder="you@company.com" required />
                            {emailError && <div className="ob-email-warn">⚠️ {emailError}</div>}
                        </div>
                        <div className="ob-field">
                            <label>Phone Number <span className="required">*</span></label>
                            <input type="tel" value={form.phone} onChange={e => updateField('phone', e.target.value)} placeholder="+91 98765 43210" required />
                        </div>
                        <div className="ob-field full">
                            <label>Billing Address <span className="required">*</span></label>
                            <textarea value={form.billing_address} onChange={e => updateField('billing_address', e.target.value)} placeholder="Full billing address including city, state, and PIN code" required />
                        </div>
                        <div className="ob-field">
                            <label>Country <span className="required">*</span></label>
                            <select value={form.country} onChange={e => updateField('country', e.target.value)} required>
                                <option value="India">India</option>
                                <option value="United States">United States</option>
                                <option value="United Kingdom">United Kingdom</option>
                                <option value="UAE">UAE</option>
                                <option value="Singapore">Singapore</option>
                                <option value="Australia">Australia</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="ob-field">
                            <label>Company Size <span className="required">*</span></label>
                            <select value={form.company_size} onChange={e => updateField('company_size', e.target.value)} required>
                                <option value="">Select size</option>
                                {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                            </select>
                        </div>
                        <div className="ob-field">
                            <label>Industry <span className="required">*</span></label>
                            <select value={form.industry} onChange={e => updateField('industry', e.target.value)} required>
                                <option value="">Select industry</option>
                                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                            </select>
                        </div>
                        <div className="ob-field">
                            <label>GST Number <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span></label>
                            <input type="text" value={form.gst_number} onChange={e => updateField('gst_number', e.target.value)} placeholder="22AAAAA0000A1Z5" />
                        </div>
                        <div className="ob-field full">
                            <label>Monthly Sending Requirement</label>
                            <select value={form.monthly_sending} onChange={e => updateField('monthly_sending', e.target.value)}>
                                <option value="">Select volume</option>
                                {MONTHLY_SENDING.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="ob-actions">
                        <button type="button" className="ob-btn-back" onClick={() => window.history.back()}>Cancel</button>
                        <button type="submit" className="ob-btn-submit" disabled={loading || !!emailError}>
                            {loading ? 'Processing...' : (
                                plan === 'basic' ? 'Activate Free Plan →' :
                                plan === 'premium' ? 'Proceed to Payment →' :
                                'Submit Enterprise Inquiry →'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
