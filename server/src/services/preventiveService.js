import { preventivePlanRepo, complaintRepo, auditLogRepo } from '../repositories/index.js';
import { notificationService } from './notificationService.js';

function computeNextRunDate(frequency, fromDate = new Date()) {
  const next = new Date(fromDate);
  switch (frequency) {
    case 'Weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'Bi-Weekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'Monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'Quarterly':
      next.setMonth(next.getMonth() + 3);
      break;
    case 'Semi-Annual':
      next.setMonth(next.getMonth() + 6);
      break;
    case 'Annual':
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      next.setDate(next.getDate() + 30);
  }
  return next.toISOString();
}

export const preventiveService = {
  async getAllPlans(campusId) {
    const plans = await preventivePlanRepo.findAll();
    if (campusId) {
      return plans.filter((p) => p.campusId === campusId);
    }
    return plans;
  },

  async getPlanById(id) {
    return preventivePlanRepo.findById(id);
  },

  async createPlan(data, actor) {
    const now = new Date();
    const nextRun = data.nextRunDate || computeNextRunDate(data.frequency || 'Monthly', now);

    const record = {
      ...data,
      isActive: data.isActive !== undefined ? data.isActive : true,
      nextRunDate: nextRun,
      lastRunDate: null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    const created = await preventivePlanRepo.create(record);

    await auditLogRepo.create({
      action: 'PREVENTIVE_PLAN_CREATED',
      entityType: 'PreventivePlan',
      entityId: created.id,
      actor: { id: actor.id, name: actor.name, role: actor.role },
      details: `Created recurring maintenance plan: "${created.title}" (${created.frequency}) for ${created.building}`
    });

    return created;
  },

  async updatePlan(id, updates) {
    const existing = await preventivePlanRepo.findById(id);
    if (!existing) {
      const err = new Error('Preventive plan not found');
      err.statusCode = 404;
      throw err;
    }

    const updated = await preventivePlanRepo.update(id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return updated;
  },

  async deletePlan(id) {
    return preventivePlanRepo.delete(id);
  },

  async runPlan(id, actor) {
    const plan = await preventivePlanRepo.findById(id);
    if (!plan) {
      const err = new Error('Preventive plan not found');
      err.statusCode = 404;
      throw err;
    }

    const now = new Date();
    const nextRun = computeNextRunDate(plan.frequency, now);

    // Create preventive complaint ticket
    const allExisting = await complaintRepo.findAll();
    const nextSeq = allExisting.length + 1;
    const trackingNumber = `CMP-2026-${String(nextSeq).padStart(3, '0')}`;
    const referenceNumber = `CCM-2026-${String(nextSeq).padStart(4, '0')}`;

    const complaintData = {
      campusId: plan.campusId || 'apex-campus-main',
      trackingNumber,
      referenceNumber,
      title: `[Preventive] ${plan.title}`,
      description: plan.description || `Scheduled recurring preventive maintenance (${plan.frequency})`,
      categoryId: plan.categoryId || 'cat_plumbing',
      categoryName: plan.categoryName || 'Plumbing',
      categoryColor: '#0284c7',
      categoryIcon: 'Wrench',
      subCategory: plan.subCategory || 'Preventive Maintenance',
      priority: plan.priority || 'Medium',
      status: plan.defaultAssignee ? 'Assigned' : 'Submitted',
      type: 'Preventive',
      preventivePlanId: plan.id,
      location: {
        building: plan.building,
        floor: plan.floor || 'Ground Floor',
        room: plan.room || 'General',
        landmark: plan.landmark || ''
      },
      createdBy: {
        id: actor.id || 'system_preventive',
        name: actor.name || 'Preventive Scheduler',
        role: actor.role || 'system',
        department: 'Facilities Maintenance Operations'
      },
      assignedTo: plan.defaultAssignee || null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      dueDate: new Date(now.getTime() + 72 * 3600 * 1000).toISOString(),
      isOverdue: false,
      escalationLevel: 0,
      upvotesCount: 0,
      upvotedBy: [],
      isDeleted: false,
      attachments: []
    };

    const createdComplaint = await complaintRepo.create(complaintData);

    // Update plan run timestamps
    await preventivePlanRepo.update(id, {
      lastRunDate: now.toISOString(),
      nextRunDate: nextRun,
      updatedAt: now.toISOString()
    });

    // Notify assignee
    if (plan.defaultAssignee?.id) {
      await notificationService.createNotification({
        userId: plan.defaultAssignee.id,
        title: `🔧 New Preventive Order: ${referenceNumber}`,
        message: `Recurring task "${plan.title}" has been dispatched to your queue. Due in 72h.`,
        type: 'preventive_dispatch',
        link: `/staff/tasks/${createdComplaint.id}`
      });
    }

    // Record audit log
    await auditLogRepo.create({
      action: 'PREVENTIVE_PLAN_EXECUTED',
      entityType: 'PreventivePlan',
      entityId: id,
      actor: { id: actor.id, name: actor.name, role: actor.role },
      details: `Dispatched work order #${referenceNumber} for plan "${plan.title}". Next scheduled run: ${new Date(nextRun).toLocaleDateString()}.`
    });

    return {
      message: `Preventive work order #${referenceNumber} created successfully`,
      complaint: createdComplaint,
      nextRunDate: nextRun
    };
  },

  async checkAndExecuteDuePlans() {
    const plans = await preventivePlanRepo.findAll();
    const now = new Date();
    let executedCount = 0;

    for (const plan of plans) {
      if (plan.isActive && plan.nextRunDate && new Date(plan.nextRunDate) <= now) {
        try {
          await this.runPlan(plan.id, {
            id: 'cron_preventive_scheduler',
            name: 'Automated Preventive Engine',
            role: 'system'
          });
          executedCount++;
        } catch (err) {
          console.error(`[PreventiveCron] Failed to run plan ${plan.id}:`, err);
        }
      }
    }
    return { executedCount, totalActive: plans.filter((p) => p.isActive).length };
  }
};

export default preventiveService;
