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
import FormattedQuestion from "../../mock_exam/ExamPaper/_components/FormattedQuestion";
import {
  useToggleFavoriteMutation,
  useGetFavoriteQuestionIdsQuery,
  useGetBatchQuestionStatsMutation,
  useGetQuestionsByExamQuery,
} from "@my-monorepo/store";
import { useTheme } from "../../../../theme/ThemeContext";

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

  const { isDark } = useTheme();
  const setId = searchParams.get("setId") || stateData?.questionSetId;
  const examIdParam = stateData?.examId || examType;

  const { data: liveQuestionSets } = useGetQuestionsByExamQuery(
    { examId: examIdParam! },
    { skip: !examIdParam }
  );

  const activeSet = liveQuestionSets?.find((s: any) => s._id === setId);
  const apiQuestions: ApiQuestion[] = activeSet?.data || stateData?.questions || [];
  const examTitle = stateData?.examTitle || activeSet?.exam?.name || "প্রশ্নপত্র";

  const [toggleFavoriteMutation] = useToggleFavoriteMutation();
  const { data: favoriteIdsData } = useGetFavoriteQuestionIdsQuery();
  const [getBatchStats] = useGetBatchQuestionStatsMutation();
  const [statsMap, setStatsMap] = useState<Record<string, any>>({});

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

  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});

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
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0B0D12]' : 'bg-[#e8e4db]'}`}>
        <div className={`text-center max-w-md p-8 rounded-2xl border ${isDark ? 'border-[#23262D] bg-[#111318]' : 'border-[#d8d4cb] bg-[#f2efe9] shadow-[3px_3px_0px_0px_#1a1a1a]'}`}>
          <AlertCircle size={40} className={isDark ? 'text-[#6B7280]' : 'text-[#b91c1c]'} />
          <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-[#F5F7FA]' : 'text-[#1a1a1a] font-serif font-black'}`}>
            কোনো প্রশ্ন পাওয়া যায়নি
          </h2>
          <p className={`text-sm mb-6 ${isDark ? 'text-[#A1A8B3]' : 'text-[#4a4a4a] font-serif italic'}`}>
            এই প্রশ্নপত্রে এখনো কোনো প্রশ্ন যুক্ত করা হয়নি।
          </p>
          <button
            onClick={() => navigate(-1)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition active:scale-95 ${
              isDark 
                ? 'bg-[#9B51E0] text-white hover:bg-[#7E3CC4]' 
                : 'bg-[#1a1a1a] text-[#f2efe9] border border-[#1a1a1a] font-serif shadow-[2px_2px_0px_0px_#b91c1c] hover:shadow-[3px_3px_0px_0px_#b91c1c]'
            }`}
          >
            <ArrowLeft size={16} />
            ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  // ─── LIGHT MODE (Vintage Paper Style — WIDER LAYOUT) ───────
  if (!isDark) {
    return (
      <div 
        className="min-h-screen bg-[#e8e4db] text-[#1a1a1a]"
        style={{
          backgroundImage: 'radial-gradient(#d8d4cb 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        {/* ── Sticky Header ── */}
        <div className="sticky -top-1 z-30 border-b border-[#d8d4cb] bg-[#f2efe9]/95 backdrop-blur-md shadow-[0_3px_0px_0px_#1a1a1a]">
          <div className="max-w-6xl mx-auto px-2 sm:px-4 py-3 space-y-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center w-9 h-9 shrink-0 rounded-lg border border-[#d8d4cb] bg-[#f2efe9] text-[#4a4a4a] hover:text-[#1a1a1a] hover:shadow-[2px_2px_0px_0px_#1a1a1a] shadow-[1px_1px_0px_0px_#1a1a1a] transition"
                aria-label="ফিরে যান"
              >
                <ArrowLeft size={18} />
              </button>

              <div className="flex-1 min-w-0">
                <h1 className="text-lg md:text-xl font-black truncate leading-tight text-[#1a1a1a] font-serif">
                  {examTitle}
                </h1>
                <p className="text-sm mt-0.5 text-[#4a4a4a] font-serif italic">
                  {filteredQuestions.length === totalQuestions
                    ? `${totalQuestions} টি প্রশ্ন`
                    : `${filteredQuestions.length} / ${totalQuestions} টি প্রশ্ন`}
                </p>
              </div>

              {bookmarkedCount > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#f2efe9] border border-[#1a1a1a] shrink-0 font-serif shadow-[1px_1px_0px_0px_#1a1a1a]">
                  <BookMarked size={12} className="text-[#b91c1c]" />
                  <span className="text-xs font-black text-[#1a1a1a]">
                    {bookmarkedCount}
                  </span>
                </div>
              )}

              <button
                onClick={allRevealed ? hideAll : revealAll}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold border transition shrink-0 font-serif ${
                  allRevealed
                    ? "bg-[#f2efe9] border-[#1a1a1a] text-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]"
                    : "bg-[#f2efe9] border-[#d8d4cb] text-[#4a4a4a] hover:border-[#1a1a1a] hover:text-[#1a1a1a] shadow-[1px_1px_0px_0px_#1a1a1a]"
                }`}
                title={allRevealed ? "সব উত্তর লুকান" : "সব উত্তর দেখুন"}
              >
                {allRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                <span className="hidden sm:inline text-xs">
                  {allRevealed ? "সব লুকান" : "সব দেখুন"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Question List (WIDER container) ── */}
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-6 space-y-5 pb-28">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-20 rounded-lg border bg-[#f2efe9] border-[#d8d4cb] shadow-[3px_3px_0px_0px_#1a1a1a]">
              <Search size={32} className="text-[#1a1a1a] mx-auto mb-3" />
              <p className="font-black text-[#1a1a1a] font-serif">কোনো প্রশ্ন পাওয়া যায়নি</p>
              <p className="text-sm mt-1 text-[#4a4a4a] font-serif italic">অনুসন্ধান পরিবর্তন করুন</p>
            </div>
          ) : (
            filteredQuestions.map((q, filteredIdx) => {
              const isBookmarked = bookmarked[q._id];
              const isRevealed = answerRevealed[q._id];
              const originalIdx = questions.findIndex((oq) => oq._id === q._id);

              return (
                <div
                  key={q._id}
                  className={`border rounded-lg transition-all duration-300 ${
                    isBookmarked
                      ? "bg-[#f2efe9] border-[#1a1a1a] shadow-[4px_4px_0px_0px_#b91c1c]"
                      : "bg-[#f2efe9] border-[#d8d4cb] hover:border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a]"
                  }`}
                >
                  <div className="p-5 sm:p-7">
                    <div className="flex items-start gap-3 mb-5">
                      <span className="shrink-0 mt-0.5 min-w-[28px] h-7 px-1.5 rounded-md bg-[#1a1a1a] border border-[#1a1a1a] flex items-center justify-center text-sm font-black text-[#f2efe9] font-serif">
                        {q.id}
                      </span>
                      
                      <div className="text-base leading-relaxed font-medium flex-1 text-[#1a1a1a]">
                        <FormattedQuestion text={q.question} />
                      </div>
                    </div>

                    {q.scenarioText && (
                      <div className="mb-4 rounded-md border p-4 border-[#d8d4cb] bg-[#e0dcd5] shadow-[1px_1px_0px_0px_#1a1a1a]">
                        <p className="text-sm leading-relaxed whitespace-pre-line text-[#4a4a4a] font-serif">
                          {q.scenarioText}
                        </p>
                      </div>
                    )}

                    {q.imageUrl && (
                      <div className="mb-4">
                        <img
                          src={q.imageUrl}
                          alt={`Question ${q.id}`}
                          className="max-w-full max-h-72 object-contain rounded-md border border-[#d8d4cb] bg-[#e0dcd5] shadow-[2px_2px_0px_0px_#1a1a1a]"
                        />
                      </div>
                    )}

                    {/* Options — 2-column grid on wider screens for a roomier feel */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 mb-5">
                      {q.options.map((option, i) => {
                        const isCorrect = q.correctAnswer === i;
                        const showAsCorrect = isRevealed && isCorrect;

                        return (
                          <div
                            key={i}
                            className={`flex items-center gap-3 px-4 py-3 rounded-md border-2 transition-all duration-200 ${
                              showAsCorrect
                                ? "bg-[#f2efe9] border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]"
                                : "bg-[#f7f3ec] border-[#d8d4cb] shadow-[1px_1px_0px_0px_#d8d4cb]"
                            }`}
                          >
                            <div
                              className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-black text-base shrink-0 transition-all duration-200 font-serif ${
                                showAsCorrect
                                  ? "bg-[#1a1a1a] border-[#1a1a1a] text-[#f2efe9]"
                                  : "bg-[#e8e4db] border-[#d8d4cb] text-[#4a4a4a]"
                              }`}
                            >
                              {letters[i]}
                            </div>

                            <span
                              className={`flex-1 text-[15px] font-medium leading-snug transition-colors duration-200 font-serif ${
                                showAsCorrect ? "text-[#1a1a1a] font-bold" : "text-[#4a4a4a]"
                              }`}
                            >
                              {option}
                            </span>

                            {showAsCorrect && (
                              <CheckCircle size={16} className="text-[#1a1a1a] shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-[#d8d4cb]">
                      <button
                        onClick={() => toggleAnswer(q._id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-[15px] font-bold border transition-all duration-200 active:scale-[0.97] font-serif ${
                          isRevealed
                            ? "bg-[#1a1a1a] border-[#1a1a1a] text-[#f2efe9] shadow-[2px_2px_0px_0px_#b91c1c]"
                            : "bg-[#f5f2eb] border-[#d8d4cb] text-[#4a4a4a] hover:bg-[#efeae0] hover:border-[#1a1a1a] hover:text-[#1a1a1a] shadow-[1px_1px_0px_0px_#1a1a1a]"
                        }`}
                      >
                        {isRevealed ? (
                          <><EyeOff size={16} /> উত্তর লুকান</>
                        ) : (
                          <><Eye size={16} /> উত্তর দেখুন</>
                        )}
                      </button>

                      <button
                        onClick={() => toggleBookmark(q._id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-[15px] font-bold border transition-all duration-200 active:scale-[0.97] font-serif ${
                          isBookmarked
                            ? "bg-[#f2efe9] border-[#b91c1c] text-[#b91c1c] shadow-[2px_2px_0px_0px_#b91c1c]"
                            : "bg-transparent border-[#d8d4cb] text-[#4a4a4a] hover:bg-[#efeae0] hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
                        }`}
                        aria-label={isBookmarked ? "বুকমার্ক সরান" : "বুকমার্ক করুন"}
                      >
                        <Heart size={16} fill={isBookmarked ? "currentColor" : "none"} />
                        <span className="hidden xs:inline">
                          {isBookmarked ? "সংরক্ষিত" : "ফেভারিট"}
                        </span>
                      </button>

                      <button
                        onClick={() => openModal("statistics", originalIdx)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-md text-[15px] font-bold border border-[#d8d4cb] text-[#4a4a4a] bg-transparent hover:bg-[#efeae0] hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition active:scale-[0.97] font-serif"
                      >
                        <BarChart3 size={16} />
                        <span className="hidden sm:inline">পরিসংখ্যান</span>
                      </button>

                      <button
                        onClick={() => openModal("explanation", originalIdx)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-md text-[15px] font-bold border border-[#d8d4cb] text-[#4a4a4a] bg-transparent hover:bg-[#efeae0] hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition active:scale-[0.97] font-serif"
                      >
                        <BookOpen size={16} />
                        <span className="hidden sm:inline">ব্যাখ্যা</span>
                      </button>

                      {isRevealed && (
                        <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f2efe9] border border-[#1a1a1a] shadow-[1px_1px_0px_0px_#1a1a1a]">
                          <CheckCircle size={11} className="text-[#1a1a1a]" />
                          <span className="text-[11px] font-black text-[#1a1a1a] font-serif">
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

  // ─── DARK MODE (Original Code - Unchanged) ─────────────────
  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F5F7FA]">
      <div className="sticky -top-1 z-30 border-b backdrop-blur-md bg-[#111318]/95 border-[#23262D]">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 py-4 space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-9 h-9 shrink-0 rounded-xl border transition border-[#23262D] bg-[#161920] hover:bg-[#1C1F26] hover:border-[#323742] text-[#A1A8B3] hover:text-[#F5F7FA]"
              aria-label="ফিরে যান"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-xl font-bold truncate leading-tight text-[#F5F7FA]">
                {examTitle}
              </h1>
              <p className="text-sm mt-0.5 text-[#6B7280]">
                {filteredQuestions.length === totalQuestions
                  ? `${totalQuestions} টি প্রশ্ন`
                  : `${filteredQuestions.length} / ${totalQuestions} টি প্রশ্ন`}
              </p>
            </div>

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
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition shrink-0 ${
                allRevealed
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
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 py-6 space-y-5 pb-28">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border bg-[#111318] border-[#23262D]">
            <Search size={32} className="text-[#6B7280]" />
            <p className="font-semibold text-[#A1A8B3]">কোনো প্রশ্ন পাওয়া যায়নি</p>
            <p className="text-sm mt-1 text-[#6B7280]">অনুসন্ধান পরিবর্তন করুন</p>
          </div>
        ) : (
          filteredQuestions.map((q, filteredIdx) => {
            const isBookmarked = bookmarked[q._id];
            const isRevealed = answerRevealed[q._id];
            const originalIdx = questions.findIndex((oq) => oq._id === q._id);

            return (
              <div
                key={q._id}
                className={`border rounded-2xl transition-all duration-300 ${
                  isBookmarked
                    ? "bg-[#111318] border-[#9B51E0]/40 shadow-[0_0_24px_-8px_rgba(155,81,224,0.3)]"
                    : "bg-[#111318] border-[#23262D] hover:border-[#2D3038]"
                }`}
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-3 mb-5">
                    <span className="shrink-0 mt-0.5 min-w-[28px] h-7 px-1.5 rounded-lg bg-[#9B51E0]/10 border border-[#9B51E0]/25 flex items-center justify-center text-sm font-bold text-[#9B51E0]">
                      {q.id}
                    </span>
                    
                    <div className="text-base leading-relaxed font-medium flex-1 text-[#F5F7FA]">
                      <FormattedQuestion text={q.question} />
                    </div>
                  </div>

                  {q.scenarioText && (
                    <div className="mb-4 rounded-xl border p-4 border-[#9B51E0]/25 bg-[#9B51E0]/5">
                      <p className="text-sm leading-relaxed whitespace-pre-line text-[#C9D0DA]">
                        {q.scenarioText}
                      </p>
                    </div>
                  )}

                  {q.imageUrl && (
                    <div className="mb-4">
                      <img
                        src={q.imageUrl}
                        alt={`Question ${q.id}`}
                        className="max-w-full max-h-72 object-contain rounded border border-[#23262D] bg-[#161920]"
                      />
                    </div>
                  )}

                  <div className="space-y-2 mb-5">
                    {q.options.map((option, i) => {
                      const isCorrect = q.correctAnswer === i;
                      const showAsCorrect = isRevealed && isCorrect;

                      return (
                        <div
                          key={i}
                          className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border-2 transition-all duration-200 ${
                            showAsCorrect
                              ? "bg-[#00E5B3]/8 border-[#00E5B3]/50"
                              : "bg-[#161920] border-[#23262D]"
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold text-base shrink-0 transition-all duration-200 ${
                              showAsCorrect
                                ? "bg-[#00E5B3] border-[#00E5B3] text-black"
                                : "bg-[#0B0D12] border-[#2D3038] text-[#A1A8B3]"
                            }`}
                          >
                            {letters[i]}
                          </div>

                          <span
                            className={`flex-1 text-base md:text-lg font-medium leading-snug transition-colors duration-200 ${
                              showAsCorrect ? "text-[#00E5B3]" : "text-[#C5CDD8]"
                            }`}
                          >
                            {option}
                          </span>

                          {showAsCorrect && (
                            <CheckCircle size={16} className="text-[#00E5B3] shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-[#1C1F26]">
                    <button
                      onClick={() => toggleAnswer(q._id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-base font-semibold border transition-all duration-200 active:scale-[0.97] ${
                        isRevealed
                          ? "bg-[#00E5B3]/10 border-[#00E5B3]/40 text-[#00E5B3]"
                          : "bg-[#161920] border-[#23262D] text-[#A1A8B3] hover:bg-[#1C1F26] hover:border-[#9B51E0]/40 hover:text-[#F5F7FA]"
                      }`}
                    >
                      {isRevealed ? (
                        <><EyeOff size={16} /> উত্তর লুকান</>
                      ) : (
                        <><Eye size={16} /> উত্তর দেখুন</>
                      )}
                    </button>

                    <button
                      onClick={() => toggleBookmark(q._id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-base font-semibold border transition-all duration-200 active:scale-[0.97] ${
                        isBookmarked
                          ? "bg-[#9B51E0]/10 border-[#9B51E0]/40 text-[#9B51E0]"
                          : "bg-transparent border-[#23262D] text-[#A1A8B3] hover:bg-[#161920] hover:border-[#323742] hover:text-[#F5F7FA]"
                      }`}
                      aria-label={isBookmarked ? "বুকমার্ক সরান" : "বুকমার্ক করুন"}
                    >
                      <Heart size={16} fill={isBookmarked ? "currentColor" : "none"} />
                      <span className="hidden xs:inline">
                        {isBookmarked ? "সংরক্ষিত" : "ফেভারিট"}
                      </span>
                    </button>

                    <button
                      onClick={() => openModal("statistics", originalIdx)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-base font-semibold border transition active:scale-[0.97] border-[#23262D] text-[#A1A8B3] bg-transparent hover:bg-[#161920] hover:border-[#323742] hover:text-[#F5F7FA]"
                    >
                      <BarChart3 size={16} />
                      <span className="hidden sm:inline">পরিসংখ্যান</span>
                    </button>

                    <button
                      onClick={() => openModal("explanation", originalIdx)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-base font-semibold border transition active:scale-[0.97] border-[#23262D] text-[#A1A8B3] bg-transparent hover:bg-[#161920] hover:border-[#323742] hover:text-[#F5F7FA]"
                    >
                      <BookOpen size={16} />
                      <span className="hidden sm:inline">ব্যাখ্যা</span>
                    </button>

                    {isRevealed && (
                      <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00E5B3]/8 border border-[#00E5B3]/25">
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