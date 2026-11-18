import { complaintRepo, userRepo, categoryRepo, feedbackRepo, settingsRepo } from '../repositories/index.js';

export async function getHealth(req, res, next) {
  try {
    const [complaintsCount, users, categories, avgRating, settings] = await Promise.all([
      complaintRepo.countByStatus(),
      userRepo.findAll(),
      categoryRepo.findAll(),
      feedbackRepo.getAverageRating(),
      settingsRepo.getSettings()
    ]);

    const totalComplaints = Object.values(complaintsCount).reduce((a, b) => a + b, 0);

    res.json({
      success: true,
      data: {
        status: 'UP',
        service: 'CCMMS Backend API',
        phase: 'Phase 1 - Foundation, Design System & Demo Data',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        campus: {
          id: settings?.campusId || 'apex-campus-main',
          name: settings?.campusName || 'Apex Institute of Technology',
          code: settings?.campusCode || 'AIT-MAIN'
        },
        storage: {
          engine: 'JSON File-Store (Atomic + Mutex + In-Memory Cache)',
          collections: {
            users: users.length,
            categories: categories.length,
            complaints: totalComplaints,
            complaintsByStatus: complaintsCount,
            verifiedAverageRating: avgRating
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
}
