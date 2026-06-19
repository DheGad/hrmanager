import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const viewport: Viewport = {
  themeColor: '#0F0F1A',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://hrmanager4u.ai'),
  title: {
    default: 'HRManager4U.ai — Enterprise AI HR Platform for Malaysia & Australia',
    template: '%s | HRManager4U.ai',
  },
  description:
    'The enterprise AI-powered HR Operating System built for Malaysia and Australia. Automate compliance, manage your entire workforce lifecycle, and get instant AI-powered HR legal advice — all in one platform.',
  keywords: [
    'HR software Malaysia',
    'HR software Australia',
    'AI HR assistant',
    'Employment Act 1955',
    'Fair Work Act',
    'payroll Malaysia',
    'leave management',
    'HR compliance',
    'enterprise HRMS',
    'HR SaaS',
  ],
  authors: [{ name: 'HRManager4U.ai' }],
  creator: 'HRManager4U.ai',
  publisher: 'HRManager4U.ai',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hrmanager4u.ai',
    siteName: 'HRManager4U.ai',
    title: 'HRManager4U.ai — Enterprise AI HR Platform',
    description: 'AI-powered HR OS for Malaysia & Australia. Automate compliance, manage the full employee lifecycle, and get instant HR legal guidance.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'HRManager4U.ai' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HRManager4U.ai — Enterprise AI HR Platform',
    description: 'AI-powered HR OS for Malaysia & Australia.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jakartaSans.variable} font-sans min-h-screen bg-[#0F0F1A] text-white antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
