import mongoose from "mongoose";

const quizPerformance = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  submittedQuestions: [   // fixed typo
    {
      questionSet: {     // reference to a question document
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
      },
      providedAnswer: { type: String, required: true },
      totalAttempted: { type: Number }
    }
  ]
}, { timestamps: true });


const quizPerform = mongoose.model('quizPerformance', quizPerformance);
export default quizPerform;
