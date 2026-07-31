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

const ExamVersion = mongoose.model('ExamVersion', examSchema);
export default ExamVersion;