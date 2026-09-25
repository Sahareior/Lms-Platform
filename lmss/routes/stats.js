import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  recordQuestionStats,
  getQuestionStats,
  getBatchQuestionStats,
} from "../controller/StatsController.js";

const statsRoutes = express.Router();

// All stats endpoints require authentication. /record was previously open and
// let anyone inflate/deflate question difficulty by spamming the endpoint.
// Record question stats (authenticated users taking an exam/quiz)
statsRoutes.post("/record", authenticate, recordQuestionStats);

// Get stats for a single question
statsRoutes.get("/question/:questionId", authenticate, getQuestionStats);

// Batch get stats for multiple questions
statsRoutes.post("/batch", authenticate, getBatchQuestionStats);

export default statsRoutes;
