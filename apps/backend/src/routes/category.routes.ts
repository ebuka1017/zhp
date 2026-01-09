import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';
import { authenticate, isAdmin } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

const createCategoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('slug').trim().notEmpty().withMessage('Slug is required'),
];

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.get('/slug/:slug', getCategoryBySlug);

// Admin routes
router.post('/', authenticate, isAdmin, validate(createCategoryValidation), createCategory);
router.put('/:id', authenticate, isAdmin, updateCategory);
router.delete('/:id', authenticate, isAdmin, deleteCategory);

export default router;
