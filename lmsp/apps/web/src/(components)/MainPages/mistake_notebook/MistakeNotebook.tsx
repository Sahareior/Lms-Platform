import { useMemo, useState } from 'react';
import {
  NotebookPen,
  CheckCircle2,
  XCircle,
  Star,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Inbox,
  Trophy,
  Layers,
  BookOpenCheck,
} from 'lucide-react';
import {
  useGetNotebookQuestionsQuery,
  type NotebookItem,
} from '@my-monorepo/store';
import { useTheme } from '../../../theme/ThemeContext';
import ReusableHeader from '../../../reusable/ReusableHeader';


type Tab = 'right' | 'wrong' | 'favorites';

const TAB_META: Record<
  Tab,
  { label: string; icon: typeof Inbox; accent: string; empty: string }
> = {
  right: {
    label: 'Right answers',
    icon: CheckCircle2,
    accent: '#00E5B3',
    empty: 'No right answers recorded yet — submit a quiz and your correct answers will show up here.',
  },
  wrong: {
    label: 'Wrong answers',
    icon: XCircle,
    accent: '#EB5757',
    empty: 'No wrong answers recorded yet — great job! Mistakes from your quizzes will appear here automatically.',
  },
  favorites: {
    label: 'Favorites',
    icon: Star,
    accent: '#F2C94C',
    empty: 'No favorite questions yet. Tap the heart on any question to save it here for quick revision.',
  },
};

const letters = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ'];
const OPTION_KEYS = ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'];

/** Expandable card for a single notebook question. */
function NotebookCard({ item, accent, isDark }: { item: NotebookItem; accent: string; isDark: boolean }) {
  const [expanded, setExpanded] = useState(true);

  const optionEntries = useMemo(
    () =>
      item.options
        ? (Object.entries(item.options).filter(([, v]) => v) as [string, string][])
        : [],
    [item.options]
  );

  const isRight =
    !!item.correctAnswer &&
    String(item.providedAnswer ?? '').trim() === String(item.correctAnswer).trim();

  // ─── LIGHT MODE (Vintage Paper Style) ───────────────────────
  if (!isDark) {
    return (
      <div className="bg-[#f2efe9] border border-[#d8d4cb] rounded-lg overflow-hidden shadow-[2px_2px_0px_0px_#1a1a1a]">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-[#e0dcd5] transition-colors"
        >
          <div className="mt-0.5 p-1.5 rounded-md shrink-0 bg-[#1a1a1a] border border-[#1a1a1a]">
            {accent === '#F2C94C' ? (
              <Star size={13} className="text-[#f2efe9]" />
            ) : isRight ? (
              <CheckCircle2 size={13} className="text-[#f2efe9]" />
            ) : (
              <XCircle size={13} className="text-[#f2efe9]" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[17px] font-bold leading-relaxed whitespace-pre-line text-[#1a1a1a] font-serif">
              {item.questionText || 'Question text unavailable.'}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px]">
              {item.examName && (
                <span className="px-2 py-0.5 rounded-md bg-[#e0dcd5] text-[#1a1a1a] border border-[#d8d4cb] font-bold font-serif">
                  {item.examName}
                </span>
              )}
              {item.subjectName && (
                <span className="px-2 py-0.5 rounded-md bg-[#e0dcd5] text-[#b91c1c] border border-[#d8d4cb] font-bold font-serif">
                  {item.subjectName}
                </span>
              )}
              {typeof item.timesAnswered === 'number' && item.timesAnswered > 1 && (
                <span className="px-2 py-0.5 rounded-md bg-[#e0dcd5] text-[#4a4a4a] border border-[#d8d4cb] font-bold font-serif">
                  Answered {item.timesAnswered}×
                </span>
              )}
            </div>
          </div>

          <ChevronDown
            size={15}
            className={`shrink-0 text-[#4a4a4a] transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </button>

        {expanded && (
          <div className="px-5 pb-5 pt-3 space-y-4 border-t border-[#d8d4cb]">
            {optionEntries.length > 0 && (
              <div className="grid grid-cols-1 gap-2">
                {optionEntries.map(([key, text], idx) => {
                  const isCorrectOption = item.correctAnswer === key || item.correctAnswer === text;
                  const isSelectedOption = item.providedAnswer === key;
                  const displayLetter = letters[OPTION_KEYS.indexOf(key)] ?? letters[idx] ?? key;

                  let cardStyle = "border-[#d8d4cb] bg-[#f2efe9] text-[#4a4a4a] shadow-[1px_1px_0px_0px_#d8d4cb]";
                  if (isCorrectOption) cardStyle = "border-[#1a1a1a] bg-[#f2efe9] text-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]";
                  else if (isSelectedOption) cardStyle = "border-[#b91c1c] bg-[#f2efe9] text-[#b91c1c] shadow-[2px_2px_0px_0px_#b91c1c]";

                  return (
                    <div
                      key={key}
                      className={`px-3 py-2.5 rounded-md border text-[17px] flex items-start gap-2 ${cardStyle}`}
                    >
                      <span className="font-black shrink-0 font-serif">{displayLetter}.</span>
                      <span className="flex-1 font-serif">{text}</span>
                      {isCorrectOption && <CheckCircle2 size={15} className="text-[#1a1a1a] shrink-0" />}
                      {isSelectedOption && !isCorrectOption && (
                        <XCircle size={15} className="text-[#b91c1c] shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {item.explanation && (
              <div className="rounded-md border border-[#d8d4cb] bg-[#e0dcd5] p-3 shadow-[1px_1px_0px_0px_#1a1a1a]">
                <p className="text-[10px] font-black text-[#b91c1c] uppercase tracking-widest mb-1 font-serif">
                  Explanation
                </p>
                <p className="text-[17px] leading-relaxed text-[#1a1a1a] whitespace-pre-line font-serif">
                  {item.explanation}
                </p>
              </div>
            )}

            {item.providedAnswer && item.correctAnswer && isRight && (
              <p className="text-[15px] text-[#1a1a1a] font-bold font-serif">
                <span>You answered this correctly.</span>
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // ─── DARK MODE (Original Code - Unchanged) ─────────────────
  return (
    <div className="bg-[#111318] border border-[#23262D] rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-[#161920] transition-colors"
      >
        <div
          className="mt-0.5 p-1.5 rounded-lg shrink-0"
          style={{ backgroundColor: `${accent}14`, border: `1px solid ${accent}40` }}
        >
          {accent === '#F2C94C' ? (
            <Star size={13} style={{ color: accent }} />
          ) : isRight ? (
            <CheckCircle2 size={13} style={{ color: accent }} />
          ) : (
            <XCircle size={13} style={{ color: accent }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[17px] font-extrabold leading-relaxed whitespace-pre-line">
            {item.questionText || 'Question text unavailable.'}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px]">
            {item.examName && (
              <span className="px-2 py-0.5 rounded-md bg-[#2F80ED]/10 text-[#2F80ED] border border-[#2F80ED]/25 font-semibold">
                {item.examName}
              </span>
            )}
            {item.subjectName && (
              <span className="px-2 py-0.5 rounded-md bg-[#00E5B3]/10 text-[#00E5B3] border border-[#00E5B3]/25 font-semibold">
                {item.subjectName}
              </span>
            )}
            {typeof item.timesAnswered === 'number' && item.timesAnswered > 1 && (
              <span className="px-2 py-0.5 rounded-md bg-[#161920] text-[#A1A8B3] border border-[#23262D] font-semibold">
                Answered {item.timesAnswered}×
              </span>
            )}
          </div>
        </div>

        <ChevronDown
          size={15}
          className={`shrink-0 text-[#A1A8B3] transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-3 space-y-4 border-t border-[#23262D]">
          {optionEntries.length > 0 && (
            <div className="grid grid-cols-1 gap-2">
              {optionEntries.map(([key, text], idx) => {
                const isCorrectOption = item.correctAnswer === key || item.correctAnswer === text;
                const isSelectedOption = item.providedAnswer === key;
                const displayLetter = letters[OPTION_KEYS.indexOf(key)] ?? letters[idx] ?? key;

                return (
                  <div
                    key={key}
                    className={`px-3 py-2.5 rounded-xl border text-[17px] flex items-start gap-2 ${
                      isCorrectOption
                        ? 'border-[#00E5B3]/60 bg-[#00E5B3]/10 text-[#F5F7FA]'
                        : isSelectedOption
                        ? 'border-[#EB5757]/60 bg-[#EB5757]/10 text-[#F5F7FA]'
                        : 'border-[#23262D] bg-[#161920] text-[#A1A8B3]'
                    }`}
                  >
                    <span className="font-bold shrink-0">{displayLetter}.</span>
                    <span className="flex-1">{text}</span>
                    {isCorrectOption && <CheckCircle2 size={15} className="text-[#00E5B3] shrink-0" />}
                    {isSelectedOption && !isCorrectOption && (
                      <XCircle size={15} className="text-[#EB5757] shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {item.explanation && (
            <div className="rounded-xl border border-[#9B51E0]/25 bg-[#9B51E0]/5 p-3">
              <p className="text-[10px] font-bold text-[#9B51E0] uppercase tracking-wide mb-1">
                Explanation
              </p>
              <p className="text-[17px] leading-relaxed text-[#C9D0DA] whitespace-pre-line">
                {item.explanation}
              </p>
            </div>
          )}

          {item.providedAnswer && item.correctAnswer && (
            <p className="text-[11px] text-[#A1A8B3]">
              {isRight ? (
                <span className="text-[#00E5B3] font-semibold">You answered this correctly.</span>
              ) : (
                <span className="text-[#EB5757] font-semibold"></span>
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Notebook — the user's personal question journal.
 */
export default function Notebook() {
  const { isDark } = useTheme();
  const [tab, setTab] = useState<Tab>('right');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const { data, isLoading } = useGetNotebookQuestionsQuery(
    { limit: 200 },
    { refetchOnMountOrArgChange: true }
  );

  const lists = useMemo(
    () => ({
      right: data?.right ?? [],
      wrong: data?.wrong ?? [],
      favorites: data?.favorites ?? [],
    }),
    [data]
  );

  const stats = data?.stats;
  const items = lists[tab];
  const meta = TAB_META[tab];
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = items.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const switchTab = (next: Tab) => {
    setTab(next);
    setPage(0);
  };

  const tabs: { key: Tab; count?: number }[] = [
    { key: 'right', count: stats?.rightCount },
    { key: 'wrong', count: stats?.wrongCount },
    { key: 'favorites', count: stats?.favoriteCount },
  ];

  // ─── Shared header ─────────────────────────────────────────
  const header = (
    <ReusableHeader
      
      icon={NotebookPen}
      badge="Your Journal"
      title="Notebook"
      subtitle="Your personal question journal — every right answer, every mistake, and your favorites in one place."
    />
  );

  // ─── LIGHT MODE (Vintage Paper Style) ───────────────────────
  if (!isDark) {
    return (
      <div
        className="w-full max-w-8xl mx-auto p-4 text-[#1a1a1a] space-y-6 min-h-screen"
        style={{
          backgroundImage: 'radial-gradient(#d8d4cb 1px, transparent 1px)',
        }}
      >
        {header}

        {/* ── Summary strip ── */}
        {stats && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Correct', value: stats.rightCount },
              { label: 'Wrong', value: stats.wrongCount },
              { label: 'Favorites', value: stats.favoriteCount },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-[#f2efe9] border border-[#d8d4cb] rounded-lg px-4 py-3 shadow-[2px_2px_0px_0px_#1a1a1a]"
              >
                <p className="text-lg font-black font-serif text-[#1a1a1a]">{value}</p>
                <p className="text-[10px] uppercase tracking-widest text-[#4a4a4a] font-black font-serif">
                  {label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="flex flex-wrap gap-2">
          {tabs.map(({ key, count }) => {
            const { label, icon: Icon } = TAB_META[key];
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => switchTab(key)}
                className={`px-4 py-2 rounded-md text-xs font-bold transition-all border flex items-center gap-2 font-serif ${
                  active
                    ? 'bg-[#1a1a1a] text-[#f2efe9] border-[#1a1a1a] shadow-[2px_2px_0px_0px_#b91c1c]'
                    : 'bg-[#f2efe9] text-[#1a1a1a] border-[#d8d4cb] hover:shadow-[2px_2px_0px_0px_#1a1a1a] shadow-[1px_1px_0px_0px_#1a1a1a]'
                }`}
              >
                <Icon size={13} />
                {label}
                {typeof count === 'number' && count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                    active ? 'bg-[#f2efe9]/20 text-[#f2efe9]' : 'bg-[#e0dcd5] text-[#1a1a1a]'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── List ── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-[#b91c1c]" />
          </div>
        ) : pageItems.length === 0 ? (
          <div className="bg-[#f2efe9] border border-[#d8d4cb] rounded-lg p-12 text-center shadow-[3px_3px_0px_0px_#1a1a1a]">
            {tab === 'right' ? (
              <Trophy size={30} className="text-[#1a1a1a] mx-auto mb-3" />
            ) : tab === 'wrong' ? (
              <Layers size={30} className="text-[#1a1a1a] mx-auto mb-3" />
            ) : (
              <BookOpenCheck size={30} className="text-[#1a1a1a] mx-auto mb-3" />
            )}
            <p className="text-sm font-bold text-[#1a1a1a] font-serif italic">{meta.empty}</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {pageItems.map((item) => (
                <NotebookCard
                  key={`${item.questionId}-${item.favoritedAt ?? item.answeredAt ?? ''}`}
                  item={item}
                  accent={meta.accent}
                  isDark={false}
                />
              ))}
            </div>

            {/* Pagination */}
            {pageCount > 1 && (
              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={safePage === 0}
                  className="p-2 rounded-md text-[#1a1a1a] hover:bg-[#e0dcd5] transition-all disabled:opacity-30 disabled:hover:bg-transparent border border-[#d8d4cb]"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs text-[#1a1a1a] font-mono font-bold">
                  {safePage + 1} / {pageCount}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                  disabled={safePage >= pageCount - 1}
                  className="p-2 rounded-md text-[#1a1a1a] hover:bg-[#e0dcd5] transition-all disabled:opacity-30 disabled:hover:bg-transparent border border-[#d8d4cb]"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // ─── DARK MODE (Original Code - Unchanged) ─────────────────
  return (
    <div className="w-full max-w-8xl mx-auto p-4 text-[#F5F7FA] space-y-6">
      {header}

      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Correct', value: stats.rightCount, color: '#00E5B3' },
            { label: 'Wrong', value: stats.wrongCount, color: '#EB5757' },
            { label: 'Favorites', value: stats.favoriteCount, color: '#F2C94C' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-[#111318] border border-[#23262D] rounded-2xl px-4 py-3"
            >
              <p className="text-lg font-bold" style={{ color }}>
                {value}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-[#A1A8B3] font-semibold">
                {label}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {tabs.map(({ key, count }) => {
          const { label, icon: Icon } = TAB_META[key];
          return (
            <button
              key={key}
              onClick={() => switchTab(key)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center gap-2 ${
                tab === key
                  ? 'bg-[#9B51E0] text-white border-[#9B51E0] shadow-[0_4px_12px_rgba(155,81,224,0.3)]'
                  : 'bg-[#111318] text-[#A1A8B3] border-[#23262D] hover:bg-[#161920] hover:text-[#F5F7FA]'
              }`}
            >
              <Icon size={13} />
              {label}
              {typeof count === 'number' && count > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-black/25 text-[10px] font-bold">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[#9B51E0]" />
        </div>
      ) : pageItems.length === 0 ? (
        <div className="bg-[#111318] border border-[#23262D] rounded-2xl p-12 text-center">
          {tab === 'right' ? (
            <Trophy size={30} className="text-[#6B7280] mx-auto mb-3" />
          ) : tab === 'wrong' ? (
            <Layers size={30} className="text-[#6B7280] mx-auto mb-3" />
          ) : (
            <BookOpenCheck size={30} className="text-[#6B7280] mx-auto mb-3" />
          )}
          <p className="text-sm font-semibold text-[#A1A8B3]">{meta.empty}</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {pageItems.map((item) => (
              <NotebookCard
                key={`${item.questionId}-${item.favoritedAt ?? item.answeredAt ?? ''}`}
                item={item}
                accent={meta.accent}
                isDark={true}
              />
            ))}
          </div>

          {pageCount > 1 && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
                className="p-2 rounded-lg text-[#A1A8B3] hover:text-[#F5F7FA] hover:bg-[#161920] transition-all disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-[#A1A8B3] font-mono">
                {safePage + 1} / {pageCount}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                disabled={safePage >= pageCount - 1}
                className="p-2 rounded-lg text-[#A1A8B3] hover:text-[#F5F7FA] hover:bg-[#161920] transition-all disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}