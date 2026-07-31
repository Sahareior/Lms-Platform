import QuestionModel from "../models/QuestionModel.js";
import QuestionPatternModel from "../models/QuestionPatternModel.js";

export const saveQuestionsInDb = async (req, res) => {
    try {
        const { exam, examVersion, subject, data } = req.body;

        if (!exam || !examVersion || !Array.isArray(data) || data.length === 0) {
            return res.status(400).json({
                message: "Invalid request"
            });
        }

        // Prevent duplicate document
        const existing = await QuestionModel.findOne({
            exam,
            examVersion,
            subject: subject || null
        });

        if (existing) {
            return res.status(409).json({
                message: "Questions already exist for this exam/version/subject."
            });
        }

        // Prevent duplicate question numbers inside uploaded data
        const numbers = new Set();

        for (const q of data) {
            if (numbers.has(q.question_number)) {
                return res.status(400).json({
                    message: `Duplicate question number ${q.question_number}`
                });
            }

            numbers.add(q.question_number);
        }

        const saved = await QuestionModel.create({
            exam,
            examVersion,
            subject,
            data
        });

        res.status(201).json(saved);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: err.message
        });
    }
};

export const getAllQuestions = async (req,res) => {
try {
    const questions = await QuestionModel.find();
    res.status(200).json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to fetch exams' });
  }}

export const postQuestionPattern = async(req, res) => {
    try {
        // Access data from req.body.res instead of req.body
        const { exam, examVersion: bodyExamVersion, subject: bodySubject, res: patternData } = req.body;
        const { topics, subjects, categorized_questions } = patternData || {};

        // Validate required fields
        if (!exam) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Exam name is required!'
            });
        }

        if (!topics || Object.keys(topics).length === 0) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Topics are required!'
            });
        }

        if (!subjects || Object.keys(subjects).length === 0) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Subjects are required!'
            });
        }

        if (!categorized_questions || categorized_questions.length === 0) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Categorized questions are required!'
            });
        }

        // Accept examVersion from either patternData (res) or top-level req.body
        const versionLabel = patternData?.examVersion || bodyExamVersion || '';
        const subjectRef = bodySubject || '';
        
        // Build query filter: include subject if provided
        const queryFilter = { exam };
        if (versionLabel) queryFilter.examVersion = versionLabel;
        if (subjectRef) queryFilter.subject = subjectRef;
        
        const existingPattern = await QuestionPatternModel.findOne(queryFilter);

        if (existingPattern) {
            return res.status(409).json({
                status: 'DUPLICATE',
                message: `Question pattern for exam "${exam}"${versionLabel ? ` version "${versionLabel}"` : ''}${subjectRef ? ` subject "${subjectRef}"` : ''} already exists.`,
                data: existingPattern
            });
        }

        // Create new pattern
        const questionPattern = new QuestionPatternModel({
            exam,
            topics,
            subjects,
            categorized_questions
        });
        
        // Only set if provided (optional fields)
        if (versionLabel) questionPattern.examVersion = versionLabel;
        if (subjectRef) questionPattern.subject = subjectRef;

        await questionPattern.save();

        const displayName = versionLabel ? `${exam} ${versionLabel}` : exam;
        return res.status(201).json({
            status: 'SUCCESS',
            message: `Question pattern for "${displayName}" created successfully!`,
            data: {
                id: questionPattern._id,
                exam: questionPattern.exam,
                examVersion: questionPattern.examVersion,
                subject: questionPattern.subject,
                totalQuestions: questionPattern.totalQuestions,
                topicsCount: questionPattern.topics.size,
                subjectsCount: questionPattern.subjects.size,
                categorizedQuestionsCount: questionPattern.categorized_questions.length,
                createdAt: questionPattern.createdAt,
                pattern: questionPattern
            }
        });

    } catch(err) {
        console.error('Error saving question pattern:', err);
        
        // Handle duplicate key error
        if (err.code === 11000) {
            return res.status(409).json({
                status: 'DUPLICATE_ERROR',
                message: `Question pattern for "${req.body.exam}" already exists.`,
                error: err.message
            });
        }

        // Handle validation errors
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({
                status: 'VALIDATION_ERROR',
                message: 'Validation failed!',
                errors: errors
            });
        }

        return res.status(500).json({
            status: 'ERROR',
            message: 'Something went wrong while saving question pattern.',
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

export const getQuestionPattern =async (req,res) => {
    try {
        const { exam } = req.query;
        const filter = exam ? { exam } : {};
        const patterns = await QuestionPatternModel.find(filter);
        res.status(200).json(patterns);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Unable to fetch question patterns' });
    }
}

export const getQuestionsByExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { versionId } = req.query;

    const filter = { exam: examId };
    if (versionId) filter.examVersion = versionId;

    const questions = await QuestionModel.find(filter)
      .populate('exam', 'name')
      .populate('examVersion', 'examVersion')
      .populate('subject', 'name');

    res.status(200).json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to fetch questions for this exam' });
  }
};

// ─── UPDATE a single question document ─────────────────────
export const updateQuestionDocument = async (req, res) => {
    try {
        const { questionId } = req.params;
        const updates = req.body;

        const updated = await QuestionModel.findByIdAndUpdate(questionId, updates, {
            new: true,
            runValidators: true,
        })
            .populate('exam', 'name')
            .populate('examVersion', 'examVersion')
            .populate('subject', 'name');

        if (!updated) {
            return res.status(404).json({ message: 'Question document not found' });
        }
        res.status(200).json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Unable to update question document' });
    }
};

// ─── DELETE a single question document ─────────────────────
export const deleteQuestionDocument = async (req, res) => {
    try {
        const { questionId } = req.params;
        const deleted = await QuestionModel.findByIdAndDelete(questionId);
        if (!deleted) {
            return res.status(404).json({ message: 'Question document not found' });
        }
        res.status(200).json({ message: 'Question document deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Unable to delete question document' });
    }
};

// ─── UPDATE a single question within data array ────────────
export const updateSingleQuestion = async (req, res) => {
  try {
    const { questionId, questionNumber } = req.params;
    const updates = req.body;

    const doc = await QuestionModel.findById(questionId);
    if (!doc) {
      return res.status(404).json({ message: 'Question document not found' });
    }

    if (doc.question_number !== parseInt(questionNumber, 10)) {
      return res.status(404).json({ message: 'Question number does not match document' });
    }

    if (updates.question_text !== undefined) doc.question_text = updates.question_text;
    if (updates.options !== undefined) doc.options = updates.options;
    if (updates.correct_answer !== undefined) doc.correct_answer = updates.correct_answer;

    await doc.save();

    const populated = await doc.populate(['exam', 'examVersion', 'subject']);
    res.status(200).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to update question' });
  }
};

export const deleteSingleQuestion = async (req, res) => {
  try {
    const { questionId, questionNumber } = req.params;

    const doc = await QuestionModel.findById(questionId);
    if (!doc) {
      return res.status(404).json({ message: 'Question document not found' });
    }

    if (doc.question_number !== parseInt(questionNumber, 10)) {
      return res.status(404).json({ message: 'Question number does not match document' });
    }

    await doc.deleteOne();

    res.status(200).json({
      message: 'Question deleted successfully',
      questionId: doc._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to delete question' });
  }
};