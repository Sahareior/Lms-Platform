import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  ArrowLeft,
  ChevronDown,
  BarChart3,
  Heart,
  CheckCircle,
  BookOpen,
  RefreshCw,
  Flag,
  Share2,
  AlertCircle,
  Clock,
  Zap,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import CustomModal from "../../../../reusable/CustomModal";
import FormattedQuestion from "../../mock_exam/ExamPaper/_components/FormattedQuestion";
import { usePostUserQuizsMutation } from "@my-monorepo/store/src/redux/api/userPerformanceApi";
import type { RecordMistakeQuestion } from "@my-monorepo/store";
import {
  useGetMeQuery,
  useRecordQuestionStatsMutation,
  useToggleFavoriteMutation,
  useGetFavoriteQuestionIdsQuery,
  useGetBatchQuestionStatsMutation,
  useRecordMistakesMutation,
  useAwardPracticeXpMutation,
  type PracticeXpResponse,
} from "@my-monorepo/store";
import { emitXpGained, emitLevelUp } from "../../../../gamification/GamificationToast";

// ── API → Component shape mapping ────────────────────────────
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
  _id: string;           // <-- ADDED MongoDB _id
  id: number;            // question_number (for UI)
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

/** Convert API question data to the shape the component expects */
function transformQuestions(apiQuestions: ApiQuestion[], statsMap: Record<string, any> = {}): Question[] {
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
        if (byText >= 0) {
          correctIndex = byText;
        }
      }
    }

    const stat = statsMap[q._id] || {
      totalAttempts: 0,
      correctPercentage: 0,
      averageTime: "—",
      difficulty: "Medium" as const,
    };

    return {
      _id: q._id,                       // <-- store the real ID
      id: q.question_number,
      question: q.question_text,
      scenarioText: q.scenario_text || "",
      imageUrl: q.image_url || "",
      options: validEntries.map(([, v]) => v),
      optionKeys: validEntries.map(([k]) => k),
      correctAnswer: correctIndex,
      explanation: q.explanation || "",
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

export default function ExamDin() {
  const navigate = useNavigate();
  const location = useLocation();

  const stateData = location.state as {
    questions?: ApiQuestion[];
    examTitle?: string;
    subject?: string;
    questionSetId?: string;
    examId?: string;
    subjectId?: string;
    examVersionId?: string;
  } | null;

  const apiQuestions = stateData?.questions ?? [];
  const subjectName = stateData?.subject ?? "";
  const subjectId = stateData?.subjectId;
  const examVersionId = stateData?.examVersionId;
  const examId = stateData?.examId;

  // ── Favorite & Stats API hooks ───────────────────────────
  const [recordQuestionStats] = useRecordQuestionStatsMutation();
  const [toggleFavoriteMutation] = useToggleFavoriteMutation();
  const { data: favoriteIdsData } = useGetFavoriteQuestionIdsQuery();
  const [getBatchStats] = useGetBatchQuestionStatsMutation();
  const [recordMistakes] = useRecordMistakesMutation();
  const [awardPracticeXp] = useAwardPracticeXpMutation();
  const [xpResult, setXpResult] = useState<PracticeXpResponse | null>(null);
  const [statsMap, setStatsMap] = useState<Record<string, any>>({});

  // Fetch stats for all questions on mount
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
          console.warn("Failed to fetch batch stats in ExamDin:", err);
        });
    }
  }, [apiQuestions, getBatchStats]);

  const questions = useMemo(
    () => transformQuestions(apiQuestions, statsMap),
    [apiQuestions, statsMap]
  );
  const totalQuestions = questions.length;
  const [postUserQuizs] = usePostUserQuizsMutation();
  const { data: user } = useGetMeQuery();
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [bookmarked, setBookmarked] = useState<Record<number, boolean>>({});

  // Sync initial favorite state from backend
  useEffect(() => {
    if (favoriteIdsData?.questionIds && questions.length > 0) {
      const favSet = new Set(favoriteIdsData.questionIds);
      const map: Record<number, boolean> = {};
      questions.forEach((q) => {
        if (favSet.has(q._id)) {
          map[q.id] = true;
        }
      });
      setBookmarked((prev) => ({ ...prev, ...map }));
    }
  }, [favoriteIdsData, questions]);

  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    type: "answer",
    questionIndex: 0,
  });
  const [isTopicOpen, setIsTopicOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  // Tracks which questions have already been persisted, so re-selecting an
  // option doesn't create duplicate quizPerformance documents.
  const postedRef = useRef<Set<number>>(new Set());

  // ── Countdown timer (1 min per question) ─────────────────
  const totalTime = totalQuestions * 60; // seconds
  const [timeLeft, setTimeLeft] = useState(totalTime);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Tick every second while the exam is active
  useEffect(() => {
    if (isSubmitted || totalQuestions === 0) return;
    const id = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [isSubmitted, totalQuestions]);


  const topics = subjectName
    ? [subjectName]
    : [
      "বাংলাদেশ বিষয়াবলী",
      "বাংলা সাহিত্য",
      "ইংরেজি",
      "গণিত",
      "বিজ্ঞান",
      "সামাজিক বিজ্ঞান",
    ];
  const [selectedTopic, setSelectedTopic] = useState(topics[0]);

  const openModal = (type: ModalState["type"], questionIndex: number) => {
    setModalState({ isOpen: true, type, questionIndex });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const toggleBookmark = (questionId: number) => {
    const nextVal = !bookmarked[questionId];
    setBookmarked((prev) => ({
      ...prev,
      [questionId]: nextVal,
    }));

    const qItem = questions.find((q) => q.id === questionId);
    if (qItem?._id) {
      toggleFavoriteMutation({
        questionId: qItem._id,
        questionDocId: stateData?.questionSetId,
        exam: examId,
        examVersion: examVersionId,
        subject: subjectId,
        questionSnapshot: {
          questionNumber: qItem.id,
          questionText: qItem.question,
          options: Object.fromEntries(qItem.options.map((o, idx) => [qItem.optionKeys[idx] || String(idx), o])),
          correctAnswer: qItem.options[qItem.correctAnswer] || "",
          explanation: qItem.explanation,
        },
      }).catch((err) => {
        console.warn("Failed to toggle favorite:", err);
      });
    }
  };

  const handleReset = () => {
    setSelected({});
    setBookmarked({});
  };

  const getAnsweredCount = () => Object.keys(selected).length;

  const getQuestionState = (qId: number) => {
    const isAnswered = selected[qId] !== undefined;
    const isCorrect =
      isAnswered &&
      selected[qId] === questions.find((q) => q.id === qId)?.correctAnswer;
    const isWrong = isAnswered && !isCorrect;
    return { isAnswered, isCorrect, isWrong };
  };

  // ─── Handle answer selection – persists the answer to the backend ───
  const handleSelectAnswer = useCallback(
    (qId: number, optionIndex: number) => {
      if (isSubmitted) return;
      console.log(`Selected answer for question ${qId}: option index ${optionIndex}`);
      const qItem = questions.find((q) => q.id === qId);
      if (!qItem) return;

      setSelected((prev) => {
        // Once an answer is selected it cannot be withdrawn
        if (prev[qId] !== undefined) return prev;
        return { ...prev, [qId]: optionIndex };
      });

      // Record question stats
      if (qItem._id) {
        const isCorr = optionIndex === qItem.correctAnswer;
        recordQuestionStats({
          questionId: qItem._id,
          questionDocId: stateData?.questionSetId,
          isCorrect: isCorr,
          selectedOption: qItem.optionKeys[optionIndex] || String(optionIndex),
        }).catch((err) => console.warn("Failed to record stats:", err));
      }

      const userId = user?._id;
      if (!userId || !qItem._id || !examId || !examVersionId) return;

      // Only persist the first selection per question
      if (postedRef.current.has(qId)) return;
      postedRef.current.add(qId);

      // Matches the QuizPerformance schema (question refs are the embedded
      // question subdocument _ids inside QuestionModel.data[])
      const payLoad = {
        user: userId,
        exam: examId,
        examVersion: examVersionId,
        subject: subjectId || null,
        submittedQuestions: [
          {
            question: qItem._id,
            // correct_answer is stored as an option key (K/L/M/N, or ক/খ/গ/ঘ) – stay consistent
            providedAnswer: qItem.optionKeys[optionIndex] ?? "",
          },
        ],
      };

      console.log("Persisting quiz performance:", payLoad);

      postUserQuizs(payLoad)
        .unwrap()
        .catch((err) => {
          console.warn("Failed to save quiz performance:", err);
        });
    },
    [isSubmitted, questions, user, examId, examVersionId, subjectId, postUserQuizs, recordQuestionStats, stateData]
  );

  // ─── Handle submit (persists all answers if not already saved) ───
  const handleSubmit = useCallback(
    (skipConfirm: boolean | unknown = false) => {
      if (isSubmitted) return;

      if (skipConfirm !== true) {
        const unanswered = totalQuestions - getAnsweredCount();
        if (unanswered > 0) {
          if (
            !window.confirm(
              `আপনি ${unanswered} টি প্রশ্নের উত্তর দেননি। তবুও সাবমিট করবেন?`
            )
          ) {
            return;
          }
        }
      }

      const userId = user?._id;
      if (userId && examId && examVersionId) {
        const answeredSubmissions = questions
          .map((q) => {
            const optIdx = selected[q.id];
            if (optIdx === undefined || !q._id) return null;
            return {
              question: q._id,
              providedAnswer: q.optionKeys[optIdx] ?? "",
            };
          })
          .filter(Boolean);

        if (answeredSubmissions.length > 0) {
          postUserQuizs({
            user: userId,
            exam: examId,
            examVersion: examVersionId,
            subject: subjectId || null,
            submittedQuestions: answeredSubmissions,
          })
            .unwrap()
            .catch((err) => {
              console.warn("Bulk quiz performance save failed in ExamDin:", err);
            });
        }
      }

      // ── Mistake Notebook: add every wrongly-answered question to the
      // spaced-repetition review queue (fire-and-forget) ──
      const wrongMistakes = questions
        .map((q) => {
          const selIdx = selected[q.id];
          if (selIdx === undefined || (!q._id && !q.id)) return null;
          if (selIdx === q.correctAnswer) return null;
          return {
            questionId: String(q._id || q.id),
            questionDocId: stateData?.questionSetId,
            questionText: q.question || "",
            options: Object.fromEntries(
              (q.optionKeys ?? []).map((k, oi) => [k, q.options[oi] ?? ""])
            ),
            correctAnswer: q.optionKeys?.[q.correctAnswer ?? -1] ?? null,
            lastWrongAnswer: q.optionKeys?.[selIdx] ?? null,
            exam: examId || null,
            examName: stateData?.examTitle || "",
            subject: subjectId || null,
            subjectName: subjectName || "",
          } as RecordMistakeQuestion;
        })
        .filter(Boolean) as RecordMistakeQuestion[];

      if (wrongMistakes.length > 0) {
        recordMistakes({ questions: wrongMistakes }).catch((err) => {
          console.warn("Failed to add mistakes to notebook in ExamDin:", err);
        });
      }

      // ── Gamification: award XP for this practice session (fire-and-forget).
      // Uses the same reward table as the mock-exam QuizAttempt flow: a
      // completion bonus, a high-score bonus, and per-question effort XP. ──
      const correctCount = questions.filter((q) => selected[q.id] === q.correctAnswer).length;
      if (userId) {
        awardPracticeXp({ correctCount, totalCount: totalQuestions, source: "question_center" })
          .unwrap()
          .then((res) => {
            setXpResult(res);
            // App-wide XP toast + (rare) level-up celebration
            emitXpGained({
              xpAwarded: res.xpAwarded,
              level: res.level,
              xpIntoLevel: res.xpIntoLevel,
              xpForNextLevel: res.xpForNextLevel,
              progress: res.progress,
              currentStreak: res.currentStreak,
              source: res.source,
            });
            if (res.levelUp && res.previousLevel) {
              emitLevelUp({
                level: res.level,
                xpIntoLevel: res.xpIntoLevel,
                xpForNextLevel: res.xpForNextLevel,
              });
            }
          })
          .catch((err) => {
            console.warn("Failed to award practice XP:", err);
          });
      }

      setIsSubmitted(true);
    },
    [
      isSubmitted,
      totalQuestions,
      getAnsweredCount,
      user,
      examId,
      examVersionId,
      subjectId,
      questions,
      selected,
      postUserQuizs,
      recordMistakes,
      awardPracticeXp,
      stateData,
      subjectName,
    ]
  );

  // Auto-submit when time runs out (bypasses the confirm dialog)
  useEffect(() => {
    if (timeLeft === 0 && !isSubmitted) {
      handleSubmit(true);
    }
  }, [timeLeft, isSubmitted, handleSubmit]);

  // ─── Memoized local score ───
  const localScore = useMemo(() => {
    let correct = 0;
    questions.forEach((q) => {
      const ans = selected[q.id];
      if (ans !== undefined && ans === q.correctAnswer) correct++;
    });
    return correct;
  }, [selected, questions]);

  // ── Empty state ─────────────────────────────────────────────
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
      {/* Header */}
      <div className="sticky -top-10 z-30 bg-[#111318] border-b border-[#23262D]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Progress & Topic Row */}
          <div className="flex items-center justify-between pb-4 gap-4">
            {!isSubmitted && (
              <div className="relative">
                <button
                  onClick={() => setIsTopicOpen(!isTopicOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#23262D] bg-[#111318] hover:bg-[#161920] text-[#A1A8B3] hover:text-[#F5F7FA] transition"
                >
                  <span className="text-sm font-medium">{selectedTopic}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${isTopicOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {isTopicOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 rounded-lg border border-[#23262D] bg-[#111318] shadow-lg z-50">
                    {topics.map((topic) => (
                      <button
                        key={topic}
                        onClick={() => {
                          setSelectedTopic(topic);
                          setIsTopicOpen(false);
                        }}
                        className={`w-full text-left px-4 py-1 text-sm transition ${selectedTopic === topic
                            ? "bg-[#9B51E0]/10 text-[#9B51E0] font-semibold border-l-2 border-[#9B51E0]"
                            : "text-[#A1A8B3] hover:bg-[#161920] hover:text-[#F5F7FA]"
                          }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Timer + answered count */}
            <div className="flex items-center gap-3">
              {!isSubmitted && (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-bold text-sm border transition-colors ${timeLeft <= totalTime * 0.1
                      ? "bg-[#EB5757]/10 border-[#EB5757]/40 text-[#EB5757] animate-pulse"
                      : timeLeft <= totalTime * 0.3
                        ? "bg-[#F2C94C]/10 border-[#F2C94C]/40 text-[#F2C94C]"
                        : "bg-[#161920] border-[#23262D] text-[#F5F7FA]"
                    }`}
                >
                  <Clock size={13} />
                  {formatTime(timeLeft)}
                </div>
              )}
              <div className="text-sm text-[#A1A8B3]">
                {isSubmitted
                  ? `${localScore}/${totalQuestions} correct`
                  : `${getAnsweredCount()}/${totalQuestions} answered`}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="pb-4">
            <div className="flex gap-1">
              {questions.map((q) => {
                const { isAnswered, isCorrect } = getQuestionState(q.id);
                return (
                  <div
                    key={q.id}
                    className={`h-1 flex-1 rounded-full transition-colors ${isAnswered
                        ? isCorrect
                          ? "bg-[#00E5B3]"
                          : "bg-[#EB5757]"
                        : "bg-[#23262D]"
                      }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ────── SUBMITTED SCORE BANNER ────── */}
      {isSubmitted && (
        <div className="sticky top-0 z-30 bg-[#00E5B3]/10 border-b border-[#00E5B3]/30 px-4 md:px-8 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-[#00E5B3] text-xl" />
              <span className="font-bold text-[#00E5B3] text-sm">
                Quiz Submitted! Score: {localScore}/{totalQuestions} (
                {totalQuestions > 0
                  ? Math.round((localScore / totalQuestions) * 100)
                  : 0}
                %)
              </span>
            </div>
            {xpResult && (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F2C94C]/10 border border-[#F2C94C]/40 text-[#F2C94C] text-sm font-bold">
                  <Zap size={14} />
                  +{xpResult.xpAwarded} XP
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-[#9B51E0]/10 border border-[#9B51E0]/40 text-[#9B51E0] text-xs font-bold">
                  Level {xpResult.level} · {xpResult.xpIntoLevel}/{xpResult.xpForNextLevel} XP
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {questions.map((q, qIdx) => {
          const { isWrong } = getQuestionState(q.id);
          const isSelected = selected[q.id] !== undefined;
          const isBookmarked = bookmarked[q.id];

          return (
            <div
              key={q.id}
              className="relative bg-[#111318] border border-[#23262D] rounded-2xl shadow-sm"
            >
              {/* Question Badge */}
              <div className="px-4 py-1 text-xs font-semibold text-[#9B51E0]">
                Question {q.id}
              </div>

              <div className="p-6 sm:p-8 pt-4">
                <div className="text-[#F5F7FA] text-base leading-relaxed font-medium mb-5">
                  <FormattedQuestion text={q.question} />
                </div>

                {q.scenarioText && (
                  <div className="mb-5 rounded-xl border border-[#9B51E0]/25 bg-[#9B51E0]/5 p-4">
                    <p className="text-sm leading-relaxed text-[#C9D0DA] whitespace-pre-line">
                      {q.scenarioText}
                    </p>
                  </div>
                )}

                {q.imageUrl && (
                  <img
                    src={q.imageUrl}
                    alt={`Question ${q.id}`}
                    className="mb-5 max-h-72 max-w-full rounded border border-[#23262D] bg-[#161920] object-contain"
                  />
                )}

                {/* Options */}
                <div className="space-y-3 mb-6">
                  {q.options.map((option, i) => {
                    const isOptionSelected = selected[q.id] === i;
                    const isCorrectOption =
                      q.correctAnswer === i && (isSelected || isSubmitted);
                    const isWrongSelection = isOptionSelected && isWrong;
                    const showCorrectAnswer =
                      isSubmitted && q.correctAnswer === i;
                    const isClickable = !isSubmitted;

                    return (
                      <label
                        key={i}
                        className={`relative flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border-2 ${showCorrectAnswer
                            ? "bg-[#00E5B3]/10 border-[#00E5B3]"
                            : isWrongSelection
                              ? "bg-[#EB5757]/10 border-[#EB5757]"
                              : isOptionSelected
                                ? "bg-[#9B51E0]/10 border-[#9B51E0]"
                                : "bg-[#161920] border-[#23262D] hover:border-[#323742]"
                          } ${!isClickable ? "cursor-default" : ""}`}
                      >
                        <input
                          type="radio"
                          className="hidden"
                          name={`q-${q.id}`}
                          checked={
                            isOptionSelected ||
                            (isSubmitted && q.correctAnswer === i)
                          }
                          onChange={() => handleSelectAnswer(q.id, i)}
                          disabled={isSubmitted}
                        />

                        <div
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-semibold shrink-0 transition-colors ${isCorrectOption
                              ? "bg-[#00E5B3] border-[#00E5B3] text-black"
                              : isOptionSelected && isWrong
                                ? "bg-[#EB5757] border-[#EB5757] text-white"
                                : isOptionSelected
                                  ? "bg-[#9B51E0] border-[#9B51E0] text-white"
                                  : "bg-[#161920] border-[#23262D] text-[#A1A8B3]"
                            }`}
                        >
                          {letters[i]}
                        </div>

                        <span
                          className={`text-base font-medium flex-1 ${isCorrectOption
                              ? "text-[#00E5B3]"
                              : isOptionSelected && isWrong
                                ? "text-[#EB5757]"
                                : isOptionSelected
                                  ? "text-[#F5F7FA]"
                                  : "text-[#A1A8B3]"
                            }`}
                        >
                          {option}
                        </span>

                        {showCorrectAnswer && (
                          <CheckCircle className="text-[#00E5B3]" size={20} />
                        )}
                        {isWrongSelection && (
                          <AlertCircle className="text-[#EB5757]" size={20} />
                        )}
                      </label>
                    );
                  })}
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action Bar */}
      <div className="sticky -bottom-1 z-30 bg-[#111318] border-t border-[#23262D]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-[#A1A8B3]">
            <Flag size={14} />
            <span>
              {isSubmitted
                ? `${localScore} of ${totalQuestions} correct`
                : `${getAnsweredCount()} of ${totalQuestions} answered`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {!isSubmitted && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#161920] text-[#A1A8B3] border border-[#23262D] hover:bg-[#1C1F26] hover:text-[#F5F7FA] transition"
              >
                <RefreshCw size={14} />
                Reset
              </button>
            )}
            <button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitted}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#9B51E0] hover:bg-[#7E3CC4] transition active:scale-95 shadow-[0_0_15px_-3px_rgba(155,81,224,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Share2 size={14} />
              {isSubmitted ? "Submitted" : "Submit"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <CustomModal
        setIsModalOpen={closeModal}
        isModalOpen={modalState.isOpen}
        modalType={modalState.type}
        questionData={questions[modalState.questionIndex]}
        letterLabels={letters}
      />
    </div>
  );
}