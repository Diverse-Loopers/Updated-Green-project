// Block all dashboard/admin pages from search engine indexing
export const metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }) { return children; }
