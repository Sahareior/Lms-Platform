import CourseModel from "../models/Courses.js";

const createCourse = async (req, res) => {
    const courseData = req.body;
    try {
        const newCourse = new CourseModel(courseData);
        await newCourse.save();
        res.status(201).json({ message: 'Course created successfully', course: newCourse });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

const listCourses = async (req, res) => {
    try {
        const courses = await CourseModel.find()
            .populate('lessons')
            .populate('exam')
            .populate('subjects')
            .populate('enrolledStudents', '-password -__v');
        res.status(200).json(courses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Unable to fetch courses' });
    }
}

const updateCourse = async (req, res) => {
    const { courseId } = req.params;
    const courseData = req.body;
   console.log(courseId, courseData)

    try {
        const updatedCourse = await CourseModel.findByIdAndUpdate(courseId, courseData, { new: true });
        if (!updatedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json({ message: 'Course updated successfully', course: updatedCourse });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

const getCourseById = async (req, res) => {
    const { courseId } = req.params;
    console.log('Fetching course with ID:', courseId); // Log the courseId for debugging

    try {
        const course = await CourseModel.findById(courseId)
            .populate('lessons')
            .populate('exam')
            .populate('subjects')
            .populate('enrolledStudents', '-password -__v');
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json(course);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

const getCoursesByExamId = async (req, res) => {
    const { examId } = req.params;
    console.log('Fetching courses for exam ID:', examId); // Log the examId for debugging

    try {
        const courses = await CourseModel.find({ exam: examId })
            .populate('lessons')
            .populate('exam')
            .populate('subjects')
            .populate('enrolledStudents', '-password -__v');
        if (courses.length === 0) {
            return res.status(404).json({ message: 'No courses found for this exam' });
        }
        res.status(200).json(courses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

const enrollCourse = async (req, res) => {
    const { courseId } = req.params;
    const { userId } = req.body;

    console.log('Enrolling user:', userId, 'in course:', courseId); // Log the userId and courseId for debugging

    try{
        const course = await CourseModel.findById(courseId);
        if(!course){
            return res.status(404).json({ message: 'Course not found' });
        }
        if(course.enrolledStudents.includes(userId)){
            return res.status(400).json({ message: 'User already enrolled in this course' });
        }
        course.enrolledStudents.push(userId);
        await course.save();
        res.status(200).json({ message: 'User enrolled in course successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

const getEnrolledCourses = async (req, res) => {
    const { userId } = req.params;
    console.log('Fetching enrolled courses for user ID:', userId); 
    try{
        const courses = await CourseModel.find({ enrolledStudents: userId }).populate('lessons').populate('exam').populate('subjects');
        if(courses.length === 0){
            return res.status(404).json({ message: 'No enrolled courses found for this user' });
        }
        res.status(200).json(courses);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

const deleteCourse = async (req, res) => {
    const { courseId } = req.params;
    try {
        const course = await CourseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // Remove lesson references from the course and clean up
        await CourseModel.findByIdAndDelete(courseId);
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

export { createCourse, listCourses, updateCourse, getCourseById, getCoursesByExamId, enrollCourse, getEnrolledCourses, deleteCourse };
