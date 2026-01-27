import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  createActivitySchedule,
  getActivitySchedules,
  getActivityScheduleById,
  updateActivitySchedule,
  acceptActivitySchedule,
  rejectActivitySchedule,
  completeActivitySchedule,
  cancelActivitySchedule,
  getServicePersonAvailability,
  suggestOptimalSchedule,
} from '../controllers/activityScheduleController';
import { requireRole } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create activity schedule (Admin or Zone users only)
router.post('/', requireRole(['ADMIN', 'ZONE_MANAGER', 'ZONE_USER', 'EXPERT_HELPDESK'] as UserRole[]), createActivitySchedule);

// Get all activity schedules (with filters)
router.get('/', getActivitySchedules);

// Get availability for a service person
router.get('/availability/:servicePersonId', getServicePersonAvailability);

// Suggest optimal schedule
router.post('/suggest', suggestOptimalSchedule);

// Get schedule details
router.get('/:id', getActivityScheduleById);

// Update schedule (only PENDING)
router.patch('/:id', updateActivitySchedule);

// Accept schedule (service person only)
router.patch('/:id/accept', acceptActivitySchedule);

// Reject schedule (service person only)
router.patch('/:id/reject', rejectActivitySchedule);

// Complete schedule
router.patch('/:id/complete', completeActivitySchedule);

// Cancel schedule (only PENDING)
router.patch('/:id/cancel', cancelActivitySchedule);

export default router;
