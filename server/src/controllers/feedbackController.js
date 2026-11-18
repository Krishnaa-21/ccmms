import { feedbackService } from '../services/feedbackService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const submitFeedback = asyncHandler(async (req, res) => {
  const feedback = await feedbackService.submitFeedback(req.params.id, req.body, req.user);
  res.status(201).json({
    success: true,
    message: 'Feedback submitted successfully. Thank you for rating our facilities service!',
    data: feedback
  });
});

export const getFeedbacks = asyncHandler(async (req, res) => {
  const result = await feedbackService.getFeedbacks(req.query);
  res.json({
    success: true,
    data: result.feedbacks,
    meta: {
      total: result.total,
      averageRating: result.averageRating
    }
  });
});

export default {
  submitFeedback,
  getFeedbacks
};
