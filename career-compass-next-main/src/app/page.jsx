'use client';

import { useEffect, useState } from 'react';
import * as HomeLogic from '@/lib/pages/home';
import "./(home)/home.css";
import NavAuthButtons from '@/components/NavAuthButtons';
import FooterAuthSection from '@/components/FooterAuthSection';
import Footer from '@/components/ui/Footer';
import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [announcements, setAnnouncements] = useState([]);  // all active announcements
  const [annIndex, setAnnIndex] = useState(0);             // currently displayed index
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeAudience, setActiveAudience] = useState('Students');

  useEffect(() => {
    HomeLogic.initHomePage();

    // Fetch ALL active announcements from Supabase (ordered by priority desc)
    supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .then(({ data }) => { if (data?.length) setAnnouncements(data); });

    // Fade-up animation on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    // Animate circular progress bars
    const animateProgress = () => {
      document.querySelectorAll('.circular-progress .fill').forEach(circle => {
        const pct = parseFloat(circle.getAttribute('data-pct') || 0);
        const circumference = 219.9;
        const offset = circumference - (pct / 100) * circumference;
        circle.style.strokeDashoffset = offset;
      });
    };

    const progressObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) animateProgress();
      });
    }, { threshold: 0.5 });

    const impactSection = document.querySelector('.impact-section');
    if (impactSection) progressObserver.observe(impactSection);

    // Initialize all circular progress bars with full offset
    document.querySelectorAll('.circular-progress .fill').forEach(circle => {
      circle.style.strokeDashoffset = '219.9';
    });

    return () => {
      observer.disconnect();
      progressObserver.disconnect();
    };
  }, []);

  // Auto-cycle through announcements every 4 seconds
  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(() => {
      setAnnIndex(prev => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [announcements.length]);

  const programs = [
    {
      icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="1.5"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r=".5" fill="#2e7d32"/></svg>,
      title: 'AI & Machine Learning Career Program',
      badge: 'Tamil, English & Hindi',
      bg: 'linear-gradient(135deg, #e8f5e9, #a5d6a7)',
      category: 'AI & Machine Learning',
    },
    {
      icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1565c0" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
      title: 'Full Stack Web Development (React + Node.js)',
      badge: 'Tamil, English & Hindi',
      bg: 'linear-gradient(135deg, #e3f2fd, #90caf9)',
      category: 'Web Development',
    },
    {
      icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#880e4f" strokeWidth="1.5"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M8 10h4m-4 4h2"/><circle cx="18" cy="12" r="2"/></svg>,
      title: 'Game Development with Unity & Unreal',
      badge: 'English & Hindi',
      bg: 'linear-gradient(135deg, #fce4ec, #f48fb1)',
      category: 'Game Development',
    },
    {
      icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#283593" strokeWidth="1.5"><path d="M17.7 7.7A8 8 0 1 0 19 12h-7"/><path d="M12 12l4.2-4.2M16.2 12H12"/></svg>,
      title: 'Cloud Engineering & DevOps Bootcamp',
      badge: 'Tamil, English & Hindi',
      bg: 'linear-gradient(135deg, #e8eaf6, #9fa8da)',
      category: 'Cloud & DevOps',
    },
  ];

  const categories = ['All', 'AI & Machine Learning', 'Web Development', 'Game Development', 'Cloud & DevOps'];

  const filteredPrograms = activeCategory === 'All'
    ? programs
    : programs.filter(p => p.category === activeCategory);

  return (
    <>
      {/* ===== ANNOUNCEMENT SLIDESHOW BAR ===== */}
      {announcementVisible && announcements.length > 0 && (() => {
        const ann = announcements[annIndex];
        return (
          <div
            className="announcement-bar"
            style={{ background: ann.bg_color || '#1a3d2b', position: 'relative' }}
          >
            {/* Slideshow text — keyed to trigger CSS fade on change */}
            <span
              key={annIndex}
              style={{ animation: 'annFadeIn 0.5s ease' }}
            >
              <strong>{ann.emoji || '📢'} {ann.message}</strong>{' '}
              {ann.link_url && ann.link_text && (
                <a href={ann.link_url} className="enroll-btn">
                  {ann.link_text}
                </a>
              )}
            </span>

            {/* Dot indicators — only if more than 1 */}
            {announcements.length > 1 && (
              <span style={{ display: 'inline-flex', gap: 5, marginLeft: 10, verticalAlign: 'middle' }}>
                {announcements.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setAnnIndex(i)}
                    aria-label={`Announcement ${i + 1}`}
                    style={{
                      width: 6, height: 6, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0,
                      background: i === annIndex ? '#fff' : 'rgba(255,255,255,0.35)',
                      transition: 'background 0.3s',
                    }}
                  />
                ))}
              </span>
            )}

            <button
              className="close-bar"
              onClick={() => setAnnouncementVisible(false)}
              aria-label="Close announcement"
            >
              ×
            </button>
          </div>
        );
      })()}


      {/* ===== NAVIGATION ===== */}
      <nav className="guvi-nav">
        <div className="nav-inner">
          {/* Logo */}
          <a href="/" className="logo" style={{ flexShrink: 0 }}>
            <img src="/DIVERSE LOOPERS (1) bg.png" alt="Diverse Loopers" />
          </a>

          {/* Desktop Nav Links */}
          <div className="nav-links" style={{ display: 'flex' }}>
            <div className="nav-dropdown">
              <a href="#programs" className="nav-link">
                Programs
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </a>
              <div className="dropdown-menu">
                <a href="/courses">
                  <span className="dd-icon" style={{ background: '#e8fff2' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00c851" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/></svg>
                  </span>
                  All Courses
                </a>
                <a href="#programs">
                  <span className="dd-icon" style={{ background: '#e3f2fd' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r=".5" fill="#2563eb"/></svg>
                  </span>
                  Vision Builders
                </a>
                <a href="#programs">
                  <span className="dd-icon" style={{ background: '#fff3e0' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  </span>
                  Accelerate Program
                </a>
              </div>
            </div>

            <div className="nav-dropdown">
              <a href="#hybrid-hustle" className="nav-link">
                Hybrid Hustle
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </a>
              <div className="dropdown-menu">
                <a href="#hybrid-hustle">
                  <span className="dd-icon" style={{ background: '#f3e8ff' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
                  </span>
                  About Hybrid Hustle
                </a>
                <a href="#hybrid-hustle">
                  <span className="dd-icon" style={{ background: '#fce4ec' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#db2777" strokeWidth="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
                  </span>
                  Enroll Now
                </a>
              </div>
            </div>

            <a href="/skillsynth" className="nav-link">SkillSynth</a>

            <div className="nav-dropdown">
              <a href="#" className="nav-link">
                Tools
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </a>
              <div className="dropdown-menu">
                <a href="/career-analyzer">
                  <span className="dd-icon" style={{ background: '#e8fff2' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00c851" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                  </span>
                  Career Analyzer
                </a>
                <a href="/analyzer">
                  <span className="dd-icon" style={{ background: '#e3f2fd' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>
                  </span>
                  Path Analyzer
                </a>
              </div>
            </div>

            <div className="nav-dropdown">
              <a href="#" className="nav-link">
                About
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </a>
              <div className="dropdown-menu">
                <a href="#about">
                  <span className="dd-icon" style={{ background: '#f0f4ff' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                  </span>
                  Who We Are
                </a>
                <a href="/about">
                  <span className="dd-icon" style={{ background: '#fff0f0' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
                  </span>
                  Our Story
                </a>
                <a href="/fame-wall">
                  <span className="dd-icon" style={{ background: '#fffde7' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b7791f" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </span>
                  Wall of Fame
                </a>
              </div>
            </div>
          </div>

          {/* Audience Toggle in Nav */}
          <div className="nav-audience-toggle">
            {[
              { id: 'Students', label: 'For Students', href: null },
              { id: 'Businesses', label: 'For Businesses', href: '/business' },
              { id: 'Universities', label: 'For Universities', href: '/institute' },
            ].map(({ id, label, href }) => (
              href ? (
                <a key={id} href={href}
                   className={`nav-audience-btn${activeAudience === id ? ' active' : ''}`}
                   onClick={() => setActiveAudience(id)}>
                  {label}
                </a>
              ) : (
                <button key={id}
                        className={`nav-audience-btn${activeAudience === id ? ' active' : ''}`}
                        onClick={() => setActiveAudience(id)}>
                  {label}
                </button>
              )
            ))}
          </div>

          {/* Auth buttons — React-state driven, no vanilla JS needed */}
          <div className="auth-buttons">
            <NavAuthButtons
              loginClass="btn-login"
              signupClass="btn-signup"
              profileText="My Profile"
              loginText="Login"
            />
          </div>

          {/* Hamburger */}
          <button
            className="nav-hamburger"
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              {mobileMenuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu-panel" id="mobile-menu">
            {/* Audience switcher in mobile */}
            <div className="mobile-audience-row">
              {[
                { id: 'Students', label: 'For Students', href: null },
                { id: 'Businesses', label: 'For Businesses', href: '/business' },
                { id: 'Universities', label: 'For Universities', href: '/institute' },
              ].map(({ id, label, href }) => (
                href ? (
                  <a key={id} href={href}
                     className={`mobile-audience-btn${activeAudience === id ? ' active' : ''}`}
                     onClick={() => setActiveAudience(id)}>
                    {label}
                  </a>
                ) : (
                  <button key={id}
                          className={`mobile-audience-btn${activeAudience === id ? ' active' : ''}`}
                          onClick={() => setActiveAudience(id)}>
                    {label}
                  </button>
                )
              ))}
            </div>
            <div className="mobile-menu-divider" />
            <a href="#about">About Us</a>
            <a href="#programs">Programs</a>
            <a href="#hybrid-hustle">Hybrid Hustle</a>
            <a href="/skillsynth">SkillSynth</a>
            <a href="/career-analyzer">Career Analyzer</a>
            <a href="/analyzer">Path Analyzer</a>
            <a href="#contact">Contact Us</a>
            <div className="mobile-auth-row">
              <NavAuthButtons
                loginClass="btn-login"
                signupClass="btn-signup"
                profileText="My Profile"
                loginText="Login"
              />
            </div>
          </div>
        )}
      </nav>

      <main>
        {/* ===== HERO SECTION ===== */}
        <section className="hero-section">
          <div className="hero-inner">
            {/* Left */}
            <div className="hero-left fade-up">
              <div className="hero-badge">
                <span className="badge-dot"></span>
                Live Classes + Placement Guidance
              </div>
              <h1 className="hero-title">
                Transforming <span className="highlight">Ambitious Learners</span> into Tech Professionals
              </h1>
              <div className="hero-subtitle">
                Get clarity in your career direction with structured programs, real projects & expert mentorship.
              </div>
              <div className="hero-cta-group">
                <a href="#hybrid-hustle" className="btn-primary-hero">
                  Start Learning Free
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
                <a href="#programs" className="btn-secondary-hero">
                  Explore Programs
                </a>
              </div>
            </div>

            {/* Right – Media Card */}
            <div className="hero-right fade-up" style={{ transitionDelay: '0.15s' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: 500 }}>
                {/* Main Card */}
                <div className="hero-media-card">
                  <div style={{
                    background: 'linear-gradient(135deg, #e8f0ff 0%, #d4e8ff 50%, #e0f7fa 100%)',
                    aspectRatio: '16/10',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                  </div>
                  <div className="hero-media-overlay">
                    <div className="play-btn">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Floating Stat Cards */}
                <div className="float-card float-card-1">
                  <div className="fc-icon" style={{ background: '#e8fff2' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00c851" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                  </div>
                  <div>
                    <div className="fc-num">500+</div>
                    <div className="fc-label">Learners Enrolled</div>
                  </div>
                </div>

                <div className="float-card float-card-2">
                  <div className="fc-icon" style={{ background: '#fff3e0' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </div>
                  <div>
                    <div className="fc-num">4.8/5</div>
                    <div className="fc-label">Student Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== ACCREDITATIONS / PARTNERS STRIP ===== */}
        <section className="partners-strip fade-up">
          <div className="strip-inner">
            <p className="strip-label">Our Accreditations &amp; Partnerships</p>
            <div className="partners-grid">
              {['IIT Delhi', 'NASSCOM', 'Intel', 'Microsoft', 'MongoDB', 'IITM Pravartak'].map(p => (
                <div key={p} className="partner-logo">{p}</div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== GLOBAL STATS ===== */}
        <section className="stats-section">
          <div className="section-inner">
            <div className="stats-grid fade-up">
              <div className="stat-item">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00c851" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                </div>
                <div className="stat-num"><span>3M</span>+</div>
                <div className="stat-label">Learners</div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00c851" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                </div>
                <div className="stat-num"><span>500</span>+</div>
                <div className="stat-label">Mentors</div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00c851" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                </div>
                <div className="stat-num"><span>40M</span>+</div>
                <div className="stat-label">Lines of Code</div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00c851" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                </div>
                <div className="stat-num"><span>1250</span>+</div>
                <div className="stat-label">Video Courses</div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== PROGRAMS SECTION ===== */}
        <section id="programs" className="programs-section">
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
            <div className="section-header fade-up">
              <div className="section-tag">
                <span className="live-dot"></span>
                Live Classes + Placement Guidance
              </div>
              <h2 className="section-title">
                Programs for {activeAudience}
              </h2>
              <p className="section-subtitle">
                {activeAudience === 'Students' && 'Tailored career pathways combining live instruction, real projects, and guaranteed placement guidance.'}
                {activeAudience === 'Businesses' && 'Connect with skilled, job-ready talent and find the right fit for your team through our trained community.'}
                {activeAudience === 'Universities' && 'Partner with us to offer structured career programs, workshops, and mentorship to your students.'}
              </p>
            </div>

            {/* Category Tabs */}
            <div className="category-tabs fade-up">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`cat-tab${activeCategory === cat ? ' active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Course Cards */}
            <div className="programs-grid fade-up">
              {filteredPrograms.length === 0 ? (
                <p style={{ color: '#888', gridColumn: '1/-1', textAlign: 'center', padding: '40px 0' }}>
                  No programs in this category yet.
                </p>
              ) : (
                filteredPrograms.map((prog, i) => (
                  <div key={i} className="prog-card">
                    <div className="prog-card-img-placeholder" style={{ background: prog.bg }}>
                      {prog.icon}
                    </div>
                    <div className="prog-card-body">
                      <div className="prog-card-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        {prog.badge}
                      </div>
                      <h3 className="prog-card-title">{prog.title}</h3>
                      <div className="prog-card-actions">
                        <a href="/courses" className="btn-syllabus">Syllabus</a>
                        <a href="/courses" className="btn-know-more">Know More</a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ===== LEARNER IMPACT ===== */}
        <section id="about" className="impact-section">
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
            <div className="section-header fade-up">
              <h2 className="section-title">Learner Impact at a Glance</h2>
              <p className="section-subtitle">
                Real outcomes backed by data — see how our learners progress and succeed.
              </p>
            </div>

            <div className="impact-tabs fade-up">
              {['Overall', 'Vision Builders', 'Accelerate', 'SkillSynth'].map(tab => (
                <div key={tab} className={`impact-tab${tab === 'Overall' ? ' active' : ''}`}>{tab}</div>
              ))}
            </div>

            <div className="impact-stats-grid fade-up">
              {[
                { pct: 72, text: 'of Learners complete their courses within 3 months' },
                { pct: 78, text: 'of Learners could recollect the concepts faster' },
                { pct: 84, text: 'of Learners have better understanding over complex topics' },
              ].map(({ pct, text }, i) => {
                const circumference = 219.9;
                const offset = circumference - (pct / 100) * circumference;
                return (
                  <div key={i} className="impact-stat-card">
                    <div className="circular-progress">
                      <svg viewBox="0 0 80 80">
                        <circle className="track" cx="40" cy="40" r="35" />
                        <circle
                          className="fill"
                          cx="40"
                          cy="40"
                          r="35"
                          data-pct={pct}
                          style={{ strokeDashoffset: offset }}
                        />
                      </svg>
                      <div className="percentage">{pct}%</div>
                    </div>
                    <div className="impact-stat-text">
                      <p>{text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== TOOLS SECTION ===== */}
        <section className="tools-section">
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
            <div className="section-header fade-up">
              <div className="section-tag">Exclusive Tools</div>
              <h2 className="section-title">Career Compass Suite</h2>
              <p className="section-subtitle">
                Intelligent tools designed to help you find your path and fill your skill gaps with precision.
              </p>
            </div>

            <div className="tools-grid fade-up">
              {/* Path Analyzer */}
              <div className="tool-card tool-green">
                <div className="tool-icon-wrap tool-icon-green">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00c851" strokeWidth="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>
                </div>
                <h3>Path Analyzer</h3>
                <p>
                  Stop wasting time on irrelevant learning. Our AI analyzes thousands of job descriptions to identify the exact skills you're missing and builds a personalized roadmap.
                </p>
                <ul className="tool-features">
                  <li>Identifies technical skill gaps instantly</li>
                  <li>Personalized 12-month roadmaps</li>
                  <li>Engineering syllabus comparison</li>
                </ul>
                <div className="tool-stats-row">
                  <div className="tool-stat-mini">
                    <div className="num">2000+</div>
                    <div className="lbl">Job Postings Analyzed</div>
                  </div>
                  <div className="tool-stat-mini">
                    <div className="num">98%</div>
                    <div className="lbl">Roadmap Accuracy</div>
                  </div>
                  <div className="tool-stat-mini">
                    <div className="num">100%</div>
                    <div className="lbl">Clarity Gained</div>
                  </div>
                  <div className="tool-stat-mini">
                    <div className="num">Free</div>
                    <div className="lbl">Initial Assessment</div>
                  </div>
                </div>
                <a href="/analyzer" className="btn-tool">
                  Try Path Analyzer
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>

              {/* Career Analyzer */}
              <div className="tool-card tool-purple">
                <div className="tool-icon-wrap tool-icon-purple">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                </div>
                <h3>Career Analyzer</h3>
                <p>
                  Find the Tech Career That Actually Fits You. Not what's trending — what matches your skills, interests, and learning style. A 5-7 minute assessment that gives you clear direction.
                </p>
                <ul className="tool-features">
                  <li>Answer smart questions — only 5-7 minutes</li>
                  <li>Get Fit Scores for each career path</li>
                  <li>Know exactly what to learn next</li>
                </ul>
                <div className="tool-stats-row">
                  <div className="tool-stat-mini">
                    <div className="num">500+</div>
                    <div className="lbl">Careers Suggested</div>
                  </div>
                  <div className="tool-stat-mini">
                    <div className="num">98%</div>
                    <div className="lbl">Tool Accuracy</div>
                  </div>
                  <div className="tool-stat-mini">
                    <div className="num">100%</div>
                    <div className="lbl">Clarity Gained</div>
                  </div>
                  <div className="tool-stat-mini">
                    <div className="num">Free</div>
                    <div className="lbl">Initial Assessment</div>
                  </div>
                </div>
                <a href="/career-analyzer" className="btn-tool" style={{ background: '#7c3aed' }}>
                  Try Career Analyzer
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ===== HYBRID HUSTLE ===== */}
        <section id="hybrid-hustle" className="hustle-section">
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
            <div className="section-header fade-up" style={{ marginBottom: 48 }}>
              <div className="section-tag" style={{ color: '#00c851', justifyContent: 'center' }}>Our Framework</div>
              <h2 className="section-title">The Hybrid Hustle Model</h2>
              <p className="section-subtitle">
                The core foundation of Diverse Loopers — a structured career pathway that redefines how professionals build careers.
              </p>
            </div>

            {/* Steps */}
            <div className="hustle-steps fade-up">
              {[
                { num: '01', color: '#00c851', title: 'Learn', desc: 'Guided training across technologies and professional development essentials.' },
                { num: '02', color: '#2563eb', title: 'Work', desc: 'Collaborate on internal company projects handled by Diverse Loopers.' },
                { num: '03', color: '#f59e0b', title: 'Earn', desc: 'Unlock structured earning opportunities through contribution and performance.' },
                { num: '04', color: '#ec4899', title: 'Grow', desc: 'Progress toward full-time jobs, internships, or entrepreneurial paths.' },
              ].map(step => (
                <div key={step.num} className="hustle-step">
                  <div className="step-num" style={{ background: step.color }}>{step.num}</div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>

            {/* Enrollment Form */}
            <div className="enroll-form-wrap fade-up">
              <h3>Enroll in the Hustle</h3>
              <p className="form-sub">Join our exclusive network and fast-track your path to tech mastery.</p>
              <form id="hustler-form" className="enroll-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" name="name" placeholder="Varun Awasthi" required />
                </div>
                <div className="form-group">
                  <label>Email ID</label>
                  <input type="email" name="email" placeholder="varun@gmail.com" required />
                </div>
                <div className="form-group">
                  <label>College Name</label>
                  <input type="text" name="college" placeholder="IIT Delhi" required />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input type="tel" name="contact" placeholder="+91 9876543210" required />
                </div>
                <div className="form-group">
                  <label>Core Technology</label>
                  <select name="tech" required>
                    <option value="">Select Domain</option>
                    <option value="AI/ML">AI &amp; Machine Learning</option>
                    <option value="WebDev">Full Stack Development</option>
                    <option value="GameDev">Game Development</option>
                    <option value="Cloud">Cloud Engineering</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Course Year</label>
                  <select name="year" required>
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Semester</label>
                  <input type="number" name="semester" min="1" max="8" placeholder="7" required />
                </div>
                <div className="form-group">
                  <label>Roll No.</label>
                  <input type="text" name="roll" placeholder="IITDCS-3210" required />
                </div>
                <div className="form-full">
                  <button type="submit" className="btn-submit-enroll">
                    Submit Registration →
                  </button>
                  <p id="hustler-message" className="hidden" style={{ marginTop: 12, textAlign: 'center', fontSize: 14, fontWeight: 600 }}></p>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* ===== EXTRA FEATURES ===== */}
        <section className="extras-section">
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
            <div className="section-header fade-up">
              <h2 className="section-title">Extra Features for Students</h2>
              <p className="section-subtitle">
                Beyond training — activities and tools that build dedication, visibility, and real-world readiness.
              </p>
            </div>

            <div className="extras-bento fade-up">
              <div className="extra-card wide">
                <div className="extra-card-icon" style={{ background: '#e3f2fd' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></svg>
                </div>
                <h3>Portfolio Builder</h3>
                <p>Create a professional project portfolio that showcases your real-world achievements to top recruiters. Each project is peer-reviewed and mentor approved.</p>
              </div>

              <div className="extra-card accent-green">
                <div className="extra-card-icon" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M8 21l4-4 4 4M12 3v14M5 7l7-4 7 4"/></svg>
                </div>
                <h3>Wall of Fame</h3>
                <p>Recognition space dedicated to our outstanding contributors and top performers.</p>
              </div>

              <div className="extra-card">
                <div className="extra-card-icon" style={{ background: '#f3e8ff' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                </div>
                <h3>Mentorship Hub</h3>
                <p>Direct access to experienced professionals across multiple domains for 1-on-1 guidance sessions.</p>
              </div>

              <div className="extra-card wide">
                <div className="extra-card-icon" style={{ background: '#fff3e0' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <h3>SkillSynth Activities</h3>
                <p>Direct access to technical events, cultural events, seminars, webinars, hackathons and many more activities organised by us — all designed to sharpen your edge.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== EVENTS ===== */}
        <section id="events" className="events-section">
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, marginBottom: 40 }} className="fade-up">
              <div>
                <h2 className="section-title" style={{ marginBottom: 8 }}>Join &amp; Participate</h2>
                <p style={{ fontSize: 15, color: '#777', maxWidth: 480 }}>
                  Connect, learn, and grow with the Diverse Loopers community through interactive workshops.
                </p>
              </div>
              <div className="events-scroll-nav">
                <button id="scroll-left-btn" className="scroll-btn" aria-label="Scroll left">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button id="scroll-right-btn" className="scroll-btn" aria-label="Scroll right">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div id="events-grid-container" className="events-track">
              <div id="events-grid" style={{ display: 'flex', gap: 24, width: 'max-content' }}>
                {/* Skeleton placeholders until JS loads */}
                {[1, 2, 3].map(i => (
                  <div key={i} style={{
                    minWidth: 320, height: 360,
                    background: '#f0f0f0',
                    borderRadius: 20,
                    animation: 'pulse 2s infinite',
                  }} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== CONTACT ===== */}
        <section id="contact" className="contact-section">
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
            <div className="section-header fade-up">
              <h2 className="section-title">Get In Touch</h2>
              <p className="section-subtitle">Have questions or wish to collaborate? We'd be happy to connect.</p>
            </div>
            <div className="contact-card fade-up">
              <form id="contact-form" className="contact-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" id="name" required placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" id="email" required placeholder="john@example.com" />
                </div>
                <div className="form-group form-full">
                  <label>Message</label>
                  <textarea id="message" rows={4} required placeholder="How can we help you?" />
                </div>
                <div className="form-full">
                  <button type="submit" className="btn-contact-submit">Send Message</button>
                  <p id="contact-status" style={{ display: 'none', textAlign: 'center', marginTop: 12, fontSize: 14, fontWeight: 600 }}></p>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
