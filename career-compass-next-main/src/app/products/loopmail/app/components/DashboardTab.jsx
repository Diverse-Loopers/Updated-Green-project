'use client';
import { Mail, Users, Send, AlertCircle } from 'lucide-react';

export default function DashboardTab({ campaigns, contacts, smtpConfigs, setTab }) {
    const totalDelivered = campaigns.reduce((s, c) => s + (c.delivered_count || 0), 0);
    const totalFailed = campaigns.reduce((s, c) => s + (c.failed_count || 0), 0);

    const stats = [
        { label: 'Total Contacts', value: contacts.length, icon: <Users style={{ width: 20, height: 20, color: '#16a34a' }} />, bg: '#dcfce7' },
        { label: 'Campaigns', value: campaigns.length, icon: <Send style={{ width: 20, height: 20, color: '#3b82f6' }} />, bg: '#dbeafe' },
        { label: 'Delivered', value: totalDelivered, icon: <Mail style={{ width: 20, height: 20, color: '#10b981' }} />, bg: '#d1fae5' },
        { label: 'Failed', value: totalFailed, icon: <AlertCircle style={{ width: 20, height: 20, color: '#ef4444' }} />, bg: '#fee2e2' },
    ];

    const recent = campaigns.slice(0, 5);
    const statusClass = { sent: 'lmd-badge-sent', sending: 'lmd-badge-sending', failed: 'lmd-badge-failed', draft: 'lmd-badge-draft', paused: 'lmd-badge-paused' };

    return (
        <div>
            <div className="lmd-stats">
                {stats.map(s => (
                    <div key={s.label} className="lmd-stat-card">
                        <div className="lmd-stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                        <div className="label">{s.label}</div>
                        <div className="value">{s.value}</div>
                    </div>
                ))}
            </div>

            <div className="lmd-section-header">
                <h2>Recent Campaigns</h2>
                <button className="lmd-btn lmd-btn-primary" onClick={() => setTab('compose')}>
                    <Mail style={{ width: 14, height: 14 }} /> Compose Email
                </button>
            </div>

            {recent.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: '#fff', borderRadius: 14, border: '2px dashed #e2e8f0' }}>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No campaigns yet. Start by composing your first email!</p>
                    <button className="lmd-btn lmd-btn-primary" style={{ marginTop: 16 }} onClick={() => setTab('compose')}>Create Campaign</button>
                </div>
            ) : (
                <div className="lmd-table-wrap">
                    <table className="lmd-table">
                        <thead><tr><th>Campaign</th><th>Status</th><th>Delivered</th><th>Failed</th><th>Date</th></tr></thead>
                        <tbody>
                            {recent.map(c => (
                                <tr key={c.id}>
                                    <td style={{ fontWeight: 700, color: '#1e293b' }}>{c.title || c.subject}</td>
                                    <td><span className={`lmd-badge ${statusClass[c.status] || 'lmd-badge-draft'}`}>{c.status}</span></td>
                                    <td>{c.delivered_count || 0}</td>
                                    <td>{c.failed_count || 0}</td>
                                    <td>{new Date(c.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 24 }}>
                <button className="lmd-btn lmd-btn-ghost" onClick={() => setTab('contacts')} style={{ justifyContent: 'center' }}>
                    <Users style={{ width: 14, height: 14 }} /> Manage Contacts
                </button>
                <button className="lmd-btn lmd-btn-ghost" onClick={() => setTab('campaigns')} style={{ justifyContent: 'center' }}>
                    <Send style={{ width: 14, height: 14 }} /> View Campaigns
                </button>
                <button className="lmd-btn lmd-btn-ghost" onClick={() => setTab('settings')} style={{ justifyContent: 'center' }}>
                    <Mail style={{ width: 14, height: 14 }} /> SMTP Settings
                </button>
            </div>
        </div>
    );
}
