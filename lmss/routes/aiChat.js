import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  saveChatMessages,
  getChatHistory,
} from "../controller/AiChatController.js";

const router = express.Router();

// Protected: persist chat messages for the authenticated user
router.post("/messages", authenticate, saveChatMessages);

// Protected: paginated chat history (cursor-based, for scroll loading)
router.get("/history", authenticate, getChatHistory);

export default router;
