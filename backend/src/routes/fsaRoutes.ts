// routes/fsaRoutes.ts
import express from 'express';
import {
  getFSADashboard,
  getServiceZoneAnalytics,
  getUserPerformance,
  getServicePersonPerformance,
  getRealTimeMetrics,
  getPredictiveAnalytics,
  getAdvancedPerformanceMetrics,
  getEquipmentAnalytics,
  getCustomerSatisfactionMetrics,
  getResourceOptimization,
  getServiceReports,
  exportFSAData
} from '../controllers/fsaController';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = express.Router();

// All routes require authentication and specific roles
router.use(authenticate);
router.use(requireRole(['ADMIN', 'ZONE_MANAGER', 'ZONE_USER', 'EXPERT_HELPDESK'] as UserRole[]));

// Core FSA Dashboard routes
router.get('/', getFSADashboard);
router.get('/dashboard', getFSADashboard);
router.get('/zones/:zoneId', getServiceZoneAnalytics);
router.get('/users/:userId/performance', getUserPerformance);
router.get('/service-persons/:servicePersonId/performance', getServicePersonPerformance);

// Advanced Analytics routes - Updated to match frontend expectations
router.get('/realtime', getRealTimeMetrics);
router.get('/predictive', getPredictiveAnalytics);
router.get('/performance/advanced', getAdvancedPerformanceMetrics);
router.get('/equipment/analytics', getEquipmentAnalytics);
router.get('/satisfaction', getCustomerSatisfactionMetrics);
router.get('/optimization', getResourceOptimization);

// Reporting routes
router.get('/reports', getServiceReports);
router.get('/export/:format', exportFSAData);
router.post('/export', exportFSAData);

export default router;