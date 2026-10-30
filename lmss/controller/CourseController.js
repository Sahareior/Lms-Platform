import CourseModel from "../models/Courses.js";
import UserData from "../models/UserDataModel.js";
import { invalidatePrefix } from "../middleware/cache.js";
import { createNotification } from "./NotificationController.js";

const createCourse = async (req, res) => {
    const courseData = req.body;
    try {
        const newCourse = new CourseModel(courseData);
        await newCourse.save();
        await invalidatePrefix('cache:course');
        res.status(201).json({ message: 'Course created successfully', course: newCourse });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

// Populate the enrolled-student list only when explicitly requested
// (admin views). Public/student course listings don't need thousands of
// user documents dragged along with every course.
const withEnrolledStudents = (req) => req.query?.withStudents === 'true';

const listCourses = async (req, res) => {
    try {
        let query = CourseModel.find()
            .populate('lessons')
            .populate('exam')
            .populate('subjects');
        if (withEnrolledStudents(req)) {
            query = query.populate('enrolledStudents', '-password -__v');
        }
        const courses = await query;
        res.status(200).json(courses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Unable to fetch courses' });
    }
}

const updateCourse = async (req, res) => {
    const { courseId } = req.params;
    const courseData = req.body;

    try {
        const updatedCourse = await CourseModel.findByIdAndUpdate(courseId, courseData, { new: true });
        if (!updatedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }
        await invalidatePrefix('cache:course');
        res.status(200).json({ message: 'Course updated successfully', course: updatedCourse });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

const getCourseById = async (req, res) => {
    const { courseId } = req.params;

    try {
        let query = CourseModel.findById(courseId)
            .populate('lessons')
            .populate('exam')
            .populate('subjects');
        if (withEnrolledStudents(req)) {
            query = query.populate('enrolledStudents', '-password -__v');
        }
        const course = await query;
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

    try {
        let query = CourseModel.find({ exam: examId })
            .populate('lessons')
            .populate('exam')
            .populate('subjects');
        if (withEnrolledStudents(req)) {
            query = query.populate('enrolledStudents', '-password -__v');
        }
        const courses = await query;
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
        await invalidatePrefix('cache:course');
        await invalidatePrefix('cache:course-enrolled');
        await createNotification({
            userId,
            title: 'Enrolled successfully',
            message: `You are now enrolled in "${course.title}". Happy learning!`,
            type: 'course',
            link: `/courses/${courseId}`,
        });
        res.status(200).json({ message: 'User enrolled in course successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

const getEnrolledCourses = async (req, res) => {
    const { userId } = req.params;
    try{
        const [courses, userData] = await Promise.all([
            CourseModel.find({ enrolledStudents: userId }).populate('lessons').populate('exam').populate('subjects'),
            UserData.findOne({ user: userId }),
        ]);

        // Map courseId → set of completed lesson ids for this user
        const progressMap = new Map(
            (userData?.courseProgress || []).map((entry) => [
                entry.course?.toString(),
                new Set((entry.completedLessons || []).map((id) => id.toString())),
            ])
        );

        // Merge per-user progress into each enrolled course so the UI
        // can render the real progress %, completed count and next chapter.
        const enriched = courses.map((course) => {
            const courseObj = course.toObject();
            const completedIds = progressMap.get(course._id.toString()) || new Set();
            const lessons = Array.isArray(courseObj.lessons) ? courseObj.lessons : [];
            const sortedLessons = [...lessons].sort(
                (a, b) => (a.order ?? 0) - (b.order ?? 0) || new Date(a.createdAt) - new Date(b.createdAt)
            );
            const completedCount = sortedLessons.filter((l) => completedIds.has(l._id.toString())).length;
            const progress = sortedLessons.length > 0
                ? Math.min(100, Math.round((completedCount / sortedLessons.length) * 100))
                : 0;
            const nextLesson = sortedLessons.find((l) => !completedIds.has(l._id.toString()));

            return {
                ...courseObj,
                totalLessons: sortedLessons.length,
                lessonsCompleted: completedCount,
                completedLessons: sortedLessons
                    .filter((l) => completedIds.has(l._id.toString()))
                    .map((l) => l._id.toString()),
                progress,
                chapter: completedCount === 0 ? 'Start Learning' : nextLesson ? nextLesson.title : 'Completed',
            };
        });

        res.status(200).json(enriched);
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
        await invalidatePrefix('cache:course');
        await invalidatePrefix('cache:course-enrolled');
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

export { createCourse, listCourses, updateCourse, getCourseById, getCoursesByExamId, enrollCourse, getEnrolledCourses, deleteCourse };
