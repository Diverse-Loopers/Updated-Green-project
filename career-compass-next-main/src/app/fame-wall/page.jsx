"use client";

import { useEffect, useState } from "react";
import Footer from "@/components/ui/Footer";
import "./fame-wall.css";
import { initFameWallPage } from "@/lib/pages/fame-wall";

export default function FameWallPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);

  useEffect(() => {
    initFameWallPage();

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  /* nav items */
  const navItems = [
    { href: "/", label: "Home"         },
    { href: "/fame-wall",  label: "Wall of Fame", active: true },
    { href: "/events",     label: "Events"        },
    { href: "#hiring-form",label: "Hire Talent"   },
  ];

  return (
    <>
      {/* Fonts — Poppins only as per requirement */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />
      {/* Font Awesome for icons */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      {/* ═══════════════ NAV ═══════════════ */}
      {/* FIX: white bg nav, links have proper gap via .nav-links { gap: 2rem } */}
      <nav
        className={`glass-nav${scrolled ? " scrolled" : ""}`}
        role="navigation"
        aria-label="Fame Wall navigation"
      >
        <div className="nav-inner">
          {/* Logo */}
          <a href="/" aria-label="Diverse Loopers home">
            <img
              src="/DIVERSE LOOPERS (1) bg.png"
              className="h-12 w-auto"
              alt="Diverse Loopers"
              
            />
          </a>

          {/* Desktop links — FIX: now wrapped in .nav-links with gap: 2rem */}
          <div className="nav-links hidden md:flex">
            {navItems.map(({ href, label, active }) => (
              <a
                key={href}
                href={href}
                className={`nav-link${active ? " nav-link--active" : ""}`}
              >
                {label}
              </a>
            ))}
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
            onClick={() => setMobileOpen(v => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <i className={`fas ${mobileOpen ? "fa-times" : "fa-bars"} text-lg`} aria-hidden="true"></i>
          </button>
        </div>

        {/* Mobile menu */}
        <div id="mobile-menu" className={mobileOpen ? "open" : ""}>
          <div className="mobile-menu-inner">
            {navItems.map(({ href, label, active }) => (
              <a
                key={href}
                href={href}
                onClick={closeMobile}
                className={`mobile-nav-link${active ? " mobile-nav-link--active" : ""}`}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ═══════════════ PAGE BODY ═══════════════ */}
      {/* FIX: page-wrapper has padding-top = nav height so content isn't hidden */}
      <div className="page-wrapper">
        <main className="flex-grow" style={{ paddingBottom: "4rem" }}>

          {/* Back button — FIX: proper type + alignment */}
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem 1.5rem 0" }}>
            <button
              type="button"
              className="back-btn"
              onClick={() => window.history.back()}
              aria-label="Go back"
            >
              <i className="fas fa-arrow-left" aria-hidden="true"></i>
              Go Back
            </button>
          </div>

          {/* ── Hero header ── */}
          <div className="hero-section">
            <div className="section-label mb-5" style={{ justifyContent: "center" }}>
              Hall of Excellence
            </div>

            <h1 className="hero-title fade-in">
              The Full{" "}
              <span className="hero-title-accent">Wall of Fame</span>
            </h1>

            <p className="hero-sub fade-in" style={{ transitionDelay: "100ms" }}>
              A chronological archive of brilliance. Every week, we highlight the
              individuals who went above and beyond.
            </p>
          </div>

          {/* ── Wall content ──
              FIX: #wall-container is now max-width:1200 + padded
              Cards injected by initFameWallPage() should use .week-group + .cards-grid classes.
              JS must call:
                container.innerHTML with week-group > week-block + cards-grid structure.
          */}
          <div
            id="wall-container"
            style={{ marginBottom: "3rem" }}
            aria-busy="true"
            aria-live="polite"
            aria-label="Hall of fame entries"
          >
            {/* Loading placeholder */}
            <div style={{ textAlign: "center", padding: "5rem 1.5rem" }}>
              <div className="fw-spinner" role="status" aria-label="Loading"></div>
              <p style={{
                fontFamily: "var(--font)", fontSize: "0.72rem",
                fontWeight: 700, letterSpacing: "0.14em",
                textTransform: "uppercase", color: "var(--text-dim)"
              }}>
                Loading History…
              </p>
            </div>
          </div>

          {/* ═══════════════ HIRING FORM ═══════════════ */}
          <section
            id="hiring-form"
            style={{ padding: "4rem 1.5rem" }}
            aria-labelledby="hiring-heading"
          >
            {/* FIX: hiring-card is properly centered with max-width */}
            <div className="hiring-card reveal">
              <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                <div className="section-label mb-4" style={{ justifyContent: "center" }}>
                  For Recruiters
                </div>
                <h2
                  id="hiring-heading"
                  style={{
                    fontFamily: "var(--font)", fontWeight: 800,
                    fontSize: "clamp(1.5rem, 3.5vw, 2rem)",
                    color: "var(--text)", marginBottom: "0.6rem",
                    letterSpacing: "-0.02em"
                  }}
                >
                  Hire Talent Requirements
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  See potential here? Share your hiring needs and our team will connect you with these profiles.
                </p>
              </div>

              <form id="talent-request-form" noValidate>
                <div
                  style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(240px, 100%),1fr))", gap: "1.25rem", marginBottom: "1.25rem" }}
                >
                  <div>
                    <label htmlFor="f-company" className="form-label">Company Name</label>
                    <input id="f-company" type="text" name="company_name" required className="dark-input" placeholder="Organization" />
                  </div>
                  <div>
                    <label htmlFor="f-contact" className="form-label">Hiring Contact Person</label>
                    <input id="f-contact" type="text" name="contact_name" required className="dark-input" placeholder="Full Name" />
                  </div>
                </div>

                <div
                  style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(240px, 100%),1fr))", gap: "1.25rem", marginBottom: "1.25rem" }}
                >
                  <div>
                    <label htmlFor="f-email" className="form-label">Business Email</label>
                    <input id="f-email" type="email" name="contact_email" required className="dark-input" placeholder="email@company.com" autoComplete="email" />
                  </div>
                  <div>
                    <label htmlFor="f-phone" className="form-label">Contact Number</label>
                    <input id="f-phone" type="tel" name="contact_phone" required className="dark-input" placeholder="+91 …" pattern="[+]?[0-9\s\-]{8,15}" />
                  </div>
                </div>

                <div
                  style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(240px, 100%),1fr))", gap: "1.25rem", marginBottom: "1.25rem" }}
                >
                  <div>
                    <label htmlFor="f-role" className="form-label">Role / Requirement</label>
                    <input id="f-role" type="text" name="role_requirement" required className="dark-input" placeholder="e.g. AI Analyst" />
                  </div>
                  <div>
                    <label htmlFor="f-hiring" className="form-label">Type of Hiring</label>
                    <select id="f-hiring" name="hiring_type" required className="dark-input">
                      <option value="" disabled>Select type…</option>
                      <option value="Internship">Internship</option>
                      <option value="Contract">Contract / Project Based</option>
                      <option value="Full-Time">Trial to Full-Time</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: "1.25rem" }}>
                  <label htmlFor="f-skills" className="form-label">Preferred Skills / Stack</label>
                  <input id="f-skills" type="text" name="preferred_skills" className="dark-input" placeholder="e.g. React, Python, Docker" />
                </div>

                <div style={{ marginBottom: "2rem" }}>
                  <label htmlFor="f-notes" className="form-label">Additional Notes</label>
                  <textarea id="f-notes" name="notes" rows={4} className="dark-input" placeholder="Any specific requirements…"></textarea>
                </div>

                <button type="submit" className="submit-btn">
                  Submit Requirement
                </button>

                <p style={{
                  fontFamily: "var(--font)", fontSize: "0.72rem",
                  textAlign: "center", color: "var(--text-dim)",
                  fontStyle: "italic", marginTop: "1rem"
                }}>
                  * We respect confidentiality. Your information is used only for collaboration and hiring support.
                </p>

                <div id="form-msg" role="alert" aria-live="polite"></div>
              </form>
            </div>
          </section>
        </main>

        {/* Footer */}

         <Footer/>
       
      </div>
     
    </>
  );
}