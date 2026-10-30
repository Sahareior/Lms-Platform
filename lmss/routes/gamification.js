import express from "express";
import { authenticate } from "../middleware/auth.js";
import { getMyGamification, getLeaderboard, awardPracticeXp } from "../controller/GamificationController.js";

const router = express.Router();

// Protected: current user's XP / streak / level
router.get("/me", authenticate, getMyGamification);

// XP for practice flows that don't use QuizAttempt (question center / ExamDin).
// Called once per submit by the client.
router.post("/practice", authenticate, awardPracticeXp);

// Public read: XP leaderboard (contains only names + scores, no private data)
router.get("/leaderboard", getLeaderboard);

export default router;
