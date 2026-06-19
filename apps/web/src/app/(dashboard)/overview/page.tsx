import { Metadata } from 'next';
import { DashboardClient } from './DashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard | HRManager4U.ai',
  description: 'Enterprise HR management dashboard with real-time compliance, workforce, and AI analytics.',
};

export default function OverviewPage() {
  return <DashboardClient />;
}
