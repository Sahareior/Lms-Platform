import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoose from 'mongoose';
import {connectDB} from './database/db.js';
import user from './routes/auth.js';
import examRoutes from './routes/exam.js';
import course from './routes/course.js';
import lesson from './routes/lesson.js';
import module from './routes/module.js';
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
import aiChatRoutes from './routes/aiChat.js';
import certificateRoutes from './routes/certificate.js';
import notificationRoutes from './routes/notification.js';
import searchRoutes from './routes/search.js';
import { generalRateLimit } from './middleware/rateLimit.js';

const app = express();

connectDB();

// ─── Security headers ───────────────────────────────────────
app.use(helmet());

// ─── CORS: allow only known origins (falls back to local dev origins) ──
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
const devOrigins = ['http://localhost:5173', 'https://geneseon.netlify.app/', 'http://localhost:8081'];
const corsOrigins = allowedOrigins.length > 0 ? allowedOrigins : devOrigins;
app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin / server-to-server requests with no Origin header.
      if (!origin || corsOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// General rate limiting for all API requests (skipped when Redis is unconfigured)
app.use(generalRateLimit);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// ─── Health check (for uptime monitoring) ────────────────────
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState; // 1 = connected
  const healthy = dbState === 1;
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    db: healthy ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/auth', user)
app.use('/exams', examRoutes)
app.use('/course', course);
app.use('/lesson', lesson);
app.use('/module', module);
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
app.use('/ai-chat', aiChatRoutes);
app.use('/certificates', certificateRoutes);
app.use('/notifications', notificationRoutes);
app.use('/search', searchRoutes);

// ─── 404 for unknown routes ─────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ─── Global error handler (incl. CORS errors) ───────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error('Unhandled error:', err);
  res.status(status).json({ message: err.message || 'Something went wrong' });
});

// Export the app for serverless platforms (Vercel runs in production mode
// and uses this export instead of a long-lived listener).
export default app;

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}