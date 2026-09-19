import { useEffect, useRef } from 'react';
import { Flame, Star, Zap } from 'lucide-react';
import { useGetMyGamificationQuery } from '@my-monorepo/store';
import { emitStreakAlert } from '../../../../gamification/GamificationToast';

/**
 * Dashboard card: XP, level progress and the daily study streak.
 * Hidden entirely when the user has no activity yet (keeps new-user
 * dashboards clean).
 */
export default function StreakCard({ isDark }: { isDark: boolean }) {
  const { data } = useGetMyGamificationQuery();

  // Nudge once per day when the streak is at risk (visited the dashboard but
  // hasn't answered anything today yet).
  const alertedRef = useRef(false);
  useEffect(() => {
    if (
      data &&
      !alertedRef.current &&
      data.currentStreak > 0 &&
      !data.activeToday
    ) {
      alertedRef.current = true;
      emitStreakAlert({
        currentStreak: data.currentStreak,
        longestStreak: data.longestStreak,
      });
    }
  }, [data]);

  // Don't render for brand-new users with no XP at all
  if (!data || (data.xp === 0 && data.currentStreak === 0)) return null;

  const { xp, level, xpIntoLevel, xpForNextLevel, progress, currentStreak, longestStreak, activeToday } = data;

  // ─── LIGHT MODE (Vintage/Editorial Style) ──────────────────
  if (!isDark) {
    return (
      <div className="bg-[#f2efe9] border border-[#d8d4cb] rounded-xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-5 shadow-[2px_2px_0px_0px_#1a1a1a]">
        
        {/* ── Level Ring ── */}
        <div className="relative h-20 w-20 shrink-0">
          <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
            {/* Track */}
            <circle cx="40" cy="40" r="34" fill="none" stroke="#d8d4cb" strokeWidth="6" />
            {/* Progress */}
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="#1a1a1a"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(progress / 100) * 2 * Math.PI * 34} ${2 * Math.PI * 34}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-[#4a4a4a] uppercase tracking-wider font-serif">Level</span>
            <span className="text-2xl font-black text-[#1a1a1a] leading-none font-serif">{level}</span>
          </div>
        </div>

        {/* ── XP Progress ── */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Star size={16} className="text-[#1a1a1a]" />
            <span className="text-base font-bold text-[#1a1a1a] font-serif">{xp.toLocaleString()} XP</span>
            <span className="text-xs text-[#4a4a4a] italic">
              · {xpForNextLevel - xpIntoLevel} XP to level {level + 1}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-3 w-full bg-[#e0dcd5] rounded-full overflow-hidden border border-[#d8d4cb]">
            <div
              className="h-full rounded-full bg-[#b91c1c] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <p className="text-[11px] text-[#4a4a4a] mt-2 italic font-serif">
            Earn XP by answering questions and completing quizzes.
          </p>
        </div>

        {/* ── Streak Alert ── */}
        <div
          className={`flex items-center gap-3 rounded-lg border px-4 py-3 shrink-0 ${
            activeToday
              ? 'bg-[#f2efe9] border-[#b91c1c]'
              : 'bg-[#f2efe9] border-[#d8d4cb]'
          }`}
          title={activeToday ? "Streak safe for today" : "Answer a question today to keep your streak!"}
        >
          <Flame
            size={24}
            className={currentStreak > 0 ? 'text-[#b91c1c]' : 'text-[#4a4a4a]'}
          />
          <div>
            <p className="text-xl font-black text-[#1a1a1a] leading-none font-serif">{currentStreak}</p>
            <p className="text-[10px] font-bold text-[#1a1a1a] uppercase tracking-widest font-serif">
              day streak{currentStreak > 0 && !activeToday ? ' · at risk!' : ''}
            </p>
            <p className="text-[10px] text-[#4a4a4a] font-serif">Best: {longestStreak}</p>
          </div>
        </div>

        {/* Small Zap Accent */}
        <Zap size={16} className="hidden sm:block text-[#b91c1c]/40" />
      </div>
    );
  }

  // ─── DARK MODE (Original Code - Unchanged) ─────────────────
  return (
    <div className="bg-[#111318] border border-[#23262D] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-5">
      {/* ── Level ring ── */}
      <div className="relative h-20 w-20 shrink-0">
        <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
          <circle cx="40" cy="40" r="34" fill="none" stroke="#23262D" strokeWidth="7" />
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="#F2C94C"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${(progress / 100) * 2 * Math.PI * 34} ${2 * Math.PI * 34}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-bold text-[#A1A8B3] uppercase">Level</span>
          <span className="text-xl font-bold text-[#F2C94C] leading-none">{level}</span>
        </div>
      </div>

      {/* ── XP progress ── */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Star size={14} className="text-[#F2C94C]" />
          <span className="text-sm font-bold text-[#F5F7FA]">{xp.toLocaleString()} XP</span>
          <span className="text-[11px] text-[#6B7280]">
            · {xpForNextLevel - xpIntoLevel} XP to level {level + 1}
          </span>
        </div>
        <div className="h-2 w-full bg-[#23262D] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#F2C94C] to-[#00E5B3] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[11px] text-[#6B7280] mt-1.5">
          Earn XP by answering questions and completing quizzes.
        </p>
      </div>

      {/* ── Streak ── */}
      <div
        className={`flex items-center gap-3 rounded-xl border px-4 py-3 shrink-0 ${
          activeToday
            ? 'bg-[#EB5757]/10 border-[#EB5757]/30'
            : 'bg-[#161920] border-[#23262D]'
        }`}
        title={activeToday ? "Streak safe for today" : "Answer a question today to keep your streak!"}
      >
        <Flame
          size={22}
          className={currentStreak > 0 ? 'text-[#EB5757]' : 'text-[#6B7280]'}
        />
        <div>
          <p className="text-lg font-bold text-[#F5F7FA] leading-none">{currentStreak}</p>
          <p className="text-[10px] text-[#A1A8B3] uppercase tracking-wide">
            day streak{currentStreak > 0 && !activeToday ? ' · at risk' : ''}
          </p>
          <p className="text-[10px] text-[#6B7280]">Best: {longestStreak}</p>
        </div>
      </div>

      {/* small zap accent */}
      <Zap size={14} className="hidden sm:block text-[#F2C94C]/40" />
    </div>
  );
}