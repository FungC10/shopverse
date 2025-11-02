import type { Metadata } from 'next';
import '@/styles/globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'ShopVerse',
  description: 'Minimal, modern e-commerce demo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}

