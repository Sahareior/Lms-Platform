import mongoose from "mongoose";
import AiChatMessage from "../models/AiChatMessage.js";

// ─── Save chat messages ─────────────────────────────────────
// POST /ai-chat/messages
// Body: { messages: [{ sender: 'user' | 'ai', text: string }, ...] }
// Persists one or more messages for the authenticated user.
export const saveChatMessages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const messages = req.body?.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res
        .status(400)
        .json({ message: "A non-empty `messages` array is required" });
    }

    const cleaned = [];
    for (const m of messages) {
      const sender = m?.sender;
      const text = typeof m?.text === "string" ? m.text.trim() : "";
      if ((sender !== "user" && sender !== "ai") || !text) {
        return res.status(400).json({
          message:
            "Each message needs a valid sender ('user' or 'ai') and non-empty text",
        });
      }
      cleaned.push({ user: userId, sender, text });
    }

    const saved = await AiChatMessage.insertMany(cleaned);
    res.status(201).json({
      success: true,
      messages: saved.map((m) => ({
        _id: m._id,
        sender: m.sender,
        text: m.text,
        createdAt: m.createdAt,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to save chat messages" });
  }
};

// ─── Get chat history (cursor pagination) ───────────────────
// GET /ai-chat/history?limit=30&before=<messageId>
// Returns the user's messages oldest → newest (suitable for display).
// Without `before` it returns the most recent `limit` messages; with
// `before` it returns the `limit` messages older than that cursor.
// `nextCursor` is the id to pass as `before` for the next (older) page.
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 30, 1),
      100
    );
    const before = req.query.before || null;

    if (before && !mongoose.Types.ObjectId.isValid(before)) {
      return res.status(400).json({ message: "Invalid `before` cursor" });
    }

    const filter = {
      user: userId,
      ...(before ? { _id: { $lt: before } } : {}),
    };

    // Fetch newest first, one extra doc to detect whether more exist.
    const docs = await AiChatMessage.find(filter)
      .sort({ _id: -1 })
      .limit(limit + 1);

    const hasMore = docs.length > limit;
    // Keep only `limit` docs, ordered oldest → newest for rendering.
    const page = docs.slice(0, limit).reverse();
    // The oldest message in this page is the cursor for the next page.
    const nextCursor = hasMore ? page[0]?._id ?? null : null;

    res.status(200).json({
      success: true,
      messages: page.map((m) => ({
        _id: m._id,
        sender: m.sender,
        text: m.text,
        createdAt: m.createdAt,
      })),
      nextCursor,
      hasMore,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to get chat history" });
  }
};
