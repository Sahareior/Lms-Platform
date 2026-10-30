import mongoose from "mongoose";

const questionPatternSchema = new mongoose.Schema({
    exam: {
        type: mongoose.Schema.Types.ObjectId,
       ref: 'Exam',
       required:true
    },
    examVersion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExamVersion',
        required: false
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: false
    },
    board: {
        type: String,
        enum: ['Barishal', 'Chattogram', 'Comilla', 'Dhaka', 'Dinajpur', 'Jessore', 'Rajshahi', 'Sylhet'],
        default: null,
    },
    division: {
        type: String,
        default: null,
    },
    topics: {
        type: Map,
        of: Number,
        required: true,
        default: {}
    },
    subjects: {
        type: Map,
        of: Number,
        required: true,
        default: {}
    },
    categorized_questions: [{
        topic: {
            type: String,
            required: true,
            trim: true
        },
        subject: {
            type: String,
            required: true,
            trim: true
        }
    }]
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Create indexes for faster queries
questionPatternSchema.index({ exam: 1 });
questionPatternSchema.index({ exam: 1, examVersion: 1, subject: 1, board: 1 });
questionPatternSchema.index({ 'categorized_questions.topic': 1 });
questionPatternSchema.index({ 'categorized_questions.subject': 1 });


const QuestionPatternModel = mongoose.model('QuestionPattern', questionPatternSchema);

export default QuestionPatternModel;