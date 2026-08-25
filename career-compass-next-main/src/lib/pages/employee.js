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

    // 48-hour login block for ended employees
    if (profile.is_active === false && profile.employment_ended_at) {
        const endedAt = new Date(profile.employment_ended_at);
        const hoursSinceEnd = (Date.now() - endedAt.getTime()) / (1000 * 60 * 60);
        if (hoursSinceEnd >= 48) {
            alert('Your employment has ended. Portal access has been revoked.');
            await supabase.auth.signOut();
            window.location.href = '/';
            return;
        }
    }

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
        window.openSignModal = openSignModal;
        window.handleSignDocument = handleSignDocument;
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

    ['dashboard', 'tasks', 'leaves', 'documents', 'ratings', 'emp-announcements', 'placement-students'].forEach(id => {
        document.getElementById(`${id}-section`)?.classList.add('hidden');
    });
    document.getElementById(`${sectionId}-section`)?.classList.remove('hidden');
    const buttons = document.querySelectorAll('.nav-links button');
    const sectionIndex = { 'dashboard': 0, 'tasks': 1, 'leaves': 2, 'documents': 3, 'ratings': 4, 'emp-announcements': 5, 'placement-students': 6 };
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
    if (sectionId === 'documents') loadMyDocuments();
    if (sectionId === 'ratings') loadMyRatings();
    if (sectionId === 'emp-announcements') loadMyAnnouncements();
    if (sectionId === 'placement-students') loadMyPlacementStudents();
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

/* ==========================
   MY DOCUMENTS
========================== */
const DOC_TYPE_LABELS = { aadhaar: 'Aadhaar Card', pan: 'PAN Card', qualification: 'Highest Qualification', bank_details: 'Bank Details' };

async function loadMyDocuments() {
    const grid = document.getElementById('my-documents-grid');
    if (!grid || !profile) return;
    grid.innerHTML = '<p style="color:#94a3b8;text-align:center;grid-column:1/-1">Loading...</p>';

    try {
        const res = await fetch('/api/employees/issue-document?employee_id=' + profile.employee_id);
        const data = await res.json();
        const docs = data.success ? data.documents : [];

        if (docs.length === 0) {
            grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;padding:3rem"><div style="font-size:3rem;margin-bottom:1rem">📄</div><p style="color:#94a3b8;font-size:1rem">No documents issued yet</p></div>';
            return;
        }

        grid.innerHTML = docs.map(doc => {
            const isImage = doc.file_url && /\.(png|jpg|jpeg|gif|webp)$/i.test(doc.file_url);
            const isPdf = doc.file_url && /\.pdf$/i.test(doc.file_url);
            const isHtml = doc.doc_type === 'template' || (doc.file_url && /\.html$/i.test(doc.file_url));

            let preview = '';
            if (isImage) {
                preview = '<img src="' + doc.file_url + '" style="width:100%;height:150px;object-fit:cover;border-radius:8px 8px 0 0;" />';
            } else if (isHtml) {
                preview = '<div style="width:100%;height:150px;border-radius:8px 8px 0 0;overflow:hidden;position:relative;background:#fff;border-bottom:1px solid #e2e8f0">' +
                    '<iframe src="/view-document/' + doc.id + '" style="width:400%;height:600px;border:none;transform:scale(0.25);transform-origin:top left;pointer-events:none"></iframe>' +
                '</div>';
            } else if (isPdf) {
                preview = '<div style="height:150px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(135deg,#fef2f2,#fff1f2);border-radius:8px 8px 0 0">' +
                    '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><path d="M9 15h6M9 11h6"/></svg>' +
                    '<span style="font-size:11px;font-weight:700;color:#dc2626;margin-top:6px">PDF</span></div>';
            } else {
                preview = '<div style="height:150px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(135deg,#f0f9ff,#ede9fe);border-radius:8px 8px 0 0">' +
                    '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><path d="M9 15h6M9 11h6"/></svg>' +
                    '<span style="font-size:11px;font-weight:700;color:#6C5CE7;margin-top:6px">Document</span></div>';
            }

            let signSection = '';
            if (doc.requires_signature && !doc.is_signed) {
                signSection = '<button onclick="window.openSignModal(\'' + doc.id + '\', \'' + (doc.title || '').replace(/'/g, "\\'") + '\')" style="width:100%;padding:8px;border-radius:8px;border:1px solid #f59e0b;background:#fffbeb;color:#d97706;cursor:pointer;font-weight:600;font-size:12px;margin-top:8px">⚠️ Upload Signed Copy</button>';
            } else if (doc.requires_signature && doc.is_signed) {
                signSection = '<div style="display:flex;align-items:center;gap:6px;margin-top:8px"><span style="color:#16a34a;font-weight:600;font-size:12px">✅ Signed</span>' +
                    (doc.signed_file_url ? '<a href="' + doc.signed_file_url + '" target="_blank" style="color:#6C5CE7;font-size:11px;text-decoration:none;font-weight:600">View Signed ↗</a>' : '') + '</div>';
            }

            const verifyBadge = doc.has_qr && doc.verification_code
                ? '<div style="display:flex;align-items:center;gap:4px;margin-top:4px"><span style="background:#d1fae5;color:#059669;padding:2px 8px;border-radius:5px;font-size:10px;font-weight:700">✓ QR Verified</span></div>'
                : '';

            const viewUrl = isHtml ? '/view-document/' + doc.id : doc.file_url;

            return '<div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;position:relative;background:#fff">' +
                preview +
                '<div style="padding:1rem">' +
                '<div style="font-weight:700;font-size:0.9rem;color:#1e293b;margin-bottom:4px">' + (doc.title || 'Document') + '</div>' +
                '<div style="font-size:0.75rem;color:#94a3b8">Issued: ' + new Date(doc.issued_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + '</div>' +
                verifyBadge +
                '<div style="margin-top:10px;display:flex;gap:6px">' +
                    '<a href="' + viewUrl + '" target="_blank" style="padding:6px 14px;border-radius:7px;background:#ede9fe;color:#6C5CE7;font-size:12px;font-weight:600;text-decoration:none">View ↗</a>' +
                    '<a href="' + doc.file_url + '" download style="padding:6px 14px;border-radius:7px;background:#dbeafe;color:#2563eb;font-size:12px;font-weight:600;text-decoration:none">Download</a>' +
                '</div>' +
                signSection +
                '</div>' +
            '</div>';
        }).join('');
    } catch (err) {
        grid.innerHTML = '<p style="color:#dc2626;text-align:center;grid-column:1/-1">Error loading documents</p>';
    }
}

function openSignModal(docId, docTitle) {
    document.getElementById('sign-doc-id').value = docId;
    document.getElementById('sign-doc-title').textContent = 'Document: ' + docTitle;
    const fileInput = document.getElementById('sign-doc-file');
    if (fileInput) fileInput.value = '';
    document.getElementById('sign-doc-modal')?.classList.remove('hidden');
}

async function handleSignDocument() {
    const docId = document.getElementById('sign-doc-id')?.value;
    const file = document.getElementById('sign-doc-file')?.files[0];

    if (!docId || !file) return alert('Please select a file to upload');

    try {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('document_id', docId);
        fd.append('employee_id', profile.employee_id);

        const res = await fetch('/api/employees/sign-document', { method: 'POST', body: fd });
        const result = await res.json();

        if (!result.success) {
            alert('Error: ' + result.error);
            return;
        }

        alert('Signed document uploaded successfully!');
        closeModal('sign-doc-modal');
        loadMyDocuments();
    } catch (err) {
        alert('Error uploading signed document: ' + err.message);
    }
}

/* ==========================
   MY RATINGS
========================== */
async function loadMyRatings() {
    const container = document.getElementById('my-ratings-list');
    if (!container || !profile) return;
    container.innerHTML = '<p style="text-align:center;color:#94a3b8">Loading ratings...</p>';

    // Load manager info
    try {
        const { data: assignment } = await supabase
            .from('employee_managers')
            .select('manager_id')
            .eq('employee_id', profile.employee_id)
            .maybeSingle();
        
        if (assignment?.manager_id) {
            const { data: mgr } = await supabase
                .from('managers')
                .select('name, designation')
                .eq('id', assignment.manager_id)
                .maybeSingle();
            if (mgr) {
                const infoDiv = document.getElementById('emp-manager-info');
                const nameEl = document.getElementById('emp-manager-name');
                const desigEl = document.getElementById('emp-manager-designation');
                if (infoDiv) infoDiv.style.display = 'block';
                if (nameEl) nameEl.textContent = mgr.name;
                if (desigEl) desigEl.textContent = mgr.designation || '';
            }
        }
    } catch (e) {}

    // Load ratings
    try {
        const { data: ratings } = await supabase
            .from('ratings')
            .select('*')
            .eq('employee_id', profile.employee_id)
            .order('month', { ascending: false });

        if (!ratings?.length) {
            container.innerHTML = '<p style="text-align:center;color:#94a3b8;padding:2rem">No ratings available yet.</p>';
            return;
        }

        container.innerHTML = ratings.map(r => {
            const color = r.rating >= 70 ? '#059669' : r.rating >= 40 ? '#d97706' : '#dc2626';
            const bg = r.rating >= 70 ? '#ecfdf5' : r.rating >= 40 ? '#fffbeb' : '#fef2f2';
            const monthLabel = new Date(r.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            return `
                <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:1rem 1.25rem;margin-bottom:0.75rem;display:flex;justify-content:space-between;align-items:center">
                    <div>
                        <div style="font-weight:700;font-size:0.9rem;color:#0f172a">${monthLabel}</div>
                        <div style="font-size:0.8rem;color:#94a3b8;margin-top:2px">Rated by: ${r.rated_by} (${r.rated_by_role})</div>
                        ${r.comments ? `<div style="font-size:0.8rem;color:#64748b;margin-top:4px;font-style:italic">"${r.comments}"</div>` : ''}
                    </div>
                    <div style="background:${bg};color:${color};padding:6px 16px;border-radius:100px;font-weight:800;font-size:1.1rem">
                        ${r.rating}<span style="font-size:0.7rem;font-weight:500">/100</span>
                    </div>
                </div>`;
        }).join('');
    } catch (e) {
        container.innerHTML = '<p style="color:#dc2626">Error loading ratings</p>';
    }
}

/* ==========================
   MY ANNOUNCEMENTS
========================== */
async function loadMyAnnouncements() {
    const container = document.getElementById('emp-announcements-list');
    if (!container || !profile) return;
    container.innerHTML = '<p style="text-align:center;color:#94a3b8">Loading announcements...</p>';

    try {
        // Fetch announcements relevant to this employee (team + org-wide)
        const res = await fetch(`/api/announcements?employee_id=${profile.employee_id}`, {
            headers: { 'x-admin-key': 'hrms-admin-access' }
        });
        const data = await res.json();

        if (!data.success || !data.announcements?.length) {
            container.innerHTML = '<p style="text-align:center;color:#94a3b8;padding:2rem">No announcements yet.</p>';
            return;
        }

        container.innerHTML = data.announcements.map(a => `
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:1.25rem;margin-bottom:0.75rem">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
                    <h4 style="margin:0;font-size:0.95rem;font-weight:700;color:#0f172a">${a.title}</h4>
                    <span style="font-size:0.7rem;color:#94a3b8">${new Date(a.created_at).toLocaleDateString('en-IN')}</span>
                </div>
                <p style="margin:0;font-size:0.85rem;color:#475569;line-height:1.6">${a.message}</p>
                <div style="margin-top:0.5rem;font-size:0.75rem;color:#94a3b8">
                    ${a.scope === 'all' ? '🌐 Organization' : '👥 Team'} · Posted by ${a.posted_by}
                </div>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = '<p style="color:#dc2626">Error loading announcements</p>';
    }
}

/* ==========================
   PLACEMENT STUDENTS & CHAT
========================== */
async function loadMyPlacementStudents() {
    const container = document.getElementById('my-placement-students-list');
    if (!container || !profile) return;
    container.innerHTML = '<p style="text-align:center;color:#94a3b8;padding:2rem">Loading assigned students...</p>';

    try {
        const { data: allStudents, error } = await supabase
            .from('placement_students')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Filter students where current employee is in marketing, hr, support, or manager list
        const myEmpId = profile.employee_id;
        const students = (allStudents || []).filter(s => {
            const mList = Array.isArray(s.marketing_person_ids) ? s.marketing_person_ids : (s.marketing_person_id ? [s.marketing_person_id] : []);
            const hList = Array.isArray(s.hr_person_ids) ? s.hr_person_ids : (s.hr_person_id ? [s.hr_person_id] : []);
            const sList = Array.isArray(s.support_person_ids) ? s.support_person_ids : (s.support_person_id ? [s.support_person_id] : []);
            const mgrList = Array.isArray(s.manager_person_ids) ? s.manager_person_ids : (s.manager_person_id ? [s.manager_person_id] : []);

            return mList.includes(myEmpId) || hList.includes(myEmpId) || sList.includes(myEmpId) || mgrList.includes(myEmpId);
        });

        if (students.length === 0) {
            container.innerHTML = `
                <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:2.5rem;text-align:center;">
                    <div style="font-size:2rem;margin-bottom:8px">👥</div>
                    <h3 style="font-size:1.05rem;color:#0f172a;margin:0 0 6px">No Placement Students Assigned</h3>
                    <p style="color:#64748b;font-size:0.85rem;margin:0">Outreach tracker sheets and daily application logging are active only for assigned Marketing and HR staff.</p>
                </div>`;
            return;
        }

        container.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:1.25rem;">
                ${students.map(s => {
                    const mList = Array.isArray(s.marketing_person_ids) ? s.marketing_person_ids : (s.marketing_person_id ? [s.marketing_person_id] : []);
                    const hList = Array.isArray(s.hr_person_ids) ? s.hr_person_ids : (s.hr_person_id ? [s.hr_person_id] : []);
                    const sList = Array.isArray(s.support_person_ids) ? s.support_person_ids : (s.support_person_id ? [s.support_person_id] : []);
                    const mgrList = Array.isArray(s.manager_person_ids) ? s.manager_person_ids : (s.manager_person_id ? [s.manager_person_id] : []);

                    const isMarketing = mList.includes(myEmpId);
                    const isHR = hList.includes(myEmpId);
                    const isSupport = sList.includes(myEmpId);
                    const isManager = mgrList.includes(myEmpId);

                    let roleBadge = 'Team Member';
                    if (isMarketing) roleBadge = '🎯 Marketing & Outreach Lead';
                    else if (isHR) roleBadge = '🤝 HR Representative';
                    else if (isSupport) roleBadge = '🛟 Placement Support';
                    else if (isManager) roleBadge = '👔 Program Manager';

                    return `
                    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:1.5rem;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 1px 3px rgba(0,0,0,0.02)">
                        <div>
                            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
                                <div>
                                    <h4 style="margin:0;font-size:1.05rem;font-weight:700;color:#0f172a">${s.full_name}</h4>
                                    <div style="font-size:0.75rem;font-family:monospace;color:#64748b;margin-top:2px">${s.student_id} · ${s.email}</div>
                                </div>
                                <span style="background:#ecfdf5;color:#059669;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700">${s.status || 'Active'}</span>
                            </div>

                            <div style="margin:10px 0;padding:8px 12px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;font-size:0.8rem;">
                                <div style="color:#475569;margin-bottom:3px"><strong>Target:</strong> ${s.target_roles || 'Software Developer'}</div>
                                <div style="color:#475569;margin-bottom:3px"><strong>Address:</strong> ${s.city ? `${s.city}, ` : ''}${s.country || 'India'}</div>
                                ${s.marketing_email ? `<div style="color:#475569"><strong>Outreach Email:</strong> ${s.marketing_email}</div>` : ''}
                            </div>

                            <div style="font-size:0.75rem;color:#6366f1;font-weight:700;margin-bottom:12px">
                                Your Assignment: ${roleBadge}
                            </div>

                            ${s.spreadsheet_url ? `
                                <div style="margin-bottom:12px">
                                    <a href="${s.spreadsheet_url}" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;justify-content:center;gap:6px;background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d;padding:8px 12px;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.8rem">
                                        📊 Open Google Spreadsheet Tracker ↗
                                    </a>
                                </div>
                            ` : `
                                <div style="font-size:0.75rem;color:#94a3b8;margin-bottom:12px;font-style:italic">
                                    No spreadsheet link attached by sales team.
                                </div>
                            `}
                        </div>

                        <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px">
                            ${isMarketing ? `
                                <button onclick="window.openEmpBatchLog('${s.id}', '${s.full_name}', '${s.target_roles || 'Software Engineer'}')" class="btn-primary" style="width:100%;font-size:0.82rem;padding:9px 12px;background:#10b981;border-color:#10b981">
                                    ⚡ Quick Log Today's Applications
                                </button>
                            ` : ''}

                            <button onclick="window.openEmpChatWithStudent('${s.id}', '${s.full_name}', '${roleBadge}')" class="btn-primary" style="width:100%;font-size:0.82rem;padding:9px 12px;background:#6C5CE7">
                                💬 Open Chat with Student
                            </button>
                        </div>
                    </div>`;
                }).join('')}
            </div>
        `;
    } catch (err) {
        console.error('Error loading placement students:', err);
        container.innerHTML = '<p style="color:#dc2626">Error loading placement students.</p>';
    }
}

async function openEmpBatchLog(studentId, studentName, targetRole) {
    const modal = document.getElementById('emp-batch-log-modal');
    if (!modal) return;

    document.getElementById('emp-batch-student-id').value = studentId;
    document.getElementById('emp-batch-student-title').textContent = `⚡ Log Applications: ${studentName}`;
    document.getElementById('emp-batch-role').value = targetRole || '';
    document.getElementById('emp-batch-easy-count').value = '0';
    document.getElementById('emp-batch-long-count').value = '0';
    document.getElementById('emp-batch-notes').value = '';
    document.getElementById('emp-batch-date').value = new Date().toISOString().split('T')[0];

    modal.classList.remove('hidden');
}

async function handleEmpSubmitBatchLog(e) {
    e.preventDefault();
    const studentId = document.getElementById('emp-batch-student-id')?.value;
    const date = document.getElementById('emp-batch-date')?.value || new Date().toISOString().split('T')[0];
    const easyCount = Number(document.getElementById('emp-batch-easy-count')?.value || 0);
    const longCount = Number(document.getElementById('emp-batch-long-count')?.value || 0);
    const role = document.getElementById('emp-batch-role')?.value || 'Software Engineer';
    const notes = document.getElementById('emp-batch-notes')?.value || '';

    if (!studentId) return;

    if (easyCount <= 0 && longCount <= 0) {
        alert('Please enter at least 1 Easy Apply or Long Form application.');
        return;
    }

    try {
        const res = await fetch('/api/placement-program/applications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'batch_counts',
                student_id: studentId,
                applied_date: date,
                easy_apply_count: easyCount,
                long_form_count: longCount,
                job_role: role,
                notes: notes,
                logged_by: profile ? `${profile.full_name} (${profile.employee_id})` : 'Marketing Executive'
            })
        });

        const data = await res.json();
        if (data.success) {
            showToast(`Logged ${easyCount} Easy Apply & ${longCount} Long Form applications!`, 'success');
            if (typeof window.closeModal === 'function') {
                window.closeModal('emp-batch-log-modal');
            }
        } else {
            showToast(data.error || 'Failed to log applications', 'error');
        }
    } catch (err) {
        showToast('Error saving applications: ' + err.message, 'error');
    }
}

async function openEmpChatWithStudent(studentId, studentName, myRole) {
    const modal = document.getElementById('emp-student-chat-modal');
    if (!modal) return;

    document.getElementById('emp-chat-student-id').value = studentId;
    document.getElementById('emp-chat-student-name').textContent = `💬 Chat with ${studentName}`;
    document.getElementById('emp-chat-student-role').textContent = `Assigned as ${myRole}`;
    document.getElementById('emp-chat-input').value = '';

    modal.classList.remove('hidden');
    loadEmpChatMessages(studentId);
}

async function loadEmpChatMessages(studentId) {
    const box = document.getElementById('emp-chat-messages-box');
    if (!box) return;

    try {
        const res = await fetch(`/api/placement-program/messages?student_id=${studentId}&employee_id=${profile.employee_id}`);
        const data = await res.json();
        const msgs = data.messages || [];

        if (msgs.length === 0) {
            box.innerHTML = '<p style="color:#94a3b8;text-align:center;margin:auto;font-size:0.85rem">No messages yet. Send a message to start conversation with the student.</p>';
            return;
        }

        box.innerHTML = msgs.map(m => {
            const isMe = m.sender_type === 'employee';
            const bg = isMe ? '#6C5CE7' : '#ffffff';
            const color = isMe ? '#ffffff' : '#1e293b';
            const align = isMe ? 'flex-end' : 'flex-start';
            const border = isMe ? 'none' : '1px solid #e2e8f0';

            return `
            <div style="align-self:${align};max-width:80%;background:${bg};color:${color};border:${border};padding:8px 12px;border-radius:10px;font-size:0.82rem;line-height:1.4">
                <div style="font-size:0.68rem;opacity:0.75;margin-bottom:2px">${isMe ? 'You' : m.sender_name}</div>
                <div>${m.message}</div>
            </div>`;
        }).join('');

        box.scrollTop = box.scrollHeight;
    } catch (err) {
        box.innerHTML = '<p style="color:#dc2626;text-align:center">Error loading messages</p>';
    }
}

async function handleEmpSendMsg(e) {
    e.preventDefault();
    const studentId = document.getElementById('emp-chat-student-id')?.value;
    const input = document.getElementById('emp-chat-input');
    const msg = input?.value?.trim();

    if (!studentId || !msg || !profile) return;

    try {
        const res = await fetch('/api/placement-program/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                student_id: studentId,
                sender_type: 'employee',
                sender_id: profile.employee_id,
                sender_name: profile.full_name,
                message: msg
            })
        });
        const data = await res.json();
        if (data.success) {
            if (input) input.value = '';
            loadEmpChatMessages(studentId);
        } else {
            showToast(data.error || 'Failed to send', 'error');
        }
    } catch (err) {
        showToast('Error sending message', 'error');
    }
}

if (typeof window !== 'undefined') {
    window.loadMyPlacementStudents = loadMyPlacementStudents;
    window.openEmpChatWithStudent = openEmpChatWithStudent;
    window.handleEmpSendMsg = handleEmpSendMsg;
    window.openEmpBatchLog = openEmpBatchLog;
    window.handleEmpSubmitBatchLog = handleEmpSubmitBatchLog;
}