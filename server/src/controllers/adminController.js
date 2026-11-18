import { resetDemoData } from '../seed/seed.js';
import { slaService } from '../services/slaService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const handleResetDemoData = asyncHandler(async (req, res) => {
  const result = await resetDemoData();
  res.json({
    success: true,
    message: 'Campus demo data successfully restored to fresh seed state',
    data: result
  });
});

export const triggerSlaScan = asyncHandler(async (req, res) => {
  const result = await slaService.checkAndEscalateOverdueComplaints();
  res.json({
    success: true,
    message: 'Manual SLA scan and escalation check completed successfully',
    data: result
  });
});

export default {
  handleResetDemoData,
  triggerSlaScan
};
