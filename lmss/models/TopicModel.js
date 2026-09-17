import mongoose from "mongoose";

const topicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  normalizedName: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: false,
  },
  subjectName: {
    type: String,
    trim: true,
    required: false,
  },
  aliases: [{
    type: String,
    trim: true,
  }],
  questionCount: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

topicSchema.index({ exam: 1, subjectName: 1, normalizedName: 1 }, { unique: true, sparse: true });
topicSchema.index({ exam: 1, normalizedName: 1 });
topicSchema.index({ exam: 1, subject: 1 });

const TopicModel = mongoose.model('Topic', topicSchema);
export default TopicModel;
