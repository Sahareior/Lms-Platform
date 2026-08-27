import express from 'express';
import { authenticate, requireRole, requireSelfOrAdmin } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';
import {
  startAttempt,
  saveAnswer,
  batchSaveAnswers,
  completeAttempt,
  forceSubmit,
  getActiveAttempt,
  getWeeklyActivity,
  getQuizOverview,
  getUserAttempts,
  getAttemptById,
  getAllAttempts,
  exportAttemptsCsv,
} from '../controller/QuizAttemptController.js';

const router = express.Router();

// Protected: own data only (admins may read any user)
router.get('/active', authenticate, requireSelfOrAdmin('userId'), getActiveAttempt);
router.get('/activity/weekly', authenticate, requireSelfOrAdmin('userId'), cacheMiddleware({ ttl: 120, keyPrefix: 'cache:quiz-attempt' }), getWeeklyActivity);
router.get('/overview', authenticate, requireSelfOrAdmin('userId'), cacheMiddleware({ ttl: 60, keyPrefix: 'cache:quiz-attempt' }), getQuizOverview);
router.get('/user/:userId', authenticate, requireSelfOrAdmin('userId'), getUserAttempts);
router.get('/:id', authenticate, getAttemptById);

// Admin only: all attempts + summary (aggregation is expensive, cache briefly)
router.get('/', authenticate, requireRole('admin'), cacheMiddleware({ ttl: 60, keyPrefix: 'cache:quiz-attempt' }), getAllAttempts);
router.get('/export', authenticate, requireRole('admin'), exportAttemptsCsv);

// Protected: create and update attempts
router.post('/start', authenticate, startAttempt);
router.post('/save-answer', authenticate, saveAnswer);
router.post('/batch-save', authenticate, batchSaveAnswers);
router.post('/:id/complete', authenticate, completeAttempt);

// Force-submit: used by sendBeacon when the user closes the tab.
// No auth middleware — the token is verified from the request body.
router.post('/force-submit', forceSubmit);

export default router;
