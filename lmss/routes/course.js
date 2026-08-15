import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';

const course = express.Router()

import { createCourse, enrollCourse, getCourseById, getCoursesByExamId, getEnrolledCourses, listCourses, updateCourse, deleteCourse } from '../controller/CourseController.js';

// Public: anyone can browse courses
course.get('/', cacheMiddleware({ ttl: 300, keyPrefix: 'cache:course' }), listCourses)
course.get('/by-course/:courseId', cacheMiddleware({ ttl: 300, keyPrefix: 'cache:course' }), getCourseById)
course.get('/:examId', cacheMiddleware({ ttl: 300, keyPrefix: 'cache:course' }), getCoursesByExamId)

// Protected: student actions
course.post('/enroll/:courseId', authenticate, enrollCourse)
course.get('/enrolled/:userId', authenticate, cacheMiddleware({ ttl: 60, keyPrefix: 'cache:course-enrolled' }), getEnrolledCourses)

// Admin only: create, update, delete courses
course.post('/create', authenticate, requireRole('admin'), createCourse)
course.put('/update/:courseId', authenticate, requireRole('admin'), updateCourse)
course.delete('/delete/:courseId', authenticate, requireRole('admin'), deleteCourse)

export default course