import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        code: {
            type: String,
            trim: true,
        },
        // Optional location info (e.g. "Dhaka")
        location: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

// College names are global (not scoped to an exam like Subject)
collegeSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

const College = mongoose.model("College", collegeSchema);
export default College;
