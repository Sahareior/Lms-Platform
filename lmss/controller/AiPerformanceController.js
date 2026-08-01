import mongoose from "mongoose";
import AiPerformanceReport from "../models/AiPerformanceReport.js";
import quizPerform from "../models/QuizPerformance.js";
import { resolveSubmittedQuestions } from "./quizPerformController.js";

// URL of the external (expensive) AI analysis service. The frontend used to hit
// this directly on every refetch; the backend now proxies it and caches the
// result so the AI is called at most once per day per user.
const AI_PERFORMANCE_URL =
  process.env.AI_PERFORMANCE_URL || "http://127.0.0.1:5000/user-performance";
// AI analysis can take a while – give it a generous timeout.
const AI_TIMEOUT_MS = 120000;

// In-flight generation promises keyed by userId. When multiple requests for the
// same user arrive at the same time (app auto-load + manual regenerate, two
// tabs, retries...), they all await the same AI call instead of firing it
// multiple times. Guarantees a single AI call per generation.
const inflightGeneration = new Map();

// Start of the current local day (used as the "once per day" boundary).
function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// ─── Helper: call the external AI service ───────────────────
async function callAiService(performances, authHeader) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  try {
    const res = await fetch(AI_PERFORMANCE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(performances),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`AI service responded with status ${res.status}`);
    }
    const data = await res.json();
    if (!data || !data.stats || !data.ai_report) {
      throw new Error("AI service returned an unexpected response shape");
    }
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Helper: build the "previous" report payload ────────────
function toPreviousPayload(report) {
  if (!report) return null;
  return {
    stats: report.stats || null,
    ai_report: report.ai_report || null,
    generatedAt: report.createdAt,
  };
}

// ─── Helper: latest report before the given one ─────────────
async function findPreviousReport(userId, excludeId) {
  return AiPerformanceReport.findOne({
    user: userId,
    _id: { $ne: excludeId },
  }).sort({ createdAt: -1 });
}

// ─── Helper: deduplicated generate-and-save ─────────────────
// Concurrent callers share the same AI call + DB write.
function generateAndSaveReport(userId, authHeader) {
  if (inflightGeneration.has(userId)) {
    return inflightGeneration.get(userId);
  }
  const promise = (async () => {
    const performances = await quizPerform
      .find({ user: userId })
      .populate("user", "name email")
      .populate("exam", "name")
      .populate("examVersion", "examVersion")
      .populate("subject", "name");
    const resolved = await resolveSubmittedQuestions(performances);

    if (!resolved || resolved.length === 0) {
      return { empty: true };
    }

    const data = await callAiService(resolved, authHeader);
    const report = await AiPerformanceReport.create({
      user: userId,
      stats: data.stats,
      ai_report: data.ai_report,
    });
    return { report };
  })().finally(() => {
    inflightGeneration.delete(userId);
  });
  inflightGeneration.set(userId, promise);
  return promise;
}

// ─── GET or GENERATE (cached once per day) ──────────────────
// POST /ai-performance/:userId  (or /ai-performance)
// Body/query: { force?: boolean } – force = true bypasses the daily cache
// (used by the manual "Regenerate" button on the frontend).
export const getOrGenerateAiPerformance = async (req, res) => {
  try {
    const userId = req.params.userId || req.body?.userId || req.user?.userId;
    const force = req.query.force === "true" || req.body?.force === true;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "A valid userId is required" });
    }

    // 1) Return today's cached report if it exists (unless force).
    if (!force) {
      const todayReport = await AiPerformanceReport.findOne({
        user: userId,
        createdAt: { $gte: startOfToday() },
      }).sort({ createdAt: -1 });

      if (todayReport) {
        const previous = await findPreviousReport(userId, todayReport._id);
        return res.status(200).json({
          success: true,
          cached: true,
          generatedAt: todayReport.createdAt,
          stats: todayReport.stats,
          ai_report: todayReport.ai_report,
          previous: toPreviousPayload(previous),
        });
      }
    }

    // 2) Generate (and persist) a fresh report – deduplicated across
    //    concurrent requests so the AI is only called once.
    let result;
    try {
      result = await generateAndSaveReport(userId, req.headers.authorization);
    } catch (err) {
      console.error("AI performance generation failed:", err.message);
      const lastReport = await AiPerformanceReport.findOne({ user: userId })
        .sort({ createdAt: -1 });
      if (lastReport) {
        const previous = await findPreviousReport(userId, lastReport._id);
        return res.status(200).json({
          success: true,
          cached: true,
          fallback: true,
          generatedAt: lastReport.createdAt,
          stats: lastReport.stats,
          ai_report: lastReport.ai_report,
          previous: toPreviousPayload(previous),
        });
      }
      return res
        .status(502)
        .json({ message: "AI analysis unavailable and no cached report found" });
    }

    // 3) No performance data yet – keep showing the user's last report if they
    //    have one (continuity), otherwise report `empty` for brand-new users.
    if (result.empty) {
      const lastReport = await AiPerformanceReport.findOne({ user: userId })
        .sort({ createdAt: -1 });
      if (lastReport) {
        const previous = await findPreviousReport(userId, lastReport._id);
        return res.status(200).json({
          success: true,
          cached: true,
          fallback: true,
          generatedAt: lastReport.createdAt,
          stats: lastReport.stats,
          ai_report: lastReport.ai_report,
          previous: toPreviousPayload(previous),
        });
      }
      return res.status(200).json({
        success: true,
        empty: true,
        cached: false,
        generatedAt: null,
        stats: null,
        ai_report: null,
        previous: null,
      });
    }

    const previous = await findPreviousReport(userId, result.report._id);
    return res.status(200).json({
      success: true,
      cached: false,
      generatedAt: result.report.createdAt,
      stats: result.report.stats,
      ai_report: result.report.ai_report,
      previous: toPreviousPayload(previous),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to get or generate AI performance" });
  }
};

// ─── History (all saved reports for progress-over-time) ────
// GET /ai-performance/history/:userId
export const getAiPerformanceHistory = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "A valid userId is required" });
    }

    const reports = await AiPerformanceReport.find({ user: userId }).sort({
      createdAt: 1,
    });

    const history = reports.map((r, i) => ({
      generatedAt: r.createdAt,
      total_questions: r.stats?.total_questions ?? 0,
      correct_answers: r.stats?.correct_answers ?? 0,
      incorrect_answers: r.stats?.incorrect_answers ?? 0,
      score_percentage: r.stats?.score_percentage ?? 0,
      exam: r.stats?.exam ?? "Unknown",
      // Change in score vs the previous saved report
      delta:
        i > 0
          ? Math.round(
              ((r.stats?.score_percentage ?? 0) -
                (reports[i - 1].stats?.score_percentage ?? 0)) *
                10
            ) / 10
          : null,
    }));

    res.status(200).json({ success: true, history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to get AI performance history" });
  }
};
