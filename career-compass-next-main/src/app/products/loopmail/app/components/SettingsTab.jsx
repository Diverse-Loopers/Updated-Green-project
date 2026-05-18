'use client';
import { useState } from 'react';
import { Settings, Plus, Trash2, CheckCircle, X, Wifi, Shield } from 'lucide-react';
import { SMTP_PROVIDERS } from '@/lib/smtp-providers';

export default function SettingsTab({ smtpConfigs, api, toast, loadAll }) {
    const [showAdd, setShowAdd] = useState(false);
    const [editId, setEditId] = useState(null);
    const [testing, setTesting] = useState(null);
    const [provider, setProvider] = useState('custom');
    const [form, setForm] = useState({ label: '', host: '', port: 465, secure: true, username: '', password: '', from_email: '', from_name: '', is_default: false });

    const openAdd = () => {
        setEditId(null); setProvider('custom');
        setForm({ label: '', host: '', port: 465, secure: true, username: '', password: '', from_email: '', from_name: '', is_default: false });
        setShowAdd(true);
    };

    const openEdit = (cfg) => {
        setEditId(cfg.id);
        setProvider(cfg.provider || 'custom');
        setForm({ label: cfg.label, host: cfg.host, port: cfg.port, secure: cfg.secure, username: cfg.username, password: '', from_email: cfg.from_email, from_name: cfg.from_name || '', is_default: cfg.is_default });
        setShowAdd(true);
    };

    const selectProvider = (id) => {
        setProvider(id);
        const p = SMTP_PROVIDERS.find(x => x.id === id);
        if (p) setForm(f => ({ ...f, host: p.host, port: p.port, secure: p.secure }));
    };

    const save = async () => {
        if (!form.host || !form.username || !form.from_email) return toast('Host, username, from_email required', 'error');
        if (!editId && !form.password) return toast('Password required', 'error');
        const body = { ...form, provider, action: editId ? 'update' : 'create' };
        if (editId) body.id = editId;
        if (!body.password) delete body.password;
        const r = await api('smtp', 'POST', body);
        if (r.success) { toast(editId ? 'Updated!' : 'SMTP added!'); setShowAdd(false); loadAll(); }
        else toast(r.error, 'error');
    };

    const remove = async (id) => {
        if (!confirm('Delete this SMTP config?')) return;
        const r = await api('smtp', 'POST', { action: 'delete', id });
        if (r.success) { toast('Deleted'); loadAll(); } else toast(r.error, 'error');
    };

    const test = async (id) => {
        setTesting(id);
        const r = await api('smtp', 'POST', { action: 'test', id });
        setTesting(null);
        if (r.success) { toast('Connection successful!'); loadAll(); }
        else toast(r.error || 'Test failed', 'error');
    };

    return (
        <div>
            <div className="lmd-section-header">
                <h2>SMTP Settings ({smtpConfigs.length})</h2>
                <button className="lmd-btn lmd-btn-primary lmd-btn-sm" onClick={openAdd}><Plus style={{ width: 14, height: 14 }} /> Add SMTP</button>
            </div>

            {smtpConfigs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', background: '#fff', borderRadius: 14, border: '2px dashed #e2e8f0' }}>
                    <Settings style={{ width: 40, height: 40, color: '#94a3b8', margin: '0 auto 12px' }} />
                    <p style={{ color: '#64748b', marginBottom: 16 }}>No SMTP accounts configured yet</p>
                    <button className="lmd-btn lmd-btn-primary" onClick={openAdd}>Add Your First SMTP</button>
                </div>
            ) : (
                <div className="lmd-smtp-grid">
                    {smtpConfigs.map(cfg => {
                        const p = SMTP_PROVIDERS.find(x => x.id === cfg.provider);
                        return (
                            <div key={cfg.id} className={`lmd-smtp-card ${cfg.is_default ? 'default' : ''}`}>
                                <div className="smtp-header">
                                    <div>
                                        <span className="smtp-icon">{p?.icon || '⚙️'}</span>
                                        <span className="smtp-label" style={{ marginLeft: 8 }}>{cfg.label}</span>
                                    </div>
                                    {cfg.is_default && <span className="lmd-badge lmd-badge-sent">Default</span>}
                                </div>
                                <div className="smtp-detail">📧 {cfg.from_email}</div>
                                <div className="smtp-detail">🖥️ {cfg.host}:{cfg.port}</div>
                                <div className="smtp-detail">
                                    {cfg.is_verified ? <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ Verified</span> : <span style={{ color: '#d97706' }}>⚠ Not verified</span>}
                                </div>
                                <div className="smtp-actions">
                                    <button className="lmd-btn lmd-btn-ghost lmd-btn-sm" onClick={() => test(cfg.id)} disabled={testing === cfg.id}>
                                        <Wifi style={{ width: 12, height: 12 }} /> {testing === cfg.id ? 'Testing...' : 'Test'}
                                    </button>
                                    <button className="lmd-btn lmd-btn-ghost lmd-btn-sm" onClick={() => openEdit(cfg)}>Edit</button>
                                    <button className="lmd-btn lmd-btn-danger lmd-btn-sm" onClick={() => remove(cfg.id)}><Trash2 style={{ width: 12, height: 12 }} /></button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showAdd && (
                <div className="lmd-modal-overlay" onClick={() => setShowAdd(false)}>
                    <div className="lmd-modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
                        <div className="lmd-modal-header">
                            <h3>{editId ? 'Edit SMTP' : 'Add SMTP Account'}</h3>
                            <p>Select your provider for auto-configuration</p>
                        </div>
                        <div className="lmd-modal-body">
                            <div className="lmd-provider-selector">
                                {SMTP_PROVIDERS.map(p => (
                                    <div key={p.id} className={`lmd-provider-option ${provider === p.id ? 'selected' : ''}`} onClick={() => selectProvider(p.id)}>
                                        <div className="p-icon">{p.icon}</div>
                                        <div className="p-name">{p.name.split('/')[0].trim()}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="lmd-form-grid">
                                <div><label className="lmd-label">Label</label><input className="lmd-input" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="My Email" /></div>
                                <div><label className="lmd-label">Host</label><input className="lmd-input" value={form.host} onChange={e => setForm({ ...form, host: e.target.value })} /></div>
                                <div><label className="lmd-label">Port</label><input className="lmd-input" type="number" value={form.port} onChange={e => setForm({ ...form, port: Number(e.target.value) })} /></div>
                                <div><label className="lmd-label">Secure (SSL)</label>
                                    <select className="lmd-input" value={form.secure ? 'yes' : 'no'} onChange={e => setForm({ ...form, secure: e.target.value === 'yes' })}>
                                        <option value="yes">Yes (SSL/TLS)</option><option value="no">No (STARTTLS)</option>
                                    </select>
                                </div>
                                <div><label className="lmd-label">Username / Email</label><input className="lmd-input" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} /></div>
                                <div><label className="lmd-label">Password {editId && '(leave blank to keep)'}</label><input className="lmd-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
                                <div><label className="lmd-label">From Email</label><input className="lmd-input" value={form.from_email} onChange={e => setForm({ ...form, from_email: e.target.value })} /></div>
                                <div><label className="lmd-label">From Name</label><input className="lmd-input" value={form.from_name} onChange={e => setForm({ ...form, from_name: e.target.value })} /></div>
                                <div className="lmd-form-full">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                        <input type="checkbox" checked={form.is_default} onChange={e => setForm({ ...form, is_default: e.target.checked })} />
                                        <span className="lmd-label" style={{ margin: 0 }}>Set as default SMTP</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="lmd-modal-footer">
                            <button className="lmd-btn lmd-btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                            <button className="lmd-btn lmd-btn-primary" onClick={save}>{editId ? 'Save Changes' : 'Add SMTP'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
