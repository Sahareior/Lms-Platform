import mongoose from "mongoose";
import Lesson from "../models/Lesson.js";
import CourseModel from "../models/Courses.js";
import UserData from "../models/UserDataModel.js";
import { invalidatePrefix } from "../middleware/cache.js";

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

        await invalidatePrefix('cache:lesson');
        await invalidatePrefix('cache:course');

        res.status(201).json({ message: 'Lesson created successfully', lesson: newLesson });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}


export const getLessonsByCourseId = async (req, res) => {
    const { courseId } = req.params;
    const { userId } = req.query;
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({ message: 'Invalid course id' });
    }
    try {
        const lessons = await Lesson.find({ course: courseId }).sort({ order: 1, createdAt: 1 });

        // Determine which lessons this user has completed (if logged in)
        let completedLessonIds = new Set();
        if (userId) {
            const userData = await UserData.findOne({ user: userId });
            const progressEntry = userData?.courseProgress?.find(
                (p) => p.course.toString() === courseId
            );
            completedLessonIds = new Set(
                (progressEntry?.completedLessons || []).map((id) => id.toString())
            );
        }

        const lessonsWithProgress = lessons.map((lesson) => ({
            ...lesson.toObject(),
            isCompleted: completedLessonIds.has(lesson._id.toString()),
        }));
        res.status(200).json({ lessons: lessonsWithProgress });
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
        await invalidatePrefix('cache:lesson');
        res.status(200).json({ message: 'Lesson updated successfully', lesson: updatedLesson });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

export const markLessonComplete = async (req, res) => {
    const { userId, courseId, lessonId } = req.body;
    if (!userId || !courseId || !lessonId) {
        return res.status(400).json({ message: 'userId, courseId and lessonId are required' });
    }
    if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(lessonId)) {
        return res.status(400).json({ message: 'Invalid course or lesson id' });
    }
    try {
        const [course, lesson] = await Promise.all([
            CourseModel.findById(courseId),
            Lesson.findById(lessonId),
        ]);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        let userData = await UserData.findOne({ user: userId });
        if (!userData) {
            userData = new UserData({ user: userId, mockExam: [], questionPreatise: [] });
        }

        // Find (or create) the progress entry for this course
        let progressEntry = userData.courseProgress.find(
            (p) => p.course.toString() === courseId
        );
        if (!progressEntry) {
            progressEntry = { course: courseId, completedLessons: [] };
            userData.courseProgress.push(progressEntry);
        }

        // Avoid duplicate entries
        const alreadyCompleted = progressEntry.completedLessons.some(
            (id) => id.toString() === lessonId
        );
        if (!alreadyCompleted) {
            progressEntry.completedLessons.push(lessonId);
        }

        await userData.save();

        await invalidatePrefix('cache:lesson');
        await invalidatePrefix('cache:course-enrolled');

        res.status(200).json({
            message: 'Lesson marked as complete',
            courseId,
            completedLessons: progressEntry.completedLessons,
        });
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

        await invalidatePrefix('cache:lesson');
        await invalidatePrefix('cache:course');

        res.status(200).json({ message: 'Lesson deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}
