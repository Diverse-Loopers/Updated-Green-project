'use client'

import { useState, useEffect } from 'react'

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)

  useEffect(() => {
    // Check if consent has already been given
    const consent = localStorage.getItem('diverse_loopers_cookie_consent')
    if (!consent) {
      setShowConsent(true)
    }
  }, [])

  const handleConsent = async (action) => {
    // Hide immediately for good UX
    setShowConsent(false)
    
    // Save locally
    localStorage.setItem('diverse_loopers_cookie_consent', action)

    // Log to our database analytics
    try {
      await fetch('/api/cookie-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
    } catch (err) {
      console.error('Failed to log cookie consent', err)
    }
  }

  const openSettings = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-legal-modal', { detail: { slug: 'privacy-policy' } }))
    }
  }

  if (!showConsent) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-[9999] p-4 sm:px-8 py-5 shadow-[0_-4px_25px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-10 duration-500">
      <div className="max-w-[1400px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-4 xl:gap-8">
        
        <p className="text-[13px] text-[#1a1a1a] leading-[1.6] font-medium flex-1">
          This website uses cookies, pixel tags, and local storage for performance, personalization, and marketing purposes. We use our own cookies and some from third parties. Only essential cookies are turned on by default.{' '}
          <button 
            onClick={openSettings}
            className="text-blue-600 font-bold hover:underline decoration-blue-600 underline-offset-2 ml-1"
          >
            Cookies settings
          </button>
        </p>

        <div className="flex w-full xl:w-auto items-center gap-3 shrink-0 mt-2 xl:mt-0">
          <button
            onClick={() => handleConsent('rejected')}
            className="flex-1 xl:flex-none px-6 py-2.5 bg-white text-[#1a1a1a] text-[13px] font-bold rounded-full border-2 border-[#1a1a1a] hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            Do not allow cookies
          </button>
          <button
            onClick={() => handleConsent('accepted')}
            className="flex-1 xl:flex-none px-6 py-2.5 bg-[#1a1a1a] text-white text-[13px] font-bold rounded-full border-2 border-[#1a1a1a] hover:bg-black transition-colors whitespace-nowrap"
          >
            Allow all cookies
          </button>
        </div>

      </div>
    </div>
  )
}
