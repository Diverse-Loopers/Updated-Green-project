/**
 * Reusable JSON-LD structured data component (Server Component).
 * Usage: <JsonLd data={schemaObject} />
 */
export default function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ── Pre-built Schema Factories ──

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Diverse Loopers',
    url: 'https://diverseloopers.com',
    logo: 'https://diverseloopers.com/DIVERSE%20LOOPERS%20(1)%20bg.png',
    description: 'Empowering students with real-world project experience and providing businesses with SaaS tools, staffing solutions, and tech services.',
    foundingDate: '2024',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'contact@diverseloopers.com',
      contactType: 'customer support',
    },
    sameAs: [
      // Add your social media URLs here
      // 'https://linkedin.com/company/diverseloopers',
      // 'https://twitter.com/diverseloopers',
    ],
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Diverse Loopers',
    url: 'https://diverseloopers.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://diverseloopers.com/courses?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url ? `https://diverseloopers.com${item.url}` : undefined,
    })),
  };
}

export function productSchema({ name, description, url, price, priceCurrency = 'INR', image }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    url: `https://diverseloopers.com${url}`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: price || '0',
      priceCurrency,
      availability: 'https://schema.org/InStock',
    },
    image: image ? `https://diverseloopers.com${image}` : undefined,
    provider: {
      '@type': 'Organization',
      name: 'Diverse Loopers',
    },
  };
}

export function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
