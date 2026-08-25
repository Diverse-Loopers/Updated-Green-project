'use client';

export async function initManagerDashboard() {
  const token = sessionStorage.getItem('executive_token');
  const sessionStr = sessionStorage.getItem('executive_session');

  if (!token || !sessionStr) {
    window.location.href = '/executive-login';
    return;
  }

  const exec = JSON.parse(sessionStr);
  if (exec.role !== 'manager') {
    window.location.href = '/executive-login';
    return;
  }

  window._mgrToken = token;
  window._mgrExec = exec;
  window.teamEmployees = [];
  window.allTasks = [];
  window.currentEmpId = null;

  // Set up Supabase
  const SUPABASE_URL = document.querySelector('meta[name="supabase-url"]')?.content;
  const SUPABASE_KEY = document.querySelector('meta[name="supabase-key"]')?.content;
  
  window.supabaseQuery = async (table, query = '', method = 'GET', body = null) => {
    const options = {
      method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, options);
    if (!res.ok) throw new Error(`Supabase query failed: ${res.statusText}`);
    return res.json();
  };

  // Find manager record
  try {
    const managers = await window.supabaseQuery('managers', `?email=eq.${encodeURIComponent(exec.email)}`);
    if (managers && managers.length > 0) {
      window._managerId = managers[0].id;
      window._managerEmpId = managers[0].employee_id || managers[0].id;
      window._managerName = managers[0].name;
      document.getElementById('header-name').textContent = managers[0].name;
      document.getElementById('welcome-text').textContent = `Welcome back, ${managers[0].name.split(' ')[0]}!`;
      document.getElementById('header-role').textContent = managers[0].designation || 'Project Manager';
      document.getElementById('header-avatar').textContent = managers[0].name.charAt(0).toUpperCase();
      
      // Load initial data
      await loadTeamData();
      loadDashboardStats();
    } else {
      console.error("Manager record not found.");
      document.getElementById('header-name').textContent = exec.email;
    }
  } catch (err) {
    console.error("Error finding manager:", err);
  }

  // Event listeners
  document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('open');
  });
  document.getElementById('mobile-close-sidebar')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
  });

  // Ensure lucide icons render (retry if CDN hasn't loaded yet)
  function initLucide(retries = 0) {
    if (window.lucide) {
      window.lucide.createIcons();
    } else if (retries < 10) {
      setTimeout(() => initLucide(retries + 1), 300);
    }
  }
  initLucide();
}

async function loadTeamData() {
  try {
    // Get assigned employee IDs from employee_managers table
    const assignments = await window.supabaseQuery('employee_managers', `?manager_id=eq.${window._managerId}&select=employee_id`);
    
    if (!assignments || assignments.length === 0) {
      window.teamEmployees = [];
      return;
    }
    
    // Get employee details for assigned employees
    const empIds = assignments.map(a => a.employee_id);
    const empIdFilter = empIds.map(id => `"${id}"`).join(',');
    const team = await window.supabaseQuery('employees', `?employee_id=in.(${empIds.join(',')})&is_active=eq.true`);
    window.teamEmployees = team || [];
    
    // Populate select dropdown
    const select = document.getElementById('task-assignee');
    if (select) {
      select.innerHTML = '<option value="">Select Employee</option>';
      window.teamEmployees.forEach(emp => {
        select.innerHTML += `<option value="${emp.employee_id}">${emp.full_name || emp.name} (${emp.employee_id})</option>`;
      });
    }
  } catch (err) {
    console.error("Error loading team", err);
  }
}

window.switchSection = (sectionName) => {
  // Update sidebar
  document.querySelectorAll('.sidebar-link').forEach(el => el.classList.remove('active'));
  document.getElementById(`nav-${sectionName}`)?.classList.add('active');

  // Hide all sections
  document.querySelectorAll('main section').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('main section').forEach(el => el.classList.remove('block'));
  
  // Show target
  const target = document.getElementById(`${sectionName}-section`);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('block');
  }

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');

  // Update header title
  const titles = {
    'dashboard': 'Dashboard',
    'team': 'My Team',
    'tasks': 'Tasks Management',
    'attendance': 'Attendance Overview',
    'ratings': 'Performance Ratings',
    'announcements': 'Announcements',
    'projects': 'Projects'
  };
  document.getElementById('header-title').textContent = titles[sectionName] || 'Dashboard';

  // Load data for section
  switch (sectionName) {
    case 'dashboard': loadDashboardStats(); break;
    case 'team': renderTeamTable(); break;
    case 'tasks': loadTeamTasks(); break;
    case 'attendance': loadTodayAttendance(); break;
    case 'ratings': loadRatingForm(); break;
    case 'announcements': loadAnnouncements(); break;
    case 'projects': loadProjects(); break;
  }
};

window.logout = () => {
  sessionStorage.removeItem('executive_token');
  sessionStorage.removeItem('executive_session');
  window.location.href = '/executive-login';
};

window.toggleNotifications = () => {
  const drop = document.getElementById('notif-dropdown');
  drop.classList.toggle('hidden');
};

function getBadgeClass(status) {
  const s = (status || '').toLowerCase();
  if (s === 'present' || s === 'completed' || s === 'active' || s === 'approved') return 'badge-green';
  if (s === 'absent' || s === 'rejected' || s === 'missed' || s === 'overdue') return 'badge-red';
  if (s === 'leave' || s === 'pending') return 'badge-yellow';
  if (s === 'submitted') return 'badge-blue';
  return 'badge-slate';
}

window.animateCount = (el, target) => {
  let start = 0;
  const duration = 1000;
  const stepTime = 20;
  const steps = duration / stepTime;
  const inc = target / steps;
  
  const timer = setInterval(() => {
    start += inc;
    if (start >= target) {
      el.textContent = target;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(start);
    }
  }, stepTime);
};

// --- Dashboard ---
async function loadDashboardStats() {
  if (!window._managerId) return;
  try {
    const teamCount = window.teamEmployees.length;
    window.animateCount(document.getElementById('stat-team'), teamCount);

    const today = new Date().toISOString().split('T')[0];
    const empIds = window.teamEmployees.map(e => e.employee_id);

    // Attendance today — only for team members
    let presentList = [], absentList = [];
    if (empIds.length > 0) {
      const att = await window.supabaseQuery('attendance', `?date=eq.${today}&employee_id=in.(${empIds.join(',')})`);
      att.forEach(a => {
        const emp = window.teamEmployees.find(e => e.employee_id === a.employee_id);
        const name = emp ? (emp.full_name || emp.name) : a.employee_id;
        if (a.status === 'Present') presentList.push({ id: a.employee_id, name });
      });
    }

    // Leaves today — approved leaves where today falls between start and end
    let onLeaveList = [];
    if (empIds.length > 0) {
      const leaves = await window.supabaseQuery('leaves', `?status=eq.Approved&employee_id=in.(${empIds.join(',')})`);
      leaves.forEach(l => {
        const start = l.start_date || l.leave_date;
        const end = l.end_date || l.leave_date;
        if (start <= today && today <= end) {
          const emp = window.teamEmployees.find(e => e.employee_id === l.employee_id);
          const name = emp ? (emp.full_name || emp.name) : l.employee_id;
          if (!onLeaveList.find(x => x.id === l.employee_id)) {
            onLeaveList.push({ id: l.employee_id, name, reason: l.reason || '' });
          }
        }
      });
    }

    // Tasks
    let pendingList = [], overdueList = [];
    if (empIds.length > 0) {
      const tasks = await window.supabaseQuery('tasks', `?employee_id=in.(${empIds.join(',')})`);
      tasks.forEach(t => {
        const emp = window.teamEmployees.find(e => e.employee_id === t.employee_id);
        const name = emp ? (emp.full_name || emp.name) : t.employee_id;
        if (t.status === 'Pending' || t.status === 'Submitted') {
          pendingList.push({ id: t.employee_id, name, title: t.title, deadline: t.deadline, status: t.status });
        }
        if (t.status === 'Pending' && new Date(t.deadline) < new Date()) {
          overdueList.push({ id: t.employee_id, name, title: t.title, deadline: t.deadline });
        }
      });
    }

    // Store for detail panel
    window._statData = {
      team: window.teamEmployees.map(e => ({ id: e.employee_id, name: e.full_name || e.name, designation: e.designation })),
      present: presentList,
      leave: onLeaveList,
      tasks: pendingList,
      overdue: overdueList
    };

    window.animateCount(document.getElementById('stat-present'), presentList.length);
    window.animateCount(document.getElementById('stat-leave'), onLeaveList.length);
    window.animateCount(document.getElementById('stat-tasks'), pendingList.length);

    // Overdue tasks widget
    const overdueContainer = document.getElementById('overdue-tasks-list');
    if (overdueList.length === 0) {
      overdueContainer.innerHTML = '<p class="text-sm text-slate-500">No overdue tasks. 🎉</p>';
    } else {
      overdueContainer.innerHTML = overdueList.slice(0, 3).map(t =>
        `<div class="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
          <div><p class="font-semibold text-sm text-slate-800">${t.title}</p><p class="text-xs text-slate-500">Due: ${new Date(t.deadline).toLocaleDateString('en-IN')} · ${t.name}</p></div>
          <span class="badge badge-red">Overdue</span>
        </div>`
      ).join('');
    }

    // Projects widget
    const projects = await window.supabaseQuery('projects', `?manager_id=eq.${window._managerId}`);
    const active = projects.filter(p => p.status === 'Active' || p.status === 'active');
    const projContainer = document.getElementById('active-projects-list');
    if (active.length === 0) {
      projContainer.innerHTML = '<p class="text-sm text-slate-500">No active projects.</p>';
    } else {
      projContainer.innerHTML = active.slice(0, 3).map(p =>
        `<div class="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
          <div><p class="font-semibold text-sm text-slate-800">${p.name}</p></div>
          <span class="badge badge-green">Active</span>
        </div>`
      ).join('');
    }

  } catch (err) {
    console.error("Stats error", err);
  }
}

// Show detail panel when stat card is clicked
window.showStatDetail = (type) => {
  const panel = document.getElementById('stat-detail-panel');
  const title = document.getElementById('stat-detail-title');
  const content = document.getElementById('stat-detail-content');
  if (!panel || !window._statData) return;

  const data = window._statData[type];
  const titles = { team: 'Team Members', present: 'Present Today', leave: 'On Leave Today', tasks: 'Pending Tasks' };
  const colors = { team: 'blue', present: 'green', leave: 'red', tasks: 'purple' };
  title.textContent = titles[type] || 'Details';

  if (!data || data.length === 0) {
    content.innerHTML = `<p class="text-slate-500 text-sm py-4 text-center">No ${titles[type]?.toLowerCase() || 'data'} found.</p>`;
  } else if (type === 'team') {
    content.innerHTML = data.map(e => `
      <div class="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">${e.name.charAt(0)}</div>
          <div><p class="font-semibold text-sm text-slate-800">${e.name}</p><p class="text-xs text-slate-500">${e.id}</p></div>
        </div>
        <span class="text-xs text-slate-500">${e.designation || '-'}</span>
      </div>`).join('');
  } else if (type === 'present') {
    content.innerHTML = data.map(e => `
      <div class="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
        <div class="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">${e.name.charAt(0)}</div>
        <div><p class="font-semibold text-sm text-slate-800">${e.name}</p><p class="text-xs text-slate-500">${e.id} · Present</p></div>
      </div>`).join('');
  } else if (type === 'leave') {
    content.innerHTML = data.map(e => `
      <div class="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm">${e.name.charAt(0)}</div>
          <div><p class="font-semibold text-sm text-slate-800">${e.name}</p><p class="text-xs text-slate-500">${e.id}</p></div>
        </div>
        <span class="text-xs text-red-600 font-medium">${e.reason || 'On Leave'}</span>
      </div>`).join('');
  } else if (type === 'tasks') {
    content.innerHTML = data.map(t => `
      <div class="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
        <div>
          <p class="font-semibold text-sm text-slate-800">${t.title}</p>
          <p class="text-xs text-slate-500">${t.name} · Due: ${new Date(t.deadline).toLocaleDateString('en-IN')}</p>
        </div>
        <span class="badge ${t.status === 'Submitted' ? 'badge-yellow' : 'badge-blue'}">${t.status}</span>
      </div>`).join('');
  }

  panel.classList.remove('hidden');
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

// --- Team ---
async function renderTeamTable() {
  const tbody = document.getElementById('team-table-body');
  if (window.teamEmployees.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-slate-500">No team members found.</td></tr>';
    return;
  }
  
  // Get today's attendance for status
  const today = new Date().toISOString().split('T')[0];
  let attMap = {};
  try {
    const att = await window.supabaseQuery('attendance', `?date=eq.${today}`);
    att.forEach(a => { attMap[a.employee_id] = a.status; });
  } catch(e){}

  tbody.innerHTML = window.teamEmployees.map(emp => {
    const status = attMap[emp.employee_id] || 'Not Marked';
    return `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="px-6 py-4 font-semibold text-slate-700">${emp.employee_id}</td>
        <td class="px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">${(emp.full_name||emp.name).charAt(0)}</div>
            <span class="font-semibold text-slate-800">${(emp.full_name||emp.name)}</span>
          </div>
        </td>
        <td class="px-6 py-4 text-slate-600">${emp.designation || '-'}</td>
        <td class="px-6 py-4"><span class="badge ${getBadgeClass(status)}">${status}</span></td>
        <td class="px-6 py-4 text-right">
          <button onclick="window.openEmployeeDetail('${emp.employee_id}')" class="text-primary hover:text-indigo-800 font-semibold text-sm bg-primary/10 px-3 py-1.5 rounded-lg transition-colors">View Details</button>
        </td>
      </tr>
    `;
  }).join('');
  if (window.lucide) window.lucide.createIcons();
}

window.filterTeam = (term) => {
  const rows = document.querySelectorAll('#team-table-body tr');
  term = term.toLowerCase();
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(term) ? '' : 'none';
  });
};

window.openEmployeeDetail = async (empId) => {
  window.currentEmpId = empId;
  const emp = window.teamEmployees.find(e => e.employee_id === empId);
  if (!emp) return;
  
  document.getElementById('emp-modal-name').textContent = emp.full_name || emp.name;
  document.getElementById('emp-modal-id').textContent = emp.employee_id;
  
  window.openModal('emp-detail-modal');
  window.switchEmpTab('tasks');
};

window.switchEmpTab = (tab) => {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-btn-${tab}`).classList.add('active');
  
  document.getElementById('emp-tab-tasks').style.display = tab === 'tasks' ? 'block' : 'none';
  document.getElementById('emp-tab-attendance').style.display = tab === 'attendance' ? 'block' : 'none';
  document.getElementById('emp-tab-ratings').style.display = tab === 'ratings' ? 'block' : 'none';

  if (tab === 'tasks') loadEmpTasks();
  if (tab === 'attendance') {
    const rm = document.getElementById('emp-attendance-month');
    if (!rm.value) {
      const d = new Date();
      rm.value = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    }
    window.loadEmpAttendanceData(rm.value);
  }
  if (tab === 'ratings') loadEmpRatings();
};

async function loadEmpTasks() {
  const tbody = document.getElementById('emp-tasks-body');
  tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-sm text-slate-500">Loading...</td></tr>';
  try {
    const tasks = await window.supabaseQuery('tasks', `?employee_id=eq.${window.currentEmpId}&order=created_at.desc`);
    
    document.getElementById('emp-stat-total-tasks').textContent = tasks.length;
    document.getElementById('emp-stat-ontime-tasks').textContent = tasks.filter(t => t.status==='Completed').length;
    document.getElementById('emp-stat-rejected-tasks').textContent = tasks.filter(t => t.status==='Rejected').length;
    
    const missed = tasks.filter(t => t.status !== 'Completed' && new Date(t.deadline) < new Date()).length;
    document.getElementById('emp-stat-missed-tasks').textContent = missed;

    if (tasks.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-sm text-slate-500">No tasks found.</td></tr>';
    } else {
      tbody.innerHTML = tasks.map(t => `
        <tr class="hover:bg-slate-50">
          <td class="py-3 px-4 font-medium text-slate-800">${t.title}</td>
          <td class="py-3 px-4"><span class="badge ${getBadgeClass(t.status)}">${t.status}</span></td>
          <td class="py-3 px-4 text-slate-600">${new Date(t.deadline).toLocaleDateString()}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-sm text-red-500">Failed to load tasks.</td></tr>';
  }
}

window.loadEmpAttendanceData = async (monthVal) => {
  if (!monthVal || !window.currentEmpId) return;
  const tbody = document.getElementById('emp-attendance-body');
  tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-sm text-slate-500">Loading...</td></tr>';
  
  const [year, month] = monthVal.split('-');
  const start = `${year}-${month}-01`;
  const end = new Date(year, month, 0).toISOString().split('T')[0];
  
  try {
    const att = await window.supabaseQuery('attendance', `?employee_id=eq.${window.currentEmpId}&date=gte.${start}&date=lte.${end}&order=date.desc`);
    
    const present = att.filter(a => a.status === 'Present').length;
    const workingDays = att.length; // rough approx
    document.getElementById('emp-attendance-summary').textContent = `${present} present out of ${workingDays} recorded days`;

    if (att.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-sm text-slate-500">No records for this month.</td></tr>';
    } else {
      tbody.innerHTML = att.map(a => `
        <tr class="hover:bg-slate-50">
          <td class="py-3 px-4 font-medium text-slate-800">${a.date}</td>
          <td class="py-3 px-4"><span class="badge ${getBadgeClass(a.status)}">${a.status}</span></td>
          <td class="py-3 px-4 text-slate-600">${a.check_in || '-'} to ${a.check_out || '-'}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-sm text-red-500">Error loading.</td></tr>';
  }
};

async function loadEmpRatings() {
  const tbody = document.getElementById('emp-ratings-body');
  tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-sm text-slate-500">Loading...</td></tr>';
  try {
    const res = await fetch(`/api/ratings?employee_id=${window.currentEmpId}`, {
      headers: { 'x-admin-key': 'hrms-admin-access' }
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const ratings = data.ratings || [];
    
    if (ratings.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-sm text-slate-500">No ratings found.</td></tr>';
    } else {
      tbody.innerHTML = ratings.map(r => `
        <tr class="hover:bg-slate-50">
          <td class="py-3 px-4 font-medium text-slate-800">${r.month} ${r.year}</td>
          <td class="py-3 px-4">
             <div class="flex items-center gap-2">
                <div class="w-full bg-slate-200 rounded-full h-2 max-w-[100px]"><div class="bg-primary h-2 rounded-full" style="width: ${r.manager_rating}%"></div></div>
                <span class="font-bold text-slate-700">${r.manager_rating}</span>
             </div>
          </td>
          <td class="py-3 px-4 text-slate-600 text-xs">${r.manager_comments || '-'}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-sm text-red-500">Failed to load ratings.</td></tr>';
  }
}

// --- Tasks ---
async function loadTeamTasks() {
  const tbody = document.getElementById('tasks-table-body');
  tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-slate-500">Loading tasks...</td></tr>';
  
  if (window.teamEmployees.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-slate-500">No team members to load tasks for.</td></tr>';
    return;
  }
  
  const empIds = window.teamEmployees.map(e => `"${e.employee_id}"`).join(',');
  try {
    window.allTasks = await window.supabaseQuery('tasks', `?employee_id=in.(${empIds})&order=created_at.desc`);
    window.filterTasks();
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-red-500">Error loading tasks.</td></tr>';
  }
}

window.filterTasks = () => {
  const status = document.getElementById('task-status-filter').value;
  const tbody = document.getElementById('tasks-table-body');
  
  let filtered = window.allTasks;
  if (status !== 'all') {
    filtered = filtered.filter(t => t.status === status);
  }
  
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-slate-500">No tasks found.</td></tr>';
    return;
  }
  
  tbody.innerHTML = filtered.map(t => {
    const emp = window.teamEmployees.find(e => e.employee_id === t.employee_id) || { name: t.employee_id };
    
    let actions = '';
    if (t.status === 'Submitted') {
      actions = `
        <button onclick="window.reviewTask('${t.task_id}', 'Completed')" class="text-green-600 bg-green-50 hover:bg-green-100 px-2 py-1 rounded text-xs font-bold mr-2">Approve</button>
        <button onclick="window.reviewTask('${t.task_id}', 'Rejected')" class="text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1 rounded text-xs font-bold">Reject</button>
      `;
    }
    
    return `
      <tr class="hover:bg-slate-50">
        <td class="px-6 py-4 font-semibold text-slate-800">${t.title}</td>
        <td class="px-6 py-4 text-slate-600">${(emp.full_name||emp.name)}</td>
        <td class="px-6 py-4 text-slate-600">${new Date(t.deadline).toLocaleDateString()}</td>
        <td class="px-6 py-4"><span class="badge ${t.priority==='High'?'badge-red':t.priority==='Medium'?'badge-yellow':'badge-blue'}">${t.priority||'Normal'}</span></td>
        <td class="px-6 py-4"><span class="badge ${getBadgeClass(t.status)}">${t.status}</span></td>
        <td class="px-6 py-4 text-right">${actions}</td>
      </tr>
    `;
  }).join('');
};

window.reviewTask = async (taskId, newStatus) => {
  if(!confirm(`Are you sure you want to mark this task as ${newStatus}?`)) return;
  try {
    await window.supabaseQuery('tasks', `?task_id=eq.${taskId}`, 'PATCH', { status: newStatus });
    alert(`Task ${newStatus}`);
    loadTeamTasks();
  } catch (err) {
    alert("Error updating task.");
  }
};

window.openAssignTaskModal = () => {
  document.getElementById('assign-task-form').reset();
  window.openModal('assign-task-modal');
};

window.submitAssignTask = async () => {
  const btn = document.getElementById('btn-submit-task');
  btn.disabled = true;
  btn.textContent = 'Assigning...';
  
  const data = {
    employee_id: document.getElementById('task-assignee').value,
    title: document.getElementById('task-title').value,
    description: document.getElementById('task-desc').value,
    deadline: document.getElementById('task-deadline').value,
    priority: document.getElementById('task-priority').value,
    status: 'Pending'
  };
  
  try {
    await window.supabaseQuery('tasks', '', 'POST', data);
    
    // Create notification (optional)
    await window.supabaseQuery('notifications', '', 'POST', {
      user_id: data.employee_id,
      title: 'New Task Assigned',
      message: `You have been assigned a new task: ${data.title}. Deadline: ${data.deadline}`,
      is_read: false
    });
    
    window.closeModal('assign-task-modal');
    loadTeamTasks();
  } catch(e) {
    alert("Error assigning task");
  } finally {
    btn.disabled = false;
    btn.textContent = 'Assign Task';
  }
};

// --- Attendance ---
async function loadTodayAttendance() {
  const cont = document.getElementById('today-attendance-list');
  if (window.teamEmployees.length === 0) {
    cont.innerHTML = '<p class="text-sm text-slate-500">No team members.</p>';
    return;
  }
  
  const today = new Date().toISOString().split('T')[0];
  try {
    const att = await window.supabaseQuery('attendance', `?date=eq.${today}`);
    let map = {};
    att.forEach(a => { map[a.employee_id] = a; });
    
    cont.innerHTML = window.teamEmployees.map(emp => {
      const a = map[emp.employee_id];
      const status = a ? a.status : 'Absent'; // assume absent if not marked
      return `
        <div class="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
          <div class="font-semibold text-sm text-slate-800">${(emp.full_name||emp.name)}</div>
          <span class="badge ${getBadgeClass(status)}">${status}</span>
        </div>
      `;
    }).join('');
    
    // Set initial month for breakdown
    const d = new Date();
    document.getElementById('attendance-month').value = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    window.loadMonthAttendance(document.getElementById('attendance-month').value);
  } catch (e) {
    cont.innerHTML = '<p class="text-red-500 text-sm">Error loading</p>';
  }
}

window.loadMonthAttendance = async (monthVal) => {
  if (!monthVal) return;
  const tbody = document.getElementById('monthly-attendance-body');
  tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-sm text-slate-500">Loading...</td></tr>';
  
  const [year, month] = monthVal.split('-');
  const start = `${year}-${month}-01`;
  const end = new Date(year, month, 0).toISOString().split('T')[0];
  
  try {
    const att = await window.supabaseQuery('attendance', `?date=gte.${start}&date=lte.${end}`);
    
    tbody.innerHTML = window.teamEmployees.map(emp => {
      const empAtt = att.filter(a => a.employee_id === emp.employee_id);
      const present = empAtt.filter(a => a.status === 'Present').length;
      const absent = empAtt.filter(a => a.status === 'Absent').length;
      const leave = empAtt.filter(a => a.status === 'Leave').length;
      
      return `
        <tr class="hover:bg-slate-50">
          <td class="py-3 font-medium text-slate-800">${(emp.full_name||emp.name)}</td>
          <td class="py-3 text-center text-green-600 font-bold">${present}</td>
          <td class="py-3 text-center text-red-600 font-bold">${absent}</td>
          <td class="py-3 text-center text-yellow-600 font-bold">${leave}</td>
        </tr>
      `;
    }).join('');
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-red-500">Error loading data.</td></tr>';
  }
};

// --- Ratings ---
async function loadRatingForm() {
  const cont = document.getElementById('ratings-form-container');
  const d = new Date();
  const currentMonth = d.toISOString().substring(0, 7); // YYYY-MM
  const monthLabel = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  document.getElementById('ratings-current-month').textContent = monthLabel;
  
  if (d.getDate() < 15) {
    document.getElementById('ratings-banner').classList.remove('hidden');
  } else {
    document.getElementById('ratings-banner').classList.add('hidden');
  }
  
  if (window.teamEmployees.length === 0) {
    cont.innerHTML = '<p class="text-center text-slate-500">No team members available.</p>';
    return;
  }
  
  try {
    // Check if ratings already submitted for this month
    const empIds = window.teamEmployees.map(e => e.employee_id);
    const res = await fetch(`/api/ratings?month=${currentMonth}`, { headers: { 'x-admin-key': 'hrms-admin-access' }});
    const data = await res.json();
    
    // Filter ratings by this manager's team
    const myRatings = (data.ratings || []).filter(r => empIds.includes(r.employee_id) && r.rated_by === (window._managerEmpId || ''));
    
    if (myRatings.length > 0) {
      cont.innerHTML = `
        <div class="text-center py-10">
          <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
             <i data-lucide="check-circle" class="w-8 h-8"></i>
          </div>
          <h3 class="text-xl font-bold text-slate-800">Ratings Submitted</h3>
          <p class="text-slate-500 mt-2">You have already submitted ratings for ${monthLabel}.</p>
        </div>
      `;
      document.getElementById('submit-ratings-btn').classList.add('hidden');
      if (window.lucide) window.lucide.createIcons();
    } else {
      document.getElementById('submit-ratings-btn').classList.remove('hidden');
      cont.innerHTML = window.teamEmployees.map(emp => `
        <div class="rating-row bg-slate-50 p-5 rounded-2xl border border-slate-200" data-empid="${emp.employee_id}">
           <div class="flex flex-col md:flex-row md:items-center gap-6">
              <div class="md:w-1/4">
                 <p class="font-bold text-slate-800 text-lg">${(emp.full_name||emp.name)}</p>
                 <p class="text-sm text-slate-500">${emp.employee_id}</p>
              </div>
              <div class="md:w-1/2 flex items-center gap-4">
                 <input type="range" min="0" max="100" value="80" class="w-full rating-slider" oninput="this.nextElementSibling.textContent = this.value" />
                 <span class="font-bold text-primary w-8 text-right rating-val">80</span>
              </div>
              <div class="md:w-1/4">
                 <input type="text" placeholder="Comments..." class="rating-comments w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary" />
              </div>
           </div>
        </div>
      `).join('');
    }
  } catch (e) {
    console.error(e);
    document.getElementById('submit-ratings-btn').classList.remove('hidden');
    cont.innerHTML = window.teamEmployees.map(emp => `
      <div class="rating-row bg-slate-50 p-5 rounded-2xl border border-slate-200" data-empid="${emp.employee_id}">
         <div class="flex flex-col md:flex-row md:items-center gap-6">
            <div class="md:w-1/4">
               <p class="font-bold text-slate-800 text-lg">${(emp.full_name||emp.name)}</p>
               <p class="text-sm text-slate-500">${emp.employee_id}</p>
            </div>
            <div class="md:w-1/2 flex items-center gap-4">
               <input type="range" min="0" max="100" value="80" class="w-full rating-slider" oninput="this.nextElementSibling.textContent = this.value" />
               <span class="font-bold text-primary w-8 text-right rating-val">80</span>
            </div>
            <div class="md:w-1/4">
               <input type="text" placeholder="Comments..." class="rating-comments w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
         </div>
      </div>
    `).join('');
  }
  
  // Also load past ratings history
  loadPastRatings();
}

window.submitRatings = async () => {
  const btn = document.getElementById('submit-ratings-btn');
  btn.disabled = true;
  btn.textContent = 'Submitting...';
  
  const d = new Date();
  const month = d.toISOString().substring(0, 7); // YYYY-MM
  const monthLabel = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const managerName = document.getElementById('header-name')?.textContent || 'Manager';
  
  const ratings = [];
  document.querySelectorAll('.rating-row').forEach(row => {
    ratings.push({
      employee_id: row.dataset.empid,
      rating: parseInt(row.querySelector('.rating-slider').value),
      comments: row.querySelector('.rating-comments').value
    });
  });
  
  try {
    // Submit ratings via API (handles emails + notifications)
    const res = await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': 'hrms-admin-access' },
      body: JSON.stringify({
        ratings,
        month,
        rated_by: window._managerEmpId || managerName,
        rated_by_role: 'manager'
      })
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    
    // Also post a team announcement so employees see it in announcements
    await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': 'hrms-admin-access' },
      body: JSON.stringify({
        title: `Performance Ratings — ${monthLabel}`,
        message: `${managerName} has submitted performance ratings for ${monthLabel}. Check your "My Ratings" section to view your score and comments.`,
        posted_by: managerName,
        posted_by_role: 'manager',
        scope: 'team',
        manager_id: window._managerId
      })
    });
    
    alert("Ratings submitted successfully!");
    loadRatingForm();
  } catch (err) {
    console.error(err);
    alert("Error submitting ratings: " + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Submit All Ratings';
  }
};

// Load past rating history (grouped by month)
async function loadPastRatings() {
  const cont = document.getElementById('past-ratings-list');
  if (!cont) return;
  
  try {
    const empIds = window.teamEmployees.map(e => e.employee_id);
    if (empIds.length === 0) {
      cont.innerHTML = '<p class="text-center text-slate-400 py-4">No team members.</p>';
      return;
    }
    
    const res = await fetch(`/api/ratings?rated_by=${encodeURIComponent(window._managerEmpId || '')}`, { headers: { 'x-admin-key': 'hrms-admin-access' }});
    const data = await res.json();
    const allRatings = data.ratings || [];
    
    if (allRatings.length === 0) {
      cont.innerHTML = '<p class="text-center text-slate-400 py-4">No ratings submitted yet.</p>';
      return;
    }
    
    // Group by month
    const byMonth = {};
    allRatings.forEach(r => {
      if (!byMonth[r.month]) byMonth[r.month] = [];
      byMonth[r.month].push(r);
    });
    
    // Sort months descending
    const months = Object.keys(byMonth).sort().reverse();
    
    // Store for detail view
    window._pastRatings = byMonth;
    
    cont.innerHTML = months.map(m => {
      const ratings = byMonth[m];
      const avgRating = Math.round(ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length);
      const color = avgRating >= 70 ? 'green' : avgRating >= 40 ? 'yellow' : 'red';
      const monthLabel = new Date(m + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const submittedDate = new Date(ratings[0].created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      
      return `
        <div class="bg-slate-50 rounded-xl border border-slate-200 p-4 cursor-pointer hover:bg-slate-100 hover:border-primary/30 transition-all" onclick="window.showRatingDetail('${m}')">
          <div class="flex justify-between items-center">
            <div>
              <p class="font-bold text-slate-800">${monthLabel}</p>
              <p class="text-xs text-slate-500">${ratings.length} employees rated · Submitted ${submittedDate}</p>
            </div>
            <div class="flex items-center gap-3">
              <div class="text-right">
                <p class="text-xs text-slate-500">Avg Score</p>
                <p class="font-bold text-lg text-${color}-600">${avgRating}<span class="text-xs font-normal">/100</span></p>
              </div>
              <i data-lucide="chevron-right" class="w-5 h-5 text-slate-400"></i>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error('Error loading past ratings:', err);
    cont.innerHTML = '<p class="text-center text-red-500 py-4">Error loading ratings history.</p>';
  }
}

// Show employee-wise rating detail for a specific month
window.showRatingDetail = (month) => {
  const panel = document.getElementById('rating-detail-panel');
  const title = document.getElementById('rating-detail-title');
  const content = document.getElementById('rating-detail-content');
  if (!panel || !window._pastRatings || !window._pastRatings[month]) return;
  
  const ratings = window._pastRatings[month];
  const monthLabel = new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  title.textContent = `Ratings — ${monthLabel}`;
  
  content.innerHTML = ratings.map(r => {
    const emp = window.teamEmployees.find(e => e.employee_id === r.employee_id);
    const name = emp ? (emp.full_name || emp.name) : r.employee_id;
    const color = r.rating >= 70 ? 'green' : r.rating >= 40 ? 'yellow' : 'red';
    const bgColor = r.rating >= 70 ? '#ecfdf5' : r.rating >= 40 ? '#fffbeb' : '#fef2f2';
    const textColor = r.rating >= 70 ? '#059669' : r.rating >= 40 ? '#d97706' : '#dc2626';
    
    return `
      <div class="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl border border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">${name.charAt(0)}</div>
          <div>
            <p class="font-semibold text-slate-800">${name}</p>
            <p class="text-xs text-slate-500">${r.employee_id}</p>
            ${r.comments ? `<p class="text-xs text-slate-600 mt-1 italic">"${r.comments}"</p>` : ''}
          </div>
        </div>
        <div style="background:${bgColor};color:${textColor};padding:6px 16px;border-radius:100px;font-weight:800;font-size:1.1rem">
          ${r.rating}<span style="font-size:0.7rem;font-weight:500">/100</span>
        </div>
      </div>
    `;
  }).join('');
  
  panel.classList.remove('hidden');
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

// --- Announcements ---
async function loadAnnouncements() {
  const grid = document.getElementById('announcements-grid');
  try {
    const res = await fetch(`/api/announcements`, { headers: { 'x-admin-key': 'hrms-admin-access' }});
    const data = await res.json();
    const anns = (data.announcements || []).filter(a => a.manager_id === window._managerId || a.scope === 'all');
    
    if (anns.length === 0) {
      grid.innerHTML = '<div class="col-span-full text-center text-slate-500 py-8">No announcements found.</div>';
    } else {
      grid.innerHTML = anns.map(a => `
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
           ${a.scope === 'all' ? '<div class="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">Global</div>' : ''}
           <h3 class="font-bold text-slate-800 text-lg mb-2">${a.title}</h3>
           <p class="text-slate-600 text-sm mb-4 line-clamp-3">${a.message}</p>
           <p class="text-xs text-slate-400 font-semibold">${new Date(a.created_at).toLocaleDateString()}</p>
        </div>
      `).join('');
    }
  } catch (e) {
    grid.innerHTML = '<div class="col-span-full text-center text-red-500 py-8">Error loading announcements.</div>';
  }
}

window.openAnnouncementModal = () => {
  document.getElementById('announcement-form').reset();
  window.openModal('announcement-modal');
};

window.submitAnnouncement = async () => {
  const btn = document.getElementById('btn-submit-announce');
  const title = document.getElementById('announce-title')?.value?.trim();
  const message = document.getElementById('announce-msg')?.value?.trim();
  
  if (!title || !message) {
    alert("Please enter both title and message.");
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Posting...';
  
  const managerName = window._managerName || window._mgrExec?.name || 'Manager';
  const data = {
    title,
    message,
    posted_by: managerName,
    posted_by_role: 'manager',
    scope: 'team',
    manager_id: window._managerId
  };
  
  try {
    const headers = { 'Content-Type': 'application/json', 'x-admin-key': 'hrms-admin-access' };
    if (window._mgrToken) headers['Authorization'] = `Bearer ${window._mgrToken}`;

    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.error || 'Failed to post announcement');
    }
    window.closeModal('announcement-modal');
    loadAnnouncements();
  } catch (e) {
    console.error('Error posting announcement:', e);
    alert(e.message || "Failed to post announcement");
  } finally {
    btn.disabled = false;
    btn.textContent = 'Post Announcement';
  }
};

// --- Projects ---
async function loadProjects() {
  const tbody = document.getElementById('projects-table-body');
  try {
    const projects = await window.supabaseQuery('projects', `?manager_id=eq.${window._managerId}`);
    
    if (projects.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-slate-500">No projects found.</td></tr>';
      return;
    }
    
    tbody.innerHTML = projects.map(p => `
      <tr class="hover:bg-slate-50">
        <td class="px-6 py-4 font-bold text-slate-800">${p.name}</td>
        <td class="px-6 py-4"><span class="badge ${getBadgeClass(p.status)}">${p.status}</span></td>
        <td class="px-6 py-4 text-slate-600">${p.start_date || '-'}</td>
        <td class="px-6 py-4 text-slate-600">${p.end_date || '-'}</td>
        <td class="px-6 py-4 text-right">
          ${p.status !== 'Completed' ? `<button onclick="window.updateProjectStatus('${p.id}', 'Completed')" class="text-primary hover:underline text-sm font-semibold">Mark Done</button>` : '-'}
        </td>
      </tr>
    `).join('');
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-red-500">Error loading.</td></tr>';
  }
}

window.openProjectModal = () => {
  document.getElementById('project-form').reset();
  window.openModal('project-modal');
};

window.submitProject = async () => {
  const btn = document.getElementById('btn-submit-project');
  btn.disabled = true;
  btn.textContent = 'Saving...';
  
  const data = {
    name: document.getElementById('project-name').value,
    description: document.getElementById('project-desc').value,
    start_date: document.getElementById('project-start').value,
    end_date: document.getElementById('project-end').value,
    manager_id: window._managerId,
    status: 'Active'
  };
  
  try {
    await window.supabaseQuery('projects', '', 'POST', data);
    window.closeModal('project-modal');
    loadProjects();
  } catch (e) {
    alert("Failed to save project");
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Project';
  }
};

window.updateProjectStatus = async (id, status) => {
  if (!confirm(`Mark project as ${status}?`)) return;
  try {
    await window.supabaseQuery('projects', `?id=eq.${id}`, 'PATCH', { status });
    loadProjects();
  } catch (e) {
    alert("Error updating project");
  }
};

// Modals
window.openModal = (id) => {
  document.getElementById('modal-overlay').style.display = 'block';
  document.getElementById(id).style.display = 'flex';
};
window.closeModal = (id) => {
  document.getElementById('modal-overlay').style.display = 'none';
  document.getElementById(id).style.display = 'none';
};
