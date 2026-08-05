import mongoose from "mongoose";
import QuestionPatternModel from "../models/QuestionPatternModel.js";
import ExamVersion from "../models/ExamVersionModel.js";

const normalizeVersionValue = (value, versionLabelMap = new Map()) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if (typeof value.examVersion === "string") return value.examVersion;
    if (typeof value.examVersion === "object" && value.examVersion?.examVersion) {
      return value.examVersion.examVersion;
    }
    if (typeof value.name === "string") return value.name;
    if (typeof value.label === "string") return value.label;
    if (value._id) {
      const mappedLabel = versionLabelMap.get(String(value._id));
      if (mappedLabel) return mappedLabel;
      return String(value._id);
    }
  }
  return String(value);
};

const getVersionNumber = (label = "") => {
  const match = String(label).match(/(\d+)(?!.*\d)/);
  return match ? Number(match[1]) : Number.NEGATIVE_INFINITY;
};

const compareVersionLabels = (a, b) => {
  const aNumber = getVersionNumber(a);
  const bNumber = getVersionNumber(b);

  if (Number.isFinite(aNumber) && Number.isFinite(bNumber) && aNumber !== bNumber) {
    return aNumber - bNumber;
  }

  return String(a).localeCompare(String(b));
};

const formatVersionLabel = (label = "") => String(label).replace(/[_\-]+/g, " ");

/**
 * GET /important-topics
 *
 * Analyzes the stored topic-analysis data (QuestionPattern documents, keyed by
 * exam + examVersion + optional subject) and returns a version-aware topic breakdown.
 *
 * Query params:
 *   exam                  – required. ObjectId of the exam whose stored analysis to analyze
 *   examVersion           – optional version label used to narrow the analysis
 *   subject               – optional ObjectId to narrow the analysis to one subject
 *   subjectName           – optional topic-level filter: only keep topics whose subject name matches
 *   limit                 – how many top topics to return (default 10, max 50)
 *
 * Response:
 *   {
 *     success,
 *     exam,
 *     examVersion,
 *     totalQuestions,
 *     topics: [
 *       {
 *         rank,
 *         topic,
 *         subject,
 *         frequency,
 *         score,
 *         share_percentage,
 *         examVersionsHistory,
 *         last_appeared,
 *         gap,
 *         appearedInLastExam,
 *         positiveTrend
 *       }
 *     ]
 *   }
 */
export const getImportantTopics = async (req, res) => {
  try {
    const { exam, examVersion, subject, subjectName, limit } = req.query;

    if (!exam) {
      return res.status(400).json({ message: "exam is required" });
    }

    // ── Validate ObjectId filters ──────────────────────────
    // examVersion is intentionally not ObjectId-validated because QuestionController
    // can persist it as a plain version label such as "BCS_50".
    for (const [name, value] of Object.entries({ exam, subject })) {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return res.status(400).json({ message: `Invalid ${name} id` });
      }
    }

    const topN = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

    // ── Build the pattern filter ───────────────────────────
    const filter = { exam };
    if (examVersion) filter.examVersion = examVersion;
    if (subject) filter.subject = subject;

    const patterns = await QuestionPatternModel.find(filter)
      .populate("exam", "name")
      .populate("subject", "name")
      .populate("examVersion", "examVersion")
      .lean();

    const versionObjectIds = patterns
      .map((pattern) => (pattern.examVersion && typeof pattern.examVersion === "object" ? pattern.examVersion._id : null))
      .filter(Boolean);

    const versionLabelMap = new Map();
    if (versionObjectIds.length > 0) {
      const versionDocs = await ExamVersion.find({ _id: { $in: versionObjectIds } })
        .select("examVersion")
        .lean();

      for (const versionDoc of versionDocs) {
        if (versionDoc?._id && versionDoc?.examVersion) {
          versionLabelMap.set(String(versionDoc._id), versionDoc.examVersion);
        }
      }
    }

    const topicData = new Map(); // topic -> aggregated entry
    const topicSubjects = new Map(); // topic -> subject name from categorized_questions
    const patternSubjectNames = new Set(); // fallback subject names (from pattern refs)
    const allVersionLabels = new Set();
    let totalQuestions = 0;

    for (const pattern of patterns) {
      if (pattern.subject?.name) patternSubjectNames.add(pattern.subject.name);

      // Defensive Map handling: with .lean(), Mongoose may return the `topics`
      // schema-Map as a plain object or (on some versions) as a Map instance.
      const topics =
        pattern.topics instanceof Map
          ? Object.fromEntries(pattern.topics)
          : pattern.topics || {};

      const patternVersion = normalizeVersionValue(pattern.examVersion, versionLabelMap);
      if (patternVersion) allVersionLabels.add(patternVersion);

      const patternQuestionCount = Object.values(topics).reduce((a, b) => a + b, 0);
      totalQuestions += patternQuestionCount || (pattern.categorized_questions || []).length;

      for (const [topic, count] of Object.entries(topics)) {
        if (!topicData.has(topic)) {
          topicData.set(topic, {
            topic,
            subject: null,
            frequency: 0,
            history: new Map(),
          });
        }

        const entry = topicData.get(topic);
        entry.frequency += Number(count) || 0;

        if (patternVersion) {
          entry.history.set(patternVersion, (entry.history.get(patternVersion) || 0) + (Number(count) || 0));
        }
      }

      for (const cq of pattern.categorized_questions || []) {
        if (cq?.topic && cq?.subject) {
          topicSubjects.set(cq.topic, cq.subject);
        }
      }
    }

    const sortedVersionLabels = [...allVersionLabels].sort(compareVersionLabels);
    const latestVersionLabel = sortedVersionLabels[sortedVersionLabels.length - 1] || null;
    const fallbackSubject = patternSubjectNames.values().next().value || null;

    let ranked = [...topicData.values()]
      .map((entry) => {
        const historyEntries = [...entry.history.entries()].sort(([a], [b]) => compareVersionLabels(a, b));
        const examVersionsHistory = Object.fromEntries(
          historyEntries.map(([label, value]) => [normalizeVersionValue(label, versionLabelMap) || String(label), value])
        );

        const lastAppearedLabel = historyEntries.length
          ? historyEntries[historyEntries.length - 1][0]
          : null;

        const lastAppearedNumber = lastAppearedLabel ? getVersionNumber(lastAppearedLabel) : Number.NEGATIVE_INFINITY;
        const latestVersionNumber = latestVersionLabel ? getVersionNumber(latestVersionLabel) : Number.NEGATIVE_INFINITY;
        const gap = Number.isFinite(latestVersionNumber) && Number.isFinite(lastAppearedNumber)
          ? Math.max(0, latestVersionNumber - lastAppearedNumber)
          : 0;

        const recentHistory = historyEntries.slice(-2);
        const olderHistory = historyEntries.slice(0, -2);
        const recentTrendSum = recentHistory.reduce((sum, [, count]) => sum + count, 0);
        const olderTrendSum = olderHistory.reduce((sum, [, count]) => sum + count, 0);
        const positiveTrend = Math.max(0, recentTrendSum - olderTrendSum);
        const appearedInLastExam = latestVersionLabel && lastAppearedLabel === latestVersionLabel ? 1 : 0;

        const score = Math.round(
          entry.frequency * 15 +
          gap * 10 -
          appearedInLastExam * 20 +
          positiveTrend * 5
        );

        return {
          topic: entry.topic,
          subject: topicSubjects.get(entry.topic) || fallbackSubject,
          frequency: entry.frequency,
          score,
          share_percentage:
            totalQuestions > 0
              ? Math.round((entry.frequency / totalQuestions) * 1000) / 10
              : 0,
          examVersionsHistory,
          last_appeared: lastAppearedLabel ? formatVersionLabel(lastAppearedLabel) : null,
          gap,
          appearedInLastExam,
          positiveTrend,
        };
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.frequency !== a.frequency) return b.frequency - a.frequency;
        return String(a.topic).localeCompare(String(b.topic));
      });

    if (subjectName) {
      ranked = ranked.filter(
        (t) => t.subject && t.subject.toLowerCase() === String(subjectName).toLowerCase()
      );
    }

    const topics = ranked.slice(0, topN).map((t, i) => ({ rank: i + 1, ...t }));

    res.status(200).json({
      success: true,
      exam,
      examVersion: examVersion || null,
      totalQuestions,
      totalTopics: topics.length,
      topics,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to fetch important topics" });
  }
};
