import express from "express"
import { createLesson, getLessonsByCourseId } from "../controller/LessonController.js"

const lesson = express.Router()

lesson.post('/create', createLesson)
lesson.get('/:courseId', getLessonsByCourseId)

export default lesson