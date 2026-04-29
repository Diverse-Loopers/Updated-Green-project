import { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Geist, Geist_Mono } from 'next/font/google'
import SmoothScroll from '../SmoothScroll'
// import { Analytics } from '@vercel/analytics/next'
// import './globals.css'

const _inter = Inter({ subsets: ["latin"], variable: '--font-inter' })
const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata = {
  title: 'Careers at Diverse Loopers | Connect Students to Real Projects',
  description: 'Join Diverse Loopers and help students build real-world business experience. Explore career opportunities with our team.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f7fb' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export default function RootLayout({
  children,
}) {
  return (
  <div className={`${_inter.variable} font-sans antialiased`}>
        <SmoothScroll />
        {children}
        {/* <Analytics /> */}
     </div>
  )
}
