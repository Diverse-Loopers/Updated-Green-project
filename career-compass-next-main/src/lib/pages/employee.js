import { supabase } from '../supabase';
import { formatDate, showToast } from './utils';

let currentUser = null;
let profile = null;

export async function initEmployeeDashboard() {
    // Check Session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
        window.location.href = '/hrms-login';
        return;
    }

    const magicEmail = session.user.email;
    const derivedEmpId = magicEmail.split('@')[0].toUpperCase();

    const { data: empData, error: dbError } = await supabase
        .from('employees')
        .select('*')
        .or(`email.eq.${session.user.email},employee_id.eq.${derivedEmpId}`)
        .maybeSingle();

    if (dbError || !empData) {
        console.error("Fetch Error:", dbError);
        alert(`Employee profile not found.\nSession Email: ${session.user.email}\nDerived ID: ${derivedEmpId}`);
        await supabase.auth.signOut();
        window.location.href = '/';
        return;
    }

    profile = empData;
    currentUser = session.user;

    const welcomeName = document.getElementById('welcome-name');
    const sidebarName = document.getElementById('sidebar-user-name');
    const sidebarId = document.getElementById('sidebar-user-id');

    if (welcomeName) welcomeName.textContent = profile.full_name;
    if (sidebarName) sidebarName.textContent = profile.full_name;
    if (sidebarId) sidebarId.textContent = profile.employee_id;

    setUserInitials();

    showSection('dashboard');
    fetchNotifications();
    setInterval(fetchNotifications, 30000);

    const menuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');

    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('active');
        });

        document.querySelector('.main-content')?.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        });
    }

    const notifBtn = document.getElementById('notif-btn');
    if (notifBtn) {
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleNotifications();
        });
    }

    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('notif-dropdown');
        if (dropdown && !dropdown.classList.contains('hidden') && !e.target.closest('.notification-wrapper')) {
            dropdown.classList.add('hidden');
        }
    });

    const captureBtn = document.getElementById('capture-btn');
    if (captureBtn) {
        captureBtn.addEventListener('click', verifyAndMarkAttendance);
    }

    loadFaceModels();

    if (typeof window !== 'undefined') {
        window.showSection = showSection;
        window.toggleNotifications = toggleNotifications;
        window.markAllRead = markAllRead;
        window.markAttendance = markAttendance;
        window.openSubmitTask = openSubmitTask;
        window.handleSubmitTask = handleSubmitTask;
        window.openLeaveModal = openLeaveModal;
        window.handleApplyLeave = handleApplyLeave;
        window.closeModal = closeModal;
        window.logoutUser = logoutUser;
    }
}

function setUserInitials() {
    const initialsEl = document.getElementById('user-initials');
    if (initialsEl && profile && profile.full_name) {
        const names = profile.full_name.split(' ');
        const initials = names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
        initialsEl.textContent = initials;
    }
}

async function loadFaceModels() {
    const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
    try {
        if (typeof window.faceapi === 'undefined') {
            console.warn('FaceAPI not loaded yet');
            return;
        }
        await window.faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await window.faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        console.log("FaceAPI Models Loaded");
    } catch (e) {
        console.error("Model Load Error", e);
    }
}

async function fetchNotifications() {
    const list = document.getElementById('notif-list');
    const badge = document.getElementById('notif-count');

    if (!list || !badge) return;

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_role', 'employee')
        .eq('recipient_id', profile.employee_id)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

    if (error) return console.error(error);

    if (data.length > 0) {
        badge.textContent = data.length;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }

    if (data.length === 0) {
        list.innerHTML = '<li style="padding:10px; color:#666;">No new notifications</li>';
        return;
    }

    list.innerHTML = '';
    data.forEach(n => {
        const li = document.createElement('li');
        li.textContent = n.message;
        li.className = 'unread';
        list.appendChild(li);
    });
}

function toggleNotifications() {
    document.getElementById('notif-dropdown')?.classList.toggle('hidden');
}

async function markAllRead() {
    await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', profile.employee_id);

    fetchNotifications();
}

export function showSection(sectionId) {
    document.querySelectorAll('.nav-links button').forEach(btn => btn.classList.remove('active'));

    ['dashboard', 'tasks', 'leaves'].forEach(id => {
        document.getElementById(`${id}-section`)?.classList.add('hidden');
    });
    document.getElementById(`${sectionId}-section`)?.classList.remove('hidden');
    const buttons = document.querySelectorAll('.nav-links button');
    const sectionIndex = { 'dashboard': 0, 'tasks': 1, 'leaves': 2 };
    if (buttons[sectionIndex[sectionId]]) {
        buttons[sectionIndex[sectionId]].classList.add('active');
    }

       if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('active');
        }
    }

    if (sectionId === 'dashboard') loadDashboardStats();
    if (sectionId === 'tasks') loadMyTasks();
    if (sectionId === 'leaves') loadMyLeaves();
}


async function loadDashboardStats() {
    const { data: attData } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', profile.employee_id)
        .order('date', { ascending: false })
        .limit(5);

    const attBody = document.querySelector('#recent-attendance-table tbody');
    if (attBody) attBody.innerHTML = '';

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const presentToday = attData?.find(a => a.date === todayStr);

    const statusEl = document.getElementById('attendance-status');
    const markBtn = document.getElementById('mark-attendance-btn');

    if (presentToday) {
        if (statusEl) statusEl.textContent = `Checked in at ${presentToday.check_in_time}`;
        if (markBtn) {
            markBtn.disabled = true;
            markBtn.innerHTML = 'Present';
            markBtn.classList.replace('btn-primary', 'btn-secondary');
        }
    } else {
        if (markBtn) markBtn.disabled = false;
    }

    if (attData && attBody) {
        attData.forEach(r => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatDate(r.date)}</td>
                <td>${r.check_in_time}</td>
                <td>${r.status}</td>
                <td>${r.face_verified ? 'Verified' : 'Manual'}</td>
            `;
            attBody.appendChild(tr);
        });
    }

    const { count: taskCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('employee_id', profile.employee_id)
        .eq('status', 'Pending');

    const taskEl = document.getElementById('stat-pending-tasks');
    if (taskEl) taskEl.textContent = taskCount || 0;

    const { count: leaveCount } = await supabase
        .from('leaves')
        .select('*', { count: 'exact', head: true })
        .eq('employee_id', profile.employee_id)
        .eq('status', 'Approved');

    const leaveEl = document.getElementById('stat-leaves');
    if (leaveEl) leaveEl.textContent = leaveCount || 0;

    const todayDate = new Date();
    const startOfMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
    const startOfMonthStr = `${startOfMonth.getFullYear()}-${String(startOfMonth.getMonth() + 1).padStart(2, '0')}-${String(startOfMonth.getDate()).padStart(2, '0')}`;

    const { count: presentCount } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('employee_id', profile.employee_id)
        .gte('date', startOfMonthStr)
        .eq('status', 'Present');

    const today = todayDate.getDate();
    const percentage = today > 0 ? Math.round((presentCount / today) * 100) : 0;
    const attEl = document.getElementById('stat-attendance');
    if (attEl) attEl.textContent = `${percentage}%`;
}

export function markAttendance() {
    const modal = document.getElementById('camera-modal');
    if (modal) {
        modal.classList.remove('hidden');
        startCamera();
    }
}

async function startCamera() {
    const video = document.getElementById('video');
    const captureBtn = document.getElementById('capture-btn');
    const statusMsg = document.getElementById('status-msg');

    if (!video || !captureBtn || !statusMsg) return;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        video.srcObject = stream;
        statusMsg.textContent = "Camera started. Please align your face.";
        captureBtn.disabled = false;
    } catch (err) {
        console.error(err);
        statusMsg.textContent = "Camera access denied or error.";
    }
}

function stopCamera() {
    const video = document.getElementById('video');
    if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
}

async function verifyAndMarkAttendance() {
    const video = document.getElementById('video');
    const statusMsg = document.getElementById('status-msg');

    if (!video || !statusMsg) return;

    statusMsg.textContent = "Analyzing face... Hold still.";

    try {
        const detection = await window.faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor();

        if (!detection) {
            statusMsg.textContent = "No face detected. Please try again.";
            return;
        }

        const { data: facialData, error } = await supabase
            .from('facial_data')
            .select('descriptor')
            .eq('employee_id', profile.employee_id)
            .single();

        if (error || !facialData) {
            statusMsg.textContent = "No registered face data found. Contact HR.";
            return;
        }

        const storedDescriptor = new Float32Array(facialData.descriptor);
        const distance = window.faceapi.euclideanDistance(detection.descriptor, storedDescriptor);

        console.log("Face Distance:", distance);

        if (distance < 0.6) {
            statusMsg.textContent = "Verified! Marking attendance...";
            await completeAttendanceMarking();
            closeModal('camera-modal');
        } else {
            statusMsg.textContent = "❌ Face mismatch! Authentication failed.";
        }
    } catch (err) {
        console.error(err);
        statusMsg.textContent = "Error during verification: " + err.message;
    }
}

async function completeAttendanceMarking() {
    const now = new Date();
    const localDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const { error } = await supabase.from('attendance').insert([{
        employee_id: profile.employee_id,
        date: localDateStr,
        check_in_time: now.toLocaleTimeString(),
        face_verified: true,
        status: 'Present'
    }]);

    if (error) {
        showToast(error.message, 'error');
    } else {
        await supabase.from('notifications').insert([{
            recipient_role: 'admin',
            recipient_id: null,
            type: 'attendance',
            message: `${profile.full_name} has marked attendance.`
        }]);

        showToast('Attendance Marked Successfully!', 'success');
        loadDashboardStats();
    }
}

async function loadMyTasks() {
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('employee_id', profile.employee_id)
        .order('assigned_at', { ascending: false });

    const tbody = document.querySelector('#my-tasks-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (data) {
        data.forEach(task => {
            const action = task.status === 'Pending' || task.status === 'Rejected'
                ? `<button class="btn-primary" style="font-size:0.8rem; padding: 0.25rem 0.5rem;" onclick="window.openSubmitTask('${task.id}')">Submit</button>`
                : '-';

                // Priority badge
        const priorityClass = task.priority ? task.priority.toLowerCase() : 'medium';
        const priorityBadge = `<span class="priority-badge priority-${priorityClass}">${task.priority || 'Medium'}</span>`;




            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${task.title}</td>
                <td style="max-width: 200px; white-space: normal;">${task.description || '-'}</td>
                <td>${formatDate(task.assigned_at)}</td>
                <td>${formatDate(task.deadline)}</td>
               
                <td>${priorityBadge}</td>
                <td><span class="status-badge status-${task.status.toLowerCase()}">${task.status}</span></td>
                <td>${action}</td>
            `;
            tbody.appendChild(tr);
        });
    }
}

export function openSubmitTask(id) {
    const taskIdEl = document.getElementById('submit-task-id');
    const modal = document.getElementById('submit-task-modal');

    if (taskIdEl) taskIdEl.value = id;
    if (modal) modal.classList.remove('hidden');
}

export async function handleSubmitTask(e) {
    e.preventDefault();
    const id = document.getElementById('submit-task-id')?.value;
    const notes = document.getElementById('submission-link')?.value;

    const { error } = await supabase.from('tasks').update({
        status: 'Submitted',
        submission_link: notes,
        submitted_at: new Date().toISOString()
    }).eq('id', id);

    if (error) {
        showToast(error.message, 'error');
    } else {
        await supabase.from('notifications').insert([{
            recipient_role: 'admin',
            recipient_id: null,
            type: 'submission',
            message: `${profile.full_name} submitted task (ID: ${id})`
        }]);

        showToast('Task Submitted!', 'success');
        closeModal('submit-task-modal');
        loadMyTasks();
    }
}

async function loadMyLeaves() {
    const { data, error } = await supabase
        .from('leaves')
        .select('*')
        .eq('employee_id', profile.employee_id)
        .order('created_at', { ascending: false });

    const tbody = document.querySelector('#my-leaves-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (data) {
        data.forEach(leave => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatDate(leave.start_date)}</td>
                <td>${formatDate(leave.end_date)}</td>
                <td>${leave.reason}</td>
                <td><span class="status-badge status-${leave.status.toLowerCase()}">${leave.status}</span></td>
                <td>${leave.admin_remarks || '-'}</td>
            `;
            tbody.appendChild(tr);
        });
    }
}

export function openLeaveModal() {
    document.getElementById('apply-leave-modal')?.classList.remove('hidden');
}

export async function handleApplyLeave(e) {
    e.preventDefault();
    const start = document.getElementById('leave-start')?.value;
    const end = document.getElementById('leave-end')?.value;
    const reason = document.getElementById('leave-reason')?.value;

    const { error } = await supabase.from('leaves').insert([{
        employee_id: profile.employee_id,
        start_date: start,
        end_date: end,
        reason: reason,
        status: 'Pending'
    }]);

    if (error) {
        showToast(error.message, 'error');
    } else {
        await supabase.from('notifications').insert([{
            recipient_role: 'admin',
            recipient_id: null,
            type: 'leave_application',
            message: `${profile.full_name} applied for leave (${start} to ${end})`
        }]);

        showToast('Leave Application Sent!', 'success');
        closeModal('apply-leave-modal');
        loadMyLeaves();
    }
}

export function logoutUser() {
    supabase.auth.signOut().then(() => window.location.href = '/');
}

export function closeModal(id) {
    document.getElementById(id)?.classList.add('hidden');
    if (id === 'camera-modal') {
        stopCamera();
    }
}