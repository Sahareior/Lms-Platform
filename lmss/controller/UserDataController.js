import UserData from "../models/UserDataModel.js";

// ─── GET user quiz performance data ────────────────────────
export const getUserPerformance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.query; // "mockExam" or "questionPreatise"

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    let userData = await UserData.findOne({ user: userId });
    if (!userData) {
      // Create empty performance record
      userData = new UserData({ user: userId, mockExam: [], questionPreatise: [] });
      await userData.save();
    }

    // Return specific type or both
    if (type === "mockExam") {
      return res.status(200).json({ mockExam: userData.mockExam });
    } else if (type === "questionPreatise") {
      return res.status(200).json({ questionPreatise: userData.questionPreatise });
    }

    res.status(200).json({
      mockExam: userData.mockExam,
      questionPreatise: userData.questionPreatise,
    });
  } catch (err) {
    console.error("Error fetching user performance:", err);
    res.status(500).json({ message: "Unable to fetch user performance", error: err.message });
  }
};

// ─── SAVE quiz performance after attempt completion ─────────
// This updates the per-question stats in the user's performance arrays
export const saveQuizPerformance = async (req, res) => {
  try {
    const { userId, type, questions } = req.body;

    if (!userId || !type || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: "userId, type, and questions array are required" });
    }

    // Validate type
    if (!["mockExam", "questionPreatise"].includes(type)) {
      return res.status(400).json({ message: "type must be 'mockExam' or 'questionPreatise'" });
    }

    let userData = await UserData.findOne({ user: userId });
    if (!userData) {
      userData = new UserData({ user: userId, mockExam: [], questionPreatise: [] });
    }

    const performanceArray = userData[type];

    // Process each question from the completed attempt
    for (const q of questions) {
      const {
        questionId,
        questionNumber,
        questionText,
        options,
        correctAnswer,
        selectedOption,
        isCorrect,
        examId,
        examVersionId,
        subjectId,
      } = q;

      // Find existing entry for this question
      const existingIndex = performanceArray.findIndex(
        (item) => item.questionId === questionId || item.questionNumber === questionNumber
      );

      if (existingIndex >= 0) {
        // Update existing entry
        const existing = performanceArray[existingIndex];
        existing.attempts += 1;
        if (isCorrect) {
          existing.successes += 1;
        } else if (selectedOption !== null && selectedOption !== undefined) {
          existing.failures += 1;
        }
        existing.lastAttemptedAt = new Date();
      } else {
        // Create new entry
        const newEntry = {
          questionId: questionId || `q-${questionNumber}`,
          questionNumber,
          questionText: questionText || "",
          options: options || {},
          correctAnswer: correctAnswer || null,
          attempts: 1,
          failures: isCorrect ? 0 : selectedOption ? 1 : 0,
          successes: isCorrect ? 1 : 0,
          lastAttemptedAt: new Date(),
          examId: examId || undefined,
          examVersionId: examVersionId || undefined,
          subjectId: subjectId || undefined,
        };
        performanceArray.push(newEntry);
      }
    }

    await userData.save();

    res.status(200).json({
      message: "Quiz performance saved",
      [type]: userData[type],
    });
  } catch (err) {
    console.error("Error saving quiz performance:", err);
    res.status(500).json({ message: "Unable to save quiz performance", error: err.message });
  }
};

// ─── GET performance stats for a specific exam ─────────────
export const getExamPerformance = async (req, res) => {
  try {
    const { userId, examId } = req.params;
    const { type } = req.query; // "mockExam" or "questionPreatise"

    if (!userId || !examId) {
      return res.status(400).json({ message: "userId and examId are required" });
    }

    const userData = await UserData.findOne({ user: userId });
    if (!userData) {
      return res.status(200).json({ mockExam: [], questionPreatise: [] });
    }

    const filterByExam = (arr) => arr.filter((item) => item.examId?.toString() === examId);

    if (type === "mockExam") {
      return res.status(200).json({ mockExam: filterByExam(userData.mockExam) });
    } else if (type === "questionPreatise") {
      return res.status(200).json({ questionPreatise: filterByExam(userData.questionPreatise) });
    }

    res.status(200).json({
      mockExam: filterByExam(userData.mockExam),
      questionPreatise: filterByExam(userData.questionPreatise),
    });
  } catch (err) {
    console.error("Error fetching exam performance:", err);
    res.status(500).json({ message: "Unable to fetch exam performance", error: err.message });
  }
};

// ─── GET overall performance summary ───────────────────────
export const getPerformanceSummary = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const userData = await UserData.findOne({ user: userId });
    if (!userData) {
      return res.status(200).json({
        mockExam: { totalQuestions: 0, totalAttempts: 0, totalSuccesses: 0, totalFailures: 0, successRate: 0 },
        questionPreatise: { totalQuestions: 0, totalAttempts: 0, totalSuccesses: 0, totalFailures: 0, successRate: 0 },
      });
    }

    const calculateSummary = (arr) => {
      const totalQuestions = arr.length;
      const totalAttempts = arr.reduce((sum, q) => sum + q.attempts, 0);
      const totalSuccesses = arr.reduce((sum, q) => sum + q.successes, 0);
      const totalFailures = arr.reduce((sum, q) => sum + q.failures, 0);
      const successRate = totalAttempts > 0 ? Math.round((totalSuccesses / totalAttempts) * 100) : 0;
      return { totalQuestions, totalAttempts, totalSuccesses, totalFailures, successRate };
    };

    res.status(200).json({
      mockExam: calculateSummary(userData.mockExam),
      questionPreatise: calculateSummary(userData.questionPreatise),
    });
  } catch (err) {
    console.error("Error fetching performance summary:", err);
    res.status(500).json({ message: "Unable to fetch performance summary", error: err.message });
  }
};
