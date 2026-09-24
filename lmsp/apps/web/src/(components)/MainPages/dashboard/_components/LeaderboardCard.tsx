import { useState } from 'react';
import { Trophy, Medal, Flame, ChevronRight, Loader2, Crown } from 'lucide-react';
import { useGetLeaderboardQuery } from '@my-monorepo/store';
import type { LeaderboardEntry } from '@my-monorepo/store';
import { useAppSelector } from '@my-monorepo/store';

const MEDAL_COLORS: Record<number, string> = {
  1: 'text-[#F2C94C]',
  2: 'text-[#A1A8B3]',
  3: 'text-[#C97B4A]',
};

/**
 * Dashboard card: weekly/all-time XP leaderboard.
 * Lets the user see how their XP and streak compare with other learners.
 */
export default function LeaderboardCard({ isDark }: { isDark: boolean }) {
  const [range, setRange] = useState<'week' | 'all'>('week');
  const { data, isLoading } = useGetLeaderboardQuery({ range, limit: 10 });
  const me = useAppSelector((state) => state.user.user);

  const leaderboard: LeaderboardEntry[] = data?.leaderboard ?? [];
  const myRank = leaderboard.find((e) => e._id === me?._id);

  // ─── LIGHT MODE (Vintage/Editorial Style) ──────────────────
  if (!isDark) {
    return (
      <div
        className="bg-[#f2efe9] border border-[#d8d4cb] rounded-lg p-5 flex flex-col shadow-[3px_3px_0px_0px_#1a1a1a]"
        style={{
          backgroundImage: 'radial-gradient(#d8d4cb 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={20} className="text-[#1a1a1a]" />
              <h2 className="text-lg font-black text-[#1a1a1a] font-serif tracking-tight">XP Leaderboard</h2>
            </div>
            <p className="text-[11px] text-[#4a4a4a] font-serif italic">
              {range === 'week' ? 'Most active learners this week' : 'All-time top learners'}
            </p>
          </div>

          {/* Week / All-time toggle */}
          <div className="flex bg-[#e0dcd5] border border-[#d8d4cb] rounded-md p-0.5">
            {(['week', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold font-serif transition-colors ${
                  range === r
                    ? 'bg-[#b91c1c] text-[#f2efe9]'
                    : 'text-[#4a4a4a] hover:text-[#1a1a1a]'
                }`}
              >
                {r === 'week' ? 'Week' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-[#b91c1c]" />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <Trophy size={24} className="text-[#4a4a4a] mx-auto mb-2" />
            <p className="text-xs text-[#4a4a4a] font-serif italic">No ranked learners yet — be the first!</p>
          </div>
        ) : (
          <>
            {/* ── Scrollable leaderboard list ── */}
            <div className="flex-1 min-h-0 max-h-[250px] overflow-y-auto custom-scrollbar pr-1 relative z-10">
              <div className="space-y-2">
                {leaderboard.slice(0, 6).map((entry) => {
                  const isMe = entry._id === me?._id;
                  return (
                    <div
                      key={entry._id}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md border transition-colors ${
                        isMe
                          ? 'bg-[#e0dcd5] border-[#b91c1c] shadow-[1px_1px_0px_0px_#b91c1c]'
                          : 'bg-[#f2efe9] border-[#d8d4cb] shadow-[1px_1px_0px_0px_#1a1a1a]'
                      }`}
                    >
                      {/* Rank */}
                      <div
                        className={`w-6 text-center text-sm font-black shrink-0 font-serif ${
                          entry.rank === 1 ? 'text-[#b91c1c]' : 'text-[#1a1a1a]'
                        }`}
                      >
                        {entry.rank === 1 ? <Crown size={16} className="mx-auto text-[#b91c1c]" /> : entry.rank}
                      </div>

                      {/* Avatar */}
                      <div
                        className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 overflow-hidden ${
                          entry.rank <= 3 ? 'bg-[#1a1a1a] border-[#1a1a1a]' : 'bg-[#e0dcd5] border-[#d8d4cb]'
                        }`}
                      >
                        {entry.profilePic ? (
                          <img
                            src={entry.profilePic}
                            alt={entry.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span
                            className={`text-[11px] font-bold font-serif ${
                              entry.rank <= 3 ? 'text-[#f2efe9]' : 'text-[#1a1a1a]'
                            }`}
                          >
                            {entry.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Name + streak */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs font-bold truncate font-serif ${
                            isMe ? 'text-[#b91c1c]' : 'text-[#1a1a1a]'
                          }`}
                        >
                          {entry.name}
                          {isMe && <span className="text-[10px] text-[#b91c1c]"> (You)</span>}
                        </p>
                        <p className="text-[10px] text-[#4a4a4a] flex items-center gap-1 font-serif">
                          <Flame size={10} className={entry.currentStreak > 0 ? 'text-[#b91c1c]' : ''} />
                          {entry.currentStreak}-day streak
                        </p>
                      </div>

                      {/* XP */}
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-[#1a1a1a] font-serif">
                          {entry.xp.toLocaleString()}
                        </p>
                        <p className="text-[9px] text-[#4a4a4a] font-bold uppercase tracking-wider font-serif">XP</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* My rank (if outside top 6) — pinned below the scroll area */}
            {myRank && myRank.rank > 6 && (
              <div className="mt-2 pt-2 border-t border-[#d8d4cb] relative z-10">
                <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-[#e0dcd5] border border-[#b91c1c] shadow-[1px_1px_0px_0px_#b91c1c]">
                  <div className="w-6 text-center text-sm font-black text-[#4a4a4a] shrink-0 font-serif">
                    {myRank.rank}
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#e0dcd5] border border-[#d8d4cb] flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-bold text-[#1a1a1a] font-serif">
                      {(me?.name || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <p className="flex-1 text-xs font-bold text-[#b91c1c] font-serif truncate">
                    {me?.name || 'You'} <span className="text-[10px]">(You)</span>
                  </p>
                  <p className="text-sm font-black text-[#1a1a1a] font-serif">
                    {myRank.xp.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Where XP comes from */}
            <p className="text-[10px] text-[#4a4a4a] mt-3 flex items-center gap-1 font-serif italic relative z-10">
              <ChevronRight size={10} />
              Earn XP by finishing quizzes and answering questions
            </p>
          </>
        )}
      </div>
    );
  }

  // ─── DARK MODE (Original Code + overflow) ─────────────────
  return (
    <div className="bg-[#111318] border border-[#23262D] rounded-2xl p-4 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#F2C94C]/10 border border-[#F2C94C]/30 rounded-lg text-[#F2C94C]">
              <Trophy size={16} />
            </div>
            <h2 className="text-base font-bold text-[#F5F7FA] tracking-tight">XP Leaderboard</h2>
          </div>
          <p className="text-[11px] text-[#A1A8B3] mt-1">
            {range === 'week' ? 'Most active learners this week' : 'All-time top learners'}
          </p>
        </div>

        <div className="flex bg-[#0B0D12] border border-[#23262D] rounded-lg p-0.5">
          {(['week', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                range === r
                  ? 'bg-[#F2C94C] text-black'
                  : 'text-[#A1A8B3] hover:text-[#F5F7FA]'
              }`}
            >
              {r === 'week' ? 'Week' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-[#F2C94C]" />
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-12">
          <Trophy size={24} className="text-[#6B7280] mx-auto mb-2" />
          <p className="text-xs text-[#A1A8B3]">No ranked learners yet — be the first!</p>
        </div>
      ) : (
        <>
          {/* ── Scrollable leaderboard list ── */}
          <div className="flex-1 min-h-0 max-h-[240px] overflow-y-auto custom-scrollbar pr-1">
            <div className="space-y-1.5">
              {leaderboard.slice(0, 6).map((entry) => {
                const isMe = entry._id === me?._id;
                return (
                  <div
                    key={entry._id}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-colors ${
                      isMe
                        ? 'bg-[#2F80ED]/10 border-[#2F80ED]/40'
                        : 'bg-[#161920] border-[#23262D]'
                    }`}
                  >
                    <div
                      className={`w-6 text-center text-sm font-extrabold shrink-0 ${
                        MEDAL_COLORS[entry.rank] || 'text-[#6B7280]'
                      }`}
                    >
                      {entry.rank === 1 ? <Crown size={16} className="mx-auto" /> : entry.rank}
                    </div>

                    <div className="w-7 h-7 rounded-full bg-[#23262D] border border-[#323742] overflow-hidden flex items-center justify-center shrink-0">
                      {entry.profilePic ? (
                        <img
                          src={entry.profilePic}
                          alt={entry.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-[11px] font-bold text-[#A1A8B3]">
                          {entry.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-semibold truncate ${
                          isMe ? 'text-[#2F80ED]' : 'text-[#F5F7FA]'
                        }`}
                      >
                        {entry.name}
                        {isMe && <span className="text-[10px] text-[#2F80ED]"> (You)</span>}
                      </p>
                      <p className="text-[10px] text-[#6B7280] flex items-center gap-1">
                        <Flame size={10} className={entry.currentStreak > 0 ? 'text-[#EB5757]' : ''} />
                        {entry.currentStreak}-day streak
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-[#F2C94C]">
                        {entry.xp.toLocaleString()}
                      </p>
                      <p className="text-[9px] text-[#6B7280] uppercase tracking-wide">XP</p>
                      {entry.rank <= 3 && (
                        <Medal size={11} className={`ml-auto mt-0.5 ${MEDAL_COLORS[entry.rank]}`} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {myRank && myRank.rank > 6 && (
            <div className="mt-2 pt-2 border-t border-[#23262D]">
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#2F80ED]/10 border border-[#2F80ED]/40">
                <div className="w-6 text-center text-sm font-extrabold text-[#6B7280] shrink-0">
                  {myRank.rank}
                </div>
                <div className="w-7 h-7 rounded-full bg-[#23262D] border border-[#323742] flex items-center justify-center shrink-0">
                  <span className="text-[11px] font-bold text-[#A1A8B3]">
                    {(me?.name || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="flex-1 text-xs font-semibold text-[#2F80ED] truncate">
                  {me?.name || 'You'} <span className="text-[10px]">(You)</span>
                </p>
                <p className="text-xs font-bold text-[#F2C94C]">
                  {myRank.xp.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <p className="text-[10px] text-[#6B7280] mt-3 flex items-center gap-1">
            <ChevronRight size={10} />
            Earn XP by finishing quizzes and answering questions
          </p>
        </>
      )}
    </div>
  );
}