/**
 * One-time import: push the Reading page's static testPaper.json into MongoDB
 * as a CreativeQuestionSet, so the Reading page can be served from the
 * database and managed from the admin panel.
 *
 * The target exam/examVersion/subject are picked by NAME (they are created
 * through the admin panel if they don't exist yet).
 *
 * Usage (from the lmss/ directory):
 *   node scripts/importTestPaper.js \
 *     --exam "HSC" \
 *     --examVersion "2026" \
 *     --subject "তথ্য ও যোগাযোগ প্রযুক্তি" \
 *     [--file ../lmsp/apps/web/src/\(components\)/MainPages/study_section/ReadingPage/testPaper.json] \
 *     [--title "..."] [--description "..."] [--replace]
 *
 * --replace  deletes any existing set for the same exam/examVersion/subject
 *            before importing (otherwise the import aborts on duplicates).
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import CreativeQuestionSet from '../models/CreativeQuestionSet.js';
import Exam from '../models/Exam.js';
import ExamVersion from '../models/ExamVersionModel.js';
import Subject from '../models/SubjectModel.js';
import { validateCreativeQuestionPayload } from '../controller/CreativeQuestionController.js';

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';

const DEFAULT_FILE =
  '../lmsp/apps/web/src/(components)/MainPages/study_section/ReadingPage/testPaper.json';

// Very small arg parser: --key value / --flag
const args = process.argv.slice(2);
const getArg = (name) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : undefined;
};
const hasFlag = (name) => args.includes(`--${name}`);

const EXAM_NAME = getArg('exam') || 'HSC';
const EXAM_VERSION = getArg('examVersion') || '';
const SUBJECT_NAME = getArg('subject') || '';
const FILE = getArg('file') || DEFAULT_FILE;
const TITLE = getArg('title') || 'টেস্ট পেপার (সৃজনশীল)';
const DESCRIPTION = getArg('description') || '';
const REPLACE = hasFlag('replace');

async function findOrCreateExam(name) {
  let exam = await Exam.findOne({ name });
  if (exam) return exam;
  // HSC is academic, others default to job_preparation
  const category = /hsc|ssc/i.test(name) ? 'academic' : 'job_preparation';
  exam = await Exam.create({ name, category });
  console.log(`Created exam: "${name}" (${category})`);
  return exam;
}

async function findOrCreateExamVersion(examId, label) {
  if (!label) return null;
  let version = await ExamVersion.findOne({ exam: examId, examVersion: label });
  if (version) return version;
  version = await ExamVersion.create({ exam: examId, examVersion: label });
  console.log(`Created exam version: "${label}"`);
  return version;
}

async function findOrCreateSubject(examId, name) {
  if (!name) return null;
  let subject = await Subject.findOne({ exam: examId, name });
  if (subject) return subject;
  subject = await Subject.create({ exam: examId, name });
  console.log(`Created subject: "${name}"`);
  return subject;
}

async function run() {
  await mongoose.connect(url);
  console.log('MongoDB connected');

  // ── Load and validate the JSON file ──────────────────────────
  const filePath = path.resolve(FILE);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  let payload;
  try {
    payload = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`Invalid JSON: ${err.message}`);
    process.exit(1);
  }

  const errors = validateCreativeQuestionPayload(payload);
  if (errors.length > 0) {
    console.error(`Validation failed with ${errors.length} error(s):`);
    errors.slice(0, 20).forEach((e) => console.error(`  - ${e}`));
    if (errors.length > 20) console.error(`  ...and ${errors.length - 20} more`);
    process.exit(1);
  }
  console.log(`JSON valid: ${payload.length} questions`);

  // ── Resolve exam / version / subject ─────────────────────────
  const exam = await findOrCreateExam(EXAM_NAME);
  const examVersion = await findOrCreateExamVersion(exam._id, EXAM_VERSION);
  const subject = await findOrCreateSubject(exam._id, SUBJECT_NAME);

  // ── Duplicate guard ──────────────────────────────────────────
  const filter = { exam: exam._id, subject: subject?._id ?? null };
  if (examVersion) filter.examVersion = examVersion._id;
  else filter.examVersion = null;

  const existing = await CreativeQuestionSet.findOne(filter);
  if (existing) {
    if (!REPLACE) {
      console.error(
        'A question set already exists for this exam/examVersion/subject combination.'
      );
      console.error('Re-run with --replace to delete it and import fresh data.');
      await mongoose.disconnect();
      process.exit(1);
    }
    await CreativeQuestionSet.deleteOne({ _id: existing._id });
    console.log('Removed existing set (--replace)');
  }

  // ── Import ───────────────────────────────────────────────────
  const createPayload = {
    exam: exam._id,
    questions: payload,
    title: TITLE,
  };
  if (examVersion) createPayload.examVersion = examVersion._id;
  if (subject) createPayload.subject = subject._id;
  if (DESCRIPTION) createPayload.description = DESCRIPTION;

  const saved = await CreativeQuestionSet.create(createPayload);

  const chapters = [...new Set(payload.map((q) => q.chapterId))];
  console.log('─'.repeat(50));
  console.log(`Imported set ${saved._id}`);
  console.log(`  exam:        ${EXAM_NAME} (${exam._id})`);
  if (examVersion) console.log(`  examVersion: ${EXAM_VERSION} (${examVersion._id})`);
  if (subject) console.log(`  subject:     ${SUBJECT_NAME} (${subject._id})`);
  console.log(`  questions:   ${saved.questions.length}`);
  console.log(`  chapters:    ${chapters.join(', ')}`);
  console.log('─'.repeat(50));

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch(async (err) => {
  console.error('Import failed:', err.message);
  try { await mongoose.disconnect(); } catch { /* ignore */ }
  process.exit(1);
});
