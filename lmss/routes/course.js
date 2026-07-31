import express from 'express';
import { authenticate } from '../middleware/auth.js';

const course = express.Router()

import { createCourse, enrollCourse, getCourseById, getCoursesByExamId, getEnrolledCourses, listCourses, updateCourse, deleteCourse } from '../controller/CourseController.js';

// Public: anyone can browse courses
course.get('/', listCourses)
course.get('/by-course/:courseId', getCourseById)
course.get('/:examId', getCoursesByExamId)

// Protected: authentication required
course.post('/create', authenticate, createCourse)
course.post('/enroll/:courseId', authenticate, enrollCourse)
course.get('/enrolled/:userId', authenticate, getEnrolledCourses)
course.put('/update/:courseId', authenticate, updateCourse)
course.delete('/delete/:courseId', authenticate, deleteCourse)

export default course