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
  },
  { timestamps: true }
);

// Cursor pagination reads messages newest-first per user (sorted by _id,
// which is monotonically increasing with insertion time).
aiChatMessageSchema.index({ user: 1, _id: -1 });

const AiChatMessage = mongoose.model("AiChatMessage", aiChatMessageSchema);
export default AiChatMessage;
