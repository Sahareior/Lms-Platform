import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { createExam, listExams, selectExamForUser, removeExamForUser, getUserExams, updateExam, deleteExam } from '../controller/Exam.js';

const router = express.Router();

// Public: browse exams
router.get('/', cacheMiddleware({ ttl: 300, keyPrefix: 'cache:exam' }), listExams);

// Protected: user-specific operations
router.post('/select', authenticate, selectExamForUser);
router.post('/remove', authenticate, removeExamForUser);
router.get('/user/:userId', authenticate, getUserExams);

// Admin only: create, update, delete exams
router.post('/', authenticate, requireRole('admin'), createExam);
router.put('/:examId', authenticate, requireRole('admin'), updateExam);
router.delete('/:examId', authenticate, requireRole('admin'), deleteExam);

export default router;
