'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import '../courses.css';
import './course-detail.css';
import CheckoutModal from '@/components/CheckoutModal';
import CourseNotes from '@/components/CourseNotes';

function toEmbedUrl(url = '') {
  if (!url) return '';
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
  return url;
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [paymentMsg, setPaymentMsg] = useState(null);

  useEffect(() => {
    if (!id) return;
    loadCourseData();

    // Check payment result from URL
    const payment = searchParams.get('payment');
    if (payment === 'success') {
      setPaymentMsg({ type: 'success', text: 'Payment successful! You are now enrolled.' });
    } else if (payment === 'failed') {
      setPaymentMsg({ type: 'error', text: 'Payment failed. Please try again.' });
    }
  }, [id]);

  const loadCourseData = async () => {
    // Get course
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (!error) setCourse(data);

    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);

      // Check enrollment — try with payment_status first, fallback without
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('course_id', id)
        .eq('payment_status', 'paid')
        .single();

      if (enrollment) {
        setIsEnrolled(true);
      } else {
        // Fallback: check if enrollment exists at all (column might be missing/null)
        const { data: anyEnrollment } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('course_id', id)
          .single();

        if (anyEnrollment) {
          setIsEnrolled(true);
          // Fix the payment_status if it's missing
          if (anyEnrollment.payment_status !== 'paid') {
            await supabase.from('enrollments')
              .update({ payment_status: 'paid' })
              .eq('id', anyEnrollment.id);
          }
        }
      }
    }

    // Get announcements for enrolled students
    const { data: annData } = await supabase
      .from('trainer_announcements')
      .select('*')
      .eq('course_id', id)
      .order('created_at', { ascending: false })
      .limit(10);
    setAnnouncements(annData || []);

    setLoading(false);
  };

  const handleEnrollClick = () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    if (Number(course?.price) <= 0) {
      enrollFree();
    } else {
      setShowCheckout(true);
    }
  };

  const enrollFree = async () => {
    // Try insert first
    const { error: insertErr } = await supabase.from('enrollments').insert({
      user_id: user.id,
      course_id: id,
      payment_status: 'paid',
      amount_paid: 0,
    });

    if (insertErr) {
      // If duplicate, update existing enrollment to 'paid'
      console.log('Insert failed, trying update:', insertErr.message);
      const { error: updateErr } = await supabase.from('enrollments')
        .update({ payment_status: 'paid', amount_paid: 0 })
        .eq('user_id', user.id)
        .eq('course_id', id);

      if (updateErr) {
        console.error('Enrollment update failed:', updateErr);
        setPaymentMsg({ type: 'error', text: 'Enrollment failed. Please try again.' });
        return;
      }
    }

    setIsEnrolled(true);
    setPaymentMsg({ type: 'success', text: 'Enrolled successfully!' });
  };

  if (loading) return (
    <div className="cd-loading">
      <div className="cd-spinner" />
      <p>Loading course...</p>
    </div>
  );

  if (!course) return (
    <div className="cd-loading">
      <p style={{ color: '#888' }}>Course not found.</p>
      <Link href="/courses" className="cd-back-btn" style={{ marginTop: 20 }}>← Back to Courses</Link>
    </div>
  );

  const highlights = Array.isArray(course.key_highlights)
    ? course.key_highlights
    : (course.key_highlights || '').split('\n').filter(Boolean);

  const whoShouldJoin = Array.isArray(course.who_should_join)
    ? course.who_should_join
    : (course.who_should_join || '').split('\n').filter(Boolean);

  const whatYouLearn = Array.isArray(course.what_you_learn)
    ? course.what_you_learn
    : (course.what_you_learn || '').split('\n').filter(Boolean);

  const syllabus = Array.isArray(course.syllabus)
    ? course.syllabus
    : (typeof course.syllabus === 'string'
        ? course.syllabus.split('\n').filter(Boolean).map((t, i) => ({ week: `Week ${i + 1}`, topic: t }))
        : []);

  const gallery = Array.isArray(course.gallery_urls) ? course.gallery_urls : [];
  const embedUrl = toEmbedUrl(course.video_url);
  const price = Number(course.price) || 0;

  return (
    <>
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
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {user ? (
              <a href="/profile" className="nav-btn-login">My Profile</a>
            ) : (
              <a href="/login" className="nav-btn-login">Login</a>
            )}
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
          {user ? <a href="/profile">My Profile</a> : <a href="/login">Login</a>}
        </div>
      </nav>

      {/* Payment Message Toast */}
      {paymentMsg && (
        <div style={{
          position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
          padding: '14px 28px', borderRadius: 14, zIndex: 9999, fontWeight: 700, fontSize: 15,
          background: paymentMsg.type === 'success' ? '#10b981' : '#ef4444', color: '#fff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)', animation: 'fadeInDown 0.3s ease-out',
        }}>
          {paymentMsg.text}
          <button onClick={() => setPaymentMsg(null)} style={{
            marginLeft: 16, background: 'rgba(255,255,255,0.2)', border: 'none',
            borderRadius: 8, padding: '4px 10px', color: '#fff', cursor: 'pointer', fontWeight: 700,
          }}>✕</button>
        </div>
      )}

      <main className="cd-main">
        {/* HERO BANNER */}
        <section className="cd-hero">
          <div className="cd-hero__bg">
            {course.image_url
              ? <img src={course.image_url} alt={course.title} />
              : <div className="cd-hero__placeholder" style={{ background: course.image_visual || 'linear-gradient(135deg,#e8f5e9,#a5d6a7)' }} />
            }
            <div className="cd-hero__overlay" />
          </div>
          <div className="cd-hero__content">
            <Link href="/courses" className="cd-back-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              All Courses
            </Link>
            <div className="cd-hero__badges">
              <span className={`cd-badge ${course.is_live ? 'cd-badge--live' : 'cd-badge--draft'}`}>
                {course.is_live ? '● Live' : 'Coming Soon'}
              </span>
              {course.category && <span className="cd-badge cd-badge--cat">{course.category}</span>}
              {course.language && <span className="cd-badge cd-badge--lang">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                {course.language}
              </span>}
              {price > 0 && <span className="cd-badge" style={{ background: '#4f46e5', color: '#fff' }}>₹{price.toLocaleString('en-IN')}</span>}
            </div>
            <h1 className="cd-hero__title">{course.title}</h1>
            {course.tagline && <p className="cd-hero__tagline">{course.tagline}</p>}
            <div className="cd-hero__meta">
              {course.duration && <span>{course.duration}</span>}
              {course.level && <span>{course.level}</span>}
              {course.instructor && <span>{course.instructor}</span>}
            </div>
            <div className="cd-hero__cta">
              {isEnrolled ? (
                <>
                  <span className="cd-btn-enroll" style={{ background: '#10b981', cursor: 'default' }}>Enrolled</span>
                  {course.has_live_class && course.live_class_active && (
                    <Link href={`/courses/${id}/live-class`} className="cd-btn-enroll" style={{ background: '#ef4444' }}>
                      Join Live Class
                    </Link>
                  )}
                  {course.has_live_class && !course.live_class_active && (
                    <span className="cd-btn-enroll" style={{ background: '#475569', cursor: 'default', opacity: 0.7 }}>
                      Class Not Live
                    </span>
                  )}
                </>
              ) : (
                <button onClick={handleEnrollClick} className="cd-btn-enroll" style={{ border: 'none', cursor: 'pointer' }}>
                  {price > 0 ? `Enroll Now — ₹${price.toLocaleString('en-IN')}` : 'Enroll for Free'} →
                </button>
              )}
              {course.syllabus_pdf && (
                <a href={course.syllabus_pdf} target="_blank" rel="noopener noreferrer" className="cd-btn-outline">
                  Download Syllabus
                </a>
              )}
            </div>
          </div>
        </section>

        <div className="cd-body">
          {/* ABOUT */}
          <section className="cd-section">
            <h2 className="cd-section__title">About This Course</h2>
            <p className="cd-description">{course.description || 'No description available.'}</p>
            {course.long_description && (
              <p className="cd-description" style={{ marginTop: 12 }}>{course.long_description}</p>
            )}
          </section>

          {/* VIDEO */}
          {embedUrl && (
            <section className="cd-section">
              <h2 className="cd-section__title">Course Preview</h2>
              <div className="cd-video-wrap">
                <iframe
                  src={embedUrl}
                  title={course.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </section>
          )}

          {/* KEY HIGHLIGHTS */}
          {highlights.length > 0 && (
            <section className="cd-section">
              <h2 className="cd-section__title">Key Highlights</h2>
              <ul className="cd-list cd-list--green">
                {highlights.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </section>
          )}

          {/* WHAT YOU LEARN */}
          {whatYouLearn.length > 0 && (
            <section className="cd-section">
              <h2 className="cd-section__title">What You Will Learn</h2>
              <div className="cd-learn-grid">
                {whatYouLearn.map((item, i) => (
                  <div key={i} className="cd-learn-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00c851" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SYLLABUS */}
          {syllabus.length > 0 && (
            <section className="cd-section">
              <h2 className="cd-section__title">Course Curriculum</h2>
              <div className="cd-syllabus">
                {syllabus.map((item, i) => (
                  <div key={i} className="cd-syllabus__item">
                    <div className="cd-syllabus__num">{String(i + 1).padStart(2, '0')}</div>
                    <div>
                      <div className="cd-syllabus__week">{item.week || `Module ${i + 1}`}</div>
                      <div className="cd-syllabus__topic">{item.topic || item}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* WHO SHOULD JOIN */}
          {whoShouldJoin.length > 0 && (
            <section className="cd-section">
              <h2 className="cd-section__title">Who Should Join</h2>
              <ul className="cd-list cd-list--blue">
                {whoShouldJoin.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </section>
          )}

          {/* GALLERY */}
          {gallery.length > 0 && (
            <section className="cd-section">
              <h2 className="cd-section__title">Gallery</h2>
              <div className="cd-gallery">
                {gallery.map((url, i) => (
                  <div key={i} className="cd-gallery__item" onClick={() => setLightbox(url)}>
                    <img src={url} alt={`Gallery ${i + 1}`} loading="lazy" />
                    <div className="cd-gallery__overlay">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ANNOUNCEMENTS (Enrolled Only) */}
          {isEnrolled && announcements.length > 0 && (
            <section className="cd-section">
              <h2 className="cd-section__title">Trainer Announcements</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {announcements.map(ann => (
                  <div key={ann.id} style={{
                    background: '#fff', borderRadius: 14, padding: '16px 20px',
                    border: '1px solid #e2e8f0',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div>
                        <span style={{
                          display: 'inline-block', padding: '2px 8px', borderRadius: 12,
                          fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                          background: ann.priority === 'urgent' ? '#fef2f2' : ann.priority === 'high' ? '#fff7ed' : '#eef2ff',
                          color: ann.priority === 'urgent' ? '#dc2626' : ann.priority === 'high' ? '#ea580c' : '#4f46e5',
                          marginBottom: 4,
                        }}>{ann.priority}</span>
                        <h4 style={{ margin: '4px 0 0', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{ann.title}</h4>
                      </div>
                      <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {new Date(ann.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.5, margin: 0 }}>{ann.message}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* COURSE NOTES (Enrolled Only) */}
          <section className="cd-section">
            <CourseNotes courseId={id} isEnrolled={isEnrolled} />
          </section>

          {/* CTA */}
          <section className="cd-section cd-cta-section" id="contact-section">
            <div className="cd-cta-card">
              <h2>Ready to Start Your Journey?</h2>
              <p>Join hundreds of learners already enrolled in this program. Get lifetime access, mentorship and placement guidance.</p>
              <div className="cd-cta-btns">
                {isEnrolled ? (
                  <>
                    <span className="cd-btn-enroll" style={{ background: '#10b981', cursor: 'default' }}>Already Enrolled</span>
                    {course.has_live_class && course.live_class_active && (
                      <Link href={`/courses/${id}/live-class`} className="cd-btn-enroll" style={{ background: '#ef4444' }}>
                        Join Live Class
                      </Link>
                    )}
                    {course.has_live_class && !course.live_class_active && (
                      <span className="cd-btn-enroll" style={{ background: '#475569', cursor: 'default', opacity: 0.7 }}>
                        Class Not Live
                      </span>
                    )}
                  </>
                ) : (
                  <button onClick={handleEnrollClick} className="cd-btn-enroll" style={{ border: 'none', cursor: 'pointer' }}>
                    {price > 0 ? `Enroll Now — ₹${price.toLocaleString('en-IN')}` : 'Enroll for Free'} →
                  </button>
                )}
                <Link href="/courses" className="cd-btn-outline">Browse All Courses</Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* LIGHTBOX */}
      {lightbox && (
        <div className="cd-lightbox" onClick={() => setLightbox(null)}>
          <div className="cd-lightbox__close" onClick={() => setLightbox(null)}>✕</div>
          <img src={lightbox} alt="Full view" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {showCheckout && (
        <CheckoutModal
          course={course}
          userId={user?.id}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            setShowCheckout(false);
            setIsEnrolled(true);
            setPaymentMsg({ type: 'success', text: 'Enrolled successfully!' });
          }}
        />
      )}

      {/* FOOTER */}
      <footer className="cd-footer">
        <p>© 2025 Diverse Loopers. All Rights Reserved.</p>
      </footer>
    </>
  );
}
