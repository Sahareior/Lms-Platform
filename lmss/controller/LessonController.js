import mongoose from "mongoose";
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
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({ message: 'Invalid course id' });
    }
    try {
        const lessons = await Lesson.find({ course: courseId });
        res.status(200).json({ lessons });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

export const updateLesson = async (req, res) => {
    const { lessonId } = req.params;
    const lessonData = req.body;
    try {
        const updatedLesson = await Lesson.findByIdAndUpdate(lessonId, lessonData, { new: true });
        if (!updatedLesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        res.status(200).json({ message: 'Lesson updated successfully', lesson: updatedLesson });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

export const deleteLesson = async (req, res) => {
    const { lessonId } = req.params;
    try {
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        // Remove lesson reference from the course
        await CourseModel.findByIdAndUpdate(lesson.course, {
            $pull: { lessons: lessonId }
        });

        await Lesson.findByIdAndDelete(lessonId);

        res.status(200).json({ message: 'Lesson deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}
