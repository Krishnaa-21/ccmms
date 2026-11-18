import { complaintService } from '../services/complaintService.js';
import { automationService } from '../services/automationService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createComplaint = asyncHandler(async (req, res) => {
  const files = req.files || [];
  const result = await complaintService.createComplaint(req.body, req.user, files);

  res.status(201).json({
    success: true,
    message: 'Complaint submitted successfully',
    data: result.complaint,
    meta: {
      prioritySuggestion: result.prioritySuggestion,
      possibleDuplicates: result.duplicatesFound
    }
  });
});

export const getComplaints = asyncHandler(async (req, res) => {
  const result = await complaintService.getComplaints(req.query, req.user);
  res.json({
    success: true,
    data: result.complaints,
    pagination: result.pagination
  });
});

export const getComplaintById = asyncHandler(async (req, res) => {
  const complaint = await complaintService.getComplaintById(req.params.id, req.user);
  res.json({
    success: true,
    data: complaint
  });
});

export const updateComplaint = asyncHandler(async (req, res) => {
  const updated = await complaintService.updateComplaint(req.params.id, req.body, req.user);
  res.json({
    success: true,
    message: 'Complaint updated successfully',
    data: updated
  });
});

export const deleteComplaint = asyncHandler(async (req, res) => {
  const result = await complaintService.deleteComplaint(req.params.id, req.user);
  res.json({
    success: true,
    message: result.message
  });
});

export const upvoteComplaint = asyncHandler(async (req, res) => {
  const result = await complaintService.upvoteComplaint(req.params.id, req.user);
  res.json({
    success: true,
    message: result.message,
    data: {
      upvotesCount: result.upvotesCount,
      priority: result.priority,
      autoEscalated: result.autoEscalated
    }
  });
});

export const suggestPriority = asyncHandler(async (req, res) => {
  const { title, description, categoryId } = req.body;
  const suggestion = automationService.suggestPriority(title, description, categoryId);
  const estimatedHours = await automationService.getEstimatedResolutionTime(categoryId, suggestion.priority);

  res.json({
    success: true,
    data: {
      ...suggestion,
      estimatedResolutionHours: estimatedHours
    }
  });
});

export default {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  upvoteComplaint,
  suggestPriority
};
