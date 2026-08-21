'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import './manager-dashboard.css';

export default function ManagerDashboard() {
  useEffect(() => {
    // Import and init the manager dashboard logic
    import('@/lib/pages/manager-dashboard.js').then((module) => {
      if (module.initManagerDashboard) {
        module.initManagerDashboard();
      }
    });
  }, []);

  return (
    <>
      <meta name="supabase-url" content={process.env.NEXT_PUBLIC_SUPABASE_URL || ''} />
      <meta name="supabase-key" content={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''} />

      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <Script src="https://unpkg.com/lucide@latest" strategy="beforeInteractive" />

      <div className="bg-[#f1f5f9] text-slate-900 h-screen flex overflow-hidden font-sans">
        {/* Sidebar */}
        <aside id="sidebar" className="w-72 bg-white border-r border-slate-200 flex flex-col fixed lg:static inset-y-0 left-0 z-[70] transition-transform duration-300">
          <div className="p-6 flex items-center gap-3">
            <img src="/DIVERSE LOOPERS (1) bg.png" alt="Logo" className="w-10 h-10 object-contain" />
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Manager</h1>
            <button id="mobile-close-sidebar" className="lg:hidden ml-auto text-slate-500">
              <i data-lucide="x" className="w-6 h-6"></i>
            </button>
          </div>
          
          <div className="px-4 py-2 flex-1 overflow-y-auto custom-scrollbar space-y-1">
            <button onClick={() => window.switchSection('dashboard')} id="nav-dashboard" className="sidebar-link active w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold transition-all">
              <i data-lucide="layout-grid" className="w-5 h-5"></i> Dashboard
            </button>
            <button onClick={() => window.switchSection('team')} id="nav-team" className="sidebar-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold transition-all">
              <i data-lucide="users" className="w-5 h-5"></i> My Team
            </button>
            <button onClick={() => window.switchSection('tasks')} id="nav-tasks" className="sidebar-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold transition-all">
              <i data-lucide="check-square" className="w-5 h-5"></i> Tasks
            </button>
            <button onClick={() => window.switchSection('attendance')} id="nav-attendance" className="sidebar-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold transition-all">
              <i data-lucide="calendar-check" className="w-5 h-5"></i> Attendance
            </button>
            <button onClick={() => window.switchSection('ratings')} id="nav-ratings" className="sidebar-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold transition-all">
              <i data-lucide="star" className="w-5 h-5"></i> Ratings
            </button>
            <button onClick={() => window.switchSection('announcements')} id="nav-announcements" className="sidebar-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold transition-all">
              <i data-lucide="megaphone" className="w-5 h-5"></i> Announcements
            </button>
            <button onClick={() => window.switchSection('projects')} id="nav-projects" className="sidebar-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold transition-all">
              <i data-lucide="folder-kanban" className="w-5 h-5"></i> Projects
            </button>
          </div>

          <div className="p-4 border-t border-slate-200">
            <button onClick={() => window.logout()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-semibold transition-colors">
              <i data-lucide="log-out" className="w-5 h-5"></i> Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
          {/* Header */}
          <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 z-[60] sticky top-0">
            <div className="flex items-center gap-4">
              <button id="mobile-menu-btn" className="lg:hidden text-slate-500 hover:text-primary">
                <i data-lucide="menu" className="w-6 h-6"></i>
              </button>
              <h2 id="header-title" className="text-xl font-bold text-slate-800 hidden sm:block">Dashboard</h2>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="relative">
                <button onClick={() => window.toggleNotifications()} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors relative">
                  <i data-lucide="bell" className="w-5 h-5"></i>
                  <span id="notif-badge" className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full hidden"></span>
                </button>
                <div id="notif-dropdown" className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 hidden p-2 flex flex-col max-h-96 overflow-y-auto">
                  <h3 className="text-sm font-bold text-slate-800 p-3 border-b border-slate-100">Notifications</h3>
                  <div id="notif-list" className="py-2 text-sm text-slate-500 text-center">No new notifications</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg" id="header-avatar">M</div>
                <div className="hidden md:block text-sm">
                  <div className="font-bold text-slate-800" id="header-name">Loading...</div>
                  <div className="text-slate-500" id="header-role">Project Manager</div>
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 pb-24" id="main-content-area">
            {/* Dashboard Section */}
            <section id="dashboard-section" className="space-y-8 block">
              <div>
                <h1 className="text-3xl font-bold text-slate-800" id="welcome-text">Welcome back!</h1>
                <p className="text-slate-500 mt-1" id="welcome-subtext">Here's what's happening with your team today.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="stat-card bg-white p-6 rounded-2xl border border-slate-200 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all" onClick={() => window.showStatDetail && window.showStatDetail('team')}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Team Members</p>
                      <h3 className="text-3xl font-bold text-slate-800 mt-2" id="stat-team">0</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <i data-lucide="users" className="w-6 h-6"></i>
                    </div>
                  </div>
                </div>
                <div className="stat-card bg-white p-6 rounded-2xl border border-slate-200 cursor-pointer hover:shadow-lg hover:border-green-300 transition-all" onClick={() => window.showStatDetail && window.showStatDetail('present')}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Present Today</p>
                      <h3 className="text-3xl font-bold text-slate-800 mt-2" id="stat-present">0</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                      <i data-lucide="user-check" className="w-6 h-6"></i>
                    </div>
                  </div>
                </div>
                <div className="stat-card bg-white p-6 rounded-2xl border border-slate-200 cursor-pointer hover:shadow-lg hover:border-red-300 transition-all" onClick={() => window.showStatDetail && window.showStatDetail('leave')}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">On Leave Today</p>
                      <h3 className="text-3xl font-bold text-slate-800 mt-2" id="stat-leave">0</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                      <i data-lucide="user-minus" className="w-6 h-6"></i>
                    </div>
                  </div>
                </div>
                <div className="stat-card bg-white p-6 rounded-2xl border border-slate-200 cursor-pointer hover:shadow-lg hover:border-purple-300 transition-all" onClick={() => window.showStatDetail && window.showStatDetail('tasks')}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Pending Tasks</p>
                      <h3 className="text-3xl font-bold text-slate-800 mt-2" id="stat-tasks">0</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <i data-lucide="clipboard-list" className="w-6 h-6"></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail Panel - shown on card click */}
              <div id="stat-detail-panel" className="hidden bg-white rounded-2xl border border-slate-200 p-6 transition-all">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-800" id="stat-detail-title">Details</h3>
                  <button onClick={() => { document.getElementById('stat-detail-panel')?.classList.add('hidden'); }} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
                </div>
                <div id="stat-detail-content"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <i data-lucide="alert-circle" className="w-5 h-5 text-red-500"></i> Overdue Tasks
                  </h3>
                  <div id="overdue-tasks-list" className="space-y-4">
                    <p className="text-sm text-slate-500">Loading...</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <i data-lucide="folder-kanban" className="w-5 h-5 text-primary"></i> Active Projects
                  </h3>
                  <div id="active-projects-list" className="space-y-4">
                    <p className="text-sm text-slate-500">Loading...</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <i data-lucide="star" className="w-5 h-5 text-yellow-500"></i> Rating Status
                  </h3>
                  <div className="flex flex-col items-center justify-center py-6 text-center" id="rating-status-card">
                     <p className="text-sm text-slate-500">Loading...</p>
                  </div>
                </div>
              </div>
            </section>

            {/* My Team Section */}
            <section id="team-section" className="hidden space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800">My Team</h2>
                <div className="relative w-full sm:w-64">
                  <i data-lucide="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"></i>
                  <input type="text" id="team-search" placeholder="Search team..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" onInput={(e) => window.filterTeam(e.target.value)} />
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">Employee ID</th>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Designation</th>
                        <th className="px-6 py-4">Status Today</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody id="team-table-body" className="divide-y divide-slate-100">
                      <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">Loading team...</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Tasks Section */}
            <section id="tasks-section" className="hidden space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800">Team Tasks</h2>
                <div className="flex gap-3 w-full sm:w-auto">
                   <select id="task-status-filter" className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary" onChange={(e) => window.filterTasks()}>
                      <option value="all">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Submitted">Submitted (Review)</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                   </select>
                   <button onClick={() => window.openAssignTaskModal()} className="bg-primary hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 w-full sm:w-auto justify-center">
                     <i data-lucide="plus" className="w-4 h-4"></i> Assign Task
                   </button>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">Title</th>
                        <th className="px-6 py-4">Assigned To</th>
                        <th className="px-6 py-4">Deadline</th>
                        <th className="px-6 py-4">Priority</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody id="tasks-table-body" className="divide-y divide-slate-100">
                      <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">Loading tasks...</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Attendance Section */}
            <section id="attendance-section" className="hidden space-y-6">
               <h2 className="text-2xl font-bold text-slate-800">Attendance Overview</h2>
               
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Today's Attendance */}
                 <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:col-span-1">
                   <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                     <i data-lucide="clock" className="w-5 h-5 text-primary"></i> Today's Roster
                   </h3>
                   <div id="today-attendance-list" className="space-y-3">
                     <p className="text-sm text-slate-500 text-center py-4">Loading...</p>
                   </div>
                 </div>

                 {/* Monthly Breakdown */}
                 <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:col-span-2">
                   <div className="flex justify-between items-center mb-6">
                     <h3 className="font-bold text-slate-800 flex items-center gap-2">
                       <i data-lucide="calendar" className="w-5 h-5 text-primary"></i> Monthly Breakdown
                     </h3>
                     <input type="month" id="attendance-month" className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm" onChange={(e) => window.loadMonthAttendance(e.target.value)} />
                   </div>
                   <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm whitespace-nowrap">
                       <thead className="text-slate-500 uppercase font-semibold text-xs border-b border-slate-200">
                         <tr>
                           <th className="py-3">Employee</th>
                           <th className="py-3 text-center">Present Days</th>
                           <th className="py-3 text-center">Absent Days</th>
                           <th className="py-3 text-center">Leave Days</th>
                         </tr>
                       </thead>
                       <tbody id="monthly-attendance-body" className="divide-y divide-slate-100">
                         <tr><td colSpan="4" className="py-6 text-center text-slate-500">Loading...</td></tr>
                       </tbody>
                     </table>
                   </div>
                 </div>
               </div>
            </section>

            {/* Ratings Section */}
            <section id="ratings-section" className="hidden space-y-6">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 <h2 className="text-2xl font-bold text-slate-800">Performance Ratings</h2>
               </div>
               
               <div id="ratings-banner" className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl flex items-start gap-3 hidden">
                 <i data-lucide="alert-triangle" className="w-5 h-5 shrink-0 mt-0.5"></i>
                 <div>
                   <p className="font-bold">Pending Ratings</p>
                   <p className="text-sm">Please submit performance ratings for your team for the current month before the 15th.</p>
                 </div>
               </div>

               <div className="bg-white rounded-2xl border border-slate-200 p-6">
                 <div className="flex justify-between items-center mb-6">
                   <h3 className="font-bold text-slate-800 text-lg">Submit Ratings</h3>
                   <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-sm font-semibold" id="ratings-current-month">Month</span>
                 </div>
                 
                 <div className="space-y-6" id="ratings-form-container">
                   <p className="text-center text-slate-500 py-8">Loading team...</p>
                 </div>

                 <div className="mt-8 flex justify-end">
                   <button onClick={() => window.submitRatings()} id="submit-ratings-btn" className="bg-primary hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors hidden">
                     Submit All Ratings
                   </button>
                 </div>
               </div>

               {/* Past Ratings History */}
               <div className="bg-white rounded-2xl border border-slate-200 p-6">
                 <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                   <i data-lucide="history" className="w-5 h-5 text-primary"></i> Rating History
                 </h3>
                 <div id="past-ratings-list" className="space-y-3">
                   <p className="text-center text-slate-400 py-6">Loading past ratings...</p>
                 </div>
               </div>

               {/* Rating Detail Expand Panel */}
               <div id="rating-detail-panel" className="hidden bg-white rounded-2xl border border-slate-200 p-6">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-slate-800 text-lg" id="rating-detail-title">Ratings Detail</h3>
                   <button onClick={() => document.getElementById('rating-detail-panel')?.classList.add('hidden')} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
                 </div>
                 <div id="rating-detail-content" className="space-y-3"></div>
               </div>
            </section>

            {/* Announcements Section */}
            <section id="announcements-section" className="hidden space-y-6">
               <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-slate-800">Team Announcements</h2>
                 <button onClick={() => window.openAnnouncementModal()} className="bg-primary hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
                   <i data-lucide="megaphone" className="w-4 h-4"></i> New Announcement
                 </button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="announcements-grid">
                  <div className="col-span-full text-center text-slate-500 py-8">Loading announcements...</div>
               </div>
            </section>

            {/* Projects Section */}
            <section id="projects-section" className="hidden space-y-6">
               <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-slate-800">Projects</h2>
                 <button onClick={() => window.openProjectModal()} className="bg-primary hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
                   <i data-lucide="folder-plus" className="w-4 h-4"></i> Add Project
                 </button>
               </div>
               
               <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">Project Name</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Start Date</th>
                        <th className="px-6 py-4">End Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody id="projects-table-body" className="divide-y divide-slate-100">
                      <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">Loading projects...</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

          </div>
        </main>
      </div>

      {/* Overlays and Modals */}
      <div id="modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] transition-opacity" style={{display: 'none'}}></div>

      {/* Employee Detail Modal */}
      <div id="emp-detail-modal" className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-[101] w-[95%] max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" style={{display: 'none'}}>
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-800" id="emp-modal-name">Employee Details</h3>
            <p className="text-sm text-slate-500" id="emp-modal-id">Loading...</p>
          </div>
          <button onClick={() => window.closeModal('emp-detail-modal')} className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-xl hover:bg-slate-200">
            <i data-lucide="x" className="w-6 h-6"></i>
          </button>
        </div>
        
        <div className="flex border-b border-slate-200 px-6 gap-2 pt-2 bg-slate-50 overflow-x-auto custom-scrollbar">
          <button onClick={() => window.switchEmpTab('tasks')} id="tab-btn-tasks" className="tab-btn active pb-3">Task History</button>
          <button onClick={() => window.switchEmpTab('attendance')} id="tab-btn-attendance" className="tab-btn pb-3">Attendance</button>
          <button onClick={() => window.switchEmpTab('ratings')} id="tab-btn-ratings" className="tab-btn pb-3">Ratings</button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
          <div id="emp-tab-tasks" className="block space-y-4">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-bold uppercase mb-1">Total</div>
                  <div className="text-xl font-bold text-slate-800" id="emp-stat-total-tasks">0</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <div className="text-xs text-green-600 font-bold uppercase mb-1">On Time</div>
                  <div className="text-xl font-bold text-green-700" id="emp-stat-ontime-tasks">0</div>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <div className="text-xs text-red-600 font-bold uppercase mb-1">Missed</div>
                  <div className="text-xl font-bold text-red-700" id="emp-stat-missed-tasks">0</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                  <div className="text-xs text-orange-600 font-bold uppercase mb-1">Rejected</div>
                  <div className="text-xl font-bold text-orange-700" id="emp-stat-rejected-tasks">0</div>
                </div>
             </div>
             <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200">
                  <tr><th className="py-3 px-4">Task</th><th className="py-3 px-4">Status</th><th className="py-3 px-4">Deadline</th></tr>
                </thead>
                <tbody id="emp-tasks-body" className="divide-y divide-slate-100"></tbody>
             </table>
          </div>
          
          <div id="emp-tab-attendance" className="hidden space-y-4">
             <div className="flex justify-end mb-4">
               <input type="month" id="emp-attendance-month" className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm" onChange={(e) => window.loadEmpAttendanceData(e.target.value)} />
             </div>
             <div className="bg-blue-50 text-blue-800 p-4 rounded-xl mb-4 text-center font-semibold" id="emp-attendance-summary">
               0 present out of 0 working days
             </div>
             <table className="w-full text-left text-sm border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200">
                  <tr><th className="py-3 px-4">Date</th><th className="py-3 px-4">Status</th><th className="py-3 px-4">Time</th></tr>
                </thead>
                <tbody id="emp-attendance-body" className="divide-y divide-slate-100"></tbody>
             </table>
          </div>

          <div id="emp-tab-ratings" className="hidden space-y-4">
             <table className="w-full text-left text-sm border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200">
                  <tr><th className="py-3 px-4">Month</th><th className="py-3 px-4">Manager Rating</th><th className="py-3 px-4">Comments</th></tr>
                </thead>
                <tbody id="emp-ratings-body" className="divide-y divide-slate-100"></tbody>
             </table>
          </div>
        </div>
      </div>

      {/* Assign Task Modal */}
      <div id="assign-task-modal" className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-[101] w-[90%] max-w-lg overflow-hidden flex flex-col" style={{display: 'none'}}>
         <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-bold text-slate-800">Assign New Task</h3>
          <button onClick={() => window.closeModal('assign-task-modal')} className="text-slate-400 hover:text-slate-600 transition-colors">
            <i data-lucide="x" className="w-6 h-6"></i>
          </button>
        </div>
        <form id="assign-task-form" onSubmit={(e) => { e.preventDefault(); window.submitAssignTask(); }} className="p-6 space-y-4">
           <div>
             <label className="block text-sm font-semibold text-slate-700 mb-1">Assign To</label>
             <select id="task-assignee" required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                <option value="">Select Employee</option>
             </select>
           </div>
           <div>
             <label className="block text-sm font-semibold text-slate-700 mb-1">Task Title</label>
             <input type="text" id="task-title" required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Enter task title" />
           </div>
           <div>
             <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
             <textarea id="task-desc" rows="3" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Task details..."></textarea>
           </div>
           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-semibold text-slate-700 mb-1">Deadline</label>
               <input type="date" id="task-deadline" required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
             </div>
             <div>
               <label className="block text-sm font-semibold text-slate-700 mb-1">Priority</label>
               <select id="task-priority" required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary">
                 <option value="Low">Low</option>
                 <option value="Medium">Medium</option>
                 <option value="High">High</option>
               </select>
             </div>
           </div>
           <div className="pt-4 flex gap-3">
             <button type="button" onClick={() => window.closeModal('assign-task-modal')} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition-colors">Cancel</button>
             <button type="submit" id="btn-submit-task" className="flex-1 bg-primary hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-colors">Assign Task</button>
           </div>
        </form>
      </div>

      {/* Announcement Modal */}
      <div id="announcement-modal" className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-[101] w-[90%] max-w-lg overflow-hidden flex flex-col" style={{display: 'none'}}>
         <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-bold text-slate-800">New Announcement</h3>
          <button onClick={() => window.closeModal('announcement-modal')} className="text-slate-400 hover:text-slate-600 transition-colors">
            <i data-lucide="x" className="w-6 h-6"></i>
          </button>
        </div>
        <form id="announcement-form" onSubmit={(e) => { e.preventDefault(); window.submitAnnouncement(); }} className="p-6 space-y-4">
           <div>
             <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
             <input type="text" id="announce-title" required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Announcement title" />
           </div>
           <div>
             <label className="block text-sm font-semibold text-slate-700 mb-1">Message</label>
             <textarea id="announce-msg" required rows="4" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Type your message here..."></textarea>
           </div>
           <div className="pt-4 flex gap-3">
             <button type="button" onClick={() => window.closeModal('announcement-modal')} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition-colors">Cancel</button>
             <button type="submit" id="btn-submit-announce" className="flex-1 bg-primary hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-colors">Post Announcement</button>
           </div>
        </form>
      </div>

      {/* Project Modal */}
      <div id="project-modal" className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-[101] w-[90%] max-w-lg overflow-hidden flex flex-col" style={{display: 'none'}}>
         <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-bold text-slate-800">Add Project</h3>
          <button onClick={() => window.closeModal('project-modal')} className="text-slate-400 hover:text-slate-600 transition-colors">
            <i data-lucide="x" className="w-6 h-6"></i>
          </button>
        </div>
        <form id="project-form" onSubmit={(e) => { e.preventDefault(); window.submitProject(); }} className="p-6 space-y-4">
           <div>
             <label className="block text-sm font-semibold text-slate-700 mb-1">Project Name</label>
             <input type="text" id="project-name" required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="e.g. Q3 Marketing Site" />
           </div>
           <div>
             <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
             <textarea id="project-desc" rows="2" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"></textarea>
           </div>
           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-semibold text-slate-700 mb-1">Start Date</label>
               <input type="date" id="project-start" required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
             </div>
             <div>
               <label className="block text-sm font-semibold text-slate-700 mb-1">End Date</label>
               <input type="date" id="project-end" required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
             </div>
           </div>
           <div className="pt-4 flex gap-3">
             <button type="button" onClick={() => window.closeModal('project-modal')} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition-colors">Cancel</button>
             <button type="submit" id="btn-submit-project" className="flex-1 bg-primary hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-colors">Save Project</button>
           </div>
        </form>
      </div>

    </>
  );
}
