import { useState, useMemo, useCallback, useEffect } from "react";
import {
  ArrowLeft,
  Heart,
  BarChart3,
  BookOpen,
  CheckCircle,
  Search,
  X,
  SlidersHorizontal,
  AlertCircle,
  BookMarked,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import CustomModal from "../../../../reusable/CustomModal";
import {
  useToggleFavoriteMutation,
  useGetFavoriteQuestionIdsQuery,
  useGetBatchQuestionStatsMutation,
  useGetQuestionsByExamQuery,
} from "@my-monorepo/store";

// ── Types ─────────────────────────────────────────────────────
interface ApiQuestion {
  _id: string;
  question_number: number;
  question_text: string;
  scenario_text?: string;
  image_url?: string;
  options: Record<string, string>;
  correct_answer: string;
  explanation?: string;
}

interface Question {
  _id: string;
  id: number;
  question: string;
  scenarioText: string;
  imageUrl: string;
  options: string[];
  optionKeys: string[];
  correctAnswer: number;
  explanation: string;
  stats: {
    totalAttempts: number;
    correctPercentage: number;
    averageTime: string;
    difficulty: "Easy" | "Medium" | "Hard";
  };
}

interface ModalState {
  isOpen: boolean;
  type: "answer" | "statistics" | "explanation" | "bookmark";
  questionIndex: number;
}

// ── Transform API → component shape ──────────────────────────
function transformQuestions(
  apiQuestions: ApiQuestion[],
  statsMap: Record<string, any> = {},
  extraExplanations: Record<number, string> = {}
): Question[] {
  return apiQuestions.map((q) => {
    const validEntries = q.options
      ? (Object.entries(q.options).filter(([, v]) => v) as [string, string][])
      : [];

    let correctIndex = 0;
    if (q.correct_answer) {
      const byKey = validEntries.findIndex(([k]) => k === q.correct_answer);
      if (byKey >= 0) {
        correctIndex = byKey;
      } else {
        const byText = validEntries.findIndex(([, v]) => v === q.correct_answer);
        if (byText >= 0) correctIndex = byText;
      }
    }

    const stat = statsMap[q._id] || {
      totalAttempts: 0,
      correctPercentage: 0,
      averageTime: "—",
      difficulty: "Medium" as const,
    };

    return {
      _id: q._id,
      id: q.question_number,
      question: q.question_text,
      scenarioText: q.scenario_text || "",
      imageUrl: q.image_url || "",
      options: validEntries.map(([, v]) => v),
      optionKeys: validEntries.map(([k]) => k),
      correctAnswer: correctIndex,
      explanation: extraExplanations[q.question_number] || q.explanation || "",
      stats: {
        totalAttempts: stat.totalAttempts || 0,
        correctPercentage: stat.correctPercentage || 0,
        averageTime: stat.averageTime || "—",
        difficulty: stat.difficulty || "Medium",
      },
    };
  });
}

const letters = ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ"];

const DIFFICULTY_FILTERS = [
  { key: "All", label: "সব কঠিনতা" },
  { key: "Easy", label: "সহজ" },
  { key: "Medium", label: "মাঝারি" },
  { key: "Hard", label: "কঠিন" },
];

// Formats inline roman numeral lists and typical prompt questions to be on new lines
function formatQuestionText(text: string) {
  if (!text) return text;
  return text
    .replace(/\s+(i\.\s)/g, '\n$1')
    .replace(/\s+(ii\.\s)/g, '\n$1')
    .replace(/\s+(iii\.\s)/g, '\n$1')
    .replace(/\s+(iv\.\s)/g, '\n$1')
    .replace(/\s+(v\.\s)/g, '\n$1')
    .replace(/\s+(vi\.\s)/g, '\n$1')
    .replace(/\s+(নিচের কোনটি সঠিক\?)/g, '\n$1');
}

// ─────────────────────────────────────────────────────────────
export default function QuestionView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { examType } = useParams<{ examType: string }>();
  const [searchParams] = useSearchParams();

  const stateData = location.state as {
    questions?: ApiQuestion[];
    examTitle?: string;
    subject?: string;
    questionSetId?: string;
    examId?: string;
    subjectId?: string;
    examVersionId?: string;
  } | null;

  const setId = searchParams.get("setId") || stateData?.questionSetId;
  const examIdParam = stateData?.examId || examType;

  // Live query which refetches automatically when any question explanation is saved
  const { data: liveQuestionSets } = useGetQuestionsByExamQuery(
    { examId: examIdParam! },
    { skip: !examIdParam }
  );

  const activeSet = liveQuestionSets?.find((s: any) => s._id === setId);
  const apiQuestions: ApiQuestion[] = activeSet?.data || stateData?.questions || [];
  const examTitle = stateData?.examTitle || activeSet?.exam?.name || "প্রশ্নপত্র";

  // ── Favorite & Stats API hooks ───────────────────────────
  const [toggleFavoriteMutation] = useToggleFavoriteMutation();
  const { data: favoriteIdsData } = useGetFavoriteQuestionIdsQuery();
  const [getBatchStats] = useGetBatchQuestionStatsMutation();
  const [statsMap, setStatsMap] = useState<Record<string, any>>({});

  // Fetch stats for all questions in this view on mount
  useEffect(() => {
    if (apiQuestions.length > 0) {
      const qIds = apiQuestions.map((q) => q._id);
      getBatchStats({ questionIds: qIds })
        .unwrap()
        .then((res) => {
          if (res?.stats) {
            setStatsMap(res.stats);
          }
        })
        .catch((err) => {
          console.warn("Failed to fetch batch question stats:", err);
        });
    }
  }, [apiQuestions, getBatchStats]);

  const [dynamicExplanations, setDynamicExplanations] = useState<Record<number, string>>({});

  const questions = useMemo(
    () => transformQuestions(apiQuestions, statsMap, dynamicExplanations),
    [apiQuestions, statsMap, dynamicExplanations]
  );
  const totalQuestions = questions.length;

  // ── UI state ─────────────────────────────────────────────
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});

  // Sync initial favorite state from backend
  useEffect(() => {
    if (favoriteIdsData?.questionIds) {
      const map: Record<string, boolean> = {};
      favoriteIdsData.questionIds.forEach((id) => {
        map[id] = true;
      });
      setBookmarked((prev) => ({ ...prev, ...map }));
    }
  }, [favoriteIdsData]);

  const [answerRevealed, setAnswerRevealed] = useState<Record<string, boolean>>({});
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    type: "answer",
    questionIndex: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // ── Derived ───────────────────────────────────────────────
  const bookmarkedCount = Object.values(bookmarked).filter(Boolean).length;
  const revealedCount = Object.values(answerRevealed).filter(Boolean).length;

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch =
        !searchQuery ||
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.options.some((o) => o.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDifficulty =
        difficultyFilter === "All" || q.stats.difficulty === difficultyFilter;

      return matchesSearch && matchesDifficulty;
    });
  }, [questions, searchQuery, difficultyFilter]);

  // ── Handlers ─────────────────────────────────────────────
  const openModal = useCallback(
    (type: ModalState["type"], questionIndex: number) => {
      setModalState({ isOpen: true, type, questionIndex });
    },
    []
  );
  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const toggleBookmark = useCallback((id: string) => {
    const nextState = !bookmarked[id];
    setBookmarked((prev) => ({ ...prev, [id]: nextState }));

    const targetQ = questions.find((q) => q._id === id);
    toggleFavoriteMutation({
      questionId: id,
      questionDocId: stateData?.questionSetId,
      exam: stateData?.examId,
      examVersion: stateData?.examVersionId,
      subject: stateData?.subjectId,
      questionSnapshot: targetQ
        ? {
            questionNumber: targetQ.id,
            questionText: targetQ.question,
            options: Object.fromEntries(targetQ.options.map((o, idx) => [targetQ.optionKeys[idx] || String(idx), o])),
            correctAnswer: targetQ.options[targetQ.correctAnswer] || "",
            explanation: targetQ.explanation,
          }
        : undefined,
    }).catch((err) => {
      console.warn("Failed to persist favorite toggle:", err);
    });
  }, [bookmarked, questions, stateData, toggleFavoriteMutation]);

  const toggleAnswer = useCallback((id: string) => {
    setAnswerRevealed((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const revealAll = () => {
    const all: Record<string, boolean> = {};
    filteredQuestions.forEach((q) => (all[q._id] = true));
    setAnswerRevealed((prev) => ({ ...prev, ...all }));
  };

  const hideAll = () => {
    const all: Record<string, boolean> = {};
    filteredQuestions.forEach((q) => (all[q._id] = false));
    setAnswerRevealed((prev) => ({ ...prev, ...all }));
  };

  const allRevealed =
    filteredQuestions.length > 0 &&
    filteredQuestions.every((q) => answerRevealed[q._id]);

  // ── Empty state ───────────────────────────────────────────
  if (totalQuestions === 0) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <AlertCircle size={40} className="text-[#6B7280] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#F5F7FA] mb-2">
            কোনো প্রশ্ন পাওয়া যায়নি
          </h2>
          <p className="text-sm text-[#A1A8B3] mb-6">
            এই প্রশ্নপত্রে এখনো কোনো প্রশ্ন যুক্ত করা হয়নি।
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#9B51E0] text-white rounded-xl font-bold text-sm hover:bg-[#7E3CC4] transition active:scale-95"
          >
            <ArrowLeft size={16} />
            ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F5F7FA]">

      {/* ── Sticky Header ──────────────────────────────────── */}
      <div className="sticky -top-1 z-30 bg-[#111318]/95 backdrop-blur-md border-b border-[#23262D]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 space-y-3">

          {/* Row 1: back + title + badges */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-9 h-9 shrink-0 rounded-xl border border-[#23262D] bg-[#161920] hover:bg-[#1C1F26] hover:border-[#323742] text-[#A1A8B3] hover:text-[#F5F7FA] transition"
              aria-label="ফিরে যান"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-xl font-bold text-[#F5F7FA] truncate leading-tight">
                {examTitle}
              </h1>
              <p className="text-sm text-[#6B7280] mt-0.5">
                {filteredQuestions.length === totalQuestions
                  ? `${totalQuestions} টি প্রশ্ন`
                  : `${filteredQuestions.length} / ${totalQuestions} টি প্রশ্ন`}
              </p>
            </div>

            {/* Bookmark badge */}
            {bookmarkedCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#9B51E0]/10 border border-[#9B51E0]/30 shrink-0">
                <BookMarked size={12} className="text-[#9B51E0]" />
                <span className="text-xs font-bold text-[#9B51E0]">
                  {bookmarkedCount}
                </span>
              </div>
            )}
                      <button
              onClick={allRevealed ? hideAll : revealAll}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition shrink-0 ${allRevealed
                ? "bg-[#00E5B3]/10 border-[#00E5B3]/40 text-[#00E5B3]"
                : "bg-[#161920] border-[#23262D] text-[#A1A8B3] hover:border-[#323742] hover:text-[#F5F7FA]"
                }`}
              title={allRevealed ? "সব উত্তর লুকান" : "সব উত্তর দেখুন"}
            >
              {allRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
              <span className="hidden sm:inline text-xs">
                {allRevealed ? "সব লুকান" : "সব দেখুন"}
              </span>
            </button>
          </div>

          {/* Row 2: Search + filter + reveal-all */}
          {/* <div className="flex items-center gap-2">
           
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="প্রশ্ন বা উত্তর খুঁজুন..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#161920] border border-[#23262D] text-sm text-[#F5F7FA] placeholder:text-[#6B7280] focus:outline-none focus:border-[#9B51E0]/50 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#A1A8B3]"
                >
                  <X size={13} />
                </button>
              )}
            </div>

         
            <div className="relative shrink-0">
              <button
                onClick={() => setShowFilterDropdown((p) => !p)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#161920] border border-[#23262D] hover:border-[#323742] text-sm text-[#A1A8B3] hover:text-[#F5F7FA] transition"
              >
                <SlidersHorizontal size={14} />
                <ChevronDown
                  size={12}
                  className={`transition-transform ${showFilterDropdown ? "rotate-180" : ""}`}
                />
              </button>
              {showFilterDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowFilterDropdown(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-36 rounded-xl border border-[#23262D] bg-[#111318] shadow-xl z-20 overflow-hidden">
                    {DIFFICULTY_FILTERS.map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => {
                          setDifficultyFilter(key);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition ${difficultyFilter === key
                          ? "bg-[#9B51E0]/10 text-[#9B51E0] font-semibold border-l-2 border-[#9B51E0]"
                          : "text-[#A1A8B3] hover:bg-[#161920] hover:text-[#F5F7FA]"
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            
  
          </div> */}

        </div>
      </div>

      {/* ── Question List ───────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5 pb-28">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-20 bg-[#111318] rounded-2xl border border-[#23262D]">
            <Search size={32} className="text-[#6B7280] mx-auto mb-3" />
            <p className="text-[#A1A8B3] font-semibold">কোনো প্রশ্ন পাওয়া যায়নি</p>
            <p className="text-sm text-[#6B7280] mt-1">অনুসন্ধান পরিবর্তন করুন</p>
          </div>
        ) : (
          filteredQuestions.map((q, filteredIdx) => {
            const isBookmarked = bookmarked[q._id];
            const isRevealed = answerRevealed[q._id];
            const originalIdx = questions.findIndex((oq) => oq._id === q._id);

            return (
              <div
                key={q._id}
                className={`bg-[#111318] border rounded-2xl transition-all duration-300 ${isBookmarked
                  ? "border-[#9B51E0]/40 shadow-[0_0_24px_-8px_rgba(155,81,224,0.3)]"
                  : "border-[#23262D] hover:border-[#2D3038]"
                  }`}
              >
                <div className="p-5 sm:p-6">

                  {/* ── Question number + text ── */}
                  <div className="flex items-start gap-3 mb-5">
                    <span className="shrink-0 mt-0.5 min-w-[28px] h-7 px-1.5 rounded-lg bg-[#9B51E0]/10 border border-[#9B51E0]/25 flex items-center justify-center text-sm font-bold text-[#9B51E0]">
                      {q.id}
                    </span>
                    <p className="text-[#F5F7FA] font-medium leading-8 text-base md:text-2xl sm:text-lg flex-1 whitespace-pre-wrap">
                      {formatQuestionText(q.question)}
                    </p>
                  </div>

                  {/* Scenario block */}
                  {q.scenarioText && (
                    <div className="mb-4 rounded-xl border border-[#9B51E0]/25 bg-[#9B51E0]/5 p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-[#9B51E0] mb-2">
                        Scenario / Passage
                      </p>
                      <p className="text-base md:text-lg leading-relaxed text-[#E0E4EE] whitespace-pre-line">
                        {q.scenarioText}
                      </p>
                    </div>
                  )}

                  {/* Image */}
                  {q.imageUrl && (
                    <div className="mb-4">
                      <img
                        src={q.imageUrl}
                        alt="Question diagram"
                        className="max-w-full max-h-60 object-contain rounded-xl border border-[#23262D] bg-[#161920]"
                      />
                    </div>
                  )}

                  {/* ── Options ── */}
                  <div className="space-y-2 mb-5">
                    {q.options.map((option, i) => {
                      const isCorrect = q.correctAnswer === i;
                      const showAsCorrect = isRevealed && isCorrect;

                      return (
                        <div
                          key={i}
                          className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border-2 transition-all duration-200 ${showAsCorrect
                            ? "bg-[#00E5B3]/8 border-[#00E5B3]/50"
                            : "bg-[#161920] border-[#23262D]"
                            }`}
                        >
                          {/* Letter badge */}
                          <div
                            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold text-base shrink-0 transition-all duration-200 ${showAsCorrect
                              ? "bg-[#00E5B3] border-[#00E5B3] text-black"
                              : "bg-[#0B0D12] border-[#2D3038] text-[#A1A8B3]"
                              }`}
                          >
                            {letters[i]}
                          </div>

                          {/* Option text */}
                          <span
                            className={`flex-1 text-base md:text-lg font-medium leading-snug transition-colors duration-200 ${showAsCorrect ? "text-[#00E5B3]" : "text-[#C5CDD8]"
                              }`}
                          >
                            {option}
                          </span>

                          {showAsCorrect && (
                            <CheckCircle
                              size={16}
                              className="text-[#00E5B3] shrink-0"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* ── Action bar ── */}
                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-[#1C1F26]">

                    {/* See Answer button — primary CTA */}
                    <button
                      onClick={() => toggleAnswer(q._id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-base font-semibold border transition-all duration-200 active:scale-[0.97] ${isRevealed
                        ? "bg-[#00E5B3]/10 border-[#00E5B3]/40 text-[#00E5B3]"
                        : "bg-[#161920] border-[#23262D] text-[#A1A8B3] hover:bg-[#1C1F26] hover:border-[#9B51E0]/40 hover:text-[#F5F7FA]"
                        }`}
                    >
                      {isRevealed ? (
                        <>
                          <EyeOff size={16} />
                          উত্তর লুকান
                        </>
                      ) : (
                        <>
                          <Eye size={16} />
                          উত্তর দেখুন
                        </>
                      )}
                    </button>

                    {/* Bookmark */}
                    <button
                      onClick={() => toggleBookmark(q._id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-base font-semibold border transition-all duration-200 active:scale-[0.97] ${isBookmarked
                        ? "bg-[#9B51E0]/10 border-[#9B51E0]/40 text-[#9B51E0]"
                        : "bg-transparent border-[#23262D] text-[#A1A8B3] hover:bg-[#161920] hover:border-[#323742] hover:text-[#F5F7FA]"
                        }`}
                      aria-label={isBookmarked ? "বুকমার্ক সরান" : "বুকমার্ক করুন"}
                    >
                      <Heart
                        size={16}
                        fill={isBookmarked ? "currentColor" : "none"}
                      />
                      <span className="hidden xs:inline">
                        {isBookmarked ? "সংরক্ষিত" : "ফেভারিট"}
                      </span>
                    </button>

                    {/* Statistics */}
                    <button
                      onClick={() => openModal("statistics", originalIdx)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-base font-semibold border border-[#23262D] text-[#A1A8B3] bg-transparent hover:bg-[#161920] hover:border-[#323742] hover:text-[#F5F7FA] transition active:scale-[0.97]"
                    >
                      <BarChart3 size={16} />
                      <span className="hidden sm:inline">পরিসংখ্যান</span>
                    </button>

                    {/* Explanation */}
                    <button
                      onClick={() => openModal("explanation", originalIdx)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-base font-semibold border border-[#23262D] text-[#A1A8B3] bg-transparent hover:bg-[#161920] hover:border-[#323742] hover:text-[#F5F7FA] transition active:scale-[0.97]"
                    >
                      <BookOpen size={16} />
                      <span className="hidden sm:inline">ব্যাখ্যা</span>
                    </button>

                    {/* Correct answer pill — visible only when revealed, pushed to the right */}
                    {isRevealed && (
                      <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00E5B3]/8 border border-[#00E5B3]/25 animate-[fadeIn_0.2s_ease]">
                        <CheckCircle size={11} className="text-[#00E5B3]" />
                        <span className="text-[11px] font-bold text-[#00E5B3]">
                          সঠিক উত্তর: {letters[q.correctAnswer]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>


      {/* ── Modal ──────────────────────────────────────────── */}
      <CustomModal
        setIsModalOpen={closeModal}
        isModalOpen={modalState.isOpen}
        modalType={modalState.type}
        questionData={
          questions[modalState.questionIndex]
            ? {
                ...questions[modalState.questionIndex],
                questionSetId: stateData?.questionSetId,
              }
            : undefined
        }
        letterLabels={letters}
        onExplanationSaved={(qId, exp) => {
          setDynamicExplanations((prev) => ({ ...prev, [qId]: exp }));
        }}
      />
    </div>
  );
}
