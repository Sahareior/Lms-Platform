import { useState, useMemo, useCallback, useRef } from "react";
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
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import CustomModal from "../../../../reusable/CustomModal";
import { usePostUserQuizsMutation } from "@my-monorepo/store/src/redux/api/userPerformanceApi";
import { useGetMeQuery } from "@my-monorepo/store";

// ── API → Component shape mapping ────────────────────────────
const optionKeys = ["K", "L", "M", "N"] as const;
const letterToIndex: Record<string, number> = { K: 0, L: 1, M: 2, N: 3 };

interface ApiQuestion {
  _id: string;
  question_number: number;
  question_text: string;
  scenario_text?: string;
  image_url?: string;
  options: Record<string, string>;
  correct_answer: string;
}

interface Question {
  _id: string;           // <-- ADDED MongoDB _id
  id: number;            // question_number (for UI)
  question: string;
  scenarioText: string;
  imageUrl: string;
  options: string[];
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
function transformQuestions(apiQuestions: ApiQuestion[]): Question[] {
  return apiQuestions.map((q) => ({
    _id: q._id,                       // <-- store the real ID
    id: q.question_number,
    question: q.question_text,
    scenarioText: q.scenario_text || "",
    imageUrl: q.image_url || "",
    options: optionKeys.map((key) => q.options[key] ?? ""),
    correctAnswer: letterToIndex[q.correct_answer] ?? 0,
    explanation: "",
    stats: {
      totalAttempts: 0,
      correctPercentage: 0,
      averageTime: "—",
      difficulty: "Medium" as const,
    },
  }));
}

const letters = ["ক", "খ", "গ", "ঘ"];

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
  const questions = useMemo(
    () => transformQuestions(apiQuestions),
    [apiQuestions]
  );
  const totalQuestions = questions.length;
  const [postUserQuizs] = usePostUserQuizsMutation()
  const {data:user} = useGetMeQuery()
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [bookmarked, setBookmarked] = useState<Record<number, boolean>>({});
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
    setBookmarked((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
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

      const qItem = questions.find((q) => q.id === qId);
      if (!qItem) return;

      setSelected((prev) => ({
        ...prev,
        [qId]: optionIndex,
      }));

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
            // correct_answer is stored as an option key (K/L/M/N) – stay consistent
            providedAnswer: optionKeys[optionIndex] ?? "",
          },
        ],
      };

      postUserQuizs(payLoad)
        .unwrap()
        .catch((err) => {
          console.warn("Failed to save quiz performance:", err);
        });
    },
    [isSubmitted, questions, user, examId, examVersionId, subjectId, postUserQuizs]
  );

  // ─── Handle submit (local only) ───
  const handleSubmit = useCallback(() => {
    if (isSubmitted) return;

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

    setIsSubmitted(true);
  }, [isSubmitted, totalQuestions, getAnsweredCount]);

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
                    className={`transition-transform ${
                      isTopicOpen ? "rotate-180" : ""
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
                        className={`w-full text-left px-4 py-1 text-sm transition ${
                          selectedTopic === topic
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

            <div className="text-sm text-[#A1A8B3]">
              {isSubmitted
                ? `${localScore}/${totalQuestions} correct`
                : `${getAnsweredCount()}/${totalQuestions} answered`}
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
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      isAnswered
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
                {/* Scenario / passage text */}
                {q.scenarioText && (
                  <div className="mb-5 rounded-xl border border-[#9B51E0]/25 bg-[#9B51E0]/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#9B51E0] mb-2">
                      Scenario / Passage
                    </p>
                    <p className="text-[20px] leading-relaxed text-white whitespace-pre-line">
                      {q.scenarioText}
                    </p>
                  </div>
                )}

                {/* Question image */}
                {q.imageUrl && (
                  <div className="mb-5">
                    <img
                      src={q.imageUrl}
                      alt="Question diagram"
                      className="max-w-full max-h-72 object-contain rounded-xl border border-[#23262D] bg-[#161920]"
                    />
                  </div>
                )}

                <h2 className="font-semibold text-lg leading-7 mb-6 whitespace-pre-line text-[#F5F7FA]">
                  {q.question}
                </h2>

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
                        className={`relative flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                          showCorrectAnswer
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
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-semibold shrink-0 transition-colors ${
                            isCorrectOption
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
                          className={`text-base font-medium flex-1 ${
                            isCorrectOption
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

                {/* Action Buttons */}
                <div className="pt-5 border-t border-[#23262D]">
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      {
                        label: "উত্তর",
                        icon: CheckCircle,
                        type: "answer" as const,
                      },
                      {
                        label: "পরিসংখ্যান",
                        icon: BarChart3,
                        type: "statistics" as const,
                      },
                      {
                        label: "ব্যাখ্যা",
                        icon: BookOpen,
                        type: "explanation" as const,
                      },
                    ].map(({ label, icon: Icon, type }) => (
                      <button
                        key={type}
                        onClick={() => openModal(type, qIdx)}
                        className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg hover:bg-[#161920] text-[#A1A8B3] hover:text-[#F5F7FA] transition border border-transparent hover:border-[#23262D]"
                      >
                        <Icon size={16} />
                        <span className="text-[11px] font-semibold">
                          {label}
                        </span>
                      </button>
                    ))}

                    <button
                      onClick={() => toggleBookmark(q.id)}
                      className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg transition border ${
                        isBookmarked
                          ? "bg-[#9B51E0]/10 border-[#9B51E0] text-[#9B51E0]"
                          : "border-transparent hover:bg-[#161920] hover:border-[#23262D] text-[#A1A8B3] hover:text-[#F5F7FA]"
                      }`}
                    >
                      <Heart
                        size={16}
                        fill={isBookmarked ? "currentColor" : "none"}
                      />
                      <span className="text-[11px] font-semibold">
                        {isBookmarked ? "সংরক্ষিত" : "বুকমার্ক"}
                      </span>
                    </button>
                  </div>
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
              onClick={handleSubmit}
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