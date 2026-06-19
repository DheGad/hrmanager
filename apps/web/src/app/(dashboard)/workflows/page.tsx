import { Metadata } from 'next';
import { WorkflowClient } from './WorkflowClient';

export const metadata: Metadata = {
  title: 'Approvals | HRManager4U.ai',
  description: 'Enterprise workflow approval inbox with SLA tracking and escalation management.',
};

export default function WorkflowsPage() {
  return <WorkflowClient />;
}
