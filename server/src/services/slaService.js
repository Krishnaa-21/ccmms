import { complaintRepo, userRepo, auditLogRepo, settingsRepo } from '../repositories/index.js';
import { notificationService } from './notificationService.js';

export const slaService = {
  /**
   * Scans all active complaints, flags overdue breaches,
   * updates escalation levels (1 and 2), and dispatches alerts.
   */
  async checkAndEscalateOverdueComplaints() {
    const activeComplaints = await complaintRepo.findWhere((c) =>
      ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Awaiting Parts', 'Reopened'].includes(c.status) &&
      !c.isDeleted
    );

    const now = new Date();
    let flaggedCount = 0;
    let escalatedCount = 0;

    const admins = await userRepo.findByRole('admin');

    for (const comp of activeComplaints) {
      if (!comp.dueDate) continue;

      const dueDate = new Date(comp.dueDate);
      const createdAt = new Date(comp.createdAt);
      const totalSlaMs = dueDate - createdAt;
      const breachMs = now - dueDate;

      // 1. Check if overdue
      if (breachMs > 0) {
        let isOverdue = true;
        let escalationLevel = comp.escalationLevel || 0;
        let escalatedAt = comp.escalatedAt;
        let shouldUpdate = false;

        if (!comp.isOverdue) {
          shouldUpdate = true;
          flaggedCount++;

          // Send reminder notification to assigned staff
          if (comp.assignedTo?.id) {
            await notificationService.createNotification({
              userId: comp.assignedTo.id,
              title: `⚠️ Overdue Notice: ${comp.referenceNumber}`,
              message: `Ticket "${comp.title}" has breached its SLA due date. Please update status immediately.`,
              type: 'sla_overdue_warning',
              link: `/staff/tasks/${comp.id}`
            });
          }
        }

        // 2. Escalation calculation
        // Level 1: Breached by > 25% of SLA window
        // Level 2: Breached by > 50% of SLA window
        const breachRatio = totalSlaMs > 0 ? breachMs / totalSlaMs : 0;

        if (breachRatio >= 0.50 && escalationLevel < 2) {
          escalationLevel = 2;
          escalatedAt = now.toISOString();
          shouldUpdate = true;
          escalatedCount++;

          // Notify Admins of Critical Level 2 Escalation
          for (const admin of admins) {
            await notificationService.createNotification({
              userId: admin.id,
              title: `🚨 Critical Escalation (Level 2): ${comp.referenceNumber}`,
              message: `Ticket "${comp.title}" (${comp.priority}) breached SLA by > 50%. Assigned to ${comp.assignedTo?.name || 'Unassigned'}. Immediate Dean intervention required.`,
              type: 'sla_escalation_level_2',
              link: `/admin/complaints/${comp.id}`
            });
          }

          await auditLogRepo.create({
            action: 'SLA_ESCALATION_LEVEL_2',
            entityType: 'Complaint',
            entityId: comp.id,
            actor: { id: 'cron_sla_engine', name: 'SLA Monitor Cron', role: 'system' },
            details: `Escalated to Level 2 (50%+ breach). Total breach duration: ${(breachMs / (1000 * 3600)).toFixed(1)} hours.`
          });
        } else if (breachRatio >= 0.25 && escalationLevel < 1) {
          escalationLevel = 1;
          escalatedAt = now.toISOString();
          shouldUpdate = true;
          escalatedCount++;

          // Notify Admins of Level 1 Escalation
          for (const admin of admins) {
            await notificationService.createNotification({
              userId: admin.id,
              title: `⚠️ SLA Escalation (Level 1): ${comp.referenceNumber}`,
              message: `Ticket "${comp.title}" has exceeded SLA deadline by 25%. Supervisor review needed.`,
              type: 'sla_escalation_level_1',
              link: `/admin/complaints/${comp.id}`
            });
          }

          await auditLogRepo.create({
            action: 'SLA_ESCALATION_LEVEL_1',
            entityType: 'Complaint',
            entityId: comp.id,
            actor: { id: 'cron_sla_engine', name: 'SLA Monitor Cron', role: 'system' },
            details: `Escalated to Level 1 (25%+ breach). Total breach duration: ${(breachMs / (1000 * 3600)).toFixed(1)} hours.`
          });
        }

        if (shouldUpdate) {
          await complaintRepo.update(comp.id, {
            isOverdue: true,
            escalationLevel,
            escalatedAt
          });
        }
      }
    }

    return {
      scannedCount: activeComplaints.length,
      flaggedOverdue: flaggedCount,
      escalatedCount,
      timestamp: now.toISOString()
    };
  },

  /**
   * Computes SLA compliance percentage across closed/resolved complaints
   */
  async getComplianceRate() {
    const all = await complaintRepo.findAll();
    const resolvedOrClosed = all.filter((c) =>
      ['Resolved', 'Closed'].includes(c.status) && !c.isDeleted
    );

    if (resolvedOrClosed.length === 0) return 100;

    const onTimeCount = resolvedOrClosed.filter((c) => {
      if (!c.resolvedAt || !c.dueDate) return true;
      return new Date(c.resolvedAt) <= new Date(c.dueDate);
    }).length;

    return +((onTimeCount / resolvedOrClosed.length) * 100).toFixed(1);
  }
};

export default slaService;
