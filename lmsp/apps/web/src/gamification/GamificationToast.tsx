import { useEffect, useState, useRef } from 'react';
import { Zap, Flame, PartyPopper, Trophy, X } from 'lucide-react';

/**
 * App-wide gamification feedback: XP toasts, level-up celebration and
 * streak reminders — no toast library needed.
 *
 * Emit from anywhere:
 *   emitXpGained({ xpAwarded: 25, level: 3, xpIntoLevel: 40, xpForNextLevel: 100, progress: 40 });
 *   emitLevelUp({ level: 4 });
 *   emitStreakAlert({ currentStreak: 5 });
 */

// ─── Event types ────────────────────────────────────────────
export interface XpGainedEvent {
  xpAwarded: number;
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progress: number;
  currentStreak?: number;
  source?: string;
}

export interface LevelUpEvent {
  level: number;
  xpIntoLevel?: number;
  xpForNextLevel?: number;
}

export interface StreakAlertEvent {
  currentStreak: number;
  longestStreak?: number;
}

type GamificationEvent =
  | { kind: 'xp'; data: XpGainedEvent }
  | { kind: 'levelUp'; data: LevelUpEvent }
  | { kind: 'streak'; data: StreakAlertEvent };

type Listener = (e: GamificationEvent) => void;

// ─── Tiny event bus ─────────────────────────────────────────
const listeners = new Set<Listener>();

export function emitGamification(e: GamificationEvent) {
  listeners.forEach((l) => l(e));
}

export function emitXpGained(data: XpGainedEvent) {
  emitGamification({ kind: 'xp', data });
}

export function emitLevelUp(data: LevelUpEvent) {
  emitGamification({ kind: 'levelUp', data });
}

export function emitStreakAlert(data: StreakAlertEvent) {
  emitGamification({ kind: 'streak', data });
}

// ─── Source labels (what earned the XP) ─────────────────────
const SOURCE_LABELS: Record<string, string> = {
  mock_exam: 'Mock Exam',
  question_center: 'Question Center',
  practice: 'Practice',
};

// ─── Constants ──────────────────────────────────────────────
const XP_TOAST_MS = 5000;
const STREAK_TOAST_MS = 6000;
const MAX_STACK = 3;

// ─── Toast host ─────────────────────────────────────────────
export default function GamificationToastHost() {
  const [toasts, setToasts] = useState<
    (GamificationEvent & { id: number; leaving: boolean })[]
  >([]);
  const [levelUp, setLevelUp] = useState<LevelUpEvent | null>(null);
  const idRef = useRef(0);

  useEffect(() => {
    const listener: Listener = (e) => {
      // Level-ups get the full-screen celebration instead of a toast
      if (e.kind === 'levelUp') {
        setLevelUp(e.data);
        return;
      }

      const id = ++idRef.current;
      setToasts((prev) => [...prev.slice(-(MAX_STACK - 1)), { ...e, id, leaving: false }]);

      window.setTimeout(() => {
        setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
        window.setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 250);
      }, e.kind === 'streak' ? STREAK_TOAST_MS : XP_TOAST_MS);
    };

    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const dismiss = (id: number) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 250);
  };

  return (
    <>
      {/* ── Toast stack (bottom-right) ── */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none max-w-[calc(100vw-2.5rem)]">
        {toasts.map((t) => {
          const entering = !t.leaving;
          if (t.kind === 'xp') {
            const { xpAwarded, level, xpIntoLevel, xpForNextLevel, progress, source } = t.data;
            return (
              <div
                key={t.id}
                className={`pointer-events-auto w-80 max-w-full rounded-2xl border border-[#F2C94C]/40 bg-[#161920]/95 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.5)] p-4 ${
                  entering ? 'gt-enter' : 'gt-leave'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F2C94C]/15 border border-[#F2C94C]/40 flex items-center justify-center shrink-0">
                    <Zap size={20} className="text-[#F2C94C] fill-[#F2C94C]/30" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[#F2C94C]">+{xpAwarded} XP</p>
                      {source && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#161920] border border-[#23262D] text-[#A1A8B3] font-semibold uppercase tracking-wide">
                          {SOURCE_LABELS[source] || source}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#A1A8B3] mt-0.5">
                      Level {level} · {xpIntoLevel}/{xpForNextLevel} XP
                    </p>
                    <div className="h-1.5 w-full bg-[#23262D] rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#F2C94C] to-[#00E5B3]"
                        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => dismiss(t.id)}
                    className="p-1 rounded-lg text-[#6B7280] hover:text-[#F5F7FA] hover:bg-[#23262D] transition-colors"
                    aria-label="Dismiss"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          }

          if (t.kind === 'streak') {
            const { currentStreak, longestStreak } = t.data;
            return (
              <div
                key={t.id}
                className={`pointer-events-auto w-80 max-w-full rounded-2xl border border-[#EB5757]/40 bg-[#161920]/95 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.5)] p-4 ${
                  entering ? 'gt-enter' : 'gt-leave'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EB5757]/15 border border-[#EB5757]/40 flex items-center justify-center shrink-0">
                    <Flame size={20} className="text-[#EB5757]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#F5F7FA]">
                      {currentStreak}-day streak — keep it alive!
                    </p>
                    <p className="text-[11px] text-[#A1A8B3] mt-0.5">
                      Answer a question today
                      {longestStreak ? ` · Best: ${longestStreak}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => dismiss(t.id)}
                    className="p-1 rounded-lg text-[#6B7280] hover:text-[#F5F7FA] hover:bg-[#23262D] transition-colors"
                    aria-label="Dismiss"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* ── Level-up celebration overlay ── */}
      {levelUp && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm gt-fade"
          onClick={() => setLevelUp(null)}
        >
          {/* Confetti particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 28 }).map((_, i) => {
              const colors = ['#F2C94C', '#00E5B3', '#2F80ED', '#9B51E0', '#EB5757'];
              return (
                <span
                  key={i}
                  className="absolute gt-confetti"
                  style={{
                    left: `${(i * 37) % 100}%`,
                    width: i % 3 === 0 ? 8 : 6,
                    height: i % 3 === 0 ? 8 : 6,
                    borderRadius: i % 3 === 0 ? '50%' : '2px',
                    background: colors[i % colors.length],
                    animationDelay: `${(i % 10) * 0.15}s`,
                    animationDuration: `${2 + (i % 5) * 0.4}s`,
                  }}
                />
              );
            })}
          </div>

          <div
            className="relative gt-pop rounded-3xl border border-[#F2C94C]/50 bg-gradient-to-b from-[#1C1F26] to-[#111318] px-10 py-9 text-center shadow-[0_24px_80px_rgba(0,0,0,0.7)] max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLevelUp(null)}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-[#6B7280] hover:text-[#F5F7FA] hover:bg-[#23262D] transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div className="w-20 h-20 mx-auto rounded-full bg-[#F2C94C]/15 border-2 border-[#F2C94C] flex items-center justify-center gt-glow mb-4">
              <Trophy size={36} className="text-[#F2C94C]" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#A1A8B3] mb-1">
              Level Up
            </p>
            <h2 className="text-3xl font-extrabold text-[#F2C94C] mb-2">
              Level {levelUp.level}!
            </h2>
            {levelUp.xpForNextLevel != null && (
              <p className="text-xs text-[#A1A8B3] mb-5">
                {levelUp.xpIntoLevel ?? 0}/{levelUp.xpForNextLevel} XP toward level{' '}
                {levelUp.level + 1}
              </p>
            )}
            <button
              onClick={() => setLevelUp(null)}
              className="px-6 py-2.5 rounded-xl bg-[#F2C94C] text-black text-sm font-bold hover:bg-[#E0B93E] transition active:scale-95"
            >
              Keep going
            </button>
          </div>
        </div>
      )}
    </>
  );
}
