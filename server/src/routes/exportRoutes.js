import express from 'express';
import {
  exportComplaintsCSV,
  exportAnalyticsPDF
} from '../controllers/exportController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/complaints.csv', exportComplaintsCSV);
router.get('/analytics.pdf', exportAnalyticsPDF);

export default router;
