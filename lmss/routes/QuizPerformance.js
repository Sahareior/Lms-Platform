import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { postQuizPerformance, getQuizPerformance, getQuizPerformanceByUser } from '../controller/quizPerformController.js';

const router = express.Router();

// Public: view quiz performance (expensive question resolution, cache briefly)
router.get('/', cacheMiddleware({ ttl: 60, keyPrefix: 'cache:quiz-performance' }), getQuizPerformance);

// Protected: create quiz performance
router.post('/', postQuizPerformance);
router.get('/:userId',getQuizPerformanceByUser)

export default router;
