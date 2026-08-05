import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {connectDB} from './database/db.js';
import user from './routes/auth.js';
import examRoutes from './routes/exam.js';
import course from './routes/course.js';
import lesson from './routes/lesson.js';
import questions from './routes/questions.js';
import examVer from './routes/examVersion.js';
import subjectRoutes from './routes/subject.js';
import scheduleExamRoutes from './routes/scheduleExam.js';
import noteRoutes from './routes/note.js';
import quizAttemptRoutes from './routes/quizAttempt.js';
import userDataRoutes from './routes/userData.js';
import quizPerform from './routes/QuizPerformance.js';
import aiPerformance from './routes/aiPerformance.js';
import uploadRoutes from './routes/upload.js';
import importantTopicsRoutes from './routes/importantTopics.js';
const app = express();


connectDB();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use('/auth', user)
app.use('/exams', examRoutes)
app.use('/course', course);
app.use('/lesson', lesson);
app.use('/questions', questions)
app.use('/exam-version',examVer)
app.use('/subjects', subjectRoutes)
app.use('/schedule-exams', scheduleExamRoutes)
app.use('/notes', noteRoutes)
app.use('/quiz-attempts', quizAttemptRoutes)
app.use('/user-data', userDataRoutes)
app.use('/quiz-performance', quizPerform)
app.use('/ai-performance', aiPerformance)
app.use('/upload', uploadRoutes);
app.use('/important-topics', importantTopicsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});