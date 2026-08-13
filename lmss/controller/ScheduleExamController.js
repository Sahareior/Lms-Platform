import ScheduleExam from "../models/ScheduleExamModel.js";
import { invalidatePrefix } from "../middleware/cache.js";

// ─── Helper: compute status from dates ─────────────────────
const computeStatus = (startDate, endDate, overrideStatus) => {
  if (overrideStatus) return overrideStatus;
  const now = new Date();
  if (now < new Date(startDate)) return 'upcoming';
  if (now > new Date(endDate)) return 'completed';
  return 'active';
};

// ─── Helper: refresh status on a single exam doc ───────────
const refreshStatus = (exam) => {
  const now = new Date();
  // Only auto-refresh non-cancelled statuses
  if (exam.status === 'cancelled') return;
  if (now < exam.startDate && exam.status !== 'upcoming') exam.status = 'upcoming';
  else if (now > exam.endDate && exam.status !== 'completed') exam.status = 'completed';
  else if (now >= exam.startDate && now <= exam.endDate && exam.status !== 'active') exam.status = 'active';
};

// ─── LIST all scheduled exams ──────────────────────────────
export const listScheduleExams = async (req, res) => {
  try {
    const exams = await ScheduleExam.find()
      .populate('exam', 'name image')
      .populate('examVersion', 'examVersion')
      .sort({ endDate: -1 });

    // Refresh statuses dynamically for non-cancelled exams
    const bulkOps = [];
    exams.forEach((exam) => {
      const oldStatus = exam.status;
      refreshStatus(exam);
      if (exam.status !== oldStatus) {
        bulkOps.push({
          updateOne: {
            filter: { _id: exam._id },
            update: { $set: { status: exam.status } },
          },
        });
      }
    });
    if (bulkOps.length > 0) {
      await ScheduleExam.bulkWrite(bulkOps);
    }

    res.status(200).json(exams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to fetch scheduled exams' });
  }
};

// ─── LIST by exam (parent exam category) ───────────────────
export const getScheduleExamsByExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const exams = await ScheduleExam.find({ exam: examId })
      .populate('exam', 'name image')
      .populate('examVersion', 'examVersion')
      .sort({ endDate: -1 });

    // Refresh statuses dynamically
    const bulkOps = [];
    exams.forEach((exam) => {
      const oldStatus = exam.status;
      refreshStatus(exam);
      if (exam.status !== oldStatus) {
        bulkOps.push({
          updateOne: {
            filter: { _id: exam._id },
            update: { $set: { status: exam.status } },
          },
        });
      }
    });
    if (bulkOps.length > 0) {
      await ScheduleExam.bulkWrite(bulkOps);
    }

    res.status(200).json(exams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to fetch scheduled exams for this exam' });
  }
};

// ─── GET single scheduled exam ─────────────────────────────
export const getScheduleExamById = async (req, res) => {
  try {
    const { examId } = req.params;
    const exam = await ScheduleExam.findById(examId)
      .populate('exam', 'name image')
      .populate('examVersion', 'examVersion');
    if (!exam) return res.status(404).json({ message: 'Scheduled exam not found' });

    // Refresh status dynamically
    const oldStatus = exam.status;
    refreshStatus(exam);
    if (exam.status !== oldStatus) {
      await ScheduleExam.findByIdAndUpdate(examId, { $set: { status: exam.status } });
    }

    res.status(200).json(exam);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to fetch scheduled exam' });
  }
};

// ─── CREATE scheduled exam ─────────────────────────────────
export const createScheduleExam = async (req, res) => {
  try {
    const { exam, examVersion, title, description, startDate, endDate, duration, totalQuestions } = req.body;

    if (!exam || !examVersion || !title || !startDate || !endDate) {
      return res.status(400).json({ message: 'Exam, examVersion, title, startDate, and endDate are required' });
    }

    const status = computeStatus(startDate, endDate);

    const newExam = new ScheduleExam({
      exam,
      examVersion,
      title,
      description,
      startDate,
      endDate,
      duration: duration || 120,
      totalQuestions: totalQuestions || 0,
      status,
    });

    await newExam.save();
    await invalidatePrefix('cache:schedule-exam');
    const populated = await newExam.populate(['exam', 'examVersion']);
    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to create scheduled exam' });
  }
};

// ─── UPDATE scheduled exam ─────────────────────────────────
export const updateScheduleExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const updates = req.body;

    // If status is explicitly provided, keep it (manual override allowed only on edit)
    // Otherwise, re-compute from the updated dates or fall back to existing logic
    if (!updates.status) {
      const existing = await ScheduleExam.findById(examId);
      if (existing) {
        const sDate = updates.startDate || existing.startDate;
        const eDate = updates.endDate || existing.endDate;
        updates.status = computeStatus(sDate, eDate);
      }
    }

    const updated = await ScheduleExam.findByIdAndUpdate(examId, updates, {
      new: true,
      runValidators: true,
    })
      .populate('exam', 'name image')
      .populate('examVersion', 'examVersion');

    if (!updated) return res.status(404).json({ message: 'Scheduled exam not found' });
    await invalidatePrefix('cache:schedule-exam');
    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to update scheduled exam' });
  }
};

// ─── DELETE scheduled exam ─────────────────────────────────
export const deleteScheduleExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const deleted = await ScheduleExam.findByIdAndDelete(examId);
    if (!deleted) return res.status(404).json({ message: 'Scheduled exam not found' });
    await invalidatePrefix('cache:schedule-exam');
    res.status(200).json({ message: 'Scheduled exam deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to delete scheduled exam' });
  }
};

// ─── GET featured scheduled exam ───────────────────────────
export const getFeaturedScheduleExam = async (req, res) => {
  try {
    const featured = await ScheduleExam.findOne({ isFeatured: true })
      .populate('exam', 'name image')
      .populate('examVersion', 'examVersion')
      .sort({ endDate: -1 });

    if (!featured) {
      return res.status(200).json(null);
    }

    // Refresh status dynamically
    const oldStatus = featured.status;
    refreshStatus(featured);
    if (featured.status !== oldStatus) {
      await ScheduleExam.findByIdAndUpdate(featured._id, { $set: { status: featured.status } });
    }

    res.status(200).json(featured);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to fetch featured exam' });
  }
};

// ─── SET featured scheduled exam (admin only) ─────────────
export const setFeaturedScheduleExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { isFeatured } = req.body;

    if (isFeatured) {
      // Unset any currently featured exam first (only one featured at a time)
      await ScheduleExam.updateMany(
        { _id: { $ne: examId }, isFeatured: true },
        { $set: { isFeatured: false } }
      );
      const featured = await ScheduleExam.findByIdAndUpdate(
        examId,
        { $set: { isFeatured: true } },
        { new: true }
      )
        .populate('exam', 'name image')
        .populate('examVersion', 'examVersion');
      if (!featured) return res.status(404).json({ message: 'Scheduled exam not found' });
      await invalidatePrefix('cache:schedule-exam');
      return res.status(200).json(featured);
    }

    const unfeatured = await ScheduleExam.findByIdAndUpdate(
      examId,
      { $set: { isFeatured: false } },
      { new: true }
    )
      .populate('exam', 'name image')
      .populate('examVersion', 'examVersion');
    if (!unfeatured) return res.status(404).json({ message: 'Scheduled exam not found' });
    await invalidatePrefix('cache:schedule-exam');
    res.status(200).json(unfeatured);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to update featured exam' });
  }
};
