import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { addExamVersion, getExamVersion, getExamVersionsByExam, updateExamVersion, deleteExamVersion } from '../controller/ExamVersionController.js';

const examVer = express.Router()

// Public: view exam versions
examVer.get('/', getExamVersion)
examVer.get('/exam/:examId', getExamVersionsByExam)

// Protected: create, update, delete
examVer.post('/', authenticate, addExamVersion)
examVer.put('/:versionId', authenticate, updateExamVersion)
examVer.delete('/:versionId', authenticate, deleteExamVersion)

export default examVer