import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
}, { timestamps: true });

subjectSchema.index({ exam: 1, name: 1 }, { unique: true });

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;
