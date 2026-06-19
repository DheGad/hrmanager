import { Metadata } from 'next';
import { NotificationCenterClient } from './NotificationCenterClient';

export const metadata: Metadata = {
  title: 'Notifications | HRManager4U.ai',
  description: 'Enterprise notification center with in-app alerts, read/unread state, and channel preferences.',
};

export default function NotificationsPage() {
  return <NotificationCenterClient />;
}
