import {
  complaintRepo,
  categoryRepo,
  feedbackRepo,
  userRepo
} from '../repositories/index.js';
import { slaService } from './slaService.js';

export const analyticsService = {
  /**
   * Executive Overview metrics with period-over-period trend comparisons
   */
  async getOverview() {
    const [allComplaints, allFeedback, categories] = await Promise.all([
      complaintRepo.findAll(),
      feedbackRepo.findAll(),
      categoryRepo.findAll()
    ]);

    const nonDeleted = allComplaints.filter((c) => !c.isDeleted);
    const now = new Date();

    // 7-day intervals for current vs previous period comparison
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const currentPeriodCreated = nonDeleted.filter((c) => new Date(c.createdAt) >= sevenDaysAgo);
    const previousPeriodCreated = nonDeleted.filter((c) => {
      const d = new Date(c.createdAt);
      return d >= fourteenDaysAgo && d < sevenDaysAgo;
    });

    // Counts
    const totalComplaints = nonDeleted.length;
    const openComplaints = nonDeleted.filter((c) =>
      ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Awaiting Parts', 'Reopened'].includes(c.status)
    ).length;
    const resolvedComplaints = nonDeleted.filter((c) =>
      ['Resolved', 'Closed'].includes(c.status)
    ).length;
    const overdueComplaints = nonDeleted.filter((c) => c.isOverdue).length;

    // Average resolution time (hours)
    const resolvedWithDates = nonDeleted.filter((c) => c.resolvedAt && c.createdAt);
    const avgResolutionHours = resolvedWithDates.length > 0
      ? +(resolvedWithDates.reduce((acc, c) => {
          return acc + (new Date(c.resolvedAt) - new Date(c.createdAt)) / (1000 * 3600);
        }, 0) / resolvedWithDates.length).toFixed(1)
      : 0;

    // SLA compliance %
    const slaCompliance = await slaService.getComplianceRate();

    // Average rating
    const avgRating = allFeedback.length > 0
      ? +(allFeedback.reduce((acc, f) => acc + f.rating, 0) / allFeedback.length).toFixed(1)
      : 0;

    // Trend calculation helper
    const calcTrend = (curr, prev) => {
      if (prev === 0) return curr > 0 ? '+100%' : '0%';
      const diff = curr - prev;
      const pct = Math.round((diff / prev) * 100);
      return `${pct >= 0 ? '+' : ''}${pct}%`;
    };

    return {
      totalComplaints,
      openComplaints,
      resolvedComplaints,
      overdueComplaints,
      newThisWeek: currentPeriodCreated.length,
      previousWeekNew: previousPeriodCreated.length,
      newComplaintsTrend: calcTrend(currentPeriodCreated.length, previousPeriodCreated.length),
      averageResolutionHours: avgResolutionHours,
      slaComplianceRate: slaCompliance,
      averageRating: avgRating,
      totalFeedbackCount: allFeedback.length
    };
  },

  /**
   * Category breakdown: total, resolved, pending, avg rating, SLA compliance
   */
  async getByCategory() {
    const [complaints, categories, feedbacks] = await Promise.all([
      complaintRepo.findAll(),
      categoryRepo.findAll(),
      feedbackRepo.findAll()
    ]);

    const nonDeleted = complaints.filter((c) => !c.isDeleted);

    return categories.map((cat) => {
      const catComplaints = nonDeleted.filter((c) => c.categoryId === cat.id);
      const resolved = catComplaints.filter((c) => ['Resolved', 'Closed'].includes(c.status));
      const pending = catComplaints.filter((c) => !['Resolved', 'Closed', 'Rejected'].includes(c.status));
      const overdue = catComplaints.filter((c) => c.isOverdue);

      const catFeedback = feedbacks.filter((f) => f.categoryId === cat.id);
      const avgRating = catFeedback.length > 0
        ? +(catFeedback.reduce((acc, f) => acc + f.rating, 0) / catFeedback.length).toFixed(1)
        : 0;

      const resolutionRate = catComplaints.length > 0
        ? +((resolved.length / catComplaints.length) * 100).toFixed(1)
        : 0;

      return {
        categoryId: cat.id,
        categoryName: cat.name,
        color: cat.color,
        icon: cat.icon,
        total: catComplaints.length,
        resolvedCount: resolved.length,
        pendingCount: pending.length,
        overdueCount: overdue.length,
        resolutionRate,
        averageRating: avgRating
      };
    });
  },

  /**
   * Status breakdown across all 8+ statuses
   */
  async getByStatus() {
    const complaints = (await complaintRepo.findAll()).filter((c) => !c.isDeleted);
    const counts = {};

    complaints.forEach((c) => {
      counts[c.status] = (counts[c.status] || 0) + 1;
    });

    return counts;
  },

  /**
   * Priority breakdown
   */
  async getByPriority() {
    const complaints = (await complaintRepo.findAll()).filter((c) => !c.isDeleted);
    const counts = { Urgent: 0, High: 0, Medium: 0, Low: 0 };

    complaints.forEach((c) => {
      counts[c.priority] = (counts[c.priority] || 0) + 1;
    });

    return counts;
  },

  /**
   * Building hotspots: ranked list of buildings by complaint frequency
   */
  async getByBuilding() {
    const complaints = (await complaintRepo.findAll()).filter((c) => !c.isDeleted);
    const buildingMap = {};

    complaints.forEach((c) => {
      const bldg = c.location?.building || 'Unknown';
      if (!buildingMap[bldg]) {
        buildingMap[bldg] = { building: bldg, total: 0, open: 0, resolved: 0, urgent: 0 };
      }
      buildingMap[bldg].total++;
      if (['Resolved', 'Closed'].includes(c.status)) {
        buildingMap[bldg].resolved++;
      } else {
        buildingMap[bldg].open++;
      }
      if (c.priority === 'Urgent') {
        buildingMap[bldg].urgent++;
      }
    });

    return Object.values(buildingMap).sort((a, b) => b.total - a.total);
  },

  /**
   * Monthly trend over the last 6 months
   */
  async getMonthlyTrend() {
    const complaints = (await complaintRepo.findAll()).filter((c) => !c.isDeleted);
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      months.push({ key: `${monthKey} ${year}`, month: d.getMonth(), year, created: 0, resolved: 0 });
    }

    complaints.forEach((c) => {
      const cDate = new Date(c.createdAt);
      const monthObj = months.find((m) => m.month === cDate.getMonth() && m.year === cDate.getFullYear());
      if (monthObj) {
        monthObj.created++;
      }

      if (c.resolvedAt) {
        const rDate = new Date(c.resolvedAt);
        const rMonthObj = months.find((m) => m.month === rDate.getMonth() && m.year === rDate.getFullYear());
        if (rMonthObj) {
          rMonthObj.resolved++;
        }
      }
    });

    return months.map(({ key, created, resolved }) => ({ month: key, created, resolved }));
  },

  /**
   * Top recurring subcategory issues
   */
  async getTopRecurringIssues() {
    const complaints = (await complaintRepo.findAll()).filter((c) => !c.isDeleted);
    const issueMap = {};

    complaints.forEach((c) => {
      const key = `${c.categoryName} - ${c.subCategory}`;
      if (!issueMap[key]) {
        issueMap[key] = {
          issue: c.subCategory,
          category: c.categoryName,
          count: 0,
          urgentCount: 0,
          avgCost: 0,
          totalCost: 0
        };
      }
      issueMap[key].count++;
      if (c.priority === 'Urgent') issueMap[key].urgentCount++;
      if (c.estimatedCost) issueMap[key].totalCost += c.estimatedCost;
    });

    return Object.values(issueMap)
      .map((item) => ({
        ...item,
        avgCost: item.count > 0 ? Math.round(item.totalCost / item.count) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  },

  /**
   * Staff performance scorecard: per technician metrics
   */
  async getStaffPerformance() {
    const [complaints, users, feedbacks] = await Promise.all([
      complaintRepo.findAll(),
      userRepo.findAll(),
      feedbackRepo.findAll()
    ]);

    const staffMembers = users.filter((u) => u.role === 'staff');
    const nonDeleted = complaints.filter((c) => !c.isDeleted);

    return staffMembers.map((staff) => {
      const assigned = nonDeleted.filter((c) => c.assignedTo?.id === staff.id);
      const resolved = assigned.filter((c) => ['Resolved', 'Closed'].includes(c.status));
      const active = assigned.filter((c) => ['Assigned', 'In Progress', 'Awaiting Parts'].includes(c.status));
      const overdue = assigned.filter((c) => c.isOverdue);

      // Average resolution time
      const withDates = resolved.filter((c) => c.resolvedAt && c.createdAt);
      const avgResolutionHours = withDates.length > 0
        ? +(withDates.reduce((acc, c) => {
            return acc + (new Date(c.resolvedAt) - new Date(c.createdAt)) / (1000 * 3600);
          }, 0) / withDates.length).toFixed(1)
        : 0;

      // SLA Compliance
      const onTime = resolved.filter((c) => {
        if (!c.resolvedAt || !c.dueDate) return true;
        return new Date(c.resolvedAt) <= new Date(c.dueDate);
      }).length;
      const slaComplianceRate = resolved.length > 0 ? +((onTime / resolved.length) * 100).toFixed(1) : 100;

      // Average rating from feedback
      const staffFeedback = feedbacks.filter((f) => f.staffId === staff.id);
      const avgRating = staffFeedback.length > 0
        ? +(staffFeedback.reduce((acc, f) => acc + f.rating, 0) / staffFeedback.length).toFixed(1)
        : 0;

      return {
        staffId: staff.id,
        name: staff.name,
        email: staff.email,
        department: staff.department,
        specialty: staff.specialty,
        isAvailable: staff.isAvailable,
        totalAssigned: assigned.length,
        resolvedCount: resolved.length,
        activeCount: active.length,
        overdueCount: overdue.length,
        averageResolutionHours: avgResolutionHours,
        slaComplianceRate,
        averageRating: avgRating,
        feedbackCount: staffFeedback.length
      };
    });
  },

  /**
   * Action items requiring administrative attention (Urgent, Overdue, Unassigned)
   */
  async getAttentionNeeded() {
    const complaints = (await complaintRepo.findAll()).filter((c) => !c.isDeleted);

    const urgent = complaints.filter((c) =>
      c.priority === 'Urgent' && !['Resolved', 'Closed', 'Rejected'].includes(c.status)
    );
    const overdue = complaints.filter((c) =>
      c.isOverdue && !['Resolved', 'Closed', 'Rejected'].includes(c.status)
    );
    const unassigned = complaints.filter((c) =>
      !c.assignedTo && ['Submitted', 'Under Review'].includes(c.status)
    );

    return {
      urgentCount: urgent.length,
      overdueCount: overdue.length,
      unassignedCount: unassigned.length,
      urgentTickets: urgent.slice(0, 10),
      overdueTickets: overdue.slice(0, 10),
      unassignedTickets: unassigned.slice(0, 10)
    };
  },

  /**
   * Performance scorecard for logged-in maintenance staff member
   */
  async getMyPerformance(userId) {
    const [complaints, feedbacks] = await Promise.all([
      complaintRepo.findAll(),
      feedbackRepo.findAll()
    ]);

    const nonDeleted = complaints.filter((c) => !c.isDeleted && c.assignedTo?.id === userId);
    const resolved = nonDeleted.filter((c) => ['Resolved', 'Closed'].includes(c.status));
    const active = nonDeleted.filter((c) => ['Assigned', 'In Progress', 'Awaiting Parts'].includes(c.status));
    const overdue = nonDeleted.filter((c) => c.isOverdue);

    const withDates = resolved.filter((c) => c.resolvedAt && c.createdAt);
    const avgResolutionHours = withDates.length > 0
      ? +(withDates.reduce((acc, c) => {
          return acc + (new Date(c.resolvedAt) - new Date(c.createdAt)) / (1000 * 3600);
        }, 0) / withDates.length).toFixed(1)
      : 0;

    const onTime = resolved.filter((c) => {
      if (!c.resolvedAt || !c.dueDate) return true;
      return new Date(c.resolvedAt) <= new Date(c.dueDate);
    }).length;
    const slaComplianceRate = resolved.length > 0 ? +((onTime / resolved.length) * 100).toFixed(1) : 100;

    const staffFeedback = feedbacks.filter((f) => f.staffId === userId);
    const avgRating = staffFeedback.length > 0
      ? +(staffFeedback.reduce((acc, f) => acc + f.rating, 0) / staffFeedback.length).toFixed(1)
      : 0;

    return {
      totalAssigned: nonDeleted.length,
      activeCount: active.length,
      resolvedCount: resolved.length,
      overdueCount: overdue.length,
      averageResolutionHours: avgResolutionHours,
      slaComplianceRate,
      averageRating: avgRating,
      feedbackCount: staffFeedback.length,
      activeTasks: active
    };
  }
};

export default analyticsService;
