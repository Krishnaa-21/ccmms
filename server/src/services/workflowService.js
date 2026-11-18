import { complaintRepo, statusHistoryRepo, auditLogRepo, userRepo } from '../repositories/index.js';
import { STATUS_TRANSITIONS } from '../config/constants.js';
import { notificationService } from './notificationService.js';

export const workflowService = {
  /**
   * Enforces role-based transition matrix and applies the status change
   */
  async changeStatus(complaintId, targetStatus, payload, actor) {
    const complaint = await complaintRepo.findById(complaintId);
    if (!complaint || complaint.isDeleted) {
      const err = new Error('Complaint not found');
      err.statusCode = 404;
      throw err;
    }

    const currentStatus = complaint.status;
    const actorRole = actor.role;

    // Check if transition is permitted for this role
    const allowedTransitions = STATUS_TRANSITIONS[actorRole]?.[currentStatus] || [];
    if (!allowedTransitions.includes(targetStatus)) {
      const err = new Error(
        `Transition from "${currentStatus}" to "${targetStatus}" is not permitted for role "${actorRole}".`
      );
      err.statusCode = 403;
      throw err;
    }

    // Role-specific validations
    if (targetStatus === 'Rejected' && !payload.rejectionReason && !payload.notes) {
      const err = new Error('A rejection reason or note is required to reject a complaint.');
      err.statusCode = 400;
      throw err;
    }

    if (targetStatus === 'Resolved' && !payload.resolutionNotes) {
      const err = new Error('Resolution notes detailing the corrective work performed are required.');
      err.statusCode = 400;
      throw err;
    }

    // Prepare update object
    const now = new Date().toISOString();
    const updates = {
      status: targetStatus,
      updatedAt: now
    };

    if (targetStatus === 'Resolved') {
      updates.resolvedAt = now;
      updates.resolutionNotes = payload.resolutionNotes;
      if (payload.costIncurred !== undefined) updates.estimatedCost = payload.costIncurred;
      if (payload.partsReplaced) updates.partsReplaced = payload.partsReplaced;
    } else if (targetStatus === 'Closed') {
      updates.closedAt = now;
    } else if (targetStatus === 'Rejected') {
      updates.rejectionReason = payload.rejectionReason || payload.notes;
    } else if (targetStatus === 'Reopened') {
      updates.reopenedAt = now;
      updates.reopenReason = payload.notes || payload.reason;
      updates.resolvedAt = null;
      updates.closedAt = null;
    }

    const updatedComplaint = await complaintRepo.update(complaintId, updates);

    // 1. Record StatusHistory
    await statusHistoryRepo.create({
      complaintId,
      trackingNumber: complaint.trackingNumber,
      referenceNumber: complaint.referenceNumber,
      fromStatus: currentStatus,
      status: targetStatus,
      changedBy: { id: actor.id, name: actor.name, role: actor.role },
      notes: payload.notes || payload.rejectionReason || payload.resolutionNotes || `Status transitioned to ${targetStatus}`,
      changedAt: now
    });

    // 2. Record Audit Log
    await auditLogRepo.create({
      action: `COMPLAINT_STATUS_${targetStatus.toUpperCase().replace(/\s+/g, '_')}`,
      entityType: 'Complaint',
      entityId: complaintId,
      actor: { id: actor.id, name: actor.name, role: actor.role },
      details: `Status changed from ${currentStatus} to ${targetStatus} by ${actor.name} (${actor.role})`
    });

    // 3. Dispatch Notifications
    // Notify requester
    if (complaint.createdBy?.id && complaint.createdBy.id !== actor.id) {
      let notifTitle = `Status Update: ${complaint.referenceNumber}`;
      let notifMsg = `Your complaint "${complaint.title}" has been updated to "${targetStatus}".`;

      if (targetStatus === 'Resolved') {
        notifTitle = `Issue Resolved: ${complaint.referenceNumber}`;
        notifMsg = `Work order completed: "${complaint.title}". Please verify and share your feedback.`;
      } else if (targetStatus === 'Rejected') {
        notifTitle = `Complaint Rejected: ${complaint.referenceNumber}`;
        notifMsg = `Your complaint was rejected: ${updates.rejectionReason}`;
      }

      await notificationService.createNotification({
        userId: complaint.createdBy.id,
        title: notifTitle,
        message: notifMsg,
        type: `status_${targetStatus.toLowerCase()}`,
        link: `/student/complaints/${complaintId}`
      });
    }

    // If Reopened, notify assigned staff & admin
    if (targetStatus === 'Reopened') {
      if (complaint.assignedTo?.id) {
        await notificationService.createNotification({
          userId: complaint.assignedTo.id,
          title: `Ticket Reopened: ${complaint.referenceNumber}`,
          message: `Complaint "${complaint.title}" was reopened by student: ${updates.reopenReason}`,
          type: 'ticket_reopened',
          link: `/staff/tasks/${complaintId}`
        });
      }
    }

    // 4. If complaint has merged child tickets, synchronize status to child tickets
    if (complaint.mergedTicketIds && complaint.mergedTicketIds.length > 0 && ['Resolved', 'Closed'].includes(targetStatus)) {
      for (const childId of complaint.mergedTicketIds) {
        try {
          const childUpdates = {
            status: targetStatus,
            updatedAt: now
          };
          if (targetStatus === 'Resolved') {
            childUpdates.resolvedAt = now;
            childUpdates.resolutionNotes = `Resolved via parent ticket #${complaint.referenceNumber}: ${payload.resolutionNotes || 'Maintenance completed.'}`;
          } else if (targetStatus === 'Closed') {
            childUpdates.closedAt = now;
          }
          await complaintRepo.update(childId, childUpdates);

          await statusHistoryRepo.create({
            complaintId: childId,
            trackingNumber: childId,
            referenceNumber: childId,
            fromStatus: 'Merged',
            status: targetStatus,
            changedBy: { id: actor.id, name: actor.name, role: actor.role },
            notes: `Auto-synchronized from parent ticket #${complaint.referenceNumber}`,
            changedAt: now
          });

          const child = await complaintRepo.findById(childId);
          if (child?.createdBy?.id) {
            await notificationService.createNotification({
              userId: child.createdBy.id,
              title: `Merged Ticket ${targetStatus}: ${child.referenceNumber || child.trackingNumber}`,
              message: `Master ticket #${complaint.referenceNumber} has been ${targetStatus.toLowerCase()}. Your issue has been resolved.`,
              type: `status_${targetStatus.toLowerCase()}`,
              link: `/student/complaints/${childId}`
            });
          }
        } catch (syncErr) {
          console.error(`Failed to sync child complaint ${childId}:`, syncErr);
        }
      }
    }

    return updatedComplaint;
  },

  /**
   * Reassigns a complaint to a maintenance staff member
   */
  async assignComplaint(complaintId, staffId, reason, actor) {
    const complaint = await complaintRepo.findById(complaintId);
    if (!complaint || complaint.isDeleted) {
      const err = new Error('Complaint not found');
      err.statusCode = 404;
      throw err;
    }

    const staff = await userRepo.findById(staffId);
    if (!staff || staff.role !== 'staff' || !staff.isActive) {
      const err = new Error('Assigned user must be an active maintenance staff member');
      err.statusCode = 400;
      throw err;
    }

    const previousAssignee = complaint.assignedTo;
    const now = new Date().toISOString();

    const assignedToObj = {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      department: staff.department,
      specialty: staff.specialty
    };

    // If currently Submitted or Under Review, advance status to Assigned
    const newStatus = ['Submitted', 'Under Review'].includes(complaint.status)
      ? 'Assigned'
      : complaint.status;

    const updated = await complaintRepo.update(complaintId, {
      assignedTo: assignedToObj,
      status: newStatus,
      updatedAt: now
    });

    // Record Status History
    await statusHistoryRepo.create({
      complaintId,
      trackingNumber: complaint.trackingNumber,
      referenceNumber: complaint.referenceNumber,
      fromStatus: complaint.status,
      status: newStatus,
      changedBy: { id: actor.id, name: actor.name, role: actor.role },
      notes: reason ? `Assigned to ${staff.name}. Reason: ${reason}` : `Assigned task to ${staff.name} (${staff.specialty})`,
      changedAt: now
    });

    // Audit log
    await auditLogRepo.create({
      action: 'COMPLAINT_ASSIGNED',
      entityType: 'Complaint',
      entityId: complaintId,
      actor: { id: actor.id, name: actor.name, role: actor.role },
      details: `Reassigned from ${previousAssignee?.name || 'Unassigned'} to ${staff.name}`
    });

    // Notify newly assigned staff
    await notificationService.createNotification({
      userId: staff.id,
      title: `New Task Assigned: ${complaint.referenceNumber}`,
      message: `You have been assigned: "${complaint.title}" (${complaint.location.building}, ${complaint.location.room}). Priority: ${complaint.priority}.`,
      type: 'task_assigned',
      link: `/staff/tasks/${complaintId}`
    });

    // Notify requester of assignment
    if (complaint.createdBy?.id) {
      await notificationService.createNotification({
        userId: complaint.createdBy.id,
        title: `Technician Assigned: ${complaint.referenceNumber}`,
        message: `${staff.name} (${staff.department}) has been assigned to resolve your request.`,
        type: 'technician_assigned',
        link: `/student/complaints/${complaintId}`
      });
    }

    return updated;
  },

  /**
   * Overrides complaint priority (admin only)
   */
  async changePriority(complaintId, newPriority, reason, actor) {
    const complaint = await complaintRepo.findById(complaintId);
    if (!complaint || complaint.isDeleted) {
      const err = new Error('Complaint not found');
      err.statusCode = 404;
      throw err;
    }

    const oldPriority = complaint.priority;
    const now = new Date().toISOString();

    const updated = await complaintRepo.update(complaintId, {
      priority: newPriority,
      updatedAt: now
    });

    await auditLogRepo.create({
      action: 'COMPLAINT_PRIORITY_CHANGED',
      entityType: 'Complaint',
      entityId: complaintId,
      actor: { id: actor.id, name: actor.name, role: actor.role },
      details: `Priority changed from ${oldPriority} to ${newPriority}. Reason: ${reason}`
    });

    // Notify assignee if assigned
    if (complaint.assignedTo?.id) {
      await notificationService.createNotification({
        userId: complaint.assignedTo.id,
        title: `Priority Updated: ${complaint.referenceNumber}`,
        message: `Priority changed to "${newPriority}" for ticket "${complaint.title}".`,
        type: 'priority_changed',
        link: `/staff/tasks/${complaintId}`
      });
    }

    return updated;
  },

  /**
   * Reopens a resolved complaint (student / requester)
   */
  async reopenComplaint(complaintId, reason, actor) {
    const complaint = await complaintRepo.findById(complaintId);
    if (!complaint || complaint.isDeleted) {
      const err = new Error('Complaint not found');
      err.statusCode = 404;
      throw err;
    }

    if (actor.role === 'student' && complaint.createdBy?.id !== actor.id) {
      const err = new Error('Only the complaint requester or an administrator can reopen this ticket');
      err.statusCode = 403;
      throw err;
    }

    if (!['Resolved', 'Closed'].includes(complaint.status)) {
      const err = new Error(`Only Resolved or Closed complaints can be reopened. Current status is ${complaint.status}.`);
      err.statusCode = 400;
      throw err;
    }

    return this.changeStatus(complaintId, 'Reopened', { notes: reason, reason }, actor);
  },

  /**
   * Closes a resolved complaint (admin)
   */
  async closeComplaint(complaintId, notes, actor) {
    const complaint = await complaintRepo.findById(complaintId);
    if (!complaint || complaint.isDeleted) {
      const err = new Error('Complaint not found');
      err.statusCode = 404;
      throw err;
    }

    if (complaint.status !== 'Resolved') {
      const err = new Error(`Only complaints in Resolved status can be closed. Current status is ${complaint.status}.`);
      err.statusCode = 400;
      throw err;
    }

    return this.changeStatus(complaintId, 'Closed', { notes }, actor);
  }
};

export default workflowService;

