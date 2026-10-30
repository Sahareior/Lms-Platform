/**
 * One-time migration: mark legacy question sets as board questions.
 *
 * Older uploads predate the questionType field, so every set was saved without
 * a category. Since all of those uploaded sets are board questions, we backfill
 * them to `questionType: 'board'`.
 *
 * Usage (from the lmss/ directory):
 *   node scripts/backfillQuestionTypes.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import QuestionModel from '../models/QuestionModel.js';

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';

async function run() {
  await mongoose.connect(url);
  console.log('MongoDB connected');

  const result = await QuestionModel.updateMany(
    {
      $or: [
        { questionType: { $in: [null, ''] } },
        { questionType: { $exists: false } },
      ],
    },
    { $set: { questionType: 'board' } }
  );

  console.log(`Backfilled questionType on ${result.modifiedCount} question set(s)`);

  const counts = await QuestionModel.aggregate([
    { $group: { _id: '$questionType', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  console.log('Question type distribution:');
  counts.forEach(({ _id, count }) => console.log(`  ${_id || 'missing'}: ${count}`));

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
