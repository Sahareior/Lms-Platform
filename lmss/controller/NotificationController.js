import Notification from "../models/Notification.js";

/**
 * Create an in-app notification for a user. Safe to call from any controller
 * (never throws — failures are logged, not propagated).
 */
export async function createNotification({ userId, title, message, type = "info", link = "" }) {
  if (!userId || !title) return;
  try {
    const notification = new Notification({ user: userId, title, message, type, link });
    await notification.save();
    return notification;
  } catch (err) {
    console.error("Error creating notification:", err);
    return null;
  }
}

/** GET /notifications/mine?userId=... — list + unread count. */
export const getMyNotifications = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(50),
      Notification.countDocuments({ user: userId, read: false }),
    ]);
    res.status(200).json({ notifications, unreadCount });
  } catch (err) {
    console.error("Error listing notifications:", err);
    res.status(500).json({ message: "Unable to list notifications" });
  }
};

/** POST /notifications/:id/read — mark one notification as read (owner only). */
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Owner-only: scope the update to the requester's own notifications.
    const updated = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { read: true },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json(updated);
  } catch (err) {
    console.error("Error marking notification read:", err);
    res.status(500).json({ message: "Unable to update notification" });
  }
};

/** POST /notifications/read-all — mark everything read for the user. */
export const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.body?.userId || req.user.userId;
    await Notification.updateMany({ user: userId, read: false }, { read: true });
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Error marking all notifications read:", err);
    res.status(500).json({ message: "Unable to update notifications" });
  }
};
