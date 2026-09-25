import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';
import {
  getStudyPdfs,
  getStudyPdfById,
  createStudyPdf,
  updateStudyPdf,
  deleteStudyPdf,
  incrementPdfDownload,
  getStudyPdfFile,
  getBlogPosts,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getStudyGroupLinks,
  createStudyGroupLink,
  updateStudyGroupLink,
  deleteStudyGroupLink,
} from '../controller/StudySectionController.js';

const router = express.Router();

// NOTE: specific paths must be declared BEFORE the parameterized '/:id'
// routes below, otherwise '/blog-posts' would match '/:id'.

// ─── Blog Posts (সাম্প্রতিক পোস্ট) ────────────────────────────
router.get('/blog-posts', cacheMiddleware({ ttl: 120, keyPrefix: 'cache:study' }), getBlogPosts);
router.get('/blog-posts/:id', getBlogPostById);

router.post('/blog-posts', authenticate, requireRole('admin'), createBlogPost);
router.put('/blog-posts/:id', authenticate, requireRole('admin'), updateBlogPost);
router.delete('/blog-posts/:id', authenticate, requireRole('admin'), deleteBlogPost);

// ─── Study Group Links (FB / Insta / YT …) ──────────────────
router.get('/study-group-links', cacheMiddleware({ ttl: 300, keyPrefix: 'cache:study' }), getStudyGroupLinks);
router.post('/study-group-links', authenticate, requireRole('admin'), createStudyGroupLink);
router.put('/study-group-links/:id', authenticate, requireRole('admin'), updateStudyGroupLink);
router.delete('/study-group-links/:id', authenticate, requireRole('admin'), deleteStudyGroupLink);

// ─── Study PDFs (academic / job) ────────────────────────────
// Public reads (cached), admin writes.
router.get('/', cacheMiddleware({ ttl: 300, keyPrefix: 'cache:study' }), getStudyPdfs);
router.get('/:id/file', getStudyPdfFile);
router.get('/:id/download', getStudyPdfFile);
router.get('/:id', getStudyPdfById);
router.post('/:id/download', incrementPdfDownload);

router.post('/', authenticate, requireRole('admin'), createStudyPdf);
router.put('/:id', authenticate, requireRole('admin'), updateStudyPdf);
router.delete('/:id', authenticate, requireRole('admin'), deleteStudyPdf);

export default router;
