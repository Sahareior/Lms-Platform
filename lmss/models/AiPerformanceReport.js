import mongoose from "mongoose";

/**
 * Cached AI performance report for a user.
 * The AI analysis is expensive, so the full response from the AI service is
 * persisted here and reused for the rest of the day instead of being
 * regenerated on every page load / refetch.
 */
const aiPerformanceReport = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Raw `stats` object returned by the AI service
    stats: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    // Raw `ai_report` object returned by the AI service
    ai_report: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

// Fast lookup for "latest report per user" and "report for today"
aiPerformanceReport.index({ user: 1, createdAt: -1 });

const AiPerformanceReport = mongoose.model(
  "AiPerformanceReport",
  aiPerformanceReport
);
export default AiPerformanceReport;
