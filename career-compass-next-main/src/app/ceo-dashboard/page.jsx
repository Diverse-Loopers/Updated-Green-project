'use client';
import Script from 'next/script';
import { useEffect } from 'react';
import { initCEODashboard } from '@/lib/pages/ceo-dashboard';
import './ceo-dashboard.css';

export default function CEODashboardPage() {
  useEffect(() => {
    initCEODashboard();
  }, []);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      <Script src="https://unpkg.com/lucide@latest" strategy="beforeInteractive" />
      <Script id="tailwind-config" strategy="beforeInteractive">{`
        tailwind.config = {
          theme: {
            extend: {
              colors: {
                primary:'#4f46e5',
                secondary:'#db2777',
                dark:'#0f172a',
                surface:'#f8fafc'
              }
            }
          }
        }
      `}</Script>

      <div className="bg-[#f1f5f9] text-slate-900 h-screen flex overflow-hidden" id="ceo-container">

        {/* SIDEBAR */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col fixed lg:static inset-y-0 left-0 z-[70] transition-transform duration-300" id="ceo-sidebar">
          <div className="p-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/images/logo.png" className="h-10 w-auto rounded-lg" alt="Logo" />
              <span className="font-black tracking-tight text-xl uppercase italic text-primary">
                CEO Panel
              </span>
            </div>
            <button onClick={() => window.ceToggleSidebar && window.ceToggleSidebar()} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition">
              <i data-lucide="panel-left-close" className="w-5 h-5" id="sidebar-toggle-icon"></i>
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-1.5 mt-2 custom-scrollbar overflow-y-auto">
            <p className="px-4 pt-2 pb-1 text-xs font-bold text-slate-400 uppercase tracking-widest">Overview</p>

            <button onClick={() => window.ceShowSection && window.ceShowSection('home')}
              id="nav-ceo-home"
              className="sidebar-link active w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold">
              <i data-lucide="layout-grid" className="w-5 h-5"></i> Dashboard
            </button>

            <p className="px-4 pt-4 pb-1 text-xs font-bold text-slate-400 uppercase tracking-widest">Admin Panels</p>

            <button onClick={() => window.ceShowSection && window.ceShowSection('site-admin')}
              id="nav-ceo-site-admin"
              className="sidebar-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold">
              <i data-lucide="globe" className="w-5 h-5"></i> Site Admin
            </button>

            <button onClick={() => window.ceShowSection && window.ceShowSection('hrms-admin')}
              id="nav-ceo-hrms-admin"
              className="sidebar-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold">
              <i data-lucide="users" className="w-5 h-5"></i> HRMS Admin
            </button>

            <button onClick={() => window.ceShowSection && window.ceShowSection('sales')}
              id="nav-ceo-sales"
              className="sidebar-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold">
              <i data-lucide="indian-rupee" className="w-5 h-5"></i> Sales &amp; Revenue
            </button>

            <button onClick={() => window.ceShowSection && window.ceShowSection('cmo')}
              id="nav-ceo-cmo"
              className="sidebar-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold">
              <i data-lucide="mail" className="w-5 h-5"></i> Marketing (CMO)
            </button>

            <p className="px-4 pt-4 pb-1 text-xs font-bold text-slate-400 uppercase tracking-widest">Management</p>

            <button onClick={() => window.ceShowSection && window.ceShowSection('executives')}
              id="nav-ceo-executives"
              className="sidebar-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold">
              <i data-lucide="shield-check" className="w-5 h-5"></i> Executives
            </button>

            <p className="px-4 pt-4 pb-1 text-xs font-bold text-slate-400 uppercase tracking-widest">Settings</p>

            <button onClick={() => window.ceToggleTheme && window.ceToggleTheme()}
              id="theme-toggle-btn"
              className="sidebar-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold">
              <i data-lucide="moon" className="w-5 h-5" id="theme-icon-lucide"></i> <span id="theme-label">Dark Mode</span>
            </button>
          </nav>

          <div className="p-6 mt-auto border-t border-slate-100">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-sm" id="sidebar-initial">C</div>
              <div>
                <p className="font-bold text-sm text-slate-800" id="ceo-name">CEO</p>
                <p className="text-xs text-slate-400" id="ceo-email">Loading...</p>
              </div>
            </div>
            <button onClick={() => window.ceLogout && window.ceLogout()} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm">
              <i data-lucide="log-out" className="w-4 h-4"></i> Logout
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar relative">

          {/* TOP HEADER */}
          <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-50">
            <div className="flex items-center gap-4">
              <button onClick={() => window.ceToggleSidebar && window.ceToggleSidebar()} id="sidebar-open-btn" className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition" style={{ display: 'none' }}>
                <i data-lucide="menu" className="w-5 h-5 text-slate-600"></i>
              </button>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900" id="topbar-title">Dashboard</h1>
                <p className="text-sm text-slate-400 mt-0.5" id="topbar-subtitle">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => window.ceToggleNotifs && window.ceToggleNotifs()} className="relative p-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 transition">
                <i data-lucide="bell" className="w-5 h-5 text-slate-600"></i>
                <span id="notif-badge" className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center" style={{ display: 'none' }}>0</span>
              </button>
            </div>
          </header>

          {/* Notification dropdown */}
          <div id="notif-dropdown" className="absolute right-8 top-[72px] w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[60]" style={{ display: 'none' }}>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-sm">Notifications</span>
              <button onClick={() => window.ceMarkAllRead && window.ceMarkAllRead()} className="text-xs text-primary font-semibold hover:underline">Mark all read</button>
            </div>
            <div id="notif-list" className="max-h-72 overflow-y-auto p-2">
              <p className="text-center text-slate-400 py-6 text-sm">No notifications</p>
            </div>
          </div>

          {/* HOME DASHBOARD */}
          <section id="ceo-home-section" className="p-8 space-y-8">

            {/* KPI ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4" id="kpi-grid">
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition">
                <div className="w-10 h-10 bg-indigo-50 text-primary rounded-xl flex items-center justify-center mb-3"><i data-lucide="users" className="w-5 h-5"></i></div>
                <p className="text-2xl font-extrabold text-slate-900" id="kpi-total-users">—</p>
                <p className="text-xs font-semibold text-slate-400 mt-1">Total Users</p>
                <p className="text-[11px] text-slate-400 mt-1" id="kpi-users-breakdown">Students: — | Business: —</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3"><i data-lucide="indian-rupee" className="w-5 h-5"></i></div>
                <p className="text-2xl font-extrabold text-slate-900" id="kpi-total-revenue">—</p>
                <p className="text-xs font-semibold text-slate-400 mt-1">Total Revenue</p>
                <p className="text-[11px] text-slate-400 mt-1" id="kpi-revenue-breakdown">Courses: — | SaaS: —</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3"><i data-lucide="building-2" className="w-5 h-5"></i></div>
                <p className="text-2xl font-extrabold text-slate-900" id="kpi-employees">—</p>
                <p className="text-xs font-semibold text-slate-400 mt-1">Employees</p>
                <p className="text-[11px] text-slate-400 mt-1" id="kpi-emp-detail">Present: — | Leave: —</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition">
                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-3"><i data-lucide="book-open" className="w-5 h-5"></i></div>
                <p className="text-2xl font-extrabold text-slate-900" id="kpi-courses">—</p>
                <p className="text-xs font-semibold text-slate-400 mt-1">Courses</p>
                <p className="text-[11px] text-slate-400 mt-1" id="kpi-enrollments">Enrollments: —</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-3"><i data-lucide="check-circle" className="w-5 h-5"></i></div>
                <p className="text-2xl font-extrabold text-slate-900" id="kpi-tasks">—</p>
                <p className="text-xs font-semibold text-slate-400 mt-1">Tasks</p>
                <p className="text-[11px] text-slate-400 mt-1" id="kpi-tasks-detail">Done: — | Pending: —</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition">
                <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-3"><i data-lucide="clipboard-list" className="w-5 h-5"></i></div>
                <p className="text-2xl font-extrabold text-slate-900" id="kpi-applications">—</p>
                <p className="text-xs font-semibold text-slate-400 mt-1">Applications</p>
                <p className="text-[11px] text-slate-400 mt-1" id="kpi-apps-detail">New: — | Shortlisted: —</p>
              </div>
            </div>

            {/* PEOPLE + ATTENDANCE ROW */}
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><i data-lucide="users-round" className="w-5 h-5 text-primary"></i> People Overview</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-100 text-center">
                  <div className="text-3xl mb-2">👨‍💼</div>
                  <p className="text-2xl font-extrabold text-slate-900" id="pc-employees">0</p>
                  <p className="text-xs font-semibold text-slate-400 mt-1">Active Employees</p>
                  <p className="text-[11px] text-slate-400 mt-1" id="pc-emp-sub">0 inactive</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 text-center">
                  <div className="text-3xl mb-2">🏛️</div>
                  <p className="text-2xl font-extrabold text-slate-900" id="pc-executives">0</p>
                  <p className="text-xs font-semibold text-slate-400 mt-1">Executives</p>
                  <p className="text-[11px] text-slate-400 mt-1" id="pc-exec-sub">0 active</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 text-center">
                  <div className="text-3xl mb-2">🎓</div>
                  <p className="text-2xl font-extrabold text-slate-900" id="pc-trainers">0</p>
                  <p className="text-xs font-semibold text-slate-400 mt-1">Trainers</p>
                  <p className="text-[11px] text-slate-400 mt-1" id="pc-trainers-sub">0 active</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 text-center">
                  <div className="text-3xl mb-2">📊</div>
                  <p className="text-2xl font-extrabold text-slate-900" id="pc-attendance">0%</p>
                  <p className="text-xs font-semibold text-slate-400 mt-1">Attendance Rate</p>
                  <p className="text-[11px] text-slate-400 mt-1" id="pc-att-sub">0 present today</p>
                </div>
              </div>
            </div>

            {/* MARKETING + DOCUMENTS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><i data-lucide="mail" className="w-4 h-4 text-primary"></i> Marketing</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xl font-extrabold text-primary" id="mk-contacts">0</p>
                    <p className="text-xs text-slate-400 mt-1">Contacts</p>
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-primary" id="mk-campaigns">0</p>
                    <p className="text-xs text-slate-400 mt-1">Campaigns</p>
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-primary" id="mk-sent">0</p>
                    <p className="text-xs text-slate-400 mt-1">Emails Sent</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><i data-lucide="file-text" className="w-4 h-4 text-primary"></i> Documents</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-xl font-extrabold text-primary" id="doc-issued">0</p>
                    <p className="text-xs text-slate-400 mt-1">Total Issued</p>
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-amber-500" id="doc-pending">0</p>
                    <p className="text-xs text-slate-400 mt-1">Pending Signatures</p>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><i data-lucide="zap" className="w-5 h-5 text-primary"></i> Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => window.ceShowSection && window.ceShowSection('sales')} className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-primary/30 transition">
                  <i data-lucide="bar-chart-3" className="w-4 h-4"></i> View Sales Report
                </button>
                <button onClick={() => window.ceShowSection && window.ceShowSection('hrms-admin')} className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-blue-600/30 transition">
                  <i data-lucide="clipboard-list" className="w-4 h-4"></i> Review Applications
                </button>
                <button onClick={() => window.ceShowSection && window.ceShowSection('cmo')} className="flex items-center gap-2 px-5 py-3 bg-pink-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-pink-600/30 transition">
                  <i data-lucide="send" className="w-4 h-4"></i> Send Campaign
                </button>
                <button onClick={() => window.ceShowSection && window.ceShowSection('site-admin')} className="flex items-center gap-2 px-5 py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-slate-800/30 transition">
                  <i data-lucide="settings" className="w-4 h-4"></i> Manage Platform
                </button>
              </div>
            </div>
          </section>

          {/* EXECUTIVES SECTION */}
          <section id="ceo-executives-section" className="p-8 space-y-6" style={{ display: 'none' }}>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Executive Management</h2>
              <button onClick={() => window.ceOpenExecModal && window.ceOpenExecModal()} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-primary/30 transition">
                <i data-lucide="plus" className="w-4 h-4"></i> Add Executive
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-6 py-3 font-semibold text-slate-500 uppercase text-xs">Name</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-500 uppercase text-xs">Email</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-500 uppercase text-xs">Role</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-500 uppercase text-xs">Phone</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-500 uppercase text-xs">Status</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-500 uppercase text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody id="ceo-executives-tbody">
                  <tr><td colSpan="6" className="text-center py-8 text-slate-400">Loading...</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* EXEC MODAL */}
          <div id="ceo-exec-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center" style={{ display: 'none' }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-900" id="ceo-exec-modal-title">Add Executive</h3>
              <input type="hidden" id="ceo-exec-edit-id" />
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Name *</label>
                <input type="text" id="ceo-exec-name" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Email *</label>
                <input type="email" id="ceo-exec-email" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Role *</label>
                <select id="ceo-exec-role" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                  <option value="ceo">Chief Executive Officer (CEO)</option>
                  <option value="cmo_chief">Chief Managing Officer</option>
                  <option value="sales">Sales Executive</option>
                  <option value="cfo">Chief Finance Officer</option>
                  <option value="cso">Chief Staffing Officer</option>
                  <option value="cmo">Chief Marketing Officer</option>
                  <option value="coo">Chief Operations Officer</option>
                  <option value="strategic_advisor">Strategic Advisor</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Phone</label>
                <input type="text" id="ceo-exec-phone" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Password (new exec only)</label>
                <input type="password" id="ceo-exec-password" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => window.ceSaveExec && window.ceSaveExec()} className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-sm">Save</button>
                <button onClick={() => { document.getElementById('ceo-exec-modal').style.display = 'none'; }} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm">Cancel</button>
              </div>
            </div>
          </div>

          {/* PANEL IFRAME */}
          <section id="ceo-panel-section" style={{ display: 'none' }} className="flex-1 relative">
            <div id="panel-loading" className="absolute inset-0 bg-[#f1f5f9] flex flex-col items-center justify-center gap-4 z-10">
              <div className="w-10 h-10 border-3 border-slate-200 border-t-primary rounded-full animate-spin"></div>
              <p className="text-sm text-slate-400 font-semibold">Loading panel...</p>
            </div>
            <iframe id="panel-iframe" src="about:blank" title="Admin Panel" className="w-full h-full border-none"></iframe>
          </section>

        </main>
      </div>
    </>
  );
}
