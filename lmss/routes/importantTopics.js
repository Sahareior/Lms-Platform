import express from "express";
import { getImportantTopics } from "../controller/ImportantTopicsController.js";

const router = express.Router();

// Public: analyze stored topic-analysis data for one exam (+ version)
// GET /important-topics?exam=...&examVersion=...&subject=...&limit=10
router.get("/", getImportantTopics);

export default router;
