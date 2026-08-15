import mongoose from "mongoose";
import AiPerformanceReport from "../models/AiPerformanceReport.js";
import quizPerform from "../models/QuizPerformance.js";
import { resolveSubmittedQuestions } from "./quizPerformController.js";

// URL of the external (expensive) AI analysis service. The frontend used to hit
// this directly on every refetch; the backend now proxies it and caches the
// result so the AI is called at most once per day per user.
const AI_PERFORMANCE_URL = (
  process.env.AI_PERFORMANCE_URL || "http://127.0.0.1:5000/user-performance"
).trim();
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

// ─── Helper: sanitize performances for the AI service ───────
// The AI service validates strictly: `subject` must be a dict (never null),
// `question` must be a plain string, and `questionData` must be a full object
// (it rejects null). Entries whose question could not be resolved are dropped
// so one stale question can't fail the whole report.
function sanitizeForAiService(performances) {
  return performances
    .map((perf) => {
      const submittedQuestions = (perf.submittedQuestions || [])
        .filter((sq) => sq.questionData && typeof sq.questionData === "object")
        .map((sq) => ({
          ...sq,
          question: sq.question?.toString ? sq.question.toString() : sq.question,
        }));
      if (submittedQuestions.length === 0) return null;
      return {
        ...perf,
        user: perf.user || { _id: null, name: "Unknown", email: "" },
        exam: perf.exam || { _id: null, name: "Unknown Exam" },
        examVersion: perf.examVersion || { _id: null, examVersion: "Unknown" },
        // The AI service rejects `subject: null` – fall back to a generic dict.
        subject:
          perf.subject && typeof perf.subject === "object"
            ? perf.subject
            : { _id: null, name: "General" },
        submittedQuestions,
      };
    })
    .filter(Boolean);
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

// ─── Helper: deterministic local report (AI-free fallback) ──
// If the AI service is unreachable we still generate a useful report from the
// performance data itself so the endpoint never hard-fails on a user who has
// answered questions. Mirrors the AI service's response shape.
function buildLocalReport(performances) {
  let total = 0;
  let correct = 0;
  const subjectMap = new Map(); // subject name -> { attempted, correct }
  const mistakes = [];
  const examNames = new Set();

  for (const perf of performances) {
    const subjectName = perf.subject?.name || "General";
    const examName = perf.exam?.name || "Unknown";
    examNames.add(examName);

    if (!subjectMap.has(subjectName)) {
      subjectMap.set(subjectName, { attempted: 0, correct: 0 });
    }
    const sb = subjectMap.get(subjectName);

    for (const sq of perf.submittedQuestions || []) {
      const qd = sq.questionData;
      if (!qd) continue;
      total++;
      sb.attempted++;
      const isCorrect = sq.providedAnswer === qd.correct_answer;
      if (isCorrect) {
        correct++;
        sb.correct++;
      } else {
        mistakes.push({
          question_text: qd.question_text || "Question",
          identified_subject: subjectName,
          user_answer: sq.providedAnswer || "",
          correct_answer: qd.correct_answer || "",
          explanation:
            "Review this topic's fundamentals to avoid repeating the same mistake.",
        });
      }
    }
  }

  const incorrect = total - correct;
  const score_percentage = total
    ? Math.round((correct / total) * 1000) / 10
    : 0;

  const subject_breakdown = [...subjectMap.entries()].map(([subject, s]) => {
    const accuracy = s.attempted
      ? Math.round((s.correct / s.attempted) * 1000) / 10
      : 0;
    return {
      subject,
      attempted: s.attempted,
      correct: s.correct,
      accuracy,
      isWeak: accuracy < 60,
      isCritical: accuracy < 40,
    };
  });

  const sorted = [...subject_breakdown].sort((a, b) => b.accuracy - a.accuracy);
  const strengths = sorted
    .filter((s) => s.accuracy >= 60 && s.attempted > 0)
    .slice(0, 3)
    .map((s) => ({
      topic: s.subject,
      accuracy: s.accuracy,
      detail: `Strong performance in ${s.subject} with ${s.accuracy}% accuracy.`,
    }));
  const weak_areas = sorted
    .filter((s) => s.accuracy < 60 && s.attempted > 0)
    .slice(0, 3)
    .map((s) => ({
      topic: s.subject,
      accuracy: s.accuracy,
      reason: `Accuracy in ${s.subject} is ${s.accuracy}%, below the 60% target.`,
      recommendation: `Spend focused revision time on ${s.subject} and retry practice questions.`,
    }));

  const verdict =
    score_percentage >= 80
      ? "Excellent"
      : score_percentage >= 60
      ? "Good"
      : score_percentage >= 40
      ? "Needs Improvement"
      : "Critical";

  return {
    stats: {
      total_questions: total,
      correct_answers: correct,
      incorrect_answers: incorrect,
      score_percentage,
      exam: [...examNames].join(", ") || "Unknown",
    },
    ai_report: {
      score_analysis: {
        percentage: Math.round(score_percentage),
        verdict,
        message: `You scored ${score_percentage}% across ${total} question${
          total === 1 ? "" : "s"
        }. ${verdict === "Excellent" ? "Outstanding work — keep it up!" : verdict === "Good" ? "Solid effort — a bit more practice will push you higher." : "Keep practising consistently to build accuracy and confidence."}`,
      },
      subject_breakdown,
      strengths,
      weak_areas,
      mistake_breakdown: mistakes.slice(0, 10),
      study_plan: weak_areas.slice(0, 3).map((w, i) => ({
        day: `Day ${i + 1}`,
        focus_subject: w.topic,
        title: `${w.topic} Fundamentals`,
        description: `Revise core concepts in ${w.topic} and attempt 10-15 practice questions.`,
        duration_minutes: 30,
      })),
    },
  };
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
// Scoped to the same exam scope (examId = null → overall reports only, so
// per-exam reports never pollute the "All Exams" deltas).
async function findPreviousReport(userId, excludeId, examId = null) {
  return AiPerformanceReport.findOne({
    user: userId,
    // For the combined scope only reports generated by the current code carry
    // `source` – skip the old degraded fallback reports so deltas compare like
    // for like.
    ...(examId ? { exam: examId } : { exam: null, source: { $exists: true } }),
    _id: { $ne: excludeId },
  }).sort({ createdAt: -1 });
}

// ─── Helper: generate one report for a single set of performances ──
// Calls the AI service when it accepts the payload; falls back to a local
// deterministic report if the service is down or the payload can't be
// sanitized for it.
async function generateSingleReport(resolved, authHeader) {
  const sanitized = sanitizeForAiService(resolved);
  if (sanitized.length > 0) {
    try {
      const data = await callAiService(sanitized, authHeader);
      data.source = "ai";
      return data;
    } catch (err) {
      console.error("AI performance service unavailable – using local fallback:", err.message);
    }
  }
  // No question could be resolved to a full object the AI service accepts.
  const data = buildLocalReport(resolved);
  data.source = "local";
  return data;
}

// ─── Helper: merge per-exam AI reports into one combined report ──
// The combined (all exams) report is built from the same per-exam analyses
// the user sees on each exam's page, so the overall view always matches the
// per-exam detail instead of drifting into a degraded local fallback.
function mergeExamReports(examReports) {
  const total = examReports.reduce((s, r) => s + (r.stats?.total_questions || 0), 0);
  const correct = examReports.reduce((s, r) => s + (r.stats?.correct_answers || 0), 0);
  const incorrect = examReports.reduce((s, r) => s + (r.stats?.incorrect_answers || 0), 0);
  const score_percentage = total
    ? Math.round((correct / total) * 1000) / 10
    : 0;
  const examNames = examReports.map((r) => r.examName).filter(Boolean);

  // Subject breakdown: merge entries with the same subject name.
  const subjectMap = new Map();
  for (const r of examReports) {
    for (const s of r.ai_report?.subject_breakdown || []) {
      const key = s.subject || "General";
      const existing = subjectMap.get(key);
      if (!existing) {
        subjectMap.set(key, { ...s });
      } else {
        existing.attempted = (existing.attempted || 0) + (s.attempted || 0);
        existing.correct = (existing.correct || 0) + (s.correct || 0);
        const accuracy = existing.attempted
          ? Math.round((existing.correct / existing.attempted) * 1000) / 10
          : 0;
        existing.accuracy = accuracy;
        existing.isWeak = accuracy < 60;
        existing.isCritical = accuracy < 40;
      }
    }
  }

  const strengths = examReports.flatMap((r) => r.ai_report?.strengths || []).slice(0, 4);
  const weak_areas = examReports.flatMap((r) => r.ai_report?.weak_areas || []).slice(0, 5);
  const mistake_breakdown = examReports
    .flatMap((r) => r.ai_report?.mistake_breakdown || [])
    .slice(0, 10);
  const study_plan = examReports.flatMap((r) => r.ai_report?.study_plan || []).slice(0, 5);

  const verdict =
    score_percentage >= 80
      ? "Excellent"
      : score_percentage >= 60
      ? "Good"
      : score_percentage >= 40
      ? "Needs Improvement"
      : "Critical";

  const verdictMessage =
    verdict === "Excellent"
      ? "Outstanding work — keep it up!"
      : verdict === "Good"
      ? "Solid effort — a bit more practice will push you higher."
      : verdict === "Needs Improvement"
      ? "Keep practising consistently to build accuracy and confidence."
      : "Focus on your weak areas below to turn them into strengths.";

  return {
    stats: {
      total_questions: total,
      correct_answers: correct,
      incorrect_answers: incorrect,
      score_percentage,
      exam: examNames.join(", ") || "Unknown",
    },
    ai_report: {
      score_analysis: {
        percentage: Math.round(score_percentage),
        verdict,
        message: `You scored ${score_percentage}% across ${total} question${total === 1 ? "" : "s"} (${correct} correct, ${incorrect} incorrect). ${verdictMessage}`,
      },
      subject_breakdown: [...subjectMap.values()],
      strengths,
      weak_areas,
      mistake_breakdown,
      study_plan,
    },
  };
}

// ─── Helper: generate the combined (all exams) report ──────
// Groups the user's performances by exam, gets the AI analysis per exam
// (reusing today's per-exam report when it already exists to avoid duplicate
// AI calls), then merges them. Sending one oversized multi-exam payload to the
// AI service made it fail and silently downgrade the whole report to the local
// fallback, which is why the per-exam responses looked correct but the overall
// one did not.
async function generateCombinedReport(userId, resolved, authHeader) {
  const byExam = new Map();
  for (const perf of resolved) {
    const examId = perf.exam?._id?.toString?.() || perf.exam?.toString?.() || "unknown";
    if (!byExam.has(examId)) {
      byExam.set(examId, { examName: perf.exam?.name || "Unknown", items: [] });
    }
    byExam.get(examId).items.push(perf);
  }

  const examReports = [];
  for (const [examId, group] of byExam) {
    let data = null;
    // Reuse today's cached per-exam report when available (avoids duplicate AI calls).
    if (examId !== "unknown") {
      const todayReport = await AiPerformanceReport.findOne({
        user: userId,
        exam: examId,
        createdAt: { $gte: startOfToday() },
      }).sort({ createdAt: -1 });
      if (todayReport) {
        data = { stats: todayReport.stats, ai_report: todayReport.ai_report };
      }
    }
    if (!data) {
      data = await generateSingleReport(group.items, authHeader);
    }
    examReports.push({
      examId,
      examName: group.examName,
      stats: data.stats,
      ai_report: data.ai_report,
    });
  }

  return mergeExamReports(examReports);
}

// ─── Helper: deduplicated generate-and-save ─────────────────
// Concurrent callers share the same AI call + DB write.
// Cache key includes the exam so per-exam generations don't collide.
// If the AI service is down, falls back to a local deterministic report so
// the user still gets a persisted report for the day.
function generateAndSaveReport(userId, examId = null, authHeader) {
  const cacheKey = `${userId}|${examId || "all"}`;
  if (inflightGeneration.has(cacheKey)) {
    return inflightGeneration.get(cacheKey);
  }
  const promise = (async () => {
    const performances = await quizPerform
      .find({ user: userId, ...(examId ? { exam: examId } : {}) })
      .populate("user", "name email")
      .populate("exam", "name")
      .populate("examVersion", "examVersion")
      .populate("subject", "name");
    const resolved = await resolveSubmittedQuestions(performances);

    if (!resolved || resolved.length === 0) {
      return { empty: true };
    }

    let data;
    const sanitized = sanitizeForAiService(resolved);
    if (sanitized.length > 0) {
      try {
        data = await callAiService(sanitized, authHeader);
      } catch (err) {
        console.error("AI performance service unavailable – using local fallback:", err.message, err.cause || "");
        data = buildLocalReport(resolved);
      }
    } else {
      // No question could be resolved to a full object the AI service accepts.
      data = buildLocalReport(resolved);
    }

    const report = await AiPerformanceReport.create({
      user: userId,
      exam: examId || null,
      // Combined reports are always the per-exam merge; per-exam reports are
      // 'ai' when the AI service responded, 'local' when we fell back.
      source: examId ? data.source || "ai" : "merged",
      stats: data.stats,
      ai_report: data.ai_report,
    });
    return { report };
  })().finally(() => {
    inflightGeneration.delete(cacheKey);
  });
  inflightGeneration.set(cacheKey, promise);
  return promise;
}

// ─── GET or GENERATE (cached once per day) ──────────────────
// POST /ai-performance/:userId  (or /ai-performance)
// Body/query: { force?: boolean } – force = true bypasses the daily cache
// (used by the manual "Regenerate" button on the frontend).
// Body/query: { examId?: string } – when provided, only that exam's
// performance is analyzed and the report is cached per exam.
export const getOrGenerateAiPerformance = async (req, res) => {
  try {
    const userId = req.params.userId || req.body?.userId || req.user?.userId;
    const force = req.query.force === "true" || req.body?.force === true;
    const examId = req.query.examId || req.body?.examId || null;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "A valid userId is required" });
    }
    if (examId && !mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({ message: "A valid examId is required" });
    }

    // `{ exam: null }` matches both null and missing exam fields (MongoDB),
    // so legacy reports created before exam scoping stay visible under "All".
    const examFilter = examId ? { exam: examId } : { exam: null };

    // 1) Return today's cached report if it exists (unless force).
    if (!force) {
      const todayReport = await AiPerformanceReport.findOne({
        user: userId,
        ...examFilter,
        createdAt: { $gte: startOfToday() },
      }).sort({ createdAt: -1 });

      // One-time migration: combined (all-exams) reports generated before the
      // per-exam merge fix have no `source` and may be degraded local-fallback
      // reports. Regenerate them instead of serving stale data.
      const isStaleCombined = !examId && todayReport && !todayReport.source;

      if (todayReport && !isStaleCombined) {
        const previous = await findPreviousReport(userId, todayReport._id, examId);
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
      result = await generateAndSaveReport(userId, examId, req.headers.authorization);
    } catch (err) {
      console.error("AI performance generation failed:", err.message);
      const lastReport = await AiPerformanceReport.findOne({
        user: userId,
        ...examFilter,
      }).sort({ createdAt: -1 });
      if (lastReport) {
        const previous = await findPreviousReport(userId, lastReport._id, examId);
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
      const lastReport = await AiPerformanceReport.findOne({
        user: userId,
        ...examFilter,
      }).sort({ createdAt: -1 });
      if (lastReport) {
        const previous = await findPreviousReport(userId, lastReport._id, examId);
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

    const previous = await findPreviousReport(userId, result.report._id, examId);
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
// GET /ai-performance/history/:userId?examId=...
// When examId is provided, only reports generated for that exam are returned.
export const getAiPerformanceHistory = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.userId;
    const examId = req.query.examId || null;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "A valid userId is required" });
    }
    if (examId && !mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({ message: "A valid examId is required" });
    }

    const reports = await AiPerformanceReport.find({
      user: userId,
      ...(examId ? { exam: examId } : { exam: null }),
    }).sort({
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
