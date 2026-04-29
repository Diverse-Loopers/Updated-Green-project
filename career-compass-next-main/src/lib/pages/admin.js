// lib/pages/admin.js

import { supabase } from '../supabase';

export function displayMessage(message, isError = true) {
  const messageArea = document.getElementById("message-area");
  if (messageArea) {
    messageArea.textContent = message;
    messageArea.style.display = "block";
    messageArea.classList.toggle("error", isError);
  }
}

export function toggleLoading(isLoading) {
  const loginButton = document.getElementById("login-btn");
  if (loginButton) {
    loginButton.disabled = isLoading;
    loginButton.textContent = isLoading ? "Verifying..." : "Log In";
  }
}

export function handleTogglePassword() {
  const passwordInput = document.getElementById("password");
  const eyeOpen = document.getElementById("eye-open");
  const eyeClosed = document.getElementById("eye-closed");
  
  if (passwordInput) {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    if (eyeOpen) eyeOpen.style.display = isPassword ? "none" : "block";
    if (eyeClosed) eyeClosed.style.display = isPassword ? "block" : "none";
  }
}

export async function handleAdminLogin(e) {
  e.preventDefault();
  
  const messageArea = document.getElementById("message-area");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  
  if (messageArea) messageArea.style.display = "none";
  toggleLoading(true);

  const email = emailInput?.value.trim();
  const password = passwordInput?.value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    displayMessage("Login failed: Invalid email or password.");
    toggleLoading(false);
    return;
  }

  const user = data.user;

  try {
    const { data: adminCheck, error: adminError } = await supabase
      .from("admin_list")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (adminError && adminError.code === "PGRST116") {
      await supabase.auth.signOut();
      displayMessage("Access denied: User is not an authorized administrator.");
    } else if (adminError) {
      displayMessage("Database error during verification.");
    } else if (adminCheck) {
      window.location.href = "/site.admin";
    } else {
      await supabase.auth.signOut();
      displayMessage("Authorization failed.");
    }
  } catch (err) {
    await supabase.auth.signOut();
    displayMessage("Critical error occurred.");
  } finally {
    toggleLoading(false);
  }
}

export function initAdminLoginListeners() {
  const loginForm = document.getElementById("admin-login-form");
  const togglePasswordBtn = document.getElementById("toggle-password");

  if (loginForm) {
    loginForm.addEventListener("submit", handleAdminLogin);
  }

  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener("click", handleTogglePassword);
  }
}