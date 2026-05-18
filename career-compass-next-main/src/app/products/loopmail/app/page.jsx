'use client';

import { useState } from 'react';
import { LayoutDashboard, Mail, Users, BarChart3, Settings, LogOut, Menu, X, ArrowLeft, HelpCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLoopMail } from './useLoopMail';
import DashboardTab from './components/DashboardTab';
import ComposeTab from './components/ComposeTab';
import ContactsTab from './components/ContactsTab';
import CampaignsTab from './components/CampaignsTab';
import SettingsTab from './components/SettingsTab';
import HelpTab from './components/HelpTab';
import './loopmail-app.css';

const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'compose', label: 'Compose', icon: Mail },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'campaigns', label: 'Campaigns', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle },
];

const TAB_META = {
    dashboard: { title: 'Dashboard', sub: 'Overview of your email operations' },
    compose: { title: 'Compose & Send', sub: 'Create and send bulk email campaigns' },
    contacts: { title: 'Contacts', sub: 'Manage your email contacts and lists' },
    campaigns: { title: 'Campaigns', sub: 'View campaign history and analytics' },
    settings: { title: 'SMTP Settings', sub: 'Configure your email server connections' },
    help: { title: 'Help & Documentation', sub: 'Learn how to use LoopMail effectively' },
};

export default function LoopMailApp() {
    const [tab, setTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const lm = useLoopMail();
    const planBadgeColors = { basic: '#94a3b8', premium: '#16a34a', enterprise: '#6366f1' };

    if (lm.loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc' }}>
                <div style={{ width: 40, height: 40, border: '4px solid #e2e8f0', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const displayName = lm.user?.user_metadata?.username || lm.user?.email?.split('@')[0] || 'User';
    const initial = displayName[0]?.toUpperCase() || 'U';
    const meta = TAB_META[tab];

    return (
        <div className="lmd">
            {/* Sidebar */}
            <aside className={`lmd-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="lmd-sidebar-logo">
                    <img src="/Diverse Loopers Black BG (2).png" alt="Logo" />
                    <span>LoopMail</span>
                </div>
                <nav className="lmd-nav">
                    <a href="/products/dashboard" className="lmd-nav-btn" style={{ marginBottom: 8, fontSize: '0.72rem' }}>
                        <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Hub
                    </a>
                    {TABS.map(t => (
                        <button key={t.id} className={`lmd-nav-btn ${tab === t.id ? 'active' : ''}`}
                            onClick={() => { setTab(t.id); setSidebarOpen(false); }}>
                            <t.icon /> {t.label}
                        </button>
                    ))}
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '12px 0' }} />
                    <button className="lmd-nav-btn logout" onClick={async () => { await supabase.auth.signOut(); window.location.href = '/products/login'; }}>
                        <LogOut /> Sign Out
                    </button>
                </nav>
                <div className="lmd-sidebar-profile">
                    <div className="lmd-sidebar-avatar">{initial}</div>
                    <div className="lmd-sidebar-info">
                        <div className="name">{displayName}</div>
                        <div className="role">{lm.user?.email}</div>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <main className="lmd-main">
                <header className="lmd-topbar">
                    <div>
                        <button className="lmd-mobile-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            {sidebarOpen ? <X /> : <Menu />}
                        </button>
                        <h1>{meta.title}</h1>
                        <p>{meta.sub}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ padding: '4px 14px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, background: (planBadgeColors[lm.plan] || '#94a3b8') + '18', color: planBadgeColors[lm.plan] || '#94a3b8', border: `1px solid ${(planBadgeColors[lm.plan] || '#94a3b8')}30` }}>
                            {lm.plan} Plan
                        </span>
                    </div>
                </header>

                <div className="lmd-content">
                    {tab === 'dashboard' && <DashboardTab campaigns={lm.campaigns} contacts={lm.contacts} smtpConfigs={lm.smtpConfigs} setTab={setTab} plan={lm.plan} planLimits={lm.planLimits} />}
                    {tab === 'compose' && <ComposeTab smtpConfigs={lm.smtpConfigs} contacts={lm.contacts} folders={lm.folders} api={lm.api} toast={lm.toast} loadAll={lm.loadAll} onHelp={() => setTab('help')} plan={lm.plan} planLimits={lm.planLimits} />}
                    {tab === 'contacts' && <ContactsTab contacts={lm.contacts} folders={lm.folders} api={lm.api} toast={lm.toast} loadAll={lm.loadAll} loadContacts={lm.loadContacts} plan={lm.plan} planLimits={lm.planLimits} />}
                    {tab === 'campaigns' && <CampaignsTab campaigns={lm.campaigns} api={lm.api} toast={lm.toast} loadAll={lm.loadAll} plan={lm.plan} />}
                    {tab === 'settings' && <SettingsTab smtpConfigs={lm.smtpConfigs} api={lm.api} toast={lm.toast} loadAll={lm.loadAll} plan={lm.plan} planLimits={lm.planLimits} />}
                    {tab === 'help' && <HelpTab />}
                </div>
            </main>

            {/* Toasts */}
            {lm.toasts.length > 0 && (
                <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {lm.toasts.map(t => (
                        <div key={t.id} style={{
                            padding: '14px 20px', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600,
                            background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                            borderLeft: `4px solid ${t.type === 'error' ? '#ef4444' : '#16a34a'}`,
                            animation: 'slideIn 0.3s ease', maxWidth: 380,
                        }}>
                            {t.msg}
                        </div>
                    ))}
                    <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }`}</style>
                </div>
            )}

            {/* Mobile overlay */}
            {sidebarOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 45 }} onClick={() => setSidebarOpen(false)} />}
        </div>
    );
}
