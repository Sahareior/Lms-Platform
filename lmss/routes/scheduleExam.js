import express from 'express';
import { authenticate } from '../middleware/auth.js';
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

// Protected: create, update, delete
router.post('/', authenticate, createScheduleExam);
router.put('/:examId', authenticate, updateScheduleExam);
router.put('/:examId/featured', authenticate, setFeaturedScheduleExam);
router.delete('/:examId', authenticate, deleteScheduleExam);

export default router;
