'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import Footer from '@/components/ui/Footer'
import './business.css'
import { initBusinessPage, handleBusinessFormSubmit, setInquiryType, scrollToSection } from '@/lib/pages/business'
import { ArrowRight, BarChart3, BrainCircuit, CheckCircle, Code2, Coins, Menu, Plus, Palette, Server, Settings2, ShieldAlert, ShieldCheck, Users, Zap } from 'lucide-react'


export default function BusinessPage() {
  useEffect(() => {
    initBusinessPage();

    // Smooth scroll for anchor links
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a[href^="#"]')
      if (!target) return

      const href = target.getAttribute('href')
      if (!href || href === '#') return

      e.preventDefault()

      const targetId = href.substring(1)
      const targetElement = document.getElementById(targetId)

      if (targetElement) {
        const navbarHeight = 80
        const elementPosition = targetElement.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - navbarHeight

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })

        const mobileMenu = document.getElementById('mobile-menu')
        if (mobileMenu) {
          mobileMenu.classList.add('hidden')
        }
      }
    }

    document.addEventListener('click', handleAnchorClick)

    return () => {
      document.removeEventListener('click', handleAnchorClick)
    }
  }, []);

  return (
    <>
      {/* Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@600;700;800;900&display=swap"
        rel="stylesheet"
      />

      {/* Lucide Icons */}
      <Script src="https://unpkg.com/lucide@latest" strategy="afterInteractive" onLoad={() => {
        if (typeof window !== 'undefined' && window.lucide) {
          window.lucide.createIcons();
        }
      }} />

      <div className="font-sans text-slate-700 bg-white min-h-screen flex flex-col overflow-x-hidden">
        {/* Navigation */}
        <nav className="glass-nav fixed top-0 w-full z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div>
              <a href="/" className="flex-shrink-0 flex items-center gap-2">
                <img src="/DIVERSE LOOPERS (1) bg.png" alt="Diverse Loopers" className="h-12 w-auto" />
              </a>
</div>
              {/* Desktop Nav */}
              <div className="hidden md:flex items-center space-x-8">
                <div className="flex space-x-1 p-1 bg-slate-100 rounded-full text-xs font-semibold mr-4">
                  <a href="/" className="px-4 py-1.5 text-slate-500 hover:text-slate-700 transition">Students</a>
                  <a href="/institute" className="px-4 py-1.5 text-slate-500 hover:text-slate-700 transition">Universities</a>
                  <a href="/business" className="px-4 py-1.5 bg-white text-primary rounded-full shadow-sm">Businesses</a>
                </div>
                <a href="/" className="text-slate-600 hover:text-primary font-medium transition text-sm">Home</a>
                <a href="#services" className="text-slate-600 hover:text-primary font-medium transition text-sm">Solutions</a>
                <a href="#talent-hiring" className="text-slate-600 hover:text-primary font-medium transition text-sm">Hire Talent</a>

                
              </div>
              
              <div className="hidden md:flex items-center gap-4">
                  <a href="#contact" className="px-6 py-2.5  bg-primary text-white rounded-full font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-100">
                    Start a Project
                  </a>
                </div>

              <button id="mobile-menu-toggle" className="md:hidden p-2 text-slate-600">
                <Menu className="w-6 h-6"/>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div id="mobile-menu" className="hidden md:hidden bg-white border-b border-slate-100 p-6 space-y-4 shadow-xl">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl text-center mb-4">
              <a href="/" className="flex-1 py-2 text-slate-500 text-xs font-bold">Students</a>
              <a href="/institute" className="flex-1 py-2 text-slate-500 text-xs font-bold">Universities</a>
              <a href="/business" className="flex-1 py-2 bg-white text-primary rounded-lg text-xs font-bold shadow-sm">Businesses</a>
            </div>
            <a href="/" className="block font-bold py-2">Home</a>
            <a href="#services" className="block font-bold py-2">Our Services</a>
            <a href="#talent-hiring" className="block font-bold py-2">Hire Talent</a>
            <a href="#contact" className="block py-4 bg-primary text-white text-center rounded-2xl font-bold shadow-lg">Start a Project</a>
          </div>
        </nav>

        <main className="flex-grow">
          {/* Hero Section */}
          <section id="hero-section" className="hero-gradient relative pt-40 pb-24 overflow-hidden">
            <canvas id="hero-canvas" className="hero-canvas"></canvas>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center max-w-4xl mx-auto">
                <span className="fade-in inline-block py-1 px-4 rounded-full bg-blue-50 text-primary text-xs font-bold tracking-widest uppercase mb-6">
                  B2B Innovation & Execution
                </span>
                <h1 className="fade-in text-4xl md:text-7xl font-heading font-black text-slate-900 leading-tight mb-8">
                  Get Work Done. Build Talent Pipelines. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Reduce Costs.</span>
                </h1>
                <p className="fade-in text-xl text-slate-600 leading-relaxed mb-12 max-w-3xl mx-auto">
                  Diverse Loopers connects companies with a curated ecosystem of trained students and early professionals who execute real projects under expert mentorship — ensuring quality delivery and long-term value.
                </p>
                <div className="fade-in flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a href="#contact" className="w-full sm:w-auto px-10 py-5 bg-primary text-white rounded-full font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-100 flex items-center justify-center gap-2 group transition">
                    Start a Project <Zap className="w-5 h-5"/>
                  </a>
                  <button onClick={() => scrollToSection('contact')} className="w-full sm:w-auto px-10 py-5 bg-white text-slate-700 border border-slate-200 rounded-full font-bold text-lg hover:border-primary hover:text-primary transition">
                    Talk to Our Team
                  </button>
                  <a href="/skillsynth" className="w-full sm:w-auto px-10 py-5 bg-primary text-white rounded-full font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-100 flex items-center justify-center gap-2 group transition">
                    Our Top Performers <Zap className="w-5 h-5"/>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Work With Us Section */}
          <section className="py-12 bg-white border-b border-slate-50">
            <div className="max-w-7xl mx-auto px-6">
              <div className="fade-in p-10 md:p-16 bg-slate-50 border border-slate-100 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="max-w-xl space-y-4">
                  <h2 className="text-2xl md:text-3xl font-heading font-black text-slate-900">Work With Us — Or Hire From Us</h2>
                  <p className="text-slate-600 leading-relaxed">
                    Diverse Loopers is not just a project execution partner. We are building one of the most selective communities of emerging technology talent. Companies can get projects delivered, build long-term execution partnerships, or hire pre-trained, work-ready contributors directly from our ecosystem.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <a href="#talent-hiring" className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition shadow-lg shadow-slate-200 flex items-center gap-2">
                    Hire From Diverse Loopers <Users className="w-5 h-5"/>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Why Work With Us Section */}
          <section id="solutions" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="fade-in text-center mb-20">
                <h2 className="text-primary font-bold uppercase tracking-widest text-sm mb-4">Smarter Execution</h2>
                <h3 className="text-3xl md:text-5xl font-heading font-black text-slate-900 mb-6">More Than Outsourcing — A Smarter Model</h3>
                <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
                  We combine capable talent, guided execution, industry mentorship, and structured delivery frameworks so your business benefits from innovation without compromising quality.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bento-card fade-in p-8 rounded-[2.5rem]">
                  <div className="w-12 h-12 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mb-6">
                    <Users/>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-3 text-lg leading-tight">Trained on Real Projects</h4>
                  <p className="text-sm text-slate-500">Every contributor has worked on structured, supervised projects — not just classroom exercises.</p>
                </div>
                <div className="bento-card fade-in p-8 rounded-[2.5rem]">
                  <div className="w-12 h-12 bg-pink-50 text-secondary rounded-2xl flex items-center justify-center mb-6">
                    <ShieldCheck/>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-3 text-lg leading-tight">Guided by Experts</h4>
                  <p className="text-sm text-slate-500">Industry mentors review strategy, code quality, timelines, and deliverables at every stage.</p>
                </div>
                <div className="bento-card fade-in p-8 rounded-[2.5rem]">
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                    <BarChart3/>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-3 text-lg leading-tight">Outcome-Driven Workflows</h4>
                  <p className="text-sm text-slate-500">Clear milestones, transparent communication, and measurable results for every sprint.</p>
                </div>
                <div className="bento-card fade-in p-8 rounded-[2.5rem]">
                  <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                    <Coins/>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-3 text-lg leading-tight">Cost-Efficient</h4>
                  <p className="text-sm text-slate-500">Our hybrid execution model reduces operational costs while maintaining professional quality.</p>
                </div>
              </div>
            </div>
          </section>

          {/* The Model Section */}
          <section className="py-24 bg-surface border-y border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-16 items-start">
                <div className="fade-in sticky top-32">
                  <h2 className="text-primary font-bold uppercase tracking-widest text-sm mb-4">The Pipeline</h2>
                  <h3 className="text-4xl md:text-5xl font-heading font-black text-slate-900 mb-8 leading-tight">
                    A Simple, Reliable, <br />Repeatable Process.
                  </h3>
                  <p className="text-lg text-slate-600 leading-relaxed mb-8">
                    Built for busy teams who need delivery without micro-management. Our workflow ensures risk prevention and performance validation.
                  </p>
                  <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-4 italic">What You Get With Every Project</h4>
                    <ul className="space-y-3 text-sm font-medium">
                      <li className="flex items-center gap-3">
                        <CheckCircle className="text-primary w-5 h-5"/> Dedicated project coordinator
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="text-primary w-5 h-5"/> Clear timelines and deliverables
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="text-primary w-5 h-5"/> Regular review meetings
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="text-primary w-5 h-5"/> Full documentation & handover
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="relative pl-8 md:pl-12 space-y-16">
                  <div className="timeline-spine absolute left-0 top-4 bottom-4 rounded-full opacity-20"></div>

                  <div className="reveal relative">
                    <div className="absolute -left-[41px] md:-left-[57px] top-0 w-6 h-6 rounded-full bg-white border-4 border-primary"></div>
                    <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-3">Phase 01</h4>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Share Your Project</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-6">
                      Tell us what you need delivered. We analyze scope, complexity, and expected outcomes to assemble the right execution team.
                    </p>
                    <a href="#contact" className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                      Submit Requirements <ArrowRight className="w-4 h-4"/>
                    </a>
                  </div>

                  <div className="reveal relative">
                    <div className="absolute -left-[41px] md:-left-[57px] top-0 w-6 h-6 rounded-full bg-white border-4 border-secondary"></div>
                    <h4 className="text-xs font-black text-secondary uppercase tracking-widest mb-3">Phase 02</h4>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Guided Execution</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">
                      Your project is handled by trained contributors monitored by expert mentors responsible for architecture, quality reviews, and performance validation.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase text-slate-400">
                      <span>Architecture</span>
                      <span>Code Reviews</span>
                      <span>Performance Validation</span>
                      <span>Risk Prevention</span>
                    </div>
                  </div>

                  <div className="reveal relative">
                    <div className="absolute -left-[41px] md:-left-[57px] top-0 w-6 h-6 rounded-full bg-white border-4 border-green-500"></div>
                    <h4 className="text-xs font-black text-green-500 uppercase tracking-widest mb-3">Phase 03</h4>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Delivery & Partnership</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      We deliver clean, tested, documented solutions. Choose between one-time delivery, ongoing support, or ongoing execution partnerships.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Hire Our Talent Section */}
          <section id="talent-hiring" className="py-24 bg-white border-b border-slate-50">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
                <div className="fade-in space-y-6">
                  <h2 className="text-primary font-bold uppercase tracking-widest text-sm">Talent Acquisition</h2>
                  <h3 className="text-3xl md:text-5xl font-heading font-black text-slate-900 leading-tight">
                    Hire Pre-Trained, <br />Industry-Ready Talent
                  </h3>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    Our community consists of carefully selected learners and early professionals who have demonstrated high learning capability, completed real mentored projects, and built verifiable work portfolios.
                  </p>
                  <ul className="space-y-4 text-sm font-semibold text-slate-700">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="text-primary"/> Documented Mentored Projects
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="text-primary"/> Structured Delivery Training
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="text-primary"/> Collaboration Discipline
                    </li>
                  </ul>
                </div>
                <div className="fade-in bg-slate-900 rounded-[3rem] p-10 md:p-12 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                  <h4 className="text-xl font-bold mb-8 italic">Roles Companies Commonly Hire For</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-10">
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-primary">Web Development</p>
                      <p className="text-xs text-slate-400">Front-End & Full-Stack Developers</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-secondary">Data & AI</p>
                      <p className="text-xs text-slate-400">AI / ML & Data Analysts</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-green-400">Security & Ops</p>
                      <p className="text-xs text-slate-400">Cybersecurity & DevOps Trainees</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-blue-400">Support & Design</p>
                      <p className="text-xs text-slate-400">Product, UI/UX & Tech Assistants</p>
                    </div>
                  </div>
                  <a href="/skillsynth#talent-request-form" className="inline-block w-full mt-12 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition shadow-lg text-center cursor-pointer">
                    Request Talent Profiles
                  </a>
                </div>
              </div>
              <div className="fade-in text-center">
                <p className="text-slate-500 font-medium italic">
                  Instead of hiring candidates who only studied theory, you hire people who already know how work actually happens.
                </p>
              </div>
            </div>
          </section>

          {/* Services Grid Section */}
          <section id="services" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="fade-in text-center mb-20">
                <h2 className="text-primary font-bold uppercase tracking-widest text-sm mb-4">Execution Menu</h2>
                <h3 className="text-3xl md:text-5xl font-heading font-black text-slate-900 mb-6 italic">Services We Offer</h3>
                <p className="text-slate-500 max-w-xl mx-auto">
                  From product development to cloud optimization, our ecosystem delivers high-precision technical results.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bento-card fade-in p-8 rounded-[3rem]">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-blue-50 text-primary rounded-xl flex items-center justify-center">
                      <Code2 className="w-5 h-5"/>
                    </div>
                    <h4 className="font-bold text-slate-900">Tech & Product</h4>
                  </div>
                  <ul className="space-y-3 text-sm text-slate-500 font-medium">
                    <li>Web & Mobile Apps</li>
                    <li>Full-stack Systems</li>
                    <li>Dashboards & Admin Panels</li>
                    <li>API Architecture</li>
                  </ul>
                </div>

                <div className="bento-card fade-in p-8 rounded-[3rem]">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                      <Server className="w-5 h-5"/>
                    </div>
                    <h4 className="font-bold text-slate-900">Cloud & DevOps</h4>
                  </div>
                  <ul className="space-y-3 text-sm text-slate-500 font-medium">
                    <li>CI/CD Pipelines</li>
                    <li>Server Automation</li>
                    <li>Containerization (Docker/K8s)</li>
                    <li>Cloud Migration</li>
                  </ul>
                </div>

                <div className="bento-card fade-in p-8 rounded-[3rem]">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-pink-50 text-secondary rounded-xl flex items-center justify-center">
                      <BrainCircuit className="w-5 h-5"/>
                    </div>
                    <h4 className="font-bold text-slate-900">AI, Data & Auto</h4>
                  </div>
                  <ul className="space-y-3 text-sm text-slate-500 font-medium">
                    <li>AI-powered Assistants</li>
                    <li>Predictive Analytics</li>
                    <li>Workflow Automation</li>
                    <li>Data Visualization</li>
                  </ul>
                </div>

                <div className="bento-card fade-in p-8 rounded-[3rem]">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                      <ShieldAlert className="w-5 h-5"/>
                    </div>
                    <h4 className="font-bold text-slate-900">Cybersecurity</h4>
                  </div>
                  <ul className="space-y-3 text-sm text-slate-500 font-medium">
                    <li>Vulnerability Checks</li>
                    <li>Security Implementation</li>
                    <li>Risk Assessment</li>
                    <li>Threat Monitoring</li>
                  </ul>
                </div>

                <div className="bento-card fade-in p-8 rounded-[3rem]">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                      <Palette className="w-5 h-5"/>
                    </div>
                    <h4 className="font-bold text-slate-900">Digital & Creative</h4>
                  </div>
                  <ul className="space-y-3 text-sm text-slate-500 font-medium">
                    <li>Branding & Strategy</li>
                    <li>SEO Optimization</li>
                    <li>Content Campaigns</li>
                    <li>High-Conversion Funnels</li>
                  </ul>
                </div>

                <div className="bento-card fade-in p-8 rounded-[3rem]">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                      <Settings2 className="w-5 h-5"/>
                    </div>
                    <h4 className="font-bold text-slate-900">Ops & Support</h4>
                  </div>
                  <ul className="space-y-3 text-sm text-slate-500 font-medium">
                    <li>Process Automation</li>
                    <li>CRM Configuration</li>
                    <li>Virtual Ops Support</li>
                    <li>Custom Workshops</li>
                  </ul>
                </div>
              </div>

              <div className="fade-in mt-12 text-center">
                <p className="text-slate-400 text-sm mb-6 italic">Requirement not listed? We design custom solutions.</p>
                <button onClick={() => scrollToSection('contact')} className="px-8 py-3.5 cursor-pointer bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition shadow-lg">
                  Discuss a Custom Requirement
                </button>
              </div>
            </div>
          </section>

          {/* Elite Community Section */}
          <section className="py-24 bg-surface border-y border-slate-100">
            <div className="max-w-7xl mx-auto px-6">
              <div className="fade-in text-center mb-16">
                <h2 className="text-primary font-bold uppercase tracking-widest text-sm mb-4">Elite Partnership</h2>
                <h3 className="text-3xl md:text-5xl font-heading font-black text-slate-900 leading-tight italic">
                  A Highly Selective Talent Ecosystem
                </h3>
              </div>
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="fade-in space-y-6">
                  <p className="text-lg text-slate-600 leading-relaxed font-medium italic">
                    Diverse Loopers operates as a quality-first ecosystem. We focus on nurturing and retaining the top-performing talent within our platform.
                  </p>
                  <p className="text-slate-500 leading-relaxed">
                    Participants are continuously evaluated on skill growth, reliability, consistency, problem-solving ability, and professionalism. Over time, we retain only those who consistently perform — building a community that represents the top performers within our ecosystem and partner network. This allows businesses to work with individuals who have proven capability, not just certificates.
                  </p>
                </div>
                <div className="fade-in grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
                    <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest text-primary mb-3">
                      Reliable Delivery
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Structured, reviewed, and milestone-based execution on every project.
                    </p>
                  </div>
                  <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
                    <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest text-secondary mb-3">
                      Innovation Edge
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Fresh approaches from emerging talent backed by senior mentoring oversight.
                    </p>
                  </div>
                  <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
                    <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest text-green-600 mb-3">
                      Long-Term Value
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Access rising talent pipelines rather than temporary freelancers.
                    </p>
                  </div>
                  <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
                    <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest text-blue-600 mb-3">
                      Flexible Models
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Pay per project, retainers, pilots, or long-term collaboration options.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="py-24 bg-white">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <h3 className="fade-in text-3xl font-heading font-bold text-slate-900 mb-12 text-center">
                Partnering FAQ
              </h3>
              <div className="fade-in space-y-4">
                <details className="group bg-surface border border-slate-100 rounded-2xl overflow-hidden">
                  <summary className="flex justify-between items-center p-6 cursor-pointer font-bold text-slate-900 select-none">
                    Is Diverse Loopers cheaper than agencies?
                    <Plus className="w-5 h-5 text-primary group-open:rotate-45 transition"/>
                  </summary>
                  <div className="px-6 pb-6 text-slate-500 text-sm leading-relaxed">
                    Yes — our hybrid execution model significantly reduces costs while maintaining high quality through expert industry review cycles.
                  </div>
                </details>

                <details className="group bg-surface border border-slate-100 rounded-2xl overflow-hidden">
                  <summary className="flex justify-between items-center p-6 cursor-pointer font-bold text-slate-900 select-none">
                    Will I have to manage students directly?
                    <Plus className="w-5 h-5 text-primary group-open:rotate-45 transition"/>
                  </summary>
                  <div className="px-6 pb-6 text-slate-500 text-sm leading-relaxed">
                    No. All work is guided, supervised, and reviewed by industry mentors and project leads who act as your primary point of contact.
                  </div>
                </details>

                <details className="group bg-surface border border-slate-100 rounded-2xl overflow-hidden">
                  <summary className="flex justify-between items-center p-6 cursor-pointer font-bold text-slate-900 select-none">
                    Can we hire the top performers?
                    <Plus className="w-5 h-5 text-primary group-open:rotate-45 transition"/>
                  </summary>
                  <div className="px-6 pb-6 text-slate-500 text-sm leading-relaxed">
                    Yes — we help businesses connect with pre-trained candidates from their project teams when hiring needs arise.
                  </div>
                </details>

                <details className="group bg-surface border border-slate-100 rounded-2xl overflow-hidden">
                  <summary className="flex justify-between items-center p-6 cursor-pointer font-bold text-slate-900 select-none text-left">
                    Is the work original and secure?
                    <Plus className="w-5 h-5 text-primary group-open:rotate-45 transition flex-shrink-0"/>
                  </summary>
                  <div className="px-6 pb-6 text-slate-500 text-sm leading-relaxed">
                    All work follows ethical practices, NDAs if needed, and original output policies to protect your intellectual property.
                  </div>
                </details>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="py-24 bg-surface">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="fade-in bg-slate-900 rounded-[3rem] md:rounded-[4rem] text-white overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="grid lg:grid-cols-2">
                  <div className="p-10 md:p-20 space-y-10">
                    <h2 className="text-3xl md:text-5xl font-heading font-black leading-tight italic">
                      Build Projects. <br />Hire Talent. <br />Grow Faster.
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed">
                      Whether you want an application delivered or need reliable emerging talent on your team, Diverse Loopers helps you build smarter and scale with confidence.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button onClick={() => setInquiryType('Project Delivery')} className="px-6 py-4 bg-primary cursor-pointer text-white rounded-2xl font-bold hover:bg-blue-600 transition shadow-lg shadow-blue-900/20">
                        Start a Project
                      </button>
                      <button onClick={() => setInquiryType('Talent Hiring')} className="px-6 py-4 bg-white cursor-pointer text-slate-900 rounded-2xl font-bold hover:bg-slate-100 transition shadow-lg shadow-slate-900/20">
                        Hire Our Talent
                      </button>
                    </div>
                  </div>
                  <div className="p-10 md:p-20 bg-white/5 flex flex-col justify-center">
                    <form id="business-contact-form" onSubmit={handleBusinessFormSubmit} className="space-y-6">
                      <div className="space-y-1">
                        <label id="biz-name-label" className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Business Unit
                        </label>
                        <input type="text" name="company_name" placeholder="Organization Name" required className="input-field" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Inquiry Type
                        </label>
                        <select id="biz-type" name="inquiry_type" required className="input-field">
                          <option value="Project Delivery">Project Delivery</option>
                          <option value="Talent Hiring">Talent Hiring / Recruitment</option>
                          <option value="Custom Partnership">Custom Partnership</option>
                        </select>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Contact Point
                          </label>
                          <input type="text" name="name" placeholder="Full Name" required className="input-field" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Official Email
                          </label>
                          <input type="email" name="email" placeholder="Work Email" required className="input-field" />
                        </div>
                      </div>
                      <button type="submit" className="w-full py-5 bg-primary text-white cursor-pointer rounded-2xl font-black text-xl hover:bg-blue-600 transition shadow-2xl shadow-blue-900/40">
                        Launch Partnership
                      </button>
                      <div id="form-message" className="hidden text-center p-4 rounded-xl text-sm font-bold mt-4 animate-pulse"></div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        {/* <footer className="bg-slate-900 text-white pt-20 pb-10 mt-auto border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 text-center sm:text-left">
              <div className="flex flex-col items-center sm:items-start">
                <img src="/Diverse Loopers Black BG (2).png" alt="Diverse Loopers" className="h-10 md:h-12 w-auto mb-6" />
                <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
                  Gateway to execution, innovation, and future-ready talent — built with integrity and structure.
                </p>
                <div className="flex gap-4">
                  <a href="https://www.linkedin.com/company/105277450" className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center hover:bg-primary transition">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                  </a>
                  <a href="https://www.instagram.com/diverseloopers/" className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center hover:bg-primary transition">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                  </a>
                </div>
              </div>
              <div className="flex flex-col items-center sm:items-start">
                <h4 className="font-bold mb-6 text-xs uppercase tracking-widest text-slate-500">Navigation</h4>
                <ul className="space-y-4 text-slate-400 text-sm">
                  <li><a href="/" className="hover:text-white transition">For Students</a></li>
                  <li><a href="/institute" className="hover:text-white transition">For Universities</a></li>
                  <li><a href="/business" className="text-primary font-bold">For Businesses</a></li>
                </ul>
              </div>
              <div className="flex flex-col items-center sm:items-start">
                <h4 className="font-bold mb-6 text-xs uppercase tracking-widest text-slate-500">Company</h4>
                <ul className="space-y-4 text-slate-400 text-sm">
                  <li><a href="/about" className="hover:text-white transition">About Us</a></li>
                  <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                </ul>
              </div>
              <div className="flex flex-col items-center sm:items-start">
                <h4 className="font-bold mb-6 text-xs uppercase tracking-widest text-slate-500">Contact</h4>
                <p className="text-sm text-slate-400 italic">contact@diverseloopers.com</p>
                <p className="text-sm text-slate-400 italic mt-2">+91 98393 50961</p>
              </div>
            </div>
            <div className="pt-10 border-t border-white/5 text-center text-[10px] md:text-xs text-slate-500">
              &copy; 2024 Diverse Loopers Inc. Your Gateway to Talent, Innovation & Results.
            </div>
          </div>
        </footer> */}
        <Footer/>
      </div>
    </>
  )
}