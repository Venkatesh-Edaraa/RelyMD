import type { Metadata } from 'next';
import { InterceptorProvider } from '@/components/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'RelyMD - Collaborative Notebooks',
  description: 'Create and share notebooks with granular permissions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <InterceptorProvider>
          {children}
        </InterceptorProvider>
      </body>
    </html>
  );
}
