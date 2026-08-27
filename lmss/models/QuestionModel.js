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
        board: {
            type: String,
            enum: ['Barishal', 'Chattogram', 'Comilla', 'Dhaka', 'Dinajpur', 'Jessore', 'Rajshahi', 'Sylhet'],
            default: null,
        },
        division: {
            type: String,
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
    board: 1,
});

questionSchema.index({
    exam: 1,
    examVersion: 1,
    subject: 1,
    board: 1,
    "data.question_text": 1,
});

// Drop stale indexes from older schema versions that block multi-document uploads.
const QuestionModel = mongoose.model("Question", questionSchema);

const dropStaleIndexes = async () => {
    try {
        const collection = QuestionModel.collection;
        const indexes = await collection.indexes();
        for (const idx of indexes) {
            const name = idx.name || '';
            // Drop indexes from old schema versions (examVern typo, top-level question_number)
            if (
                name.includes('examVern') ||
                (name.includes('question_number') && !name.includes('data.question_number'))
            ) {
                console.log(`[QuestionModel] Dropping stale index: ${name}`);
                await collection.dropIndex(name);
            }
        }
    } catch (err) {
        console.warn('[QuestionModel] Index cleanup warning:', err.message);
    }
};

// Run cleanup once — handles both pre-open and already-open connections
if (mongoose.connection.readyState === 1) {
    dropStaleIndexes();
} else {
    mongoose.connection.once('open', dropStaleIndexes);
}

export default QuestionModel;