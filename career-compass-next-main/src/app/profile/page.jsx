"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import "./profile.css";
import { initDashboard, loadCareerAnalysis, loadPathAnalysis } from "@/lib/pages/profile";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [showAnalysisPicker, setShowAnalysisPicker] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMyCourses, setShowMyCourses] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  useEffect(() => {
    // Initial theme check
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    initDashboard();
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    // Refresh lucide icons if window exists
    if (typeof window !== 'undefined' && window.lucide) {
      setTimeout(() => window.lucide.createIcons(), 10);
    }
  };

  const handleAnalysisChoice = async (type) => {
    setActiveAnalysis(type);
    setShowAnalysisPicker(false);
    
    if (type === 'path') {
      await loadPathAnalysis();
    } else if (type === 'career') {
      await loadCareerAnalysis();
    }

    // Scroll to roadmap
    setTimeout(() => {
      const section = document.getElementById('roadmap-section');
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleShowMyCourses = async () => {
    setShowMyCourses(true);
    setCoursesLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('*, courses:course_id(*)')
        .eq('user_id', session.user.id)
        .eq('payment_status', 'paid');

      const coursesWithData = (enrollments || []).map(e => ({
        ...e.courses,
        enrollment_id: e.id,
        enrolled_at: e.created_at,
      })).filter(c => c && c.id);

      setEnrolledCourses(coursesWithData);
    } catch (err) {
      console.error('Failed to load enrolled courses:', err);
    }
    setCoursesLoading(false);
  };

  return (
    <>
      {/* Scripts */}
     
      <Script src="https://unpkg.com/lucide@latest" strategy="afterInteractive" />

      

      <div className="h-screen flex overflow-hidden" suppressHydrationWarning>
        {/* Mobile Sidebar Overlay */}
        <div id="sidebar-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] hidden"></div>

        {/* Analysis Picker Modal */}
        {showAnalysisPicker && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAnalysisPicker(false)}>
            <div className="glass-card w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-heading">Choose Analysis Type</h2>
                  <button onClick={() => setShowAnalysisPicker(false)} className="p-2 text-muted hover:text-heading transition">
                    <i data-lucide="x" className="w-5 h-5"></i>
                  </button>
                </div>
                <p className="text-sm text-body mb-8">Select which analysis roadmap you want to view.</p>
                <div className="space-y-4">
                  <button
                    onClick={() => handleAnalysisChoice('path')}
                    className={`w-full p-5 rounded-2xl border-2 text-left transition group hover:border-primary hover:shadow-lg ${activeAnalysis === 'path' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-white/10'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                        <i data-lucide="route" className="w-6 h-6"></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-heading">Path Analysis</h3>
                        <p className="text-xs text-body font-medium leading-relaxed">Based on your shared academic background.</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleAnalysisChoice('career')}
                    className={`w-full p-5 rounded-2xl border-2 text-left transition group hover:border-secondary hover:shadow-lg ${activeAnalysis === 'career' ? 'border-secondary bg-secondary/5' : 'border-slate-200 dark:border-white/10'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-pink-50 dark:bg-pink-500/10 text-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                        <i data-lucide="compass" className="w-6 h-6"></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-heading">Career Analysis</h3>
                        <p className="text-xs text-body font-medium leading-relaxed">Your calculated match for this specific path.</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hustler ID Application Modal */}
        <div
          id="hustler-modal-overlay"
          className="fixed inset-0 z-[100] blur-backdrop flex items-center justify-center p-4"
        >
          <div className="glass-card w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden transform transition-all duration-300">
            <div className="p-8 md:p-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-heading italic">Hybrid Hustler ID</h2>
                <button
                  onClick={() => window.toggleHustlerModal && window.toggleHustlerModal(false)}
                  className="p-2 text-slate-400 hover:text-heading transition"
                >
                  <i data-lucide="x"></i>
                </button>
              </div>
              <p className="text-sm text-body mb-8">
                Apply for your official ID to unlock exclusive project access and payment gateways.
              </p>

              <form id="hustler-id-form" className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    id="hustler-name"
                    required
                    className="w-full px-4 py-3 glass-card border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted">
                    Course Registration ID
                  </label>
                  <input
                    type="text"
                    id="hustler-reg-id"
                    required
                    placeholder="ID from your welcome mail"
                    className="w-full px-4 py-3 glass-card border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted">
                    Enrolled Course
                  </label>
                  <input
                    type="text"
                    id="hustler-course"
                    required
                    className="w-full px-4 py-3 glass-card border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="hustler-email"
                    required
                    className="w-full px-4 py-3 glass-card border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  id="hustler-submit-btn"
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-blue-700 transition shadow-xl shadow-blue-100 flex items-center justify-center gap-2 mt-4"
                >
                  Submit Application <i data-lucide="send" className="w-4 h-4"></i>
                </button>
                <p id="hustler-form-status" className="text-center text-xs font-bold mt-4 hidden"></p>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside id="sidebar" className={`${sidebarCollapsed ? 'w-20' : 'w-72'} sidebar-bg border-r flex flex-col fixed lg:static inset-y-0 left-0 z-[70] transition-all duration-300`}>
          <div className={`${sidebarCollapsed ? 'p-4 justify-center' : 'p-8 justify-between'} flex items-center`}>
            {!sidebarCollapsed && (
              <a href="/" className="flex items-center gap-4">
                <img src="/Diverse Loopers Black BG (2).png" alt="Logo" className="h-12 w-auto rounded-lg logo-toggle" />
              </a>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="text-muted hover:text-indigo-600 dark:hover:text-white glass-card rounded-xl transition p-2"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <i data-lucide={sidebarCollapsed ? 'panel-left-open' : 'panel-left-close'} className="w-5 h-5"></i>
              </button>
              <button id="close-sidebar" className="lg:hidden text-slate-400 hover:text-heading p-2">
                <i data-lucide="x"></i>
              </button>
            </div>
          </div>

          <nav className={`flex-1 ${sidebarCollapsed ? 'px-3' : 'px-5'} space-y-2 mt-4 overflow-y-auto custom-scrollbar`}>
            {/* Nav Links */}
            {[
              { href: '/', icon: 'home', label: 'Home' },
              { href: '#', icon: 'layout-dashboard', label: 'Dashboard', active: true },
              { onClick: () => setShowAnalysisPicker(true), icon: 'milestone', label: 'My Analysis' },
              { href: '/career-analyzer', icon: 'search', label: 'Explore Careers' },
              { href: '/courses', icon: 'book-open', label: 'Courses' },
              { href: '/my-courses', icon: 'graduation-cap', label: 'My Courses' },
              { href: '/settings', icon: 'settings', label: 'Settings' }
            ].map((link, i) => {
              const Tag = link.onClick ? 'button' : 'a';
              return (
                <Tag
                  key={i}
                  href={link.href}
                  onClick={link.onClick}
                  className={`sidebar-link ${link.active ? 'active' : ''} w-full flex items-center gap-4 ${sidebarCollapsed ? 'px-0 justify-center' : 'px-4'} py-3.5 rounded-2xl text-body font-bold hover:bg-slate-500/5 hover:text-indigo-600 dark:hover:text-white transition text-left group`}
                  title={link.label}
                >
                  <i data-lucide={link.icon} className={`w-5 h-5 flex-shrink-0 ${link.active ? 'text-white' : 'text-muted group-hover:text-indigo-500 dark:group-hover:text-white transition-colors'}`}></i> 
                  {!sidebarCollapsed && link.label}
                </Tag>
              )
            })}
          </nav>

          <div className={`${sidebarCollapsed ? 'p-3' : 'p-6'} border-t border-slate-200 dark:border-white/5 space-y-4 bg-slate-500/5`}>
            {!sidebarCollapsed && (
              <button
                id="theme-toggle"
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-4 py-3 glass-card text-heading rounded-xl font-bold hover:bg-slate-500/10 transition"
              >
                <div className="flex items-center gap-3">
                  <i data-lucide={isDarkMode ? "sun" : "moon"} id="theme-icon" className="w-4 h-4 text-indigo-500 dark:text-indigo-400"></i>
                  <span id="theme-text" className="text-heading">{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
                </div>
                <div className="w-10 h-5 bg-slate-500/20 rounded-full relative p-1 transition-colors">
                  <div id="theme-toggle-dot" className={`w-3 h-3 bg-white rounded-full transition-all duration-300 transform shadow-sm ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
              </button>
            )}
            {sidebarCollapsed && (
              <button
                id="theme-toggle"
                onClick={toggleTheme}
                className="w-full flex items-center justify-center py-3 glass-card text-heading rounded-xl hover:bg-slate-500/10 transition"
                title="Toggle Theme"
              >
                <i data-lucide={isDarkMode ? "sun" : "moon"} id="theme-icon" className="w-5 h-5 text-indigo-500 dark:text-indigo-400"></i>
              </button>
            )}
            <button
              id="logout-button"
              className={`w-full flex items-center justify-center gap-3 ${sidebarCollapsed ? '' : 'px-4'} py-3.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-500/20 transition`}
              title="Logout"
            >
              <i data-lucide="log-out" className="w-4 h-4"></i> {!sidebarCollapsed && 'Logout'}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main id="main-scroll-area" className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar scroll-smooth">
          <header className="lg:hidden sidebar-bg border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50 transition-colors duration-300">
            <div className="flex items-center gap-4">
              <a href="/" className="flex items-center">
                <img src="/Diverse Loopers Black BG (2).png" alt="Logo" className="h-8 w-auto logo-toggle" />
              </a>
              <span className="font-black text-heading italic tracking-tight">DL Dashboard</span>
            </div>
            <button id="open-sidebar" className="p-2.5 glass-card rounded-xl text-body hover:bg-slate-500/10 transition">
              <i data-lucide="menu" className="w-5 h-5"></i>
            </button>
          </header>

          <div className="p-6 md:p-10 space-y-8 max-w-[1400px] mx-auto w-full pb-24">
            {/* Header Area (Bento TopRow) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-6">
                {/* Desktop Glowing Avatar */}
                <div className="relative group hidden md:block">
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl group-hover:bg-primary/50 transition-all duration-500 scale-110"></div>
                  <a href="/settings" id="desktop-profile-avatar" className="relative w-20 h-20 rounded-full border-[3px] border-white dark:border-slate-800 shadow-xl overflow-hidden cursor-pointer block glass-card z-10">
                    <img id="desktop-avatar-img" alt="Profile" className="profile-avatar rounded-full w-full h-full object-cover hidden" />
                  </a>
                </div>
                
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-primary rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><i className="fa-solid fa-crown w-3 h-3"></i> Explorer</span>
                    <span id="current-date" className="text-xs font-bold text-muted"></span>
                  </div>
                  <h1 id="welcome-message" className="text-3xl md:text-5xl font-black tracking-tight text-heading">
                    Welcome back!
                  </h1>
                  <p className="text-body font-medium md:text-lg mt-1">
                    Your launchpad for the tech industry. Action awaits.
                  </p>
                </div>
              </div>
            </div>

            {/* Bento Grid Start */}
            <div className="bento-grid">
              {/* Primary CTA (Span 2) */}
              <div className="bento-span-2 glass-card p-8 md:p-12 bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 text-white relative group overflow-hidden shadow-2xl shadow-indigo-500/20" style={{ borderRadius: '2.5rem' }}>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/20 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition duration-700 ease-out"></div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight tracking-tighter">Map your future.<br/>Step-by-step.</h2>
                    <p className="text-white/90 max-w-lg mb-10 leading-relaxed font-bold text-lg md:text-xl italic">Use our AI engine to identify skill gaps and generate a custom roadmap to your dream tech role.</p>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-auto">
                    <button onClick={() => setShowAnalysisPicker(true)} className="px-8 py-4 bg-white text-indigo-700 rounded-2xl font-black hover:bg-slate-100 hover:shadow-2xl hover:scale-105 transition active:scale-95 text-base md:text-lg flex items-center gap-2 shadow-xl">
                      <i data-lucide="play" className="w-6 h-6 fill-current"></i> Start Analysis
                    </button>
                    <button onClick={() => window.toggleHustlerModal && window.toggleHustlerModal(true)} className="px-8 py-4 bg-white/10 backdrop-blur-xl text-white border-2 border-white/30 rounded-2xl font-black hover:bg-white/20 transition active:scale-95 text-base md:text-lg flex items-center gap-2">
                      Apply for Hustler ID <i data-lucide="id-card" className="w-5 h-5"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Core Progress Bento Cards */}
              
              {/* Match Confidence (Span 1) */}
              <div className="glass-card p-6 md:p-8 flex flex-col items-center justify-center text-center group cursor-default hover:border-green-500/30 transition-colors">
                <h3 className="font-bold text-sm text-body mb-6 w-full text-left uppercase tracking-widest">Match Score</h3>
                <div className="relative w-32 h-32 md:w-36 md:h-36 group-hover:scale-105 transition-transform duration-500">
                  <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl scale-75 group-hover:scale-100 transition-all duration-700"></div>
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90 relative z-10 drop-shadow-lg">
                    <path className="stroke-slate-100 dark:stroke-white/5 fill-none" strokeWidth="2.5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                    <path id="analysis-circle-fg" className="stroke-green-500 fill-none transition-all duration-1500 ease-out drop-shadow-lg" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="0, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                  </svg>
                  <div id="analysis-match-text" className="absolute inset-0 flex items-center justify-center text-3xl md:text-4xl font-black text-heading z-10">--%</div>
                </div>
              </div>

              {/* Target Role (Span 1) */}
              <div className="glass-card p-6 md:p-8 flex flex-col group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-pink-500/20 transition duration-500"></div>
                <div className="flex items-center gap-3 mb-auto relative z-10">
                  <div className="w-10 h-10 bg-pink-500/10 text-pink-500 rounded-xl flex items-center justify-center shadow-inner">
                    <i data-lucide="target" className="w-5 h-5"></i>
                  </div>
                  <h3 className="font-bold text-sm text-body uppercase tracking-widest">Target Role</h3>
                </div>
                <div className="mt-8 relative z-10">
                  <div id="target-role-name" className="text-xl md:text-2xl font-black text-heading mb-2 leading-tight">---</div>
                  <p id="target-role-desc" className="text-sm text-body line-clamp-2 leading-relaxed">Defining destination...</p>
                </div>
                <a href="/settings" className="mt-6 text-xs font-bold text-pink-500 flex items-center gap-1.5 hover:text-pink-600 transition w-fit relative z-10 group/link">
                  Update Goal <i data-lucide="arrow-right" className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform"></i>
                </a>
              </div>

              {/* Skills (Span 1 or 2 depending on screen) */}
              <div className="glass-card p-6 md:p-8 flex flex-col group relative overflow-hidden md:col-span-2 lg:col-span-1">
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-indigo-500/5 to-transparent z-0"></div>
                <div className="flex justify-between items-center mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center shadow-inner">
                      <i data-lucide="zap" className="w-5 h-5"></i>
                    </div>
                    <h3 className="font-bold text-sm text-body uppercase tracking-widest">My Stack</h3>
                  </div>
                  <a href="/settings" className="w-8 h-8 rounded-full bg-slate-500/10 hover:bg-slate-500/20 flex items-center justify-center text-slate-400 hover:text-indigo-500 transition shadow-sm">
                    <i data-lucide="edit-2" className="w-3.5 h-3.5"></i>
                  </a>
                </div>
                <div id="skills-container" className="flex flex-wrap gap-2.5 relative z-10 items-start align-top">
                  <div className="skeleton w-20 h-7 rounded-lg"></div>
                  <div className="skeleton w-24 h-7 rounded-lg"></div>
                </div>
              </div>

              {/* Career Summary Small Card (Top Fit) */}
              <div className="glass-card p-6 md:p-8 flex flex-col group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/20 transition duration-500"></div>
                <div className="flex items-center gap-3 mb-auto relative z-10">
                  <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center shadow-inner">
                    <i data-lucide="award" className="w-5 h-5"></i>
                  </div>
                  <h3 className="font-bold text-sm text-body uppercase tracking-widest">Top Fit</h3>
                </div>
                <div className="mt-8 relative z-10" id="top-fit-content">
                  <div className="text-xl md:text-2xl font-black text-heading mb-2 leading-tight">Not Analyzed</div>
                  <p className="text-sm text-body line-clamp-2 leading-relaxed">Take the AI analyzer.</p>
                </div>
                <a href="/career-analyzer" className="mt-6 text-xs font-bold text-amber-500 flex items-center gap-1.5 hover:text-amber-600 transition w-fit relative z-10 group/link">
                  View Quiz <i data-lucide="arrow-right" className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform"></i>
                </a>
              </div>

              {/* Career Analysis Result Card (Span 3 on Desktop) */}
              <div id="career-analysis-card" className="hidden bento-span-3 glass-card flex flex-col group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition duration-500"></div>
                
                {/* Top summary row */}
                <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10 border-b border-slate-100 dark:border-white/5">
                  <div className="w-16 h-16 flex-shrink-0 rounded-[1.25rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 group-hover:rotate-3 transition-transform">
                    <i data-lucide="compass" className="w-8 h-8 text-white"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-sm">Career Fit Result</span>
                      <span id="career-analysis-score" className="px-2.5 py-0.5 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-full text-[10px] font-black shadow-sm">—</span>
                    </div>
                    <h3 id="career-analysis-title" className="text-2xl md:text-3xl font-black text-heading truncate">—</h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs font-semibold text-muted">
                      <span id="career-analysis-date" className="flex items-center gap-1"><i data-lucide="calendar" className="w-3.5 h-3.5"></i> —</span>
                      <span className="flex items-center gap-1"><i data-lucide="graduation-cap" className="w-3.5 h-3.5"></i> Branch: <strong id="career-analysis-branch" className="text-body">—</strong></span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 mt-4 md:mt-0">
                    <button onClick={() => setShowAnalysisPicker(true)} className="px-6 py-3 bg-indigo-50 dark:bg-white/5 text-indigo-600 dark:text-white text-xs font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-white/10 transition flex items-center justify-center gap-2 shadow-sm">
                      <i data-lucide="map" className="w-4 h-4"></i> View Roadmap
                    </button>
                    <a href="/career-analyzer" className="px-6 py-3 bg-secondary text-white text-xs font-bold rounded-xl hover:shadow-md transition flex items-center justify-center gap-2">
                      <i data-lucide="refresh-cw" className="w-4 h-4"></i> Retake
                    </a>
                  </div>
                </div>

                {/* Dense Score bars grid */}
                <div className="p-6 md:p-8 grid grid-cols-2 md:grid-cols-5 gap-6 relative z-10 bg-slate-50/50 dark:bg-white/[0.02]">
                  {[
                    { key: 'fullstack',     label: 'Full Stack', color: 'bg-indigo-500' },
                    { key: 'backend',       label: 'Backend',    color: 'bg-blue-500' },
                    { key: 'data',          label: 'Data',       color: 'bg-purple-500' },
                    { key: 'cybersecurity', label: 'Security',   color: 'bg-rose-500' },
                    { key: 'qa',            label: 'QA Auto',    color: 'bg-amber-500' },
                  ].map(({ key, label, color }) => (
                    <div key={key} className="space-y-2 group/bar">
                      <div className="flex justify-between items-end text-xs font-bold text-body">
                        <span className="group-hover/bar:text-heading transition-colors">{label}</span>
                        <span id={`career-score-${key}`} className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 group-hover/bar:bg-slate-200 dark:group-hover/bar:bg-white/20 transition-colors">—</span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden shadow-inner flex">
                        <div id={`career-bar-fill-${key}`} className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: '0%' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div> {/* Close Bento Grid */}

            {/* Academic Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass-card p-6 rounded-[2rem] md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <i data-lucide="book-open" className="w-4 h-4 text-primary"></i> Active Learning
                  </h3>
                  <span id="course-count-badge" className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-lg">
                    0 Courses
                  </span>
                </div>
                <div id="enrolled-courses-list" className="space-y-3">
                  <div className="p-3 glass-card rounded-xl animate-pulse h-12"></div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-[2rem] text-center">
                <h3 className="font-bold text-xs mb-4 uppercase text-slate-400">Attendance</h3>
                <div className="text-3xl font-black text-primary mb-1" id="attendance-value">
                  --%
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                  <div
                    id="attendance-bar"
                    className="h-full bg-primary transition-all duration-1000"
                    style={{ width: "0%" }}
                  ></div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-[2rem] text-center">
                <h3 className="font-bold text-xs mb-4 uppercase text-muted">Performance</h3>
                <div className="text-3xl font-black text-secondary mb-1" id="performance-value">
                  --%
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                  <div
                    id="performance-bar"
                    className="h-full bg-secondary transition-all duration-1000"
                    style={{ width: "0%" }}
                  ></div>
                </div>
              </div>
            </div>

            {/* My Job Applications */}
            <div className="glass-card p-6 md:p-8 rounded-[2rem]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold flex items-center gap-2">
                  <i data-lucide="briefcase" className="w-4 h-4 text-purple-500"></i> My Applications
                </h3>
                <span id="app-count-badge" className="px-2 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] font-bold rounded-lg">0 Applied</span>
              </div>
              <div id="my-applications-list" className="space-y-3">
                <div className="p-4 glass-card rounded-xl text-center text-muted text-sm">Loading applications...</div>
              </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="glass-card p-6 rounded-[2rem]">
                <h3 className="font-bold flex items-center gap-2 mb-4">
                  <i data-lucide="code-2" className="w-4 h-4 text-blue-500"></i> Course Projects
                </h3>
                <div id="projects-list" className="space-y-3 max-h-40 overflow-y-auto no-scrollbar"></div>
              </div>
              <div className="glass-card p-6 rounded-[2rem]">
                <h3 className="font-bold flex items-center gap-2 mb-4">
                  <i data-lucide="briefcase" className="w-4 h-4 text-orange-500"></i> Interviews
                </h3>
                <div id="interviews-list" className="space-y-3 max-h-40 overflow-y-auto no-scrollbar"></div>
              </div>
              <div className="glass-card p-6 rounded-[2rem]">
                <h3 className="font-bold flex items-center gap-2 mb-4">
                  <i data-lucide="graduation-cap" className="w-4 h-4 text-green-500"></i> Exams
                </h3>
                <div id="exams-list" className="space-y-3 max-h-40 overflow-y-auto no-scrollbar"></div>
              </div>
            </div>

            {/* Redesigned Minimalist Roadmap */}
            <div
              id="roadmap-section"
              className="py-12 glass-card rounded-[3rem]"
            >
              <div className="px-8 md:px-12 mb-12 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                  <h2 id="roadmap-title" className="text-2xl md:text-3xl font-black text-heading">
                    Career Milestone Track
                  </h2>
                  <p className="text-body text-sm font-medium mt-1">
                    AI-suggested ascent to industry proficiency.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAnalysisChoice('path')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeAnalysis === 'path' ? 'bg-primary text-white' : 'glass-card text-body hover:bg-slate-500/10'}`}
                  >
                    Path Analysis
                  </button>
                  <button
                    onClick={() => handleAnalysisChoice('career')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeAnalysis === 'career' ? 'bg-secondary text-white' : 'glass-card text-body hover:bg-slate-500/10'}`}
                  >
                    Career Analysis
                  </button>
                </div>
              </div>

              <div className="relative max-w-4xl mx-auto px-6">
                {/* Progress Spine */}
                <div className="absolute left-10 md:left-1/2 top-0 bottom-0 timeline-line -translate-x-1/2 rounded-full opacity-20"></div>

                {/* Milestone Items */}
                <div id="roadmap-items-container" className="relative space-y-10">
                  <div className="text-center py-20 text-muted">Loading your path...</div>
                </div>
              </div>
            </div>

            {/* Footer Resources */}
            {!showMyCourses && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
              <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] relative overflow-hidden group">
                <h4 className="text-lg font-bold mb-1">Hybrid Hustle</h4>
                <p className="text-body font-medium italic">Your personalized career growth command center.</p>
                <a 
                  href="/#hybrid-hustle"
                  className="text-primary font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all"
                >
                  Enroll Now <i data-lucide="arrow-right" className="w-4 h-4"></i>
                </a>
              </div>
              <div className="p-8 glass-card rounded-[2.5rem] border-dashed text-center">
                <h4 className="text-lg font-bold mb-1">AI Suggestions</h4>
                <p id="suggestions-text" className="text-muted text-xs italic leading-relaxed">
                  Analyzing metrics...
                </p>
              </div>
            </div>
            )}

            {/* MY COURSES SECTION */}
            {showMyCourses && (
              <div className="pb-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-heading">My Enrolled Courses</h2>
                    <p className="text-body text-sm font-medium mt-1">{enrolledCourses.length} course(s) enrolled</p>
                  </div>
                  <button onClick={() => setShowMyCourses(false)} className="px-4 py-2 glass-card rounded-xl text-body font-bold text-sm hover:bg-slate-500/10 transition">
                    ← Back to Dashboard
                  </button>
                </div>

                {coursesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1,2,3].map(i => <div key={i} className="glass-card rounded-[2rem] h-60 animate-pulse" />)}
                  </div>
                ) : enrolledCourses.length === 0 ? (
                  <div className="glass-card rounded-[2rem] p-16 text-center">
                    <div style={{fontSize: 16, fontWeight: 800, color: '#94a3b8'}}>No Courses</div>
                    <h3 className="text-lg font-bold text-heading mt-4">No courses enrolled yet</h3>
                    <p className="text-body text-sm mt-2 mb-6">Explore our courses and start your learning journey!</p>
                    <a href="/courses" className="px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-blue-700 transition">Browse Courses</a>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrolledCourses.map(c => (
                      <div key={c.id} className="glass-card rounded-[2rem] overflow-hidden group hover:border-primary/30 transition-all">
                        <div className="h-36 relative overflow-hidden" style={{
                          background: c.image_url ? `url(${c.image_url}) center/cover` : (c.image_visual || 'linear-gradient(135deg, #e8f5e9, #a5d6a7)')
                        }}>
                          {c.has_live_class && (
                            <span className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white rounded-full text-[10px] font-black">LIVE</span>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>
                        <div className="p-5">
                          <h3 className="text-base font-black text-heading mb-1 line-clamp-1">{c.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-muted font-semibold mb-4">
                            {c.instructor && <span>Instructor: {c.instructor}</span>}
                            {c.level && <span>{c.level}</span>}
                          </div>
                          <div className="flex gap-2">
                            <a href={`/courses/${c.id}`} className="flex-1 py-2.5 bg-primary/10 text-primary rounded-xl text-xs font-bold text-center hover:bg-primary hover:text-white transition">
                              View Course
                            </a>
                            {c.has_live_class && c.live_class_active && (
                              <a href={`/courses/${c.id}/live-class`} className="py-2.5 px-4 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold text-center hover:bg-red-500 hover:text-white transition">
                                Live
                              </a>
                            )}
                            {c.has_live_class && !c.live_class_active && (
                              <span className="py-2.5 px-4 bg-slate-500/10 text-slate-400 rounded-xl text-xs font-bold text-center" style={{ cursor: 'default' }}>
                                Offline
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}