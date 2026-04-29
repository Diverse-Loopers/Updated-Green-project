"use client";

import React, { useState, useEffect } from "react";
import Footer from "@/components/ui/Footer";
import "./product.css";
import { useRouter } from "next/navigation"; // ✅ NOT next/router

// ─── FontLoader ───────────────────────────────────────────────────────────────
// Injects Google Fonts & Material Symbols into <head> on the client.
// Needed because Next.js App Router pages have no HTML <head> to add <link> tags.
function FontLoader() {
  useEffect(() => {
    const hrefs = [
      "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap",
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap",
    ];
    hrefs.forEach((href) => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
      }
    });
  }, []);
  return null;
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
  if (!menuOpen) return;
  const handleClickOutside = () => setMenuOpen(false);
  document.addEventListener('click', handleClickOutside);
  return () => document.removeEventListener('click', handleClickOutside);
}, [menuOpen]);

  return (
    <>
      <nav className="navbar">
        <div className="navbar__inner">
          <div className="flex items-center gap-2">
            <img
              src="/images/logo.png"
              alt="Company Logo"
              className="h-12 object-contain"
            />
          </div>

          <div className="navbar__links">
            <a className="navbar__link" href="/">Home</a>
            <a className="navbar__link" href="#">Products</a>
            <a className="navbar__link" href="/about">About</a>
            <a className="navbar__link" href="/login">Login</a>
            <a className="navbar__btn-register" href="/comming-soon">Explore ETS</a>
          </div>

          <button
            className="navbar__menu-btn"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className="material-symbols-outlined">
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="navbar__mobile">
          <a className="navbar__mobile-link" href="/" onClick={() => setMenuOpen(false)}>Home</a>
          <a className="navbar__mobile-link" href="#" onClick={() => setMenuOpen(false)}>Products</a>
          <a className="navbar__mobile-link" href="/about" onClick={() => setMenuOpen(false)}>About</a>
          <a className="navbar__mobile-link" href="/login" onClick={() => setMenuOpen(false)}>Login</a>
          <a className="navbar__mobile-cta" href="/comming-soon" onClick={() => setMenuOpen(false)}>Explore ETS</a>
        </div>
      )}
    </>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection() {
  const router = useRouter();
  return (
    <section className="hero">
      <div className="hero__inner">
        {/* Left: Content */}
        <div className="hero__content">
          <span className="hero__badge">Introducing The Golden Tool</span>

          <h1 className="hero__title">The ETS Professional Identity.</h1>

          <p className="hero__description">
            A timeless, affordable, and easy background verification system. One
            digital ID to unlock global professional trust.
          </p>

          <div className="hero__actions">
            <button
              className="btn-primary"
              onClick={() => router.push("/comming-soon")}
            >
              Get Your Verified ID
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button className="btn-secondary">How it Works</button>
          </div>
        </div>

        {/* Right: ID Card */}
        <div className="hero__card-wrap">
          <div className="id-card">
            {/* Card Header */}
            <div className="id-card__header">
              <div className="id-card__verified-label">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
                <span>VERIFIED ETS ID</span>
              </div>
              <div className="id-card__qr">
                <span className="material-symbols-outlined">qr_code_2</span>
              </div>
            </div>

            {/* Card Body */}
            <div className="id-card__body">
              <div className="id-card__photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBw-020ObwNrZSlX5cQushmsJWDphIqB2c3yd_CHDjmL5NF07kp3JOau99lTrJveOdY8MlJwt_c1t9-rBfZKSxwhMQleRjB35LgiwKgLe1Lx3fqihwsRVhQKjAtApGdEF-1CEFJ9URwEDGar-9nwUJZqJGeUsvmnfVFDr-NBTQQX_rWDJl0FpYhOViGPRpqNL-uJT3iBVRUmslV1JfiP6gbZmLX1JizzQzHkIMmNNBEPqm4EhDd-MWvDO6GaKGqehS5VKIa6y5lKU0"
                  alt="Professional headshot"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="id-card__info">
                <div className="id-card__label">Full Name</div>
                <div className="id-card__name">Arjun V. Kulkarni</div>
                <div className="id-card__label">Employee Ref</div>
                <div className="id-card__ref">DL-8842-ETS-01</div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="id-card__footer">
              <div>
                <div className="id-card__footer-label">Skill Index</div>
                <div className="id-card__skill-index">Top 2%</div>
              </div>
              <div>
                <div className="id-card__footer-label">Status</div>
                <div className="id-card__status">Active Professional</div>
              </div>
            </div>

            {/* Decorative blobs */}
            <div className="hero__blob-1" />
            <div className="hero__blob-2" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Analyzer Section ─────────────────────────────────────────────────────────

function AnalyzerSection() {
  const router = useRouter();
  return (
    <section className="analyzer-section">
      <div className="analyzer-section__inner">
        {/* Heading */}
        <div className="analyzer-section__heading">
          <h2>AI-Powered Career Intelligence</h2>
          <p>
            Don&apos;t just guess your future. Use our analytical tools to map
            your exact trajectory from where you are to where you want to be.
          </p>
        </div>

        {/* Cards */}
        <div className="analyzer-section__grid">
          {/* Path Analyzer */}
          <div className="analyzer-card">
            <div className="analyzer-card__icon analyzer-card__icon--blue">
              <span className="material-symbols-outlined">route</span>
            </div>
            <h3>Path Analyzer</h3>
            <p>
              Generate hyper-detailed roadmaps with curated videos, notes, and
              industry projects.
            </p>
            <div>
              <div className="form-group">
                <label className="form-label">Current Role</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Junior Developer"
                />
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Desired Company</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="e.g. Google"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Desired Skills</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="e.g. System Design"
                  />
                </div>
              </div>

              <a className="btn-generate" href="/analyzer">
                Generate My Path
              </a>
            </div>
          </div>

          {/* Career Analyzer */}
          <div className="analyzer-card">
            <div className="analyzer-card__icon analyzer-card__icon--green">
              <span className="material-symbols-outlined">analytics</span>
            </div>
            <h3>Career Analyzer</h3>
            <p>
              Analyze your current skillset and get a relevant role matching
              score with gap analysis.
            </p>

            {/* Match Bar */}
            <div className="career-match-bar-wrap">
              <div className="career-match-bar-header">
                <span>Target Role Match: Senior FE Engineer</span>
                <span className="career-match-percent">84%</span>
              </div>
              <div className="career-match-track">
                <div className="career-match-fill" />
              </div>
            </div>

            {/* Skill Items */}
            <div className="career-skill-list">
              <div className="career-skill-item">
                <span
                  className="material-symbols-outlined green"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <p>React, TypeScript, Tailwind CSS Mastery</p>
              </div>
              <div className="career-skill-item">
                <span className="material-symbols-outlined amber">warning</span>
                <p>System Architecture Fundamentals Gap</p>
              </div>
              <div className="career-skill-item">
                <span className="material-symbols-outlined blue">
                  lightbulb
                </span>
                <p>Recommended Project: Distributed Dashboards</p>
              </div>
            </div>

            <a className="btn-deep-dive" href="/career-analyzer">
              Deep Dive Analysis
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Ecosystem Section ────────────────────────────────────────────────────────

const ECOSYSTEM_CARDS = [
  {
    variant: "light",
    icon: "school",
    title: "Students",
    items: [
      "Internships on real-world projects",
      "Career Analyzer roadmap tools",
      "Exclusive placement services",
    ],
    ctaLabel: "Start Learning",
    ctaHref: "/",
  },
  {
    variant: "dark",
    icon: "account_balance",
    title: "Institutes",
    items: [
      "Industry-aligned curriculum building",
      "Code webinars & expert workshops",
      "Mentorship labs & infrastructure",
    ],
    ctaLabel: "Partner with us",
    ctaHref: "/institute",
  },
  {
    variant: "light",
    icon: "business",
    title: "Business",
    items: [
      "Trained & verified workforce",
      "Up-skilling & project collaboration",
      "Global hiring & tech solutions",
    ],
    ctaLabel: "Explore Solutions",
    ctaHref: "/business",
  },
];

function EcosystemSection() {
  return (
    <section className="ecosystem-section">
      <div className="ecosystem-section__inner">
        <div className="ecosystem-grid">
          {ECOSYSTEM_CARDS.map((card) => (
            <div
              key={card.title}
              className={`ecosystem-card ecosystem-card--${card.variant}`}
            >
              <div className="ecosystem-card__icon">
                <span className="material-symbols-outlined">{card.icon}</span>
              </div>
              <h3>{card.title}</h3>
              <ul>
                {card.items.map((item) => (
                  <li key={item}>
                    <span className="material-symbols-outlined">bolt</span>
                    {item}
                  </li>
                ))}
              </ul>
              <a className="ecosystem-card__cta" href={card.ctaHref}>
                {card.ctaLabel}
                <span className="material-symbols-outlined">arrow_outward</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Trust Section ────────────────────────────────────────────────────────────

function TrustSection() {
  return (
    <section className="trust-section">
      <div className="trust-section__inner">
        <div className="trust-section__card">
          <div className="trust-section__grid">
            {/* Left: Content */}
            <div className="trust-section__content">
              <h2>
                The Future of{" "}
                <span className="text-gradient">Professional Trust</span> is
                Here.
              </h2>
              <p>
                We&apos;ve eliminated the friction of background checks. Diverse
                Loopers&apos; ETS provides a decentralized, verifiable standard
                that businesses trust and employees carry with pride.
              </p>
              <div className="trust-stats">
                <div>
                  <div className="trust-stat__number">99.9%</div>
                  <div className="trust-stat__label">Verification Accuracy</div>
                </div>
                <div>
                  <div className="trust-stat__number">500+</div>
                  <div className="trust-stat__label">Global Partners</div>
                </div>
              </div>
            </div>

            {/* Right: Video */}
            <div className="trust-video-wrap">
              <div className="trust-video-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCID1HQ2b2JBd24gRlWV6jiY2eK4govawWkrSQEFAFj-oC9YJvXxxCublhOM1PhFRJdWaZA9NEkl_II_ji4KrtbAhknuwnweH9wf99c2tlcfzhp2ycRyS8vqvm4aio1-U4P-VB1XbjIpLtsogxsFxe2YaHeJqiVxlfFpeKuxGTJJONG_WpxYSWrl3LIRgst3iEnRCrYKAXpcQtNdTsv8zApsPr2mNHWonxZExSUxkkpcrHVCZOQ8GERtc1W2u9fN7WXaGjYYPe3in4"
                  alt="Team collaborating on tech solutions"
                  referrerPolicy="no-referrer"
                />
                <div className="trust-video-overlay">
                  <button className="trust-play-btn">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      play_arrow
                    </span>
                    <span>Watch The Vision</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Page (Root Export) ───────────────────────────────────────────────────────

export default function Page() {
  return (
    <>
      <FontLoader />
      <Navbar />
      <main className="main">
        <HeroSection />
        <AnalyzerSection />
        <EcosystemSection />
        <TrustSection />
      </main>
      <Footer/>
    </>
  );
}
