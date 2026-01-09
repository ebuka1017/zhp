import prisma from './config/database';
import { hashPassword } from './utils/password';
import { UserRole, ProductStatus } from '@prisma/client';

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Create Super Admin
    const adminPassword = await hashPassword('Admin@123');
    const admin = await prisma.user.upsert({
      where: { email: 'admin@ecommerce.com' },
      update: {},
      create: {
        email: 'admin@ecommerce.com',
        password: adminPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: UserRole.SUPER_ADMIN,
        isEmailVerified: true,
        isActive: true,
      },
    });
    console.log('✅ Created super admin:', admin.email);

    // Create Store Admin
    const storeAdminPassword = await hashPassword('Store@123');
    const storeAdmin = await prisma.user.upsert({
      where: { email: 'store@ecommerce.com' },
      update: {},
      create: {
        email: 'store@ecommerce.com',
        password: storeAdminPassword,
        firstName: 'Store',
        lastName: 'Admin',
        role: UserRole.STORE_ADMIN,
        isEmailVerified: true,
        isActive: true,
      },
    });
    console.log('✅ Created store admin:', storeAdmin.email);

    // Create Test Customer
    const customerPassword = await hashPassword('Customer@123');
    const customer = await prisma.user.upsert({
      where: { email: 'customer@test.com' },
      update: {},
      create: {
        email: 'customer@test.com',
        password: customerPassword,
        firstName: 'Test',
        lastName: 'Customer',
        role: UserRole.CUSTOMER,
        isEmailVerified: true,
        isActive: true,
      },
    });
    console.log('✅ Created test customer:', customer.email);

    // Create Categories
    const electronics = await prisma.category.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and gadgets',
        isActive: true,
        displayOrder: 1,
      },
    });

    const smartphones = await prisma.category.upsert({
      where: { slug: 'smartphones' },
      update: {},
      create: {
        name: 'Smartphones',
        slug: 'smartphones',
        description: 'Latest smartphones',
        parentId: electronics.id,
        isActive: true,
        displayOrder: 1,
      },
    });

    const clothing = await prisma.category.upsert({
      where: { slug: 'clothing' },
      update: {},
      create: {
        name: 'Clothing',
        slug: 'clothing',
        description: 'Fashion and apparel',
        isActive: true,
        displayOrder: 2,
      },
    });

    console.log('✅ Created categories');

    // Create Sample Products
    const products = [
      {
        name: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        description: 'The latest iPhone with A17 Pro chip',
        shortDescription: 'Latest iPhone with powerful features',
        basePrice: 999.99,
        salePrice: 949.99,
        sku: 'IPHONE-15-PRO',
        status: ProductStatus.PUBLISHED,
        categoryId: smartphones.id,
        brandName: 'Apple',
        tags: ['smartphone', 'apple', 'flagship'],
        isFeatured: true,
        metaTitle: 'iPhone 15 Pro - Buy Now',
        metaDescription: 'Get the latest iPhone 15 Pro with amazing features',
        images: {
          create: [
            {
              url: 'https://via.placeholder.com/800x800/3B82F6/FFFFFF?text=iPhone+15+Pro',
              altText: 'iPhone 15 Pro',
              displayOrder: 0,
            },
          ],
        },
        inventory: {
          create: {
            quantity: 100,
            reservedQuantity: 0,
            lowStockThreshold: 10,
          },
        },
      },
      {
        name: 'Samsung Galaxy S24',
        slug: 'samsung-galaxy-s24',
        description: 'Premium Android smartphone with AI features',
        shortDescription: 'AI-powered Android flagship',
        basePrice: 899.99,
        sku: 'SAMSUNG-S24',
        status: ProductStatus.PUBLISHED,
        categoryId: smartphones.id,
        brandName: 'Samsung',
        tags: ['smartphone', 'android', 'samsung'],
        isFeatured: true,
        images: {
          create: [
            {
              url: 'https://via.placeholder.com/800x800/8B5CF6/FFFFFF?text=Galaxy+S24',
              altText: 'Samsung Galaxy S24',
              displayOrder: 0,
            },
          ],
        },
        inventory: {
          create: {
            quantity: 80,
            reservedQuantity: 0,
            lowStockThreshold: 10,
          },
        },
      },
      {
        name: 'Classic T-Shirt',
        slug: 'classic-t-shirt',
        description: 'Comfortable cotton t-shirt in various colors',
        shortDescription: '100% cotton comfortable t-shirt',
        basePrice: 29.99,
        sku: 'TSHIRT-001',
        status: ProductStatus.PUBLISHED,
        categoryId: clothing.id,
        brandName: 'Generic',
        tags: ['clothing', 't-shirt', 'casual'],
        isFeatured: false,
        images: {
          create: [
            {
              url: 'https://via.placeholder.com/800x800/10B981/FFFFFF?text=T-Shirt',
              altText: 'Classic T-Shirt',
              displayOrder: 0,
            },
          ],
        },
        variants: {
          create: [
            {
              name: 'Small - Blue',
              sku: 'TSHIRT-001-S-BLUE',
              attributes: { size: 'S', color: 'Blue' },
            },
            {
              name: 'Medium - Blue',
              sku: 'TSHIRT-001-M-BLUE',
              attributes: { size: 'M', color: 'Blue' },
            },
            {
              name: 'Large - Blue',
              sku: 'TSHIRT-001-L-BLUE',
              attributes: { size: 'L', color: 'Blue' },
            },
          ],
        },
        inventory: {
          create: {
            quantity: 200,
            reservedQuantity: 0,
            lowStockThreshold: 20,
          },
        },
      },
    ];

    for (const productData of products) {
      await prisma.product.upsert({
        where: { sku: productData.sku },
        update: {},
        create: productData,
      });
    }

    console.log('✅ Created sample products');

    // Create Default Theme
    await prisma.theme.upsert({
      where: { name: 'Default Theme' },
      update: {},
      create: {
        name: 'Default Theme',
        isActive: true,
        primaryColor: '#3B82F6',
        secondaryColor: '#8B5CF6',
        accentColor: '#10B981',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        darkPrimaryColor: '#60A5FA',
        darkSecondaryColor: '#A78BFA',
        darkAccentColor: '#34D399',
        darkBackgroundColor: '#111827',
        darkTextColor: '#F9FAFB',
        fontFamily: 'Inter',
        fontSize: { base: 16, scale: 1.2 },
        borderRadius: { sm: 4, md: 8, lg: 16, xl: 24 },
        spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
        glassBlur: 10,
        glassOpacity: 0.8,
        defaultMode: 'light',
      },
    });

    console.log('✅ Created default theme');

    // Create Settings
    await prisma.setting.upsert({
      where: { key: 'store_name' },
      update: {},
      create: {
        key: 'store_name',
        value: 'Modern E-Commerce',
        description: 'Store name displayed in the app',
      },
    });

    await prisma.setting.upsert({
      where: { key: 'store_description' },
      update: {},
      create: {
        key: 'store_description',
        value: 'Your one-stop shop for everything',
        description: 'Store tagline or description',
      },
    });

    console.log('✅ Created settings');

    console.log('🎉 Seed completed successfully!');
    console.log('\n📝 Test Accounts:');
    console.log('Super Admin: admin@ecommerce.com / Admin@123');
    console.log('Store Admin: store@ecommerce.com / Store@123');
    console.log('Customer: customer@test.com / Customer@123');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();
