import express from "express";
import { cacheMiddleware } from "../middleware/cache.js";
import { getImportantTopics } from "../controller/ImportantTopicsController.js";

const router = express.Router();

// Public: analyze stored topic-analysis data for one exam (+ version)
// GET /important-topics?exam=...&examVersion=...&subject=...&limit=10
router.get("/", cacheMiddleware({ ttl: 600, keyPrefix: "cache:important-topics" }), getImportantTopics);

export default router;
