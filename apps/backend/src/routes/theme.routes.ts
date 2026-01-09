import { Router } from 'express';
import { body } from 'express-validator';
import {
  getActiveTheme,
  getAllThemes,
  getThemeById,
  createTheme,
  updateTheme,
  activateTheme,
  deleteTheme,
  duplicateTheme,
} from '../controllers/theme.controller';
import { authenticate, isAdmin } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

const createThemeValidation = [
  body('name').trim().notEmpty().withMessage('Theme name is required'),
];

// Public route - mobile app needs to fetch active theme
router.get('/active', getActiveTheme);

// Admin routes
router.get('/', authenticate, isAdmin, getAllThemes);
router.get('/:id', authenticate, isAdmin, getThemeById);
router.post('/', authenticate, isAdmin, validate(createThemeValidation), createTheme);
router.put('/:id', authenticate, isAdmin, updateTheme);
router.post('/:id/activate', authenticate, isAdmin, activateTheme);
router.post('/:id/duplicate', authenticate, isAdmin, duplicateTheme);
router.delete('/:id', authenticate, isAdmin, deleteTheme);

export default router;
