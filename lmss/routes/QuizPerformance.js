import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { postQuizPerformance, getQuizPerformance, getQuizPerformanceByUser } from '../controller/quizPerformController.js';

const router = express.Router();

// Public: view quiz performance
router.get('/', getQuizPerformance);

// Protected: create quiz performance
router.post('/', postQuizPerformance);
router.get('/:userId',getQuizPerformanceByUser)

export default router;
