import mongoose from "mongoose";
import Module from "../models/Module.js";
import Lesson from "../models/Lesson.js";
import CourseModel from "../models/Courses.js";
import { invalidatePrefix } from "../middleware/cache.js";

export const createModule = async (req, res) => {
    const { course, title, description, order } = req.body;
    try {
        if (!course || !mongoose.Types.ObjectId.isValid(course)) {
            return res.status(400).json({ message: 'Invalid course id' });
        }
        const courseDoc = await CourseModel.findById(course);
        if (!courseDoc) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Default order = one after the last existing module
        let moduleOrder = order;
        if (moduleOrder === undefined || moduleOrder === null) {
            const lastModule = await Module.findOne({ course }).sort({ order: -1, createdAt: -1 });
            moduleOrder = (lastModule?.order ?? 0) + 1;
        }

        const newModule = new Module({ course, title, description, order: moduleOrder });
        await newModule.save();

        await invalidatePrefix('cache:module');
        await invalidatePrefix('cache:lesson');
        await invalidatePrefix('cache:course');

        res.status(201).json({ message: 'Module created successfully', module: newModule });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

export const getModulesByCourseId = async (req, res) => {
    const { courseId } = req.params;
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({ message: 'Invalid course id' });
    }
    try {
        const modules = await Module.find({ course: courseId }).sort({ order: 1, createdAt: 1 });
        const lessons = await Lesson.find({ course: courseId }).sort({ order: 1, createdAt: 1 });

        // Group lessons under their module; lessons without a module go
        // into the "uncategorized" bucket so old data still shows up.
        const modulesWithLessons = modules.map((module) => ({
            ...module.toObject(),
            lessons: lessons.filter(
                (lesson) => lesson.module?.toString() === module._id.toString()
            ).map((lesson) => lesson.toObject()),
        }));

        const uncategorized = lessons.filter((lesson) => !lesson.module).map((lesson) => lesson.toObject());

        res.status(200).json({ modules: modulesWithLessons, uncategorized });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

export const updateModule = async (req, res) => {
    const { moduleId } = req.params;
    const moduleData = req.body;
    try {
        const updatedModule = await Module.findByIdAndUpdate(moduleId, moduleData, { new: true });
        if (!updatedModule) {
            return res.status(404).json({ message: 'Module not found' });
        }
        await invalidatePrefix('cache:module');
        await invalidatePrefix('cache:lesson');
        res.status(200).json({ message: 'Module updated successfully', module: updatedModule });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

export const deleteModule = async (req, res) => {
    const { moduleId } = req.params;
    try {
        const module = await Module.findById(moduleId);
        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }

        // Detach all lessons that belonged to this module (keep the lessons).
        await Lesson.updateMany({ module: moduleId }, { $unset: { module: 1 } });

        await Module.findByIdAndDelete(moduleId);

        await invalidatePrefix('cache:module');
        await invalidatePrefix('cache:lesson');
        await invalidatePrefix('cache:course');

        res.status(200).json({ message: 'Module deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}
