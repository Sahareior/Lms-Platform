import express from "express"
import { authenticate, requireRole } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';
import {
    getAllQuestions,
    getQuestionPattern,
    getQuestionsByExam,
    postQuestionPattern,
    saveQuestionsInDb,
    updateQuestionDocument,
    deleteQuestionDocument,
    updateSingleQuestion,
    deleteSingleQuestion,
} from "../controller/QuestionController.js";

const questions = express.Router();

// Public: view questions and patterns (heavy payloads, cache them)
questions.get('/', cacheMiddleware({ ttl: 300, keyPrefix: 'cache:question' }), getAllQuestions);
questions.get('/exam/:examId', cacheMiddleware({ ttl: 300, keyPrefix: 'cache:question' }), getQuestionsByExam);
questions.get('/question-pattern', cacheMiddleware({ ttl: 600, keyPrefix: 'cache:question-pattern' }), getQuestionPattern);

// Admin only: create, update, delete questions
questions.post('/save', authenticate, requireRole('admin'), saveQuestionsInDb);
questions.post('/question-pattern-save', authenticate, requireRole('admin'), postQuestionPattern);
questions.put('/:questionId', authenticate, requireRole('admin'), updateQuestionDocument);
questions.delete('/:questionId', authenticate, requireRole('admin'), deleteQuestionDocument);
questions.put('/:questionId/question/:questionNumber', authenticate, requireRole('admin'), updateSingleQuestion);
questions.delete('/:questionId/question/:questionNumber', authenticate, requireRole('admin'), deleteSingleQuestion);

export default questions;