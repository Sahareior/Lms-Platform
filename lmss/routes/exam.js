import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { createExam, listExams, selectExamForUser, removeExamForUser, getUserExams, updateExam, deleteExam } from '../controller/Exam.js';

const router = express.Router();

// Public: browse exams
router.get('/', cacheMiddleware({ ttl: 300, keyPrefix: 'cache:exam' }), listExams);

// Protected: user-specific + admin operations
router.post('/', authenticate, createExam);
router.post('/select', authenticate, selectExamForUser);
router.post('/remove', authenticate, removeExamForUser);
router.get('/user/:userId', authenticate, getUserExams);
router.put('/:examId', authenticate, updateExam);
router.delete('/:examId', authenticate, deleteExam);

export default router;
