// lib/pages/admin-dashboard.js

import { supabase } from '../supabase';
import { formatDate, showToast, generateEmployeeID } from './utils';

let employeesCache = [];
let notificationIntervalId = null;

/* ==========================
   SECTION SWITCHING
========================== */
export function showSection(sectionId) {
    // Update Sidebar
    document.querySelectorAll('.nav-links button')?.forEach(btn => btn.classList.remove('active'));
    
    const navBtns = document.querySelectorAll('.nav-links button');
    const indexMap = { employees: 0, tasks: 1, attendance: 2, leaves: 3, applicants: 4 };
    if (navBtns[indexMap[sectionId]]) {
        navBtns[indexMap[sectionId]].classList.add('active');
    }

    // Show Section
    ['employees', 'tasks', 'attendance', 'leaves', 'applicants'].forEach(id => {
        document.getElementById(`${id}-section`)?.classList.add('hidden');
    });
    document.getElementById(`${sectionId}-section`)?.classList.remove('hidden');

    // Load Data
    if (sectionId === 'employees') loadEmployees();
    if (sectionId === 'tasks') loadTasks();
    if (sectionId === 'attendance') loadAttendance();
    if (sectionId === 'leaves') loadLeaves();
    if (sectionId === 'applicants') loadJobApplicants(); 

    loadAdminStats();
    fetchNotifications();

    // Poll for notifications every 30 seconds (set once)
    if (!notificationIntervalId) {
        notificationIntervalId = setInterval(fetchNotifications, 30000);
    }
}

/* ==========================
   NOTIFICATIONS
========================== */
// async function fetchNotifications() {
//     const list = document.getElementById('notif-list');
//     const badge = document.getElementById('notif-count');
//     if (!list || !badge) return;

//     const { data, error } = await supabase
//         .from('notifications')
//         .select('*')
//         .eq('recipient_role', 'admin')
//         .eq('is_read', false)
//         .order('created_at', { ascending: false });

//     if (error) return console.error('Error fetching notifications:', error);

//     // Update Badge
//     if (data.length > 0) {
//         badge.textContent = data.length;
//         badge.classList.remove('hidden');
//     } else {
//         badge.classList.add('hidden');
//     }

//     // Update List
//     if (data.length === 0) {
//         list.innerHTML = '<li style="padding:10px; color:#666;">No new notifications</li>';
//         return;
//     }

//     list.innerHTML = '';
//     data.forEach(n => {
//         const li = document.createElement('li');
//         li.textContent = n.message;
//         li.className = 'unread';
//         list.appendChild(li);
//     });
// }

async function fetchNotifications() {
    const list = document.getElementById('notif-list');
    const badge = document.getElementById('notif-count');
    if (!list || !badge) return;

    // Get existing admin notifications
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_role', 'admin')
        .eq('is_read', false)
        .order('created_at', { ascending: false });

    if (error) return console.error('Error fetching notifications:', error);

    // Get new applications count (submitted in last 24 hours AND not yet viewed)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: newApps, count: newAppsCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact' })
        .gte('submitted_at', yesterday)
        .is('viewed_by_admin', null); // Only count unviewed applications

    // Calculate total notifications
    const existingNotifs = data?.length || 0;
    const totalNotifs = existingNotifs + (newAppsCount || 0);

    // Update Badge
    if (totalNotifs > 0) {
        badge.textContent = totalNotifs;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }

    // Update List
    if (totalNotifs === 0) {
        list.innerHTML = '<li style="padding:10px; color:#666;">No new notifications</li>';
        return;
    }

    list.innerHTML = '';

    // Add existing admin notifications (tasks, leaves, etc.)
    if (data && data.length > 0) {
        data.forEach(n => {
            const li = document.createElement('li');
            li.textContent = n.message;
            li.className = 'unread';
            list.appendChild(li);
        });
    }

    // Add application notification
    if (newAppsCount > 0) {
        const li = document.createElement('li');
        li.textContent = `${newAppsCount} new job application${newAppsCount > 1 ? 's' : ''}`;
        li.className = 'unread';
        li.style.cursor = 'pointer';
        li.onclick = () => {
            if (typeof showSection === 'function') {
                showSection('applicants');
            } else if (typeof window.showSection === 'function') {
                window.showSection('applicants');
            }
            toggleNotifications();
        };
        list.appendChild(li);
    }
}


export function toggleNotifications() {
    document.getElementById('notif-dropdown')?.classList.toggle('hidden');
}

// export async function markAllRead() {
//     await supabase
//         .from('notifications')
//         .update({ is_read: true })
//         .eq('recipient_role', 'admin');

//     fetchNotifications();
// }

export async function markAllRead() {
    // Mark admin notifications as read
    await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_role', 'admin')
        .eq('is_read', false);

    // Mark all recent applications as viewed
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await supabase
        .from('applications')
        .update({ viewed_by_admin: true })
        .gte('submitted_at', yesterday)
        .is('viewed_by_admin', null);

    // Refresh notifications
    fetchNotifications();
}

/* ==========================
   ADMIN STATS
========================== */
async function loadAdminStats() {
    const { count: totalEmp } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .neq('role', 'admin');

    const today = new Date().toISOString().split('T')[0];
    const { data: presentData } = await supabase
        .from('attendance')
        .select('employee_id')
        .eq('date', today);

    const uniquePresent = new Set(presentData?.map(d => d.employee_id) || []).size;

    const totalEl = document.getElementById('stat-total-employees');
    const presentEl = document.getElementById('stat-present-today');

    if (totalEl) totalEl.textContent = totalEmp || 0;
    if (presentEl) presentEl.textContent = uniquePresent || 0;
}

/* ==========================
   FACE API SETUP
========================== */
export async function loadFaceModels() {
    try {
        if (typeof window !== 'undefined' && typeof window.faceapi === 'undefined') {
            console.warn('Face API not loaded yet, will retry...');
            setTimeout(loadFaceModels, 1000);
            return;
        }

        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        await window.faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await window.faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        console.log("FaceAPI Models Loaded");
    } catch (e) {
        console.error("Error loading models:", e);
        showToast("Error loading Face Recognition models", "error");
    }
}

/* ==========================
   EMPLOYEES
========================== */
async function loadEmployees() {
    const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return showToast('Error loading employees: ' + error.message, 'error');

    employeesCache = data || [];
    const tbody = document.querySelector('#employees-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    employeesCache.forEach(emp => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${emp.employee_id}</td>
            <td>${emp.full_name}</td>
            <td>${emp.role}</td>
            <td>${emp.email || '-'}</td>
            <td>
                <button class="btn-primary" style="font-size: 0.8rem; padding: 0.25rem 0.5rem; background: #f59e0b;" onclick="window.openResetPassword('${emp.id}')">Reset Pass</button>
                <button class="btn-secondary" style="font-size: 0.8rem; padding: 0.25rem 0.5rem;" onclick="window.deleteEmployee('${emp.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Populate Task Assignment Dropdown
    const select = document.getElementById('task-assign-to');
    if (select) {
        select.innerHTML = '';
        employeesCache.filter(e => e.role !== 'admin').forEach(emp => {
            const opt = document.createElement('option');
            opt.value = emp.employee_id;
            opt.textContent = `${emp.full_name} (${emp.employee_id})`;
            select.appendChild(opt);
        });
    }
}

export function openAddEmployeeModal() {
    document.getElementById('add-employee-modal')?.classList.remove('hidden');
}

export async function handleAddEmployee(e) {
    e.preventDefault();
    const name = document.getElementById('new-emp-name')?.value;
    const dept = document.getElementById('new-emp-dept')?.value;
    const email = document.getElementById('new-emp-email')?.value;
    const designation = document.getElementById('new-emp-designation')?.value;
    const password = document.getElementById('new-emp-password')?.value;
    const photoFile = document.getElementById('new-emp-photo')?.files[0];

    // CHECK IF EMAIL EXISTS
    const { data: existingEmp } = await supabase
        .from('employees')
        .select('id')
        .eq('email', email)
        .single();

    if (existingEmp) {
        return showToast(`The email ${email} is already registered!`, "error");
    }

    if (!photoFile) return showToast("Please upload a face photo.", "error");

    showToast("Processing Face Data... This may take a moment.", "info");

    try {
        // 1. Detect Face & Extract Descriptor
        const image = await window.faceapi.bufferToImage(photoFile);
        const detection = await window.faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor();

        if (!detection) {
            return showToast("No face detected! Please use a clear, front-facing photo.", "error");
        }

        const descriptorArray = Array.from(detection.descriptor);

        // 2. Generate ID
        const empId = generateEmployeeID();

        // 3. Create Auth User
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: { data: { full_name: name, role: 'employee', employee_id: empId } }
        });

        if (authError) throw authError;

        // 4. Insert into Employees Table
        const { error: dbError } = await supabase.from('employees').insert([{
            employee_id: empId,
            full_name: name,
            email: email,
            department: dept,
            designation: designation,
            role: 'employee'
        }]);

        if (dbError) throw dbError;

        // 5. Insert Facial Data
        const { error: faceError } = await supabase.from('facial_data').insert([{
            employee_id: empId,
            descriptor: descriptorArray
        }]);

        if (faceError) throw faceError;

        showToast("Employee Created & Face Data Saved!", "success");
        closeModal('add-employee-modal');
        loadEmployees();
        e.target.reset();

    } catch (err) {
        console.error(err);
        showToast(err.message || "Error creating employee", "error");
    }
}

export async function deleteEmployee(uuid) {
    if (!confirm('Are you sure? This will delete the employee record.')) return;

    const { error } = await supabase.from('employees').delete().eq('id', uuid);
    if (error) showToast(error.message, 'error');
    else loadEmployees();
}

let currentResetUserId = null;
export function openResetPassword(userId) {
    currentResetUserId = userId;
    document.getElementById('reset-password-modal')?.classList.remove('hidden');
}

export async function handleResetPassword(e) {
    e.preventDefault();
    
    const newPass = document.getElementById('reset-new-pass')?.value;
    if (!newPass || newPass.length < 6) return showToast("Password must be at least 6 characters", "error");

    showToast("Resetting password...", "info");

    try {
        const { data: emp, error: empError} = await supabase
            .from('employees')
            .select('employee_id, email')
            .eq('id', currentResetUserId)
            .single();

        if (empError || !emp) throw new Error("Could not find employee record.");

        // Note: Password reset requires service role key - this is a placeholder
        // In production, you'd need a server-side endpoint for this
        showToast("Password reset requires admin API access. Please implement server-side endpoint.", "error");
        
        closeModal('reset-password-modal');
        document.getElementById('reset-password-form')?.reset();

    } catch (err) {
        console.error(err);
        showToast(err.message || "Error resetting password", "error");
    }
}

/* ==========================
   TASKS
========================== */
async function loadTasks() {
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('assigned_at', { ascending: false });

    if (error) return showToast('Error loading tasks', 'error');

    const tbody = document.querySelector('#tasks-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    (data || []).forEach(task => {
        const emp = employeesCache.find(e => e.employee_id === task.employee_id);
        const empName = emp ? emp.full_name : task.employee_id;

        const tr = document.createElement('tr');

        let submissionDisplay = '-';
        if (task.status === 'Submitted' && task.submission_link) {
            submissionDisplay = `<a href="${task.submission_link}" target="_blank" style="color:blue; text-decoration:underline;">View Link</a>`;
        } else if (task.status === 'Submitted') {
            submissionDisplay = 'Submitted (No Link)';
        }

        tr.innerHTML = `
            <td>${task.title}</td>
            <td>${empName}</td>
            <td>${formatDate(task.deadline)}</td>
            <td>${task.priority}</td>
            <td><span class="status-badge status-${task.status.toLowerCase()}">${task.status}</span></td>
            <td>${submissionDisplay}</td>
            <td>
                ${task.status === 'Submitted' ? `<button class="btn-primary" style="font-size:0.8rem; padding: 0.25rem 0.5rem;" onclick="window.reviewTask('${task.id}')">Review</button>` : '-'}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

export function openAssignTaskModal() {
    document.getElementById('assign-task-modal')?.classList.remove('hidden');
}

export async function handleAssignTask(e) {
    e.preventDefault();
    const title = document.getElementById('task-title')?.value;
    const desc = document.getElementById('task-desc')?.value;
    const empId = document.getElementById('task-assign-to')?.value.toUpperCase();
    const deadline = document.getElementById('task-deadline')?.value;
    const priority = document.getElementById('task-priority')?.value;

    const { error } = await supabase.from('tasks').insert([{
        title,
        description: desc,
        employee_id: empId,
        deadline,
        priority,
        status: 'Pending'
    }]);

    if (error) {
        showToast(error.message, 'error');
    } else {
        await supabase.from('notifications').insert([{
            recipient_role: 'employee',
            recipient_id: empId,
            type: 'task_assigned',
            message: `New Task Assigned: "${title}" (Priority: ${priority})`
        }]);

        showToast('Task Assigned!', 'success');
        closeModal('assign-task-modal');
        loadTasks();
        document.getElementById('assign-task-form')?.reset();
    }
}

export async function reviewTask(taskId) {
    const action = prompt("Type 'approve' to Complete or 'reject' to Require Changes:");
    if (!action) return;

    let status = '';
    if (action.toLowerCase().includes('approve')) status = 'Completed';
    else if (action.toLowerCase().includes('reject')) status = 'Rejected';
    else return showToast('Invalid input', 'error');

    const { error } = await supabase.from('tasks').update({ status }).eq('id', taskId);
    if (error) showToast(error.message, 'error');
    else loadTasks();
}

/* ==========================
   ATTENDANCE
========================== */
export async function loadAttendance() {
    const filterDate = document.getElementById('attendance-filter-date')?.value || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('attendance')
        .select('*, employees(full_name)')
        .eq('date', filterDate);

    if (error) return showToast('Error loading attendance', 'error');

    const tbody = document.querySelector('#attendance-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No records for this date</td></tr>';
        return;
    }

    data.forEach(rec => {
        const empName = rec.employees ? rec.employees.full_name : rec.employee_id;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(rec.date)}</td>
            <td>${rec.employee_id}</td>
            <td>${empName}</td>
            <td>${rec.check_in_time}</td>
            <td>${rec.face_verified ? '✅ Verified' : '❌ Failed'}</td>
        `;
        tbody.appendChild(tr);
    });
}

/* ==========================
   LEAVES
========================== */
async function loadLeaves() {
    const { data, error } = await supabase
        .from('leaves')
        .select('*, employees(full_name)')
        .order('created_at', { ascending: false });

    if (error) return showToast('Error loading leaves', 'error');

    const tbody = document.querySelector('#leaves-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    (data || []).forEach(leave => {
        const empName = leave.employees ? leave.employees.full_name : leave.employee_id;

        const actions = leave.status === 'Pending' ? `
            <button class="btn-primary" style="background:#10b981; padding: 0.25rem 0.5rem; font-size: 0.8rem;" onclick="window.updateLeave('${leave.id}', 'Approved')">Approve</button>
            <button class="btn-secondary" style="background:#ef4444; color:white; border:none; padding: 0.25rem 0.5rem; font-size: 0.8rem;" onclick="window.updateLeave('${leave.id}', 'Rejected')">Reject</button>
        ` : '-';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${empName}<br><small>${leave.employee_id}</small></td>
            <td>${formatDate(leave.start_date)} to ${formatDate(leave.end_date)}</td>
            <td>${leave.reason}</td>
            <td><span class="status-badge status-${leave.status.toLowerCase()}">${leave.status}</span></td>
            <td>${actions}</td>
        `;
        tbody.appendChild(tr);
    });
}

export async function updateLeave(id, status) {
    if (!confirm(`Mark leave as ${status}?`)) return;
    
    const { data: leaveData } = await supabase.from('leaves').select('employee_id').eq('id', id).single();
    
    const { error } = await supabase.from('leaves').update({ status }).eq('id', id);
    
    if (error) {
        showToast(error.message, 'error');
    } else {
        if (leaveData) {
            await supabase.from('notifications').insert([{
                recipient_role: 'employee',
                recipient_id: leaveData.employee_id,
                type: 'leave_status',
                message: `Your Leave Application was ${status}`
            }]);
        }
        loadLeaves();
    }
}

/* ==========================
   UTILS
========================== */
export function closeModal(id) {
    document.getElementById(id)?.classList.add('hidden');
}

export function logoutAdmin() {
    supabase.auth.signOut().then(() => {
        window.location.href = '/';
    });
}

/* ==========================
   JOB APPLICANTS
========================== */
// async function loadJobApplicants() {
//     const { data, error } = await supabase
//         .from('applications')
//         .select('*')
//         .order('submitted_at', { ascending: false });

//     if (error) return showToast('Error loading applications', 'error');

//     const tbody = document.querySelector('#applicants-table tbody');
//     if (!tbody) return;

//     tbody.innerHTML = '';

//     if (!data || data.length === 0) {
//         tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No applications yet</td></tr>';
//         return;
//     }

//     data.forEach(app => {
//         const tr = document.createElement('tr');
//         tr.innerHTML = `
//             <td>${app.applicant_name}</td>
//             <td>${app.job_title}</td>
//             <td>${app.applicant_email}</td>
//             <td>${app.applicant_phone}</td>
//             <td>${app.experience_years || 'N/A'}</td>
//             <td>${formatDate(app.submitted_at)}</td>
//             <td>
//                 <button class="btn-primary" style="font-size: 0.8rem; padding: 0.25rem 0.5rem;" onclick="window.viewApplicantDetails('${app.id}')">View</button>
//                 <button class="btn-secondary" style="font-size: 0.8rem; padding: 0.25rem 0.5rem;" onclick="window.deleteApplicant('${app.id}')">Delete</button>
//             </td>
//         `;
//         tbody.appendChild(tr);
//     });
// }

async function loadJobApplicants() {
    console.log('Loading job applicants...');
    
    const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('submitted_at', { ascending: false });

    if (error) {
        console.error('Error loading applications:', error);
        return showToast('Error loading applications', 'error');
    }

    console.log('Loaded applications:', data);

    const tbody = document.querySelector('#applicants-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No applications yet</td></tr>';
        return;
    }

    data.forEach(app => {
        console.log('Application ID:', app.id, 'Type:', typeof app.id);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${app.applicant_name}</td>
            <td>${app.job_title}</td>
            <td>${app.applicant_email}</td>
            <td>${app.applicant_phone}</td>
            <td>${app.experience_years || app.experince_years || 'N/A'}</td>
            <td>${formatDate(app.submitted_at)}</td>
            <td>
                <button 
                    class="btn-primary view-btn" 
                    data-app-id="${app.id}" 
                    style="font-size: 0.8rem; padding: 0.25rem 0.5rem;"
                >
                    View
                </button>
                <button 
                    class="btn-secondary delete-btn" 
                    data-app-id="${app.id}" 
                    style="font-size: 0.8rem; padding: 0.25rem 0.5rem;"
                >
                    Delete
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Attach event listeners after DOM is updated
    setTimeout(() => {
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const appId = this.getAttribute('data-app-id');
                console.log('View clicked, ID:', appId, 'Type:', typeof appId);
                viewApplicantDetails(appId);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const appId = this.getAttribute('data-app-id');
                console.log('Delete clicked, ID:', appId, 'Type:', typeof appId);
                deleteApplicant(appId);
            });
        });
    }, 100);
}

// export async function viewApplicantDetails(appId) {
//     const { data: app, error } = await supabase
//         .from('applications')
//         .select('*')
//         .eq('id', appId)
//         .single();

//     if (error) return showToast('Error loading details', 'error');

//     // Populate modal
//     document.getElementById('app-detail-name').textContent = app.applicant_name;
//     document.getElementById('app-detail-job').textContent = app.job_title;
//     document.getElementById('app-detail-email').textContent = app.applicant_email;
//     document.getElementById('app-detail-phone').textContent = app.applicant_phone;
//     document.getElementById('app-detail-experience').textContent = app.experience_years || 'N/A';
//     document.getElementById('app-detail-education').textContent = app.education || 'N/A';
//     document.getElementById('app-detail-reason').textContent = app.reason || 'N/A';

//     // Links
//     const resumeLink = document.getElementById('app-detail-resume');
//     const linkedinLink = document.getElementById('app-detail-linkedin');
//     const githubLink = document.getElementById('app-detail-github');
//     const portfolioLink = document.getElementById('app-detail-portfolio');

//     if (app.resume_url) {
//         resumeLink.href = app.resume_url;
//         resumeLink.classList.remove('hidden');
//     } else {
//         resumeLink.classList.add('hidden');
//     }

//     if (app.linkedin_url) {
//         linkedinLink.href = app.linkedin_url;
//         linkedinLink.classList.remove('hidden');
//     } else {
//         linkedinLink.classList.add('hidden');
//     }

//     if (app.github_url) {
//         githubLink.href = app.github_url;
//         githubLink.classList.remove('hidden');
//     } else {
//         githubLink.classList.add('hidden');
//     }

//     if (app.portfolio) {
//         portfolioLink.href = app.portfolio;
//         portfolioLink.classList.remove('hidden');
//     } else {
//         portfolioLink.classList.add('hidden');
//     }

//     document.getElementById('applicant-detail-modal')?.classList.remove('hidden');
// }

export async function viewApplicantDetails(appId) {
    // Convert to integer
    const numericId = parseInt(appId, 10);
    
    if (isNaN(numericId)) {
        showToast('Invalid application ID', 'error');
        return;
    }

    const { data: app, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', numericId)
        .single();

    if (error) {
        console.error('Error loading details:', error);
        return showToast('Error loading details', 'error');
    }

    // Populate modal
    document.getElementById('app-detail-name').textContent = app.applicant_name;
    document.getElementById('app-detail-job').textContent = app.job_title;
    document.getElementById('app-detail-email').textContent = app.applicant_email;
    document.getElementById('app-detail-phone').textContent = app.applicant_phone;
    document.getElementById('app-detail-experience').textContent = app.experience_years || app.experince_years || 'N/A';
    document.getElementById('app-detail-education').textContent = app.education || 'N/A';
    document.getElementById('app-detail-reason').textContent = app.reason || 'N/A';

    // Links
    const resumeLink = document.getElementById('app-detail-resume');
    const linkedinLink = document.getElementById('app-detail-linkedin');
    const githubLink = document.getElementById('app-detail-github');
    const portfolioLink = document.getElementById('app-detail-portfolio');

    if (app.resume_url) {
        resumeLink.href = app.resume_url;
        resumeLink.classList.remove('hidden');
    } else {
        resumeLink.classList.add('hidden');
    }

    if (app.linkedin_url) {
        linkedinLink.href = app.linkedin_url;
        linkedinLink.classList.remove('hidden');
    } else {
        linkedinLink.classList.add('hidden');
    }

    if (app.github_url) {
        githubLink.href = app.github_url;
        githubLink.classList.remove('hidden');
    } else {
        githubLink.classList.add('hidden');
    }

    if (app.portfolio) {
        portfolioLink.href = app.portfolio;
        portfolioLink.classList.remove('hidden');
    } else {
        portfolioLink.classList.add('hidden');
    }

    document.getElementById('applicant-detail-modal')?.classList.remove('hidden');
}

// export async function deleteApplicant(id) {
//     if (!confirm('Are you sure you want to delete this application?')) return;

//     const { error } = await supabase.from('applications').delete().eq('id', id);
    
//     if (error) {
//         showToast(error.message, 'error');
//     } else {
//         showToast('Application deleted', 'success');
//         loadJobApplicants();
//     }
// }

export async function deleteApplicant(id) {
    // Convert string ID to integer
    const numericId = parseInt(id, 10);
    
    console.log('=== DELETE APPLICANT DEBUG ===');
    console.log('Received ID:', id, 'Type:', typeof id);
    console.log('Converted ID:', numericId, 'Type:', typeof numericId);
    
    if (isNaN(numericId)) {
        showToast('Invalid application ID', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this application?')) return;

    try {
        // First, verify the record exists
        const { data: checkData, error: checkError } = await supabase
            .from('applications')
            .select('id, applicant_name')
            .eq('id', numericId)
            .single();

        console.log('Check if exists:', { checkData, checkError });

        if (checkError || !checkData) {
            console.error('Record not found:', checkError);
            showToast('Application not found in database', 'error');
            return;
        }

        console.log('Found record:', checkData.applicant_name);

        // Now delete
        const { data: deleteData, error: deleteError } = await supabase
            .from('applications')
            .delete()
            .eq('id', numericId)
            .select();

        console.log('Delete result:', { deleteData, deleteError });

        if (deleteError) {
            console.error('Delete failed:', deleteError);
            showToast('Failed to delete: ' + deleteError.message, 'error');
            return;
        }

        showToast('Application deleted successfully', 'success');
        loadJobApplicants();
        
    } catch (err) {
        console.error('Unexpected error:', err);
        showToast('Unexpected error: ' + err.message, 'error');
    }
}

/* ==========================
   INITIALIZATION
========================== */
export function initAdminDashboard() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDashboardCore);
    } else {
        initDashboardCore();
    }
}

// function initDashboardCore() {
//     showSection('employees');
//     loadEmployees();
    
//     setTimeout(() => {
//         loadFaceModels();
//     }, 500);

//     // Mobile menu
//     const menuBtn = document.getElementById('mobile-menu-btn');
//     const sidebar = document.getElementById('sidebar');
//     const main = document.querySelector('.main-content');

//     if (menuBtn && sidebar) {
//         menuBtn.addEventListener('click', (e) => {
//             e.stopPropagation();
//             sidebar.classList.toggle('active');
//         });

//         main?.addEventListener('click', () => {
//             if (window.innerWidth <= 768) {
//                 sidebar.classList.remove('active');
//             }
//         });
//     }

//     // Close notifications on outside click
//     document.addEventListener('click', (e) => {
//         const dropdown = document.getElementById('notif-dropdown');
//         if (dropdown && !dropdown.classList.contains('hidden') && !e.target.closest('.notification-wrapper')) {
//             dropdown.classList.add('hidden');
//         }
//     });

//     // Expose functions to window
//     if (typeof window !== 'undefined') {
//         window.showSection = showSection;
//         window.toggleNotifications = toggleNotifications;
//         window.markAllRead = markAllRead;
//         window.openAddEmployeeModal = openAddEmployeeModal;
//         window.handleAddEmployee = handleAddEmployee;
//         window.openResetPassword = openResetPassword;
//         window.handleResetPassword = handleResetPassword;
//         window.deleteEmployee = deleteEmployee;
//         window.closeModal = closeModal;
//         window.logoutAdmin = logoutAdmin;
//         window.loadAttendance = loadAttendance;
//         window.openAssignTaskModal = openAssignTaskModal;
//         window.handleAssignTask = handleAssignTask;
//         window.reviewTask = reviewTask;
//         window.updateLeave = updateLeave;
//         window.viewApplicantDetails = viewApplicantDetails; 
//     window.deleteApplicant = deleteApplicant;
//     }
// }

function initDashboardCore() {
    // AUTH CHECK - must run first
    (async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = '/hrms-login';
            return;
        }

        const { data: adminCheck } = await supabase
            .from('admin_list')
            .select('user_id')
            .eq('user_id', user.id)
            .limit(1);

        if (!adminCheck || adminCheck.length === 0) {
            await supabase.auth.signOut();
            window.location.href = '/hrms-login';
            return;
        }

        // Auth passed - proceed with dashboard init
        showSection('employees');
        loadEmployees();
        
        setTimeout(() => {
            loadFaceModels();
        }, 500);

        // Mobile menu
        const menuBtn = document.getElementById('mobile-menu-btn');
        const sidebar = document.getElementById('sidebar');
        const main = document.querySelector('.main-content');

        if (menuBtn && sidebar) {
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                sidebar.classList.toggle('active');
            });

            main?.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('active');
                }
            });
        }

        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('notif-dropdown');
            if (dropdown && !dropdown.classList.contains('hidden') && !e.target.closest('.notification-wrapper')) {
                dropdown.classList.add('hidden');
            }
        });

        if (typeof window !== 'undefined') {
            window.showSection = showSection;
            window.toggleNotifications = toggleNotifications;
            window.markAllRead = markAllRead;
            window.openAddEmployeeModal = openAddEmployeeModal;
            window.handleAddEmployee = handleAddEmployee;
            window.openResetPassword = openResetPassword;
            window.handleResetPassword = handleResetPassword;
            window.deleteEmployee = deleteEmployee;
            window.closeModal = closeModal;
            window.logoutAdmin = logoutAdmin;
            window.loadAttendance = loadAttendance;
            window.openAssignTaskModal = openAssignTaskModal;
            window.handleAssignTask = handleAssignTask;
            window.reviewTask = reviewTask;
            window.updateLeave = updateLeave;
            window.viewApplicantDetails = viewApplicantDetails;
            window.deleteApplicant = deleteApplicant;
        }
    })();
}