import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';
import { successResponse, errorResponse } from '../utils/response';
import { ProductStatus } from '@prisma/client';

export const getAllProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '20',
      search,
      category,
      status,
      minPrice,
      maxPrice,
      isFeatured,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { sku: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.categoryId = category as string;
    }

    if (status) {
      where.status = status as ProductStatus;
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured === 'true';
    }

    if (minPrice || maxPrice) {
      where.basePrice = {};
      if (minPrice) where.basePrice.gte = parseFloat(minPrice as string);
      if (maxPrice) where.basePrice.lte = parseFloat(maxPrice as string);
    }

    // Get products
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: {
            orderBy: { displayOrder: 'asc' },
          },
          variants: true,
          inventory: true,
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    successResponse(res, {
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    errorResponse(res, 'Failed to get products', 500);
  }
};

export const getProductById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        variants: true,
        inventory: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      errorResponse(res, 'Product not found', 404);
      return;
    }

    // Increment view count
    await prisma.product.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    successResponse(res, product);
  } catch (error) {
    console.error('Get product error:', error);
    errorResponse(res, 'Failed to get product', 500);
  }
};

export const getProductBySlug = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        variants: true,
        inventory: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      errorResponse(res, 'Product not found', 404);
      return;
    }

    // Increment view count
    await prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    });

    successResponse(res, product);
  } catch (error) {
    console.error('Get product error:', error);
    errorResponse(res, 'Failed to get product', 500);
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      slug,
      description,
      shortDescription,
      basePrice,
      salePrice,
      sku,
      status,
      categoryId,
      brandName,
      tags,
      isFeatured,
      metaTitle,
      metaDescription,
      metaKeywords,
      images,
      variants,
      inventory,
    } = req.body;

    // Check if SKU already exists
    const existingSku = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingSku) {
      errorResponse(res, 'SKU already exists', 409);
      return;
    }

    // Create product with relations
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        shortDescription,
        basePrice: parseFloat(basePrice),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        sku,
        status: status || ProductStatus.DRAFT,
        categoryId,
        brandName,
        tags: tags || [],
        isFeatured: isFeatured || false,
        metaTitle,
        metaDescription,
        metaKeywords: metaKeywords || [],
        images: images
          ? {
              create: images.map((img: any, index: number) => ({
                url: img.url,
                altText: img.altText,
                displayOrder: img.displayOrder || index,
              })),
            }
          : undefined,
        variants: variants
          ? {
              create: variants.map((variant: any) => ({
                name: variant.name,
                sku: variant.sku,
                price: variant.price ? parseFloat(variant.price) : null,
                attributes: variant.attributes,
              })),
            }
          : undefined,
        inventory: inventory
          ? {
              create: {
                quantity: inventory.quantity || 0,
                reservedQuantity: 0,
                lowStockThreshold: inventory.lowStockThreshold || 10,
              },
            }
          : undefined,
      },
      include: {
        category: true,
        images: true,
        variants: true,
        inventory: true,
      },
    });

    successResponse(res, product, 'Product created successfully', 201);
  } catch (error) {
    console.error('Create product error:', error);
    errorResponse(res, 'Failed to create product', 500);
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      errorResponse(res, 'Product not found', 404);
      return;
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        basePrice: updateData.basePrice ? parseFloat(updateData.basePrice) : undefined,
        salePrice: updateData.salePrice ? parseFloat(updateData.salePrice) : undefined,
      },
      include: {
        category: true,
        images: true,
        variants: true,
        inventory: true,
      },
    });

    successResponse(res, product, 'Product updated successfully');
  } catch (error) {
    console.error('Update product error:', error);
    errorResponse(res, 'Failed to update product', 500);
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id },
    });

    successResponse(res, null, 'Product deleted successfully');
  } catch (error) {
    console.error('Delete product error:', error);
    errorResponse(res, 'Failed to delete product', 500);
  }
};

export const getFeaturedProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = '10' } = req.query;

    const products = await prisma.product.findMany({
      where: {
        isFeatured: true,
        status: ProductStatus.PUBLISHED,
      },
      take: parseInt(limit as string),
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: { displayOrder: 'asc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    successResponse(res, products);
  } catch (error) {
    console.error('Get featured products error:', error);
    errorResponse(res, 'Failed to get featured products', 500);
  }
};

export const searchProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q) {
      errorResponse(res, 'Search query is required', 400);
      return;
    }

    const products = await prisma.product.findMany({
      where: {
        status: ProductStatus.PUBLISHED,
        OR: [
          { name: { contains: q as string, mode: 'insensitive' } },
          { description: { contains: q as string, mode: 'insensitive' } },
          { tags: { has: q as string } },
        ],
      },
      take: 20,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: { displayOrder: 'asc' },
          take: 1,
        },
      },
    });

    successResponse(res, products);
  } catch (error) {
    console.error('Search products error:', error);
    errorResponse(res, 'Failed to search products', 500);
  }
};
