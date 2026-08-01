import mongoose from "mongoose";
import quizPerform from "../models/QuizPerformance.js";
import QuestionModel from "../models/QuestionModel.js";

// Helper: resolve embedded question references (unchanged)
export async function resolveSubmittedQuestions(performances) {
  const questionIds = new Set();
  for (const perf of performances) {
    for (const sq of perf.submittedQuestions || []) {
      if (sq.question) questionIds.add(sq.question.toString());
    }
  }
  if (questionIds.size === 0) return performances;

  const questionDocs = await QuestionModel.find({
    "data._id": { $in: [...questionIds] },
  });

  const questionMap = new Map();
  for (const doc of questionDocs) {
    for (const q of doc.data || []) {
      if (q._id && questionIds.has(q._id.toString())) {
        questionMap.set(q._id.toString(), {
          _id: q._id,
          question_number: q.question_number,
          question_text: q.question_text,
          options: q.options instanceof Map ? Object.fromEntries(q.options) : q.options,
          correct_answer: q.correct_answer,
        });
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

    if (!user || !exam || !examVersion || !Array.isArray(submittedQuestions) || submittedQuestions.length === 0) {
      return res.status(400).json({ message: "user, exam, examVersion and submittedQuestions (non-empty array) are required" });
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

    // Build filter: user + exam + examVersion + subject (subject may be null)
    const filter = { user, exam, examVersion, subject: subject || null };

    // Atomic upsert with a pipeline: keep existing submitted questions that are
    // NOT re-answered in this batch, then append the incoming answers.
    const performance = await quizPerform.findOneAndUpdate(
      filter,
      [
        {
          $set: {
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
      // aggregation pipeline (an array). Without it, the update is rejected.
      { upsert: true, new: true, updatePipeline: true }
    );

    return res.status(201).json(performance);
  } catch (err) {
    console.error(err);
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