import express from 'express';
import multer from 'multer';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
    getCreativeQuestionSets,
    getCreativeQuestionSetById,
    uploadCreativeQuestionSet,
    updateCreativeQuestionSet,
    updateCreativeQuestion,
    deleteCreativeQuestion,
    deleteCreativeQuestionSet,
} from '../controller/CreativeQuestionController.js';

const router = express.Router();

// Multipart handling for the JSON file upload (memory storage; max 10 MB).
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
});

// ─── Public: view question sets ───────────────────────────────
router.get('/', getCreativeQuestionSets);
router.get('/:setId', getCreativeQuestionSetById);

// ─── Admin: upload / edit / delete ────────────────────────────
router.post('/upload', authenticate, requireRole('admin'), upload.single('file'), uploadCreativeQuestionSet);
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
