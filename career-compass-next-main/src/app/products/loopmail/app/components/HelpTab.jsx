'use client';
import { useState } from 'react';
import { ChevronDown, ChevronRight, Mail, Users, Settings, BarChart3, Zap, HelpCircle, FileText, FolderOpen, Key, Sparkles } from 'lucide-react';

const sections = [
    {
        id: 'getting-started',
        icon: Zap,
        title: 'Getting Started',
        color: '#16a34a',
        items: [
            {
                q: 'What is LoopMail?',
                a: `LoopMail is a professional bulk email sending tool by Diverse Loopers. It lets you connect your own email provider (Gmail, GoDaddy, Hostinger, or any SMTP server), manage contacts, compose beautiful emails, and send campaigns at scale — all from one dashboard.`
            },
            {
                q: 'First Steps After Signup',
                a: `1. **Go to Settings** → Add your SMTP configuration (email server details)\n2. **Go to Contacts** → Import your email list (CSV file or add manually)\n3. **Go to Compose** → Write your email, select recipients, and send!\n\nThat's it — you're ready to send professional emails from your own domain.`
            },
            {
                q: 'What do I need to use LoopMail?',
                a: `• An email account with SMTP access (Gmail, GoDaddy, Hostinger, Zoho, etc.)\n• Your SMTP credentials (host, port, username, password)\n• A list of contacts you want to email\n\nLoopMail works with ANY email provider that supports SMTP.`
            },
        ]
    },
    {
        id: 'smtp',
        icon: Settings,
        title: 'Setting Up SMTP',
        color: '#3498db',
        items: [
            {
                q: 'How to add SMTP configuration?',
                a: `1. Go to **Settings** tab in the sidebar\n2. Click **"Add SMTP Config"**\n3. Select your email provider from the quick-select grid (Gmail, GoDaddy, Outlook, etc.) — this auto-fills host and port\n4. Enter your **From Name**, **From Email**, **SMTP Username** and **Password**\n5. Click **Save**\n\n💡 **Tip:** Your SMTP username is usually your full email address.`
            },
            {
                q: 'Common SMTP Settings',
                a: `**Gmail:** host: smtp.gmail.com, port: 465 (SSL) or 587 (TLS)\n**GoDaddy:** host: smtpout.secureserver.net, port: 465\n**Hostinger:** host: smtp.hostinger.com, port: 465\n**Outlook/Hotmail:** host: smtp.office365.com, port: 587\n**Zoho:** host: smtp.zoho.com, port: 465\n\n⚠️ **Gmail users:** You need to enable "App Passwords" in your Google Account settings. Regular passwords won't work with SMTP.`
            },
            {
                q: 'How to test my SMTP?',
                a: `After saving your SMTP config, click the **"Test"** button next to it. This sends a test email to your own address to verify the connection works.\n\nIf it fails, double-check:\n• Host and port are correct\n• Username is your full email\n• Password is an app-specific password (not your regular login password)\n• Your email provider allows SMTP access`
            },
            {
                q: 'Are my SMTP credentials secure?',
                a: `Yes! Your SMTP passwords are encrypted using **AES-256-GCM** encryption before being stored in the database. Even if someone accesses the database, they cannot read your passwords. The encryption key is stored securely on the server.`
            },
        ]
    },
    {
        id: 'contacts',
        icon: Users,
        title: 'Managing Contacts',
        color: '#9b59b6',
        items: [
            {
                q: 'How to add contacts?',
                a: `**Method 1 — Add Manually:**\nClick "Add Contact" button → Enter name, email, company → Save\n\n**Method 2 — Import CSV:**\nClick "Import CSV" → Select a CSV file with columns: name, email, company (optional)\nThe system automatically detects the columns and imports all contacts.\n\n💡 **Tip:** You can download a sample CSV template from the import dialog.`
            },
            {
                q: 'How to organize contacts with folders?',
                a: `1. Click **"New Folder"** to create a folder (e.g., "Clients", "Leads", "Partners")\n2. Select contacts using checkboxes\n3. Use the **"Move to Folder"** dropdown to assign them\n\nFolders help you segment your audience for targeted campaigns.`
            },
            {
                q: 'CSV file format',
                a: `Your CSV file should have these columns:\n\n| Column | Required | Description |\n|--------|----------|-------------|\n| email | ✅ Yes | Contact's email address |\n| name | ❌ No | Contact's full name |\n| company | ❌ No | Company/organization |\n\nExample:\n\`\`\`\nname,email,company\nJohn Doe,john@example.com,Acme Inc\nJane Smith,jane@example.com,Tech Corp\n\`\`\``
            },
            {
                q: 'What happens to duplicate emails?',
                a: `LoopMail automatically detects duplicate email addresses. If you try to import a contact with an email that already exists, it will be skipped. You won't have duplicate contacts.`
            },
        ]
    },
    {
        id: 'compose',
        icon: Mail,
        title: 'Composing Emails',
        color: '#e67e22',
        items: [
            {
                q: 'How to use the rich text editor?',
                a: `The editor toolbar gives you full control over your email design:\n\n• **B I U S** — Bold, Italic, Underline, Strikethrough\n• **Heading / Size** — Change heading level and font size\n• **A** — Text color picker (13 colors)\n• **H** — Background highlight color\n• **🔗** — Insert hyperlink (opens modal)\n• **🖼️** — Upload image from your device\n• **🌐** — Insert image from URL\n• **⊞** — Insert a CTA button with custom color\n• **—** — Add a horizontal divider\n• **⫷ ☰ ⫸** — Align left, center, right\n• **• — / 1.** — Bullet list and numbered list`
            },
            {
                q: 'Template Variables (Auto-fill)',
                a: `LoopMail automatically replaces these variables with each contact's data:\n\n| Variable | What it becomes |\n|----------|----------------|\n| **{{name}}** | Contact's name (e.g., "John Doe") |\n| **{{email}}** | Contact's email address |\n\n**Example:**\n\`Hello {{name}}, your account at {{email}} is ready!\`\n\nBecomes:\n\`Hello John Doe, your account at john@example.com is ready!\`\n\nIf a contact has no name set, it defaults to "User".`
            },
            {
                q: 'How to add images?',
                a: `**Upload from device:** Click the 🖼️ icon → Select an image file\n**From URL:** Click the 🌐 icon → Paste the image URL\n\nAfter inserting an image, **click on it** to see resize options:\n• 25%, 50%, 75%, 100% of container width\n• Fixed sizes: 200px, 400px, 600px\n\nImages are embedded directly in the email for maximum compatibility.`
            },
            {
                q: 'How to insert a CTA button?',
                a: `1. Click the **⊞** icon in the toolbar\n2. Enter the button text (e.g., "Get Started")\n3. Enter the link URL\n4. Choose a button color from the palette\n5. See the live preview, then click **"Insert Button"**\n\nThe button is rendered as an HTML link styled as a button — it works in all email clients.`
            },
            {
                q: 'How to add attachments?',
                a: `Below the email editor, you'll find the **Attachments** section:\n\n1. Click **"Add Files"** or click the dashed area\n2. Select one or more files (PDF, images, documents)\n3. Each file can be up to **10MB**\n4. Click the ✕ next to a file to remove it\n\nAttachments are sent with every email in the campaign.`
            },
            {
                q: 'What are CC and BCC?',
                a: `• **CC (Carbon Copy):** These recipients see each other's email addresses. Use for transparency.\n• **BCC (Blind Carbon Copy):** These recipients are hidden from each other. Use for privacy.\n\nEnter multiple emails separated by commas:\n\`manager@company.com, admin@company.com\``
            },
        ]
    },
    {
        id: 'campaigns',
        icon: BarChart3,
        title: 'Campaigns & Analytics',
        color: '#e74c3c',
        items: [
            {
                q: 'How are emails sent?',
                a: `LoopMail sends emails in the background using intelligent throttling:\n\n• Sends in batches of **5 emails at a time**\n• Waits **5 seconds** between batches to avoid spam flags\n• If **2 consecutive bounces** occur, it **pauses for 1 hour** to protect your domain reputation\n• Automatically resumes after the pause\n\nThis ensures maximum deliverability and protects your sender reputation.`
            },
            {
                q: 'Campaign statuses explained',
                a: `| Status | Meaning |\n|--------|--------|\n| **Sending** | Campaign is actively delivering emails |\n| **Sent** | All emails have been delivered |\n| **Paused** | Temporarily paused due to bounces (auto-resumes in 1 hour) |\n| **Failed** | Campaign encountered errors |\n\nYou can view detailed per-recipient status in the campaign details.`
            },
            {
                q: 'Email validation',
                a: `Before sending, LoopMail validates every email address:\n\n✅ **Checks MX records** — Verifies the domain can receive email\n🚫 **Blocks disposable emails** — Filters out temporary email services\n📊 **Reports skipped** — Shows how many emails were invalid\n\nThis reduces bounces and protects your sender reputation.`
            },
        ]
    },
    {
        id: 'tips',
        icon: Sparkles,
        title: 'Pro Tips & Best Practices',
        color: '#059669',
        items: [
            {
                q: 'How to avoid spam filters?',
                a: `1. **Use a professional domain** — Avoid sending from @gmail.com for business\n2. **Personalize emails** — Use {{name}} variable\n3. **Don't use ALL CAPS** in subject lines\n4. **Keep image-to-text ratio balanced** — Don't send image-only emails\n5. **Include an unsubscribe option** — Add a footer with unsubscribe link\n6. **Warm up new domains** — Start with small batches (50-100) and gradually increase\n7. **Don't use spam trigger words** — Avoid "FREE!!!", "Act Now", "Limited Time"`
            },
            {
                q: 'Recommended sending limits',
                a: `| Provider | Daily Limit |\n|----------|-------------|\n| Gmail | 500/day (free), 2000/day (Workspace) |\n| GoDaddy | 500/day |\n| Hostinger | 500/day |\n| Outlook | 300/day (free) |\n| Zoho | 500/day |\n\n💡 **Tip:** For higher volumes, use a dedicated SMTP service like Amazon SES, SendGrid, or Mailgun.`
            },
            {
                q: 'How to write effective subject lines?',
                a: `• Keep it under **50 characters**\n• Create **urgency** without being spammy\n• Use **personalization**: "{{name}}, your report is ready"\n• Ask a **question**: "Ready to grow your business?"\n• Use **numbers**: "5 tips to improve your workflow"\n• A/B test different subjects with small groups first`
            },
        ]
    },
];

function MarkdownText({ text }) {
    const html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:0.78rem;">$1</code>')
        .replace(/\n/g, '<br/>');
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function HelpTab() {
    const [openSection, setOpenSection] = useState('getting-started');
    const [openItems, setOpenItems] = useState(new Set(['What is LoopMail?']));

    const toggleItem = (q) => {
        const s = new Set(openItems);
        s.has(q) ? s.delete(q) : s.add(q);
        setOpenItems(s);
    };

    return (
        <div>
            <div className="lmd-section-header">
                <h2>Help & Documentation</h2>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Everything you need to know about LoopMail</span>
            </div>

            {/* Quick Start Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: 16,
                padding: '28px 32px', marginBottom: 24, color: '#fff', position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(22,163,74,0.15)' }} />
                <div style={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(99,102,241,0.1)' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 8 }}>🚀 Quick Start Guide</h3>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 16 }}>
                        {[
                            { step: '1', title: 'Setup SMTP', desc: 'Add your email server credentials', icon: '⚙️' },
                            { step: '2', title: 'Import Contacts', desc: 'Upload CSV or add manually', icon: '👥' },
                            { step: '3', title: 'Compose & Send', desc: 'Write your email and hit send', icon: '✉️' },
                        ].map(s => (
                            <div key={s.step} style={{ flex: 1, minWidth: 160, background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{s.icon}</div>
                                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#16a34a', marginBottom: 4 }}>STEP {s.step}</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>{s.title}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{s.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Template Variables Quick Reference */}
            <div style={{
                background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12,
                padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap',
            }}>
                <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#16a34a', whiteSpace: 'nowrap' }}>📌 Template Variables:</div>
                <code style={{ background: '#fff', padding: '4px 12px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, border: '1px solid #d1fae5' }}>{'{{name}}'} → Contact&apos;s name</code>
                <code style={{ background: '#fff', padding: '4px 12px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, border: '1px solid #d1fae5' }}>{'{{email}}'} → Contact&apos;s email</code>
            </div>

            {/* Help Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {sections.map(section => (
                    <div key={section.id} style={{ border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', background: '#fff' }}>
                        <button
                            onClick={() => setOpenSection(openSection === section.id ? '' : section.id)}
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                                padding: '16px 20px', background: openSection === section.id ? '#f8fafc' : '#fff',
                                border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                                borderBottom: openSection === section.id ? '1px solid #e2e8f0' : 'none',
                            }}
                        >
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: section.color + '14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <section.icon style={{ width: 18, height: 18, color: section.color }} />
                            </div>
                            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', flex: 1 }}>{section.title}</span>
                            <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>{section.items.length} articles</span>
                            {openSection === section.id ? <ChevronDown style={{ width: 16, height: 16, color: '#94a3b8' }} /> : <ChevronRight style={{ width: 16, height: 16, color: '#94a3b8' }} />}
                        </button>

                        {openSection === section.id && (
                            <div style={{ padding: '8px 12px' }}>
                                {section.items.map((item, i) => (
                                    <div key={i} style={{ borderBottom: i < section.items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                        <button
                                            onClick={() => toggleItem(item.q)}
                                            style={{
                                                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                                padding: '12px 8px', background: 'none', border: 'none',
                                                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                                            }}
                                        >
                                            {openItems.has(item.q) ? <ChevronDown style={{ width: 14, height: 14, color: section.color, flexShrink: 0 }} /> : <ChevronRight style={{ width: 14, height: 14, color: '#94a3b8', flexShrink: 0 }} />}
                                            <span style={{ fontWeight: 600, fontSize: '0.82rem', color: openItems.has(item.q) ? section.color : '#334155' }}>{item.q}</span>
                                        </button>
                                        {openItems.has(item.q) && (
                                            <div style={{ padding: '4px 8px 16px 32px', fontSize: '0.8rem', color: '#475569', lineHeight: 1.7 }}>
                                                <MarkdownText text={item.a} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Support Footer */}
            <div style={{ marginTop: 32, padding: '20px 24px', background: '#f8fafc', borderRadius: 14, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <p style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Need more help? Contact us at <a href="mailto:contact@diverseloopers.com" style={{ color: '#16a34a', fontWeight: 700 }}>contact@diverseloopers.com</a></p>
            </div>
        </div>
    );
}
