'use client';

import { useState, useEffect } from 'react';
import './skillsynth.css';
import Script from 'next/script';
import {
    loadAchievers,
    loadEvents,
    submitHiringInquiry,
    getIconForEvent,
    initializeIntersectionObserver
} from '@/lib/pages/skillsynth';

export default function CommunityPage() {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [achievers, setAchievers] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formMessage, setFormMessage] = useState({ show: false, text: '', type: '' });
    const [formData, setFormData] = useState({
        company_name: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        role_requirement: '',
        hiring_type: 'Internship',
        preferred_skills: '',
        notes: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            const achieversResult = await loadAchievers();
            if (achieversResult.success) {
                setAchievers(achieversResult.achievers);
            }

            const eventsResult = await loadEvents();
            if (eventsResult.success) {
                setEvents(eventsResult.events);
            }

            setLoading(false);
        };

        fetchData();
    }, []);

    useEffect(() => {
        // Initialize Lucide icons and intersection observer
        const timer = setTimeout(() => {
            if (typeof window !== 'undefined' && window.lucide) {
                window.lucide.createIcons();
            }
            initializeIntersectionObserver();
        }, 100);

        return () => clearTimeout(timer);
    });

    const handleInputChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        setFormMessage({
            show: true,
            text: 'Processing talent request...',
            type: 'loading'
        });

        const result = await submitHiringInquiry(formData);

        if (result.success) {
            setFormMessage({
                show: true,
                text: 'Success! Our talent team will contact you shortly.',
                type: 'success'
            });
            setFormData({
                company_name: '',
                contact_name: '',
                contact_email: '',
                contact_phone: '',
                role_requirement: '',
                hiring_type: 'Internship',
                preferred_skills: '',
                notes: ''
            });
        } else {
            setFormMessage({
                show: true,
                text: 'Submission failed. Please check connection.',
                type: 'error'
            });
        }
    };

    const getEventStatus = (dateString) => {
        const eventDate = new Date(dateString);
        const now = new Date();
        const isPassed = eventDate < now;

        return isPassed
            ? <span className="px-3 py-1 bg-red-50 text-red-600 text-[9px] font-bold rounded-lg uppercase tracking-wider">Passed</span>
            : <span className="px-3 py-1 bg-green-50 text-green-600 text-[9px] font-bold rounded-lg uppercase tracking-wider">Upcoming</span>;
    };

    const formatEventDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <>

            <Script src="https://unpkg.com/lucide@latest" strategy="afterInteractive" onLoad={() => {
                if (window.lucide) window.lucide.createIcons();
            }} />

            <div className="font-sans text-slate-700 bg-white min-h-screen flex flex-col scroll-smooth overflow-x-hidden">
                {/* Navigation */}
                <nav className="fixed top-0 w-full z-50 glass-nav bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-20">
                            <a href="/" className="flex-shrink-0 flex items-center gap-2">
                                <img src="/DIVERSE LOOPERS (1) bg.png" alt="Diverse Loopers" className="h-10 md:h-12 w-auto" />
                            </a>

                            <div className="hidden md:flex items-center space-x-8">
                                <a href="/" className="text-slate-600 hover:text-primary font-medium transition text-sm">Home</a>
                                <a href="#wall-of-fame" className="text-slate-600 hover:text-primary font-medium transition text-sm">Wall of Fame</a>
                                <a href="#events" className="text-slate-600 hover:text-primary font-medium transition text-sm">Events</a>
                                <a href="#hire-talent" className="text-slate-600 hover:text-primary font-medium transition text-sm">Hire Talent</a>
                                <div className="flex items-center gap-4 border-l border-slate-200 pl-8">
                                    <a href="#hiring-form" className="px-6 py-2.5 bg-primary text-white rounded-full font-bold text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">Request Consultation</a>
                                </div>
                            </div>

                            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden p-2 text-slate-600">
                                <i data-lucide="menu"></i>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {showMobileMenu && (
                        <div className="md:hidden bg-white border-b border-slate-100 p-6 space-y-4 shadow-xl text-center">
                            <a href="/" className="block font-bold" onClick={() => setShowMobileMenu(false)}>Home</a>
                            <a href="#wall-of-fame" className="block font-bold" onClick={() => setShowMobileMenu(false)}>Wall of Fame</a>
                            <a href="#events" className="block font-bold" onClick={() => setShowMobileMenu(false)}>Events</a>
                            <a href="#hire-talent" className="block font-bold" onClick={() => setShowMobileMenu(false)}>Hire Talent</a>
                            <a href="#hiring-form" className="block py-4 bg-primary text-white rounded-2xl font-bold" onClick={() => setShowMobileMenu(false)}>Request Consultation</a>
                        </div>
                    )}
                </nav>

                <main className="flex-grow">
                    {/* Hero Section */}
                    <section className="relative pt-40 pb-24 overflow-hidden text-center bg-slate-900">
                        {/* Go Back Button */}
                        <div className="absolute top-24 left-4 md:left-8 z-30">
                            <button onClick={() => window.history.back()} className="flex items-center gap-2 text-white hover:text-primary transition font-bold text-sm group backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 shadow-sm hover:shadow-md">
                                <i data-lucide="arrow-left" className="w-4 h-4 group-hover:-translate-x-1 transition-transform"></i>
                                Go Back
                            </button>
                        </div>

                        {/* Background Image & Overlay */}
                        <div className="absolute inset-0 z-0">
                            <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
                                alt="Tech Network Background"
                                className="w-full h-full object-cover opacity-60" />
                            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px]"></div>
                        </div>

                        {/* Content */}
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                            <div className="max-w-4xl mx-auto space-y-8">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-indigo-300 text-[10px] font-black uppercase tracking-widest fade-in border border-white/10">
                                    <i data-lucide="sparkles" className="w-3 h-3"></i> Celebrating Excellence
                                </div>
                                <h1 className="text-4xl md:text-7xl font-heading font-black text-white leading-tight fade-in drop-shadow-2xl">
                                    Celebrating Excellence. <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">Showcasing Impact.</span>
                                </h1>
                                <p className="text-lg md:text-xl text-slate-300 leading-relaxed fade-in max-w-3xl mx-auto font-medium">
                                    Diverse Loopers is more than a learning ecosystem. It is a community where people build, achieve, contribute, and grow together.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 fade-in">
                                    <a href="#wall-of-fame" className="w-full sm:w-auto px-10 py-5 bg-primary text-white rounded-full font-black text-lg hover:bg-indigo-600 shadow-xl shadow-indigo-900/50 flex items-center justify-center gap-2 transition">
                                        Explore Our Community <i data-lucide="arrow-down" className="w-5 h-5"></i>
                                    </a>
                                    <a href="#hire-talent" className="w-full sm:w-auto px-10 py-5 bg-transparent text-white border border-white/30 rounded-full font-bold text-lg hover:bg-white hover:text-slate-900 transition">
                                        Hire Talent
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Wall of Fame Section */}
                    <section id="wall-of-fame" className="py-24 bg-white">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-20 reveal text-center md:text-left">
                                <div className="max-w-2xl space-y-4">
                                    <h2 className="text-primary font-black tracking-widest text-xs uppercase">Hall of Achievers</h2>
                                    <h3 className="text-3xl md:text-5xl font-heading font-black text-slate-900 leading-tight">Where Effort Turns Into Excellence</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed">This space celebrates individuals who rise above expectations — leading projects, solving real problems, and creating meaningful impact. Their journey reminds us that discipline, consistency, and courage build true success.</p>
                                </div>
                            </div>

                            {/* Achiever Grid */}
                            <div id="achiever-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {loading ? (
                                    <>
                                        <div className="animate-pulse bg-slate-100 rounded-[2.5rem] h-[480px]"></div>
                                        <div className="animate-pulse bg-slate-100 rounded-[2.5rem] h-[480px] hidden md:block"></div>
                                        <div className="animate-pulse bg-slate-100 rounded-[2.5rem] h-[480px] hidden lg:block"></div>
                                    </>
                                ) : achievers.length === 0 ? (
                                    <div className="col-span-full py-10 text-center text-slate-400 italic font-medium">
                                        Achievers are currently being updated. Check back soon!
                                    </div>
                                ) : (
                                    achievers.map(achiever => (
                                        <div key={achiever.id} className="achiever-card reveal group">
                                            <img src={achiever.image_url} className="achiever-img grayscale-0 group-hover:grayscale-0" alt={achiever.name} />
                                            <div className="achiever-overlay">
                                                <h4 className="text-2xl font-heading font-black text-white italic tracking-tight">{achiever.name}</h4>
                                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">{achiever.role_track}</p>

                                                <div className="achiever-details">
                                                    <p className="text-xs text-slate-300 leading-relaxed mb-6 font-medium">{achiever.project_description}</p>
                                                    <div className="flex gap-3">
                                                        <a href={achiever.project_link || '#'} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 bg-white text-dark text-center rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition">View Project</a>
                                                        <a href={achiever.linkedin_url || '#'} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center bg-white/10 text-white rounded-xl hover:bg-blue-600 transition">
                                                            <i data-lucide="linkedin" className="w-4 h-4"></i>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* See Full Wall Button */}
                            <div className="mt-20 text-center reveal">
                                <a href="/fame-wall" className="inline-flex items-center gap-3 px-12 py-5 bg-slate-900 text-white border border-transparent rounded-2xl font-black text-lg hover:bg-black hover:scale-105 transition shadow-xl">
                                    See Full Candidates <i data-lucide="layout-grid" className="w-5 h-5"></i>
                                </a>
                            </div>
                        </div>
                    </section>

                    {/* Events Section */}
                    <section id="events" className="relative py-24 bg-slate-50 overflow-hidden">
                        {/* Events Background Image */}
                        <div className="absolute inset-0 z-0">
                            <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2032&auto=format&fit=crop"
                                alt="Events Background"
                                className="w-full h-full object-cover opacity-5 grayscale" />
                        </div>

                        <div className="max-w-7xl mx-auto px-6 relative z-10">
                            <div className="text-center mb-16 space-y-4 reveal">
                                <h2 className="text-secondary font-black tracking-widest text-xs uppercase">Hands-on Learning</h2>
                                <h3 className="text-3xl md:text-5xl font-heading font-black text-slate-900 italic">Community In Action</h3>
                                <p className="text-slate-500 max-w-2xl mx-auto">Hosted events, workshops, and bootcamps bringing together learners and experts.</p>
                            </div>

                            {/* Events Container */}
                            <div id="dynamic-events-grid" className="grid md:grid-cols-2 gap-8 mb-16">
                                {loading ? (
                                    <>
                                        <div className="animate-pulse bg-white rounded-[3.5rem] h-72 border border-slate-100 shadow-sm"></div>
                                        <div className="animate-pulse bg-white rounded-[3.5rem] h-72 border border-slate-100 shadow-sm hidden md:block"></div>
                                    </>
                                ) : events.length === 0 ? (
                                    <div className="col-span-full py-10 text-center text-slate-400 italic font-medium">
                                        No upcoming events found.
                                    </div>
                                ) : (
                                    events.map(event => (
                                        <div key={event.id} className="bg-white p-8 md:p-10 rounded-[3.5rem] border border-slate-200 reveal flex flex-col md:flex-row gap-8 group hover:border-primary transition duration-500">
                                            <div className="w-16 h-16 shrink-0 bg-indigo-50 text-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition duration-500">
                                                <i data-lucide={getIconForEvent(event.title)}></i>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[10px] font-black uppercase text-primary tracking-widest">{formatEventDate(event.date)}</span>
                                                    {getEventStatus(event.date)}
                                                </div>
                                                <h4 className="font-bold text-xl mb-3 text-slate-900">{event.title}</h4>
                                                <p className="text-sm text-slate-500 leading-relaxed mb-6 font-medium italic line-clamp-2">{event.description}</p>
                                                <a href={`/events?id=${event.id}`} className="inline-flex items-center gap-2 text-xs font-black uppercase text-primary hover:gap-3 transition-all">
                                                    Get Details <i data-lucide="arrow-right" className="w-4 h-4"></i>
                                                </a>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row justify-center gap-4 reveal">
                                <button onClick={() => document.getElementById('hiring-form')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold hover:border-primary hover:text-primary transition">
                                    Partner For An Event
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Continue with remaining sections... */}
                    {/* Due to length limit, I'll provide the remaining sections in the next part */}

                    {/* Milestones & Trust Section */}
                    <section className="py-24 bg-white border-y border-slate-50">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="grid lg:grid-cols-2 gap-16 items-center">
                                <div className="reveal space-y-8 text-left">
                                    <h2 className="text-3xl md:text-5xl font-heading font-black text-slate-900 leading-tight">Community <br />Milestones.</h2>
                                    <p className="text-slate-500 font-medium text-lg leading-relaxed">Our programs help participants build verified evidence of capability needed to thrive in the modern tech landscape.</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-bold text-slate-700">
                                        <ul className="space-y-4">
                                            <li className="flex items-center gap-3"><i data-lucide="check" className="text-primary"></i> Verified Portfolios</li>
                                            <li className="flex items-center gap-3"><i data-lucide="check" className="text-primary"></i> Real Project Work</li>
                                        </ul>
                                        <ul className="space-y-4">
                                            <li className="flex items-center gap-3"><i data-lucide="check" className="text-primary"></i> Hybrid Hustle Credits</li>
                                            <li className="flex items-center gap-3"><i data-lucide="check" className="text-primary"></i> Professional direction</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="bg-dark p-12 rounded-[4rem] text-white reveal relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                    <h4 className="text-2xl font-black mb-6 italic text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Why Businesses Trust Us</h4>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium">Businesses need disciplined talent. Diverse Loopers nurtures talent inside a performance-driven community model where only consistent contributors advance.</p>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest"><i data-lucide="shield-check" className="text-primary"></i> Mentorship-Guided Work</div>
                                        <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest"><i data-lucide="shield-check" className="text-primary"></i> Structured Sprints</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Hire Talent Section */}
                    <section id="hire-talent" className="py-24 bg-surface">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="text-center mb-16 space-y-4 reveal">
                                <h2 className="text-primary font-black tracking-widest text-xs uppercase">Talent Acquisition</h2>
                                <h3 className="text-3xl md:text-5xl font-heading font-black text-slate-900 italic">Build Your Team With Industry-Ready Talent</h3>
                                <p className="text-slate-500 max-w-2xl mx-auto">Connect with interns, trainees, or engineers who have demonstrated verifiable skills on real projects.</p>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                                <div className="p-10 bento-card rounded-[3rem] reveal text-left">
                                    <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><i data-lucide="code" className="text-primary"></i> Technical Tracks</h4>
                                    <ul className="space-y-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        <li>• Web & Full-Stack</li>
                                        <li>• Cloud & DevOps</li>
                                        <li>• AI / ML Analysts</li>
                                    </ul>
                                </div>
                                <div className="p-10 bento-card rounded-[3rem] reveal text-left">
                                    <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><i data-lucide="shield-check" className="text-secondary"></i> Security & Ops</h4>
                                    <ul className="space-y-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        <li>• Cybersecurity</li>
                                        <li>• Product Management</li>
                                        <li>• Ops Support</li>
                                    </ul>
                                </div>
                                <div className="p-10 bento-card rounded-[3rem] reveal text-left">
                                    <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><i data-lucide="calendar" className="text-green-600"></i> Hiring Types</h4>
                                    <ul className="space-y-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        <li>• Intern / Trial</li>
                                        <li>• Contract / Freelance</li>
                                        <li>• Full-Time Support</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="text-center reveal">
                                <button onClick={() => document.getElementById('hiring-form')?.scrollIntoView({ behavior: 'smooth' })} className="px-10 py-5 bg-primary text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition shadow-xl flex items-center justify-center gap-3 mx-auto">
                                    Request Talent Consultation <i data-lucide="message-square" className="w-5 h-5"></i>
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Hiring Form Section */}
                    <section id="hiring-form" className="py-24 bg-white">
                        <div className="max-w-4xl mx-auto px-6">
                            <div className="glass-card p-10 md:p-16 rounded-[4rem] shadow-2xl reveal border border-slate-100">
                                <div className="mb-12 space-y-2 text-center">
                                    <h3 className="text-3xl font-heading font-black text-slate-900 italic">Hire Talent Requirements</h3>
                                    <p className="text-slate-500 font-medium">Please share your hiring needs and our team will connect with profiles.</p>
                                </div>

                                <form onSubmit={handleFormSubmit} className="space-y-6 text-left">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Company Name</label>
                                            <input
                                                type="text"
                                                name="company_name"
                                                value={formData.company_name}
                                                onChange={handleInputChange}
                                                required
                                                className="input-field"
                                                placeholder="Organization"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Hiring Contact Person</label>
                                            <input
                                                type="text"
                                                name="contact_name"
                                                value={formData.contact_name}
                                                onChange={handleInputChange}
                                                required
                                                className="input-field"
                                                placeholder="Full Name"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Business Email</label>
                                            <input
                                                type="email"
                                                name="contact_email"
                                                value={formData.contact_email}
                                                onChange={handleInputChange}
                                                required
                                                className="input-field"
                                                placeholder="email@company.com"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Contact Number</label>
                                            <input
                                                type="tel"
                                                name="contact_phone"
                                                value={formData.contact_phone}
                                                onChange={handleInputChange}
                                                required
                                                className="input-field"
                                                placeholder="+91 ..."
                                            />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Role / Requirement</label>
                                            <input
                                                type="text"
                                                name="role_requirement"
                                                value={formData.role_requirement}
                                                onChange={handleInputChange}
                                                required
                                                className="input-field"
                                                placeholder="e.g. AI Analyst"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Type of Hiring</label>
                                            <select
                                                name="hiring_type"
                                                value={formData.hiring_type}
                                                onChange={handleInputChange}
                                                required
                                                className="input-field"
                                            >
                                                <option value="Internship">Internship</option>
                                                <option value="Contract">Contract / Project Based</option>
                                                <option value="Full-Time">Trial to Full-Time</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Preferred Skills / Stack</label>
                                        <input
                                            type="text"
                                            name="preferred_skills"
                                            value={formData.preferred_skills}
                                            onChange={handleInputChange}
                                            className="input-field"
                                            placeholder="e.g. React, Python, Docker"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Additional Notes</label>
                                        <textarea
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            rows="4"
                                            className="input-field"
                                            placeholder="Any specific requirements..."
                                        />
                                    </div>

                                    <div className="pt-6">
                                        <button type="submit" className="w-full py-5 bg-primary text-white rounded-3xl font-black text-xl uppercase tracking-widest hover:bg-indigo-700 transition shadow-xl">
                                            Submit Requirement
                                        </button>
                                    </div>
                                    <p className="text-[9px] text-center font-bold text-slate-400 uppercase tracking-wider italic mt-4">
                                        * We respect confidentiality. Your information is used only for collaboration and hiring support.
                                    </p>

                                    {formMessage.show && (
                                        <div className={`text-center p-4 rounded-2xl text-sm font-bold mt-4 ${formMessage.type === 'loading' ? 'bg-indigo-50 text-primary animate-pulse' :
                                                formMessage.type === 'success' ? 'bg-green-50 text-green-600' :
                                                    'bg-red-50 text-red-600'
                                            }`}>
                                            {formMessage.text}
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </section>

                    {/* Partner Section */}
                    <section className="py-24 bg-slate-900 text-white rounded-t-[4rem] mb-2">
                        <div className="max-w-7xl mx-auto px-6 text-center">
                            <div className="max-w-3xl mx-auto space-y-10 reveal">
                                <h2 className="text-4xl md:text-6xl font-heading font-black italic">Collaborate Beyond Hiring</h2>
                                <p className="text-slate-400 text-lg leading-relaxed">We also work with companies for project execution, innovation labs, and corporate workshops.</p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <a href="/business" className="px-10 py-5 bg-primary text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition shadow-xl shadow-indigo-500/20">Start a Project</a>
                                    <button onClick={() => document.getElementById('hiring-form')?.scrollIntoView({ behavior: 'smooth' })} className="px-10 py-5 bg-white text-dark rounded-2xl font-black text-lg hover:bg-slate-100 transition">
                                        Become a Partner
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="bg-slate-900 text-white pt-20 pb-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                            {/* Branding */}
                            <div className="col-span-1 lg:col-span-1">
                                <img src="/Diverse Loopers Black BG (2).png" alt="Diverse Loopers" className="h-12 w-auto mb-6" />
                                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                    Empowering talents for tomorrow through structured, future-ready career pathways and real industry exposure.
                                </p>
                                <div className="flex gap-4">
                                    <a href="https://www.linkedin.com/company/105277450" className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center hover:bg-primary transition">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                    </a>
                                    <a href="https://www.instagram.com/diverseloopers/" className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center hover:bg-primary transition">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                    </a>
                                    <a href="https://chat.whatsapp.com/B6XJSoLC2Hg7Wgg5lHRfSf" className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center hover:bg-primary transition">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                            <path d="M16.7 13.4c-.3-.2-1.7-.8-2-1-.3-.2-.5-.2-.7.2s-.8 1-1 1.2c-.2.2-.4.2-.7.1-.3-.1-1.2-.4-2.2-1.3-1-1-1.3-1.9-1.4-2.2-.1-.3 0-.5.2-.7.2-.2.6-.7.8-1 .2-.3.1-.5 0-.7-.1-.2-.7-1.7-.9-2.1-.2-.4-.4-.3-.7-.3-.3 0-.6 0-.9.3-.3.3-1.1 1.1-1.1 2.6 0 1.5.9 3 1.1 3.2.1.2 2.1 3.2 5.1 4.4 1.9.8 2.6.9 3.5.8.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.1-1.4-.1-.1-.3-.2-.6-.4z" />
                                            <path d="M21 12a9 9 0 1 0-16.5 5.2L3 21l3.8-1.5A9 9 0 0 0 21 12z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>

                            {/* Navigation */}
                            <div>
                                <h4 className="font-bold mb-6">Quick Navigation</h4>
                                <ul className="space-y-4 text-slate-400 text-sm">
                                    <li><a href="/about" className="hover:text-white transition">About Us</a></li>
                                    <li><a href="/analyzer" className="hover:text-white transition">Path Analyzer</a></li>
                                    <li><a href="/career-analyzer" className="hover:text-white transition">Career Analyzer</a></li>
                                </ul>
                            </div>

                            {/* Specializations */}
                            <div>
                                <h4 className="font-bold mb-6">Specializations</h4>
                                <ul className="space-y-4 text-slate-400 text-sm">
                                    <li><a href="/" className="hover:text-white transition">For Students</a></li>
                                    <li><a href="/institute" className="hover:text-white transition">For Universities</a></li>
                                    <li><a href="/business" className="hover:text-white transition">For Businesses</a></li>
                                </ul>
                            </div>

                            {/* Contact Info */}
                            <div>
                                <h4 className="font-bold mb-6">Contact Us</h4>
                                <ul className="space-y-4 text-slate-400 text-sm">
                                    <li className="flex gap-3"><i data-lucide="mail" className="w-4 h-4 text-primary"></i> contact@diverseloopers.com</li>
                                    <li className="flex gap-3"><i data-lucide="phone" className="w-4 h-4 text-primary"></i> +91 98393 50961</li>
                                </ul>
                            </div>
                        </div>

                        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
                            <p>&copy; 2024 Diverse Loopers. All Rights Reserved.</p>
                            <div className="flex gap-8">
                                <a href="#" className="hover:text-white transition">Privacy Policy</a>
                                <a href="#" className="hover:text-white transition">Terms & Conditions</a>
                            </div>
                            <p>Hybrid Hustle&reg; is a registered program concept.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
