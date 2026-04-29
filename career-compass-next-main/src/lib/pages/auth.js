import { supabase } from '../supabase';

// State
let isModelsLoaded = false;
let stream = null;

// Tab Switching — supports employee, trainer, admin
export function switchTab(type) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.form-section').forEach(f => f.classList.add('hidden'));

    const tabs = document.querySelectorAll('.tab');
    if (type === 'employee') {
        if (tabs[0]) tabs[0].classList.add('active');
        const el = document.getElementById('employee-login');
        if (el) el.classList.remove('hidden');
    } else if (type === 'trainer') {
        if (tabs[1]) tabs[1].classList.add('active');
        const el = document.getElementById('trainer-login');
        if (el) el.classList.remove('hidden');
    } else {
        if (tabs[2]) tabs[2].classList.add('active');
        const el = document.getElementById('admin-login');
        if (el) el.classList.remove('hidden');
    }
}

// ==========================
// ADMIN LOGIN
// ==========================
export async function handleAdminLogin() {
    const email = document.getElementById('admin-email')?.value;
    const password = document.getElementById('admin-password')?.value;
    const adminError = document.getElementById('admin-error');

    if (adminError) adminError.textContent = '';

    if (!email || !password) {
        if (adminError) adminError.textContent = 'Please fill all fields';
        return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error("Supabase Auth Error:", error);
        alert("Login Failed: " + error.message + "\n\n(Tip: Ensure you created the user in the Supabase 'Authentication' tab, NOT just the table!)");
        if (adminError) adminError.textContent = error.message;
    } else {
        // Check if role is admin in employees table
        const { data: emp } = await supabase.from('employees').select('role').eq('email', email).single();

        if (emp && emp.role === 'admin') {
            window.location.href = '/admin-dashboard';
        } else {
            // If they are regular employee trying to login as admin
            await supabase.auth.signOut();
            if (adminError) adminError.textContent = 'Access Denied: Not an Admin Account';
        }
    }
}

// ==========================
// EMPLOYEE LOGIN (ID + PASSWORD)
// ==========================
export async function handleEmployeeLogin() {
    const empId = document.getElementById('emp-id')?.value.toUpperCase();
    const password = document.getElementById('emp-password')?.value;
    const empError = document.getElementById('emp-error');

    if (empError) empError.textContent = '';

    if (!empId || !password) {
        if (empError) empError.textContent = 'Please enter ID and Password';
        return;
    }

    // 1. Try Login with Magic Email (Standard for New Users)
    const magicEmail = `${empId}@hrms.local`.toLowerCase();

    let { data, error } = await supabase.auth.signInWithPassword({
        email: magicEmail,
        password: password
    });

    if (error) {
        console.log("Magic Email Login failed, checking for legacy contact email...");

        // 2. Fallback: Check for Legacy Contact Email
        // Fetch the registered email for this ID from the public table
        const { data: empData, error: dbError } = await supabase
            .from('employees')
            .select('email')
            .eq('employee_id', empId)
            .single();

        if (empData && empData.email && empData.email.toLowerCase() !== magicEmail) {
            console.log("Found legacy email:", empData.email);
            // Try Login with Contact Email
            const { data: legacyData, error: legacyError } = await supabase.auth.signInWithPassword({
                email: empData.email,
                password: password
            });

            if (!legacyError) {
                error = null; // Clear error if legacy login works
                data = legacyData;
            } else {
                console.error("Legacy login also failed:", legacyError);
            }
        }
    }

    if (error) {
        console.error(error);
        if (empError) empError.textContent = 'Login Failed: Invalid Credentials';
    } else {
        // Check if they are actually an employee (optional extra check)
        // Check if they are a trainer
        const { data: trainerCheck } = await supabase
            .from('trainers')
            .select('trainer_id')
            .eq('user_id', data.user?.id)
            .single();

        if (trainerCheck) {
            window.location.href = '/trainer-dashboard';
        } else {
            window.location.href = '/employee-dashboard';
        }
    }
}

// ==========================
// EMPLOYEE LOGIN START (Face ID - Legacy/Alternative)
// ==========================
export async function handleVerifyFace() {
    const empId = document.getElementById('emp-id')?.value.toUpperCase();
    const empError = document.getElementById('emp-error');

    if (empError) empError.textContent = '';

    if (!empId || empId.length !== 5) {
        if (empError) empError.textContent = 'Invalid Employee ID format';
        return;
    }

    // 1. Check if ID exists in DB
    const { data: emp, error } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', empId)
        .single();

    if (error || !emp) {
        if (empError) empError.textContent = 'Employee ID not found';
        return;
    }

    // 2. Open Camera Modal
    const cameraModal = document.getElementById('camera-modal');
    if (cameraModal) cameraModal.classList.remove('hidden');
    startCamera();
}

// ==========================
// FACE API & CAMERA
// ==========================
async function startCamera() {
    const video = document.getElementById('video');
    const statusMsg = document.getElementById('status-msg');
    const captureBtn = document.getElementById('capture-btn');

    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        if (video) video.srcObject = stream;

        if (statusMsg) statusMsg.textContent = 'Initializing Face Recognition...';

        // Load Models (Simulating Async Load)
        if (!isModelsLoaded) {
            // await faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models');
            // await faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models');
            // await faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models');
            // await faceapi.nets.ssdMobilenetv1.loadFromUri('/assets/models');
            isModelsLoaded = true;
        }

        if (statusMsg) statusMsg.textContent = 'Look at the camera...';
        if (captureBtn) captureBtn.disabled = false;

    } catch (err) {
        console.error(err);
        if (statusMsg) statusMsg.textContent = 'Camera Error: ' + err.message;
    }
}

export async function handleCaptureFace() {
    const empId = document.getElementById('emp-id')?.value.toUpperCase();
    const btn = document.getElementById('capture-btn');

    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Verifying...';
    }

    // ----------------------------------------------------------------
    // SIMULATION OF FACE MATCHING
    // In a real browser-only app without node, we would capture the canvas,
    // generate a descriptor, and match it against the JSON stored in 'facial_data' table.
    // ----------------------------------------------------------------

    // FETCH SAVED FACE DATA
    const { data: faceRecord } = await supabase
        .from('facial_data')
        .select('descriptor')
        .eq('employee_id', empId)
        .single();

    let isMatch = false;

    if (!faceRecord) {
        // First time login? Or no face data?
        // OPTION: Allow first login to SET the face data.
        const setFace = confirm("No face data found. Is this your first login? Click OK to register this face.");
        if (setFace) {
            // Mock saving face
            await supabase.from('facial_data').insert([{ employee_id: empId, descriptor: { mock: "data" } }]);
            isMatch = true;
        } else {
            isMatch = false;
        }
    } else {
        // Compare (Mock)
        // const distance = faceapi.euclideanDistance(faceRecord.descriptor, currentDescriptor);
        // isMatch = distance < 0.6;
        isMatch = true; // Simulating success for User Demo
    }

    if (isMatch) {
        // Perform Login via "Magic Email"
        const magicEmail = `${empId}@hrms.local`.toLowerCase();
        const magicPass = 'password123'; // Hardcoded for prototype as per plan

        const { data, error } = await supabase.auth.signInWithPassword({
            email: magicEmail,
            password: magicPass
        });

        if (error) {
            alert('Face Verified but Login Failed: ' + error.message);
        } else {
            window.location.href = '/employee-dashboard';
        }

    } else {
        alert('Face Verification Failed! Access Denied.');
    }

    if (btn) {
        btn.disabled = false;
        btn.textContent = 'Verify';
    }
}

export function handleCloseModal() {
    const cameraModal = document.getElementById('camera-modal');
    if (cameraModal) cameraModal.classList.add('hidden');
    
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
}

// ==========================
// TRAINER LOGIN
// ==========================
export async function handleTrainerLogin() {
    const trainerId = document.getElementById('trainer-id')?.value.toUpperCase();
    const password = document.getElementById('trainer-password')?.value;
    const trainerError = document.getElementById('trainer-error');

    if (trainerError) trainerError.textContent = '';

    if (!trainerId || !password) {
        if (trainerError) trainerError.textContent = 'Please enter Trainer ID and Password';
        return;
    }

    // Login with magic email
    const magicEmail = `${trainerId}@trainer.local`.toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
        email: magicEmail,
        password: password
    });

    if (error) {
        console.error('Trainer login error:', error);
        // Fallback: check trainers table for registered email
        const { data: trainerData } = await supabase
            .from('trainers')
            .select('email')
            .eq('trainer_id', trainerId)
            .single();

        if (trainerData?.email && trainerData.email.toLowerCase() !== magicEmail) {
            const { data: legacyData, error: legacyError } = await supabase.auth.signInWithPassword({
                email: trainerData.email,
                password: password
            });

            if (!legacyError) {
                window.location.href = '/trainer-dashboard';
                return;
            }
        }

        if (trainerError) trainerError.textContent = 'Login Failed: Invalid Credentials';
        return;
    }

    // Verify trainer exists
    const { data: trainerCheck } = await supabase
        .from('trainers')
        .select('*')
        .eq('trainer_id', trainerId)
        .single();

    if (!trainerCheck) {
        await supabase.auth.signOut();
        if (trainerError) trainerError.textContent = 'Access Denied: Not a registered trainer';
        return;
    }

    window.location.href = '/trainer-dashboard';
}

// Initialize Event Listeners
export function initAuthListeners() {
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const empLoginBtn = document.getElementById('emp-login-btn');
    const trainerLoginBtn = document.getElementById('trainer-login-btn');
    const verifyFaceBtn = document.getElementById('verify-face-btn');
    const captureBtn = document.getElementById('capture-btn');
    const closeModal = document.getElementById('close-modal');

    if (adminLoginBtn) adminLoginBtn.addEventListener('click', handleAdminLogin);
    if (empLoginBtn) empLoginBtn.addEventListener('click', handleEmployeeLogin);
    if (trainerLoginBtn) trainerLoginBtn.addEventListener('click', handleTrainerLogin);
    if (verifyFaceBtn) verifyFaceBtn.addEventListener('click', handleVerifyFace);
    if (captureBtn) captureBtn.addEventListener('click', handleCaptureFace);
    if (closeModal) closeModal.addEventListener('click', handleCloseModal);
}