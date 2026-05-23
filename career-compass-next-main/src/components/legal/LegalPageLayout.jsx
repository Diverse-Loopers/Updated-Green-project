'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Footer from '@/components/ui/Footer'
import Link from 'next/link'

export default function LegalPageLayout({ slug, defaultTitle }) {
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDoc() {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('slug', slug)
        .single()
      
      if (data) {
        setDoc(data)
      } else {
        console.error('Failed to load legal doc:', error)
      }
      setLoading(false)
    }
    
    fetchDoc()
  }, [slug])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090a14] flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/DIVERSE LOOPERS (1) bg.png" alt="Diverse Loopers" className="h-8 w-auto rounded-md" />
            <span className="font-bold text-slate-900 dark:text-white">Diverse Loopers</span>
          </Link>
          <div className="text-sm text-slate-500 font-medium hidden sm:block">
            Legal & Compliance
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {loading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4/6"></div>
            </div>
            <div className="space-y-3 pt-6">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
            </div>
          </div>
        ) : (
          <article className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-12">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">
              {doc?.title || defaultTitle}
            </h1>
            
            <div 
              className="prose prose-slate dark:prose-invert max-w-none 
                prose-headings:font-bold prose-headings:tracking-tight 
                prose-a:text-emerald-600 dark:prose-a:text-emerald-400 hover:prose-a:text-emerald-500
                prose-strong:text-slate-900 dark:prose-strong:text-white
                prose-li:marker:text-emerald-500"
              dangerouslySetInnerHTML={{ __html: doc?.content || '<p>Content is being updated. Please check back soon.</p>' }}
            />
          </article>
        )}
      </main>

      <Footer />
    </div>
  )
}
