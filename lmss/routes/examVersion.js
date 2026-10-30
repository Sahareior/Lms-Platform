import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { addExamVersion, getExamVersion, getExamVersionsByExam, updateExamVersion, deleteExamVersion } from '../controller/ExamVersionController.js';

const examVer = express.Router()

// Public: view exam versions
examVer.get('/', cacheMiddleware({ ttl: 300, keyPrefix: 'cache:exam-version' }), getExamVersion)
examVer.get('/exam/:examId', cacheMiddleware({ ttl: 300, keyPrefix: 'cache:exam-version' }), getExamVersionsByExam)

// Admin only: create, update, delete
examVer.post('/', authenticate, requireRole('admin'), addExamVersion)
examVer.put('/:versionId', authenticate, requireRole('admin'), updateExamVersion)
examVer.delete('/:versionId', authenticate, requireRole('admin'), deleteExamVersion)

export default examVer