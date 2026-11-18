import express from 'express';
import {
  getPreventivePlans,
  getPreventivePlanById,
  createPreventivePlan,
  updatePreventivePlan,
  deletePreventivePlan,
  runPreventivePlanNow
} from '../controllers/preventiveController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getPreventivePlans);
router.get('/:id', getPreventivePlanById);
router.post('/', requireAdmin, createPreventivePlan);
router.patch('/:id', requireAdmin, updatePreventivePlan);
router.delete('/:id', requireAdmin, deletePreventivePlan);
router.post('/:id/run-now', requireAdmin, runPreventivePlanNow);

export default router;

