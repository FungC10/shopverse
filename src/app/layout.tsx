import type { Metadata } from 'next';
import { QueryProvider } from '@/lib/queryClient';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'WeatherFlow',
  description: 'Minimal, elegant, city-first weather app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

