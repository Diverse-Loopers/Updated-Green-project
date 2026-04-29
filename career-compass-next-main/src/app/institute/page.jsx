"use client";

import Script from "next/script";
import { useEffect } from "react";
import "./institute.css";
import { initBusinessPage } from "@/lib/pages/institute";
import Footer from "@/components/ui/Footer";
import { AlertCircle, TrendingUp, LucideGem, CheckCircle, Hammer, BarChart3, Menu, GraduationCap, Award, UserPlus, UserCheck, Coins, Compass, Plus} from "lucide-react";

export default function BusinessPage() {
  useEffect(() => {
    initBusinessPage();
  }, []);

  return (
    <>
      {/* Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@600;700;800;900&display=swap"
        rel="stylesheet"
      />

      {/* Scripts */}

      <Script src="https://unpkg.com/lucide@latest" strategy="afterInteractive" />



      <div className="font-sans text-slate-600 bg-white selection:bg-primary selection:text-white  ">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 glass-nav">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <a href="/" className="flex-shrink-0 flex items-center gap-2">
                <img src="/DIVERSE LOOPERS (1) bg.png" alt="Diverse Loopers" className="h-12 w-auto" />
              </a>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center space-x-8">
                <div className="flex space-x-1 p-1 bg-slate-100 rounded-full text-xs font-semibold mr-4">
                  <a href="/" className="px-4 py-1.5 text-slate-500 hover:text-slate-700 transition">
                    Students
                  </a>
                  <a href="/institute" className="px-4 py-1.5 bg-white text-primary rounded-full shadow-sm">
                    Universities
                  </a>
                  <a href="/business" className="px-4 py-1.5 text-slate-500 hover:text-slate-700 transition">
                    Businesses
                  </a>
                </div>
                <a href="/" className="text-slate-600 hover:text-primary font-medium transition text-sm">
                  Home
                </a>
                <a href="#philosophy" className="text-slate-600 hover:text-primary font-medium transition text-sm">
                  Philosophy
                </a>
                <a href="#blueprint" className="text-slate-600 hover:text-primary font-medium transition text-sm">
                  Blueprint
                </a>
               
              </div> 
              <div className="hidden md:flex items-center">
                <a
                  href="#contact"
                  className="px-5 py-2.5 bg-primary text-white rounded-full font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                >
                  Become a Partner
                </a>
                </div>

              <div className="md:hidden flex items-center">
                <button id="mobile-menu-toggle" className="p-2 text-slate-600">
                  <Menu className="w-6 h-6"/>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            id="mobile-menu"
            className="hidden md:hidden bg-white border-b border-slate-100 max-h-[calc(100vh-80px)] overflow-y-auto"
          >
            <div className="px-4 pt-2 pb-8 space-y-1">
              <div className="flex gap-2 p-2 mb-4 bg-slate-50 rounded-xl text-center">
                <a href="/" className="flex-1 py-2 text-slate-500 text-xs font-bold">
                  Students
                </a>
                <a href="/institute" className="flex-1 py-2 bg-white text-primary rounded-lg text-xs font-bold shadow-sm">
                  Universities
                </a>
                <a href="/business" className="flex-1 py-2 text-slate-500 text-xs font-bold">
                  Businesses
                </a>
              </div>
              <a
                href="#philosophy"
                className="block px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
              >
                Our Philosophy
              </a>
              <a
                href="#blueprint"
                className="block px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
              >
                Blueprint
              </a>
              <a
                href="#partnership-models"
                className="block px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
              >
                Models
              </a>
              <div className="pt-6 px-2">
                <a
                  href="#contact"
                  className="block w-full text-center py-4 bg-primary text-white rounded-2xl font-bold shadow-lg"
                >
                  Partner Now
                </a>
              </div>
            </div>
          </div>
        </nav>

        <main >
          {/* Hero Section */}
          <section id="hero-section" className="relative pt-40 pb-24 overflow-hidden hero-gradient">
            <canvas id="hero-canvas" className="absolute inset-0 w-full h-full pointer-events-none opacity-40"></canvas>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center max-w-4xl mx-auto">
                <span className="inline-block py-1 px-4 rounded-full bg-blue-50 text-primary text-xs font-bold tracking-widest uppercase mb-6 fade-in">
                  Academic Transformation Model
                </span>
                {/* <h1 className="text-4xl md:text-7xl font-heading font-black text-slate-900 leading-tight mb-8 fade-in">
                  Build Graduates Who Don't Just Graduate —{" "} */}
                  <h1 className="text-3xl sm:text-5xl md:text-7xl font-heading font-black text-slate-900 leading-tight mb-8 fade-in break-words w-full">
  Build Graduates Who Don't Just Graduate —{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                    They Lead.
                  </span>
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed mb-12 fade-in">
                  Higher education is at a turning point. Industries are evolving faster than curricula. Partner with
                  Diverse Loopers to build an application-driven ecosystem where learning is proof-based.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 fade-in">
                  <a
                    href="#blueprint"
                    className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-100 flex items-center justify-center gap-2 group transition"
                  >
                    Explore Blueprint{" "}
                    <i data-lucide="arrow-right" className="w-5 h-5 group-hover:translate-x-1 transition"></i>
                  </a>
                  <a
                    href="#contact"
                    className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-bold text-lg hover:border-primary hover:text-primary transition"
                  >
                    Schedule Strategy Call
                  </a>
                </div>
              </div>

              {/* Why Universities Need This Now */}
              <div className="mt-24 max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center fade-in">
                <div>
                  <h2 className="text-3xl font-heading font-bold text-slate-900 mb-6">Why Universities Need This Now</h2>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Universities across the world are facing the same challenge: industry expectations are changing faster
                    than academic structures. Students want direction, relevance, and results.
                  </p>
                  <p className="text-slate-600 font-medium">
                    Diverse Loopers helps institutions modernize without replacing what already works. We strengthen the
                    existing academic ecosystem.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    < AlertCircle className="text-secondary w-6 h-6 flex-shrink-0"/>
                    <p className="text-sm text-slate-600">
                      Employers demand applied skills and verifiable portfolios over scores.
                    </p>
                  </div>
                  <div className="flex gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <TrendingUp className="text-primary w-6 h-6 flex-shrink-0"/>
                    <p className="text-sm text-slate-600">
                      Bridging the widening gap between traditional curricula and market needs.
                    </p>
                  </div>
                </div>
              </div>

              {/* Trusted By Institutions */}
              <div className="mt-24 pt-10 border-t border-slate-100 text-center fade-in">
                <p className="text-primary font-bold text-sm mb-8">Who We Work With</p>
                <div className="flex flex-wrap justify-center gap-3 sm:gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition duration-500 mb-8">
                  <span className="text-sm sm:text-lg font-bold text-slate-700">Engineering Institutes</span>
                  <span className="text-sm sm:text-lg font-bold text-slate-700">Business Schools</span>
                  <span className="text-sm sm:text-lg font-bold text-slate-700">Innovation Cells</span>
                  <span className="text-sm sm:text-lg font-bold text-slate-700">Technical Universities</span>
                </div>
                <p className="text-sm text-slate-500 max-w-2xl mx-auto italic">
                  We collaborate closely with academic leaders to design practical, outcome-driven ecosystems tailored to
                  engineering, management, research, and interdisciplinary programs.
                </p>
              </div>
            </div>
          </section>

          {/* Philosophy Section */}
          <section id="philosophy" className="py-24 bg-surface">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-16 fade-in text-center">
                <h2 className="text-primary font-bold uppercase tracking-widest text-sm mb-4">Our Philosophy</h2>
                <h3 className="text-3xl md:text-5xl font-heading font-bold text-slate-900 mb-6">
                  Why Diverse Loopers Exists
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed mb-4">
                  Diverse Loopers is a business and education ecosystem that blends <br/> real-world project execution, career
                  pathways, and applied learning environments.
                </p>
                <p className="text-lg text-slate-600 leading-relaxed">
                  We connect institutions, learners, and industry to create measurable outcomes and meaningful
                  opportunities.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Phil 1 */}
                <div className="bento-card p-10 rounded-[2.5rem] fade-in">
                  <div className="w-14 h-14 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mb-8">
                    <LucideGem className="w-8 h-8"/>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-4">Skill is the New Academic Currency</h4>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6">
                    Degrees validate knowledge; skills validate capability. We ensure students graduate as contributors,
                    not trainees.
                  </p>
                  <ul className="space-y-2 text-xs font-semibold text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" /> Verified projects
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" /> Real industry exposure
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" /> Demonstrable outcomes
                    </li>
                  </ul>
                </div>

                {/* Phil 2 */}
                <div className="bento-card p-10 rounded-[2.5rem] fade-in">
                  <div className="w-14 h-14 bg-pink-50 text-secondary rounded-2xl flex items-center justify-center mb-8">
                    <Hammer className="w-8 h-8"/>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-4">Industry Must Shape, Not Observe</h4>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6">
                    Industry shouldn't just be guest lecturers. We embed practitioners directly into the learning journey.
                  </p>
                  <ul className="space-y-2 text-xs font-semibold text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-secondary" /> Industry mentors
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-secondary" /> Real project assignments
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-secondary" /> Feedback loops
                    </li>
                  </ul>
                </div>

                {/* Phil 3 */}
                <div className="bento-card p-10 rounded-[2.5rem] fade-in">
                  <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-8">
                    <BarChart3 className="w-8 h-8"/>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-4">Education Must Show Measurable ROI</h4>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6">
                    Impact is seen in employability and research application. We help universities track results
                    confidently.
                  </p>
                  <ul className="space-y-2 text-xs font-semibold text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" /> Placement performance
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" /> Internship quality
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" /> Competency levels
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center mt-12">
              <button
                onClick={() => (window.location.href = '/skillsynth')}
                className="px-10 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold hover:border-primary hover:text-primary transition"
              >
                Our Top Performers
              </button>
            </div>
          </section>

          {/* Blueprint Section */}
          <section id="blueprint" className="py-24 bg-white overflow-visible">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-16 items-start">
                <div className="lg:sticky lg:top-32">
                  <h2 className="text-primary font-bold uppercase tracking-widest text-sm mb-4">The Blueprint</h2>
                  <h3 className="text-4xl md:text-5xl font-heading font-black text-slate-900 mb-8 leading-tight">
                    We co-design academic <br />
                    ecosystems.
                  </h3>
                  <p className="text-lg text-slate-600 leading-relaxed mb-8">
                    Our partnership grows across three structured stages. We don't implement pre-built modules; we
                    co-create with your vision.
                  </p>
                  <div className="p-6 bg-blue-50 border-l-4 border-primary rounded-r-2xl">
                    <p className="text-sm font-medium text-slate-700 italic">
                      "Students begin building proof-based skill portfolios from day one."
                    </p>
                  </div>
                </div>

                <div className="space-y-12 ">
                  {/* Phase 1 */}
                  <div className="p-8 bento-card rounded-[2rem] fade-in">
                    <div className="flex items-center gap-4 mb-6">
                      <span className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-200">
                        1
                      </span>
                      <h4 className="text-xl font-bold text-slate-900">Co-Creation & Integration</h4>
                    </div>
                    <p className="text-sm text-slate-500 mb-6 italic">
                      Embed capability into the foundation (6 Months).
                    </p>
                    <ul className="space-y-3 text-sm text-slate-600 font-medium">
                      <li className="flex items-start gap-3">
                        <i data-lucide="check" className="w-4 h-4 text-primary mt-1"></i> Map curriculum against industry
                        needs
                      </li>
                      <li className="flex items-start gap-3">
                        <i data-lucide="check" className="w-4 h-4 text-primary mt-1"></i> Introduce learning labs & tools
                      </li>
                      <li className="flex items-start gap-3">
                        <i data-lucide="check" className="w-4 h-4 text-primary mt-1"></i> Train faculty to collaborate with
                        mentors
                      </li>
                    </ul>
                  </div>

                  {/* Phase 2 */}
                  <div className="p-8 bento-card rounded-[2rem] fade-in">
                    <div className="flex items-center gap-4 mb-6">
                      <span className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-200">
                        2
                      </span>
                      <h4 className="text-xl font-bold text-slate-900">Pilot Execution & Impact</h4>
                    </div>
                    <p className="text-sm text-slate-500 mb-6 italic">
                      Validate outcomes through results (12 Months).
                    </p>
                    <ul className="space-y-3 text-sm text-slate-600 font-medium">
                      <li className="flex items-start gap-3">
                        <i data-lucide="check" className="w-4 h-4 text-primary mt-1"></i> Assign real business projects to
                        batches
                      </li>
                      <li className="flex items-start gap-3">
                        <i data-lucide="check" className="w-4 h-4 text-primary mt-1"></i> Conduct hybrid learning workshops
                      </li>
                      <li className="flex items-start gap-3">
                        <i data-lucide="check" className="w-4 h-4 text-primary mt-1"></i> Activate placement & internship
                        pipeline
                      </li>
                    </ul>
                  </div>

                  {/* Phase 3 */}
                  <div className="p-8 bento-card rounded-[2rem] fade-in">
                    <div className="flex items-center gap-4 mb-6">
                      <span className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-200">
                        3
                      </span>
                      <h4 className="text-xl font-bold text-slate-900">National Spotlight & Scale</h4>
                    </div>
                    <p className="text-sm text-slate-500 mb-6 italic">
                      Transform your institution into a role model (Ongoing).
                    </p>
                    <ul className="space-y-3 text-sm text-slate-600 font-medium">
                      <li className="flex items-start gap-3">
                        <i data-lucide="check" className="w-4 h-4 text-primary mt-1"></i> Expand across multiple
                        departments
                      </li>
                      <li className="flex items-start gap-3">
                        <i data-lucide="check" className="w-4 h-4 text-primary mt-1"></i> Establish innovation labs & hybrid
                        workspaces
                      </li>
                      <li className="flex items-start gap-3">
                        <i data-lucide="check" className="w-4 h-4 text-primary mt-1"></i> Position as a future-ready
                        education leader
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Gains Section */}
          <section className="py-24 bg-surface">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12">
                <div className="fade-in space-y-12">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-8 border-l-4 border-primary pl-4">
                      What Universities Gain
                    </h3>
                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <GraduationCap className="w-6 h-6 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-slate-900 font-bold">Future-Ready Graduates</p>
                          <p className="text-sm">Strong portfolios and applied real-world experience.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Award className="w-6 h-6 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-slate-900 font-bold">Institutional Reputation</p>
                          <p className="text-sm">Be recognized for innovation, not tradition alone.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <UserPlus className="w-6 h-6 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-slate-900 font-bold">Faculty Empowerment & Support</p>
                          <p className="text-sm">
                            Enable faculty with tools, co-teaching models, and industry insights.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="fade-in space-y-12">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-8 border-l-4 border-secondary pl-4">
                      What Students Gain
                    </h3>
                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <UserCheck className="text-secondary flex-shrink-0"/>
                        <div>
                          <p className="text-slate-900 font-bold">Guided Practitioner Mentorship</p>
                          <p className="text-sm">Exposure to modern tools and industrial workflows.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Coins className="text-secondary flex-shrink-0"/>
                        <div>
                          <p className="text-slate-900 font-bold">Hybrid Hustle Access</p>
                          <p className="text-sm">Opportunities to earn through verified project pathways.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Compass className="text-secondary flex-shrink-0"/>
                        <div>
                          <p className="text-slate-900 font-bold">Career Direction & Confidence</p>
                          <p className="text-sm">Graduate with purpose instead of uncertainty.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Partnership Models */}
          <section id="partnership-models" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16 fade-in">
                <h2 className="text-primary font-bold uppercase tracking-widest text-sm mb-4">Collaboration</h2>
                <h3 className="text-4xl font-heading font-black text-slate-900">Partnership Models</h3>
                <p className="mt-4 text-slate-500 max-w-2xl mx-auto">
                  We offer flexible structures co-created based on academic vision and institution-wide roadmaps.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in">
                <div className="p-8 bento-card rounded-3xl">
                  <h4 className="text-lg font-bold text-slate-900 mb-2">Department Pilot Model</h4>
                  <p className="text-sm text-slate-500">
                    Focused integration for specific technical or management streams.
                  </p>
                </div>
                <div className="p-8 bento-card rounded-3xl">
                  <h4 className="text-lg font-bold text-slate-900 mb-2">Innovation Lab Partnership</h4>
                  <p className="text-sm text-slate-500">
                    Physical spaces for experimentation, prototyping, and research.
                  </p>
                </div>
                <div className="p-8 bento-card rounded-3xl">
                  <h4 className="text-lg font-bold text-slate-900 mb-2">Joint Certification Program</h4>
                  <p className="text-sm text-slate-500">
                    Industry-recognized skill validation alongside academic degrees.
                  </p>
                </div>
                <div className="p-8 bento-card rounded-3xl lg:col-span-1">
                  <h4 className="text-lg font-bold text-slate-900 mb-2">Full-University Integration</h4>
                  <p className="text-sm text-slate-500">
                    Comprehensive ecosystem deployment across all departments.
                  </p>
                </div>
                <div className="p-8 bento-card rounded-3xl lg:col-span-2">
                  <h4 className="text-lg font-bold text-slate-900 mb-2">
                    Custom Institutional Collaboration Framework
                  </h4>
                  <p className="text-sm text-slate-500">
                    A bespoke roadmap tailored to the institution's long-term legacy goals.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Success Indicators */}
          <section className="py-16 bg-slate-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 fade-in">
                <h3 className="text-3xl font-heading font-bold mb-4">How We Measure Impact</h3>
                <p className="text-slate-400">Data-driven education leads to stronger institutional credibility.</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 text-center fade-in">
                <div>
                  <p className="text-3xl font-black text-primary mb-2">%</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-tight">
                    Verified Portfolios
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-black text-secondary mb-2">#</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-tight">
                    Projects Completed
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-black text-green-500 mb-2">↑</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-tight">
                    Placement Growth
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-black text-blue-400 mb-2">★</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-tight">
                    Interview Readiness
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-black text-white mb-2">+</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-tight">
                    Industry Partnerships
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Case Study */}
          {/* <section className="py-24 bg-surface">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase rounded-full">
                    Success Story
                  </span>
                  <h3 className="text-2xl font-heading font-bold text-slate-900">
                    Case Study: Pilot Department Deployment
                  </h3>
                </div>
                <p className="text-slate-600 mb-8">
                  Within one year of hybrid curriculum integration, our partner institution achieved:
                </p>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <i data-lucide="check" className="text-green-500 w-5 h-5 mt-1"></i>
                    <p className="text-sm font-medium text-slate-700">72% Students built demo portfolios</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <i data-lucide="check" className="text-green-500 w-5 h-5 mt-1"></i>
                    <p className="text-sm font-medium text-slate-700">38+ Startup partnerships activated</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <i data-lucide="check" className="text-green-500 w-5 h-5 mt-1"></i>
                    <p className="text-sm font-medium text-slate-700">Increased internship conversion rates</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <i data-lucide="check" className="text-green-500 w-5 h-5 mt-1"></i>
                    <p className="text-sm font-medium text-slate-700">Improved overall learning engagement</p>
                  </div>
                </div>
              </div>
            </div>
          </section> */}
          {/* Case Study */}
<section className="py-24 bg-surface">
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden fade-in">

      {/* Top gradient accent bar */}
      <div className="h-1 bg-gradient-to-r from-primary to-secondary" />

      <div className="p-8 md:p-10">

        {/* Label + Title */}
        <div className="mb-8">
          <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-green-700 bg-green-50 border border-green-200 px-4 py-1.5 rounded-full mb-4">
            Success Story
          </span>
          <h3 className="text-2xl md:text-3xl font-heading font-black text-slate-900 mb-2 leading-snug">
            Case Study: Pilot Department Deployment
          </h3>
          <p className="text-slate-500 text-base leading-relaxed">
            Within one year of hybrid curriculum integration, our partner institution achieved measurable, real-world results.
          </p>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center">
            <p className="text-4xl font-black text-primary leading-none mb-1">72%</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-500 leading-snug">Portfolios Built</p>
          </div>
          <div className="bg-pink-50 border border-pink-200 rounded-2xl p-5 text-center">
            <p className="text-4xl font-black text-secondary leading-none mb-1">38+</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-pink-400 leading-snug">Startup Partners</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
            <p className="text-4xl font-black text-green-600 leading-none mb-1">↑</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-green-500 leading-snug">Internship Rate</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 text-center">
            <p className="text-4xl font-black text-yellow-600 leading-none mb-1">★</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-yellow-500 leading-snug">Engagement Score</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100 mb-7" />

        {/* Outcome bullets — 2 col */}
        <div className="grid sm:grid-cols-2 gap-3 mb-8">
          {[
            "Students built demo portfolios from day one",
            "38+ startup partnerships activated within the year",
            "Measurable increase in internship conversion rates",
            "Significantly improved overall learning engagement",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="w-5 h-5 bg-primary rounded-full flex-shrink-0 flex items-center justify-center mt-0.5">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-700 leading-snug">{item}</p>
            </div>
          ))}
        </div>

        {/* Bottom quote */}
        <div className="bg-slate-900 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-0.5 h-10 bg-primary rounded-full flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-400 italic leading-relaxed">
            "The most impactful shift was seeing students stop asking{" "}
            <span className="text-white not-italic font-semibold">'What should I do?'</span>
            {" "}and start asking{" "}
            <span className="text-white not-italic font-semibold">'What can I build?'</span>"
          </p>
        </div>

      </div>
    </div>
  </div>
</section>

          {/* FAQ Section */}
          <section id="faq" className="py-24 bg-white">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <h3 className="text-3xl font-heading font-bold text-slate-900 mb-12 text-center fade-in">
                Partnership FAQ
              </h3>
              <div className="space-y-4 fade-in">
                <details className="group bg-surface border border-slate-100 rounded-2xl overflow-hidden">
                  <summary className="flex justify-between items-center p-6 cursor-pointer font-bold text-slate-900 select-none">
                    Is Diverse Loopers replacing faculty or curriculum?
                    <Plus className="w-5 h-5 text-primary group-open:rotate-45 transition"/>
                  </summary>
                  <div className="px-6 pb-6 text-slate-500 text-sm leading-relaxed">
                    No. We strengthen existing structures and collaborate with faculty. We align industrial modules with
                    academic subjects to make them practical.
                  </div>
                </details>
                <details className="group bg-surface border border-slate-100 rounded-2xl overflow-hidden">
                  <summary className="flex justify-between items-center p-6 cursor-pointer font-bold text-slate-900 select-none">
                    Do students have to pay individually?
                    <Plus className="w-5 h-5 text-primary group-open:rotate-45 transition"></Plus>
                  </summary>
                  <div className="px-6 pb-6 text-slate-500 text-sm leading-relaxed">
                    Partnership models vary—some are institution-funded while others are student-led. The financial
                    structure is finalized with the institution.
                  </div>
                </details>
                <details className="group bg-surface border border-slate-100 rounded-2xl overflow-hidden">
                  <summary className="flex justify-between items-center p-6 cursor-pointer font-bold text-slate-900 select-none">
                    Does this guarantee placements?
                    <Plus className="w-5 h-5 text-primary group-open:rotate-45 transition"></Plus>
                  </summary>
                  <div className="px-6 pb-6 text-slate-500 text-sm leading-relaxed">
                    We don't make unrealistic guarantees. We build verified capability, create industry pipelines, and
                    increase measurable opportunities for students.
                  </div>
                </details>
                <details className="group bg-surface border border-slate-100 rounded-2xl overflow-hidden">
                  <summary className="flex justify-between items-center p-6 cursor-pointer font-bold text-slate-900 select-none">
                    Can non-technical programs participate?
                    <Plus className="w-5 h-5 text-primary group-open:rotate-45 transition"></Plus>
                  </summary>
                  <div className="px-6 pb-6 text-slate-500 text-sm leading-relaxed">
                    Yes. Hybrid learning models benefit innovation, business, research, and design domains equally by
                    focusing on outcomes over theory.
                  </div>
                </details>
              </div>
            </div>
          </section>

          {/* SEO Final Section */}
          <section className="py-24 bg-surface border-t border-slate-100">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center fade-in">
              <h3 className="text-3xl font-heading font-black text-slate-900 mb-6">
                Why Partner With Diverse Loopers Now
              </h3>
              <p className="text-lg text-slate-500 mb-8 leading-relaxed">
                The future belongs to institutions that align with industry, invest in capability development, and create
                measurable student outcomes. Diverse Loopers exists to help universities lead this change with confidence.
              </p>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="py-24 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl md:rounded-[3rem] p-px shadow-2xl fade-in overflow-hidden">
                <div className="bg-white rounded-[3rem] grid lg:grid-cols-2 overflow-hidden">
                  {/* CTA Text */}
                  <div className="p-10 lg:p-16 flex flex-col justify-center bg-slate-900 text-white">
                    <h2 className="text-3xl md:text-5xl font-heading font-black mb-6 leading-tight">
                      An Invitation
                      <br />
                      to Partner.
                    </h2>
                    <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                      Not as customers. Not as vendors. But as co-creators of a new academic paradigm. Let's design the
                      future of higher education together.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-slate-400">
                        <i data-lucide="mail" className="w-5 h-5 text-primary"></i> contact@diverseloopers.com
                      </div>
                      <div className="flex items-center gap-4 text-slate-400">
                        <i data-lucide="phone" className="w-5 h-5 text-primary"></i> +91 98393 50961
                      </div>
                    </div>
                  </div>

                  {/* Partner Form */}
                  <div className="p-10 lg:p-16">
                    <form id="uni-contact-form" className="space-y-5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Institution Name
                        </label>
                        <input
                          type="text"
                          name="university_name"
                          required
                          placeholder="University / College"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-primary outline-none transition"
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Contact Person
                          </label>
                          <input
                            type="text"
                            name="contact_person"
                            required
                            placeholder="Full Name"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-primary outline-none transition"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Designation
                          </label>
                          <input
                            type="text"
                            name="designation"
                            required
                            placeholder="e.g. Principal"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-primary outline-none transition"
                          />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Official Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            required
                            placeholder="admin@univ.edu"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-primary outline-none transition"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Contact Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            required
                            placeholder="+91 ..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-primary outline-none transition"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Support Inquiry
                        </label>
                        <textarea
                          name="message"
                          rows={3}
                          placeholder="How can we help your students?"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-primary outline-none transition"
                        ></textarea>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-xl shadow-blue-100"
                      >
                        Start the Conversation
                      </button>
                      <div id="uni-message" className="hidden text-center p-4 rounded-xl text-sm font-bold"></div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}