import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
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
// NOTE: no Redis cache here — statuses must be computed live (upcoming → active → completed)
router.get('/', listScheduleExams);
router.get('/featured', getFeaturedScheduleExam);
router.get('/exam/:examId', getScheduleExamsByExam);
router.get('/:examId', getScheduleExamById);

// Admin only: create, update, delete
router.post('/', authenticate, requireRole('admin'), createScheduleExam);
router.put('/:examId', authenticate, requireRole('admin'), updateScheduleExam);
router.put('/:examId/featured', authenticate, requireRole('admin'), setFeaturedScheduleExam);
router.delete('/:examId', authenticate, requireRole('admin'), deleteScheduleExam);

export default router;
