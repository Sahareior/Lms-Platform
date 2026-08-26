import mongoose from "mongoose";

const tempExamSubmissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      index: true,
    },
    examVersion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamVersion",
      default: null,
    },
    scheduleExam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ScheduleExam",
      default: null,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      default: null,
    },
    board: {
      type: String,
      default: null,
    },
    paperType: {
      type: String, // 'Type1' (OMR) or 'Type2' (Digital)
      default: null,
    },
    // Map of questionIndex (string e.g. "0", "1") -> optionIndex (number)
    selectedAnswers: {
      type: Map,
      of: Number,
      default: {},
    },
    // Detailed list of submitted answers
    submittedAnswers: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId },
        questionNumber: { type: Number },
        selectedOption: { type: String }, // e.g. "A", "B", "K", etc.
        selectedIndex: { type: Number }, // 0, 1, 2, 3
        timeTaken: { type: Number, default: 0 },
      },
    ],
    // OMR specific candidate data
    rollDigits: [{ type: String }],
    candidateName: { type: String, default: "" },
    subjectDigits: [{ type: Number, default: null }],
    paperCode: { type: Number, default: null },
    extraDigits: [{ type: Number, default: null }],
    setDigits: [{ type: Number, default: null }],

    timeLeft: { type: Number, default: null },
    attemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizAttempt",
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index for fast lookup of a user's active temp submission for an exam
tempExamSubmissionSchema.index({ user: 1, exam: 1 });
// TTL index: automatically remove abandoned temp submissions after 24 hours
tempExamSubmissionSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 86400 });

const TempExamSubmission = mongoose.model("TempExamSubmission", tempExamSubmissionSchema);
export default TempExamSubmission;
