import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';
import {
  startAttempt,
  saveAnswer,
  batchSaveAnswers,
  completeAttempt,
  getActiveAttempt,
  getUserAttempts,
  getAttemptById,
  getAllAttempts,
} from '../controller/QuizAttemptController.js';

const router = express.Router();

// Public: get active attempt for a user
router.get('/active', getActiveAttempt);

// Protected: view attempts (by user, by id, all)
router.get('/user/:userId', authenticate, getUserAttempts);
router.get('/:id', authenticate, getAttemptById);

// Admin: all attempts + summary (aggregation is expensive, cache briefly)
router.get('/', authenticate, cacheMiddleware({ ttl: 60, keyPrefix: 'cache:quiz-attempt' }), getAllAttempts);

// Protected: create and update attempts
router.post('/start', authenticate, startAttempt);
router.post('/save-answer', authenticate, saveAnswer);
router.post('/batch-save', authenticate, batchSaveAnswers);
router.post('/:id/complete', authenticate, completeAttempt);

export default router;
