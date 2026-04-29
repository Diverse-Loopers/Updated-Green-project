'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import './my-courses.css';

export default function MyCoursesPage() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadEnrolledCourses();
  }, []);

  const loadEnrolledCourses = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      window.location.href = '/login';
      return;
    }
    setUser(session.user);

    // Get all enrollments with course data
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('*, courses:course_id(*)')
      .eq('user_id', session.user.id);

    const enrolled = (enrollments || [])
      .map(e => ({
        ...e.courses,
        enrollment_id: e.id,
        enrolled_at: e.created_at,
        payment_status: e.payment_status,
      }))
      .filter(c => c && c.id);

    setCourses(enrolled);
    setLoading(false);
  };

  const filteredCourses = courses.filter(c => {
    if (filter === 'live') return c.has_live_class;
    if (filter === 'completed') return false; // future: track completion
    return true;
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="mc-loading">
        <div className="mc-spinner"></div>
        <p>Loading your courses...</p>
      </div>
    );
  }

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Nav */}
      <nav className="mc-nav">
        <div className="mc-nav-inner">
          <a href="/" className="mc-logo">
            <img src="/DIVERSE LOOPERS (1) bg.png" alt="Diverse Loopers" />
          </a>
          <div className="mc-nav-links">
            <a href="/">Home</a>
            <a href="/courses">Courses</a>
            <a href="/my-courses" className="active">My Courses</a>
            <a href="/profile">Profile</a>
          </div>
          <div className="mc-nav-actions">
            <button onClick={handleLogout} className="mc-logout-btn">Logout</button>
          </div>
        </div>
      </nav>

      <main className="mc-main">
        {/* Hero Banner */}
        <section className="mc-hero">
          <div className="mc-hero-bg">
            <img src="/images/students-learning.png" alt="" />
            <div className="mc-hero-overlay"></div>
          </div>
          <div className="mc-hero-content">
            <h1>My Learning Journey</h1>
            <p>Track your enrolled courses, access live classes, and download study materials all in one place.</p>
            <div className="mc-hero-stats">
              <div className="mc-stat">
                <span className="mc-stat-num">{courses.length}</span>
                <span className="mc-stat-label">Enrolled</span>
              </div>
              <div className="mc-stat">
                <span className="mc-stat-num">{courses.filter(c => c.has_live_class).length}</span>
                <span className="mc-stat-label">Live Classes</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="mc-filters">
          <div className="mc-filter-bar">
            {['all', 'live'].map(f => (
              <button
                key={f}
                className={`mc-filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All Courses' : 'Live Classes'}
              </button>
            ))}
          </div>
        </section>

        {/* Course Grid */}
        <section className="mc-courses-section">
          {filteredCourses.length === 0 ? (
            <div className="mc-empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <h3>No courses found</h3>
              <p>You haven&apos;t enrolled in any courses yet.</p>
              <Link href="/courses" className="mc-browse-btn">Browse Courses</Link>
            </div>
          ) : (
            <div className="mc-grid">
              {filteredCourses.map(course => (
                <div key={course.id} className="mc-card">
                  <div className="mc-card-img">
                    {course.image_url ? (
                      <img src={course.image_url} alt={course.title} />
                    ) : (
                      <div className="mc-card-placeholder" style={{
                        background: course.image_visual || 'linear-gradient(135deg, #667eea, #764ba2)'
                      }}></div>
                    )}
                    {course.has_live_class && (
                      <span className="mc-live-badge">LIVE</span>
                    )}
                  </div>
                  <div className="mc-card-body">
                    <div className="mc-card-meta">
                      {course.category && <span className="mc-tag">{course.category}</span>}
                      {course.level && <span className="mc-level">{course.level}</span>}
                    </div>
                    <h3 className="mc-card-title">{course.title}</h3>
                    <p className="mc-card-desc">
                      {course.description?.substring(0, 100)}{course.description?.length > 100 ? '...' : ''}
                    </p>
                    <div className="mc-card-footer">
                      <span className="mc-enrolled-date">
                        Enrolled {new Date(course.enrolled_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="mc-card-actions">
                      <Link href={`/courses/${course.id}`} className="mc-action-btn mc-action-view">
                        View Course
                      </Link>
                      {course.has_live_class && course.live_class_active && (
                        <Link href={`/courses/${course.id}/live-class`} className="mc-action-btn mc-action-live">
                          Join Class
                        </Link>
                      )}
                      {course.has_live_class && !course.live_class_active && (
                        <span className="mc-action-btn mc-action-offline">
                          Not Live
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mc-footer">
        <p>&copy; 2025 Diverse Loopers. All Rights Reserved.</p>
      </footer>
    </>
  );
}
