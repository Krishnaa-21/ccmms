import express from 'express';
import healthRoutes from './healthRoutes.js';
import docsRoutes from './docsRoutes.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import complaintRoutes from './complaintRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import feedbackRoutes from './feedbackRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import exportRoutes from './exportRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import auditRoutes from './auditRoutes.js';
import adminRoutes from './adminRoutes.js';
import demoRoutes from './demoRoutes.js';
import preventiveRoutes from './preventiveRoutes.js';
import locationRoutes from './locationRoutes.js';
import inventoryRoutes from './inventoryRoutes.js';

const router = express.Router();

// Public Documentation & Health
router.use('/', healthRoutes);
router.use('/', docsRoutes);

// Core APIs
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/complaints', complaintRoutes);
router.use('/notifications', notificationRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/export', exportRoutes);
router.use('/settings', settingsRoutes);
router.use('/audit-log', auditRoutes);
router.use('/admin', adminRoutes);
router.use('/preventive-plans', preventiveRoutes);
router.use('/locations', locationRoutes);
router.use('/inventory', inventoryRoutes);

// Demo preview utility
router.use('/demo', demoRoutes);

export default router;
