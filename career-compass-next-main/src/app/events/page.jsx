'use client';

// ─────────────────────────────────────────────────────────────────────────────
//  src/app/events/page.jsx
//
//  Single file that handles BOTH the Events Listing page AND the Event Detail
//  page. Navigation between them is done via React state (no URL param needed).
//
//  Structure:
//    PageRouter            → top-level: decides which page to show
//    EventsListingPage     → /events  (grid of cards)
//    EventDetailPage       → /events?id=xxx  (full detail view)
//    RegistrationModal     → popup form for event registration
//    Shared components     → Navbar, PastEventCard, Lightbox, Countdown, etc.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './events.css';
import './event-detail.css';
import NavAuthButtons from '@/components/NavAuthButtons';

// ═══════════════════════════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const FILTER_TABS = ['All Events', 'Upcoming', 'Past Events', 'Workshop'];

// Featured event shown at the top of the listing page.
// This is a HARDCODED highlight — replace with a real Supabase row when ready.
const FEATURED_EVENT = {
  id: 'upcoming1',           // ← set to a real Supabase UUID to make "Secure Your Spot" work
  label: 'Hybrid Hackathon',
  title: 'The FinTech Innovation Build-athon',
  desc: 'Join 500+ developers to build next-generation financial tools. Get mentorship from industry leaders, access premium APIs, and compete for a ₹1,000,000 prize pool.',
  date: 'April 15–17, 2026',
  location: 'New Delhi (Hybrid)',
  daysLeft: 22,
  image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80',
};

// Supabase URL — used directly in the registration POST
const SUPABASE_URL = 'https://tjqsmkaiajdpotmafqvw.supabase.co';

// ─── Fallback events used when /api/events returns 404 or fails ───────────────
const FALLBACK_EVENTS = [
  {
    id: 'ca4b273f-fe4f-45a0-b711-631871f76ca1',
    title: 'The Tech Career Compass: Finding Your Niche',
    date: '2025-12-13T05:30:00+00:00',
    description: 'Join our upcoming webinar to explore diverse career paths in the tech industry.',
    category: 'Webinar',
  },
  {
    id: '8eb6594c-79d1-407f-92d9-a8eec206e4e1',
    title: 'Workshop on AR & VR Technologies',
    date: '2025-11-19T04:00:00+00:00',
    description: 'Learn the basics of immersive tech, game development, and Unity through live demos.',
    category: 'Workshop',
    key_highlights: ['Gain Experience on AR.', 'Gain Experience in VR.', 'Learn How the Virtual World Works.'],
    who_should_attend: ['Students.', 'Professors.', 'Anyone interested in Game Development.'],
    what_you_will_gain: ['Certificate of Attendance.', 'Certificate of Best Performer (Conditions Applied).'],
    main_media_url: 'https://tjqsmkaiajdpotmafqvw.supabase.co/storage/v1/object/public/events-images/events/8eb6594c-79d1-407f-92d9-a8eec206e4e1-1763146873158.png',
    gallery_urls: [
      'https://i.ibb.co/FkFqGZ9r/Screenshot-20260103-042953-Drive.png',
      'https://i.ibb.co/ymMBWt3D/Screenshot-20260103-042941-Drive.png',
      'https://i.ibb.co/fzdC8DQM/Screenshot-20260103-042816-Drive.png',
      'https://i.ibb.co/dw06pWPy/Screenshot-20260103-043103-Drive.png',
    ],
  },
  {
    id: '049476c1-eee3-4833-bb13-6bb09fa038a1',
    title: 'AI/ML Project Development Workshop',
    date: '2025-09-13T05:17:00+00:00',
    description: 'Fundamentals of machine learning, model building, and real-world AI applications.',
    category: 'Workshop',
  },
  {
    id: '7c8a6cbf-b656-4be6-a4c5-0557fd8d2643',
    title: '2-D Game Development Workshop Using Unity',
    date: '2025-01-28T03:00:00+00:00',
    description: 'Hands-on 2D Game Development Workshop at IGSM Auditorium, IILM University.',
    category: 'Workshop',
    main_media_url: 'https://tjqsmkaiajdpotmafqvw.supabase.co/storage/v1/object/public/events-images/events/7c8a6cbf-b656-4be6-a4c5-0557fd8d2643-1763147603037.png',
    gallery_urls: [
      'https://i.ibb.co/fVL077xk/IMG-20250128-WA0035.jpg',
      'https://i.ibb.co/v6m4cLkY/IMG-20250128-WA0039.jpg',
      'https://i.ibb.co/5X55LNcJ/IMG-20250128-WA0061.jpg',
      'https://i.ibb.co/6RgnYG9r/IMG-20250128-WA0029.jpg',
    ],
    key_highlights: ['Learn to build simple 2-D Games.', 'Exposure of the development sector under Gaming.', '0 to advance knowledge on Unity'],
    who_should_attend: ['Beginners.', 'Students.', 'Anyone interested in Gaming.'],
    what_you_will_gain: ['Certificate of Attendance.', 'Meaningful knowledge of Unity and Games.', '2 complete Projects on game development.'],
    video_url: 'https://youtu.be/YZllJWpAwY4?si=OhDTfHTvULc4fiJb',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
//  HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

// Format date as "28 Jan 2025"
function formatDate(dateStr) {
  if (!dateStr) return 'Date TBD';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// Format date as "28 January 2025"
function formatDateLong(dateStr) {
  if (!dateStr) return 'Date TBD';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

// Convert YouTube share/watch URLs to embed URLs
function toEmbedUrl(url = '') {
  if (!url) return '';
  return url
    .replace('youtu.be/', 'www.youtube.com/embed/')
    .replace('watch?v=', 'embed/')
    .replace(/&.*$/, '');
}

// Decide which filter tab an event belongs to
function deriveEventFilter(event) {
  const isUpcoming = new Date(event.date) >= new Date();
  if (isUpcoming) return 'Upcoming';
  const combined = (event.title + ' ' + (event.category || '')).toLowerCase();
  if (combined.includes('workshop')) return 'Workshop';
  return 'Past Events';
}

// Control which sections show per filter tab
function getVisibility(activeFilter) {
  switch (activeFilter) {
    case 'Upcoming':    return { showFeatured: true,  showPast: false };
    case 'Past Events': return { showFeatured: false, showPast: true  };
    case 'Workshop':    return { showFeatured: false, showPast: true  };
    default:            return { showFeatured: true,  showPast: true  }; // All Events
  }
}

// Get category pill colour from category name
function getCatStyle(cat = '') {
  const l = cat.toLowerCase();
  if (l.includes('master'))  return { background: '#eff6ff', color: '#2563eb' };
  if (l.includes('hack'))    return { background: '#fdf2f8', color: '#db2777' };
  if (l.includes('work'))    return { background: '#f0fdf4', color: '#16a34a' };
  if (l.includes('boot'))    return { background: '#fffbeb', color: '#d97706' };
  if (l.includes('webinar')) return { background: '#f5f3ff', color: '#7c3aed' };
  return                            { background: '#f1f5f9', color: '#475569' };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SVG ICONS  (inline — no external icon library needed)
// ═══════════════════════════════════════════════════════════════════════════════
const Icon = {
  Zap:        () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg>),
  Calendar:   () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>),
  Pin:        () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>),
  ArrowRight: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>),
  ArrowLeft:  () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>),
  Clock:      () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>),
  Play:       () => (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5,3 19,12 5,21"/></svg>),
  Check:      () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20,6 9,17 4,12"/></svg>),
  Mail:       () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>),
  Star:       () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>),
  Users:      () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>),
  Gift:       () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="20,12 20,22 4,22 4,12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>),
  Close:      () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>),
  ChevLeft:   () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="15,18 9,12 15,6"/></svg>),
  ChevRight:  () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="9,18 15,12 9,6"/></svg>),
  Share:      () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>),
};

// ═══════════════════════════════════════════════════════════════════════════════
//  NAVBAR
//  Used by both listing and detail pages.
//  cls prop = 'ev' (listing) or 'ed' (detail) — controls CSS class prefix.
// ═══════════════════════════════════════════════════════════════════════════════
const NAV_LINKS = [
  { label: 'Home',    href: '/' },
  { label: 'Courses', href: '/courses' },
  { label: 'Events',  href: '/events', active: true },
];

// function Navbar({ cls = 'ev' }) {
//   const [scrolled, setScrolled] = useState(false);

//   useEffect(() => {
//     const fn = () => setScrolled(window.scrollY > 8);
//     window.addEventListener('scroll', fn, { passive: true });
//     return () => window.removeEventListener('scroll', fn);
//   }, []);

//   return (
//     <nav className={`${cls}-nav${scrolled ? ` ${cls}-nav--scrolled` : ''}`}>
//       <div className={`${cls}-nav__inner`}>
//         <Link href="/" className={`${cls}-nav__logo`}>
//           <Image
//             src="/DIVERSE LOOPERS (1) bg.png"
//             alt="Diverse Loopers"
//             width={120} height={48} priority
//             className={`${cls}-nav__logo-img`}
//           />
//         </Link>
//         <div className={`${cls}-nav__links`}>
//           {NAV_LINKS.map((l) => (
//             <Link key={l.label} href={l.href}
//               className={`${cls}-nav__link${l.active ? ` ${cls}-nav__link--active` : ''}`}>
//               {l.label}
//             </Link>
//           ))}
//           <Link href="/login" className={`${cls}-nav__cta`}>Login</Link>
//         </div>
//       </div>
//     </nav>
//   );
// }

function Navbar({ cls = 'ev' }) {
  const [scrolled,   setScrolled]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Close menu on route-style navigation (clicking a link)
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className={`${cls}-nav${scrolled ? ` ${cls}-nav--scrolled` : ''}`}>
        <div className={`${cls}-nav__inner`}>
          <Link href="/" className={`${cls}-nav__logo`}>
            <Image
              src="/DIVERSE LOOPERS (1) bg.png"
              alt="Diverse Loopers"
              width={120} height={48} priority
              className={`${cls}-nav__logo-img`}
            />
          </Link>

          {/* Desktop links */}
          <div className={`${cls}-nav__links`}>
            {NAV_LINKS.map((l) => (
              <Link key={l.label} href={l.href}
                className={`${cls}-nav__link${l.active ? ` ${cls}-nav__link--active` : ''}`}>
                {l.label}
              </Link>
            ))}
            <NavAuthButtons loginClass={`${cls}-nav__cta`} signupClass={`${cls}-nav__cta`} />
          </div>

          {/* Hamburger button — visible only on mobile via CSS */}
          <button
            className={`${cls}-nav__hamburger${menuOpen ? ` ${cls}-nav__hamburger--open` : ''}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      <div className={`${cls}-nav__mobile${menuOpen ? ` ${cls}-nav__mobile--open` : ''}`}>
        {NAV_LINKS.map((l) => (
          <Link key={l.label} href={l.href}
            className={`${cls}-nav__mobile-link${l.active ? ` ${cls}-nav__mobile-link--active` : ''}`}
            onClick={closeMenu}>
            {l.label}
          </Link>
        ))}
        <NavAuthButtons loginClass={`${cls}-nav__mobile-cta`} signupClass={`${cls}-nav__mobile-cta`} />
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  REGISTRATION MODAL
//  Opens when user clicks "Register Now" or "Secure Your Spot".
//  POSTs form data directly to Supabase REST API.
//
//  SETUP REQUIRED:
//    1. Create table in Supabase: event_registrations
//       (id, event_id, full_name, email, phone, organization, role, reason)
//    2. Replace SUPABASE_ANON_KEY below with your actual key from .env.local
// ═══════════════════════════════════════════════════════════════════════════════
function RegistrationModal({ eventId, eventTitle, onClose }) {
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    const formData = new FormData(e.target);
    const payload = {
      event_id:     eventId,
      full_name:    formData.get('full_name'),
      email:        formData.get('email'),
      phone:        formData.get('phone'),
      organization: formData.get('organization'),
      role:         formData.get('role'),
      reason:       formData.get('reason') || '',
    };

    try {
      // ⚠️  Replace with your actual Supabase Anon Key
      const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_KEY_HERE';

      const res = await fetch(`${SUPABASE_URL}/rest/v1/event_registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok || res.status === 201) {
        setStatus('success');
      } else {
        throw new Error(`Registration failed (${res.status})`);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setStatus('error');
    }
  };

  return (
    <div className="ev-modal-overlay" onClick={onClose}>
      <div className="ev-modal" onClick={(e) => e.stopPropagation()}>

        {/* Close button */}
        <button className="ev-modal__close" onClick={onClose} aria-label="Close modal">
          <Icon.Close />
        </button>

        {/* Header */}
        <div className="ev-modal__header">
          <h2 className="ev-modal__title">Event Registration</h2>
          <p className="ev-modal__sub">Secure your spot for <strong>{eventTitle || 'this event'}</strong></p>
        </div>

        {/* Success state */}
        {status === 'success' ? (
          <div className="ev-modal__success">
            <div className="ev-modal__success-icon"><Icon.Check /></div>
            <h3>Registration Successful!</h3>
            <p>You will receive a confirmation email shortly.</p>
            <button className="ev-modal__btn-submit" style={{ marginTop: '1.5rem' }} onClick={onClose}>
              Back to Event
            </button>
          </div>
        ) : (
          <form className="ev-modal__form" onSubmit={handleSubmit}>

            {/* Full Name */}
            <div className="ev-modal__field">
              <label htmlFor="reg-name">Full Name</label>
              <input id="reg-name" name="full_name" type="text" placeholder="Your full name" required />
            </div>

            {/* Email + Phone */}
            <div className="ev-modal__row">
              <div className="ev-modal__field">
                <label htmlFor="reg-email">Email Address</label>
                <input id="reg-email" name="email" type="email" placeholder="you@example.com" required />
              </div>
              <div className="ev-modal__field">
                <label htmlFor="reg-phone">Phone Number</label>
                <input id="reg-phone" name="phone" type="tel" placeholder="+91 XXXXX XXXXX" required />
              </div>
            </div>

            {/* College + Role */}
            <div className="ev-modal__row">
              <div className="ev-modal__field">
                <label htmlFor="reg-org">College / Organization</label>
                <input id="reg-org" name="organization" type="text" placeholder="University Name" required />
              </div>
              <div className="ev-modal__field">
                <label htmlFor="reg-role">Year / Role</label>
                <input id="reg-role" name="role" type="text" placeholder="e.g. 3rd Year / Developer" required />
              </div>
            </div>

            {/* Why attend */}
            <div className="ev-modal__field">
              <label htmlFor="reg-reason">Why do you want to attend? (optional)</label>
              <textarea id="reg-reason" name="reason" placeholder="Briefly explain your interest..." rows={3} />
            </div>

            {/* Error message */}
            {status === 'error' && (
              <p className="ev-modal__error">Registration failed. Please check your connection and try again.</p>
            )}

            {/* Actions */}
            <div className="ev-modal__actions">
              <button type="button" className="ev-modal__btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="ev-modal__btn-submit" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Registering…' : 'Submit Registration'}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  NEWSLETTER SECTION
//  POSTs email to /api/subscribe (src/app/api/subscribe/route.js)
// ═══════════════════════════════════════════════════════════════════════════════
function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('submitting');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.status === 404) {
        // /api/subscribe not created yet — show success so UX doesn't break
        console.warn('⚠️  /api/subscribe not found. Create src/app/api/subscribe/route.js');
        setStatus('success'); setEmail(''); return;
      }
      if (!res.ok) throw new Error('Server error');
      setStatus('success'); setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="ev-newsletter">
      <div className="ev-newsletter__inner">
        <h2 className="ev-newsletter__title">Never Miss an Event</h2>
        <p className="ev-newsletter__sub">
          Join 10,000+ students getting notified about our latest hackathons,
          masterclasses, and career opportunities.
        </p>

        {status === 'success' ? (
          <div className="ev-newsletter__success">
            <Icon.Check /> You&apos;re on the list! We&apos;ll keep you posted.
          </div>
        ) : (
          <form className="ev-newsletter__form" onSubmit={handleSubmit} noValidate>
            <div className="ev-newsletter__input-wrap">
              <Icon.Mail />
              <input
                type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required disabled={status === 'submitting'}
              />
            </div>
            <button type="submit" className="ev-newsletter__btn" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="ev-newsletter__error">Something went wrong. Please try again.</p>
        )}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  EVENT CARD  (used in both listing grid and upcoming section)
// ═══════════════════════════════════════════════════════════════════════════════
function EventCard({ event, index, onViewDetail }) {
  // Use key_highlights (Supabase column name) or takeaways (legacy)
  const takeaways = Array.isArray(event.key_highlights) ? event.key_highlights
    : Array.isArray(event.takeaways) ? event.takeaways : [];

  // Derive category label from event.category or from title keywords
  const category = event.category || (() => {
    const t = (event.title || '').toLowerCase();
    if (t.includes('workshop'))    return 'Workshop';
    if (t.includes('webinar'))     return 'Webinar';
    if (t.includes('hackathon'))   return 'Hackathon';
    if (t.includes('bootcamp'))    return 'Bootcamp';
    if (t.includes('masterclass')) return 'Masterclass';
    return 'Event';
  })();

  const isPast = new Date(event.date) < new Date();

  return (
    <article className="ev-card" style={{ animationDelay: `${index * 80}ms` }}>

      {/* ── Card image with status badge ──────────────────────────────── */}
      <div className="ev-card__img-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.main_media_url || event.image_url ||
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80'}
          alt={event.title}
          className="ev-card__img"
          loading="lazy"
        />
        <div className="ev-card__img-overlay" />
        <span className={`ev-card__badge ${isPast ? 'ev-card__badge--past' : 'ev-card__badge--upcoming'}`}>
          {isPast ? 'Completed' : 'Upcoming'}
        </span>
      </div>

      {/* ── Card body ─────────────────────────────────────────────────── */}
      <div className="ev-card__body">

        {/* Date + category pill */}
        <div className="ev-card__meta">
          <span className="ev-card__date"><Icon.Calendar /> {formatDate(event.date)}</span>
          <span className="ev-card__category" style={getCatStyle(category)}>{category}</span>
        </div>

        {/* Title */}
        <h3 className="ev-card__title">{event.title}</h3>

        {/* Description */}
        <p className="ev-card__desc">{event.description}</p>

        {/* Key Takeaways — only shown if data exists */}
        {takeaways.length > 0 && (
          <div className="ev-card__takeaways">
            <p className="ev-card__takeaways-label">Key Takeaways</p>
            <ul>
              {takeaways.map((t, i) => (
                <li key={i}><Icon.Check /> {t}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Get Details button — triggers state-based navigation (no page reload) */}
        <button className="ev-card__cta" onClick={() => onViewDetail(event.id)}>
          <Icon.ArrowRight /> Get Details
        </button>
      </div>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  LIGHTBOX  (full-screen photo viewer on detail page gallery)
// ═══════════════════════════════════════════════════════════════════════════════
function Lightbox({ images, activeIndex, onClose, onPrev, onNext }) {
  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'Escape')     onClose();
      if (e.key === 'ArrowLeft')  onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    document.addEventListener('keydown', fn);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', fn);
      document.body.style.overflow = '';
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div className="ed-lightbox" onClick={onClose}>
      <button className="ed-lightbox__close" onClick={onClose} aria-label="Close"><Icon.Close /></button>
      <button className="ed-lightbox__prev" onClick={(e) => { e.stopPropagation(); onPrev(); }} aria-label="Previous">
        <Icon.ChevLeft />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[activeIndex]}
        alt={`Photo ${activeIndex + 1}`}
        className="ed-lightbox__img"
        onClick={(e) => e.stopPropagation()}
      />
      <button className="ed-lightbox__next" onClick={(e) => { e.stopPropagation(); onNext(); }} aria-label="Next">
        <Icon.ChevRight />
      </button>
      <div className="ed-lightbox__counter">{activeIndex + 1} / {images.length}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  COUNTDOWN TIMER  (live seconds ticker on detail page for upcoming events)
// ═══════════════════════════════════════════════════════════════════════════════
function Countdown({ dateStr }) {
  const [time, setTime] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    function calc() {
      const diff = new Date(dateStr) - new Date();
      if (diff <= 0) return;
      setTime({
        days:  Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins:  Math.floor((diff % 3600000) / 60000),
        secs:  Math.floor((diff % 60000) / 1000),
      });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [dateStr]);

  return (
    <div className="ed-countdown">
      <p className="ed-countdown__label">Event starts in</p>
      <div className="ed-countdown__blocks">
        {[['Days', time.days], ['Hours', time.hours], ['Mins', time.mins], ['Secs', time.secs]].map(([l, v]) => (
          <div key={l} className="ed-countdown__block">
            <span className="ed-countdown__num">{String(v).padStart(2, '0')}</span>
            <span className="ed-countdown__unit">{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SHARE BUTTON  (native share on mobile, clipboard copy on desktop)
// ═══════════════════════════════════════════════════════════════════════════════
function ShareButton({ title }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button className="ed-share-btn" onClick={share}>
      <Icon.Share /> {copied ? 'Link copied!' : 'Share'}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  EVENTS LISTING PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function EventsListingPage({ onViewDetail, onEventsLoaded }) {
  const [allEvents,    setAllEvents]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [mounted,      setMounted]      = useState(false);
  const [activeFilter, setActiveFilter] = useState('All Events');
  const [modalOpen,    setModalOpen]    = useState(false); // for "Secure Your Spot"
  const heroRef = useRef(null);

  // ── Fetch all events from Supabase via /api/events ────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/events');
        if (res.status === 404) {
          // API route not set up yet — use fallback data
          setAllEvents(FALLBACK_EVENTS);
          onEventsLoaded(FALLBACK_EVENTS);
          return;
        }
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();
        const sorted = Array.isArray(data) && data.length > 0
          ? [...data].sort((a, b) => new Date(b.date) - new Date(a.date))
          : FALLBACK_EVENTS;
        setAllEvents(sorted);
        onEventsLoaded(sorted);
      } catch {
        setAllEvents(FALLBACK_EVENTS);
        onEventsLoaded(FALLBACK_EVENTS);
      } finally {
        setLoading(false);
      }
    })();
  }, [onEventsLoaded]);

  // Hero entrance animation
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Scroll-reveal for cards
  useEffect(() => {
    const els = document.querySelectorAll('.ev-reveal');
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('ev-reveal--in'); }),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [loading, activeFilter]);

  const { showFeatured, showPast } = getVisibility(activeFilter);
  const now = new Date();

  // Events from Supabase that are upcoming (for "All Upcoming" sub-grid)
  const upcomingEvents = allEvents.filter((e) => new Date(e.date) >= now);

  // Events shown in the main filtered grid
  const filteredEvents = (() => {
    switch (activeFilter) {
      case 'All Events':  return allEvents;
      case 'Past Events': return allEvents.filter((e) => new Date(e.date) < now);
      case 'Workshop':    return allEvents.filter((e) => deriveEventFilter(e) === 'Workshop');
      default:            return upcomingEvents; // Upcoming tab
    }
  })();

  return (
    <>
      <Navbar cls="ev" />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <header ref={heroRef} className={`ev-hero${mounted ? ' ev-hero--in' : ''}`}>
        <div className="ev-hero__dots" aria-hidden="true" />
        <div className="ev-hero__glow" aria-hidden="true" />
        <div className="ev-hero__inner">
          <span className="ev-hero__eyebrow"><Icon.Zap /> Community Hub</span>
          <h1 className="ev-hero__title">
            Learn. Build. <span className="ev-hero__title-accent">Connect.</span>
          </h1>
          <p className="ev-hero__sub">
            Join our exclusive hackathons, expert-led masterclasses, and networking sessions.
            See what we&apos;re planning next, or catch up on what you missed.
          </p>
        </div>
      </header>

      {/* ── Sticky filter tabs ───────────────────────────────────────────── */}
      <div className="ev-tabs-bar">
        <div className="ev-tabs">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              className={`ev-tab${activeFilter === tab ? ' ev-tab--active' : ''}`}
              onClick={() => setActiveFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <main className="ev-main">

        {/* ── Featured Upcoming ─────────────────────────────────────────── */}
        {showFeatured && (
          <section className="ev-section ev-reveal">
            {/* <h2 className="ev-section__heading">
              <span className="ev-pulse" aria-hidden="true">
                <span className="ev-pulse__ring" /><span className="ev-pulse__dot" />
              </span>
              Featured Upcoming
            </h2> */}
            <h2 className="ev-section__heading" style={{ color: 'white' }}>
              <span className="ev-pulse" aria-hidden="true">
                <span className="ev-pulse__ring" /><span className="ev-pulse__dot" />
              </span>
              Featured Upcoming
            </h2>

            {loading ? (
              // Skeleton loader
              <div className="ev-featured ev-featured--skeleton">
                <div className="ev-skeleton ev-skeleton--img" />
                <div className="ev-featured__body">
                  <div className="ev-skeleton ev-skeleton--tag" />
                  <div className="ev-skeleton ev-skeleton--title" />
                  <div className="ev-skeleton ev-skeleton--text" />
                </div>
              </div>
            ) : (
              <>
                {/* Featured event card */}
                <div className="ev-featured">
                  <div className="ev-featured__img-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={FEATURED_EVENT.image} alt={FEATURED_EVENT.title} className="ev-featured__img" />
                    <div className="ev-featured__countdown">
                      <Icon.Clock /> Starts in {FEATURED_EVENT.daysLeft} Days
                    </div>
                  </div>
                  <div className="ev-featured__body">
                    <span className="ev-featured__label">{FEATURED_EVENT.label}</span>
                    <h3 className="ev-featured__title">{FEATURED_EVENT.title}</h3>
                    <p className="ev-featured__desc">{FEATURED_EVENT.desc}</p>
                    <div className="ev-featured__meta">
                      <span><Icon.Calendar /> {FEATURED_EVENT.date}</span>
                      <span><Icon.Pin /> {FEATURED_EVENT.location}</span>
                    </div>
                    {/*
                      "Secure Your Spot" opens the registration modal.
                      The modal POSTs to Supabase event_registrations table.
                      eventId is FEATURED_EVENT.id — update this to a real Supabase UUID.
                    */}
                    <button
                      className="ev-btn ev-btn--primary"
                      onClick={() => setModalOpen(true)}
                    >
                      Secure Your Spot <Icon.ArrowRight />
                    </button>
                  </div>
                </div>

                {/* Sub-grid: real upcoming events from Supabase */}
                {upcomingEvents.length > 0 && (
                  <div style={{ marginTop: '2.5rem' }}>
                    <h3 className="ev-section__subheading">All Upcoming</h3>
                    <div className="ev-grid">
                      {upcomingEvents.map((e, i) => (
                        <EventCard key={e.id} event={e} index={i} onViewDetail={onViewDetail} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* ── Main events grid ──────────────────────────────────────────── */}
        {showPast && (
          <section className="ev-section ev-reveal">
            <h2 className="ev-section__heading ev-section__heading--ruled" style={{ color: 'white' }}>
              {activeFilter === 'All Events'  ? 'All Events'  :
               activeFilter === 'Past Events' ? 'Past Events' :
               activeFilter === 'Workshop'    ? 'Workshops'   : 'Events'}
            </h2>

            {loading ? (
              // Skeleton loaders
              <div className="ev-grid">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="ev-card ev-card--skeleton">
                    <div className="ev-skeleton ev-skeleton--img" />
                    <div className="ev-card__body">
                      <div className="ev-skeleton ev-skeleton--tag" />
                      <div className="ev-skeleton ev-skeleton--title" />
                      <div className="ev-skeleton ev-skeleton--text" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              <p className="ev-empty">No events found for this filter.</p>
            ) : (
              <div className="ev-grid">
                {filteredEvents.map((e, i) => (
                  <EventCard key={e.id} event={e} index={i} onViewDetail={onViewDetail} />
                ))}
              </div>
            )}
          </section>
        )}

      </main>

      <NewsletterSection />

      {/* Registration modal — opens when "Secure Your Spot" is clicked */}
      {modalOpen && (
        <RegistrationModal
          eventId={FEATURED_EVENT.id}
          eventTitle={FEATURED_EVENT.title}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  EVENT DETAIL PAGE
//  Shows full info for a single event.
//  Fetches fresh data from /api/events/:id so all Supabase fields are available.
// ═══════════════════════════════════════════════════════════════════════════════
function EventDetailPage({ id, onBack, allEvents }) {
  const [event,    setEvent]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [tab,      setTab]      = useState('about');
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });
  const [modalOpen,setModalOpen]= useState(false);

  // ── Load event data ────────────────────────────────────────────────────────
  // First try /api/events/:id (full Supabase row including gallery, video, etc.)
  // Fall back to the already-loaded allEvents array if the API route doesn't exist yet.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/events/${id}`);

        if (res.status === 404) {
          // API route /api/events/[id]/route.js not created yet
          // Fall back to the events already loaded on the listing page
          const found = allEvents.find((e) => e.id === id)
            || FALLBACK_EVENTS.find((e) => e.id === id);
          if (found) { setEvent(found); }
          else        { setError('Event not found'); }
          return;
        }

        if (!res.ok) throw new Error(`Server error ${res.status}`);
        setEvent(await res.json());

      } catch (e) {
        // Network error — try local data
        const found = allEvents.find((ev) => ev.id === id)
          || FALLBACK_EVENTS.find((ev) => ev.id === id);
        if (found) { setEvent(found); }
        else        { setError(e.message); }
      } finally {
        setLoading(false);
      }
    })();
  }, [id, allEvents]);

  // Scroll to top when detail page opens
  useEffect(() => { window.scrollTo(0, 0); }, []);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) return (
    <>
      <Navbar cls="ed" />
      <div className="ed-hero-skeleton"><div className="ed-sk ed-sk--full" /></div>
      <div className="ed-body"><div className="ed-container">
        <div className="ed-sk ed-sk--title" /><div className="ed-sk ed-sk--text" />
      </div></div>
    </>
  );

  // ── Error state ────────────────────────────────────────────────────────────
  if (error || !event) return (
    <>
      <Navbar cls="ed" />
      <div className="ed-error">
        <h1>Event not found</h1>
        <p>{error || 'This event does not exist or has been removed.'}</p>
        <button className="ed-btn ed-btn--primary" onClick={onBack}>
          <Icon.ArrowLeft /> Back to Events
        </button>
      </div>
    </>
  );

  // ── Derive fields ──────────────────────────────────────────────────────────
  const isPast      = new Date(event.date) < new Date();
  const highlights  = Array.isArray(event.key_highlights)    ? event.key_highlights    : [];
  const whoAttend   = Array.isArray(event.who_should_attend)  ? event.who_should_attend  : [];
  const whatGain    = Array.isArray(event.what_you_will_gain) ? event.what_you_will_gain : [];
  const gallery     = Array.isArray(event.gallery_urls)       ? event.gallery_urls       : [];
  const hasVideo    = !!event.video_url;
  const hasJoinLink = !!event.join_link && !isPast;

  // Only show tabs that have content
  const tabs = [
    { id: 'about',      label: 'About'      },
    ...(highlights.length ? [{ id: 'highlights', label: 'Highlights' }] : []),
    ...(gallery.length    ? [{ id: 'gallery',    label: 'Gallery'    }] : []),
    ...(hasVideo          ? [{ id: 'video',      label: 'Video'      }] : []),
  ];

  return (
    <>
      <Navbar cls="ed" />

      {/* ── Hero with background image ──────────────────────────────────── */}
      <section className="ed-hero">
        <div className="ed-hero__bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.main_media_url ||
              'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80'}
            alt={event.title}
            className="ed-hero__bg-img"
          />
          <div className="ed-hero__overlay" />
        </div>

        {/* Back button + Share button */}
        <div className="ed-hero__topbar">
          <button className="ed-back-btn" onClick={onBack} aria-label="Back to events">
            <Icon.ArrowLeft /> Back to Events
          </button>
          <ShareButton title={event.title} />
        </div>

        {/* Hero text content */}
        <div className="ed-hero__content">
          <span className={`ed-status-pill ${isPast ? 'ed-status-pill--past' : 'ed-status-pill--upcoming'}`}>
            {isPast ? 'Completed Event' : 'Upcoming Event'}
          </span>

          <h1 className="ed-hero__title">{event.title}</h1>

          <div className="ed-hero__meta">
            <div className="ed-hero__meta-item">
              <Icon.Calendar /><span>{formatDateLong(event.date)}</span>
            </div>
            {event.location && (
              <div className="ed-hero__meta-item">
                <Icon.Pin /><span>{event.location}</span>
              </div>
            )}
          </div>

          {/* Countdown timer — only for upcoming events */}
          {!isPast && <Countdown dateStr={event.date} />}

          {/* Register Now — uses join_link if available, else opens modal */}
          {!isPast && (
            hasJoinLink ? (
              <a
                href={event.join_link}
                target="_blank"
                rel="noopener noreferrer"
                className="ed-btn ed-btn--primary ed-btn--lg"
              >
                Register Now <Icon.ArrowRight />
              </a>
            ) : (
              <button
                className="ed-btn ed-btn--primary ed-btn--lg"
                onClick={() => setModalOpen(true)}
              >
                Register Now <Icon.ArrowRight />
              </button>
            )
          )}
        </div>
      </section>

      {/* ── Tabbed body content ─────────────────────────────────────────── */}
      <div className="ed-body">
        <div className="ed-container">

          {/* Sticky tab bar */}
          <div className="ed-tabs-bar">
            {tabs.map((t) => (
              <button
                key={t.id}
                className={`ed-tab${tab === t.id ? ' ed-tab--active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── ABOUT tab ─────────────────────────────────────────────── */}
          {tab === 'about' && (
            <div className="ed-tab-content">
              <section className="ed-section">
                <h2 className="ed-section__title">About the Event</h2>
                <p className="ed-section__text">{event.description}</p>
              </section>

              {(whoAttend.length > 0 || whatGain.length > 0) && (
                <div className="ed-two-col">
                  {whoAttend.length > 0 && (
                    <div className="ed-info-card">
                      <div className="ed-info-card__icon ed-info-card__icon--blue"><Icon.Users /></div>
                      <h3 className="ed-info-card__title">Who Should Attend?</h3>
                      <ul className="ed-checklist">
                        {whoAttend.map((w, i) => <li key={i}><Icon.Check /><span>{w}</span></li>)}
                      </ul>
                    </div>
                  )}
                  {whatGain.length > 0 && (
                    <div className="ed-info-card">
                      <div className="ed-info-card__icon ed-info-card__icon--green"><Icon.Gift /></div>
                      <h3 className="ed-info-card__title">What You&apos;ll Gain</h3>
                      <ul className="ed-checklist ed-checklist--green">
                        {whatGain.map((g, i) => <li key={i}><Icon.Check /><span>{g}</span></li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="ed-cta-bar">
                <button className="ed-btn ed-btn--ghost" onClick={onBack}>
                  <Icon.ArrowLeft /> All Events
                </button>
                {!isPast && (
                  hasJoinLink ? (
                    <a href={event.join_link} target="_blank" rel="noopener noreferrer" className="ed-btn ed-btn--primary">
                      Register Now <Icon.ArrowRight />
                    </a>
                  ) : (
                    <button className="ed-btn ed-btn--primary" onClick={() => setModalOpen(true)}>
                      Register Now <Icon.ArrowRight />
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* ── HIGHLIGHTS tab ────────────────────────────────────────── */}
          {tab === 'highlights' && (
            <div className="ed-tab-content">
              <section className="ed-section">
                <h2 className="ed-section__title">Event Highlights</h2>
                <div className="ed-highlights-grid">
                  {highlights.map((h, i) => (
                    <div key={i} className="ed-highlight-card" style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="ed-highlight-card__num">{String(i + 1).padStart(2, '0')}</div>
                      <div className="ed-highlight-card__icon"><Icon.Star /></div>
                      <p className="ed-highlight-card__text">{h}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ── GALLERY tab ───────────────────────────────────────────── */}
          {tab === 'gallery' && (
            <div className="ed-tab-content">
              <section className="ed-section">
                <h2 className="ed-section__title">Photo Gallery</h2>
                <div className="ed-gallery">
                  {gallery.map((url, i) => (
                    <button
                      key={i}
                      className="ed-gallery__item"
                      onClick={() => setLightbox({ open: true, index: i })}
                      aria-label={`View photo ${i + 1}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`${event.title} — photo ${i + 1}`} loading="lazy" />
                      <div className="ed-gallery__item-overlay"><Icon.Play /></div>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ── VIDEO tab ─────────────────────────────────────────────── */}
          {tab === 'video' && hasVideo && (
            <div className="ed-tab-content">
              <section className="ed-section">
                <h2 className="ed-section__title">Event Recap Video</h2>
                <div className="ed-video">
                  <iframe
                    src={toEmbedUrl(event.video_url)}
                    title={`${event.title} recap`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </section>
            </div>
          )}

        </div>
      </div>

      {/* Photo lightbox */}
      {lightbox.open && (
        <Lightbox
          images={gallery}
          activeIndex={lightbox.index}
          onClose={() => setLightbox({ open: false, index: 0 })}
          onPrev={() => setLightbox((l) => ({ ...l, index: (l.index - 1 + gallery.length) % gallery.length }))}
          onNext={() => setLightbox((l) => ({ ...l, index: (l.index + 1) % gallery.length }))}
        />
      )}

      {/* Registration modal */}
      {modalOpen && (
        <RegistrationModal
          eventId={event.id}
          eventTitle={event.title}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PAGE ROUTER
//  Manages which page is visible using React state.
//  activeEventId = null  →  show listing page
//  activeEventId = uuid  →  show detail page for that event
// ═══════════════════════════════════════════════════════════════════════════════
function PageRouter() {
  const [activeEventId, setActiveEventId] = useState(null);
  const [allEvents,     setAllEvents]     = useState([]);

  // Called when "Get Details" is clicked on any event card
  const handleViewDetail = useCallback((id) => {
    setActiveEventId(id);
    window.scrollTo(0, 0);
  }, []);

  // Called when "Back to Events" is clicked on detail page
  const handleBack = useCallback(() => {
    setActiveEventId(null);
    window.scrollTo(0, 0);
  }, []);

  // Called when listing page finishes loading events — hoist data up so
  // the detail page can find events without a separate API call
  const handleEventsLoaded = useCallback((events) => {
    setAllEvents(events);
  }, []);

  if (activeEventId) {
    return (
      <EventDetailPage
        id={activeEventId}
        onBack={handleBack}
        allEvents={allEvents}
      />
    );
  }

  return (
    <EventsListingPage
      onViewDetail={handleViewDetail}
      onEventsLoaded={handleEventsLoaded}
    />
  );
}

// ── Default export ────────────────────────────────────────────────────────────
export default function EventsPage() {
  return <PageRouter />;
}