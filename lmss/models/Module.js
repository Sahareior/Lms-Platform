import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Fast lookups of a course's modules (and their display order).
moduleSchema.index({ course: 1, order: 1, createdAt: 1 });

const Module = mongoose.model('Module', moduleSchema);
export default Module;
