import { userRepo, complaintRepo, categoryRepo } from '../repositories/index.js';
import { PRIORITY_KEYWORDS, PRIORITY_WEIGHTS } from '../config/constants.js';

export const automationService = {
  /**
   * Suggests priority based on rule and keyword scanning of title & description
   * @param {string} title
   * @param {string} description
   * @param {string} [categoryId]
   * @returns {{ priority: string, reason: string }}
   */
  suggestPriority(title, description, categoryId) {
    const text = `${title} ${description}`.toLowerCase();

    // 1. Check Urgent keywords
    for (const kw of PRIORITY_KEYWORDS.Urgent) {
      if (text.includes(kw)) {
        return {
          priority: 'Urgent',
          reason: `High risk safety hazard keyword detected: "${kw}". Immediate intervention recommended.`
        };
      }
    }

    // 2. Check High keywords
    for (const kw of PRIORITY_KEYWORDS.High) {
      if (text.includes(kw)) {
        return {
          priority: 'High',
          reason: `Critical utility disruption keyword detected: "${kw}". Prioritized response recommended.`
        };
      }
    }

    // 3. Check Medium keywords
    for (const kw of PRIORITY_KEYWORDS.Medium) {
      if (text.includes(kw)) {
        return {
          priority: 'Medium',
          reason: `Standard facility maintenance keyword detected: "${kw}". Standard SLA applied.`
        };
      }
    }

    // 4. Check Low keywords
    for (const kw of PRIORITY_KEYWORDS.Low) {
      if (text.includes(kw)) {
        return {
          priority: 'Low',
          reason: `Non-critical aesthetic or minor cosmetic repair keyword detected: "${kw}". Scheduled during normal maintenance hours.`
        };
      }
    }

    // Default fallback
    return {
      priority: 'Medium',
      reason: 'Standard campus facility maintenance SLA applied.'
    };
  },

  /**
   * Finds the best matching maintenance staff member based on specialty,
   * availability flag, and lowest current weighted workload.
   * @param {string} categoryName
   * @returns {Promise<Object|null>}
   */
  async autoAssignStaff(categoryName) {
    // 1. Fetch all active and available maintenance staff
    const allUsers = await userRepo.findAll();
    const eligibleStaff = allUsers.filter((u) => {
      if (u.role !== 'staff' || !u.isActive || u.isAvailable === false) return false;
      // Match specialty case-insensitively or general staff
      if (!u.specialty) return true;
      return (
        u.specialty.toLowerCase() === categoryName.toLowerCase() ||
        u.specialty.toLowerCase() === 'general'
      );
    });

    if (eligibleStaff.length === 0) {
      return null; // Fall back to admin queue
    }

    // 2. Fetch all active complaints to compute current weighted workload per technician
    const activeComplaints = await complaintRepo.findWhere((c) =>
      ['Assigned', 'In Progress', 'Awaiting Parts'].includes(c.status)
    );

    // 3. Compute workload score for each candidate staff
    const staffWorkloads = eligibleStaff.map((staff) => {
      const assignedTickets = activeComplaints.filter((c) => c.assignedTo?.id === staff.id);
      const weightedScore = assignedTickets.reduce((acc, curr) => {
        return acc + (PRIORITY_WEIGHTS[curr.priority] || 2);
      }, 0);

      // Prefer exact specialty match over general
      const isExactSpecialty = staff.specialty?.toLowerCase() === categoryName.toLowerCase();

      return {
        staff,
        ticketCount: assignedTickets.length,
        weightedScore,
        isExactSpecialty
      };
    });

    // 4. Sort by exact specialty first, then lowest weighted score, then ticket count
    staffWorkloads.sort((a, b) => {
      if (a.isExactSpecialty && !b.isExactSpecialty) return -1;
      if (!a.isExactSpecialty && b.isExactSpecialty) return 1;
      if (a.weightedScore !== b.weightedScore) return a.weightedScore - b.weightedScore;
      return a.ticketCount - b.ticketCount;
    });

    return staffWorkloads[0].staff;
  },

  /**
   * Detects potential duplicate active complaints in the same category & building
   * @param {Object} newComplaintData
   * @returns {Promise<Array<Object>>}
   */
  async findDuplicates({ title, building, room, categoryId }) {
    const openComplaints = await complaintRepo.findWhere((c) =>
      ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Awaiting Parts'].includes(c.status) &&
      !c.isDeleted
    );

    const candidates = [];
    const newTokens = new Set(title.toLowerCase().split(/\s+/).filter((w) => w.length > 3));

    for (const comp of openComplaints) {
      // Must match building
      if (comp.location?.building?.toLowerCase() !== building?.toLowerCase()) {
        continue;
      }

      // Check category match or room match
      const sameCategory = comp.categoryId === categoryId;
      const sameRoom = comp.location?.room?.toLowerCase() === room?.toLowerCase();

      // Token overlap
      const compTokens = new Set(comp.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
      let overlapCount = 0;
      for (const tok of newTokens) {
        if (compTokens.has(tok)) overlapCount++;
      }

      const similarityScore = newTokens.size > 0 ? overlapCount / Math.max(newTokens.size, compTokens.size) : 0;

      if ((sameRoom && sameCategory) || similarityScore >= 0.4) {
        candidates.push({
          id: comp.id,
          trackingNumber: comp.trackingNumber,
          referenceNumber: comp.referenceNumber,
          title: comp.title,
          status: comp.status,
          priority: comp.priority,
          location: comp.location,
          upvotesCount: comp.upvotesCount || 0,
          similarityScore: +(similarityScore * 100).toFixed(0),
          createdAt: comp.createdAt
        });
      }
    }

    return candidates;
  },

  /**
   * Estimates resolution time (in hours) based on historical average and priority
   */
  async getEstimatedResolutionTime(categoryId, priority) {
    const historicalComplaints = await complaintRepo.findWhere((c) =>
      ['Resolved', 'Closed'].includes(c.status) && c.categoryId === categoryId && c.resolvedAt
    );

    if (historicalComplaints.length >= 3) {
      const totalHours = historicalComplaints.reduce((acc, c) => {
        const duration = (new Date(c.resolvedAt) - new Date(c.createdAt)) / (1000 * 60 * 60);
        return acc + Math.max(1, duration);
      }, 0);
      return +(totalHours / historicalComplaints.length).toFixed(1);
    }

    // Default SLA fallback based on priority
    const defaults = { Urgent: 12, High: 36, Medium: 72, Low: 144 };
    return defaults[priority] || 48;
  }
};

export default automationService;
