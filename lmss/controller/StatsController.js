import QuestionStat, { calculateDifficulty, formatAvgTime } from "../models/QuestionStat.js";

/**
 * Record an attempt or batch of attempts on question(s).
 * Body can be:
 * - Single item: { questionId, questionDocId, isCorrect, timeTaken, selectedOption }
 * - Array: { questions: [ { questionId, questionDocId, isCorrect, timeTaken, selectedOption }, ... ] }
 */
export const recordQuestionStats = async (req, res) => {
  try {
    const payload = req.body;
    const items = Array.isArray(payload.questions)
      ? payload.questions
      : payload.questionId
      ? [payload]
      : [];

    if (items.length === 0) {
      return res.status(400).json({ message: "No question data provided to record stats" });
    }

    const results = [];

    for (const item of items) {
      const {
        questionId,
        questionDocId,
        isCorrect,
        timeTaken = 0,
        selectedOption,
      } = item;

      if (!questionId) continue;

      const qId = String(questionId);
      const timeNum = Number(timeTaken) || 0;
      const isCorr = Boolean(isCorrect);

      // Find or create
      let stat = await QuestionStat.findOne({ questionId: qId });
      if (!stat) {
        stat = new QuestionStat({
          questionId: qId,
          questionDocId: questionDocId || null,
          totalAttempts: 0,
          correctCount: 0,
          incorrectCount: 0,
          totalTimeSpent: 0,
          optionCounts: {},
        });
      }

      stat.totalAttempts += 1;
      if (isCorr) {
        stat.correctCount += 1;
      } else {
        stat.incorrectCount += 1;
      }

      stat.totalTimeSpent += timeNum;
      stat.lastAttemptedAt = new Date();

      if (selectedOption) {
        const optKey = String(selectedOption);
        const currentCount = stat.optionCounts.get(optKey) || 0;
        stat.optionCounts.set(optKey, currentCount + 1);
      }

      // Recompute derived fields
      stat.accuracyPercentage = Math.round((stat.correctCount / stat.totalAttempts) * 100);
      stat.difficulty = calculateDifficulty(stat.correctCount, stat.totalAttempts);
      stat.averageTime = formatAvgTime(stat.totalTimeSpent, stat.totalAttempts);

      await stat.save();
      results.push(stat);
    }

    return res.status(200).json({
      success: true,
      count: results.length,
      message: "Question stats recorded successfully",
    });
  } catch (err) {
    console.error("recordQuestionStats error:", err);
    return res.status(500).json({ message: err.message || "Failed to record question stats" });
  }
};

/**
 * Get statistics for a specific question.
 */
export const getQuestionStats = async (req, res) => {
  try {
    const { questionId } = req.params;
    if (!questionId) {
      return res.status(400).json({ message: "questionId is required" });
    }

    const stat = await QuestionStat.findOne({ questionId: String(questionId) });

    if (!stat) {
      return res.status(200).json({
        questionId,
        totalAttempts: 0,
        correctPercentage: 0,
        averageTime: "—",
        difficulty: "Medium",
        correctCount: 0,
        incorrectCount: 0,
        optionCounts: {},
      });
    }

    return res.status(200).json({
      questionId: stat.questionId,
      totalAttempts: stat.totalAttempts,
      correctPercentage: stat.accuracyPercentage,
      averageTime: stat.averageTime,
      difficulty: stat.difficulty,
      correctCount: stat.correctCount,
      incorrectCount: stat.incorrectCount,
      optionCounts: Object.fromEntries(stat.optionCounts || new Map()),
      lastAttemptedAt: stat.lastAttemptedAt,
    });
  } catch (err) {
    console.error("getQuestionStats error:", err);
    return res.status(500).json({ message: err.message || "Failed to fetch question stats" });
  }
};

/**
 * Batch get statistics for multiple questionIds.
 * Body: { questionIds: string[] }
 */
export const getBatchQuestionStats = async (req, res) => {
  try {
    const { questionIds } = req.body;
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(200).json({ stats: {} });
    }

    const stringIds = questionIds.map(String);
    const statsList = await QuestionStat.find({ questionId: { $in: stringIds } });

    const statsMap = {};

    // Initialize defaults for requested questions
    stringIds.forEach((id) => {
      statsMap[id] = {
        totalAttempts: 0,
        correctPercentage: 0,
        averageTime: "—",
        difficulty: "Medium",
        correctCount: 0,
        incorrectCount: 0,
        optionCounts: {},
      };
    });

    // Populate with real data
    statsList.forEach((stat) => {
      statsMap[stat.questionId] = {
        totalAttempts: stat.totalAttempts,
        correctPercentage: stat.accuracyPercentage,
        averageTime: stat.averageTime,
        difficulty: stat.difficulty,
        correctCount: stat.correctCount,
        incorrectCount: stat.incorrectCount,
        optionCounts: Object.fromEntries(stat.optionCounts || new Map()),
      };
    });

    return res.status(200).json({
      stats: statsMap,
    });
  } catch (err) {
    console.error("getBatchQuestionStats error:", err);
    return res.status(500).json({ message: err.message || "Failed to fetch batch stats" });
  }
};
