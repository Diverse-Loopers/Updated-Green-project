import JsonLd, { breadcrumbSchema, faqSchema } from '@/components/seo/JsonLd';

export const metadata = {
  title: 'Business Solutions — SaaS Tools, Tech Staffing & Enterprise Services',
  description: 'Diverse Loopers offers enterprise SaaS tools like LoopMail, professional staffing, custom software development, and digital marketing services for growing businesses in India.',
  keywords: ['business solutions india', 'saas tools', 'loopmail email marketing', 'tech staffing', 'custom software development', 'digital marketing services'],
  alternates: { canonical: '/business' },
  openGraph: {
    title: 'Business Solutions — Diverse Loopers',
    description: 'Enterprise SaaS tools, staffing, and tech services for growing businesses.',
    url: '/business',
    type: 'website',
  },
  twitter: {
    title: 'Business Solutions — Diverse Loopers',
    description: 'Enterprise SaaS tools, staffing, and tech services for growing businesses.',
  },
};

export default function BusinessLayout({ children }) {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Business', url: '/business' },
      ])} />
      {children}
    </>
  );
}
