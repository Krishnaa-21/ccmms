import { exportService } from '../services/exportService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const exportComplaintsCSV = asyncHandler(async (req, res) => {
  const csvData = await exportService.generateComplaintsCSV(req.query);

  const filename = `ccmms_complaints_${new Date().toISOString().slice(0, 10)}.csv`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.status(200).send(csvData);
});

export const exportAnalyticsPDF = asyncHandler(async (req, res) => {
  const filename = `ccmms_executive_report_${new Date().toISOString().slice(0, 10)}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  await exportService.streamAnalyticsPDF(res);
});

export default {
  exportComplaintsCSV,
  exportAnalyticsPDF
};
