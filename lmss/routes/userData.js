import express from 'express';
import { authenticate, requireSelfOrAdmin } from '../middleware/auth.js';
import {
  getUserPerformance,
  saveQuizPerformance,
  getExamPerformance,
  getPerformanceSummary,
} from '../controller/UserDataController.js';

const router = express.Router();

// Protected: view own performance (admins may read any user)
router.get('/performance/:userId/exam/:examId', authenticate, requireSelfOrAdmin('userId'), getExamPerformance);
router.get('/performance/:userId/summary', authenticate, requireSelfOrAdmin('userId'), getPerformanceSummary);
router.get('/performance/:userId', authenticate, requireSelfOrAdmin('userId'), getUserPerformance);

// Protected: save own quiz performance
router.post('/performance', authenticate, requireSelfOrAdmin('userId'), saveQuizPerformance);

export default router;
