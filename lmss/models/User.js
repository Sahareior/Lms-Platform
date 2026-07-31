import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        required: true,
        type: String,
        unique: true
    },
    password: {
        required: true,
        type: String
    },
    name: {
        type: String
    },
    username: {
        type: String
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    },
    profilePic: {
        type: String
    },
    dateOfBirth: {
        type: Date
    },
    division: {
        type: String
    },
    district: {
        type: String
    },
    thana: {
        type: String
    },
    village: {
        type: String
    },
    postCode: {
        type: String  // kept as String to preserve leading zeros if any
    },
    fullAddress: {
        type: String
    },
    education: {
        type: String
    },
    institute: {
        type: String
    },
    targetDate: {
        type: Date
    },
    preferredCenter: {
        type: String
    },
    hearAbout: {
        type: String
    },
    notes: {
        type: String
    },
    agreed: {
        type: Boolean,
        default: false
    },
    selectedExams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
    }]
});

const User = mongoose.model('User', userSchema);
export default User;