import ScheduleExam from "../models/ScheduleExamModel.js";
import QuestionModel from "../models/QuestionModel.js";
import { invalidatePrefix } from "../middleware/cache.js";

// ─── Helper: Fisher-Yates array shuffle ─────────────────────
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── Helper: select leveling random questions by topic ──────
function selectLevelingRandomQuestions(questionDocs, targetCount) {
  const allItems = [];
  const seenTexts = new Set();

  for (const doc of questionDocs) {
    if (!doc.data || !Array.isArray(doc.data)) continue;
    for (const item of doc.data) {
      if (!item.question_text) continue;
      const normalizedKey = item.question_text.trim().toLowerCase();
      if (seenTexts.has(normalizedKey)) continue;
      seenTexts.add(normalizedKey);

      allItems.push({
        question_text: item.question_text,
        scenario_text: item.scenario_text || "",
        image_url: item.image_url || "",
        options: item.options instanceof Map ? Object.fromEntries(item.options) : (item.options || {}),
        subjectName: item.subjectName || (doc.subject?.name ? doc.subject.name : null),
        topic: item.topic ? item.topic.trim() : "General",
        correct_answer: item.correct_answer || "",
        originalQuestionId: item._id,
        questionDocId: doc._id,
      });
    }
  }

  if (allItems.length === 0) return [];

  const actualTarget = Math.min(
    targetCount > 0 ? targetCount : allItems.length,
    allItems.length
  );

  // Group items by topic
  const topicMap = new Map();
  for (const item of allItems) {
    const topic = item.topic || "General";
    if (!topicMap.has(topic)) {
      topicMap.set(topic, []);
    }
    topicMap.get(topic).push(item);
  }

  // Shuffle items in each topic bucket
  for (const [topic, items] of topicMap.entries()) {
    topicMap.set(topic, shuffleArray(items));
  }

  // Leveling selection: distribute questions across topics as evenly as possible
  const topicNames = Array.from(topicMap.keys());
  const topicRemaining = new Map();
  for (const topic of topicNames) {
    topicRemaining.set(topic, [...topicMap.get(topic)]);
  }

  const selected = [];
  let remainingNeeded = actualTarget;

  while (remainingNeeded > 0) {
    const activeTopics = topicNames.filter((t) => (topicRemaining.get(t) || []).length > 0);
    if (activeTopics.length === 0) break;

    const perTopicQuota = Math.max(1, Math.floor(remainingNeeded / activeTopics.length));
    let pickedThisRound = 0;

    for (const topic of activeTopics) {
      if (remainingNeeded <= 0) break;
      const pool = topicRemaining.get(topic);
      const toTake = Math.min(perTopicQuota, pool.length, remainingNeeded);
      for (let i = 0; i < toTake; i++) {
        selected.push(pool.shift());
      }
      remainingNeeded -= toTake;
      pickedThisRound += toTake;
    }

    // Safety fallback to prevent infinite loop
    if (pickedThisRound === 0) {
      for (const topic of activeTopics) {
        if (remainingNeeded <= 0) break;
        const pool = topicRemaining.get(topic);
        if (pool && pool.length > 0) {
          selected.push(pool.shift());
          remainingNeeded--;
        }
      }
    }
  }

  // Shuffle final list so topics are interleaved throughout the paper
  const finalShuffled = shuffleArray(selected);
  return finalShuffled.map((item, index) => ({
    ...item,
    question_number: index + 1,
  }));
}

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
    const {
      exam,
      examVersion,
      title,
      description,
      startDate,
      endDate,
      duration,
      totalQuestions,
      board,
      isLevelingRandom,
    } = req.body;

    if (!exam || !title || !startDate || !endDate) {
      return res.status(400).json({ message: 'Exam, title, startDate, and endDate are required' });
    }

    if (!isLevelingRandom && !examVersion) {
      return res.status(400).json({ message: 'examVersion is required when not using Leveling Random' });
    }

    const status = computeStatus(startDate, endDate);

    let generatedQuestions = [];
    let calculatedTotalQuestions = totalQuestions || 0;

    if (isLevelingRandom) {
      // Find all question documents for this parent exam (optionally filtered by board/version if provided)
      const questionFilter = { exam };
      if (examVersion) questionFilter.examVersion = examVersion;
      if (board) questionFilter.board = board;

      const questionDocs = await QuestionModel.find(questionFilter).populate('subject', 'name');

      if (!questionDocs || questionDocs.length === 0) {
        return res.status(400).json({
          message: 'No questions found under this parent exam to generate questions from. Please add questions first.',
        });
      }

      const targetCount = Number(totalQuestions) > 0 ? Number(totalQuestions) : 50;
      generatedQuestions = selectLevelingRandomQuestions(questionDocs, targetCount);

      if (generatedQuestions.length === 0) {
        return res.status(400).json({
          message: 'No valid questions found inside question documents for this parent exam.',
        });
      }

      calculatedTotalQuestions = generatedQuestions.length;
    }

    const newExam = new ScheduleExam({
      exam,
      examVersion: examVersion || null,
      title,
      description,
      startDate,
      endDate,
      duration: duration || 120,
      totalQuestions: calculatedTotalQuestions,
      status,
      board: board || null,
      isLevelingRandom: Boolean(isLevelingRandom),
      generatedQuestions,
    });

    await newExam.save();
    await invalidatePrefix('cache:schedule-exam');
    const populated = await newExam.populate(['exam', 'examVersion']);
    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to create scheduled exam', error: err.message });
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

// ─── GET questions for a scheduled exam ───────────────────
export const getScheduleExamQuestions = async (req, res) => {
  try {
    const { examId } = req.params;
    const scheduleExam = await ScheduleExam.findById(examId)
      .populate('exam', 'name category')
      .populate('examVersion', 'examVersion');

    if (!scheduleExam) {
      return res.status(404).json({ message: 'Scheduled exam not found' });
    }

    if (scheduleExam.isLevelingRandom && scheduleExam.generatedQuestions?.length > 0) {
      return res.status(200).json([
        {
          _id: scheduleExam._id,
          exam: scheduleExam.exam,
          examVersion: scheduleExam.examVersion || null,
          board: scheduleExam.board || null,
          data: scheduleExam.generatedQuestions,
          isLevelingRandom: true,
          totalQuestions: scheduleExam.totalQuestions,
        },
      ]);
    }

    // Standard fallback: query questions matching exam, examVersion, and board
    const filter = { exam: scheduleExam.exam?._id || scheduleExam.exam };
    if (scheduleExam.examVersion) {
      filter.examVersion = scheduleExam.examVersion?._id || scheduleExam.examVersion;
    }
    if (scheduleExam.board) {
      filter.board = scheduleExam.board;
    }

    const questions = await QuestionModel.find(filter)
      .populate('exam', 'name category')
      .populate('examVersion', 'examVersion')
      .populate('subject', 'name');

    res.status(200).json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to fetch questions for scheduled exam' });
  }
};
