import JsonLd, { organizationSchema, websiteSchema } from '@/components/seo/JsonLd';

// Homepage metadata is inherited from root layout.
// This layout adds Organization + WebSite structured data.

export default function HomeLayout({ children }) {
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema()} />
      {children}
    </>
  );
}
