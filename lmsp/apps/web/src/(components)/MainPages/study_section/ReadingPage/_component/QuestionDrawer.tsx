import React, { useState, useMemo, useEffect } from 'react';
import { X, CheckCircle2, Bookmark, Search, ArrowRight, LayoutGrid } from 'lucide-react';
import type { CreativeQuestion } from '../tools/types';
import { toBengaliNumber, getCleanBoardName } from '../tools/bengaliUtils';
import { useTheme } from '../../../../../theme/ThemeContext';

interface QuestionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  questions: CreativeQuestion[];
  bookmarkedIds: Set<string>;
  readIds: Set<string>;
  onSelectQuestion: (questionId: string) => void;
}

export const QuestionDrawer: React.FC<QuestionDrawerProps> = ({
  isOpen,
  onClose,
  questions,
  bookmarkedIds,
  readIds,
  onSelectQuestion,
}) => {
  const { isDark } = useTheme();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'bookmarked'>('all');
  const [search, setSearch] = useState('');

  const counts = useMemo(
    () => ({
      all: questions.length,
      unread: questions.filter((q) => !readIds.has(q.id)).length,
      read: questions.filter((q) => readIds.has(q.id)).length,
      bookmarked: questions.filter((q) => bookmarkedIds.has(q.id)).length,
    }),
    [questions, readIds, bookmarkedIds]
  );

  const filteredQuestions = useMemo(
    () =>
      questions.filter((q) => {
        if (filter === 'read' && !readIds.has(q.id)) return false;
        if (filter === 'unread' && readIds.has(q.id)) return false;
        if (filter === 'bookmarked' && !bookmarkedIds.has(q.id)) return false;

        if (search.trim()) {
          const qNum = String(q.number);
          const bNum = toBengaliNumber(q.number);
          const board = q.source?.board || '';
          const raw = q.source?.raw || '';
          const s = search.toLowerCase();
          return (
            qNum.includes(s) ||
            bNum.includes(s) ||
            board.toLowerCase().includes(s) ||
            raw.toLowerCase().includes(s)
          );
        }
        return true;
      }),
    [questions, filter, search, readIds, bookmarkedIds]
  );

  // Close on Escape and lock background scroll while open
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md h-full flex flex-col shadow-2xl transition-transform ${isDark
          ? 'bg-[#111318] text-[#F5F7FA] border-l border-[#23262D]'
          : 'bg-[#f4efe6] text-[#1a1a1a] border-l-2 border-[#1a1a1a]'
          }`}
        style={{
          fontFamily: "'Hind Siliguri', 'Inter', sans-serif",
          ...(isDark
            ? {}
            : {
              backgroundImage: 'radial-gradient(#d8d4cb 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }),
        }}
      >
        {/* ── Header ── */}
        <div
          className={`px-4 py-3 flex items-center justify-between border-b ${isDark
            ? 'border-[#23262D] bg-[#161920]'
            : 'border-b-2 border-[#1a1a1a] bg-[#e8e2d4]'
            }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isDark
                ? 'bg-[#2F80ED]/15 text-[#2F80ED] border border-[#2F80ED]/30'
                : 'bg-[#1a1a1a] text-[#f4efe6] border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#b91c1c]'
                }`}
            >
              <LayoutGrid size={15} />
            </span>
            <div className="min-w-0">
              <h3
                className={`text-sm leading-tight ${isDark
                  ? 'font-bold'
                  : 'font-black font-serif'
                  }`}
              >
                প্রশ্ন নেভিগেটর
              </h3>
              <p
                className={`text-[10px] ${isDark ? 'text-[#A1A8B3]' : 'text-[#333] font-serif'
                  }`}
              >
                মোট {toBengaliNumber(questions.length)}টি প্রশ্ন
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className={`p-1.5 rounded-lg transition-colors ${isDark
              ? 'hover:bg-[#23262D] text-[#A1A8B3] hover:text-white'
              : 'hover:bg-[#ded5c2] text-[#333] border border-[#1a1a1a]'
              }`}
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Filters + Search ── */}
        <div
          className={`px-3 py-3 border-b space-y-2 ${isDark
            ? 'border-[#23262D] bg-[#0F1218]'
            : 'border-[#d8d4cb] bg-[#efe9dc]'
            }`}
        >
          {/* Filter tabs */}
          <div
            className={`flex items-center gap-0.5 p-0.5 rounded-lg ${isDark ? 'bg-[#161920]' : 'bg-black/10'
              }`}
          >
            {(
              [
                { id: 'all', label: 'সব' },
                { id: 'unread', label: 'বাকি' },
                { id: 'read', label: 'পড়া' },
                { id: 'bookmarked', label: 'সেভ' },
              ] as const
            ).map((tab) => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`flex-1 py-1 px-1.5 text-[11px] rounded-md transition-all text-center flex items-center justify-center gap-1 ${active
                    ? isDark
                      ? 'bg-[#2F80ED] text-white font-bold'
                      : 'bg-[#1a1a1a] text-[#f4efe6] font-black font-serif'
                    : isDark
                      ? 'text-[#A1A8B3] font-semibold hover:text-white'
                      : 'text-[#333] font-bold font-serif hover:text-black'
                    }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[9px] px-1 rounded-full ${active
                      ? isDark
                        ? 'bg-white/20 text-white'
                        : 'bg-[#f4efe6]/20 text-[#f4efe6]'
                      : isDark
                        ? 'bg-[#1C1F26] text-[#6B7280]'
                        : 'bg-[#d8d4cb] text-[#333]'
                      }`}
                  >
                    {toBengaliNumber(counts[tab.id])}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={12}
              className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#6B7280]' : 'text-[#666]'
                }`}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="প্রশ্ন নম্বর বা বোর্ড লিখুন..."
              className={`w-full pl-7 pr-7 py-1.5 text-[11px] rounded-lg border outline-none transition-all ${isDark
                ? 'bg-[#161920] border-[#23262D] text-[#F5F7FA] placeholder:text-[#6B7280] focus:border-[#2F80ED]'
                : 'bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] placeholder:text-[#888] font-serif focus:ring-1 focus:ring-[#1a1a1a]'
                }`}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className={`absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 transition ${isDark
                  ? 'text-[#6B7280] hover:text-white hover:bg-[#23262D]'
                  : 'text-[#666] hover:text-[#b91c1c] hover:bg-[#e0dcd5]'
                  }`}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* ── List ── */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
          {filteredQuestions.length === 0 ? (
            <div
              className={`text-center py-12 text-xs ${isDark ? 'text-[#6B7280]' : 'text-[#666] font-serif'
                }`}
            >
              কোনো প্রশ্ন পাওয়া যায়নি।
            </div>
          ) : (
            filteredQuestions.map((q) => {
              const isRead = readIds.has(q.id);
              const isBookmarked = bookmarkedIds.has(q.id);

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    onSelectQuestion(q.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all group ${isDark
                    ? 'bg-[#161920] border-[#23262D] hover:border-[#2F80ED]/50 hover:bg-[#1A1E27]'
                    : 'bg-white border-2 border-[#1a1a1a] hover:bg-[#f7f3ec] shadow-[2px_2px_0px_0px_#1a1a1a] hover:shadow-[3px_3px_0px_0px_#1a1a1a]'
                    }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span
                      className={`w-7 h-7 rounded-md flex items-center justify-center font-black text-[11px] shrink-0 ${isRead
                        ? isDark
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-[#1a1a1a] text-[#f4efe6] border border-[#1a1a1a]'
                        : isDark
                          ? 'bg-[#23262D] text-[#A1A8B3] border border-[#2e333d]'
                          : 'bg-[#e0dcd5] text-[#333] border border-[#1a1a1a] font-serif'
                        }`}
                    >
                      {toBengaliNumber(q.number)}
                    </span>

                    <div className="truncate min-w-0 flex-1">
                      <div
                        className={`text-xs truncate ${isDark
                          ? 'font-semibold'
                          : 'font-black font-serif text-[#1a1a1a]'
                          }`}
                      >
                        {getCleanBoardName(q)}
                      </div>
                      <div
                        className={`text-[10px] truncate ${isDark ? 'text-[#6B7280]' : 'text-[#555] font-serif'
                          }`}
                      >
                        {q.parts && q.parts[0]?.text
                          ? `(ক) ${q.parts[0].text}`
                          : 'সৃজনশীল প্রশ্ন'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 pl-1.5">
                    {isBookmarked && (
                      <Bookmark
                        size={12}
                        className="text-amber-500 fill-amber-500"
                      />
                    )}
                    {isRead && (
                      <CheckCircle2
                        size={12}
                        className={
                          isDark ? 'text-emerald-400' : 'text-[#1a1a1a]'
                        }
                      />
                    )}
                    <ArrowRight
                      size={13}
                      className={`transition-transform group-hover:translate-x-1 ${isDark
                        ? 'text-[#A1A8B3]'
                        : 'text-[#b91c1c] font-bold'
                        }`}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* ── Footer hint ── */}
        {filteredQuestions.length > 0 && (
          <div
            className={`px-3 py-2 border-t text-center text-[10px] ${isDark
              ? 'border-[#23262D] bg-[#0F1218] text-[#6B7280]'
              : 'border-[#d8d4cb] bg-[#efe9dc] text-[#555] font-serif'
              }`}
          >
            যেকোনো প্রশ্নে ক্লিক করলে সেখানে স্ক্রল হবে
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDrawer;