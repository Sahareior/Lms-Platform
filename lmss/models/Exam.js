import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  description: {
    type: String
  },
    applicants: {
      type: String
    },
  category: {
    type: String,
    enum: ['academic', 'job_preparation'],
    default: 'job_preparation',
  }
});

const Exam = mongoose.model('Exam', examSchema);
export default Exam;
