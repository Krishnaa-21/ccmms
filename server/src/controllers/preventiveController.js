import { preventiveService } from '../services/preventiveService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getPreventivePlans = asyncHandler(async (req, res) => {
  const plans = await preventiveService.getAllPlans(req.query.campusId);
  res.json({
    success: true,
    data: plans
  });
});

export const getPreventivePlanById = asyncHandler(async (req, res) => {
  const plan = await preventiveService.getPlanById(req.params.id);
  if (!plan) {
    return res.status(404).json({ success: false, message: 'Plan not found' });
  }
  res.json({
    success: true,
    data: plan
  });
});

export const createPreventivePlan = asyncHandler(async (req, res) => {
  const plan = await preventiveService.createPlan(req.body, req.user);
  res.status(201).json({
    success: true,
    message: 'Preventive maintenance plan established',
    data: plan
  });
});

export const updatePreventivePlan = asyncHandler(async (req, res) => {
  const updated = await preventiveService.updatePlan(req.params.id, req.body);
  res.json({
    success: true,
    message: 'Preventive plan updated',
    data: updated
  });
});

export const deletePreventivePlan = asyncHandler(async (req, res) => {
  await preventiveService.deletePlan(req.params.id);
  res.json({
    success: true,
    message: 'Preventive plan removed'
  });
});

export const runPreventivePlanNow = asyncHandler(async (req, res) => {
  const result = await preventiveService.runPlan(req.params.id, req.user);
  res.json({
    success: true,
    message: result.message,
    data: result
  });
});

export default {
  getPreventivePlans,
  getPreventivePlanById,
  createPreventivePlan,
  updatePreventivePlan,
  deletePreventivePlan,
  runPreventivePlanNow
};

