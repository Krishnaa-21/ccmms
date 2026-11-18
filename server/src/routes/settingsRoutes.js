import express from 'express';
import {
  getSettings,
  updateSettings,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/settingsController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { updateSettingsSchema } from '../validations/commentValidation.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getSettings);
router.patch('/', requireAdmin, validateBody(updateSettingsSchema), updateSettings);

router.post('/categories', requireAdmin, createCategory);
router.patch('/categories/:id', requireAdmin, updateCategory);
router.delete('/categories/:id', requireAdmin, deleteCategory);

export default router;

