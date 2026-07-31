import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// One note per user per lesson
noteSchema.index({ lesson: 1, user: 1 }, { unique: true });

const Note = mongoose.model('Note', noteSchema);
export default Note;
