import Note from "../models/Note.js";

// Upsert (create or update) a note for a lesson by a user
export const upsertNote = async (req, res) => {
  const { lessonId } = req.params;
  const { userId, content } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }

  try {
    const note = await Note.findOneAndUpdate(
      { lesson: lessonId, user: userId },
      { content },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(200).json({ message: 'Note saved successfully', note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get a note for a lesson by a user
export const getNote = async (req, res) => {
  const { lessonId } = req.params;
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }

  try {
    const note = await Note.findOne({ lesson: lessonId, user: userId });
    res.status(200).json({ note: note || { lesson: lessonId, user: userId, content: '' } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get all notes for a user across all lessons
export const getAllNotesByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const notes = await Note.find({ user: userId }).populate('lesson', 'title course');
    res.status(200).json({ notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
