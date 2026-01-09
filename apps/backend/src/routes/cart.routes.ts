import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

const addToCartValidation = [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

const updateCartItemValidation = [
  param('itemId').notEmpty(),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

// All cart routes require authentication
router.use(authenticate);

router.get('/', getCart);
router.post('/items', validate(addToCartValidation), addToCart);
router.put('/items/:itemId', validate(updateCartItemValidation), updateCartItem);
router.delete('/items/:itemId', removeFromCart);
router.delete('/', clearCart);

export default router;
