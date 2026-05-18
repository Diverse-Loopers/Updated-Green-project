import JsonLd, { breadcrumbSchema } from '@/components/seo/JsonLd';

export const metadata = {
  title: 'LoopMail Pricing — Plans & Features',
  description: 'Choose your LoopMail plan — Free Basic, Premium at ₹1,500/mo, or custom Enterprise. Compare features, sending limits, and SMTP support for your email marketing needs.',
  keywords: ['loopmail pricing', 'email marketing pricing', 'bulk email plans', 'email tool pricing india', 'free email marketing tool'],
  alternates: { canonical: '/products/loopmail/pricing' },
  openGraph: {
    title: 'LoopMail Pricing — Plans & Features',
    description: 'Free Basic, Premium ₹1,500/mo, or Enterprise. Compare plans.',
    url: '/products/loopmail/pricing',
    type: 'website',
  },
};

export default function PricingLayout({ children }) {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Products', url: '/products' },
        { name: 'LoopMail', url: '/products/loopmail' },
        { name: 'Pricing', url: '/products/loopmail/pricing' },
      ])} />
      {children}
    </>
  );
}
