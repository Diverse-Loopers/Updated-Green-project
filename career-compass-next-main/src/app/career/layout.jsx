import SmoothScroll from '../SmoothScroll'

export const metadata = {
  title: 'Careers at Diverse Loopers — Connect Students to Real Projects',
  description: 'Join Diverse Loopers and help students build real-world business experience. Explore career opportunities and be part of the Hybrid Hustle movement.',
  keywords: ['careers diverse loopers', 'student project jobs', 'hybrid hustle careers', 'tech careers india'],
  alternates: { canonical: '/career' },
  openGraph: {
    title: 'Careers — Diverse Loopers',
    description: 'Join us and help students build real-world business experience.',
    url: '/career',
    type: 'website',
  },
};

export default function CareerLayout({ children }) {
  return (
    <div className="font-sans antialiased">
      <SmoothScroll />
      {children}
    </div>
  );
}
