import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
import {
  CheckCircle,
  BarChart3,
  BookOpen,
  Star,
  AlertCircle,
  Clock,
  Users,
  TrendingUp,
  ThumbsUp,
  MessageSquare,
  Loader2,
  Lightbulb,
  ListChecks,
  XCircle,
} from 'lucide-react';
import { useAiQuestionExplainerMutation } from '@my-monorepo/store/src/redux/api/aiApi';
import { useUpdateAdminQuestionExplanationMutation } from '@my-monorepo/store';

type ModalType = 'answer' | 'statistics' | 'explanation' | 'bookmark';

interface QuestionData {
  _id?: string;
  docId?: string;
  questionSetId?: string;
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  stats?: {
    totalAttempts: number;
    correctPercentage: number;
    averageTime: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
  };
}

interface CustomModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  modalType?: ModalType;
  questionData?: QuestionData;
  letterLabels?: string[];
  onExplanationSaved?: (questionId: number, explanation: string) => void;
}

const letters = ['ক', 'খ', 'গ', 'ঘ'];

// In-memory cache across modal open/close cycles in the current browser session
const sessionExplanationCache: Record<string | number, string> = {};

// ═══════════════════════════════════════════════════════════════════════════
// AI explanation parsing
//
// The backend returns explanations in a fixed plain-text structure:
//
//   মূল ধারণা: <rule / formula in one line>
//
//   যাচাই:
//   i. <calculation> → x = 1 (সঠিক)
//   ii. <calculation> → x = 0 (ভুল)
//   iii. <calculation> → x = 1 (সঠিক)
//
//   সিদ্ধান্ত: <final sentence with the correct option>
//
// We parse that into sections and render each with proper styling.
// Old explanations (markdown / LaTeX) fall back to plain preformatted text.
// ═══════════════════════════════════════════════════════════════════════════

type Verdict = 'correct' | 'wrong';

interface StepItem {
  label: string; // "i", "ii", "iii", "ধাপ ১", ...
  text: string;  // calculation text
  verdict?: Verdict;
}

interface ExplanationSection {
  kind: 'concept' | 'steps' | 'conclusion' | 'plain';
  body: string;
  steps: StepItem[];
}

const SECTION_HEADERS = [
  { kind: 'concept' as const, label: 'মূল ধারণা' },
  { kind: 'steps' as const, label: 'যাচাই' },
  { kind: 'conclusion' as const, label: 'সিদ্ধান্ত' },
];

const VERDICT_RE = /\(\s*(সঠিক|ভুল|হ্যাঁ|না)\s*\)\s*$/;
// Roman numerals + "ধাপ ১" style labels (longer alternatives first so
// "iv." doesn't get captured as label "i")
const STEP_LABEL_RE = /^(iv|vi|v|i{1,3}|ধাপ\s*[০-৯0-9]+)\s*[.):\]]?\s*/i;

const verdictOf = (word: string): Verdict =>
  word === 'সঠিক' || word === 'হ্যাঁ' ? 'correct' : 'wrong';

/** Light cleanup for legacy explanations saved before the backend prompt fix. */
const cleanupLegacyText = (raw: string): string =>
  raw
    .replace(/\*\*/g, '')
    .replace(/[$`]/g, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\\oplus/g, '⊕')
    .replace(/\\odot/g, '⊙')
    .replace(/\\cdot/g, '·')
    .replace(/\\times/g, '×')
    .replace(/\\overline\{([^}]*)\}/g, 'NOT($1)')
    .replace(/\\bar\{([^}]*)\}/g, 'NOT($1)');

const parseStepLine = (line: string): StepItem => {
  let text = line;
  let verdict: Verdict | undefined;

  const v = text.match(VERDICT_RE);
  if (v && v.index !== undefined) {
    verdict = verdictOf(v[1]);
    text = text.slice(0, v.index).trim();
  }

  const l = text.match(STEP_LABEL_RE);
  const label = l ? l[1] : '';
  if (l) text = text.slice(l[0].length).trim();

  return { label, text, verdict };
};

const parseExplanation = (raw: string): ExplanationSection[] => {
  const lines = cleanupLegacyText(raw)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const sections: ExplanationSection[] = [];
  let current: ExplanationSection | null = null;

  const pushPlain = (line: string) => {
    const last = sections[sections.length - 1];
    if (last && last.kind === 'plain') {
      last.body += (last.body ? ' ' : '') + line;
    } else {
      sections.push({ kind: 'plain', body: line, steps: [] });
    }
  };

  for (const line of lines) {
    const header = SECTION_HEADERS.find(
      (h) =>
        line === h.label ||
        line.startsWith(h.label + ':') ||
        line.startsWith(h.label + ' :')
    );

    if (header) {
      current = { kind: header.kind, body: '', steps: [] };
      const rest = line
        .slice(header.label.length)
        .replace(/^\s*[:.।]?\s*/, '')
        .trim();
      if (rest) current.body = rest;
      sections.push(current);
      continue;
    }

    if (current?.kind === 'steps') {
      current.steps.push(parseStepLine(line));
    } else if (current && (current.kind === 'concept' || current.kind === 'conclusion')) {
      current.body += (current.body ? ' ' : '') + line;
    } else {
      pushPlain(line);
    }
  }

  return sections;
};

// ─── Structured renderer ──────────────────────────────────────────────────

const VerdictPill: React.FC<{ verdict: Verdict }> = ({ verdict }) => {
  const correct = verdict === 'correct';
  return (
    <span
      className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
        correct
          ? 'text-[#00E5B3] bg-[#00E5B3]/10 border-[#00E5B3]/30'
          : 'text-[#EB5757] bg-[#EB5757]/10 border-[#EB5757]/30'
      }`}
    >
      {correct ? <CheckCircle size={12} /> : <XCircle size={12} />}
      {correct ? 'সঠিক' : 'ভুল'}
    </span>
  );
};

const ExplanationView: React.FC<{ raw: string }> = ({ raw }) => {
  const sections = parseExplanation(raw);
  const hasStructured = sections.some((s) => s.kind !== 'plain');

  // Legacy / unstructured explanation — keep line breaks, nothing fancy
  if (!hasStructured) {
    return (
      <p className="text-base text-[#A1A8B3] leading-8 whitespace-pre-line break-words">
        {cleanupLegacyText(raw)}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((sec, idx) => {
        // ── মূল ধারণা ──
        if (sec.kind === 'concept') {
          return (
            <div
              key={idx}
              className="flex items-start gap-3 bg-[#2F80ED]/5 border border-[#2F80ED]/20 rounded-lg p-3.5"
            >
              <div className="w-8 h-8 shrink-0 rounded-full bg-[#2F80ED]/10 border border-[#2F80ED]/30 flex items-center justify-center">
                <Lightbulb size={16} className="text-[#2F80ED]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#2F80ED] mb-0.5">মূল ধারণা</p>
                <p className="text-base text-[#F5F7FA] leading-7 break-words">{sec.body}</p>
              </div>
            </div>
          );
        }

        // ── যাচাই (step-by-step) ──
        if (sec.kind === 'steps' && sec.steps.length > 0) {
          return (
            <div key={idx} className="space-y-2">
              <p className="text-sm font-semibold text-[#A1A8B3] flex items-center gap-1.5">
                <ListChecks size={15} className="text-[#9B51E0]" />
                যাচাই
              </p>
              {sec.steps.map((step, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-[#161920] border border-[#23262D] rounded-lg px-3.5 py-2.5"
                >
                  {step.label ? (
                    <span className="shrink-0 h-7 px-2 inline-flex items-center justify-center rounded-md text-sm font-semibold text-[#9B51E0] bg-[#9B51E0]/10 border border-[#9B51E0]/30">
                      {step.label}
                    </span>
                  ) : (
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[#9B51E0]/60 mt-3" />
                  )}
                  <p className="flex-1 text-base text-[#A1A8B3] leading-7 break-words">
                    {step.text}
                  </p>
                  {step.verdict && <VerdictPill verdict={step.verdict} />}
                </div>
              ))}
            </div>
          );
        }

        // ── সিদ্ধান্ত ──
        if (sec.kind === 'conclusion') {
          return (
            <div
              key={idx}
              className="flex items-start gap-3 bg-[#00E5B3]/5 border border-[#00E5B3]/20 rounded-lg p-3.5"
            >
              <div className="w-8 h-8 shrink-0 rounded-full bg-[#00E5B3]/10 border border-[#00E5B3]/30 flex items-center justify-center">
                <CheckCircle size={16} className="text-[#00E5B3]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#00E5B3] mb-0.5">সিদ্ধান্ত</p>
                <p className="text-base text-[#F5F7FA] leading-7 break-words">{sec.body}</p>
              </div>
            </div>
          );
        }

        // plain text before / between sections
        return (
          <p key={idx} className="text-base text-[#A1A8B3] leading-7 break-words">
            {sec.body}
          </p>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Modal component
// ═══════════════════════════════════════════════════════════════════════════

const CustomModal: React.FC<CustomModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  modalType,
  questionData,
  letterLabels = letters,
  onExplanationSaved,
}) => {
  const [aiQuestionExplainer, { isLoading: isAiLoading }] = useAiQuestionExplainerMutation();
  const [updateAdminQuestionExplanation] = useUpdateAdminQuestionExplanationMutation();
  const [localExplanations, setLocalExplanations] = useState<Record<string | number, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const cachedExplanation = questionData
    ? sessionExplanationCache[questionData.id] ||
      (questionData._id ? sessionExplanationCache[questionData._id] : undefined) ||
      localExplanations[questionData.id]
    : undefined;

  const currentExplanation = questionData?.explanation?.trim() || cachedExplanation || '';

  // NOTE: all hooks are declared above; the early return must stay below
  // useEffect, otherwise React throws "Rendered fewer hooks than expected"
  // when modalType/questionData toggles between renders.

  useEffect(() => {
    if (!isModalOpen || modalType !== 'explanation' || !questionData?.id) return;

    setGenerationError(null);

    // If we already have a stored or cached explanation, do NOT call AI
    if (currentExplanation) return;

    const { explanation, stats, docId, questionSetId, _id, ...questionForAI } = questionData;
    setIsGenerating(true);

    aiQuestionExplainer(questionForAI)
      .unwrap()
      .then((res: any) => {
        if (res?.explanation) {
          const expText = res.explanation;
          sessionExplanationCache[questionData.id] = expText;
          if (questionData._id) {
            sessionExplanationCache[questionData._id] = expText;
          }

          setLocalExplanations((prev) => ({
            ...prev,
            [questionData.id]: expText,
          }));

          if (onExplanationSaved) {
            onExplanationSaved(questionData.id, expText);
          }

          // Auto-save explanation to MongoDB database
          const targetDocId = questionData.questionSetId || questionData.docId || questionData._id;
          if (targetDocId) {
            updateAdminQuestionExplanation({
              questionId: String(targetDocId),
              questionNumber: questionData.id,
              explanation: expText,
            })
              .unwrap()
              .then(() => {
                console.log(`[AI Explanation] Stored explanation for question #${questionData.id}`);
              })
              .catch((saveErr: any) => {
                console.warn('[AI Explanation] Auto-save to DB failed:', saveErr);
              });
          }
        }
      })
      .catch((err: any) => {
        console.error('[AI Explanation] Generation failed:', err);
        setGenerationError('ব্যাখ্যা তৈরি করতে সমস্যা হয়েছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।');
      })
      .finally(() => {
        setIsGenerating(false);
      });
  }, [isModalOpen, modalType, questionData?.id, currentExplanation]);

  if (!modalType || !questionData) return null;

  const colors = {
    success: '#00E5B3',
    brand: '#2F80ED',
    purple: '#9B51E0',
    amber: '#F2C94C',
    red: '#EB5757',
  };

  const difficultyStyles: Record<string, { badge: string; label: string }> = {
    Easy: { badge: 'bg-[#00E5B3]/10 text-[#00E5B3] border-[#00E5B3]/30', label: 'সহজ' },
    Medium: { badge: 'bg-[#F2C94C]/10 text-[#F2C94C] border-[#F2C94C]/30', label: 'মাঝারি' },
    Hard: { badge: 'bg-[#EB5757]/10 text-[#EB5757] border-[#EB5757]/30', label: 'কঠিন' },
  };

  // ─── Content renderers ───────────────────────────────────────
  const renderAnswerContent = () => {
    const correctIdx = questionData.correctAnswer;
    return (
      <div className="space-y-5">
        <div className="bg-[#00E5B3]/5 border border-[#00E5B3]/20 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#00E5B3]/10 border border-[#00E5B3]/30 flex items-center justify-center">
              <CheckCircle size={22} className="text-[#00E5B3]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#00E5B3]">সঠিক উত্তর</h3>
              <p className="text-sm text-[#A1A8B3]">Correct Answer</p>
            </div>
          </div>
          <div className="bg-[#161920] border border-[#23262D] rounded-lg p-4">
            <p className="text-xl font-semibold text-[#F5F7FA]">
              {letterLabels[correctIdx]}) {questionData.options[correctIdx]}
            </p>
          </div>
        </div>

        {questionData.explanation && (
          <div className="bg-[#2F80ED]/5 border border-[#2F80ED]/20 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#2F80ED]/10 border border-[#2F80ED]/30 flex items-center justify-center">
                <MessageSquare size={20} className="text-[#2F80ED]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#2F80ED]">সংক্ষিপ্ত ব্যাখ্যা</h3>
                <p className="text-sm text-[#A1A8B3]">Brief Explanation</p>
              </div>
            </div>
            <div className="bg-[#161920] border border-[#23262D] rounded-lg p-4">
              <ExplanationView raw={questionData.explanation} />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStatisticsContent = () => {
    const stats = questionData.stats || {
      totalAttempts: 2847,
      correctPercentage: 62,
      averageTime: '38 sec',
      difficulty: 'Medium' as const,
    };

    const ds = difficultyStyles[stats.difficulty];

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#9B51E0]/5 border border-[#9B51E0]/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-[#9B51E0]" />
              <span className="text-xs font-medium text-[#9B51E0]">মোট পরীক্ষার্থী</span>
            </div>
            <p className="text-2xl font-bold text-[#F5F7FA]">{stats.totalAttempts.toLocaleString()}</p>
            <p className="text-[10px] text-[#A1A8B3]">Total Attempts</p>
          </div>

          <div className="bg-[#00E5B3]/5 border border-[#00E5B3]/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-[#00E5B3]" />
              <span className="text-xs font-medium text-[#00E5B3]">সঠিকতার হার</span>
            </div>
            <p className="text-2xl font-bold text-[#F5F7FA]">{stats.correctPercentage}%</p>
            <p className="text-[10px] text-[#A1A8B3]">Accuracy Rate</p>
          </div>

          <div className="bg-[#2F80ED]/5 border border-[#2F80ED]/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-[#2F80ED]" />
              <span className="text-xs font-medium text-[#2F80ED]">গড় সময়</span>
            </div>
            <p className="text-2xl font-bold text-[#F5F7FA]">{stats.averageTime}</p>
            <p className="text-[10px] text-[#A1A8B3]">Avg Time per Question</p>
          </div>

          <div className={`${ds.badge} rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="currentColor" />
              <span className="text-xs font-medium">কঠিনতা</span>
            </div>
            <p className="text-2xl font-bold">{stats.difficulty}</p>
            <p className="text-[10px] opacity-80">Difficulty Level</p>
          </div>
        </div>

        <div className="bg-[#161920] border border-[#23262D] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#A1A8B3]">সঠিক উত্তরের হার</span>
            <span className="text-sm font-bold text-[#F5F7FA]">{stats.correctPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-[#1C1F26] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${stats.correctPercentage}%`,
                backgroundColor:
                  stats.correctPercentage >= 80
                    ? colors.success
                    : stats.correctPercentage >= 50
                    ? colors.amber
                    : colors.red,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#6B7280] mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    );
  };

  const renderExplanationContent = () => {
    const correctIdx = questionData.correctAnswer;
    const loading = isGenerating || isAiLoading;

    return (
      <div className="space-y-5">
        <div className="bg-[#00E5B3]/5 border border-[#00E5B3]/20 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#00E5B3]/10 border border-[#00E5B3]/30 flex items-center justify-center">
              <CheckCircle size={22} className="text-[#00E5B3]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#00E5B3]">সঠিক উত্তর</h3>
              <p className="text-base font-medium text-[#A1A8B3] mt-1">
                {letterLabels[correctIdx]}) {questionData.options[correctIdx]}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#9B51E0]/5 border border-[#9B51E0]/20 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#9B51E0]/10 border border-[#9B51E0]/30 flex items-center justify-center">
              <BookOpen size={20} className="text-[#9B51E0]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#9B51E0]">বিস্তারিত ব্যাখ্যা</h3>
              <p className="text-sm text-[#A1A8B3]">Detailed Explanation</p>
            </div>
          </div>
          <div className="bg-[#161920] border border-[#23262D] rounded-lg p-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-4 space-y-3">
                <Loader2 size={24} className="text-[#9B51E0] animate-spin" />
                <p className="text-base text-[#A1A8B3]">Please wait...</p>
              </div>
            ) : generationError ? (
              <p className="text-base text-[#EB5757] leading-8">{generationError}</p>
            ) : currentExplanation ? (
              <ExplanationView raw={currentExplanation} />
            ) : (
              <p className="text-base text-[#A1A8B3] leading-8">
                এই প্রশ্নের জন্য কোনো ব্যাখ্যা পাওয়া যায়নি।
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderBookmarkContent = () => {
    return (
      <div className="space-y-5">
        <div className="flex flex-col items-center justify-center py-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F2C94C] to-[#F2994A] flex items-center justify-center shadow-lg mb-4">
            <Star size={28} className="text-black" />
          </div>
          <h3 className="text-lg font-bold text-[#F5F7FA] mb-1">বুকমার্ক যুক্ত হয়েছে!</h3>
          <p className="text-sm text-[#A1A8B3] text-center">
            প্রশ্নটি আপনার বুকমার্ক তালিকায় যুক্ত করা হয়েছে।
            <br />
            পরে রিভিউ করার জন্য সহজেই খুঁজে পাবেন।
          </p>
        </div>

        <div className="bg-[#F2C94C]/5 border border-[#F2C94C]/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#F2C94C]/10 border border-[#F2C94C]/30 flex items-center justify-center">
              <ThumbsUp size={18} className="text-[#F2C94C]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#F2C94C]">বুকমার্কেড প্রশ্ন</p>
              <p className="text-xs text-[#A1A8B3]">প্রশ্ন #{questionData.id}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (modalType) {
      case 'answer':
        return renderAnswerContent();
      case 'statistics':
        return renderStatisticsContent();
      case 'explanation':
        return renderExplanationContent();
      case 'bookmark':
        return renderBookmarkContent();
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (modalType) {
      case 'answer': return 'উত্তর দেখুন';
      case 'statistics': return 'পরিসংখ্যান';
      case 'explanation': return 'ব্যাখ্যা';
      case 'bookmark': return 'বুকমার্ক';
      default: return 'Modal';
    }
  };

  const getIcon = () => {
    switch (modalType) {
      case 'answer': return <CheckCircle size={20} className="text-[#00E5B3]" />;
      case 'statistics': return <BarChart3 size={20} className="text-[#9B51E0]" />;
      case 'explanation': return <BookOpen size={20} className="text-[#9B51E0]" />;
      case 'bookmark': return <Star size={20} className="text-[#F2C94C]" />;
      default: return null;
    }
  };

  const getButtonColor = () => {
    switch (modalType) {
      case 'answer': return colors.success;
      case 'statistics': return colors.purple;
      case 'explanation': return colors.brand;
      case 'bookmark': return colors.amber;
      default: return colors.brand;
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          {getIcon()}
          <span className="text-xl font-bold text-[#F5F7FA]">{getTitle()}</span>
        </div>
      }
      closable
      open={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
      centered
      footer={
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-6 py-2.5 rounded-lg text-base font-semibold border border-[#23262D] bg-[#161920] text-[#A1A8B3] hover:bg-[#1C1F26] hover:text-[#F5F7FA] transition"
          >
            বন্ধ করুন
          </button>
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-6 py-2.5 rounded-lg text-base font-semibold text-white transition"
            style={{ backgroundColor: getButtonColor(), boxShadow: `0 4px 14px ${getButtonColor()}40` }}
          >
            বুঝলাম
          </button>
        </div>
      }
      width={520}
      styles={{
        header: {
          borderBottom: '1px solid #23262D',
        },
      }}
      className="[&_.ant-modal-content]:!bg-[#111318] [&_.ant-modal-content]:!border-[#23262D] [&_.ant-modal-close]:!text-[#A1A8B3] [&_.ant-modal-close]:hover:!text-[#F5F7FA]"
    >
      <div className="overflow-y-auto max-h-[65vh]">
        {renderContent()}
      </div>
    </Modal>
  );
};

export default CustomModal;