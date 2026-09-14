import mongoose from "mongoose";

/**
 * Mistake Notebook — one document per (user, question).
 * Powers spaced repetition: each wrong answer schedules the question for a
 * later re-review. Answering it correctly pushes the next review further out
 * (Leitner-style intervals); answering wrong resets the box.
 *
 * `questionId` stores the same id the exam UI submits to /stats/record
 * (the embedded data[] question _id as a string) so lookups stay consistent.
 */
const mistakeNotebookSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questionId: {
      type: String,
      required: true,
    },
    // Denormalized snapshot so the notebook renders without re-resolving the
    // question bank (question may later change or be deleted).
    questionDocId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuestionModel",
      default: null,
    },
    questionText: { type: String, default: "" },
    options: { type: Map, of: String, default: {} },
    correctAnswer: { type: String, default: null },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", default: null },
    examName: { type: String, default: "" },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", default: null },
    subjectName: { type: String, default: "" },

    // ─── Spaced repetition state ────────────────────────────
    // Leitner box 0..5 → intervals [1, 3, 7, 14, 30, 60] days
    box: { type: Number, default: 0, min: 0, max: 5 },
    nextReviewAt: { type: Date, default: Date.now, index: true },
    lastReviewedAt: { type: Date, default: null },

    wrongCount: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    // The wrong answer the user gave (for quick flashcard-style review)
    lastWrongAnswer: { type: String, default: null },

    // Set once the user answers correctly from a high box → mastered, hidden
    // from the default review queue.
    mastered: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// One notebook entry per user+question
mistakeNotebookSchema.index({ user: 1, questionId: 1 }, { unique: true });
mistakeNotebookSchema.index({ user: 1, nextReviewAt: 1 });
mistakeNotebookSchema.index({ user: 1, mastered: 1 });

export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30, 60];

const MistakeNotebook = mongoose.model("MistakeNotebook", mistakeNotebookSchema);
export default MistakeNotebook;
