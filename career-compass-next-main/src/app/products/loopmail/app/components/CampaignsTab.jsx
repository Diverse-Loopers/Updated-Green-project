'use client';
import { useState } from 'react';
import { BarChart3, Trash2, X, Send, AlertCircle, Clock, Users } from 'lucide-react';

export default function CampaignsTab({ campaigns, api, toast, loadAll }) {
    const [detail, setDetail] = useState(null);
    const [detailData, setDetailData] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [recipientTab, setRecipientTab] = useState('sent');

    const statusClass = { sent: 'lmd-badge-sent', sending: 'lmd-badge-sending', failed: 'lmd-badge-failed', draft: 'lmd-badge-draft', paused: 'lmd-badge-paused' };

    const viewDetail = async (camp) => {
        setDetail(camp);
        setLoadingDetail(true);
        setRecipientTab('sent');
        const r = await api(`campaigns?id=${camp.id}`);
        if (r.success) setDetailData(r);
        setLoadingDetail(false);
    };

    const deleteCampaign = async (id) => {
        if (!confirm('Delete this campaign?')) return;
        const r = await api('campaigns', 'POST', { action: 'delete', id });
        if (r.success) { toast('Campaign deleted'); setDetail(null); setDetailData(null); loadAll(); }
        else toast(r.error, 'error');
    };

    const deleteBounced = async () => {
        if (!detailData?.recipients?.failed?.length) return;
        const emails = detailData.recipients.failed.map(r => r.email);
        if (!confirm(`Remove ${emails.length} bounced emails from your contacts?`)) return;
        const r = await api('campaigns', 'POST', { action: 'delete-bounced', emails });
        if (r.success) { toast(`Removed ${r.deleted} bounced contacts`); loadAll(); }
        else toast(r.error, 'error');
    };

    return (
        <div>
            <div className="lmd-section-header"><h2>Campaign History ({campaigns.length})</h2></div>

            {campaigns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', background: '#fff', borderRadius: 14, border: '2px dashed #e2e8f0' }}>
                    <BarChart3 style={{ width: 40, height: 40, color: '#94a3b8', margin: '0 auto 12px' }} />
                    <p style={{ color: '#64748b' }}>No campaigns yet</p>
                </div>
            ) : (
                <div className="lmd-campaigns-grid">
                    {campaigns.map(c => (
                        <div key={c.id} className="lmd-campaign-card" onClick={() => viewDetail(c)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                <h4>{c.title || c.subject}</h4>
                                <span className={`lmd-badge ${statusClass[c.status] || ''}`}>{c.status}</span>
                            </div>
                            <div className="meta">{new Date(c.created_at).toLocaleString()} · via {c.sent_by || '—'}</div>
                            <div className="stats-row">
                                <span className="stat-pill" style={{ color: '#16a34a' }}>✓ {c.delivered_count || 0}</span>
                                <span className="stat-pill" style={{ color: '#ef4444' }}>✗ {c.failed_count || 0}</span>
                                <span className="stat-pill">👥 {c.recipient_count || 0}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Campaign Detail Modal */}
            {detail && (
                <div className="lmd-modal-overlay" onClick={() => { setDetail(null); setDetailData(null); }}>
                    <div className="lmd-modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
                        <div className="lmd-modal-header">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3>{detail.title || detail.subject}</h3>
                                    <p>{new Date(detail.created_at).toLocaleString()}</p>
                                </div>
                                <button onClick={() => { setDetail(null); setDetailData(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X style={{ width: 18, height: 18 }} /></button>
                            </div>
                        </div>
                        <div className="lmd-modal-body">
                            {loadingDetail ? <p style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>Loading...</p> : detailData && (
                                <>
                                    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                                        {['sent', 'failed', 'pending'].map(tab => (
                                            <button key={tab} className={`lmd-btn lmd-btn-sm ${recipientTab === tab ? 'lmd-btn-primary' : 'lmd-btn-ghost'}`}
                                                onClick={() => setRecipientTab(tab)}>
                                                {tab === 'sent' && <Send style={{ width: 12, height: 12 }} />}
                                                {tab === 'failed' && <AlertCircle style={{ width: 12, height: 12 }} />}
                                                {tab === 'pending' && <Clock style={{ width: 12, height: 12 }} />}
                                                {tab} ({detailData.totals?.[tab] || 0})
                                            </button>
                                        ))}
                                    </div>
                                    <div className="lmd-table-wrap" style={{ maxHeight: 250, overflowY: 'auto' }}>
                                        <table className="lmd-table">
                                            <thead><tr><th>Email</th><th>Status</th>{recipientTab === 'failed' && <th>Error</th>}{recipientTab === 'sent' && <th>Sent At</th>}</tr></thead>
                                            <tbody>
                                                {(detailData.recipients?.[recipientTab] || []).map((r, i) => (
                                                    <tr key={i}>
                                                        <td>{r.email}</td>
                                                        <td><span className={`lmd-badge ${statusClass[r.status] || ''}`}>{r.status}</span></td>
                                                        {recipientTab === 'failed' && <td style={{ fontSize: '0.72rem', color: '#ef4444' }}>{r.error_message || '—'}</td>}
                                                        {recipientTab === 'sent' && <td style={{ fontSize: '0.72rem' }}>{r.sent_at ? new Date(r.sent_at).toLocaleTimeString() : '—'}</td>}
                                                    </tr>
                                                ))}
                                                {(detailData.recipients?.[recipientTab] || []).length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', padding: 16, color: '#94a3b8' }}>None</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="lmd-modal-footer">
                            {recipientTab === 'failed' && detailData?.recipients?.failed?.length > 0 && (
                                <button className="lmd-btn lmd-btn-ghost lmd-btn-sm" onClick={deleteBounced}>
                                    <Users style={{ width: 12, height: 12 }} /> Remove Bounced from Contacts
                                </button>
                            )}
                            <button className="lmd-btn lmd-btn-danger lmd-btn-sm" onClick={() => deleteCampaign(detail.id)}>
                                <Trash2 style={{ width: 12, height: 12 }} /> Delete Campaign
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
