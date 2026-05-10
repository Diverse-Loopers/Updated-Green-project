'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import './career-analyzer.css';
import NavAuthButtons from '@/components/NavAuthButtons';
import Footer from '@/components/ui/Footer';

export default function CareerAnalyzerPage() {
  const [view, setView] = useState('landing');
  const [step, setStep] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    branch: "",
    year: "1st",
    skillLevel: "Beginner",
    answers: {},
  });
  const [results, setResults] = useState(null);
  const [savedToProfile, setSavedToProfile] = useState(false);

  const CAREER_DETAILS = {
    backend: {
      id: "backend",
      title: "Backend Developer",
      icon: "BE",
      description: "You build the logic, databases, and APIs that power applications. You prefer efficiency and logic over visual design.",
      roadmap: [
        { month: "1-2", topic: "Core Language", desc: "Master Python, Java, or Node.js logic and syntax." },
        { month: "3-4", topic: "Databases", desc: "Learn SQL (PostgreSQL) and NoSQL (MongoDB) basics." },
        { month: "5-6", topic: "APIs & Servers", desc: "Build RESTful APIs using Express or Django." },
        { month: "7+", topic: "Deployment", desc: "Learn Docker, AWS basics, and CI/CD pipelines." },
      ],
    },
    fullstack: {
      id: "fullstack",
      title: "Full Stack Developer",
      icon: "FS",
      description: "The jack-of-all-trades. You enjoy building the entire product, from the user interface to the server logic.",
      roadmap: [
        { month: "1-2", topic: "Frontend Basics", desc: "HTML, CSS, JavaScript, and React." },
        { month: "3-4", topic: "Backend Basics", desc: "Node.js, Express, and connecting to databases." },
        { month: "5-6", topic: "Integration", desc: "Building full CRUD apps and handling state management." },
        { month: "7+", topic: "Advanced", desc: "Next.js, Authentication, and scalable architecture." },
      ],
    },
    data: {
      id: "data",
      title: "Data Analyst",
      icon: "DA",
      description: "You find stories in numbers. You prefer patterns, statistics, and insights over writing software code.",
      roadmap: [
        { month: "1-2", topic: "Excel & SQL", desc: "Master advanced Excel and SQL querying." },
        { month: "3-4", topic: "Visualization", desc: "Learn PowerBI or Tableau to tell stories with data." },
        { month: "5-6", topic: "Python for Data", desc: "Pandas, NumPy, and basic data cleaning." },
        { month: "7+", topic: "Statistics", desc: "Basic statistical modeling and A/B testing." },
      ],
    },
    cybersecurity: {
      id: "cybersecurity",
      title: "Cybersecurity Analyst",
      icon: "CS",
      description: "The digital guardian. You enjoy finding vulnerabilities, protecting systems, and understanding how networks work.",
      roadmap: [
        { month: "1-2", topic: "Networking", desc: "CompTIA Network+ concepts, OSI model, TCP/IP." },
        { month: "3-4", topic: "OS & Linux", desc: "Master Linux command line and Windows administration." },
        { month: "5-6", topic: "Security Basics", desc: "CompTIA Security+, threat analysis, firewalls." },
        { month: "7+", topic: "Tools", desc: "Wireshark, Nmap, and basic penetration testing tools." },
      ],
    },
    qa: {
      id: "qa",
      title: "QA Automation Engineer",
      icon: "QA",
      description: "The quality gatekeeper. You love breaking things to ensure they are fixed before reaching the user.",
      roadmap: [
        { month: "1-2", topic: "Testing Basics", desc: "Manual testing, writing test cases, Jira." },
        { month: "3-4", topic: "Coding for QA", desc: "Java or Python basics specifically for scripting." },
        { month: "5-6", topic: "Automation", desc: "Selenium, Cypress, or Playwright." },
        { month: "7+", topic: "CI Integration", desc: "Running tests in Jenkins or GitHub Actions." },
      ],
    },
  };

  const QUESTIONS = [
    {
      id: "interest",
      text: "What part of technology excites you the most?",
      options: [
        { text: "Building visual interfaces users interact with", scores: { fullstack: 5, backend: 1, qa: 1, data: 0, cybersecurity: 0 } },
        { text: "Designing the hidden logic and data flow", scores: { backend: 5, fullstack: 3, data: 2, cybersecurity: 1, qa: 0 } },
        { text: "Finding patterns and predicting trends", scores: { data: 5, backend: 1, fullstack: 0, cybersecurity: 1, qa: 1 } },
        { text: "Breaking systems to make them stronger", scores: { cybersecurity: 4, qa: 5, backend: 1, data: 0, fullstack: 0 } },
      ],
    },
    {
      id: "activity",
      text: "If you were working on a team project, which task would you volunteer for?",
      options: [
        { text: "Creating the dashboard and buttons", scores: { fullstack: 5, backend: 0, qa: 1, data: 1, cybersecurity: 0 } },
        { text: "Setting up the database and API", scores: { backend: 5, fullstack: 3, data: 2, cybersecurity: 1, qa: 0 } },
        { text: "Analyzing user behavior data", scores: { data: 5, backend: 1, fullstack: 0, cybersecurity: 0, qa: 1 } },
        { text: "Checking for bugs and security holes", scores: { qa: 5, cybersecurity: 5, backend: 1, data: 0, fullstack: 0 } },
      ],
    },
    {
      id: "mindset",
      text: "How do you approach a difficult problem?",
      options: [
        { text: "I construct a solution step-by-step from scratch", scores: { backend: 4, fullstack: 4, data: 1, cybersecurity: 1, qa: 1 } },
        { text: "I look for anomalies and potential points of failure", scores: { cybersecurity: 5, qa: 5, data: 2, backend: 1, fullstack: 0 } },
        { text: "I gather data to see what worked before", scores: { data: 5, backend: 2, fullstack: 1, cybersecurity: 1, qa: 1 } },
      ],
    },
    {
      id: "environment",
      text: "Which work environment sounds best?",
      options: [
        { text: "Fast-paced, building new features daily", scores: { fullstack: 5, backend: 4, data: 1, cybersecurity: 0, qa: 1 } },
        { text: "Stable, ensuring reliability and security", scores: { cybersecurity: 5, qa: 5, backend: 3, data: 2, fullstack: 1 } },
        { text: "Research-heavy, creating reports and insights", scores: { data: 5, backend: 1, cybersecurity: 2, fullstack: 0, qa: 1 } },
      ],
    },
  ];

  const calculateResults = async () => {
    setView('calculating');
    let finalScores = { backend: 0, fullstack: 0, data: 0, cybersecurity: 0, qa: 0 };
    Object.values(formData.answers).forEach((scoreSet) => {
      Object.keys(scoreSet).forEach((career) => { finalScores[career] += scoreSet[career]; });
    });
    if (formData.branch === "CSE" || formData.branch === "IT") {
      finalScores.backend += 2; finalScores.fullstack += 2;
    }
    if (formData.skillLevel === "Beginner") { finalScores.qa += 3; finalScores.data += 1; }
    if (formData.skillLevel === "Advanced") { finalScores.backend += 3; finalScores.cybersecurity += 3; }
    const maxPossible = 30;
    const sortedCareers = Object.entries(finalScores)
      .map(([key, value]) => ({ key, score: Math.min(Math.round((value / maxPossible) * 100), 98), ...CAREER_DETAILS[key] }))
      .sort((a, b) => b.score - a.score);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const insertPayload = {
        student_info: { name: formData.name, branch: formData.branch, year: formData.year },
        answers: formData.answers,
        scores: finalScores,
        top_career: sortedCareers[0]?.key || null,
        top_score: sortedCareers[0]?.score || null,
        created_at: new Date().toISOString(),
      };
      if (user) { insertPayload.user_id = user.id; setSavedToProfile(true); }
      await supabase.from("career_analysis").insert([insertPayload]);
    } catch (error) { console.error("Error saving career analysis:", error); }
    setTimeout(() => {
      setResults({ top: sortedCareers[0], secondary: sortedCareers[1], low: sortedCareers[sortedCareers.length - 1] });
      setView('results');
    }, 2000);
  };

  const handleStartTest = () => { setView('form'); window.scrollTo(0, 0); };
  const handleBack = () => { if (step === 0) { setView('landing'); } else { setStep(step - 1); } };
  const handleRetake = () => {
    setStep(0); setView('landing'); setResults(null);
    setFormData({ name: "", email: "", branch: "", year: "1st", skillLevel: "Beginner", answers: {} });
  };

  const totalSteps = 4 + QUESTIONS.length;
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      {/* NAV */}
      <nav className="ca-nav">
        <div className="ca-nav__inner">
          <a href="/" className="ca-nav__logo">
            <img src="/DIVERSE LOOPERS (1) bg.png" alt="Diverse Loopers" />
          </a>
          <div className="ca-nav__links">
            <a href="/" className="ca-nav__link">Home</a>
            <a href="/#about" className="ca-nav__link">About</a>
            <a href="/events" className="ca-nav__link">Events</a>
            <a href="/courses" className="ca-nav__link">Courses</a>
            <div className="ca-nav__dropdown">
              <a className="ca-nav__link ca-nav__link--active" style={{cursor:'pointer'}}>
                Tools <i className="fa-solid fa-chevron-down" style={{fontSize:'10px',marginLeft:'3px'}}></i>
              </a>
              <div className="ca-nav__dropdown-menu">
                <a href="/career-analyzer" className="active">
                  <i className="fa-solid fa-bullseye"></i> Career Analyzer
                </a>
                <a href="/analyzer">
                  <i className="fa-solid fa-road"></i> Path Analyzer
                </a>
              </div>
            </div>
          </div>
          <div className="ca-nav__actions">
            <NavAuthButtons loginClass="ca-nav__login" signupClass="ca-nav__signup" loginText="Login" profileText="My Profile" />
          </div>
          <button className="ca-nav__hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            <i className={`fa-solid fa-${mobileOpen ? 'xmark' : 'bars'}`} style={{fontSize:'20px'}}></i>
          </button>
        </div>
        <div className={`ca-nav__mobile ${mobileOpen ? 'open' : ''}`}>
          <a href="/">Home</a>
          <a href="/#about">About</a>
          <a href="/events">Events</a>
          <a href="/courses">Courses</a>
          <a href="/career-analyzer">Career Analyzer</a>
          <a href="/analyzer">Path Analyzer</a>
          <NavAuthButtons loginClass="ca-nav__mobile-link" signupClass="ca-nav__mobile-link" loginText="Login" profileText="My Profile" />
        </div>
      </nav>

      {/* LANDING */}
      {view === 'landing' && (
        <>
          {/* Hero */}
          <section className="ca-hero">
            <div className="ca-hero__inner">
              <div className="ca-hero__badge">
                <span></span>
                Career Fit Tool for BTech Students
              </div>
              <h1>Find the Tech Career That <span>Actually Fits You</span></h1>
              <p>
                Not what is trending. Not what others say. But what matches your skills, interests,
                and learning style. A 5–7 minute assessment that gives you a clear career direction.
              </p>
              <button onClick={handleStartTest} className="ca-hero__cta">
                Start Free Career Fit Test <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </section>

          {/* Problem */}
          <section className="ca-problems">
            <div className="ca-problems__inner">
              <h2>Confused about your tech career?</h2>
              <p>You are not alone. Most BTech students struggle with:</p>
              <div className="ca-problems__grid">
                <div className="ca-prob-card">
                  <div className="ca-prob-card__icon">?</div>
                  <h3>Overwhelmed?</h3>
                  <p>Too many options like AI, Web3, Data... we filter the noise.</p>
                </div>
                <div className="ca-prob-card">
                  <div className="ca-prob-card__icon">!</div>
                  <h3>Confused?</h3>
                  <p>Stop relying on generic advice. Get data-backed direction.</p>
                </div>
                <div className="ca-prob-card">
                  <div className="ca-prob-card__icon">+</div>
                  <h3>Get Clarity</h3>
                  <p>A personalized roadmap to your first job.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Dark band */}
          <section className="ca-cta-band">
            <h2>This tool helps you choose smartly — with data.</h2>
            <p>
              Our Career Fit Tool analyzes your interests, aptitude, learning behavior, and current skill level.
              We match you with real tech careers that suit you, not everyone.
            </p>
            <div style={{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap',marginBottom:'0'}}>
              <span style={{padding:'8px 20px',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'24px',fontSize:'13px',fontWeight:'600',color:'#ccc'}}>No generic advice</span>
              <span style={{padding:'8px 20px',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'24px',fontSize:'13px',fontWeight:'600',color:'#ccc'}}>No random personality tests</span>
            </div>
          </section>

          {/* How it works */}
          <section className="ca-how">
            <div className="ca-how__inner">
              <h2>How It Works</h2>
              <div className="ca-how__steps">
                <div className="ca-how__step">
                  <div className="ca-how__step-num">01</div>
                  <h3>Answer smart questions</h3>
                  <p>Takes only 5–7 minutes of your time.</p>
                </div>
                <div className="ca-how__step">
                  <div className="ca-how__step-num">02</div>
                  <h3>Get Fit Scores</h3>
                  <p>See how well different tech careers match you.</p>
                </div>
                <div className="ca-how__step">
                  <div className="ca-how__step-num">03</div>
                  <h3>Get a clear roadmap</h3>
                  <p>Know what to learn next and where to focus.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Outcomes */}
          <section className="ca-outcomes">
            <div className="ca-outcomes__inner">
              <div className="ca-outcomes__grid">
                <div>
                  <h3>What You Will Get</h3>
                  <ul>
                    <li>Your best-fit tech career</li>
                    <li>A backup career option</li>
                    <li>Careers you should avoid for now</li>
                    <li>A clear learning roadmap</li>
                    <li>Confidence in your decision</li>
                  </ul>
                </div>
                <div>
                  <h3>Careers We Cover</h3>
                  <div className="ca-outcomes__tags">
                    <span className="ca-outcomes__tag">Backend Developer</span>
                    <span className="ca-outcomes__tag">Full Stack Developer</span>
                    <span className="ca-outcomes__tag">Data Analyst</span>
                    <span className="ca-outcomes__tag">Cybersecurity Analyst</span>
                    <span className="ca-outcomes__tag">QA Automation Engineer</span>
                    <span className="ca-outcomes__tag" style={{color:'#bbb',borderStyle:'dashed'}}>More coming soon</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section style={{padding:'72px 24px',background:'#111',textAlign:'center'}}>
            <h2 style={{fontSize:'clamp(24px,3.5vw,40px)',fontWeight:'800',color:'#fff',marginBottom:'16px',letterSpacing:'-0.02em'}}>Ready to Find Your Path?</h2>
            <p style={{color:'#aaa',marginBottom:'32px',fontSize:'15px'}}>Stop guessing. Start choosing with clarity.</p>
            <button onClick={handleStartTest} className="ca-hero__cta">
              Start Your Free Career Fit Test <i className="fa-solid fa-arrow-right"></i>
            </button>
          </section>
        </>
      )}

      {/* FORM */}
      {view === 'form' && (
        <div className="ca-form-wrap">
          <div className="ca-progress-bar-wrap">
            <div className="ca-progress-bar">
              <div className="ca-progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          <div className="ca-form-card">
            {step === 0 && (
              <div>
                <h2>Let us get to know you</h2>
                <div className="ca-field">
                  <label>Full Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" />
                </div>
                <div className="ca-field">
                  <label>Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john@college.edu" />
                </div>
                <div className="ca-field-row">
                  <div className="ca-field">
                    <label>Branch</label>
                    <select value={formData.branch} onChange={(e) => setFormData({ ...formData, branch: e.target.value })}>
                      <option value="">Select</option>
                      <option value="CSE">CSE</option>
                      <option value="IT">IT</option>
                      <option value="ECE">ECE</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="ca-field">
                    <label>Year</label>
                    <select value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })}>
                      <option value="1st">1st Year</option>
                      <option value="2nd">2nd Year</option>
                      <option value="3rd">3rd Year</option>
                      <option value="4th">4th Year</option>
                    </select>
                  </div>
                </div>
                <div className="ca-field">
                  <label>Current Tech Skill Level</label>
                  <div className="ca-skill-btns">
                    {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
                      <button key={lvl} type="button" onClick={() => setFormData({ ...formData, skillLevel: lvl })} className={`ca-skill-btn ${formData.skillLevel === lvl ? 'active' : ''}`}>{lvl}</button>
                    ))}
                  </div>
                </div>
                <div className="ca-form-actions">
                  <button className="ca-btn-back" onClick={handleBack}><i className="fa-solid fa-arrow-left"></i> Back</button>
                  <button className="ca-btn-next" onClick={() => setStep(step + 1)} disabled={!formData.name || !formData.branch}>
                    Next Step <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            )}
            {step > 0 && step <= QUESTIONS.length && (
              <div className="ca-q-step">
                <div className="ca-q-label">Question {step} of {QUESTIONS.length}</div>
                <div className="ca-q-text">{QUESTIONS[step - 1].text}</div>
                <div className="ca-q-options">
                  {QUESTIONS[step - 1].options.map((opt, idx) => (
                    <button key={idx} type="button" className="ca-q-option" onClick={() => {
                      const qId = QUESTIONS[step - 1].id;
                      setFormData({ ...formData, answers: { ...formData.answers, [qId]: opt.scores } });
                      setTimeout(() => setStep(step + 1), 200);
                    }}>
                      <span>{opt.text}</span>
                      <div className="ca-radio"></div>
                    </button>
                  ))}
                </div>
                <div className="ca-form-actions">
                  <button className="ca-btn-back" onClick={handleBack}><i className="fa-solid fa-arrow-left"></i> Previous</button>
                </div>
              </div>
            )}
            {step > QUESTIONS.length && (
              <div className="ca-ready">
                <div className="ca-ready__icon">Ready</div>
                <h2>All Set!</h2>
                <p>We have analyzed your inputs. Ready to see your future?</p>
                <div style={{display:'flex',flexDirection:'column',gap:'12px',alignItems:'center'}}>
                  <button onClick={calculateResults} className="ca-btn-next" style={{width:'auto',padding:'13px 36px'}}>
                    Reveal My Career Path <i className="fa-solid fa-arrow-right"></i>
                  </button>
                  <button onClick={handleBack} className="ca-btn-back">Go Back</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CALCULATING */}
      {view === 'calculating' && (
        <div className="ca-calculating">
          <div className="ca-spinner"></div>
          <h2>Analyzing your responses...</h2>
          <p>Computing fit scores</p>
        </div>
      )}

      {/* RESULTS */}
      {view === 'results' && results && (
        <div className="ca-results">
          <div className="ca-results__inner">
            <h1>Your Career Analysis Results</h1>
            <p>Based on your interests, logic style, and patience levels.</p>

            {/* Top match */}
            <div className="ca-result-card">
              <div className="ca-result-card__body">
                <div className="ca-result-card__header">
                  <div>
                    <div className="ca-result-card__match">Best Fit • {results.top.score}% Match</div>
                    <div className="ca-result-card__title-row">
                      <div className="ca-result-card__icon">{results.top.icon}</div>
                      <h2>{results.top.title}</h2>
                    </div>
                  </div>
                  <div className="ca-result-card__score">
                    <div className="ca-result-card__score-num">{results.top.score}%</div>
                    <div className="ca-result-card__score-label">Match Score</div>
                  </div>
                </div>
                <p className="ca-result-card__desc">
                  {results.top.description}<br />
                  <span style={{fontSize:'12px',color:'#999',marginTop:'8px',display:'block'}}>Why? Your answers indicate a preference for this work style.</span>
                </p>
                <div className="ca-roadmap">
                  <h3>Your 6-Month Roadmap</h3>
                  <div className="ca-roadmap__grid">
                    {results.top.roadmap.map((s, idx) => (
                      <div key={idx} className="ca-roadmap__step">
                        <div className="ca-roadmap__month">Month {s.month}</div>
                        <h4>{s.topic}</h4>
                        <p>{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary */}
            <div className="ca-secondary-card">
              <h3>Strong Alternative</h3>
              <div className="ca-secondary-row">
                <div className="ca-secondary-icon">{results.secondary.icon}</div>
                <div>
                  <div className="ca-secondary-title">{results.secondary.title}</div>
                  <div className="ca-secondary-score">{results.secondary.score}% Match</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{textAlign:'center'}}>
              {savedToProfile && (
                <div className="ca-autosave-badge">
                  <i className="fa-solid fa-circle-check"></i> Results automatically saved to your profile!
                </div>
              )}
              <div className="ca-results-actions">
                <a href="/profile" className="ca-btn-primary">
                  <i className="fa-solid fa-user"></i>
                  {savedToProfile ? 'View on Profile' : 'Go to Profile'}
                </a>
                <button onClick={handleRetake} className="ca-btn-ghost">Retake Test</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}