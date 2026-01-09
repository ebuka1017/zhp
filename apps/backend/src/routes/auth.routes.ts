import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { authLimiter } from '../middleware/rateLimit';

const router = Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('phoneNumber').optional().trim(),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const refreshTokenValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];

const verifyEmailValidation = [
  body('token').notEmpty().withMessage('Verification token is required'),
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
];

const updateProfileValidation = [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('phoneNumber').optional().trim(),
];

// Routes
router.post('/register', authLimiter, validate(registerValidation), register);
router.post('/login', authLimiter, validate(loginValidation), login);
router.post('/refresh-token', validate(refreshTokenValidation), refreshToken);
router.post('/logout', authenticate, logout);
router.post('/verify-email', validate(verifyEmailValidation), verifyEmail);
router.post('/forgot-password', authLimiter, validate(forgotPasswordValidation), forgotPassword);
router.post('/reset-password', validate(resetPasswordValidation), resetPassword);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validate(updateProfileValidation), updateProfile);

export default router;
