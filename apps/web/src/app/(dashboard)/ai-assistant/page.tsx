import { Metadata } from 'next';
import { AiAssistantClient } from './AiAssistantClient';

export const metadata: Metadata = {
  title: 'AI HR Assistant | HRManager4U.ai',
  description: 'Enterprise AI HR legal assistant with RAG-powered answers, citations, and confidence scoring.',
};

export default function AiAssistantPage() {
  return <AiAssistantClient />;
}
