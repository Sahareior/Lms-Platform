import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';
import {
  getTopics,
  createTopic,
  resolveTopicsBatch,
  deleteTopic,
} from '../controller/TopicController.js';

const router = express.Router();

// Public: view topics
router.get('/', cacheMiddleware({ ttl: 300, keyPrefix: 'cache:topics' }), getTopics);

// Resolve or find-or-create batch of topics (used during analysis / pattern saving)
router.post('/resolve', authenticate, resolveTopicsBatch);

// Admin only: create, delete
router.post('/', authenticate, requireRole('admin'), createTopic);
router.delete('/:id', authenticate, requireRole('admin'), deleteTopic);

export default router;
