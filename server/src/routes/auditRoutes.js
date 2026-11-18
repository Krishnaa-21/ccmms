import express from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/', getAuditLogs);

export default router;

