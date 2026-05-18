/**
 * SMTP Provider presets for LoopMail
 * When a user picks a provider, we auto-fill host/port/security
 */

export const SMTP_PROVIDERS = [
    {
        id: 'google',
        name: 'Gmail / Google Workspace',
        icon: '📧',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // STARTTLS
        description: 'Use an App Password (not your regular password). Enable 2FA first.',
        helpUrl: 'https://support.google.com/accounts/answer/185833',
        color: '#EA4335',
    },
    {
        id: 'outlook',
        name: 'Outlook / Office 365',
        icon: '📨',
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false, // STARTTLS
        description: 'Use your Outlook email and password. Enable SMTP in account settings.',
        helpUrl: 'https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings-8361e398-8af4-4e97-b147-6c6c4ac95353',
        color: '#0078D4',
    },
    {
        id: 'godaddy',
        name: 'GoDaddy',
        icon: '🌐',
        host: 'smtpout.secureserver.net',
        port: 465,
        secure: true,
        description: 'Use your GoDaddy workspace email credentials.',
        helpUrl: 'https://www.godaddy.com/help/server-and-port-settings-for-workspace-email-6949',
        color: '#1BDBDB',
    },
    {
        id: 'bigrock',
        name: 'BigRock',
        icon: '🪨',
        host: 'mail.bigrock.com',
        port: 465,
        secure: true,
        description: 'Use your BigRock email account credentials.',
        helpUrl: 'https://www.bigrock.in/email-hosting',
        color: '#FF6600',
    },
    {
        id: 'hostinger',
        name: 'Hostinger',
        icon: '🏠',
        host: 'smtp.hostinger.com',
        port: 465,
        secure: true,
        description: 'Use your Hostinger email credentials.',
        helpUrl: 'https://support.hostinger.com/en/articles/1583247',
        color: '#673DE6',
    },
    {
        id: 'titan',
        name: 'Titan Email',
        icon: '⚡',
        host: 'smtp.titan.email',
        port: 465,
        secure: true,
        description: 'Use your Titan email credentials. Common with Hostinger, BigRock, etc.',
        helpUrl: 'https://support.titan.email',
        color: '#4F46E5',
    },
    {
        id: 'zoho',
        name: 'Zoho Mail',
        icon: '📬',
        host: 'smtp.zoho.com',
        port: 465,
        secure: true,
        description: 'Use your Zoho email and password or App Password.',
        helpUrl: 'https://www.zoho.com/mail/help/smtp.html',
        color: '#C8202B',
    },
    {
        id: 'yahoo',
        name: 'Yahoo Mail',
        icon: '📪',
        host: 'smtp.mail.yahoo.com',
        port: 465,
        secure: true,
        description: 'Generate an App Password from Yahoo account security settings.',
        helpUrl: 'https://help.yahoo.com/kb/generate-manage-third-party-passwords-sln15241.html',
        color: '#6001D2',
    },
    {
        id: 'custom',
        name: 'Custom SMTP',
        icon: '⚙️',
        host: '',
        port: 465,
        secure: true,
        description: 'Enter your own SMTP server details manually.',
        helpUrl: null,
        color: '#64748B',
    },
];

/**
 * Get provider defaults by id
 */
export function getProviderDefaults(providerId) {
    return SMTP_PROVIDERS.find(p => p.id === providerId) || SMTP_PROVIDERS.find(p => p.id === 'custom');
}
