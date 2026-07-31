import express from "express"
import { authenticate } from '../middleware/auth.js';
import { createLesson, getLessonsByCourseId, updateLesson, deleteLesson } from "../controller/LessonController.js"

const lesson = express.Router()

// Public: view lessons
lesson.get('/:courseId', getLessonsByCourseId)

// Protected: create, update, delete
lesson.post('/create', authenticate, createLesson)
lesson.put('/update/:lessonId', authenticate, updateLesson)
lesson.delete('/delete/:lessonId', authenticate, deleteLesson)

export default lesson