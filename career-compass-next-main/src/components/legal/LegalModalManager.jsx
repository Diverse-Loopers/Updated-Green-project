'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function LegalModalManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [slug, setSlug] = useState(null)
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleOpen = async (e) => {
      const requestedSlug = e.detail?.slug
      if (!requestedSlug) return

      setIsOpen(true)
      setSlug(requestedSlug)
      setLoading(true)
      setDoc(null)

      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('slug', requestedSlug)
        .single()
      
      if (data) {
        setDoc(data)
      } else {
        console.error('Failed to load legal doc:', error)
      }
      setLoading(false)
    }

    window.addEventListener('open-legal-modal', handleOpen)
    return () => window.removeEventListener('open-legal-modal', handleOpen)
  }, [])

  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12">
      {/* Blurred Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl h-[85vh] sm:h-[80vh] bg-white dark:bg-[#0f172a] rounded-2xl sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden transition-all duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 sm:px-8 sm:py-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-[#0f172a] sticky top-0 z-10">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {loading ? 'Loading...' : doc?.title || (slug === 'privacy-policy' ? 'Privacy Policy' : 'Terms & Conditions')}
          </h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar relative">
          {loading ? (
            <div className="animate-pulse space-y-6 max-w-3xl mx-auto">
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-10"></div>
              <div className="space-y-4">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4/6"></div>
              </div>
            </div>
          ) : (
            <div 
              className="prose prose-slate dark:prose-invert max-w-4xl mx-auto
                prose-headings:font-bold prose-headings:tracking-tight 
                prose-a:text-primary hover:prose-a:text-indigo-500
                prose-strong:text-slate-900 dark:prose-strong:text-white
                prose-li:marker:text-primary
                prose-p:leading-relaxed prose-p:text-slate-600 dark:prose-p:text-slate-300"
              dangerouslySetInnerHTML={{ __html: doc?.content || '<p>Content is currently unavailable. Please check back later.</p>' }}
            />
          )}
        </div>
        
        {/* Footer Fade / Action */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
           <button 
            onClick={() => setIsOpen(false)}
            className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            I Understand
          </button>
        </div>

      </div>
    </div>
  )
}
