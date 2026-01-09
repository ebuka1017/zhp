import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getAllProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  searchProducts,
} from '../controllers/product.controller';
import { authenticate, isAdmin } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

// Validation rules
const createProductValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('slug').trim().notEmpty().withMessage('Slug is required'),
  body('basePrice').isFloat({ min: 0 }).withMessage('Valid base price is required'),
  body('salePrice').optional().isFloat({ min: 0 }),
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('categoryId').notEmpty().withMessage('Category is required'),
];

const updateProductValidation = [
  param('id').isString().notEmpty(),
  body('name').optional().trim().notEmpty(),
  body('basePrice').optional().isFloat({ min: 0 }),
  body('salePrice').optional().isFloat({ min: 0 }),
];

// Public routes
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/search', searchProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);

// Admin routes
router.post('/', authenticate, isAdmin, validate(createProductValidation), createProduct);
router.put('/:id', authenticate, isAdmin, validate(updateProductValidation), updateProduct);
router.delete('/:id', authenticate, isAdmin, deleteProduct);

export default router;
