import QuizAttempt from "../models/QuizAttempt.js";
import QuestionModel from "../models/QuestionModel.js";
import UserData from "../models/UserDataModel.js";

// ─── Helper: read question fields from a flat Question document ──────────
function findCorrectAnswer(questionDoc) {
  return questionDoc?.correct_answer || null;
}

function findQuestionText(questionDoc) {
  return questionDoc?.question_text || "";
}

function findQuestionOptions(questionDoc) {
  return questionDoc?.options || {};
}

// ─── START / CREATE a new attempt ───────────────────────────
export const startAttempt = async (req, res) => {
  try {
    const { userId, examId, examVersionId, subjectId, type, source, totalQuestions } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
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
      type: type || "practice",
      source: source || "question_center",
      totalQuestions: totalQuestions || 0,
      startedAt: new Date(),
      isActive: true,
      isCompleted: false,
    });

    await attempt.save();

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

    if (attempt.isCompleted) {
      return res.status(400).json({ message: "Cannot modify a completed attempt" });
    }

    // Fetch correct answer from the question bank
    let correctAnswer = null;
    let questionText = "";
    let questionOptions = {};

    if (attempt.exam || attempt.examVersion) {
      const filter = {};
      if (attempt.exam) filter.exam = attempt.exam;
      if (attempt.examVersion) filter.examVersion = attempt.examVersion;
      if (attempt.subject) filter.subject = attempt.subject;
      filter.question_number = questionNumber;

      const questionDoc = await QuestionModel.findOne(filter);
      if (questionDoc) {
        correctAnswer = findCorrectAnswer(questionDoc);
        questionText = findQuestionText(questionDoc);
        questionOptions = findQuestionOptions(questionDoc);
      }
    }

    const isCorrect =
      selectedOption !== null && selectedOption !== undefined && selectedOption !== ""
        ? String(selectedOption) === String(correctAnswer)
        : null;

    // Find and update or add the question response
    const existingIndex = attempt.questions.findIndex(
      (q) => q.questionNumber === questionNumber
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

    // Process each answer
    for (const answer of answers) {
      const { questionNumber, selectedOption, timeTaken } = answer;

      let correctAnswer = null;
      let questionText = "";
      let questionOptions = {};

      if (attempt.exam || attempt.examVersion) {
        const filter = {};
        if (attempt.exam) filter.exam = attempt.exam;
        if (attempt.examVersion) filter.examVersion = attempt.examVersion;
        if (attempt.subject) filter.subject = attempt.subject;
        filter.question_number = questionNumber;

        const questionDoc = await QuestionModel.findOne(filter);
        if (questionDoc) {
          correctAnswer = findCorrectAnswer(questionDoc);
          questionText = findQuestionText(questionDoc);
          questionOptions = findQuestionOptions(questionDoc);
        }
      }

      const isCorrect =
        selectedOption !== null && selectedOption !== undefined && selectedOption !== ""
          ? String(selectedOption) === String(correctAnswer)
          : null;

      const existingIndex = attempt.questions.findIndex(
        (q) => q.questionNumber === questionNumber
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

    // Recalculate all counts
    let correctCount = 0;
    let incorrectCount = 0;
    for (const q of attempt.questions) {
      if (q.isCorrect === true) correctCount++;
      else if (q.isCorrect === false) incorrectCount++;
    }

    attempt.correctCount = correctCount;
    attempt.incorrectCount = incorrectCount;
    attempt.unansweredCount = Math.max(0, attempt.totalQuestions - correctCount - incorrectCount);
    attempt.score = correctCount;
    attempt.percentage =
      attempt.totalQuestions > 0
        ? Math.round((correctCount / attempt.totalQuestions) * 100)
        : 0;

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

    if (attempt.isCompleted) {
      return res.status(400).json({ message: "Attempt already completed", attempt });
    }

    // Final recalculation
    let correctCount = 0;
    let incorrectCount = 0;
    for (const q of attempt.questions) {
      if (q.isCorrect === true) correctCount++;
      else if (q.isCorrect === false) incorrectCount++;
    }

    attempt.correctCount = correctCount;
    attempt.incorrectCount = incorrectCount;
    attempt.unansweredCount = Math.max(
      0,
      attempt.totalQuestions - correctCount - incorrectCount
    );
    attempt.score = correctCount;
    attempt.percentage =
      attempt.totalQuestions > 0
        ? Math.round((correctCount / attempt.totalQuestions) * 100)
        : 0;
    attempt.isCompleted = true;
    attempt.isActive = false;
    attempt.completedAt = new Date();

    await attempt.save();

    // ─── Update User Performance Arrays ─────────────────────────
    try {
      // Determine the performance array type based on attempt source
      const performanceType = attempt.source === "mock_exam" ? "mockExam" : "questionPreatise";

      let userData = await UserData.findOne({ user: attempt.user });
      if (!userData) {
        userData = new UserData({ user: attempt.user, mockExam: [], questionPreatise: [] });
      }

      const performanceArray = userData[performanceType];

      // Process each question response and update performance stats
      for (const q of attempt.questions) {
        const questionId = `${attempt.exam || "unknown"}-${q.questionNumber}`;
        const isCorrect = q.isCorrect === true;
        const hasAnswered = q.selectedOption !== null && q.selectedOption !== undefined;

        // Find existing entry for this question
        const existingIndex = performanceArray.findIndex(
          (item) => item.questionId === questionId || item.questionNumber === q.questionNumber
        );

        if (existingIndex >= 0) {
          // Update existing entry
          const existing = performanceArray[existingIndex];
          existing.attempts += 1;
          if (isCorrect) {
            existing.successes += 1;
          } else if (hasAnswered) {
            existing.failures += 1;
          }
          existing.lastAttemptedAt = new Date();
        } else {
          // Create new entry
          const newEntry = {
            questionId,
            questionNumber: q.questionNumber,
            questionText: q.questionText || "",
            options: q.options || {},
            correctAnswer: q.correctAnswer || null,
            attempts: 1,
            failures: isCorrect ? 0 : hasAnswered ? 1 : 0,
            successes: isCorrect ? 1 : 0,
            lastAttemptedAt: new Date(),
            examId: attempt.exam || undefined,
            examVersionId: attempt.examVersion || undefined,
            subjectId: attempt.subject || undefined,
          };
          performanceArray.push(newEntry);
        }
      }

      await userData.save();
    } catch (perfErr) {
      console.error("Error updating user performance:", perfErr);
      // Don't fail the attempt completion if performance update fails
    }

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

// ─── GET attempts by user ───────────────────────────────────
export const getUserAttempts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, limit } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const filter = { user: userId };
    if (type) filter.type = type;

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
      .populate("user", "username email phone division district");

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    res.status(200).json(attempt);
  } catch (err) {
    console.error("Error fetching attempt:", err);
    res.status(500).json({ message: "Unable to fetch attempt" });
  }
};

// ─── GET all attempts (admin) ───────────────────────────────
export const getAllAttempts = async (req, res) => {
  try {
    const { type, examId, userId, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (examId) filter.exam = examId;
    if (userId) filter.user = userId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [attempts, total] = await Promise.all([
      QuizAttempt.find(filter)
        .populate("user", "username email phone division district")
        .populate("exam", "name image")
        .populate("examVersion", "examVersion")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
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

    res.status(200).json({
      attempts,
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
