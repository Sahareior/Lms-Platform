/**
 * One-time migration: backfill the `category` field for exams that were
 * created before exam categories (academic / job_preparation) existed.
 *
 * Exams created before this feature get the default `job_preparation` category.
 *
 * Usage (from the lmss/ directory):
 *   node scripts/backfillExamCategories.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import Exam from '../models/Exam.js';

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';

async function run() {
  await mongoose.connect(url);
  console.log('MongoDB connected');

  // $in: [null] matches documents where category is missing OR null
  const result = await Exam.updateMany(
    { category: { $in: [null, ''] } },
    { $set: { category: 'job_preparation' } }
  );

  console.log(`Backfilled category on ${result.modifiedCount} exam(s)`);
  console.log('Exam category distribution:');
  const counts = await Exam.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  counts.forEach(({ _id, count }) => console.log(`  ${_id}: ${count}`));

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
