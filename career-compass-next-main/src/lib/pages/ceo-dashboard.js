/* ==========================
   CEO DASHBOARD — Main Logic
   ========================== */

export async function initCEODashboard() {
    // Check executive session
    const session = sessionStorage.getItem('executive_session');
    const token = sessionStorage.getItem('executive_token');

    if (!session || !token) {
        window.location.href = '/executive-login';
        return;
    }

    let executive;
    try {
        executive = JSON.parse(session);
    } catch {
        window.location.href = '/executive-login';
        return;
    }

    if (executive.role !== 'ceo' && executive.role !== 'cmo_chief') {
        alert('Access denied. CEO role required.');
        window.location.href = '/executive-login';
        return;
    }

    // Set profile info
    const nameEl = document.getElementById('ceo-name');
    const emailEl = document.getElementById('ceo-email');
    const initialEl = document.getElementById('sidebar-initial');
    if (nameEl) nameEl.textContent = executive.name || 'CEO';
    if (emailEl) emailEl.textContent = executive.email || '';
    if (initialEl) initialEl.textContent = (executive.name || 'C')[0].toUpperCase();

    // Load theme preference
    const savedTheme = localStorage.getItem('ceo_theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('ceo-dark-theme');
        updateThemeUI(true);
    }

    // Always regenerate token from session data to avoid stale tokens
    const freshPayload = { id: executive.id, email: executive.email, role: executive.role, exp: Date.now() + 8*60*60*1000 };
    const freshToken = btoa(JSON.stringify(freshPayload));
    sessionStorage.setItem('executive_token', freshToken);

    // Register window functions
    window.ceShowSection = showSection;
    window.ceToggleTheme = toggleTheme;
    window.ceLogout = logout;
    window.ceToggleNotifs = toggleNotifications;
    window.ceToggleSidebar = toggleSidebar;
    window.ceMarkAllRead = markAllRead;
    window.ceOpenExecModal = () => openExecModal();
    window.ceEditExec = (id) => openExecModal(id);
    window.ceSaveExec = saveExec;
    window.ceToggleExec = toggleExecStatus;
    window.ceChangePass = changeExecPass;
    window.ceDeleteExec = deleteExec;
    window.ceUpdateHRMSPassword = handleUpdateHRMSSecurityPassword;
    window._ceoToken = freshToken;
    window._ceoExecutive = executive;

    // Load dashboard data
    loadCEOStats();
    loadUnifiedNotifications();

    // Re-init lucide icons
    if (window.lucide) window.lucide.createIcons();

    // Poll notifications every 12 seconds for live updates
    setInterval(loadUnifiedNotifications, 12000);
}

/* ==========================
   SECTION SWITCHING
   ========================== */
let currentSection = 'home';

function showSection(sectionId) {
    currentSection = sectionId;

    // Update sidebar active state
    document.querySelectorAll('#ceo-sidebar .sidebar-link').forEach(btn => btn.classList.remove('active'));
    const navBtn = document.getElementById('nav-ceo-' + sectionId);
    if (navBtn) navBtn.classList.add('active');

    // Update topbar title
    const titles = {
        'home': 'Dashboard',
        'site-admin': 'Site Admin Panel',
        'hrms-admin': 'HRMS Admin Panel',
        'sales': 'Sales & Revenue Panel',
        'cmo': 'Marketing (CMO) Panel',
        'executives': 'Executive Management',
        'security': 'HRMS Security Authorization PIN'
    };
    const titleEl = document.getElementById('topbar-title');
    if (titleEl) titleEl.textContent = titles[sectionId] || 'Dashboard';

    // Hide all sections
    document.getElementById('ceo-home-section').style.display = 'none';
    document.getElementById('ceo-panel-section').style.display = 'none';
    document.getElementById('ceo-executives-section').style.display = 'none';
    const secSection = document.getElementById('ceo-security-section');
    if (secSection) secSection.style.display = 'none';

    if (sectionId === 'home') {
        document.getElementById('ceo-home-section').style.display = '';
        loadCEOStats();
    } else if (sectionId === 'executives') {
        document.getElementById('ceo-executives-section').style.display = '';
        loadExecutives();
    } else if (sectionId === 'security') {
        if (secSection) secSection.style.display = '';
        loadHRMSSecurityMeta();
    } else {
        document.getElementById('ceo-panel-section').style.display = '';
        loadPanel(sectionId);
    }
}

/* ==========================
   HRMS SECURITY PIN (CEO)
   ========================== */
async function loadHRMSSecurityMeta() {
    const updatedEl = document.getElementById('ceo-sec-updated-at');
    const byEl = document.getElementById('ceo-sec-updated-by');

    try {
        const token = sessionStorage.getItem('executive_token') || window._ceoToken;
        const res = await fetch('/api/hrms/security-auth', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'x-admin-key': 'hrms-admin-access'
            }
        });
        const data = await res.json();

        if (data.success && data.meta) {
            if (updatedEl) {
                updatedEl.textContent = data.meta.updated_at
                    ? new Date(data.meta.updated_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                    : 'Default System PIN';
            }
            if (byEl) {
                byEl.textContent = data.meta.updated_by || 'Default (System)';
            }
        }
    } catch (err) {
        console.error('Error loading security meta:', err);
    }
}

async function handleUpdateHRMSSecurityPassword() {
    const newPass = document.getElementById('ceo-new-sec-pass')?.value;
    const confirmPass = document.getElementById('ceo-confirm-sec-pass')?.value;
    const saveBtn = document.getElementById('ceo-sec-save-btn');
    const feedbackEl = document.getElementById('ceo-sec-feedback');

    if (!newPass || newPass.trim().length < 4) {
        alert('Password must be at least 4 characters long.');
        return;
    }

    if (newPass !== confirmPass) {
        alert('New Password and Confirm Password do not match. Please re-enter.');
        return;
    }

    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Updating...';
    }

    try {
        const token = sessionStorage.getItem('executive_token') || window._ceoToken;
        const res = await fetch('/api/hrms/security-auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'x-admin-key': 'hrms-admin-access'
            },
            body: JSON.stringify({ action: 'update', new_password: newPass.trim() })
        });
        const data = await res.json();

        if (data.success) {
            if (feedbackEl) {
                feedbackEl.textContent = '✓ HRMS Authorization Password updated successfully!';
                feedbackEl.classList.remove('hidden');
                setTimeout(() => feedbackEl.classList.add('hidden'), 5000);
            }
            document.getElementById('ceo-new-sec-pass').value = '';
            document.getElementById('ceo-confirm-sec-pass').value = '';
            loadHRMSSecurityMeta();
            alert('HRMS Action Authorization Password updated successfully! HRMS Admin must now use this new password for document issuing, employee deletion, and ending employment.');
        } else {
            alert(data.error || 'Failed to update password.');
        }
    } catch (err) {
        console.error('Error updating security password:', err);
        alert('Error: ' + err.message);
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> Update Security Password';
            if (window.lucide) window.lucide.createIcons();
        }
    }
}

/* ==========================
   EXECUTIVES MANAGEMENT
   ========================== */
const ROLE_LABELS = {
    ceo: 'CEO', cmo_chief: 'Chief Managing Officer',
    sales: 'Sales Executive', cfo: 'CFO',
    cso: 'CSO', cmo: 'CMO', coo: 'COO',
    strategic_advisor: 'Strategic Advisor'
};

let executivesData = [];

async function loadExecutives() {
    try {
        const res = await fetch('/api/executives/manage', {
            headers: { 'x-admin-key': 'hrms-admin-access' }
        });
        const data = await res.json();
        if (data.success) {
            executivesData = data.executives;
            renderExecutives();
        }
    } catch (e) { console.error(e); }
}

function renderExecutives() {
    const tbody = document.getElementById('ceo-executives-tbody');
    if (!tbody) return;

    if (!executivesData.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-slate-400">No executives found</td></tr>';
        return;
    }

    tbody.innerHTML = executivesData.map(ex => `
        <tr class="border-b border-slate-50 hover:bg-slate-50/50">
            <td class="px-6 py-3 font-semibold">${ex.name || '—'}</td>
            <td class="px-6 py-3 text-slate-500">${ex.email || '—'}</td>
            <td class="px-6 py-3"><span class="px-2.5 py-1 bg-indigo-50 text-primary rounded-lg text-xs font-bold">${ROLE_LABELS[ex.role] || ex.role}</span></td>
            <td class="px-6 py-3 text-slate-500">${ex.phone || '—'}</td>
            <td class="px-6 py-3">
                <span class="px-2.5 py-1 rounded-lg text-xs font-bold ${ex.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}">${ex.is_active ? 'Active' : 'Inactive'}</span>
            </td>
            <td class="px-6 py-3">
                <div class="flex gap-1.5">
                    <button onclick="window.ceEditExec('${ex.id}')" class="px-2.5 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200">Edit</button>
                    <button onclick="window.ceToggleExec('${ex.id}', ${!ex.is_active})" class="px-2.5 py-1.5 ${ex.is_active ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'} rounded-lg text-xs font-semibold">${ex.is_active ? 'Deactivate' : 'Activate'}</button>
                    <button onclick="window.ceChangePass('${ex.id}')" class="px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold">Password</button>
                    <button onclick="window.ceDeleteExec('${ex.id}')" class="px-2.5 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-semibold">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openExecModal(editId) {
    const modal = document.getElementById('ceo-exec-modal');
    const title = document.getElementById('ceo-exec-modal-title');
    if (!modal) return;

    document.getElementById('ceo-exec-edit-id').value = editId || '';
    document.getElementById('ceo-exec-name').value = '';
    document.getElementById('ceo-exec-email').value = '';
    document.getElementById('ceo-exec-role').value = 'sales';
    document.getElementById('ceo-exec-phone').value = '';
    document.getElementById('ceo-exec-password').value = '';

    if (editId) {
        const ex = executivesData.find(e => e.id === editId);
        if (ex) {
            document.getElementById('ceo-exec-name').value = ex.name || '';
            document.getElementById('ceo-exec-email').value = ex.email || '';
            document.getElementById('ceo-exec-role').value = ex.role || 'sales';
            document.getElementById('ceo-exec-phone').value = ex.phone || '';
        }
        title.textContent = 'Edit Executive';
    } else {
        title.textContent = 'Add Executive';
    }

    modal.style.display = '';
}

async function saveExec() {
    const editId = document.getElementById('ceo-exec-edit-id').value;
    const name = document.getElementById('ceo-exec-name').value;
    const email = document.getElementById('ceo-exec-email').value;
    const role = document.getElementById('ceo-exec-role').value;
    const phone = document.getElementById('ceo-exec-phone').value;
    const password = document.getElementById('ceo-exec-password').value;

    const body = editId
        ? { action: 'update', id: editId, name, role, phone }
        : { action: 'create', name, email, role, phone, password };

    try {
        const res = await fetch('/api/executives/manage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-key': 'hrms-admin-access' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.success) {
            document.getElementById('ceo-exec-modal').style.display = 'none';
            loadExecutives();
        } else {
            alert(data.error || 'Failed to save');
        }
    } catch (e) { alert('Error saving executive'); }
}

async function toggleExecStatus(id, newStatus) {
    await fetch('/api/executives/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': 'hrms-admin-access' },
        body: JSON.stringify({ action: 'update', id, is_active: newStatus })
    });
    loadExecutives();
}

async function changeExecPass(id) {
    const newPass = prompt('Enter new password:');
    if (!newPass) return;
    await fetch('/api/executives/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': 'hrms-admin-access' },
        body: JSON.stringify({ action: 'update-password', id, password: newPass })
    });
    alert('Password updated.');
}

async function deleteExec(id) {
    if (!confirm('Delete this executive?')) return;
    await fetch('/api/executives/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': 'hrms-admin-access' },
        body: JSON.stringify({ action: 'delete', id })
    });
    loadExecutives();
}

/* ==========================
   PANEL LOADING (IFRAME)
   ========================== */
const panelUrls = {
    'site-admin': '/site.admin',
    'hrms-admin': '/admin-dashboard',
    'sales': '/sales-dashboard',
    'cmo': '/cmo-dashboard'
};

let panelAuthReady = false;

async function ensureAdminAuth() {
    if (panelAuthReady) return true;

    try {
        const token = window._ceoToken;
        const exec = window._ceoExecutive;
        const res = await fetch('/api/ceo/auto-auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'x-ceo-id': exec?.id || ''
            }
        });
        const data = await res.json();
        if (data.success) {
            window._ceoAdminEmail = data.email;
            window._ceoAdminPass = data.password;
            panelAuthReady = true;
            return true;
        }
        console.error('Auto-auth failed:', data.error);
        return false;
    } catch (err) {
        console.error('Auto-auth error:', err);
        return false;
    }
}

async function loadPanel(panelId) {
    const iframe = document.getElementById('panel-iframe');
    const loading = document.getElementById('panel-loading');

    if (!iframe) return;

    // Show loading
    if (loading) loading.style.display = 'flex';
    iframe.style.opacity = '0';

    let url = panelUrls[panelId];
    if (!url) return;

    // For Supabase-auth panels (site-admin, hrms-admin), ensure auto-auth
    if (panelId === 'site-admin' || panelId === 'hrms-admin') {
        await ensureAdminAuth();
        url += '?ceo_mode=true';
    }

    // For executive-auth panels (sales, cmo), pass token
    if (panelId === 'sales' || panelId === 'cmo') {
        const token = window._ceoToken;
        url += `?ceo_token=${encodeURIComponent(token)}`;
    }

    iframe.src = url;
    iframe.onload = () => {
        if (loading) loading.style.display = 'none';
        iframe.style.opacity = '1';

        // For Supabase-auth panels, inject auto-login after iframe loads
        if ((panelId === 'site-admin' || panelId === 'hrms-admin') && window._ceoAdminEmail) {
            try {
                iframe.contentWindow.postMessage({
                    type: 'ceo-auto-login',
                    email: window._ceoAdminEmail,
                    password: window._ceoAdminPass
                }, '*');
            } catch (e) {
                console.log('PostMessage sent for auto-login');
            }
        }
    };
}

/* ==========================
   STATS LOADING
   ========================== */
async function loadCEOStats() {
    try {
        const token = window._ceoToken;
        const exec = window._ceoExecutive;
        const res = await fetch('/api/ceo/stats', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'x-ceo-id': exec?.id || ''
            }
        });
        const data = await res.json();

        if (!data.success) {
            console.error('Stats load failed:', data.error);
            return;
        }

        const s = data.stats;

        // KPI Cards
        animateValue('kpi-total-users', s.users?.total || 0);
        setText('kpi-users-breakdown', `Students: ${s.users?.students || 0} | Business: ${s.users?.business || 0}`);

        const totalRev = (s.sales?.total_revenue || 0);
        setText('kpi-total-revenue', '₹' + formatNumber(totalRev));
        setText('kpi-revenue-breakdown', `Courses: ₹${formatNumber(s.sales?.course_revenue || 0)} | SaaS: ₹${formatNumber(s.sales?.saas_revenue || 0)}`);

        animateValue('kpi-employees', s.employees?.active || 0);
        setText('kpi-emp-detail', `Present: ${s.attendance?.present_today || 0} | Leave: ${s.employees?.on_leave || 0}`);

        animateValue('kpi-courses', s.courses?.total || 0);
        setText('kpi-enrollments', `Enrollments: ${s.courses?.enrollments || 0}`);

        animateValue('kpi-tasks', s.tasks?.total || 0);
        setText('kpi-tasks-detail', `Done: ${s.tasks?.completed || 0} | Pending: ${s.tasks?.pending || 0}`);

        animateValue('kpi-applications', s.applications?.total || 0);
        setText('kpi-apps-detail', `New: ${s.applications?.new_count || 0} | Shortlisted: ${s.applications?.shortlisted || 0}`);

        // People Grid
        setText('pc-employees', s.employees?.active || 0);
        setText('pc-emp-sub', `${s.employees?.inactive || 0} inactive`);

        setText('pc-executives', s.executives?.total || 0);
        setText('pc-exec-sub', `${s.executives?.active || 0} active`);

        setText('pc-trainers', s.trainers?.total || 0);
        setText('pc-trainers-sub', `${s.trainers?.active || 0} active`);

        const attRate = s.attendance?.attendance_rate || 0;
        setText('pc-attendance', Math.round(attRate) + '%');
        setText('pc-att-sub', `${s.attendance?.present_today || 0} present today`);

        // Save detailed data for interactive card click inspector
        window._ceoStatDetails = data.details || {};

        // Marketing & Documents
        setText('mk-contacts', s.marketing?.total_contacts || 0);
        setText('mk-campaigns', s.marketing?.total_campaigns || 0);
        setText('mk-sent', s.marketing?.emails_sent || 0);

        setText('doc-issued', s.documents?.total_issued || 0);
        setText('doc-pending', s.documents?.pending_signatures || 0);

    } catch (err) {
        console.error('Error loading CEO stats:', err);
    }
}

/* ==========================
   CEO STAT CARD DETAIL INSPECTOR
   ========================== */
let currentDetailType = null;

if (typeof window !== 'undefined') {
    window.showCeoStatDetail = (type) => {
        const panel = document.getElementById('ceo-stat-detail-panel');
    const titleEl = document.getElementById('ceo-stat-detail-title');
    const countEl = document.getElementById('ceo-stat-detail-count');
    const subEl = document.getElementById('ceo-stat-detail-subtitle');
    const searchInput = document.getElementById('ceo-stat-search');
    if (!panel || !window._ceoStatDetails) return;

    currentDetailType = type;
    if (searchInput) searchInput.value = '';

    const titles = {
        present: 'Present Today (Attendance)',
        leave: 'On Leave Today',
        employees: 'Active Employees Directory',
        executives: 'Leadership & Executives Team',
        trainers: 'Trainers & Instructors',
        tasks: 'Assigned Tasks Overview',
        users: 'Registered Users (Students & Business)',
        revenue: 'Recent Revenue & Transactions',
        courses: 'Courses Catalog',
        applications: 'Job Applications'
    };

    const subtitles = {
        present: 'List of employees marked present today with check-in time and role',
        leave: 'List of employees on approved leave today with reason and duration',
        employees: 'Complete active employee directory with department and designation',
        executives: 'Leadership team with assigned operational roles and contact info',
        trainers: 'Course trainers and instructors with subject specializations',
        tasks: 'All delegated tasks with deadlines, assigned employees, and statuses',
        users: 'Latest student and business clients registered on the platform',
        revenue: 'Recent payment transactions and subscription receipts',
        courses: 'All published courses with pricing and live class statuses',
        applications: 'Recent candidate job applications with screening statuses'
    };

    if (titleEl) titleEl.textContent = titles[type] || 'Details';
    if (subEl) subEl.textContent = subtitles[type] || 'Showing live breakdown';

    const items = window._ceoStatDetails[type] || [];
    if (countEl) countEl.textContent = items.length;

    window.renderCeoStatDetailList(type, items);

    panel.classList.remove('hidden');
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

window.filterCeoStatDetail = (query) => {
    if (!currentDetailType || !window._ceoStatDetails) return;
    const allItems = window._ceoStatDetails[currentDetailType] || [];
    const q = (query || '').toLowerCase().trim();

    if (!q) {
        window.renderCeoStatDetailList(currentDetailType, allItems);
        const countEl = document.getElementById('ceo-stat-detail-count');
        if (countEl) countEl.textContent = allItems.length;
        return;
    }

    const filtered = allItems.filter(item => {
        return (
            (item.name && item.name.toLowerCase().includes(q)) ||
            (item.employee_id && item.employee_id.toLowerCase().includes(q)) ||
            (item.id && String(item.id).toLowerCase().includes(q)) ||
            (item.email && item.email.toLowerCase().includes(q)) ||
            (item.department && item.department.toLowerCase().includes(q)) ||
            (item.role && item.role.toLowerCase().includes(q)) ||
            (item.title && item.title.toLowerCase().includes(q)) ||
            (item.designation && item.designation.toLowerCase().includes(q)) ||
            (item.reason && item.reason.toLowerCase().includes(q))
        );
    });

    const countEl = document.getElementById('ceo-stat-detail-count');
    if (countEl) countEl.textContent = `${filtered.length} / ${allItems.length}`;

    window.renderCeoStatDetailList(currentDetailType, filtered);
};

window.renderCeoStatDetailList = (type, items) => {
    const container = document.getElementById('ceo-stat-detail-content');
    if (!container) return;

    if (!items || items.length === 0) {
        container.innerHTML = `
            <div class="py-12 text-center">
                <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3 text-lg font-bold">∅</div>
                <p class="text-sm font-semibold text-slate-600">No records found</p>
                <p class="text-xs text-slate-400 mt-1">There is currently no data to display for this category.</p>
            </div>
        `;
        return;
    }

    let html = '';

    if (type === 'present') {
        html = items.map(e => `
            <div class="flex items-center justify-between py-3.5 px-2 hover:bg-slate-50/80 rounded-xl transition">
                <div class="flex items-center gap-3.5">
                    <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shadow-sm">
                        ${(e.name || 'E').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <p class="font-bold text-sm text-slate-900">${e.name}</p>
                            <span class="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">${e.employee_id || e.id}</span>
                        </div>
                        <p class="text-xs text-slate-500 mt-0.5">${e.department || 'General'} · <span class="text-slate-600 font-medium">${e.designation || e.role}</span></p>
                    </div>
                </div>
                <div class="flex items-center gap-2 text-right">
                    <span class="text-xs text-slate-500 font-medium hidden sm:inline-block">${e.check_in_time ? `Checked in: ${e.check_in_time}` : 'Present'}</span>
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Present
                    </span>
                </div>
            </div>
        `).join('');
    } else if (type === 'leave') {
        html = items.map(e => `
            <div class="flex items-center justify-between py-3.5 px-2 hover:bg-slate-50/80 rounded-xl transition">
                <div class="flex items-center gap-3.5">
                    <div class="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm shadow-sm">
                        ${(e.name || 'L').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <p class="font-bold text-sm text-slate-900">${e.name}</p>
                            <span class="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">${e.employee_id || e.id}</span>
                        </div>
                        <p class="text-xs text-slate-500 mt-0.5">${e.department || 'General'} · <span class="text-rose-600 font-medium">${e.reason || 'On Leave'}</span></p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        On Leave
                    </span>
                </div>
            </div>
        `).join('');
    } else if (type === 'employees') {
        html = items.map(e => `
            <div class="flex items-center justify-between py-3.5 px-2 hover:bg-slate-50/80 rounded-xl transition">
                <div class="flex items-center gap-3.5">
                    <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shadow-sm">
                        ${(e.name || 'E').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <p class="font-bold text-sm text-slate-900">${e.name}</p>
                            <span class="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md border border-blue-100">${e.employee_id || e.id}</span>
                            <span class="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-md uppercase">${e.role}</span>
                        </div>
                        <p class="text-xs text-slate-500 mt-0.5">${e.department || 'General'} · ${e.designation || e.role} · <span class="text-slate-400">${e.email}</span></p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${e.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}">
                        <span class="w-1.5 h-1.5 rounded-full ${e.is_active ? 'bg-emerald-500' : 'bg-slate-400'}"></span> ${e.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>
        `).join('');
    } else if (type === 'executives') {
        html = items.map(e => `
            <div class="flex items-center justify-between py-3.5 px-2 hover:bg-slate-50/80 rounded-xl transition">
                <div class="flex items-center gap-3.5">
                    <div class="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shadow-sm">
                        ${(e.name || 'X').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <p class="font-bold text-sm text-slate-900">${e.name}</p>
                            <span class="text-[10px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-md border border-purple-200 uppercase">${e.role}</span>
                        </div>
                        <p class="text-xs text-slate-500 mt-0.5">${e.email} ${e.phone && e.phone !== '—' ? `· Phone: ${e.phone}` : ''}</p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        Executive
                    </span>
                </div>
            </div>
        `).join('');
    } else if (type === 'trainers') {
        html = items.map(tr => `
            <div class="flex items-center justify-between py-3.5 px-2 hover:bg-slate-50/80 rounded-xl transition">
                <div class="flex items-center gap-3.5">
                    <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm shadow-sm">
                        ${(tr.name || 'T').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p class="font-bold text-sm text-slate-900">${tr.name}</p>
                        <p class="text-xs text-slate-500 mt-0.5">${tr.specialization || 'Trainer'} · <span class="text-slate-400">${tr.email}</span></p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Trainer
                    </span>
                </div>
            </div>
        `).join('');
    } else if (type === 'tasks') {
        html = items.map(t => {
            const isDone = t.status?.toLowerCase() === 'completed';
            const isSub = t.status?.toLowerCase() === 'submitted';
            return `
                <div class="flex items-center justify-between py-3.5 px-2 hover:bg-slate-50/80 rounded-xl transition">
                    <div>
                        <div class="flex items-center gap-2">
                            <p class="font-bold text-sm text-slate-900">${t.title}</p>
                            <span class="text-[10px] ${t.priority === 'High' ? 'bg-rose-100 text-rose-700' : t.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'} font-bold px-2 py-0.5 rounded-md">${t.priority || 'Normal'}</span>
                        </div>
                        <p class="text-xs text-slate-500 mt-0.5">Assigned to: <span class="font-medium text-slate-700">${t.name}</span> (${t.employee_id}) · Due: ${t.deadline ? new Date(t.deadline).toLocaleDateString('en-IN') : 'No date'}</p>
                    </div>
                    <div class="text-right">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${isDone ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : isSub ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-blue-100 text-blue-800 border border-blue-200'}">
                            ${t.status || 'Pending'}
                        </span>
                    </div>
                </div>
            `;
        }).join('');
    } else if (type === 'revenue') {
        html = items.map(p => `
            <div class="flex items-center justify-between py-3.5 px-2 hover:bg-slate-50/80 rounded-xl transition">
                <div class="flex items-center gap-3.5">
                    <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base shadow-sm">
                        ₹
                    </div>
                    <div>
                        <p class="font-bold text-sm text-slate-900">${p.title}</p>
                        <p class="text-xs text-slate-500 mt-0.5">Customer: ${p.email} · ${p.paid_at ? new Date(p.paid_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-extrabold text-sm text-emerald-600">₹${Number(p.amount || 0).toLocaleString('en-IN')}</p>
                    <span class="text-[10px] text-slate-400 uppercase font-bold">${p.status || 'Paid'}</span>
                </div>
            </div>
        `).join('');
    } else if (type === 'users') {
        html = items.map(u => `
            <div class="flex items-center justify-between py-3.5 px-2 hover:bg-slate-50/80 rounded-xl transition">
                <div class="flex items-center gap-3.5">
                    <div class="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shadow-sm">
                        ${(u.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <p class="font-bold text-sm text-slate-900">${u.name}</p>
                            <span class="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md">${u.is_business ? 'Business' : 'Student'}</span>
                        </div>
                        <p class="text-xs text-slate-500 mt-0.5">${u.email} ${u.company && u.company !== '—' ? `· ${u.company}` : ''} · Joined: ${u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : 'Recent'}</p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Plan: ${u.plan || 'Free'}
                    </span>
                </div>
            </div>
        `).join('');
    } else if (type === 'courses') {
        html = items.map(c => `
            <div class="flex items-center justify-between py-3.5 px-2 hover:bg-slate-50/80 rounded-xl transition">
                <div class="flex items-center gap-3.5">
                    <div class="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm shadow-sm">
                        📚
                    </div>
                    <div>
                        <p class="font-bold text-sm text-slate-900">${c.title}</p>
                        <p class="text-xs text-slate-500 mt-0.5">Category: ${c.category} · Price: ₹${c.price || 0}</p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${c.is_live ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}">
                        ${c.is_live ? 'Live Classes' : 'Course'}
                    </span>
                </div>
            </div>
        `).join('');
    } else if (type === 'applications') {
        html = items.map(a => `
            <div class="flex items-center justify-between py-3.5 px-2 hover:bg-slate-50/80 rounded-xl transition">
                <div class="flex items-center gap-3.5">
                    <div class="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-sm shadow-sm">
                        ${(a.name || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p class="font-bold text-sm text-slate-900">${a.name}</p>
                        <p class="text-xs text-slate-500 mt-0.5">Role: <span class="font-medium text-slate-700">${a.role_applied}</span> · ${a.email}</p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${a.status === 'shortlisted' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : a.status === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-blue-100 text-blue-800 border border-blue-200'}">
                        ${a.status?.toUpperCase() || 'NEW'}
                    </span>
                </div>
            </div>
        `).join('');
    }

    container.innerHTML = html;
};
}

/* ==========================
   UNIFIED NOTIFICATIONS
   ========================== */
async function loadUnifiedNotifications() {
    try {
        const token = sessionStorage.getItem('executive_token') || window._ceoToken;
        const exec = window._ceoExecutive;

        const res = await fetch('/api/ceo/notifications', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'x-ceo-id': exec?.id || '',
                'x-admin-key': 'hrms-admin-access'
            }
        });
        const data = await res.json();
        if (!data.success) return;

        const notifs = data.notifications || [];

        // Update badge
        const badge = document.getElementById('notif-badge');
        if (badge) {
            if (notifs.length > 0) {
                badge.style.display = '';
                badge.textContent = notifs.length;
            } else {
                badge.style.display = 'none';
            }
        }

        // Update dropdown
        const list = document.getElementById('notif-list');
        if (list) {
            if (notifs.length === 0) {
                list.innerHTML = '<p class="text-center text-slate-400 py-6 text-sm">All clear! No notifications.</p>';
            } else {
                list.innerHTML = notifs.map(n => {
                    const timeStr = n.created_at
                        ? new Date(n.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                        : '';
                    return `
                    <div class="notif-item" style="display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border-bottom:1px solid #f1f5f9;">
                        <span style="font-size:1.1rem;line-height:1.2;">${n.icon || '🔔'}</span>
                        <div style="flex:1;min-width:0;">
                            <p style="margin:0;font-size:0.82rem;font-weight:600;color:#1e293b;word-break:break-word;">${n.message}</p>
                            ${timeStr ? `<span style="font-size:0.7rem;color:#94a3b8;margin-top:2px;display:block;">${timeStr}</span>` : ''}
                        </div>
                    </div>`;
                }).join('');
            }
        }
    } catch (err) {
        console.error('Error loading notifications:', err);
    }
}

function toggleNotifications() {
    const dropdown = document.getElementById('notif-dropdown');
    if (!dropdown) return;
    dropdown.style.display = dropdown.style.display === 'none' ? '' : 'none';
}

async function markAllRead() {
    const badge = document.getElementById('notif-badge');
    if (badge) badge.style.display = 'none';
    const list = document.getElementById('notif-list');
    if (list) list.innerHTML = '<p class="text-center text-slate-400 py-6 text-sm">All clear! No notifications.</p>';

    try {
        const token = sessionStorage.getItem('executive_token') || window._ceoToken;
        const exec = window._ceoExecutive;

        await fetch('/api/ceo/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'x-ceo-id': exec?.id || '',
                'x-admin-key': 'hrms-admin-access'
            },
            body: JSON.stringify({ action: 'mark_all_read' })
        });
    } catch (err) {
        console.error('Error marking notifications as read:', err);
    }
}

/* ==========================
   SIDEBAR TOGGLE
   ========================== */
let sidebarOpen = true;

function toggleSidebar() {
    const sidebar = document.getElementById('ceo-sidebar');
    const openBtn = document.getElementById('sidebar-open-btn');
    if (!sidebar) return;

    sidebarOpen = !sidebarOpen;

    if (sidebarOpen) {
        sidebar.style.display = '';
        if (openBtn) openBtn.style.display = 'none';
    } else {
        sidebar.style.display = 'none';
        if (openBtn) openBtn.style.display = '';
    }
}

/* ==========================
   THEME TOGGLE
   ========================== */
function toggleTheme() {
    const isDark = document.body.classList.toggle('ceo-dark-theme');
    localStorage.setItem('ceo_theme', isDark ? 'dark' : 'light');
    updateThemeUI(isDark);
}

function updateThemeUI(isDark) {
    const label = document.getElementById('theme-label');
    const icon = document.getElementById('theme-icon-lucide');
    if (label) label.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    if (icon) icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
    if (window.lucide) window.lucide.createIcons();
}

/* ==========================
   LOGOUT
   ========================== */
function logout() {
    sessionStorage.removeItem('executive_session');
    sessionStorage.removeItem('executive_token');
    window.location.href = '/executive-login';
}

/* ==========================
   UTILITY FUNCTIONS
   ========================== */
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function formatNumber(num) {
    if (num >= 10000000) return (num / 10000000).toFixed(1) + 'Cr';
    if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function animateValue(id, target) {
    const el = document.getElementById(id);
    if (!el) return;

    const duration = 1000;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(target * eased);
        el.textContent = current.toLocaleString('en-IN');

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}
