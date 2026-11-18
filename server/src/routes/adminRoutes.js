import express from 'express';
import { handleResetDemoData, triggerSlaScan } from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.post('/reset-demo-data', handleResetDemoData);
router.post('/trigger-sla-scan', triggerSlaScan);

export default router;

