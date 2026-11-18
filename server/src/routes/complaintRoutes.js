import express from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  upvoteComplaint,
  suggestPriority
} from '../controllers/complaintController.js';
import {
  changeStatus,
  assignComplaint,
  changePriority,
  reopenComplaint,
  closeComplaint
} from '../controllers/workflowController.js';
import { addComment, getComments } from '../controllers/commentController.js';
import { submitFeedback } from '../controllers/feedbackController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { handleUpload } from '../middleware/upload.js';
import { validateBody } from '../middleware/validate.js';
import {
  createComplaintSchema,
  updateComplaintSchema,
  suggestPrioritySchema
} from '../validations/complaintValidation.js';
import {
  statusChangeSchema,
  assignSchema,
  priorityChangeSchema,
  reopenSchema,
  closeSchema
} from '../validations/workflowValidation.js';
import { createCommentSchema, createFeedbackSchema } from '../validations/commentValidation.js';

const router = express.Router();

// All complaint routes require authentication
router.use(requireAuth);

// 1. Complaint CRUD
router.post('/', handleUpload, validateBody(createComplaintSchema), createComplaint);
router.get('/', getComplaints);
router.post('/suggest-priority', validateBody(suggestPrioritySchema), suggestPriority);

router.get('/:id', getComplaintById);
router.patch('/:id', requireAdmin, validateBody(updateComplaintSchema), updateComplaint);
router.delete('/:id', requireAdmin, deleteComplaint);

// 2. Upvoting ("Me Too")
router.post('/:id/upvote', upvoteComplaint);

// 3. Workflow transitions
router.patch('/:id/status', validateBody(statusChangeSchema), changeStatus);
router.patch('/:id/assign', requireAdmin, validateBody(assignSchema), assignComplaint);
router.patch('/:id/priority', requireAdmin, validateBody(priorityChangeSchema), changePriority);
router.post('/:id/reopen', validateBody(reopenSchema), reopenComplaint);
router.post('/:id/close', requireAdmin, validateBody(closeSchema), closeComplaint);

// 4. Threaded Discussion Comments
router.post('/:id/comments', validateBody(createCommentSchema), addComment);
router.get('/:id/comments', getComments);

// 5. Feedback & Ratings
router.post('/:id/feedback', validateBody(createFeedbackSchema), submitFeedback);

export default router;

