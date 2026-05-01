"use client";

import Script from "next/script";
import { useEffect } from "react";
import "./admin-dashboard.css";
import { initAdminDashboard } from "@/lib/pages/admin-dashboard";

export default function AdminDashboard() {
  useEffect(() => {
    initAdminDashboard();
  }, []);

  return (
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
        <button id="mobile-menu-btn" style={{ display: "none" }}>
          ☰
        </button>

        {/* Sidebar */}
        <aside className="sidebar" id="sidebar">
          <div className="logo">
            <img
              src="/images/logo.png"
              alt="Logo"
              style={{
                width: "80%",
                marginBottom: "1rem",
                borderRadius: "8px",
                background: "white",
                padding: "5px",
              }}
            />
            <br />
            HRMS Admin
          </div>
          <nav className="nav-links">
            <button className="active" onClick={() => window.showSection && window.showSection('employees')}>
              Employees
            </button>
            <button onClick={() => window.showSection && window.showSection('tasks')}>
              Task Management
            </button>
            <button onClick={() => window.showSection && window.showSection('attendance')}>
              Attendance
            </button>
            <button onClick={() => window.showSection && window.showSection('leaves')}>
              Leave Requests
            </button>
            <button onClick={() => window.showSection && window.showSection('applicants')}>
              Job Applicants
            </button>
            <button onClick={() => window.showSection && window.showSection('executives')}>
              Executives
            </button>
            <button onClick={() => window.logoutAdmin && window.logoutAdmin()} style={{ marginTop: "auto", color: "#ef4444" }}>
              Logout
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {/* SECTION: EMPLOYEES */}
          <section id="employees-section">
            <div className="card-grid" style={{ marginBottom: "2rem" }}>
              <div className="card">
                <h3>Total Employees</h3>
                <div className="stat-value" id="stat-total-employees">
                  Loading...
                </div>
              </div>
              <div className="card">
                <h3>Present Today</h3>
                <div className="stat-value" id="stat-present-today">
                  Loading...
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between" style={{ marginBottom: "1.5rem" }}>
              <h2>Employee Management</h2>

              <div className="flex items-center" style={{ gap: "15px" }}>
                <div className="notification-wrapper">
                  <button id="notif-btn" onClick={() => window.toggleNotifications && window.toggleNotifications()}>
                    Notifications <span id="notif-count" className="badge hidden">0</span>
                  </button>
                  <div id="notif-dropdown" className="dropdown-content hidden">
                    <div className="dropdown-header">
                      <span>Notifications</span>
                      <button onClick={() => window.markAllRead && window.markAllRead()} className="mark-read-btn">
                        Mark all read
                      </button>
                    </div>
                    <ul id="notif-list">
                      <li className="empty-notif">No new notifications</li>
                    </ul>
                  </div>
                </div>

                <button className="btn-primary" style={{ width: "auto" }} onClick={() => window.openAddEmployeeModal && window.openAddEmployeeModal()}>
                  + Add Employee
                </button>
              </div>
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
            <div className="flex items-center justify-between" style={{ marginBottom: "1.5rem" }}>
              <h2>Task Management</h2>
              <button className="btn-primary" style={{ width: "auto" }} onClick={() => window.openAssignTaskModal && window.openAssignTaskModal()}>
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
            <h2>Job Applications</h2>
            <div className="table-container">
              <table id="applicants-table">
                <thead>
                  <tr>
                    <th>Applicant Name</th>
                    <th>Job Title</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Experience</th>
                    <th>Applied On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </section>



        </main>
      </div>

      {/* MODAL: ADD EMPLOYEE */}
      <div id="add-employee-modal" className="modal hidden">
        <div className="modal-content premium-modal">
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
      <div id="applicant-detail-modal" className="modal hidden">
        <div className="modal-content premium-modal" style={{ maxWidth: '600px' }}>
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

      {/* EXECUTIVES SECTION */}
      <section id="executives-section" style={{ display: 'none' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
          <h2>Executive Management</h2>
          <button className="btn-primary" style={{ width: 'auto' }} onClick={() => {
            document.getElementById('exec-modal').style.display = 'flex';
            document.getElementById('exec-modal-title').textContent = 'Add New Executive';
            document.getElementById('exec-form').reset();
            document.getElementById('exec-edit-id').value = '';
          }}>+ Add Executive</button>
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
                  <option value="cmo">Chief Managing Officer</option>
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

      {/* Executive management script */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          const ROLE_LABELS = {
            sales: 'Sales Executive',
            cfo: 'Chief Finance Officer',
            cso: 'Chief Staffing Officer',
            cmo: 'Chief Managing Officer',
            coo: 'Chief Operations Officer',
            strategic_advisor: 'Strategic Advisor'
          };

          let executivesData = [];

          async function loadExecutives() {
            try {
              const res = await fetch('/api/executives/manage');
              const data = await res.json();
              if (data.success) {
                executivesData = data.executives;
                renderExecutives();
              }
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

          // Auto-load when section becomes visible
          const origShowSection = window.showSection;
          window.showSection = function(section) {
            if (origShowSection) origShowSection(section);
            if (section === 'executives') loadExecutives();
          };
        })();
      `}} />
    </>
  );
}