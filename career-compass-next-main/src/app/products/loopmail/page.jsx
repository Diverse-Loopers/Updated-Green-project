'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Mail, Users, BarChart3, Shield, Zap, FileText, Send, CheckCircle, Plus, ChevronDown } from 'lucide-react';
import Footer from '@/components/ui/Footer';
import './loopmail.css';

const PROVIDERS = [
    { name: 'Gmail', icon: '📧' },
    { name: 'Outlook', icon: '📨' },
    { name: 'GoDaddy', icon: '🌐' },
    { name: 'BigRock', icon: '🪨' },
    { name: 'Hostinger', icon: '🏠' },
    { name: 'Titan', icon: '⚡' },
    { name: 'Zoho', icon: '📬' },
    { name: 'Custom SMTP', icon: '⚙️' },
];

const FEATURES = [
    { icon: <Mail className="w-6 h-6" />, title: 'Bring Your Own SMTP', desc: 'Connect Gmail, GoDaddy, BigRock, Hostinger, Outlook, or any custom SMTP server. Your emails, your domain, your reputation.', bg: '#dcfce7', color: '#16a34a' },
    { icon: <FileText className="w-6 h-6" />, title: 'Rich HTML Editor', desc: 'Compose beautiful emails with our built-in rich text editor. Bold, italic, lists, links, images — all inline. No coding needed.', bg: '#dbeafe', color: '#2563eb' },
    { icon: <Users className="w-6 h-6" />, title: 'Smart Contact Manager', desc: 'Import from CSV, organize into folders, tag contacts, search & filter. Manage thousands of contacts effortlessly.', bg: '#fef3c7', color: '#d97706' },
    { icon: <Send className="w-6 h-6" />, title: 'Throttled Bulk Sending', desc: 'Smart rate-limiting prevents your account from being flagged. Auto-pause on bounces, batch processing, and resume capability.', bg: '#fce7f3', color: '#db2777' },
    { icon: <BarChart3 className="w-6 h-6" />, title: 'Campaign Analytics', desc: 'Track delivery rates, bounces, and failures per campaign. Drill down into individual recipient status and clean bounced contacts.', bg: '#ede9fe', color: '#7c3aed' },
    { icon: <Shield className="w-6 h-6" />, title: 'Encrypted & Secure', desc: 'Your SMTP credentials are encrypted with AES-256-GCM. We never read your emails. Zero data sharing, full privacy.', bg: '#ffedd5', color: '#ea580c' },
];

const PRICING = [
    {
        name: 'Starter',
        price: 'Free',
        period: 'Forever',
        features: ['100 emails / month', '1 SMTP account', '500 contacts', 'Basic campaign analytics', 'CSV import', 'Email support'],
        cta: 'Get Started Free',
        style: 'outline',
    },
    {
        name: 'Pro',
        price: '₹499',
        period: '/ month',
        features: ['5,000 emails / month', '5 SMTP accounts', 'Unlimited contacts', 'Advanced analytics', 'Priority support', 'Custom templates', 'Folder organization'],
        cta: 'Start Pro Trial',
        style: 'primary',
        popular: true,
    },
    {
        name: 'Enterprise',
        price: '₹1,999',
        period: '/ month',
        features: ['Unlimited emails', 'Unlimited SMTP', 'Unlimited contacts', 'API access', 'Dedicated support', 'White-label option', 'Team collaboration', 'SLA guarantee'],
        cta: 'Contact Sales',
        style: 'outline',
    },
];

const FAQS = [
    { q: 'What is "Bring Your Own SMTP"?', a: 'LoopMail doesn\'t send emails from our servers. You connect your own email provider (Gmail, GoDaddy, BigRock, etc.) and we send through your domain. This means better deliverability and full control over your sender reputation.' },
    { q: 'Is my SMTP password safe?', a: 'Absolutely. All SMTP credentials are encrypted using AES-256-GCM encryption before being stored. We never store passwords in plain text and never have access to read your emails.' },
    { q: 'Will my account get suspended for bulk sending?', a: 'LoopMail uses intelligent throttling — we send emails in small batches with delays between them. If bounces are detected, sending auto-pauses to protect your account. We follow best practices to prevent suspension.' },
    { q: 'Can I use Gmail with LoopMail?', a: 'Yes! You\'ll need to generate an App Password from your Google Account security settings (requires 2FA enabled). LoopMail will guide you through the setup process.' },
    { q: 'How do I import my contacts?', a: 'You can import contacts via CSV file upload, add them manually one by one, or organize them into folders for targeted campaigns.' },
];

export default function LoopMailLanding() {
    const [openFaq, setOpenFaq] = useState(null);

    useEffect(() => {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
        }, { threshold: 0.1 });
        document.querySelectorAll('.lm-fade').forEach(el => obs.observe(el));
        return () => obs.disconnect();
    }, []);

    return (
        <>
        <div className="lm-landing">
            {/* Navigation */}
            <nav className="lm-nav">
                <div className="lm-nav-inner">
                    <a href="/business" className="lm-nav-brand">
                        <img src="/DIVERSE LOOPERS (1) bg.png" alt="Diverse Loopers" />
                        <span>LoopMail</span>
                    </a>
                    <div className="lm-nav-links">
                        <a href="/business">Home</a>
                        <a href="#features">Features</a>
                        <a href="#providers">Providers</a>
                        <a href="#pricing">Pricing</a>
                        <a href="#faq">FAQ</a>
                        <a href="/products/loopmail/pricing" className="lm-nav-cta">Get Started →</a>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="lm-hero">
                <div className="lm-hero-inner">
                    <div>
                        <div className="lm-hero-badge">
                            <Zap className="w-3.5 h-3.5" /> By Diverse Loopers
                        </div>
                        <h1>
                            Send Bulk Emails<br />
                            From <span className="lm-gradient">Your Own</span> Domain.
                        </h1>
                        <p className="lm-hero-desc">
                            Connect your Gmail, GoDaddy, BigRock, or any SMTP provider. Compose beautiful emails, manage contacts, and send at scale — all from one powerful dashboard.
                        </p>
                        <div className="lm-hero-actions">
                            <a href="/products/loopmail/pricing" className="lm-btn-primary">
                                Start for Free <ArrowRight className="w-4 h-4" />
                            </a>
                            <a href="#features" className="lm-btn-secondary">
                                See Features
                            </a>
                        </div>
                    </div>
                    <div className="lm-hero-visual">
                        <div className="lm-hero-mockup">
                            <div className="lm-mockup-dots">
                                <span /><span /><span />
                            </div>
                            <div className="lm-mockup-body">
                                <div className="lm-mockup-row">
                                    <div className="lm-mockup-bar w1" />
                                    <div className="lm-mockup-bar w2" />
                                </div>
                                <div className="lm-mockup-row">
                                    <div className="lm-mockup-bar w3" />
                                    <div className="lm-mockup-bar w4" />
                                </div>
                                <div className="lm-mockup-row">
                                    <div className="lm-mockup-bar w2" />
                                    <div className="lm-mockup-bar w1" />
                                </div>
                                <div className="lm-mockup-stat">
                                    <div className="lm-mockup-stat-item">
                                        <div className="lm-mockup-stat-num">2,847</div>
                                        <div className="lm-mockup-stat-label">Delivered</div>
                                    </div>
                                    <div className="lm-mockup-stat-item">
                                        <div className="lm-mockup-stat-num">98.6%</div>
                                        <div className="lm-mockup-stat-label">Success Rate</div>
                                    </div>
                                    <div className="lm-mockup-stat-item">
                                        <div className="lm-mockup-stat-num">12</div>
                                        <div className="lm-mockup-stat-label">Campaigns</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Providers */}
            <section id="providers" className="lm-providers">
                <div className="lm-providers-inner">
                    <div className="lm-section-label">Multi-Platform Support</div>
                    <h2 className="lm-section-title">Works With Your Email Provider</h2>
                    <p className="lm-section-desc">
                        Connect any SMTP-compatible email service. We auto-configure the settings — just enter your credentials and start sending.
                    </p>
                    <div className="lm-provider-grid">
                        {PROVIDERS.map(p => (
                            <div key={p.name} className="lm-provider-card">
                                <div className="lm-provider-icon">{p.icon}</div>
                                <div className="lm-provider-name">{p.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Visual Showcase */}
            <section style={{ padding: '100px 24px', background: '#fff' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 60 }}>
                        <div className="lm-section-label">See It In Action</div>
                        <h2 className="lm-section-title">A Dashboard Built for Scale</h2>
                        <p className="lm-section-desc">From composing emails to tracking every delivery — here's what your LoopMail dashboard looks like.</p>
                    </div>

                    {/* Main Dashboard Screenshot */}
                    <div className="lm-fade" style={{ marginBottom: 40 }}>
                        <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0' }}>
                            <img src="/images/loopmail/dashboard.png" alt="LoopMail Dashboard Overview" style={{ width: '100%', display: 'block' }} />
                        </div>
                        <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>📊 Dashboard Overview — Track campaigns, contacts, and delivery rates at a glance</p>
                    </div>

                    {/* 2x2 Grid of Screenshots */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
                        {[
                            { src: '/images/loopmail/compose.png', alt: 'Compose Email', label: '✉️ Rich Email Composer — Write HTML emails with live preview' },
                            { src: '/images/loopmail/contacts.png', alt: 'Contact Manager', label: '👥 Contact Manager — Import, organize, and segment your audience' },
                            { src: '/images/loopmail/analytics.png', alt: 'Campaign Analytics', label: '📈 Campaign Analytics — Track delivery, bounces, and success rates' },
                            { src: '/images/loopmail/smtp.png', alt: 'SMTP Settings', label: '⚙️ SMTP Settings — Connect any email provider in seconds' },
                        ].map((img, i) => (
                            <div key={i} className="lm-fade">
                                <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', transition: 'all 0.3s', cursor: 'default' }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 50px rgba(0,0,0,0.12)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)'; }}>
                                    <img src={img.src} alt={img.alt} style={{ width: '100%', display: 'block' }} />
                                </div>
                                <p style={{ textAlign: 'center', marginTop: 12, fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{img.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="lm-features">
                <div className="lm-features-inner">
                    <div style={{ textAlign: 'center', marginBottom: 60 }}>
                        <div className="lm-section-label">Powerful Features</div>
                        <h2 className="lm-section-title">Everything You Need to Send at Scale</h2>
                        <p className="lm-section-desc">
                            From composing rich HTML emails to tracking every delivery — LoopMail gives you enterprise-grade email marketing tools.
                        </p>
                    </div>
                    <div className="lm-features-grid">
                        {FEATURES.map(f => (
                            <div key={f.title} className="lm-feature-card">
                                <div className="lm-feature-icon" style={{ background: f.bg, color: f.color }}>
                                    {f.icon}
                                </div>
                                <div className="lm-feature-title">{f.title}</div>
                                <div className="lm-feature-desc">{f.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="lm-pricing">
                <div className="lm-pricing-inner">
                    <div style={{ textAlign: 'center', marginBottom: 60 }}>
                        <div className="lm-section-label">Simple Pricing</div>
                        <h2 className="lm-section-title">Choose Your Plan</h2>
                        <p className="lm-section-desc">
                            Start free. Upgrade as you grow. No hidden fees, no surprises.
                        </p>
                    </div>
                    <div className="lm-pricing-grid">
                        {PRICING.map(p => (
                            <div key={p.name} className={`lm-price-card ${p.popular ? 'popular' : ''}`}>
                                {p.popular && <div className="lm-price-popular-tag">Most Popular</div>}
                                <div className="lm-price-name">{p.name}</div>
                                <div className="lm-price-amount">{p.price}</div>
                                <div className="lm-price-period">{p.period}</div>
                                <ul className="lm-price-features">
                                    {p.features.map(f => <li key={f}>{f}</li>)}
                                </ul>
                                <a href="/products/loopmail/pricing" className={`lm-price-btn ${p.style}`}>
                                    {p.cta}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="lm-faq">
                <div className="lm-faq-inner">
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <div className="lm-section-label">FAQ</div>
                        <h2 className="lm-section-title">Frequently Asked Questions</h2>
                    </div>
                    {FAQS.map((f, i) => (
                        <details key={i} className="lm-faq-item" open={openFaq === i} onToggle={(e) => setOpenFaq(e.target.open ? i : null)}>
                            <summary>
                                {f.q}
                                <Plus className="w-4 h-4" style={{ transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }} />
                            </summary>
                            <div className="lm-faq-answer">{f.a}</div>
                        </details>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="lm-cta">
                <div className="lm-cta-inner">
                    <h2>Ready to Send Smarter?</h2>
                    <p>Join businesses that trust LoopMail for their email outreach. Start free — no credit card required.</p>
                    <a href="/products/login" className="lm-btn-primary" style={{ display: 'inline-flex', padding: '16px 36px', background: 'linear-gradient(135deg, #16a34a, #059669)', color: '#fff', borderRadius: 12, fontWeight: 700, textDecoration: 'none', gap: 8, alignItems: 'center', boxShadow: '0 4px 30px rgba(22,163,74,0.4)' }}>
                        Get Started for Free <ArrowRight className="w-4 h-4" />
                    </a>
                </div>
            </section>
        </div>

        <Footer />
        </>
    );
}
