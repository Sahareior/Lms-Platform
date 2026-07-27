import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    exam: {
        type: String,
        required: true
    },
    data: [{
        question_number: {
            type: Number,
            required: true
        },
        question_text: {
            type: String,
            required: true
        },
        options: {
            type: Map,
            of: String,
            required: true
        },
        correct_answer: {
            type: String,
            
        }
    }]
});

const QuestionModel = mongoose.model('Questions', questionSchema);
export default QuestionModel;