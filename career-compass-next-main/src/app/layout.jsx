import "./globals.css";
import { Inter, Poppins } from 'next/font/google';
import SmoothScroll from './SmoothScroll'

// Optimized font loading with Next.js
const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

const SITE_URL = 'https://diverseloopers.com';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Diverse Loopers — Hybrid Hustle Platform for Students & Businesses",
    template: "%s | Diverse Loopers",
  },
  description: "Diverse Loopers empowers students with real-world project experience and provides businesses with SaaS tools, staffing solutions, and tech services through the Hybrid Hustle model.",
  keywords: [
    "diverse loopers", "hybrid hustle", "student projects", "loopmail",
    "email marketing saas", "bulk email tool", "business solutions india",
    "tech staffing", "student talent platform", "career development",
  ],
  authors: [{ name: "Diverse Loopers", url: SITE_URL }],
  creator: "Diverse Loopers",
  publisher: "Diverse Loopers",

  // Canonical
  alternates: {
    canonical: '/',
  },

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: 'Diverse Loopers',
    title: 'Diverse Loopers — Hybrid Hustle Platform for Students & Businesses',
    description: 'Empowering students with real-world project experience. SaaS tools, staffing solutions, and tech services for businesses.',
    images: [
      {
        url: '/DIVERSE LOOPERS (1) bg.png',
        width: 1200,
        height: 630,
        alt: 'Diverse Loopers — Hybrid Hustle Platform',
      },
    ],
  },

  // Twitter / X
  twitter: {
    card: 'summary_large_image',
    title: 'Diverse Loopers — Hybrid Hustle Platform',
    description: 'Empowering students with real-world projects. SaaS tools & business solutions.',
    images: ['/DIVERSE LOOPERS (1) bg.png'],
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Verification placeholders — replace with real values after setup
  verification: {
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },

  // Icons (fixed paths)
  icons: {
    icon: [
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },

  // Manifest
  manifest: '/manifest.json',

  // App metadata
  applicationName: 'Diverse Loopers',
  category: 'education',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  // Removed maximumScale: 1 — it blocks pinch-zoom (WCAG accessibility violation)
};

export default function RootLayout({ children }) {
  return (
    <html 
      lang="en" 
      className={`scroll-smooth ${inter.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <head />
      <body className="font-sans text-slate-800 bg-white dark:bg-[#090a14] dark:text-slate-200 min-h-screen overflow-x-hidden transition-colors duration-300" suppressHydrationWarning>
         <SmoothScroll />
        {children}
      </body>
    </html>
  );
}