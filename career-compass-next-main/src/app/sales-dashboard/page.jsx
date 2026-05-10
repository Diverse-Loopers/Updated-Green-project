'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './sales-dashboard.css';

const ROLE_LABELS = {
  sales: 'Sales Executive',
  cfo: 'Chief Finance Officer',
  cso: 'Chief Staffing Officer',
  cmo: 'Chief Marketing Officer',
  coo: 'Chief Operations Officer',
  strategic_advisor: 'Strategic Advisor',
};

export default function SalesDashboardPage() {
  const router = useRouter();
  const [exec, setExec] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Data states
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalTransactions: 0, avgOrderValue: 0, couponsUsed: 0 });
  const [chart, setChart] = useState([]);
  const [settings, setSettings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseAnalytics, setCourseAnalytics] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('All Courses');

  // Settings form
  const [gwName, setGwName] = useState('razorpay');
  const [gwKey, setGwKey] = useState('');
  const [gwSecret, setGwSecret] = useState('');
  const [savingGw, setSavingGw] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('executive_session');
    if (!session) {
      router.push('/executive-login');
      return;
    }
    setExec(JSON.parse(session));
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [payRes, settingsRes] = await Promise.all([
        fetch('/api/payment/dashboard').then(r => r.json()),
        fetch('/api/payment/dashboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get-settings' }),
        }).then(r => r.json()),
      ]);

      if (payRes.success) {
        setPayments(payRes.payments);
        setStats(payRes.stats);
        setChart(payRes.chart);
        setCourseAnalytics(payRes.courseAnalytics || []);
      }
      if (settingsRes.success) {
        setSettings(settingsRes.settings);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('executive_session');
    router.push('/executive-login');
  };

  const saveGateway = async () => {
    if (!gwKey || !gwSecret) return;
    setSavingGw(true);
    try {
      await fetch('/api/payment/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save-settings', gateway_name: gwName, api_key: gwKey, api_secret: gwSecret }),
      });
      setGwKey('');
      setGwSecret('');
      loadDashboardData();
    } catch {}
    setSavingGw(false);
  };

  const activateGateway = async (name) => {
    await fetch('/api/payment/dashboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'activate-gateway', gateway_name: name }),
    });
    loadDashboardData();
  };

  const deleteGateway = async (id) => {
    if (!confirm('Remove this gateway configuration?')) return;
    await fetch('/api/payment/dashboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete-settings', id }),
    });
    loadDashboardData();
  };

  const filteredPayments = payments.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.user_name || '').toLowerCase().includes(q) ||
      (p.user_email || '').toLowerCase().includes(q) ||
      (p.course_title || '').toLowerCase().includes(q) ||
      (p.transaction_id || '').toLowerCase().includes(q) ||
      (p.coupon_code || '').toLowerCase().includes(q)
    );
  });

  const maxChartValue = Math.max(...chart.map(c => c.revenue), 1);

  if (loading && !exec) {
    return (
      <div className="sd-loading">
        <div className="sd-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="sd-layout">
      {/* Sidebar */}
      <aside className="sd-sidebar">
        <div className="sd-sidebar-logo">
          <img src="/Diverse Loopers Black BG (2).png" alt="Logo" />
          <span>Executive Panel</span>
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
          <button className={`sd-nav-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            Overview
          </button>
          <button className={`sd-nav-btn ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
            Transactions
          </button>
          <button className={`sd-nav-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
            Course Analytics
          </button>
          <button className={`sd-nav-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m8.66-13.5l-5.2 3m-5.2 3l-5.2 3m0-12l5.2 3m5.2 3l5.2 3"/></svg>
            Payment Settings
          </button>
        </nav>

        <button className="sd-logout-btn" onClick={handleLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="sd-main">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="sd-content">
            <h1 className="sd-page-title">Sales Overview</h1>

            <div className="sd-stats-grid">
              <div className="sd-stat-card sd-stat-revenue">
                <p className="sd-stat-label">Total Revenue</p>
                <p className="sd-stat-value">Rs. {stats.totalRevenue.toLocaleString('en-IN')}</p>
              </div>
              <div className="sd-stat-card sd-stat-transactions">
                <p className="sd-stat-label">Transactions</p>
                <p className="sd-stat-value">{stats.totalTransactions}</p>
              </div>
              <div className="sd-stat-card sd-stat-avg">
                <p className="sd-stat-label">Avg Order Value</p>
                <p className="sd-stat-value">Rs. {stats.avgOrderValue.toLocaleString('en-IN')}</p>
              </div>
              <div className="sd-stat-card sd-stat-coupons">
                <p className="sd-stat-label">Coupons Used</p>
                <p className="sd-stat-value">{stats.couponsUsed}</p>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="sd-card">
              <h3 className="sd-card-title">Revenue - Last 7 Days</h3>
              <div className="sd-chart">
                {chart.map((day, i) => (
                  <div key={i} className="sd-chart-bar-wrap">
                    <div className="sd-chart-bar" style={{ height: `${(day.revenue / maxChartValue) * 100}%` }}>
                      {day.revenue > 0 && <span className="sd-chart-val">Rs.{day.revenue}</span>}
                    </div>
                    <span className="sd-chart-label">{day.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="sd-card">
              <h3 className="sd-card-title">Recent Transactions</h3>
              <div className="sd-table-wrap">
                <table className="sd-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Course</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.slice(0, 10).map(p => (
                      <tr key={p.id}>
                        <td>
                          <div className="sd-cell-name">{p.user_name || '-'}</div>
                          <div className="sd-cell-sub">{p.user_email}</div>
                        </td>
                        <td>{p.course_title}</td>
                        <td>Rs. {(p.amount || 0).toLocaleString('en-IN')}</td>
                        <td><span className={`sd-badge sd-badge-${p.status}`}>{p.status}</span></td>
                        <td>{p.paid_at ? new Date(p.paid_at).toLocaleDateString('en-IN') : '-'}</td>
                      </tr>
                    ))}
                    {payments.length === 0 && (
                      <tr><td colSpan={5} className="sd-empty">No transactions yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {activeTab === 'transactions' && (
          <div className="sd-content">
            <div className="sd-content-header">
              <h1 className="sd-page-title">All Transactions</h1>
              <input
                type="text"
                placeholder="Search by name, email, course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="sd-search"
              />
            </div>

            <div className="sd-card">
              <div className="sd-table-wrap">
                <table className="sd-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Contact</th>
                      <th>Course</th>
                      <th>Amount</th>
                      <th>Coupon</th>
                      <th>Gateway</th>
                      <th>Status</th>
                      <th>Date & Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div className="sd-cell-name">{p.user_name || '-'}</div>
                          <div className="sd-cell-sub">{p.user_email}</div>
                        </td>
                        <td>{p.user_phone || '-'}</td>
                        <td>{p.course_title}</td>
                        <td>
                          <div>Rs. {(p.amount || 0).toLocaleString('en-IN')}</div>
                          {p.discount_amount > 0 && (
                            <div className="sd-cell-sub sd-discount">-Rs.{p.discount_amount}</div>
                          )}
                        </td>
                        <td>{p.coupon_code ? <span className="sd-coupon-tag">{p.coupon_code}</span> : '-'}</td>
                        <td><span className="sd-gw-tag">{p.gateway}</span></td>
                        <td><span className={`sd-badge sd-badge-${p.status}`}>{p.status}</span></td>
                        <td>{p.paid_at ? new Date(p.paid_at).toLocaleString('en-IN') : '-'}</td>
                      </tr>
                    ))}
                    {filteredPayments.length === 0 && (
                      <tr><td colSpan={8} className="sd-empty">No transactions found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* COURSE ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="sd-content">
            <h1 className="sd-page-title">Course Analytics & Enrollments</h1>
            
            {/* Course Summary Table */}
            <div className="sd-card" style={{ marginBottom: '2rem' }}>
              <h3 className="sd-card-title">Course Performance Summary</h3>
              <div className="sd-table-wrap">
                <table className="sd-table">
                  <thead>
                    <tr>
                      <th>Course Title</th>
                      <th>Total Enrollments</th>
                      <th>Revenue Generated</th>
                      <th>Coupons Applied</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseAnalytics.map((c, i) => (
                      <tr key={i}>
                        <td>
                          <div className="sd-cell-name">{c.course_title}</div>
                        </td>
                        <td>{c.enrollments}</td>
                        <td style={{ color: '#10b981', fontWeight: 'bold' }}>Rs. {c.revenue.toLocaleString('en-IN')}</td>
                        <td>{c.coupons}</td>
                      </tr>
                    ))}
                    {courseAnalytics.length === 0 && (
                      <tr><td colSpan={4} className="sd-empty">No course data available</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Course Wise Enrollments */}
            <div className="sd-content-header" style={{ marginTop: '2rem' }}>
              <h2 className="sd-card-title" style={{ margin: 0 }}>Course-wise Enrollments</h2>
              <select 
                value={selectedCourse} 
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="sd-search"
                style={{ width: 'auto', minWidth: '250px', cursor: 'pointer' }}
              >
                <option value="All Courses">All Courses</option>
                {courseAnalytics.map((c, i) => (
                  <option key={i} value={c.course_title}>{c.course_title}</option>
                ))}
              </select>
            </div>

            <div className="sd-card">
              <div className="sd-table-wrap">
                <table className="sd-table">
                  <thead>
                    <tr>
                      <th>Student Details</th>
                      <th>Contact Info</th>
                      <th>Course Name</th>
                      <th>Payment Status</th>
                      <th>Coupon</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments
                      .filter(p => selectedCourse === 'All Courses' || p.course_title === selectedCourse)
                      .map(p => (
                      <tr key={p.id}>
                        <td>
                          <div className="sd-cell-name">{p.user_name || '-'}</div>
                        </td>
                        <td>
                          <div className="sd-cell-sub">{p.user_email || '-'}</div>
                          <div className="sd-cell-sub">{p.user_phone || '-'}</div>
                        </td>
                        <td><div className="sd-cell-name" style={{ fontSize: '0.8rem' }}>{p.course_title}</div></td>
                        <td><span className={`sd-badge sd-badge-${p.status}`}>{p.status}</span></td>
                        <td>{p.coupon_code ? <span className="sd-coupon-tag">{p.coupon_code}</span> : '-'}</td>
                      </tr>
                    ))}
                    {payments.filter(p => selectedCourse === 'All Courses' || p.course_title === selectedCourse).length === 0 && (
                      <tr><td colSpan={5} className="sd-empty">No enrollments found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PAYMENT SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="sd-content">
            <h1 className="sd-page-title">Payment Gateway Settings</h1>

            {/* Add Gateway */}
            <div className="sd-card">
              <h3 className="sd-card-title">Configure Gateway</h3>
              <div className="sd-settings-form">
                <div className="sd-form-row">
                  <div className="sd-form-field">
                    <label>Gateway</label>
                    <select value={gwName} onChange={(e) => setGwName(e.target.value)} className="sd-select">
                      <option value="razorpay">Razorpay</option>
                      <option value="stripe">Stripe</option>
                      <option value="payu">PayU</option>
                      <option value="paypal">PayPal</option>
                      <option value="cashfree">Cashfree</option>
                    </select>
                  </div>
                  <div className="sd-form-field">
                    <label>API Key / Key ID</label>
                    <input type="text" value={gwKey} onChange={(e) => setGwKey(e.target.value)} placeholder="rzp_live_xxxxx" className="sd-input" />
                  </div>
                  <div className="sd-form-field">
                    <label>API Secret</label>
                    <input type="password" value={gwSecret} onChange={(e) => setGwSecret(e.target.value)} placeholder="Secret key" className="sd-input" />
                  </div>
                </div>
                <button onClick={saveGateway} disabled={savingGw || !gwKey || !gwSecret} className="sd-btn sd-btn-primary">
                  {savingGw ? 'Saving...' : 'Save Gateway'}
                </button>
              </div>
            </div>

            {/* Active Gateways */}
            <div className="sd-card">
              <h3 className="sd-card-title">Configured Gateways</h3>
              {settings.length === 0 ? (
                <p className="sd-empty-text">No gateways configured yet. Add one above.</p>
              ) : (
                <div className="sd-gw-list">
                  {settings.map(s => (
                    <div key={s.id} className={`sd-gw-item ${s.is_active ? 'sd-gw-active' : ''}`}>
                      <div className="sd-gw-info">
                        <span className="sd-gw-name">{s.gateway_name.toUpperCase()}</span>
                        <span className="sd-gw-key">Key: {s.api_key.substring(0, 12)}...</span>
                        {s.is_active && <span className="sd-badge sd-badge-success">ACTIVE</span>}
                      </div>
                      <div className="sd-gw-actions">
                        {!s.is_active && (
                          <button onClick={() => activateGateway(s.gateway_name)} className="sd-btn sd-btn-sm sd-btn-success">
                            Activate
                          </button>
                        )}
                        <button onClick={() => deleteGateway(s.id)} className="sd-btn sd-btn-sm sd-btn-danger">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
