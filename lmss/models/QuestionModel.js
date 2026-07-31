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
        options: {
            type: Map,
            of: String,
            required: true,
        },
        correct_answer: {
            type: String,
            default: "",
        },
    },
    { _id: false }
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
    exam: 1,
    examVersion: 1,
    subject: 1,
    "data.question_text": 1,
});

export default mongoose.model("Question", questionSchema);