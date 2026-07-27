import mongoose from "mongoose";

const userDataSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

        enrolledCourses: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        }]
    


})

const UserDataModel = mongoose.model('UserData', userDataSchema);
export default UserDataModel;