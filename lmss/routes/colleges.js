import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';
import {
  getColleges,
  createCollege,
  updateCollege,
  deleteCollege,
} from '../controller/CollegeController.js';

const router = express.Router();

// Public: view colleges (used by admin scraper dropdown & student filters)
router.get('/', cacheMiddleware({ ttl: 300, keyPrefix: 'cache:college' }), getColleges);

// Admin only: create, update, delete
router.post('/', authenticate, requireRole('admin'), createCollege);
router.put('/:collegeId', authenticate, requireRole('admin'), updateCollege);
router.delete('/:collegeId', authenticate, requireRole('admin'), deleteCollege);

export default router;
