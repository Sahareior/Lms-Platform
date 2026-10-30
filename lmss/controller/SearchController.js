import Exam from "../models/Exam.js";
import CourseModel from "../models/Courses.js";
import Lesson from "../models/Lesson.js";

/**
 * GET /search?q=... — lightweight cross-content search.
 * Case-insensitive substring match on exam names/descriptions, course
 * titles/descriptions, and lesson titles. Results are capped so the payload
 * stays small (this is a search box, not a full-text engine).
 */
export const searchAll = async (req, res) => {
  try {
    const q = (req.query.q || "").toString().trim();
    if (!q || q.length < 2) {
      return res.status(200).json({ exams: [], courses: [], lessons: [] });
    }

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");

    const [exams, courses, lessons] = await Promise.all([
      Exam.find({ $or: [{ name: regex }, { description: regex }] })
        .limit(8)
        .select("name image description category"),
      CourseModel.find({ $or: [{ title: regex }, { description: regex }] })
        .limit(8)
        .select("title thumbnail description exam instructor"),
      Lesson.find({ $or: [{ title: regex }, { description: regex }] })
        .limit(8)
        .select("title description course order duration isPreview"),
    ]);

    res.status(200).json({ exams, courses, lessons });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Unable to search" });
  }
};
