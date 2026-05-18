'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Calendar, Clock, ArrowRight, BookOpen, Search } from 'lucide-react'
import Footer from '@/components/ui/Footer'
import './blog.css'

export default function BlogPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    async function fetchPosts() {
      const { data } = await supabase
        .from('blog_posts')
        .select('slug, title, excerpt, cover_image, author, category, tags, read_time_minutes, created_at')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
      setPosts(data || [])
      setLoading(false)
    }
    fetchPosts()
  }, [])

  const categories = ['All', ...new Set(posts.map(p => p.category))]

  const filtered = posts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory
    return matchesSearch && matchesCategory
  })

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
            <Link href="/business">Business</Link>
            <Link href="/products/loopmail">LoopMail</Link>
            <Link href="/courses">Courses</Link>
            <Link href="/blog" className="active">Blog</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="blog-hero">
        <div className="blog-hero-content">
          <div className="blog-hero-badge">
            <BookOpen size={16} />
            <span>Knowledge Hub</span>
          </div>
          <h1>Insights & Guides</h1>
          <p>Expert articles on email marketing, career growth, and technology — straight from the Diverse Loopers team.</p>

          <div className="blog-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="blog-categories">
        <div className="blog-container">
          {categories.map(cat => (
            <button
              key={cat}
              className={`blog-cat-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Posts Grid */}
      <section className="blog-grid-section">
        <div className="blog-container">
          {loading ? (
            <div className="blog-loading">
              {[1, 2, 3].map(i => (
                <div key={i} className="blog-skeleton" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="blog-empty">
              <BookOpen size={48} />
              <h3>No articles found</h3>
              <p>Try a different search or category.</p>
            </div>
          ) : (
            <div className="blog-grid">
              {filtered.map((post, i) => (
                <Link href={`/blog/${post.slug}`} key={post.slug} className={`blog-card ${i === 0 ? 'featured' : ''}`}>
                  {post.cover_image && (
                    <div className="blog-card-image">
                      <img src={post.cover_image} alt={post.title} />
                    </div>
                  )}
                  <div className="blog-card-body">
                    <span className="blog-card-category">{post.category}</span>
                    <h2>{post.title}</h2>
                    <p>{post.excerpt}</p>
                    <div className="blog-card-meta">
                      <span><Calendar size={14} /> {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span><Clock size={14} /> {post.read_time_minutes} min read</span>
                    </div>
                    <span className="blog-card-cta">
                      Read Article <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="blog-cta-section">
        <div className="blog-container">
          <div className="blog-cta-card">
            <h2>Ready to supercharge your email marketing?</h2>
            <p>Try LoopMail free — connect your own SMTP, manage contacts, send campaigns.</p>
            <Link href="/products/loopmail/pricing" className="blog-cta-btn">
              Get Started Free <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
