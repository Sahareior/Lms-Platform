import College from '../models/CollegeModel.js';
import QuestionModel from '../models/QuestionModel.js';
import { invalidatePrefix } from '../middleware/cache.js';

// ─── GET all colleges ───────────────────────────────────────
export const getColleges = async (req, res) => {
  try {
    const colleges = await College.find().sort({ name: 1 });
    res.status(200).json(colleges);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch colleges', error: error.message });
  }
};

// ─── CREATE a college ───────────────────────────────────────
export const createCollege = async (req, res) => {
  try {
    const { name, code, location } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'College name is required' });
    }

    // Case-insensitive duplicate check (index uses a case-insensitive collation,
    // but check explicitly so we can return 409 instead of a raw 500)
    const existing = await College.findOne({
      name: new RegExp(`^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
    });
    if (existing) {
      return res.status(409).json({ message: 'A college with this name already exists' });
    }

    const college = new College({ name: name.trim(), code, location });
    const saved = await college.save();
    await invalidatePrefix('cache:college');
    res.status(201).json(saved);
  } catch (error) {
    // Duplicate key race (concurrent creates)
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A college with this name already exists' });
    }
    res.status(500).json({ message: 'Failed to create college', error: error.message });
  }
};

// ─── UPDATE a college ───────────────────────────────────────
export const updateCollege = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const { name, code, location } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (code !== undefined) updates.code = code;
    if (location !== undefined) updates.location = location;

    const college = await College.findByIdAndUpdate(collegeId, updates, {
      new: true,
      runValidators: true,
    });
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }
    await invalidatePrefix('cache:college');
    res.status(200).json(college);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A college with this name already exists' });
    }
    res.status(500).json({ message: 'Failed to update college', error: error.message });
  }
};

// ─── DELETE a college ───────────────────────────────────────
export const deleteCollege = async (req, res) => {
  try {
    const { collegeId } = req.params;

    // Refuse to delete a college that still has question sets under it
    const questionCount = await QuestionModel.countDocuments({ college: collegeId });
    if (questionCount > 0) {
      return res.status(409).json({
        message: `Cannot delete: ${questionCount} question set(s) are assigned to this college. Reassign them first.`,
      });
    }

    const college = await College.findByIdAndDelete(collegeId);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }
    await invalidatePrefix('cache:college');
    res.status(200).json({ message: 'College deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete college', error: error.message });
  }
};
