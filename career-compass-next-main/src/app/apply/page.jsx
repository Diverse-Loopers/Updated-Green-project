import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Apply for Canada & USA Placement Program | Diverse Loopers',
  description: 'Submit your application for the Diverse Loopers International Placement & Staffing Support Program.',
};

export default function ApplyPage() {
  redirect('/?apply=placement');
}
