import { Metadata } from 'next';
import { EmployeeDirectoryClient } from './EmployeeDirectoryClient';

export const metadata: Metadata = {
  title: 'Employees | HRManager4U.ai',
  description: 'Enterprise employee directory with advanced search, filters, and profile management.',
};

export default function EmployeesPage() {
  return <EmployeeDirectoryClient />;
}
