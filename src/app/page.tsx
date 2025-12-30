import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import EmptyState from '@/components/EmptyState';
import Pagination from '@/components/Pagination';
import SearchBar from '@/components/SearchBar';
import ProductGridSkeleton from '@/components/ProductGridSkeleton';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { env } from '@/lib/env';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Shop - Discover Amazing Products',
  description: 'Browse our collection of high-quality products. Find the perfect items for your needs with secure checkout and fast delivery.',
  openGraph: {
    title: 'Shop - Discover Amazing Products | ShopVerse',
    description: 'Browse our collection of high-quality products. Find the perfect items for your needs with secure checkout and fast delivery.',
    url: env.NEXT_PUBLIC_APP_URL,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop - Discover Amazing Products | ShopVerse',
    description: 'Browse our collection of high-quality products with secure checkout.',
  },
};

interface HomePageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

async function ProductGrid({ page = 1, searchQuery }: { page: number; searchQuery?: string }) {
  const limit = 12;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = { active: true };
  
  if (searchQuery?.trim()) {
    where.OR = [
      { name: { contains: searchQuery.trim(), mode: 'insensitive' } },
      { description: { contains: searchQuery.trim(), mode: 'insensitive' } },
    ];
  }

  let products, total;
  try {
    [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);
  } catch (error) {
    console.error('Database error:', error);
    return (
      <EmptyState
        title="Database Not Connected"
        message="Please set up your DATABASE_URL in .env.local. See README.md for instructions."
      />
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="No products found"
        message={searchQuery ? `No products match "${searchQuery}"` : 'No products available.'}
      />
    );
  }

  const hasMore = skip + products.length < total;

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p, index) => (
          <ProductCard key={p.id} p={p} index={index} />
        ))}
      </div>
      <Pagination
        page={page}
        limit={limit}
        total={total}
        hasMore={hasMore}
      />
    </>
  );
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const searchQuery = params.q;

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ShopVerse',
    url: env.NEXT_PUBLIC_APP_URL,
    description: 'Modern e-commerce platform with secure Stripe checkout',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${env.NEXT_PUBLIC_APP_URL}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SearchBar />
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid page={page} searchQuery={searchQuery} />
      </Suspense>
    </>
  );
}
