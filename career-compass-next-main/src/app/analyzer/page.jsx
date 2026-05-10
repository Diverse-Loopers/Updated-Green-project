"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import "./analyzer.css";
import { initAnalyzerPage } from "@/lib/pages/analyzer";
import NavAuthButtons from "@/components/NavAuthButtons";
import Footer from "@/components/ui/Footer";



export default function AnalyzerPage() {
  
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
     const applyTheme = () => {
    const dark = document.documentElement.classList.contains("dark");
    setIsDark(dark);
  };

  applyTheme(); // initial

  // listen for theme change
  const observer = new MutationObserver(applyTheme);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  setMounted(true);
    initAnalyzerPage();
  }, []);

  return (
    <>
      {/* Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@600;700;800&display=swap"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      <Script
        src="https://unpkg.com/lucide@latest"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== "undefined" && window.lucide)
            window.lucide.createIcons();
        }}
      />

      <div className="min-h-screen flex flex-col">
        {/* Decorative Blobs */}
        <div className="absolute top-0 -left-4 w-64 md:w-96 h-64 md:h-96 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob pointer-events-none"></div>
        <div className="absolute top-0 -right-4 w-64 md:w-96 h-64 md:h-96 bg-secondary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>

        {/* ── Navigation (unchanged) ── */}
        <nav className="fixed top-0 w-full z-50 glass-nav">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <a href="/" className="flex-shrink-0 flex items-center gap-2">

<img
  src={
    isDark
      ? "/Diverse Loopers Black BG (2).png"
      : "/DIVERSE LOOPERS (1) bg.png"
  }
  alt="Diverse Loopers"
  className="h-10 md:h-12 w-auto"
/>
             
                {/* <img
                  src="/DIVERSE LOOPERS (1) bg.png"
                  alt="Diverse Loopers"
                  className="block dark:hidden h-10 md:h-12 w-auto"
                />
                <img
                  src="/Diverse Loopers Black BG (2).png"
                  alt="Diverse Loopers"
                  className="hidden dark:block h-10 md:h-12 w-auto"
                /> */}
              
              </a>
              <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
                <a
                  href="/"
                  className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-secondary)] font-medium transition text-sm"
                >
                  Home
                </a>

                <a
                  href="/#programs"
                  className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-secondary)] font-medium transition text-sm"
                >
                  Programs
                </a>

                <a
                  href="/events"
                  className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-secondary)] font-medium transition text-sm"
                >
                  Events
                </a>
                <div className="relative group">
                  <button className="flex items-center gap-1 text-primary font-bold text-sm">
                    Tools <i data-lucide="chevron-down" className="w-4 h-4"></i>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark rounded-xl shadow-xl border border-slate-100 dark:border-white/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <a
                      href="/career-analyzer"
                      className="block px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 text-sm rounded-t-xl text-slate-700 dark:text-slate-300"
                    >
                      Career Analyzer
                    </a>
                    <a
                      href="/analyzer"
                      className="block px-4 py-3 bg-slate-50 dark:bg-white/10 text-sm rounded-b-xl text-primary font-bold"
                    >
                      Path Analyzer
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4 border-l border-slate-200 dark:border-white/10 pl-6 lg:pl-8">
                  <button
                    id="theme-toggle"
                    className="p-2 rounded-xl cursor-pointer text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                  >
                    <i
                      data-lucide="moon"
                      id="theme-icon"
                      className="w-5 h-5"
                    ></i>
                  </button>
                  <NavAuthButtons
                    loginClass="text-sm font-semibold text-slate-700 hover:text-primary transition-all duration-200"
                    signupClass="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden text-sm font-semibold text-primary"
                    loginText="Login"
                    profileText="My Profile"
                  />
                </div>
              </div>
              <div className="md:hidden flex items-center gap-4">
                <button id="mobile-theme-toggle" className="p-2 text-slate-500">
                  <i data-lucide="moon" className="w-5 h-5"></i>
                </button>
                <button
                  id="mobile-menu-toggle"
                  className="p-2 text-slate-600 dark:text-slate-300"
                >
                  <i data-lucide="menu" className="w-6 h-6"></i>
                </button>
              </div>
            </div>
          </div>
          <div
            id="mobile-menu"
            className="hidden md:hidden bg-white dark:bg-dark border-b border-slate-100 dark:border-white/5 overflow-y-auto max-h-screen shadow-2xl"
          >
            <div className="px-6 py-8 space-y-4 text-center">
              <a
                href="/"
                className="block text-lg font-bold text-slate-700 dark:text-slate-300"
              >
                Home
              </a>
              <a
                href="/#programs"
                className="block text-lg font-bold text-slate-700 dark:text-slate-300"
              >
                Programs
              </a>
              <a
                href="/#events"
                className="block text-lg font-bold text-slate-700 dark:text-slate-300"
              >
                Events
              </a>
              <hr className="border-slate-100 dark:border-white/5 mx-auto w-1/2" />
              <a
                href="/career-analyzer"
                className="block text-lg font-bold text-slate-700 dark:text-slate-300"
              >
                Career Analyzer
              </a>
              <a
                href="/analyzer"
                className="block text-lg font-bold text-primary"
              >
                Path Analyzer
              </a>
              <div className="pt-6">
                <NavAuthButtons
                  loginClass="block w-full py-4 bg-slate-100 dark:bg-white/5 text-center rounded-2xl font-bold"
                  signupClass="block w-full py-4 bg-primary text-white text-center rounded-2xl font-bold"
                  loginText="Login"
                  profileText="My Profile"
                />
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-grow pt-24 md:pt-32 pb-20">
          {/* ── Hero / info sections (unchanged) ── */}
          <section className="max-w-7xl mx-auto px-6 text-center space-y-8 pb-10">
            <h1 className="text-primary font-black uppercase tracking-[0.3em] text-sm animate-fade-in">
              Path Analyzer
            </h1>
            <h2 className="text-3xl md:text-7xl font-black tracking-tighter bg-clip-text bg-gradient-to-r from-primary to-secondary ">
              Your Personalized Career Roadmap{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Powered by Real Industry Data
              </span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-3xl mx-auto font-medium text-base md:text-xl leading-relaxed">
              Choosing the right career path should not feel like guesswork. The
              Path Analyzer analyzes your interests, academic background,
              current skills, and industry demand to recommend the most suitable
              technology career track.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a
                href="#analyzer-tool"
                className="w-full sm:w-auto px-10 py-5 bg-primary text-white rounded-2xl font-black text-lg hover:bg-blue-700 hover:shadow-2xl transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
              >
                Start My Analysis <i data-lucide="zap" className="w-5 h-5"></i>
              </a>
              {/* <a
                href="#how-it-works"
                className="w-full sm:w-auto px-10 cursor-default py-5 bg-white dark:!bg-black border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-lg hover:bg-slate-50 transition dark:text-red-700"
              >
                Learn How It Works
              </a> */}
    <a
  href="#how-it-works"
  className="w-full sm:w-auto px-10 cursor-default py-5 bg-[var(--bg-card)] border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-lg hover:bg-slate-400 dark:hover:bg-red transition cursor-pointer"
>
  Learn How It Works
</a>
            </div>
          </section>

          {/* How it works, Who Should Use — keep your existing JSX here unchanged */}

          {/* ── ANALYZER TOOL ── */}
          <section
            id="analyzer-tool"
            className="py-24 bg-white dark:bg-transparent relative z-10"
          >
            <div className="max-w-5xl mx-auto px-4 md:px-6">
              {/* ── FORM ── */}
              <div
                id="form-container"
                className="glass-card rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-16 shadow-2xl shadow-primary/10"
              >
                <div className="mb-12 space-y-2">
                  <h2 className="text-2xl md:text-3xl font-black italic">
                    Start Your Path Analysis
                  </h2>
                  <p className="text-slate-400 font-medium text-sm md:text-base">
                    Identify the gap between your curriculum and your goal.
                  </p>
                </div>

                <form id="analysis-form" className="space-y-8 md:space-y-10">
                  {/* ── hidden field so JS knows which payload to build ── */}
                  <input type="hidden" name="userType" value="student" />

                  {/* ── visible shared fields ── */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        required
                        className="input-field"
                        placeholder="Full Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="input-field"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        College Name
                      </label>
                      <input
                        type="text"
                        id="collegeName"
                        name="collegeName"
                        required
                        className="input-field"
                        placeholder="College Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Target Company
                      </label>
                      <input
                        type="text"
                        id="targetCompany"
                        name="targetCompany"
                        className="input-field"
                        placeholder="e.g. Google, Microsoft, TCS"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Engineering Branch
                      </label>
                      <select id="branch" name="branch" className="input-field">
                        <option>Computer Science (CSE)</option>
                        <option>Information Technology (IT)</option>
                        <option>Electronics &amp; Communication (ECE)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Target Job Role
                      </label>
                      <select
                        id="targetRole"
                        name="targetRole"
                        className="input-field"
                      ></select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Current Semester
                      </label>
                      <select name="currentSemester" className="input-field">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <option key={n} value={n}>
                            Semester {n}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        CGPA
                      </label>
                      <input
                        type="text"
                        name="cgpa"
                        className="input-field"
                        placeholder="e.g. 7.8"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        DSA / CP Level
                      </label>
                      <select name="cpLevel" className="input-field">
                        <option value="not started">Not Started</option>
                        <option value="beginner (0–300 problems)">
                          Beginner (0–300 problems)
                        </option>
                        <option value="intermediate (300–800 problems)">
                          Intermediate (300–800)
                        </option>
                        <option value="advanced (800+ problems)">
                          Advanced (800+)
                        </option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Goal
                      </label>
                      <select name="empType" className="input-field">
                        <option value="Full Time Placement">
                          Full Time Placement
                        </option>
                        <option value="Internship">Internship</option>
                        <option value="Both">Both</option>
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Biggest Struggle (optional)
                      </label>
                      <textarea
                        name="struggle"
                        className="input-field"
                        style={{ minHeight: "72px", resize: "vertical" }}
                        placeholder="e.g. I struggle with DSA, don't know where to start..."
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Specific Goals (optional)
                      </label>
                      <textarea
                        name="goals"
                        className="input-field"
                        style={{ minHeight: "72px", resize: "vertical" }}
                        placeholder="e.g. crack FAANG in 1.5 years, prefer project-based learning..."
                      />
                    </div>
                  </div>

                  <div id="error-message-container" className="hidden"></div>

                  <div className="pt-4 md:pt-6 text-center">
                    <button
                      type="submit"
                      className="w-full py-5 bg-primary text-white rounded-[1.5rem] md:rounded-3xl font-black text-lg uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-100"
                    >
                      Analyze My Track{" "}
                      <i
                        data-lucide="arrow-right"
                        className="w-6 h-6 inline"
                      ></i>
                    </button>
                  </div>
                </form>
              </div>

              {/* ── LOADER ── */}
              <div id="loader" className="hidden py-24 text-center space-y-6">
                <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="font-black text-slate-400 uppercase tracking-widest animate-pulse italic">
                  Building your roadmap...
                </p>
              </div>

              {/* ── RESULTS DISPLAY ── */}
              <div
                id="results-display"
                className="hidden space-y-8 md:space-y-12"
              >
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                  <button
                    id="back-btn"
                    className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-primary"
                  >
                    <i data-lucide="chevron-left" className="w-4 h-4"></i> Edit
                    Profile
                  </button>
                  <button
                    id="save-path-btn"
                    className="w-full md:w-auto px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:scale-105 transition shadow-lg"
                  >
                    Save Results to Profile
                  </button>
                </div>

                {/* confidence circle header — unchanged */}
                <div className="glass-card p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] flex flex-col md:flex-row items-center gap-8 md:gap-12">
                  <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
                    <svg
                      viewBox="0 0 36 36"
                      className="w-full h-full transform -rotate-90"
                    >
                      <path
                        className="stroke-slate-100 dark:stroke-white/5 fill-none"
                        strokeWidth="3"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        id="result-match-circle"
                        className="stroke-primary fill-none transition-all duration-1000"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray="0, 100"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div
                      id="result-match-text"
                      className="absolute inset-0 flex items-center justify-center text-2xl md:text-3xl font-black text-[var(--color-on-background)]"
                    >
                      --%
                    </div>
                  </div>
                  <div className="space-y-3 text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-black italic text-[var(--color-on-background)]">
                      Your Career Blueprint
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-lg">
                      Hello{" "}
                      <span
                        id="user-name-result"
                        className="text-primary font-black"
                      ></span>
                      ! Here is your personalized roadmap for the{" "}
                      <strong
                        id="user-role-result"
                        className="text-primary font-black"
                      ></strong>{" "}
                      role.
                    </p>
                    <div
                      id="save-path-notification"
                      className="text-xs font-bold text-green-600 bg-green-50 p-3 rounded-xl hidden border border-green-100 mt-4"
                    ></div>
                  </div>
                </div>

                {/*
                  ── ALL roadmap sections are injected here by renderRoadmapResult() ──
                  This single div replaces the old core-focus-list / missing-skills-list /
                  roadmap-list divs from your previous file.
                */}
                <div id="roadmap-sections" className="space-y-2"></div>
              </div>
            </div>
          </section>

          {/* FAQ — unchanged */}
          <section id="faq" className="py-24 max-w-3xl mx-auto px-6">
            <h3 className="text-2xl md:text-3xl font-black mb-10 text-center">
              Frequently Asked Questions
            </h3>
            <div className="space-y-4">
              <details className="group glass-card rounded-2xl p-5 md:p-6 cursor-pointer hover:border-primary/30 transition">
                <summary className="font-bold list-none flex justify-between items-center text-sm md:text-base">
                  Is Path Analyzer a test?{" "}
                  <i
                    data-lucide="plus"
                    className="w-4 h-4 group-open:rotate-45 transition"
                  ></i>
                </summary>
                <p className="mt-4 text-xs md:text-sm text-slate-500 leading-relaxed">
                  No. It is a guided analysis tool that understands your
                  strengths and industry opportunities to give you a clear
                  growth plan.
                </p>
              </details>
              <details className="group glass-card rounded-2xl p-5 md:p-6 cursor-pointer hover:border-primary/30 transition">
                <summary className="font-bold list-none flex justify-between items-center text-sm md:text-base">
                  Does it guarantee jobs?{" "}
                  <i
                    data-lucide="plus"
                    className="w-4 h-4 group-open:rotate-45 transition"
                  ></i>
                </summary>
                <p className="mt-4 text-xs md:text-sm text-slate-500 leading-relaxed">
                  No. It provides clarity and direction. Success depends on your
                  consistency and effort in executing the suggested roadmap.
                </p>
              </details>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
