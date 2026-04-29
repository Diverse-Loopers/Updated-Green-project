// "use client";

// import './site.admin.css';
// import Script from "next/script";
// import { useEffect } from 'react';
// import {
//   checkAuth,
//   initAdminDashboardListeners,
//   switchView
// } from '@/lib/pages/site.admin';

// export default function AdminDashboard() {
//   useEffect(() => {
//     // Initialize auth check and listeners after component mounts
//     checkAuth();
//     initAdminDashboardListeners();
//   }, []);

//   return (
//     <>
//       {/* Fonts */}
//       <link rel="preconnect" href="https://fonts.googleapis.com" />
//       <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
//       <link
//         href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
//         rel="stylesheet"
//       />

//       {/* CDN Scripts */}
//       <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
//       <Script src="https://unpkg.com/lucide@latest" strategy="beforeInteractive" />

//       {/* Tailwind Config */}
//       <Script id="tailwind-config" strategy="beforeInteractive">
//         {`
//         tailwind.config = {
//           theme: {
//             extend: {
//               colors: {
//                 primary:'#4f46e5',
//                 secondary:'#db2777',
//                 dark:'#0f172a',
//                 surface:'#f8fafc'
//               }
//             }
//           }
//         }
//       `}
//       </Script>

//       {/* BODY */}
//       <div className="bg-[#f1f5f9] text-slate-900 h-screen flex overflow-hidden">

//         {/* SIDEBAR OVERLAY */}
//         <div id="sidebar-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] hidden lg:hidden"></div>

//         {/* DIALOGS */}
//         <div id="dialog-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]" style={{display: 'none'}}></div>

//         <div id="message-box" className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-[2rem] shadow-2xl z-[101] w-[90%] max-w-sm text-center" style={{display: 'none'}}>
//           <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
//             <i data-lucide="bell" className="w-8 h-8"></i>
//           </div>
//           <h4 className="text-xl font-bold mb-2">Notification</h4>
//           <p id="message-box-text" className="text-slate-500 text-sm mb-8"></p>
//           <button id="message-box-close-btn" className="w-full py-3 bg-primary text-white rounded-xl font-bold">
//             Understood
//           </button>
//         </div>

//         <div id="confirm-box" className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-[2rem] shadow-2xl z-[101] w-[90%] max-w-sm text-center" style={{display: 'none'}}>
//           <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
//             <i data-lucide="alert-triangle" className="w-8 h-8"></i>
//           </div>
//           <h4 id="confirm-box-title" className="text-xl font-bold mb-2">Confirm</h4>
//           <p id="confirm-box-text" className="text-slate-500 text-sm mb-8"></p>
//           <div className="flex gap-3">
//             <button id="confirm-cancel-btn" className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">Cancel</button>
//             <button id="confirm-ok-btn" className="flex-1 py-3 bg-primary text-white rounded-xl font-bold">Confirm</button>
//           </div>
//         </div>

//         {/* SIDEBAR */}
//         <aside id="sidebar" className="w-72 bg-white border-r border-slate-200 flex flex-col fixed lg:static inset-y-0 left-0 z-[70] sidebar-transition lg:transform-none">
//           <div className="p-8 flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <img src="/DIVERSE LOOPERS (1) bg.png" className="h-10 w-auto rounded-lg" alt="Logo" />
//               <span className="font-black tracking-tight text-xl uppercase italic text-primary">
//                 DL Admin
//               </span>
//             </div>

//             <button id="close-sidebar" className="lg:hidden p-2 text-slate-400">
//               <i data-lucide="x"></i>
//             </button>
//           </div>

//           <nav className="flex-1 px-4 space-y-2 mt-4 custom-scrollbar overflow-y-auto">

//             <button onClick={() => switchView("dashboard")}
//               id="nav-dashboard"
//               className="sidebar-link active w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold">
//               <i data-lucide="layout-grid" className="w-5 h-5"></i> Dashboard
//             </button>

//             <button onClick={() => switchView("events")}
//               id="nav-events"
//               className="sidebar-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold">
//               <i data-lucide="calendar" className="w-5 h-5"></i> Events
//             </button>

//             <button onClick={() => switchView("courses")}
//               id="nav-courses"
//               className="sidebar-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold">
//               <i data-lucide="book-open" className="w-5 h-5"></i> Courses
//             </button>

//             <button onClick={() => switchView("fame")}
//               id="nav-fame"
//               className="sidebar-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold">
//               <i data-lucide="trophy" className="w-5 h-5"></i> Fame Wall
//             </button>

//             <button onClick={() => switchView("users")}
//               id="nav-users"
//               className="sidebar-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold">
//               <i data-lucide="users" className="w-5 h-5"></i> Users
//             </button>

//             <button onClick={() => switchView("skills")}
//               id="nav-skills"
//               className="sidebar-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold">
//               <i data-lucide="sparkles" className="w-5 h-5"></i> Skills
//             </button>

//             <button onClick={() => switchView("Job-Postings")}
//               id="nav-Job-Postings"
//               className="sidebar-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold">
//               <i data-lucide="briefcase" className="w-5 h-5"></i> Job Postings
//             </button>
//           </nav>

//           <div className="p-6 mt-auto border-t border-slate-100">
//             <button id="logout-button" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold">
//               <i data-lucide="log-out" className="w-4 h-4"></i> Logout
//             </button>
//           </div>
//         </aside>

//         {/* MAIN CONTENT */}
//         <main id="main-scroll-area" className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar relative">

//           <header className="lg:hidden bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-[55]">
//             <div className="flex items-center gap-2">
//               <img src="/DIVERSE LOOPERS (1) bg.png" className="h-8 w-auto" alt="Logo" />
//               <span className="font-bold text-primary italic">Admin</span>
//             </div>
//             <button id="open-sidebar" className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
//               <i data-lucide="menu"></i>
//             </button>
//           </header>

//           {/* DASHBOARD VIEW */}
//           <div id="dashboard-view" className="p-4 md:p-8 space-y-8">
//             <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
//               Executive Dashboard
//             </h1>

//             <p id="current-date" className="text-xs font-bold text-slate-400 uppercase tracking-widest"></p>

//             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
//               <div className="bg-white p-6 rounded-3xl">
//                 <p className="text-xs font-black text-slate-400 uppercase">Students</p>
//                 <p id="total-users" className="text-4xl font-black text-primary">0</p>
//               </div>

//               <div className="bg-white p-6 rounded-3xl">
//                 <p className="text-xs font-black text-slate-400 uppercase">Analyses</p>
//                 <p id="total-analyses" className="text-4xl font-black text-secondary">0</p>
//               </div>

//               <div className="bg-white p-6 rounded-3xl">
//                 <p className="text-xs font-black text-slate-400 uppercase">Avg Match</p>
//                 <p id="avg-match" className="text-4xl font-black text-green-500">0%</p>
//               </div>

//               <div className="bg-white p-6 rounded-3xl">
//                 <p className="text-xs font-black text-slate-400 uppercase">Events</p>
//                 <p id="total-events" className="text-4xl font-black text-orange-500">0</p>
//               </div>
//             </div>

//             <ul id="activity-feed" className="space-y-6"></ul>
//             <div id="chart-grid" className="h-48 flex items-end gap-2"></div>
//             <div id="chart-labels" className="flex justify-between text-[10px] font-bold text-slate-400"></div>
//           </div>

//           {/* OTHER VIEWS - Keep IDs for dynamic population */}
//           <div id="events-view" className="hidden"></div>
//           <div id="fame-view" className="hidden"></div>
//           <div id="courses-view" className="hidden"></div>
//           <div id="users-view" className="hidden"></div>
//           <div id="skills-view" className="hidden"></div>
//           <div id="Job-Postings-view" className="hidden"></div>

//         </main>
//       </div>
//     </>
//   );
// }

"use client";

import './site.admin.css';
import Script from "next/script";
import { useEffect } from 'react';
import {
  checkAuth,
  initAdminDashboardListeners,
  switchView,
  resetCourseForm,
  resetEventForm,
  resetJobPostingForm,
  resetAnnouncementForm,
  resetCouponForm,
  resetTrainerForm
} from '@/lib/pages/site.admin';

export default function AdminDashboard() {
  useEffect(() => {
    checkAuth();
    initAdminDashboardListeners();
  }, []);

  return (
    <>
      {/* Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* CDN Scripts */}
      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      <Script src="https://unpkg.com/lucide@latest" strategy="beforeInteractive" />

      {/* Tailwind Config */}
      <Script id="tailwind-config" strategy="beforeInteractive">
        {`
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
      `}
      </Script>

      {/* BODY */}
      <div className="bg-[#f1f5f9] text-slate-900 h-screen flex overflow-hidden">

        {/* SIDEBAR OVERLAY */}
        <div id="sidebar-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] hidden lg:hidden"></div>

        {/* DIALOGS */}
        <div id="dialog-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]" style={{display: 'none'}}></div>

        <div id="message-box" className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-[2rem] shadow-2xl z-[101] w-[90%] max-w-sm text-center" style={{display: 'none'}}>
          <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <i data-lucide="bell" className="w-8 h-8"></i>
          </div>
          <h4 className="text-xl font-bold mb-2">Notification</h4>
          <p id="message-box-text" className="text-slate-500 text-sm mb-8"></p>
          <button id="message-box-close-btn" className="w-full py-3 bg-primary text-white rounded-xl font-bold">
            Understood
          </button>
        </div>

        <div id="confirm-box" className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-[2rem] shadow-2xl z-[101] w-[90%] max-w-sm text-center" style={{display: 'none'}}>
          <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <i data-lucide="alert-triangle" className="w-8 h-8"></i>
          </div>
          <h4 id="confirm-box-title" className="text-xl font-bold mb-2">Confirm</h4>
          <p id="confirm-box-text" className="text-slate-500 text-sm mb-8"></p>
          <div className="flex gap-3">
            <button id="confirm-cancel-btn" className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">Cancel</button>
            <button id="confirm-ok-btn" className="flex-1 py-3 bg-primary text-white rounded-xl font-bold">Confirm</button>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside id="sidebar" className="w-72 bg-white border-r border-slate-200 flex flex-col fixed lg:static inset-y-0 left-0 z-[70] sidebar-transition lg:transform-none">
          <div className="p-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/DIVERSE LOOPERS (1) bg.png" className="h-10 w-auto rounded-lg" alt="Logo" />
              <span className="font-black tracking-tight text-xl uppercase italic text-primary">
                DL Admin
              </span>
            </div>

            <button id="close-sidebar" className="lg:hidden p-2 text-slate-400">
              <i data-lucide="x"></i>
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4 custom-scrollbar overflow-y-auto">

            <button onClick={() => switchView("dashboard")}
              id="nav-dashboard"
              className="sidebar-link active w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold">
              <i data-lucide="layout-grid" className="w-5 h-5"></i> Dashboard
            </button>

            <button onClick={() => switchView("events")}
              id="nav-events"
              className="sidebar-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold">
              <i data-lucide="calendar" className="w-5 h-5"></i> Events
            </button>

            <button onClick={() => switchView("courses")}
              id="nav-courses"
              className="sidebar-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold">
              <i data-lucide="book-open" className="w-5 h-5"></i> Courses
            </button>

            <button onClick={() => switchView("fame")}
              id="nav-fame"
              className="sidebar-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold">
              <i data-lucide="trophy" className="w-5 h-5"></i> Fame Wall
            </button>

            <button onClick={() => switchView("users")}
              id="nav-users"
              className="sidebar-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold">
              <i data-lucide="users" className="w-5 h-5"></i> Users
            </button>

            <button onClick={() => switchView("skills")}
              id="nav-skills"
              className="sidebar-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold">
              <i data-lucide="sparkles" className="w-5 h-5"></i> Skills
            </button>

            <button onClick={() => switchView("Job-Postings")}
              id="nav-Job-Postings"
              className="sidebar-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold">
              <i data-lucide="briefcase" className="w-5 h-5"></i> Job Postings
            </button>

            <button onClick={() => switchView("announcements")}
              id="nav-announcements"
              className="sidebar-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold">
              <i data-lucide="megaphone" className="w-5 h-5"></i> Announcements
            </button>

            <button onClick={() => switchView("coupons")}
              id="nav-coupons"
              className="sidebar-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold">
              <i data-lucide="ticket" className="w-5 h-5"></i> Coupons
            </button>

            <button onClick={() => switchView("trainers")}
              id="nav-trainers"
              className="sidebar-link w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-semibold">
              <i data-lucide="graduation-cap" className="w-5 h-5"></i> Trainers
            </button>
          </nav>

          <div className="p-6 mt-auto border-t border-slate-100">
            <button id="logout-button" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold">
              <i data-lucide="log-out" className="w-4 h-4"></i> Logout
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main id="main-scroll-area" className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar relative">

          <header className="lg:hidden bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-[55]">
            <div className="flex items-center gap-2">
              <img src="/DIVERSE LOOPERS (1) bg.png" className="h-8 w-auto" alt="Logo" />
              <span className="font-bold text-primary italic">Admin</span>
            </div>
            <button id="open-sidebar" className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
              <i data-lucide="menu"></i>
            </button>
          </header>

          {/* DASHBOARD VIEW */}
          <div id="dashboard-view" className="p-4 md:p-8 space-y-8">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Executive Dashboard
            </h1>

            <p id="current-date" className="text-xs font-bold text-slate-400 uppercase tracking-widest"></p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white p-6 rounded-3xl">
                <p className="text-xs font-black text-slate-400 uppercase">Students</p>
                <p id="total-users" className="text-4xl font-black text-primary">0</p>
              </div>

              <div className="bg-white p-6 rounded-3xl">
                <p className="text-xs font-black text-slate-400 uppercase">Analyses</p>
                <p id="total-analyses" className="text-4xl font-black text-secondary">0</p>
              </div>

              <div className="bg-white p-6 rounded-3xl">
                <p className="text-xs font-black text-slate-400 uppercase">Avg Match</p>
                <p id="avg-match" className="text-4xl font-black text-green-500">0%</p>
              </div>

              <div className="bg-white p-6 rounded-3xl">
                <p className="text-xs font-black text-slate-400 uppercase">Events</p>
                <p id="total-events" className="text-4xl font-black text-orange-500">0</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl">
              <h3 className="text-lg font-bold mb-6">Recent Activity</h3>
              <ul id="activity-feed" className="space-y-6"></ul>
            </div>

            <div className="bg-white p-6 rounded-3xl">
              <h3 className="text-lg font-bold mb-6">Weekly Signups</h3>
              <div id="chart-grid" className="h-48 flex items-end gap-2"></div>
              <div id="chart-labels" className="flex justify-between text-[10px] font-bold text-slate-400 mt-4"></div>
            </div>
          </div>

          {/* USERS VIEW */}
          <div id="users-view" className="hidden p-4 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h1 className="text-2xl md:text-3xl font-black">User Management</h1>
              <input 
                type="text" 
                id="search-users" 
                placeholder="Search users..." 
                className="px-4 py-3 bg-white border border-slate-200 rounded-xl w-full md:w-64"
              />
            </div>

            <div className="bg-white rounded-3xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">User</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Joined</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody id="users-table-body"></tbody>
              </table>
            </div>
          </div>

          {/* SKILLS VIEW */}
          <div id="skills-view" className="hidden p-4 md:p-8 space-y-8">
            <h1 className="text-2xl md:text-3xl font-black">Skills Library</h1>

            <form id="add-skill-form" className="bg-white p-6 rounded-3xl flex gap-3">
              <input 
                type="text" 
                id="new-skill-input" 
                placeholder="Add new skill..." 
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                required
              />
              <button type="submit" className="px-6 py-3 bg-primary text-white rounded-xl font-bold">
                Add Skill
              </button>
            </form>

            <div id="skills-list" className="flex flex-wrap gap-3"></div>
          </div>

          {/* EVENTS VIEW */}
          <div id="events-view" className="hidden p-4 md:p-8 space-y-8">
            <h1 className="text-2xl md:text-3xl font-black">Event Management</h1>

            <div className="bg-white p-6 md:p-8 rounded-3xl">
              <h3 id="event-form-title" className="text-xl font-bold mb-6">Create New Event</h3>
              <form id="event-form" className="space-y-4">
                <input type="hidden" id="event-id" />
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Event Title</label>
                    <input type="text" id="event-title" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Date & Time</label>
                    <input type="datetime-local" id="event-date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" required />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
                  <textarea id="event-description" rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" required></textarea>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Location</label>
                    <input type="text" id="event-location" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Join Link</label>
                    <input type="url" id="event-join-link" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Video URL</label>
                  <input type="url" id="event-video-url" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Key Highlights (one per line)</label>
                  <textarea id="event-highlights" rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Who Should Attend (one per line)</label>
                  <textarea id="event-who-attend" rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">What You Will Gain (one per line)</label>
                  <textarea id="event-gain" rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Gallery URLs (one per line)</label>
                  <textarea id="event-gallery-urls" rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Main Media URL</label>
                  <input type="url" id="event-main-media-url" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Or Upload Image</label>
                  <input type="file" id="event-image-upload" accept="image/*" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>

                <div className="flex gap-3">
                  <button type="submit" id="event-submit-btn" className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2">
                    <i data-lucide="save" className="w-4 h-4"></i> Publish Event
                  </button>
                  <button type="button" id="event-cancel-btn" onClick={() => resetEventForm()} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold" style={{display: 'none'}}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Image</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Title</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Location</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody id="events-table-body"></tbody>
              </table>
            </div>
          </div>

          {/* COURSES VIEW */}
          <div id="courses-view" className="hidden p-4 md:p-8 space-y-8">
            <h1 className="text-2xl md:text-3xl font-black">Course Management</h1>

            <div className="bg-white p-6 md:p-8 rounded-3xl">
              <h3 id="course-form-title" className="text-xl font-bold mb-6">Configure New Course</h3>
              <form id="course-form" className="space-y-5">
                <input type="hidden" id="course-id" />

                {/* Row 1 */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Course Title *</label>
                    <input type="text" id="course-title" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tagline</label>
                    <input type="text" id="course-tagline" placeholder="Short one-liner for hero" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Short Description *</label>
                  <textarea id="course-desc" rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" required></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Long Description</label>
                  <textarea id="course-long-desc" rows={4} placeholder="Detailed course info shown on detail page..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"></textarea>
                </div>

                {/* Row 2 */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Category</label>
                    <input type="text" id="course-category" placeholder="e.g. AI & Machine Learning" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Language</label>
                    <input type="text" id="course-language" placeholder="e.g. Tamil, English & Hindi" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Status</label>
                    <select id="course-is-live" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <option value="true">Live</option>
                      <option value="false">Draft</option>
                    </select>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Level</label>
                    <select id="course-level" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <option value="">Select Level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="All Levels">All Levels</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Duration</label>
                    <input type="text" id="course-duration" placeholder="e.g. 12 Weeks" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Instructor</label>
                    <input type="text" id="course-instructor" placeholder="Instructor name" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                </div>

                {/* Media */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cover Image URL</label>
                    <input type="url" id="course-image-url" placeholder="https://..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Or Upload Cover Image</label>
                    <input type="file" id="course-image" accept="image/*" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Preview Video URL (YouTube / Vimeo)</label>
                  <input type="url" id="course-video-url" placeholder="https://youtu.be/..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>

                {/* Content fields */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Key Highlights (one per line)</label>
                  <textarea id="course-highlights" rows={4} placeholder="Learn real-world AI skills&#10;Placement guidance included&#10;Live + recorded sessions" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">What You Will Learn (one per line)</label>
                  <textarea id="course-what-learn" rows={4} placeholder="Build ML models from scratch&#10;Deploy AI apps to production" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Syllabus / Curriculum (one topic per line)</label>
                  <textarea id="course-syllabus" rows={6} placeholder="Introduction to Python & Data Science&#10;Data Visualization with Matplotlib&#10;Supervised Learning Models&#10;..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Who Should Join (one per line)</label>
                  <textarea id="course-who-join" rows={3} placeholder="Working professionals&#10;College students&#10;Career switchers" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Gallery Image URLs (one per line)</label>
                  <textarea id="course-gallery-urls" rows={3} placeholder="https://img1.jpg&#10;https://img2.jpg" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"></textarea>
                </div>

                {/* Price, Live Class & Trainer */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Price (INR)</label>
                    <input type="number" id="course-price" min="0" step="1" placeholder="0 = free" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Live Class</label>
                    <select id="course-has-live-class" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <option value="false">Disabled</option>
                      <option value="true">Enabled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Assigned Trainer</label>
                    <select id="course-trainer-id" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <option value="">None</option>
                    </select>
                  </div>
                </div>

                {/* Links */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Enroll Link</label>
                    <input type="url" id="course-enroll-link" placeholder="https://..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Syllabus PDF URL</label>
                    <input type="url" id="course-syllabus-pdf" placeholder="https://..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" id="course-save-btn" className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2">
                    <i data-lucide="save" className="w-4 h-4"></i> Publish Course
                  </button>
                  <button type="button" onClick={() => resetCourseForm()} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">
                    Reset
                  </button>
                </div>
              </form>
            </div>

            <div id="courses-grid-display" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
          </div>


          {/* FAME WALL VIEW */}
          <div id="fame-view" className="hidden p-4 md:p-8 space-y-8">
            <h1 className="text-2xl md:text-3xl font-black">Hall of Fame</h1>

            <div className="bg-white p-6 md:p-8 rounded-3xl">
              <h3 className="text-xl font-bold mb-6">Add Student Achievement</h3>
              <form id="fame-form" className="space-y-4">
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Student Name</label>
                    <input type="text" id="fame-name" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Role/Track</label>
                    <input type="text" id="fame-role" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" required />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Project Description</label>
                  <textarea id="fame-project-desc" rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" required></textarea>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Project Link</label>
                    <input type="url" id="fame-project-link" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">LinkedIn URL</label>
                    <input type="url" id="fame-linkedin" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Image URL</label>
                  <input type="url" id="fame-image-url" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Or Upload Image</label>
                  <input type="file" id="fame-image-upload" accept="image/*" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>

                <button type="submit" id="fame-save-btn" className="px-6 py-3 bg-primary text-white rounded-xl font-bold">
                  Add to Fame Wall
                </button>
              </form>
            </div>

            <div id="fame-grid" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
          </div>

          {/* JOB POSTINGS VIEW */}
          {/* <div id="Job-Postings-view" className="hidden p-4 md:p-8 space-y-8">
            <h1 className="text-2xl md:text-3xl font-black">Job Postings</h1>

            <div className="bg-white p-6 md:p-8 rounded-3xl">
              <h3 id="job-form-title" className="text-xl font-bold mb-6">Create New Job Posting</h3>
              <form id="job-posting-form" className="space-y-4">
                <input type="hidden" id="job-id" />
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Job Title</label>
                    <input type="text" id="job-title" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Role</label>
                    <input type="text" id="job-role" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" required />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Job Description</label>
                  <textarea id="job-description" rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" required></textarea>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Job Type</label>
                    <select id="job-type" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" required>
                      <option value="Full Time">Full Time</option>
                      <option value="Part Time">Part Time</option>
                      <option value="Internship">Internship</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Location</label>
                    <input type="text" id="job-location" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Stipend/Salary</label>
                    <input type="text" id="job-stipend-salary" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="submit" id="job-save-btn" className="px-6 py-3 bg-primary text-white rounded-xl font-bold">
                    Publish Job
                  </button>
                  <button type="button" onClick={() => resetJobPostingForm()} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">
                    Reset
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Title</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Salary</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody id="job-postings-table-body"></tbody>
              </table>
            </div>
          </div> */}
        
        {/* JOB POSTINGS VIEW */}
<div id="Job-Postings-view" className="hidden p-4 md:p-8 space-y-8">
  <h1 className="text-2xl md:text-3xl font-black">Job Postings</h1>

  <div className="bg-white p-6 md:p-8 rounded-3xl">
    <h3 id="job-form-title" className="text-xl font-bold mb-6">Create New Job Posting</h3>
    <form id="job-posting-form" className="space-y-4">
      <input type="hidden" id="job-id" />
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Job Title *</label>
          <input type="text" id="job-title" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" required />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Department *</label>
          <input type="text" id="job-department" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" required />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Job Type *</label>
          <select id="job-type" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" required>
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
            <option value="Internship">Internship</option>
            <option value="Contract">Contract</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Location *</label>
          <input type="text" id="job-location" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="e.g., Remote, Bangalore" required />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Salary</label>
          <input type="text" id="job-salary" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="e.g., ₹5-8 LPA" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Eligibility</label>
        <textarea id="job-eligibility" rows={2} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="e.g., Bachelor's in Computer Science, 2+ years experience"></textarea>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Responsibilities</label>
        <textarea id="job-responsibility" rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Describe key responsibilities..."></textarea>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Required Skills</label>
        <textarea id="job-required-skills" rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="e.g., React, Node.js, MongoDB"></textarea>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Status</label>
        <select id="job-status" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="flex gap-3">
        <button type="submit" id="job-save-btn" className="px-6 py-3 bg-primary text-white rounded-xl font-bold">
          Publish Job
        </button>
        <button type="button" onClick={() => resetJobPostingForm()} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">
          Reset
        </button>
      </div>
    </form>
  </div>

  <div className="bg-white rounded-3xl overflow-hidden">
    <table className="w-full">
      <thead className="bg-slate-50">
        <tr>
          <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Title</th>
          <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Department</th>
          <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Type</th>
          <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Location</th>
          <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Salary</th>
          <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Status</th>
          <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody id="job-postings-table-body"></tbody>
    </table>
  </div>
</div>

          {/* ANNOUNCEMENTS VIEW */}
          <div id="announcements-view" className="hidden p-4 md:p-8 space-y-8">
            <h1 className="text-2xl md:text-3xl font-black">Announcement Bar Manager</h1>
            <p className="text-sm text-slate-500 -mt-4">These appear as the top notification banner on the homepage. The highest-priority active announcement is shown.</p>

            {/* Form */}
            <div className="bg-white p-6 md:p-8 rounded-3xl">
              <h3 id="ann-form-title" className="text-xl font-bold mb-6">Create New Announcement</h3>
              <form id="ann-form" className="space-y-4">
                <input type="hidden" id="ann-id" />

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Emoji / Icon</label>
                    <input type="text" id="ann-emoji" defaultValue="🚀" placeholder="🚀" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" maxLength={4} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Background Color</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" id="ann-bg-color" defaultValue="#1a3d2b" className="h-11 w-14 rounded-lg border border-slate-200 cursor-pointer" />
                      <span className="text-xs text-slate-400">Bar background color</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Message Text *</label>
                  <textarea id="ann-message" rows={2} required placeholder="New Batch Starting May 2025! Hybrid Hustle Program — Limited seats available." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"></textarea>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Button Text</label>
                    <input type="text" id="ann-link-text" placeholder="Enroll Now" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Button Link (URL or anchor like #hybrid-hustle)</label>
                    <input type="text" id="ann-link-url" placeholder="/events or #hybrid-hustle or https://..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Link Type</label>
                    <select id="ann-link-type" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <option value="general">General</option>
                      <option value="event">Event</option>
                      <option value="course">Course</option>
                      <option value="project">Project</option>
                      <option value="external">External</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Status</label>
                    <select id="ann-is-active" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <option value="true">Active (Visible)</option>
                      <option value="false">Hidden</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Priority (higher = shown first)</label>
                    <input type="number" id="ann-priority" defaultValue={0} min={0} max={100} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" id="ann-save-btn" className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2">
                    <i data-lucide="megaphone" className="w-4 h-4"></i> Publish Announcement
                  </button>
                  <button type="button" onClick={() => resetAnnouncementForm()} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">
                    Reset
                  </button>
                </div>
              </form>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-black text-slate-500 uppercase">Icon</th>
                    <th className="px-4 py-4 text-left text-xs font-black text-slate-500 uppercase">Message &amp; Link</th>
                    <th className="px-4 py-4 text-left text-xs font-black text-slate-500 uppercase">Type</th>
                    <th className="px-4 py-4 text-center text-xs font-black text-slate-500 uppercase">Status</th>
                    <th className="px-4 py-4 text-center text-xs font-black text-slate-500 uppercase">Priority</th>
                    <th className="px-4 py-4 text-right text-xs font-black text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody id="announcements-table-body"></tbody>
              </table>
            </div>
          </div>

          {/* COUPONS VIEW */}
          <div id="coupons-view" className="hidden p-4 md:p-8 space-y-8">
            <h1 className="text-2xl md:text-3xl font-black">Coupon Management</h1>

            <div className="bg-white p-6 md:p-8 rounded-3xl">
              <h3 id="coupon-form-title" className="text-xl font-bold mb-6">Create New Coupon</h3>
              <form id="coupon-form" className="space-y-4">
                <input type="hidden" id="coupon-id" />

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Coupon Code *</label>
                    <input type="text" id="coupon-code" placeholder="e.g. SAVE20" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl uppercase" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Discount % *</label>
                    <input type="number" id="coupon-discount" min="1" max="100" placeholder="e.g. 20" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">For Course</label>
                    <select id="coupon-course-id" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <option value="">All Courses (Global)</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Valid From</label>
                    <input type="datetime-local" id="coupon-valid-from" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Valid Until</label>
                    <input type="datetime-local" id="coupon-valid-until" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Max Uses</label>
                    <input type="number" id="coupon-max-uses" min="1" placeholder="Unlimited" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Status</label>
                  <select id="coupon-is-active" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button type="submit" id="coupon-save-btn" className="px-6 py-3 bg-primary text-white rounded-xl font-bold">
                    Save Coupon
                  </button>
                  <button type="button" onClick={() => resetCouponForm()} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">
                    Reset
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Code</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Discount</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Course</th>
                    <th className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase">Uses</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody id="coupons-table-body"></tbody>
              </table>
            </div>
          </div>

          {/* TRAINERS VIEW */}
          <div id="trainers-view" className="hidden p-4 md:p-8 space-y-8">
            <h1 className="text-2xl md:text-3xl font-black">Trainer Management</h1>

            <div className="bg-white p-6 md:p-8 rounded-3xl">
              <h3 id="trainer-form-title" className="text-xl font-bold mb-6">Add New Trainer</h3>
              <form id="trainer-form" className="space-y-4">
                <input type="hidden" id="trainer-db-id" />

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Trainer ID *</label>
                    <input type="text" id="trainer-form-id" placeholder="e.g. TR001" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl uppercase" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name *</label>
                    <input type="text" id="trainer-name" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" required />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email *</label>
                    <input type="email" id="trainer-email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phone</label>
                    <input type="text" id="trainer-phone" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Specialization</label>
                    <input type="text" id="trainer-specialization" placeholder="e.g. AI & ML, Web Dev" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Password (for login)</label>
                    <input type="password" id="trainer-password" placeholder="Set login password" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="submit" id="trainer-save-btn" className="px-6 py-3 bg-primary text-white rounded-xl font-bold">
                    Save Trainer
                  </button>
                  <button type="button" onClick={() => resetTrainerForm()} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">
                    Reset
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Specialization</th>
                    <th className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody id="trainers-table-body"></tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </>
  );
}