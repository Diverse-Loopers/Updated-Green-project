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

  // Enrolled Placement Students (Active Clients)
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [enrolledStats, setEnrolledStats] = useState({ total: 0, active: 0, placed: 0, totalRevenue: 0, pendingDues: 0 });
  const [enrolledEmployees, setEnrolledEmployees] = useState([]);
  const [enrolledFilter, setEnrolledFilter] = useState('all');
  const [studentSearch, setStudentSearch] = useState('');
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isLogAppModalOpen, setIsLogAppModalOpen] = useState(false);
  const [isSendEmailModalOpen, setIsSendEmailModalOpen] = useState(false);
  const [selectedStudentForLog, setSelectedStudentForLog] = useState(null);
  const [selectedStudentForEmail, setSelectedStudentForEmail] = useState(null);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState(null);
  const [studentAppsList, setStudentAppsList] = useState([]);
  const [savingEnroll, setSavingEnroll] = useState(false);
  const [savingLog, setSavingLog] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [enrollMsg, setEnrollMsg] = useState('');
  const [uploadingMou, setUploadingMou] = useState(false);
  const [uploadingCreds, setUploadingCreds] = useState(false);

  const initialEnrollForm = {
    id: null,
    full_name: '',
    email: '',
    phone: '',
    target_roles: '',
    
    // Address
    country: 'India',
    state: '',
    city: '',
    zip_code: '',
    street_address: '',
    location: '',
    
    // Extended Profile
    marketing_email: '',
    personal_email: '',
    highest_qualification: 'Bachelor of Technology (B.Tech)',
    college_university: '',
    graduation_year: '2024',
    years_of_experience: 'Fresher (0-1 yrs)',
    tech_skills: '',
    linkedin_url: '',
    portfolio_url: '',
    
    // Google Sheets Tracker
    spreadsheet_url: '',
    
    // Service Dates
    service_start_date: new Date().toISOString().split('T')[0],
    service_end_date: '',
    
    // Multi-Assignee Teams
    marketing_person_ids: [],
    support_person_ids: [],
    hr_person_ids: [],
    manager_person_ids: [],
    marketing_person_id: '',
    support_person_id: '',
    hr_person_id: '',
    manager_person_id: '',
    
    // Multi-Installment Payment Schedule
    total_fee: '',
    amount_paid: '',
    payment_installments: [],
    payment_due_date: '',
    payment_link: '',
    
    // Documents
    mou_url: '',
    credentials_url: '',
    portal_password: '',
  };
  const [enrollForm, setEnrollForm] = useState(initialEnrollForm);

  const [appLogForm, setAppLogForm] = useState({
    student_id: '',
    applied_date: new Date().toISOString().split('T')[0],
    company_name: '',
    job_role: '',
    application_type: 'Easy Apply',
    job_url: '',
    status: 'applied',
    notes: '',
  });

  const [emailForm, setEmailForm] = useState({
    student_id: '',
    custom_message: '',
    payment_link_override: '',
  });

  // Device File Upload Handler
  const handleFileUpload = async (e, docType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (docType === 'mou') setUploadingMou(true);
    else setUploadingCreds(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('doc_type', docType);
      formData.append('student_name', enrollForm.full_name || 'student');

      const res = await fetch('/api/placement-program/upload-document', {
        method: 'POST',
        body: formData,
      }).then(r => r.json());

      if (res.success) {
        if (docType === 'mou') {
          setEnrollForm(prev => ({ ...prev, mou_url: res.url }));
        } else {
          setEnrollForm(prev => ({ ...prev, credentials_url: res.url }));
        }
      } else {
        alert(res.error || 'Failed to upload document.');
      }
    } catch (err) {
      alert('Upload error: ' + err.message);
    }

    if (docType === 'mou') setUploadingMou(false);
    else setUploadingCreds(false);
  };

  // Multi-Installments Handlers
  const addInstallment = () => {
    const newIdx = (enrollForm.payment_installments?.length || 0) + 1;
    const updated = [
      ...(enrollForm.payment_installments || []),
      { id: Date.now(), title: `Installment ${newIdx}`, amount: '', due_date: '', payment_link: '', status: 'due' }
    ];
    setEnrollForm(prev => ({
      ...prev,
      payment_installments: updated,
    }));
  };

  const removeInstallment = (index) => {
    const updated = [...(enrollForm.payment_installments || [])];
    updated.splice(index, 1);
    setEnrollForm(prev => ({
      ...prev,
      payment_installments: updated,
    }));
  };

  const updateInstallment = (index, field, value) => {
    const updated = [...(enrollForm.payment_installments || [])];
    updated[index] = { ...updated[index], [field]: value };
    setEnrollForm(prev => ({
      ...prev,
      payment_installments: updated,
    }));
  };

  const syncFeesFromInstallments = () => {
    const installments = enrollForm.payment_installments || [];
    const total = installments.reduce((sum, i) => sum + Number(i.amount || 0), 0);
    const paid = installments.filter(i => i.status === 'paid').reduce((sum, i) => sum + Number(i.amount || 0), 0);
    setEnrollForm(prev => ({
      ...prev,
      total_fee: total,
      amount_paid: paid
    }));
  };

  // Multi-Assignee Team Selection Handler
  const toggleTeamMember = (roleType, empId) => {
    const key = `${roleType}_person_ids`;
    const current = Array.isArray(enrollForm[key]) ? enrollForm[key] : [];
    let updated;
    if (current.includes(empId)) {
      updated = current.filter(id => id !== empId);
    } else {
      updated = [...current, empId];
    }
    setEnrollForm(prev => ({
      ...prev,
      [key]: updated,
      [`${roleType}_person_id`]: updated[0] || ''
    }));
  };

  useEffect(() => {
    // CEO iframe mode: inject token from URL
    const params = new URLSearchParams(window.location.search);
    const ceoToken = params.get('ceo_token');
    if (ceoToken) {
      sessionStorage.setItem('executive_token', ceoToken);
      try {
        const payload = JSON.parse(atob(ceoToken));
        sessionStorage.setItem('executive_session', JSON.stringify({ name: 'CEO', email: payload.email, role: payload.role }));
      } catch(e) {}
    }

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

  const loadEnrolledStudents = async () => {
    try {
      const res = await fetch('/api/placement-program/students', { headers: authHeaders() }).then(r => r.json());
      if (res.success) {
        setEnrolledStudents(res.students || []);
        setEnrolledStats(res.stats || { total: 0, active: 0, placed: 0, totalRevenue: 0, pendingDues: 0 });
        setEnrolledEmployees(res.employees || []);
      }
    } catch (err) {
      console.error('Error loading enrolled students:', err);
    }
  };

  useEffect(() => { if (activeTab === 'biz-payments' || activeTab === 'biz-leads') loadBizData(); }, [activeTab]);
  useEffect(() => { if (activeTab === 'email-templates') loadTemplates(); }, [activeTab]);
  useEffect(() => { if (activeTab === 'placements') loadPlacements(); }, [activeTab]);
  useEffect(() => { if (activeTab === 'enrolled-students') loadEnrolledStudents(); }, [activeTab]);

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

  // Enrolled Student Actions
  const handleSaveStudent = async (e) => {
    e.preventDefault();
    setSavingEnroll(true);
    setEnrollMsg('');
    try {
      const isEdit = Boolean(enrollForm.id);
      const url = '/api/placement-program/students';
      const method = isEdit ? 'PATCH' : 'POST';

      const payload = {
        ...enrollForm,
        total_fee: Number(enrollForm.total_fee || 0),
        amount_paid: Number(enrollForm.amount_paid || 0),
        payment_installments: (enrollForm.payment_installments || []).map(inst => ({
          ...inst,
          amount: Number(inst.amount || 0)
        }))
      };

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(payload)
      }).then(r => r.json());

      if (res.success) {
        setIsEnrollModalOpen(false);
        setEnrollForm(initialEnrollForm);
        loadEnrolledStudents();
        alert(isEdit ? 'Student updated successfully!' : 'Student enrolled successfully!');
      } else {
        setEnrollMsg(res.error || 'Failed to save student.');
      }
    } catch (err) {
      setEnrollMsg('Error saving student: ' + err.message);
    }
    setSavingEnroll(false);
  };

  const handleDeleteStudent = async (id, name) => {
    if (!confirm(`Are you sure you want to delete enrolled student ${name}? This will remove all their records.`)) return;
    try {
      const res = await fetch(`/api/placement-program/students?id=${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      }).then(r => r.json());
      if (res.success) {
        loadEnrolledStudents();
      } else {
        alert(res.error || 'Failed to delete student.');
      }
    } catch (err) {
      alert('Error deleting: ' + err.message);
    }
  };

  const handleUpdateStudentStatus = async (id, status) => {
    try {
      await fetch('/api/placement-program/students', {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ id, status })
      });
      loadEnrolledStudents();
    } catch (err) {
      console.error(err);
    }
  };

  const openLogAppModal = (student) => {
    setSelectedStudentForLog(student);
    setAppLogForm({
      student_id: student.id,
      applied_date: new Date().toISOString().split('T')[0],
      company_name: '',
      job_role: student.target_roles?.split(',')[0]?.trim() || 'Software Engineer',
      application_type: 'Easy Apply',
      job_url: '',
      status: 'applied',
      notes: '',
    });
    setIsLogAppModalOpen(true);
  };

  const handleSaveAppLog = async (e) => {
    e.preventDefault();
    setSavingLog(true);
    try {
      const res = await fetch('/api/placement-program/applications', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          ...appLogForm,
          logged_by: exec?.name || 'Sales Executive'
        })
      }).then(r => r.json());

      if (res.success) {
        setIsLogAppModalOpen(false);
        alert(`Application for ${appLogForm.company_name} logged successfully!`);
        if (selectedStudentForDetail && selectedStudentForDetail.id === appLogForm.student_id) {
          loadStudentApps(selectedStudentForDetail.id);
        }
      } else {
        alert(res.error || 'Failed to log application.');
      }
    } catch (err) {
      alert('Error logging application: ' + err.message);
    }
    setSavingLog(false);
  };

  const openSendEmailModal = (student) => {
    setSelectedStudentForEmail(student);
    setEmailForm({
      student_id: student.id,
      custom_message: `Your payment of ₹${Number(student.amount_due || 0).toLocaleString('en-IN')} is scheduled due on ${student.payment_due_date || 'this week'}.`,
      payment_link_override: student.payment_link || '',
    });
    setIsSendEmailModalOpen(true);
  };

  const handleSendPaymentReminder = async (e) => {
    e.preventDefault();
    setSendingEmail(true);
    try {
      const res = await fetch('/api/placement-program/send-payment-reminder', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(emailForm)
      }).then(r => r.json());

      if (res.success) {
        setIsSendEmailModalOpen(false);
        alert(res.message || 'Payment reminder email sent successfully!');
      } else {
        alert(res.error || 'Failed to send payment email.');
      }
    } catch (err) {
      alert('Error sending email: ' + err.message);
    }
    setSendingEmail(false);
  };

  const loadStudentApps = async (studentId) => {
    try {
      const res = await fetch(`/api/placement-program/applications?student_id=${studentId}`).then(r => r.json());
      if (res.success) {
        setStudentAppsList(res.applications || []);
      }
    } catch (err) {
      console.error('Error loading student applications:', err);
    }
  };

  const openStudentDetail = (student) => {
    setSelectedStudentForDetail(student);
    loadStudentApps(student.id);
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

  const filteredEnrolledStudents = enrolledStudents.filter(s => {
    const matchesFilter = enrolledFilter === 'all' ? true :
      enrolledFilter === 'due' ? (s.payment_status === 'due' || s.payment_status === 'partially_paid' || Number(s.amount_due || 0) > 0) :
      s.status === enrolledFilter;
    if (!matchesFilter) return false;
    if (!studentSearch) return true;
    const q = studentSearch.toLowerCase();
    return (s.full_name || '').toLowerCase().includes(q) ||
           (s.email || '').toLowerCase().includes(q) ||
           (s.student_id || '').toLowerCase().includes(q) ||
           (s.target_roles || '').toLowerCase().includes(q);
  });

  const maxChartValue = Math.max(...chart.map(c => c.revenue), 1);

  if (loading && !exec) return (<div className="sd-loading"><div className="sd-spinner"></div><p>Loading dashboard...</p></div>);

  const NAV_ITEMS = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'enrolled-students', label: 'Placement Enrolled Students', icon: '🎓' },
    { id: 'placements', label: 'Placement Applications', icon: '🌎' },
    { id: 'transactions', label: 'Transactions', icon: '💰' },
    { id: 'analytics', label: 'Course Analytics', icon: '📈' },
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

        {/* ENROLLED PLACEMENT STUDENTS */}
        {activeTab === 'enrolled-students' && (
          <div className="sd-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h1 className="sd-page-title">🎓 Placement Program Enrolled Students</h1>
                <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '4px 0 0' }}>Manage enrolled clients, assigned teams, service dates, payment schedules, and daily job application outreach.</p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="sd-btn sd-btn-sm sd-btn-info" onClick={loadEnrolledStudents}>🔄 Refresh</button>
                <button
                  className="sd-btn sd-btn-sm sd-btn-primary"
                  style={{ background: '#16a34a', borderColor: '#16a34a', fontWeight: 700 }}
                  onClick={() => {
                    setEnrollForm(initialEnrollForm);
                    setEnrollMsg('');
                    setIsEnrollModalOpen(true);
                  }}
                >
                  ➕ Enroll New Student
                </button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="sd-stats-grid" style={{ marginBottom: 20 }}>
              <div className="sd-stat-card"><p className="sd-stat-label">Total Enrolled</p><p className="sd-stat-value" style={{ color: '#3b82f6' }}>{enrolledStats.total}</p></div>
              <div className="sd-stat-card"><p className="sd-stat-label">Active Support</p><p className="sd-stat-value" style={{ color: '#10b981' }}>{enrolledStats.active}</p></div>
              <div className="sd-stat-card"><p className="sd-stat-label">Placed / Offers</p><p className="sd-stat-value" style={{ color: '#8b5cf6' }}>{enrolledStats.placed}</p></div>
              <div className="sd-stat-card"><p className="sd-stat-label">Total Revenue Paid</p><p className="sd-stat-value" style={{ color: '#16a34a' }}>₹{(enrolledStats.totalRevenue || 0).toLocaleString('en-IN')}</p></div>
              <div className="sd-stat-card"><p className="sd-stat-label">Pending Dues</p><p className="sd-stat-value" style={{ color: '#ef4444' }}>₹{(enrolledStats.pendingDues || 0).toLocaleString('en-IN')}</p></div>
            </div>

            {/* Search and Filters */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div className="sd-filter-tabs" style={{ margin: 0 }}>
                {[
                  { k: 'all', l: 'All Students' },
                  { k: 'active', l: 'Active' },
                  { k: 'placed', l: 'Placed' },
                  { k: 'due', l: '⚠️ Payment Due' },
                ].map(f => (
                  <button key={f.k} className={`sd-filter-tab ${enrolledFilter === f.k ? 'active' : ''}`} onClick={() => setEnrolledFilter(f.k)}>{f.l}</button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Search by student name, ID, role, or email..."
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                className="sd-search"
                style={{ width: '100%', maxWidth: 360 }}
              />
            </div>

            {/* Students Table */}
            <div className="sd-card">
              <div className="sd-table-wrap">
                <table className="sd-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Target Role & Service Period</th>
                      <th>Assigned Team</th>
                      <th>Payment Status</th>
                      <th>Documents</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEnrolledStudents.map(s => {
                      const startDate = s.service_start_date ? new Date(s.service_start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
                      const endDate = s.service_end_date ? new Date(s.service_end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Ongoing';
                      const isDue = Number(s.amount_due || 0) > 0;

                      return (
                        <tr key={s.id}>
                          <td>
                            <div className="sd-cell-name" style={{ cursor: 'pointer', color: '#2563eb' }} onClick={() => openStudentDetail(s)}>
                              {s.full_name}
                            </div>
                            <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#64748b' }}>{s.student_id}</div>
                            <div className="sd-cell-sub">{s.email}</div>
                            {s.phone && <div className="sd-cell-sub">📞 {s.phone}</div>}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#1e293b' }}>{s.target_roles || 'Software Developer'}</div>
                            <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: 3 }}>
                              🗓️ {startDate} &rarr; <span style={{ color: '#0f766e', fontWeight: 600 }}>{endDate}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.74rem', display: 'flex', flexDirection: 'column', gap: 3 }}>
                              <div>
                                <span style={{ color: '#64748b' }}>Marketing:</span>{' '}
                                <strong style={{ color: '#4f46e5' }}>
                                  {Array.isArray(s.marketing_person_ids) && s.marketing_person_ids.length > 0
                                    ? s.marketing_person_ids.join(', ')
                                    : s.marketing_person_id || 'None'}
                                </strong>
                              </div>
                              <div>
                                <span style={{ color: '#64748b' }}>HR:</span>{' '}
                                <strong>
                                  {Array.isArray(s.hr_person_ids) && s.hr_person_ids.length > 0
                                    ? s.hr_person_ids.join(', ')
                                    : s.hr_person_id || '—'}
                                </strong>
                              </div>
                              {s.spreadsheet_url && (
                                <a href={s.spreadsheet_url} target="_blank" rel="noopener noreferrer" style={{ color: '#059669', textDecoration: 'none', fontWeight: 600, fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                  📊 Open Tracker Sheet ↗
                                </a>
                              )}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.8rem' }}>
                              <div>Total: <strong>₹{Number(s.total_fee || 0).toLocaleString('en-IN')}</strong></div>
                              <div style={{ color: '#16a34a' }}>Paid: ₹{Number(s.amount_paid || 0).toLocaleString('en-IN')}</div>
                              {isDue ? (
                                <div style={{ color: '#dc2626', fontWeight: 700 }}>Due: ₹{Number(s.amount_due || 0).toLocaleString('en-IN')}</div>
                              ) : (
                                <div style={{ color: '#16a34a', fontWeight: 600 }}>✅ Fully Paid</div>
                              )}
                              {Array.isArray(s.payment_installments) && s.payment_installments.length > 0 && (
                                <div style={{ fontSize: '0.7rem', color: '#6366f1', marginTop: 2 }}>
                                  {s.payment_installments.length} installment{s.payment_installments.length > 1 ? 's' : ''} ({s.payment_installments.filter(i => i.status === 'paid').length} paid)
                                </div>
                              )}
                              {s.payment_due_date && <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Due: {s.payment_due_date}</div>}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              {s.mou_url ? (
                                <a href={s.mou_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600, textDecoration: 'none', background: '#eff6ff', padding: '2px 6px', borderRadius: 4, display: 'inline-block' }}>📄 MOU Document</a>
                              ) : (
                                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>No MOU</span>
                              )}
                              {s.credentials_url ? (
                                <a href={s.credentials_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600, textDecoration: 'none', background: '#ecfdf5', padding: '2px 6px', borderRadius: 4, display: 'inline-block' }}>🪪 Credentials/Resume</a>
                              ) : (
                                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>No Credentials</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <select
                              value={s.status || 'active'}
                              onChange={e => handleUpdateStudentStatus(s.id, e.target.value)}
                              className="sd-badge"
                              style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '3px 8px', fontSize: '0.72rem', cursor: 'pointer', background: s.status === 'placed' ? '#d1fae5' : s.status === 'active' ? '#dbeafe' : '#f1f5f9' }}
                            >
                              <option value="active">Active</option>
                              <option value="placed">Placed 🎉</option>
                              <option value="paused">Paused</option>
                              <option value="completed">Completed</option>
                            </select>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              <button
                                className="sd-btn sd-btn-sm sd-btn-primary"
                                style={{ fontSize: '0.72rem', padding: '3px 8px', background: '#2563eb' }}
                                onClick={() => openLogAppModal(s)}
                              >
                                📝 Log App
                              </button>
                              {isDue && (
                                <button
                                  className="sd-btn sd-btn-sm"
                                  style={{ fontSize: '0.72rem', padding: '3px 8px', background: '#f59e0b', color: '#fff', border: 'none' }}
                                  onClick={() => openSendEmailModal(s)}
                                >
                                  ✉️ Send Due Email
                                </button>
                              )}
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button
                                  className="sd-btn sd-btn-sm sd-btn-info"
                                  style={{ fontSize: '0.7rem', padding: '2px 6px' }}
                                  onClick={() => {
                                    setEnrollForm({
                                      id: s.id,
                                      full_name: s.full_name,
                                      email: s.email,
                                      phone: s.phone || '',
                                      target_roles: s.target_roles || '',
                                      
                                      country: s.country || 'India',
                                      state: s.state || '',
                                      city: s.city || '',
                                      zip_code: s.zip_code || '',
                                      street_address: s.street_address || '',
                                      location: s.location || '',
                                      
                                      marketing_email: s.marketing_email || '',
                                      personal_email: s.personal_email || s.email,
                                      highest_qualification: s.highest_qualification || 'Bachelor of Technology (B.Tech)',
                                      college_university: s.college_university || '',
                                      graduation_year: s.graduation_year || '2024',
                                      years_of_experience: s.years_of_experience || 'Fresher (0-1 yrs)',
                                      tech_skills: s.tech_skills || '',
                                      linkedin_url: s.linkedin_url || '',
                                      portfolio_url: s.portfolio_url || '',
                                      
                                      spreadsheet_url: s.spreadsheet_url || '',
                                      
                                      service_start_date: s.service_start_date || '',
                                      service_end_date: s.service_end_date || '',
                                      
                                      marketing_person_ids: Array.isArray(s.marketing_person_ids) ? s.marketing_person_ids : (s.marketing_person_id ? [s.marketing_person_id] : []),
                                      support_person_ids: Array.isArray(s.support_person_ids) ? s.support_person_ids : (s.support_person_id ? [s.support_person_id] : []),
                                      hr_person_ids: Array.isArray(s.hr_person_ids) ? s.hr_person_ids : (s.hr_person_id ? [s.hr_person_id] : []),
                                      manager_person_ids: Array.isArray(s.manager_person_ids) ? s.manager_person_ids : (s.manager_person_id ? [s.manager_person_id] : []),
                                      marketing_person_id: s.marketing_person_id || '',
                                      support_person_id: s.support_person_id || '',
                                      hr_person_id: s.hr_person_id || '',
                                      manager_person_id: s.manager_person_id || '',
                                      
                                      total_fee: s.total_fee || 0,
                                      amount_paid: s.amount_paid || 0,
                                      payment_installments: Array.isArray(s.payment_installments) && s.payment_installments.length > 0
                                        ? s.payment_installments
                                        : [
                                            { id: 1, title: 'Installment 1', amount: s.amount_paid || 0, due_date: s.payment_due_date || '', payment_link: s.payment_link || '', status: Number(s.amount_paid || 0) >= Number(s.total_fee || 0) ? 'paid' : 'paid' },
                                            { id: 2, title: 'Installment 2', amount: Number(s.amount_due || 0), due_date: s.payment_due_date || '', payment_link: s.payment_link || '', status: 'due' }
                                          ],
                                      payment_due_date: s.payment_due_date || '',
                                      payment_link: s.payment_link || '',
                                      mou_url: s.mou_url || '',
                                      credentials_url: s.credentials_url || '',
                                      portal_password: s.portal_password || '',
                                    });
                                    setIsEnrollModalOpen(true);
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  className="sd-btn sd-btn-sm sd-btn-danger"
                                  style={{ fontSize: '0.7rem', padding: '2px 6px' }}
                                  onClick={() => handleDeleteStudent(s.id, s.full_name)}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredEnrolledStudents.length === 0 && (
                      <tr><td colSpan={7} className="sd-empty">No enrolled placement students found. Click "Enroll New Student" to get started.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MODAL 1: Enroll / Edit Student Modal */}
            {isEnrollModalOpen && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => { if (e.target === e.currentTarget) setIsEnrollModalOpen(false); }}>
                <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 740, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 30px 60px rgba(0,0,0,0.3)' }}>
                  <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '20px 24px', position: 'sticky', top: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ color: '#fff', margin: 0, fontSize: '1.15rem' }}>{enrollForm.id ? '✏️ Edit Enrolled Student' : '🎓 Enroll Placement Program Student'}</h3>
                      <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: '0.78rem' }}>Set up client profile, dedicated team, service dates, payment schedule, and MOU documents</p>
                    </div>
                    <button onClick={() => setIsEnrollModalOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 18 }}>×</button>
                  </div>

                  <form onSubmit={handleSaveStudent} style={{ padding: '24px' }}>
                    {enrollMsg && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: '0.85rem' }}>{enrollMsg}</div>}

                    {/* Section 1: Basic Info & Contact */}
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid #e2e8f0' }}>👤 Student Information & Contact</div>
                    <div className="sd-settings-form" style={{ marginBottom: 20 }}>
                      <div className="sd-form-row">
                        <div className="sd-form-field">
                          <label>Full Name *</label>
                          <input type="text" required className="sd-input" placeholder="e.g. Rahul Sharma" value={enrollForm.full_name} onChange={e => setEnrollForm({ ...enrollForm, full_name: e.target.value })} />
                        </div>
                        <div className="sd-form-field">
                          <label>Primary / Portal Login Email *</label>
                          <input type="email" required className="sd-input" placeholder="student@gmail.com" value={enrollForm.email} onChange={e => setEnrollForm({ ...enrollForm, email: e.target.value })} />
                        </div>
                      </div>
                      <div className="sd-form-row">
                        <div className="sd-form-field">
                          <label>Marketing Email (for job applications)</label>
                          <input type="email" className="sd-input" placeholder="e.g. rahul.marketing@gmail.com" value={enrollForm.marketing_email} onChange={e => setEnrollForm({ ...enrollForm, marketing_email: e.target.value })} />
                        </div>
                        <div className="sd-form-field">
                          <label>Phone / WhatsApp *</label>
                          <input type="text" className="sd-input" placeholder="+91 9876543210" value={enrollForm.phone} onChange={e => setEnrollForm({ ...enrollForm, phone: e.target.value })} />
                        </div>
                      </div>
                      <div className="sd-form-row">
                        <div className="sd-form-field">
                          <label>Target Job Roles</label>
                          <input type="text" className="sd-input" placeholder="e.g. Full Stack Developer, Data Analyst" value={enrollForm.target_roles} onChange={e => setEnrollForm({ ...enrollForm, target_roles: e.target.value })} />
                        </div>
                        <div className="sd-form-field">
                          <label>Student Portal Password</label>
                          <input type="text" className="sd-input" placeholder="e.g. Student@123" value={enrollForm.portal_password} onChange={e => setEnrollForm({ ...enrollForm, portal_password: e.target.value })} />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Full Address */}
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid #e2e8f0' }}>📍 Full Residential Address</div>
                    <div className="sd-settings-form" style={{ marginBottom: 20 }}>
                      <div className="sd-form-row">
                        <div className="sd-form-field">
                          <label>Country *</label>
                          <select className="sd-select" value={enrollForm.country} onChange={e => setEnrollForm({ ...enrollForm, country: e.target.value })}>
                            <option value="India">India</option>
                            <option value="United States">United States</option>
                            <option value="Canada">Canada</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Germany">Germany</option>
                            <option value="Australia">Australia</option>
                            <option value="United Arab Emirates">United Arab Emirates</option>
                            <option value="Singapore">Singapore</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="sd-form-field">
                          <label>State / Province</label>
                          <input type="text" className="sd-input" placeholder="e.g. Karnataka / California / Ontario" value={enrollForm.state} onChange={e => setEnrollForm({ ...enrollForm, state: e.target.value })} />
                        </div>
                      </div>
                      <div className="sd-form-row">
                        <div className="sd-form-field">
                          <label>City *</label>
                          <input type="text" className="sd-input" placeholder="e.g. Bangalore" value={enrollForm.city} onChange={e => setEnrollForm({ ...enrollForm, city: e.target.value })} />
                        </div>
                        <div className="sd-form-field">
                          <label>Zip / Postal Code</label>
                          <input type="text" className="sd-input" placeholder="e.g. 560001" value={enrollForm.zip_code} onChange={e => setEnrollForm({ ...enrollForm, zip_code: e.target.value })} />
                        </div>
                      </div>
                      <div className="sd-form-field">
                        <label>Street Address / House No.</label>
                        <input type="text" className="sd-input" placeholder="e.g. #42, 5th Cross, Indiranagar" value={enrollForm.street_address} onChange={e => setEnrollForm({ ...enrollForm, street_address: e.target.value })} />
                      </div>
                    </div>

                    {/* Section 3: Educational Background & Profiles */}
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid #e2e8f0' }}>🎓 Educational Background & Profiles</div>
                    <div className="sd-settings-form" style={{ marginBottom: 20 }}>
                      <div className="sd-form-row">
                        <div className="sd-form-field">
                          <label>Highest Qualification</label>
                          <input type="text" className="sd-input" placeholder="e.g. B.Tech Computer Science / M.S. Software" value={enrollForm.highest_qualification} onChange={e => setEnrollForm({ ...enrollForm, highest_qualification: e.target.value })} />
                        </div>
                        <div className="sd-form-field">
                          <label>College / University</label>
                          <input type="text" className="sd-input" placeholder="e.g. VTU / Delhi University" value={enrollForm.college_university} onChange={e => setEnrollForm({ ...enrollForm, college_university: e.target.value })} />
                        </div>
                      </div>
                      <div className="sd-form-row">
                        <div className="sd-form-field">
                          <label>Graduation Year</label>
                          <input type="text" className="sd-input" placeholder="e.g. 2024" value={enrollForm.graduation_year} onChange={e => setEnrollForm({ ...enrollForm, graduation_year: e.target.value })} />
                        </div>
                        <div className="sd-form-field">
                          <label>Years of Experience</label>
                          <select className="sd-select" value={enrollForm.years_of_experience} onChange={e => setEnrollForm({ ...enrollForm, years_of_experience: e.target.value })}>
                            <option value="Fresher (0-1 yrs)">Fresher (0-1 yrs)</option>
                            <option value="1-2 Years">1-2 Years</option>
                            <option value="3-5 Years">3-5 Years</option>
                            <option value="5+ Years">5+ Years</option>
                          </select>
                        </div>
                      </div>
                      <div className="sd-form-row">
                        <div className="sd-form-field">
                          <label>LinkedIn Profile URL</label>
                          <input type="url" className="sd-input" placeholder="https://linkedin.com/in/..." value={enrollForm.linkedin_url} onChange={e => setEnrollForm({ ...enrollForm, linkedin_url: e.target.value })} />
                        </div>
                        <div className="sd-form-field">
                          <label>GitHub / Portfolio URL</label>
                          <input type="url" className="sd-input" placeholder="https://github.com/..." value={enrollForm.portfolio_url} onChange={e => setEnrollForm({ ...enrollForm, portfolio_url: e.target.value })} />
                        </div>
                      </div>
                      <div className="sd-form-field">
                        <label>Technical Skills Summary</label>
                        <input type="text" className="sd-input" placeholder="e.g. React, Node.js, Python, AWS, Docker, SQL" value={enrollForm.tech_skills} onChange={e => setEnrollForm({ ...enrollForm, tech_skills: e.target.value })} />
                      </div>
                    </div>

                    {/* Section 4: Service Duration & Google Sheets Tracker */}
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid #e2e8f0' }}>🗓️ Service Duration & Google Sheets Tracker</div>
                    <div className="sd-settings-form" style={{ marginBottom: 20 }}>
                      <div className="sd-form-row">
                        <div className="sd-form-field">
                          <label>Service Start Date *</label>
                          <input type="date" required className="sd-input" value={enrollForm.service_start_date} onChange={e => setEnrollForm({ ...enrollForm, service_start_date: e.target.value })} />
                        </div>
                        <div className="sd-form-field">
                          <label>Service End Date *</label>
                          <input type="date" required className="sd-input" value={enrollForm.service_end_date} onChange={e => setEnrollForm({ ...enrollForm, service_end_date: e.target.value })} />
                        </div>
                      </div>
                      <div className="sd-form-field">
                        <label>📊 Google Spreadsheet Tracker Link (For Marketing & HR Team Daily Updates) *</label>
                        <input type="url" className="sd-input" placeholder="https://docs.google.com/spreadsheets/d/1xxxx..." value={enrollForm.spreadsheet_url} onChange={e => setEnrollForm({ ...enrollForm, spreadsheet_url: e.target.value })} />
                        <p style={{ fontSize: '0.73rem', color: '#64748b', margin: '4px 0 0' }}>This spreadsheet link will be automatically pinned on the assigned marketing employees' dashboards as a daily task.</p>
                      </div>
                    </div>

                    {/* Section 5: Dedicated Team Assignment (Multi-Assignees) */}
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #e2e8f0' }}>
                      👥 Dedicated Team Assignment (Select One or More Employees)
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 16 }}>Select team members for each role. You can select multiple marketing persons (e.g. 2 or 3) and HRs.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                      {/* Marketing Persons Multi-select */}
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e293b', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                          <span>🎯 Marketing Person(s) *</span>
                          <span style={{ color: '#2563eb', fontSize: '0.75rem' }}>{enrollForm.marketing_person_ids?.length || 0} selected</span>
                        </div>
                        <div style={{ maxHeight: 150, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {enrolledEmployees.map(emp => {
                            const isSelected = enrollForm.marketing_person_ids?.includes(emp.employee_id);
                            return (
                              <label key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', cursor: 'pointer', background: isSelected ? '#eff6ff' : '#fff', padding: '6px 8px', borderRadius: 6, border: isSelected ? '1px solid #93c5fd' : '1px solid #e2e8f0' }}>
                                <input type="checkbox" checked={Boolean(isSelected)} onChange={() => toggleTeamMember('marketing', emp.employee_id)} />
                                <div>
                                  <strong style={{ color: '#0f172a' }}>{emp.full_name}</strong>
                                  <span style={{ color: '#64748b', marginLeft: 4, fontFamily: 'monospace' }}>({emp.employee_id})</span>
                                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{emp.designation || emp.role}</div>
                                </div>
                              </label>
                            );
                          })}
                          {enrolledEmployees.length === 0 && <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No employees found.</p>}
                        </div>
                      </div>

                      {/* HR Representatives Multi-select */}
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e293b', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                          <span>🤝 HR Representative(s)</span>
                          <span style={{ color: '#059669', fontSize: '0.75rem' }}>{enrollForm.hr_person_ids?.length || 0} selected</span>
                        </div>
                        <div style={{ maxHeight: 150, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {enrolledEmployees.map(emp => {
                            const isSelected = enrollForm.hr_person_ids?.includes(emp.employee_id);
                            return (
                              <label key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', cursor: 'pointer', background: isSelected ? '#ecfdf5' : '#fff', padding: '6px 8px', borderRadius: 6, border: isSelected ? '1px solid #a7f3d0' : '1px solid #e2e8f0' }}>
                                <input type="checkbox" checked={Boolean(isSelected)} onChange={() => toggleTeamMember('hr', emp.employee_id)} />
                                <div>
                                  <strong style={{ color: '#0f172a' }}>{emp.full_name}</strong>
                                  <span style={{ color: '#64748b', marginLeft: 4, fontFamily: 'monospace' }}>({emp.employee_id})</span>
                                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{emp.designation || emp.role}</div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Support Leads Multi-select */}
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e293b', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                          <span>🛟 Placement Support Lead(s)</span>
                          <span style={{ color: '#d97706', fontSize: '0.75rem' }}>{enrollForm.support_person_ids?.length || 0} selected</span>
                        </div>
                        <div style={{ maxHeight: 150, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {enrolledEmployees.map(emp => {
                            const isSelected = enrollForm.support_person_ids?.includes(emp.employee_id);
                            return (
                              <label key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', cursor: 'pointer', background: isSelected ? '#fffbeb' : '#fff', padding: '6px 8px', borderRadius: 6, border: isSelected ? '1px solid #fde68a' : '1px solid #e2e8f0' }}>
                                <input type="checkbox" checked={Boolean(isSelected)} onChange={() => toggleTeamMember('support', emp.employee_id)} />
                                <div>
                                  <strong style={{ color: '#0f172a' }}>{emp.full_name}</strong>
                                  <span style={{ color: '#64748b', marginLeft: 4, fontFamily: 'monospace' }}>({emp.employee_id})</span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Program Managers Multi-select */}
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e293b', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                          <span>👔 Program Manager(s)</span>
                          <span style={{ color: '#7c3aed', fontSize: '0.75rem' }}>{enrollForm.manager_person_ids?.length || 0} selected</span>
                        </div>
                        <div style={{ maxHeight: 150, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {enrolledEmployees.map(emp => {
                            const isSelected = enrollForm.manager_person_ids?.includes(emp.employee_id);
                            return (
                              <label key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', cursor: 'pointer', background: isSelected ? '#f5f3ff' : '#fff', padding: '6px 8px', borderRadius: 6, border: isSelected ? '1px solid #ddd6fe' : '1px solid #e2e8f0' }}>
                                <input type="checkbox" checked={Boolean(isSelected)} onChange={() => toggleTeamMember('manager', emp.employee_id)} />
                                <div>
                                  <strong style={{ color: '#0f172a' }}>{emp.full_name}</strong>
                                  <span style={{ color: '#64748b', marginLeft: 4, fontFamily: 'monospace' }}>({emp.employee_id})</span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Section 6: Program Fee & Multi-Installment Payment Schedule */}
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>💰 Program Fee & Payment Schedule</span>
                      <button type="button" onClick={addInstallment} className="sd-btn sd-btn-sm sd-btn-primary" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                        ➕ Add Installment Milestone
                      </button>
                    </div>

                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                      <div className="sd-settings-form" style={{ marginBottom: 14 }}>
                        <div className="sd-form-row">
                          <div className="sd-form-field">
                            <label style={{ fontWeight: 700 }}>Total Program Fee (₹) *</label>
                            <input
                              type="number"
                              required
                              min="0"
                              placeholder="e.g. 50000"
                              className="sd-input"
                              value={enrollForm.total_fee}
                              onChange={e => setEnrollForm({ ...enrollForm, total_fee: e.target.value })}
                            />
                          </div>
                          <div className="sd-form-field">
                            <label style={{ fontWeight: 700 }}>Initial Amount Paid (₹)</label>
                            <input
                              type="number"
                              min="0"
                              placeholder="e.g. 25000 (0 if unpaid)"
                              className="sd-input"
                              value={enrollForm.amount_paid}
                              onChange={e => setEnrollForm({ ...enrollForm, amount_paid: e.target.value })}
                            />
                          </div>
                          <div className="sd-form-field">
                            <label style={{ fontWeight: 700 }}>Remaining Due (₹)</label>
                            <div style={{ padding: '8px 12px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, fontWeight: 700, color: (Number(enrollForm.total_fee || 0) - Number(enrollForm.amount_paid || 0)) > 0 ? '#dc2626' : '#16a34a', fontSize: '0.95rem' }}>
                              ₹{Math.max(0, Number(enrollForm.total_fee || 0) - Number(enrollForm.amount_paid || 0)).toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>

                        <div className="sd-form-row">
                          <div className="sd-form-field">
                            <label>Payment Due Date</label>
                            <input
                              type="date"
                              className="sd-input"
                              value={enrollForm.payment_due_date}
                              onChange={e => setEnrollForm({ ...enrollForm, payment_due_date: e.target.value })}
                            />
                          </div>
                          <div className="sd-form-field">
                            <label>Direct Payment Link (Razorpay / Gateway)</label>
                            <input
                              type="url"
                              placeholder="https://rzp.io/l/..."
                              className="sd-input"
                              value={enrollForm.payment_link}
                              onChange={e => setEnrollForm({ ...enrollForm, payment_link: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Optional Installments List */}
                      {enrollForm.payment_installments && enrollForm.payment_installments.length > 0 && (
                        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: 14, marginTop: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                              📑 Installment Milestones Breakdown ({enrollForm.payment_installments.length})
                            </div>
                            <button type="button" onClick={syncFeesFromInstallments} style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '3px 8px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
                              🔄 Auto-calculate Total & Paid from Installments
                            </button>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {enrollForm.payment_installments.map((inst, idx) => (
                              <div key={inst.id || idx} style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, padding: 10, display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1.2fr 2fr auto', gap: 8, alignItems: 'center' }}>
                                <div>
                                  <label style={{ fontSize: '0.68rem', color: '#64748b' }}>Title / Milestone</label>
                                  <input type="text" className="sd-input" style={{ fontSize: '0.78rem', padding: '5px 8px' }} value={inst.title} onChange={e => updateInstallment(idx, 'title', e.target.value)} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.68rem', color: '#64748b' }}>Amount (₹)</label>
                                  <input type="number" className="sd-input" style={{ fontSize: '0.78rem', padding: '5px 8px' }} value={inst.amount} onChange={e => updateInstallment(idx, 'amount', e.target.value)} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.68rem', color: '#64748b' }}>Due Date</label>
                                  <input type="date" className="sd-input" style={{ fontSize: '0.78rem', padding: '5px 8px' }} value={inst.due_date} onChange={e => updateInstallment(idx, 'due_date', e.target.value)} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.68rem', color: '#64748b' }}>Status</label>
                                  <select className="sd-select" style={{ fontSize: '0.78rem', padding: '5px 8px' }} value={inst.status} onChange={e => updateInstallment(idx, 'status', e.target.value)}>
                                    <option value="paid">Paid ✅</option>
                                    <option value="due">Due ⚠️</option>
                                    <option value="partially_paid">Partially Paid</option>
                                  </select>
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.68rem', color: '#64748b' }}>Payment Link</label>
                                  <input type="url" placeholder="https://rzp.io/..." className="sd-input" style={{ fontSize: '0.78rem', padding: '5px 8px' }} value={inst.payment_link} onChange={e => updateInstallment(idx, 'payment_link', e.target.value)} />
                                </div>
                                <div style={{ alignSelf: 'flex-end' }}>
                                  <button type="button" onClick={() => removeInstallment(idx)} style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: '0.75rem' }}>✕</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Section 7: Mandatory Documents Direct Device Upload */}
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid #e2e8f0' }}>📄 Mandatory Document Uploads (Direct from Device)</div>
                    <div className="sd-settings-form" style={{ marginBottom: 20 }}>
                      <div className="sd-form-row">
                        {/* MOU Upload */}
                        <div className="sd-form-field" style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                          <label style={{ fontWeight: 700 }}>📜 Signed MOU Document *</label>
                          <input type="file" accept=".pdf,.doc,.docx,image/*" onChange={e => handleFileUpload(e, 'mou')} style={{ marginTop: 6, fontSize: '0.8rem' }} />
                          {uploadingMou && <p style={{ color: '#2563eb', fontSize: '0.75rem', marginTop: 4 }}>⏳ Uploading MOU file from device...</p>}
                          {enrollForm.mou_url && (
                            <div style={{ marginTop: 6, fontSize: '0.75rem', color: '#059669', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>✅ File uploaded</span>
                              <a href={enrollForm.mou_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>View File ↗</a>
                            </div>
                          )}
                        </div>

                        {/* Credentials / Resume Upload */}
                        <div className="sd-form-field" style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                          <label style={{ fontWeight: 700 }}>🪪 Credentials & Resume Document *</label>
                          <input type="file" accept=".pdf,.doc,.docx,image/*" onChange={e => handleFileUpload(e, 'credentials')} style={{ marginTop: 6, fontSize: '0.8rem' }} />
                          {uploadingCreds && <p style={{ color: '#2563eb', fontSize: '0.75rem', marginTop: 4 }}>⏳ Uploading Credentials file from device...</p>}
                          {enrollForm.credentials_url && (
                            <div style={{ marginTop: 6, fontSize: '0.75rem', color: '#059669', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>✅ File uploaded</span>
                              <a href={enrollForm.credentials_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>View File ↗</a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, position: 'sticky', bottom: 0, background: '#fff', padding: '14px 0', borderTop: '1px solid #e2e8f0' }}>
                      <button type="button" className="sd-btn sd-btn-danger" onClick={() => setIsEnrollModalOpen(false)}>Cancel</button>
                      <button type="submit" disabled={savingEnroll || uploadingMou || uploadingCreds} className="sd-btn sd-btn-primary" style={{ background: '#16a34a', borderColor: '#16a34a', padding: '10px 24px', fontWeight: 700 }}>
                        {savingEnroll ? 'Saving Student...' : enrollForm.id ? 'Update Student Record' : 'Enroll Student'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL 2: Log Daily Application Modal */}
            {isLogAppModalOpen && selectedStudentForLog && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => { if (e.target === e.currentTarget) setIsLogAppModalOpen(false); }}>
                <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560, boxShadow: '0 30px 60px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
                  <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ color: '#fff', margin: 0, fontSize: '1.1rem' }}>📝 Log Job Application</h3>
                      <p style={{ color: '#93c5fd', margin: '3px 0 0', fontSize: '0.78rem' }}>For student: <strong>{selectedStudentForLog.full_name}</strong> ({selectedStudentForLog.student_id})</p>
                    </div>
                    <button onClick={() => setIsLogAppModalOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}>×</button>
                  </div>
                  <form onSubmit={handleSaveAppLog} style={{ padding: '20px 24px' }}>
                    <div className="sd-form-field" style={{ marginBottom: 12 }}>
                      <label>Applied Date *</label>
                      <input type="date" required className="sd-input" value={appLogForm.applied_date} onChange={e => setAppLogForm({ ...appLogForm, applied_date: e.target.value })} />
                    </div>
                    <div className="sd-form-field" style={{ marginBottom: 12 }}>
                      <label>Company Name *</label>
                      <input type="text" required placeholder="e.g. Google / Microsoft / Startup" className="sd-input" value={appLogForm.company_name} onChange={e => setAppLogForm({ ...appLogForm, company_name: e.target.value })} />
                    </div>
                    <div className="sd-form-field" style={{ marginBottom: 12 }}>
                      <label>Job Role *</label>
                      <input type="text" required placeholder="e.g. Frontend Engineer" className="sd-input" value={appLogForm.job_role} onChange={e => setAppLogForm({ ...appLogForm, job_role: e.target.value })} />
                    </div>
                    <div className="sd-form-field" style={{ marginBottom: 12 }}>
                      <label>Application Type *</label>
                      <select className="sd-select" value={appLogForm.application_type} onChange={e => setAppLogForm({ ...appLogForm, application_type: e.target.value })}>
                        <option value="Easy Apply">⚡ Easy Apply (LinkedIn / Indeed 1-click)</option>
                        <option value="Long Form / Portal">📋 Long Form / Portal (Workday, Taleo, Greenhouse)</option>
                        <option value="Referral">🤝 Referral / Internal Outreach</option>
                        <option value="Email Outreach">✉️ Direct Recruiter Email</option>
                      </select>
                    </div>
                    <div className="sd-form-field" style={{ marginBottom: 12 }}>
                      <label>Job Posting URL</label>
                      <input type="url" placeholder="https://linkedin.com/jobs/view/..." className="sd-input" value={appLogForm.job_url} onChange={e => setAppLogForm({ ...appLogForm, job_url: e.target.value })} />
                    </div>
                    <div className="sd-form-field" style={{ marginBottom: 16 }}>
                      <label>Notes / Status</label>
                      <input type="text" placeholder="e.g. Applied with tailored resume v2" className="sd-input" value={appLogForm.notes} onChange={e => setAppLogForm({ ...appLogForm, notes: e.target.value })} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                      <button type="button" className="sd-btn sd-btn-danger" onClick={() => setIsLogAppModalOpen(false)}>Cancel</button>
                      <button type="submit" disabled={savingLog} className="sd-btn sd-btn-primary">{savingLog ? 'Saving...' : 'Save Application'}</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL 3: Send Payment Reminder Email Modal */}
            {isSendEmailModalOpen && selectedStudentForEmail && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => { if (e.target === e.currentTarget) setIsSendEmailModalOpen(false); }}>
                <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560, boxShadow: '0 30px 60px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
                  <div style={{ background: 'linear-gradient(135deg, #b45309, #d97706)', padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ color: '#fff', margin: 0, fontSize: '1.1rem' }}>✉️ Send Payment Due Reminder</h3>
                      <p style={{ color: '#fef3c7', margin: '3px 0 0', fontSize: '0.78rem' }}>Direct email notification to {selectedStudentForEmail.full_name}</p>
                    </div>
                    <button onClick={() => setIsSendEmailModalOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}>×</button>
                  </div>
                  <form onSubmit={handleSendPaymentReminder} style={{ padding: '20px 24px' }}>
                    <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 10, padding: '14px', marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                        <span style={{ color: '#64748b' }}>Recipient:</span>
                        <strong>{selectedStudentForEmail.email}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                        <span style={{ color: '#64748b' }}>Due Amount:</span>
                        <strong style={{ color: '#dc2626' }}>₹{Number(selectedStudentForEmail.amount_due || 0).toLocaleString('en-IN')}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <span style={{ color: '#64748b' }}>Scheduled Due Date:</span>
                        <strong>{selectedStudentForEmail.payment_due_date || 'Immediate'}</strong>
                      </div>
                    </div>

                    <div className="sd-form-field" style={{ marginBottom: 12 }}>
                      <label>Payment Gateway Link *</label>
                      <input type="url" required placeholder="https://rzp.io/l/xxxxx" className="sd-input" value={emailForm.payment_link_override} onChange={e => setEmailForm({ ...emailForm, payment_link_override: e.target.value })} />
                    </div>

                    <div className="sd-form-field" style={{ marginBottom: 16 }}>
                      <label>Custom Note / Message for Student</label>
                      <textarea rows={3} className="sd-input" value={emailForm.custom_message} onChange={e => setEmailForm({ ...emailForm, custom_message: e.target.value })} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                      <button type="button" className="sd-btn sd-btn-danger" onClick={() => setIsSendEmailModalOpen(false)}>Cancel</button>
                      <button type="submit" disabled={sendingEmail} className="sd-btn sd-btn-primary" style={{ background: '#d97706', borderColor: '#d97706' }}>
                        {sendingEmail ? 'Sending Email...' : 'Send Reminder Email'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL 4: Student Detail Overview Modal */}
            {selectedStudentForDetail && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => { if (e.target === e.currentTarget) setSelectedStudentForDetail(null); }}>
                <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 740, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 30px 60px rgba(0,0,0,0.3)' }}>
                  <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #0f172a)', padding: '20px 24px', position: 'sticky', top: 0, zIndex: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ color: '#fff', margin: 0, fontSize: '1.2rem' }}>🎓 {selectedStudentForDetail.full_name}</h3>
                        <p style={{ color: '#93c5fd', margin: '4px 0 0', fontSize: '0.8rem' }}>{selectedStudentForDetail.student_id} · {selectedStudentForDetail.email}</p>
                      </div>
                      <button onClick={() => setSelectedStudentForDetail(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}>×</button>
                    </div>
                  </div>

                  <div style={{ padding: '20px 24px' }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem' }}>Application Outreach History ({studentAppsList.length})</h4>
                    <div className="sd-table-wrap">
                      <table className="sd-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Company</th>
                            <th>Role</th>
                            <th>Type</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentAppsList.map(app => (
                            <tr key={app.id}>
                              <td style={{ fontSize: '0.78rem' }}>{app.applied_date}</td>
                              <td style={{ fontWeight: 600 }}>{app.company_name}</td>
                              <td style={{ fontSize: '0.8rem' }}>{app.job_role}</td>
                              <td><span className="sd-badge sd-badge-info" style={{ fontSize: '0.7rem' }}>{app.application_type}</span></td>
                              <td><span className="sd-badge sd-badge-success" style={{ fontSize: '0.7rem' }}>{app.status}</span></td>
                            </tr>
                          ))}
                          {studentAppsList.length === 0 && <tr><td colSpan={5} className="sd-empty">No applications logged yet.</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
