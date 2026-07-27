import mongoose from "mongoose";

const questionPatternSchema = new mongoose.Schema({
    exam: {
        type: String,
        required: true,
        unique: true,
        trim: true
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
questionPatternSchema.index({ 'categorized_questions.topic': 1 });
questionPatternSchema.index({ 'categorized_questions.subject': 1 });


const QuestionPatternModel = mongoose.model('QuestionPattern', questionPatternSchema);

export default QuestionPatternModel;