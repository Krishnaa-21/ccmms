import express from 'express';
import { getInventory, recordPartsUsed } from '../controllers/inventoryController.js';
import { requireAuth, requireStaff } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getInventory);
router.post('/record-usage', requireStaff, recordPartsUsed);

export default router;
