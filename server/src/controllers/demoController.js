import {
  complaintRepo,
  userRepo,
  categoryRepo,
  feedbackRepo,
  statusHistoryRepo,
  settingsRepo,
  notificationRepo
} from '../repositories/index.js';
import { resetDemoData } from '../seed/seed.js';

export async function getSummary(req, res, next) {
  try {
    const [complaints, users, categories, feedbacks, settings] = await Promise.all([
      complaintRepo.findAll(),
      userRepo.findAll(),
      categoryRepo.findAll(),
      feedbackRepo.findAll(),
      settingsRepo.getSettings()
    ]);

    const statusCounts = complaints.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});

    const priorityCounts = complaints.reduce((acc, c) => {
      acc[c.priority] = (acc[c.priority] || 0) + 1;
      return acc;
    }, {});

    const overdueCount = complaints.filter((c) => c.isOverdue).length;
    const avgRating = feedbacks.length
      ? +(feedbacks.reduce((a, b) => a + b.rating, 0) / feedbacks.length).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        campus: settings,
        counts: {
          totalComplaints: complaints.length,
          overdueComplaints: overdueCount,
          activeStaff: users.filter((u) => u.role === 'staff').length,
          totalUsers: users.length,
          averageRating: avgRating,
          byStatus: statusCounts,
          byPriority: priorityCounts
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getCategories(req, res, next) {
  try {
    const categories = await categoryRepo.findAll();
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
}

export async function getComplaints(req, res, next) {
  try {
    const { status, priority, categoryId, limit = 50 } = req.query;
    let list = await complaintRepo.findAll();

    if (status) {
      list = list.filter((c) => c.status.toLowerCase() === status.toLowerCase());
    }
    if (priority) {
      list = list.filter((c) => c.priority.toLowerCase() === priority.toLowerCase());
    }
    if (categoryId) {
      list = list.filter((c) => c.categoryId === categoryId);
    }

    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      total: list.length,
      data: list.slice(0, Number(limit))
    });
  } catch (error) {
    next(error);
  }
}

export async function getUsers(req, res, next) {
  try {
    const users = await userRepo.findAll();
    // Strip passwords
    const safeUsers = users.map(({ password, ...rest }) => rest);
    res.json({ success: true, data: safeUsers });
  } catch (error) {
    next(error);
  }
}

export async function resetData(req, res, next) {
  try {
    const result = await resetDemoData();
    res.json({
      success: true,
      message: 'Demo dataset successfully reseeded to initial state',
      data: result
    });
  } catch (error) {
    next(error);
  }
}
