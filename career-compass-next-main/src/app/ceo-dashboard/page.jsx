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

            <button onClick={() => window.ceShowSection && window.ceShowSection('security')}
              id="nav-ceo-security"
              className="sidebar-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold">
              <i data-lucide="key-round" className="w-5 h-5"></i> HRMS Security PIN
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
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:border-indigo-300 cursor-pointer transition-all active:scale-[0.98] group" onClick={() => window.showCeoStatDetail && window.showCeoStatDetail('users')}>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 bg-indigo-50 text-primary rounded-xl flex items-center justify-center"><i data-lucide="users" className="w-5 h-5"></i></div>
                  <span className="text-[10px] bg-indigo-50 text-primary font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">View List</span>
                </div>
                <p className="text-2xl font-extrabold text-slate-900" id="kpi-total-users">—</p>
                <p className="text-xs font-semibold text-slate-400 mt-1">Total Users</p>
                <p className="text-[11px] text-slate-400 mt-1" id="kpi-users-breakdown">Students: — | Business: —</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:border-emerald-300 cursor-pointer transition-all active:scale-[0.98] group" onClick={() => window.showCeoStatDetail && window.showCeoStatDetail('revenue')}>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><i data-lucide="indian-rupee" className="w-5 h-5"></i></div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">View List</span>
                </div>
                <p className="text-2xl font-extrabold text-slate-900" id="kpi-total-revenue">—</p>
                <p className="text-xs font-semibold text-slate-400 mt-1">Total Revenue</p>
                <p className="text-[11px] text-slate-400 mt-1" id="kpi-revenue-breakdown">Courses: — | SaaS: —</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-300 cursor-pointer transition-all active:scale-[0.98] group" onClick={() => window.showCeoStatDetail && window.showCeoStatDetail('employees')}>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><i data-lucide="building-2" className="w-5 h-5"></i></div>
                  <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">View List</span>
                </div>
                <p className="text-2xl font-extrabold text-slate-900" id="kpi-employees">—</p>
                <p className="text-xs font-semibold text-slate-400 mt-1">Employees</p>
                <p className="text-[11px] text-slate-400 mt-1" id="kpi-emp-detail">Present: — | Leave: —</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:border-orange-300 cursor-pointer transition-all active:scale-[0.98] group" onClick={() => window.showCeoStatDetail && window.showCeoStatDetail('courses')}>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center"><i data-lucide="book-open" className="w-5 h-5"></i></div>
                  <span className="text-[10px] bg-orange-50 text-orange-600 font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">View List</span>
                </div>
                <p className="text-2xl font-extrabold text-slate-900" id="kpi-courses">—</p>
                <p className="text-xs font-semibold text-slate-400 mt-1">Courses</p>
                <p className="text-[11px] text-slate-400 mt-1" id="kpi-enrollments">Enrollments: —</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:border-amber-300 cursor-pointer transition-all active:scale-[0.98] group" onClick={() => window.showCeoStatDetail && window.showCeoStatDetail('tasks')}>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"><i data-lucide="check-circle" className="w-5 h-5"></i></div>
                  <span className="text-[10px] bg-amber-50 text-amber-600 font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">View List</span>
                </div>
                <p className="text-2xl font-extrabold text-slate-900" id="kpi-tasks">—</p>
                <p className="text-xs font-semibold text-slate-400 mt-1">Tasks</p>
                <p className="text-[11px] text-slate-400 mt-1" id="kpi-tasks-detail">Done: — | Pending: —</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:border-pink-300 cursor-pointer transition-all active:scale-[0.98] group" onClick={() => window.showCeoStatDetail && window.showCeoStatDetail('applications')}>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center"><i data-lucide="clipboard-list" className="w-5 h-5"></i></div>
                  <span className="text-[10px] bg-pink-50 text-pink-600 font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">View List</span>
                </div>
                <p className="text-2xl font-extrabold text-slate-900" id="kpi-applications">—</p>
                <p className="text-xs font-semibold text-slate-400 mt-1">Applications</p>
                <p className="text-[11px] text-slate-400 mt-1" id="kpi-apps-detail">New: — | Shortlisted: —</p>
              </div>
            </div>

            {/* DETAIL BREAKDOWN PANEL (Toggled on card click) */}
            <div id="ceo-stat-detail-panel" className="hidden bg-white rounded-2xl border border-slate-200 p-6 transition-all shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div id="ceo-stat-detail-icon" className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <i data-lucide="list" className="w-5 h-5"></i>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900" id="ceo-stat-detail-title">Details</h3>
                      <span id="ceo-stat-detail-count" className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-full">0</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5" id="ceo-stat-detail-subtitle">Showing live data breakdown</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <input
                    type="text"
                    id="ceo-stat-search"
                    placeholder="Search in list..."
                    onInput={(e) => window.filterCeoStatDetail && window.filterCeoStatDetail(e.target.value)}
                    className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white transition"
                  />
                  <button
                    onClick={() => { document.getElementById('ceo-stat-detail-panel')?.classList.add('hidden'); }}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                    title="Close">
                    ✕
                  </button>
                </div>
              </div>
              <div id="ceo-stat-detail-content" className="max-h-96 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
                {/* Dynamically populated */}
              </div>
            </div>

            {/* PEOPLE + ATTENDANCE ROW */}
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><i data-lucide="users-round" className="w-5 h-5 text-primary"></i> People Overview</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-100 text-center hover:shadow-lg hover:border-blue-300 cursor-pointer transition-all active:scale-[0.98]" onClick={() => window.showCeoStatDetail && window.showCeoStatDetail('employees')}>
                  <div className="text-3xl mb-2">👨‍💼</div>
                  <p className="text-2xl font-extrabold text-slate-900" id="pc-employees">0</p>
                  <p className="text-xs font-semibold text-slate-400 mt-1">Active Employees</p>
                  <p className="text-[11px] text-slate-400 mt-1" id="pc-emp-sub">0 inactive</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 text-center hover:shadow-lg hover:border-indigo-300 cursor-pointer transition-all active:scale-[0.98]" onClick={() => window.showCeoStatDetail && window.showCeoStatDetail('executives')}>
                  <div className="text-3xl mb-2">🏛️</div>
                  <p className="text-2xl font-extrabold text-slate-900" id="pc-executives">0</p>
                  <p className="text-xs font-semibold text-slate-400 mt-1">Executives</p>
                  <p className="text-[11px] text-slate-400 mt-1" id="pc-exec-sub">0 active</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 text-center hover:shadow-lg hover:border-emerald-300 cursor-pointer transition-all active:scale-[0.98]" onClick={() => window.showCeoStatDetail && window.showCeoStatDetail('trainers')}>
                  <div className="text-3xl mb-2">🎓</div>
                  <p className="text-2xl font-extrabold text-slate-900" id="pc-trainers">0</p>
                  <p className="text-xs font-semibold text-slate-400 mt-1">Trainers</p>
                  <p className="text-[11px] text-slate-400 mt-1" id="pc-trainers-sub">0 active</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 text-center hover:shadow-lg hover:border-green-300 cursor-pointer transition-all active:scale-[0.98]" onClick={() => window.showCeoStatDetail && window.showCeoStatDetail('present')}>
                  <div className="text-3xl mb-2">📊</div>
                  <p className="text-2xl font-extrabold text-slate-900" id="pc-attendance">0%</p>
                  <p className="text-xs font-semibold text-slate-400 mt-1">Attendance Rate</p>
                  <p className="text-[11px] text-green-600 font-bold mt-1" id="pc-att-sub">0 present today</p>
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

          {/* HRMS SECURITY AUTHORIZATION SECTION */}
          <section id="ceo-security-section" className="p-8 space-y-6" style={{ display: 'none' }}>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <i data-lucide="shield-alert" className="w-5 h-5 text-primary"></i> HRMS Action Authorization Password
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Protect sensitive actions in HRMS Admin (issuing official documents, deleting employee records, and terminating employment).
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Status & Policy Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center font-bold text-xl">
                    🔒
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Protection Status</h3>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold mt-1">
                      ● Active &amp; Enforced
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-xs text-slate-600 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Last Modified:</span>
                    <span className="font-bold text-slate-800" id="ceo-sec-updated-at">Checking...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Configured By:</span>
                    <span className="font-bold text-slate-800" id="ceo-sec-updated-by">Checking...</span>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-2">
                  <p className="font-bold flex items-center gap-1.5">
                    <i data-lucide="info" className="w-4 h-4 text-amber-700"></i> Protected HRMS Actions:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-amber-800">
                    <li>Issuing Official &amp; Custom Documents</li>
                    <li>Deleting Employee Records &amp; Logins</li>
                    <li>Terminating / Ending Employment</li>
                  </ul>
                </div>
              </div>

              {/* Right Password Update Form Card */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <i data-lucide="key" className="w-5 h-5 text-primary"></i> Change Security Authorization Password
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter a new password below. Once updated, the HRMS Admin must use this new password to authorize any sensitive action.
                  </p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); window.ceUpdateHRMSPassword && window.ceUpdateHRMSPassword(); }} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      New Security Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        id="ceo-new-sec-pass"
                        placeholder="Enter minimum 4 characters..."
                        required
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById('ceo-new-sec-pass');
                          if (el) el.type = el.type === 'password' ? 'text' : 'password';
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        👁️
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Confirm New Security Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        id="ceo-confirm-sec-pass"
                        placeholder="Re-type new password..."
                        required
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById('ceo-confirm-sec-pass');
                          if (el) el.type = el.type === 'password' ? 'text' : 'password';
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        👁️
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="submit"
                      id="ceo-sec-save-btn"
                      className="px-6 py-3 bg-primary hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/25 transition flex items-center gap-2 cursor-pointer"
                    >
                      <i data-lucide="check" className="w-4 h-4"></i> Update Security Password
                    </button>
                    <span id="ceo-sec-feedback" className="text-xs font-bold text-green-600 hidden"></span>
                  </div>
                </form>
              </div>
            </div>
          </section>

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
