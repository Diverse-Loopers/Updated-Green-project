'use client';
import { useState, useRef } from 'react';
import { Users, Search, Plus, Upload, Trash2, FolderOpen, MoreHorizontal, X, FileText } from 'lucide-react';

export default function ContactsTab({ contacts, folders, api, toast, loadAll, loadContacts }) {
    const [search, setSearch] = useState('');
    const [folderFilter, setFolderFilter] = useState('');
    const [selected, setSelected] = useState(new Set());
    const [showAdd, setShowAdd] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [showFolder, setShowFolder] = useState(false);
    const [form, setForm] = useState({ email: '', name: '', phone: '', company: '', tags: '', folder_id: '' });
    const [csvData, setCsvData] = useState([]);
    const [folderName, setFolderName] = useState('');
    const fileRef = useRef();

    const handleSearch = (v) => { setSearch(v); loadContacts(v, folderFilter); };
    const handleFolder = (v) => { setFolderFilter(v); loadContacts(search, v); };

    const filtered = contacts;
    const toggleAll = () => selected.size === filtered.length ? setSelected(new Set()) : setSelected(new Set(filtered.map(c => c.id)));
    const toggle = (id) => { const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s); };

    const addContact = async () => {
        if (!form.email) return toast('Email required', 'error');
        const r = await api('contacts', 'POST', { action: 'create', ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [] });
        if (r.success) { toast('Contact added!'); setShowAdd(false); setForm({ email: '', name: '', phone: '', company: '', tags: '', folder_id: '' }); loadAll(); }
        else toast(r.error, 'error');
    };

    const bulkDelete = async () => {
        if (!confirm(`Delete ${selected.size} contacts?`)) return;
        const r = await api('contacts', 'POST', { action: 'bulk-delete', ids: Array.from(selected) });
        if (r.success) { toast(`Deleted ${r.deleted} contacts`); setSelected(new Set()); loadAll(); }
        else toast(r.error, 'error');
    };

    const moveToFolder = async (folderId) => {
        const r = await api('contacts', 'POST', { action: 'move', ids: Array.from(selected), folder_id: folderId || null });
        if (r.success) { toast('Contacts moved!'); setSelected(new Set()); loadAll(); }
        else toast(r.error, 'error');
    };

    const parseCSV = (text) => {
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) return [];
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        return lines.slice(1).map(line => {
            const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const obj = {};
            headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
            return { email: obj.email || '', name: obj.name || '', phone: obj.phone || '', company: obj.company || '' };
        }).filter(r => r.email);
    };

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setCsvData(parseCSV(ev.target.result));
        reader.readAsText(file);
    };

    const importCSV = async () => {
        if (!csvData.length) return;
        const r = await api('contacts', 'POST', { action: 'bulk-import', contacts: csvData, folder_id: folderFilter || null });
        if (r.success) { toast(`Imported ${r.imported} contacts!`); setShowImport(false); setCsvData([]); loadAll(); }
        else toast(r.error, 'error');
    };

    const createFolder = async () => {
        if (!folderName.trim()) return;
        const r = await api('folders', 'POST', { action: 'create', name: folderName });
        if (r.success) { toast('Folder created!'); setFolderName(''); setShowFolder(false); loadAll(); }
        else toast(r.error, 'error');
    };

    const deleteFolder = async (id) => {
        if (!confirm('Delete this folder? Contacts will be unassigned.')) return;
        const r = await api('folders', 'POST', { action: 'delete', id });
        if (r.success) { toast('Folder deleted'); setFolderFilter(''); loadAll(); }
    };

    return (
        <div>
            <div className="lmd-section-header">
                <h2>Contacts ({contacts.length})</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="lmd-btn lmd-btn-ghost lmd-btn-sm" onClick={() => setShowFolder(true)}><FolderOpen style={{ width: 14, height: 14 }} /> New Folder</button>
                    <button className="lmd-btn lmd-btn-ghost lmd-btn-sm" onClick={() => setShowImport(true)}><Upload style={{ width: 14, height: 14 }} /> Import CSV</button>
                    <button className="lmd-btn lmd-btn-primary lmd-btn-sm" onClick={() => setShowAdd(true)}><Plus style={{ width: 14, height: 14 }} /> Add Contact</button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <div className="lmd-search-box"><Search style={{ width: 14, height: 14 }} /><input placeholder="Search..." value={search} onChange={e => handleSearch(e.target.value)} /></div>
                <select className="lmd-input" style={{ width: 200 }} value={folderFilter} onChange={e => handleFolder(e.target.value)}>
                    <option value="">All Contacts</option><option value="unassigned">Unassigned</option>
                    {folders.map(f => <option key={f.id} value={f.id}>{f.name} ({f.contact_count}) </option>)}
                </select>
                {folderFilter && folderFilter !== 'unassigned' && <button className="lmd-btn lmd-btn-danger lmd-btn-sm" onClick={() => deleteFolder(folderFilter)}>Delete Folder</button>}
            </div>

            {selected.size > 0 && (
                <div className="lmd-select-bar">
                    {selected.size} selected
                    <button className="lmd-btn lmd-btn-danger lmd-btn-sm" onClick={bulkDelete}><Trash2 style={{ width: 12, height: 12 }} /> Delete</button>
                    <select className="lmd-input" style={{ width: 160, padding: '4px 8px', fontSize: '0.72rem' }} onChange={e => { if (e.target.value) moveToFolder(e.target.value); e.target.value = ''; }}>
                        <option value="">Move to folder...</option><option value="null">Unassigned</option>
                        {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                </div>
            )}

            <div className="lmd-table-wrap">
                <table className="lmd-table">
                    <thead><tr><th><input type="checkbox" className="lmd-checkbox" checked={filtered.length > 0 && selected.size === filtered.length} onChange={toggleAll} /></th><th>Name</th><th>Email</th><th>Company</th><th>Tags</th><th>Source</th><th></th></tr></thead>
                    <tbody>
                        {filtered.map(c => (
                            <tr key={c.id}>
                                <td><input type="checkbox" className="lmd-checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} /></td>
                                <td style={{ fontWeight: 600, color: '#1e293b' }}>{c.name || '—'}</td>
                                <td>{c.email}</td>
                                <td>{c.company || '—'}</td>
                                <td>{(c.tags || []).map(t => <span key={t} className="lmd-tag">{t}</span>)}</td>
                                <td><span className="lmd-tag">{c.source}</span></td>
                                <td><button className="lmd-btn lmd-btn-danger lmd-btn-sm" onClick={async () => { await api('contacts', 'POST', { action: 'delete', id: c.id }); loadAll(); }}>
                                    <Trash2 style={{ width: 12, height: 12 }} /></button></td>
                            </tr>
                        ))}
                        {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30, color: '#94a3b8' }}>No contacts found</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Add Contact Modal */}
            {showAdd && (
                <div className="lmd-modal-overlay" onClick={() => setShowAdd(false)}>
                    <div className="lmd-modal" onClick={e => e.stopPropagation()}>
                        <div className="lmd-modal-header"><h3>Add Contact</h3></div>
                        <div className="lmd-modal-body">
                            <div className="lmd-form-grid">
                                <div><label className="lmd-label">Email *</label><input className="lmd-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                                <div><label className="lmd-label">Name</label><input className="lmd-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                                <div><label className="lmd-label">Phone</label><input className="lmd-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                                <div><label className="lmd-label">Company</label><input className="lmd-input" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} /></div>
                                <div><label className="lmd-label">Tags (comma sep)</label><input className="lmd-input" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} /></div>
                                <div><label className="lmd-label">Folder</label>
                                    <select className="lmd-input" value={form.folder_id} onChange={e => setForm({ ...form, folder_id: e.target.value })}>
                                        <option value="">None</option>{folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="lmd-modal-footer">
                            <button className="lmd-btn lmd-btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                            <button className="lmd-btn lmd-btn-primary" onClick={addContact}>Add Contact</button>
                        </div>
                    </div>
                </div>
            )}

            {/* CSV Import Modal */}
            {showImport && (
                <div className="lmd-modal-overlay" onClick={() => setShowImport(false)}>
                    <div className="lmd-modal" onClick={e => e.stopPropagation()}>
                        <div className="lmd-modal-header"><h3>Import CSV</h3><p>Upload a CSV with columns: email, name, phone, company</p></div>
                        <div className="lmd-modal-body">
                            <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="lmd-input" />
                            {csvData.length > 0 && <p style={{ marginTop: 10, fontSize: '0.8rem', color: '#16a34a', fontWeight: 700 }}>{csvData.length} contacts parsed</p>}
                        </div>
                        <div className="lmd-modal-footer">
                            <button className="lmd-btn lmd-btn-ghost" onClick={() => { setShowImport(false); setCsvData([]); }}>Cancel</button>
                            <button className="lmd-btn lmd-btn-primary" onClick={importCSV} disabled={!csvData.length}>Import {csvData.length} Contacts</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Folder Modal */}
            {showFolder && (
                <div className="lmd-modal-overlay" onClick={() => setShowFolder(false)}>
                    <div className="lmd-modal" onClick={e => e.stopPropagation()}>
                        <div className="lmd-modal-header"><h3>Create Folder</h3></div>
                        <div className="lmd-modal-body">
                            <label className="lmd-label">Folder Name</label>
                            <input className="lmd-input" value={folderName} onChange={e => setFolderName(e.target.value)} placeholder="e.g. VIP Clients" />
                        </div>
                        <div className="lmd-modal-footer">
                            <button className="lmd-btn lmd-btn-ghost" onClick={() => setShowFolder(false)}>Cancel</button>
                            <button className="lmd-btn lmd-btn-primary" onClick={createFolder}>Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
