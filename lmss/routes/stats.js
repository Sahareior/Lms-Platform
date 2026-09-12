import express from "express";
import {
  recordQuestionStats,
  getQuestionStats,
  getBatchQuestionStats,
} from "../controller/StatsController.js";

const statsRoutes = express.Router();

// Record question stats (can be called by any client taking an exam/quiz)
statsRoutes.post("/record", recordQuestionStats);

// Get stats for a single question
statsRoutes.get("/question/:questionId", getQuestionStats);

// Batch get stats for multiple questions
statsRoutes.post("/batch", getBatchQuestionStats);

export default statsRoutes;
