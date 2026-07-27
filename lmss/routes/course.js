import express from 'express';

const course = express.Router()

import { createCourse, enrollCourse, getCourseById, getCoursesByExamId, getEnrolledCourses, listCourses, updateCourse } from '../controller/CourseController.js';

course.get('/', listCourses)
course.post('/create', createCourse)
course.post('/enroll/:courseId', enrollCourse)
course.get('/enrolled/:userId', getEnrolledCourses)
course.put('/update/:courseId', updateCourse)
course.get('/by-course/:courseId', getCourseById)
course.get('/:examId', getCoursesByExamId)




export default course