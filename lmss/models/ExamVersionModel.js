import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
    exam: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'Exam',
       required:true
    },
    examVersion: {
        type:String,
        required:true
    }
});
examSchema.index({exam:1})

examSchema.virtual('questions', {
  ref: 'Question',          // the Question model
  localField: '_id',        // ExamVersion._id
  foreignField: 'examVersion' // the field in Question documents
});

// Make sure virtuals are included when converting to JSON
examSchema.set('toObject', { virtuals: true });
examSchema.set('toJSON', { virtuals: true });

const ExamVersion = mongoose.model('ExamVersion', examSchema);
export default ExamVersion;