import { analyticsService } from '../services/analyticsService.js';
import { predictiveService } from '../services/predictiveService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getOverview = asyncHandler(async (req, res) => {
  const data = await analyticsService.getOverview();
  res.json({ success: true, data });
});

export const getByCategory = asyncHandler(async (req, res) => {
  const data = await analyticsService.getByCategory();
  res.json({ success: true, data });
});

export const getByStatus = asyncHandler(async (req, res) => {
  const data = await analyticsService.getByStatus();
  res.json({ success: true, data });
});

export const getByPriority = asyncHandler(async (req, res) => {
  const data = await analyticsService.getByPriority();
  res.json({ success: true, data });
});

export const getByBuilding = asyncHandler(async (req, res) => {
  const data = await analyticsService.getByBuilding();
  res.json({ success: true, data });
});

export const getMonthlyTrend = asyncHandler(async (req, res) => {
  const data = await analyticsService.getMonthlyTrend();
  res.json({ success: true, data });
});

export const getTopRecurringIssues = asyncHandler(async (req, res) => {
  const data = await analyticsService.getTopRecurringIssues();
  res.json({ success: true, data });
});

export const getStaffPerformance = asyncHandler(async (req, res) => {
  const data = await analyticsService.getStaffPerformance();
  res.json({ success: true, data });
});

export const getAttentionNeeded = asyncHandler(async (req, res) => {
  const data = await analyticsService.getAttentionNeeded();
  res.json({ success: true, data });
});

export const getMyPerformance = asyncHandler(async (req, res) => {
  const data = await analyticsService.getMyPerformance(req.user.id);
  res.json({ success: true, data });
});

export const getPredictiveInsights = asyncHandler(async (req, res) => {
  const data = await predictiveService.generateInsights(req.query.campusId);
  res.json({ success: true, count: data.length, data });
});

export default {
  getOverview,
  getByCategory,
  getByStatus,
  getByPriority,
  getByBuilding,
  getMonthlyTrend,
  getTopRecurringIssues,
  getStaffPerformance,
  getAttentionNeeded,
  getMyPerformance,
  getPredictiveInsights
};

