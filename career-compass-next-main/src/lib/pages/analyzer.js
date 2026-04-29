// import { supabase } from '../supabase';

// const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// let currentAnalysisPayload = null;

// const roleOptions = {
//     "Computer Science (CSE)": `
//         <optgroup label="Software Development & Engineering">
//             <option>Software Developer</option>
//             <option>Front-End Developer</option>
//             <option>Back-End Developer</option>
//             <option>Full-Stack Developer</option>
//             <option>Mobile Application Developer (iOS/Android)</option>
//             <option>Game Developer</option>
//             <option>Software Architect</option>
//             <option>Embedded Systems Engineer</option>
//             <option>Software Development Engineer in Test (SDET)</option>
//         </optgroup>
//         <optgroup label="Artificial Intelligence & Machine Learning">
//             <option>AI/ML Engineer</option>
//             <option>Data Scientist</option>
//             <option>Data Analyst</option>
//             <option>Computer Vision Engineer</option>
//             <option>Natural Language Processing (NLP) Scientist</option>
//             <option>Prompt Engineer</option>
//         </optgroup>
//         <optgroup label="Cloud, DevOps & Infrastructure">
//             <option>Cloud Engineer</option>
//             <option>DevOps Engineer</option>
//             <option>Site Reliability Engineer (SRE)</option>
//             <option>Infrastructure Engineer</option>
//             <option>Network Engineer</option>
//         </optgroup>
//         <optgroup label="Cybersecurity">
//             <option>Cybersecurity Analyst</option>
//             <option>Security Engineer</option>
//             <option>Penetration Tester (Ethical Hacker)</option>
//         </optgroup>
//         <optgroup label="Product & Project Management">
//             <option>Product Manager</option>
//             <option>Technical Program Manager (TPM)</option>
//         </optgroup>
//     `,
//     "Information Technology (IT)": `
//         <optgroup label="IT Support & Operations">
//             <option>IT Support Specialist</option>
//         </optgroup>
//         <optgroup label="Infrastructure & Networking">
//             <option>Network Administrator</option>
//             <option>Systems Administrator (SysAdmin)</option>
//             <option>Cloud Administrator</option>
//         </optgroup>
//         <optgroup label="Security & Compliance">
//             <option>Security Administrator</option>
//         </optgroup>
//     `,
//     "Electronics & Communication (ECE)": `
//         <optgroup label="Core Hardware & Electronics">
//             <option>Hardware Engineer</option>
//         </optgroup>
//         <optgroup label="Embedded Systems & IoT">
//             <option>Embedded Systems Engineer</option>
//         </optgroup>
//         <optgroup label="Semiconductors & VLSI">
//             <option>VLSI Design Engineer</option>
//         </optgroup>
//     `
// };

// export function updateTargetRoles() {
//     const branchSelect = document.getElementById('branch');
//     const targetRoleSelect = document.getElementById('targetRole');

//     if (branchSelect && targetRoleSelect) {
//         const selectedBranch = branchSelect.value;
//         targetRoleSelect.innerHTML = roleOptions[selectedBranch] || '';
//     }
// }

// export async function handleFormSubmit(event) {
//     event.preventDefault();

//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) {
//         alert("Please log in to use the analyzer.");
//         window.location.href = '/login';
//         return;
//     }

//     const analysisForm = document.getElementById('analysis-form');
//     const formData = new FormData(analysisForm);

//     const analysisData = {
//         user_id: user.id,
//         full_name: formData.get('fullName'),
//         email: formData.get('email'),
//         college_name: formData.get('collegeName'),
//         target_company: formData.get('targetCompany'),
//         branch: formData.get('branch'),
//         target_role: formData.get('targetRole')
//     };

//     const formContainer = document.getElementById('form-container');
//     const loader = document.getElementById('loader');
//     const errorContainer = document.getElementById('error-message-container');
//     const resultsDisplay = document.getElementById('results-display');

//     formContainer.classList.add('hidden');
//     errorContainer.classList.add('hidden');
//     resultsDisplay.classList.add('hidden');
//     loader.classList.remove('hidden');

//     try {
//         await supabase.from('analysis_requests').insert([analysisData]);

//         // const response = await fetch('/api/analyze', {
//       const response =  await fetch('https://career-compass-app.onrender.com/api/analyze',{
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 branch: analysisData.branch,
//                 targetRole: analysisData.target_role
//             }),
//         });

//         const data = await response.json();
//         if (!response.ok) throw new Error(data.error || 'Server unreachable.');

//         currentAnalysisPayload = {
//             analysisResult: data,
//             targetRole: analysisData.target_role,
//             userName: analysisData.full_name
//         };

//         renderResults(data, analysisData.full_name, analysisData.target_role);
//         resultsDisplay.classList.remove('hidden');
//         resultsDisplay.scrollIntoView({ behavior: 'smooth' });

//     } catch (error) {
//         console.error('Error:', error);
//         errorContainer.innerHTML = `<div class="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold mt-4"><strong>Error:</strong> ${error.message}</div>`;
//         errorContainer.classList.remove('hidden');
//         formContainer.classList.remove('hidden');
//     } finally {
//         loader.classList.add('hidden');
//     }
// }

// export function renderResults(data, userName, targetRole) {
//     document.getElementById('user-name-result').textContent = userName;
//     document.getElementById('user-role-result').textContent = targetRole;

//     const coreSkillsCount = Object.values(data.coreFocusBySemester || {}).flat().length;
//     const roadmapItemsCount = (data.personalizedRoadmap || []).length;
//     const matchPercentage = Math.round((coreSkillsCount / (coreSkillsCount + roadmapItemsCount)) * 100) || 0;

//     document.getElementById('result-match-text').textContent = `${matchPercentage}%`;
//     document.getElementById('result-match-circle').style.strokeDasharray = `${matchPercentage}, 100`;

//     if (currentAnalysisPayload) {
//         currentAnalysisPayload.confidence = matchPercentage;
//     }

//     const focusList = document.getElementById('core-focus-list');
//     focusList.innerHTML = '';

//     Object.entries(data.coreFocusBySemester).forEach(([sem, subjects]) => {
//         const div = document.createElement('div');
//         div.innerHTML = `
//             <h4 class="text-[10px] font-black text-primary uppercase tracking-widest mb-3 border-b border-slate-100 dark:border-white/5 pb-2">${sem}</h4>
//             <div class="grid gap-3 mb-6">
//                 ${subjects.map(s => `
//                     <div class="flex justify-between items-center p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
//                         <span class="text-sm font-bold">${s.name}</span>
//                         <div class="flex gap-3">
//                             <a href="${s.youtube}" target="_blank" class="text-red-500 opacity-60 hover:opacity-100 transition">
//                                 <i class="fa-brands fa-youtube"></i>
//                             </a>
//                             <a href="${s.article}" target="_blank" class="text-slate-400 hover:text-primary transition">
//                                 <i class="fa-solid fa-file-lines"></i>
//                             </a>
//                         </div>
//                     </div>
//                 `).join('')}
//             </div>
//         `;
//         focusList.appendChild(div);
//     });

//     document.getElementById('missing-skills-list').innerHTML = data.criticalMissingSkills.map(s =>
//         `<span class="px-4 py-2 bg-pink-50 dark:bg-pink-900/20 text-secondary rounded-full text-[10px] font-black uppercase border border-pink-100 dark:border-transparent">${s}</span>`
//     ).join('');

//     document.getElementById('roadmap-list').innerHTML = data.personalizedRoadmap.map((item, i) => `
//         <div class="flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 hover:border-primary/40 transition">
//             <div class="flex items-center gap-4">
//                 <span class="w-8 h-8 flex items-center justify-center bg-white dark:bg-white/10 rounded-xl text-primary font-black text-[10px] shadow-sm">${i + 1}</span>
//                 <p class="font-bold text-sm">${item.name}</p>
//             </div>
//             <div class="flex gap-4 text-xs font-bold">
//                 <a href="${item.youtube}" target="_blank" class="text-red-500 hover:scale-105 transition">Video</a>
//                 <a href="${item.article}" target="_blank" class="text-slate-500 hover:text-primary transition">Read</a>
//             </div>
//         </div>
//     `).join('');

//     if (typeof window !== 'undefined' && window.lucide) {
//         window.lucide.createIcons();
//     }

//     const savePathBtn = document.getElementById('save-path-btn');
//     const savePathNotification = document.getElementById('save-path-notification');

//     if (savePathBtn) {
//         savePathBtn.classList.remove('hidden');
//         savePathBtn.disabled = false;
//         savePathBtn.textContent = 'Save Results to Profile';
//     }

//     if (savePathNotification) {
//         savePathNotification.classList.add('hidden');
//     }
// }

// export async function saveAnalysisToSupabase() {
//     if (!currentAnalysisPayload) return;

//     const savePathBtn = document.getElementById('save-path-btn');
//     const savePathNotification = document.getElementById('save-path-notification');

//     if (savePathBtn) {
//         savePathBtn.disabled = true;
//         savePathBtn.textContent = 'Syncing...';
//     }

//     try {
//         const { data: { user } } = await supabase.auth.getUser();
//         if (!user) throw new Error("Auth required");

//         const { analysisResult, targetRole, confidence } = currentAnalysisPayload;

//         await supabase.from('target_roles').upsert({
//             user_id: user.id,
//             role_name: targetRole,
//             description: 'Set from Path Analyzer.'
//         }, { onConflict: 'user_id' });

//         const { data: newAnalysis, error: analError } = await supabase.from('analyses').insert({
//             user_id: user.id,
//             match_percentage: confidence
//         }).select('id').single();

//         if (analError) throw analError;

//         const roadmapItems = analysisResult.personalizedRoadmap || [];
//         if (roadmapItems.length > 0) {
//             const gaps = roadmapItems.map(item => ({
//                 user_id: user.id,
//                 analysis_id: newAnalysis.id,
//                 skill_name: item.name,
//                 description: `Critical skill for ${targetRole}.`
//             }));
//             await supabase.from('skill_gaps').insert(gaps);
//         }

//         if (savePathBtn) {
//             savePathBtn.textContent = 'Saved! ✅';
//             savePathBtn.className = "w-full md:w-auto px-8 py-3 bg-green-600 text-white rounded-xl font-bold transition";
//         }

//         if (savePathNotification) {
//             savePathNotification.innerHTML = `Success! View results in your <a href="/profile" class="underline">Dashboard</a>.`;
//             savePathNotification.classList.remove('hidden');
//         }

//     } catch (error) {
//         console.error("Save Error:", error);
//         if (savePathBtn) {
//             savePathBtn.disabled = false;
//             savePathBtn.textContent = 'Retry Saving';
//         }
//     }
// }

// export function resetView() {
//     const resultsDisplay = document.getElementById('results-display');
//     const formContainer = document.getElementById('form-container');

//     if (resultsDisplay) resultsDisplay.classList.add('hidden');
//     if (formContainer) formContainer.classList.remove('hidden');

//     currentAnalysisPayload = null;
//     window.scrollTo({ top: 0, behavior: 'smooth' });
// }

// // export function setTheme(isDark) {
// //     document.documentElement.classList.toggle('dark', isDark);
// //     const icons = document.querySelectorAll('#theme-icon, #mobile-theme-toggle i');
// //     icons.forEach(icon => icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon'));

// //     if (typeof window !== 'undefined' && window.lucide) {
// //         window.lucide.createIcons();
// //     }

// //     localStorage.setItem('theme', isDark ? 'dark' : 'light');
// // }
// export function setTheme(isDark) {
//     document.documentElement.classList.toggle('dark', isDark);
//     const icons = document.querySelectorAll('#theme-icon, #mobile-theme-toggle i');
//     icons.forEach(icon => icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon'));

//     // Re-create icons after attribute change
//     if (typeof window !== 'undefined' && window.lucide) {
//         window.lucide.createIcons();
//     }

//     localStorage.setItem('theme', isDark ? 'dark' : 'light');
// }

// export async function initAnalyzerPage() {
//     if (typeof window !== 'undefined' && window.lucide) {
//         window.lucide.createIcons();
//     }

//     const { data: { user } } = await supabase.auth.getUser();

//     if (user) {
//         document.getElementById('profile-btn')?.classList.remove('hidden');
//         document.getElementById('footer-auth')?.classList.remove('hidden');
//         document.getElementById('login-btn')?.classList.add('hidden');
//         document.getElementById('mobile-profile-btn')?.classList.remove('hidden');
//         document.getElementById('mobile-login-btn')?.classList.add('hidden');

//         const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
//         if (profile) {
//             const fullNameInput = document.getElementById('fullName');
//             const emailInput = document.getElementById('email');
//             const footerUserName = document.getElementById('footer-user-name');
//             const footerUserEmail = document.getElementById('footer-user-email');

//             if (fullNameInput) fullNameInput.value = profile.full_name || '';
//             if (emailInput) emailInput.value = user.email || '';
//             if (footerUserName) footerUserName.textContent = profile.full_name;
//             if (footerUserEmail) footerUserEmail.textContent = user.email;

//             if (profile.avatar_url) {
//                 const avatarImgs = [
//                     document.getElementById('nav-avatar-img'),
//                     document.getElementById('footer-avatar-img')
//                 ];
//                 avatarImgs.forEach(img => {
//                     if (img) {
//                         img.src = profile.avatar_url;
//                         img.classList.remove('hidden');
//                     }
//                 });
//             }
//         }
//     }

//     // Theme initialization
//     if (localStorage.getItem('theme') === 'dark') {
//         setTheme(true);
//     }

//     // Mobile menu toggle
//     const mobileToggle = document.getElementById('mobile-menu-toggle');
//     const mobileMenu = document.getElementById('mobile-menu');

//     if (mobileToggle && mobileMenu) {
//         mobileToggle.onclick = () => mobileMenu.classList.toggle('hidden');
//         mobileMenu.onclick = (e) => {
//             if (e.target.closest('a')) {
//                 mobileMenu.classList.add('hidden');
//             }
//         };
//     }

//     // Initialize target roles
//     updateTargetRoles();

//     // Event listeners
//     const analysisForm = document.getElementById('analysis-form');
//     const backBtn = document.getElementById('back-btn');
//     const branchSelect = document.getElementById('branch');
//     const savePathBtn = document.getElementById('save-path-btn');
//     const themeToggle = document.getElementById('theme-toggle');
//     const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
//     const logoutBtn = document.getElementById('logout-btn-footer');

//     if (analysisForm) {
//         analysisForm.addEventListener('submit', handleFormSubmit);
//     }

//     if (backBtn) {
//         backBtn.addEventListener('click', resetView);
//     }

//     if (branchSelect) {
//         branchSelect.addEventListener('change', updateTargetRoles);
//     }

//     if (savePathBtn) {
//         savePathBtn.addEventListener('click', saveAnalysisToSupabase);
//     }

//     if (themeToggle) {
//         themeToggle.onclick = () => setTheme(!document.documentElement.classList.contains('dark'));
//     }

//     if (mobileThemeToggle) {
//         mobileThemeToggle.onclick = () => setTheme(!document.documentElement.classList.contains('dark'));
//     }

//     if (logoutBtn) {
//         logoutBtn.onclick = async () => {
//             await supabase.auth.signOut();
//             window.location.reload();
//         };
//     }

//     // Expose functions to window for inline handlers if needed
//     if (typeof window !== 'undefined') {
//         window.updateTargetRoles = updateTargetRoles;
//         window.handleFormSubmit = handleFormSubmit;
//         window.saveAnalysisToSupabase = saveAnalysisToSupabase;
//         window.resetView = resetView;
//         window.setTheme = setTheme;
//     }
// }

// src/lib/pages/analyzer.js
// Integrated: Supabase auth + save (from your existing file)
//             + Path Analyser full roadmap rendering (from new backend)

import { supabase } from "../supabase";

// ─── point this at your Express backend ───────────────────────────────────────
// In production set NEXT_PUBLIC_ROADMAP_API in your .env.local
const ROADMAP_API =
  process.env.NEXT_PUBLIC_ROADMAP_API || "https://path-analyzer.vercel.app/api";

// ─── module-level state ───────────────────────────────────────────────────────
let currentAnalysisPayload = null;
let currentUserType = null; // 'student' | 'professional'

// ─── role options (unchanged from your original) ─────────────────────────────
const roleOptions = {
  "Computer Science (CSE)": `
    <optgroup label="Software Development & Engineering">
      <option>Software Developer</option>
      <option>Front-End Developer</option>
      <option>Back-End Developer</option>
      <option>Full-Stack Developer</option>
      <option>Mobile Application Developer (iOS/Android)</option>
      <option>Game Developer</option>
      <option>Software Architect</option>
      <option>Embedded Systems Engineer</option>
      <option>Software Development Engineer in Test (SDET)</option>
    </optgroup>
    <optgroup label="Artificial Intelligence & Machine Learning">
      <option>AI/ML Engineer</option>
      <option>Data Scientist</option>
      <option>Data Analyst</option>
      <option>Computer Vision Engineer</option>
      <option>Natural Language Processing (NLP) Scientist</option>
      <option>Prompt Engineer</option>
    </optgroup>
    <optgroup label="Cloud, DevOps & Infrastructure">
      <option>Cloud Engineer</option>
      <option>DevOps Engineer</option>
      <option>Site Reliability Engineer (SRE)</option>
      <option>Infrastructure Engineer</option>
      <option>Network Engineer</option>
    </optgroup>
    <optgroup label="Cybersecurity">
      <option>Cybersecurity Analyst</option>
      <option>Security Engineer</option>
      <option>Penetration Tester (Ethical Hacker)</option>
    </optgroup>
    <optgroup label="Product & Project Management">
      <option>Product Manager</option>
      <option>Technical Program Manager (TPM)</option>
    </optgroup>`,
  "Information Technology (IT)": `
    <optgroup label="IT Support & Operations">
      <option>IT Support Specialist</option>
    </optgroup>
    <optgroup label="Infrastructure & Networking">
      <option>Network Administrator</option>
      <option>Systems Administrator (SysAdmin)</option>
      <option>Cloud Administrator</option>
    </optgroup>
    <optgroup label="Security & Compliance">
      <option>Security Administrator</option>
    </optgroup>`,
  "Electronics & Communication (ECE)": `
    <optgroup label="Core Hardware & Electronics">
      <option>Hardware Engineer</option>
    </optgroup>
    <optgroup label="Embedded Systems & IoT">
      <option>Embedded Systems Engineer</option>
    </optgroup>
    <optgroup label="Semiconductors & VLSI">
      <option>VLSI Design Engineer</option>
    </optgroup>`,
};

// ─── helpers ──────────────────────────────────────────────────────────────────
export function updateTargetRoles() {
  const branchSelect = document.getElementById("branch");
  const targetRoleSelect = document.getElementById("targetRole");
  if (branchSelect && targetRoleSelect) {
    targetRoleSelect.innerHTML = roleOptions[branchSelect.value] || "";
  }
}

function sanitize(str) {
  // prevent XSS from AI-returned strings injected into innerHTML
  const d = document.createElement("div");
  d.textContent = str ?? "";
  return d.innerHTML;
}

function ytBtn(q) {
  const url =
    q && q.startsWith("http")
      ? q
      : `https://www.youtube.com/results?search_query=${encodeURIComponent(q || "")}`;
  return `<a class="rm-icon-btn rm-yt-btn" href="${url}" target="_blank" rel="noopener">▶ YouTube</a>`;
}
function notesBtn(name) {
  return `<a class="rm-icon-btn rm-notes-btn" href="https://www.geeksforgeeks.org/search/${encodeURIComponent(name)}/" target="_blank" rel="noopener">📄 Notes</a>`;
}
function topicHTML(t) {
  return `<div class="rm-topic-card">
    <div class="rm-topic-name">
      ${sanitize(t.name)}
      <span class="rm-topic-badge">TOPIC</span>
      ${t.priority ? `<span class="rm-topic-badge" style="background:rgba(232,64,64,0.1);color:var(--danger)">${sanitize(t.priority)}</span>` : ""}
      ${t.estimated_hours ? `<span style="font-size:11px;color:var(--muted)">${sanitize(t.estimated_hours)}</span>` : ""}
    </div>
    <div class="rm-topic-notes">${sanitize(t.notes)}</div>
    <div class="rm-topic-actions">${ytBtn(t.youtube_resource)}${notesBtn(t.name)}</div>
  </div>`;
}
function goalItem(text) {
  return `<div class="rm-goal-item"><div class="rm-goal-dot"></div>${sanitize(text)}</div>`;
}
function listCard(title, items = []) {
  return `<div class="rm-overview-card"><h4>${sanitize(title)}</h4>${items.map(goalItem).join("")}</div>`;
}

// ─── form submit ──────────────────────────────────────────────────────────────
export async function handleFormSubmit(event) {
  event.preventDefault();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    alert("Please log in to use the analyzer.");
    window.location.href = "/login";
    return;
  }

  const form = document.getElementById("analysis-form");
  const fd = new FormData(form);
  const v = (name) => (fd.get(name) || "").trim();

  // ── collect all fields (new backend needs richer profile) ──
  const userType = v("userType") || "student"; // hidden input in the form
  currentUserType = userType;

  // Fields shared by both types
  const common = {
    user_type: userType,
    name: v("fullName"),
    email: v("email"),
    target_company: v("targetCompany"),
    job_role: v("targetRole"),
  };

  let payload;
  if (userType === "student") {
    const currentSem = parseInt(v("currentSemester")) || 5;
    const semsLeft = [];
    for (let i = currentSem; i <= 8; i++) semsLeft.push(i);
    payload = {
      ...common,
      college: v("collegeName"),
      branch: v("branch"),
      current_semester: currentSem,
      cgpa: v("cgpa") || "not provided",
      cp_level: v("cpLevel") || "not started",
      experience: v("experience") || "none",
      known_skills: v("knownSkills") || "none",
      emp_type: v("empType") || "Full Time Placement",
      timeline: v("timeline") || "By End of Degree",
      challenge: v("struggle") || "not specified",
      goals_input: v("goals") || "none",
      sems_to_cover: semsLeft,
    };
  } else {
    payload = {
      ...common,
      current_company: v("currentCompany"),
      current_role: v("currentRole"),
      years_exp: v("yearsExp") || "1-2 years",
      switch_reason: v("switchReason") || "better salary",
      current_stack: v("currentStack") || "none",
      timeline: v("timeline") || "within 6 months",
      weekly_hours: v("weeklyHours") || "8-15 hours/week",
      challenge: v("struggle") || "not specified",
      goals_input: v("goals") || "none",
    };
  }

  // ── also save lightweight record to Supabase (existing behaviour) ──
  const dbRecord = {
    user_id: user.id,
    full_name: common.name,
    email: common.email,
    college_name: v("collegeName") || null,
    target_company: common.target_company,
    branch: v("branch") || null,
    target_role: common.job_role,
  };

  const formContainer = document.getElementById("form-container");
  const loader = document.getElementById("loader");
  const errorContainer = document.getElementById("error-message-container");
  const resultsDisplay = document.getElementById("results-display");

  formContainer.classList.add("hidden");
  errorContainer.classList.add("hidden");
  resultsDisplay.classList.add("hidden");
  loader.classList.remove("hidden");

  // Abort controller — give the backend max 60 s
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60_000);

  try {
    // save to Supabase (non-blocking, ignore error if table not ready)
    supabase
      .from("analysis_requests")
      .insert([dbRecord])
      .then(() => {})
      .catch(() => {});

    const res = await fetch(`${ROADMAP_API}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const json = await res.json();
    if (!json.success)
      throw new Error(json.error || "Server returned an error");

    currentAnalysisPayload = {
      analysisResult: json.data,
      targetRole: common.job_role,
      userName: common.name,
      userType,
    };

    renderRoadmapResult(json.data, common.name, common.job_role, userType);
    resultsDisplay.classList.remove("hidden");
    resultsDisplay.scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    clearTimeout(timeoutId);
    console.error("Roadmap error:", err);
    const msg =
      err.name === "AbortError"
        ? "Request timed out — the AI is taking too long. Please try again."
        : err.message;
    errorContainer.innerHTML = `<div class="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold mt-4"><strong>Error:</strong> ${sanitize(msg)}</div>`;
    errorContainer.classList.remove("hidden");
    formContainer.classList.remove("hidden");
  } finally {
    loader.classList.add("hidden");
  }
}

// ─── render full roadmap ──────────────────────────────────────────────────────
export function renderRoadmapResult(data, userName, targetRole, userType) {
  // Header
  const nameEl = document.getElementById("user-name-result");
  const roleEl = document.getElementById("user-role-result");
  if (nameEl) nameEl.textContent = userName;
  if (roleEl) roleEl.textContent = targetRole;

  // ── confidence circle (reuse existing SVG element) ──
  const items = [...(data.phase_roadmap || []), ...(data.project_roadmap || [])]
    .length;
  const skills = (data.skills_checklist?.technical || []).length;
  const matchPct = Math.min(
    Math.round((skills / Math.max(skills + items, 1)) * 100 + 20),
    95,
  );
  const matchText = document.getElementById("result-match-text");
  const matchCircle = document.getElementById("result-match-circle");
  if (matchText) matchText.textContent = `${matchPct}%`;
  if (matchCircle) matchCircle.style.strokeDasharray = `${matchPct}, 100`;
  if (currentAnalysisPayload) currentAnalysisPayload.confidence = matchPct;

  // ── inject roadmap sections into results-display ──
  // We use a dedicated container inside results-display (see page JSX below)
  const container = document.getElementById("roadmap-sections");
  if (!container) return;

  container.innerHTML = `
    ${renderOverviewHTML(data.career_overview || {})}
    ${renderReadinessHTML(data.readiness_assessment || {})}

    ${
      userType === "student"
        ? `
      ${renderSemesterTabsHTML(data.semester_roadmap || [])}
      ${renderDSAHTML(data.dsa_roadmap || {})}
    `
        : `
      ${renderTransferHTML(data.transferable_skills || {})}
      ${renderTransitionHTML(data.transition_roadmap || [])}
      ${renderPortfolioHTML(data.portfolio_strategy || {})}
      ${renderLinkedInHTML(data.linkedin_strategy || {})}
      ${renderSalaryHTML(data.salary_negotiation_tips || [])}
    `
    }

    ${renderPhasesHTML(data.phase_roadmap || [])}
    ${renderProjectsHTML(data.project_roadmap || [])}
    ${renderSkillsHTML(data.skills_checklist || {})}
    ${renderPlacementHTML(data.placement_strategy || {})}
    ${renderAdviceHTML(data.personalized_advice || {}, userType)}
  `;

  // Activate semester tabs after render
  if (userType === "student") activateSemTabs();

  // Lucide icons refresh
  if (typeof window !== "undefined" && window.lucide)
    window.lucide.createIcons();

  // Save button
  const saveBtn = document.getElementById("save-path-btn");
  const saveNote = document.getElementById("save-path-notification");
  if (saveBtn) {
    saveBtn.classList.remove("hidden");
    saveBtn.disabled = false;
    saveBtn.textContent = "Save Results to Profile";
  }
  if (saveNote) saveNote.classList.add("hidden");
}

// ── section renderers (return HTML strings) ──────────────────────────────────

function renderOverviewHTML(o) {
  return `
    <div class="rm-section-title">Career Overview</div>
    <div class="rm-overview-grid">
      <div class="rm-overview-card full"><h4>Role Description</h4><p>${sanitize(o.role_description)}</p></div>
      <div class="rm-overview-card"><h4>Key Skills</h4>
        <div class="rm-pill-list">${(o.key_skills || []).map((s) => `<span class="rm-pill">${sanitize(s)}</span>`).join("")}</div>
      </div>
      <div class="rm-overview-card"><h4>Company Alignment</h4><p>${sanitize(o.alignment_with_company)}</p></div>
      ${o.hiring_process_at_company ? `<div class="rm-overview-card"><h4>Hiring Process</h4><p>${sanitize(o.hiring_process_at_company)}</p></div>` : ""}
      ${o.salary_range ? `<div class="rm-overview-card"><h4>Salary Range</h4><p>${sanitize(o.salary_range)}</p></div>` : ""}
      ${o.growth_path ? `<div class="rm-overview-card"><h4>Growth Path</h4><p>${sanitize(o.growth_path)}</p></div>` : ""}
    </div>`;
}

function renderReadinessHTML(ra) {
  return `
    <div class="rm-section-title">Readiness Assessment</div>
    <div class="rm-readiness-grid">
      <div class="rm-overview-card"><h4>Current Level</h4><p>${sanitize(ra.current_level)}</p></div>
      <div class="rm-overview-card"><h4>Gap Analysis</h4><p>${sanitize(ra.gap_analysis)}</p></div>
      <div class="rm-overview-card full"><h4>Top 3 Priorities</h4>
        ${(ra.top_3_priorities || []).map((p, i) => `<div class="rm-goal-item"><div class="rm-goal-dot" style="background:var(--type-accent)"></div><strong>${i + 1}.</strong>&nbsp;${sanitize(p)}</div>`).join("")}
      </div>
    </div>`;
}

function renderSemesterTabsHTML(sems) {
  const tabs = sems
    .map(
      (s, i) =>
        `<button class="rm-sem-tab${i === 0 ? " active" : ""}" data-sem-idx="${i}">Sem ${s.semester}${s.is_current ? " ✦" : ""}</button>`,
    )
    .join("");

  const panels = sems
    .map((sem, i) => {
      const mb = sem.monthly_breakdown || {};
      const mbHTML = Object.keys(mb).length
        ? `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;">
          ${Object.entries(mb)
            .map(
              ([k, v]) =>
                `<div class="rm-overview-card"><h4>${sanitize(k.replace("month", "Month "))}</h4><p style="font-size:13px">${sanitize(v)}</p></div>`,
            )
            .join("")}
         </div>`
        : "";
      return `<div class="rm-sem-panel${i === 0 ? " active" : ""}" data-sem-panel="${i}">
      <div class="rm-sem-focus ">🎯 ${sanitize(sem.focus)}</div>
      ${sem.dsa_focus ? `<div );border-radius:8px;font-size:13px;color:var(--type-accent)">⚡ DSA: ${sanitize(sem.dsa_focus)}</div>` : ""}
      ${mbHTML}
      ${(sem.topics || []).map(topicHTML).join("")}
      ${(sem.practical_goals || []).map(goalItem).join("")}
      ${sem.milestone ? `<div class="rm-milestone">🏁 Milestone: ${sanitize(sem.milestone)}</div>` : ""}
    </div>`;
    })
    .join("");

  return `
    <div class="rm-section-title">Semester Roadmap</div>
    <div class="rm-sem-tabs" id="rm-sem-tabs">${tabs}</div>
    <div id="rm-sem-panels" style="margin-bottom:32px">${panels}</div>`;
}

function activateSemTabs() {
  const tabs = document.querySelectorAll(".rm-sem-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const idx = tab.dataset.semIdx;
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      document
        .querySelectorAll(".rm-sem-panel")
        .forEach((p) => p.classList.remove("active"));
      const panel = document.querySelector(`[data-sem-panel="${idx}"]`);
      if (panel) panel.classList.add("active");
    });
  });
}

function renderDSAHTML(d) {
  return `
    <div class="rm-section-title">DSA Roadmap</div>
    <div class="rm-overview-grid">
      <div class="rm-overview-card"><h4>Target Problems</h4><p style="font-size:26px;font-weight:800;color:var(--type-accent)">${sanitize(d.total_problems_target)}</p></div>
      <div class="rm-overview-card"><h4>Weekly Target</h4><p style="font-size:26px;font-weight:800;color:var(--accent3)">${sanitize(d.weekly_target)}</p></div>
      <div class="rm-overview-card"><h4>Platforms</h4><div class="rm-pill-list">${(d.platforms || []).map((p) => `<span class="rm-pill">${sanitize(p)}</span>`).join("")}</div></div>
      <div class="rm-overview-card"><h4>Topic Order</h4>${(d.topic_order || []).map((t, i) => `<div class="rm-goal-item"><div class="rm-goal-dot"></div><strong>${i + 1}.</strong>&nbsp;${sanitize(t)}</div>`).join("")}</div>
      ${d.mock_interview_schedule ? `<div class="rm-overview-card full"><h4>Mock Interview Schedule</h4><p>${sanitize(d.mock_interview_schedule)}</p></div>` : ""}
    </div>`;
}

function renderTransferHTML(ts) {
  return `
    <div class="rm-section-title">Transferable Skills</div>
    <div class="rm-transfer-grid">
      <div class="rm-col-card"><h4>✅ Strong Carry-Overs</h4>${(ts.strong || []).map((i) => `<div class="rm-col-item"><div class="rm-goal-dot" style="background:var(--accent3)"></div>${sanitize(i)}</div>`).join("")}</div>
      <div class="rm-col-card"><h4>🔄 Needs Reframing</h4>${(ts.needs_reframing || []).map((i) => `<div class="rm-col-item"><div class="rm-goal-dot" style="background:var(--accent2)"></div>${sanitize(i)}</div>`).join("")}</div>
      <div class="rm-col-card"><h4>⚠️ Gaps to Fill</h4>${(ts.gaps_to_fill || []).map((i) => `<div class="rm-col-item"><div class="rm-goal-dot" style="background:var(--danger)"></div>${sanitize(i)}</div>`).join("")}</div>
    </div>`;
}

function renderTransitionHTML(months) {
  return `
    <div class="rm-section-title">Transition Roadmap</div>
    ${months
      .map(
        (m) => `
      <div class="rm-month-card">
        <div class="rm-month-range">${sanitize(m.month_range)}</div>
        <div class="rm-month-focus">${sanitize(m.focus)}</div>
        ${(m.actions || []).map(goalItem).join("")}
        ${(m.topics || []).map(topicHTML).join("")}
        ${m.milestone ? `<div class="rm-milestone">🏁 ${sanitize(m.milestone)}</div>` : ""}
      </div>`,
      )
      .join("")}`;
}

function renderPortfolioHTML(p) {
  return `
    <div class="rm-section-title">Portfolio Strategy</div>
    <div class="rm-overview-grid">
      ${listCard("GitHub Profile Tips", p.github_profile_tips)}
      ${listCard("Projects to Build", p.projects_to_build)}
      ${listCard("Case Studies to Document", p.case_studies_to_document)}
    </div>`;
}

function renderLinkedInHTML(l) {
  return `
    <div class="rm-section-title">LinkedIn Strategy</div>
    <div class="rm-overview-grid">
      <div class="rm-overview-card full"><h4>Headline Formula</h4><p style="font-size:15px;font-weight:600">${sanitize(l.headline_formula)}</p></div>
      ${listCard("About Section Tips", l.about_section_tips)}
      ${listCard("Networking Actions", l.networking_actions)}
    </div>`;
}

function renderSalaryHTML(tips) {
  return `
    <div class="rm-section-title">Salary Negotiation</div>
    ${(tips || []).map((t, i) => `<div class="rm-sal-item"><span class="rm-sal-num">${String(i + 1).padStart(2, "0")}</span>${sanitize(t)}</div>`).join("")}`;
}

function renderPhasesHTML(phases) {
  return `
    <div class="rm-section-title">Phase Roadmap</div>
    <div class="rm-phase-grid">
      ${phases
        .map(
          (ph) => `
        <div class="rm-phase-card" data-phase="${ph.phase}">
          <div class="rm-phase-title">Phase ${ph.phase}: ${sanitize(ph.title)}</div>
          <div class="rm-phase-duration">${sanitize(ph.duration)}${ph.weekly_hours_commitment ? " · " + sanitize(ph.weekly_hours_commitment) + "/wk" : ""}</div>
          ${ph.goal ? `<p style="font-size:13px;color:var(--muted);margin-bottom:12px">${sanitize(ph.goal)}</p>` : ""}
          ${(ph.topics || []).map(topicHTML).join("")}
          ${(ph.tools || []).length ? `<div class="rm-pill-list" style="margin:10px 0">${ph.tools.map((t) => `<span class="rm-pill">${sanitize(t)}</span>`).join("")}</div>` : ""}
          ${(ph.projects || []).map(goalItem).join("")}
        </div>`,
        )
        .join("")}
    </div>`;
}

function renderProjectsHTML(projects) {
  return `
    <div class="rm-section-title">Project Roadmap</div>
    ${projects
      .map(
        (p) => `
      <div class="rm-project-card">
        <div class="rm-project-level rm-level-${(p.level || "Beginner").replace(/\s+/g, "")}">${sanitize(p.level)}</div>
        <div>
          <div class="rm-project-title">${sanitize(p.title)}</div>
          <div class="rm-project-desc">${sanitize(p.description)}</div>
          ${p.why_this_project ? `<div style="margin:7px 0;font-size:12px;color:var(--type-accent)">💡 ${sanitize(p.why_this_project)}</div>` : ""}
          <div style="margin-top:8px">${(p.tech_stack || []).map((t) => `<span class="rm-stack-pill">${sanitize(t)}</span>`).join("")}</div>
          ${p.duration ? `<div style="margin-top:7px;font-size:11px;color:var(--muted)">⏱ ${sanitize(p.duration)}</div>` : ""}
        </div>
      </div>`,
      )
      .join("")}`;
}

function renderSkillsHTML(sc) {
  const col = (title, items = [], dot) => `
    <div class="rm-skill-col"><h4>${title}</h4>
      ${items.map((s) => `<div class="rm-skill-item"><div class="rm-skill-dot ${dot}"></div>${sanitize(s)}</div>`).join("")}
    </div>`;
  return `
    <div class="rm-section-title">Skills Checklist</div>
    <div class="rm-skills-grid">
      ${col("Technical", sc.technical, "rm-dot-tech")}
      ${col("Tools & Platforms", sc.tools, "rm-dot-tool")}
      ${col("Soft Skills", sc.soft_skills, "rm-dot-soft")}
    </div>`;
}

function renderPlacementHTML(pl) {
  const col = (title, items = []) => `
    <div class="rm-col-card"><h4>${title}</h4>
      ${items.map((item, n) => `<div class="rm-col-item"><span class="rm-col-num">${String(n + 1).padStart(2, "0")}</span>${sanitize(item)}</div>`).join("")}
    </div>`;
  return `
    <div class="rm-section-title">Placement / Job Strategy</div>
    <div class="rm-placement-grid">
      ${col("Resume Tips", pl.resume_tips)}
      ${col("Company Prep", pl.company_prep)}
      ${col("Interview Roadmap", pl.interview_roadmap)}
    </div>`;
}

function renderAdviceHTML(adv, userType) {
  const label =
    userType === "student" ? "Branch-Specific Tips" : "Industry Tips";
  const col = (title, items = [], icon) => `
    <div class="rm-col-card"><h4>${title}</h4>
      ${items.map((i) => `<div class="rm-col-item"><span style="flex-shrink:0">${icon}</span>${sanitize(i)}</div>`).join("")}
    </div>`;
  return `
    <div class="rm-section-title">Personalized Advice</div>
    <div class="rm-advice-grid">
      ${col(label, adv.context_specific, "🎓")}
      ${col("Mistakes to Avoid", adv.mistakes_to_avoid, "⚠️")}
      ${col("Growth Strategies", adv.growth_strategies, "🚀")}
    </div>`;
}

// ─── save to Supabase (unchanged from your original) ─────────────────────────
export async function saveAnalysisToSupabase() {
  if (!currentAnalysisPayload) return;
  const saveBtn = document.getElementById("save-path-btn");
  const saveNote = document.getElementById("save-path-notification");
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = "Syncing...";
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Auth required");

    const { analysisResult, targetRole, confidence } = currentAnalysisPayload;

    await supabase.from("target_roles").upsert(
      {
        user_id: user.id,
        role_name: targetRole,
        description: "Set from Path Analyzer.",
      },
      { onConflict: "user_id" },
    );

    const { data: newAnalysis, error: analError } = await supabase
      .from("analyses")
      .insert({ user_id: user.id, match_percentage: confidence })
      .select("id")
      .single();
    if (analError) throw analError;

    const roadmapItems = analysisResult.project_roadmap || [];
    if (roadmapItems.length > 0) {
      await supabase.from("skill_gaps").insert(
        roadmapItems.map((item) => ({
          user_id: user.id,
          analysis_id: newAnalysis.id,
          skill_name: item.title,
          description: `Project: ${item.description || targetRole}`,
        })),
      );
    }

    if (saveBtn) {
      saveBtn.textContent = "Saved! ✅";
      saveBtn.className =
        "w-full md:w-auto px-8 py-3 bg-green-600 text-white rounded-xl font-bold transition";
    }
    if (saveNote) {
      saveNote.innerHTML = `Success! View results in your <a href="/profile" class="underline">Dashboard</a>.`;
      saveNote.classList.remove("hidden");
    }
  } catch (err) {
    console.error("Save error:", err);
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = "Retry Saving";
    }
  }
}

// ─── reset ────────────────────────────────────────────────────────────────────
export function resetView() {
  document.getElementById("results-display")?.classList.add("hidden");
  document.getElementById("form-container")?.classList.remove("hidden");
  currentAnalysisPayload = null;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ─── theme (unchanged) ───────────────────────────────────────────────────────
export function setTheme(isDark) {
  document.documentElement.classList.toggle("dark", isDark);
  document
    .querySelectorAll("#theme-icon, #mobile-theme-toggle i")
    .forEach((icon) => {
      icon.setAttribute("data-lucide", isDark ? "sun" : "moon");
    });
  if (typeof window !== "undefined" && window.lucide)
    window.lucide.createIcons();
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

// ─── page init (unchanged structure, new fields wired up) ────────────────────
export async function initAnalyzerPage() {
  if (typeof window !== "undefined" && window.lucide)
    window.lucide.createIcons();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    document.getElementById("profile-btn")?.classList.remove("hidden");
    document.getElementById("footer-auth")?.classList.remove("hidden");
    document.getElementById("login-btn")?.classList.add("hidden");
    document.getElementById("mobile-profile-btn")?.classList.remove("hidden");
    document.getElementById("mobile-login-btn")?.classList.add("hidden");

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (profile) {
      const fns = document.getElementById("fullName");
      const em = document.getElementById("email");
      if (fns) fns.value = profile.full_name || "";
      if (em) em.value = user.email || "";
      const footerName = document.getElementById("footer-user-name");
      const footerEmail = document.getElementById("footer-user-email");
      if (footerName) footerName.textContent = profile.full_name;
      if (footerEmail) footerEmail.textContent = user.email;

      if (profile.avatar_url) {
        ["nav-avatar-img", "footer-avatar-img"].forEach((id) => {
          const img = document.getElementById(id);
          if (img) {
            img.src = profile.avatar_url;
            img.classList.remove("hidden");
          }
        });
      }
    }
  }

  if (localStorage.getItem("theme") === "dark") setTheme(true);

  const mobileToggle = document.getElementById("mobile-menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileToggle && mobileMenu) {
    mobileToggle.onclick = () => mobileMenu.classList.toggle("hidden");
    mobileMenu.onclick = (e) => {
      if (e.target.closest("a")) mobileMenu.classList.add("hidden");
    };
  }

  updateTargetRoles();

  document
    .getElementById("analysis-form")
    ?.addEventListener("submit", handleFormSubmit);
  document.getElementById("back-btn")?.addEventListener("click", resetView);
  document
    .getElementById("branch")
    ?.addEventListener("change", updateTargetRoles);
  document
    .getElementById("save-path-btn")
    ?.addEventListener("click", saveAnalysisToSupabase);
  document
    .getElementById("theme-toggle")
    ?.addEventListener("click", () =>
      setTheme(!document.documentElement.classList.contains("dark")),
    );
  document
    .getElementById("mobile-theme-toggle")
    ?.addEventListener("click", () =>
      setTheme(!document.documentElement.classList.contains("dark")),
    );
  document
    .getElementById("logout-btn-footer")
    ?.addEventListener("click", async () => {
      await supabase.auth.signOut();
      window.location.reload();
    });

  if (typeof window !== "undefined") {
    window.updateTargetRoles = updateTargetRoles;
    window.handleFormSubmit = handleFormSubmit;
    window.saveAnalysisToSupabase = saveAnalysisToSupabase;
    window.resetView = resetView;
    window.setTheme = setTheme;
  }
}
