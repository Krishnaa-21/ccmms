import { workflowService } from '../services/workflowService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const changeStatus = asyncHandler(async (req, res) => {
  const { status, ...payload } = req.body;
  const updated = await workflowService.changeStatus(req.params.id, status, payload, req.user);

  res.json({
    success: true,
    message: `Complaint status successfully updated to "${status}"`,
    data: updated
  });
});

export const assignComplaint = asyncHandler(async (req, res) => {
  const { staffId, reason } = req.body;
  const updated = await workflowService.assignComplaint(req.params.id, staffId, reason, req.user);

  res.json({
    success: true,
    message: 'Complaint assigned successfully',
    data: updated
  });
});

export const changePriority = asyncHandler(async (req, res) => {
  const { priority, reason } = req.body;
  const updated = await workflowService.changePriority(req.params.id, priority, reason, req.user);

  res.json({
    success: true,
    message: `Priority updated to "${priority}"`,
    data: updated
  });
});

export const reopenComplaint = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const updated = await workflowService.reopenComplaint(req.params.id, reason, req.user);

  res.json({
    success: true,
    message: 'Complaint reopened successfully',
    data: updated
  });
});

export const closeComplaint = asyncHandler(async (req, res) => {
  const { notes } = req.body;
  const updated = await workflowService.closeComplaint(req.params.id, notes, req.user);

  res.json({
    success: true,
    message: 'Complaint closed successfully',
    data: updated
  });
});

export default {
  changeStatus,
  assignComplaint,
  changePriority,
  reopenComplaint,
  closeComplaint
};

