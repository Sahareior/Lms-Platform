import mongoose from "mongoose";


const courseSchema = new mongoose.Schema({
    
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lessons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
    }],
    enrolledStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
    }
});

const CourseModel = mongoose.model('Course', courseSchema);
export default CourseModel;