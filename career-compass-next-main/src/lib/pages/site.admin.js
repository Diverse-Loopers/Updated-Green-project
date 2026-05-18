// // lib/pages/dashboard.js

// import { supabase } from '../supabase';

// // Theme Management
// export function setTheme(isDark) {
//     const dot = document.getElementById('theme-toggle-dot');
//     const icon = document.getElementById('theme-icon');
//     const text = document.getElementById('theme-text');
    
//     if (isDark) {
//         document.documentElement.classList.add('dark');
//         if (dot) dot.classList.add('translate-x-5');
//         if (icon) icon.setAttribute('data-lucide', 'sun');
//         if (text) text.textContent = 'Light Mode';
//     } else {
//         document.documentElement.classList.remove('dark');
//         if (dot) dot.classList.remove('translate-x-5');
//         if (icon) icon.setAttribute('data-lucide', 'moon');
//         if (text) text.textContent = 'Dark Mode';
//     }
    
//     if (typeof window !== 'undefined' && window.lucide) {
//         window.lucide.createIcons();
//     }
    
//     localStorage.setItem('theme', isDark ? 'dark' : 'light');
// }

// export function initTheme() {
//     const themeToggle = document.getElementById('theme-toggle');
//     if (themeToggle) {
//         themeToggle.onclick = () => {
//             const isDark = !document.documentElement.classList.contains('dark');
//             setTheme(isDark);
//         };
//     }
    
//     // Load saved theme
//     if (localStorage.getItem('theme') === 'dark') {
//         setTheme(true);
//     }
// }

// // Sidebar Management
// export function initSidebar() {
//     const sidebar = document.getElementById('sidebar');
//     const overlay = document.getElementById('sidebar-overlay');
//     const openBtn = document.getElementById('open-sidebar');
//     const closeBtn = document.getElementById('close-sidebar');

//     if (openBtn) {
//         openBtn.onclick = () => {
//             if (sidebar) sidebar.classList.add('open');
//             if (overlay) {
//                 overlay.classList.remove('hidden');
//                 overlay.classList.add('visible');
//             }
//         };
//     }

//     [closeBtn, overlay].forEach(el => {
//         if (el) {
//             el.onclick = () => {
//                 if (sidebar) sidebar.classList.remove('open');
//                 if (overlay) {
//                     overlay.classList.add('hidden');
//                     overlay.classList.remove('visible');
//                 }
//             };
//         }
//     });
// }

// // Hustler Modal
// export function toggleHustlerModal(show) {
//     const modal = document.getElementById('hustler-modal-overlay');
//     if (modal) {
//         modal.style.display = show ? 'flex' : 'none';
//     }
    
//     if (show) {
//         // Pre-fill email if user is logged in
//         supabase.auth.getUser().then(({ data: { user } }) => {
//             const emailInput = document.getElementById('hustler-email');
//             if (user && emailInput) {
//                 emailInput.value = user.email;
//             }
//         });
//     }
// }

// export async function handleHustlerFormSubmit(event) {
//     event.preventDefault();
    
//     const btn = document.getElementById('hustler-submit-btn');
//     const status = document.getElementById('hustler-form-status');

//     if (btn) {
//         btn.disabled = true;
//         btn.textContent = "Submitting...";
//     }
//     if (status) status.classList.add('hidden');

//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) {
//         alert("Session expired. Please login again.");
//         if (btn) btn.disabled = false;
//         return;
//     }

//     const payload = {
//         user_id: user.id,
//         full_name: document.getElementById('hustler-name')?.value,
//         registration_id: document.getElementById('hustler-reg-id')?.value,
//         course_name: document.getElementById('hustler-course')?.value,
//         email_id: document.getElementById('hustler-email')?.value
//     };

//     const { error } = await supabase.from('hustler_id_applications').insert([payload]);

//     if (status) {
//         if (error) {
//             status.textContent = "Error: " + error.message;
//             status.className = "text-center text-xs font-bold mt-4 text-red-500 block";
//         } else {
//             status.textContent = "Application Submitted Successfully! We will review it shortly.";
//             status.className = "text-center text-xs font-bold mt-4 text-green-500 block";
//             setTimeout(() => toggleHustlerModal(false), 2000);
//         }
//     }
    
//     if (btn) {
//         btn.disabled = false;
//         btn.innerHTML = `Submit Application <i data-lucide="send" class="w-4 h-4"></i>`;
//         if (typeof window !== 'undefined' && window.lucide) {
//             window.lucide.createIcons();
//         }
//     }
// }

// // Roadmap Rendering
// export function renderCompactRoadmap(roadmap) {
//     const container = document.getElementById('roadmap-items-container');
//     if (!container) return;
    
//     container.innerHTML = '';
    
//     roadmap.forEach((item, i) => {
//         const isEven = i % 2 === 0;
//         const node = document.createElement('div');
//         node.className = `roadmap-item relative flex items-center md:justify-center w-full ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`;
//         node.innerHTML = `
//             <div class="flex-1 ml-16 md:ml-0 ${isEven ? 'md:text-right md:pr-16' : 'md:text-left md:pl-16'}">
//                 <div class="glass-card p-4 rounded-2xl group hover:border-primary/50">
//                     <h4 class="text-sm font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">${item.skill_name}</h4>
//                     <p class="text-[10px] text-slate-500 leading-tight line-clamp-1 group-hover:line-clamp-none transition-all">${item.description}</p>
//                 </div>
//             </div>
//             <div class="absolute left-10 md:left-1/2 step-node rounded-xl -translate-x-1/2 transform scale-90 md:scale-100 font-black text-[10px] text-primary">
//                 ${i + 1}
//             </div>
//             <div class="hidden md:block flex-1"></div>
//         `;
//         container.appendChild(node);
//     });
    
//     if (typeof window !== 'undefined' && window.lucide) {
//         window.lucide.createIcons();
//     }
// }

// // Dashboard Data Fetching
// export async function fetchDashboardData(userId) {
//     try {
//         // Profile
//         const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
//         if (profile) {
//             const welcomeMsg = document.getElementById('welcome-message');
//             if (welcomeMsg) {
//                 welcomeMsg.textContent = `Welcome back, ${profile.full_name.split(' ')[0]}!`;
//             }
            
//             if (profile.avatar_url) {
//                 const desktopAvatar = document.getElementById('desktop-avatar-img');
//                 const mobileAvatar = document.getElementById('mobile-nav-img');
//                 const desktopContainer = document.getElementById('desktop-profile-avatar');
//                 const mobileContainer = document.getElementById('mobile-nav-avatar');
                
//                 if (desktopAvatar) desktopAvatar.src = profile.avatar_url;
//                 if (mobileAvatar) mobileAvatar.src = profile.avatar_url;
//                 if (desktopContainer) desktopContainer.classList.remove('hidden');
//                 if (mobileContainer) mobileContainer.classList.remove('hidden');
//             }
            
//             // Prefill modal name
//             const hustlerNameInput = document.getElementById('hustler-name');
//             if (hustlerNameInput) hustlerNameInput.value = profile.full_name;
//         }

//         // Skills
//         const { data: skills } = await supabase.from('user_skills').select('skill_name').eq('user_id', userId);
//         const skillContainer = document.getElementById('skills-container');
//         if (skillContainer) {
//             skillContainer.innerHTML = (skills?.length) 
//                 ? skills.map(s => `<span class="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full text-[10px] font-bold uppercase">${s.skill_name}</span>`).join('') 
//                 : '<p class="text-xs text-slate-400">Add skills...</p>';
//         }

//         // Target Role
//         const { data: role } = await supabase.from('target_roles').select('*').eq('user_id', userId).single();
//         if (role) {
//             const roleNameEl = document.getElementById('target-role-name');
//             const roleDescEl = document.getElementById('target-role-desc');
//             const roadmapTitleEl = document.getElementById('roadmap-title');
            
//             if (roleNameEl) roleNameEl.textContent = role.role_name;
//             if (roleDescEl) roleDescEl.textContent = role.description;
//             if (roadmapTitleEl) roadmapTitleEl.innerHTML = `Path to <span class="text-primary">${role.role_name}</span>`;
//         }

//         // Latest Analysis
//         const { data: latest } = await supabase.from('analyses').select('id, match_percentage').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single();
//         if (latest) {
//             const matchText = document.getElementById('analysis-match-text');
//             const circleFg = document.getElementById('analysis-circle-fg');
            
//             if (matchText) matchText.textContent = `${latest.match_percentage}%`;
//             if (circleFg) circleFg.style.strokeDasharray = `${latest.match_percentage}, 100`;

//             // Roadmap
//             const { data: roadmap } = await supabase.from('skill_gaps').select('*').eq('analysis_id', latest.id);
//             if (roadmap?.length) {
//                 renderCompactRoadmap(roadmap);
//             }
//         }

//         // Enrollments
//         const { data: enroll } = await supabase.from('enrollments').select('*, courses(title)').eq('user_id', userId);
//         if (enroll?.length) {
//             const mainCourse = enroll[0];
            
//             const courseBadge = document.getElementById('course-count-badge');
//             const attendanceValue = document.getElementById('attendance-value');
//             const attendanceBar = document.getElementById('attendance-bar');
//             const performanceValue = document.getElementById('performance-value');
//             const performanceBar = document.getElementById('performance-bar');
//             const suggestionsText = document.getElementById('suggestions-text');
            
//             if (courseBadge) courseBadge.textContent = `${enroll.length} Tracks`;
//             if (attendanceValue) attendanceValue.textContent = `${mainCourse.attendance_percentage}%`;
//             if (attendanceBar) attendanceBar.style.width = `${mainCourse.attendance_percentage}%`;
//             if (performanceValue) performanceValue.textContent = `${mainCourse.performance_score}%`;
//             if (performanceBar) performanceBar.style.width = `${mainCourse.performance_score}%`;
//             if (suggestionsText) suggestionsText.textContent = mainCourse.suggestions || "Focus on building proof projects.";

//             // Projects
//             const { data: proj } = await supabase.from('course_projects').select('*').eq('enrollment_id', mainCourse.id);
//             const projectsList = document.getElementById('projects-list');
//             if (projectsList) {
//                 projectsList.innerHTML = proj?.map(p => `<div class="p-3 bg-slate-50 dark:bg-white/5 rounded-xl text-xs font-bold">${p.project_name}</div>`).join('') || '<p class="text-xs text-slate-400">None started.</p>';
//             }

//             // Exams
//             const { data: exams } = await supabase.from('course_exams').select('*').eq('enrollment_id', mainCourse.id);
//             const examsList = document.getElementById('exams-list');
//             if (examsList) {
//                 examsList.innerHTML = exams?.map(e => `<div class="flex justify-between p-2 text-xs font-bold border-b border-slate-50 dark:border-white/5 last:border-0"><span>${e.exam_title}</span><span class="text-secondary">${e.result_grade || 'Pending'}</span></div>`).join('') || '<p class="text-xs text-slate-400">No exams.</p>';
//             }
//         }

//     } catch (e) {
//         console.error('Dashboard data fetch error:', e);
//     }
// }

// // Main Initialization
// export async function initDashboard() {
//     // Set current date
//     const dateEl = document.getElementById('current-date');
//     if (dateEl) {
//         dateEl.textContent = new Date().toLocaleDateString('en-US', { 
//             weekday: 'long', 
//             month: 'long', 
//             day: 'numeric' 
//         });
//     }

//     // Initialize Lucide icons
//     if (typeof window !== 'undefined' && window.lucide) {
//         window.lucide.createIcons();
//     }

//     // Check authentication
//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) {
//         window.location.href = '/login';
//         return;
//     }

//     // Setup logout
//     const logoutBtn = document.getElementById('logout-button');
//     if (logoutBtn) {
//         logoutBtn.onclick = async () => {
//             await supabase.auth.signOut();
//             window.location.href = '/';
//         };
//     }

//     // Initialize components
//     initTheme();
//     initSidebar();

//     // Setup hustler form
//     const hustlerForm = document.getElementById('hustler-id-form');
//     if (hustlerForm) {
//         hustlerForm.onsubmit = handleHustlerFormSubmit;
//     }

//     // Expose toggleHustlerModal to window for onclick handlers
//     if (typeof window !== 'undefined') {
//         window.toggleHustlerModal = toggleHustlerModal;
//     }

//     // Fetch dashboard data
//     await fetchDashboardData(user.id);
// }

import { supabase } from '../supabase';

let allUsers = [];
let allSkills = [];
let allEvents = [];
let allCourses = [];
let allFame = [];
let allJobPostings = [];
let allAnnouncements = [];
let allCoupons = [];
let allTrainers = [];

// --- Initialize Lucide Icons ---
export function initLucideIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// --- Set Current Date ---
export function setCurrentDate() {
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });
    }
}

// --- Mobile Menu Interaction ---
export function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (sidebar) sidebar.classList.toggle('sidebar-open');
    if (overlay) overlay.classList.toggle('hidden');
}

export function initSidebarListeners() {
    const openBtn = document.getElementById('open-sidebar');
    const closeBtn = document.getElementById('close-sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (openBtn) openBtn.onclick = toggleSidebar;
    if (closeBtn) closeBtn.onclick = toggleSidebar;
    if (overlay) overlay.onclick = toggleSidebar;
}

// --- Custom Dialog Logic ---
export function showMessageBox(message) {
    const messageBoxText = document.getElementById('message-box-text');
    const dialogOverlay = document.getElementById('dialog-overlay');
    const messageBox = document.getElementById('message-box');

    if (messageBoxText) messageBoxText.textContent = message;
    if (dialogOverlay) dialogOverlay.style.display = 'block';
    if (messageBox) messageBox.style.display = 'block';
}

export function closeMsg() {
    const dialogOverlay = document.getElementById('dialog-overlay');
    const messageBox = document.getElementById('message-box');
    const confirmBox = document.getElementById('confirm-box');

    if (dialogOverlay) dialogOverlay.style.display = 'none';
    if (messageBox) messageBox.style.display = 'none';
    if (confirmBox) confirmBox.style.display = 'none';
}

export function showConfirmBox(title, message, onConfirm) {
    const confirmBoxTitle = document.getElementById('confirm-box-title');
    const confirmBoxText = document.getElementById('confirm-box-text');
    const dialogOverlay = document.getElementById('dialog-overlay');
    const confirmBox = document.getElementById('confirm-box');
    const confirmOkBtn = document.getElementById('confirm-ok-btn');
    const confirmCancelBtn = document.getElementById('confirm-cancel-btn');

    if (confirmBoxTitle) confirmBoxTitle.textContent = title;
    if (confirmBoxText) confirmBoxText.textContent = message;
    if (dialogOverlay) dialogOverlay.style.display = 'block';
    if (confirmBox) confirmBox.style.display = 'block';

    if (confirmOkBtn) {
        confirmOkBtn.onclick = () => {
            onConfirm();
            closeMsg();
        };
    }
    if (confirmCancelBtn) confirmCancelBtn.onclick = closeMsg;
}

// --- View Logic ---
export function switchView(viewName) {
    const sections = ['dashboard', 'events', 'users', 'skills', 'courses', 'fame', 'Job-Postings', 'announcements', 'coupons', 'trainers', 'business-cms'];
    sections.forEach(s => {
        const view = document.getElementById(`${s}-view`);
        const nav = document.getElementById(`nav-${s}`);
        if (view) view.classList.add('hidden');
        if (nav) nav.classList.remove('active');
    });

    const currentView = document.getElementById(`${viewName}-view`);
    const currentNav = document.getElementById(`nav-${viewName}`);
    if (currentView) currentView.classList.remove('hidden');
    if (currentNav) currentNav.classList.add('active');

    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth < 1024 && sidebar && sidebar.classList.contains('sidebar-open')) {
        toggleSidebar();
    }

    const mainScrollArea = document.getElementById('main-scroll-area');
    if (mainScrollArea) mainScrollArea.scrollTop = 0;

    if (viewName === 'dashboard') { 
        loadDashboardStats(); 
        loadActivityFeed(); 
        loadSignupChartData(); 
    }
    if (viewName === 'users') loadAllUsers();
    if (viewName === 'skills') loadAllSkills();
    if (viewName === 'events') loadAllEvents();
    if (viewName === 'courses') { loadAllCourses(); populateTrainerDropdown(); }
    if (viewName === 'fame') loadFameWall();
    if (viewName === 'Job-Postings') loadAllJobPostings();
    if (viewName === 'announcements') loadAllAnnouncements();
    if (viewName === 'coupons') loadAllCoupons();
    if (viewName === 'trainers') loadAllTrainers();
    if (viewName === 'business-cms') loadBusinessCMS();
    
    initLucideIcons();
}

// --- Auth Guard ---
export async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { 
        window.location.href = '/admin'; 
        return; 
    }

    const { data: adminCheck } = await supabase.from('admin_list').select('user_id').eq('user_id', user.id).limit(1);
    if (!adminCheck || adminCheck.length === 0) {
        await supabase.auth.signOut();
        window.location.href = '/admin';
        return;
    }
    switchView('dashboard');
}

// --- Image Upload Helpers ---
async function uploadImage(file, bucket, prefix) {
    if (!file) return null;
    const fExt = file.name.split('.').pop();
    const fPath = `${prefix}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fExt}`;
    const { data, error } = await supabase.storage.from(bucket).upload(fPath, file);
    if (error) { 
        showMessageBox('Upload Error: ' + error.message); 
        return null; 
    }
    const { data: url } = supabase.storage.from(bucket).getPublicUrl(fPath);
    return url.publicUrl;
}

// --- DASHBOARD ---
async function loadDashboardStats() {
    const { count: uCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: aCount } = await supabase.from('analyses').select('*', { count: 'exact', head: true });
    const { count: eCount } = await supabase.from('events').select('*', { count: 'exact', head: true });

    const totalUsers = document.getElementById('total-users');
    const totalAnalyses = document.getElementById('total-analyses');
    const totalEvents = document.getElementById('total-events');

    if (totalUsers) totalUsers.textContent = uCount || 0;
    if (totalAnalyses) totalAnalyses.textContent = aCount || 0;
    if (totalEvents) totalEvents.textContent = eCount || 0;

    const { data: avg } = await supabase.from('analyses').select('match_percentage');
    if (avg?.length) {
        const sum = avg.reduce((a, b) => a + (b.match_percentage || 0), 0);
        const avgMatch = document.getElementById('avg-match');
        if (avgMatch) avgMatch.textContent = `${Math.round(sum / avg.length)}%`;
    }
}

async function loadActivityFeed() {
    const { data } = await supabase.from('profiles').select('full_name, created_at').order('created_at', { ascending: false }).limit(5);
    const feed = document.getElementById('activity-feed');
    if (feed) {
        feed.innerHTML = (data || []).map(item => `
            <li class="flex items-start gap-4">
                <div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0 text-primary font-bold text-xs uppercase">${(item.full_name || 'U')[0]}</div>
                <div>
                    <p class="text-xs md:text-sm font-bold text-slate-800">${item.full_name || 'A talent'} <span class="font-normal text-slate-500">joined.</span></p>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">${new Date(item.created_at).toLocaleTimeString()}</p>
                </div>
            </li>
        `).join('');
    }
}

async function loadSignupChartData() {
    const { data, error } = await supabase.rpc('get_daily_user_signups');
    if (error || !data) return;
    
    const grid = document.getElementById('chart-grid');
    const labels = document.getElementById('chart-labels');
    
    if (!grid || !labels) return;
    
    grid.innerHTML = '';
    labels.innerHTML = '';

    const max = Math.max(...data.map(d => d.count), 1);
    data.slice(-7).forEach(d => {
        const bar = document.createElement('div');
        bar.className = 'flex-1 bg-primary rounded-t-lg transition-all duration-700 h-0 hover:bg-indigo-400 cursor-help';
        bar.title = `${d.count} signups`;
        setTimeout(() => bar.style.height = `${(d.count / max) * 100}%`, 100);
        grid.appendChild(bar);

        const label = document.createElement('span');
        label.className = 'flex-1 text-center';
        label.textContent = d.signup_day.split('-').slice(1).reverse().join('/');
        labels.appendChild(label);
    });
}

// --- COURSE MANAGEMENT ---
// async function loadAllCourses() {
//     const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
//     allCourses = data || [];
//     const grid = document.getElementById('courses-grid-display');
//     if (grid) {
//         grid.innerHTML = allCourses.map(c => `
//             <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group">
//                 <div class="h-40 bg-slate-100 relative overflow-hidden">
//                     <img src="${c.image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3'}" class="w-full h-full object-cover group-hover:scale-110 transition duration-700">
//                     <span class="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${c.is_live ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}">
//                         ${c.is_live ? 'Live' : 'Draft'}
//                     </span>
//                 </div>
//                 <div class="p-6 flex-grow">
//                     <h4 class="text-base md:text-lg font-bold text-slate-900 mb-2 line-clamp-1">${c.title}</h4>
//                     <p class="text-xs text-slate-500 line-clamp-2 mb-6 font-medium">${c.description}</p>
//                     <div class="flex gap-2">
//                         <button onclick="window.editCourse('${c.id}')" class="flex-1 py-2 bg-indigo-50 text-primary rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition">Edit</button>
//                         <button onclick="window.deleteCourse('${c.id}')" class="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition">Del</button>
//                     </div>
//                 </div>
//             </div>
//         `).join('');
//     }
// }

async function loadAllCourses() {
    try {
        console.log("📡 Loading courses from Supabase...");

        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("❌ Supabase Error (courses):", error);
            showMessageBox("Failed to load courses: " + error.message);
            return;
        }

        console.log("✅ Courses Loaded:", data);

        allCourses = data || [];

        const grid = document.getElementById('courses-grid-display');
        if (!grid) return;

        // If no courses
        if (allCourses.length === 0) {
            grid.innerHTML = `
                <div class="text-center text-slate-400 py-10 font-semibold">
                    No courses found.
                </div>
            `;
            return;
        }

        grid.innerHTML = allCourses.map(c => {
            const assignedTrainer = allTrainers.find(t => t.user_id === c.trainer_id);
            const trainerLabel = assignedTrainer ? assignedTrainer.full_name : null;
            return `
            <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group">
                <div class="h-40 bg-slate-100 relative overflow-hidden">
                    <img 
                        src="${c.image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3'}" 
                        class="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                        onerror="this.src='https://via.placeholder.com/400x200'"
                    >
                    <span class="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${c.is_live ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}">
                        ${c.is_live ? 'Live' : 'Draft'}
                    </span>
                </div>

                <div class="p-6 flex-grow">
                    <h4 class="text-base md:text-lg font-bold text-slate-900 mb-2 line-clamp-1">
                        ${c.title || 'Untitled Course'}
                    </h4>

                    <p class="text-xs text-slate-500 line-clamp-2 mb-3 font-medium">
                        ${c.description || 'No description available'}
                    </p>

                    <div class="mb-4">
                        ${trainerLabel
                            ? `<span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-[11px] font-bold">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                                ${trainerLabel}
                               </span>`
                            : `<span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-400 rounded-lg text-[11px] font-semibold">No trainer assigned</span>`
                        }
                    </div>

                    <div class="flex gap-2">
                        <button onclick="window.editCourse('${c.id}')" class="flex-1 py-2 bg-indigo-50 text-primary rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition">
                            Edit
                        </button>

                        <button onclick="window.deleteCourse('${c.id}')" class="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition">
                            Del
                        </button>
                    </div>
                </div>
            </div>
        `; }).join('');

    } catch (err) {
        console.error("🔥 Unexpected Error:", err);
        showMessageBox("Unexpected error while loading courses.");
    }
}


export function editCourse(id) {
    const c = allCourses.find(item => item.id === id);
    if (!c) return;

    const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val || ''; };
    const setArr = (elId, val) => {
        const el = document.getElementById(elId);
        if (!el) return;
        el.value = Array.isArray(val) ? val.join('\n') : (val || '');
    };

    set('course-id', c.id);
    set('course-title', c.title);
    set('course-tagline', c.tagline);
    set('course-desc', c.description);
    set('course-long-desc', c.long_description);
    set('course-category', c.category);
    set('course-language', c.language);
    set('course-level', c.level);
    set('course-duration', c.duration);
    set('course-instructor', c.instructor);
    set('course-image-url', c.image_url);
    set('course-video-url', c.video_url);
    set('course-enroll-link', c.enroll_link);
    set('course-syllabus-pdf', c.syllabus_pdf);
    setArr('course-highlights', c.key_highlights);
    setArr('course-what-learn', c.what_you_learn);
    setArr('course-syllabus', Array.isArray(c.syllabus) ? c.syllabus.map(s => s.topic || s) : c.syllabus);
    setArr('course-who-join', c.who_should_join);
    setArr('course-gallery-urls', c.gallery_urls);

    const isLiveEl = document.getElementById('course-is-live');
    if (isLiveEl) isLiveEl.value = c.is_live ? 'true' : 'false';

    let unit = 'Week';
    if (Array.isArray(c.syllabus) && c.syllabus.length > 0 && c.syllabus[0].week) {
        const parts = c.syllabus[0].week.split(' ');
        if (parts.length > 0) {
            const possibleUnit = parts[0];
            const allowedUnits = ['Session', 'Hour', 'Day', 'Week', 'Month', 'Year'];
            if (allowedUnits.includes(possibleUnit)) {
                unit = possibleUnit;
            }
        }
    }
    const unitEl = document.getElementById('course-curriculum-unit');
    if (unitEl) unitEl.value = unit;

    const formTitle = document.getElementById('course-form-title');
    const saveBtn = document.getElementById('course-save-btn');
    if (formTitle) formTitle.textContent = 'Update Course Details';
    if (saveBtn) saveBtn.innerHTML = '<i data-lucide="save" class="w-4 h-4"></i> Apply Changes';
    initLucideIcons();

    // Set price, live class, trainer fields
    const priceEl = document.getElementById('course-price');
    if (priceEl) priceEl.value = c.price || 0;
    const liveClassEl = document.getElementById('course-has-live-class');
    if (liveClassEl) liveClassEl.value = c.has_live_class ? 'true' : 'false';
    const trainerIdEl = document.getElementById('course-trainer-id');
    if (trainerIdEl) trainerIdEl.value = c.trainer_id || '';

    const mainScrollArea = document.getElementById('main-scroll-area');
    if (mainScrollArea) mainScrollArea.scrollTop = 0;
}

export function resetCourseForm() {
    const courseForm = document.getElementById('course-form');
    if (courseForm) courseForm.reset();

    const ids = ['course-id', 'course-title', 'course-tagline', 'course-desc', 'course-long-desc',
        'course-category', 'course-language', 'course-level', 'course-duration', 'course-instructor',
        'course-image-url', 'course-video-url', 'course-enroll-link', 'course-syllabus-pdf',
        'course-highlights', 'course-what-learn', 'course-syllabus', 'course-who-join', 'course-gallery-urls'];
    ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });

    const unitEl = document.getElementById('course-curriculum-unit');
    if (unitEl) unitEl.value = 'Week';

    const formTitle = document.getElementById('course-form-title');
    const saveBtn = document.getElementById('course-save-btn');
    if (formTitle) formTitle.textContent = 'Configure New Course';
    if (saveBtn) saveBtn.innerHTML = '<i data-lucide="save" class="w-4 h-4"></i> Publish Course';
    initLucideIcons();
}

export async function handleCourseFormSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('course-save-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }

    const id = document.getElementById('course-id')?.value;

    // Handle image upload
    const file = document.getElementById('course-image')?.files[0];
    let imageUrl = document.getElementById('course-image-url')?.value;
    if (file) imageUrl = await uploadImage(file, 'course-images', 'main');

    // Helper: textarea → array
    const toArr = (elId) => {
        const val = document.getElementById(elId)?.value || '';
        return val.split('\n').map(s => s.trim()).filter(Boolean);
    };

    // Syllabus: plain text lines → [{week, topic}]
    const syllabusLines = toArr('course-syllabus');
    const unitType = document.getElementById('course-curriculum-unit')?.value || 'Week';
    const syllabusArr = syllabusLines.map((t, i) => ({ week: `${unitType} ${i + 1}`, topic: t }));

    // Get trainer_id — ensure empty string becomes null
    const rawTrainerId = document.getElementById('course-trainer-id')?.value;
    const trainerId = rawTrainerId && rawTrainerId.trim() !== '' ? rawTrainerId.trim() : null;

    const payload = {
        title:            document.getElementById('course-title')?.value?.trim(),
        tagline:          document.getElementById('course-tagline')?.value?.trim() || null,
        description:      document.getElementById('course-desc')?.value?.trim(),
        long_description: document.getElementById('course-long-desc')?.value?.trim() || null,
        category:         document.getElementById('course-category')?.value?.trim() || null,
        language:         document.getElementById('course-language')?.value?.trim() || null,
        level:            document.getElementById('course-level')?.value || null,
        duration:         document.getElementById('course-duration')?.value?.trim() || null,
        instructor:       document.getElementById('course-instructor')?.value?.trim() || null,
        is_live:          document.getElementById('course-is-live')?.value === 'true',
        image_url:        imageUrl || null,
        video_url:        document.getElementById('course-video-url')?.value?.trim() || null,
        enroll_link:      document.getElementById('course-enroll-link')?.value?.trim() || null,
        syllabus_pdf:     document.getElementById('course-syllabus-pdf')?.value?.trim() || null,
        key_highlights:   toArr('course-highlights'),
        what_you_learn:   toArr('course-what-learn'),
        syllabus:         syllabusArr,
        who_should_join:  toArr('course-who-join'),
        gallery_urls:     toArr('course-gallery-urls'),
        price:            Number(document.getElementById('course-price')?.value) || 0,
        has_live_class:   document.getElementById('course-has-live-class')?.value === 'true',
        trainer_id:       trainerId,
    };

    console.log('📡 Saving course payload:', JSON.stringify({ id, trainer_id: trainerId }));

    let result;
    if (id) {
        result = await supabase.from('courses').update(payload).eq('id', id).select();
    } else {
        result = await supabase.from('courses').insert([payload]).select();
    }

    const { data: savedData, error } = result;

    console.log('📡 Save result:', { savedData, error });

    if (error) {
        console.error('❌ Course save error:', error);
        showMessageBox('Database Error: ' + error.message);
    } else if (savedData && savedData.length > 0 && savedData[0].trainer_id !== trainerId) {
        // FK constraint silently rejected the trainer_id
        console.error('⚠️ trainer_id was rejected by FK constraint. Sent:', trainerId, 'Got:', savedData[0].trainer_id);
        showMessageBox('Warning: The selected trainer could not be assigned. The trainer may not have a valid login account. Please ensure the trainer has signed up first.');
    } else {
        showMessageBox(id ? 'Course updated successfully!' : 'New course published!');
        resetCourseForm();
        loadAllCourses();
    }

    if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="save" class="w-4 h-4"></i> Publish Course';
        initLucideIcons();
    }
}

export function deleteCourse(id) {
    showConfirmBox('Delete Course', 'This will permanently remove the course. Are you sure?', async () => {
        await supabase.from('courses').delete().eq('id', id);
        showMessageBox('Course deleted.');
        loadAllCourses();
    });
}


// --- USER MGMT ---
async function loadAllUsers() {
    const { data } = await supabase.from('profiles').select('id, full_name, email, role, created_at').order('created_at', { ascending: false });
    allUsers = data || [];
    renderUsersTable(allUsers);
}

function renderUsersTable(users) {
    const tbody = document.getElementById('users-table-body');
    if (tbody) {
        tbody.innerHTML = users.map(u => `
            <tr class="hover:bg-slate-50 transition">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-primary font-black text-[10px] uppercase flex-shrink-0">${(u.full_name || 'U')[0]}</div>
                        <p class="font-bold text-slate-900 text-xs md:text-sm truncate max-w-[120px]">${u.full_name || 'Anonymous'}</p>
                    </div>
                </td>
                <td class="px-6 py-4 text-slate-600 text-[11px] md:text-sm font-medium truncate max-w-[150px]">${u.email || 'N/A'}</td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}">
                        ${u.role || 'User'}
                    </span>
                </td>
                <td class="px-6 py-4 text-slate-500 text-[11px] whitespace-nowrap">${new Date(u.created_at).toLocaleDateString()}</td>
                <td class="px-6 py-4 text-right">
                    <button onclick="window.handleDeleteUser('${u.id}', '${u.full_name}')" class="text-red-500 hover:text-red-700 font-bold text-[10px] uppercase tracking-widest">Del</button>
                </td>
            </tr>
        `).join('');
    }
}

export function handleSearchUsers(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredUsers = allUsers.filter(user =>
        (user.full_name || '').toLowerCase().includes(searchTerm) ||
        (user.email || '').toLowerCase().includes(searchTerm)
    );
    renderUsersTable(filteredUsers);
}

export function handleDeleteUser(id, name) {
    showConfirmBox('Remove User', `Delete ${name}?`, async () => {
        await supabase.from('profiles').delete().eq('id', id);
        loadAllUsers();
    });
}

// --- SKILLS LOGIC ---
async function loadAllSkills() {
    const { data } = await supabase.from('user_skills').select('*').order('skill_name', { ascending: true });
    allSkills = data || [];
    const list = document.getElementById('skills-list');
    if (list) {
        list.innerHTML = allSkills.map(s => `
            <div class="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl group transition hover:border-red-200">
                <span class="text-xs md:text-sm font-bold text-slate-700">${s.skill_name}</span>
                <button onclick="window.deleteSkill('${s.id}')" class="text-slate-300 hover:text-red-500 transition"><i data-lucide="x-circle" class="w-4 h-4"></i></button>
            </div>
        `).join('');
        initLucideIcons();
    }
}

export function deleteSkill(id) {
    showConfirmBox('Delete Skill', 'Delete this skill?', async () => {
        await supabase.from('user_skills').delete().eq('id', id);
        loadAllSkills();
    });
}

export async function handleAddSkill(e) {
    e.preventDefault();
    const input = document.getElementById('new-skill-input');
    const name = input?.value.trim();
    if (!name) return;

    const { error } = await supabase.from('user_skills').insert([{ skill_name: name }]);
    if (error) {
        showMessageBox('Error: Already exists.');
    } else {
        if (input) input.value = '';
        loadAllSkills();
    }
}

// --- EVENTS LOGIC ---
async function loadAllEvents() {
    const { data } = await supabase.from('events').select('*').order('date', { ascending: true });
    allEvents = data || [];
    const tbody = document.getElementById('events-table-body');
    if (tbody) {
        tbody.innerHTML = allEvents.map(e => `
            <tr class="hover:bg-slate-50 transition">
                <td class="px-6 py-4">
                    <img src="${e.main_media_url || 'https://via.placeholder.com/40'}" class="w-10 h-10 rounded-lg object-cover bg-slate-200">
                </td>
                <td class="px-6 py-4 font-bold text-slate-900 text-xs md:text-sm">${e.title}</td>
                <td class="px-6 py-4 text-slate-500 text-[11px] whitespace-nowrap">${new Date(e.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                <td class="px-6 py-4 text-slate-500 text-[11px]">${e.location || 'Online'}</td>
                <td class="px-6 py-4 text-right whitespace-nowrap">
                    <button onclick="window.editEvent('${e.id}')" class="text-primary font-bold text-[10px] uppercase mr-3">Edit</button>
                    <button onclick="window.deleteEvent('${e.id}')" class="text-red-500 font-bold text-[10px] uppercase">Del</button>
                </td>
            </tr>
        `).join('');
    }
}

export function editEvent(id) {
    const e = allEvents.find(item => item.id === id);
    if (!e) return;

    const eventId = document.getElementById('event-id');
    const eventTitle = document.getElementById('event-title');
    const eventDate = document.getElementById('event-date');
    const eventDescription = document.getElementById('event-description');
    const eventHighlights = document.getElementById('event-highlights');
    const eventWhoAttend = document.getElementById('event-who-attend');
    const eventGain = document.getElementById('event-gain');
    const eventGalleryUrls = document.getElementById('event-gallery-urls');
    const eventVideoUrl = document.getElementById('event-video-url');
    const eventMainMediaUrl = document.getElementById('event-main-media-url');
    const eventJoinLink = document.getElementById('event-join-link');
    const eventLocation = document.getElementById('event-location');
    const eventFormTitle = document.getElementById('event-form-title');
    const eventSubmitBtn = document.getElementById('event-submit-btn');
    const eventCancelBtn = document.getElementById('event-cancel-btn');
    const mainScrollArea = document.getElementById('main-scroll-area');

    if (eventId) eventId.value = e.id;
    if (eventTitle) eventTitle.value = e.title;
    if (eventDate) eventDate.value = new Date(e.date).toISOString().slice(0, 16);
    if (eventDescription) eventDescription.value = e.description;
    if (eventHighlights) eventHighlights.value = (e.key_highlights || []).join('\n');
    if (eventWhoAttend) eventWhoAttend.value = (e.who_should_attend || []).join('\n');
    if (eventGain) eventGain.value = (e.what_you_will_gain || []).join('\n');
    if (eventGalleryUrls) eventGalleryUrls.value = (e.gallery_urls || []).join('\n');
    if (eventVideoUrl) eventVideoUrl.value = e.video_url || '';
    if (eventMainMediaUrl) eventMainMediaUrl.value = e.main_media_url || '';
    if (eventJoinLink) eventJoinLink.value = e.join_link || '';
    if (eventLocation) eventLocation.value = e.location || '';
    if (eventFormTitle) eventFormTitle.textContent = "Update Event";
    if (eventSubmitBtn) eventSubmitBtn.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i> Update Event`;
    if (eventCancelBtn) eventCancelBtn.style.display = 'inline-block';
    if (mainScrollArea) mainScrollArea.scrollTop = 0;
    
    initLucideIcons();
}

export function deleteEvent(id) {
    showConfirmBox('Delete Event', 'Delete this event?', async () => {
        await supabase.from('events').delete().eq('id', id);
        loadAllEvents();
    });
}

export async function handleEventFormSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('event-submit-btn');
    const originalText = btn?.innerHTML;
    if (btn) {
        btn.disabled = true;
        btn.textContent = "Publishing...";
    }

    const id = document.getElementById('event-id')?.value;
    const file = document.getElementById('event-image-upload')?.files[0];
    let url = document.getElementById('event-main-media-url')?.value;
    
    if (file) url = await uploadImage(file, 'events-images', 'banners');
    
    const toArray = (val) => val.split('\n').map(s => s.trim()).filter(s => s !== '');

    const payload = {
        title: document.getElementById('event-title')?.value,
        date: document.getElementById('event-date')?.value,
        description: document.getElementById('event-description')?.value,
        location: document.getElementById('event-location')?.value,
        main_media_url: url,
        join_link: document.getElementById('event-join-link')?.value,
        video_url: document.getElementById('event-video-url')?.value,
        key_highlights: toArray(document.getElementById('event-highlights')?.value || ''),
        who_should_attend: toArray(document.getElementById('event-who-attend')?.value || ''),
        what_you_will_gain: toArray(document.getElementById('event-gain')?.value || ''),
        gallery_urls: toArray(document.getElementById('event-gallery-urls')?.value || '')
    };
    
    const { error } = id 
        ? await supabase.from('events').update(payload).eq('id', id) 
        : await supabase.from('events').insert([payload]);
    
    if (!error) { 
        showMessageBox(id ? 'Event updated.' : 'Event published successfully!'); 
        resetEventForm(); 
        loadAllEvents(); 
    } else {
        showMessageBox('Error: ' + error.message);
    }
    
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

export function resetEventForm() {
    const eventForm = document.getElementById('event-form');
    const eventId = document.getElementById('event-id');
    const eventFormTitle = document.getElementById('event-form-title');
    const eventSubmitBtn = document.getElementById('event-submit-btn');
    const eventCancelBtn = document.getElementById('event-cancel-btn');

    if (eventForm) eventForm.reset();
    if (eventId) eventId.value = '';
    if (eventFormTitle) eventFormTitle.textContent = "Create New Event";
    if (eventSubmitBtn) eventSubmitBtn.innerHTML = `<i data-lucide="save" class="w-4 h-4"></i> Publish Event`;
    if (eventCancelBtn) eventCancelBtn.style.display = 'none';
    
    initLucideIcons();
}

// --- FAME WALL LOGIC ---
const escapeHtml = (unsafe) => {
    if (unsafe === null || unsafe === undefined) return "";
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

const ensureProtocol = (url) => {
    if (!url) return '';
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        return 'https://' + cleanUrl;
    }
    return cleanUrl;
};

const formatImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/100';
    let cleanUrl = url.trim();
    
    if (cleanUrl.includes('drive.google.com')) {
        const fileMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (fileMatch && fileMatch[1]) {
            return `https://drive.google.com/uc?export=view&id=${fileMatch[1]}`;
        }
        
        const idMatch = cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (idMatch && idMatch[1]) {
            return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
        }
    }
    
    return encodeURI(cleanUrl);
};

async function loadFameWall() {
    const { data, error } = await supabase.from('wall_of_fame').select('*').order('created_at', { ascending: false });
    
    if (error) {
        console.error("Error loading fame wall:", error);
        return;
    }

    allFame = data || [];
    const grid = document.getElementById('fame-grid');

    if (!grid) return;

    grid.innerHTML = allFame.map(item => {
        const safeImgUrl = formatImageUrl(item.image_url);
        const linkedin = ensureProtocol(item.linkedin_url);
        const project = ensureProtocol(item.project_link);
        
        return `
        <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative group text-center flex flex-col h-full">
            <button onclick="window.deleteFameEntry('${item.id}')" class="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            
            <div class="w-20 h-20 mx-auto rounded-full bg-slate-100 mb-4 overflow-hidden border-4 border-white shadow-lg">
                <img src="${safeImgUrl}" referrerpolicy="no-referrer" class="w-full h-full object-cover" onerror="this.src='https://via.placeholder.com/100'">
            </div>
            
            <h3 class="font-bold text-slate-900 text-lg">${escapeHtml(item.name)}</h3>
            <p class="text-xs font-bold text-primary uppercase tracking-wide mt-1 mb-2">${escapeHtml(item.role_track)}</p>
            
            <p class="text-sm text-slate-500 line-clamp-2 mb-4 flex-grow">${escapeHtml(item.project_description)}</p>
            
            <div class="flex justify-center gap-3 mt-auto">
                ${linkedin ? `<a href="${linkedin}" target="_blank" class="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition"><i data-lucide="linkedin" class="w-4 h-4"></i></a>` : ''}
                ${project ? `<a href="${project}" target="_blank" class="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-800 hover:text-white transition"><i data-lucide="external-link" class="w-4 h-4"></i></a>` : ''}
            </div>
        </div>
    `}).join('');
    
    initLucideIcons();
}

export async function handleFameFormSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('fame-save-btn');
    const originalText = btn?.textContent;
    if (btn) {
        btn.disabled = true;
        btn.textContent = "Uploading...";
    }

    try {
        const fileInput = document.getElementById('fame-image-upload');
        const file = fileInput?.files[0];
        let imageUrl = document.getElementById('fame-image-url')?.value;
        
        if (file) {
            const uploadedUrl = await uploadImage(file, 'course-images', 'fame');
            if (uploadedUrl) imageUrl = uploadedUrl;
        }

        const payload = {
            name: document.getElementById('fame-name')?.value,
            role_track: document.getElementById('fame-role')?.value,
            project_description: document.getElementById('fame-project-desc')?.value,
            project_link: document.getElementById('fame-project-link')?.value,
            linkedin_url: document.getElementById('fame-linkedin')?.value,
            image_url: imageUrl
        };

        const { error } = await supabase.from('wall_of_fame').insert([payload]);
        
        if (error) {
            showMessageBox('Error adding to Fame Wall: ' + error.message);
        } else {
            showMessageBox('Added to Hall of Fame!');
            const fameForm = document.getElementById('fame-form');
            if (fameForm) fameForm.reset();
            loadFameWall();
        }
    } catch (err) {
        console.error("Submission error:", err);
        alert("An unexpected error occurred: " + err.message);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    }
}

export function deleteFameEntry(id) {
    showConfirmBox('Remove Entry', 'Remove this student from the wall?', async () => {
        const { error } = await supabase.from('wall_of_fame').delete().eq('id', id);
        if (error) {
            console.error("Delete error", error);
            alert("Failed to delete entry");
        } else {
            loadFameWall();
        }
    });
}

// --- JOB POSTINGS LOGIC ---
// async function loadAllJobPostings() {
//     const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
//     allJobPostings = data || [];
//     const tbody = document.getElementById('job-postings-table-body');
//     if (tbody) {
//         tbody.innerHTML = allJobPostings.map(job => `
//             <tr class="hover:bg-slate-50 transition">
//                 <td class="px-6 py-4 font-bold text-slate-900 text-xs md:text-sm">${job.title}</td>
//                 <td class="px-6 py-4 text-slate-600 text-[11px] md:text-sm">${job.role}</td>
//                 <td class="px-6 py-4">
//                     <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${job.job_type === 'Full Time' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}">
//                         ${job.job_type}
//                     </span>
//                 </td>
//                 <td class="px-6 py-4 text-slate-500 text-[11px]">${job.location}</td>
//                 <td class="px-6 py-4 text-slate-500 text-[11px] font-medium">${job.stipend_salary || 'N/A'}</td>
//                 <td class="px-6 py-4 text-right whitespace-nowrap">
//                     <button onclick="window.editJobPosting('${job.id}')" class="text-primary font-bold text-[10px] uppercase mr-3">Edit</button>
//                     <button onclick="window.deleteJobPosting('${job.id}')" class="text-red-500 font-bold text-[10px] uppercase">Del</button>
//                 </td>
//             </tr>
//         `).join('');
//     }
// }

// export function editJobPosting(id) {
//     const job = allJobPostings.find(item => item.id === id);
//     if (!job) return;
    
//     const jobId = document.getElementById('job-id');
//     const jobTitle = document.getElementById('job-title');
//     const jobRole = document.getElementById('job-role');
//     const jobDescription = document.getElementById('job-description');
//     const jobType = document.getElementById('job-type');
//     const jobLocation = document.getElementById('job-location');
//     const jobStipendSalary = document.getElementById('job-stipend-salary');
//     const jobFormTitle = document.getElementById('job-form-title');
//     const jobSaveBtn = document.getElementById('job-save-btn');
//     const mainScrollArea = document.getElementById('main-scroll-area');

//     if (jobId) jobId.value = job.id;
//     if (jobTitle) jobTitle.value = job.title;
//     if (jobRole) jobRole.value = job.role;
//     if (jobDescription) jobDescription.value = job.job_description;
//     if (jobType) jobType.value = job.job_type;
//     if (jobLocation) jobLocation.value = job.location;
//     if (jobStipendSalary) jobStipendSalary.value = job.stipend_salary || '';
//     if (jobFormTitle) jobFormTitle.textContent = "Update Job Posting";
//     if (jobSaveBtn) jobSaveBtn.textContent = "Apply Changes";
//     if (mainScrollArea) mainScrollArea.scrollTop = 0;
// }

// export function resetJobPostingForm() {
//     const jobPostingForm = document.getElementById('job-posting-form');
//     const jobId = document.getElementById('job-id');
//     const jobFormTitle = document.getElementById('job-form-title');
//     const jobSaveBtn = document.getElementById('job-save-btn');

//     if (jobPostingForm) jobPostingForm.reset();
//     if (jobId) jobId.value = '';
//     if (jobFormTitle) jobFormTitle.textContent = "Create New Job Posting";
//     if (jobSaveBtn) jobSaveBtn.textContent = "Publish Job";
// }

// export async function handleJobPostingFormSubmit(e) {
//     e.preventDefault();
//     const btn = document.getElementById('job-save-btn');
//     if (btn) {
//         btn.disabled = true;
//         btn.textContent = "Processing...";
//     }
    
//     const id = document.getElementById('job-id')?.value;
    
//     const payload = {
//         title: document.getElementById('job-title')?.value,
//         role: document.getElementById('job-role')?.value,
//         job_description: document.getElementById('job-description')?.value,
//         job_type: document.getElementById('job-type')?.value,
//         location: document.getElementById('job-location')?.value,
//         stipend_salary: document.getElementById('job-stipend-salary')?.value
//     };
    
//     const { error } = id 
//         ? await supabase.from('jobs').update(payload).eq('id', id) 
//         : await supabase.from('jobs').insert([payload]);
    
//     if (error) {
//         showMessageBox('Database Error: ' + error.message);
//     } else {
//         showMessageBox(id ? 'Job posting updated!' : 'Job posting published!'); 
//         resetJobPostingForm(); 
//         loadAllJobPostings();
//     }
    
//     if (btn) {
//         btn.disabled = false;
//         btn.textContent = id ? "Apply Changes" : "Publish Job";
//     }
// }

// export function deleteJobPosting(id) {
//     showConfirmBox('Delete Job Posting', 'Are you sure you want to delete this job posting?', async () => {
//         await supabase.from('jobs').delete().eq('id', id);
//         loadAllJobPostings();
//     });
// }

// --- JOB POSTINGS LOGIC ---
async function loadAllJobPostings() {
    const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
    allJobPostings = data || [];
    const tbody = document.getElementById('job-postings-table-body');
    if (tbody) {
        tbody.innerHTML = allJobPostings.map(job => `
            <tr class="hover:bg-slate-50 transition">
                <td class="px-6 py-4 font-bold text-slate-900 text-xs md:text-sm">${job.title || 'N/A'}</td>
                <td class="px-6 py-4 text-slate-600 text-[11px] md:text-sm">${job.department || 'N/A'}</td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${job.type === 'Full Time' ? 'bg-green-100 text-green-700' : job.type === 'Part Time' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}">
                        ${job.type || 'N/A'}
                    </span>
                </td>
                <td class="px-6 py-4 text-slate-500 text-[11px]">${job.location || 'N/A'}</td>
                <td class="px-6 py-4 text-slate-500 text-[11px] font-medium">${job.salary || 'N/A'}</td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}">
                        ${job.status || 'draft'}
                    </span>
                </td>
                <td class="px-6 py-4 text-right whitespace-nowrap">
                    <button onclick="window.editJobPosting('${job.id}')" class="text-primary font-bold text-[10px] uppercase mr-3">Edit</button>
                    <button onclick="window.deleteJobPosting('${job.id}')" class="text-red-500 font-bold text-[10px] uppercase">Del</button>
                </td>
            </tr>
        `).join('');
    }
}


// export function editJobPosting(id) {
//     console.log(`Editing job posting with ID: ${id}`);
//     const job = allJobPostings.find(item => item.id === id);
//     if (!job) return;
    
//     const jobId = document.getElementById('job-id');
//     const jobTitle = document.getElementById('job-title');
//     const jobDepartment = document.getElementById('job-department');
//     const jobLocation = document.getElementById('job-location');
//     const jobType = document.getElementById('job-type');
//     const jobSalary = document.getElementById('job-salary');
//     const jobEligibility = document.getElementById('job-eligibility');
//     const jobResponsibility = document.getElementById('job-responsibility');
//     const jobRequiredSkills = document.getElementById('job-required-skills');
//     const jobStatus = document.getElementById('job-status');
//     const jobFormTitle = document.getElementById('job-form-title');
//     const jobSaveBtn = document.getElementById('job-save-btn');
//     const mainScrollArea = document.getElementById('main-scroll-area');

//     if (jobId) jobId.value = job.id;
//     if (jobTitle) jobTitle.value = job.title || '';
//     if (jobDepartment) jobDepartment.value = job.department || '';
//     if (jobLocation) jobLocation.value = job.location || '';
//     if (jobType) jobType.value = job.type || 'Full Time';
//     if (jobSalary) jobSalary.value = job.salary || '';
//     if (jobEligibility) jobEligibility.value = job.eligibility || '';
    
//     // FIX: Handle responsibilities array properly
//     if (jobResponsibility) {
//         jobResponsibility.value = Array.isArray(job.responsibilities) 
//             ? job.responsibilities.join(', ') 
//             : (job.responsibilities || '');
//     }
    
//     // FIX: Handle required_skills array properly
//     if (jobRequiredSkills) {
//         jobRequiredSkills.value = Array.isArray(job.required_skills) 
//             ? job.required_skills.join(', ') 
//             : (job.required_skills || '');
//     }
    
//     if (jobStatus) jobStatus.value = job.status || 'draft';
//     if (jobFormTitle) jobFormTitle.textContent = "Update Job Posting";
//     if (jobSaveBtn) jobSaveBtn.textContent = "Apply Changes";
//     if (mainScrollArea) mainScrollArea.scrollTop = 0;
// }

export function editJobPosting(id) {
    console.log(`Editing job posting with ID: ${id}`);
    // const job = allJobPostings.find(item => item.id === id);
    // if (!job) {
    //     console.error('Job not found:', id);
    //     return;
      const numericId = Number(id);   // FIX

    const job = allJobPostings.find(item => item.id === numericId);

    if (!job) {
        console.error('Job not found:', id);
        return;
    }
    
    console.log('Job data:', job); // Debug log
    
    const jobId = document.getElementById('job-id');
    const jobTitle = document.getElementById('job-title');
    const jobDepartment = document.getElementById('job-department');
    const jobLocation = document.getElementById('job-location');
    const jobType = document.getElementById('job-type');
    const jobSalary = document.getElementById('job-salary');
    const jobEligibility = document.getElementById('job-eligibility');
    const jobResponsibility = document.getElementById('job-responsibility');
    const jobRequiredSkills = document.getElementById('job-required-skills');
    const jobStatus = document.getElementById('job-status');
    const jobFormTitle = document.getElementById('job-form-title');
    const jobSaveBtn = document.getElementById('job-save-btn');
    const mainScrollArea = document.getElementById('main-scroll-area');

    // Helper function to convert array to comma-separated string
    const arrayToString = (arr) => {
        if (!arr) return '';
        if (Array.isArray(arr)) return arr.join(', ');
        if (typeof arr === 'string') return arr;
        return '';
    };

    if (jobId) jobId.value = job.id;
    if (jobTitle) jobTitle.value = job.title || '';
    if (jobDepartment) jobDepartment.value = job.department || '';
    if (jobLocation) jobLocation.value = job.location || '';
    if (jobType) jobType.value = job.type || 'Full Time';
    if (jobSalary) jobSalary.value = job.salary || '';
    if (jobEligibility) jobEligibility.value = job.eligibility || '';
    
    // ✅ FIX: Convert array to comma-separated string
    if (jobResponsibility) {
        jobResponsibility.value = arrayToString(job.responsibilities);
    }
    
    // ✅ FIX: Convert array to comma-separated string
    if (jobRequiredSkills) {
        jobRequiredSkills.value = arrayToString(job.required_skills);
    }
    
    if (jobStatus) jobStatus.value = job.status || 'draft';
    if (jobFormTitle) jobFormTitle.textContent = "Update Job Posting";
    if (jobSaveBtn) jobSaveBtn.textContent = "Apply Changes";
    if (mainScrollArea) mainScrollArea.scrollTop = 0;
}

export function resetJobPostingForm() {
    const jobPostingForm = document.getElementById('job-posting-form');
    const jobId = document.getElementById('job-id');
    const jobFormTitle = document.getElementById('job-form-title');
    const jobSaveBtn = document.getElementById('job-save-btn');

    if (jobPostingForm) jobPostingForm.reset();
    if (jobId) jobId.value = '';
    if (jobFormTitle) jobFormTitle.textContent = "Create New Job Posting";
    if (jobSaveBtn) jobSaveBtn.textContent = "Publish Job";
}



export async function handleJobPostingFormSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('job-save-btn');
    if (btn) {
        btn.disabled = true;
        btn.textContent = "Processing...";
    }
    
    const id = document.getElementById('job-id')?.value;
    
    // Helper function to convert comma-separated string to array
    const toArray = (value) => {
        if (!value) return [];
        return value.split(',').map(s => s.trim()).filter(Boolean);
    };
    
    const payload = {
        title: document.getElementById('job-title')?.value,
        department: document.getElementById('job-department')?.value,
        location: document.getElementById('job-location')?.value,
        type: document.getElementById('job-type')?.value,
        salary: document.getElementById('job-salary')?.value,
        eligibility: document.getElementById('job-eligibility')?.value,
        responsibilities: toArray(document.getElementById('job-responsibility')?.value),
        required_skills: toArray(document.getElementById('job-required-skills')?.value),
        status: document.getElementById('job-status')?.value || 'draft'
    };
    
    console.log('Payload being sent:', payload); // Debug log
    
    const { error } = id 
        ? await supabase.from('jobs').update(payload).eq('id', id) 
        : await supabase.from('jobs').insert([payload]);
    
    if (error) {
        console.error('Supabase error:', error);
        showMessageBox('Database Error: ' + error.message);
    } else {
        showMessageBox(id ? 'Job posting updated!' : 'Job posting published!'); 
        resetJobPostingForm(); 
        loadAllJobPostings();
    }
    
    if (btn) {
        btn.disabled = false;
        btn.textContent = id ? "Apply Changes" : "Publish Job";
    }
}

export function deleteJobPosting(id) {
    showConfirmBox('Delete Job Posting', 'Are you sure you want to delete this job posting?', async () => {
        await supabase.from('jobs').delete().eq('id', id);
        loadAllJobPostings();
    });
}

export async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (!error) window.location.href = '/admin';
}

// ============================================================
// --- ANNOUNCEMENTS (Navbar Bar CRUD) ---
// ============================================================
async function loadAllAnnouncements() {
    const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('priority', { ascending: false });

    if (error) { showMessageBox('Error loading announcements: ' + error.message); return; }
    allAnnouncements = data || [];
    renderAnnouncementsTable(allAnnouncements);
}

function renderAnnouncementsTable(items) {
    const tbody = document.getElementById('announcements-table-body');
    if (!tbody) return;

    if (!items.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-10 text-center text-slate-400 font-semibold">No announcements yet. Create one above.</td></tr>`;
        return;
    }

    tbody.innerHTML = items.map(a => `
        <tr class="hover:bg-slate-50 transition border-b border-slate-100 last:border-0">
            <td class="px-4 py-4 text-xl">${a.emoji || '📢'}</td>
            <td class="px-4 py-4 max-w-xs">
                <p class="text-sm font-semibold text-slate-800 line-clamp-2">${a.message}</p>
                ${a.link_url ? `<a href="${a.link_url}" target="_blank" class="text-xs text-primary underline">${a.link_text || a.link_url}</a>` : '<span class="text-xs text-slate-400">No link</span>'}
            </td>
            <td class="px-4 py-4">
                <span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-600">${a.link_type || 'general'}</span>
            </td>
            <td class="px-4 py-4 text-center">
                <span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase ${a.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-400'}">${a.is_active ? 'Active' : 'Hidden'}</span>
            </td>
            <td class="px-4 py-4 text-center text-xs font-bold text-slate-500">${a.priority}</td>
            <td class="px-4 py-4">
                <div class="flex gap-2 justify-end">
                    <button onclick="window.editAnnouncement('${a.id}')" class="px-3 py-1.5 bg-indigo-50 text-primary text-xs font-bold rounded-xl hover:bg-primary hover:text-white transition">Edit</button>
                    <button onclick="window.deleteAnnouncement('${a.id}')" class="px-3 py-1.5 bg-red-50 text-red-500 text-xs font-bold rounded-xl hover:bg-red-500 hover:text-white transition">Del</button>
                </div>
            </td>
        </tr>
    `).join('');
}

export function editAnnouncement(id) {
    const a = allAnnouncements.find(item => item.id === id);
    if (!a) return;

    const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val ?? ''; };
    set('ann-id', a.id);
    set('ann-emoji', a.emoji || '🚀');
    set('ann-message', a.message);
    set('ann-link-text', a.link_text || '');
    set('ann-link-url', a.link_url || '');
    set('ann-bg-color', a.bg_color || '#1a3d2b');
    set('ann-priority', a.priority ?? 0);

    const typeEl = document.getElementById('ann-link-type');
    if (typeEl) typeEl.value = a.link_type || 'general';
    const activeEl = document.getElementById('ann-is-active');
    if (activeEl) activeEl.value = a.is_active ? 'true' : 'false';

    const formTitle = document.getElementById('ann-form-title');
    const saveBtn = document.getElementById('ann-save-btn');
    if (formTitle) formTitle.textContent = 'Edit Announcement';
    if (saveBtn) saveBtn.textContent = 'Save Changes';

    document.getElementById('main-scroll-area')?.scrollTo(0, 0);
}

export function resetAnnouncementForm() {
    const form = document.getElementById('ann-form');
    if (form) form.reset();
    ['ann-id', 'ann-message', 'ann-link-text', 'ann-link-url'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
    });
    const formTitle = document.getElementById('ann-form-title');
    const saveBtn = document.getElementById('ann-save-btn');
    if (formTitle) formTitle.textContent = 'Create New Announcement';
    if (saveBtn) saveBtn.textContent = 'Publish Announcement';
}

async function handleAnnouncementFormSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('ann-save-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }

    const id = document.getElementById('ann-id')?.value;
    const payload = {
        emoji:     document.getElementById('ann-emoji')?.value?.trim() || '📢',
        message:   document.getElementById('ann-message')?.value?.trim(),
        link_text: document.getElementById('ann-link-text')?.value?.trim() || null,
        link_url:  document.getElementById('ann-link-url')?.value?.trim() || null,
        link_type: document.getElementById('ann-link-type')?.value || 'general',
        is_active: document.getElementById('ann-is-active')?.value === 'true',
        priority:  parseInt(document.getElementById('ann-priority')?.value || '0', 10),
        bg_color:  document.getElementById('ann-bg-color')?.value || '#1a3d2b',
    };

    const { error } = id
        ? await supabase.from('announcements').update(payload).eq('id', id)
        : await supabase.from('announcements').insert([payload]);

    if (error) {
        showMessageBox('Error: ' + error.message);
    } else {
        showMessageBox(id ? 'Announcement updated!' : 'Announcement published!');
        resetAnnouncementForm();
        loadAllAnnouncements();
    }
    if (btn) { btn.disabled = false; btn.textContent = 'Publish Announcement'; }
}

export function deleteAnnouncement(id) {
    showConfirmBox('Delete Announcement', 'Remove this announcement from the site?', async () => {
        await supabase.from('announcements').delete().eq('id', id);
        showMessageBox('Announcement deleted.');
        loadAllAnnouncements();
    });
}

// ===========================
// COUPON MANAGEMENT
// ===========================
async function loadAllCoupons() {
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    allCoupons = data || [];

    // Also populate course dropdown in coupon form
    const courseSelect = document.getElementById('coupon-course-id');
    if (courseSelect && allCourses.length === 0) {
        const { data: courses } = await supabase.from('courses').select('id, title').order('title');
        allCourses = courses || [];
    }
    if (courseSelect) {
        courseSelect.innerHTML = '<option value="">All Courses (Global)</option>' + 
            allCourses.map(c => `<option value="${c.id}">${c.title}</option>`).join('');
    }

    const tbody = document.getElementById('coupons-table-body');
    if (!tbody) return;

    if (allCoupons.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-slate-400">No coupons created yet</td></tr>';
        return;
    }

    tbody.innerHTML = allCoupons.map(cp => {
        const courseName = allCourses.find(c => c.id === cp.course_id)?.title || 'All Courses';
        const isExpired = cp.valid_until && new Date(cp.valid_until) < new Date();
        const statusLabel = !cp.is_active ? 'Inactive' : isExpired ? 'Expired' : 'Active';
        const statusClass = !cp.is_active ? 'bg-slate-100 text-slate-500' : isExpired ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600';

        return `<tr class="border-b border-slate-50">
            <td class="px-6 py-4 font-bold text-sm">${cp.code}</td>
            <td class="px-6 py-4 text-sm">${cp.discount_percent}%</td>
            <td class="px-6 py-4 text-sm text-slate-500">${courseName}</td>
            <td class="px-6 py-4 text-center"><span class="px-3 py-1 rounded-full text-xs font-bold ${statusClass}">${statusLabel}</span></td>
            <td class="px-6 py-4 text-center text-sm">${cp.used_count || 0}/${cp.max_uses || '∞'}</td>
            <td class="px-6 py-4 text-right">
                <button onclick="window.editCoupon('${cp.id}')" class="px-3 py-1 bg-indigo-50 text-primary rounded-lg text-xs font-bold mr-1">Edit</button>
                <button onclick="window.deleteCoupon('${cp.id}')" class="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold">Del</button>
            </td>
        </tr>`;
    }).join('');
}

export function editCoupon(id) {
    const cp = allCoupons.find(c => c.id === id);
    if (!cp) return;
    const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val || ''; };
    set('coupon-id', cp.id);
    set('coupon-code', cp.code);
    set('coupon-discount', cp.discount_percent);
    set('coupon-course-id', cp.course_id || '');
    set('coupon-is-active', cp.is_active ? 'true' : 'false');
    set('coupon-max-uses', cp.max_uses || '');
    if (cp.valid_from) set('coupon-valid-from', new Date(cp.valid_from).toISOString().slice(0, 16));
    if (cp.valid_until) set('coupon-valid-until', new Date(cp.valid_until).toISOString().slice(0, 16));
    const formTitle = document.getElementById('coupon-form-title');
    if (formTitle) formTitle.textContent = 'Edit Coupon';
}

export function resetCouponForm() {
    const form = document.getElementById('coupon-form');
    if (form) form.reset();
    ['coupon-id', 'coupon-code', 'coupon-discount', 'coupon-max-uses', 'coupon-valid-from', 'coupon-valid-until']
        .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    const formTitle = document.getElementById('coupon-form-title');
    if (formTitle) formTitle.textContent = 'Create New Coupon';
}

async function handleCouponFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('coupon-id')?.value;
    const payload = {
        code: (document.getElementById('coupon-code')?.value || '').toUpperCase(),
        discount_percent: Number(document.getElementById('coupon-discount')?.value) || 0,
        course_id: document.getElementById('coupon-course-id')?.value || null,
        is_active: document.getElementById('coupon-is-active')?.value === 'true',
        max_uses: Number(document.getElementById('coupon-max-uses')?.value) || null,
        valid_from: document.getElementById('coupon-valid-from')?.value || null,
        valid_until: document.getElementById('coupon-valid-until')?.value || null,
    };
    const { error } = id
        ? await supabase.from('coupons').update(payload).eq('id', id)
        : await supabase.from('coupons').insert([payload]);
    if (error) {
        showMessageBox('Error: ' + error.message);
    } else {
        showMessageBox(id ? 'Coupon updated!' : 'Coupon created!');
        resetCouponForm();
        loadAllCoupons();
    }
}

export function deleteCoupon(id) {
    showConfirmBox('Delete Coupon', 'Are you sure?', async () => {
        await supabase.from('coupons').delete().eq('id', id);
        showMessageBox('Coupon deleted.');
        loadAllCoupons();
    });
}

// ===========================
// TRAINER MANAGEMENT
// ===========================
// Populate trainer dropdown in the course form (reusable)
async function populateTrainerDropdown() {
    if (allTrainers.length === 0) {
        const { data } = await supabase.from('trainers').select('*').order('created_at', { ascending: false });
        allTrainers = data || [];
    }
    const trainerSelect = document.getElementById('course-trainer-id');
    if (trainerSelect) {
        const currentVal = trainerSelect.value;
        trainerSelect.innerHTML = '<option value="">None (Unassigned)</option>' +
            allTrainers.map(t => `<option value="${t.user_id}">${t.full_name} (${t.trainer_id})${t.specialization ? ' — ' + t.specialization : ''}</option>`).join('');
        if (currentVal) trainerSelect.value = currentVal;
    }
}

async function loadAllTrainers() {
    const { data } = await supabase.from('trainers').select('*').order('created_at', { ascending: false });
    allTrainers = data || [];

    // Populate trainer dropdown in course form
    populateTrainerDropdown();

    const tbody = document.getElementById('trainers-table-body');
    if (!tbody) return;

    if (allTrainers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-slate-400">No trainers added yet</td></tr>';
        return;
    }

    tbody.innerHTML = allTrainers.map(t => `
        <tr class="border-b border-slate-50">
            <td class="px-6 py-4 font-bold text-sm">${t.trainer_id}</td>
            <td class="px-6 py-4 text-sm">${t.full_name}</td>
            <td class="px-6 py-4 text-sm text-slate-500">${t.email}</td>
            <td class="px-6 py-4 text-sm text-slate-500">${t.specialization || '-'}</td>
            <td class="px-6 py-4 text-center"><span class="px-3 py-1 rounded-full text-xs font-bold ${t.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}">${t.is_active ? 'Active' : 'Inactive'}</span></td>
            <td class="px-6 py-4 text-right">
                <button onclick="window.editTrainer('${t.id}')" class="px-3 py-1 bg-indigo-50 text-primary rounded-lg text-xs font-bold mr-1">Edit</button>
                <button onclick="window.deleteTrainer('${t.id}')" class="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold">Del</button>
            </td>
        </tr>
    `).join('');
}

export function editTrainer(id) {
    const t = allTrainers.find(tr => tr.id === id);
    if (!t) return;
    const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val || ''; };
    set('trainer-db-id', t.id);
    set('trainer-form-id', t.trainer_id);
    set('trainer-name', t.full_name);
    set('trainer-email', t.email);
    set('trainer-phone', t.phone);
    set('trainer-specialization', t.specialization);
    const formTitle = document.getElementById('trainer-form-title');
    if (formTitle) formTitle.textContent = 'Edit Trainer';
}

export function resetTrainerForm() {
    const form = document.getElementById('trainer-form');
    if (form) form.reset();
    ['trainer-db-id', 'trainer-form-id', 'trainer-name', 'trainer-email', 'trainer-phone', 'trainer-specialization', 'trainer-password']
        .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    const formTitle = document.getElementById('trainer-form-title');
    if (formTitle) formTitle.textContent = 'Add New Trainer';
}

async function handleTrainerFormSubmit(e) {
    e.preventDefault();
    const dbId = document.getElementById('trainer-db-id')?.value;
    const trainerId = (document.getElementById('trainer-form-id')?.value || '').toUpperCase();
    const fullName = document.getElementById('trainer-name')?.value;
    const email = document.getElementById('trainer-email')?.value;
    const phone = document.getElementById('trainer-phone')?.value || null;
    const specialization = document.getElementById('trainer-specialization')?.value || null;
    const password = document.getElementById('trainer-password')?.value;

    if (dbId) {
        // Update existing trainer
        const { error } = await supabase.from('trainers').update({
            trainer_id: trainerId,
            full_name: fullName,
            email,
            phone,
            specialization,
        }).eq('id', dbId);
        if (error) {
            showMessageBox('Error: ' + error.message);
        } else {
            showMessageBox('Trainer updated!');
            resetTrainerForm();
            loadAllTrainers();
        }
    } else {
        // Create new trainer via server API (handles auth user creation)
        if (!password) {
            showMessageBox('Password is required for new trainers');
            return;
        }

        const btn = document.getElementById('trainer-save-btn');
        if (btn) { btn.disabled = true; btn.textContent = 'Creating...'; }

        try {
            const res = await fetch('/api/trainers/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trainerId, fullName, email, phone, specialization, password }),
            });
            const data = await res.json();

            if (data.success) {
                showMessageBox(data.updated ? 'Trainer updated successfully!' : 'Trainer created successfully! Login: ' + trainerId);
                resetTrainerForm();
                loadAllTrainers();
            } else {
                showMessageBox('Error: ' + (data.error || 'Failed to create trainer'));
            }
        } catch (err) {
            showMessageBox('Network Error: ' + err.message);
        }

        if (btn) { btn.disabled = false; btn.textContent = 'Save Trainer'; }
    }
}

export function deleteTrainer(id) {
    showConfirmBox('Delete Trainer', 'This will remove the trainer. Are you sure?', async () => {
        await supabase.from('trainers').delete().eq('id', id);
        showMessageBox('Trainer deleted.');
        loadAllTrainers();
    });
}

// Initialize all event listeners
export function initAdminDashboardListeners() {
    setCurrentDate();
    initLucideIcons();
    initSidebarListeners();

    const messageBoxCloseBtn = document.getElementById('message-box-close-btn');
    if (messageBoxCloseBtn) messageBoxCloseBtn.onclick = closeMsg;

    const searchUsers = document.getElementById('search-users');
    if (searchUsers) searchUsers.addEventListener('input', handleSearchUsers);

    const addSkillForm = document.getElementById('add-skill-form');
    if (addSkillForm) addSkillForm.onsubmit = handleAddSkill;

    const courseForm = document.getElementById('course-form');
    if (courseForm) courseForm.onsubmit = handleCourseFormSubmit;

    const eventForm = document.getElementById('event-form');
    if (eventForm) eventForm.onsubmit = handleEventFormSubmit;

    const fameForm = document.getElementById('fame-form');
    if (fameForm) fameForm.onsubmit = handleFameFormSubmit;

    const jobPostingForm = document.getElementById('job-posting-form');
    if (jobPostingForm) jobPostingForm.onsubmit = handleJobPostingFormSubmit;

    const annForm = document.getElementById('ann-form');
    if (annForm) annForm.onsubmit = handleAnnouncementFormSubmit;

    const couponForm = document.getElementById('coupon-form');
    if (couponForm) couponForm.onsubmit = handleCouponFormSubmit;

    const trainerForm = document.getElementById('trainer-form');
    if (trainerForm) trainerForm.onsubmit = handleTrainerFormSubmit;

    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) logoutBtn.onclick = handleLogout;

    // Expose functions to window for onclick handlers
    if (typeof window !== 'undefined') {
        window.showMessageBox = showMessageBox;
        window.closeMsg = closeMsg;
        window.showConfirmBox = showConfirmBox;
        window.switchView = switchView;
        window.editCourse = editCourse;
        window.deleteCourse = deleteCourse;
        window.resetCourseForm = resetCourseForm;
        window.handleDeleteUser = handleDeleteUser;
        window.deleteSkill = deleteSkill;
        window.editEvent = editEvent;
        window.deleteEvent = deleteEvent;
        window.resetEventForm = resetEventForm;
        window.deleteFameEntry = deleteFameEntry;
        window.editJobPosting = editJobPosting;
        window.deleteJobPosting = deleteJobPosting;
        window.resetJobPostingForm = resetJobPostingForm;
        window.editAnnouncement = editAnnouncement;
        window.deleteAnnouncement = deleteAnnouncement;
        window.resetAnnouncementForm = resetAnnouncementForm;
        window.editCoupon = editCoupon;
        window.deleteCoupon = deleteCoupon;
        window.resetCouponForm = resetCouponForm;
        window.editTrainer = editTrainer;
        window.deleteTrainer = deleteTrainer;
        window.resetTrainerForm = resetTrainerForm;
        // Business CMS
        window.editBizProduct = editBizProduct;
        window.deleteBizProduct = deleteBizProduct;
        window.editBizPartner = editBizPartner;
        window.deleteBizPartner = deleteBizPartner;
        window.editBizTestimonial = editBizTestimonial;
        window.deleteBizTestimonial = deleteBizTestimonial;
        window.editBizStat = editBizStat;
        window.deleteBizStat = deleteBizStat;
    }

    // Business CMS form listeners
    const bizHeroForm = document.getElementById('biz-hero-form');
    if (bizHeroForm) bizHeroForm.onsubmit = handleBizHeroSave;
    const bizProductForm = document.getElementById('biz-product-form');
    if (bizProductForm) bizProductForm.onsubmit = handleBizProductSave;
    const bizPartnerForm = document.getElementById('biz-partner-form');
    if (bizPartnerForm) bizPartnerForm.onsubmit = handleBizPartnerSave;
    const bizTestimonialForm = document.getElementById('biz-testimonial-form');
    if (bizTestimonialForm) bizTestimonialForm.onsubmit = handleBizTestimonialSave;
    const bizStatForm = document.getElementById('biz-stat-form');
    if (bizStatForm) bizStatForm.onsubmit = handleBizStatSave;
    // Reset buttons
    document.getElementById('biz-product-reset')?.addEventListener('click', () => { document.getElementById('biz-product-form')?.reset(); document.getElementById('biz-product-id').value = ''; });
    document.getElementById('biz-partner-reset')?.addEventListener('click', () => { document.getElementById('biz-partner-form')?.reset(); document.getElementById('biz-partner-id').value = ''; });
    document.getElementById('biz-testimonial-reset')?.addEventListener('click', () => { document.getElementById('biz-testimonial-form')?.reset(); document.getElementById('biz-testimonial-id').value = ''; });
    document.getElementById('biz-stat-reset')?.addEventListener('click', () => { document.getElementById('biz-stat-form')?.reset(); document.getElementById('biz-stat-id').value = ''; });
}

// ==========================================
// BUSINESS CMS CRUD
// ==========================================
let bizProducts = [], bizPartners = [], bizTestimonials = [], bizStats = [], bizHero = null;

async function loadBusinessCMS() {
    await Promise.all([loadBizHero(), loadBizProducts(), loadBizPartners(), loadBizTestimonials(), loadBizStats()]);
    initLucideIcons();
}

// --- HERO ---
async function loadBizHero() {
    const { data } = await supabase.from('business_hero').select('*').eq('is_active', true).limit(1).single();
    bizHero = data;
    if (data) {
        const s = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
        s('biz-hero-headline', data.headline);
        s('biz-hero-subheadline', data.subheadline);
        s('biz-hero-cycling', Array.isArray(data.cycling_words) ? data.cycling_words.join(',') : '');
        s('biz-hero-video', data.demo_video_url);
        s('biz-hero-cta1-text', data.cta_primary_text);
        s('biz-hero-cta1-link', data.cta_primary_link);
        s('biz-hero-cta2-text', data.cta_secondary_text);
        s('biz-hero-cta2-link', data.cta_secondary_link);
    }
}

async function handleBizHeroSave(e) {
    e.preventDefault();
    const payload = {
        headline: document.getElementById('biz-hero-headline')?.value?.trim(),
        subheadline: document.getElementById('biz-hero-subheadline')?.value?.trim(),
        cycling_words: (document.getElementById('biz-hero-cycling')?.value || '').split(',').map(w => w.trim()).filter(Boolean),
        demo_video_url: document.getElementById('biz-hero-video')?.value?.trim() || null,
        cta_primary_text: document.getElementById('biz-hero-cta1-text')?.value?.trim(),
        cta_primary_link: document.getElementById('biz-hero-cta1-link')?.value?.trim(),
        cta_secondary_text: document.getElementById('biz-hero-cta2-text')?.value?.trim(),
        cta_secondary_link: document.getElementById('biz-hero-cta2-link')?.value?.trim(),
    };
    if (bizHero?.id) {
        await supabase.from('business_hero').update(payload).eq('id', bizHero.id);
    } else {
        await supabase.from('business_hero').insert([payload]);
    }
    showMessageBox('Hero settings saved!');
    loadBizHero();
}

// --- PRODUCTS ---
async function loadBizProducts() {
    const { data } = await supabase.from('business_products').select('*').order('sort_order');
    bizProducts = data || [];
    const tb = document.getElementById('biz-products-table');
    if (tb) {
        tb.innerHTML = bizProducts.map(p => `<tr class="border-b border-slate-50">
            <td class="px-6 py-4"><img src="${p.image_url || ''}" class="w-16 h-10 object-cover rounded-lg bg-slate-100"></td>
            <td class="px-6 py-4 font-bold text-sm">${p.name}</td>
            <td class="px-6 py-4 text-sm text-slate-500">${p.tagline || ''}</td>
            <td class="px-6 py-4 text-right"><button onclick="window.editBizProduct('${p.id}')" class="text-xs font-bold text-primary mr-3">Edit</button><button onclick="window.deleteBizProduct('${p.id}')" class="text-xs font-bold text-red-500">Delete</button></td>
        </tr>`).join('');
    }
}

function editBizProduct(id) {
    const p = bizProducts.find(x => x.id === id); if (!p) return;
    const s = (elId, v) => { const el = document.getElementById(elId); if (el) el.value = v || ''; };
    s('biz-product-id', p.id); s('biz-product-name', p.name); s('biz-product-tagline', p.tagline);
    s('biz-product-desc', p.description); s('biz-product-image', p.image_url); s('biz-product-link', p.cta_link);
    s('biz-product-features', Array.isArray(p.features) ? p.features.join('\n') : '');
    const colorEl = document.getElementById('biz-product-color'); if (colorEl) colorEl.value = p.color_accent || '#16a34a';
    document.getElementById('main-scroll-area')?.scrollTo(0, 0);
}

async function handleBizProductSave(e) {
    e.preventDefault();
    const id = document.getElementById('biz-product-id')?.value;
    const name = document.getElementById('biz-product-name')?.value?.trim();
    const payload = {
        name, slug: name?.toLowerCase().replace(/\s+/g, '-'),
        tagline: document.getElementById('biz-product-tagline')?.value?.trim(),
        description: document.getElementById('biz-product-desc')?.value?.trim(),
        features: (document.getElementById('biz-product-features')?.value || '').split('\n').map(f => f.trim()).filter(Boolean),
        image_url: document.getElementById('biz-product-image')?.value?.trim(),
        cta_link: document.getElementById('biz-product-link')?.value?.trim() || '/business',
        color_accent: document.getElementById('biz-product-color')?.value || '#16a34a',
    };
    if (id) { await supabase.from('business_products').update(payload).eq('id', id); }
    else { await supabase.from('business_products').insert([payload]); }
    showMessageBox('Product saved!');
    document.getElementById('biz-product-form')?.reset(); document.getElementById('biz-product-id').value = '';
    loadBizProducts();
}

async function deleteBizProduct(id) {
    showConfirmBox('Delete Product', 'Are you sure?', async () => {
        await supabase.from('business_products').delete().eq('id', id);
        loadBizProducts();
    });
}

// --- PARTNERS ---
async function loadBizPartners() {
    const { data } = await supabase.from('business_partners').select('*').order('sort_order');
    bizPartners = data || [];
    const tb = document.getElementById('biz-partners-table');
    if (tb) {
        tb.innerHTML = bizPartners.map(p => `<tr class="border-b border-slate-50">
            <td class="px-6 py-4"><img src="${p.logo_url || ''}" class="h-8 object-contain bg-slate-50 rounded p-1" onerror="this.style.display='none'"></td>
            <td class="px-6 py-4 font-bold text-sm">${p.name}</td>
            <td class="px-6 py-4 text-sm text-slate-500">${p.website_url || ''}</td>
            <td class="px-6 py-4 text-right"><button onclick="window.editBizPartner('${p.id}')" class="text-xs font-bold text-primary mr-3">Edit</button><button onclick="window.deleteBizPartner('${p.id}')" class="text-xs font-bold text-red-500">Delete</button></td>
        </tr>`).join('');
    }
}

function editBizPartner(id) {
    const p = bizPartners.find(x => x.id === id); if (!p) return;
    const s = (elId, v) => { const el = document.getElementById(elId); if (el) el.value = v || ''; };
    s('biz-partner-id', p.id); s('biz-partner-name', p.name); s('biz-partner-logo', p.logo_url); s('biz-partner-website', p.website_url);
}

async function handleBizPartnerSave(e) {
    e.preventDefault();
    const id = document.getElementById('biz-partner-id')?.value;
    const payload = {
        name: document.getElementById('biz-partner-name')?.value?.trim(),
        logo_url: document.getElementById('biz-partner-logo')?.value?.trim(),
        website_url: document.getElementById('biz-partner-website')?.value?.trim(),
    };
    if (id) { await supabase.from('business_partners').update(payload).eq('id', id); }
    else { await supabase.from('business_partners').insert([payload]); }
    showMessageBox('Partner saved!');
    document.getElementById('biz-partner-form')?.reset(); document.getElementById('biz-partner-id').value = '';
    loadBizPartners();
}

async function deleteBizPartner(id) {
    showConfirmBox('Delete Partner', 'Are you sure?', async () => {
        await supabase.from('business_partners').delete().eq('id', id);
        loadBizPartners();
    });
}

// --- TESTIMONIALS ---
async function loadBizTestimonials() {
    const { data } = await supabase.from('business_testimonials').select('*').order('created_at', { ascending: false });
    bizTestimonials = data || [];
    const tb = document.getElementById('biz-testimonials-table');
    if (tb) {
        tb.innerHTML = bizTestimonials.map(t => `<tr class="border-b border-slate-50">
            <td class="px-6 py-4 font-bold text-sm">${t.client_name}</td>
            <td class="px-6 py-4 text-sm text-slate-500">${t.company || ''}</td>
            <td class="px-6 py-4 text-sm">${'⭐'.repeat(t.rating || 5)}</td>
            <td class="px-6 py-4 text-right"><button onclick="window.editBizTestimonial('${t.id}')" class="text-xs font-bold text-primary mr-3">Edit</button><button onclick="window.deleteBizTestimonial('${t.id}')" class="text-xs font-bold text-red-500">Delete</button></td>
        </tr>`).join('');
    }
}

function editBizTestimonial(id) {
    const t = bizTestimonials.find(x => x.id === id); if (!t) return;
    const s = (elId, v) => { const el = document.getElementById(elId); if (el) el.value = v || ''; };
    s('biz-testimonial-id', t.id); s('biz-testimonial-name', t.client_name); s('biz-testimonial-company', t.company);
    s('biz-testimonial-role', t.role); s('biz-testimonial-quote', t.quote); s('biz-testimonial-rating', t.rating); s('biz-testimonial-avatar', t.avatar_url);
}

async function handleBizTestimonialSave(e) {
    e.preventDefault();
    const id = document.getElementById('biz-testimonial-id')?.value;
    const payload = {
        client_name: document.getElementById('biz-testimonial-name')?.value?.trim(),
        company: document.getElementById('biz-testimonial-company')?.value?.trim(),
        role: document.getElementById('biz-testimonial-role')?.value?.trim(),
        quote: document.getElementById('biz-testimonial-quote')?.value?.trim(),
        rating: parseInt(document.getElementById('biz-testimonial-rating')?.value) || 5,
        avatar_url: document.getElementById('biz-testimonial-avatar')?.value?.trim() || null,
    };
    if (id) { await supabase.from('business_testimonials').update(payload).eq('id', id); }
    else { await supabase.from('business_testimonials').insert([payload]); }
    showMessageBox('Testimonial saved!');
    document.getElementById('biz-testimonial-form')?.reset(); document.getElementById('biz-testimonial-id').value = '';
    loadBizTestimonials();
}

async function deleteBizTestimonial(id) {
    showConfirmBox('Delete Testimonial', 'Are you sure?', async () => {
        await supabase.from('business_testimonials').delete().eq('id', id);
        loadBizTestimonials();
    });
}

// --- STATS ---
async function loadBizStats() {
    const { data } = await supabase.from('business_stats').select('*').order('sort_order');
    bizStats = data || [];
    const tb = document.getElementById('biz-stats-table');
    if (tb) {
        tb.innerHTML = bizStats.map(s => `<tr class="border-b border-slate-50">
            <td class="px-6 py-4 font-bold text-sm">${s.label}</td>
            <td class="px-6 py-4 text-sm">${s.value}</td>
            <td class="px-6 py-4 text-sm text-slate-500">${s.suffix || ''}</td>
            <td class="px-6 py-4 text-right"><button onclick="window.editBizStat('${s.id}')" class="text-xs font-bold text-primary mr-3">Edit</button><button onclick="window.deleteBizStat('${s.id}')" class="text-xs font-bold text-red-500">Delete</button></td>
        </tr>`).join('');
    }
}

function editBizStat(id) {
    const s = bizStats.find(x => x.id === id); if (!s) return;
    const set = (elId, v) => { const el = document.getElementById(elId); if (el) el.value = v || ''; };
    set('biz-stat-id', s.id); set('biz-stat-label', s.label); set('biz-stat-value', s.value); set('biz-stat-suffix', s.suffix); set('biz-stat-sort', s.sort_order);
}

async function handleBizStatSave(e) {
    e.preventDefault();
    const id = document.getElementById('biz-stat-id')?.value;
    const payload = {
        label: document.getElementById('biz-stat-label')?.value?.trim(),
        value: parseInt(document.getElementById('biz-stat-value')?.value) || 0,
        suffix: document.getElementById('biz-stat-suffix')?.value?.trim() || '+',
        sort_order: parseInt(document.getElementById('biz-stat-sort')?.value) || 0,
    };
    if (id) { await supabase.from('business_stats').update(payload).eq('id', id); }
    else { await supabase.from('business_stats').insert([payload]); }
    showMessageBox('Stat saved!');
    document.getElementById('biz-stat-form')?.reset(); document.getElementById('biz-stat-id').value = '';
    loadBizStats();
}

async function deleteBizStat(id) {
    showConfirmBox('Delete Stat', 'Are you sure?', async () => {
        await supabase.from('business_stats').delete().eq('id', id);
        loadBizStats();
    });
}