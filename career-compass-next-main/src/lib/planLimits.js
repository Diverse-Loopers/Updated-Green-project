// Shared plan configuration — used by BOTH frontend components and backend APIs
// This is the single source of truth for all feature restrictions

export const PLAN_LIMITS = {
    basic: {
        label: 'Basic',
        price: 'Free',
        priceNum: 0,
        maxCampaigns: 5,
        maxContacts: 500,
        richEditor: false,
        attachments: false,
        imagesInBody: false,
        analytics: 'basic',       // basic = opens only
        scheduling: false,
        templates: 3,
        teamMembers: 1,
        apiAccess: false,
        customBranding: false,
        smtpIntegration: false,
        clickTracking: false,
        bounceTracking: false,
        spamScoreCheck: false,
        audienceSegmentation: false,
        automationWorkflows: false,
        dedicatedIp: false,
        prioritySupport: false,
        sla: false,
        dedicatedAccountManager: false,
        dragDropBuilder: false,
        aiSubjectSuggestions: false,
        sendingSpeed: 'standard',  // standard | high | priority
        security: 'standard',
        bestFor: 'Beginners',
    },
    premium: {
        label: 'Premium',
        price: '₹1,500 / month',
        priceNum: 1500,
        maxCampaigns: 25,
        maxContacts: 100000,
        richEditor: true,
        attachments: true,
        imagesInBody: true,
        analytics: 'advanced',
        scheduling: true,
        templates: -1,            // -1 = unlimited
        teamMembers: 5,
        apiAccess: false,
        customBranding: 'limited',
        smtpIntegration: 'basic',
        clickTracking: true,
        bounceTracking: true,
        spamScoreCheck: true,
        audienceSegmentation: true,
        automationWorkflows: 'limited',
        dedicatedIp: false,
        prioritySupport: 'email',
        sla: false,
        dedicatedAccountManager: false,
        dragDropBuilder: true,
        aiSubjectSuggestions: true,
        sendingSpeed: 'high',
        security: 'enhanced',
        bestFor: 'Growing Businesses',
    },
    enterprise: {
        label: 'Enterprise',
        price: 'Contact Sales',
        priceNum: -1,
        maxCampaigns: -1,
        maxContacts: -1,
        richEditor: true,
        attachments: true,
        imagesInBody: true,
        analytics: 'enterprise',
        scheduling: true,
        templates: -1,
        teamMembers: -1,
        apiAccess: true,
        customBranding: true,
        smtpIntegration: 'advanced',
        clickTracking: true,
        bounceTracking: true,
        spamScoreCheck: true,
        audienceSegmentation: true,
        automationWorkflows: true,
        dedicatedIp: true,
        prioritySupport: '24x7',
        sla: true,
        dedicatedAccountManager: true,
        dragDropBuilder: true,
        aiSubjectSuggestions: true,
        sendingSpeed: 'priority',
        security: 'enterprise',
        bestFor: 'Large Organizations',
    },
};

// Check if a feature is allowed for a given plan
export function isFeatureAllowed(plan, feature) {
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.basic;
    const val = limits[feature];
    return val === true || val === -1 || (typeof val === 'string' && val !== 'standard' && val !== 'basic');
}

// Check if usage is within limits (-1 means unlimited)
export function isWithinLimit(plan, limitKey, currentUsage) {
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.basic;
    const max = limits[limitKey];
    if (max === -1) return true; // unlimited
    return currentUsage < max;
}

// Get the plan limits object
export function getPlanLimits(plan) {
    return PLAN_LIMITS[plan] || PLAN_LIMITS.basic;
}

// Feature comparison rows for pricing table
export const PRICING_FEATURES = [
    { key: 'price', label: 'Pricing', basic: 'Free', premium: '₹1,500 / month', enterprise: 'Contact Sales' },
    { key: 'maxCampaigns', label: 'Monthly Campaigns', basic: '5 Campaigns', premium: '25 Campaigns', enterprise: 'Unlimited' },
    { key: 'maxContacts', label: 'Contact Limit', basic: '500 Contacts', premium: '1,00,000 Contacts', enterprise: 'Unlimited' },
    { key: 'sendingSpeed', label: 'Email Sending Speed', basic: 'Standard Queue', premium: 'High-Speed Delivery', enterprise: 'Priority Dedicated Delivery' },
    { key: 'dragDropBuilder', label: 'Drag & Drop Email Builder', basic: false, premium: true, enterprise: true },
    { key: 'richEditor', label: 'Rich Text Formatting', basic: false, premium: true, enterprise: true },
    { key: 'imagesInBody', label: 'Add Images in Email Body', basic: false, premium: true, enterprise: true },
    { key: 'attachments', label: 'File Attachments', basic: false, premium: true, enterprise: true },
    { key: 'templates', label: 'Custom Email Templates', basic: 'Limited', premium: 'Unlimited', enterprise: 'Unlimited' },
    { key: 'aiSubjectSuggestions', label: 'AI Subject Suggestions', basic: false, premium: true, enterprise: true },
    { key: 'analytics', label: 'Campaign Analytics', basic: 'Basic Opens Only', premium: 'Advanced Analytics', enterprise: 'Enterprise Analytics' },
    { key: 'clickTracking', label: 'Click Tracking', basic: false, premium: true, enterprise: true },
    { key: 'bounceTracking', label: 'Bounce Tracking', basic: false, premium: true, enterprise: true },
    { key: 'spamScoreCheck', label: 'Spam Score Check', basic: false, premium: true, enterprise: true },
    { key: 'audienceSegmentation', label: 'Audience Segmentation', basic: false, premium: true, enterprise: true },
    { key: 'scheduling', label: 'Schedule Campaigns', basic: false, premium: true, enterprise: true },
    { key: 'automationWorkflows', label: 'Automation Workflows', basic: false, premium: 'Limited Automation', enterprise: 'Full Automation' },
    { key: 'apiAccess', label: 'API Access', basic: false, premium: false, enterprise: true },
    { key: 'teamMembers', label: 'Team Members', basic: '1 User', premium: 'Up to 5 Users', enterprise: 'Unlimited' },
    { key: 'customBranding', label: 'Custom Branding', basic: false, premium: 'Limited', enterprise: 'Full White Label' },
    { key: 'dedicatedAccountManager', label: 'Dedicated Account Manager', basic: false, premium: false, enterprise: true },
    { key: 'prioritySupport', label: 'Priority Support', basic: false, premium: 'Email Support', enterprise: '24×7 Priority Support' },
    { key: 'dedicatedIp', label: 'Dedicated IP Option', basic: false, premium: false, enterprise: true },
    { key: 'smtpIntegration', label: 'SMTP Integration', basic: false, premium: 'Basic SMTP', enterprise: 'Advanced SMTP & Custom Setup' },
    { key: 'security', label: 'Security & Compliance', basic: 'Standard', premium: 'Enhanced Security', enterprise: 'Enterprise-grade Security' },
    { key: 'sla', label: 'SLA Guarantee', basic: false, premium: false, enterprise: true },
    { key: 'bestFor', label: 'Best For', basic: 'Beginners', premium: 'Growing Businesses', enterprise: 'Large Organizations' },
];
