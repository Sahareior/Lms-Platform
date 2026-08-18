import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';
import {
  listScheduleExams,
  getScheduleExamsByExam,
  getScheduleExamById,
  getFeaturedScheduleExam,
  setFeaturedScheduleExam,
  createScheduleExam,
  updateScheduleExam,
  deleteScheduleExam,
} from '../controller/ScheduleExamController.js';

const router = express.Router();

// Public: view scheduled exams
router.get('/', cacheMiddleware({ ttl: 300, keyPrefix: 'cache:schedule-exam' }), listScheduleExams);
router.get('/featured', cacheMiddleware({ ttl: 300, keyPrefix: 'cache:schedule-exam' }), getFeaturedScheduleExam);
router.get('/exam/:examId', cacheMiddleware({ ttl: 300, keyPrefix: 'cache:schedule-exam' }), getScheduleExamsByExam);
router.get('/:examId', cacheMiddleware({ ttl: 300, keyPrefix: 'cache:schedule-exam' }), getScheduleExamById);

// Admin only: create, update, delete
router.post('/', authenticate, requireRole('admin'), createScheduleExam);
router.put('/:examId', authenticate, requireRole('admin'), updateScheduleExam);
router.put('/:examId/featured', authenticate, requireRole('admin'), setFeaturedScheduleExam);
router.delete('/:examId', authenticate, requireRole('admin'), deleteScheduleExam);

export default router;
