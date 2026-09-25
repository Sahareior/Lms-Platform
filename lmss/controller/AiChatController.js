import mongoose from "mongoose";
import AiChatMessage from "../models/AiChatMessage.js";

// ─── Save chat messages ─────────────────────────────────────
// POST /ai-chat/messages
// Body: { chapter?: string, messages: [{ sender: 'user' | 'ai', text: string }, ...] }
// Persists one or more messages for the authenticated user and optional chapter.
export const saveChatMessages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const messages = req.body?.messages;
    const chapter = req.body?.chapter ? String(req.body.chapter).trim() : null;

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
      cleaned.push({
        user: userId,
        sender,
        text,
        chapter: m?.chapter ? String(m.chapter).trim() : chapter,
      });
    }

    const saved = await AiChatMessage.insertMany(cleaned);
    res.status(201).json({
      success: true,
      messages: saved.map((m) => ({
        _id: m._id,
        sender: m.sender,
        text: m.text,
        chapter: m.chapter,
        createdAt: m.createdAt,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to save chat messages" });
  }
};

// ─── Get chat history (cursor pagination) ───────────────────
// GET /ai-chat/history?limit=30&before=<messageId>&chapter=<chapterId>
// Returns the user's messages oldest → newest (suitable for display).
// When `chapter` is passed, filters specifically for that chapter/lesson.
// When `chapter` is omitted, returns global or null-chapter messages.
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 30, 1),
      100
    );
    const before = req.query.before || null;
    const chapter = req.query.chapter ? String(req.query.chapter).trim() : null;

    if (before && !mongoose.Types.ObjectId.isValid(before)) {
      return res.status(400).json({ message: "Invalid `before` cursor" });
    }

    const filter = {
      user: userId,
      ...(chapter !== null ? { chapter } : {}),
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
