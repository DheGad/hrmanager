import { Metadata } from 'next';
import { DocumentCenterClient } from './DocumentCenterClient';

export const metadata: Metadata = {
  title: 'Document Center | HRManager4U.ai',
  description: 'Enterprise HR document management with upload, preview, expiry alerts, and version history.',
};

export default function DocumentsPage() {
  return <DocumentCenterClient />;
}
