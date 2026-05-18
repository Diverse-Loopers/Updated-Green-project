import { supabase } from '@/lib/supabase'

export default async function sitemap() {
  const baseUrl = 'https://diverseloopers.com'

  // Fetch all published blog posts from Supabase
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('is_published', true)

  const blogUrls = (posts || []).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || new Date()).toISOString(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const staticUrls = [
    { url: `${baseUrl}/`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/business`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/about`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/courses`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/career`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/institute`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/events`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/fame-wall`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${baseUrl}/skillsynth`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/products`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/products/loopmail`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/products/loopmail/pricing`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/blog`, changeFrequency: 'weekly', priority: 0.8 },
  ]

  return [...staticUrls, ...blogUrls]
}
