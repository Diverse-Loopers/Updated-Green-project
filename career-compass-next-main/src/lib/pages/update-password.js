import { supabase } from '../supabase';

// ==========================================
// UI HELPER FUNCTIONS
// ==========================================
export function showMessage(msg, isError = false) {
  const statusMsg = document.getElementById('status-msg');
  if (!statusMsg) return;
  
  statusMsg.textContent = msg;
  statusMsg.style.display = 'block';
  statusMsg.className = isError ? 'msg-error' : 'msg-success';
}

// ==========================================
// PASSWORD UPDATE FORM HANDLER
// ==========================================
export function initPasswordUpdateForm() {
  const form = document.getElementById('update-form');
  const submitBtn = document.getElementById('submit-btn');
  
  if (!form || !submitBtn) return;

  form.onsubmit = async (e) => {
    e.preventDefault();

    const password = document.getElementById('new-password')?.value;
    const confirm = document.getElementById('confirm-password')?.value;

    // 1. Client-side Validation
    if (password !== confirm) {
      showMessage('Passwords do not match.', true);
      return;
    }

    // 2. Disable UI
    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';

    try {
      // 3. Update Password in Supabase
      // Supabase handles the session automatically from the URL hash (#access_token=...)
      const { error } = await supabase.auth.updateUser({ password: password });

      if (error) {
        throw error;
      }

      showMessage('Success! Your password has been updated.');

      // 4. Redirect after success
      setTimeout(() => {
        window.location.href = '/login';
      }, 2500);

    } catch (err) {
      showMessage('Error: ' + err.message, true);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Update Password';
    }
  };
}

// ==========================================
// SESSION VERIFICATION
// ==========================================
export async function verifyResetSession() {
  const submitBtn = document.getElementById('submit-btn');
  
  // Verification Check: Ensure user is actually in a reset session
  const { data } = await supabase.auth.getSession();
  
  if (!data.session) {
    // If there's no session, the user likely just typed this URL manually
    // without coming from the email link.
    showMessage('No valid reset session found. Please request a new link from the login page.', true);
    if (submitBtn) submitBtn.disabled = true;
  }
}

// ==========================================
// MAIN INITIALIZATION FUNCTION
// ==========================================
export function initPasswordUpdatePage() {
  initPasswordUpdateForm();
  verifyResetSession();
}