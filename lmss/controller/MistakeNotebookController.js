import mongoose from "mongoose";
import MistakeNotebook, { REVIEW_INTERVALS_DAYS } from "../models/MistakeNotebook.js";

// ─── Helpers ────────────────────────────────────────────────
function nextDateFromBox(box) {
  const days = REVIEW_INTERVALS_DAYS[Math.min(Math.max(box, 0), REVIEW_INTERVALS_DAYS.length - 1)];
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * POST /mistake-notebook
 * Record a mistake (called automatically with exam submissions, or manually).
 * Body: {
 *   questions: [{
 *     questionId, questionDocId?, questionText?, options?, correctAnswer?,
 *     lastWrongAnswer?, exam?, examName?, subject?, subjectName?
 *   }]
 * }
 * Upserts one entry per question; wrong answers move the question DOWN to box 0
 * and schedule a review for tomorrow.
 */
export const recordMistakes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "questions array is required" });
    }
    if (questions.length > 200) {
      return res.status(400).json({ message: "Too many questions in one request (max 200)" });
    }

    const results = [];
    for (const q of questions) {
      if (!q?.questionId) continue;

      const entry = await MistakeNotebook.findOneAndUpdate(
        { user: userId, questionId: String(q.questionId) },
        {
          $set: {
            questionDocId: q.questionDocId || null,
            questionText: q.questionText || "",
            correctAnswer: q.correctAnswer ?? null,
            lastWrongAnswer: q.lastWrongAnswer ?? null,
            exam: q.exam || null,
            examName: q.examName || "",
            subject: q.subject || null,
            subjectName: q.subjectName || "",
            ...(q.options && typeof q.options === "object" ? { options: q.options } : {}),
            box: 0, // wrong again → back to the first box
            nextReviewAt: nextDateFromBox(0),
            mastered: false,
          },
          $inc: { wrongCount: 1 },
          $setOnInsert: { options: q.options || {} },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      results.push(entry);
    }

    res.status(200).json({ success: true, count: results.length, entries: results });
  } catch (err) {
    console.error("recordMistakes error:", err);
    res.status(500).json({ message: "Unable to record mistakes" });
  }
};

/**
 * GET /mistake-notebook?filter=due|all|mastered&limit=50
 * - due:     entries scheduled for review now (default) — the practice queue
 * - all:     every non-mastered entry
 * - mastered: entries the user has conquered
 */
export const getNotebook = async (req, res) => {
  try {
    const userId = req.user.userId;
    const filterMode = ["due", "all", "mastered"].includes(req.query.filter)
      ? req.query.filter
      : "due";
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);

    const base = { user: userId };
    let filter = base;
    if (filterMode === "due") {
      filter = { ...base, mastered: false, nextReviewAt: { $lte: new Date() } };
    } else if (filterMode === "all") {
      filter = { ...base, mastered: false };
    } else if (filterMode === "mastered") {
      filter = { ...base, mastered: true };
    }

    const [entries, total, masteredCount, dueCount] = await Promise.all([
      MistakeNotebook.find(filter).sort({ nextReviewAt: 1 }).limit(limit).lean(),
      MistakeNotebook.countDocuments(filter),
      MistakeNotebook.countDocuments({ user: userId, mastered: true }),
      MistakeNotebook.countDocuments({
        user: userId,
        mastered: false,
        nextReviewAt: { $lte: new Date() },
      }),
    ]);

    res.status(200).json({
      filter: filterMode,
      entries,
      total,
      stats: {
        totalTracked: await MistakeNotebook.countDocuments({ user: userId }),
        dueCount,
        masteredCount,
      },
    });
  } catch (err) {
    console.error("getNotebook error:", err);
    res.status(500).json({ message: "Unable to load mistake notebook" });
  }
};

/**
 * POST /mistake-notebook/:id/review
 * Grade a review: { correct: boolean, selectedOption?: string }
 * - correct → box +1 (mastered at the last box), next review pushed out
 * - wrong   → box reset to 0, review tomorrow
 */
export const reviewEntry = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { correct, selectedOption } = req.body;

    if (typeof correct !== "boolean") {
      return res.status(400).json({ message: "`correct` (boolean) is required" });
    }

    const entry = await MistakeNotebook.findOne({ _id: id, user: userId });
    if (!entry) {
      return res.status(404).json({ message: "Notebook entry not found" });
    }

    entry.lastReviewedAt = new Date();
    if (correct) {
      entry.correctCount += 1;
      entry.box = Math.min(entry.box + 1, REVIEW_INTERVALS_DAYS.length - 1);
      entry.nextReviewAt = nextDateFromBox(entry.box);
      if (entry.box >= REVIEW_INTERVALS_DAYS.length - 1 && entry.correctCount >= 3) {
        entry.mastered = true;
      }
    } else {
      entry.wrongCount += 1;
      entry.box = 0;
      entry.lastWrongAnswer = selectedOption ?? entry.lastWrongAnswer;
      entry.nextReviewAt = nextDateFromBox(0);
      entry.mastered = false;
    }

    await entry.save();
    res.status(200).json({ success: true, entry });
  } catch (err) {
    console.error("reviewEntry error:", err);
    res.status(500).json({ message: "Unable to record review" });
  }
};

/**
 * DELETE /mistake-notebook/:id
 * Remove an entry (e.g. the user disagrees or the question is junk).
 */
export const deleteEntry = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const deleted = await MistakeNotebook.findOneAndDelete({ _id: id, user: userId });
    if (!deleted) {
      return res.status(404).json({ message: "Notebook entry not found" });
    }
    res.status(200).json({ success: true, message: "Entry removed" });
  } catch (err) {
    console.error("deleteEntry error:", err);
    res.status(500).json({ message: "Unable to delete entry" });
  }
};

/**
 * GET /mistake-notebook/stats — quick counters for dashboard cards.
 */
export const getNotebookStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const [totalTracked, dueCount, masteredCount] = await Promise.all([
      MistakeNotebook.countDocuments({ user: userId }),
      MistakeNotebook.countDocuments({ user: userId, mastered: false, nextReviewAt: { $lte: new Date() } }),
      MistakeNotebook.countDocuments({ user: userId, mastered: true }),
    ]);
    res.status(200).json({ totalTracked, dueCount, masteredCount });
  } catch (err) {
    console.error("getNotebookStats error:", err);
    res.status(500).json({ message: "Unable to load notebook stats" });
  }
};
