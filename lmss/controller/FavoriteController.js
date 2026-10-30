import Favorite from "../models/Favorite.js";
import QuestionModel from "../models/QuestionModel.js";

/**
 * Toggle favorite status for a question.
 * If already favorited, removes it; if not, creates a new favorite.
 */
export const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const {
      questionId,
      questionDocId,
      exam,
      examVersion,
      subject,
      questionSnapshot,
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!questionId) {
      return res.status(400).json({ message: "questionId is required" });
    }

    const existing = await Favorite.findOne({ user: userId, questionId: String(questionId) });

    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      return res.status(200).json({
        success: true,
        favorited: false,
        questionId: String(questionId),
        message: "Question removed from favorites",
      });
    }

    let snapshot = questionSnapshot;
    let docId = questionDocId;

    // If snapshot not provided, attempt to look up from QuestionModel
    if (!snapshot && questionDocId) {
      try {
        const qDoc = await QuestionModel.findById(questionDocId);
        if (qDoc) {
          const item = qDoc.data.find(
            (d) => String(d._id) === String(questionId) || String(d.question_number) === String(questionId)
          );
          if (item) {
            snapshot = {
              questionNumber: item.question_number,
              questionText: item.question_text,
              options: item.options,
              correctAnswer: item.correct_answer,
              explanation: item.explanation || "",
            };
          }
        }
      } catch (err) {
        console.warn("Could not lookup question snapshot:", err.message);
      }
    }

    const newFavorite = await Favorite.create({
      user: userId,
      questionId: String(questionId),
      questionDocId: docId || null,
      exam: exam || null,
      examVersion: examVersion || null,
      subject: subject || null,
      questionSnapshot: snapshot || {},
    });

    return res.status(201).json({
      success: true,
      favorited: true,
      questionId: String(questionId),
      favorite: newFavorite,
      message: "Question added to favorites",
    });
  } catch (err) {
    console.error("toggleFavorite error:", err);
    return res.status(500).json({ message: err.message || "Failed to toggle favorite" });
  }
};

/**
 * Get all favorited questions for the authenticated user.
 */
export const getMyFavorites = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { exam, subject, limit = 100, page = 1 } = req.query;
    const filter = { user: userId };
    if (exam) filter.exam = exam;
    if (subject) filter.subject = subject;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [favorites, total] = await Promise.all([
      Favorite.find(filter)
        .populate("exam", "name category")
        .populate("examVersion", "examVersion")
        .populate("subject", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Favorite.countDocuments(filter),
    ]);

    return res.status(200).json({
      favorites,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
    });
  } catch (err) {
    console.error("getMyFavorites error:", err);
    return res.status(500).json({ message: err.message || "Failed to fetch favorites" });
  }
};

/**
 * Get lightweight list of favorited questionIds for fast lookups in the UI.
 */
export const getFavoriteQuestionIds = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const favorites = await Favorite.find({ user: userId }).select("questionId -_id");
    const ids = favorites.map((f) => f.questionId);

    return res.status(200).json({
      questionIds: ids,
    });
  } catch (err) {
    console.error("getFavoriteQuestionIds error:", err);
    return res.status(500).json({ message: err.message || "Failed to fetch favorite question IDs" });
  }
};
