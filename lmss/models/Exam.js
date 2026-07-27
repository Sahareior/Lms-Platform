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
    }
});

const Exam = mongoose.model('Exam', examSchema);
export default Exam;
