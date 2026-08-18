import mongoose from "mongoose";

const questionItemSchema = new mongoose.Schema(
    {
        question_number: {
            type: Number,
            required: true,
        },
        question_text: {
            type: String,
            required: true,
            trim: true,
        },
        scenario_text: {
            type: String,
            default: "",
        },
        image_url: {
            type: String,
            default: "",
        },
        options: {
            type: Map,
            of: String,
            required: true,
        },
        subjectName: {
            type: String,
            default: null,
        },
        topic: {
            type: String,
            default: null,
        },
        correct_answer: {
            type: String,
            default: "",
        },
    },
    { _id: true }
);

const questionSchema = new mongoose.Schema(
    {
        exam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exam",
            required: true,
        },
        examVersion: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ExamVersion",
            required: true,
        },
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            default: null,
        },
        data: {
            type: [questionItemSchema],
            required: true,
            default: [],
        },
        // Set to true once the AI question-pattern analysis has been run and
        // stored (see postQuestionPattern in QuestionController).
        analyzed: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

questionSchema.index({
    exam: 1,
    examVersion: 1,
    subject: 1,
});

questionSchema.index({
    exam: 1,
    examVersion: 1,
    subject: 1,
    "data.question_number": 1,
});

questionSchema.index({
    "data._id": 1,
});

questionSchema.index({
    exam: 1,
    examVersion: 1,
    subject: 1,
    "data.question_text": 1,
});

export default mongoose.model("Question", questionSchema);