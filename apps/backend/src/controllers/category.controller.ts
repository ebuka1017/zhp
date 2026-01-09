import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';
import { successResponse, errorResponse } from '../utils/response';

export const getAllCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { includeProducts = 'false' } = req.query;

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        children: true,
        ...(includeProducts === 'true' && {
          products: {
            where: { status: 'PUBLISHED' },
            take: 10,
            include: {
              images: {
                take: 1,
                orderBy: { displayOrder: 'asc' },
              },
            },
          },
        }),
      },
      orderBy: { displayOrder: 'asc' },
    });

    successResponse(res, categories);
  } catch (error) {
    console.error('Get categories error:', error);
    errorResponse(res, 'Failed to get categories', 500);
  }
};

export const getCategoryById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        parent: true,
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      errorResponse(res, 'Category not found', 404);
      return;
    }

    successResponse(res, category);
  } catch (error) {
    console.error('Get category error:', error);
    errorResponse(res, 'Failed to get category', 500);
  }
};

export const getCategoryBySlug = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        children: true,
        parent: true,
        products: {
          where: { status: 'PUBLISHED' },
          include: {
            images: {
              take: 1,
              orderBy: { displayOrder: 'asc' },
            },
          },
          take: 20,
        },
      },
    });

    if (!category) {
      errorResponse(res, 'Category not found', 404);
      return;
    }

    successResponse(res, category);
  } catch (error) {
    console.error('Get category error:', error);
    errorResponse(res, 'Failed to get category', 500);
  }
};

export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, slug, description, image, parentId, displayOrder } = req.body;

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image,
        parentId,
        displayOrder: displayOrder || 0,
      },
    });

    successResponse(res, category, 'Category created successfully', 201);
  } catch (error) {
    console.error('Create category error:', error);
    errorResponse(res, 'Failed to create category', 500);
  }
};

export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    successResponse(res, category, 'Category updated successfully');
  } catch (error) {
    console.error('Update category error:', error);
    errorResponse(res, 'Failed to update category', 500);
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if category has products
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      errorResponse(res, 'Category not found', 404);
      return;
    }

    if (category._count.products > 0) {
      errorResponse(res, 'Cannot delete category with products', 400);
      return;
    }

    await prisma.category.delete({
      where: { id },
    });

    successResponse(res, null, 'Category deleted successfully');
  } catch (error) {
    console.error('Delete category error:', error);
    errorResponse(res, 'Failed to delete category', 500);
  }
};
