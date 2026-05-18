import JsonLd, { breadcrumbSchema } from '@/components/seo/JsonLd';

export const metadata = {
  title: 'Blog — Insights on Email Marketing, Career Growth & Tech',
  description: 'Read the latest articles from Diverse Loopers on email marketing, SMTP setup, career development, student projects, and business technology solutions.',
  keywords: ['diverse loopers blog', 'email marketing tips', 'career advice', 'tech blog india', 'loopmail guides'],
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog — Diverse Loopers',
    description: 'Insights on email marketing, career growth & tech.',
    url: '/blog',
    type: 'website',
  },
};

export default function BlogLayout({ children }) {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Blog', url: '/blog' },
      ])} />
      {children}
    </>
  );
}
