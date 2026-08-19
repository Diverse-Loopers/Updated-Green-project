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
    window._ceoToken = freshToken;
    window._ceoExecutive = executive;

    // Load dashboard data
    loadCEOStats();
    loadUnifiedNotifications();

    // Re-init lucide icons
    if (window.lucide) window.lucide.createIcons();

    // Poll notifications every 60 seconds
    setInterval(loadUnifiedNotifications, 60000);
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
        'executives': 'Executive Management'
    };
    const titleEl = document.getElementById('topbar-title');
    if (titleEl) titleEl.textContent = titles[sectionId] || 'Dashboard';

    // Hide all sections
    document.getElementById('ceo-home-section').style.display = 'none';
    document.getElementById('ceo-panel-section').style.display = 'none';
    document.getElementById('ceo-executives-section').style.display = 'none';

    if (sectionId === 'home') {
        document.getElementById('ceo-home-section').style.display = '';
        loadCEOStats();
    } else if (sectionId === 'executives') {
        document.getElementById('ceo-executives-section').style.display = '';
        loadExecutives();
    } else {
        document.getElementById('ceo-panel-section').style.display = '';
        loadPanel(sectionId);
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
   UNIFIED NOTIFICATIONS
   ========================== */
async function loadUnifiedNotifications() {
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
        if (!data.success) return;

        const s = data.stats;
        const notifs = [];

        if ((s.applications?.new_count || 0) > 0) {
            notifs.push({ icon: '📋', text: `${s.applications.new_count} new job application(s)`, color: '#4f46e5' });
        }
        if ((s.employees?.on_leave || 0) > 0) {
            notifs.push({ icon: '🏖️', text: `${s.employees.on_leave} employee(s) on leave today`, color: '#f59e0b' });
        }
        if ((s.documents?.pending_signatures || 0) > 0) {
            notifs.push({ icon: '✍️', text: `${s.documents.pending_signatures} document(s) pending signature`, color: '#f59e0b' });
        }
        if ((s.tasks?.pending || 0) > 0) {
            notifs.push({ icon: '⏳', text: `${s.tasks.pending} task(s) pending completion`, color: '#3b82f6' });
        }
        if ((s.users?.new_today || 0) > 0) {
            notifs.push({ icon: '🆕', text: `${s.users.new_today} new user(s) signed up today`, color: '#10b981' });
        }

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
                list.innerHTML = notifs.map(n =>
                    `<div class="notif-item">
                        <div style="width:8px;height:8px;border-radius:50%;background:${n.color};margin-top:6px;flex-shrink:0"></div>
                        <span class="text-sm">${n.icon} ${n.text}</span>
                    </div>`
                ).join('');
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

function markAllRead() {
    const badge = document.getElementById('notif-badge');
    if (badge) badge.style.display = 'none';
    const list = document.getElementById('notif-list');
    if (list) list.innerHTML = '<p class="text-center text-slate-400 py-6 text-sm">All clear! No notifications.</p>';
    // Hide dropdown after marking
    const dropdown = document.getElementById('notif-dropdown');
    if (dropdown) dropdown.style.display = 'none';
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
