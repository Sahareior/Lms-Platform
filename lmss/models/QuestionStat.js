import mongoose from "mongoose";

const questionStatSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    questionDocId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      default: null,
    },
    totalAttempts: {
      type: Number,
      default: 0,
    },
    correctCount: {
      type: Number,
      default: 0,
    },
    incorrectCount: {
      type: Number,
      default: 0,
    },
    totalTimeSpent: {
      type: Number, // total seconds spent by all users
      default: 0,
    },
    optionCounts: {
      type: Map,
      of: Number,
      default: {},
    },
    accuracyPercentage: {
      type: Number,
      default: 0,
    },
    averageTime: {
      type: String,
      default: "0s",
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    lastAttemptedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Helper function to calculate difficulty from accuracy percentage
export function calculateDifficulty(correctCount, totalAttempts) {
  if (!totalAttempts || totalAttempts === 0) return "Medium";
  const percentage = (correctCount / totalAttempts) * 100;
  if (percentage >= 70) return "Easy";
  if (percentage >= 40) return "Medium";
  return "Hard";
}

// Helper to format average time in seconds to human readable
export function formatAvgTime(totalSeconds, totalAttempts) {
  if (!totalAttempts || totalAttempts === 0) return "—";
  const avg = Math.round(totalSeconds / totalAttempts);
  if (avg < 60) return `${avg} sec`;
  const mins = Math.floor(avg / 60);
  const secs = avg % 60;
  return `${mins}m ${secs}s`;
}

const QuestionStat = mongoose.model("QuestionStat", questionStatSchema);
export default QuestionStat;
