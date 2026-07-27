import express from 'express';
import { createExam, listExams, selectExamForUser, getUserExams } from '../controller/Exam.js';

const router = express.Router();

router.post('/', createExam);
router.get('/', listExams);
router.post('/select', selectExamForUser);
router.get('/user/:userId', getUserExams);

export default router;
