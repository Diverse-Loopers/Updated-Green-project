import LegalPageLayout from '@/components/legal/LegalPageLayout'

export const metadata = {
  title: 'Terms and Conditions | Diverse Loopers',
  description: 'Terms and Conditions of Diverse Loopers.',
}

const FALLBACK_TERMS_CONTENT = `
<p><strong>Effective Date:</strong> 08/01/2026<br><strong>Last Updated:</strong> 09/01/2026<br><strong>Website:</strong> www.diverseloopers.com<br><strong>Email:</strong> contact@diverseloopers.com<br><strong>Phone:</strong> +91 98393 50961</p>
<p>PLEASE READ THESE TERMS AND CONDITIONS CAREFULLY BEFORE USING THIS PLATFORM. BY ACCESSING OR USING WWW.DIVERSELOOPERS.COM OR ANY SERVICE OFFERED BY DIVERSE LOOPERS, YOU CONFIRM THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE LEGALLY BOUND BY THESE TERMS.</p>

<h3>1. INTRODUCTION AND PARTIES</h3>
<p>These Terms constitute a legally binding agreement between Diverse Loopers and any individual or entity who accesses the platform. This agreement is recognized under Section 10 of the Indian Contract Act, 1872.</p>

<h3>2. ELIGIBILITY AND CAPACITY TO CONTRACT</h3>
<p>You must be at least 18 years of age, or have verified consent from a parent/guardian. Minors are not competent to contract under Section 11 of the Indian Contract Act, 1872.</p>

<h3>3. ACCOUNT REGISTRATION AND SECURITY</h3>
<p>You agree to provide accurate information and maintain the confidentiality of your login credentials.</p>

<h3>4. DESCRIPTION OF SERVICES</h3>
<p>We provide Structured Learning Programs, the Hybrid Hustle Program, Career Compass Tools, Mentorship, and Business/Institutional Partnerships.</p>

<h3>5. INTELLECTUAL PROPERTY RIGHTS</h3>
<p>All content and the Hybrid Hustle® model are exclusive property of Diverse Loopers, protected under the Copyright Act, 1957. You are granted a limited, non-commercial licence to use the platform.</p>

<h3>6. PRIVACY AND DATA PROTECTION</h3>
<p>Data processing is governed by our Privacy Policy and the DPDP Act, 2023.</p>

<h3>7. GOVERNING LAW & JURISDICTION</h3>
<p>These Terms are governed by the laws of India. Any unresolved disputes shall be subject to binding arbitration under the Arbitration and Conciliation Act, 1996 in Delhi, India.</p>

<h3>8. CONTACT INFORMATION</h3>
<p>Grievance Officer: contact@diverseloopers.com | +91 98393 50961</p>
`

export default function TermsPage() {
  return (
    <LegalPageLayout
      slug="terms-and-conditions"
      defaultTitle="Terms and Conditions"
      fallbackContent={FALLBACK_TERMS_CONTENT}
    />
  )
}
