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

export const metadata = {
  title: {
    default: "Diverse Loopers",
    template: "%s | Diverse Loopers",
  },
  description: "Hybrid Hustle – empowering talent for tomorrow",
  keywords: ["diverse loopers", "hybrid hustle", "talent platform"],
  authors: [{ name: "Diverse Loopers" }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html 
      lang="en" 
      className={`scroll-smooth ${inter.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <head>
        
        <link rel="icon" href="/favicon-96x96.png" type="image/png" sizes="96x96" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
      </head>

      <body className="font-sans text-slate-800 bg-white dark:bg-[#090a14] dark:text-slate-200 min-h-screen overflow-x-hidden transition-colors duration-300" suppressHydrationWarning>
         <SmoothScroll />
        {children}
      </body>
    </html>
  );
}