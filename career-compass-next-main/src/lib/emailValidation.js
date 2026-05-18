// Blocked personal email domains — users must use organizational emails
const BLOCKED_DOMAINS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
  'icloud.com', 'aol.com', 'protonmail.com', 'live.com',
  'msn.com', 'ymail.com', 'rediffmail.com', 'mail.com',
  'zoho.com', 'inbox.com', 'gmx.com', 'me.com',
  'mac.com', 'fastmail.com', 'tutanota.com', 'proton.me',
  'yahoo.co.in', 'yahoo.in', 'outlook.in', 'googlemail.com',
  'rocketmail.com', 'yandex.com', 'mail.ru',
];

/**
 * Check if email domain is a personal/public provider
 * @param {string} email
 * @returns {{ valid: boolean, domain: string, error?: string }}
 */
export function validateOrgEmail(email) {
  if (!email || !email.includes('@')) {
    return { valid: false, domain: '', error: 'Invalid email address' };
  }
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) {
    return { valid: false, domain: '', error: 'Invalid email domain' };
  }
  if (BLOCKED_DOMAINS.includes(domain)) {
    return {
      valid: false,
      domain,
      error: `Personal emails (${domain}) are not accepted. Please use your official work email (e.g., you@company.com).`,
    };
  }
  return { valid: true, domain };
}

export { BLOCKED_DOMAINS };
