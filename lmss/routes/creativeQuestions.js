import express from 'express';
import multer from 'multer';
import { authenticate, requireRole } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';
import {
    getCreativeQuestionSets,
    getCreativeQuestionSetById,
    uploadCreativeQuestionSet,
    updateCreativeQuestionSet,
    updateCreativeQuestion,
    deleteCreativeQuestion,
    deleteCreativeQuestionSet,
    importCreativeQuestions,
} from '../controller/CreativeQuestionController.js';

const router = express.Router();

// Multipart handling for the JSON file upload (memory storage; max 10 MB).
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
});

// ─── Public: view question sets ───────────────────────────────
// Redis-cached (5 min) — the sets list aggregates over every question and a
// full set payload can exceed 1 MB, so repeat reads should not hit MongoDB.
// All mutations already call invalidatePrefix('cache:creative-question').
const CQ_CACHE = { ttl: 300, keyPrefix: 'cache:creative-question' };

router.get('/', cacheMiddleware(CQ_CACHE), getCreativeQuestionSets);
router.get('/:setId', cacheMiddleware(CQ_CACHE), getCreativeQuestionSetById);

// ─── Admin: upload / edit / delete / import ───────────────────
router.post('/upload', authenticate, requireRole('admin'), upload.single('file'), uploadCreativeQuestionSet);
router.post('/:setId/import', authenticate, requireRole('admin'), upload.single('file'), importCreativeQuestions);
router.put('/:setId', authenticate, requireRole('admin'), updateCreativeQuestionSet);
router.put('/:setId/question/:questionId', authenticate, requireRole('admin'), updateCreativeQuestion);
router.delete('/:setId/question/:questionId', authenticate, requireRole('admin'), deleteCreativeQuestion);
router.delete('/:setId', authenticate, requireRole('admin'), deleteCreativeQuestionSet);

// Multer errors (file too large etc.) → readable JSON.
router.use((err, _req, res, _next) => {
    if (err instanceof multer.MulterError) {
        const message =
            err.code === 'LIMIT_FILE_SIZE'
                ? 'File is too large (max 10 MB)'
                : `Upload error: ${err.code}`;
        return res.status(400).json({ message });
    }
    if (err) {
        return res.status(400).json({ message: err.message || 'Upload failed' });
    }
    _next();
});

export default router;
