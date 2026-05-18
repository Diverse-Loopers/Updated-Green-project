'use client';
import { useState, useRef } from 'react';
import { Send, Eye, Search, Paperclip, X, FileText, HelpCircle, Zap, Lock } from 'lucide-react';
import RichEditor from './RichEditor';

export default function ComposeTab({ smtpConfigs, contacts, folders, api, toast, loadAll, onHelp, plan = 'basic', planLimits = {} }) {
    const canRichEdit = planLimits.richEditor !== false;
    const canAttach = planLimits.attachments !== false;
    const canImages = planLimits.imagesInBody !== false;
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [cc, setCc] = useState('');
    const [bcc, setBcc] = useState('');
    const [smtpId, setSmtpId] = useState('');
    const [preview, setPreview] = useState(false);
    const [selected, setSelected] = useState(new Set());
    const [search, setSearch] = useState('');
    const [folderFilter, setFolderFilter] = useState('');
    const [sending, setSending] = useState(false);
    const [progress, setProgress] = useState(null);
    const [attachments, setAttachments] = useState([]);
    const attachRef = useRef();

    const filtered = contacts.filter(c => {
        if (search && !c.email.toLowerCase().includes(search.toLowerCase()) && !(c.name || '').toLowerCase().includes(search.toLowerCase())) return false;
        if (folderFilter === 'unassigned') return !c.folder_id;
        if (folderFilter && c.folder_id !== folderFilter) return false;
        return true;
    });

    const toggleAll = () => {
        if (selected.size === filtered.length) setSelected(new Set());
        else setSelected(new Set(filtered.map(c => c.id)));
    };

    const toggle = (id) => {
        const s = new Set(selected);
        s.has(id) ? s.delete(id) : s.add(id);
        setSelected(s);
    };

    const handleAttach = (e) => {
        const files = Array.from(e.target.files);
        const maxSize = 10 * 1024 * 1024; // 10MB per file
        const valid = files.filter(f => {
            if (f.size > maxSize) { toast(`${f.name} exceeds 10MB limit`, 'error'); return false; }
            return true;
        });
        // Convert to base64 for sending via JSON API
        valid.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setAttachments(prev => [...prev, {
                    filename: file.name,
                    contentType: file.type || 'application/octet-stream',
                    size: file.size,
                    content: ev.target.result.split(',')[1], // base64 data only
                }]);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    };

    const removeAttachment = (idx) => {
        setAttachments(prev => prev.filter((_, i) => i !== idx));
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleSend = async () => {
        if (!subject.trim() || !body.trim()) return toast('Subject and body required', 'error');
        if (selected.size === 0) return toast('Select at least one contact', 'error');
        if (smtpConfigs.length === 0) return toast('Add an SMTP config first', 'error');
        if (!confirm(`Send to ${selected.size} contacts?`)) return;
        setSending(true);
        const payload = {
            contactIds: Array.from(selected), subject, htmlBody: body,
            title: title || subject, cc, bcc, smtpConfigId: smtpId || undefined,
        };
        if (attachments.length > 0) {
            payload.attachments = attachments.map(a => ({
                filename: a.filename,
                content: a.content,
                contentType: a.contentType,
            }));
        }
        const r = await api('send-bulk', 'POST', payload);
        setSending(false);
        if (r.success) {
            toast(`Campaign started! Sending to ${r.totalValid} contacts.`);
            setProgress(r.campaignId);
            setTitle(''); setSubject(''); setBody(''); setCc(''); setBcc('');
            setSelected(new Set()); setAttachments([]);
            setTimeout(() => { loadAll(); setProgress(null); }, 5000);
        } else toast(r.error || 'Send failed', 'error');
    };

    return (
        <div>
            <div className="lmd-section-header">
                <h2>Compose & Send</h2>
                {progress && <span className="lmd-badge lmd-badge-sending">Campaign #{progress} sending...</span>}
            </div>
            <div className="lmd-compose-wrap">
                <div className="lmd-form-grid" style={{ marginBottom: 20 }}>
                    <div>
                        <label className="lmd-label">SMTP Account</label>
                        <select className="lmd-input" value={smtpId} onChange={e => setSmtpId(e.target.value)}>
                            <option value="">Default</option>
                            {smtpConfigs.map(s => <option key={s.id} value={s.id}>{s.label} ({s.from_email})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="lmd-label">Campaign Title</label>
                        <input className="lmd-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="My Campaign" />
                    </div>
                    <div className="lmd-form-full">
                        <label className="lmd-label">Subject Line</label>
                        <input className="lmd-input" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Your email subject..." />
                    </div>
                    <div>
                        <label className="lmd-label">CC (comma separated)</label>
                        <input className="lmd-input" value={cc} onChange={e => setCc(e.target.value)} placeholder="cc@example.com" />
                    </div>
                    <div>
                        <label className="lmd-label">BCC (comma separated)</label>
                        <input className="lmd-input" value={bcc} onChange={e => setBcc(e.target.value)} placeholder="bcc@example.com" />
                    </div>

                    {/* Rich Email Body */}
                    <div className="lmd-form-full">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <label className="lmd-label" style={{ margin: 0 }}>Email Body</label>
                            <button className="lmd-btn lmd-btn-ghost lmd-btn-sm" onClick={() => setPreview(!preview)}>
                                <Eye style={{ width: 12, height: 12 }} /> {preview ? 'Edit' : 'Preview'}
                            </button>
                        </div>

                        {!canRichEdit && (
                            <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #fef3c7, #fff7ed)', border: '1px solid #fde68a', borderRadius: 10, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.78rem' }}>
                                <Lock style={{ width: 16, height: 16, color: '#d97706', flexShrink: 0 }} />
                                <span><strong>Rich text editor, images, and formatting</strong> are available on Premium and Enterprise plans.</span>
                                <a href="/products/loopmail/pricing" style={{ marginLeft: 'auto', padding: '6px 14px', background: '#16a34a', color: '#fff', borderRadius: 8, fontSize: '0.72rem', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>Upgrade →</a>
                            </div>
                        )}

                        {preview ? (
                            <div className="lmd-compose-preview" style={{ minHeight: 200, padding: 20, border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff' }}
                                dangerouslySetInnerHTML={{ __html: body.replace(/\{\{name\}\}/g, 'John').replace(/\{\{email\}\}/g, 'john@example.com') }} />
                        ) : canRichEdit ? (
                            <RichEditor onChange={setBody} initialHtml={body || '<p>Hello {{name}},</p><p>Your email content here...</p>'} />
                        ) : (
                            <textarea className="lmd-input" rows={10} value={body} onChange={e => setBody(e.target.value)}
                                placeholder={'Hello {{name}},\n\nYour email content here...\n\nUse {{name}} and {{email}} as variables.'}
                                style={{ fontFamily: 'monospace', resize: 'vertical' }} />
                        )}
                        <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 4 }}>Use {'{{name}}'} and {'{{email}}'} as template variables.{canRichEdit ? ' Use the toolbar to format text, add images, links, and buttons.' : ''}</p>
                    </div>

                    {/* Attachments — Premium+ only */}
                    {canAttach ? (
                    <div className="lmd-form-full">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <label className="lmd-label" style={{ margin: 0 }}>
                                <Paperclip style={{ width: 14, height: 14, display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                                Attachments ({attachments.length})
                            </label>
                            <button className="lmd-btn lmd-btn-ghost lmd-btn-sm" onClick={() => attachRef.current?.click()}>
                                <Paperclip style={{ width: 12, height: 12 }} /> Add Files
                            </button>
                            <input ref={attachRef} type="file" multiple onChange={handleAttach} style={{ display: 'none' }} />
                        </div>
                        {attachments.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {attachments.map((a, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0',
                                        borderRadius: 10, fontSize: '0.75rem', fontWeight: 600, color: '#475569',
                                    }}>
                                        <FileText style={{ width: 14, height: 14, color: '#16a34a' }} />
                                        <span>{a.filename}</span>
                                        <span style={{ color: '#94a3b8', fontWeight: 400 }}>({formatSize(a.size)})</span>
                                        <button onClick={() => removeAttachment(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                                            <X style={{ width: 14, height: 14, color: '#ef4444' }} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '16px 20px', background: '#f8fafc', border: '1px dashed #e2e8f0', borderRadius: 10, textAlign: 'center', fontSize: '0.78rem', color: '#94a3b8', cursor: 'pointer' }}
                                onClick={() => attachRef.current?.click()}>
                                Click to attach files (PDF, images, docs — max 10MB each)
                            </div>
                        )}
                    </div>
                    ) : (
                    <div className="lmd-form-full">
                        <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg, #fef3c7, #fff7ed)', border: '1px solid #fde68a', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.78rem' }}>
                            <Lock style={{ width: 16, height: 16, color: '#d97706', flexShrink: 0 }} />
                            <span><strong>File attachments</strong> are available on Premium and Enterprise plans.</span>
                            <a href="/products/loopmail/pricing" style={{ marginLeft: 'auto', padding: '6px 14px', background: '#16a34a', color: '#fff', borderRadius: 8, fontSize: '0.72rem', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>Upgrade →</a>
                        </div>
                    </div>
                    )}
                </div>

                <h3 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 12 }}>
                    Select Recipients ({selected.size} selected)
                </h3>
                <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                    <div className="lmd-search-box">
                        <Search style={{ width: 14, height: 14 }} />
                        <input placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="lmd-input" style={{ width: 180 }} value={folderFilter} onChange={e => setFolderFilter(e.target.value)}>
                        <option value="">All Contacts</option>
                        <option value="unassigned">Unassigned</option>
                        {folders.map(f => <option key={f.id} value={f.id}>{f.name} ({f.contact_count})</option>)}
                    </select>
                </div>

                {selected.size > 0 && (
                    <div className="lmd-select-bar">
                        {selected.size} contact(s) selected
                        <button className="lmd-btn lmd-btn-sm lmd-btn-ghost" onClick={() => setSelected(new Set())}>Clear</button>
                    </div>
                )}

                <div className="lmd-table-wrap" style={{ maxHeight: 300, overflowY: 'auto' }}>
                    <table className="lmd-table">
                        <thead><tr>
                            <th><input type="checkbox" className="lmd-checkbox" checked={filtered.length > 0 && selected.size === filtered.length} onChange={toggleAll} /></th>
                            <th>Name</th><th>Email</th><th>Company</th>
                        </tr></thead>
                        <tbody>
                            {filtered.slice(0, 100).map(c => (
                                <tr key={c.id}>
                                    <td><input type="checkbox" className="lmd-checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} /></td>
                                    <td style={{ fontWeight: 600 }}>{c.name || '—'}</td>
                                    <td>{c.email}</td>
                                    <td>{c.company || '—'}</td>
                                </tr>
                            ))}
                            {filtered.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>No contacts found</td></tr>}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: 20, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button className="lmd-btn lmd-btn-primary" onClick={handleSend} disabled={sending}>
                        <Send style={{ width: 14, height: 14 }} /> {sending ? 'Sending...' : `Send to ${selected.size} Contacts`}
                    </button>
                    {attachments.length > 0 && (
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            📎 {attachments.length} attachment{attachments.length > 1 ? 's' : ''} ({formatSize(attachments.reduce((s, a) => s + a.size, 0))} total)
                        </span>
                    )}
                    {onHelp && (
                        <button onClick={onHelp} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', cursor: 'pointer', fontFamily: 'inherit' }}>
                            <HelpCircle style={{ width: 14, height: 14 }} /> Need help composing?
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
