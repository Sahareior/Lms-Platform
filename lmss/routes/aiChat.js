import express from "express";
import { authenticate } from "../middleware/auth.js";
import { aiChatRateLimit } from "../middleware/rateLimit.js";
import {
  saveChatMessages,
  getChatHistory,
} from "../controller/AiChatController.js";

const router = express.Router();

// Protected: persist chat messages for the authenticated user (rate limited)
router.post("/messages", authenticate, aiChatRateLimit, saveChatMessages);

// Protected: paginated chat history (cursor-based, for scroll loading)
router.get("/history", authenticate, aiChatRateLimit, getChatHistory);

export default router;
