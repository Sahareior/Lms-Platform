import QuizAttempt from "../models/QuizAttempt.js";
import QuestionModel from "../models/QuestionModel.js";
import { invalidatePrefix } from "../middleware/cache.js";

// ─── Helper: look up a single question from the QuestionModel data[] array ──
// QuestionModel stores questions in a `data` subdocument array. Each element
// has question_number, question_text, options, correct_answer, etc.
async function findQuestionFromBank(examId, versionId, subjectId, questionNumber, board) {
  if (!examId && !versionId) return null;

  const filter = {};
  if (examId) filter.exam = examId;
  if (versionId) filter.examVersion = versionId;
  if (subjectId) filter.subject = subjectId;
  if (board) filter.board = board;
  // Query into the embedded data[] array
  filter["data.question_number"] = questionNumber;

  const doc = await QuestionModel.findOne(filter);
  if (!doc || !doc.data) return null;

  // Find the specific question inside the data array
  const q = doc.data.find((d) => d.question_number === questionNumber);
  if (!q) return null;

  return {
    correctAnswer: q.correct_answer || null,
    questionText: q.question_text || "",
    questionOptions: q.options || {},
  };
}

// Helper: deduplicate questions by questionNumber
function deduplicateQuestions(questions) {
  if (!Array.isArray(questions)) return [];
  const map = new Map();
  for (const q of questions) {
    const rawNum = q.questionNumber !== undefined ? q.questionNumber : q.question_number;
    const num = Number(rawNum);
    if (!map.has(num)) {
      map.set(num, q);
    } else {
      const existing = map.get(num);
      if (!existing.selectedOption && q.selectedOption) {
        map.set(num, q);
      } else if (q.selectedOption && existing.selectedOption && (q.timeTaken || 0) > (existing.timeTaken || 0)) {
        map.set(num, q);
      }
      if (!existing.questionText && q.questionText) {
        existing.questionText = q.questionText;
        existing.options = q.options;
        existing.correctAnswer = q.correctAnswer;
        existing.isCorrect = q.isCorrect;
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => Number(a.questionNumber) - Number(b.questionNumber));
}

// ─── START / CREATE a new attempt ───────────────────────────
export const startAttempt = async (req, res) => {
  try {
    const { userId, examId, examVersionId, subjectId, type, source, totalQuestions, board } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    // Only the owner may start an attempt for a user (admins exempt).
    if (req.user?.role !== "admin" && String(userId) !== String(req.user?.userId)) {
      return res.status(403).json({ message: "You can only start attempts for yourself." });
    }

    // ── One-attempt-per-exam guard ────────────────────────────────
    // If a completed attempt already exists for this user + specific exam/version/board,
    // block a new attempt. Only enforced for mock_exam source.
    if (examId && (source === 'mock_exam' || type === 'mock_exam')) {
      const guardFilter = {
        user: userId,
        exam: examId,
        isCompleted: true,
      };
      if (examVersionId) {
        guardFilter.examVersion = examVersionId;
      }
      if (board && board !== 'undefined' && board !== 'null') {
        guardFilter.board = board;
      }
      if (subjectId) {
        guardFilter.subject = subjectId;
      }

      const existingCompleted = await QuizAttempt.findOne(guardFilter);
      if (existingCompleted) {
        return res.status(409).json({
          message: "You have already completed this mock exam. Each exam can only be attempted once.",
          existingAttemptId: existingCompleted._id,
        });
      }
    }

    // Deactivate any existing active attempt for this user + type + exam
    await QuizAttempt.updateMany(
      { user: userId, isActive: true, ...(examId ? { exam: examId } : {}) },
      { isActive: false }
    );

    const attempt = new QuizAttempt({
      user: userId,
      exam: examId || undefined,
      examVersion: examVersionId || undefined,
      subject: subjectId || undefined,
      board: board || null,
      type: type || "practice",
      source: source || "question_center",
      totalQuestions: totalQuestions || 0,
      startedAt: new Date(),
      isActive: true,
      isCompleted: false,
    });

    await attempt.save();

    await invalidatePrefix('cache:quiz-attempt');

    // Populate exam name for response
    const populated = await QuizAttempt.findById(attempt._id)
      .populate("exam", "name")
      .populate("examVersion", "examVersion");

    res.status(201).json(populated);
  } catch (err) {
    console.error("Error starting attempt:", err);
    res.status(500).json({ message: "Unable to start attempt", error: err.message });
  }
};

// ─── SAVE / UPDATE a single answer ──────────────────────────
export const saveAnswer = async (req, res) => {
  try {
    const { attemptId, questionNumber, selectedOption, timeTaken } = req.body;

    if (!attemptId || questionNumber === undefined || questionNumber === null) {
      return res.status(400).json({ message: "attemptId and questionNumber are required" });
    }

    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    // Only the owner may modify an attempt (admins exempt).
    if (req.user?.role !== "admin" && String(attempt.user) !== String(req.user?.userId)) {
      return res.status(403).json({ message: "You can only modify your own attempts." });
    }

    if (attempt.isCompleted) {
      return res.status(400).json({ message: "Cannot modify a completed attempt" });
    }

    // Fetch correct answer from the question bank
    let correctAnswer = null;
    let questionText = "";
    let questionOptions = {};

    const bankQ = await findQuestionFromBank(
      attempt.exam, attempt.examVersion, attempt.subject, questionNumber, attempt.board
    );
    if (bankQ) {
      correctAnswer = bankQ.correctAnswer;
      questionText = bankQ.questionText;
      questionOptions = bankQ.questionOptions;
    }

    const isCorrect =
      selectedOption !== null && selectedOption !== undefined && selectedOption !== ""
        ? String(selectedOption) === String(correctAnswer)
        : null;

    // Find and update or add the question response
    const existingIndex = attempt.questions.findIndex(
      (q) => Number(q.questionNumber) === Number(questionNumber)
    );

    if (existingIndex >= 0) {
      const prevSelected = attempt.questions[existingIndex].selectedOption;
      const prevCorrect = attempt.questions[existingIndex].isCorrect;

      attempt.questions[existingIndex].selectedOption = selectedOption;
      attempt.questions[existingIndex].isCorrect = isCorrect;
      if (correctAnswer)
        attempt.questions[existingIndex].correctAnswer = correctAnswer;
      if (questionText)
        attempt.questions[existingIndex].questionText = questionText;
      if (Object.keys(questionOptions).length > 0)
        attempt.questions[existingIndex].options = questionOptions;
      if (timeTaken !== undefined)
        attempt.questions[existingIndex].timeTaken = timeTaken;

      // Update aggregate counts
      if (prevCorrect === true && isCorrect !== true) {
        attempt.correctCount = Math.max(0, attempt.correctCount - 1);
      }
      if (prevCorrect === false && prevCorrect !== isCorrect) {
        attempt.incorrectCount = Math.max(0, attempt.incorrectCount - 1);
      }
    } else {
      attempt.questions.push({
        questionNumber,
        questionText,
        options: questionOptions,
        selectedOption,
        correctAnswer,
        isCorrect,
        timeTaken: timeTaken || 0,
      });
    }

    // Recalculate correct/incorrect counts from scratch for accuracy
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    for (const q of attempt.questions) {
      if (q.isCorrect === true) correctCount++;
      else if (q.isCorrect === false) incorrectCount++;
      else unansweredCount++;
    }

    // Also count questions not yet answered
    const totalKnown = attempt.totalQuestions || attempt.questions.length;
    const answeredCount = correctCount + incorrectCount;
    unansweredCount = Math.max(0, totalKnown - answeredCount);

    attempt.correctCount = correctCount;
    attempt.incorrectCount = incorrectCount;
    attempt.unansweredCount = unansweredCount;
    attempt.totalQuestions = Math.max(totalKnown, answeredCount);
    attempt.score = correctCount;
    attempt.percentage =
      attempt.totalQuestions > 0
        ? Math.round((correctCount / attempt.totalQuestions) * 100)
        : 0;
    attempt.timeTaken = timeTaken || attempt.timeTaken;

    await attempt.save();

    res.status(200).json({
      message: "Answer saved",
      attempt: {
        _id: attempt._id,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        correctCount: attempt.correctCount,
        incorrectCount: attempt.incorrectCount,
        unansweredCount: attempt.unansweredCount,
        percentage: attempt.percentage,
        isCompleted: attempt.isCompleted,
      },
    });
  } catch (err) {
    console.error("Error saving answer:", err);
    res.status(500).json({ message: "Unable to save answer", error: err.message });
  }
};

// ─── BATCH SAVE answers ─────────────────────────────────────
export const batchSaveAnswers = async (req, res) => {
  try {
    const { attemptId, answers } = req.body;

    if (!attemptId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "attemptId and answers array are required" });
    }

    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    // Only the owner may modify an attempt (admins exempt).
    if (req.user?.role !== "admin" && String(attempt.user) !== String(req.user?.userId)) {
      return res.status(403).json({ message: "You can only modify your own attempts." });
    }

    // Process each answer
    for (const answer of answers) {
      const { questionNumber, selectedOption, timeTaken } = answer;

      let correctAnswer = null;
      let questionText = "";
      let questionOptions = {};

      const bankQ = await findQuestionFromBank(
        attempt.exam, attempt.examVersion, attempt.subject, questionNumber, attempt.board
      );
      if (bankQ) {
        correctAnswer = bankQ.correctAnswer;
        questionText = bankQ.questionText;
        questionOptions = bankQ.questionOptions;
      }

      const isCorrect =
        selectedOption !== null && selectedOption !== undefined && selectedOption !== ""
          ? String(selectedOption) === String(correctAnswer)
          : null;

      const existingIndex = attempt.questions.findIndex(
        (q) => Number(q.questionNumber) === Number(questionNumber)
      );

      if (existingIndex >= 0) {
        attempt.questions[existingIndex].selectedOption = selectedOption;
        attempt.questions[existingIndex].isCorrect = isCorrect;
        if (correctAnswer)
          attempt.questions[existingIndex].correctAnswer = correctAnswer;
        if (questionText)
          attempt.questions[existingIndex].questionText = questionText;
        if (Object.keys(questionOptions).length > 0)
          attempt.questions[existingIndex].options = questionOptions;
        if (timeTaken !== undefined)
          attempt.questions[existingIndex].timeTaken = timeTaken;
      } else {
        attempt.questions.push({
          questionNumber,
          questionText,
          options: questionOptions,
          selectedOption,
          correctAnswer,
          isCorrect,
          timeTaken: timeTaken || 0,
        });
      }
    }

    // Deduplicate any duplicates before saving
    attempt.questions = deduplicateQuestions(attempt.questions);

    // Recalculate all counts
    let correctCount = 0;
    let incorrectCount = 0;
    for (const q of attempt.questions) {
      if (q.isCorrect === true) correctCount++;
      else if (q.isCorrect === false) incorrectCount++;
    }

    // Recalculate totalQuestions from actual questions array
    attempt.totalQuestions = attempt.questions.length || attempt.totalQuestions;
    attempt.correctCount = correctCount;
    attempt.incorrectCount = incorrectCount;
    attempt.unansweredCount = Math.max(0, attempt.totalQuestions - correctCount - incorrectCount);
    attempt.score = correctCount;
    attempt.percentage =
      attempt.totalQuestions > 0
        ? Math.round((correctCount / attempt.totalQuestions) * 100)
        : 0;
    // Sum per-question times for attempt-level duration, but never let the
    // client-reported sum exceed real wall-clock elapsed time (clients can
    // report overlapping per-question windows that inflate the total).
    const totalTime = attempt.questions.reduce((sum, q) => sum + (q.timeTaken || 0), 0);
    if (totalTime > 0) {
      const wallClockSeconds = Math.max(
        1,
        Math.round((Date.now() - new Date(attempt.startedAt).getTime()) / 1000)
      );
      attempt.timeTaken = Math.min(totalTime, wallClockSeconds);
    }

    await attempt.save();

    res.status(200).json({
      message: "Answers saved",
      attempt: {
        _id: attempt._id,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        correctCount: attempt.correctCount,
        incorrectCount: attempt.incorrectCount,
        unansweredCount: attempt.unansweredCount,
        percentage: attempt.percentage,
        isCompleted: attempt.isCompleted,
      },
    });
  } catch (err) {
    console.error("Error batch saving answers:", err);
    res.status(500).json({ message: "Unable to save answers", error: err.message });
  }
};

// ─── COMPLETE an attempt ────────────────────────────────────
export const completeAttempt = async (req, res) => {
  try {
    const { attemptId } = req.body;
    const { id } = req.params;

    const targetId = attemptId || id;

    if (!targetId) {
      return res.status(400).json({ message: "attemptId is required" });
    }

    const attempt = await QuizAttempt.findById(targetId)
      .populate("exam", "name")
      .populate("examVersion", "examVersion")
      .populate("user", "username email");

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    // Only the owner may complete an attempt (admins exempt).
    if (req.user?.role !== "admin" && String(attempt.user?._id || attempt.user) !== String(req.user?.userId)) {
      return res.status(403).json({ message: "You can only complete your own attempts." });
    }

    if (attempt.isCompleted) {
      return res.status(400).json({ message: "Attempt already completed", attempt });
    }

    // Deduplicate questions before final calculation
    attempt.questions = deduplicateQuestions(attempt.questions);

    // Final recalculation
    let correctCount = 0;
    let incorrectCount = 0;
    for (const q of attempt.questions) {
      if (q.isCorrect === true) correctCount++;
      else if (q.isCorrect === false) incorrectCount++;
    }

    // Ensure totalQuestions matches actual question count from the attempt
    attempt.totalQuestions = attempt.questions.length || attempt.totalQuestions;
    attempt.correctCount = correctCount;
    attempt.incorrectCount = incorrectCount;
    attempt.unansweredCount = Math.max(0, attempt.totalQuestions - correctCount - incorrectCount);
    attempt.score = correctCount;
    attempt.percentage =
      attempt.totalQuestions > 0
        ? Math.round((correctCount / attempt.totalQuestions) * 100)
        : 0;
    attempt.isCompleted = true;
    attempt.isActive = false;
    attempt.completedAt = new Date();

    // Set total timeTaken: sum of per-question times capped at wall-clock
    // elapsed (client-reported sums can overlap and overstate), or fallback
    // to wall-clock itself.
    const wallClockSeconds = Math.max(
      1,
      Math.round((new Date() - new Date(attempt.startedAt)) / 1000)
    );
    const totalTime = attempt.questions.reduce((sum, q) => sum + (q.timeTaken || 0), 0);
    attempt.timeTaken = totalTime > 0
      ? Math.min(totalTime, wallClockSeconds)
      : wallClockSeconds;

    await attempt.save();

    await invalidatePrefix('cache:quiz-attempt');

    // Performance data is now computed from QuizAttempt on-the-fly by
    // getQuizOverview. The old UserData mockExam/questionPreatise dual-write
    // has been removed to prevent sync issues.

    res.status(200).json({
      message: "Attempt completed",
      attempt: {
        _id: attempt._id,
        user: attempt.user,
        exam: attempt.exam,
        examVersion: attempt.examVersion,
        type: attempt.type,
        source: attempt.source,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        correctCount: attempt.correctCount,
        incorrectCount: attempt.incorrectCount,
        unansweredCount: attempt.unansweredCount,
        percentage: attempt.percentage,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        timeTaken: attempt.timeTaken,
        questions: attempt.questions,
      },
    });
  } catch (err) {
    console.error("Error completing attempt:", err);
    res.status(500).json({ message: "Unable to complete attempt", error: err.message });
  }
};

// ─── GET active attempt for a user ──────────────────────────
export const getActiveAttempt = async (req, res) => {
  try {
    const { userId, examId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const filter = { user: userId, isActive: true };
    if (examId) filter.exam = examId;

    const attempt = await QuizAttempt.findOne(filter)
      .populate("exam", "name")
      .populate("examVersion", "examVersion");

    res.status(200).json(attempt);
  } catch (err) {
    console.error("Error fetching active attempt:", err);
    res.status(500).json({ message: "Unable to fetch active attempt" });
  }
};

// ─── GET performance overview (dashboard at-a-glance) ────────
// Aggregates the user's completed quiz attempts across ALL their exams and
// subjects. This is the reliable source of truth for the dashboard because it
// is recorded for every quiz the user finishes, independent of the AI report
// (which is generated once per day from QuizPerformance records).
export const getQuizOverview = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    // ── Single aggregation pipeline: computes everything in MongoDB ──
    const [aggregated] = await QuizAttempt.aggregate([
      { $match: { user: userId, isCompleted: true } },

      // Unwind questions to count per-question results
      { $unwind: { path: "$questions", preserveNullAndEmptyArrays: false } },

      // Classify each question response
      {
        $addFields: {
          "questions._answered": {
            $or: [
              { $eq: ["$questions.isCorrect", true] },
              { $eq: ["$questions.isCorrect", false] },
            ],
          },
          "questions._correct": { $eq: ["$questions.isCorrect", true] },
          "questions._incorrect": { $eq: ["$questions.isCorrect", false] },
        },
      },

      // Group by user (overall)
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          // Use first attempt's exam/subject since we unwind per-question
          examId: { $first: "$exam" },
          subjectId: { $first: "$subject" },
          // Collect per-attempt data for exam grouping
          attemptData: {
            $push: {
              attemptId: "$_id",
              exam: "$exam",
              subject: "$subject",
              correct: { $sum: { $cond: ["$questions._correct", 1, 0] } },
              incorrect: { $sum: { $cond: ["$questions._incorrect", 1, 0] } },
              answered: { $sum: { $cond: ["$questions._answered", 1, 0] } },
            },
          },
          overallCorrect: { $sum: { $cond: ["$questions._correct", 1, 0] } },
          overallIncorrect: { $sum: { $cond: ["$questions._incorrect", 1, 0] } },
          overallAnswered: { $sum: { $cond: ["$questions._answered", 1, 0] } },
        },
      },

      // Second stage: build exam-level aggregation
      {
        $facet: {
          overall: [
            {
              $project: {
                _id: 0,
                attempts: "$totalAttempts",
                questions: "$overallAnswered",
                correct: "$overallCorrect",
                incorrect: "$overallIncorrect",
                accuracy: {
                  $cond: [
                    { $gt: ["$overallAnswered", 0] },
                    { $round: [{ $multiply: [{ $divide: ["$overallCorrect", "$overallAnswered"] }, 100] }, 1] },
                    0,
                  ],
                },
              },
            },
          ],
          byExam: [
            { $unwind: "$attemptData" },
            {
              $group: {
                _id: "$attemptData.exam",
                attempts: { $sum: 1 },
                questions: { $sum: "$attemptData.answered" },
                correct: { $sum: "$attemptData.correct" },
                incorrect: { $sum: "$attemptData.incorrect" },
              },
            },
            {
              $lookup: {
                from: "exams",
                localField: "_id",
                foreignField: "_id",
                as: "examDoc",
              },
            },
            { $unwind: { path: "$examDoc", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 0,
                examId: "$_id",
                examName: { $ifNull: ["$examDoc.name", "Unknown"] },
                attempts: 1,
                questions: 1,
                correct: 1,
                incorrect: 1,
                accuracy: {
                  $cond: [
                    { $gt: ["$questions", 0] },
                    { $round: [{ $multiply: [{ $divide: ["$correct", "$questions"] }, 100] }, 1] },
                    0,
                  ],
                },
              },
            },
            { $sort: { accuracy: -1 } },
          ],
        },
      },
    ]);

    const overall = aggregated?.overall?.[0] || { attempts: 0, questions: 0, correct: 0, incorrect: 0, accuracy: 0 };
    const byExam = aggregated?.byExam || [];

    // ── Subject breakdown: unwind from per-attempt grouping ──
    const subjectAgg = await QuizAttempt.aggregate([
      { $match: { user: userId, isCompleted: true } },
      { $unwind: "$questions" },
      { $match: { "questions.isCorrect": { $ne: null } } },
      {
        $lookup: {
          from: "subjects",
          localField: "subject",
          foreignField: "_id",
          as: "subjectDoc",
        },
      },
      { $unwind: { path: "$subjectDoc", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$subject",
          subject: { $first: { $ifNull: ["$subjectDoc.name", "General"] } },
          attempted: { $sum: 1 },
          correct: { $sum: { $cond: [{ $eq: ["$questions.isCorrect", true] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          subject: 1,
          attempted: 1,
          correct: 1,
          accuracy: {
            $cond: [
              { $gt: ["$attempted", 0] },
              { $round: [{ $multiply: [{ $divide: ["$correct", "$attempted"] }, 100] }, 1] },
              0,
            ],
          },
          isWeak: {
            $lt: [{ $round: [{ $multiply: [{ $divide: ["$correct", "$attempted"] }, 100] }, 1] }, 60],
          },
          isCritical: {
            $lt: [{ $round: [{ $multiply: [{ $divide: ["$correct", "$attempted"] }, 100] }, 1] }, 40],
          },
        },
      },
      { $sort: { accuracy: -1 } },
    ]);

    res.status(200).json({ overall, byExam, bySubject: subjectAgg });
  } catch (err) {
    console.error("Error building quiz overview:", err);
    res.status(500).json({ message: "Unable to build quiz overview" });
  }
};

// ─── GET weekly activity (for the dashboard chart) ────────────
// Returns the user's completed attempts from the last 8 days with only the
// fields the chart needs. The client buckets them into its own local week
// (Mon–Sun) so day labels are correct in the user's timezone.
export const getWeeklyActivity = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    // 8 days of slack covers any timezone offset from the client's local week.
    const since = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);

    const attempts = await QuizAttempt.find({
      user: userId,
      isCompleted: true,
      createdAt: { $gte: since },
    })
      .select("createdAt percentage totalQuestions correctCount type source")
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({ attempts });
  } catch (err) {
    console.error("Error fetching weekly activity:", err);
    res.status(500).json({ message: "Unable to fetch weekly activity" });
  }
};

// ─── GET attempts by user ───────────────────────────────────
export const getUserAttempts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, source, limit } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const filter = { user: userId };
    if (type) filter.type = type;
    if (source) filter.source = source;

    const attempts = await QuizAttempt.find(filter)
      .populate("exam", "name image")
      .populate("examVersion", "examVersion")
      .sort({ createdAt: -1 })
      .limit(limit ? parseInt(limit) : 50);

    res.status(200).json(attempts);
  } catch (err) {
    console.error("Error fetching user attempts:", err);
    res.status(500).json({ message: "Unable to fetch attempts" });
  }
};

// ─── GET single attempt by ID ───────────────────────────────
export const getAttemptById = async (req, res) => {
  try {
    const { id } = req.params;

    const attempt = await QuizAttempt.findById(id)
      .populate("exam", "name image")
      .populate("examVersion", "examVersion")
      .populate("user", "name username email phone division district");

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    // Only the owner may read an attempt (admins exempt).
    if (req.user?.role !== "admin" && String(attempt.user?._id || attempt.user) !== String(req.user?.userId)) {
      return res.status(403).json({ message: "You can only view your own attempts." });
    }

    // Enrich: compute accurate counts and timeTaken from questions array
    const obj = attempt.toObject();
    obj.questions = deduplicateQuestions(obj.questions || []);
    const correctCount = (obj.questions || []).filter((q) => q.isCorrect === true).length;
    const incorrectCount = (obj.questions || []).filter((q) => q.isCorrect === false).length;
    const totalQ = obj.questions?.length || obj.totalQuestions || 0;
    const timeTaken = obj.timeTaken || (obj.questions || []).reduce((sum, q) => sum + (q.timeTaken || 0), 0);
    obj.correctCount = correctCount;
    obj.incorrectCount = incorrectCount;
    obj.unansweredCount = Math.max(0, totalQ - correctCount - incorrectCount);
    obj.totalQuestions = totalQ;
    obj.score = correctCount;
    obj.percentage = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;
    obj.timeTaken = timeTaken;

    res.status(200).json(obj);
  } catch (err) {
    console.error("Error fetching attempt:", err);
    res.status(500).json({ message: "Unable to fetch attempt" });
  }
};

// ─── GET all attempts as CSV (admin export) ─────────────────
export const exportAttemptsCsv = async (req, res) => {
  try {
    const { type, examId, userId } = req.query;
    const filter = { isCompleted: true };
    if (type) filter.type = type;
    if (examId) filter.exam = examId;
    if (userId) filter.user = userId;

    const attempts = await QuizAttempt.find(filter)
      .populate("user", "username email")
      .populate("exam", "name")
      .lean();

    const headers = ['user', 'email', 'exam', 'type', 'source', 'score', 'totalQuestions', 'correctCount', 'incorrectCount', 'unansweredCount', 'percentage', 'startedAt', 'completedAt', 'isCompleted'];
    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = attempts.map((a) =>
      headers.map((h) => {
        switch (h) {
          case 'user': return escape(a.user?.username || a.user?._id || '');
          case 'email': return escape(a.user?.email || '');
          case 'exam': return escape(a.exam?.name || '');
          case 'startedAt': return escape(a.startedAt?.toISOString?.() || a.startedAt || '');
          case 'completedAt': return escape(a.completedAt?.toISOString?.() || a.completedAt || '');
          default: return escape(a[h]);
        }
      }).join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="quiz-attempts.csv"');
    res.status(200).send(csv);
  } catch (err) {
    console.error("Error exporting attempts:", err);
    res.status(500).json({ message: "Unable to export attempts" });
  }
};

// ─── GET all attempts (admin) ───────────────────────────────
export const getAllAttempts = async (req, res) => {
  try {
    const { type, examId, userId, page = 1, limit = 20 } = req.query;

    const filter = { isCompleted: true };
    if (type) filter.type = type;
    if (examId) filter.exam = examId;
    if (userId) filter.user = userId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [attempts, total] = await Promise.all([
      QuizAttempt.find(filter)
        .populate("user", "name username email phone division district")
        .populate("exam", "name image")
        .populate("examVersion", "examVersion")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      QuizAttempt.countDocuments(filter),
    ]);

    const summary = await QuizAttempt.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          avgPercentage: { $avg: "$percentage" },
          completedAttempts: {
            $sum: { $cond: ["$isCompleted", 1, 0] },
          },
        },
      },
    ]);

    // Enrich attempts: compute timeTaken from questions if stale, ensure counts are accurate
    const enrichedAttempts = attempts.map((a) => {
      const cleanQuestions = deduplicateQuestions(a.questions || []);
      const correctCount = cleanQuestions.filter((q) => q.isCorrect === true).length;
      const incorrectCount = cleanQuestions.filter((q) => q.isCorrect === false).length;
      const totalQ = cleanQuestions.length || a.totalQuestions || 0;
      const timeTaken = a.timeTaken || cleanQuestions.reduce((sum, q) => sum + (q.timeTaken || 0), 0);
      return {
        ...a,
        questions: cleanQuestions,
        correctCount,
        incorrectCount,
        totalQuestions: totalQ,
        score: correctCount,
        percentage: totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0,
        timeTaken,
      };
    });

    res.status(200).json({
      attempts: enrichedAttempts,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      summary: summary[0] || {
        totalAttempts: 0,
        avgPercentage: 0,
        completedAttempts: 0,
      },
    });
  } catch (err) {
    console.error("Error fetching all attempts:", err);
    res.status(500).json({ message: "Unable to fetch attempts" });
  }
};
