import mongoose from "mongoose";

const scheduleExamSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  examVersion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExamVersion',
    required: false,
    default: null,
  },
  board: {
    type: String,
    enum: ['Barishal', 'Chattogram', 'Comilla', 'Dhaka', 'Dinajpur', 'Jessore', 'Rajshahi', 'Sylhet'],
    default: null,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number,
    default: 120, // minutes
  },
  totalQuestions: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming',
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isLevelingRandom: {
    type: Boolean,
    default: false,
  },
  generatedQuestions: [
    {
      question_number: { type: Number, required: true },
      question_text: { type: String, required: true, trim: true },
      scenario_text: { type: String, default: "" },
      image_url: { type: String, default: "" },
      options: { type: Map, of: String, required: true },
      subjectName: { type: String, default: null },
      topic: { type: String, default: null },
      correct_answer: { type: String, default: "" },
      originalQuestionId: { type: mongoose.Schema.Types.ObjectId, default: null },
      questionDocId: { type: mongoose.Schema.Types.ObjectId, default: null },
    }
  ],
}, { timestamps: true });

scheduleExamSchema.index({ exam: 1, status: 1 });
scheduleExamSchema.index({ endDate: 1 });

const ScheduleExam = mongoose.model('ScheduleExam', scheduleExamSchema);
export default ScheduleExam;
