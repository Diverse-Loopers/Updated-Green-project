'use client'

import { useEffect, useState, useRef } from 'react'
import Script from 'next/script'
import Footer from '@/components/ui/Footer'
import './institute.css'
import { initInstitutePage, handleUniversityFormSubmit, setPartnershipModel, scrollToSection } from '@/lib/pages/institute'
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle,
  Coins,
  Menu,
  Plus,
  ShieldCheck,
  Users,
  Mail,
  Calendar,
  Briefcase,
  Heart,
  FolderCheck,
  Building2,
  Star,
  GraduationCap,
  Award,
  UserPlus,
  UserCheck,
  Compass,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Hammer,
  LucideGem,
  School,
  Layers,
  Globe,
  MapPin,
  ChevronRight,
  Lightbulb,
  BadgeCheck,
  Phone
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function InstitutePage() {
  const [countersAnimated, setCountersAnimated] = useState(false)
  const [activeModel, setActiveModel] = useState('Department Pilot')
  const statsRef = useRef(null)

  useEffect(() => {
    initInstitutePage()

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
  }, [])

  // Animated counters on intersection
  useEffect(() => {
    if (!statsRef.current || countersAnimated) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setCountersAnimated(true)
        obs.disconnect()
      }
    }, { threshold: 0.3 })
    obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [countersAnimated])

  // Scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible')
      })
    }, { threshold: 0.1 })
    document.querySelectorAll('.fade-in, .reveal').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const AnimatedCounter = ({ target, suffix }) => {
    const [count, setCount] = useState(0)
    useEffect(() => {
      if (!countersAnimated) return
      let start = 0
      const dur = 2000
      const step = Math.ceil(target / (dur / 16))
      const timer = setInterval(() => {
        start += step
        if (start >= target) {
          setCount(target)
          clearInterval(timer)
        } else {
          setCount(start)
        }
      }, 16)
      return () => clearInterval(timer)
    }, [countersAnimated, target])
    return <>{count}{suffix}</>
  }

  const sectors = [
    'Engineering Institutes',
    'Business & Management Schools',
    'University Innovation Cells',
    'Autonomous Colleges',
    'Technical Universities',
    'Polytechnics & Skill Hubs',
    'Research & Incubation Centers'
  ]

  const stats = [
    { label: 'Portfolios Built From Day 1', value: 72, suffix: '%', Icon: FolderCheck },
    { label: 'Startup & Industry Partners', value: 38, suffix: '+', Icon: Building2 },
    { label: 'Student Engagement Rate', value: 94, suffix: '%', Icon: Heart },
    { label: 'Academic Collaborations', value: 15, suffix: '+', Icon: GraduationCap }
  ]

  const models = [
    {
      id: 'Department Pilot',
      title: 'Department Pilot Model',
      tag: 'Quick Launch (6 Mo)',
      desc: 'Targeted integration for specific computer science, data, electronics, or management branches to quickly validate practical outcomes.',
      features: ['Curriculum alignment with live sprints', 'Industry mentor masterclasses', 'Demo portfolio building from day 1', 'Dedicated department coordinator']
    },
    {
      id: 'Innovation Lab',
      title: 'Innovation & Prototyping Lab',
      tag: 'Hands-On Hub',
      desc: 'Establish a cutting-edge experiential learning zone on campus where students build production-grade web, AI, cloud, and mobile apps.',
      features: ['Modern tech stack sandboxes', 'Hackathon & sprint hosting', 'Expert code & architecture reviews', 'Startup incubation support']
    },
    {
      id: 'Joint Certification',
      title: 'Joint Certification Program',
      tag: 'Credential Sprints',
      desc: 'Offer industry-verified skill tracks alongside regular degree coursework, giving students verified digital credentials recognized by employers.',
      features: ['Co-branded industry certificates', 'Portfolio validation & scoring', 'Capstone project evaluation', 'Direct recruiter pipeline']
    },
    {
      id: 'Full-University Integration',
      title: 'Campus-Wide Integration',
      tag: 'Comprehensive Model',
      desc: 'End-to-end transformation across engineering, management, and science faculties to build a unified experiential ecosystem.',
      features: ['Multi-department roadmap', 'Faculty enablement & co-teaching', 'Year-round placement pipeline', 'Alumni & employer networking']
    },
    {
      id: 'Custom Framework',
      title: 'Custom Institutional Framework',
      tag: 'Bespoke Roadmap',
      desc: 'A tailored academic model designed specifically around your university vision, accreditation goals (NAAC/NBA), and campus milestones.',
      features: ['Customized learning outcomes', 'Institutional legacy building', 'Research & patent assistance', 'Executive board reporting']
    }
  ]

  return (
    <>
      {/* Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@600;700;800;900&family=Playfair+Display:wght@700;800;900&display=swap"
        rel="stylesheet"
      />

      {/* Lucide Icons */}
      <Script src="https://unpkg.com/lucide@latest" strategy="afterInteractive" onLoad={() => {
        if (typeof window !== 'undefined' && window.lucide) {
          window.lucide.createIcons()
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
                {/* Audience switcher pill */}
                <div className="flex space-x-1 p-1 bg-slate-100 rounded-full text-xs font-semibold mr-4">
                  <a href="/" className="px-4 py-1.5 text-slate-500 hover:text-slate-700 transition">Students</a>
                  <a href="/institute" className="px-4 py-1.5 bg-white text-green-600 rounded-full shadow-sm font-bold">Universities</a>
                  <a href="/business" className="px-4 py-1.5 text-slate-500 hover:text-slate-700 transition">Businesses</a>
                </div>

                <a href="/" className="text-slate-600 hover:text-green-600 font-medium transition text-sm">Home</a>
                <a href="#philosophy" className="text-slate-600 hover:text-green-600 font-medium transition text-sm">Philosophy</a>
                <a href="#blueprint" className="text-slate-600 hover:text-green-600 font-medium transition text-sm">Blueprint</a>
                <a href="#partnership-models" className="text-slate-600 hover:text-green-600 font-medium transition text-sm">Models</a>
                <a href="#comparison" className="text-slate-600 hover:text-green-600 font-medium transition text-sm">Why Us</a>
                <a href="#faq" className="text-slate-600 hover:text-green-600 font-medium transition text-sm">FAQ</a>
              </div>

              <div className="hidden md:flex items-center gap-4">
                <a
                  href="#contact"
                  className="px-6 py-2.5 bg-green-600 text-white rounded-full font-bold text-sm hover:bg-green-700 transition shadow-lg shadow-green-100 flex items-center gap-2"
                >
                  Become a Partner <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <button id="mobile-menu-toggle" className="md:hidden p-2 text-slate-600">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div id="mobile-menu" className="hidden md:hidden bg-white border-b border-slate-100 p-6 space-y-4 shadow-xl">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl text-center mb-4">
              <a href="/" className="flex-1 py-2 text-slate-500 text-xs font-bold">Students</a>
              <a href="/institute" className="flex-1 py-2 bg-white text-green-600 rounded-lg text-xs font-bold shadow-sm">Universities</a>
              <a href="/business" className="flex-1 py-2 text-slate-500 text-xs font-bold">Businesses</a>
            </div>
            <a href="/" className="block font-bold py-2 text-slate-800">Home</a>
            <a href="#philosophy" className="block font-bold py-2 text-slate-800">Philosophy</a>
            <a href="#blueprint" className="block font-bold py-2 text-slate-800">The Blueprint</a>
            <a href="#partnership-models" className="block font-bold py-2 text-slate-800">Partnership Models</a>
            <a href="#comparison" className="block font-bold py-2 text-slate-800">Why Us</a>
            <a href="#faq" className="block font-bold py-2 text-slate-800">FAQ</a>
            <a href="#contact" className="block py-4 bg-green-600 text-white text-center rounded-2xl font-bold shadow-lg">
              Partner With Us
            </a>
          </div>
        </nav>

        <main className="flex-grow">
          {/* ================= HERO SECTION (Coursera/Business Split Layout) ================= */}
          <section id="hero-section" className="hero-gradient relative pt-32 pb-20 overflow-hidden">
            <canvas id="hero-canvas" className="hero-canvas"></canvas>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <div className="space-y-6">
                  <span className="fade-in inline-block py-1.5 px-4 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-bold tracking-widest uppercase">
                    Academic Transformation &amp; Impact
                  </span>
                  <h1 className="fade-in text-4xl md:text-5xl lg:text-6xl font-heading font-black text-slate-900 leading-tight">
                    Build Graduates Who Don't Just Graduate —{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600">
                      They Lead.
                    </span>
                  </h1>
                  <p className="fade-in text-lg text-slate-600 leading-relaxed max-w-lg">
                    Higher education is at a turning point. Industries are evolving faster than curricula. Partner with
                    Diverse Loopers to build an application-driven ecosystem where student learning is proof-based and placement-ready.
                  </p>

                  {/* Feature Checkmarks */}
                  <div className="fade-in space-y-3">
                    {[
                      'Curriculum enrichment with live business projects',
                      'Pre-trained talent ready for industry requirements',
                      'End-to-end outcome delivery with expert mentorship'
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-sm font-semibold text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Hero Buttons */}
                  <div className="fade-in flex flex-wrap items-center gap-3 pt-2">
                    <a
                      href="#contact"
                      className="hero-btn-primary px-8 py-3.5 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition shadow-md shadow-green-200 flex items-center gap-2"
                    >
                      Partner With Us <ArrowRight className="w-4 h-4" />
                    </a>
                    <a
                      href="/skillsynth"
                      className="hero-btn-secondary px-8 py-3.5 bg-white text-slate-700 border border-slate-200 rounded-lg font-bold text-sm hover:border-green-600 hover:text-green-600 transition"
                    >
                      Our Top Performers
                    </a>
                    <button
                      onClick={() => scrollToSection('blueprint')}
                      className="hero-btn-secondary px-8 py-3.5 bg-green-50 text-green-700 border border-green-200 rounded-lg font-bold text-sm hover:bg-green-100 transition"
                    >
                      Explore Blueprint ↓
                    </button>
                  </div>
                </div>

                {/* Right Media Card with Floating Stat Badges */}
                <div className="fade-in hidden lg:block relative">
                  <div className="hero-image-wrapper rounded-3xl overflow-hidden shadow-2xl shadow-green-100/50 border border-white/50 relative">
                    <img
                      src="/images/campus-life.png"
                      alt="University students collaborating on real projects"
                      className="w-full h-auto object-cover max-h-[460px]"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = '/images/business/hero-team.png'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <p className="text-xs font-bold uppercase tracking-widest text-green-400 mb-1">Campus Innovation Hub</p>
                      <h4 className="text-lg font-bold">Turning Campuses Into High-Performance Tech Incubators</h4>
                    </div>
                  </div>

                  {/* Floating Badges */}
                  <div className="hero-float-badge" style={{ top: '-15px', right: '-15px' }}>
                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center font-bold">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Proof-Based Learning</p>
                      <p className="text-[10px] text-slate-500">100% Verifiable Work</p>
                    </div>
                  </div>

                  <div className="hero-float-badge" style={{ bottom: '40px', left: '-25px' }}>
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">50+ Startup Sprints</p>
                      <p className="text-[10px] text-slate-500">Mentored by Practitioners</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================= MARQUEE: WHO WE WORK WITH ================= */}
          <section className="py-12 bg-white border-y border-slate-100">
            <div className="max-w-7xl mx-auto px-6">
              <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">
                Empowering Higher Education Across Every Domain
              </p>
              <div className="partner-marquee">
                <div className="marquee-track">
                  {[...sectors, ...sectors].map((sec, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-full flex-shrink-0"
                    >
                      <School className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-bold text-slate-700 tracking-wide">{sec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ================= WHY UNIVERSITIES NEED THIS NOW ================= */}
          <section className="py-24 bg-surface">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="fade-in space-y-6">
                  <span className="text-green-600 font-bold uppercase tracking-widest text-sm">The Industry Shift</span>
                  <h2 className="text-3xl md:text-5xl font-heading font-black text-slate-900 leading-tight">
                    Why Universities Need This Model Now
                  </h2>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    Universities worldwide face a common inflection point: recruiters no longer hire based on marks or certifications alone. They demand verifiable portfolios, active problem-solving skills, and collaboration experience.
                  </p>
                  <p className="text-slate-500 leading-relaxed">
                    Diverse Loopers does not replace existing faculty or syllabi — we strengthen the academic ecosystem with live industry sprints, automated tooling, and mentor feedback loops.
                  </p>
                </div>

                <div className="fade-in grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bento-card p-6 rounded-[2rem]">
                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-4">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-900 mb-2">The Capability Gap</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Traditional coursework moves slower than rapid tech shifts in AI, Full Stack, and Cloud architecture.
                    </p>
                  </div>

                  <div className="bento-card p-6 rounded-[2rem]">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-900 mb-2">Outcome Acceleration</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Transform students from theoretical learners to productive contributors before graduation.
                    </p>
                  </div>

                  <div className="bento-card p-6 rounded-[2rem]">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-900 mb-2">Placement Quality</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Boost institutional hiring conversion rates with candidate profiles backed by real codebases.
                    </p>
                  </div>

                  <div className="bento-card p-6 rounded-[2rem]">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                      <Award className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-900 mb-2">Campus Reputation</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Position your college as a forward-thinking, future-ready institution attracting top applicants.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================= OUR PHILOSOPHY (3 Bento Pillars) ================= */}
          <section id="philosophy" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="fade-in text-center mb-20">
                <h2 className="text-green-600 font-bold uppercase tracking-widest text-sm mb-4">Our Philosophy</h2>
                <h3 className="text-3xl md:text-5xl font-heading font-black text-slate-900 mb-6">
                  Why Diverse Loopers Exists
                </h3>
                <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
                  Diverse Loopers is a business and education ecosystem that blends real-world project execution, career pathways, and applied learning environments.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Pillar 1 */}
                <div className="bento-card fade-in p-8 md:p-10 rounded-[2.5rem]">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8">
                    <LucideGem className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-4">Skill is the New Academic Currency</h4>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6">
                    Degrees validate conceptual knowledge; skills validate real execution capability. We ensure students graduate as contributors, not trainees.
                  </p>
                  <ul className="space-y-3 text-xs font-semibold text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" /> Verifiable Git portfolios
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" /> Real industry exposure
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" /> Demonstrable outcomes
                    </li>
                  </ul>
                </div>

                {/* Pillar 2 */}
                <div className="bento-card fade-in p-8 md:p-10 rounded-[2.5rem]">
                  <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-8">
                    <Hammer className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-4">Industry Must Shape, Not Observe</h4>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6">
                    Industry leaders shouldn't just be occasional guest speakers. We embed active engineering practitioners directly into the students' weekly review cycles.
                  </p>
                  <ul className="space-y-3 text-xs font-semibold text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600" /> Active industry mentors
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600" /> Live sprint assignments
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600" /> Continuous feedback loops
                    </li>
                  </ul>
                </div>

                {/* Pillar 3 */}
                <div className="bento-card fade-in p-8 md:p-10 rounded-[2.5rem]">
                  <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-8">
                    <BarChart3 className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-4">Education Must Show Measurable ROI</h4>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6">
                    Institutional excellence is proven by employability, student confidence, and placement velocity. We provide data-driven dashboards to track growth.
                  </p>
                  <ul className="space-y-3 text-xs font-semibold text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" /> Placement performance
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" /> Internship conversion quality
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" /> Transparent competency scores
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* ================= THE BLUEPRINT (3-Phase Pipeline) ================= */}
          <section id="blueprint" className="py-24 bg-surface border-y border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-16 items-start">
                <div className="fade-in lg:sticky lg:top-32">
                  <h2 className="text-green-600 font-bold uppercase tracking-widest text-sm mb-4">The Blueprint</h2>
                  <h3 className="text-4xl md:text-5xl font-heading font-black text-slate-900 mb-8 leading-tight">
                    We Co-Design <br />Academic Ecosystems.
                  </h3>
                  <p className="text-lg text-slate-600 leading-relaxed mb-8">
                    Our partnership is structured across three milestone stages. We don't drop generic pre-recorded videos; we co-create with your faculty and academic vision.
                  </p>

                  <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-4 italic">What You Get With Every Partnership</h4>
                    <ul className="space-y-3 text-sm font-medium">
                      <li className="flex items-center gap-3">
                        <CheckCircle className="text-green-600 w-5 h-5 flex-shrink-0" /> Dedicated Academic Coordinator
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="text-green-600 w-5 h-5 flex-shrink-0" /> Hands-On Innovation Labs &amp; Sprints
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="text-green-600 w-5 h-5 flex-shrink-0" /> Regular Industry Review Meetings
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="text-green-600 w-5 h-5 flex-shrink-0" /> Semester Portfolio Scoring &amp; Placement Pipeline
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Right Timeline */}
                <div className="relative pl-8 md:pl-12 space-y-16">
                  <div className="timeline-spine absolute left-0 top-4 bottom-4 rounded-full opacity-25"></div>

                  <div className="reveal relative">
                    <div className="absolute -left-[41px] md:-left-[57px] top-0 w-6 h-6 rounded-full bg-white border-4 border-green-600 shadow-md"></div>
                    <span className="text-xs font-black text-green-600 uppercase tracking-widest mb-3 block">Phase 01</span>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Co-Creation &amp; Integration (6 Months)</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">
                      Embed hands-on capability into the academic foundation without disrupting regular timetables.
                    </p>
                    <ul className="space-y-2 text-xs font-semibold text-slate-600">
                      <li className="flex items-center gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-green-600" /> Map curriculum against live market demands
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-green-600" /> Introduce sandbox developer labs and AI tools
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-green-600" /> Enable faculty to collaborate with industry mentors
                      </li>
                    </ul>
                  </div>

                  <div className="reveal relative">
                    <div className="absolute -left-[41px] md:-left-[57px] top-0 w-6 h-6 rounded-full bg-white border-4 border-emerald-500 shadow-md"></div>
                    <span className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-3 block">Phase 02</span>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Pilot Execution &amp; Impact (12 Months)</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">
                      Validate learning outcomes through demonstrable student codebases and client deliverables.
                    </p>
                    <ul className="space-y-2 text-xs font-semibold text-slate-600">
                      <li className="flex items-center gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-600" /> Assign real startup &amp; business project sprints
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-600" /> Conduct weekend masterclasses and code reviews
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-600" /> Activate internship &amp; placement pipeline
                      </li>
                    </ul>
                  </div>

                  <div className="reveal relative">
                    <div className="absolute -left-[41px] md:-left-[57px] top-0 w-6 h-6 rounded-full bg-white border-4 border-teal-600 shadow-md"></div>
                    <span className="text-xs font-black text-teal-600 uppercase tracking-widest mb-3 block">Phase 03</span>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Institutional Legacy &amp; Scale (Ongoing)</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">
                      Transform your institution into a nationally recognized beacon for applied technical excellence.
                    </p>
                    <ul className="space-y-2 text-xs font-semibold text-slate-600">
                      <li className="flex items-center gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-teal-600" /> Expand framework across all departments &amp; branches
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-teal-600" /> Establish permanent campus innovation labs
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-teal-600" /> Boost accreditation (NAAC/NBA) and university rankings
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================= VALUE PROPOSITION: UNIVERSITIES VS STUDENTS ================= */}
          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="fade-in text-center mb-16">
                <h2 className="text-green-600 font-bold uppercase tracking-widest text-sm mb-4">Mutual Growth</h2>
                <h3 className="text-3xl md:text-5xl font-heading font-black text-slate-900">
                  What Our Ecosystem Delivers
                </h3>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* For Universities */}
                <div className="bento-card fade-in p-8 md:p-12 rounded-[2.5rem]">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-slate-900">What Universities Gain</h4>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Institutional Advantages</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-green-50 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-slate-900 font-bold text-base">Future-Ready Graduates</p>
                        <p className="text-sm text-slate-500">Students with demonstrable live project portfolios that impress top hiring managers.</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-green-50 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-slate-900 font-bold text-base">Accreditation &amp; Reputation</p>
                        <p className="text-sm text-slate-500">Strengthen NAAC, NBA, and NIRF criteria for industry collaboration, research, and placement.</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-green-50 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                        <UserPlus className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-slate-900 font-bold text-base">Faculty Empowerment</p>
                        <p className="text-sm text-slate-500">Faculty upskilling with modern toolchains, cloud credits, and co-teaching support.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* For Students */}
                <div className="bento-card fade-in p-8 md:p-12 rounded-[2.5rem]">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-slate-900">What Students Gain</h4>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Learner Benefits</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-slate-900 font-bold text-base">Guided Practitioner Mentorship</p>
                        <p className="text-sm text-slate-500">Exposure to modern frameworks, code reviews, and enterprise architectural standards.</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                        <Coins className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-slate-900 font-bold text-base">Hybrid Hustle Access</p>
                        <p className="text-sm text-slate-500">Opportunities to earn while learning through verified business and freelance project pathways.</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                        <Compass className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-slate-900 font-bold text-base">Career Clarity &amp; Confidence</p>
                        <p className="text-sm text-slate-500">Students graduate with direction, a demonstrable track record, and zero interview anxiety.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================= ANIMATED STATS COUNTERS ================= */}
          <section ref={statsRef} className="stats-counter-section py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((s, i) => {
                  const Icon = s.Icon
                  return (
                    <div key={i} className="stat-counter-card fade-in">
                      <Icon className="w-8 h-8 text-green-400 mx-auto mb-3" />
                      <div className="stat-counter-num">
                        <AnimatedCounter target={s.value} suffix={s.suffix} />
                      </div>
                      <div className="stat-counter-label">{s.label}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* ================= PARTNERSHIP MODELS ================= */}
          <section id="partnership-models" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="fade-in text-center mb-16">
                <h2 className="text-green-600 font-bold uppercase tracking-widest text-sm mb-4">Flexible Structures</h2>
                <h3 className="text-3xl md:text-5xl font-heading font-black text-slate-900 mb-4">
                  Partnership Models
                </h3>
                <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
                  Choose the model that fits your institutional timeline, department objectives, and student cohort size.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {models.map((m, i) => (
                  <div
                    key={m.id}
                    className={`bento-card fade-in p-8 rounded-[2.5rem] flex flex-col justify-between ${
                      i === 4 ? 'md:col-span-2 lg:col-span-2' : ''
                    }`}
                  >
                    <div>
                      <span className="inline-block px-3 py-1 bg-green-50 text-green-700 text-[11px] font-bold uppercase rounded-full mb-4">
                        {m.tag}
                      </span>
                      <h4 className="text-xl font-bold text-slate-900 mb-3">{m.title}</h4>
                      <p className="text-sm text-slate-500 leading-relaxed mb-6">{m.desc}</p>
                      <ul className="space-y-2 mb-8">
                        {m.features.map((feat, fi) => (
                          <li key={fi} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            {feat}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      onClick={() => setPartnershipModel(m.title)}
                      className="w-full py-3 bg-slate-50 hover:bg-green-600 hover:text-white text-slate-700 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 border border-slate-200 hover:border-green-600"
                    >
                      Select This Model <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ================= PROVEN CASE STUDY ================= */}
          <section className="py-24 bg-surface">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm fade-in">
                <div className="h-1.5 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500" />
                <div className="p-8 md:p-12">
                  <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-green-700 bg-green-50 border border-green-200 px-4 py-1.5 rounded-full mb-4">
                    Documented Success Story
                  </span>
                  <h3 className="text-2xl md:text-3xl font-heading font-black text-slate-900 mb-3 leading-snug">
                    Case Study: Department Pilot Deployment
                  </h3>
                  <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-8">
                    Within one year of integrating Diverse Loopers' hybrid sprint curriculum, our partner engineering institute recorded breakthrough outcomes:
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                      <p className="text-3xl md:text-4xl font-black text-green-700 leading-none mb-1">72%</p>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-green-600 leading-snug">Portfolios Built</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center">
                      <p className="text-3xl md:text-4xl font-black text-blue-600 leading-none mb-1">38+</p>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-blue-500 leading-snug">Startup Sprints</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
                      <p className="text-3xl md:text-4xl font-black text-emerald-700 leading-none mb-1">↑ 45%</p>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 leading-snug">Internship Rate</p>
                    </div>
                    <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 text-center">
                      <p className="text-3xl md:text-4xl font-black text-teal-700 leading-none mb-1">4.9 ★</p>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-teal-600 leading-snug">Student Rating</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 mb-8">
                    {[
                      'Students built deployable software from semester one',
                      '38+ enterprise client requirements delivered with mentorship',
                      'High placement conversion across tier-1 technology firms',
                      'Zero friction with existing curriculum & semester exams'
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                        <div className="w-5 h-5 bg-green-600 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5">
                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                        </div>
                        <p className="text-xs md:text-sm font-semibold text-slate-700 leading-snug">{item}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-900 rounded-2xl p-6 flex items-start gap-4">
                    <div className="w-1 h-12 bg-green-500 rounded-full flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-300 italic leading-relaxed">
                      "The most impactful shift was seeing students stop asking{' '}
                      <span className="text-white not-italic font-semibold">'What should I memorize?'</span> and start asking{' '}
                      <span className="text-green-400 not-italic font-semibold">'What can I build?'</span>"
                      <span className="block text-xs text-slate-400 not-italic font-bold mt-2">— Academic Dean, Technical Partner University</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================= HOW WE COMPARE TABLE ================= */}
          <section id="comparison" className="py-24 bg-white border-y border-slate-100">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="fade-in text-center mb-16">
                <h2 className="text-green-600 font-bold uppercase tracking-widest text-sm mb-4">Why Diverse Loopers</h2>
                <h3 className="text-3xl md:text-5xl font-heading font-black text-slate-900">
                  How We Compare
                </h3>
              </div>

              <div className="fade-in overflow-x-auto">
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th>Key Feature</th>
                      <th className="highlight">Diverse Loopers Model</th>
                      <th>Traditional Guest Lectures</th>
                      <th>Generic Online MOOCs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Real Client Projects', 'Yes (Supervised)', 'No (Talks Only)', 'No (Dummy Exercises)'],
                      ['Industry Mentorship', 'Weekly Code Reviews', 'One-time Seminars', 'Automated / None'],
                      ['Verifiable Portfolio', 'Yes (Live Deployments)', 'No', 'Certificate Only'],
                      ['Student Earning Pathways', 'Yes (Hybrid Hustle)', 'No', 'No'],
                      ['Campus Placement Pipeline', 'Direct Tech Recruiter Connect', 'Dependent on Placement Cell', 'None'],
                      ['Faculty Collaboration', 'Active Co-teaching & Labs', 'Passive', 'None'],
                      ['Institutional ROI', 'Measurable Hiring Velocity', 'Low', 'Low']
                    ].map(([feat, us, legacy, mooc], i) => (
                      <tr key={i}>
                        <td>{feat}</td>
                        <td className="highlight">{us}</td>
                        <td>{legacy}</td>
                        <td>{mooc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ================= PARTNERSHIP FAQ ================= */}
          <section id="faq" className="py-24 bg-surface">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <h3 className="fade-in text-3xl font-heading font-bold text-slate-900 mb-12 text-center">
                Frequently Asked Questions
              </h3>
              <div className="fade-in space-y-4">
                <details className="group bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <summary className="flex justify-between items-center p-6 cursor-pointer font-bold text-slate-900 select-none">
                    Is Diverse Loopers replacing faculty or regular syllabi?
                    <Plus className="w-5 h-5 text-green-600 group-open:rotate-45 transition" />
                  </summary>
                  <div className="px-6 pb-6 text-slate-500 text-sm leading-relaxed">
                    No. We strengthen your existing structures and collaborate directly with faculty. We align practical industry modules and code sprints with your regular semester subjects to make them experiential.
                  </div>
                </details>

                <details className="group bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <summary className="flex justify-between items-center p-6 cursor-pointer font-bold text-slate-900 select-none">
                    Do students have to pay individually?
                    <Plus className="w-5 h-5 text-green-600 group-open:rotate-45 transition" />
                  </summary>
                  <div className="px-6 pb-6 text-slate-500 text-sm leading-relaxed">
                    Partnership models are flexible: some are institution-funded, some are co-sponsored through innovation grants, and others are elective student-led tracks. We customize the framework to your university budget.
                  </div>
                </details>

                <details className="group bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <summary className="flex justify-between items-center p-6 cursor-pointer font-bold text-slate-900 select-none">
                    Does this program guarantee placements?
                    <Plus className="w-5 h-5 text-green-600 group-open:rotate-45 transition" />
                  </summary>
                  <div className="px-6 pb-6 text-slate-500 text-sm leading-relaxed">
                    We avoid empty marketing promises. Instead, we build verifiable capability, provide direct introductions to our corporate partner network, and give students documented portfolios that dramatically increase interview conversion rates.
                  </div>
                </details>

                <details className="group bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <summary className="flex justify-between items-center p-6 cursor-pointer font-bold text-slate-900 select-none">
                    Can non-engineering or management streams participate?
                    <Plus className="w-5 h-5 text-green-600 group-open:rotate-45 transition" />
                  </summary>
                  <div className="px-6 pb-6 text-slate-500 text-sm leading-relaxed">
                    Yes. We run tracks for MBA / Management, Design / UX, Data Analytics, and multidisciplinary programs by focusing on problem-solving outcomes rather than purely coding.
                  </div>
                </details>
              </div>
            </div>
          </section>

          {/* ================= INVITATION TO PARTNER / CONTACT FORM ================= */}
          <section id="contact" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="fade-in bg-slate-900 rounded-[3rem] md:rounded-[4rem] text-white overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="grid lg:grid-cols-2">
                  {/* Left Invitation Info */}
                  <div className="p-10 md:p-16 lg:p-20 space-y-8 flex flex-col justify-between">
                    <div>
                      <span className="text-green-400 font-bold uppercase tracking-widest text-xs mb-3 block">
                        Academic Leadership Invitation
                      </span>
                      <h2 className="text-3xl md:text-5xl font-heading font-black leading-tight">
                        An Invitation <br />to Partner &amp; Lead.
                      </h2>
                      <p className="text-slate-300 text-base md:text-lg leading-relaxed mt-6">
                        Not as vendors. Not as generic course providers. But as co-creators of a modern, proof-based academic paradigm. Let's design the future of higher education together.
                      </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-800">
                      <div className="flex items-center gap-4 text-slate-300 text-sm font-medium">
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-green-400">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Official Partnership Desk</p>
                          <a href="mailto:contact@diverseloopers.com" className="hover:text-green-400 transition font-bold">
                            contact@diverseloopers.com
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-slate-300 text-sm font-medium">
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-green-400">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Direct Academic Hotline</p>
                          <a href="tel:+919839350961" className="hover:text-green-400 transition font-bold">
                            +91 98393 50961
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Form */}
                  <div className="p-10 md:p-16 lg:p-20 bg-white/5 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-white/10">
                    <form id="uni-contact-form" onSubmit={handleUniversityFormSubmit} className="space-y-5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Institution Name *
                        </label>
                        <input
                          type="text"
                          name="university_name"
                          placeholder="University / Engineering College / Institute"
                          required
                          className="input-field"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Preferred Partnership Model
                        </label>
                        <select id="partnership-model-select" name="partnership_model" className="input-field">
                          <option value="Department Pilot">Department Pilot Model (6 Months)</option>
                          <option value="Innovation Lab">Innovation &amp; Prototyping Lab</option>
                          <option value="Joint Certification">Joint Certification Program</option>
                          <option value="Full-University Integration">Campus-Wide Integration</option>
                          <option value="Custom Framework">Custom Institutional Roadmap</option>
                        </select>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Contact Person *
                          </label>
                          <input
                            type="text"
                            name="contact_person"
                            placeholder="Full Name"
                            required
                            className="input-field"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Designation *
                          </label>
                          <input
                            type="text"
                            name="designation"
                            placeholder="e.g. Dean / Principal / TPO"
                            required
                            className="input-field"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Official Email *
                          </label>
                          <input
                            type="email"
                            name="email"
                            placeholder="admin@univ.edu"
                            required
                            className="input-field"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            placeholder="+91 ..."
                            required
                            className="input-field"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Inquiry / Goals for Students
                        </label>
                        <textarea
                          name="message"
                          rows={3}
                          placeholder="How many students would you like to enroll in practical sprints?"
                          className="input-field resize-none"
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-lg transition shadow-2xl shadow-green-900/40 cursor-pointer flex items-center justify-center gap-2"
                      >
                        Launch Academic Partnership <ArrowRight className="w-5 h-5" />
                      </button>

                      <div id="uni-message" className="hidden text-center p-4 rounded-xl text-sm font-bold mt-4"></div>
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
  )
}