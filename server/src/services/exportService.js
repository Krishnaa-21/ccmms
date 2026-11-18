import PDFDocument from 'pdfkit';
import { complaintRepo, settingsRepo } from '../repositories/index.js';
import { analyticsService } from './analyticsService.js';

export const exportService = {
  /**
   * Generates sanitized RFC 4180 compliant CSV of complaints
   */
  async generateComplaintsCSV(filters = {}) {
    let complaints = (await complaintRepo.findAll()).filter((c) => !c.isDeleted);

    if (filters.status) {
      complaints = complaints.filter((c) => c.status.toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.categoryId) {
      complaints = complaints.filter((c) => c.categoryId === filters.categoryId);
    }
    if (filters.priority) {
      complaints = complaints.filter((c) => c.priority.toLowerCase() === filters.priority.toLowerCase());
    }
    if (filters.building) {
      complaints = complaints.filter((c) => c.location?.building?.toLowerCase() === filters.building.toLowerCase());
    }

    complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const headers = [
      'Reference Number',
      'Tracking Number',
      'Title',
      'Category',
      'Subcategory',
      'Priority',
      'Status',
      'Building',
      'Floor',
      'Room',
      'Landmark',
      'Requester Name',
      'Requester Email',
      'Assigned Technician',
      'Created Date',
      'SLA Due Date',
      'Resolved Date',
      'Overdue',
      'Escalation Level',
      'Upvotes'
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = complaints.map((c) => [
      escapeCsv(c.referenceNumber || c.trackingNumber),
      escapeCsv(c.trackingNumber),
      escapeCsv(c.title),
      escapeCsv(c.categoryName),
      escapeCsv(c.subCategory),
      escapeCsv(c.priority),
      escapeCsv(c.status),
      escapeCsv(c.location?.building),
      escapeCsv(c.location?.floor),
      escapeCsv(c.location?.room),
      escapeCsv(c.location?.landmark || ''),
      escapeCsv(c.createdBy?.name),
      escapeCsv(c.createdBy?.email),
      escapeCsv(c.assignedTo?.name || 'Unassigned'),
      escapeCsv(c.createdAt),
      escapeCsv(c.dueDate),
      escapeCsv(c.resolvedAt || ''),
      escapeCsv(c.isOverdue ? 'YES' : 'NO'),
      escapeCsv(c.escalationLevel || 0),
      escapeCsv(c.upvotesCount || 0)
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    return csvContent;
  },

  /**
   * Generates a PDF analytics and executive maintenance report using PDFKit
   */
  async streamAnalyticsPDF(res) {
    const [overview, byCategory, byBuilding, settings] = await Promise.all([
      analyticsService.getOverview(),
      analyticsService.getByCategory(),
      analyticsService.getByBuilding(),
      settingsRepo.getSettings()
    ]);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    doc.pipe(res);

    // --- Header Banner ---
    doc.fillColor('#0f2942')
       .rect(0, 0, doc.page.width, 70)
       .fill();

    doc.fillColor('#ffffff')
       .fontSize(18)
       .font('Helvetica-Bold')
       .text(settings?.campusName || 'Apex Institute of Technology', 40, 20);

    doc.fontSize(10)
       .font('Helvetica')
       .text('Campus Complaint & Maintenance Management System (CCMMS) - Executive Report', 40, 42);

    doc.fontSize(8)
       .fillColor('#94bfde')
       .text(`Generated: ${new Date().toLocaleString()}`, doc.page.width - 200, 42, { align: 'right' });

    doc.moveDown(3);

    // --- Executive Summary Box ---
    doc.fillColor('#0f2942')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('1. Executive Summary & Operational Metrics', 40, 90);

    doc.moveDown(0.5);

    const metricsY = 110;
    const boxWidth = 120;
    const boxHeight = 55;
    const startX = 40;
    const gap = 12;

    const cards = [
      { label: 'Total Complaints', value: overview.totalComplaints, color: '#2563eb' },
      { label: 'Open Work Orders', value: overview.openComplaints, color: '#d97706' },
      { label: 'Resolved Tickets', value: overview.resolvedComplaints, color: '#16a34a' },
      { label: 'Overdue (Breached)', value: overview.overdueComplaints, color: '#dc2626' }
    ];

    cards.forEach((card, idx) => {
      const x = startX + idx * (boxWidth + gap);
      doc.roundedRect(x, metricsY, boxWidth, boxHeight, 4)
         .lineWidth(1)
         .strokeColor('#e2e8f0')
         .fillColor('#f8fafc')
         .fillAndStroke();

      doc.fillColor('#64748b')
         .fontSize(8)
         .font('Helvetica')
         .text(card.label, x + 8, metricsY + 8);

      doc.fillColor(card.color)
         .fontSize(18)
         .font('Helvetica-Bold')
         .text(String(card.value), x + 8, metricsY + 22);
    });

    // Sub-metrics row
    doc.moveDown(5);
    const subY = 180;
    doc.fillColor('#334155')
       .fontSize(9)
       .font('Helvetica')
       .text(`• SLA Compliance Rate: ${overview.slaComplianceRate}%`, 40, subY)
       .text(`• Average Resolution Time: ${overview.averageResolutionHours} Hours`, 200, subY)
       .text(`• Verified User Satisfaction: ${overview.averageRating} / 5.0 (${overview.totalFeedbackCount} Reviews)`, 380, subY);

    // --- Category Breakdown Table ---
    doc.moveDown(2);
    const catHeaderY = 215;
    doc.fillColor('#0f2942')
       .fontSize(13)
       .font('Helvetica-Bold')
       .text('2. Maintenance Performance by Department Category', 40, catHeaderY);

    // Table Header
    const tableTop = 235;
    doc.rect(40, tableTop, doc.page.width - 80, 20)
       .fillColor('#0f2942')
       .fill();

    doc.fillColor('#ffffff')
       .fontSize(8)
       .font('Helvetica-Bold')
       .text('CATEGORY', 50, tableTop + 6)
       .text('TOTAL', 180, tableTop + 6)
       .text('RESOLVED', 240, tableTop + 6)
       .text('PENDING', 310, tableTop + 6)
       .text('OVERDUE', 380, tableTop + 6)
       .text('RESOLUTION RATE', 450, tableTop + 6);

    let rowY = tableTop + 20;
    byCategory.forEach((cat, index) => {
      const isEven = index % 2 === 0;
      doc.rect(40, rowY, doc.page.width - 80, 18)
         .fillColor(isEven ? '#ffffff' : '#f8fafc')
         .fill();

      doc.fillColor('#1e293b')
         .fontSize(8)
         .font('Helvetica')
         .text(cat.categoryName, 50, rowY + 5)
         .text(String(cat.total), 180, rowY + 5)
         .text(String(cat.resolvedCount), 240, rowY + 5)
         .text(String(cat.pendingCount), 310, rowY + 5)
         .fillColor(cat.overdueCount > 0 ? '#dc2626' : '#1e293b')
         .text(String(cat.overdueCount), 380, rowY + 5)
         .fillColor('#1e293b')
         .text(`${cat.resolutionRate}%`, 450, rowY + 5);

      rowY += 18;
    });

    // --- Campus Building Hotspots ---
    rowY += 15;
    doc.fillColor('#0f2942')
       .fontSize(13)
       .font('Helvetica-Bold')
       .text('3. Facility Hotspots by Campus Building', 40, rowY);

    rowY += 20;
    doc.rect(40, rowY, doc.page.width - 80, 20)
       .fillColor('#0f2942')
       .fill();

    doc.fillColor('#ffffff')
       .fontSize(8)
       .font('Helvetica-Bold')
       .text('BUILDING NAME', 50, rowY + 6)
       .text('TOTAL TICKETS', 250, rowY + 6)
       .text('OPEN ISSUES', 350, rowY + 6)
       .text('URGENT PRIORITY', 450, rowY + 6);

    rowY += 20;
    byBuilding.slice(0, 6).forEach((b, index) => {
      const isEven = index % 2 === 0;
      doc.rect(40, rowY, doc.page.width - 80, 18)
         .fillColor(isEven ? '#ffffff' : '#f8fafc')
         .fill();

      doc.fillColor('#1e293b')
         .fontSize(8)
         .font('Helvetica')
         .text(b.building, 50, rowY + 5)
         .text(String(b.total), 250, rowY + 5)
         .text(String(b.open), 350, rowY + 5)
         .fillColor(b.urgent > 0 ? '#dc2626' : '#1e293b')
         .text(String(b.urgent), 450, rowY + 5);

      rowY += 18;
    });

    // Footer
    doc.fontSize(8)
       .fillColor('#94a3b8')
       .text('Apex Institute of Technology • Automated Operations Report • Confidential', 40, doc.page.height - 30, { align: 'center' });

    doc.end();
  }
};

export default exportService;
