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
      sales: 'Sales Executive', cfo: 'Chief Finance Officer',
      cso: 'Chief Staffing Officer', cmo: 'Chief Marketing Officer',
      coo: 'Chief Operations Officer', strategic_advisor: 'Strategic Advisor'
    };
    let executivesData = [];

    async function loadExecutives() {
      try {
        const res = await fetch('/api/executives/manage');
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
          headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', id, is_active: newStatus })
      });
      loadExecutives();
    };

    window.changeExecPass = async function(id) {
      const newPass = prompt('Enter new password:');
      if (!newPass) return;
      await fetch('/api/executives/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-password', id, password: newPass })
      });
      alert('Password updated.');
    };

    window.deleteExec = async function(id) {
      if (!confirm('Delete this executive?')) return;
      await fetch('/api/executives/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
      loadExecutives();
    };

    // Hook into showSection to auto-load executives
    const origShow = window.showSection;
    window.showSection = function(section) {
      if (origShow) origShow(section);
      if (section === 'executives') loadExecutives();
    };
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
            <button onClick={() => window.showSection && window.showSection('executives')}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Executives
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

            <div className="section-header">
              <h2>Employee Management</h2>
              <button className="btn-primary" onClick={() => window.openAddEmployeeModal && window.openAddEmployeeModal()}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Employee
              </button>
            </div>

            <div className="table-container">
              <table id="employees-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Email</th>
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

          </div>{/* end content-area */}
        </main>
      </div>

      {/* MODAL: ADD EMPLOYEE */}
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

    </>
  );
}