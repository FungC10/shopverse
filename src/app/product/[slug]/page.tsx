import { prisma } from '@/lib/prisma';
import ProductDetailSkeleton from '@/components/ProductDetailSkeleton';
import { ProductContent } from './ProductContent';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { env } from '@/lib/env';
import { formatPrice } from '@/lib/currency';

export async function generateStaticParams() {
  const slugs = await prisma.product.findMany({
    where: { active: true },
    select: { slug: true },
  });

  return slugs.map((s) => ({ slug: s.slug }));
}

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      unitAmount: true,
      imageUrl: true,
      currency: true,
    },
  });

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const price = formatPrice(product.unitAmount, product.currency);
  const imageUrl = product.imageUrl || `${env.NEXT_PUBLIC_APP_URL}/og-image.png`;
  const description = product.description || `Buy ${product.name} for ${price}. High-quality product with secure checkout.`;

  return {
    title: product.name,
    description,
    keywords: [
      product.name.toLowerCase(),
      'buy online',
      'ecommerce',
      'shopping',
      price,
    ],
    openGraph: {
      title: `${product.name} | ShopVerse`,
      description,
      url: `${env.NEXT_PUBLIC_APP_URL}/product/${slug}`,
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | ShopVerse`,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `/product/${slug}`,
    },
  };
}

async function ProductData({ slug }: { slug: string }) {
  const p = await prisma.product.findUnique({ where: { slug } });

  if (!p || !p.active) return notFound();

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description || `${p.name} - High-quality product available at ShopVerse`,
    image: p.imageUrl || `${env.NEXT_PUBLIC_APP_URL}/og-image.png`,
    brand: {
      '@type': 'Brand',
      name: 'ShopVerse',
    },
    offers: {
      '@type': 'Offer',
      url: `${env.NEXT_PUBLIC_APP_URL}/product/${slug}`,
      priceCurrency: p.currency.toUpperCase(),
      price: (p.unitAmount / 100).toFixed(2),
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'ShopVerse',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ProductContent p={p} />
    </>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductData slug={slug} />
    </Suspense>
  );
}
