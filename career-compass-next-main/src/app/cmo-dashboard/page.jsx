'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import './cmo-dashboard.css';

const RichEditor = dynamic(() => import('./RichEditor'), { ssr: false });

const NAV = [
  { id:'overview', label:'Overview', d:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4' },
  { id:'contacts', label:'Contacts', d:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { id:'compose', label:'Compose Email', d:'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { id:'campaigns', label:'Campaigns', d:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
];

export default function CMODashboard() {
  const router = useRouter();
  const fileRef = useRef(null);
  const [exec, setExec] = useState(null);
  const [section, setSection] = useState('overview');
  const [contacts, setContacts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [totalContacts, setTotalContacts] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [form, setForm] = useState({ name:'',email:'',phone:'',company:'',tags:'' });
  const [compose, setCompose] = useState({ subject:'',title:'',body:'',cc:'',bcc:'' });
  const [attachments, setAttachments] = useState([]);
  const [sendStatus, setSendStatus] = useState(null);
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState(null);
  const [folderModal, setFolderModal] = useState(null);
  const [folderForm, setFolderForm] = useState({ name:'', description:'' });
  const [sendToFolder, setSendToFolder] = useState('all');
  const [campaignDetail, setCampaignDetail] = useState(null);
  const [runningCampaigns, setRunningCampaigns] = useState([]);

  useEffect(() => {
    const s = sessionStorage.getItem('executive_session');
    if (!s) { router.push('/executive-login'); return; }
    const p = JSON.parse(s);
    if (p.role !== 'cmo') { router.push('/executive-login'); return; }
    setExec(p);
  }, [router]);

  // Helper: get auth headers for protected API calls
  const authHeaders = () => ({
    'Authorization': `Bearer ${sessionStorage.getItem('executive_token') || ''}`
  });

  const fetchFolders = useCallback(async () => {
    const r = await fetch('/api/marketing/folders');
    const d = await r.json();
    if (d.success) setFolders(d.folders);
  }, []);

  const fetchContacts = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (activeFolder) params.set('folder_id', activeFolder);
    const r = await fetch(`/api/marketing/contacts?${params}`);
    const d = await r.json();
    if (d.success) { setContacts(d.contacts); setTotalContacts(d.total); }
  }, [search, activeFolder]);

  const fetchCampaigns = useCallback(async () => {
    const r = await fetch('/api/marketing/campaigns');
    const d = await r.json();
    if (d.success) setCampaigns(d.campaigns);
  }, []);

  useEffect(() => { if (exec) { fetchContacts(); fetchCampaigns(); fetchFolders(); } }, [exec, fetchContacts, fetchCampaigns, fetchFolders]);

  // Poll running campaigns every 5s
  useEffect(() => {
    if (!exec) return;
    const poll = async () => {
      try {
        const r = await fetch('/api/marketing/send-bulk', { headers: authHeaders() });
        const d = await r.json();
        if (d.success) setRunningCampaigns(d.running || []);
      } catch {}
    };
    poll();
    const interval = setInterval(() => { poll(); fetchCampaigns(); }, 5000);
    return () => clearInterval(interval);
  }, [exec, fetchCampaigns]);

  const openCampaignDetail = async (id) => {
    const r = await fetch(`/api/marketing/campaigns/${id}`);
    const d = await r.json();
    if (d.success) setCampaignDetail(d);
    else alert(d.error);
  };

  const deleteBounced = async (campId, emails) => {
    if (!confirm(`Delete ${emails.length} bounced contacts from your contact list?`)) return;
    const r = await fetch(`/api/marketing/campaigns/${campId}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ action:'delete-bounced', emails }) });
    const d = await r.json();
    if (d.success) { alert(`Deleted ${d.deleted} contacts!`); fetchContacts(); fetchFolders(); openCampaignDetail(campId); }
    else alert(d.error);
  };

  const createFolder = async () => {
    if (!folderForm.name.trim()) return alert('Name required');
    const r = await fetch('/api/marketing/folders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'create',...folderForm})});
    const d = await r.json();
    if (d.success) { setFolderModal(null); setFolderForm({name:'',description:''}); fetchFolders(); } else alert(d.error);
  };
  const renameFolder = async (id, name) => {
    const newName = prompt('Rename folder:', name);
    if (!newName || newName === name) return;
    await fetch('/api/marketing/folders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'rename',id,name:newName})});
    fetchFolders();
  };
  const deleteFolder = async (id) => {
    if (!confirm('Delete folder? Contacts will become unassigned.')) return;
    await fetch('/api/marketing/folders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'delete',id})});
    if (activeFolder == id) setActiveFolder(null);
    fetchFolders(); fetchContacts();
  };
  const moveContacts = async (folderId) => {
    if (!selectedIds.length) return alert('Select contacts first');
    await fetch('/api/marketing/contacts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'move',ids:selectedIds,folder_id:folderId})});
    setSelectedIds([]); fetchContacts(); fetchFolders();
  };

  const addContact = async () => {
    if (!form.email) return alert('Email required');
    const payload = { action:'create', ...form, tags: form.tags ? form.tags.split(',').map(t=>t.trim()) : [] };
    if (activeFolder && activeFolder !== 'unassigned') payload.folder_id = activeFolder;
    const r = await fetch('/api/marketing/contacts', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
    const d = await r.json();
    if (d.success) { setShowModal(null); setForm({name:'',email:'',phone:'',company:'',tags:''}); fetchContacts(); fetchFolders(); } else alert(d.error);
  };

  const deleteContact = async (id) => { if (!confirm('Delete?')) return; await fetch('/api/marketing/contacts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'delete',id})}); fetchContacts(); fetchFolders(); };

  const importApplicants = async () => {
    setLoading(true);
    const payload = { action:'import-applicants' };
    if (activeFolder && activeFolder !== 'unassigned') payload.folder_id = activeFolder;
    const r = await fetch('/api/marketing/contacts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const d = await r.json(); setLoading(false); alert(d.success?`Imported ${d.imported} contacts!`:d.error); fetchContacts(); fetchFolders();
  };

  const handleCSVImport = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const text = await file.text();
    const lines = text.split('\n').filter(l=>l.trim());
    const headers = lines[0].split(',').map(h=>h.trim().toLowerCase());
    const rows = lines.slice(1).map(line => { const v=line.split(',').map(x=>x.trim()); const o={}; headers.forEach((h,i)=>{o[h]=v[i]||'';}); return {email:o.email,name:o.name,phone:o.phone,company:o.company}; }).filter(r=>r.email);
    setLoading(true);
    const payload = { action:'bulk-import', contacts:rows };
    if (activeFolder && activeFolder !== 'unassigned') payload.folder_id = activeFolder;
    const r = await fetch('/api/marketing/contacts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const d = await r.json(); setLoading(false); alert(d.success?`Imported ${d.imported} contacts!`:d.error); fetchContacts(); fetchFolders(); e.target.value='';
  };

  const toggleSelect = (id) => setSelectedIds(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const toggleAll = () => setSelectedIds(selectedIds.length===contacts.length?[]:contacts.map(c=>c.id));

  const bulkDeleteContacts = async () => {
    if (!selectedIds.length) return;
    if (!confirm(`Delete ${selectedIds.length} selected contact(s)? This cannot be undone.`)) return;
    for (const id of selectedIds) {
      await fetch('/api/marketing/contacts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'delete',id})});
    }
    setSelectedIds([]); fetchContacts(); fetchFolders();
  };

  const handleFileAttach = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(f => ({ file: f, name: f.name, size: (f.size/1024).toFixed(1)+'KB' }));
    setAttachments(prev => [...prev, ...newAttachments]);
    e.target.value = '';
  };
  const removeAttachment = (idx) => setAttachments(prev => prev.filter((_,i) => i!==idx));

  const sendBulkEmail = async () => {
    if (!compose.subject || !compose.body) return alert('Subject and body required');
    const ids = selectedIds.length > 0 ? selectedIds : contacts.map(c=>c.id);
    if (ids.length===0) return alert('No contacts');
    if (!confirm(`Send to ${ids.length} contacts?`)) return;
    setSendStatus({ msg: `Sending to ${ids.length} contacts...` });
    const fd = new FormData();
    fd.append('contactIds', JSON.stringify(ids));
    if (sendToFolder && sendToFolder !== 'all') fd.append('folderIds', JSON.stringify([sendToFolder]));
    fd.append('subject', compose.subject);
    fd.append('title', compose.title || compose.subject);
    fd.append('htmlBody', compose.body);
    fd.append('cc', compose.cc || '');
    fd.append('bcc', compose.bcc || '');
    attachments.forEach((a,i) => fd.append(`file_${i}`, a.file));
    const r = await fetch('/api/marketing/send-bulk', { method:'POST', body: fd, headers: authHeaders() });
    const d = await r.json();
    setSendStatus(null);
    if (d.success) {
      alert(d.message || 'Campaign started in background!');
      setCompose({subject:'',title:'',body:'',cc:'',bcc:''}); setAttachments([]); setSelectedIds([]); fetchCampaigns();
    } else alert(d.error);
  };

  const logout = () => { sessionStorage.removeItem('executive_session'); sessionStorage.removeItem('executive_token'); router.push('/executive-login'); };
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
  const sentCampaigns = campaigns.filter(c=>c.status==='sent');
  const totalDelivered = sentCampaigns.reduce((s,c)=>s+(c.delivered_count||0),0);

  // Generate personalized preview
  const previewHtml = compose.body.replace(/\{\{name\}\}/g,'<strong>John Doe</strong>').replace(/\n/g,'<br>');

  if (!exec) return null;

  return (
    <div className="cmo-dash">
      <aside className={`cmo-sidebar ${mobileOpen?'open':''}`}>
        <div className="cmo-sidebar-logo">
          <img src="/images/logo.png" alt="Logo" />
        </div>
        <nav className="cmo-nav">
          {NAV.map(n=>(
            <button key={n.id} className={`cmo-nav-btn ${section===n.id?'active':''}`} onClick={()=>{setSection(n.id);setMobileOpen(false);}}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={n.d}/></svg>
              {n.label}
            </button>
          ))}
          <button className="cmo-nav-btn logout" onClick={logout}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Logout
          </button>
        </nav>
        <div className="cmo-sidebar-profile">
          <div className="cmo-sidebar-avatar">{(exec.name||'C')[0]}</div>
          <div className="cmo-sidebar-info"><div className="name">{exec.name}</div><div className="role">Chief Marketing Officer</div></div>
        </div>
      </aside>

      <main className="cmo-main">
        <div className="cmo-topbar">
          <div className="cmo-topbar-left">
            <button className="cmo-mobile-btn" onClick={()=>setMobileOpen(!mobileOpen)}>☰</button>
            <h1>Marketing Dashboard</h1>
            <p>{dateStr} • Sending as contact@diverseloopers.com</p>
          </div>
          <div className="cmo-topbar-right">
            <div className="cmo-search-box">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input placeholder="Search contacts..." value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')fetchContacts();}} />
            </div>
          </div>
        </div>

        <div className="cmo-content">
          {/* OVERVIEW */}
          <div className={`cmo-section ${section==='overview'?'active':''}`}>
            <div className="cmo-stats">
              {[
                { label:'Total Contacts', value:totalContacts, sub:'Active subscribers', bg:'rgba(108,92,231,0.1)', color:'#6C5CE7', icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
                { label:'Campaigns Sent', value:sentCampaigns.length, sub:'Total campaigns', bg:'rgba(16,185,129,0.1)', color:'#10b981', icon:'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                { label:'Emails Delivered', value:totalDelivered, sub:'Successfully sent', bg:'rgba(245,158,11,0.1)', color:'#f59e0b', icon:'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                { label:'Avg per Campaign', value:sentCampaigns.length?Math.round(totalDelivered/sentCampaigns.length):0, sub:'Recipients per campaign', bg:'rgba(239,68,68,0.1)', color:'#ef4444', icon:'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
              ].map((s,i)=>(
                <div className="cmo-stat-card" key={i}>
                  <div className="cmo-stat-icon" style={{background:s.bg}}><svg width="20" height="20" fill="none" stroke={s.color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon}/></svg></div>
                  <div className="label">{s.label}</div><div className="value">{s.value}</div><div className="sub">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Running Campaigns - Live */}
            {runningCampaigns.length>0&&(
              <div style={{marginBottom:'1.5rem'}}>
                <h3 style={{marginBottom:'0.75rem',fontSize:'1rem',fontWeight:700}}>🔴 Live — Running Campaigns</h3>
                {runningCampaigns.map(rc=>(
                  <div key={rc.campaignId} style={{background:rc.paused?'#fef3c7':'#dbeafe',border:rc.paused?'1px solid #f59e0b':'1px solid #3b82f6',borderRadius:10,padding:'1rem',marginBottom:'0.5rem'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'0.5rem'}}>
                      <span style={{fontWeight:700,fontSize:'0.85rem'}}>Campaign #{rc.campaignId}</span>
                      <span style={{fontWeight:700,fontSize:'0.78rem',color:rc.paused?'#d97706':'#2563eb'}}>{rc.paused ? `⏸️ Paused until ${new Date(rc.pauseUntil).toLocaleTimeString()}` : '🔄 Sending...'}</span>
                    </div>
                    <div style={{display:'flex',gap:'1rem',marginTop:'0.5rem',fontSize:'0.78rem',flexWrap:'wrap'}}>
                      <span>📤 Progress: {rc.current}/{rc.total}</span>
                      <span>✅ Delivered: {rc.delivered}</span>
                      <span>❌ Failed: {rc.failed}</span>
                      {rc.bounceCount>0&&<span style={{color:'#ef4444',fontWeight:600}}>⚠️ Bounces: {rc.bounceCount}</span>}
                    </div>
                    <div style={{marginTop:'0.5rem',background:'#e2e8f0',borderRadius:8,height:6,overflow:'hidden'}}>
                      <div style={{width:`${Math.round((rc.current/rc.total)*100)}%`,height:'100%',background:rc.paused?'#f59e0b':'#3b82f6',borderRadius:8,transition:'width 0.3s'}}/>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h3 style={{marginBottom:'1rem',fontSize:'1rem',fontWeight:700}}>Recent Campaigns</h3>
            <div className="cmo-campaigns-grid">
              {campaigns.slice(0,6).map(c=>(
                <div className="cmo-campaign-card" key={c.id} onClick={()=>openCampaignDetail(c.id)} style={{cursor:'pointer'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}><h4>{c.title}</h4><span className={`cmo-badge cmo-badge-${c.status}`}>{c.status}</span></div>
                  <div className="meta">{c.subject} • {c.sent_at?new Date(c.sent_at).toLocaleDateString('en-IN'):'Draft'}</div>
                  <div className="stats-row">
                    <span className="stat-pill">📤 {c.recipient_count||0}</span>
                    <span className="stat-pill">✅ {c.delivered_count||0}</span>
                    {c.failed_count>0&&<span className="stat-pill">❌ {c.failed_count}</span>}
                  </div>
                </div>
              ))}
              {campaigns.length===0&&<p style={{color:'var(--cmo-text-sec)',gridColumn:'1/-1'}}>No campaigns yet. Compose your first email!</p>}
            </div>
          </div>

          {/* CONTACTS */}
          <div className={`cmo-section ${section==='contacts'?'active':''}`}>
            <div className="cmo-section-header">
              <h2>Contacts ({contacts.length})</h2>
              <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                <button className="cmo-btn cmo-btn-primary" onClick={()=>setShowModal('add')}>+ Add Contact</button>
                <button className="cmo-btn cmo-btn-ghost" onClick={()=>setFolderModal('create')}>📁 New Folder</button>
                <button className="cmo-btn cmo-btn-ghost" onClick={importApplicants} disabled={loading}>{loading?'Importing...':'📥 Import Applicants'}</button>
                <label className="cmo-btn cmo-btn-ghost" style={{cursor:'pointer'}}>📄 Import CSV<input type="file" accept=".csv" onChange={handleCSVImport} style={{display:'none'}}/></label>
              </div>
            </div>

            {/* Folder Tabs */}
            <div style={{display:'flex',gap:'0.5rem',marginBottom:'1rem',flexWrap:'wrap',alignItems:'center'}}>
              <button className={`cmo-btn ${!activeFolder?'cmo-btn-primary':'cmo-btn-ghost'}`} style={{fontSize:'0.72rem'}} onClick={()=>setActiveFolder(null)}>📋 All ({totalContacts})</button>
              {folders.map(f=>(
                <div key={f.id} style={{display:'flex',alignItems:'center',gap:2}}>
                  <button className={`cmo-btn ${activeFolder==f.id?'cmo-btn-primary':'cmo-btn-ghost'}`} style={{fontSize:'0.72rem'}} onClick={()=>setActiveFolder(f.id)}>
                    📁 {f.name} ({f.contact_count})
                  </button>
                  <button onClick={()=>renameFolder(f.id,f.name)} style={{background:'none',border:'none',cursor:'pointer',fontSize:12,padding:2}} title="Rename">✏️</button>
                  <button onClick={()=>deleteFolder(f.id)} style={{background:'none',border:'none',cursor:'pointer',fontSize:12,padding:2,color:'#ef4444'}} title="Delete">🗑️</button>
                </div>
              ))}
            </div>

            {selectedIds.length>0&&(
              <div className="cmo-select-bar">
                <span>{selectedIds.length} selected</span>
                <button className="cmo-btn cmo-btn-primary cmo-btn-sm" onClick={()=>setSection('compose')}>📧 Email Selected</button>
                <select onChange={e=>{if(e.target.value)moveContacts(e.target.value==='unassign'?null:e.target.value);e.target.value='';}} defaultValue="" style={{border:'1px solid #d4d4e8',borderRadius:6,padding:'4px 8px',fontSize:12,background:'#fff',cursor:'pointer'}}>
                  <option value="" disabled>📁 Move to folder...</option>
                  <option value="unassign">Remove from folder</option>
                  {folders.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <button className="cmo-btn cmo-btn-danger cmo-btn-sm" onClick={bulkDeleteContacts}>🗑️ Delete Selected</button>
                <button className="cmo-btn cmo-btn-ghost cmo-btn-sm" onClick={()=>setSelectedIds([])}>Clear</button>
              </div>
            )}

            <div className="cmo-table-wrap">
              <table className="cmo-table">
                <thead><tr>
                  <th><input type="checkbox" className="cmo-checkbox" checked={selectedIds.length===contacts.length&&contacts.length>0} onChange={toggleAll}/></th>
                  <th>Name</th><th>Email</th><th>Phone</th><th>Company</th><th>Source</th><th>Tags</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {contacts.map(c=>(
                    <tr key={c.id}>
                      <td><input type="checkbox" className="cmo-checkbox" checked={selectedIds.includes(c.id)} onChange={()=>toggleSelect(c.id)}/></td>
                      <td style={{fontWeight:600,color:'var(--cmo-text)'}}>{c.name||'—'}</td>
                      <td>{c.email}</td><td>{c.phone||'—'}</td><td>{c.company||'—'}</td>
                      <td><span className="cmo-badge cmo-badge-draft">{c.source}</span></td>
                      <td>{(c.tags||[]).map(t=><span key={t} className="cmo-tag">{t}</span>)}</td>
                      <td><button className="cmo-btn cmo-btn-danger cmo-btn-sm" onClick={()=>deleteContact(c.id)}>Delete</button></td>
                    </tr>
                  ))}
                  {contacts.length===0&&<tr><td colSpan={8} style={{textAlign:'center',color:'var(--cmo-text-sec)',padding:'2rem'}}>No contacts in this folder</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* COMPOSE */}
          <div className={`cmo-section ${section==='compose'?'active':''}`}>
            <div className="cmo-section-header">
              <h2>Compose Bulk Email</h2>
              <span style={{fontSize:'0.78rem',color:'var(--cmo-primary)',fontWeight:600}}>📧 Sending as contact@diverseloopers.com</span>
            </div>
            <div className="cmo-compose-wrap">
              <div style={{background:'#ede9fe',borderRadius:10,padding:'0.75rem 1rem',marginBottom:'1.25rem',fontSize:'0.78rem',color:'#7c3aed',fontWeight:500}}>
                💡 Use <code style={{background:'#ddd6fe',padding:'2px 6px',borderRadius:4}}>{'{{name}}'}</code> in your email body — it will be replaced with the contact's name. If no name is set, it will say <strong>"Dear User"</strong>.
              </div>
              <div className="cmo-form-grid">
                <div>
                  <label className="cmo-label">Campaign Title</label>
                  <input className="cmo-input" placeholder="e.g. May Newsletter" value={compose.title} onChange={e=>setCompose({...compose,title:e.target.value})} />
                </div>
                <div>
                  <label className="cmo-label">Subject Line</label>
                  <input className="cmo-input" placeholder="Email subject..." value={compose.subject} onChange={e=>setCompose({...compose,subject:e.target.value})} />
                </div>
                <div>
                  <label className="cmo-label">CC (comma separated emails)</label>
                  <input className="cmo-input" placeholder="cc1@email.com, cc2@email.com" value={compose.cc} onChange={e=>setCompose({...compose,cc:e.target.value})} />
                </div>
                <div>
                  <label className="cmo-label">BCC (comma separated emails)</label>
                  <input className="cmo-input" placeholder="bcc1@email.com, bcc2@email.com" value={compose.bcc} onChange={e=>setCompose({...compose,bcc:e.target.value})} />
                </div>
                <div className="cmo-form-full" style={{display:'flex',gap:'1rem',alignItems:'flex-end',flexWrap:'wrap'}}>
                  <div style={{flex:1,minWidth:200}}>
                    <label className="cmo-label">Send to Folder</label>
                    <select className="cmo-input" value={sendToFolder} onChange={e=>setSendToFolder(e.target.value)} style={{cursor:'pointer'}}>
                      <option value="all">All Contacts ({totalContacts})</option>
                      {folders.map(f=><option key={f.id} value={f.id}>{f.name} ({f.contact_count})</option>)}
                    </select>
                  </div>
                  {selectedIds.length>0&&<span style={{fontSize:'0.72rem',color:'var(--cmo-primary)',fontWeight:600,padding:'0.5rem 0'}}>⚡ {selectedIds.length} manually selected — overrides folder</span>}
                </div>
                <div className="cmo-form-full">
                  <label className="cmo-label">Email Body (Rich HTML Editor)</label>
                  <RichEditor onChange={(html) => setCompose(p => ({...p, body: html}))} initialHtml={compose.body} />
                </div>
                <div className="cmo-form-full">
                  <label className="cmo-label">Attachments (Images, Documents, Videos)</label>
                  <div style={{display:'flex',gap:'0.5rem',alignItems:'center',flexWrap:'wrap'}}>
                    <button className="cmo-btn cmo-btn-ghost" onClick={()=>fileRef.current?.click()}>📎 Add Files</button>
                    <input ref={fileRef} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" onChange={handleFileAttach} style={{display:'none'}} />
                    <span style={{fontSize:'0.72rem',color:'var(--cmo-text-muted)'}}>Max 10MB per file • Images, PDFs, Docs, Videos</span>
                  </div>
                  {attachments.length>0&&(
                    <div className="cmo-attach-list">
                      {attachments.map((a,i)=>(
                        <div className="cmo-attach-item" key={i}>
                          📄 {a.name} ({a.size})
                          <button onClick={()=>removeAttachment(i)}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div style={{marginTop:'1.5rem',display:'flex',gap:'0.75rem',flexWrap:'wrap',alignItems:'center'}}>
                <button className="cmo-btn cmo-btn-primary" onClick={sendBulkEmail} disabled={!!sendStatus} style={{padding:'0.75rem 2rem'}}>
                  {sendStatus ? sendStatus.msg : `🚀 Send to ${selectedIds.length||totalContacts} contacts`}
                </button>
                <span style={{fontSize:'0.78rem',color:'var(--cmo-text-sec)'}}>
                  {selectedIds.length>0 ? `${selectedIds.length} contacts selected` : `Sending to all ${totalContacts} subscribed contacts`}
                </span>
              </div>
              {compose.body&&(
                <div style={{marginTop:'1.5rem'}}>
                  <h4 style={{fontSize:'0.85rem',fontWeight:700,marginBottom:'0.75rem'}}>📧 Email Preview</h4>
                  <div className="cmo-compose-preview" dangerouslySetInnerHTML={{__html: previewHtml}} />
                </div>
              )}
            </div>
          </div>

          {/* CAMPAIGNS */}
          <div className={`cmo-section ${section==='campaigns'?'active':''}`}>
            <div className="cmo-section-header">
              <h2>Campaign History</h2>
              <button className="cmo-btn cmo-btn-ghost" onClick={fetchCampaigns}>🔄 Refresh</button>
            </div>
            <div className="cmo-table-wrap">
              <table className="cmo-table">
                <thead><tr><th>Title</th><th>Subject</th><th>Status</th><th>Recipients</th><th>Delivered</th><th>Failed</th><th>Sent At</th><th>Actions</th></tr></thead>
                <tbody>
                  {campaigns.map(c=>(
                    <tr key={c.id}>
                      <td style={{fontWeight:600,color:'var(--cmo-text)'}}>{c.title}</td>
                      <td>{c.subject}</td>
                      <td><span className={`cmo-badge cmo-badge-${c.status}`}>{c.status}</span></td>
                      <td>{c.recipient_count||0}</td>
                      <td style={{color:'var(--cmo-success)',fontWeight:600}}>{c.delivered_count||0}</td>
                      <td style={{color:c.failed_count>0?'var(--cmo-danger)':'var(--cmo-text-sec)'}}>{c.failed_count||0}</td>
                      <td>{c.sent_at?new Date(c.sent_at).toLocaleString('en-IN'):'—'}</td>
                      <td><button className="cmo-btn cmo-btn-danger cmo-btn-sm" onClick={async()=>{if(!confirm('Delete?'))return;await fetch('/api/marketing/campaigns',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'delete',id:c.id})});fetchCampaigns();}}>Delete</button></td>
                    </tr>
                  ))}
                  {campaigns.length===0&&<tr><td colSpan={8} style={{textAlign:'center',color:'var(--cmo-text-sec)',padding:'2rem'}}>No campaigns yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* ADD CONTACT MODAL */}
      {showModal==='add'&&(
        <div className="cmo-modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setShowModal(null);}}>
          <div className="cmo-modal">
            <div className="cmo-modal-header"><h3>Add Contact</h3><p>Add a new marketing contact</p></div>
            <div className="cmo-modal-body">
              <div className="cmo-form-grid">
                <div><label className="cmo-label">Email *</label><input className="cmo-input" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="email@example.com"/></div>
                <div><label className="cmo-label">Name</label><input className="cmo-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Full name"/></div>
                <div><label className="cmo-label">Phone</label><input className="cmo-input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+91 ..."/></div>
                <div><label className="cmo-label">Company</label><input className="cmo-input" value={form.company} onChange={e=>setForm({...form,company:e.target.value})} placeholder="Company"/></div>
                <div className="cmo-form-full"><label className="cmo-label">Tags (comma separated)</label><input className="cmo-input" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="student, newsletter, lead"/></div>
              </div>
            </div>
            <div className="cmo-modal-footer">
              <button className="cmo-btn cmo-btn-ghost" onClick={()=>setShowModal(null)}>Cancel</button>
              <button className="cmo-btn cmo-btn-primary" onClick={addContact}>Add Contact</button>
            </div>
          </div>
        </div>
      )}

      {/* FOLDER MODAL */}
      {folderModal==='create'&&(
        <div className="cmo-modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setFolderModal(null);}}>
          <div className="cmo-modal">
            <div className="cmo-modal-header"><h3>Create Folder</h3><p>Organize your contacts into groups</p></div>
            <div className="cmo-modal-body">
              <div><label className="cmo-label">Folder Name *</label><input className="cmo-input" value={folderForm.name} onChange={e=>setFolderForm({...folderForm,name:e.target.value})} placeholder="e.g. Students, Companies, Partners"/></div>
              <div style={{marginTop:'1rem'}}><label className="cmo-label">Description</label><input className="cmo-input" value={folderForm.description} onChange={e=>setFolderForm({...folderForm,description:e.target.value})} placeholder="Optional description"/></div>
            </div>
            <div className="cmo-modal-footer">
              <button className="cmo-btn cmo-btn-ghost" onClick={()=>setFolderModal(null)}>Cancel</button>
              <button className="cmo-btn cmo-btn-primary" onClick={createFolder}>Create Folder</button>
            </div>
          </div>
        </div>
      )}

      {/* CAMPAIGN DETAIL MODAL */}
      {campaignDetail&&(
        <div className="cmo-modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setCampaignDetail(null);}}>
          <div className="cmo-modal" style={{maxWidth:750,maxHeight:'85vh',overflow:'auto'}}>
            <div className="cmo-modal-header">
              <h3>📧 {campaignDetail.campaign.title}</h3>
              <p>Subject: <strong>{campaignDetail.campaign.subject}</strong></p>
            </div>
            <div className="cmo-modal-body">
              {/* Status */}
              <div style={{display:'flex',gap:'1rem',marginBottom:'1rem',flexWrap:'wrap'}}>
                <span className={`cmo-badge cmo-badge-${campaignDetail.campaign.status}`}>{campaignDetail.campaign.status}</span>
                <span style={{fontSize:'0.78rem',color:'var(--cmo-text-sec)'}}>Sent: {campaignDetail.campaign.sent_at?new Date(campaignDetail.campaign.sent_at).toLocaleString('en-IN'):'—'}</span>
              </div>

              {/* Stats */}
              <div style={{display:'flex',gap:'1rem',marginBottom:'1.25rem',flexWrap:'wrap'}}>
                <div style={{background:'#d1fae5',padding:'0.5rem 1rem',borderRadius:8,fontSize:'0.78rem',fontWeight:700,color:'#065f46'}}>✅ Delivered: {campaignDetail.totals.sent}</div>
                <div style={{background:'#fee2e2',padding:'0.5rem 1rem',borderRadius:8,fontSize:'0.78rem',fontWeight:700,color:'#991b1b'}}>❌ Failed: {campaignDetail.totals.failed}</div>
                {campaignDetail.totals.pending>0&&<div style={{background:'#dbeafe',padding:'0.5rem 1rem',borderRadius:8,fontSize:'0.78rem',fontWeight:700,color:'#1e40af'}}>⏳ Pending: {campaignDetail.totals.pending}</div>}
              </div>

              {/* Email Body Preview */}
              <div style={{marginBottom:'1.25rem'}}>
                <h4 style={{fontSize:'0.85rem',fontWeight:700,marginBottom:'0.5rem'}}>📝 Email Body Sent</h4>
                <div style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:10,padding:'1rem',maxHeight:200,overflow:'auto',fontSize:'0.82rem'}} dangerouslySetInnerHTML={{__html:campaignDetail.campaign.body}} />
              </div>

              {/* Delivered Recipients */}
              <div style={{marginBottom:'1.25rem'}}>
                <h4 style={{fontSize:'0.85rem',fontWeight:700,marginBottom:'0.5rem',color:'#065f46'}}>✅ Successfully Delivered ({campaignDetail.totals.sent})</h4>
                <div style={{maxHeight:180,overflow:'auto',border:'1px solid #d1fae5',borderRadius:8}}>
                  <table className="cmo-table" style={{fontSize:'0.75rem'}}>
                    <thead><tr><th>Email</th><th>Sent At</th></tr></thead>
                    <tbody>
                      {campaignDetail.recipients.sent.map((r,i)=><tr key={i}><td>{r.email}</td><td>{r.sent_at?new Date(r.sent_at).toLocaleString('en-IN'):'—'}</td></tr>)}
                      {campaignDetail.recipients.sent.length===0&&<tr><td colSpan={2} style={{textAlign:'center',color:'#999'}}>None</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bounced/Failed Recipients */}
              {campaignDetail.totals.failed>0&&(
                <div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.5rem',flexWrap:'wrap',gap:'0.5rem'}}>
                    <h4 style={{fontSize:'0.85rem',fontWeight:700,color:'#991b1b'}}>❌ Failed / Bounced ({campaignDetail.totals.failed})</h4>
                    <button className="cmo-btn cmo-btn-danger cmo-btn-sm" onClick={()=>deleteBounced(campaignDetail.campaign.id, campaignDetail.recipients.failed.map(r=>r.email))}>
                      🗑️ Delete All Bounced from Contacts
                    </button>
                  </div>
                  <div style={{maxHeight:180,overflow:'auto',border:'1px solid #fee2e2',borderRadius:8}}>
                    <table className="cmo-table" style={{fontSize:'0.75rem'}}>
                      <thead><tr><th>Email</th><th>Error</th></tr></thead>
                      <tbody>
                        {campaignDetail.recipients.failed.map((r,i)=><tr key={i}><td>{r.email}</td><td style={{color:'#dc2626',fontSize:'0.72rem'}}>{r.error_message||'Unknown'}</td></tr>)}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="cmo-modal-footer">
              <button className="cmo-btn cmo-btn-ghost" onClick={()=>setCampaignDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
