'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './sales-dashboard.css';

const ROLE_LABELS = {
  sales: 'Sales Executive', cfo: 'Chief Finance Officer', cso: 'Chief Staffing Officer',
  cmo: 'Chief Marketing Officer', cmgo: 'Chief Managing Officer', coo: 'Chief Operations Officer',
  strategic_advisor: 'Strategic Advisor',
};

export default function SalesDashboardPage() {
  const router = useRouter();
  const [exec, setExec] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Existing data
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalTransactions: 0, avgOrderValue: 0, couponsUsed: 0 });
  const [chart, setChart] = useState([]);
  const [settings, setSettings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseAnalytics, setCourseAnalytics] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('All Courses');

  // Business data
  const [bizSubs, setBizSubs] = useState([]);
  const [bizStats, setBizStats] = useState({ activeCount: 0, totalRevenue: 0, planBreakdown: {}, pendingOnboarding: 0, total: 0 });
  const [bizFilter, setBizFilter] = useState('all');
  const [leads, setLeads] = useState([]);
  const [leadStats, setLeadStats] = useState({ new: 0, contacted: 0, converted: 0, rejected: 0 });
  const [leadFilter, setLeadFilter] = useState('all');

  // Settings form
  const [gwName, setGwName] = useState('razorpay');
  const [gwKey, setGwKey] = useState('');
  const [gwSecret, setGwSecret] = useState('');
  const [savingGw, setSavingGw] = useState(false);

  // Email templates
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [editingTpl, setEditingTpl] = useState(null);
  const [tplSaving, setTplSaving] = useState(false);

  // Placement applications
  const [placements, setPlacements] = useState([]);
  const [placementStats, setPlacementStats] = useState({ total: 0, new: 0, reviewing: 0, shortlisted: 0, placed: 0 });
  const [placementFilter, setPlacementFilter] = useState('all');
  const [placementDetail, setPlacementDetail] = useState(null);

  useEffect(() => {
    const session = sessionStorage.getItem('executive_session');
    if (!session) { router.push('/executive-login'); return; }
    setExec(JSON.parse(session));
    loadDashboardData();
  }, []);

  // Helper: get auth headers for protected API calls
  const authHeaders = () => ({
    'Authorization': `Bearer ${sessionStorage.getItem('executive_token') || ''}`,
    'Content-Type': 'application/json',
  });

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [payRes, settingsRes] = await Promise.all([
        fetch('/api/payment/dashboard', { headers: authHeaders() }).then(r => r.json()),
        fetch('/api/payment/dashboard', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ action: 'get-settings' }) }).then(r => r.json()),
      ]);
      if (payRes.success) { setPayments(payRes.payments); setStats(payRes.stats); setChart(payRes.chart); setCourseAnalytics(payRes.courseAnalytics || []); }
      if (settingsRes.success) setSettings(settingsRes.settings);
    } catch (err) { console.error('Dashboard load error:', err); }
    setLoading(false);
  };

  const loadBizData = async () => {
    try {
      const [subsRes, leadsRes] = await Promise.all([
        fetch('/api/loopmail/business-dashboard?tab=subscriptions', { headers: authHeaders() }).then(r => r.json()),
        fetch('/api/loopmail/business-dashboard?tab=leads', { headers: authHeaders() }).then(r => r.json()),
      ]);
      if (subsRes.success) { setBizSubs(subsRes.subscriptions || []); setBizStats(subsRes.stats); }
      if (leadsRes.success) { setLeads(leadsRes.leads || []); setLeadStats(leadsRes.stats); }
    } catch {}
  };

  useEffect(() => { if (activeTab === 'biz-payments' || activeTab === 'biz-leads') loadBizData(); }, [activeTab]);
  useEffect(() => { if (activeTab === 'email-templates') loadTemplates(); }, [activeTab]);
  useEffect(() => { if (activeTab === 'placements') loadPlacements(); }, [activeTab]);

  const loadPlacements = async () => {
    try {
      const res = await fetch('/api/placement', { headers: authHeaders() }).then(r => r.json());
      if (res.success) { setPlacements(res.applications || []); setPlacementStats(res.stats); }
    } catch {}
  };

  const updatePlacementStatus = async (id, status) => {
    await fetch('/api/placement', { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ id, status }) });
    loadPlacements();
  };

  const loadTemplates = async () => {
    try {
      const res = await fetch('/api/loopmail/email-templates').then(r => r.json());
      if (res.success) setEmailTemplates(res.templates || []);
    } catch {}
  };

  const saveTemplate = async (tpl) => {
    setTplSaving(true);
    try {
      await fetch('/api/loopmail/email-templates', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tpl.id, subject: tpl.subject, body_html: tpl.body_html, is_active: tpl.is_active }),
      });
      setEditingTpl(null);
      loadTemplates();
    } catch {}
    setTplSaving(false);
  };

  const handleLogout = () => { sessionStorage.removeItem('executive_session'); sessionStorage.removeItem('executive_token'); router.push('/executive-login'); };

  const saveGateway = async () => {
    if (!gwKey || !gwSecret) return;
    setSavingGw(true);
    try { await fetch('/api/payment/dashboard', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ action: 'save-settings', gateway_name: gwName, api_key: gwKey, api_secret: gwSecret }) }); setGwKey(''); setGwSecret(''); loadDashboardData(); } catch {}
    setSavingGw(false);
  };

  const activateGateway = async (name) => { await fetch('/api/payment/dashboard', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ action: 'activate-gateway', gateway_name: name }) }); loadDashboardData(); };
  const deleteGateway = async (id) => { if (!confirm('Remove this gateway?')) return; await fetch('/api/payment/dashboard', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ action: 'delete-settings', id }) }); loadDashboardData(); };

  const updateLeadStatus = async (leadId, status) => {
    await fetch('/api/loopmail/business-dashboard', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ action: 'update-lead-status', lead_id: leadId, status }) });
    loadBizData();
  };

  const filteredPayments = payments.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (p.user_name || '').toLowerCase().includes(q) || (p.user_email || '').toLowerCase().includes(q) || (p.course_title || '').toLowerCase().includes(q);
  });

  const filteredBizSubs = bizSubs.filter(s => {
    if (bizFilter === 'all') return true;
    if (bizFilter === 'pending') return s.onboarding_status !== 'active';
    return s.plan === bizFilter;
  });

  const filteredLeads = leads.filter(l => leadFilter === 'all' ? true : l.status === leadFilter);

  const maxChartValue = Math.max(...chart.map(c => c.revenue), 1);

  if (loading && !exec) return (<div className="sd-loading"><div className="sd-spinner"></div><p>Loading dashboard...</p></div>);

  const NAV_ITEMS = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'transactions', label: 'Transactions', icon: '💰' },
    { id: 'analytics', label: 'Course Analytics', icon: '📈' },
    { id: 'placements', label: 'Placement Applications', icon: '🌎' },
    { id: 'biz-payments', label: 'Business Payments', icon: '🏢' },
    { id: 'biz-leads', label: 'Enterprise Leads', icon: '📋' },
    { id: 'email-templates', label: 'Email Templates', icon: '✉️' },
    { id: 'settings', label: 'Payment Settings', icon: '⚙️' },
  ];

  return (
    <div className="sd-layout">
      <aside className="sd-sidebar">
        <div className="sd-sidebar-logo">
          <img src="/Diverse Loopers Black BG (2).png" alt="Logo" />
          <span>CSO Panel</span>
        </div>
        {exec && (
          <div className="sd-user-card">
            <div className="sd-user-avatar">{exec.name?.charAt(0).toUpperCase()}</div>
            <div>
              <p className="sd-user-name">{exec.name}</p>
              <p className="sd-user-role">{ROLE_LABELS[exec.role] || exec.role}</p>
            </div>
          </div>
        )}
        <nav className="sd-nav">
          {NAV_ITEMS.map(item => (
            <button key={item.id} className={`sd-nav-btn ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
              <span style={{ fontSize: 16 }}>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
        <button className="sd-logout-btn" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      <main className="sd-main">
        <div className="sd-topbar">
          <div>
            <h1>{NAV_ITEMS.find(n => n.id === activeTab)?.label || 'Dashboard'}</h1>
            <p>Diverse Loopers Executive Dashboard</p>
          </div>
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="sd-content">
            <div className="sd-stats-grid">
              <div className="sd-stat-card sd-stat-revenue"><p className="sd-stat-label">Total Revenue</p><p className="sd-stat-value">₹{stats.totalRevenue.toLocaleString('en-IN')}</p></div>
              <div className="sd-stat-card sd-stat-transactions"><p className="sd-stat-label">Transactions</p><p className="sd-stat-value">{stats.totalTransactions}</p></div>
              <div className="sd-stat-card sd-stat-avg"><p className="sd-stat-label">Avg Order</p><p className="sd-stat-value">₹{stats.avgOrderValue.toLocaleString('en-IN')}</p></div>
              <div className="sd-stat-card sd-stat-coupons"><p className="sd-stat-label">Coupons Used</p><p className="sd-stat-value">{stats.couponsUsed}</p></div>
            </div>
            <div className="sd-card"><h3 className="sd-card-title">Revenue — Last 7 Days</h3>
              <div className="sd-chart">{chart.map((day, i) => (<div key={i} className="sd-chart-bar-wrap"><div className="sd-chart-bar" style={{ height: `${(day.revenue / maxChartValue) * 100}%` }}>{day.revenue > 0 && <span className="sd-chart-val">₹{day.revenue}</span>}</div><span className="sd-chart-label">{day.label}</span></div>))}</div>
            </div>
            <div className="sd-card"><h3 className="sd-card-title">Recent Transactions</h3>
              <div className="sd-table-wrap"><table className="sd-table"><thead><tr><th>Customer</th><th>Course</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>{payments.slice(0, 10).map(p => (<tr key={p.id}><td><div className="sd-cell-name">{p.user_name || '-'}</div><div className="sd-cell-sub">{p.user_email}</div></td><td>{p.course_title}</td><td>₹{(p.amount || 0).toLocaleString('en-IN')}</td><td><span className={`sd-badge sd-badge-${p.status}`}>{p.status}</span></td><td>{p.paid_at ? new Date(p.paid_at).toLocaleDateString('en-IN') : '-'}</td></tr>))}
                  {payments.length === 0 && <tr><td colSpan={5} className="sd-empty">No transactions yet</td></tr>}
                </tbody></table></div>
            </div>
          </div>
        )}

        {/* TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <div className="sd-content">
            <div className="sd-content-header"><h1 className="sd-page-title">All Transactions</h1>
              <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="sd-search" />
            </div>
            <div className="sd-card"><div className="sd-table-wrap"><table className="sd-table"><thead><tr><th>Customer</th><th>Contact</th><th>Course</th><th>Amount</th><th>Coupon</th><th>Gateway</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>{filteredPayments.map(p => (<tr key={p.id}><td><div className="sd-cell-name">{p.user_name || '-'}</div><div className="sd-cell-sub">{p.user_email}</div></td><td>{p.user_phone || '-'}</td><td>{p.course_title}</td><td>₹{(p.amount || 0).toLocaleString('en-IN')}{p.discount_amount > 0 && <div className="sd-cell-sub sd-discount">-₹{p.discount_amount}</div>}</td><td>{p.coupon_code ? <span className="sd-coupon-tag">{p.coupon_code}</span> : '-'}</td><td><span className="sd-gw-tag">{p.gateway}</span></td><td><span className={`sd-badge sd-badge-${p.status}`}>{p.status}</span></td><td>{p.paid_at ? new Date(p.paid_at).toLocaleString('en-IN') : '-'}</td></tr>))}
                {filteredPayments.length === 0 && <tr><td colSpan={8} className="sd-empty">No transactions found</td></tr>}
              </tbody></table></div></div>
          </div>
        )}

        {/* COURSE ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="sd-content">
            <h1 className="sd-page-title">Course Analytics</h1>
            <div className="sd-card"><h3 className="sd-card-title">Course Performance</h3>
              <div className="sd-table-wrap"><table className="sd-table"><thead><tr><th>Course</th><th>Enrollments</th><th>Revenue</th><th>Coupons</th></tr></thead>
                <tbody>{courseAnalytics.map((c, i) => (<tr key={i}><td className="sd-cell-name">{c.course_title}</td><td>{c.enrollments}</td><td style={{ color: '#16a34a', fontWeight: 'bold' }}>₹{c.revenue.toLocaleString('en-IN')}</td><td>{c.coupons}</td></tr>))}
                  {courseAnalytics.length === 0 && <tr><td colSpan={4} className="sd-empty">No data</td></tr>}
                </tbody></table></div>
            </div>
            <div className="sd-content-header" style={{ marginTop: '1.5rem' }}>
              <h3 className="sd-card-title" style={{ margin: 0 }}>Enrollments</h3>
              <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="sd-search" style={{ width: 'auto', minWidth: 250 }}>
                <option value="All Courses">All Courses</option>
                {courseAnalytics.map((c, i) => <option key={i} value={c.course_title}>{c.course_title}</option>)}
              </select>
            </div>
            <div className="sd-card"><div className="sd-table-wrap"><table className="sd-table"><thead><tr><th>Student</th><th>Contact</th><th>Course</th><th>Status</th><th>Coupon</th></tr></thead>
              <tbody>{payments.filter(p => selectedCourse === 'All Courses' || p.course_title === selectedCourse).map(p => (<tr key={p.id}><td className="sd-cell-name">{p.user_name || '-'}</td><td><div className="sd-cell-sub">{p.user_email}</div><div className="sd-cell-sub">{p.user_phone || '-'}</div></td><td style={{ fontSize: '0.8rem' }}>{p.course_title}</td><td><span className={`sd-badge sd-badge-${p.status}`}>{p.status}</span></td><td>{p.coupon_code ? <span className="sd-coupon-tag">{p.coupon_code}</span> : '-'}</td></tr>))}
                {payments.filter(p => selectedCourse === 'All Courses' || p.course_title === selectedCourse).length === 0 && <tr><td colSpan={5} className="sd-empty">No enrollments</td></tr>}
              </tbody></table></div></div>
          </div>
        )}

        {/* BUSINESS PAYMENTS */}
        {activeTab === 'biz-payments' && (
          <div className="sd-content">
            <h1 className="sd-page-title">Business Subscriptions & Payments</h1>
            <div className="sd-stats-grid">
              <div className="sd-stat-card"><p className="sd-stat-label">Total Subscribers</p><p className="sd-stat-value" style={{ color: '#3b82f6' }}>{bizStats.total}</p></div>
              <div className="sd-stat-card"><p className="sd-stat-label">Active Plans</p><p className="sd-stat-value" style={{ color: '#16a34a' }}>{bizStats.activeCount}</p></div>
              <div className="sd-stat-card"><p className="sd-stat-label">Business Revenue</p><p className="sd-stat-value" style={{ color: '#f59e0b' }}>₹{(bizStats.totalRevenue || 0).toLocaleString('en-IN')}</p></div>
              <div className="sd-stat-card"><p className="sd-stat-label">Pending Onboarding</p><p className="sd-stat-value" style={{ color: '#8b5cf6' }}>{bizStats.pendingOnboarding}</p></div>
            </div>
            <div className="sd-filter-tabs">
              {[{ k: 'all', l: 'All' }, { k: 'basic', l: 'Basic' }, { k: 'premium', l: 'Premium' }, { k: 'enterprise', l: 'Enterprise' }, { k: 'pending', l: 'Pending' }].map(f => (
                <button key={f.k} className={`sd-filter-tab ${bizFilter === f.k ? 'active' : ''}`} onClick={() => setBizFilter(f.k)}>{f.l}</button>
              ))}
            </div>
            <div className="sd-card"><div className="sd-table-wrap"><table className="sd-table"><thead><tr><th>User</th><th>Company</th><th>Plan</th><th>Amount</th><th>Payment ID</th><th>Status</th><th>Onboarding</th><th>Date</th></tr></thead>
              <tbody>{filteredBizSubs.map(s => (<tr key={s.id || s.user_id}><td><div className="sd-cell-name">{s.client_profiles?.full_name || '-'}</div><div className="sd-cell-sub">{s.client_profiles?.work_email || '-'}</div></td><td>{s.client_profiles?.company_name || '-'}</td><td><span className={`sd-badge sd-badge-${s.plan}`}>{s.plan}</span></td><td>₹{(s.amount_paid || 0).toLocaleString('en-IN')}</td><td style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{s.payment_id || '-'}</td><td><span className={`sd-badge sd-badge-${s.status}`}>{s.status}</span></td><td><span className={`sd-badge sd-badge-${s.onboarding_status}`}>{s.onboarding_status || 'pending'}</span></td><td>{s.updated_at ? new Date(s.updated_at).toLocaleDateString('en-IN') : '-'}</td></tr>))}
                {filteredBizSubs.length === 0 && <tr><td colSpan={8} className="sd-empty">No subscriptions found</td></tr>}
              </tbody></table></div></div>
          </div>
        )}

        {/* PLACEMENT APPLICATIONS */}
        {activeTab === 'placements' && (
          <div className="sd-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
              <h1 className="sd-page-title">🌎 Canada & USA Placement Applications</h1>
              <button className="sd-btn sd-btn-sm sd-btn-primary" onClick={loadPlacements}>🔄 Refresh</button>
            </div>
            <div className="sd-stats-grid" style={{ marginBottom: 20 }}>
              <div className="sd-stat-card"><p className="sd-stat-label">Total Applications</p><p className="sd-stat-value" style={{ color: '#3b82f6' }}>{placementStats.total}</p></div>
              <div className="sd-stat-card"><p className="sd-stat-label">New</p><p className="sd-stat-value" style={{ color: '#f59e0b' }}>{placementStats.new}</p></div>
              <div className="sd-stat-card"><p className="sd-stat-label">Reviewing</p><p className="sd-stat-value" style={{ color: '#8b5cf6' }}>{placementStats.reviewing}</p></div>
              <div className="sd-stat-card"><p className="sd-stat-label">Shortlisted</p><p className="sd-stat-value" style={{ color: '#3b82f6' }}>{placementStats.shortlisted}</p></div>
              <div className="sd-stat-card"><p className="sd-stat-label">Placed</p><p className="sd-stat-value" style={{ color: '#16a34a' }}>{placementStats.placed}</p></div>
            </div>
            <div className="sd-filter-tabs" style={{ marginBottom: 16 }}>
              {[{ k: 'all', l: 'All' }, { k: 'new', l: 'New' }, { k: 'reviewing', l: 'Reviewing' }, { k: 'shortlisted', l: 'Shortlisted' }, { k: 'placed', l: 'Placed' }].map(f => (
                <button key={f.k} className={`sd-filter-tab ${placementFilter === f.k ? 'active' : ''}`} onClick={() => setPlacementFilter(f.k)}>{f.l}</button>
              ))}
            </div>
            <div className="sd-card">
              <div className="sd-table-wrap">
                <table className="sd-table">
                  <thead><tr>
                    <th>Name</th><th>Email</th><th>Contact</th><th>Visa</th><th>Tech Skills</th><th>Location</th><th>Status</th><th>Date</th><th>Actions</th>
                  </tr></thead>
                  <tbody>
                    {placements.filter(a => placementFilter === 'all' || a.status === placementFilter).map(a => (
                      <tr key={a.id}>
                        <td><div className="sd-cell-name">{a.full_name}</div></td>
                        <td style={{ fontSize: '0.78rem' }}>{a.email}</td>
                        <td style={{ fontSize: '0.78rem' }}>{a.contact_number}</td>
                        <td><span className="sd-gw-tag" style={{ fontSize: '0.7rem' }}>{a.visa_status || '—'}</span></td>
                        <td style={{ maxWidth: 160, fontSize: '0.75rem', color: '#64748b' }}>{a.tech_skill_set || '—'}</td>
                        <td style={{ fontSize: '0.75rem' }}>{a.current_location || '—'}</td>
                        <td>
                          <select
                            value={a.status}
                            onChange={e => updatePlacementStatus(a.id, e.target.value)}
                            className="sd-badge"
                            style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '3px 8px', fontSize: '0.72rem', cursor: 'pointer', background: a.status === 'placed' ? '#d1fae5' : a.status === 'shortlisted' ? '#dbeafe' : a.status === 'reviewing' ? '#ede9fe' : '#fef3c7' }}
                          >
                            <option value="new">New</option>
                            <option value="reviewing">Reviewing</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="placed">Placed</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td style={{ fontSize: '0.75rem' }}>{new Date(a.created_at).toLocaleDateString('en-IN')}</td>
                        <td>
                          <button className="sd-btn sd-btn-sm sd-btn-info" onClick={() => setPlacementDetail(a)}>View</button>
                        </td>
                      </tr>
                    ))}
                    {placements.filter(a => placementFilter === 'all' || a.status === placementFilter).length === 0 && (
                      <tr><td colSpan={9} className="sd-empty">No placement applications found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detail Modal */}
            {placementDetail && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => { if (e.target === e.currentTarget) setPlacementDetail(null); }}>
                <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 700, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 30px 60px rgba(0,0,0,0.3)' }}>
                  <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', padding: '20px 24px', position: 'sticky', top: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ color: '#fff', margin: 0, fontSize: '1.1rem' }}>🌎 {placementDetail.full_name}</h3>
                        <p style={{ color: '#93c5fd', margin: '4px 0 0', fontSize: '0.8rem' }}>{placementDetail.email} · {placementDetail.visa_status}</p>
                      </div>
                      <button onClick={() => setPlacementDetail(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}>×</button>
                    </div>
                  </div>
                  <div style={{ padding: '20px 24px' }}>
                    {[
                      ['📍 Location', placementDetail.current_location], ['📞 Contact', placementDetail.contact_number],
                      ['📱 Alternate', placementDetail.alternate_contact], ['📧 Personal Email', placementDetail.personal_email],
                      ['🎂 Date of Birth', placementDetail.date_of_birth], ['🔑 SIN/SSN Last 4', placementDetail.sin_ssn_last4],
                      ['💼 Skype ID', placementDetail.skype_id], ['🌐 Citizenship', placementDetail.citizenship],
                      ['📅 Vendor Call Availability', placementDetail.vendor_call_availability],
                      ['💻 Tech Skills', placementDetail.tech_skill_set], ['🔗 LinkedIn', placementDetail.linkedin_url],
                      ['🔐 LinkedIn Password', placementDetail.linkedin_password], ['🔐 Email Password', placementDetail.email_password],
                      ['🎓 Master\'s Field', placementDetail.masters_field], ['🏛️ Master\'s University', placementDetail.masters_university],
                      ['📅 Master\'s Dates', placementDetail.masters_dates], ['📊 Master\'s GPA', placementDetail.masters_gpa],
                      ['🎓 Bachelor\'s Field', placementDetail.bachelors_field], ['🏛️ Bachelor\'s University', placementDetail.bachelors_university],
                      ['📅 Bachelor\'s Dates', placementDetail.bachelors_dates], ['📊 Bachelor\'s GPA', placementDetail.bachelors_gpa],
                      ['🚚 Open to Relocation', placementDetail.open_to_relocation ? 'Yes' : 'No'],
                      ['🌐 Portfolio/GitHub', placementDetail.portfolio_url],
                      ['🪪 ID Proof', placementDetail.id_proof_url ? <a href={placementDetail.id_proof_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>View Document</a> : 'Not uploaded'],
                    ].map(([label, value]) => value ? (
                      <div key={label} style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', padding: '8px 0', fontSize: '0.82rem', gap: 12 }}>
                        <span style={{ color: '#64748b', minWidth: 200, fontWeight: 500 }}>{label}</span>
                        <span style={{ color: '#1e293b', wordBreak: 'break-word' }}>{value}</span>
                      </div>
                    ) : null)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ENTERPRISE LEADS */}
        {activeTab === 'biz-leads' && (
          <div className="sd-content">
            <h1 className="sd-page-title">Enterprise Inquiries</h1>
            <div className="sd-stats-grid">
              <div className="sd-stat-card"><p className="sd-stat-label">New Leads</p><p className="sd-stat-value" style={{ color: '#3b82f6' }}>{leadStats.new}</p></div>
              <div className="sd-stat-card"><p className="sd-stat-label">Contacted</p><p className="sd-stat-value" style={{ color: '#8b5cf6' }}>{leadStats.contacted}</p></div>
              <div className="sd-stat-card"><p className="sd-stat-label">Converted</p><p className="sd-stat-value" style={{ color: '#16a34a' }}>{leadStats.converted}</p></div>
              <div className="sd-stat-card"><p className="sd-stat-label">Rejected</p><p className="sd-stat-value" style={{ color: '#ef4444' }}>{leadStats.rejected}</p></div>
            </div>
            <div className="sd-filter-tabs">
              {[{ k: 'all', l: 'All' }, { k: 'new', l: 'New' }, { k: 'contacted', l: 'Contacted' }, { k: 'converted', l: 'Converted' }, { k: 'rejected', l: 'Rejected' }].map(f => (
                <button key={f.k} className={`sd-filter-tab ${leadFilter === f.k ? 'active' : ''}`} onClick={() => setLeadFilter(f.k)}>{f.l}</button>
              ))}
            </div>
            <div className="sd-card"><div className="sd-table-wrap"><table className="sd-table"><thead><tr><th>Contact</th><th>Company</th><th>Product</th><th>Details</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>{filteredLeads.map(l => (<tr key={l.id}><td><div className="sd-cell-name">{l.full_name}</div><div className="sd-cell-sub">{l.email}</div><div className="sd-cell-sub">{l.phone || '-'}</div></td><td>{l.company || '-'}</td><td><span className="sd-gw-tag">{l.product_slug}</span></td><td style={{ maxWidth: 250, fontSize: '0.75rem', color: '#64748b' }}>{l.message || '-'}</td><td><span className={`sd-badge sd-badge-${l.status}`}>{l.status}</span></td><td>{new Date(l.created_at).toLocaleDateString('en-IN')}</td>
                <td><div className="sd-lead-actions">
                  {l.status === 'new' && <button className="sd-btn sd-btn-sm sd-btn-purple" onClick={() => updateLeadStatus(l.id, 'contacted')}>Contact</button>}
                  {(l.status === 'new' || l.status === 'contacted') && <button className="sd-btn sd-btn-sm sd-btn-success" onClick={() => updateLeadStatus(l.id, 'converted')}>Convert</button>}
                  {l.status !== 'rejected' && l.status !== 'converted' && <button className="sd-btn sd-btn-sm sd-btn-danger" onClick={() => updateLeadStatus(l.id, 'rejected')}>Reject</button>}
                </div></td></tr>))}
                {filteredLeads.length === 0 && <tr><td colSpan={7} className="sd-empty">No leads found</td></tr>}
              </tbody></table></div></div>
          </div>
        )}

        {/* PAYMENT SETTINGS */}
        {activeTab === 'settings' && (
          <div className="sd-content">
            <h1 className="sd-page-title">Payment Gateway Settings</h1>
            <div className="sd-card"><h3 className="sd-card-title">Configure Gateway</h3>
              <div className="sd-settings-form">
                <div className="sd-form-row">
                  <div className="sd-form-field"><label>Gateway</label><select value={gwName} onChange={e => setGwName(e.target.value)} className="sd-select"><option value="razorpay">Razorpay</option><option value="stripe">Stripe</option><option value="payu">PayU</option></select></div>
                  <div className="sd-form-field"><label>API Key</label><input type="text" value={gwKey} onChange={e => setGwKey(e.target.value)} placeholder="rzp_live_xxxxx" className="sd-input" /></div>
                  <div className="sd-form-field"><label>API Secret</label><input type="password" value={gwSecret} onChange={e => setGwSecret(e.target.value)} placeholder="Secret key" className="sd-input" /></div>
                </div>
                <button onClick={saveGateway} disabled={savingGw || !gwKey || !gwSecret} className="sd-btn sd-btn-primary">{savingGw ? 'Saving...' : 'Save Gateway'}</button>
              </div>
            </div>
            <div className="sd-card"><h3 className="sd-card-title">Configured Gateways</h3>
              {settings.length === 0 ? <p className="sd-empty-text">No gateways configured yet.</p> : (
                <div className="sd-gw-list">{settings.map(s => (
                  <div key={s.id} className={`sd-gw-item ${s.is_active ? 'sd-gw-active' : ''}`}>
                    <div className="sd-gw-info"><span className="sd-gw-name">{s.gateway_name.toUpperCase()}</span><span className="sd-gw-key">Key: {s.api_key.substring(0, 12)}...</span>{s.is_active && <span className="sd-badge sd-badge-success">ACTIVE</span>}</div>
                    <div className="sd-gw-actions">{!s.is_active && <button onClick={() => activateGateway(s.gateway_name)} className="sd-btn sd-btn-sm sd-btn-success">Activate</button>}<button onClick={() => deleteGateway(s.id)} className="sd-btn sd-btn-sm sd-btn-danger">Remove</button></div>
                  </div>
                ))}</div>
              )}
            </div>
          </div>
        )}

        {/* EMAIL TEMPLATES */}
        {activeTab === 'email-templates' && (
          <div className="sd-content">
            <h1 className="sd-page-title">Email Templates</h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 24 }}>Edit the emails that are automatically sent when users enroll. Use placeholders like <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{'{{'} full_name {'}}'}</code> for dynamic content.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20, padding: '12px 16px', background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: 10, fontSize: '0.75rem', color: '#15803d' }}>
              <strong>Available placeholders:</strong> {'{{full_name}}'}, {'{{organization}}'}, {'{{plan}}'}, {'{{product}}'}, {'{{transaction_id}}'}, {'{{work_email}}'}, {'{{billing_address}}'}, {'{{industry}}'}, {'{{company_size}}'}, {'{{country}}'}, {'{{phone}}'}, {'{{gst_number}}'}, {'{{date}}'}
            </div>
            {emailTemplates.map(tpl => (
              <div key={tpl.id} className="sd-card" style={{ border: editingTpl?.id === tpl.id ? '2px solid #16a34a' : undefined }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 className="sd-card-title" style={{ margin: 0 }}>{tpl.name}</h3>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '4px 0 0' }}>{tpl.description}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#64748b', cursor: 'pointer' }}>
                      <input type="checkbox" checked={editingTpl?.id === tpl.id ? editingTpl.is_active : tpl.is_active} onChange={e => {
                        if (editingTpl?.id === tpl.id) setEditingTpl({ ...editingTpl, is_active: e.target.checked });
                        else saveTemplate({ ...tpl, is_active: e.target.checked });
                      }} /> Active
                    </label>
                    {editingTpl?.id === tpl.id ? (
                      <>
                        <button className="sd-btn sd-btn-sm sd-btn-primary" disabled={tplSaving} onClick={() => saveTemplate(editingTpl)}>{tplSaving ? 'Saving...' : 'Save'}</button>
                        <button className="sd-btn sd-btn-sm sd-btn-danger" onClick={() => setEditingTpl(null)}>Cancel</button>
                      </>
                    ) : (
                      <button className="sd-btn sd-btn-sm sd-btn-info" onClick={() => setEditingTpl({ ...tpl })}>Edit</button>
                    )}
                  </div>
                </div>
                {editingTpl?.id === tpl.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="sd-form-field">
                      <label>Subject Line</label>
                      <input type="text" className="sd-input" value={editingTpl.subject} onChange={e => setEditingTpl({ ...editingTpl, subject: e.target.value })} />
                    </div>
                    <div className="sd-form-field">
                      <label>HTML Body</label>
                      <textarea className="sd-input" rows={16} style={{ fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.5 }} value={editingTpl.body_html} onChange={e => setEditingTpl({ ...editingTpl, body_html: e.target.value })} />
                    </div>
                    <div className="sd-card" style={{ padding: 16, background: '#f8fafc', marginTop: 8 }}>
                      <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase' }}>Preview</p>
                      <div dangerouslySetInnerHTML={{ __html: editingTpl.body_html.replace(/\{\{(\w+)\}\}/g, '<span style="background:#fef3c7;padding:1px 4px;border-radius:3px;font-size:11px;color:#92400e;">{{$1}}</span>') }} />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: '#64748b' }}>
                    <div><strong>Subject:</strong> {tpl.subject}</div>
                    <div style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#94a3b8' }}>Last updated: {tpl.updated_at ? new Date(tpl.updated_at).toLocaleString('en-IN') : '-'}</div>
                  </div>
                )}
              </div>
            ))}
            {emailTemplates.length === 0 && <div className="sd-card"><p className="sd-empty-text">No templates found. Run the migration-email-templates.sql in Supabase.</p></div>}
          </div>
        )}
      </main>
    </div>
  );
}
