// lib/pages/dashboard.js

import { supabase } from '../supabase';

// Theme Management
export function setTheme(isDark) {
    const dot = document.getElementById('theme-toggle-dot');
    const icon = document.getElementById('theme-icon');
    const text = document.getElementById('theme-text');
    
    if (isDark) {
        document.documentElement.classList.add('dark');
        if (dot) dot.classList.add('translate-x-5');
        if (icon) icon.setAttribute('data-lucide', 'sun');
        if (text) text.textContent = 'Light Mode';
    } else {
        document.documentElement.classList.remove('dark');
        if (dot) dot.classList.remove('translate-x-5');
        if (icon) icon.setAttribute('data-lucide', 'moon');
        if (text) text.textContent = 'Dark Mode';
    }
    
    if (typeof window !== 'undefined' && window.lucide) {
        window.lucide.createIcons();
    }
    
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

export function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.onclick = () => {
            const isDark = !document.documentElement.classList.contains('dark');
            setTheme(isDark);
        };
    }
    
    // Load saved theme
    if (localStorage.getItem('theme') === 'dark') {
        setTheme(true);
    }
}

// Sidebar Management
export function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const openBtn = document.getElementById('open-sidebar');
    const closeBtn = document.getElementById('close-sidebar');

    if (openBtn) {
        openBtn.onclick = () => {
            if (sidebar) sidebar.classList.add('open');
            if (overlay) {
                overlay.classList.remove('hidden');
                overlay.classList.add('visible');
            }
        };
    }

    [closeBtn, overlay].forEach(el => {
        if (el) {
            el.onclick = () => {
                if (sidebar) sidebar.classList.remove('open');
                if (overlay) {
                    overlay.classList.add('hidden');
                    overlay.classList.remove('visible');
                }
            };
        }
    });
}

// Hustler Modal
export function toggleHustlerModal(show) {
    const modal = document.getElementById('hustler-modal-overlay');
    if (modal) {
        modal.style.display = show ? 'flex' : 'none';
    }
    
    if (show) {
        // Pre-fill email if user is logged in
        supabase.auth.getUser().then(({ data: { user } }) => {
            const emailInput = document.getElementById('hustler-email');
            if (user && emailInput) {
                emailInput.value = user.email;
            }
        });
    }
}

export async function handleHustlerFormSubmit(event) {
    event.preventDefault();
    
    const btn = document.getElementById('hustler-submit-btn');
    const status = document.getElementById('hustler-form-status');

    if (btn) {
        btn.disabled = true;
        btn.textContent = "Submitting...";
    }
    if (status) status.classList.add('hidden');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        alert("Session expired. Please login again.");
        if (btn) btn.disabled = false;
        return;
    }

    const payload = {
        user_id: user.id,
        full_name: document.getElementById('hustler-name')?.value,
        registration_id: document.getElementById('hustler-reg-id')?.value,
        course_name: document.getElementById('hustler-course')?.value,
        email_id: document.getElementById('hustler-email')?.value
    };

    const { error } = await supabase.from('hustler_id_applications').insert([payload]);

    if (status) {
        if (error) {
            status.textContent = "Error: " + error.message;
            status.className = "text-center text-xs font-bold mt-4 text-red-500 block";
        } else {
            status.textContent = "Application Submitted Successfully! We will review it shortly.";
            status.className = "text-center text-xs font-bold mt-4 text-green-500 block";
            setTimeout(() => toggleHustlerModal(false), 2000);
        }
    }
    
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = `Submit Application <i data-lucide="send" class="w-4 h-4"></i>`;
        if (typeof window !== 'undefined' && window.lucide) {
            window.lucide.createIcons();
        }
    }
}

// Roadmap Rendering
export function renderCompactRoadmap(roadmap) {
    const container = document.getElementById('roadmap-items-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    roadmap.forEach((item, i) => {
        const isEven = i % 2 === 0;
        const node = document.createElement('div');
        node.className = `roadmap-item relative flex items-center md:justify-center w-full min-h-[140px] ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`;
        node.innerHTML = `
            <div class="flex-1 ml-16 md:ml-0 ${isEven ? 'md:text-right md:pr-24' : 'md:text-left md:pl-24'} py-5">
                <div class="glass-card p-6 rounded-[2.5rem] backdrop-blur-xl group hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 active:scale-[0.99] relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-24 h-24 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
                    <div class="relative z-10">
                        <div class="text-[10px] font-black text-primary dark:text-indigo-400 uppercase tracking-[0.3em] mb-2 opacity-80 group-hover:opacity-100 transition-opacity">Mastery Phase ${i + 1}</div>
                        <h4 class="text-lg md:text-xl font-black text-heading mb-2 uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">${item.skill_name}</h4>
                        <p class="text-xs text-body">${item.description}</p>
                    </div>
                </div>
            </div>
            <div class="absolute left-10 md:left-1/2 step-node rounded-2xl -translate-x-1/2 transform shadow-xl border-primary dark:border-indigo-400 text-primary dark:text-indigo-400">
                ${i + 1}
            </div>
            <div class="hidden md:block flex-1"></div>
        `;
        container.appendChild(node);
    });
    
    if (typeof window !== 'undefined' && window.lucide) {
        window.lucide.createIcons();
    }
}

// Career Analysis Roadmap Renderer
export function renderCareerRoadmap(career) {
    const container = document.getElementById('roadmap-items-container');
    const titleEl = document.getElementById('roadmap-title');
    if (!container) return;
    
    if (titleEl) {
        titleEl.innerHTML = `Path to <span class="text-secondary">${career.title}</span>`;
    }
    
    container.innerHTML = '';
    
    career.roadmap.forEach((item, i) => {
        const isEven = i % 2 === 0;
        const node = document.createElement('div');
        node.className = `roadmap-item relative flex items-center md:justify-center w-full min-h-[160px] ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`;
        
        const skillsHtml = item.skills ? `
            <div class="flex flex-wrap gap-1.5 mt-3">
                ${item.skills.map(s => `<span class="px-2 py-0.5 bg-secondary/10 dark:bg-pink-500/10 text-secondary dark:text-pink-400 border border-secondary/20 dark:border-pink-500/20 rounded-md text-[9px] font-bold uppercase tracking-wider">${s}</span>`).join('')}
            </div>
        ` : '';

        const projectHtml = item.project ? `
            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="w-6 h-6 bg-slate-100 dark:bg-white/10 rounded-lg flex items-center justify-center">
                        <i data-lucide="folder-git-2" class="w-3 h-3 text-slate-500 dark:text-slate-300"></i>
                    </div>
                    <span class="text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-tight">Focus Project</span>
                </div>
                <span class="text-[11px] font-black text-slate-900 dark:text-white truncate max-w-[120px]">${item.project}</span>
            </div>
        ` : '';

        node.innerHTML = `
            <div class="flex-1 ml-16 md:ml-0 ${isEven ? 'md:text-right md:pr-24' : 'md:text-left md:pl-24'} py-6">
                <div class="glass-card p-6 md:p-7 rounded-[2.5rem] backdrop-blur-xl group hover:border-secondary/50 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-pink-500/10 active:scale-[0.99] relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-24 h-24 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div class="relative z-10">
                        <div class="flex items-center gap-2 mb-3 opacity-80 group-hover:opacity-100 transition-opacity ${isEven ? 'md:justify-end' : ''}">
                           <span class="text-[9px] font-black bg-slate-100/50 dark:bg-white/10 text-slate-600 dark:text-slate-200 px-2 py-0.5 rounded uppercase tracking-widest">${item.month}</span>
                           <span class="text-[9px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded uppercase tracking-widest border border-emerald-500/20">Beginner Friendly</span>
                        </div>
                        <h4 class="text-lg md:text-xl font-black text-heading mb-2 uppercase tracking-tight leading-tight group-hover:text-secondary transition-colors">${item.topic}</h4>
                        <p class="text-xs md:text-sm text-body mb-3">${item.desc}</p>
                        ${skillsHtml}
                        ${projectHtml}
                    </div>
                </div>
            </div>
            <div class="absolute left-10 md:left-1/2 step-node rounded-2xl -translate-x-1/2 transform shadow-xl border-secondary dark:border-pink-400 text-secondary dark:text-pink-400">
                ${i + 1}
            </div>
            <div class="hidden md:block flex-1"></div>
        `;
        container.appendChild(node);
    });
    
    if (typeof window !== 'undefined' && window.lucide) {
        window.lucide.createIcons();
    }
}

// Load Path Analysis (skill gaps from analyzer)
export async function loadPathAnalysis() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const titleEl = document.getElementById('roadmap-title');
    const container = document.getElementById('roadmap-items-container');

    // Get target role name
    const { data: role } = await supabase.from('target_roles').select('role_name').eq('user_id', user.id).single();
    if (titleEl && role) {
        titleEl.innerHTML = `Path to <span class="text-primary">${role.role_name}</span>`;
    } else if (titleEl) {
        titleEl.textContent = 'Skill Gap Roadmap';
    }

    const { data: latest } = await supabase
        .from('analyses')
        .select('id, match_percentage')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (latest) {
        const { data: roadmap } = await supabase.from('skill_gaps').select('*').eq('analysis_id', latest.id);
        if (roadmap?.length) {
            renderCompactRoadmap(roadmap);
        } else if (container) {
            container.innerHTML = '<div class="text-center py-20 text-slate-400">No path analysis data yet. Run a <a href="/analyzer" class="text-primary font-bold underline">skill gap analysis</a> first.</div>';
        }
    } else if (container) {
        container.innerHTML = '<div class="text-center py-20 text-slate-400">No path analysis data yet. Run a <a href="/analyzer" class="text-primary font-bold underline">skill gap analysis</a> first.</div>';
    }
}

// Career Details (matching career-analyzer)
const CAREER_DETAILS = {
    backend: {
        title: "Backend Developer",
        roadmap: [
            { month: "1-2", topic: "Core Language", desc: "Master Python, Java, or Node.js logic and syntax.", skills: ["Functions", "OOP", "Error Handling"], project: "CLI Task Manager" },
            { month: "3-4", topic: "Databases", desc: "Learn SQL (PostgreSQL) and NoSQL (MongoDB) basics.", skills: ["Schemas", "Queries", "Indexing"], project: "Library DB System" },
            { month: "5-6", topic: "APIs & Servers", desc: "Build RESTful APIs using Express or Django.", skills: ["REST", "Middleware", "Auth"], project: "SaaS API Engine" },
            { month: "7+", topic: "Deployment", desc: "Learn Docker, AWS basics, and CI/CD pipelines.", skills: ["Docker", "S3", "GitHub Actions"], project: "Auto-Deploy Pipeline" },
        ],
    },
    fullstack: {
        title: "Full Stack Developer",
        roadmap: [
            { month: "1-2", topic: "Frontend Basics", desc: "HTML, CSS, JavaScript, and React.", skills: ["Flexbox", "Hooks", "Responsive"], project: "Modern Portfolio" },
            { month: "3-4", topic: "Backend Basics", desc: "Node.js, Express, and connecting to databases.", skills: ["JWT", "MongoDB", "Express"], project: "E-comm Backend" },
            { month: "5-6", topic: "Integration", desc: "Building full CRUD apps and handling state management.", skills: ["Redux", "Axios", "Forms"], project: "Real-time Dashboard" },
            { month: "7+", topic: "Advanced", desc: "Next.js, Authentication, and scalable architecture.", skills: ["SSR", "NextAuth", "Optimizations"], project: "SaaS Starter Kit" },
        ],
    },
    data: {
        title: "Data Analyst",
        roadmap: [
            { month: "1-2", topic: "Excel & SQL", desc: "Master advanced Excel and SQL querying.", skills: ["Pivot Tables", "JOINs", "VLOOKUP"], project: "Sales Report Tool" },
            { month: "3-4", topic: "Visualization", desc: "Learn PowerBI or Tableau to tell stories with data.", skills: ["Charts", "DAX", "Dashboards"], project: "Finance Dashboard" },
            { month: "5-6", topic: "Python for Data", desc: "Pandas, NumPy, and basic data cleaning.", skills: ["Dataframes", "RegEx", "Matplotlib"], project: "Stock Market Tracker" },
            { month: "7+", topic: "Statistics", desc: "Basic statistical modeling and A/B testing.", skills: ["Probability", "Hypothesis", "Regressions"], project: "Customer Churn Model" },
        ],
    },
    cybersecurity: {
        title: "Cybersecurity Analyst",
        roadmap: [
            { month: "1-2", topic: "Networking", desc: "CompTIA Network+ concepts, OSI model, TCP/IP.", skills: ["DNS", "Subnetting", "Protocols"], project: "Network Map" },
            { month: "3-4", topic: "OS & Linux", desc: "Master Linux command line and Windows administration.", skills: ["Bash", "SSH", "User Config"], project: "Secure Linux Server" },
            { month: "5-6", topic: "Security Basics", desc: "CompTIA Security+, threat analysis, firewalls.", skills: ["SIEM", "IDS/IPS", "Encryption"], project: "Threat Log System" },
            { month: "7+", topic: "Tools", desc: "Wireshark, Nmap, and basic penetration testing tools.", skills: ["Packet Capture", "Scanning", "Exploits"], project: "Vulnerability Scan" },
        ],
    },
    qa: {
        title: "QA Automation Engineer",
        roadmap: [
            { month: "1-2", topic: "Testing Basics", desc: "Manual testing, writing test cases, Jira.", skills: ["Test Plans", "Bug Reports", "SDLC"], project: "Manual Bug Hunt" },
            { month: "3-4", topic: "Coding for QA", desc: "Java or Python basics specifically for scripting.", skills: ["Strings", "Loops", "Classes"], project: "Test Scripter" },
            { month: "5-6", topic: "Automation", desc: "Selenium, Cypress, or Playwright.", skills: ["Selectors", "Assertions", "Page Object"], project: "Login Automation" },
            { month: "7+", topic: "CI Integration", desc: "Running tests in Jenkins or GitHub Actions.", skills: ["YAML", "Pipelines", "Reporting"], project: "Nightly Test Suite" },
        ],
    },
};

// Load Career Analysis (from career quiz)
export async function loadCareerAnalysis() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const container = document.getElementById('roadmap-items-container');

    const { data: analysisResults } = await supabase
        .from('career_analysis')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

    const analysis = analysisResults?.[0];

    if (analysis && analysis.scores) {
        // Find the top career from scores
        const topCareer = Object.entries(analysis.scores)
            .sort(([, a], [, b]) => b - a)[0];
        
        const careerKey = topCareer[0];
        const career = CAREER_DETAILS[careerKey];

        if (career) {
            renderCareerRoadmap(career);
        } else if (container) {
            container.innerHTML = '<div class="text-center py-20 text-slate-400">Could not find roadmap for your career result.</div>';
        }
    } else if (container) {
        container.innerHTML = '<div class="text-center py-20 text-slate-400">No career analysis data yet. Take the <a href="/career-analyzer" class="text-secondary font-bold underline">career quiz</a> first.</div>';
    }
}

// Dashboard Data Fetching
export async function fetchDashboardData(userId) {
    try {
        // Profile
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (profile) {
            const welcomeMsg = document.getElementById('welcome-message');
            if (welcomeMsg && profile.full_name) {
                const firstName = profile.full_name.split(' ')[0];
                welcomeMsg.textContent = `Welcome back, ${firstName}!`;
            }
            
            if (profile.avatar_url) {
                const desktopAvatar = document.getElementById('desktop-avatar-img');
                const mobileAvatar = document.getElementById('mobile-nav-img');
                const desktopContainer = document.getElementById('desktop-profile-avatar');
                const mobileContainer = document.getElementById('mobile-nav-avatar');
                
                if (desktopAvatar) {
                    desktopAvatar.src = profile.avatar_url;
                    desktopAvatar.classList.remove('hidden');
                }
                if (mobileAvatar) {
                    mobileAvatar.src = profile.avatar_url;
                    mobileAvatar.classList.remove('hidden');
                }
                if (desktopContainer) desktopContainer.classList.remove('hidden');
                if (mobileContainer) mobileContainer.classList.remove('hidden');
            }
            
            // Prefill modal name
            const hustlerNameInput = document.getElementById('hustler-name');
            if (hustlerNameInput && profile.full_name) {
                hustlerNameInput.value = profile.full_name;
            }
        }

        // Dynamic Time of Day Greeting
        const welcomeEl = document.getElementById('welcome-message');
        if (welcomeEl && profile.full_name) {
            const hour = new Date().getHours();
            let greeting = "Welcome back";
            if (hour >= 5 && hour < 12) greeting = "Good morning";
            else if (hour >= 12 && hour < 17) greeting = "Good afternoon";
            else greeting = "Good evening";
            
            // Get first name
            const firstName = profile.full_name.split(' ')[0];
            welcomeEl.textContent = `${greeting}, ${firstName}!`;
        }

        // Skills
        const { data: skills } = await supabase.from('user_skills').select('skill_name').eq('user_id', userId);
        const skillContainer = document.getElementById('skills-container');
        if (skillContainer) {
            skillContainer.innerHTML = (skills?.length) 
                ? skills.map(s => `<span class="px-3 py-1.5 bg-slate-900/50 dark:bg-black/40 text-white border border-white/10 rounded-full text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 hover:bg-slate-900/80">${s.skill_name}</span>`).join('') 
                : '<p class="text-xs text-muted italic">No skills added yet.</p>';
        }
        // Target Role
        const { data: role } = await supabase.from('target_roles').select('*').eq('user_id', userId).single();
        if (role) {
            const roleNameEl = document.getElementById('target-role-name');
            const roleDescEl = document.getElementById('target-role-desc');
            const roadmapTitleEl = document.getElementById('roadmap-title');
            
            if (roleNameEl) roleNameEl.textContent = role.role_name;
            if (roleDescEl) roleDescEl.textContent = role.description;
            if (roadmapTitleEl) roadmapTitleEl.innerHTML = `Path to <span class="text-primary">${role.role_name}</span>`;
        }

        // Latest Path Analysis
        const { data: latest } = await supabase.from('analyses').select('id, match_percentage').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single();
        if (latest) {
            const matchText = document.getElementById('analysis-match-text');
            const circleFg = document.getElementById('analysis-circle-fg');
            
            if (matchText) matchText.textContent = `${latest.match_percentage}%`;
            if (circleFg) circleFg.style.strokeDasharray = `${latest.match_percentage}, 100`;

            // Roadmap
            const { data: roadmap } = await supabase.from('skill_gaps').select('*').eq('analysis_id', latest.id);
            if (roadmap?.length) {
                renderCompactRoadmap(roadmap);
            }
        }

        // Latest Career Analysis (from career-analyzer quiz)
        const CAREER_NAMES = {
            backend: 'Backend Developer', fullstack: 'Full Stack Developer',
            data: 'Data Analyst', cybersecurity: 'Cybersecurity Analyst', qa: 'QA Automation Engineer',
        };
        const { data: careerResults } = await supabase
            .from('career_analysis')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1);

        const careerAnalysis = careerResults?.[0];

        if (careerAnalysis) {
            // Determine top career (use top_career column if available, else compute from scores)
            let topKey = careerAnalysis.top_career;
            let topScore = careerAnalysis.top_score;
            if (!topKey && careerAnalysis.scores) {
                const sorted = Object.entries(careerAnalysis.scores).sort(([,a],[,b]) => b - a);
                topKey = sorted[0]?.[0];
                topScore = sorted[0]?.[1];
            }

            // Update Top Fit Summary Card
            const topFitContentEl = document.getElementById('top-fit-content');
            if (topFitContentEl && topKey) {
                const careerTitle = CAREER_NAMES[topKey] || topKey;
                const matchPct = topScore ? `${topScore}%` : 'Ready';
                
                // Detailed Career Metadata (Simulated for premium feel)
                const careerMeta = {
                    backend: { salary: "$95k - $160k", demand: "Very High", desc: "Builds the robust foundations of the modern web." },
                    fullstack: { salary: "$90k - $155k", demand: "High", desc: "Crafts end-to-end digital experiences." },
                    data: { salary: "$85k - $145k", demand: "Rising", desc: "Deciphers patterns in global data streams." },
                    cybersecurity: { salary: "$100k - $180k", demand: "Critical", desc: "Shields the digital frontier from threats." },
                    qa: { salary: "$75k - $130k", demand: "Stable", desc: "Ensures flawless software delivery." },
                }[topKey] || { salary: "Competitive", demand: "High", desc: "Path to industrial proficiency." };

                topFitContentEl.innerHTML = `
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <span class="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">Primary Match</span>
                            <span class="text-xl font-black text-slate-900 dark:text-white italic tracking-tighter">${matchPct}</span>
                        </div>
                        <div>
                            <h3 class="text-2xl font-black text-heading uppercase tracking-tight leading-tight mb-2">${careerTitle}</h3>
                            <p class="text-xs text-body font-medium leading-relaxed">${careerMeta.desc}</p>
                        </div>
                        <div class="grid grid-cols-2 gap-3 pt-2">
                            <div class="p-3 bg-slate-100/30 dark:bg-white/10 rounded-2xl border border-slate-100 dark:border-white/10">
                                <div class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Market Demand</div>
                                <div class="text-sm font-black text-indigo-600 dark:text-indigo-400">${careerMeta.demand}</div>
                            </div>
                        </div>
                        <a href="/career-analyzer" class="w-full py-3 bg-slate-200/40 dark:bg-white/20 text-slate-600 dark:text-slate-200 rounded-xl font-bold text-xs hover:bg-slate-200 dark:hover:bg-white/30 transition flex items-center justify-center gap-2">
                            Retake Analysis <i data-lucide="refresh-cw" class="w-3 h-3"></i>
                        </a>
                    </div>
                `;
                
                if (typeof window !== 'undefined' && window.lucide) {
                    window.lucide.createIcons();
                }
            }

            const cardEl = document.getElementById('career-analysis-card');
            const titleEl = document.getElementById('career-analysis-title');
            const scoreEl = document.getElementById('career-analysis-score');
            const dateEl  = document.getElementById('career-analysis-date');
            const branchEl = document.getElementById('career-analysis-branch');

            if (cardEl) cardEl.classList.remove('hidden');
            if (titleEl) titleEl.textContent = CAREER_NAMES[topKey] || topKey || '—';
            if (scoreEl) scoreEl.textContent = `${topScore ?? '—'}% Match`;
            if (dateEl) dateEl.textContent = `Taken on ${new Date(careerAnalysis.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
            if (branchEl && careerAnalysis.student_info?.branch) branchEl.textContent = careerAnalysis.student_info.branch;

            // Animate progress bars
            if (careerAnalysis.scores) {
                const maxScore = 30; // 30 is the max possible score in the quiz
                for (const [key, rawScore] of Object.entries(careerAnalysis.scores)) {
                    const percent = Math.min(Math.round((rawScore / maxScore) * 100), 100);
                    const scoreText = document.getElementById(`career-score-${key}`);
                    const barFill = document.getElementById(`career-bar-fill-${key}`);
                    if (scoreText) scoreText.textContent = `${percent}%`;
                    if (barFill) {
                        setTimeout(() => {
                            barFill.style.width = `${percent}%`;
                        }, 100); // slight delay for mounting animation
                    }
                }
            }
        }

        // Enrollments
        const { data: enroll } = await supabase.from('enrollments').select('*, courses(title)').eq('user_id', userId);
        if (enroll?.length) {
            const mainCourse = enroll[0];
            
            const courseBadge = document.getElementById('course-count-badge');
            const attendanceValue = document.getElementById('attendance-value');
            const attendanceBar = document.getElementById('attendance-bar');
            const performanceValue = document.getElementById('performance-value');
            const performanceBar = document.getElementById('performance-bar');
            const suggestionsText = document.getElementById('suggestions-text');
            
            if (courseBadge) courseBadge.textContent = `${enroll.length} Tracks`;
            if (attendanceValue) attendanceValue.textContent = `${mainCourse.attendance_percentage}%`;
            if (attendanceBar) attendanceBar.style.width = `${mainCourse.attendance_percentage}%`;
            if (performanceValue) performanceValue.textContent = `${mainCourse.performance_score}%`;
            if (performanceBar) performanceBar.style.width = `${mainCourse.performance_score}%`;
            if (suggestionsText) suggestionsText.textContent = mainCourse.suggestions || "Focus on building proof projects.";

            // Projects
            const { data: proj } = await supabase.from('course_projects').select('*').eq('enrollment_id', mainCourse.id);
            const projectsList = document.getElementById('projects-list');
            if (projectsList) {
                projectsList.innerHTML = proj?.map(p => `<div class="p-3 bg-slate-100/30 dark:bg-white/5 rounded-xl text-xs font-bold">${p.project_name}</div>`).join('') || '<p class="text-xs text-slate-400">None started.</p>';
            }

            // Exams
            const { data: exams } = await supabase.from('course_exams').select('*').eq('enrollment_id', mainCourse.id);
            const examsList = document.getElementById('exams-list');
            if (examsList) {
                examsList.innerHTML = exams?.map(e => `<div class="flex justify-between p-2 text-xs font-bold border-b border-slate-50 dark:border-white/5 last:border-0"><span>${e.exam_title}</span><span class="text-secondary">${e.result_grade || 'Pending'}</span></div>`).join('') || '<p class="text-xs text-slate-400">No exams.</p>';
            }
        }

    } catch (e) {
        console.error('Dashboard data fetch error:', e);
    }
}

// Main Initialization
export async function initDashboard() {
    // Set current date
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    // Initialize Lucide icons
    if (typeof window !== 'undefined' && window.lucide) {
        window.lucide.createIcons();
    }

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = '/login';
        return;
    }

    // Setup logout
    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) {
        logoutBtn.onclick = async () => {
            await supabase.auth.signOut();
            window.location.href = '/';
        };
    }

    // Initialize components
    initSidebar();

    // Setup hustler form
    const hustlerForm = document.getElementById('hustler-id-form');
    if (hustlerForm) {
        hustlerForm.onsubmit = handleHustlerFormSubmit;
    }

    // Expose toggleHustlerModal to window for onclick handlers
    if (typeof window !== 'undefined') {
        window.toggleHustlerModal = toggleHustlerModal;
    }

    // Fetch dashboard data
    await fetchDashboardData(user.id);
}