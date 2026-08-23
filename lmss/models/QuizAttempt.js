import mongoose from "mongoose";

const questionResponseSchema = new mongoose.Schema(
  {
    questionNumber: { type: Number, required: true },
    questionText: { type: String, default: "" },
    options: { type: Map, of: String, default: {} },
    selectedOption: { type: String, default: null },
    correctAnswer: { type: String, default: null },
    isCorrect: { type: Boolean, default: null },
    timeTaken: { type: Number, default: 0 }, // seconds spent on this question
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
    },
    examVersion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamVersion",
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
    board: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: ["mock_exam", "practice"],
      required: true,
      default: "practice",
    },
    source: {
      type: String,
      enum: ["question_center", "mock_exam", "quiz_practice"],
      default: "question_center",
    },
    questions: [questionResponseSchema],
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    incorrectCount: { type: Number, default: 0 },
    unansweredCount: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    timeTaken: { type: Number, default: 0 }, // total seconds taken
    isActive: { type: Boolean, default: true },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for fast lookups
quizAttemptSchema.index({ user: 1, type: 1, createdAt: -1 });
quizAttemptSchema.index({ user: 1, isActive: 1 });
quizAttemptSchema.index({ exam: 1, user: 1 });

const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);
export default QuizAttempt;
