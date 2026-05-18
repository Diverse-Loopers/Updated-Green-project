import JsonLd, { productSchema, breadcrumbSchema } from '@/components/seo/JsonLd';

export const metadata = {
  title: 'LoopMail — Professional Bulk Email Marketing Platform',
  description: 'LoopMail is a professional email marketing SaaS by Diverse Loopers. Send bulk campaigns, manage contacts, configure your SMTP, and track delivery — all from one dashboard.',
  keywords: [
    'loopmail', 'bulk email tool', 'email marketing saas', 'email marketing platform india',
    'smtp email sender', 'bulk email sender', 'email campaign tool', 'business email marketing',
    'email automation india', 'professional email tool',
  ],
  alternates: { canonical: '/products/loopmail' },
  openGraph: {
    title: 'LoopMail — Email Marketing SaaS',
    description: 'Professional bulk email marketing platform. Send campaigns, manage contacts, and track delivery.',
    url: '/products/loopmail',
    type: 'website',
  },
  twitter: {
    title: 'LoopMail — Email Marketing SaaS by Diverse Loopers',
    description: 'Send bulk email campaigns with your own SMTP. Free plan available.',
  },
};

export default function LoopMailLayout({ children }) {
  return (
    <>
      <JsonLd data={productSchema({
        name: 'LoopMail',
        description: 'Professional bulk email marketing platform with SMTP integration, contact management, and campaign analytics.',
        url: '/products/loopmail',
        price: '0',
        priceCurrency: 'INR',
      })} />
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Products', url: '/products' },
        { name: 'LoopMail', url: '/products/loopmail' },
      ])} />
      {children}
    </>
  );
}
