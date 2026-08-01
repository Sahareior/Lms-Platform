import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getOrGenerateAiPerformance,
  getAiPerformanceHistory,
} from "../controller/AiPerformanceController.js";

const router = express.Router();

// Protected: get today's cached AI report (or generate + cache a new one)
router.post("/:userId", authenticate, getOrGenerateAiPerformance);
router.post("/", authenticate, getOrGenerateAiPerformance);

// Protected: all saved reports (for progress-over-time comparison)
router.get("/history/:userId", authenticate, getAiPerformanceHistory);

export default router;
