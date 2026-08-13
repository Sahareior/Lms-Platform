import express from 'express';
import { authenticate } from '../middleware/auth.js';
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

// Protected: create, update, delete
router.post('/', authenticate, createSubject);
router.put('/:subjectId', authenticate, updateSubject);
router.delete('/:subjectId', authenticate, deleteSubject);

export default router;
