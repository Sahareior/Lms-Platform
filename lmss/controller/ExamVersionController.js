import ExamVersion from "../models/ExamVersionModel.js";
import { invalidatePrefix } from "../middleware/cache.js";



export const addExamVersion = async (req, res) => {
  try {
    const data = req.body;
    const exam = new ExamVersion(data);
    await exam.save();
    await invalidatePrefix('cache:exam-version');
    res.status(201).json(exam);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to create exam' });
  }
};

export const getExamVersion = async (req,res) => {

    try{
        const examVersions = await ExamVersion.find().populate('questions');
       res.status(200).json(examVersions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to fetch examVersions' });
  }
};

export const getExamVersionsByExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const examVersions = await ExamVersion.find({ exam: examId }).populate('questions');
    res.status(200).json(examVersions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to fetch exam versions for this exam' });
  }
};

export const updateExamVersion = async (req, res) => {
  const { versionId } = req.params;
  const updateData = req.body;
  try {
    const updated = await ExamVersion.findByIdAndUpdate(versionId, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Exam version not found' });
    }
    await invalidatePrefix('cache:exam-version');
    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to update exam version' });
  }
};

export const deleteExamVersion = async (req, res) => {
  const { versionId } = req.params;
  try {
    const deleted = await ExamVersion.findByIdAndDelete(versionId);
    if (!deleted) {
      return res.status(404).json({ message: 'Exam version not found' });
    }
    await invalidatePrefix('cache:exam-version');
    res.status(200).json({ message: 'Exam version deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to delete exam version' });
  }
};