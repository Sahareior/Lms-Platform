import express from "express"
import { authenticate } from '../middleware/auth.js';
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

// Public: view questions and patterns
questions.get('/', getAllQuestions);
questions.get('/exam/:examId', getQuestionsByExam);
questions.get('/question-pattern', getQuestionPattern);

// Protected: create, update, delete questions
questions.post('/save', authenticate, saveQuestionsInDb);
questions.post('/question-pattern-save', authenticate, postQuestionPattern);
questions.put('/:questionId', authenticate, updateQuestionDocument);
questions.delete('/:questionId', authenticate, deleteQuestionDocument);
questions.put('/:questionId/question/:questionNumber', authenticate, updateSingleQuestion);
questions.delete('/:questionId/question/:questionNumber', authenticate, deleteSingleQuestion);

export default questions;