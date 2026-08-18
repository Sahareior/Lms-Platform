import Subject from '../models/SubjectModel.js';
import { invalidatePrefix } from '../middleware/cache.js';

// ─── GET all subjects ───────────────────────────────────────
export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().populate('exam', 'name');
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch subjects', error: error.message });
  }
};

// ─── GET subjects by exam ───────────────────────────────────
export const getSubjectsByExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const subjects = await Subject.find({ exam: examId }).populate('exam', 'name');
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch subjects for exam', error: error.message });
  }
};

// ─── CREATE a new subject ───────────────────────────────────
export const createSubject = async (req, res) => {
  try {
    const { name, code, description, exam } = req.body;
    if (!name || !exam) {
      return res.status(400).json({ message: 'Subject name and exam are required' });
    }

    // Prevent duplicate subject names under the same exam
    const existing = await Subject.findOne({ name, exam });
    if (existing) {
      return res.status(409).json({ message: 'Subject already exists for this exam' });
    }

    const subject = new Subject({ name, code, description, exam });
    const saved = await subject.save();
    const populated = await saved.populate('exam', 'name');
    await invalidatePrefix('cache:subject');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create subject', error: error.message });
  }
};

// ─── UPDATE a subject ───────────────────────────────────────
export const updateSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const updates = req.body;

    const subject = await Subject.findByIdAndUpdate(subjectId, updates, {
      new: true,
      runValidators: true,
    }).populate('exam', 'name');

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    await invalidatePrefix('cache:subject');
    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update subject', error: error.message });
  }
};

// ─── DELETE a subject ───────────────────────────────────────
export const deleteSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const subject = await Subject.findByIdAndDelete(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    await invalidatePrefix('cache:subject');
    res.status(200).json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete subject', error: error.message });
  }
};
