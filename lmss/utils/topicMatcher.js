import TopicModel from "../models/TopicModel.js";

/**
 * Normalizes a topic string for reliable comparison.
 * e.g. "Profit & Loss" -> "profit and loss"
 *      "Sea Ports of Bangladesh" -> "sea ports of bangladesh"
 */
export function normalizeTopicName(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\w\s\u0980-\u09FF]/g, " ") // keep alphanumeric and Bengali characters
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Strips common stop-words/modifiers to find core topic root.
 * e.g. "sea ports of bangladesh" -> "sea ports"
 *      "major sea ports" -> "sea ports"
 */
function getCoreWords(normalizedStr) {
  const stopWords = new Set([
    "of", "in", "and", "the", "a", "an", "for", "to", "from", "on", "at",
    "major", "important", "basic", "overview", "introduction",
    "bangladesh", "bd"
  ]);
  return normalizedStr
    .split(" ")
    .filter((w) => w.length > 0 && !stopWords.has(w));
}

/**
 * Checks if two normalized topic strings represent the same canonical topic.
 */
export function isSimilarTopic(normA, normB) {
  if (normA === normB) return true;
  if (!normA || !normB) return false;

  // Substring containment if length is close
  if (normA.includes(normB) || normB.includes(normA)) {
    const minLen = Math.min(normA.length, normB.length);
    const maxLen = Math.max(normA.length, normB.length);
    if (minLen / maxLen >= 0.5) return true;
  }

  // Core words overlap (Jaccard similarity on non-stop words)
  const wordsA = getCoreWords(normA);
  const wordsB = getCoreWords(normB);

  if (wordsA.length === 0 || wordsB.length === 0) return false;

  const setB = new Set(wordsB);
  const common = wordsA.filter((w) => setB.has(w));
  const unionCount = new Set([...wordsA, ...wordsB]).size;

  const similarity = common.length / unionCount;
  // High overlap or one core set fully contains the other
  const fullyContains = (common.length === wordsA.length || common.length === wordsB.length) && common.length >= 2;

  return similarity >= 0.6 || fullyContains;
}

/**
 * Resolves a list of raw topic names against stored topics for an exam and subject.
 * If a matching topic is found in the DB, maps to that canonical name.
 * If not found, persists the new topic in the DB and returns the new name.
 *
 * @param {Object} params
 * @param {string} params.exam - Exam ObjectId
 * @param {string} [params.subject] - Subject ObjectId
 * @param {string} [params.subjectName] - Subject name
 * @param {string[]} params.rawTopics - Array of raw topic strings from AI
 * @returns {Promise<Map<string, string>>} Mapping from rawTopic -> canonicalTopicName
 */
export async function resolveTopics({ exam, subject, subjectName, rawTopics = [] }) {
  const mapping = new Map();
  if (!exam || !rawTopics || rawTopics.length === 0) return mapping;

  const query = { exam };
  if (subjectName) {
    const escaped = subjectName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.subjectName = new RegExp(`^${escaped}$`, 'i');
  } else if (subject) {
    query.subject = subject;
  }

  // 1. Fetch existing topics from DB for this exam (+ subject)
  const existingTopics = await TopicModel.find(query);

  for (const raw of rawTopics) {
    if (!raw || typeof raw !== "string") continue;
    const cleanRaw = raw.trim();
    if (!cleanRaw) continue;

    const normRaw = normalizeTopicName(cleanRaw);

    // 2. Check exact or alias match in existing topics
    let matchedTopic = existingTopics.find((t) => {
      if (t.normalizedName === normRaw) return true;
      if (Array.isArray(t.aliases) && t.aliases.some((a) => normalizeTopicName(a) === normRaw)) return true;
      return false;
    });

    // 3. If no exact match, check fuzzy/similarity match
    if (!matchedTopic) {
      matchedTopic = existingTopics.find((t) => isSimilarTopic(normRaw, t.normalizedName));
    }

    if (matchedTopic) {
      // Use stored canonical topic name!
      mapping.set(cleanRaw, matchedTopic.name);

      // Record alias if it differs from canonical name and isn't stored yet
      if (matchedTopic.name !== cleanRaw && !matchedTopic.aliases.includes(cleanRaw)) {
        matchedTopic.aliases.push(cleanRaw);
        await TopicModel.updateOne(
          { _id: matchedTopic._id },
          { $addToSet: { aliases: cleanRaw }, $inc: { questionCount: 1 } }
        ).catch(() => {});
      } else {
        await TopicModel.updateOne(
          { _id: matchedTopic._id },
          { $inc: { questionCount: 1 } }
        ).catch(() => {});
      }
    } else {
      // 4. Topic not found in DB -> Create new canonical topic in DB
      try {
        const newTopic = await TopicModel.create({
          name: cleanRaw,
          normalizedName: normRaw,
          exam,
          subject: subject || undefined,
          subjectName: subjectName || undefined,
          aliases: [],
          questionCount: 1,
        });
        existingTopics.push(newTopic);
        mapping.set(cleanRaw, newTopic.name);
      } catch (err) {
        // Handle race condition / duplicate key
        if (err.code === 11000) {
          const found = await TopicModel.findOne({
            exam,
            normalizedName: normRaw,
            ...(subjectName ? { subjectName } : {}),
          });
          mapping.set(cleanRaw, found ? found.name : cleanRaw);
        } else {
          mapping.set(cleanRaw, cleanRaw);
        }
      }
    }
  }

  return mapping;
}
