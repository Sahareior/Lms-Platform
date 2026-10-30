import TopicModel from "../models/TopicModel.js";
import { normalizeTopicName, resolveTopics } from "../utils/topicMatcher.js";

/**
 * GET /topics
 * Query: exam, subject, subjectName
 */
export const getTopics = async (req, res) => {
  try {
    const { exam, subject, subjectName } = req.query;
    const filter = {};
    if (exam) filter.exam = exam;
    if (subject) filter.subject = subject;
    if (subjectName) filter.subjectName = subjectName;

    const topics = await TopicModel.find(filter)
      .populate('exam', 'name category')
      .populate('subject', 'name code')
      .sort({ questionCount: -1, name: 1 });

    res.status(200).json(topics);
  } catch (err) {
    console.error('Error fetching topics:', err);
    res.status(500).json({ message: 'Unable to fetch topics', error: err.message });
  }
};

/**
 * POST /topics
 * Body: { name, exam, subject, subjectName }
 */
export const createTopic = async (req, res) => {
  try {
    const { name, exam, subject, subjectName } = req.body;
    if (!name || !exam) {
      return res.status(400).json({ message: 'Topic name and exam are required' });
    }

    const cleanName = name.trim();
    const normalizedName = normalizeTopicName(cleanName);

    // Check if topic exists
    const query = { exam, normalizedName };
    if (subjectName) query.subjectName = subjectName;

    let topic = await TopicModel.findOne(query);
    if (topic) {
      return res.status(200).json({
        message: 'Topic already exists',
        topic,
      });
    }

    topic = await TopicModel.create({
      name: cleanName,
      normalizedName,
      exam,
      subject: subject || undefined,
      subjectName: subjectName || undefined,
      aliases: [],
      questionCount: 0,
    });

    res.status(201).json({
      message: 'Topic created successfully',
      topic,
    });
  } catch (err) {
    console.error('Error creating topic:', err);
    res.status(500).json({ message: 'Failed to create topic', error: err.message });
  }
};

/**
 * POST /topics/resolve
 * Resolves a list of raw topic names against stored topics in the DB.
 * If found, returns canonical name. If not, creates the topic in DB.
 * Body: { exam, subject, subjectName, topics: string[] }
 */
export const resolveTopicsBatch = async (req, res) => {
  try {
    const { exam, subject, subjectName, topics } = req.body;
    if (!exam || !Array.isArray(topics)) {
      return res.status(400).json({ message: 'Exam and topics array are required' });
    }

    const mapping = await resolveTopics({
      exam,
      subject,
      subjectName,
      rawTopics: topics,
    });

    const result = Object.fromEntries(mapping.entries());
    res.status(200).json({ mapping: result });
  } catch (err) {
    console.error('Error resolving topics:', err);
    res.status(500).json({ message: 'Failed to resolve topics', error: err.message });
  }
};

/**
 * DELETE /topics/:id
 */
export const deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;
    await TopicModel.findByIdAndDelete(id);
    res.status(200).json({ message: 'Topic deleted successfully' });
  } catch (err) {
    console.error('Error deleting topic:', err);
    res.status(500).json({ message: 'Failed to delete topic', error: err.message });
  }
};
