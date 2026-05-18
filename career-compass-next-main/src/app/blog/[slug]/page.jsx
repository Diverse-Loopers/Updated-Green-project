'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Calendar, Clock, ArrowLeft, Share2, Tag } from 'lucide-react'
import Footer from '@/components/ui/Footer'
import './article.css'

export default function BlogPostPage() {
  const params = useParams()
  const [post, setPost] = useState(null)
  const [relatedPosts, setRelatedPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPost() {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', params.slug)
        .eq('is_published', true)
        .single()

      if (data) {
        setPost(data)

        // Update view count
        supabase.from('blog_posts').update({ views: (data.views || 0) + 1 }).eq('id', data.id).then()

        // Set page title dynamically
        document.title = `${data.meta_title || data.title} | Diverse Loopers`

        // Set meta description dynamically
        const metaDesc = document.querySelector('meta[name="description"]')
        if (metaDesc) metaDesc.setAttribute('content', data.meta_description || data.excerpt)

        // Fetch related posts
        const { data: related } = await supabase
          .from('blog_posts')
          .select('slug, title, excerpt, category, read_time_minutes, created_at')
          .eq('is_published', true)
          .eq('category', data.category)
          .neq('slug', params.slug)
          .limit(3)
        setRelatedPosts(related || [])
      }
      setLoading(false)
    }
    fetchPost()
  }, [params.slug])

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: post.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="article-loading">
        <div className="article-skeleton-title" />
        <div className="article-skeleton-body" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="article-not-found">
        <h1>Article not found</h1>
        <p>The article you're looking for doesn't exist or has been removed.</p>
        <Link href="/blog" className="article-back-btn"><ArrowLeft size={16} /> Back to Blog</Link>
      </div>
    )
  }

  return (
    <>
      {/* Navbar */}
      <nav className="blog-nav">
        <div className="blog-nav-inner">
          <Link href="/" className="blog-logo">
            <img src="/DIVERSE LOOPERS (1) bg.png" alt="Diverse Loopers" width={40} height={40} />
            <span>Diverse Loopers</span>
          </Link>
          <div className="blog-nav-links">
            <Link href="/blog">Blog</Link>
            <Link href="/products/loopmail">LoopMail</Link>
            <Link href="/courses">Courses</Link>
          </div>
        </div>
      </nav>

      {/* Article Header */}
      <header className="article-header">
        <div className="article-header-content">
          <Link href="/blog" className="article-back"><ArrowLeft size={16} /> All Articles</Link>
          <span className="article-category">{post.category}</span>
          <h1>{post.title}</h1>
          <p className="article-excerpt">{post.excerpt}</p>
          <div className="article-meta">
            <span className="article-author">By {post.author}</span>
            <span><Calendar size={14} /> {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span><Clock size={14} /> {post.read_time_minutes} min read</span>
            <button className="article-share-btn" onClick={handleShare}><Share2 size={14} /> Share</button>
          </div>
        </div>
      </header>

      {/* Article Body */}
      <article className="article-body">
        <div className="article-content" dangerouslySetInnerHTML={{ __html: post.content }} />

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="article-tags">
            <Tag size={16} />
            {post.tags.map(tag => (
              <span key={tag} className="article-tag">{tag}</span>
            ))}
          </div>
        )}
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="article-related">
          <div className="article-container">
            <h2>Related Articles</h2>
            <div className="article-related-grid">
              {relatedPosts.map(rp => (
                <Link href={`/blog/${rp.slug}`} key={rp.slug} className="article-related-card">
                  <span className="article-related-cat">{rp.category}</span>
                  <h3>{rp.title}</h3>
                  <p>{rp.excerpt}</p>
                  <span className="article-related-meta">{rp.read_time_minutes} min read</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="blog-cta-section">
        <div className="blog-container">
          <div className="blog-cta-card">
            <h2>Start your email marketing journey today</h2>
            <p>LoopMail is free to start. Bring your own SMTP and send unlimited emails.</p>
            <Link href="/products/loopmail/pricing" className="blog-cta-btn">Get Started Free →</Link>
          </div>
        </div>
      </section>

      <Footer />

      {/* JSON-LD for Article */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.meta_description || post.excerpt,
            author: { '@type': 'Organization', name: post.author },
            publisher: {
              '@type': 'Organization',
              name: 'Diverse Loopers',
              logo: { '@type': 'ImageObject', url: 'https://diverseloopers.com/DIVERSE%20LOOPERS%20(1)%20bg.png' },
            },
            datePublished: post.created_at,
            dateModified: post.updated_at,
            url: `https://diverseloopers.com/blog/${post.slug}`,
            keywords: post.meta_keywords?.join(', '),
          }),
        }}
      />
    </>
  )
}
