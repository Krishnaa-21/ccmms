import express from 'express';
import { getFeedbacks } from '../controllers/feedbackController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', requireAdmin, getFeedbacks);

export default router;

