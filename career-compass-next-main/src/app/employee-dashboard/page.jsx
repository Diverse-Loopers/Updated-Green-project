'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import './employee-dashboard.css';
import { initEmployeeDashboard } from '@/lib/pages/employee';

export default function EmployeeDashboardPage() {
  useEffect(() => {
    initEmployeeDashboard();
  }, []);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <Script
        src="https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"
        strategy="beforeInteractive"
      />

      <div className="dashboard-container">
        {/* Mobile Menu Button */}
        <button id="mobile-menu-btn">☰</button>

        {/* Sidebar */}
        <aside className="sidebar" id="sidebar">

          <div className="logo">
            <div className="logo-content">
              <div className="logo-image">
                <img
                  src="/images/logo.png"
                  alt="Diverse Loopers"
                />
              </div>
            </div>
            <p className="logo-subtitle">Employee Panel</p>
          </div>

          <div className="user-profile-summary">
            <div className="user-card">
              <div className="user-avatar">
                <span id="user-initials">!</span>
              </div>
              <div className="user-info">
                <p id="sidebar-user-name">Loading...</p>
                <p id="sidebar-user-id">...</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="nav-links">
            <ul>
              <li>
                <button className="active" onClick={() => window.showSection && window.showSection('dashboard')}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => window.showSection && window.showSection('tasks')}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  My Tasks
                </button>
              </li>
              <li>
                <button onClick={() => window.showSection && window.showSection('leaves')}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Apply Leave
                </button>
              </li>
            </ul>
          </nav>

          {/* Logout */}
          <div className="logout-section">
            <button onClick={() => window.logoutUser && window.logoutUser()}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="content-wrapper">
            {/* SECTION: DASHBOARD */}
            <section id="dashboard-section">

              <div className="header">
                <div>
                  <h2>Welcome back, <span id="welcome-name">User</span>!</h2>
                  <p className="text-muted">Here is your daily overview.</p>
                </div>
                <div className="header-actions">
                  <div id="attendance-box">
                    <button
                      id="mark-attendance-btn"
                      className="btn-primary"
                      onClick={() => window.markAttendance && window.markAttendance()}
                    >
                      Mark Attendance
                    </button>
                    <p
                      id="attendance-status"
                      className="text-muted"
                      style={{ fontSize: '0.9rem', marginTop: '0.5rem', textAlign: 'right' }}
                    ></p>
                  </div>

                  {/* Notification Bell */}
                  <div className="notification-wrapper" style={{ position: 'relative' }}>

                    <button id="notif-btn">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <span id="notif-count" className="badge hidden">0</span>
                    </button>
                    <div id="notif-dropdown" className="dropdown-content hidden">
                      <div className="dropdown-header">
                        Notifications{' '}
                        <button onClick={() => window.markAllRead && window.markAllRead()} className="mark-read-btn">
                          Mark all read
                        </button>
                      </div>
                      <ul id="notif-list">
                        <li className="empty-notif">No new notifications</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>


              <div className="card-grid">
                <div className="card">
                  <div className="card-content">
                    <div>
                      <h3>Tasks Pending</h3>
                      <div className="stat-value" id="stat-pending-tasks">0</div>
                    </div>
                    <div className="card-icon primary">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-content">
                    <div>
                      <h3>Attendance (This Month)</h3>
                      <div className="stat-value" id="stat-attendance">0%</div>
                    </div>
                    <div className="card-icon success">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-content">
                    <div>
                      <h3>Leaves Taken</h3>
                      <div className="stat-value" id="stat-leaves">0</div>
                    </div>
                    <div className="card-icon warning">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>


              <div className="table-container">
                <div className="table-header">
                  <h2>Recent Attendance</h2>
                </div>
                <div className="table-wrapper">
                  <table id="recent-attendance-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Check In</th>
                        <th>Status</th>
                        <th>Verification</th>
                      </tr>
                    </thead>
                    <tbody></tbody>
                  </table>
                </div>
              </div>
            </section>


            <section id="tasks-section" className="hidden">
              <div className="header">
                <div>
                  <h2>My Tasks</h2>
                  <p className="text-muted">Track and submit your assigned tasks</p>
                </div>
              </div>

              <div className="table-container">
                <table id="my-tasks-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Date Assigned</th>
                      <th>Deadline</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
              </div>
            </section>


            <section id="leaves-section" className="hidden">
              <div className="header">
                <div>
                  <h2>Leave Applications</h2>
                  <p className="text-muted">Manage your leave requests</p>
                </div>
                <div className="header-actions">
                  <button
                    className="btn-primary"
                    onClick={() => window.openLeaveModal && window.openLeaveModal()}
                  >
                    + Apply Leave
                  </button>
                </div>
              </div>
              <div className="table-container">
                <table id="my-leaves-table">
                  <thead>
                    <tr>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* MODAL: SUBMIT TASK */}
      <div id="submit-task-modal" className="modal hidden">
        <div className="modal-content" style={{ textAlign: 'left' }}>
          <h2 style={{ marginBottom: '1rem' }}>Submit Task</h2>
          <form id="submit-task-form" onSubmit={(e) => window.handleSubmitTask && window.handleSubmitTask(e)}>
            <input type="hidden" id="submit-task-id" />
            <div className="input-group">
              <label>Submission Link / Notes</label>
              <textarea
                id="submission-link"
                rows={4}
                placeholder="Paste drive link or document link..."
                required
              ></textarea>
            </div>

            <div className="modal-actions">
              <button type="submit" className="btn-primary">Submit</button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => window.closeModal && window.closeModal('submit-task-modal')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL: APPLY LEAVE */}
      <div id="apply-leave-modal" className="modal hidden">
        <div className="modal-content" style={{ textAlign: 'left' }}>
          <h2 style={{ marginBottom: '1rem' }}>Apply for Leave</h2>
          <form id="apply-leave-form" onSubmit={(e) => window.handleApplyLeave && window.handleApplyLeave(e)}>
            <div className="input-group">
              <label>Start Date</label>
              <input type="date" id="leave-start" required />
            </div>
            <div className="input-group">
              <label>End Date</label>
              <input type="date" id="leave-end" required />
            </div>
            <div className="input-group">
              <label>Reason</label>
              <textarea id="leave-reason" rows={3} required></textarea>
            </div>

            <div className="modal-actions">
              <button type="submit" className="btn-primary">Apply</button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => window.closeModal && window.closeModal('apply-leave-modal')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL: CAMERA (Face Verification) */}
      <div id="camera-modal" className="modal hidden">
        <div className="modal-content">
          <h2>Verify Attendance</h2>
          <div className="camera-feed">
            <video id="video" width="400" height="300" autoPlay muted></video>
            <canvas id="overlay"></canvas>
          </div>
          <p id="status-msg">Loading models...</p>
          <button id="capture-btn" className="btn-secondary" disabled>
            Verify & Check In
          </button>
          <button
            id="close-modal"
            className="btn-text"
            onClick={() => window.closeModal && window.closeModal('camera-modal')}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}