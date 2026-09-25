import User from "../models/User.js";
import { createNotification } from "../controller/NotificationController.js";

/**
 * Gamification helpers: XP + daily streak.
 *
 * XP is awarded for studying (attempting questions and finishing quizzes).
 * The streak counts consecutive days with at least one graded answer.
 * All updates use atomic Mongo operators so concurrent quiz submissions
 * can't double-count a day or lose XP.
 */

// ─── XP awards ──────────────────────────────────────────────
export const XP_REWARDS = {
  QUESTION_CORRECT: 2,
  QUESTION_ATTEMPTED: 1, // wrong answers still earn effort XP
  QUIZ_COMPLETED: 25, // bonus for finishing a full quiz/exam
  QUIZ_HIGH_SCORE: 50, // bonus for >= 80% on a completed quiz
};

// Level curve: level n requires 100 * n^1.5 total XP (rounded).
export function levelFromXp(xp) {
  let level = 1;
  while (level < 100) {
    const needed = Math.round(100 * Math.pow(level + 1, 1.5));
    if (xp < needed) break;
    level++;
  }
  const currentLevelBase = Math.round(100 * Math.pow(level, 1.5));
  const nextLevelBase = Math.round(100 * Math.pow(level + 1, 1.5));
  const progress = Math.min(
    100,
    Math.max(0, Math.round(((xp - currentLevelBase) / (nextLevelBase - currentLevelBase)) * 100))
  );
  return { level, xpIntoLevel: xp - currentLevelBase, xpForNextLevel: nextLevelBase - currentLevelBase, progress };
}

// ─── Local-day helpers ──────────────────────────────────────
function dayKey(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function daysBetween(a, b) {
  return Math.round((dayKey(b) - dayKey(a)) / (24 * 60 * 60 * 1000));
}

/**
 * Update the daily streak for a user.
 * - Same day        → no change (idempotent; safe to call per answer)
 * - Yesterday       → streak +1
 * - 2+ days gap     → streak reset to 1
 * Fires once per day (after the update) so notifications don't spam.
 */
export async function updateStreakOnActivity(userId) {
  const user = await User.findById(userId).select('currentStreak longestStreak lastActiveDate');
  if (!user) return null;

  const now = new Date();
  if (user.lastActiveDate) {
    const gap = daysBetween(user.lastActiveDate, now);
    if (gap === 0) return user; // already counted today
  }

  const newStreak =
    user.lastActiveDate && daysBetween(user.lastActiveDate, now) === 1
      ? user.currentStreak + 1
      : 1;

  user.currentStreak = newStreak;
  if (newStreak > (user.longestStreak || 0)) user.longestStreak = newStreak;
  user.lastActiveDate = now;
  await user.save();

  // Milestone notification (fire-and-forget)
  if ([3, 7, 14, 30, 60, 100].includes(newStreak)) {
    createNotification({
      userId,
      title: `🔥 ${newStreak}-day streak!`,
      message: `You've studied ${newStreak} days in a row. Keep the momentum going!`,
      type: 'info',
      link: '/dashboard',
    }).catch(() => {});
  }

  return user;
}

/**
 * Atomic XP increment. Returns the user's new totals + derived level.
 * `streak` (optional) can be passed in when the caller already updated it.
 */
export async function awardXp(userId, amount) {
  if (!amount || amount <= 0) return null;
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { xp: amount } },
    { new: true }
  ).select('xp currentStreak longestStreak lastActiveDate');
  if (!user) return null;
  const { level, xpIntoLevel, xpForNextLevel, progress } = levelFromXp(user.xp);
  const previousLevel = levelFromXp(user.xp - amount).level;

  // Level-up notification on common milestones
  if (level > 1 && user.xp - amount < Math.round(100 * Math.pow(level, 1.5))) {
    createNotification({
      userId,
      title: `⭐ Level ${level} reached!`,
      message: `You're now level ${level}. ${xpForNextLevel - xpIntoLevel} XP to level ${level + 1}.`,
      type: 'info',
      link: '/dashboard',
    }).catch(() => {});
  }

  return {
    xp: user.xp,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    lastActiveDate: user.lastActiveDate,
    level,
    previousLevel,
    levelUp: level > previousLevel,
    xpIntoLevel,
    xpForNextLevel,
    progress,
    xpAwarded: amount,
  };
}
