import User from "../models/User.js";
import { levelFromXp, awardXp, updateStreakOnActivity, XP_REWARDS } from "../utils/gamification.js";

/**
 * GET /gamification/me
 * Returns the authenticated user's XP, streaks and derived level.
 */
export const getMyGamification = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      'xp currentStreak longestStreak lastActiveDate'
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const levelInfo = levelFromXp(user.xp || 0);

    // Whether the streak is still alive today (for UI messaging)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const last = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    if (last) last.setHours(0, 0, 0, 0);
    const activeToday = !!last && last.getTime() === today.getTime();

    res.status(200).json({
      xp: user.xp || 0,
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      lastActiveDate: user.lastActiveDate || null,
      activeToday,
      ...levelInfo,
    });
  } catch (err) {
    console.error('getMyGamification error:', err);
    res.status(500).json({ message: 'Unable to load gamification data' });
  }
};

/**
 * POST /gamification/practice
 * XP for self-graded practice sessions that don't go through QuizAttempt
 * (e.g. the Question Center / ExamDin practice flow).
 *
 * Body: { correctCount: number, totalCount: number, source?: string }
 *
 * Uses the same reward table as the mock-exam flow so XP stays consistent.
 * Idempotent per request — the client calls it once per submit, not per answer.
 */
export const awardPracticeXp = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { correctCount, totalCount, source } = req.body;

    const correct = Math.max(0, parseInt(correctCount, 10) || 0);
    const total = Math.max(0, parseInt(totalCount, 10) || 0);
    const answered = Math.min(correct, total);

    if (total <= 0) {
      return res.status(400).json({ message: "totalCount must be > 0" });
    }

    // 1) streak counts the day as active
    await updateStreakOnActivity(userId);

    // 2) XP: completion bonus + per-question effort, same table as quiz attempts
    const percentage = total > 0 ? Math.round((answered / total) * 100) : 0;
    const wrongCount = Math.max(0, answered - correct);
    const xp =
      XP_REWARDS.QUIZ_COMPLETED +
      (percentage >= 80 ? XP_REWARDS.QUIZ_HIGH_SCORE : 0) +
      correct * XP_REWARDS.QUESTION_CORRECT +
      wrongCount * XP_REWARDS.QUESTION_ATTEMPTED;

    const result = await awardXp(userId, xp);
    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ success: true, source: source || "practice", ...result });
  } catch (err) {
    console.error("awardPracticeXp error:", err);
    res.status(500).json({ message: "Unable to award practice XP" });
  }
};

/**
 * GET /gamification/leaderboard?range=week|all&limit=20
 * Top users by XP. Week = users active in the last 7 days, ranked by weekly
 * effort is approximated here by XP (weekly XP tracking would need per-day XP
 * history; this keeps it simple and index-friendly).
 */
export const getLeaderboard = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const range = req.query.range === 'week' ? 'week' : 'all';

    const filter = range === 'week'
      ? { lastActiveDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
      : {};

    const users = await User.find(filter, 'name username profilePic xp currentStreak role')
      .sort({ xp: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      range,
      leaderboard: users.map((u, i) => ({
        rank: i + 1,
        _id: u._id,
        name: u.name || u.username || 'Anonymous',
        profilePic: u.profilePic || null,
        xp: u.xp || 0,
        currentStreak: u.currentStreak || 0,
      })),
    });
  } catch (err) {
    console.error('getLeaderboard error:', err);
    res.status(500).json({ message: 'Unable to load leaderboard' });
  }
};
