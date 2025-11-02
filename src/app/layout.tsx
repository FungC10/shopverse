import type { Metadata } from 'next';
import { ReactNode } from 'react';
import '@/styles/globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'ShopVerse',
  description: 'Demo commerce with Stripe',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-slate-950 text-slate-100 antialiased">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}

