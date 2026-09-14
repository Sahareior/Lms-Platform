import mongoose from "mongoose";
import quizPerform from "../models/QuizPerformance.js";
import QuestionModel from "../models/QuestionModel.js";
import { invalidatePrefix } from "../middleware/cache.js";
import ScheduleExam from "../models/ScheduleExamModel.js";

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

  console.log(`resolveSubmittedQuestions: sought ${questionIdStrings.size} questions, resolved ${questionMap.size} questions`);

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
    console.log("postQuizPerformance called with body:", JSON.stringify(req.body));
    const { user, exam, examVersion, subject, submittedQuestions } = req.body;

    if (!user || !exam || !Array.isArray(submittedQuestions) || submittedQuestions.length === 0) {
      console.warn("postQuizPerformance validation failed: missing user, exam, or non-empty submittedQuestions");
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
      console.warn("postQuizPerformance: submittedQuestions contains no valid ObjectId question references");
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

    console.log("postQuizPerformance successfully saved:", performance?._id);
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