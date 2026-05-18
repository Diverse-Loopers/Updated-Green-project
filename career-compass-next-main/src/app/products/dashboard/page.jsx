'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
    LayoutDashboard, Mail, BarChart3, Users, Settings, LogOut, Menu, X,
    ArrowRight, Send, FolderOpen, Zap, Shield, FileText, ShoppingCart,
    Briefcase, Globe, ChevronRight, Bell, Search, Plus, ExternalLink, Crown
} from 'lucide-react';
import './dashboard.css';

/* ───── Tool definitions ───── */
const ALL_TOOLS = [
    {
        id: 'loopmail',
        name: 'LoopMail',
        tagline: 'Bulk Email SaaS',
        desc: 'Send bulk emails from your own SMTP. Connect Gmail, GoDaddy, BigRock or any provider. Compose, manage contacts, and track campaigns.',
        icon: '✉️',
        color: '#16a34a',
        href: '/products/loopmail/app',
        pricingHref: '/products/loopmail/pricing',
        status: 'active',
        features: ['SMTP Integration', 'Contact Manager', 'Campaign Analytics', 'CSV Import'],
    },
    {
        id: 'loopcrm',
        name: 'LoopCRM',
        tagline: 'Customer Relationship',
        desc: 'Manage leads, deals, and customer pipelines. Automate follow-ups and track your sales journey.',
        icon: '🤝',
        color: '#3b82f6',
        href: '#',
        status: 'coming-soon',
        features: ['Lead Tracking', 'Deal Pipeline', 'Auto Follow-up', 'Reports'],
    },
    {
        id: 'loopsite',
        name: 'LoopSite',
        tagline: 'Website Builder',
        desc: 'Build stunning business websites with drag-and-drop. No coding needed. SEO-optimized and mobile-responsive.',
        icon: '🌐',
        color: '#8b5cf6',
        href: '#',
        status: 'coming-soon',
        features: ['Drag & Drop', 'SEO Tools', 'Templates', 'Custom Domains'],
    },
    {
        id: 'loopinvoice',
        name: 'LoopInvoice',
        tagline: 'Billing & Invoicing',
        desc: 'Create professional invoices, track payments, and manage your billing cycle effortlessly.',
        icon: '📄',
        color: '#f59e0b',
        href: '#',
        status: 'coming-soon',
        features: ['GST Invoices', 'Payment Tracking', 'Auto Reminders', 'Reports'],
    },
];

const PLAN_BADGE_COLORS = { basic: '#94a3b8', premium: '#16a34a', enterprise: '#6366f1' };
const PLAN_LIMITS = {
    basic: { maxCampaigns: 5, maxContacts: 500 },
    premium: { maxCampaigns: 25, maxContacts: 100000 },
    enterprise: { maxCampaigns: -1, maxContacts: -1 },
};

export default function ClientDashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [subscriptions, setSubscriptions] = useState([]);
    const [campaignCount, setCampaignCount] = useState(0);
    const [contactCount, setContactCount] = useState(0);

    useEffect(() => {
        (async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { window.location.href = '/products/login'; return; }

            // Validate business user
            const isBusiness = session.user?.user_metadata?.is_business === true;
            if (!isBusiness) {
                window.location.href = '/products/login?error=business_only';
                return;
            }

            setUser(session.user);

            // Fetch subscriptions
            try {
                const { data: subs } = await supabase
                    .from('client_subscriptions')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .eq('status', 'active');
                setSubscriptions(subs || []);

                // Fetch usage stats for LoopMail
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const { count: campCount } = await supabase
                    .from('loopmail_campaigns')
                    .select('id', { count: 'exact', head: true })
                    .eq('user_id', session.user.id)
                    .gte('created_at', thirtyDaysAgo.toISOString());
                setCampaignCount(campCount || 0);

                const { count: contCount } = await supabase
                    .from('loopmail_contacts')
                    .select('id', { count: 'exact', head: true })
                    .eq('user_id', session.user.id);
                setContactCount(contCount || 0);
            } catch {
                // Tables might not exist yet
            }

            setLoading(false);
        })();
    }, []);

    if (loading) {
        return (
            <div className="hub-loading">
                <div className="hub-spinner" />
            </div>
        );
    }

    const displayName = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
    const initial = displayName[0]?.toUpperCase() || 'U';

    // Get subscription for each tool — must also be onboarded
    const getToolSub = (toolId) => subscriptions.find(s => s.product_slug === toolId && s.onboarding_status === 'active');
    const getToolPlan = (toolId) => {
        const sub = getToolSub(toolId);
        return sub?.plan || null; // null = not subscribed
    };

    const subscribedTools = ALL_TOOLS.filter(t => t.status === 'active' && getToolSub(t.id));
    const unsubscribedTools = ALL_TOOLS.filter(t => t.status === 'active' && !getToolSub(t.id));
    const comingSoonTools = ALL_TOOLS.filter(t => t.status === 'coming-soon');

    // Current LoopMail plan
    const lmPlan = getToolPlan('loopmail');
    const lmLimits = PLAN_LIMITS[lmPlan] || PLAN_LIMITS.basic;

    return (
        <div className="hub">
            {/* SIDEBAR */}
            <aside className={`hub-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="hub-sidebar-brand">
                    <img src="/Diverse Loopers Black BG (2).png" alt="Logo" />
                    <span>My Dashboard</span>
                </div>
                <nav className="hub-nav">
                    <div className="hub-nav-label">Main</div>
                    <a href="/products/dashboard" className="hub-nav-btn active">
                        <LayoutDashboard /> My Tools
                    </a>
                    <div className="hub-nav-label">Active Products</div>
                    {subscribedTools.map(t => (
                        <a key={t.id} href={t.href} className="hub-nav-btn">
                            <Mail /> {t.name}
                            <span className="badge" style={{ background: (PLAN_BADGE_COLORS[getToolPlan(t.id)] || '#94a3b8') + '20', color: PLAN_BADGE_COLORS[getToolPlan(t.id)] || '#94a3b8' }}>
                                {getToolPlan(t.id)}
                            </span>
                        </a>
                    ))}
                    {unsubscribedTools.map(t => (
                        <a key={t.id} href={t.pricingHref || '#'} className="hub-nav-btn" style={{ opacity: 0.6 }}>
                            <Mail /> {t.name}
                            <span className="badge" style={{ background: '#fef3c720', color: '#92400e', fontSize: '0.6rem' }}>Subscribe</span>
                        </a>
                    ))}
                    <div className="hub-nav-divider" />
                    <a href="/business" className="hub-nav-btn">
                        <Globe /> Business Home
                    </a>
                    <div className="hub-nav-divider" />
                    <button className="hub-nav-btn" style={{ color: '#ef4444' }} onClick={async () => { await supabase.auth.signOut(); window.location.href = '/products/login'; }}>
                        <LogOut /> Sign Out
                    </button>
                </nav>
                <div className="hub-sidebar-footer">
                    <div className="hub-avatar">{initial}</div>
                    <div className="hub-user-info">
                        <div className="name">{displayName}</div>
                        <div className="email">{user?.email}</div>
                    </div>
                </div>
            </aside>

            {/* MAIN */}
            <main className="hub-main">
                {/* Topbar */}
                <header className="hub-topbar">
                    <div>
                        <button className="hub-mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            {sidebarOpen ? <X /> : <Menu />}
                        </button>
                        <h1>Dashboard</h1>
                        <p>Manage all your Diverse Loopers tools in one place</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <a href="/products/loopmail/pricing" className="hub-btn hub-btn-ghost" style={{ fontSize: '0.72rem' }}>
                            <Crown style={{ width: 14, height: 14 }} /> Upgrade Plan
                        </a>
                    </div>
                </header>

                <div className="hub-content">
                    {/* Welcome Banner */}
                    <div className="hub-welcome">
                        <h2>Welcome back, {displayName}! 👋</h2>
                        <p>Here are your subscribed tools and products. Click any tool to open its dedicated dashboard.</p>
                    </div>

                    {/* Quick Stats */}
                    <div className="hub-quick-stats">
                        <div className="hub-quick-stat">
                            <div className="icon-wrap" style={{ background: '#dcfce7' }}>
                                <Zap style={{ width: 20, height: 20, color: '#16a34a' }} />
                            </div>
                            <div className="stat-label">Subscribed Tools</div>
                            <div className="stat-value">{subscribedTools.length}</div>
                            <div className="stat-sub">{unsubscribedTools.length > 0 ? `${unsubscribedTools.length} available to subscribe` : 'All tools active'}</div>
                        </div>
                        <div className="hub-quick-stat">
                            <div className="icon-wrap" style={{ background: (PLAN_BADGE_COLORS[lmPlan] || '#94a3b8') + '18' }}>
                                <Crown style={{ width: 20, height: 20, color: PLAN_BADGE_COLORS[lmPlan] || '#94a3b8' }} />
                            </div>
                            <div className="stat-label">LoopMail Plan</div>
                            <div className="stat-value" style={{ fontSize: '1.2rem', textTransform: 'capitalize', color: PLAN_BADGE_COLORS[lmPlan] || '#94a3b8' }}>{lmPlan || 'Not subscribed'}</div>
                            <div className="stat-sub">{!lmPlan ? 'Subscribe to get started' : lmPlan === 'basic' ? 'Upgrade for more' : lmPlan === 'premium' ? 'Full features' : 'Unlimited access'}</div>
                        </div>
                        <div className="hub-quick-stat">
                            <div className="icon-wrap" style={{ background: '#dbeafe' }}>
                                <Send style={{ width: 20, height: 20, color: '#3b82f6' }} />
                            </div>
                            <div className="stat-label">Campaigns Used</div>
                            <div className="stat-value">{campaignCount}{lmLimits.maxCampaigns !== -1 ? `/${lmLimits.maxCampaigns}` : ''}</div>
                            <div className="stat-sub">{lmLimits.maxCampaigns !== -1 ? `${lmLimits.maxCampaigns - campaignCount} remaining` : 'Unlimited'}</div>
                        </div>
                        <div className="hub-quick-stat">
                            <div className="icon-wrap" style={{ background: '#ede9fe' }}>
                                <Users style={{ width: 20, height: 20, color: '#7c3aed' }} />
                            </div>
                            <div className="stat-label">Contacts Used</div>
                            <div className="stat-value">{contactCount}{lmLimits.maxContacts !== -1 ? `/${lmLimits.maxContacts.toLocaleString()}` : ''}</div>
                            <div className="stat-sub">{lmLimits.maxContacts !== -1 ? `${(lmLimits.maxContacts - contactCount).toLocaleString()} remaining` : 'Unlimited'}</div>
                        </div>
                    </div>

                    {/* Active Tools — only subscribed + onboarded */}
                    {subscribedTools.length > 0 && (
                        <>
                    <div className="hub-section-title">
                        <span>Your Active Tools</span>
                        <span className="count">{subscribedTools.length} subscribed</span>
                    </div>
                    <div className="hub-tools-grid">
                        {subscribedTools.map(tool => {
                            const toolPlan = getToolPlan(tool.id);
                            const badgeColor = PLAN_BADGE_COLORS[toolPlan] || '#94a3b8';
                            return (
                                <a key={tool.id} href={tool.href} className="hub-tool-card" style={{ '--card-accent': tool.color }}>
                                    <div className="hub-tool-card-header">
                                        <div className="hub-tool-icon" style={{ background: `${tool.color}15`, color: tool.color }}>
                                            {tool.icon}
                                        </div>
                                        <span className="hub-tool-badge active" style={{ background: badgeColor + '18', color: badgeColor, borderColor: badgeColor + '30' }}>
                                            {toolPlan.charAt(0).toUpperCase() + toolPlan.slice(1)}
                                        </span>
                                    </div>
                                    <div className="hub-tool-name">{tool.name}</div>
                                    <div className="hub-tool-desc">{tool.desc}</div>
                                    <div className="hub-tool-features">
                                        {tool.features.map(f => <span key={f} className="hub-tool-tag">{f}</span>)}
                                    </div>
                                    {toolPlan === 'basic' && tool.pricingHref && (
                                        <a href={tool.pricingHref} onClick={e => e.stopPropagation()} style={{
                                            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                                            background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8,
                                            fontSize: '0.7rem', fontWeight: 700, color: '#92400e', marginTop: 8,
                                            textDecoration: 'none',
                                        }}>
                                            <Crown style={{ width: 12, height: 12 }} /> Upgrade to Premium for full features
                                        </a>
                                    )}
                                    <div className="hub-tool-cta" style={{ color: tool.color }}>
                                        Open Dashboard <ArrowRight style={{ width: 14, height: 14 }} />
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                    </>
                    )}

                    {/* Unsubscribed Tools — show subscribe CTA */}
                    {unsubscribedTools.length > 0 && (
                        <>
                            <div className="hub-section-title" style={{ marginTop: 12 }}>
                                <span>Available Tools</span>
                                <span className="count" style={{ background: '#dbeafe', color: '#2563eb' }}>{unsubscribedTools.length} available</span>
                            </div>
                            <div className="hub-tools-grid">
                                {unsubscribedTools.map(tool => (
                                    <a key={tool.id} href={tool.pricingHref || '#'} className="hub-tool-card" style={{ '--card-accent': tool.color }}>
                                        <div className="hub-tool-card-header">
                                            <div className="hub-tool-icon" style={{ background: `${tool.color}15`, color: tool.color }}>
                                                {tool.icon}
                                            </div>
                                            <span className="hub-tool-badge coming-soon" style={{ background: '#fef3c720', color: '#92400e', border: '1px solid #fde68a' }}>Not Subscribed</span>
                                        </div>
                                        <div className="hub-tool-name">{tool.name}</div>
                                        <div className="hub-tool-desc">{tool.desc}</div>
                                        <div className="hub-tool-features">
                                            {tool.features.map(f => <span key={f} className="hub-tool-tag">{f}</span>)}
                                        </div>
                                        <div className="hub-tool-cta" style={{ color: '#16a34a' }}>
                                            Subscribe Now <ArrowRight style={{ width: 14, height: 14 }} />
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Coming Soon */}
                    {comingSoonTools.length > 0 && (
                        <>
                            <div className="hub-section-title" style={{ marginTop: 12 }}>
                                <span>Coming Soon</span>
                                <span className="count" style={{ background: '#fef3c7', color: '#d97706' }}>{comingSoonTools.length} upcoming</span>
                            </div>
                            <div className="hub-tools-grid">
                                {comingSoonTools.map(tool => (
                                    <div key={tool.id} className="hub-tool-card disabled" style={{ '--card-accent': tool.color }}>
                                        <div className="hub-tool-card-header">
                                            <div className="hub-tool-icon" style={{ background: `${tool.color}15` }}>
                                                {tool.icon}
                                            </div>
                                            <span className="hub-tool-badge coming-soon">Coming Soon</span>
                                        </div>
                                        <div className="hub-tool-name">{tool.name}</div>
                                        <div className="hub-tool-desc">{tool.desc}</div>
                                        <div className="hub-tool-features">
                                            {tool.features.map(f => <span key={f} className="hub-tool-tag">{f}</span>)}
                                        </div>
                                        <div className="hub-tool-cta" style={{ color: '#94a3b8' }}>
                                            Notify Me <Bell style={{ width: 14, height: 14 }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 45 }} onClick={() => setSidebarOpen(false)} />}
        </div>
    );
}
