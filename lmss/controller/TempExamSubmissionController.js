import TempExamSubmission from "../models/TempExamSubmission.js";

// ─── SAVE or UPDATE Temporary Exam Submission ────────────────
export const saveTempSubmission = async (req, res) => {
  try {
    const {
      userId,
      examId,
      examVersionId,
      scheduleExamId,
      subjectId,
      board,
      paperType,
      selectedAnswers,
      submittedAnswers,
      rollDigits,
      candidateName,
      subjectDigits,
      paperCode,
      extraDigits,
      setDigits,
      timeLeft,
      attemptId,
    } = req.body;

    const targetUserId = userId || req.user?.userId;
    if (!targetUserId) {
      return res.status(400).json({ message: "userId is required" });
    }

    if (!examId) {
      return res.status(400).json({ message: "examId is required" });
    }

    // Only the owner may save temporary progress (admins exempt)
    if (req.user?.role !== "admin" && String(targetUserId) !== String(req.user?.userId)) {
      return res.status(403).json({ message: "You can only save your own exam submissions." });
    }

    const filter = {
      user: targetUserId,
      exam: examId,
    };
    if (examVersionId) {
      filter.examVersion = examVersionId;
    }
    if (board && board !== "undefined" && board !== "null") {
      filter.board = board;
    }

    const update = {
      user: targetUserId,
      exam: examId,
      examVersion: examVersionId || null,
      scheduleExam: scheduleExamId || null,
      subject: subjectId || null,
      board: board || null,
      paperType: paperType || null,
      selectedAnswers: selectedAnswers || {},
      submittedAnswers: Array.isArray(submittedAnswers) ? submittedAnswers : [],
      rollDigits: Array.isArray(rollDigits) ? rollDigits : [],
      candidateName: candidateName || "",
      subjectDigits: Array.isArray(subjectDigits) ? subjectDigits : [],
      paperCode: paperCode !== undefined ? paperCode : null,
      extraDigits: Array.isArray(extraDigits) ? extraDigits : [],
      setDigits: Array.isArray(setDigits) ? setDigits : [],
      timeLeft: typeof timeLeft === "number" ? timeLeft : null,
      attemptId: attemptId || null,
    };

    const submission = await TempExamSubmission.findOneAndUpdate(
      filter,
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      message: "Temporary submission saved successfully",
      submission,
    });
  } catch (err) {
    console.error("Error saving temporary exam submission:", err);
    res.status(500).json({ message: "Unable to save temporary exam submission", error: err.message });
  }
};

// ─── GET Temporary Exam Submission ───────────────────────────
export const getTempSubmission = async (req, res) => {
  try {
    const { userId, examId, versionId, board } = req.query;
    const targetUserId = userId || req.user?.userId;

    if (!targetUserId) {
      return res.status(400).json({ message: "userId is required" });
    }

    if (!examId) {
      return res.status(400).json({ message: "examId is required" });
    }

    // Only the owner may read their temporary submission (admins exempt)
    if (req.user?.role !== "admin" && String(targetUserId) !== String(req.user?.userId)) {
      return res.status(403).json({ message: "You can only view your own temporary exam submissions." });
    }

    const filter = {
      user: targetUserId,
      exam: examId,
    };
    if (versionId) {
      filter.examVersion = versionId;
    }
    if (board && board !== "undefined" && board !== "null") {
      filter.board = board;
    }

    const submission = await TempExamSubmission.findOne(filter);

    res.status(200).json(submission || null);
  } catch (err) {
    console.error("Error retrieving temporary exam submission:", err);
    res.status(500).json({ message: "Unable to get temporary exam submission", error: err.message });
  }
};

// ─── DELETE Temporary Exam Submission ────────────────────────
export const deleteTempSubmission = async (req, res) => {
  try {
    const targetUserId = req.query.userId || req.body.userId || req.user?.userId;
    const examId = req.query.examId || req.body.examId;
    const versionId = req.query.versionId || req.body.versionId;
    const board = req.query.board || req.body.board;

    if (!targetUserId) {
      return res.status(400).json({ message: "userId is required" });
    }

    if (!examId) {
      return res.status(400).json({ message: "examId is required" });
    }

    // Only the owner may delete their temporary submission (admins exempt)
    if (req.user?.role !== "admin" && String(targetUserId) !== String(req.user?.userId)) {
      return res.status(403).json({ message: "You can only delete your own temporary exam submissions." });
    }

    const filter = {
      user: targetUserId,
      exam: examId,
    };
    if (versionId) {
      filter.examVersion = versionId;
    }
    if (board && board !== "undefined" && board !== "null") {
      filter.board = board;
    }

    await TempExamSubmission.deleteMany(filter);

    res.status(200).json({ message: "Temporary exam submission deleted successfully" });
  } catch (err) {
    console.error("Error deleting temporary exam submission:", err);
    res.status(500).json({ message: "Unable to delete temporary exam submission", error: err.message });
  }
};
