import { Metadata } from 'next';
import { AnalyticsClient } from './AnalyticsClient';

export const metadata: Metadata = {
  title: 'Analytics | HRManager4U.ai',
  description: 'Executive analytics — workforce, leave, compliance, and AI query insights.',
};

export default function AnalyticsPage() {
  return <AnalyticsClient />;
}
