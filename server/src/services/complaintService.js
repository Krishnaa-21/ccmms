import {
  complaintRepo,
  categoryRepo,
  statusHistoryRepo,
  commentRepo,
  feedbackRepo,
  auditLogRepo,
  settingsRepo,
  userRepo
} from '../repositories/index.js';
import { automationService } from './automationService.js';
import { notificationService } from './notificationService.js';
import { DEFAULT_SLA_HOURS } from '../config/constants.js';

export const complaintService = {
  /**
   * Creates a new complaint with auto-priority, duplicate detection, and auto-assignment
   */
  async createComplaint(data, user, files = []) {
    // 1. Resolve Category
    let category = await categoryRepo.findById(data.categoryId);
    if (!category) {
      category = await categoryRepo.findByName(data.categoryId);
    }
    if (!category) {
      const err = new Error(`Category "${data.categoryId}" not found`);
      err.statusCode = 400;
      throw err;
    }

    // 2. Suggest or validate Priority
    let priority = data.priority;
    let prioritySuggestion = null;
    if (!priority) {
      prioritySuggestion = automationService.suggestPriority(data.title, data.description, category.id);
      priority = prioritySuggestion.priority;
    }

    // 3. Check for potential duplicate complaints
    const duplicates = await automationService.findDuplicates({
      title: data.title,
      building: data.building,
      room: data.room,
      categoryId: category.id
    });

    // 4. Generate Human-friendly Reference Number: CCM-2026-XXXX
    const allComplaints = await complaintRepo.findAll();
    const nextSeq = allComplaints.length + 1;
    const referenceNumber = `CCM-2026-${String(nextSeq).padStart(4, '0')}`;
    const trackingNumber = `CMP-2026-${String(nextSeq).padStart(3, '0')}`;

    // 5. Calculate SLA & Due Date
    const settings = await settingsRepo.getSettings();
    const slaHours = category.slaHours?.[priority] ||
      settings?.slaThresholdHours?.[priority] ||
      DEFAULT_SLA_HOURS[priority] || 24;

    const createdAt = new Date().toISOString();
    const dueDateObj = new Date();
    dueDateObj.setHours(dueDateObj.getHours() + slaHours);
    const dueDate = dueDateObj.toISOString();

    // 6. Map uploaded file attachments
    const attachments = files.map((file, idx) => ({
      id: `att_${Date.now()}_${idx}`,
      filename: file.originalname,
      storedFilename: file.filename,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      mimeType: file.mimetype,
      url: `/uploads/${file.filename}`,
      uploadedAt: createdAt
    }));

    // 7. Auto-assignment check
    let assignedStaff = null;
    let initialStatus = 'Submitted';

    const shouldAutoAssign = settings?.autoAssignment !== false;
    if (shouldAutoAssign) {
      assignedStaff = await automationService.autoAssignStaff(category.name);
      if (assignedStaff) {
        initialStatus = 'Assigned';
      }
    }

    // 8. Assemble Complaint Object
    const complaintData = {
      trackingNumber,
      referenceNumber,
      title: data.title,
      description: data.description,
      categoryId: category.id,
      categoryName: category.name,
      categoryColor: category.color || '#3b82f6',
      categoryIcon: category.icon || 'HelpCircle',
      subCategory: data.subCategory,
      priority,
      status: initialStatus,
      location: {
        building: data.building,
        floor: data.floor,
        room: data.room,
        landmark: data.landmark || ''
      },
      contactPreference: data.contactPreference || 'Phone',
      createdBy: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      },
      assignedTo: assignedStaff ? {
        id: assignedStaff.id,
        name: assignedStaff.name,
        email: assignedStaff.email,
        role: assignedStaff.role,
        department: assignedStaff.department,
        specialty: assignedStaff.specialty
      } : null,
      createdAt,
      updatedAt: createdAt,
      dueDate,
      isOverdue: false,
      escalationLevel: 0,
      escalatedAt: null,
      upvotesCount: 0,
      upvotedBy: [],
      isDeleted: false,
      slaHours,
      estimatedCost: 0,
      resolutionNotes: null,
      rejectionReason: null,
      attachments
    };

    const newComplaint = await complaintRepo.create(complaintData);

    // 9. Record Initial Status History
    await statusHistoryRepo.create({
      complaintId: newComplaint.id,
      trackingNumber,
      referenceNumber,
      fromStatus: null,
      status: 'Submitted',
      changedBy: { id: user.id, name: user.name, role: user.role },
      notes: 'Complaint submitted by requester via Campus Portal',
      changedAt: createdAt
    });

    if (initialStatus === 'Assigned' && assignedStaff) {
      await statusHistoryRepo.create({
        complaintId: newComplaint.id,
        trackingNumber,
        referenceNumber,
        fromStatus: 'Submitted',
        status: 'Assigned',
        changedBy: { id: 'system_auto_assign', name: 'Smart Workflow Engine', role: 'system' },
        notes: `Smart Auto-Assignment assigned to ${assignedStaff.name} (${assignedStaff.specialty}) based on lowest weighted workload`,
        changedAt: new Date(Date.now() + 100).toISOString()
      });

      // Notify assigned staff
      await notificationService.createNotification({
        userId: assignedStaff.id,
        title: `Auto-Assigned: ${referenceNumber}`,
        message: `New maintenance ticket auto-assigned: "${data.title}" at ${data.building}, ${data.room}. Priority: ${priority}.`,
        type: 'task_assigned',
        link: `/staff/tasks/${newComplaint.id}`
      });
    }

    // 10. Audit Log
    await auditLogRepo.create({
      action: 'COMPLAINT_CREATED',
      entityType: 'Complaint',
      entityId: newComplaint.id,
      actor: { id: user.id, name: user.name, role: user.role },
      details: `Created ticket ${referenceNumber} (${priority}) in ${category.name}`
    });

    // 11. Notify Admins
    const admins = await userRepo.findByRole('admin');
    for (const admin of admins) {
      await notificationService.createNotification({
        userId: admin.id,
        title: `New Ticket: ${referenceNumber}`,
        message: `${user.name} submitted: "${data.title}" (${category.name} - ${priority}).`,
        type: 'new_complaint',
        link: `/admin/complaints/${newComplaint.id}`
      });
    }

    return {
      complaint: newComplaint,
      prioritySuggestion,
      duplicatesFound: duplicates
    };
  },

  /**
   * Retrieves complaints with full-text search, filtering, pagination, and role scoping
   */
  async getComplaints(params, user) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      category,
      categoryId,
      priority,
      building,
      assignee,
      overdueOnly,
      escalatedOnly,
      fromDate,
      toDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    let list = await complaintRepo.findAll();

    // 1. Exclude soft-deleted
    list = list.filter((c) => !c.isDeleted);

    // 2. Role-based scoping
    if (user.role === 'student') {
      list = list.filter((c) => c.createdBy?.id === user.id);
    } else if (user.role === 'staff') {
      list = list.filter((c) => c.assignedTo?.id === user.id);
    }
    // Admin sees all

    // 3. Search query
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.referenceNumber?.toLowerCase().includes(q) ||
        c.trackingNumber?.toLowerCase().includes(q) ||
        c.location?.building?.toLowerCase().includes(q) ||
        c.location?.room?.toLowerCase().includes(q) ||
        c.createdBy?.name?.toLowerCase().includes(q)
      );
    }

    // 4. Filters
    if (status) {
      const statuses = status.split(',').map((s) => s.trim().toLowerCase());
      list = list.filter((c) => statuses.includes(c.status.toLowerCase()));
    }

    if (categoryId || category) {
      const targetCat = (categoryId || category).toLowerCase();
      list = list.filter((c) => c.categoryId?.toLowerCase() === targetCat || c.categoryName?.toLowerCase() === targetCat);
    }

    if (priority) {
      const priorities = priority.split(',').map((p) => p.trim().toLowerCase());
      list = list.filter((c) => priorities.includes(c.priority.toLowerCase()));
    }

    if (building) {
      list = list.filter((c) => c.location?.building?.toLowerCase() === building.toLowerCase());
    }

    if (assignee) {
      list = list.filter((c) => c.assignedTo?.id === assignee);
    }

    if (overdueOnly === 'true' || overdueOnly === true) {
      list = list.filter((c) => c.isOverdue === true);
    }

    if (escalatedOnly === 'true' || escalatedOnly === true) {
      list = list.filter((c) => (c.escalationLevel || 0) > 0);
    }

    if (fromDate) {
      list = list.filter((c) => new Date(c.createdAt) >= new Date(fromDate));
    }

    if (toDate) {
      list = list.filter((c) => new Date(c.createdAt) <= new Date(toDate));
    }

    // 5. Sorting
    list.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'dueDate' || sortBy === 'createdAt' || sortBy === 'updatedAt') {
        valA = new Date(valA || 0).getTime();
        valB = new Date(valB || 0).getTime();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // 6. Pagination
    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + Number(limit));

    return {
      complaints: paginated,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  },

  /**
   * Retrieves single complaint by ID with full details (history, comments, feedback, SLA)
   */
  async getComplaintById(id, user) {
    const complaint = await complaintRepo.findById(id);
    if (!complaint || complaint.isDeleted) {
      const err = new Error('Complaint not found');
      err.statusCode = 404;
      throw err;
    }

    // Ownership & permission check
    if (user.role === 'student' && complaint.createdBy?.id !== user.id) {
      const err = new Error('Access denied: You can only view your own complaints');
      err.statusCode = 403;
      throw err;
    }
    if (user.role === 'staff' && complaint.assignedTo?.id !== user.id) {
      const err = new Error('Access denied: You can only view complaints assigned to you');
      err.statusCode = 403;
      throw err;
    }

    // Fetch related entities
    const [history, rawComments, feedback] = await Promise.all([
      statusHistoryRepo.findByComplaintId(id),
      commentRepo.findByComplaintId(id),
      feedbackRepo.findByComplaintId(id)
    ]);

    // Filter out internal-only comments if requester is student
    const comments = user.role === 'student'
      ? rawComments.filter((c) => !c.isInternal)
      : rawComments;

    // Sort history chronologically
    history.sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt));
    // Sort comments chronologically
    comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Calculate SLA time remaining
    const now = new Date();
    const dueDate = new Date(complaint.dueDate);
    const diffMs = dueDate - now;
    const remainingMinutes = Math.round(diffMs / (1000 * 60));
    const isOverdue = complaint.isOverdue || diffMs < 0;

    return {
      ...complaint,
      statusHistory: history,
      comments,
      feedback,
      slaInfo: {
        dueDate: complaint.dueDate,
        slaHours: complaint.slaHours,
        remainingMinutes: !['Resolved', 'Closed', 'Rejected'].includes(complaint.status) ? remainingMinutes : null,
        isOverdue,
        escalationLevel: complaint.escalationLevel || 0,
        escalatedAt: complaint.escalatedAt
      }
    };
  },

  /**
   * Admin edit for complaint metadata (category, priority, location, description)
   */
  async updateComplaint(id, updates, actor) {
    const complaint = await complaintRepo.findById(id);
    if (!complaint || complaint.isDeleted) {
      const err = new Error('Complaint not found');
      err.statusCode = 404;
      throw err;
    }

    const payload = { ...updates, updatedAt: new Date().toISOString() };

    // If category changed, update category metadata
    if (updates.categoryId && updates.categoryId !== complaint.categoryId) {
      const cat = await categoryRepo.findById(updates.categoryId);
      if (cat) {
        payload.categoryId = cat.id;
        payload.categoryName = cat.name;
        payload.categoryColor = cat.color;
      }
    }

    // If location fields updated
    if (updates.building || updates.floor || updates.room || updates.landmark) {
      payload.location = {
        ...complaint.location,
        building: updates.building || complaint.location.building,
        floor: updates.floor || complaint.location.floor,
        room: updates.room || complaint.location.room,
        landmark: updates.landmark !== undefined ? updates.landmark : complaint.location.landmark
      };
      delete payload.building;
      delete payload.floor;
      delete payload.room;
      delete payload.landmark;
    }

    const updated = await complaintRepo.update(id, payload);

    await auditLogRepo.create({
      action: 'COMPLAINT_UPDATED',
      entityType: 'Complaint',
      entityId: id,
      actor: { id: actor.id, name: actor.name, role: actor.role },
      details: `Admin ${actor.name} updated ticket fields`
    });

    return updated;
  },

  /**
   * Soft deletes a complaint (admin only)
   */
  async deleteComplaint(id, actor) {
    const complaint = await complaintRepo.findById(id);
    if (!complaint || complaint.isDeleted) {
      const err = new Error('Complaint not found');
      err.statusCode = 404;
      throw err;
    }

    await complaintRepo.update(id, {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      deletedBy: { id: actor.id, name: actor.name }
    });

    await auditLogRepo.create({
      action: 'COMPLAINT_SOFT_DELETED',
      entityType: 'Complaint',
      entityId: id,
      actor: { id: actor.id, name: actor.name, role: actor.role },
      details: `Complaint ${complaint.referenceNumber} soft-deleted`
    });

    return { message: `Complaint ${complaint.referenceNumber} deleted successfully` };
  },

  /**
   * Upvote ("Me too") on an active complaint
   * Automatically raises priority when thresholds are crossed
   */
  async upvoteComplaint(id, user) {
    const complaint = await complaintRepo.findById(id);
    if (!complaint || complaint.isDeleted) {
      const err = new Error('Complaint not found');
      err.statusCode = 404;
      throw err;
    }

    if (['Resolved', 'Closed', 'Rejected'].includes(complaint.status)) {
      const err = new Error('Cannot upvote a resolved or closed complaint');
      err.statusCode = 400;
      throw err;
    }

    const upvotedBy = complaint.upvotedBy || [];
    if (upvotedBy.includes(user.id)) {
      const err = new Error('You have already upvoted this complaint ("Me too")');
      err.statusCode = 400;
      throw err;
    }

    const newUpvotes = (complaint.upvotesCount || 0) + 1;
    const newUpvotedBy = [...upvotedBy, user.id];

    // Priority escalation thresholds based on community impact
    let newPriority = complaint.priority;
    let autoEscalated = false;

    if (newUpvotes >= 8 && complaint.priority !== 'Urgent') {
      newPriority = 'Urgent';
      autoEscalated = true;
    } else if (newUpvotes >= 5 && !['High', 'Urgent'].includes(complaint.priority)) {
      newPriority = 'High';
      autoEscalated = true;
    } else if (newUpvotes >= 3 && complaint.priority === 'Low') {
      newPriority = 'Medium';
      autoEscalated = true;
    }

    const updated = await complaintRepo.update(id, {
      upvotesCount: newUpvotes,
      upvotedBy: newUpvotedBy,
      priority: newPriority,
      updatedAt: new Date().toISOString()
    });

    if (autoEscalated) {
      await auditLogRepo.create({
        action: 'COMPLAINT_PRIORITY_AUTO_ESCALATED',
        entityType: 'Complaint',
        entityId: id,
        actor: { id: 'system_upvotes', name: 'Community Impact Engine', role: 'system' },
        details: `Priority raised to ${newPriority} due to ${newUpvotes} verified student upvotes.`
      });

      // Notify assignee and requester
      if (complaint.assignedTo?.id) {
        await notificationService.createNotification({
          userId: complaint.assignedTo.id,
          title: `Priority Auto-Raised: ${complaint.referenceNumber}`,
          message: `Ticket "${complaint.title}" received ${newUpvotes} "Me Too" upvotes. Priority escalated to ${newPriority}.`,
          type: 'priority_escalated',
          link: `/staff/tasks/${id}`
        });
      }
    }

    return {
      message: 'Upvote recorded successfully',
      upvotesCount: newUpvotes,
      priority: newPriority,
      autoEscalated
    };
  }
};

export default complaintService;
