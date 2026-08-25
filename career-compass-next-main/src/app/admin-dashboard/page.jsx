"use client";

import Script from "next/script";
import { useEffect } from "react";
import "./admin-dashboard.css";
import { initAdminDashboard } from "@/lib/pages/admin-dashboard";

export default function AdminDashboard() {
  useEffect(() => {
    initAdminDashboard();
  }, []);

  // Executive management logic — runs after mount
  useEffect(() => {
    const ROLE_LABELS = {
      ceo: 'Chief Executive Officer', cmo_chief: 'Chief Managing Officer',
      sales: 'Sales Executive', cfo: 'Chief Finance Officer',
      cso: 'Chief Staffing Officer', cmo: 'Chief Marketing Officer',
      coo: 'Chief Operations Officer', strategic_advisor: 'Strategic Advisor'
    };
    let executivesData = [];

    async function loadExecutives() {
      try {
        const res = await fetch('/api/executives/manage', {
          headers: { 'x-admin-key': 'hrms-admin-access' }
        });
        const data = await res.json();
        if (data.success) { executivesData = data.executives; renderExecutives(); }
      } catch(e) { console.error(e); }
    }

    function renderExecutives() {
      const tbody = document.getElementById('executives-table-body');
      if (!tbody) return;
      if (!executivesData.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#9ca3af">No executives found</td></tr>';
        return;
      }
      tbody.innerHTML = executivesData.map(ex => {
        return '<tr>' +
          '<td><strong>' + (ex.name || '-') + '</strong></td>' +
          '<td>' + (ex.email || '-') + '</td>' +
          '<td>' + (ROLE_LABELS[ex.role] || ex.role) + '</td>' +
          '<td>' + (ex.phone || '-') + '</td>' +
          '<td><span style="padding:3px 10px;border-radius:6px;font-size:11px;font-weight:700;' +
            (ex.is_active ? 'background:#d1fae5;color:#059669' : 'background:#fee2e2;color:#dc2626') +
            '">' + (ex.is_active ? 'Active' : 'Inactive') + '</span></td>' +
          '<td style="display:flex;gap:6px;flex-wrap:wrap">' +
            '<button onclick="window.editExec(\'' + ex.id + '\')" style="padding:4px 10px;border-radius:6px;border:1px solid #d1d5db;background:#fff;cursor:pointer;font-size:11px;font-weight:600">Edit</button>' +
            '<button onclick="window.toggleExecStatus(\'' + ex.id + '\', ' + !ex.is_active + ')" style="padding:4px 10px;border-radius:6px;border:none;cursor:pointer;font-size:11px;font-weight:600;' +
              (ex.is_active ? 'background:#fee2e2;color:#dc2626' : 'background:#d1fae5;color:#059669') +
            '">' + (ex.is_active ? 'Deactivate' : 'Activate') + '</button>' +
            '<button onclick="window.changeExecPass(\'' + ex.id + '\')" style="padding:4px 10px;border-radius:6px;border:none;background:#dbeafe;color:#2563eb;cursor:pointer;font-size:11px;font-weight:600">Reset Pass</button>' +
            '<button onclick="window.deleteExec(\'' + ex.id + '\')" style="padding:4px 10px;border-radius:6px;border:none;background:#fee2e2;color:#dc2626;cursor:pointer;font-size:11px;font-weight:600">Delete</button>' +
          '</td>' +
        '</tr>';
      }).join('');
    }

    window.saveExecutive = async function() {
      const editId = document.getElementById('exec-edit-id').value;
      const name = document.getElementById('exec-name').value;
      const email = document.getElementById('exec-email').value;
      const role = document.getElementById('exec-role').value;
      const phone = document.getElementById('exec-phone').value;
      const password = document.getElementById('exec-password').value;

      const body = editId
        ? { action: 'update', id: editId, name, role, phone }
        : { action: 'create', name, email, role, phone, password };

      try {
        const res = await fetch('/api/executives/manage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-key': 'hrms-admin-access' },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.success) {
          document.getElementById('exec-modal').style.display = 'none';
          loadExecutives();
        } else {
          alert(data.error || 'Failed to save');
        }
      } catch(e) { alert('Error: ' + e.message); }
    };

    window.editExec = function(id) {
      const ex = executivesData.find(e => e.id === id);
      if (!ex) return;
      document.getElementById('exec-edit-id').value = ex.id;
      document.getElementById('exec-name').value = ex.name || '';
      document.getElementById('exec-email').value = ex.email || '';
      document.getElementById('exec-role').value = ex.role || 'sales';
      document.getElementById('exec-phone').value = ex.phone || '';
      document.getElementById('exec-password').value = '';
      document.getElementById('exec-modal-title').textContent = 'Edit Executive';
      document.getElementById('exec-modal').style.display = 'flex';
    };

    window.toggleExecStatus = async function(id, newStatus) {
      await fetch('/api/executives/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': 'hrms-admin-access' },
        body: JSON.stringify({ action: 'update', id, is_active: newStatus })
      });
      loadExecutives();
    };

    window.changeExecPass = async function(id) {
      const newPass = prompt('Enter new password:');
      if (!newPass) return;
      await fetch('/api/executives/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': 'hrms-admin-access' },
        body: JSON.stringify({ action: 'update-password', id, password: newPass })
      });
      alert('Password updated.');
    };

    window.deleteExec = async function(id) {
      if (!confirm('Delete this executive?')) return;
      await fetch('/api/executives/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': 'hrms-admin-access' },
        body: JSON.stringify({ action: 'delete', id })
      });
      loadExecutives();
    };

    // Expose loadExecutives globally for showSection in admin-dashboard.js
    window._loadExecutives = loadExecutives;

    // Initial load
    loadExecutives();
  }, []);  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <Script
        src="https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"
        strategy="beforeInteractive"
      />

      <div className="dashboard-container">
        {/* Mobile Menu Button */}
        <button id="mobile-menu-btn" style={{ display: "none" }}>☰</button>

        {/* Sidebar */}
        <aside className="sidebar" id="sidebar">
          <div className="logo">
            <img src="/images/logo.png" alt="Logo" />
            HRMS Admin
          </div>
          <nav className="nav-links">
            <button className="active" onClick={() => window.showSection && window.showSection('employees')}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Employees
            </button>
            <button onClick={() => window.showSection && window.showSection('tasks')}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
              Task Management
            </button>
            <button onClick={() => window.showSection && window.showSection('attendance')}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Attendance
            </button>
            <button onClick={() => window.showSection && window.showSection('leaves')}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Leave Requests
            </button>
            <button onClick={() => window.showSection && window.showSection('applicants')}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Job Applicants
            </button>
            <button onClick={() => window.showSection && window.showSection('templates')}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              Document Templates
            </button>
            <button onClick={() => window.showSection && window.showSection('managers')}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Managers
            </button>
            <button onClick={() => window.showSection && window.showSection('ratings')}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
              Ratings
            </button>
            <button onClick={() => window.showSection && window.showSection('announcements')}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
              Announcements
            </button>
            <button onClick={() => window.logoutAdmin && window.logoutAdmin()} style={{ marginTop: "auto", color: "#ef4444" }}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Logout
            </button>
          </nav>
          <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6C5CE7,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>A</div>
              <div>
                <div id="admin-sidebar-name" style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>Admin</div>
                <div id="admin-sidebar-email" style={{ color: '#8b8ba7', fontSize: '0.7rem' }}>admin@diverseloopers.com</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {/* Top Header */}
          <div className="top-header">
            <div>
              <div className="page-title">Dashboard</div>
              <div className="page-subtitle" id="header-datetime">Welcome back, Admin</div>
            </div>
            <div className="header-actions">
              <div className="search-box">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input id="dashboard-search" type="text" placeholder="Search employees, applicants..." />
              </div>
              <div className="notification-wrapper">
                <button id="notif-btn" onClick={() => window.toggleNotifications && window.toggleNotifications()}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  <span id="notif-count" className="badge hidden">0</span>
                </button>
                <div id="notif-dropdown" className="dropdown-content hidden">
                  <div className="dropdown-header">
                    <span>Notifications</span>
                    <button onClick={() => window.markAllRead && window.markAllRead()} className="mark-read-btn">Mark all read</button>
                  </div>
                  <ul id="notif-list">
                    <li className="empty-notif">No new notifications</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="content-area">
          {/* SECTION: EMPLOYEES */}
          <section id="employees-section">
            <div className="card-grid" style={{ marginBottom: "1.75rem" }}>
              <div className="stat-card">
                <div className="stat-icon purple">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div className="stat-info">
                  <h3>Total Employees</h3>
                  <div className="stat-value" id="stat-total-employees">0</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="stat-info">
                  <h3>Present Today</h3>
                  <div className="stat-value" id="stat-present-today">0</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon orange">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="stat-info">
                  <h3>Pending Leaves</h3>
                  <div className="stat-value" id="stat-pending-leaves">0</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon blue">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <div className="stat-info">
                  <h3>Active Tasks</h3>
                  <div className="stat-value" id="stat-active-tasks">0</div>
                </div>
              </div>
            </div>

            <div className="section-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2>Employee Management</h2>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
                  <button
                    id="emp-tab-active"
                    type="button"
                    onClick={() => window.switchEmployeeTab && window.switchEmployeeTab('active')}
                    style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #6C5CE7', background: '#6C5CE7', color: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s' }}
                  >
                    <span>👥 Active Employees</span>
                    <span id="active-emp-count" style={{ background: 'rgba(255,255,255,0.25)', padding: '2px 7px', borderRadius: '10px', fontSize: '0.72rem' }}>0</span>
                  </button>
                  <button
                    id="emp-tab-past"
                    type="button"
                    onClick={() => window.switchEmployeeTab && window.switchEmployeeTab('past')}
                    style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#64748b', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s' }}
                  >
                    <span>📋 Past Employees</span>
                    <span id="past-emp-count" style={{ background: '#e2e8f0', color: '#475569', padding: '2px 7px', borderRadius: '10px', fontSize: '0.72rem' }}>0</span>
                  </button>
                </div>
              </div>
              <button className="btn-primary" onClick={() => window.openAddEmployeeModal && window.openAddEmployeeModal()}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Employee
              </button>
            </div>

            <div className="table-container">
              <table id="employees-table">
                <thead id="employees-thead">
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Documents</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </section>

          {/* SECTION: TASKS */}
          <section id="tasks-section" className="hidden">
            <div className="section-header">
              <h2>Task Management</h2>
              <button className="btn-primary" onClick={() => window.openAssignTaskModal && window.openAssignTaskModal()}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Assign New Task
              </button>
            </div>

            <div className="table-container">
              <table id="tasks-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Assigned To</th>
                    <th>Deadline</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Submission</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </section>

          {/* SECTION: ATTENDANCE */}
          <section id="attendance-section" className="hidden">
            <h2>Attendance Records</h2>
            <div className="input-group" style={{ maxWidth: "300px", margin: "1rem 0" }}>
              <label>Filter by Date</label>
              <input type="date" id="attendance-filter-date" onChange={() => window.loadAttendance && window.loadAttendance()} />
            </div>
            <div className="table-container">
              <table id="attendance-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Check In</th>
                    <th>Face Verified</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </section>

          {/* SECTION: LEAVES */}
          <section id="leaves-section" className="hidden">
            <h2>Leave Requests</h2>
            <div className="table-container">
              <table id="leaves-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Dates</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </section>

          {/* SECTION: JOB APPLICANTS */}
          <section id="applicants-section" className="hidden">
            <div className="section-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
              <h2>Job Applications</h2>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <select id="status-filter" className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', borderRadius: 10 }}>
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interviewed">Interviewed</option>
                  <option value="rejected">Rejected</option>
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>
                  <input type="checkbox" id="select-all-checkbox" onChange={(e) => window.toggleSelectAll && window.toggleSelectAll(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#6C5CE7', cursor: 'pointer' }} />
                  Select All
                </label>
                <button className="btn-primary" onClick={() => window.openTemplateEditor && window.openTemplateEditor()} style={{ fontSize: '0.78rem', padding: '0.5rem 1rem' }}>
                  📧 Email Templates
                </button>
              </div>
            </div>
            <div id="applicants-cards-container" className="applicant-cards-grid">
              <p style={{ color: '#94a3b8', gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>Loading applications...</p>
            </div>
          </section>

          {/* SECTION: EXECUTIVES */}
          <section id="executives-section" className="hidden">
            <div className="section-header">
              <h2>Executive Management</h2>
              <button className="btn-primary" onClick={() => {
                document.getElementById('exec-modal').style.display = 'flex';
                document.getElementById('exec-modal-title').textContent = 'Add New Executive';
                document.getElementById('exec-form').reset();
                document.getElementById('exec-edit-id').value = '';
              }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Executive
              </button>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="executives-table-body">
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af' }}>Loading...</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION: DOCUMENT TEMPLATES */}
          <section id="templates-section" className="hidden">
            <div className="section-header">
              <h2>Document Templates</h2>
              <button className="btn-primary" onClick={() => window.openTemplateEditor && window.openTemplateEditor()}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Template
              </button>
            </div>
            <div id="templates-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <p style={{ color: '#94a3b8', textAlign: 'center', gridColumn: '1/-1' }}>Loading templates...</p>
            </div>
          </section>

          {/* MANAGERS SECTION */}
          <section id="managers-section" className="hidden">
            <div className="section-header">
              <h2>Project Managers</h2>
              <button className="btn-primary" onClick={() => window.openManagerModal && window.openManagerModal()}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Manager
              </button>
            </div>
            <div className="table-container" style={{ marginTop: '1rem' }}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Designation</th>
                    <th>Project</th>
                    <th>Team Size</th>
                    <th>Signature</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="managers-table-body">
                  <tr><td colSpan="7" style={{ textAlign: 'center', color: '#94a3b8' }}>Loading managers...</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* RATINGS SECTION */}
          <section id="ratings-section" className="hidden">
            <div className="section-header">
              <h2>Employee Ratings</h2>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <select id="hr-rating-month" style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                </select>
                <button className="btn-primary" onClick={() => window.openHRRatingForm && window.openHRRatingForm()}>
                  Rate Employees
                </button>
              </div>
            </div>
            <div id="hr-ratings-content" style={{ marginTop: '1rem' }}>
              <p style={{ color: '#94a3b8', textAlign: 'center' }}>Select a month to view ratings...</p>
            </div>
          </section>

          {/* ANNOUNCEMENTS SECTION */}
          <section id="announcements-section" className="hidden">
            <div className="section-header">
              <h2>Announcements</h2>
              <button className="btn-primary" onClick={() => window.openAnnouncementForm && window.openAnnouncementForm()}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                New Announcement
              </button>
            </div>
            <div id="announcements-list" style={{ marginTop: '1rem' }}>
              <p style={{ color: '#94a3b8', textAlign: 'center' }}>Loading announcements...</p>
            </div>
          </section>

          </div>{/* end content-area */}
        </main>
      </div>

      {/* MODAL: ADD EMPLOYEE */}

      {/* MODAL: EDIT TEMPLATE */}
      <div id="edit-template-modal" className="modal hidden" onClick={(e) => { if (e.target.id === 'edit-template-modal') window.closeModal && window.closeModal('edit-template-modal'); }}>
        <div className="modal-content premium-modal" style={{ maxWidth: '800px' }}>
          <button className="modal-close-btn" onClick={() => window.closeModal && window.closeModal('edit-template-modal')}>✕</button>
          <div className="modal-header">
            <h2 id="template-editor-title">Add Template</h2>
          </div>
          <input type="hidden" id="edit-template-id" />
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label>Template Name <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" id="tpl-name" placeholder="e.g. Offer Letter" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>
              <div className="input-group">
                <label>Category</label>
                <select id="tpl-category" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <option value="certificate">Certificate</option>
                  <option value="letter">Letter</option>
                  <option value="agreement">Agreement</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input type="checkbox" id="tpl-requires-signature" /> Requires Employee Signature
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input type="checkbox" id="tpl-has-qr" defaultChecked /> Include QR Code
              </label>
            </div>
            <div className="input-group">
              <label>HTML Content <span style={{ color: '#dc2626' }}>*</span></label>
              <textarea id="tpl-html" rows={12} placeholder="Paste HTML template here..." onInput={() => window.updateTemplatePreview && window.updateTemplatePreview()} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '12px', resize: 'vertical' }}></textarea>
            </div>
            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Live Preview</span>
                <button type="button" onClick={() => window.updateTemplatePreview && window.updateTemplatePreview()} style={{ padding: '4px 12px', fontSize: '0.75rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer' }}>↻ Refresh</button>
              </label>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
                <iframe id="tpl-preview-frame" style={{ width: '100%', height: '300px', border: 'none' }} title="Template Preview"></iframe>
              </div>
            </div>
            <div style={{ background: '#f8f7ff', borderRadius: '8px', padding: '12px 16px', fontSize: '0.8rem', color: '#6C5CE7' }}>
              <strong>Available Placeholders:</strong> {'{{name}}'} {'{{employee_id}}'} {'{{designation}}'} {'{{department}}'} {'{{join_date}}'} {'{{date}}'} {'{{company}}'} {'{{qr_code}}'} {'{{verification_code}}'} {'{{reporting_manager}}'} {'{{manager_designation}}'} {'{{manager_signature}}'} {'{{project_name}}'}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-text" onClick={() => window.closeModal && window.closeModal('edit-template-modal')}>Cancel</button>
            <button type="button" className="btn-primary" onClick={() => window.saveTemplate && window.saveTemplate()}>Save Template</button>
          </div>
        </div>
      </div>
      <div id="add-employee-modal" className="modal hidden">
        <div className="modal-content premium-modal">
          <button className="modal-close-btn" onClick={() => window.closeModal && window.closeModal('add-employee-modal')}>✕</button>
          <div className="modal-header">
            <h2>New Employee</h2>
            <p className="modal-subtitle">Create a new account and generate ID</p>
          </div>

          <form id="add-employee-form" onSubmit={(e) => window.handleAddEmployee && window.handleAddEmployee(e)}>
            <div className="form-grid">
              <div className="input-group">
                <label>Full Name</label>
                <input type="text" id="new-emp-name" placeholder="e.g. John Doe" required />
              </div>
              <div className="input-group">
                <label>Email (Personal)</label>
                <input type="email" id="new-emp-email" placeholder="john@example.com" required />
              </div>
              <div className="input-group">
                <label>Department</label>
                <select id="new-emp-dept" required>
                  <option value="">Select Dept</option>
                  <option value="IT">IT & Engineering</option>
                  <option value="HR">Human Resources</option>
                  <option value="Sales">Sales & Marketing</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
              <div className="input-group">
                <label>Designation</label>
                <input type="text" id="new-emp-designation" placeholder="e.g. Senior Developer" required />
              </div>
              <div className="input-group">
                <label>Login Password</label>
                <input type="text" id="new-emp-password" placeholder="Set login password" required />
              </div>
              <div className="input-group" style={{ gridColumn: "span 2" }}>
                <label>Face Photo (For Verification)</label>
                <input type="file" id="new-emp-photo" accept="image/*" required />
                <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "5px" }}>
                  Upload a clear front-facing photo.
                </p>
              </div>
              <div className="input-group">
                <label>Aadhaar Card <span style={{ color: '#9ca3af', fontWeight: 400, fontSize: '0.75rem' }}>(Optional)</span></label>
                <input type="file" id="new-emp-aadhaar" accept="image/*,.pdf" />
              </div>
              <div className="input-group">
                <label>PAN Card <span style={{ color: '#9ca3af', fontWeight: 400, fontSize: '0.75rem' }}>(Optional)</span></label>
                <input type="file" id="new-emp-pan" accept="image/*,.pdf" />
              </div>
              <div className="input-group">
                <label>Highest Qualification <span style={{ color: '#9ca3af', fontWeight: 400, fontSize: '0.75rem' }}>(Optional)</span></label>
                <input type="file" id="new-emp-qualification" accept="image/*,.pdf" />
              </div>
              <div className="input-group">
                <label>Bank Details <span style={{ color: '#9ca3af', fontWeight: 400, fontSize: '0.75rem' }}>(Optional)</span></label>
                <input type="file" id="new-emp-bank" accept="image/*,.pdf" />
              </div>
            </div>

            <div className="id-preview-box">
              <span className="label">Auto-Generated ID will be:</span>
              <span className="value">XX000</span>
              <small>(Assigned on creation)</small>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-text" onClick={() => window.closeModal && window.closeModal('add-employee-modal')}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Create Employee
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL: RESET PASSWORD */}
      <div id="reset-password-modal" className="modal hidden">
        <div className="modal-content">
          <h2>Reset Password</h2>
          <form id="reset-password-form" onSubmit={(e) => window.handleResetPassword && window.handleResetPassword(e)}>
            <div className="input-group">
              <label>New Password</label>
              <input type="text" id="reset-new-pass" placeholder="Enter new password" required />
            </div>
            <div className="modal-actions flex justify-end gap-2" style={{ marginTop: "1rem" }}>
              <button type="button" className="btn-secondary" onClick={() => window.closeModal && window.closeModal('reset-password-modal')}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL: ASSIGN TASK */}
      <div id="assign-task-modal" className="modal hidden">
        <div className="modal-content" style={{ textAlign: "left" }}>
          <h2 style={{ marginBottom: "1rem" }}>Assign Task</h2>
          <form id="assign-task-form" onSubmit={(e) => window.handleAssignTask && window.handleAssignTask(e)}>
            <div className="input-group">
              <label>Task Title</label>
              <input type="text" id="task-title" required />
            </div>
            <div className="input-group">
              <label>Description (Optional)</label>
              <textarea id="task-desc" rows="3"></textarea>
            </div>
            <div className="input-group">
              <label>Assign To (Employee ID)</label>
              <select id="task-assign-to" required></select>
            </div>
            <div className="input-group">
              <label>Deadline</label>
              <input type="datetime-local" id="task-deadline" required />
            </div>
            <div className="input-group">
              <label>Priority</label>
              <select id="task-priority">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="flex" style={{ gap: "1rem" }}>
              <button type="submit" className="btn-primary">
                Assign Task
              </button>
              <button type="button" className="btn-secondary" onClick={() => window.closeModal && window.closeModal('assign-task-modal')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL: APPLICANT DETAILS */}
      <div id="applicant-detail-modal" className="modal hidden" onClick={(e) => { if (e.target.id === 'applicant-detail-modal') window.closeModal && window.closeModal('applicant-detail-modal'); }}>
        <div className="modal-content premium-modal" style={{ maxWidth: '600px' }}>
          <button className="modal-close-btn" onClick={() => window.closeModal && window.closeModal('applicant-detail-modal')}>✕</button>
          <div className="modal-header">
            <h2 id="app-detail-name">Applicant Name</h2>
            <p className="modal-subtitle" id="app-detail-job">Job Title</p>
          </div>

          <div style={{ padding: '1.5rem', lineHeight: '1.8' }}>
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#374151' }}>Email:</strong>
              <p id="app-detail-email" style={{ color: '#6b7280', margin: '0.25rem 0 0 0' }}>-</p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#374151' }}>Phone:</strong>
              <p id="app-detail-phone" style={{ color: '#6b7280', margin: '0.25rem 0 0 0' }}>-</p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#374151' }}>Experience:</strong>
              <p id="app-detail-experience" style={{ color: '#6b7280', margin: '0.25rem 0 0 0' }}>-</p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#374151' }}>Education:</strong>
              <p id="app-detail-education" style={{ color: '#6b7280', margin: '0.25rem 0 0 0' }}>-</p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#374151' }}>Why they want to join:</strong>
              <p id="app-detail-reason" style={{ color: '#6b7280', margin: '0.25rem 0 0 0', whiteSpace: 'pre-wrap' }}>-</p>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a id="app-detail-resume" href="#" target="_blank" className="btn-primary hidden" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                View Resume
              </a>
              <a id="app-detail-linkedin" href="#" target="_blank" className="btn-primary hidden" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', background: '#0077b5' }}>
                LinkedIn
              </a>
              <a id="app-detail-github" href="#" target="_blank" className="btn-primary hidden" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', background: '#24292e' }}>
                GitHub
              </a>
              <a id="app-detail-portfolio" href="#" target="_blank" className="btn-primary hidden" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', background: '#8b5cf6' }}>
                Portfolio
              </a>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => window.closeModal && window.closeModal('applicant-detail-modal')}>
              Close
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: EMAIL COMPOSE */}
      <div id="email-compose-modal" className="modal hidden" onClick={(e) => { if (e.target.id === 'email-compose-modal') document.getElementById('email-compose-modal').classList.add('hidden'); }}>
        <div className="modal-content premium-modal" style={{ maxWidth: '560px' }}>
          <button className="modal-close-btn" onClick={() => document.getElementById('email-compose-modal').classList.add('hidden')}>✕</button>
          <div className="modal-header">
            <h2>📧 Compose Email</h2>
            <p className="modal-subtitle">Send from hr@diverseloopers.com</p>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div className="input-group">
              <label>To</label>
              <input id="email-to" type="email" readOnly style={{ background: '#f8fafc' }} />
            </div>
            <div className="input-group">
              <label>Subject</label>
              <input id="email-subject" type="text" />
            </div>
            <div className="input-group">
              <label>Message</label>
              <textarea id="email-body" rows={8} style={{ resize: 'vertical', minHeight: '160px' }}></textarea>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => document.getElementById('email-compose-modal').classList.add('hidden')}>Cancel</button>
            <button id="send-email-btn" type="button" className="btn-primary" onClick={() => window.sendEmailFromDashboard && window.sendEmailFromDashboard()}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              Send Email
            </button>
          </div>
        </div>
      </div>

      {/* Executive Modal */}
      <div id="exec-modal" className="modal" style={{ display: 'none' }}>
        <div className="modal-content" style={{ maxWidth: '480px' }}>
          <h3 id="exec-modal-title">Add New Executive</h3>
          <form id="exec-form" onSubmit={(e) => {
            e.preventDefault();
            window.saveExecutive && window.saveExecutive();
          }}>
            <input type="hidden" id="exec-edit-id" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Full Name *</label>
                <input type="text" id="exec-name" required className="form-input" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Email *</label>
                <input type="email" id="exec-email" required className="form-input" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Role *</label>
                <select id="exec-role" required className="form-input" style={{ width: '100%' }}>
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
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Phone</label>
                <input type="text" id="exec-phone" className="form-input" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Password {'{'}new exec only{'}'}</label>
                <input type="password" id="exec-password" className="form-input" style={{ width: '100%' }} placeholder="Set password" />
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button type="submit" className="btn-primary">Save</button>
              <button type="button" className="btn-secondary" onClick={() => {
                document.getElementById('exec-modal').style.display = 'none';
              }}>Cancel</button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL: UPLOAD DOCUMENTS */}
      <div id="upload-docs-modal" className="modal hidden" onClick={(e) => { if (e.target.id === 'upload-docs-modal') window.closeModal && window.closeModal('upload-docs-modal'); }}>
        <div className="modal-content premium-modal" style={{ maxWidth: '560px' }}>
          <button className="modal-close-btn" onClick={() => window.closeModal && window.closeModal('upload-docs-modal')}>✕</button>
          <div className="modal-header">
            <h2>📄 Upload Documents</h2>
            <p className="modal-subtitle" id="upload-docs-emp-info">Employee</p>
          </div>
          <input type="hidden" id="upload-docs-emp-id" />
          <div id="upload-docs-container" style={{ padding: '1.5rem' }}>
            <p style={{ color: '#94a3b8', textAlign: 'center' }}>Loading...</p>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-text" onClick={() => window.closeModal && window.closeModal('upload-docs-modal')}>Cancel</button>
            <button type="button" className="btn-primary" onClick={() => window.handleUploadDocs && window.handleUploadDocs()}>Upload Documents</button>
          </div>
        </div>
      </div>

      {/* MODAL: EMPLOYEE DETAIL */}
      <div id="employee-detail-modal" className="modal hidden" onClick={(e) => { if (e.target.id === 'employee-detail-modal') window.closeModal && window.closeModal('employee-detail-modal'); }}>
        <div className="modal-content premium-modal" style={{ maxWidth: '900px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <button className="modal-close-btn" onClick={() => window.closeModal && window.closeModal('employee-detail-modal')}>✕</button>

          {/* Header */}
          <div className="modal-header" style={{ paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h2 id="emp-detail-name" style={{ margin: 0 }}>Employee Name</h2>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span id="emp-detail-id" style={{ background: '#ede9fe', color: '#6C5CE7', padding: '2px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>ID</span>
                  <span id="emp-detail-dept" style={{ background: '#dbeafe', color: '#2563eb', padding: '2px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>Dept</span>
                  <span id="emp-detail-designation" style={{ background: '#f0fdf4', color: '#16a34a', padding: '2px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>Role</span>
                  <span id="emp-detail-email" style={{ color: '#6b7280', fontSize: '0.8rem' }}>email</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid #f1f5f9', padding: '0 1.5rem', flexWrap: 'wrap' }}>
            <button className="emp-detail-tab active" data-tab="overview" onClick={() => window.switchDetailTab && window.switchDetailTab('overview')} style={{ padding: '0.65rem 1.2rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#6C5CE7', borderBottom: '2px solid #6C5CE7', marginBottom: '-2px' }}>Overview</button>
            <button className="emp-detail-tab" data-tab="tasks" onClick={() => window.switchDetailTab && window.switchDetailTab('tasks')} style={{ padding: '0.65rem 1.2rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', borderBottom: '2px solid transparent', marginBottom: '-2px' }}>Tasks</button>
            <button className="emp-detail-tab" data-tab="leaves" onClick={() => window.switchDetailTab && window.switchDetailTab('leaves')} style={{ padding: '0.65rem 1.2rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', borderBottom: '2px solid transparent', marginBottom: '-2px' }}>Leaves</button>
            <button className="emp-detail-tab" data-tab="attendance" onClick={() => window.switchDetailTab && window.switchDetailTab('attendance')} style={{ padding: '0.65rem 1.2rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', borderBottom: '2px solid transparent', marginBottom: '-2px' }}>Attendance</button>
            <button className="emp-detail-tab" data-tab="documents" onClick={() => window.switchDetailTab && window.switchDetailTab('documents')} style={{ padding: '0.65rem 1.2rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', borderBottom: '2px solid transparent', marginBottom: '-2px' }}>Documents</button>
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
            {/* Overview Tab */}
            <div id="emp-detail-content-overview">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#f8f7ff', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#6C5CE7' }} id="emp-stat-total-tasks">0</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Total Tasks</div>
                </div>
                <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a' }} id="emp-stat-completed-tasks">0</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Completed</div>
                </div>
                <div style={{ background: '#fffbeb', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }} id="emp-stat-pending-tasks">0</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Pending</div>
                </div>
                <div style={{ background: '#fef2f2', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc2626' }} id="emp-stat-rejected-tasks">0</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Rejected</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb' }} id="emp-stat-total-leaves">0</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Total Leaves</div>
                </div>
                <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a' }} id="emp-stat-approved-leaves">0</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Approved</div>
                </div>
                <div style={{ background: '#fef2f2', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc2626' }} id="emp-stat-rejected-leaves">0</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Rejected</div>
                </div>
                <div style={{ background: '#f8f7ff', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#6C5CE7' }} id="emp-stat-attendance-pct">0%</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Attendance</div>
                </div>
              </div>
            </div>

            {/* Tasks Tab */}
            <div id="emp-detail-content-tasks" style={{ display: 'none' }}>
              <div className="table-container">
                <table style={{ width: '100%' }}>
                  <thead><tr><th>Title</th><th>Deadline</th><th>Priority</th><th>Status</th><th>Submission</th></tr></thead>
                  <tbody id="emp-tasks-tbody"><tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8' }}>Loading...</td></tr></tbody>
                </table>
              </div>
            </div>

            {/* Leaves Tab */}
            <div id="emp-detail-content-leaves" style={{ display: 'none' }}>
              <div className="table-container">
                <table style={{ width: '100%' }}>
                  <thead><tr><th>Start Date</th><th>End Date</th><th>Reason</th><th>Status</th><th>Remarks</th></tr></thead>
                  <tbody id="emp-leaves-tbody"><tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8' }}>Loading...</td></tr></tbody>
                </table>
              </div>
            </div>

            {/* Attendance Tab */}
            <div id="emp-detail-content-attendance" style={{ display: 'none' }}>
              <div className="table-container">
                <table style={{ width: '100%' }}>
                  <thead><tr><th>Date</th><th>Check-In Time</th><th>Face Verified</th><th>Status</th></tr></thead>
                  <tbody id="emp-attendance-tbody"><tr><td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8' }}>Loading...</td></tr></tbody>
                </table>
              </div>
            </div>

            {/* Documents Tab */}
            <div id="emp-detail-content-documents" style={{ display: 'none' }}>
              <div id="emp-docs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <p style={{ color: '#94a3b8', gridColumn: '1/-1', textAlign: 'center' }}>Loading...</p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-actions" style={{ borderTop: '1px solid #f1f5f9', padding: '1rem 1.5rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn-secondary" onClick={() => window.closeModal && window.closeModal('employee-detail-modal')}>Close</button>
            <button type="button" className="btn-primary" onClick={() => window.openIssueDocModal && window.openIssueDocModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>📜 Issue Document</button>
            <button type="button" className="btn-primary" id="emp-detail-email-btn" onClick={() => window.openEmployeeEmail && window.openEmployeeEmail()} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Send Email
            </button>
            <button type="button" style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #dc2626', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={() => window.openEndEmploymentModal && window.openEndEmploymentModal()}>🚫 End Employment</button>
          </div>
        </div>
      </div>

      {/* MODAL: ISSUE DOCUMENT */}
      <div id="issue-doc-modal" className="modal hidden" onClick={(e) => { if (e.target.id === 'issue-doc-modal') window.closeModal && window.closeModal('issue-doc-modal'); }}>
        <div className="modal-content premium-modal" style={{ maxWidth: '620px' }}>
          <button className="modal-close-btn" onClick={() => window.closeModal && window.closeModal('issue-doc-modal')}>✕</button>
          <div className="modal-header">
            <h2>📜 Issue Document</h2>
            <p className="modal-subtitle" id="issue-doc-emp-info">Employee</p>
          </div>
          <input type="hidden" id="issue-doc-emp-id" />

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '2px solid #f1f5f9', padding: '0 1.5rem' }}>
            <button className="issue-doc-tab active" data-tab="template" onClick={() => window.switchIssueTab && window.switchIssueTab('template')} style={{ padding: '0.6rem 1.2rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#6C5CE7', borderBottom: '2px solid #6C5CE7', marginBottom: '-2px' }}>From Template</button>
            <button className="issue-doc-tab" data-tab="custom" onClick={() => window.switchIssueTab && window.switchIssueTab('custom')} style={{ padding: '0.6rem 1.2rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', borderBottom: '2px solid transparent', marginBottom: '-2px' }}>Custom Document</button>
          </div>

          {/* Template Tab */}
          <div id="issue-doc-template-tab" style={{ padding: '1.5rem' }}>
            <div className="input-group">
              <label>Select Template</label>
              <select id="issue-doc-template-select" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <option value="">Loading templates...</option>
              </select>
            </div>
            <div className="input-group" style={{ marginTop: '1rem' }}>
              <label>Joining Date <span style={{ color: '#dc2626' }}>*</span></label>
              <input type="date" id="issue-doc-join-date" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            </div>
            <div className="input-group" style={{ marginTop: '1rem' }}>
              <label>Email Subject <span style={{ color: '#9ca3af', fontWeight: 400, fontSize: '0.75rem' }}>(Optional — auto-generated if empty)</span></label>
              <input type="text" id="issue-tpl-email-subject" placeholder="Leave empty for default" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            </div>
            <div className="input-group" style={{ marginTop: '1rem' }}>
              <label>Email Body <span style={{ color: '#9ca3af', fontWeight: 400, fontSize: '0.75rem' }}>(Optional)</span></label>
              <textarea id="issue-tpl-email-body" rows={3} placeholder="Leave empty for default" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', resize: 'vertical' }}></textarea>
            </div>
          </div>

          {/* Custom Tab */}
          <div id="issue-doc-custom-tab" style={{ padding: '1.5rem', display: 'none' }}>
            <div className="input-group">
              <label>Document Title <span style={{ color: '#dc2626' }}>*</span></label>
              <input type="text" id="issue-custom-title" placeholder="e.g. Performance Report" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            </div>
            <div className="input-group" style={{ marginTop: '1rem' }}>
              <label>Upload Document <span style={{ color: '#dc2626' }}>*</span></label>
              <input type="file" id="issue-custom-file" accept="image/*,.pdf,.doc,.docx" />
            </div>
            <div className="input-group" style={{ marginTop: '1rem' }}>
              <label>Email Subject <span style={{ color: '#dc2626' }}>*</span></label>
              <input type="text" id="issue-custom-email-subject" placeholder="Subject for the email" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            </div>
            <div className="input-group" style={{ marginTop: '1rem' }}>
              <label>Email Body <span style={{ color: '#dc2626' }}>*</span></label>
              <textarea id="issue-custom-email-body" rows={4} placeholder="Write the email content..." style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', resize: 'vertical' }}></textarea>
            </div>
          </div>

          <div className="input-group" style={{ margin: '1rem 1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1e293b', fontWeight: 700, fontSize: '0.82rem' }}>
              🔒 HRMS Security Password <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '0.2rem 0 0.5rem' }}>
              Required by CEO authorization policy to issue official documents.
            </p>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                id="issue-doc-auth-pass"
                placeholder="Enter CEO authorization password..."
                style={{ width: '100%', padding: '8px 12px', paddingRight: '36px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                required
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('issue-doc-auth-pass');
                  if (input) input.type = input.type === 'password' ? 'text' : 'password';
                }}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                title="Show/Hide password"
              >
                👁️
              </button>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-text" onClick={() => window.closeModal && window.closeModal('issue-doc-modal')}>Cancel</button>
            <button type="button" className="btn-primary" id="issue-doc-submit-btn" onClick={() => window.handleIssueDocument && window.handleIssueDocument()}>Issue Document</button>
          </div>
        </div>
      </div>

      {/* MODAL: END EMPLOYMENT */}
      <div id="end-employment-modal" className="modal hidden" onClick={(e) => { if (e.target.id === 'end-employment-modal') window.closeModal && window.closeModal('end-employment-modal'); }}>
        <div className="modal-content premium-modal" style={{ maxWidth: '560px' }}>
          <button className="modal-close-btn" onClick={() => window.closeModal && window.closeModal('end-employment-modal')}>✕</button>
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)', margin: '-1.5rem -1.5rem 1.5rem', padding: '1.5rem', borderRadius: '12px 12px 0 0' }}>
            <h2 style={{ color: '#fff', margin: 0 }}>🚫 End Employment</h2>
            <p style={{ color: '#fecaca', margin: '0.25rem 0 0', fontSize: '0.85rem' }} id="end-emp-info">Employee</p>
          </div>
          <input type="hidden" id="end-emp-id" />

          <div style={{ padding: '0 1.5rem 1.5rem' }}>
            <div className="input-group">
              <label>Reason for Ending Employment <span style={{ color: '#dc2626' }}>*</span></label>
              <textarea id="end-emp-reason" rows={3} placeholder="Internship completed / Contract ended / Terminated..." style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', resize: 'vertical' }} required></textarea>
            </div>

            <div style={{ margin: '1rem 0' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>Issued Documents</label>
              <div id="end-emp-docs-list" style={{ maxHeight: '120px', overflowY: 'auto', marginTop: '0.5rem', border: '1px solid #f1f5f9', borderRadius: '8px', padding: '8px' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>Loading...</p>
              </div>
            </div>

            <div className="input-group" style={{ marginTop: '1rem' }}>
              <label style={{ fontSize: '0.85rem' }}>Type <strong style={{ color: '#dc2626' }} id="end-emp-confirm-text">{'"end employment of Employee Name"'}</strong> to confirm</label>
              <input type="text" id="end-emp-confirmation" placeholder="Type confirmation text..." style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fecaca' }} />
            </div>

            <div className="input-group" style={{ marginTop: '1.25rem', padding: '1rem', background: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#991b1b', fontWeight: 700, fontSize: '0.82rem' }}>
                🔒 HRMS Security Password <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <p style={{ fontSize: '0.72rem', color: '#b91c1c', margin: '0.2rem 0 0.5rem' }}>
                Required by CEO authorization policy to terminate employment.
              </p>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  id="end-emp-auth-pass"
                  placeholder="Enter CEO authorization password..."
                  style={{ width: '100%', padding: '8px 12px', paddingRight: '36px', borderRadius: '8px', border: '1px solid #fca5a5' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('end-emp-auth-pass');
                    if (input) input.type = input.type === 'password' ? 'text' : 'password';
                  }}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b' }}
                  title="Show/Hide password"
                >
                  👁️
                </button>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-text" onClick={() => window.closeModal && window.closeModal('end-employment-modal')}>Cancel</button>
            <button type="button" style={{ padding: '0.5rem 1.5rem', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontWeight: 700 }} onClick={() => window.handleEndEmployment && window.handleEndEmployment()}>End Employment</button>
          </div>
        </div>
      </div>

      {/* MODAL: DELETE EMPLOYEE (SECURED) */}
      <div id="delete-employee-modal" className="modal hidden" onClick={(e) => { if (e.target.id === 'delete-employee-modal') window.closeModal && window.closeModal('delete-employee-modal'); }}>
        <div className="modal-content premium-modal" style={{ maxWidth: '500px' }}>
          <button className="modal-close-btn" onClick={() => window.closeModal && window.closeModal('delete-employee-modal')}>✕</button>
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)', margin: '-1.5rem -1.5rem 1.5rem', padding: '1.5rem', borderRadius: '12px 12px 0 0' }}>
            <h2 style={{ color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🗑️ Delete Employee Record</h2>
            <p style={{ color: '#fecaca', margin: '0.25rem 0 0', fontSize: '0.85rem' }} id="delete-emp-info">Employee</p>
          </div>
          <input type="hidden" id="delete-emp-uuid" />

          <div style={{ padding: '0 1.5rem 1.5rem' }}>
            <div style={{ background: '#fef2f2', borderLeft: '4px solid #dc2626', padding: '12px 16px', borderRadius: '0 8px 8px 0', marginBottom: '1.25rem' }}>
              <p style={{ margin: 0, color: '#991b1b', fontSize: '0.82rem', lineHeight: '1.5' }}>
                <strong>⚠️ Warning:</strong> This will permanently erase the employee profile, auth login credentials, facial data, assignments, tasks, attendance records, and ratings. This action cannot be undone.
              </p>
            </div>

            <div className="input-group" style={{ padding: '1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1e293b', fontWeight: 700, fontSize: '0.82rem' }}>
                🔒 HRMS Security Password <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '0.2rem 0 0.5rem' }}>
                Enter the CEO-authorized password to confirm deletion.
              </p>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  id="delete-emp-auth-pass"
                  placeholder="Enter CEO authorization password..."
                  style={{ width: '100%', padding: '8px 12px', paddingRight: '36px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('delete-emp-auth-pass');
                    if (input) input.type = input.type === 'password' ? 'text' : 'password';
                  }}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                  title="Show/Hide password"
                >
                  👁️
                </button>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-text" onClick={() => window.closeModal && window.closeModal('delete-employee-modal')}>Cancel</button>
            <button type="button" id="delete-emp-confirm-btn" style={{ padding: '0.55rem 1.5rem', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={() => window.confirmDeleteEmployee && window.confirmDeleteEmployee()}>
              Confirm &amp; Delete
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: ADD/EDIT MANAGER */}
      <div id="manager-modal" className="modal hidden" onClick={(e) => { if (e.target.id === 'manager-modal') window.closeModal && window.closeModal('manager-modal'); }}>
        <div className="modal-content premium-modal" style={{ maxWidth: '600px' }}>
          <button className="modal-close-btn" onClick={() => window.closeModal && window.closeModal('manager-modal')}>✕</button>
          <div className="modal-header">
            <h2 id="manager-modal-title">Add Manager</h2>
          </div>
          <input type="hidden" id="edit-manager-id" />
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group">
              <label>Select Existing Employee (optional)</label>
              <select id="mgr-employee-select" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <option value="">-- External Manager (not an employee) --</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label>Full Name <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" id="mgr-name" placeholder="Manager name" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>
              <div className="input-group">
                <label>Email <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="email" id="mgr-email" placeholder="manager@email.com" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label>Designation</label>
                <input type="text" id="mgr-designation" placeholder="e.g. Senior Project Manager" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>
              <div className="input-group">
                <label>Project Name</label>
                <input type="text" id="mgr-project" placeholder="e.g. Project Alpha" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>
            </div>
            <div className="input-group">
              <label>Login Password (for executive login)</label>
              <input type="text" id="mgr-password" placeholder="Default: manager-access-2026" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            </div>
            <div className="input-group">
              <label>Signature Upload</label>
              <input type="file" id="mgr-signature" accept="image/*" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <img id="mgr-signature-preview" src="" alt="" style={{ display: 'none', maxHeight: '60px', marginTop: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px' }} />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-text" onClick={() => window.closeModal && window.closeModal('manager-modal')}>Cancel</button>
            <button type="button" className="btn-primary" onClick={() => window.saveManager && window.saveManager()}>Save Manager</button>
          </div>
        </div>
      </div>

      {/* MODAL: ASSIGN EMPLOYEES TO MANAGER */}
      <div id="assign-employees-modal" className="modal hidden" onClick={(e) => { if (e.target.id === 'assign-employees-modal') window.closeModal && window.closeModal('assign-employees-modal'); }}>
        <div className="modal-content premium-modal" style={{ maxWidth: '500px' }}>
          <button className="modal-close-btn" onClick={() => window.closeModal && window.closeModal('assign-employees-modal')}>✕</button>
          <div className="modal-header">
            <h2>Assign Employees</h2>
          </div>
          <input type="hidden" id="assign-manager-id" />
          <div style={{ padding: '1.5rem' }}>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>Select employees to assign to this manager:</p>
            <div id="assign-employees-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <p style={{ color: '#94a3b8' }}>Loading employees...</p>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-text" onClick={() => window.closeModal && window.closeModal('assign-employees-modal')}>Cancel</button>
            <button type="button" className="btn-primary" onClick={() => window.saveAssignments && window.saveAssignments()}>Save Assignments</button>
          </div>
        </div>
      </div>

      {/* MODAL: HR RATING FORM */}
      <div id="hr-rating-modal" className="modal hidden" onClick={(e) => { if (e.target.id === 'hr-rating-modal') window.closeModal && window.closeModal('hr-rating-modal'); }}>
        <div className="modal-content premium-modal" style={{ maxWidth: '700px' }}>
          <button className="modal-close-btn" onClick={() => window.closeModal && window.closeModal('hr-rating-modal')}>✕</button>
          <div className="modal-header">
            <h2>Rate Employees & Managers</h2>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Month:</label>
              <input type="month" id="hr-rating-month-input" style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            </div>
            <div id="hr-rating-form-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <p style={{ color: '#94a3b8', textAlign: 'center' }}>Loading...</p>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-text" onClick={() => window.closeModal && window.closeModal('hr-rating-modal')}>Cancel</button>
            <button type="button" className="btn-primary" onClick={() => window.submitHRRatings && window.submitHRRatings()}>Submit Ratings</button>
          </div>
        </div>
      </div>

      {/* MODAL: POST ANNOUNCEMENT */}
      <div id="announcement-modal" className="modal hidden" onClick={(e) => { if (e.target.id === 'announcement-modal') window.closeModal && window.closeModal('announcement-modal'); }}>
        <div className="modal-content premium-modal" style={{ maxWidth: '550px' }}>
          <button className="modal-close-btn" onClick={() => window.closeModal && window.closeModal('announcement-modal')}>✕</button>
          <div className="modal-header">
            <h2>New Announcement</h2>
          </div>
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group">
              <label>Title <span style={{ color: '#dc2626' }}>*</span></label>
              <input type="text" id="ann-title" placeholder="Announcement title" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a' }} />
            </div>
            <div className="input-group">
              <label>Message <span style={{ color: '#dc2626' }}>*</span></label>
              <textarea id="ann-message" rows={5} placeholder="Write your announcement..." style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', resize: 'vertical', background: '#fff', color: '#0f172a' }}></textarea>
            </div>
            <div className="input-group">
              <label>Scope</label>
              <select id="ann-scope" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a' }}>
                <option value="all">All Employees (Organization-wide)</option>
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-text" onClick={() => window.closeModal && window.closeModal('announcement-modal')}>Cancel</button>
            <button type="button" className="btn-primary" onClick={() => window.postAnnouncement && window.postAnnouncement()}>Post Announcement</button>
          </div>
        </div>
      </div>

    </>
  );
}