'use client';

import { useState, useEffect } from 'react';
import './about.css';
import { initScrollReveal, registerHybridHustler } from '@/lib/pages/about';
import NavAuthButtons from '@/components/NavAuthButtons';

export default function AboutPage() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [formMessage, setFormMessage] = useState({ text: '', color: '' });

  useEffect(() => {
    const cleanupScroll = initScrollReveal();
    return () => { if (cleanupScroll) cleanupScroll(); };
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormMessage({ text: '', color: '' });
    if (!e.target.checkValidity()) {
      setFormMessage({ text: 'Please fill out all required fields correctly.', color: '#ef4444' });
      return;
    }
    setFormMessage({ text: 'Registering...', color: '#00c851' });
    const formData = new FormData(e.target);
    const result = await registerHybridHustler(formData);
    setFormMessage({ text: result.message, color: result.success ? '#00c851' : '#ef4444' });
    if (result.success) e.target.reset();
  };

  const hustle = [
    { num: 1, title: '1. Learn', desc: 'Start with structured training focused on tools, workflows, and industry standards.', color: '#00c851' },
    { num: 2, title: '2. Apply', desc: 'Complete tasks and internal projects to prove your readiness.', color: '#3b82f6' },
    { num: 3, title: '3. Work', desc: 'Join live projects and contribute as a real team member.', color: '#8b5cf6' },
    { num: 4, title: '4. Earn', desc: 'Get paid based on skill level, work quality, and responsibility.', color: '#f59e0b' },
    { num: 5, title: '5. Grow', desc: 'Build portfolios, gain experience, and unlock advanced opportunities.', color: '#ef4444' },
  ];

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      {/* NAV */}
      <nav className="ab-nav">
        <div className="ab-nav__inner">
          <a href="/" className="ab-nav__logo">
            <img src="/DIVERSE LOOPERS (1) bg.png" alt="Diverse Loopers" />
          </a>
          <div className="ab-nav__links">
            <a href="/" className="ab-nav__link">Home</a>
            <a href="/about" className="ab-nav__link active">About</a>
            <a href="/courses" className="ab-nav__link">Courses</a>
            <a href="/events" className="ab-nav__link">Events</a>
            <a href="/skillsynth" className="ab-nav__link">Community</a>
            <a href="/career-analyzer" className="ab-nav__link">Career Analyzer</a>
          </div>
          <div className="ab-nav__actions">
            <NavAuthButtons loginClass="ab-nav__login" signupClass="ab-nav__signup" />
          </div>
          <button className="ab-nav__hamburger" onClick={() => setShowMobileMenu(!showMobileMenu)} aria-label="Menu">
            <i className={`fas fa-${showMobileMenu ? 'times' : 'bars'}`} style={{ fontSize: '20px' }}></i>
          </button>
        </div>
        <div className={`ab-nav__mobile ${showMobileMenu ? 'open' : ''}`}>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/courses">Courses</a>
          <a href="/events">Events</a>
          <a href="/skillsynth">Community</a>
          <a href="/career-analyzer">Career Analyzer</a>
          <NavAuthButtons loginClass="ab-nav__mobile-link" signupClass="ab-nav__mobile-link" />
        </div>
      </nav>

      {/* HERO */}
      <section className="ab-hero">
        <div className="ab-hero__inner">
          <div className="ab-hero__badge">Student-First Tech & Career Platform</div>
          <h1>Learn Skills. <br /><span>Do Real Work.</span> <br />Earn & Grow.</h1>
          <p>Bridging the gap between college education and real-world careers. Move beyond theory into practical application.</p>
          <div className="ab-hero__actions">
            <a href="#mission" className="ab-btn-green">Our Mission</a>
            <a href="#join-hustle" className="ab-btn-outline">Join the Hustle</a>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section id="mission" className="ab-section ab-section--white">
        <div className="ab-inner">
          <div className="ab-mission-grid">
            <div className="ab-mission-left">
              <span className="ab-section-tag">Who We Are</span>
              <h2>More Than Just a Platform</h2>
              <p>
                Diverse Loopers is built to solve a critical problem: the gap between academic theory and
                industry reality. We help students move beyond textbooks by combining practical skill training,
                real industry projects, and earning opportunities into one structured journey.
              </p>
              <div className="ab-quote">
                "So you don't just learn, you apply, earn, and grow."
              </div>
            </div>
            <div className="ab-mission-cards">
              {[
                { icon: 'RS', title: 'Real Skills', desc: 'Industry-relevant training focused on tools used in the workplace.' },
                { icon: 'LP', title: 'Live Projects', desc: 'Hands-on experience through real client and internal projects.' },
                { icon: 'E', title: 'Earn', desc: 'Performance-based earning opportunities as you grow.' },
                { icon: 'CG', title: 'Career Growth', desc: 'Clear pathways instead of confusion. Build a real portfolio.' },
              ].map((c) => (
                <div className="ab-mission-card" key={c.title}>
                  <div className="ab-mission-card__icon">{c.icon}</div>
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHY WE EXIST */}
      <section className="ab-section ab-section--gray">
        <div className="ab-inner">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="ab-section-tag">The Problem We Solve</span>
            <h2 className="ab-section-title">Why Diverse Loopers Exists</h2>
            <p className="ab-section-sub">We saw a pattern of challenges students face today, and we decided to build the solution.</p>
          </div>
          <div className="ab-why-grid">
            {[
              { problem: 'Students learn concepts but lack real experience.', solution: 'Careers are built through doing real work, not just courses.' },
              { problem: 'Struggling to build meaningful portfolios.', solution: 'Strong portfolios backed by real proof of work.' },
              { problem: 'Want to earn, but lack credible opportunities.', solution: 'Structured earning based on contribution and skill.' },
              { problem: 'Feeling unprepared despite having degrees.', solution: 'Preparation for real professional environments.' },
            ].map((item, i) => (
              <div className="ab-why-card" key={i}>
                <span className="ab-why-card__tag">The Problem</span>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>{item.problem}</p>
                <hr className="ab-why-divider" />
                <span className="ab-why-card__tag ab-why-card__tag--green">Our Solution</span>
                <p style={{ fontSize: '13px', color: '#444', fontWeight: '600' }}>{item.solution}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HYBRID HUSTLE TIMELINE */}
      <section id="hybrid-hustle" className="ab-hustle">
        <div className="ab-hustle__header ab-inner">
          <span className="ab-hustle__tag">The Pathway</span>
          <h2 className="ab-hustle__title">Hybrid <span>Hustle</span></h2>
          <p className="ab-hustle__subtitle">
            Our structured "learn-work-earn" pathway. It's not a shortcut, it's how real careers are built.
          </p>
        </div>
        <div className="ab-timeline">
          {hustle.map((step, i) => (
            <div className="ab-timeline-step" key={step.num}>
              {i % 2 === 0 ? (
                <>
                  <div className="ab-timeline-content">
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                  <div className="ab-timeline-dot" style={{ background: step.color }}>{step.num}</div>
                  <div className="ab-timeline-spacer"></div>
                </>
              ) : (
                <>
                  <div className="ab-timeline-spacer"></div>
                  <div className="ab-timeline-dot" style={{ background: step.color }}>{step.num}</div>
                  <div className="ab-timeline-content">
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* JOIN HYBRID HUSTLE FORM */}
      <section id="join-hustle" className="ab-form-section">
        <div className="ab-form-card">
          <div className="ab-form-header">
            <h2>Become a <span>Hybrid Hustler</span></h2>
            <p>Join our exclusive network and fast-track your path to tech mastery.</p>
          </div>
          <div className="ab-form-box">
            <form onSubmit={handleFormSubmit}>
              <div className="ab-form-grid">
                <div className="ab-field">
                  <label htmlFor="hustler-name">Full Name</label>
                  <input type="text" id="hustler-name" name="name" required placeholder="John Doe" />
                </div>
                <div className="ab-field">
                  <label htmlFor="hustler-college">College Name</label>
                  <input type="text" id="hustler-college" name="college" required placeholder="Your College" />
                </div>
                <div className="ab-field">
                  <label htmlFor="hustler-email">Email ID</label>
                  <input type="email" id="hustler-email" name="email" required placeholder="you@email.com" />
                </div>
                <div className="ab-field">
                  <label htmlFor="hustler-contact">Contact Number</label>
                  <input type="tel" id="hustler-contact" name="contact" required placeholder="+91 98765 43210" />
                </div>
                <div className="ab-field">
                  <label htmlFor="hustler-tech">Core Technology</label>
                  <select id="hustler-tech" name="tech" required>
                    <option value="">Select Technology</option>
                    <option value="AI/ML">AI/ML</option>
                    <option value="WebDev">Web Development (Full Stack)</option>
                    <option value="GameDev">Game Development</option>
                    <option value="AndroidDev">Android Development</option>
                    <option value="DataScience">Data Science</option>
                    <option value="CyberSecurity">Cyber Security</option>
                    <option value="Cloud">Cloud Engineering</option>
                  </select>
                </div>
                <div className="ab-field">
                  <label htmlFor="hustler-year">Course Year</label>
                  <select id="hustler-year" name="year" required>
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>
                <div className="ab-field">
                  <label htmlFor="hustler-semester">Semester</label>
                  <input type="number" id="hustler-semester" name="semester" min="1" max="8" required placeholder="e.g. 4" />
                </div>
                <div className="ab-field">
                  <label htmlFor="hustler-roll">Roll No.</label>
                  <input type="text" id="hustler-roll" name="roll" required placeholder="e.g. 21CS001" />
                </div>
              </div>
              <button type="submit" className="ab-submit">Enroll in the Hustle</button>
              {formMessage.text && (
                <p className="ab-form-msg" style={{ color: formMessage.color }}>{formMessage.text}</p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* TRANSPARENCY & WHO IS THIS FOR */}
      <section className="ab-section ab-section--gray">
        <div className="ab-inner">
          <div className="ab-twin-grid">
            <div className="ab-twin-card">
              <div className="ab-twin-card__header">
                <div className="ab-twin-card__icon">T</div>
                <h3>Transparency Matters</h3>
              </div>
              <p>We are clear and honest with every student. This approach prepares students for real professional expectations, not false promises.</p>
              <ul>
                <li><span className="ab-cross">✗</span> No guaranteed income</li>
                <li><span className="ab-cross">✗</span> No fixed salary for everyone</li>
                <li><span className="ab-check">✓</span> Earnings depend on skills, performance, and project availability</li>
              </ul>
            </div>
            <div className="ab-twin-card">
              <div className="ab-twin-card__header">
                <div className="ab-twin-card__icon">W</div>
                <h3>Who Is This For?</h3>
              </div>
              <p>Diverse Loopers is not for everyone. It is specifically for students who are serious about their future.</p>
              <ul>
                <li><div className="ab-dot"></div> Want real experience, not just certificates</li>
                <li><div className="ab-dot"></div> Are willing to learn by doing</li>
                <li><div className="ab-dot"></div> Want to earn through skill and effort</li>
                <li><div className="ab-dot"></div> Serious about long-term career growth</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* OPPORTUNITIES */}
      <section className="ab-section ab-section--white">
        <div className="ab-inner" style={{ textAlign: 'center' }}>
          <h2 className="ab-section-title">Opportunities Beyond Learning</h2>
          <div className="ab-opps-grid" style={{ marginTop: '40px' }}>
            {[
              { icon: 'L', label: 'Leadership Roles' },
              { icon: 'M', label: 'Mentorship' },
              { icon: 'P', label: 'Company Placements' },
              { icon: 'C', label: 'Core Team Access' },
            ].map((o) => (
              <div className="ab-opp-card" key={o.label}>
                <div className="ab-opp-card__icon">{o.icon}</div>
                <p>{o.label}</p>
              </div>
            ))}
          </div>
          <p className="ab-opp-quote">"For many students, Diverse Loopers becomes more than a platform — it becomes a career launchpad."</p>
        </div>
      </section>

      {/* TOOLS */}
      <section className="ab-section ab-section--gray">
        <div className="ab-inner">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="ab-section-tag">Free Tools</span>
            <h2 className="ab-section-title">Tools By Diverse Loopers For Learners</h2>
            <p className="ab-section-sub">We have created custom tools to enhance the learning experience. These tools are designed to provide data-backed suggestions for your future.</p>
          </div>
          <div className="ab-tools-grid">
            <div className="ab-tool-card">
              <h3 style={{ color: '#00c851' }}>Path Analyzer Tool</h3>
              <p>Analyze your current academic standing and get a calculated roadmap to reach your dream job.</p>
              <div className="ab-tool-features">
                <ul>
                  <li>Skill Gap Analysis</li>
                  <li>Market Trend Matching</li>
                  <li>Course Suggestions</li>
                </ul>
              </div>
              <hr className="ab-tool-divider" />
              <p className="ab-tool-outcome">Outcome: A personalized step-by-step learning path tailored to your specific goals.</p>
              <a href="/analyzer" className="ab-tool-cta">Launch Path Analyzer →</a>
            </div>
            <div className="ab-tool-card">
              <h3 style={{ color: '#3b82f6' }}>Career Analyzer Tool</h3>
              <p>Confused about which tech role fits you? Our logic-based assessment finds your perfect match.</p>
              <div className="ab-tool-features">
                <ul>
                  <li>Interest Mapping</li>
                  <li>Aptitude Scoring</li>
                  <li>6-Month Roadmap</li>
                </ul>
              </div>
              <hr className="ab-tool-divider" />
              <p className="ab-tool-outcome">Outcome: Discover if you are meant for Backend, Data, Cyber Security, Full Stack or any other tech role.</p>
              <a href="/career-analyzer" className="ab-tool-cta" style={{ borderColor: '#3b82f6', color: '#3b82f6' }}>Find My Career →</a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="ab-footer">
        <div className="ab-footer__inner">
          <div className="ab-footer__grid">
            <div className="ab-footer__brand">
              <img src="/DIVERSE LOOPERS (1) bg.png" alt="Diverse Loopers" />
              <p>To help students convert skills into experience, experience into earnings, and earnings into sustainable careers.</p>
            </div>
            <div className="ab-footer__col">
              <h5>Quick Links</h5>
              <ul>
                <li><a href="#mission">Mission</a></li>
                <li><a href="#hybrid-hustle">Hybrid Hustle</a></li>
                <li><a href="#join-hustle">Register</a></li>
                <li><a href="/">Home</a></li>
              </ul>
            </div>
            <div className="ab-footer__col">
              <h5>Our Tools</h5>
              <ul>
                <li><a href="/analyzer">Path Analyzer</a></li>
                <li><a href="/career-analyzer">Career Analyzer</a></li>
                <li><a href="/courses">Courses</a></li>
                <li><a href="/events">Events</a></li>
              </ul>
            </div>
          </div>
          <div className="ab-footer__bottom">
            <p>&copy; 2024 Diverse Loopers. All rights reserved.</p>
            <p>Diverse Loopers — where students grow into industry-ready professionals.</p>
          </div>
        </div>
      </footer>
    </>
  );
}