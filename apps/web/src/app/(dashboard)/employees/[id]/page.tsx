import { Metadata } from 'next';
import { EmployeeProfileClient } from './EmployeeProfileClient';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: 'Employee Profile | HRManager4U.ai',
    description: 'Detailed employee profile with employment history, documents, leave balance, and timeline.',
  };
}

export default function EmployeeProfilePage({ params }: { params: { id: string } }) {
  return <EmployeeProfileClient id={params.id} />;
}
