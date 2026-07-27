import QuestionModel from "../models/QuestionModel.js";
import QuestionPatternModel from "../models/QuestionPatternModel.js";

export const saveQuestionsInDb = async(req, res) => {
    try {
        const { exam, data } = req.body;

        // Validate input
        if (!exam || !data || data.length === 0) {
            return res.status(400).json({
                status: 'VALIDATION_ERROR',
                message: 'Exam name and questions data are required!'
            });
        }

        // Check if exam already exists
        let existingExam = await QuestionModel.findOne({ exam: exam });

        if (existingExam) {
            // Create a Set of existing question texts for O(1) lookup
            const existingQuestionTexts = new Set(
                existingExam.data.map(q => q.question_text)
            );

            // Separate questions into new and duplicate
            const newQuestions = [];
            const duplicateQuestions = [];

            data.forEach(q => {
                if (existingQuestionTexts.has(q.question_text)) {
                    duplicateQuestions.push(q);
                } else {
                    newQuestions.push(q);
                }
            });

            // Log duplicate details
            if (duplicateQuestions.length > 0) {
                console.log(`Skipping ${duplicateQuestions.length} duplicate questions:`, 
                    duplicateQuestions.map(q => q.question_text).join(', ')
                );
            }

            if (newQuestions.length === 0) {
                // All questions are duplicates
                return res.status(409).json({
                    status: 'ALL_DUPLICATE',
                    message: `All ${data.length} questions already exist in exam "${exam}". No new questions added.`,
                    details: {
                        exam: existingExam.exam,
                        existingQuestions: existingExam.data.length,
                        duplicateAttempted: duplicateQuestions.length,
                        duplicateQuestions: duplicateQuestions.map(q => ({
                            question_number: q.question_number,
                            question_text: q.question_text
                        }))
                    }
                });
            }

            // Add only new questions to existing exam
            existingExam.data.push(...newQuestions);
            await existingExam.save();

            return res.status(200).json({
                status: 'PARTIAL_SUCCESS',
                message: `Added ${newQuestions.length} new questions to exam "${exam}". ${duplicateQuestions.length} duplicate questions skipped.`,
                data: {
                    exam: existingExam.exam,
                    totalQuestions: existingExam.data.length,
                    newQuestionsAdded: newQuestions.length,
                    duplicateSkipped: duplicateQuestions.length,
                    newQuestions: newQuestions.map(q => ({
                        question_number: q.question_number,
                        question_text: q.question_text
                    })),
                    duplicateQuestions: duplicateQuestions.map(q => ({
                        question_number: q.question_number,
                        question_text: q.question_text
                    }))
                }
            });

        } else {
            // Exam doesn't exist, save all questions
            const questions = new QuestionModel(req.body);
            await questions.save();

            return res.status(201).json({
                status: 'SUCCESS',
                message: `New exam "${exam}" created with ${data.length} questions.`,
                data: {
                    exam: questions.exam,
                    totalQuestions: questions.data.length,
                    savedQuestions: questions
                }
            });
        }

    } catch(err) {
        console.error('Error saving questions:', err);
        return res.status(500).json({
            status: 'ERROR',
            message: 'Something went wrong while saving questions.',
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
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
  }
}


export const postQuestionPattern = async(req, res) => {
    try {
        // Access data from req.body.res instead of req.body
        const { exam, res: patternData } = req.body;
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

        // Check if pattern already exists for this exam
        const existingPattern = await QuestionPatternModel.findOne({ exam: exam });

        if (existingPattern) {
            return res.status(409).json({
                status: 'DUPLICATE',
                message: `Question pattern for exam "${exam}" already exists.`,
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

        await questionPattern.save();

        return res.status(201).json({
            status: 'SUCCESS',
            message: `Question pattern for "${exam}" created successfully!`,
            data: {
                id: questionPattern._id,
                exam: questionPattern.exam,
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
        const patterns = await QuestionPatternModel.find();
        res.status(200).json(patterns);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Unable to fetch question patterns' });
    }
}