import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createOrder,
  getOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/order.controller';
import { authenticate, isAdmin } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

const createOrderValidation = [
  body('addressId').notEmpty().withMessage('Address is required'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
];

const updateOrderStatusValidation = [
  param('id').notEmpty(),
  body('status').notEmpty().withMessage('Status is required'),
];

// Customer routes
router.post('/', authenticate, validate(createOrderValidation), createOrder);
router.get('/my-orders', authenticate, getOrders);
router.get('/:id', authenticate, getOrderById);
router.post('/:id/cancel', authenticate, cancelOrder);

// Admin routes
router.get('/admin/all', authenticate, isAdmin, getAllOrders);
router.put('/:id/status', authenticate, isAdmin, validate(updateOrderStatusValidation), updateOrderStatus);

export default router;
