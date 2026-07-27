import express from "express"
// import { createLesson, getLessonsByCourseId } from "../controller/LessonController.js"
import { getAllQuestions, getQuestionPattern, postQuestionPattern, saveQuestionsInDb } from "../controller/QuestionController.js"

const questions = express.Router()

questions.post('/save', saveQuestionsInDb)
questions.get('/',getAllQuestions)
questions.post('/question-pattern-save',postQuestionPattern)
questions.get('/question-pattern',getQuestionPattern)

export default questions