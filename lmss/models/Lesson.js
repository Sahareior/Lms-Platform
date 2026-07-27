import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  videoUri: {
    type: String,
    required: true,
  },
  material: [{
    type: String, // URLs to materials
  }],
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  
  // NEW FIELDS:
  order: {
    type: Number,
    required: true,
    default: 0,
  },
  duration: {
    type: Number, // in minutes
    default: 0,
  },
  isPreview: {
    type: Boolean,
    default: false, // Can students preview this lesson before enrolling?
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  resources: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['PDF', 'DOC', 'PPT', 'VIDEO', 'AUDIO', 'OTHER']
    }
  }],
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
  },
  completionCriteria: {
    type: String,
    enum: ['WATCH', 'QUIZ', 'MANUAL'],
    default: 'WATCH',
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

const Lesson = mongoose.model('Lesson', lessonSchema);
export default Lesson;
