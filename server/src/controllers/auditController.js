import { auditService } from '../services/auditService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAuditLogs = asyncHandler(async (req, res) => {
  const result = await auditService.getAuditLogs(req.query);
  res.json({
    success: true,
    data: result.logs,
    pagination: result.pagination
  });
});

export default {
  getAuditLogs
};
