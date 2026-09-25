import express from "express";
import { cacheMiddleware } from "../middleware/cache.js";
import { searchAll } from "../controller/SearchController.js";

const router = express.Router();

// Public: lightweight search (cached briefly per query)
router.get("/", cacheMiddleware({ ttl: 300, keyPrefix: "cache:search" }), searchAll);

export default router;
