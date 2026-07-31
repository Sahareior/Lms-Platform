import mongoose from "mongoose";

const userDataSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    // ─── Mock Exam Performance ─────────────────────────────────
    // Stores per-question performance data from mock exams
    mockExam: [
      {
        questionId: { type: String, required: true },
        questionNumber: { type: Number, required: true },
        questionText: { type: String, default: "" },
        options: { type: Map, of: String, default: {} },
        correctAnswer: { type: String, default: null },
        attempts: { type: Number, default: 0 },
        failures: { type: Number, default: 0 },
        successes: { type: Number, default: 0 },
        lastAttemptedAt: { type: Date, default: Date.now },
        examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
        examVersionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ExamVersion",
        },
      },
    ],
    // ─── Question Practice Performance ─────────────────────────
    // Stores per-question performance data from question center/practice
    questionPreatise: [
      {
        questionId: { type: String, required: true },
        questionNumber: { type: Number, required: true },
        questionText: { type: String, default: "" },
        options: { type: Map, of: String, default: {} },
        correctAnswer: { type: String, default: null },
        attempts: { type: Number, default: 0 },
        failures: { type: Number, default: 0 },
        successes: { type: Number, default: 0 },
        lastAttemptedAt: { type: Date, default: Date.now },
        examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
        subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
      },
    ],
  },
  { timestamps: true }
);

// Index for fast lookups
userDataSchema.index({ user: 1 }, { unique: true });

const UserData = mongoose.model("UserData", userDataSchema);
export default UserData;