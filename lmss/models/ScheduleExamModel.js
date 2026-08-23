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
    required: true,
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
}, { timestamps: true });

scheduleExamSchema.index({ exam: 1, status: 1 });
scheduleExamSchema.index({ endDate: 1 });

const ScheduleExam = mongoose.model('ScheduleExam', scheduleExamSchema);
export default ScheduleExam;
