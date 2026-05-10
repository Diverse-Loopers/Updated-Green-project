"use client";

import { useEffect, useState } from "react";
import "./courses.css";
import { initCourses } from "@/lib/pages/courses";
import NavAuthButtons from "@/components/NavAuthButtons";
import Footer from "@/components/ui/Footer";

export default function CoursesPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    initCourses();
  }, []);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav className="guvi-nav">
        <div className="nav-inner">
          <a href="/" className="logo">
            <img src="/DIVERSE LOOPERS (1) bg.png" alt="Diverse Loopers" />
          </a>
          <div className="nav-links-desktop">
            <a href="/" className="nav-link-item">Home</a>
            <a href="/courses" className="nav-link-item active">Courses</a>
            <a href="/events" className="nav-link-item">Events</a>
            <a href="/skillsynth" className="nav-link-item">Community</a>
            <a href="/career-analyzer" className="nav-link-item">Career Analyzer</a>
            <a href="/analyzer" className="nav-link-item">Path Analyzer</a>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <NavAuthButtons loginClass="nav-btn-login" signupClass="nav-btn-signup" />
          </div>
          <button className="nav-hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {mobileOpen ? <path d="M6 18L18 6M6 6l12 12"/> : <path d="M4 6h16M4 12h16M4 18h16"/>}
            </svg>
          </button>
        </div>
        <div className={`nav-mobile ${mobileOpen ? 'open' : ''}`}>
          <a href="/">Home</a>
          <a href="/courses">Courses</a>
          <a href="/events">Events</a>
          <a href="/skillsynth">Community</a>
          <a href="/career-analyzer">Career Analyzer</a>
          <a href="/analyzer">Path Analyzer</a>
          <NavAuthButtons loginClass="nav-mobile-link" signupClass="nav-mobile-link" />
        </div>
      </nav>

      {/* HERO */}
      <section className="co-hero">
        <div className="co-hero__inner">
          <div className="co-hero__badge">Knowledge Ecosystem</div>
          <h1>A New Model of <span>Learning.</span></h1>
          <p>
            Our programs are structured career pathways designed to take you from fundamentals
            to real-world contribution. Build proof of capability, not just certificates.
          </p>
        </div>
      </section>

      {/* BUILT FOR REAL CAREERS */}
      <section className="section section--white">
        <div className="section-inner">
          <div className="co-intro-grid">
            <div className="co-intro-left">
              <h2>Built for Real Careers</h2>
              <p>
                Instead of memorizing concepts, learners build proof of capability through
                an industry-embedded ecosystem that connects learning to real outcomes.
              </p>
              <div className="co-features">
                <div className="co-feature">
                  <div className="co-feature-icon" style={{ background: '#f0fff6' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00c851" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                  </div>
                  Structured Milestones
                </div>
                <div className="co-feature">
                  <div className="co-feature-icon" style={{ background: '#fff5f0' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
                  </div>
                  Industry Projects
                </div>
                <div className="co-feature">
                  <div className="co-feature-icon" style={{ background: '#f0f5ff' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  </div>
                  Practitioner Mentors
                </div>
                <div className="co-feature">
                  <div className="co-feature-icon" style={{ background: '#fff0f5' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#db2777" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  </div>
                  Hybrid Hustle Access
                </div>
              </div>
            </div>
            <div className="co-intro-right">
              <div className="co-step">
                <div className="co-step-num">1</div>
                <p>Guided learning with structured milestones</p>
              </div>
              <div className="co-step">
                <div className="co-step-num">2</div>
                <p>Portfolio-building & documentation support</p>
              </div>
              <div className="co-step">
                <div className="co-step-num">3</div>
                <p>Interview prep & role-specific guidance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LEARNING TRACKS */}
      <section className="section section--gray">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-tag">Learning Tracks</div>
            <h2 className="section-title">Choose Your Learning Path</h2>
            <p className="section-subtitle">Every learner starts at a different stage. We created two tracks designed for different journeys.</p>
          </div>
          <div className="co-tracks-grid">
            {/* Aspire */}
            <div className="co-track-card">
              <div className="co-track-icon" style={{ background: '#f0fff6', fontSize: '28px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00c851" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49"/></svg>
              </div>
              <h3>Aspire</h3>
              <div className="track-type">Foundation + Exploration</div>
              <p>Best for 1st/2nd year students and beginners who want clarity before choosing a specialization.</p>
              <ul>
                <li>Fundamentals of programming</li>
                <li>Logical problem-solving</li>
                <li>Exposure to multiple tech domains</li>
                <li>Guided mini-projects</li>
              </ul>
              <div className="co-track-quote">"Aspire creates clarity before commitment."</div>
            </div>
            {/* Sprint */}
            <div className="co-track-card">
              <div className="co-track-icon" style={{ background: '#fff0f5', fontSize: '28px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#db2777" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
              <h3>Sprint</h3>
              <div className="track-type">Job-Ready Acceleration</div>
              <p>Best for graduates and job-seekers preparing for internships or professional career transitions.</p>
              <ul>
                <li>Specialization-based learning</li>
                <li>Live business-driven projects</li>
                <li>Portfolio & GitHub readiness</li>
                <li>Mock interviews & career mentorship</li>
              </ul>
              <div className="co-track-quote">"Move from knowledge to work-ready contribution."</div>
            </div>
          </div>

          {/* Comparison table */}
          <div className="co-table-wrap">
            <table className="co-table">
              <thead>
                <tr>
                  <th>Track</th>
                  <th>Best For</th>
                  <th>Primary Goal</th>
                  <th>Style</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Aspire</td>
                  <td>Beginners, early-year students</td>
                  <td>Explore & build basics</td>
                  <td>Steady and guided</td>
                </tr>
                <tr>
                  <td style={{ color: '#e05', fontWeight: '700' }}>Sprint</td>
                  <td>Final-year, graduates, job-seekers</td>
                  <td>Become job-ready & specialize</td>
                  <td>Fast-paced and focused</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4 PILLARS */}
      <section className="section section--white">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-tag">Program Structure</div>
            <h2 className="section-title">How Learning Happens</h2>
            <p className="section-subtitle">Every program is structured across four high-impact pillars.</p>
          </div>
          <div className="co-pillars">
            {[
              { num: "1", title: "Learn", desc: "Concepts explained through practical, industry-driven sessions." },
              { num: "2", title: "Apply", desc: "Hands-on tasks, challenges, and guided assignments." },
              { num: "3", title: "Build", desc: "Capstone projects and case studies added to your portfolio." },
              { num: "4", title: "Contribute", desc: "Opportunities to engage in Hybrid Hustle real-world projects." },
            ].map((pillar) => (
              <div key={pillar.num} className="co-pillar">
                <div className="co-pillar-num">{pillar.num}</div>
                <h4>{pillar.title}</h4>
                <p>{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OUTCOMES CTA */}
      <section className="section section--gray">
        <div className="section-inner">
          <div className="co-outcomes-cta">
            <div className="co-outcomes-grid">
              <div>
                <h2>What You Will Gain</h2>
                <p>Diverse Loopers ensures that learning becomes measurable, visible, and career-oriented from day one.</p>
                <a href="#courses-section" className="co-btn-white">Start Your Journey →</a>
              </div>
              <div>
                {[
                  "Strong foundations and specialization clarity",
                  "Real project portfolio instead of only certificates",
                  "Exposure to tools used in real companies",
                  "Improved interview readiness & confidence",
                ].map((item, idx) => (
                  <div key={idx} className="co-outcome-item">
                    <div className="co-outcome-check">✓</div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COURSES GRID */}
      <section className="co-grid-section" id="courses-section">
        <div className="section-inner">
          <div className="co-grid-header">
            <div>
              <h2>Available Paths</h2>
              <p>Our latest domain-specific programs.</p>
            </div>
            <div id="category-filters"></div>
          </div>
          <div id="courses-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {/* Skeleton loaders */}
            <div className="co-skeleton"></div>
            <div className="co-skeleton"></div>
            <div className="co-skeleton"></div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="co-cta">
        <div className="co-cta__icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00c851" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49"/></svg>
        </div>
        <h2>Not Sure Where to Start?</h2>
        <p>Use our Career Compass to discover your strengths, your ideal tech track, and the program that best fits your journey.</p>
        <a href="/career-analyzer" className="co-btn-dark">
          Explore Career Compass →
        </a>
      </div>

      <Footer />
    </>
  );
}