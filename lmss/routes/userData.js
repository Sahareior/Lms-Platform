import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getUserPerformance,
  saveQuizPerformance,
  getExamPerformance,
  getPerformanceSummary,
} from '../controller/UserDataController.js';

const router = express.Router();

// Protected: view user performance
router.get('/performance/:userId/exam/:examId', authenticate, getExamPerformance);
router.get('/performance/:userId/summary', authenticate, getPerformanceSummary);
router.get('/performance/:userId', authenticate, getUserPerformance);

// Protected: save quiz performance
router.post('/performance', authenticate, saveQuizPerformance);

export default router;
