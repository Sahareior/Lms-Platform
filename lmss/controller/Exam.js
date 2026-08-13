import Exam from '../models/Exam.js';
import User from '../models/User.js';
import { invalidatePrefix } from '../middleware/cache.js';

export const createExam = async (req, res) => {
  try {
    const { name, image, applicants, description, category } = req.body;
    const exam = new Exam({ name, image, applicants, description, category });
    await exam.save();
    await invalidatePrefix('cache:exam');
    res.status(201).json(exam);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to create exam' });
  }
};

export const listExams = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category === 'academic' || category === 'job_preparation') {
      filter.category = category;
    }
    const exams = await Exam.find(filter);

    // Existing exams created before categories existed get the job_preparation default
    for (const exam of exams) {
      if (!exam.category) exam.category = 'job_preparation';
    }

    res.status(200).json(exams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to fetch exams' });
  }
};

export const selectExamForUser = async (req, res) => {
  console.log('Request body:', req.body); // Log the request body for debugging
  try {
    const {
      userId,
      examId,
      fullName,
      phone,
      email,
      dateOfBirth,
      division,
      district,
      thana,
      village,
      postCode,
      fullAddress,
      education,
      institute,
      targetDate,
      preferredCenter,
      hearAbout,
      notes,
      agreed
    } = req.body;

    if (!userId || !examId) {
      return res.status(400).json({ message: 'userId and examId are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate exams (handle both single examId and array of examIds)
    const examIds = Array.isArray(examId) ? examId : [examId];
    for (const id of examIds) {
      const exam = await Exam.findById(id);
      if (!exam) {
        return res.status(404).json({ message: `Exam with id ${id} not found` });
      }
    }

    // Update user profile with provided information
    if (fullName) user.username = fullName;
    if (phone) user.phone = phone;
    if (email) user.email = email;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (division) user.division = division;
    if (district) user.district = district;
    if (thana) user.thana = thana;
    if (village) user.village = village;
    if (postCode) user.postCode = postCode;
    if (fullAddress) user.fullAddress = fullAddress;
    if (education) user.education = education;
    if (institute) user.institute = institute;
    if (targetDate) user.targetDate = targetDate;
    if (preferredCenter) user.preferredCenter = preferredCenter;
    if (hearAbout) user.hearAbout = hearAbout;
    if (notes) user.notes = notes;
    if (agreed !== undefined) user.agreed = agreed;

    // Add exam(s) to selectedExams if not already present
    for (const id of examIds) {
      if (!user.selectedExams.includes(id)) {
        user.selectedExams.push(id);
      }
    }

    // Save all updates at once
    await user.save();

    res.status(200).json({
      message: 'Exam selected and user profile updated',
      selectedExams: user.selectedExams,
      userProfile: {
        username: user.username,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        division: user.division,
        district: user.district,
        thana: user.thana,
        village: user.village,
        postCode: user.postCode,
        fullAddress: user.fullAddress,
        education: user.education,
        institute: user.institute,
        targetDate: user.targetDate,
        preferredCenter: user.preferredCenter,
        hearAbout: user.hearAbout,
        notes: user.notes,
        agreed: user.agreed
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to select exam' });
  }
};

export const updateExam = async (req, res) => {
  const { examId } = req.params;
  const { name, image, applicants, description, category } = req.body;
  console.log(req.body,'yjos')

  // Explicitly whitelist updatable fields (keeps category safe to persist)
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (image !== undefined) updateData.image = image;
  if (applicants !== undefined) updateData.applicants = applicants;
  if (description !== undefined) updateData.description = description;
  if (category !== undefined) updateData.category = category;

  try {
    const updatedExam = await Exam.findByIdAndUpdate(examId, updateData, {
      new: true,
      runValidators: true,
    });
    if (!updatedExam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    await invalidatePrefix('cache:exam');
    res.status(200).json(updatedExam);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to update exam' });
  }
};

export const deleteExam = async (req, res) => {
  const { examId } = req.params;
  try {
    const deletedExam = await Exam.findByIdAndDelete(examId);
    if (!deletedExam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    await invalidatePrefix('cache:exam');
    res.status(200).json({ message: 'Exam deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to delete exam' });
  }
};

export const removeExamForUser = async (req, res) => {
  try {
    const { userId, examId } = req.body;

    if (!userId || !examId) {
      return res.status(400).json({ message: 'userId and examId are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const examIds = Array.isArray(examId) ? examId : [examId];

    // Remove exam(s) from selectedExams if present
    user.selectedExams = user.selectedExams.filter((id) => !examIds.includes(id.toString()));

    await user.save();

    res.status(200).json({
      message: 'Exam removed successfully',
      selectedExams: user.selectedExams,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to remove exam' });
  }
};

export const getUserExams = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('selectedExams');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user.selectedExams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to load user exams' });
  }
};
