import { complaintRepo, userRepo } from '../repositories/index.js';

export const predictiveService = {
  /**
   * Generates rule-based predictive insights and facilities recommendations
   */
  async generateInsights(campusId) {
    const allComplaints = (await complaintRepo.findAll()).filter((c) => !c.isDeleted);
    const complaints = campusId ? allComplaints.filter((c) => c.campusId === campusId) : allComplaints;
    const users = await userRepo.findAll();
    const staffMembers = users.filter((u) => u.role === 'staff');

    const insights = [];
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 3600 * 1000);
    const twentyEightDaysAgo = new Date(now.getTime() - 28 * 24 * 3600 * 1000);

    // Rule 1: Location Hotspots (>= 2 complaints in the same room in last 30 days)
    const locationGroups = {};
    for (const c of complaints) {
      if (new Date(c.createdAt) >= thirtyDaysAgo && c.location?.building && c.location?.room) {
        const key = `${c.location.building} ::: ${c.location.room}`;
        if (!locationGroups[key]) {
          locationGroups[key] = {
            building: c.location.building,
            floor: c.location.floor || 'Ground Floor',
            room: c.location.room,
            complaints: []
          };
        }
        locationGroups[key].complaints.push(c);
      }
    }

    for (const [key, loc] of Object.entries(locationGroups)) {
      if (loc.complaints.length >= 2) {
        const categories = loc.complaints.map((c) => c.categoryName);
        const topCategory = categories.sort((a, b) =>
          categories.filter((v) => v === a).length - categories.filter((v) => v === b).length
        ).pop() || 'General';

        const sampleComp = loc.complaints[0];

        insights.push({
          id: `ins_loc_${loc.building.replace(/\s+/g, '_')}_${loc.room.replace(/\s+/g, '_')}`,
          type: 'LOCATION_HOTSPOT',
          severity: loc.complaints.length >= 3 ? 'critical' : 'warning',
          title: `Recurring Failures: ${loc.building} (${loc.room})`,
          description: `Detected ${loc.complaints.length} distinct service tickets logged in this room over the past 30 days, predominantly related to ${topCategory}. Root cause likely indicates infrastructure wear rather than isolated user error.`,
          metric: `${loc.complaints.length} tickets this month`,
          recommendedAction: 'Schedule recurring preventive inspection',
          actionType: 'CREATE_PREVENTIVE',
          payload: {
            title: `Preventive Servicing for ${loc.building} - ${loc.room}`,
            building: loc.building,
            floor: loc.floor,
            room: loc.room,
            categoryId: sampleComp.categoryId,
            categoryName: sampleComp.categoryName,
            subCategory: sampleComp.subCategory
          }
        });
      }
    }

    // Rule 2: Category Trend Spikes (complaints in last 14 days vs prior 14 days)
    const recentCatCounts = {};
    const priorCatCounts = {};

    for (const c of complaints) {
      const created = new Date(c.createdAt);
      const cat = c.categoryName || 'General';
      if (created >= fourteenDaysAgo) {
        recentCatCounts[cat] = (recentCatCounts[cat] || 0) + 1;
      } else if (created >= twentyEightDaysAgo) {
        priorCatCounts[cat] = (priorCatCounts[cat] || 0) + 1;
      }
    }

    for (const [cat, recent] of Object.entries(recentCatCounts)) {
      const prior = priorCatCounts[cat] || 1;
      const pctChange = Math.round(((recent - prior) / prior) * 100);
      if (pctChange >= 30 && recent >= 3) {
        insights.push({
          id: `ins_trend_${cat.replace(/\s+/g, '_')}`,
          type: 'CATEGORY_SPIKE',
          severity: 'warning',
          title: `Volume Surge in ${cat} (+${pctChange}%)`,
          description: `Demand for ${cat} maintenance has surged by ${pctChange}% across campus over the last two weeks (${recent} new reports vs ${prior} previously). May require temporary technician reallocation or bulk spare part pre-orders.`,
          metric: `+${pctChange}% velocity surge`,
          recommendedAction: 'Review parts inventory & schedule team dispatch',
          actionType: 'VIEW_INVENTORY',
          payload: { categoryName: cat }
        });
      }
    }

    // Rule 3: Staff Overload / Workload Imbalance
    for (const staff of staffMembers) {
      const activeTickets = complaints.filter(
        (c) =>
          c.assignedTo?.id === staff.id &&
          ['Assigned', 'In Progress', 'Awaiting Parts'].includes(c.status)
      );

      if (activeTickets.length >= 4) {
        insights.push({
          id: `ins_staff_${staff.id}`,
          type: 'STAFF_OVERLOAD',
          severity: activeTickets.length >= 6 ? 'critical' : 'warning',
          title: `Technician Workload Saturation: ${staff.name}`,
          description: `${staff.name} (${staff.specialty || staff.department}) currently holds ${activeTickets.length} active work orders, with ${activeTickets.filter((t) => t.isOverdue).length} tickets past SLA threshold.`,
          metric: `${activeTickets.length} active assignments`,
          recommendedAction: 'Rebalance workload to standby technicians',
          actionType: 'REBALANCE_STAFF',
          payload: { staffId: staff.id, staffName: staff.name }
        });
      }
    }

    // Rule 4: SLA Resolution Bottleneck
    const resolvedComplaints = complaints.filter((c) => ['Resolved', 'Closed'].includes(c.status) && c.resolvedAt);
    const categoryResolutionTimes = {};

    for (const c of resolvedComplaints) {
      const cat = c.categoryName || 'General';
      const hours = (new Date(c.resolvedAt) - new Date(c.createdAt)) / (1000 * 3600);
      if (!categoryResolutionTimes[cat]) categoryResolutionTimes[cat] = [];
      categoryResolutionTimes[cat].push(hours);
    }

    for (const [cat, times] of Object.entries(categoryResolutionTimes)) {
      if (times.length >= 2) {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        if (avg > 72) {
          insights.push({
            id: `ins_bottle_${cat.replace(/\s+/g, '_')}`,
            type: 'RESOLUTION_BOTTLENECK',
            severity: 'info',
            title: `Extended Resolution Lag: ${cat}`,
            description: `Historical turnaround for ${cat} averages ${(avg / 24).toFixed(1)} days (${avg.toFixed(0)} hours). Vendor procurement delays or component shortages are the typical contributors.`,
            metric: `${(avg / 24).toFixed(1)} days avg resolution`,
            recommendedAction: 'Inspect supplier lead times & stock buffers',
            actionType: 'VIEW_INVENTORY',
            payload: { categoryName: cat }
          });
        }
      }
    }

    return insights;
  }
};

export default predictiveService;

