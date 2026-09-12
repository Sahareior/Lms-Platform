import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    questionId: {
      type: String,
      required: true,
      index: true,
    },
    questionDocId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      default: null,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      default: null,
    },
    examVersion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamVersion",
      default: null,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      default: null,
    },
    questionSnapshot: {
      questionNumber: { type: Number },
      questionText: { type: String, default: "" },
      options: { type: Map, of: String, default: {} },
      correctAnswer: { type: String, default: "" },
      explanation: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

// Compound unique index: a user can only favorite a specific questionId once
favoriteSchema.index({ user: 1, questionId: 1 }, { unique: true });

const Favorite = mongoose.model("Favorite", favoriteSchema);
export default Favorite;
