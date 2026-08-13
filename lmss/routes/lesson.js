import express from "express"
import { authenticate } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { createLesson, getLessonsByCourseId, updateLesson, deleteLesson, markLessonComplete } from "../controller/LessonController.js"

const lesson = express.Router()

// Public: view lessons (short TTL because isCompleted is per-user)
lesson.get('/:courseId', cacheMiddleware({ ttl: 60, keyPrefix: 'cache:lesson' }), getLessonsByCourseId)

// Protected: mark a lesson as complete for the logged-in user
lesson.post('/complete', authenticate, markLessonComplete)

// Protected: create, update, delete
lesson.post('/create', authenticate, createLesson)
lesson.put('/update/:lessonId', authenticate, updateLesson)
lesson.delete('/delete/:lessonId', authenticate, deleteLesson)

export default lesson