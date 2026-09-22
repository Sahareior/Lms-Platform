import React, { useState } from 'react';
import {
  Bookmark,
  CheckCircle2,
  Copy,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
  BookOpen,
  HelpCircle,
  School,
  Building2,
  Check,
} from 'lucide-react';
import type { CreativeQuestion, FontSize, QuestionPart, StudyMode } from '../tools/types';
import { toBengaliNumber, getCleanBoardName, getSourceCategory } from '../tools/bengaliUtils';
import { useTheme } from '../../../../../theme/ThemeContext';
import { message } from 'antd';

interface CQQuestionCardProps {
  question: CreativeQuestion;
  index: number;
  studyMode: StudyMode;
  fontSize: FontSize;
  isBookmarked: boolean;
  isRead: boolean;
  onToggleBookmark: (id: string) => void;
  onToggleRead: (id: string) => void;
  activeCognitiveFilter: string;
  searchQuery?: string;
}

// Light-mode badges use vintage paper palette (monochrome + subtle accent)
const cognitiveBadgeStyles: Record<
  string,
  { dark: string; light: string; lightAccent: string }
> = {
  ক: {
    dark: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    light: 'bg-[#e0dcd5] text-[#1a1a1a] border-[#1a1a1a]',
    lightAccent: '#b91c1c',
  },
  খ: {
    dark: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    light: 'bg-[#e0dcd5] text-[#1a1a1a] border-[#1a1a1a]',
    lightAccent: '#1a1a1a',
  },
  গ: {
    dark: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    light: 'bg-[#e0dcd5] text-[#1a1a1a] border-[#1a1a1a]',
    lightAccent: '#4a4a4a',
  },
  ঘ: {
    dark: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    light: 'bg-[#e0dcd5] text-[#1a1a1a] border-[#1a1a1a]',
    lightAccent: '#b91c1c',
  },
};

const fontSizesMap: Record<FontSize, { qText: string; ansText: string; stimulus: string }> = {
  sm: {
    qText: 'text-sm md:text-base leading-relaxed',
    ansText: 'text-xs md:text-sm leading-relaxed',
    stimulus: 'text-xs md:text-sm leading-relaxed',
  },
  base: {
    qText: 'text-[15px] md:text-base leading-relaxed',
    ansText: 'text-[13px] md:text-sm leading-relaxed',
    stimulus: 'text-[13px] md:text-sm leading-relaxed',
  },
  lg: {
    qText: 'text-base md:text-lg leading-loose',
    ansText: 'text-sm md:text-base leading-loose',
    stimulus: 'text-sm md:text-base leading-loose',
  },
};

export const CQQuestionCard: React.FC<CQQuestionCardProps> = ({
  question,
  index,
  studyMode,
  fontSize,
  isBookmarked,
  isRead,
  onToggleBookmark,
  onToggleRead,
  activeCognitiveFilter,
}) => {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);
  const [openAnswers, setOpenAnswers] = useState<Record<string, boolean>>(() => {
    if (studyMode === 'practice') return {};
    return { ক: true, খ: true, গ: true, ঘ: true, notes: true };
  });

  const togglePartAnswer = (label: string) => {
    setOpenAnswers((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const toggleAllAnswers = (open: boolean) => {
    setOpenAnswers({ ক: open, খ: open, গ: open, ঘ: open, notes: open });
  };

  const handleCopyQuestion = () => {
    const textParts = [
      `প্রশ্ন নং: ${question.number} (${getCleanBoardName(question)})`,
      question.stimulus ? `উদ্দীপক:\n${question.stimulus}` : '',
      ...(question.parts || []).map((p) => `${p.label}. ${p.text} [${p.marks}]`),
    ]
      .filter(Boolean)
      .join('\n\n');

    navigator.clipboard.writeText(textParts);
    setCopied(true);
    message.success('প্রশ্নটি কপি করা হয়েছে');
    setTimeout(() => setCopied(false), 2000);
  };

  const sourceCategory = getSourceCategory(question);
  const sizeClasses = fontSizesMap[fontSize];

  const visibleParts = (question.parts || []).filter((p) => {
    if (activeCognitiveFilter && activeCognitiveFilter !== 'all') {
      return p.label === activeCognitiveFilter;
    }
    if (studyMode === 'k-special') return p.label === 'ক';
    if (studyMode === 'kh-special') return p.label === 'খ';
    return true;
  });

  const sourceIcon = isDark ? (
    sourceCategory === 'cadet' ? (
      <Award size={13} className="text-amber-400" />
    ) : sourceCategory === 'college' ? (
      <School size={13} className="text-purple-400" />
    ) : (
      <Building2 size={13} className="text-blue-400" />
    )
  ) : (
    <Building2 size={13} className="text-[#b91c1c]" />
  );

  return (
    <div
      id={`cq-${question.id}`}
      className={`relative rounded-xl transition-all duration-200 overflow-hidden ${isDark
        ? 'bg-[#111318] border border-[#23262D] hover:border-[#2F80ED]/40 shadow-lg shadow-black/20'
        : 'bg-[#f2efe9] border-2 border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a] hover:shadow-[4px_4px_0px_0px_#1a1a1a]'
        } ${isRead ? (isDark ? 'ring-1 ring-emerald-500/30' : 'ring-2 ring-[#1a1a1a]') : ''}`}
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
      {/* ── Compact Meta Bar ──────────────────────────────────── */}
      <div
        className={`px-3 py-2 md:px-4 md:py-2.5 flex flex-wrap items-center justify-between gap-2 border-b ${isDark
          ? 'bg-[#161920] border-[#23262D]'
          : 'bg-[#e8e2d4] border-b-2 border-[#1a1a1a]'
          }`}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Question Number */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] ${isDark
              ? 'bg-[#2F80ED]/15 text-[#2F80ED] border border-[#2F80ED]/30 font-bold'
              : 'bg-[#1a1a1a] text-[#f2efe9] border border-[#1a1a1a] font-black font-serif'
              }`}
          >
            <Sparkles size={11} />
            প্রশ্ন {toBengaliNumber(question.number || index + 1)}
          </span>

          {/* Board / Source */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] ${isDark
              ? 'bg-[#1C1F26] text-[#A1A8B3] border border-[#23262D] font-medium'
              : 'bg-[#f2efe9] text-[#1a1a1a] border border-[#1a1a1a] font-bold font-serif'
              }`}
          >
            {sourceIcon}
            <span>{getCleanBoardName(question)}</span>
          </span>

          {question.source?.year && (
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] ${isDark
                ? 'bg-blue-500/10 text-blue-400 font-semibold'
                : 'bg-[#f2efe9] text-[#b91c1c] border border-[#b91c1c] font-black font-serif'
                }`}
            >
              {toBengaliNumber(question.source.year)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              const allOpen = Object.values(openAnswers).some(Boolean);
              toggleAllAnswers(!allOpen);
            }}
            title="সব উত্তর দেখুন বা লুকান"
            className={`px-2 py-1 text-[11px] rounded-md transition-colors flex items-center gap-1 ${isDark
              ? 'bg-[#1C1F26] text-[#A1A8B3] font-medium hover:text-[#F5F7FA] hover:bg-[#23262D]'
              : 'bg-[#f2efe9] border border-[#1a1a1a] text-[#1a1a1a] font-bold font-serif hover:bg-[#e0dcd5]'
              }`}
          >
            <BookOpen size={12} />
            <span className="hidden sm:inline">
              {Object.values(openAnswers).some(Boolean) ? 'লুকান' : 'সকল উত্তর'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleCopyQuestion}
            title="প্রশ্ন কপি করুন"
            className={`p-1.5 rounded-md transition-colors ${isDark
              ? 'text-[#A1A8B3] hover:text-[#F5F7FA] hover:bg-[#1C1F26]'
              : 'text-[#333] hover:text-[#1a1a1a] hover:bg-[#e0dcd5]'
              }`}
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          </button>

          <button
            type="button"
            onClick={() => onToggleBookmark(question.id)}
            title={isBookmarked ? 'বুকমার্ক সরানো' : 'বুকমার্কে যুক্ত করুন'}
            className={`p-1.5 rounded-md transition-colors ${isBookmarked
              ? 'text-amber-500 bg-amber-500/10'
              : isDark
                ? 'text-[#A1A8B3] hover:text-amber-400 hover:bg-[#1C1F26]'
                : 'text-[#333] hover:text-amber-600 hover:bg-[#e0dcd5]'
              }`}
          >
            <Bookmark size={14} className={isBookmarked ? 'fill-amber-500' : ''} />
          </button>

          <button
            type="button"
            onClick={() => onToggleRead(question.id)}
            title={isRead ? 'পড়া সম্পন্ন' : 'পড়া হিসেবে চিহ্নিত করুন'}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] transition-all ${isRead
              ? isDark
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-semibold'
                : 'bg-[#1a1a1a] text-[#f2efe9] border border-[#1a1a1a] font-black font-serif'
              : isDark
                ? 'bg-[#1C1F26] text-[#A1A8B3] font-semibold hover:text-emerald-400 hover:bg-[#23262D]'
                : 'bg-[#f2efe9] border border-[#1a1a1a] text-[#333] font-bold font-serif hover:bg-[#e0dcd5]'
              }`}
          >
            <CheckCircle2 size={12} className={isRead ? '' : ''} />
            <span className="hidden sm:inline">{isRead ? 'পড়া' : 'বাকি'}</span>
          </button>
        </div>
      </div>

      <div className="p-3 md:p-4 space-y-3.5">
        {/* ── উদ্দীপক ─────────────────────────────────────────── */}
        {question.stimulus && (
          <div
            className={`relative rounded-lg p-3 md:p-4 border transition-all ${isDark
              ? 'bg-gradient-to-br from-[#161920] to-[#12141a] border-[#2A2E39]'
              : 'bg-[#faf8f5] border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]'
              }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-widest ${isDark
                  ? 'bg-indigo-500/20 text-indigo-400 font-bold'
                  : 'bg-[#1a1a1a] text-[#f2efe9] font-black font-serif'
                  }`}
              >
                উদ্দীপক
              </span>
              <span
                className={`text-[11px] ${isDark ? 'text-[#6B7280]' : 'text-[#333] font-serif'
                  }`}
              >
                মনোযোগ সহকারে পড়ে উত্তর দাও:
              </span>
            </div>

            <p
              className={`font-normal whitespace-pre-line text-justify select-text ${sizeClasses.stimulus} ${isDark ? 'text-[#E5E9F0]' : 'text-[#1a1a1a]'
                }`}
            >
              {question.stimulus}
            </p>

            {question.stimulusBlocks && question.stimulusBlocks.length > 0 && (
              <div className="mt-2.5 pt-2.5 border-t border-dashed border-gray-700/40 space-y-1.5">
                {question.stimulusBlocks.map((block, bIdx) => (
                  <div
                    key={bIdx}
                    className={`p-2 rounded-md text-[11px] ${isDark
                      ? 'bg-[#0B0D12]/70 text-[#00E5B3] font-medium'
                      : 'bg-[#e0dcd5] text-[#1a1a1a] border border-[#1a1a1a] font-bold font-serif'
                      }`}
                  >
                    {block.value}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Sub-Questions ──────────────────────────────────── */}
        {visibleParts.length > 0 ? (
          <div className="space-y-2.5">
            {visibleParts.map((part: QuestionPart) => {
              const badgeStyle =
                cognitiveBadgeStyles[part.label] || cognitiveBadgeStyles['ক'];
              const isAnswerOpen = openAnswers[part.label] ?? false;

              return (
                <div
                  key={part.label}
                  className={`rounded-lg border transition-all ${isDark
                    ? 'bg-[#141720] border-[#23262D] hover:border-[#2C313C]'
                    : 'bg-[#faf8f5] border border-[#1a1a1a]'
                    }`}
                >
                  <div className="p-3 md:p-3.5">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        {/* Part Label */}
                        <div
                          className={`shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-md text-sm border-2 ${isDark
                            ? badgeStyle.dark
                            : 'bg-[#1a1a1a] text-[#f2efe9] border-[#1a1a1a] font-black font-serif'
                            }`}
                        >
                          {part.label}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded border ${isDark
                                ? badgeStyle.dark
                                : 'bg-[#e0dcd5] text-[#1a1a1a] border-[#1a1a1a] font-black font-serif uppercase tracking-wider'
                                }`}
                            >
                              {part.cognitiveType ||
                                (part.label === 'ক'
                                  ? 'জ্ঞানমূলক'
                                  : part.label === 'খ'
                                    ? 'অনুধাবন'
                                    : part.label === 'গ'
                                      ? 'প্রয়োগ'
                                      : 'উচ্চতর দক্ষতা')}
                            </span>
                            <span
                              className={`text-[10px] font-bold ${isDark ? 'text-[#A1A8B3]' : 'text-[#333] font-serif'
                                }`}
                            >
                              [নম্বর:{' '}
                              {toBengaliNumber(
                                part.marks ||
                                (part.label === 'ক'
                                  ? 1
                                  : part.label === 'খ'
                                    ? 2
                                    : part.label === 'গ'
                                      ? 3
                                      : 4)
                              )}
                              ]
                            </span>
                          </div>

                          <h3
                            className={`font-semibold select-text ${sizeClasses.qText} ${isDark ? 'text-[#F5F7FA]' : 'text-[#1a1a1a] font-serif'
                              }`}
                          >
                            {part.text}
                          </h3>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => togglePartAnswer(part.label)}
                        className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] transition-all ${isAnswerOpen
                          ? isDark
                            ? 'bg-[#2F80ED]/20 text-[#2F80ED] border border-[#2F80ED]/40 font-semibold'
                            : 'bg-[#1a1a1a] text-[#f2efe9] border border-[#1a1a1a] font-black font-serif'
                          : isDark
                            ? 'bg-[#1C1F26] text-[#A1A8B3] font-semibold hover:text-[#F5F7FA] hover:bg-[#23262D]'
                            : 'bg-[#f2efe9] border border-[#1a1a1a] text-[#1a1a1a] font-bold font-serif hover:bg-[#e0dcd5]'
                          }`}
                      >
                        <span>{isAnswerOpen ? 'লুকান' : 'দেখুন'}</span>
                        {isAnswerOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    </div>

                    {isAnswerOpen && (
                      <div
                        className={`mt-2.5 pt-2.5 border-t rounded-md p-2.5 ${isDark
                          ? 'bg-[#0B0D12]/90 border-[#23262D] text-[#D1D5DB]'
                          : 'bg-[#f2efe9] border border-[#1a1a1a] text-[#1a1a1a]'
                          }`}
                      >
                        <div
                          className={`flex items-center gap-1 mb-1.5 text-[10px] uppercase tracking-widest ${isDark
                            ? 'text-[#00E5B3] font-bold'
                            : 'text-[#b91c1c] font-black font-serif'
                            }`}
                        >
                          <CheckCircle2 size={11} />
                          <span>উত্তর</span>
                        </div>

                        {part.answer ? (
                          <div
                            className={`whitespace-pre-line text-justify select-text ${sizeClasses.ansText} ${isDark ? '' : 'font-serif'
                              }`}
                          >
                            {part.answer}
                          </div>
                        ) : (
                          <div
                            className={`text-[11px] italic py-0.5 ${isDark ? 'text-gray-500' : 'text-[#666] font-serif'
                              }`}
                          >
                            এই অংশের জন্য সরাসরি উত্তর সংরক্ষিত নেই বা উদ্দীপকের নোটসে বর্ণিত হয়েছে।
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className={`text-center py-3 text-[11px] ${isDark ? 'text-gray-400' : 'text-[#666] font-serif'
              }`}
          >
            নির্বাচিত ফিল্টারের জন্য কোনো প্রশ্ন অংশ পাওয়া যায়নি।
          </div>
        )}

        {/* ── Answer Notes ───────────────────────────────────── */}
        {question.answerNotes && question.answerNotes.trim().length > 0 && (
          <div
            className={`rounded-lg border p-3 transition-all ${isDark
              ? 'bg-[#161920] border-indigo-500/30 text-[#E5E9F0]'
              : 'bg-[#faf8f5] border-2 border-[#1a1a1a] text-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]'
              }`}
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => togglePartAnswer('notes')}
            >
              <div className="flex items-center gap-1.5">
                <HelpCircle
                  size={14}
                  className={isDark ? 'text-indigo-400' : 'text-[#b91c1c]'}
                />
                <h4
                  className={`text-xs ${isDark ? 'font-bold' : 'font-black font-serif'
                    }`}
                >
                  প্রশ্নের সমাধান ও বিশেষ নোট
                </h4>
              </div>
              <button
                type="button"
                className={`text-[10px] flex items-center gap-1 ${isDark
                  ? 'font-semibold text-indigo-400'
                  : 'font-black font-serif uppercase tracking-widest text-[#b91c1c]'
                  }`}
              >
                {openAnswers.notes ? 'সংক্ষেপ' : 'দেখুন'}
                {openAnswers.notes ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            </div>

            {openAnswers.notes && (
              <div
                className={`mt-2.5 pt-2.5 border-t whitespace-pre-line text-justify ${sizeClasses.ansText} ${isDark
                  ? 'border-indigo-500/20'
                  : 'border-[#1a1a1a] border-dashed font-serif'
                  }`}
              >
                {question.answerNotes}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CQQuestionCard;