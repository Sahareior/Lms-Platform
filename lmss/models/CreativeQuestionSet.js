import mongoose from "mongoose";

// One ক/খ/গ/ঘ sub-question of a সৃজনশীল (creative) question.
const cqPartSchema = new mongoose.Schema(
    {
        label: {
            type: String,
            required: true,
            trim: true,
        },
        text: {
            type: String,
            required: true,
            trim: true,
        },
        marks: {
            type: Number,
            default: 0,
        },
        cognitiveType: {
            type: String,
            default: "",
            trim: true,
        },
        answer: {
            type: String,
            default: "",
        },
        modelAnswers: {
            type: [String],
            default: undefined,
        },
    },
    { _id: true }
);

// Stimulus blocks vary in shape ({kind,value} text blocks, image blocks with
// ref/description/labels, ...), so they are stored losslessly as mixed docs.
const stimulusBlocksSchema = new mongoose.Schema(
    {},
    { strict: false, _id: false }
);

const creativeQuestionSetSchema = new mongoose.Schema(
    {
        // ── Classification (exam / examVersion / subject) ─────────
        exam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exam",
            required: true,
        },
        examVersion: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ExamVersion",
            default: null,
        },
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            default: null,
        },
        // Optional extra metadata shown on the Reading page.
        title: {
            type: String,
            default: "",
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },

        // ── Questions ─────────────────────────────────────────────
        questions: {
            type: [
                new mongoose.Schema(
                    {
                        // Stable id like "ch1-q1". Unique within the set
                        // (enforced manually in the controller so we can
                        // return a readable error).
                        id: {
                            type: String,
                            required: true,
                            trim: true,
                        },
                        chapterId: {
                            type: String,
                            required: true,
                            trim: true,
                        },
                        chapterNumber: {
                            type: Number,
                            required: true,
                            min: 1,
                        },
                        chapter: {
                            type: String,
                            required: true,
                            trim: true,
                        },
                        source: {
                            kind: { type: String, default: "board" },
                            board: { type: String, default: "" },
                            year: { type: String, default: "" },
                            questionNo: { type: String, default: "" },
                            raw: { type: String, default: "" },
                        },
                        type: {
                            type: String,
                            default: "cq",
                        },
                        number: {
                            type: Number,
                            required: true,
                            min: 1,
                        },
                        imageNeeded: {
                            type: Boolean,
                            default: false,
                        },
                        stimulus: {
                            type: String,
                            default: "",
                        },
                        stimulusBlocks: {
                            type: [stimulusBlocksSchema],
                            default: undefined,
                        },
                        parts: {
                            type: [cqPartSchema],
                            required: true,
                            // May be empty: some source entries are incomplete.
                            validate: (v) => Array.isArray(v),
                        },
                        answerNotes: {
                            type: String,
                            default: "",
                        },
                        answerBlocks: {
                            type: mongoose.Schema.Types.Mixed,
                            default: undefined,
                        },
                    },
                    { _id: true }
                ),
            ],
            required: true,
            default: undefined,
        },
    },
    {
        timestamps: true,
    }
);

// Fast lookup by classification; questions are always loaded as a whole set.
creativeQuestionSetSchema.index({ exam: 1, examVersion: 1, subject: 1 });
creativeQuestionSetSchema.index({ exam: 1, subject: 1 });

// Prevent duplicate question ids inside one set (readable error, no dup data).
creativeQuestionSetSchema.index(
    { _id: 1, "questions.id": 1 }
);

const CreativeQuestionSet = mongoose.model(
    "CreativeQuestionSet",
    creativeQuestionSetSchema
);

export default CreativeQuestionSet;
