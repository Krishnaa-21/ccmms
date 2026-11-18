import { feedbackRepo, complaintRepo, auditLogRepo } from '../repositories/index.js';
import { notificationService } from './notificationService.js';

export const feedbackService = {
  /**
   * Submits user rating and review for a resolved/closed complaint
   */
  async submitFeedback(complaintId, data, user) {
    const complaint = await complaintRepo.findById(complaintId);
    if (!complaint || complaint.isDeleted) {
      const err = new Error('Complaint not found');
      err.statusCode = 404;
      throw err;
    }

    // Invariant 1: Only the original requester can submit feedback
    if (complaint.createdBy?.id !== user.id) {
      const err = new Error('Only the complaint requester can submit feedback');
      err.statusCode = 403;
      throw err;
    }

    // Invariant 2: Can only submit feedback after Resolved or Closed
    if (!['Resolved', 'Closed'].includes(complaint.status)) {
      const err = new Error(`Feedback can only be submitted for Resolved or Closed complaints. Current status is ${complaint.status}.`);
      err.statusCode = 400;
      throw err;
    }

    // Invariant 3: Only one feedback entry allowed per complaint
    const existingFeedback = await feedbackRepo.findByComplaintId(complaintId);
    if (existingFeedback) {
      const err = new Error('Feedback has already been submitted for this complaint');
      err.statusCode = 400;
      throw err;
    }

    const feedback = await feedbackRepo.create({
      complaintId,
      trackingNumber: complaint.trackingNumber,
      referenceNumber: complaint.referenceNumber,
      categoryId: complaint.categoryId,
      categoryName: complaint.categoryName,
      staffId: complaint.assignedTo?.id || null,
      staffName: complaint.assignedTo?.name || null,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      rating: Number(data.rating),
      comment: data.comment,
      timelinessRating: data.timelinessRating ? Number(data.timelinessRating) : Number(data.rating),
      cleanlinessRating: data.cleanlinessRating ? Number(data.cleanlinessRating) : 5,
      technicianBehaviorRating: data.technicianBehaviorRating ? Number(data.technicianBehaviorRating) : 5,
      createdAt: new Date().toISOString()
    });

    await auditLogRepo.create({
      action: 'FEEDBACK_SUBMITTED',
      entityType: 'Feedback',
      entityId: feedback.id,
      actor: { id: user.id, name: user.name, role: user.role },
      details: `User submitted ${data.rating}-star feedback for ${complaint.referenceNumber}`
    });

    // Notify assigned staff of feedback
    if (complaint.assignedTo?.id) {
      await notificationService.createNotification({
        userId: complaint.assignedTo.id,
        title: `Feedback Received: ${data.rating} Stars!`,
        message: `${user.name} rated work on ticket ${complaint.referenceNumber}: "${data.comment}"`,
        type: 'feedback_received',
        link: `/staff/tasks/${complaintId}`
      });
    }

    return feedback;
  },

  /**
   * Retrieves all feedback records with optional filtering (admin)
   */
  async getFeedbacks(filters = {}) {
    let list = await feedbackRepo.findAll();

    if (filters.rating) {
      list = list.filter((f) => f.rating === Number(filters.rating));
    }
    if (filters.categoryId) {
      list = list.filter((f) => f.categoryId === filters.categoryId);
    }
    if (filters.staffId) {
      list = list.filter((f) => f.staffId === filters.staffId);
    }

    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = list.length;
    const avg = total > 0
      ? +(list.reduce((acc, curr) => acc + curr.rating, 0) / total).toFixed(1)
      : 0;

    return {
      total,
      averageRating: avg,
      feedbacks: list
    };
  }
};

export default feedbackService;
