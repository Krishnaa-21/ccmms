import { auditLogRepo } from '../repositories/index.js';

export const auditService = {
  async getAuditLogs(filters = {}) {
    const { action, entityType, actorId, page = 1, limit = 50 } = filters;
    let logs = await auditLogRepo.findAll();

    if (action) {
      logs = logs.filter((l) => l.action.toLowerCase() === action.toLowerCase());
    }
    if (entityType) {
      logs = logs.filter((l) => l.entityType.toLowerCase() === entityType.toLowerCase());
    }
    if (actorId) {
      logs = logs.filter((l) => l.actor?.id === actorId);
    }

    logs.sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt));

    const total = logs.length;
    const startIndex = (page - 1) * limit;
    const paginated = logs.slice(startIndex, startIndex + Number(limit));

    return {
      logs: paginated,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }
};

export default auditService;
