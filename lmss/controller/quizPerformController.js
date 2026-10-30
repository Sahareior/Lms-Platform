import mongoose from "mongoose";
import quizPerform from "../models/QuizPerformance.js";
import QuestionModel from "../models/QuestionModel.js";
import { invalidatePrefix } from "../middleware/cache.js";
import ScheduleExam from "../models/ScheduleExamModel.js";
import Favorite from "../models/Favorite.js";

// Helper: resolve embedded question references
export async function resolveSubmittedQuestions(performances) {
  const questionIdStrings = new Set();
  const questionObjectIds = [];

  for (const perf of performances) {
    for (const sq of perf.submittedQuestions || []) {
      if (sq.question) {
        const str = sq.question.toString();
        questionIdStrings.add(str);
        if (mongoose.Types.ObjectId.isValid(sq.question)) {
          questionObjectIds.push(new mongoose.Types.ObjectId(sq.question));
        }
      }
    }
  }
  if (questionIdStrings.size === 0) return performances;

  const [questionDocs, scheduleDocs] = await Promise.all([
    QuestionModel.find({
      $or: [
        { "data._id": { $in: questionObjectIds } },
        { "data._id": { $in: [...questionIdStrings] } },
        { _id: { $in: questionObjectIds } },
      ],
    }),
    ScheduleExam.find({
      $or: [
        { "generatedQuestions._id": { $in: questionObjectIds } },
        { "generatedQuestions._id": { $in: [...questionIdStrings] } },
        { "generatedQuestions.originalQuestionId": { $in: questionObjectIds } },
      ],
    }),
  ]);

  const questionMap = new Map();

  for (const doc of questionDocs) {
    for (const q of doc.data || []) {
      const qIdStr = q._id?.toString();
      if (qIdStr && questionIdStrings.has(qIdStr)) {
        questionMap.set(qIdStr, {
          _id: q._id,
          question_number: q.question_number,
          question_text: q.question_text,
          options: q.options instanceof Map ? Object.fromEntries(q.options) : q.options,
          correct_answer: q.correct_answer,
          subjectName: q.subjectName || null,
          topic: q.topic || null,
        });
      }
    }
  }

  for (const doc of scheduleDocs) {
    for (const q of doc.generatedQuestions || []) {
      const qIdStr = q._id?.toString();
      const origIdStr = q.originalQuestionId?.toString();
      const mapped = {
        _id: q._id,
        question_number: q.question_number,
        question_text: q.question_text,
        options: q.options instanceof Map ? Object.fromEntries(q.options) : q.options,
        correct_answer: q.correct_answer,
        subjectName: q.subjectName || null,
        topic: q.topic || null,
      };
      if (qIdStr && questionIdStrings.has(qIdStr)) {
        questionMap.set(qIdStr, mapped);
      }
      if (origIdStr && questionIdStrings.has(origIdStr)) {
        questionMap.set(origIdStr, mapped);
      }
    }
  }

  return performances.map((perf) => {
    const plain = perf.toObject ? perf.toObject() : perf; // ensure plain object
    plain.submittedQuestions = (plain.submittedQuestions || []).map((sq) => ({
      ...sq,
      questionData: questionMap.get(sq.question?.toString()) || null,
    }));
    return plain;
  });
}

// POST – create or update performance.
// Answers accumulate into `submittedQuestions` (one entry per question) instead
// of being replaced, so a full quiz's worth of answers is preserved.
// Uses an atomic aggregation-pipeline upsert so concurrent per-question posts
// can't overwrite each other, and re-answering a question updates its existing
// entry ("one entry per question, latest answer wins") rather than duplicating.
export const postQuizPerformance = async (req, res) => {
  try {
    const { user, exam, examVersion, subject, submittedQuestions } = req.body;

    if (!user || !exam || !Array.isArray(submittedQuestions) || submittedQuestions.length === 0) {
      return res.status(400).json({ message: "user, exam and submittedQuestions (non-empty array) are required" });
    }

    // Dedupe the incoming batch by question id (last answer wins) and cast the
    // question id to ObjectId so the $in comparison against stored docs matches.
    const incomingMap = new Map();
    for (const sq of submittedQuestions) {
      if (!sq?.question || !mongoose.Types.ObjectId.isValid(sq.question)) continue;
      incomingMap.set(sq.question.toString(), {
        ...sq,
        question: new mongoose.Types.ObjectId(sq.question),
      });
    }
    const incoming = [...incomingMap.values()];
    const incomingIds = incoming.map((sq) => sq.question);

    if (incoming.length === 0) {
      return res.status(400).json({ message: "submittedQuestions must contain valid question references" });
    }

    const userObjId = new mongoose.Types.ObjectId(user);
    const examObjId = new mongoose.Types.ObjectId(exam);
    const examVersionObjId = examVersion && mongoose.Types.ObjectId.isValid(examVersion) ? new mongoose.Types.ObjectId(examVersion) : null;
    const subjectObjId = subject && mongoose.Types.ObjectId.isValid(subject) ? new mongoose.Types.ObjectId(subject) : null;

    // Build filter: user + exam + examVersion + subject (examVersion and subject may be null)
    const filter = {
      user: userObjId,
      exam: examObjId,
      examVersion: examVersionObjId,
      subject: subjectObjId,
    };

    // Atomic upsert with a pipeline: keep existing submitted questions that are
    // NOT re-answered in this batch, then append the incoming answers.
    const performance = await quizPerform.findOneAndUpdate(
      filter,
      [
        {
          $set: {
            user: userObjId,
            exam: examObjId,
            examVersion: examVersionObjId,
            subject: subjectObjId,
            attemptCount: { $ifNull: ["$attemptCount", 1] },
            submittedQuestions: {
              $concatArrays: [
                {
                  $filter: {
                    input: { $ifNull: ["$submittedQuestions", []] },
                    as: "sq",
                    cond: { $not: { $in: ["$$sq.question", incomingIds] } },
                  },
                },
                incoming,
              ],
            },
          },
        },
      ],
      // `updatePipeline: true` is required by Mongoose when the update is an
      // aggregation pipeline (an array).
      { upsert: true, returnDocument: "after", updatePipeline: true }
    );

    await invalidatePrefix('cache:quiz-performance');
    return res.status(201).json(performance);
  } catch (err) {
    console.error("postQuizPerformance error:", err);
    res.status(500).json({ message: "Unable to create/update quizPerformance" });
  }
};

// GET – retrieve all performances (unchanged)
export const getQuizPerformance = async (req, res) => {
  try {
    const quizPerformance = await quizPerform.find();
    const result = await resolveSubmittedQuestions(quizPerformance);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to get quizPerformance" });
  }
};




/**
 * GET /quiz-performance/notebook?limit=100
 * The user's "Notebook": every question they have ever answered in an exam
 * (mock or practice), classified by how their submitted answer compares to the
 * correct answer, plus their favorite-marked questions.
 *
 * - status=right: submitted answer matches the correct option key
 * - status=wrong: submitted answer does not match (or the question could not
 *   be resolved to a known bank, so it stays as "wrong" for review)
 * - favorites: always returned alongside so the UI can show all three tabs
 *   from one call. Favorite questions keep their own snapshot.
 *
 * Data comes from QuizPerformance (one entry per submitted answer per exam)
 * joined with the question bank for the correct answer + options snapshot.
 */
export const getNotebookQuestions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 200, 1), 500);

    const performances = await quizPerform.find({ user: userId }).sort({ updatedAt: -1 }).limit(limit).lean();

    // Collect every distinct question id the user has submitted an answer for.
    const questionIdSet = new Set();
    // (questionId -> [{ providedAnswer, examName, subjectName, updatedAt }])
    const submissionMeta = new Map();

    for (const perf of performances) {
      for (const sq of perf.submittedQuestions || []) {
        if (!sq?.question) continue;
        const qIdStr = sq.question.toString();
        questionIdSet.add(qIdStr);
        const meta = {
          providedAnswer: sq.providedAnswer || "",
          examName: perf.exam?.name || null,
          subjectName: perf.subject?.name || null,
          updatedAt: perf.updatedAt,
        };
        const list = submissionMeta.get(qIdStr);
        if (list) list.push(meta);
        else submissionMeta.set(qIdStr, [meta]);
      }
    }

    const questionIds = [...questionIdSet];

    // Resolve the question bank entries (same lookup strategy as
    // resolveSubmittedQuestions: embedded data[] ids, direct doc ids, or
    // generated questions on scheduled exams).
    const objectIds = questionIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));
    const idStrs = questionIds.map(String);

    const [questionDocs, scheduleDocs, favorites] = await Promise.all([
      QuestionModel.find({
        $or: [
          { "data._id": { $in: objectIds } },
          { "data._id": { $in: idStrs } },
          { _id: { $in: objectIds } },
        ],
      }).lean(),
      ScheduleExam.find({
        $or: [
          { "generatedQuestions._id": { $in: objectIds } },
          { "generatedQuestions._id": { $in: idStrs } },
          { "generatedQuestions.originalQuestionId": { $in: objectIds } },
        ],
      }).lean(),
      Favorite.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate("exam", "name")
        .populate("subject", "name")
        .lean(),
    ]);

    const questionMap = new Map();

    for (const doc of questionDocs) {
      for (const q of doc.data || []) {
        const qIdStr = q._id?.toString();
        if (qIdStr && questionIdSet.has(qIdStr)) {
          questionMap.set(qIdStr, {
            _id: qIdStr,
            questionText: q.question_text || "",
            options: q.options instanceof Map ? Object.fromEntries(q.options) : q.options || {},
            correctAnswer: q.correct_answer || null,
            explanation: q.explanation || "",
          });
        }
      }
    }

    for (const doc of scheduleDocs) {
      for (const q of doc.generatedQuestions || []) {
        const mapped = {
          _id: q._id?.toString(),
          questionText: q.question_text || "",
          options: q.options instanceof Map ? Object.fromEntries(q.options) : q.options || {},
          correctAnswer: q.correct_answer || null,
          explanation: q.explanation || "",
        };
        const ids = [q._id?.toString(), q.originalQuestionId?.toString()].filter(Boolean);
        for (const idStr of ids) {
          if (questionIdSet.has(idStr) && !questionMap.has(idStr)) {
            questionMap.set(idStr, mapped);
          }
        }
      }
    }

    // ── Classify answered questions into right / wrong ──
    // "latest answer wins": use the most recent submission for classification.
    const right = [];
    const wrong = [];

    for (const qIdStr of questionIds) {
      const bank = questionMap.get(qIdStr);
      const metas = submissionMeta.get(qIdStr) || [];
      const latest = metas[metas.length - 1];
      if (!latest) continue;

      const isCorrect =
        !!bank?.correctAnswer &&
        String(latest.providedAnswer).trim() === String(bank.correctAnswer).trim();

      const item = {
        questionId: qIdStr,
        questionText: bank?.questionText || "",
        options: bank?.options || {},
        correctAnswer: bank?.correctAnswer || null,
        explanation: bank?.explanation || "",
        providedAnswer: latest.providedAnswer,
        examName: latest.examName,
        subjectName: latest.subjectName,
        answeredAt: latest.updatedAt,
        timesAnswered: metas.length,
        resolved: !!bank,
      };

      (isCorrect ? right : wrong).push(item);
    }

    // ── Favorites (own snapshot, independent of whether they were answered) ──
    const favoritesOut = favorites.map((f) => ({
      favoriteId: f._id,
      questionId: f.questionId,
      questionText: f.questionSnapshot?.questionText || "",
      options: f.questionSnapshot?.options instanceof Map
        ? Object.fromEntries(f.questionSnapshot.options)
        : f.questionSnapshot?.options || {},
      correctAnswer: f.questionSnapshot?.correctAnswer || null,
      explanation: f.questionSnapshot?.explanation || "",
      examName: f.exam?.name || null,
      subjectName: f.subject?.name || null,
      favoritedAt: f.createdAt,
    }));

    res.status(200).json({
      right,
      wrong,
      favorites: favoritesOut,
      stats: {
        rightCount: right.length,
        wrongCount: wrong.length,
        favoriteCount: favoritesOut.length,
      },
    });
  } catch (err) {
    console.error("getNotebookQuestions error:", err);
    res.status(500).json({ message: "Unable to load notebook questions" });
  }
};

// GET – performances for a specific user with populated references
export const getQuizPerformanceByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find all performance documents for this user and populate references
    const performances = await quizPerform.find({ user: userId })
      .populate('user', 'name email')                // select user fields
      .populate('exam', 'name')                     // select exam fields
      .populate('examVersion', 'examVersion')       // select version fields
      .populate('subject', 'name');                 // select subject fields

    // Resolve the embedded question references (adds questionData to each submittedQuestion)
    const resolved = await resolveSubmittedQuestions(performances);

    res.status(200).json(resolved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to get user performances" });
  }
};