import express from 'express';
import {
  getOverview,
  getByCategory,
  getByStatus,
  getByPriority,
  getByBuilding,
  getMonthlyTrend,
  getTopRecurringIssues,
  getStaffPerformance,
  getAttentionNeeded,
  getMyPerformance
} from '../controllers/analyticsController.js';
import { requireAuth, requireAdmin, requireStaff } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

// Staff personal performance scorecard
router.get('/my-performance', requireStaff, getMyPerformance);

// Administrative analytics
router.get('/overview', requireAdmin, getOverview);
router.get('/by-category', requireAdmin, getByCategory);
router.get('/by-status', requireAdmin, getByStatus);
router.get('/by-priority', requireAdmin, getByPriority);
router.get('/by-building', requireAdmin, getByBuilding);
router.get('/monthly-trend', requireAdmin, getMonthlyTrend);
router.get('/top-recurring-issues', requireAdmin, getTopRecurringIssues);
router.get('/staff-performance', requireAdmin, getStaffPerformance);
router.get('/attention-needed', requireAdmin, getAttentionNeeded);

export default router;
