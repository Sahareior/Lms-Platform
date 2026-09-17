import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  recordMistakes,
  getNotebook,
  reviewEntry,
  deleteEntry,
  getNotebookStats,
} from "../controller/MistakeNotebookController.js";

const router = express.Router();

// All notebook routes are owner-scoped to the token user.
router.post("/", authenticate, recordMistakes);
router.get("/", authenticate, getNotebook);
router.get("/stats", authenticate, getNotebookStats);
router.post("/:id/review", authenticate, reviewEntry);
router.delete("/:id", authenticate, deleteEntry);

export default router;
