import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';
import {
  getSubjects,
  getSubjectsByExam,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../controller/SubjectController.js';

const router = express.Router();

// Public: view subjects
router.get('/', cacheMiddleware({ ttl: 300, keyPrefix: 'cache:subject' }), getSubjects);
router.get('/exam/:examId', cacheMiddleware({ ttl: 300, keyPrefix: 'cache:subject' }), getSubjectsByExam);

// Admin only: create, update, delete
router.post('/', authenticate, requireRole('admin'), createSubject);
router.put('/:subjectId', authenticate, requireRole('admin'), updateSubject);
router.delete('/:subjectId', authenticate, requireRole('admin'), deleteSubject);

export default router;
