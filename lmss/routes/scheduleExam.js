import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  listScheduleExams,
  getScheduleExamsByExam,
  getScheduleExamById,
  createScheduleExam,
  updateScheduleExam,
  deleteScheduleExam,
} from '../controller/ScheduleExamController.js';

const router = express.Router();

// Public: view scheduled exams
router.get('/', listScheduleExams);
router.get('/exam/:examId', getScheduleExamsByExam);
router.get('/:examId', getScheduleExamById);

// Protected: create, update, delete
router.post('/', authenticate, createScheduleExam);
router.put('/:examId', authenticate, updateScheduleExam);
router.delete('/:examId', authenticate, deleteScheduleExam);

export default router;
