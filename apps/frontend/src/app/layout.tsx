import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import { clientEnv } from '@/lib/env/env.client';
import { AppProviders } from '@/providers/app-providers';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: clientEnv.NEXT_PUBLIC_APP_NAME,
  description: 'Real-time enterprise task and project management platform.',
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({
  children,
}: RootLayoutProps): React.JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}