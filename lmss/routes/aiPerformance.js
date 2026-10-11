import express from "express";
import { authenticate, requireSelfOrAdmin } from "../middleware/auth.js";
import {
  getOrGenerateAiPerformance,
  getAiPerformanceHistory,
} from "../controller/AiPerformanceController.js";

const router = express.Router();

// Protected: get today's cached AI report (or generate + cache a new one).
// Owner-scoped: a user may only request their own report (admins exempt).
router.post("/:userId", authenticate, requireSelfOrAdmin("userId"), getOrGenerateAiPerformance);
router.post("/", authenticate, requireSelfOrAdmin("userId"), getOrGenerateAiPerformance);

// Protected: all saved reports (for progress-over-time comparison). Owner-scoped.
router.get("/history/:userId", authenticate, requireSelfOrAdmin("userId"), getAiPerformanceHistory);

export default router;
