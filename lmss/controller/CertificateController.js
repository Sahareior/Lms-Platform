import crypto from "crypto";
import Certificate from "../models/Certificate.js";
import CourseModel from "../models/Courses.js";
import User from "../models/User.js";
import UserData from "../models/UserDataModel.js";
import { createNotification } from "./NotificationController.js";

// Generates a short, collision-resistant public code: GNS-XXXXXX.
function generateCertificateId() {
  return `GNS-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

/**
 * Issue a completion certificate for a user+course.
 * Only issues when the user is enrolled AND every lesson is completed.
 * Idempotent: re-issuing returns the existing certificate.
 */
export const issueCertificate = async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    if (!userId || !courseId) {
      return res.status(400).json({ message: "userId and courseId are required" });
    }

    const [course, userData, user] = await Promise.all([
      CourseModel.findById(courseId).populate("lessons"),
      UserData.findOne({ user: userId }),
      User.findById(userId),
    ]);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (!course.enrolledStudents.some((id) => id.toString() === userId)) {
      return res.status(403).json({ message: "You are not enrolled in this course" });
    }

    const progressEntry = (userData?.courseProgress || []).find(
      (p) => p.course.toString() === courseId
    );
    const completedIds = new Set(
      (progressEntry?.completedLessons || []).map((id) => id.toString())
    );
    const lessons = (course.lessons || []).sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0) || new Date(a.createdAt) - new Date(b.createdAt)
    );
    const completedCount = lessons.filter((l) => completedIds.has(l._id.toString())).length;

    if (completedCount < lessons.length || lessons.length === 0) {
      return res.status(400).json({
        message: `Course not completed yet (${completedCount}/${lessons.length} lessons).`,
      });
    }

    // Idempotent issue: if a certificate already exists, return it as-is.
    let certificate = await Certificate.findOne({ user: userId, course: courseId });
    if (!certificate) {
      certificate = new Certificate({
        user: userId,
        course: courseId,
        certificateId: generateCertificateId(),
        userName: user?.name || user?.username || "Student",
        courseTitle: course.title,
        completedLessons: completedCount,
        totalLessons: lessons.length,
      });

      // Retry on the (unlikely) certificateId collision.
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await certificate.save();
          break;
        } catch (err) {
          if (err.code === 11000 && attempt < 2) {
            certificate.certificateId = generateCertificateId();
          } else {
            throw err;
          }
        }
      }

      // Let the user know inside the app.
      await createNotification({
        userId,
        title: "Certificate issued 🎉",
        message: `Congratulations! You earned a certificate for "${course.title}".`,
        type: "certificate",
        link: `/courses/${courseId}`,
      }).catch(() => {});
    }

    res.status(201).json({ message: "Certificate issued", certificate });
  } catch (err) {
    console.error("Error issuing certificate:", err);
    res.status(500).json({ message: "Unable to issue certificate" });
  }
};

/** GET /certificates/mine?userId=... — list the user's certificates. */
export const getMyCertificates = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
    const certificates = await Certificate.find({ user: userId }).sort({ issuedAt: -1 });
    res.status(200).json(certificates);
  } catch (err) {
    console.error("Error listing certificates:", err);
    res.status(500).json({ message: "Unable to list certificates" });
  }
};

/** GET /certificates/:id — public printable certificate (shareable by design). */
export const getCertificateById = async (req, res) => {
  try {
    const { id } = req.params;
    const certificate = await Certificate.findById(id);
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }
    res.status(200).json(certificate);
  } catch (err) {
    console.error("Error fetching certificate:", err);
    res.status(500).json({ message: "Unable to fetch certificate" });
  }
};

/** GET /certificates/code/:code — public verification by certificate code. */
export const getCertificateByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const certificate = await Certificate.findOne({ certificateId: code.toUpperCase() });
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }
    res.status(200).json(certificate);
  } catch (err) {
    console.error("Error verifying certificate:", err);
    res.status(500).json({ message: "Unable to verify certificate" });
  }
};
