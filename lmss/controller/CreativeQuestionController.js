import mongoose from "mongoose";
import CreativeQuestionSet from "../models/CreativeQuestionSet.js";
import { invalidatePrefix } from "../middleware/cache.js";

const CACHE_PREFIX = 'cache:creative-question';

// ─── Upload format validation ─────────────────────────────────
// Mirrors lmsp/.../ReadingPage/tools/types.ts — the shape the Reading page
// consumes. Every violation is collected (not fail-fast) so admins can fix
// the whole file in one pass.

const MAX_QUESTIONS = 500;
const MAX_PARTS_PER_QUESTION = 8;

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

/**
 * Validates a CQ image object ({ url, caption? }). Returns an error string or
 * null when the image is well-formed.
 */
const validateCQImage = (img, at) => {
    if (!img || typeof img !== 'object' || Array.isArray(img)) {
        return `${at}: must be an object with a "url" string`;
    }
    if (typeof img.url !== 'string' || !img.url.trim()) {
        return `${at}: "url" is required (string)`;
    }
    if (img.caption !== undefined && img.caption !== null && typeof img.caption !== 'string') {
        return `${at}: "caption" must be a string`;
    }
    return null;
};

/**
 * Validates an optional array of CQ images. Returns a list of errors (empty
 * when the field is absent/null or the array is well-formed).
 */
const validateCQImageArray = (arr, at) => {
    if (arr === undefined || arr === null) return [];
    if (!Array.isArray(arr)) return [`${at}: must be an array of { url, caption? } objects`];
    const errors = [];
    arr.forEach((img, i) => {
        const err = validateCQImage(img, `${at}[${i}]`);
        if (err) errors.push(err);
    });
    return errors;
};

/**
 * Validates an uploaded creative-question payload (an array of question
 * objects) and returns a list of human-readable errors. An empty list means
 * the payload is accepted.
 */
export const validateCreativeQuestionPayload = (payload) => {
    const errors = [];

    if (!Array.isArray(payload)) {
        return ['Invalid format: the JSON file must contain an array of questions (e.g. [ { ... }, ... ])'];
    }
    if (payload.length === 0) {
        return ['The file contains an empty question array'];
    }
    if (payload.length > MAX_QUESTIONS) {
        errors.push(`Too many questions: ${payload.length} (max ${MAX_QUESTIONS} per set)`);
    }

    const seenIds = new Set();

    payload.forEach((q, i) => {
        const at = `question #${i + 1}${q?.id ? ` (id "${q.id}")` : ''}`;

        if (q === null || typeof q !== 'object' || Array.isArray(q)) {
            errors.push(`${at}: must be an object`);
            return;
        }

        // Required identity fields
        if (!isNonEmptyString(q.id)) errors.push(`${at}: "id" is required (string, e.g. "ch1-q1")`);
        else if (seenIds.has(q.id)) errors.push(`${at}: duplicate id "${q.id}"`);
        else seenIds.add(q.id);

        if (!isNonEmptyString(q.chapterId)) errors.push(`${at}: "chapterId" is required (string, e.g. "ch1")`);
        if (typeof q.chapterNumber !== 'number' || !Number.isInteger(q.chapterNumber) || q.chapterNumber < 1) {
            errors.push(`${at}: "chapterNumber" must be a positive integer`);
        }
        if (!isNonEmptyString(q.chapter)) errors.push(`${at}: "chapter" is required (string)`);

        // Note: question numbers may repeat (e.g. alternate college versions of
        // the same board question share the original number). Only ids must be
        // unique — the UI addresses questions by id, not by number.
        if (typeof q.number !== 'number' || !Number.isInteger(q.number) || q.number < 1) {
            errors.push(`${at}: "number" must be a positive integer`);
        }

        // source (optional but must be well-formed when present)
        if (q.source !== undefined && q.source !== null) {
            if (typeof q.source !== 'object' || Array.isArray(q.source)) {
                errors.push(`${at}: "source" must be an object`);
            } else {
                for (const key of ['kind', 'board', 'year', 'questionNo', 'raw']) {
                    if (q.source[key] !== undefined && q.source[key] !== null && typeof q.source[key] !== 'string') {
                        errors.push(`${at}: "source.${key}" must be a string`);
                    }
                }
            }
        }

        // imageNeeded: optional boolean
        if (q.imageNeeded !== undefined && q.imageNeeded !== null && typeof q.imageNeeded !== 'boolean') {
            errors.push(`${at}: "imageNeeded" must be a boolean (true or false)`);
        }

        // stimulus: optional string
        if (q.stimulus !== undefined && q.stimulus !== null && typeof q.stimulus !== 'string') {
            errors.push(`${at}: "stimulus" must be a string`);
        }

        // stimulusImages: optional array of { url, caption? }
        errors.push(
            ...validateCQImageArray(q.stimulusImages, `${at}.stimulusImages`)
        );

        // stimulusBlocks: optional array of objects (shape varies: text blocks
        // use {kind,value}, image blocks use {kind,ref,description,labels}).
        if (q.stimulusBlocks !== undefined && q.stimulusBlocks !== null) {
            if (!Array.isArray(q.stimulusBlocks)) {
                errors.push(`${at}: "stimulusBlocks" must be an array`);
            } else {
                q.stimulusBlocks.forEach((b, bi) => {
                    if (!b || typeof b !== 'object' || Array.isArray(b)) {
                        errors.push(`${at}: stimulusBlocks[${bi}] must be an object`);
                    }
                });
            }
        }

        // parts: required array (may be empty for incomplete source entries —
        // the Reading page renders a friendly empty state for those).
        if (!Array.isArray(q.parts)) {
            errors.push(`${at}: "parts" is required and must be an array of { label, text, answer } objects`);
        } else {
            if (q.parts.length > MAX_PARTS_PER_QUESTION) {
                errors.push(`${at}: too many parts (${q.parts.length}, max ${MAX_PARTS_PER_QUESTION})`);
            }
            const seenLabels = new Set();
            q.parts.forEach((p, pi) => {
                const atPart = `${at}, part #${pi + 1}`;
                if (!p || typeof p !== 'object' || Array.isArray(p)) {
                    errors.push(`${atPart}: must be an object`);
                    return;
                }
                if (!isNonEmptyString(p.label)) errors.push(`${atPart}: "label" is required (e.g. "ক", "খ", "গ", "ঘ")`);
                else if (seenLabels.has(p.label)) errors.push(`${atPart}: duplicate label "${p.label}"`);
                else seenLabels.add(p.label);

                if (!isNonEmptyString(p.text)) errors.push(`${atPart}: "text" is required`);
                if (p.marks !== undefined && p.marks !== null && (typeof p.marks !== 'number' || p.marks < 0 || p.marks > 100)) {
                    errors.push(`${atPart}: "marks" must be a number between 0 and 100`);
                }
                if (p.answer !== undefined && p.answer !== null && typeof p.answer !== 'string') {
                    errors.push(`${atPart}: "answer" must be a string`);
                }
                // questionImages / answerImages: optional arrays of { url, caption? }
                errors.push(
                    ...validateCQImageArray(p.questionImages, `${atPart}.questionImages`),
                    ...validateCQImageArray(p.answerImages, `${atPart}.answerImages`)
                );
                if (p.modelAnswers !== undefined && p.modelAnswers !== null) {
                    if (!Array.isArray(p.modelAnswers) || p.modelAnswers.some((m) => typeof m !== 'string')) {
                        errors.push(`${atPart}: "modelAnswers" must be an array of strings`);
                    }
                }
            });
        }

        // answerNotes: optional string
        if (q.answerNotes !== undefined && q.answerNotes !== null && typeof q.answerNotes !== 'string') {
            errors.push(`${at}: "answerNotes" must be a string`);
        }
    });

    return errors;
};

// ─── Helpers ──────────────────────────────────────────────────

const isValidObjectId = (v) => typeof v === 'string' && mongoose.Types.ObjectId.isValid(v);

const parseSetFilter = (query) => {
    const filter = {};
    if (query.exam) filter.exam = query.exam;
    if (query.examVersion) filter.examVersion = query.examVersion;
    if (query.subject) filter.subject = query.subject;
    return filter;
};

// ─── Endpoints ────────────────────────────────────────────────

/**
 * GET /creative-questions
 * Public list of question sets (summaries with question counts).
 * Filters: ?exam=<id>&examVersion=<id>&subject=<id>
 */
export const getCreativeQuestionSets = async (req, res) => {
    try {
        const filter = parseSetFilter(req.query);

        // ObjectId fields must be cast manually for aggregation.
        const match = {};
        for (const key of ['exam', 'examVersion', 'subject']) {
            if (filter[key] === undefined) continue;
            if (isValidObjectId(filter[key])) {
                match[key] = new mongoose.Types.ObjectId(filter[key]);
            } else {
                return res.status(200).json([]);
            }
        }
        // examVersion: null must match sets without a version too
        // (handled client-side by omitting the param instead).

        const sets = await CreativeQuestionSet.aggregate([
            { $match: match },
            {
                $project: {
                    exam: 1,
                    examVersion: 1,
                    subject: 1,
                    title: 1,
                    description: 1,
                    questionCount: { $size: { $ifNull: ['$questions', []] } },
                    imageNeededCount: {
                        $size: {
                            $filter: {
                                input: { $ifNull: ['$questions', []] },
                                as: 'q',
                                cond: { $eq: ['$$q.imageNeeded', true] },
                            },
                        },
                    },
                    emptyAnswerCount: {
                        $size: {
                            $filter: {
                                input: { $ifNull: ['$questions', []] },
                                as: 'q',
                                cond: {
                                    $or: [
                                        { $eq: [{ $size: { $ifNull: ['$$q.parts', []] } }, 0] },
                                        {
                                            $gt: [
                                                {
                                                    $size: {
                                                        $filter: {
                                                            input: { $ifNull: ['$$q.parts', []] },
                                                            as: 'p',
                                                            cond: {
                                                                $or: [
                                                                    { $eq: [{ $ifNull: ['$$p.answer', ''] }, ''] },
                                                                    { $eq: [{ $trim: { input: { $ifNull: ['$$p.answer', ''] } } }, ''] },
                                                                ],
                                                            },
                                                        },
                                                    },
                                                },
                                                0,
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                    },
                    emptyQuestionTextCount: {
                        $size: {
                            $filter: {
                                input: { $ifNull: ['$questions', []] },
                                as: 'q',
                                cond: {
                                    $or: [
                                        { $eq: [{ $size: { $ifNull: ['$$q.parts', []] } }, 0] },
                                        {
                                            $gt: [
                                                {
                                                    $size: {
                                                        $filter: {
                                                            input: { $ifNull: ['$$q.parts', []] },
                                                            as: 'p',
                                                            cond: {
                                                                $or: [
                                                                    { $eq: [{ $ifNull: ['$$p.text', ''] }, ''] },
                                                                    { $eq: [{ $trim: { input: { $ifNull: ['$$p.text', ''] } } }, ''] },
                                                                ],
                                                            },
                                                        },
                                                    },
                                                },
                                                0,
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                    },
                    chapters: {
                        $setUnion: {
                            $map: {
                                input: { $ifNull: ['$questions', []] },
                                as: 'q',
                                in: { id: '$$q.chapterId', number: '$$q.chapterNumber', name: '$$q.chapter' },
                            },
                        },
                    },
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
            { $sort: { createdAt: -1 } },
        ]);

        res.status(200).json(sets);
    } catch (err) {
        console.error('getCreativeQuestionSets error:', err);
        res.status(500).json({ message: 'Unable to fetch creative question sets' });
    }
};

/**
 * GET /creative-questions/:setId
 * Public: one set with exam/version/subject populated.
 *
 * Optional pagination: ?page=1&limit=100 (limit capped at 500) returns only a
 * slice of the questions plus pagination metadata:
 *   { ..., questions, totalQuestions, page, limit, totalPages, hasNextPage }
 * Without pagination params the full set is returned (legacy behaviour).
 */
export const getCreativeQuestionSetById = async (req, res) => {
    try {
        const { setId } = req.params;
        if (!isValidObjectId(setId)) {
            return res.status(400).json({ message: 'Invalid set id' });
        }

        // ── Legacy mode: no pagination params → full set (unchanged) ──
        const hasPageParams = req.query.page !== undefined || req.query.limit !== undefined;
        if (!hasPageParams) {
            const set = await CreativeQuestionSet.findById(setId)
                .populate('exam', 'name category')
                .populate('examVersion', 'examVersion')
                .populate('subject', 'name');

            if (!set) {
                return res.status(404).json({ message: 'Creative question set not found' });
            }

            return res.status(200).json(set);
        }

        // ── Paginated mode ──
        // The questions array can approach 1 MB, so never load it whole just
        // to serve 100 questions: fetch the metadata doc (questions excluded)
        // and the requested slice ($slice) in parallel.
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(500, Math.max(1, parseInt(req.query.limit, 10) || 100));

        const [metaDoc, sliceDocs] = await Promise.all([
            CreativeQuestionSet.findById(setId, { questions: 0 })
                .populate('exam', 'name category')
                .populate('examVersion', 'examVersion')
                .populate('subject', 'name')
                .lean(),
            CreativeQuestionSet.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(setId) } },
                {
                    $project: {
                        questions: { $slice: ['$questions', (page - 1) * limit, limit] },
                        totalQuestions: { $size: { $ifNull: ['$questions', []] } },
                    },
                },
            ]),
        ]);

        if (!metaDoc) {
            return res.status(404).json({ message: 'Creative question set not found' });
        }

        const totalQuestions = sliceDocs[0]?.totalQuestions ?? 0;
        const totalPages = Math.ceil(totalQuestions / limit);

        res.status(200).json({
            ...metaDoc,
            questionCount: totalQuestions,
            questions: sliceDocs[0]?.questions ?? [],
            totalQuestions,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        });
    } catch (err) {
        console.error('getCreativeQuestionSetById error:', err);
        res.status(500).json({ message: 'Unable to fetch creative question set' });
    }
};

/**
 * POST /creative-questions/upload
 * Admin: upload a new set from a JSON file (multipart field "file") or a JSON
 * body ({ exam, examVersion?, subject?, title?, description?, data: [...] }).
 * The uploaded JSON must match the Reading-page format exactly; violations
 * are returned as a list of readable errors with HTTP 400.
 */
export const uploadCreativeQuestionSet = async (req, res) => {
    try {
        let payload;
        let meta = {};

        if (req.file) {
            // Multipart upload: metadata fields come as strings.
            const { exam, examVersion, subject, title, description } = req.body;

            if (!isValidObjectId(exam)) {
                return res.status(400).json({ message: 'A valid "exam" (Exam id) is required' });
            }
            if (examVersion && !isValidObjectId(examVersion)) {
                return res.status(400).json({ message: 'Invalid "examVersion" id' });
            }
            if (subject && !isValidObjectId(subject)) {
                return res.status(400).json({ message: 'Invalid "subject" id' });
            }

            // Parse the JSON file — a malformed file must fail loudly.
            try {
                payload = JSON.parse(req.file.buffer.toString('utf8'));
            } catch (parseErr) {
                return res.status(400).json({
                    message: 'The uploaded file is not valid JSON',
                    error: parseErr.message,
                });
            }

            meta = { exam, examVersion, subject, title, description };
        } else {
            // JSON body upload
            const { exam, examVersion, subject, title, description, data } = req.body;
            payload = data;

            if (!isValidObjectId(exam)) {
                return res.status(400).json({ message: 'A valid "exam" (Exam id) is required' });
            }
            if (examVersion && !isValidObjectId(examVersion)) {
                return res.status(400).json({ message: 'Invalid "examVersion" id' });
            }
            if (subject && !isValidObjectId(subject)) {
                return res.status(400).json({ message: 'Invalid "subject" id' });
            }
            meta = { exam, examVersion, subject, title, description };
        }

        // ── Format validation ─────────────────────────────────────
        const errors = validateCreativeQuestionPayload(payload);
        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Invalid test-paper JSON format',
                errors,
                errorCount: errors.length,
            });
        }

        // ── Referential checks ────────────────────────────────────
        const Exam = mongoose.model('Exam');
        const examExists = await Exam.findById(meta.exam);
        if (!examExists) {
            return res.status(400).json({ message: 'Selected exam does not exist' });
        }
        if (meta.examVersion) {
            const ExamVersion = mongoose.model('ExamVersion');
            const versionExists = await ExamVersion.findById(meta.examVersion);
            if (!versionExists) {
                return res.status(400).json({ message: 'Selected exam version does not exist' });
            }
        }
        if (meta.subject) {
            const Subject = mongoose.model('Subject');
            const subjectExists = await Subject.findById(meta.subject);
            if (!subjectExists) {
                return res.status(400).json({ message: 'Selected subject does not exist' });
            }
        }

        // ── Create ────────────────────────────────────────────────
        const createPayload = {
            exam: meta.exam,
            questions: payload,
        };
        if (meta.examVersion) createPayload.examVersion = meta.examVersion;
        if (meta.subject) createPayload.subject = meta.subject;
        if (meta.title) createPayload.title = meta.title;
        if (meta.description) createPayload.description = meta.description;

        const saved = await CreativeQuestionSet.create(createPayload);

        await invalidatePrefix(CACHE_PREFIX);

        res.status(201).json({
            message: 'Creative question set uploaded successfully',
            setId: saved._id,
            questionCount: saved.questions.length,
        });
    } catch (err) {
        console.error('uploadCreativeQuestionSet error:', err);
        // Duplicate-key or schema validation errors → readable 400
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map((e) => e.message);
            return res.status(400).json({ message: 'Validation failed', errors: messages });
        }
        res.status(500).json({ message: err.message || 'Unable to upload creative question set' });
    }
};

/**
 * PUT /creative-questions/:setId
 * Admin: update set metadata and/or replace/merge questions.
 * Body: { title?, description?, examVersion?, subject?, questions? }
 * When `questions` is provided it is validated exactly like an upload.
 */
export const updateCreativeQuestionSet = async (req, res) => {
    try {
        const { setId } = req.params;
        if (!isValidObjectId(setId)) {
            return res.status(400).json({ message: 'Invalid set id' });
        }

        const set = await CreativeQuestionSet.findById(setId);
        if (!set) {
            return res.status(404).json({ message: 'Creative question set not found' });
        }

        const { title, description, examVersion, subject, questions } = req.body;

        if (title !== undefined) set.title = title;
        if (description !== undefined) set.description = description;
        if (examVersion !== undefined) set.examVersion = examVersion || null;
        if (subject !== undefined) set.subject = subject || null;

        if (questions !== undefined) {
            const errors = validateCreativeQuestionPayload(questions);
            if (errors.length > 0) {
                return res.status(400).json({
                    message: 'Invalid questions payload',
                    errors,
                    errorCount: errors.length,
                });
            }
            set.questions = questions;
        }

        await set.save();
        await invalidatePrefix(CACHE_PREFIX);

        const populated = await CreativeQuestionSet.findById(setId)
            .populate('exam', 'name category')
            .populate('examVersion', 'examVersion')
            .populate('subject', 'name');

        res.status(200).json(populated);
    } catch (err) {
        console.error('updateCreativeQuestionSet error:', err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map((e) => e.message);
            return res.status(400).json({ message: 'Validation failed', errors: messages });
        }
        res.status(500).json({ message: err.message || 'Unable to update creative question set' });
    }
};

/**
 * PUT /creative-questions/:setId/question/:questionId
 * Admin: edit a single creative question inside the set.
 * Body may contain any of: id, chapterId, chapterNumber, chapter, source,
 * number, stimulus, stimulusBlocks, stimulusImages, parts, answerNotes.
 */
export const updateCreativeQuestion = async (req, res) => {
    try {
        const { setId, questionId } = req.params;
        if (!isValidObjectId(setId)) {
            return res.status(400).json({ message: 'Invalid set id' });
        }

        const set = await CreativeQuestionSet.findById(setId);
        if (!set) {
            return res.status(404).json({ message: 'Creative question set not found' });
        }

        const target = set.questions.find((q) => q.id === questionId);
        if (!target) {
            return res.status(404).json({ message: `Question "${questionId}" not found in this set` });
        }

        const updates = req.body || {};
        const editableKeys = [
            'id',
            'chapterId',
            'chapterNumber',
            'chapter',
            'source',
            'type',
            'number',
            'imageNeeded',
            'stimulus',
            'stimulusBlocks',
            'stimulusImages',
            'parts',
            'answerNotes',
        ];

        for (const key of editableKeys) {
            if (updates[key] !== undefined) {
                target[key] = updates[key];
            }
        }

        // If the id was changed, ensure it stays unique within the set.
        if (updates.id !== undefined && updates.id !== questionId) {
            const duplicate = set.questions.some((q) => q.id === updates.id);
            if (duplicate) {
                return res.status(400).json({ message: `Another question with id "${updates.id}" already exists in this set` });
            }
        }

        await set.save();
        await invalidatePrefix(CACHE_PREFIX);

        res.status(200).json({ message: 'Question updated successfully', question: target });
    } catch (err) {
        console.error('updateCreativeQuestion error:', err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map((e) => e.message);
            return res.status(400).json({ message: 'Validation failed', errors: messages });
        }
        res.status(500).json({ message: err.message || 'Unable to update question' });
    }
};

/**
 * DELETE /creative-questions/:setId/question/:questionId
 * Admin: remove a single question from the set.
 */
export const deleteCreativeQuestion = async (req, res) => {
    try {
        const { setId, questionId } = req.params;
        if (!isValidObjectId(setId)) {
            return res.status(400).json({ message: 'Invalid set id' });
        }

        const set = await CreativeQuestionSet.findById(setId);
        if (!set) {
            return res.status(404).json({ message: 'Creative question set not found' });
        }

        const index = set.questions.findIndex((q) => q.id === questionId);
        if (index === -1) {
            return res.status(404).json({ message: `Question "${questionId}" not found in this set` });
        }

        set.questions.splice(index, 1);
        await set.save();
        await invalidatePrefix(CACHE_PREFIX);

        res.status(200).json({
            message: 'Question deleted successfully',
            questionCount: set.questions.length,
        });
    } catch (err) {
        console.error('deleteCreativeQuestion error:', err);
        res.status(500).json({ message: err.message || 'Unable to delete question' });
    }
};

/**
 * DELETE /creative-questions/:setId
 * Admin: delete an entire question set.
 */
export const deleteCreativeQuestionSet = async (req, res) => {
    try {
        const { setId } = req.params;
        if (!isValidObjectId(setId)) {
            return res.status(400).json({ message: 'Invalid set id' });
        }

        const deleted = await CreativeQuestionSet.findByIdAndDelete(setId);
        if (!deleted) {
            return res.status(404).json({ message: 'Creative question set not found' });
        }

        await invalidatePrefix(CACHE_PREFIX);
        res.status(200).json({ message: 'Creative question set deleted successfully' });
    } catch (err) {
        console.error('deleteCreativeQuestionSet error:', err);
        res.status(500).json({ message: 'Unable to delete creative question set' });
    }
};

/**
 * POST /creative-questions/:setId/import
 * Admin: import questions into an existing creative question set.
 * Supports multipart file upload (field "file") or JSON body ({ data: [...] or questions: [...] }).
 * Query or body param `mode`:
 *   - 'upsert' (default): updates existing questions with matching `id`, appends new questions.
 *   - 'skip': appends new questions, skips questions whose `id` already exists.
 *   - 'error': rejects import if any question `id` already exists in this set.
 *   - 'replace': replaces all questions in this set with the imported questions.
 */
export const importCreativeQuestions = async (req, res) => {
    try {
        const { setId } = req.params;
        if (!isValidObjectId(setId)) {
            return res.status(400).json({ message: 'Invalid set id' });
        }

        const set = await CreativeQuestionSet.findById(setId);
        if (!set) {
            return res.status(404).json({ message: 'Creative question set not found' });
        }

        let payload;
        const mode = req.body?.mode || req.query?.mode || 'upsert';
        const validModes = ['upsert', 'skip', 'error', 'replace'];
        if (!validModes.includes(mode)) {
            return res.status(400).json({ message: `Invalid import mode. Must be one of: ${validModes.join(', ')}` });
        }

        if (req.file) {
            try {
                payload = JSON.parse(req.file.buffer.toString('utf8'));
            } catch (parseErr) {
                return res.status(400).json({
                    message: 'The uploaded file is not valid JSON',
                    error: parseErr.message,
                });
            }
        } else {
            payload = req.body?.data ?? req.body?.questions;
        }

        // Allow single-question object payload: normalize to [payload]
        if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
            payload = [payload];
        }

        // Validate format
        const errors = validateCreativeQuestionPayload(payload);
        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Invalid creative questions format',
                errors,
                errorCount: errors.length,
            });
        }

        // Handle conflict modes
        let addedCount = 0;
        let updatedCount = 0;
        let skippedCount = 0;

        if (mode === 'replace') {
            set.questions = payload;
            addedCount = payload.length;
        } else {
            const existingQuestions = set.questions || [];
            const existingIdMap = new Map();
            existingQuestions.forEach((q, idx) => {
                existingIdMap.set(q.id, idx);
            });

            if (mode === 'error') {
                const conflictingIds = payload
                    .map((q) => q.id)
                    .filter((id) => existingIdMap.has(id));

                if (conflictingIds.length > 0) {
                    return res.status(400).json({
                        message: `Duplicate question IDs detected in strict mode: ${conflictingIds.join(', ')}`,
                        conflictingIds,
                    });
                }
            }

            // Copy existing questions array
            const currentQuestions = existingQuestions.map((q) => (q.toObject ? q.toObject() : q));

            payload.forEach((incomingQ) => {
                if (existingIdMap.has(incomingQ.id)) {
                    if (mode === 'upsert') {
                        const targetIdx = existingIdMap.get(incomingQ.id);
                        currentQuestions[targetIdx] = incomingQ;
                        updatedCount++;
                    } else if (mode === 'skip') {
                        skippedCount++;
                    }
                } else {
                    currentQuestions.push(incomingQ);
                    existingIdMap.set(incomingQ.id, currentQuestions.length - 1);
                    addedCount++;
                }
            });

            set.questions = currentQuestions;
        }

        await set.save();
        await invalidatePrefix(CACHE_PREFIX);

        const updatedSet = await CreativeQuestionSet.findById(setId)
            .populate('exam', 'name category')
            .populate('examVersion', 'examVersion')
            .populate('subject', 'name');

        res.status(200).json({
            message: `Successfully imported questions: ${addedCount} added, ${updatedCount} updated, ${skippedCount} skipped`,
            addedCount,
            updatedCount,
            skippedCount,
            totalQuestions: updatedSet.questions.length,
            set: updatedSet,
        });
    } catch (err) {
        console.error('importCreativeQuestions error:', err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map((e) => e.message);
            return res.status(400).json({ message: 'Validation failed', errors: messages });
        }
        res.status(500).json({ message: err.message || 'Unable to import questions' });
    }
};

