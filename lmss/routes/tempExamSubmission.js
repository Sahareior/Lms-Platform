import express from "express";
import { authenticate, requireSelfOrAdmin } from "../middleware/auth.js";
import {
  saveTempSubmission,
  getTempSubmission,
  deleteTempSubmission,
} from "../controller/TempExamSubmissionController.js";

const router = express.Router();

// Protected: save, get, and delete temporary exam progress (owner or admin)
router.post("/", authenticate, requireSelfOrAdmin("userId"), saveTempSubmission);
router.get("/", authenticate, requireSelfOrAdmin("userId"), getTempSubmission);
router.delete("/", authenticate, requireSelfOrAdmin("userId"), deleteTempSubmission);

export default router;
