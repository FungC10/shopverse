import { prisma } from '../lib/prisma';

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (in correct order to respect foreign keys)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  // Create 8 demo products
  const products = await prisma.product.createMany({
    data: [
      {
        slug: 'wireless-headphones',
        name: 'Premium Wireless Headphones',
        description: 'High-quality over-ear headphones with active noise cancellation and 30-hour battery life.',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
        currency: 'usd',
        unitAmount: 29999, // $299.99
        active: true,
      },
      {
        slug: 'smart-watch',
        name: 'Smart Watch Pro',
        description: 'Feature-rich smartwatch with health tracking, GPS, and always-on display.',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
        currency: 'usd',
        unitAmount: 39999, // $399.99
        active: true,
      },
      {
        slug: 'laptop-stand',
        name: 'Ergonomic Laptop Stand',
        description: 'Adjustable aluminum stand that raises your laptop for better posture and cooling.',
        imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
        currency: 'usd',
        unitAmount: 7999, // $79.99
        active: true,
      },
      {
        slug: 'wireless-mouse',
        name: 'Ergonomic Wireless Mouse',
        description: 'Comfortable wireless mouse with precision tracking and long battery life.',
        imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop',
        currency: 'usd',
        unitAmount: 4999, // $49.99
        active: true,
      },
      {
        slug: 'mechanical-keyboard',
        name: 'Mechanical Keyboard',
        description: 'RGB-backlit mechanical keyboard with cherry MX switches and aluminum frame.',
        imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop',
        currency: 'usd',
        unitAmount: 14999, // $149.99
        active: true,
      },
      {
        slug: 'usb-c-hub',
        name: 'USB-C Hub Multiport',
        description: 'Compact hub with HDMI, USB-A, USB-C, and SD card reader ports.',
        imageUrl: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=400&fit=crop',
        currency: 'usd',
        unitAmount: 5999, // $59.99
        active: true,
      },
      {
        slug: 'monitor-arm',
        name: 'Dual Monitor Arm',
        description: 'Heavy-duty monitor mount supporting two displays up to 32 inches each.',
        imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=400&fit=crop',
        currency: 'usd',
        unitAmount: 12999, // $129.99
        active: true,
      },
      {
        slug: 'desk-mat',
        name: 'Extended Desk Mat',
        description: 'Large premium desk pad with smooth surface for mouse and keyboard. Water-resistant.',
        imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop',
        currency: 'usd',
        unitAmount: 3499, // $34.99
        active: true,
      },
    ],
  });

  console.log(`✅ Created ${products.count} products`);
  console.log('📦 Products seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

