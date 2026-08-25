import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Fallback password if no custom password has been configured yet
const DEFAULT_HRMS_PASSWORD = process.env.HRMS_SECURITY_PASSWORD || 'DL@Secure2026';

// In-process memory fallback cache
if (!global.__hrms_security_store) {
  global.__hrms_security_store = null;
}

function hashAuthPassword(password) {
  return crypto.createHash('sha256').update(password.trim()).digest('hex');
}

/**
 * Retrieves the HRMS security record from DB (tries hrms_security_settings, then payment_settings, then memory).
 */
export async function getHRMSSecurityRecord() {
  try {
    // 1. Try dedicated table: hrms_security_settings
    const { data: dedicatedData, error: dedicatedErr } = await supabaseAdmin
      .from('hrms_security_settings')
      .select('*')
      .eq('id', 'global')
      .maybeSingle();

    if (!dedicatedErr && dedicatedData && dedicatedData.password_hash) {
      global.__hrms_security_store = {
        password_hash: dedicatedData.password_hash,
        updated_by: dedicatedData.updated_by || 'CEO',
        updated_at: dedicatedData.updated_at || new Date().toISOString(),
      };
      return dedicatedData;
    }

    // 2. Fallback to pre-existing table: payment_settings (stores as gateway_name: 'hrms_security_auth')
    const { data: fallbackData, error: fallbackErr } = await supabaseAdmin
      .from('payment_settings')
      .select('*')
      .eq('gateway_name', 'hrms_security_auth')
      .maybeSingle();

    if (!fallbackErr && fallbackData && fallbackData.api_key) {
      const record = {
        id: 'global',
        password_hash: fallbackData.api_key,
        updated_by: fallbackData.api_secret || 'CEO',
        updated_at: fallbackData.created_at || new Date().toISOString(),
      };
      global.__hrms_security_store = record;
      return record;
    }

    // 3. Fallback to in-process memory cache
    if (global.__hrms_security_store) {
      return global.__hrms_security_store;
    }

    return null;
  } catch (err) {
    console.warn('getHRMSSecurityRecord fallback notice:', err.message);
    return global.__hrms_security_store || null;
  }
}

/**
 * Verifies if the provided password matches the active HRMS Security Password.
 * @param {string} inputPassword
 * @returns {Promise<{ valid: boolean, error?: string }>}
 */
export async function verifyHRMSSecurityPassword(inputPassword) {
  if (!inputPassword || typeof inputPassword !== 'string' || !inputPassword.trim()) {
    return { valid: false, error: 'HRMS Security Authorization Password is required.' };
  }

  const trimmed = inputPassword.trim();
  const inputHash = hashAuthPassword(trimmed);

  const record = await getHRMSSecurityRecord();

  if (record && record.password_hash) {
    if (record.password_hash === inputHash || record.password_hash === trimmed) {
      return { valid: true };
    }
    return { valid: false, error: 'Incorrect HRMS Security Password. Action blocked.' };
  }

  // If no custom password has been saved, check against default password
  if (trimmed === DEFAULT_HRMS_PASSWORD || inputHash === hashAuthPassword(DEFAULT_HRMS_PASSWORD)) {
    return { valid: true };
  }

  return { valid: false, error: 'Incorrect HRMS Security Password. Action blocked.' };
}

/**
 * Updates the HRMS Security Password (CEO action).
 * Tries hrms_security_settings, then falls back to payment_settings and memory store.
 * @param {string} newPassword
 * @param {string} updatedBy (e.g. CEO email/name)
 * @returns {Promise<{ success: boolean, error?: string, updated_at?: string }>}
 */
export async function updateHRMSSecurityPassword(newPassword, updatedBy = 'CEO') {
  if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 4) {
    return { success: false, error: 'Password must be at least 4 characters long.' };
  }

  const trimmed = newPassword.trim();
  const passwordHash = hashAuthPassword(trimmed);
  const now = new Date().toISOString();

  // Save to in-memory store immediately
  global.__hrms_security_store = {
    id: 'global',
    password_hash: passwordHash,
    updated_by: updatedBy,
    updated_at: now,
  };

  // Tier 1: Try dedicated table `hrms_security_settings`
  try {
    const { error: dedicatedErr } = await supabaseAdmin
      .from('hrms_security_settings')
      .upsert({
        id: 'global',
        password_hash: passwordHash,
        updated_by: updatedBy,
        updated_at: now,
      });

    if (!dedicatedErr) {
      return { success: true, updated_at: now };
    }
    console.warn('hrms_security_settings upsert notice:', dedicatedErr.message);
  } catch (e) {
    console.warn('hrms_security_settings catch:', e.message);
  }

  // Tier 2: Fallback to existing `payment_settings` table
  try {
    const { data: existing } = await supabaseAdmin
      .from('payment_settings')
      .select('id')
      .eq('gateway_name', 'hrms_security_auth')
      .maybeSingle();

    if (existing) {
      await supabaseAdmin
        .from('payment_settings')
        .update({
          api_key: passwordHash,
          api_secret: updatedBy,
          is_active: true,
        })
        .eq('id', existing.id);
    } else {
      await supabaseAdmin
        .from('payment_settings')
        .insert({
          gateway_name: 'hrms_security_auth',
          api_key: passwordHash,
          api_secret: updatedBy,
          is_active: true,
        });
    }

    return { success: true, updated_at: now };
  } catch (err) {
    console.warn('payment_settings fallback storage notice:', err.message);
  }

  // Tier 3: If in-memory was updated successfully
  if (global.__hrms_security_store) {
    return { success: true, updated_at: now };
  }

  return { success: false, error: 'Failed to persist security password.' };
}

/**
 * Returns public metadata about the security password for the CEO Dashboard.
 */
export async function getHRMSSecurityMeta() {
  const record = await getHRMSSecurityRecord();
  return {
    is_customized: !!(record && record.password_hash),
    updated_by: record?.updated_by || 'Default (System)',
    updated_at: record?.updated_at || null,
  };
}
