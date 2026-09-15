import express from 'express';
import { authenticate, requireRole, requireSelfOrAdmin } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { postQuizPerformance, getQuizPerformance, getQuizPerformanceByUser, getNotebookQuestions } from '../controller/quizPerformController.js';

const router = express.Router();

// User's notebook: all answered questions (right/wrong) + favorites.
// NOTE: must be registered before '/:userId' or it would be swallowed by it.
router.get('/notebook', authenticate, getNotebookQuestions);

// Admin only: view all performances (expensive question resolution, cache briefly)
router.get('/', authenticate, requireRole('admin'), cacheMiddleware({ ttl: 60, keyPrefix: 'cache:quiz-performance' }), getQuizPerformance);

// Protected: own data only
router.post('/', authenticate, requireSelfOrAdmin('user'), postQuizPerformance);
router.get('/:userId', authenticate, requireSelfOrAdmin('userId'), getQuizPerformanceByUser);

export default router;
