import mongoose from "mongoose";

const quizPerformance = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    examVersion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamVersion",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      default: null,
    },
    submittedQuestions: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        providedAnswer: { type: String, required: true },
        totalAttempted: { type: Number },
      },
    ],
    attemptCount: {
      type: Number,
      default: 1,          // <-- NEW FIELD
    },
  },
  { timestamps: true },
);

const quizPerform = mongoose.model("quizPerformance", quizPerformance);
export default quizPerform;