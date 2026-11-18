import { commentRepo, complaintRepo, auditLogRepo } from '../repositories/index.js';
import { notificationService } from './notificationService.js';

export const commentService = {
  /**
   * Adds a discussion comment or internal note to a complaint
   */
  async addComment(complaintId, { content, isInternal = false }, user) {
    const complaint = await complaintRepo.findById(complaintId);
    if (!complaint || complaint.isDeleted) {
      const err = new Error('Complaint not found');
      err.statusCode = 404;
      throw err;
    }

    // Role check: students cannot create internal-only notes
    if (user.role === 'student' && isInternal) {
      const err = new Error('Students cannot post internal administrative notes');
      err.statusCode = 403;
      throw err;
    }

    // Access check: only requester, assigned staff, or admin can comment
    const isRequester = complaint.createdBy?.id === user.id;
    const isAssignee = complaint.assignedTo?.id === user.id;
    const isAdmin = user.role === 'admin';

    if (!isRequester && !isAssignee && !isAdmin) {
      const err = new Error('You do not have permission to comment on this complaint');
      err.statusCode = 403;
      throw err;
    }

    const comment = await commentRepo.create({
      complaintId,
      trackingNumber: complaint.trackingNumber,
      referenceNumber: complaint.referenceNumber,
      author: {
        id: user.id,
        name: user.name,
        role: user.role,
        avatarColor: user.avatarColor || '#2563eb'
      },
      content,
      isInternal: Boolean(isInternal),
      createdAt: new Date().toISOString()
    });

    // Notify other participants (requester, assignee, or admin)
    // 1. If internal, notify assignee/admin only
    // 2. If public, notify requester and assignee
    const recipientIds = new Set();
    if (!isInternal && complaint.createdBy?.id && complaint.createdBy.id !== user.id) {
      recipientIds.add(complaint.createdBy.id);
    }
    if (complaint.assignedTo?.id && complaint.assignedTo.id !== user.id) {
      recipientIds.add(complaint.assignedTo.id);
    }

    for (const recipientId of recipientIds) {
      await notificationService.createNotification({
        userId: recipientId,
        title: `New Comment: ${complaint.referenceNumber}`,
        message: `${user.name} commented: "${content.slice(0, 80)}${content.length > 80 ? '...' : ''}"`,
        type: 'new_comment',
        link: `/complaints/${complaintId}`
      });
    }

    return comment;
  },

  /**
   * Retrieves comments for a complaint, scoping out internal notes for students
   */
  async getComments(complaintId, user) {
    const complaint = await complaintRepo.findById(complaintId);
    if (!complaint || complaint.isDeleted) {
      const err = new Error('Complaint not found');
      err.statusCode = 404;
      throw err;
    }

    let comments = await commentRepo.findByComplaintId(complaintId);

    // If requester is a student, filter out internal administrative notes
    if (user.role === 'student') {
      comments = comments.filter((c) => !c.isInternal);
    }

    // Sort chronologically
    comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return comments;
  }
};

export default commentService;

