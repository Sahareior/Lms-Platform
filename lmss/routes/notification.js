import express from "express";
import { authenticate, requireSelfOrAdmin } from "../middleware/auth.js";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controller/NotificationController.js";

const router = express.Router();

// Protected: own notifications only (admins may read any user)
router.get("/mine", authenticate, requireSelfOrAdmin("userId"), getMyNotifications);
router.post("/read-all", authenticate, requireSelfOrAdmin("userId"), markAllNotificationsRead);
router.post("/:id/read", authenticate, markNotificationRead);

export default router;
