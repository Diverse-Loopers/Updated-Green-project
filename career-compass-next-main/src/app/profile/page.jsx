"use client";

import Script from "next/script";
import { useEffect, useState, useCallback } from "react";
import "./profile.css";
import { initDashboard, loadCareerAnalysis, loadPathAnalysis } from "@/lib/pages/profile";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [showAnalysisPicker, setShowAnalysisPicker] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [showMyCourses, setShowMyCourses] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightCourses, setRightCourses] = useState([]);

  // Load enrolled courses for right column
  const loadRightCourses = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('*, courses:course_id(*)')
        .eq('user_id', user.id)
        .eq('payment_status', 'paid');
      const courses = (enrollments || []).map(e => ({
        ...e.courses, enrollment_id: e.id, enrolled_at: e.created_at,
      })).filter(c => c && c.id);
      setRightCourses(courses);
    } catch (err) { console.error('Failed to load courses:', err); }
  }, []);

  useEffect(() => {
    initDashboard();
    loadRightCourses();
  }, [loadRightCourses]);

  const handleAnalysisChoice = async (type) => {
    setActiveAnalysis(type);
    setShowAnalysisPicker(false);
    if (type === 'path') await loadPathAnalysis();
    else if (type === 'career') await loadCareerAnalysis();
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

  const closeSidebar = () => {
    setSidebarOpen(false);
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) { overlay.classList.add('hidden'); overlay.classList.remove('visible'); }
  };
  const openSidebar = () => {
    setSidebarOpen(true);
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) { overlay.classList.remove('hidden'); overlay.classList.add('visible'); }
  };

  const SvgIcon = ({ d, size = 18, color = 'currentColor', strokeWidth = 2 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">{typeof d === 'string' ? <path d={d} /> : d}</svg>
  );

  return (
    <>
      <Script src="https://unpkg.com/lucide@latest" strategy="afterInteractive" />

      {/* Sidebar Overlay */}
      <div id="sidebar-overlay" className="fixed inset-0 bg-black/40 z-[60] hidden" onClick={closeSidebar} />

      {/* Analysis Picker Modal */}
      {showAnalysisPicker && (
        <div className="pf-picker-overlay" onClick={() => setShowAnalysisPicker(false)}>
          <div className="pf-picker-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111' }}>Choose Analysis Type</h2>
              <button onClick={() => setShowAnalysisPicker(false)} className="pf-modal-close">
                <SvgIcon d="M18 6L6 18M6 6l12 12" size={14} />
              </button>
            </div>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>Select which analysis roadmap you want to view.</p>
            <button onClick={() => handleAnalysisChoice('path')} className={`pf-picker-option ${activeAnalysis === 'path' ? 'active' : ''}`}>
              <div className="pf-picker-icon" style={{ background: '#f0fff6' }}>
                <SvgIcon d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" color="#00c851" />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#111', marginBottom: 2 }}>Path Analysis</div>
                <div style={{ fontSize: 12, color: '#888' }}>Based on your academic background.</div>
              </div>
            </button>
            <button onClick={() => handleAnalysisChoice('career')} className={`pf-picker-option ${activeAnalysis === 'career' ? 'active' : ''}`}>
              <div className="pf-picker-icon" style={{ background: '#fff0f6' }}>
                <SvgIcon d={<><circle cx="12" cy="12" r="10"/><path d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49"/></>} color="#e91e63" />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#111', marginBottom: 2 }}>Career Analysis</div>
                <div style={{ fontSize: 12, color: '#888' }}>Your match for specific career paths.</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Hustler ID Modal */}
      <div id="hustler-modal-overlay" className="fixed inset-0 z-[100] blur-backdrop flex items-center justify-center p-4">
        <div className="pf-modal">
          <div className="pf-modal-header">
            <span className="pf-modal-title">Hybrid Hustler ID</span>
            <button onClick={() => window.toggleHustlerModal && window.toggleHustlerModal(false)} className="pf-modal-close">
              <SvgIcon d="M18 6L6 18M6 6l12 12" size={14} />
            </button>
          </div>
          <div className="pf-modal-body">
            <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
              Apply for your official ID to unlock exclusive project access and payment gateways.
            </p>
            <form id="hustler-id-form" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { id: 'hustler-name', label: 'Full Legal Name', type: 'text' },
                { id: 'hustler-reg-id', label: 'Course Registration ID', type: 'text', placeholder: 'ID from your welcome mail' },
                { id: 'hustler-course', label: 'Enrolled Course', type: 'text' },
                { id: 'hustler-email', label: 'Email Address', type: 'email' },
              ].map(f => (
                <div key={f.id}>
                  <label className="pf-input-label">{f.label}</label>
                  <input type={f.type} id={f.id} required placeholder={f.placeholder || ''} className="pf-input" />
                </div>
              ))}
              <button type="submit" id="hustler-submit-btn" className="pf-btn pf-btn-solid" style={{ width: '100%', justifyContent: 'center', marginTop: 6, padding: '12px 20px' }}>
                Submit Application
              </button>
              <p id="hustler-form-status" className="hidden" style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, marginTop: 4 }} />
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <aside id="sidebar" className={`pf-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="pf-sidebar-header">
          <a href="/">
            <img src="/Diverse Loopers Black BG (2).png" alt="Logo" style={{ height: 36, filter: 'invert(1)' }} />
          </a>
          <button id="close-sidebar" onClick={closeSidebar} className="pf-hamburger">
            <SvgIcon d="M18 6L6 18M6 6l12 12" size={18} />
          </button>
        </div>
        <nav className="pf-sidebar-nav">
          {[
            { href: '/', icon: <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>, label: 'Home' },
            { href: '#', icon: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>, label: 'Dashboard', active: true },
            { onClick: () => { setShowAnalysisPicker(true); closeSidebar(); }, icon: <><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></>, label: 'My Analysis' },
            { href: '/career-analyzer', icon: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>, label: 'Explore Careers' },
            { href: '/courses', icon: <><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></>, label: 'Courses' },
            { href: '/settings', icon: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>, label: 'Settings' },
          ].map((link, i) => {
            const Tag = link.onClick ? 'button' : 'a';
            return (
              <Tag key={i} href={link.href} onClick={link.onClick} className={`pf-sidebar-link ${link.active ? 'active' : ''}`}>
                <SvgIcon d={link.icon} size={18} />
                {link.label}
              </Tag>
            );
          })}
        </nav>
        <div className="pf-sidebar-footer">
          <button id="logout-button" className="pf-logout-btn">
            <SvgIcon d={<><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>} size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="pf-mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/"><img src="/Diverse Loopers Black BG (2).png" alt="Logo" style={{ height: 28, filter: 'invert(1)' }} /></a>
          <span style={{ fontWeight: 800, color: '#111', fontSize: 14 }}>My Profile</span>
        </div>
        <button id="open-sidebar" onClick={openSidebar} className="pf-hamburger">
          <SvgIcon d={<><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>} size={18} />
        </button>
      </header>

      {/* Desktop Nav */}
      <nav className="guvi-nav" >
        <div className = "guvi-nav-inner">
        <div className="guvi-nav-left">
          <a href="/" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/Diverse Loopers Black BG (2).png" alt="Logo" style={{ height: 44, filter: 'invert(1)' }} />
          </a>
          <div  className="guvi-nav-links">
            {[
              { href: '/', label: 'Home' },
              { href: '/courses', label: 'Courses' },
              { href: '/career-analyzer', label: 'Career Analyzer' },
              { href: '/career', label: 'Careers' },
            ].map((l, i) => (
              <a key={i} href={l.href} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, color: '#555', textDecoration: 'none', borderRadius: 8, transition: 'all 0.15s' }}
                onMouseEnter={e => { e.target.style.background = '#f0fff6'; e.target.style.color = '#00c851'; }}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#555'; }}>
                {l.label}
              </a>
            ))}
          </div>
        </div>
        <div className="guvi-nav-right">
          <button onClick={() => setShowAnalysisPicker(true)} className="pf-btn pf-btn-solid" style={{ padding: '6px 16px', fontSize: 12 }}>
            <SvgIcon d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" size={14} color="#fff" /> Analysis
          </button>
          <a href="/settings" className="pf-btn pf-btn-outline" style={{ padding: '6px 16px', fontSize: 12 }}>Settings</a>
          <button id="logout-button-desktop" style={{ padding: '6px 16px', fontSize: 12, fontWeight: 700, color: '#ef4444', background: '#fef2f2', border: 'none', borderRadius: 24, cursor: 'pointer' }}>Logout</button>
        </div>
        </div>
      </nav>

      <div className="profile-page">
        <div className="profile-container">
          {/* ========== LEFT COLUMN ========== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24,  minWidth: 0, width: '100%'  }}>
            {/* Profile Banner Card */}
            <div className="pf-card">
              <div className="pf-banner" />
              <div className="pf-banner-content">
                <div className="pf-avatar-wrap">
                  <div className="pf-avatar" id="desktop-profile-avatar">
                    <img id="desktop-avatar-img" alt="Profile" className="profile-avatar hidden" />
                    <svg className="pf-avatar-placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                </div>
                <div className="pf-name-row">
                  <h1 id="welcome-message" className="pf-name">Welcome back!</h1>
                  <a href="/settings" className="pf-edit-btn" title="Edit Profile">
                    <SvgIcon d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" size={14} />
                  </a>
                </div>
                <div id="profile-info-row" className="pf-info-row">
                  <div className="pf-info-item">
                    <span className="pf-info-label">Email <span className="pf-private">(Private)</span></span>
                    <span className="pf-info-value" id="profile-email">Loading...</span>
                  </div>
                </div>
                <div className="pf-actions">
                  <button onClick={() => window.toggleHustlerModal && window.toggleHustlerModal(true)} className="pf-btn pf-btn-outline">
                    Apply Hustler ID
                  </button>
                  <button onClick={() => setShowAnalysisPicker(true)} className="pf-btn pf-btn-solid">
                    Start Analysis
                    <SvgIcon d="M5 12h14M12 5l7 7-7 7" size={14} color="#fff" />
                  </button>
                </div>
              </div>
            </div>

            {/* Skills Stack */}
            <div className="pf-card">
              <div className="pf-card-body">
                <div className="pf-section-header">
                  <h3 className="pf-card-title">
                    <SvgIcon d={<><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>} />
                    My Skills
                  </h3>
                  <a href="/settings" className="pf-section-badge">Edit</a>
                </div>
                <div id="skills-container" className="pf-skills-wrap">
                  <div className="pf-skill-tag" style={{ background: '#f0f0f0', color: '#ccc', width: 60 }}>&nbsp;</div>
                  <div className="pf-skill-tag" style={{ background: '#f0f0f0', color: '#ccc', width: 80 }}>&nbsp;</div>
                </div>
              </div>
            </div>

            {/* Career Analysis Result */}
            <div id="career-analysis-card" className="pf-card hidden">
              <div className="pf-card-body">
                <div className="pf-section-header">
                  <h3 className="pf-card-title">
                    <SvgIcon d={<><circle cx="12" cy="12" r="10"/><path d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49"/></>} />
                    Career Fit Result
                  </h3>
                  <span id="career-analysis-score" className="pf-section-badge">--</span>
                </div>
                <h4 id="career-analysis-title" style={{ fontSize: 22, fontWeight: 800, color: '#111', marginBottom: 8 }}>--</h4>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#888', marginBottom: 20, flexWrap: 'wrap' }}>
                  <span id="career-analysis-date">--</span>
                  <span>Branch: <strong id="career-analysis-branch" style={{ color: '#444' }}>--</strong></span>
                </div>
                <div className="pf-score-bars">
                  {[
                    { key: 'fullstack', label: 'Full Stack', color: '#4f46e5' },
                    { key: 'backend', label: 'Backend', color: '#2563eb' },
                    { key: 'data', label: 'Data', color: '#7c3aed' },
                    { key: 'cybersecurity', label: 'Security', color: '#e11d48' },
                    { key: 'qa', label: 'QA Auto', color: '#d97706' },
                  ].map(({ key, label, color }) => (
                    <div key={key} className="pf-score-row">
                      <span className="pf-score-label">{label}</span>
                      <div className="pf-score-bar">
                        <div id={`career-bar-fill-${key}`} className="pf-score-fill" style={{ width: '0%', background: color }} />
                      </div>
                      <span id={`career-score-${key}`} className="pf-score-pct">--</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
                  <button onClick={() => setShowAnalysisPicker(true)} className="pf-btn pf-btn-outline" style={{ fontSize: 12 }}>View Roadmap</button>
                  <a href="/career-analyzer" className="pf-btn pf-btn-solid" style={{ fontSize: 12, textDecoration: 'none' }}>Retake Analysis</a>
                </div>
              </div>
            </div>

            {/* Top Fit Card */}
            <div className="pf-card">
              <div className="pf-card-body">
                <h3 className="pf-card-title">
                  <SvgIcon d={<><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></>} />
                  Top Career Fit
                </h3>
                <div id="top-fit-content">
                  <p style={{ fontSize: 13, color: '#888' }}>Take the AI analyzer to discover your best career match.</p>
                  <a href="/career-analyzer" className="pf-btn pf-btn-outline" style={{ marginTop: 12, fontSize: 12 }}>Take Career Quiz</a>
                </div>
              </div>
            </div>

            {/* Active Learning */}
            <div className="pf-card">
              <div className="pf-card-body">
                <div className="pf-section-header">
                  <h3 className="pf-card-title">
                    <SvgIcon d={<><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></>} />
                    Active Learning
                  </h3>
                  <span id="course-count-badge" className="pf-section-badge">0 Courses</span>
                </div>
                <div id="enrolled-courses-list">
                  <div className="pf-empty">Loading courses...</div>
                </div>
              </div>
            </div>

            {/* My Applications */}
            <div className="pf-card">
              <div className="pf-card-body">
                <div className="pf-section-header">
                  <h3 className="pf-card-title">
                    <SvgIcon d={<><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></>} />
                    My Applications
                  </h3>
                  <span id="app-count-badge" className="pf-section-badge">0 Applied</span>
                </div>
                <div id="my-applications-list">
                  <div className="pf-empty">Loading applications...</div>
                </div>
              </div>
            </div>

            {/* Secondary: Projects, Interviews, Exams */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div className="pf-card">
                <div className="pf-card-body">
                  <h3 className="pf-card-title" style={{ fontSize: 14 }}>
                    <SvgIcon d={<><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></>} />
                    Projects
                  </h3>
                  <div id="projects-list" style={{ maxHeight: 140, overflowY: 'auto' }} />
                </div>
              </div>
              <div className="pf-card">
                <div className="pf-card-body">
                  <h3 className="pf-card-title" style={{ fontSize: 14 }}>
                    <SvgIcon d={<><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></>} />
                    Interviews
                  </h3>
                  <div id="interviews-list" style={{ maxHeight: 140, overflowY: 'auto' }} />
                </div>
              </div>
              <div className="pf-card">
                <div className="pf-card-body">
                  <h3 className="pf-card-title" style={{ fontSize: 14 }}>
                    <SvgIcon d={<><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 10 3 12 0v-5"/></>} />
                    Exams
                  </h3>
                  <div id="exams-list" style={{ maxHeight: 140, overflowY: 'auto' }} />
                </div>
              </div>
            </div>

            {/* Roadmap */}
            <div id="roadmap-section" className="pf-card">
              <div className="pf-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                  <div>
                    <h3 id="roadmap-title" className="pf-card-title" style={{ marginBottom: 4 }}>Career Milestone Track</h3>
                    <p style={{ fontSize: 13, color: '#888' }}>AI-suggested path to industry proficiency.</p>
                  </div>
                  <div className="pf-roadmap-tabs">
                    <button onClick={() => handleAnalysisChoice('path')} className={`pf-roadmap-tab ${activeAnalysis === 'path' ? 'active' : ''}`}>Path Analysis</button>
                    <button onClick={() => handleAnalysisChoice('career')} className={`pf-roadmap-tab ${activeAnalysis === 'career' ? 'active' : ''}`}>Career Analysis</button>
                  </div>
                </div>
                <div className="relative" style={{ maxWidth: 700, margin: '0 auto' }}>
                  <div className="absolute left-5 md:left-1/2 top-0 bottom-0 timeline-line" style={{ transform: 'translateX(-50%)', opacity: 0.3 }} />
                  <div id="roadmap-items-container" className="relative" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="pf-empty" style={{ padding: '48px 0' }}>Run an analysis to see your roadmap.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* My Courses (expanded view) */}
            {!showMyCourses && (
              <div className="pf-two-col-grid"
>
                <div className="pf-card" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/#hybrid-hustle'}>
                  <div className="pf-card-body" style={{ background: '#111', borderRadius: 16, color: '#fff' }}>
                    <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Hybrid Hustle</h4>
                    <p style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>Your personalized career growth command center.</p>
                    <span style={{ color: '#00c851', fontSize: 13, fontWeight: 700 }}>Enroll Now &rarr;</span>
                  </div>
                </div>
                <div className="pf-card">
                  <div className="pf-card-body" style={{ textAlign: 'center' }}>
                    <h4 style={{ fontSize: 16, fontWeight: 800, color: '#111', marginBottom: 4 }}>AI Suggestions</h4>
                    <p id="suggestions-text" style={{ fontSize: 12, color: '#888' }}>Analyzing metrics...</p>
                  </div>
                </div>
              </div>
            )}

            {showMyCourses && (
              <div className="pf-card">
                <div className="pf-card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                      <h3 className="pf-card-title">My Enrolled Courses</h3>
                      <p style={{ fontSize: 12, color: '#888' }}>{enrolledCourses.length} course(s) enrolled</p>
                    </div>
                    <button onClick={() => setShowMyCourses(false)} className="pf-btn pf-btn-outline" style={{ fontSize: 12 }}>Back to Dashboard</button>
                  </div>
                  {coursesLoading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                      {[1,2,3].map(i => <div key={i} className="pf-course-card" style={{ height: 180, background: '#f5f5f5' }} />)}
                    </div>
                  ) : enrolledCourses.length === 0 ? (
                    <div className="pf-empty">
                      <p style={{ fontWeight: 700, marginBottom: 12 }}>No courses enrolled yet</p>
                      <a href="/courses" className="pf-btn pf-btn-solid" style={{ fontSize: 12 }}>Browse Courses</a>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                      {enrolledCourses.map(c => (
                        <div key={c.id} className="pf-course-card">
                          <div className="pf-course-img" style={{
                            background: c.image_url ? `url(${c.image_url}) center/cover` : (c.image_visual || 'linear-gradient(135deg, #e8f5e9, #a5d6a7)')
                          }}>
                            {c.has_live_class && (
                              <span style={{ position: 'absolute', top: 8, right: 8, padding: '3px 10px', background: '#ef4444', color: '#fff', borderRadius: 12, fontSize: 10, fontWeight: 800 }}>LIVE</span>
                            )}
                          </div>
                          <div className="pf-course-body">
                            <div className="pf-course-title">{c.title}</div>
                            <div className="pf-course-meta">
                              {c.instructor && <span>By {c.instructor}</span>}
                              {c.level && <span> &middot; {c.level}</span>}
                            </div>
                            <div className="pf-course-actions">
                              <a href={`/courses/${c.id}`} className="pf-course-btn pf-course-btn-primary">View</a>
                              {c.has_live_class && c.live_class_active && (
                                <a href={`/courses/${c.id}/live-class`} className="pf-course-btn pf-course-btn-live">Live</a>
                              )}
                              {c.has_live_class && !c.live_class_active && (
                                <span className="pf-course-btn pf-course-btn-offline">Offline</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ========== RIGHT COLUMN ========== */}
          <div className="pf-right">
            {/* Match Score */}
            <div className="pf-card">
              <div className="pf-card-body" style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Match Score</h3>
                <div className="pf-match-circle">
                  <svg viewBox="0 0 36 36">
                    <path className="bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path id="analysis-circle-fg" className="fg" strokeDasharray="0, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div id="analysis-match-text" className="pf-match-text">--%</div>
                </div>
              </div>
            </div>

            {/* Target Role */}
            <div className="pf-card">
              <div className="pf-card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 32, height: 32, background: '#fff0f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SvgIcon d={<><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></>} size={16} color="#e91e63" />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Target Role</span>
                </div>
                <div id="target-role-name" style={{ fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 4 }}>---</div>
                <p id="target-role-desc" style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>Defining destination...</p>
                <a href="/settings" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: '#00c851', marginTop: 10, textDecoration: 'none' }}>
                  Update Goal <SvgIcon d="M5 12h14M12 5l7 7-7 7" size={12} color="#00c851" />
                </a>
              </div>
            </div>

            {/* Attendance & Performance */}
            <div className="pf-card">
              <div className="pf-card-body">
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>Attendance</span>
                    <span id="attendance-value" style={{ fontSize: 18, fontWeight: 800, color: '#00c851' }}>--%</span>
                  </div>
                  <div className="pf-progress-bar">
                    <div id="attendance-bar" className="pf-progress-fill" style={{ width: '0%' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>Performance</span>
                    <span id="performance-value" style={{ fontSize: 18, fontWeight: 800, color: '#e91e63' }}>--%</span>
                  </div>
                  <div className="pf-progress-bar">
                    <div id="performance-bar" className="pf-progress-fill" style={{ width: '0%', background: '#e91e63' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Current Date */}
            <div className="pf-card">
              <div className="pf-card-body" style={{ textAlign: 'center' }}>
                <span id="current-date" style={{ fontSize: 13, fontWeight: 700, color: '#555' }} />
              </div>
            </div>

            {/* Enrolled Courses in Right Column */}
            <div className="pf-card">
              <div className="pf-card-body">
                <h3 className="pf-card-title" style={{ fontSize: 14 }}>
                  <SvgIcon d={<><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></>} />
                  My Courses
                </h3>
                {rightCourses.length === 0 ? (
                  <p style={{ fontSize: 12, color: '#999', textAlign: 'center', padding: '12px 0' }}>No courses enrolled yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {rightCourses.map(c => (
                      <a key={c.id} href={`/courses/${c.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 10, textDecoration: 'none', transition: 'border-color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#00c851'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#f0f0f0'}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: c.image_url ? `url(${c.image_url}) center/cover` : (c.image_visual || 'linear-gradient(135deg, #e8f5e9, #a5d6a7)') }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                          {c.instructor && <div style={{ fontSize: 10, color: '#999' }}>{c.instructor}</div>}
                        </div>
                        <SvgIcon d="M9 18l6-6-6-6" size={14} color="#ccc" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}