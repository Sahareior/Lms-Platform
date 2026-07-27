import Lesson from "../models/Lesson.js";
import CourseModel from "../models/Courses.js";

export const createLesson = async (req, res) => {
    const lessonData = req.body;
    try {
        const course = await CourseModel.findById(lessonData.course);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const newLesson = new Lesson(lessonData);
        await newLesson.save();

        if (!course.lessons.includes(newLesson._id)) {
            course.lessons.push(newLesson._id);
            await course.save();
        }

        res.status(201).json({ message: 'Lesson created successfully', lesson: newLesson });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}


export const getLessonsByCourseId = async (req, res) => {
    const { courseId } = req.params;
    try {
        const lessons = await Lesson.find({ course: courseId });
        res.status(200).json({ lessons });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}
