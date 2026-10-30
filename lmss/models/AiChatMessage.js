import mongoose from "mongoose";

/**
 * A single AI-assistant chat message belonging to a user.
 * Both the user's question and the AI's answer are persisted so the
 * chat history survives page navigation.
 */
const aiChatMessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: String,
      enum: ["user", "ai"],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    // Optional chapter or lesson identifier to scope chat histories per lesson/chapter
    chapter: {
      type: String,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

// Cursor pagination reads messages newest-first per user & chapter
aiChatMessageSchema.index({ user: 1, chapter: 1, _id: -1 });

const AiChatMessage = mongoose.model("AiChatMessage", aiChatMessageSchema);
export default AiChatMessage;
