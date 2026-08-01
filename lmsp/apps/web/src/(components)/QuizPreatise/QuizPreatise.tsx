import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Clock,
  CheckCircle,
  X,
  BookOpen,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useGetExamsQuery,
  useGetQuestionsByExamQuery,
  useGetExamVersionsByExamQuery,
  useAppSelector,
  useStartAttemptMutation,
  useSaveAnswerMutation,
  useCompleteAttemptMutation,
  useGetUserPerformanceQuery,
} from "@my-monorepo/store";

interface QuestionStats {
  attempts: number;
  failures: number;
  successes: number;
  successRate: number;
}

interface QuestionItem {
  question: string;
  options: string[];
  correctAnswer?: number;
  questionNumber?: number;
  stats?: QuestionStats;
}

interface QuizPreatiseProps {
  examId?: string;
  versionId?: string;
}

const getBengaliLetter = (index: number) => {
  const letters = ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ"];
  return letters[index] || String.fromCharCode(65 + index);
};

const QuizPreatise: React.FC<QuizPreatiseProps> = ({
  examId: propExamId,
  versionId: propVersionId,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const examId = propExamId || searchParams.get("examId") || "";
  const versionId = propVersionId || searchParams.get("versionId") || "";

  const userId = useAppSelector((state) => state.user.user?._id) || "";

  // ─── Fetch user's mock exam performance data ───
  const { data: userPerformance } = useGetUserPerformanceQuery(
    { userId, type: "mockExam" },
    { skip: !userId }
  );

  const { data: exams } = useGetExamsQuery();
  const { data: examVersions } = useGetExamVersionsByExamQuery(examId, {
    skip: !examId,
  });
  const { data: questionsData, isLoading: questionsLoading } =
    useGetQuestionsByExamQuery(
      { examId, versionId: versionId || undefined },
      { skip: !examId }
    );

  const [startAttempt, { isLoading: isStarting }] = useStartAttemptMutation();
  const [saveAnswer] = useSaveAnswerMutation();
  const [completeAttempt, { isLoading: isCompleting }] =
    useCompleteAttemptMutation();

  const attemptIdRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const questionStartTimes = useRef<Record<number, number>>({});

  const currentExam = exams?.find((e: any) => e._id === examId);
  const currentVersion = examVersions?.find((v: any) => v._id === versionId);

  // Map correct_answer string value from backend to option index
  const getCorrectAnswerIndex = useCallback(
    (q: any): number | undefined => {
      if (!q.correct_answer) return undefined;
      const opts = q.options
        ? (Object.values(q.options).filter((v: any) => v) as string[])
        : [];
      const idx = opts.findIndex((o: string) => o === q.correct_answer);
      return idx >= 0 ? idx : undefined;
    },
    []
  );

  const allQuestions = useMemo(() => {
    if (!questionsData || questionsData.length === 0) return [];
    const flattened: QuestionItem[] = [];
    questionsData.forEach((doc: any) => {
      if (doc.data && Array.isArray(doc.data)) {
        const sorted = [...doc.data].sort(
          (a: any, b: any) =>
            (a.question_number || 0) - (b.question_number || 0)
        );
        sorted.forEach((q: any) => {
          const opts = q.options
            ? (Object.values(q.options).filter((v: any) => v) as string[])
            : [];
          // Find user's historical performance for this question
          const performance = userPerformance?.mockExam?.find(
            (p: any) => p.questionNumber === q.question_number
          );
          flattened.push({
            question: q.question_text,
            options: opts,
            correctAnswer: getCorrectAnswerIndex(q),
            questionNumber: q.question_number,
            stats: performance ? {
              attempts: performance.attempts || 0,
              failures: performance.failures || 0,
              successes: performance.successes || 0,
              successRate: performance.attempts > 0
                ? Math.round((performance.successes / performance.attempts) * 100)
                : 0,
            } : undefined,
          });
        });
      }
    });
    return flattened;
  }, [questionsData, getCorrectAnswerIndex, userPerformance]);

  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [timeLeft, setTimeLeft] = useState(7200);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [serverResult, setServerResult] = useState<{
    percentage: number;
    correctCount: number;
    incorrectCount: number;
    unansweredCount: number;
    totalQuestions: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalQuestions = allQuestions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercentage =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  // ─── Timer ───
  useEffect(() => {
    if (isSubmitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isSubmitted]);

  // ─── Start attempt when exam loads ───
  useEffect(() => {
    if (!examId || !userId || allQuestions.length === 0) return;

    const initAttempt = async () => {
      try {
        const result = await startAttempt({
          userId,
          examId,
          examVersionId: versionId || undefined,
          type: "practice",
          source: "mock_exam",
          totalQuestions: allQuestions.length,
        }).unwrap();
        attemptIdRef.current = result._id;
        startTimeRef.current = Date.now();
        setError(null);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to start attempt";
        console.error("Failed to start attempt:", msg);
        setError("Could not save progress to server — scores shown locally only.");
      }
    };

    initAttempt();
  }, [examId, versionId, userId, allQuestions.length, startAttempt]);

  // ─── Reset state on exam change ───
  useEffect(() => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScore(0);
    setServerResult(null);
    setError(null);
    setTimeLeft(7200);
    attemptIdRef.current = null;
    startTimeRef.current = Date.now();
    questionStartTimes.current = {};
  }, [examId, versionId]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ─── Track time per question ───
  const handleAnswerSelect = useCallback(
    (qIndex: number, oIndex: number) => {
      if (isSubmitted) return;

      // Record time spent on this question
      if (!questionStartTimes.current[qIndex]) {
        questionStartTimes.current[qIndex] = Date.now();
      }

      const qItem = allQuestions[qIndex];
      if (!qItem) return;

      setSelectedAnswers((prev) => {
        const updated = { ...prev, [qIndex]: oIndex };

        // Auto-save answer to backend if attempt is active
        const attemptId = attemptIdRef.current;
        if (attemptId && userId) {
          const qNumber = qItem.questionNumber || qIndex + 1;
          const timeTaken = Math.round(
            (Date.now() - questionStartTimes.current[qIndex]) / 1000
          );
          // Send the actual option text, not the index (backend compares against correct_answer text)
          const selectedText = qItem.options[oIndex] ?? "";
          saveAnswer({
            attemptId,
            questionNumber: qNumber,
            selectedOption: selectedText,
            timeTaken: Math.max(1, timeTaken),
          }).catch((err) => {
            console.warn("Auto-save failed:", err);
          });
        }

        return updated;
      });
    },
    [isSubmitted, userId, allQuestions, saveAnswer]
  );

  const handleSubmit = useCallback(async () => {
    if (isSubmitted || isCompleting) return;

    const unanswered = totalQuestions - answeredCount;
    if (unanswered > 0) {
      if (
        !window.confirm(
          `আপনি ${unanswered} টি প্রশ্নের উত্তর দেননি। তবুও সাবমিট করবেন?`
        )
      ) {
        return;
      }
    }

    // Local score calculation (immediate feedback)
    let correct = 0;
    allQuestions.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      if (
        selected !== undefined &&
        q.correctAnswer !== undefined &&
        selected === q.correctAnswer
      ) {
        correct++;
      }
    });

    setScore(correct);
    setIsSubmitted(true);

    // Submit to server
    const attemptId = attemptIdRef.current;
    if (attemptId) {
      try {
        const result = await completeAttempt({ attemptId }).unwrap();
        setServerResult({
          percentage: result.attempt.percentage,
          correctCount: result.attempt.correctCount,
          incorrectCount: result.attempt.incorrectCount,
          unansweredCount: result.attempt.unansweredCount,
          totalQuestions: result.attempt.totalQuestions,
        });
        // Use server score as authoritative
        setScore(result.attempt.correctCount);
      } catch (err: any) {
        console.error("Failed to complete attempt:", err);
        setError("Server submission failed, but your local score is shown.");
      }
    }
  }, [
    isSubmitted,
    isCompleting,
    totalQuestions,
    answeredCount,
    allQuestions,
    selectedAnswers,
    completeAttempt,
  ]);

  if (questionsLoading || isStarting) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-3xl text-[#9B51E0] mx-auto mb-4" />
          <p className="text-[#A1A8B3] font-medium">
            {questionsLoading ? "Loading questions..." : "Starting quiz..."}
          </p>
        </div>
      </div>
    );
  }

  if (!examId) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <BookOpen className="mx-auto text-5xl text-[#6B7280] mb-4" />
          <h2 className="text-xl font-bold text-[#F5F7FA] mb-2">
            No Exam Selected
          </h2>
          <p className="text-[#A1A8B3] mb-4">
            Please select an exam and version to start practicing.
          </p>
          <button
            onClick={() => navigate("/mock-exam")}
            className="inline-flex items-center gap-2 bg-[#9B51E0] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#7E3CC4] transition active:scale-95"
          >
            <ArrowLeft size={16} /> Back to Exams
          </button>
        </div>
      </div>
    );
  }

  if (totalQuestions === 0) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <BookOpen className="mx-auto text-5xl text-[#6B7280] mb-4" />
          <h2 className="text-xl font-bold text-[#F5F7FA] mb-2">
            No Questions Available
          </h2>
          <p className="text-[#A1A8B3] mb-4">
            Questions for {currentExam?.name || "this exam"} –{" "}
            {currentVersion?.examVersion || "this version"} haven't been added yet.
          </p>
          <button
            onClick={() => navigate("/mock-exam")}
            className="inline-flex items-center gap-2 bg-[#9B51E0] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#7E3CC4] transition active:scale-95"
          >
            <ArrowLeft size={16} /> Back to Exams
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F5F7FA] pb-12">
      {/* ────── STICKY HEADER ────── */}
      <header className="sticky top-0 z-40 bg-[#111318]/95 backdrop-blur-sm border-b border-[#23262D] px-4 md:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-[#161920] rounded-lg transition text-[#A1A8B3] hover:text-[#F5F7FA]"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="hidden sm:flex items-center gap-2">
            <div className="bg-[#9B51E0] text-white p-1.5 rounded-lg">
              <BookOpen size={20} />
            </div>
            <span className="font-bold text-lg tracking-tight">
              {currentExam?.name || "Quiz"}
            </span>
          </div>
        </div>
        <div className="hidden md:block text-center">
          <span className="text-xs font-semibold text-[#A1A8B3]">
            {currentVersion?.examVersion || ""} &bull; {totalQuestions} Questions
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
              timeLeft < 300
                ? "bg-[#EB5757]/10 border-[#EB5757]/30 text-[#EB5757]"
                : "bg-[#F2C94C]/10 border-[#F2C94C]/30 text-[#F2C94C]"
            }`}
          >
            <Clock size={16} />
            <span className="text-sm font-mono font-bold">
              {formatTime(timeLeft)}
            </span>
          </div>
          {!isSubmitted && (
            <button
              onClick={handleSubmit}
              className="bg-[#9B51E0] hover:bg-[#7E3CC4] text-white px-6 py-2 rounded-full font-bold text-sm transition-all shadow-[0_0_15px_-3px_rgba(155,81,224,0.4)] active:scale-95"
            >
              সাবমিট
            </button>
          )}
        </div>
      </header>

      {/* ────── PROGRESS BAR ────── */}
      <div className="sticky top-[68px] z-30 bg-[#111318]/80 backdrop-blur-sm px-4 md:px-8 py-2 border-b border-[#23262D] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-xs font-medium text-[#A1A8B3] whitespace-nowrap">
            অগ্রগতি: {answeredCount}/{totalQuestions}
          </span>
          <div className="h-2.5 bg-[#1C1F26] rounded-full flex-1 max-w-md overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#9B51E0] to-[#00E5B3] transition-all duration-700"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-xs font-bold text-[#9B51E0] whitespace-nowrap w-10 text-right">
            {Math.round(progressPercentage)}%
          </span>
        </div>
      </div>

      {/* ────── SUBMITTED SCORE BANNER ────── */}
      {isSubmitted && (
        <div className="sticky top-[108px] z-30 bg-[#00E5B3]/10 border-b border-[#00E5B3]/30 px-4 md:px-8 py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-[#00E5B3] text-xl" />
              <span className="font-bold text-[#00E5B3] text-sm">
                Quiz Submitted! Score: {score}/{totalQuestions} (
                {totalQuestions > 0
                  ? Math.round((score / totalQuestions) * 100)
                  : 0}
                %)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isCompleting && (
                <Loader2 className="animate-spin text-[#00E5B3]" size={16} />
              )}
              <button
                onClick={() => navigate("/mock-exam")}
                className="text-xs font-semibold text-[#00E5B3] bg-[#00E5B3]/10 border border-[#00E5B3]/30 px-4 py-1.5 rounded-full hover:bg-[#00E5B3]/20 transition"
              >
                Back to Exams
              </button>
            </div>
          </div>
          {/* Server result summary */}
          {serverResult && (
            <div className="max-w-3xl mx-auto mt-2 flex items-center gap-4 text-xs">
              <span className="text-[#00E5B3]">
                ✓ Correct: {serverResult.correctCount}
              </span>
              <span className="text-[#EB5757]">
                ✗ Incorrect: {serverResult.incorrectCount}
              </span>
              <span className="text-[#A1A8B3]">
                − Unanswered: {serverResult.unansweredCount}
              </span>
              <span className="text-[#F2C94C] font-bold">
                Score: {serverResult.percentage}%
              </span>
            </div>
          )}
          {/* Error banner */}
          {error && (
            <div className="max-w-3xl mx-auto mt-2 flex items-center gap-2 text-xs text-[#EB5757]">
              <AlertTriangle size={14} />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {/* ────── QUESTIONS ────── */}
      <main className="max-w-3xl mx-auto px-4 md:px-6 mt-8 space-y-6 pb-16">
        {allQuestions.map((q, index) => {
          const selected = selectedAnswers[index];
          const isCorrect =
            isSubmitted &&
            q.correctAnswer !== undefined &&
            selected === q.correctAnswer;
          const isWrong =
            isSubmitted &&
            selected !== undefined &&
            q.correctAnswer !== undefined &&
            selected !== q.correctAnswer;
          const showCorrect = isSubmitted && q.correctAnswer !== undefined;

          return (
            <div
              key={index}
              className={`bg-[#111318] border rounded-2xl p-6 transition-shadow duration-300 ${
                isSubmitted
                  ? isCorrect
                    ? "border-[#00E5B3]/50 bg-[#00E5B3]/5"
                    : isWrong
                    ? "border-[#EB5757]/50 bg-[#EB5757]/5"
                    : "border-[#23262D]"
                  : "border-[#23262D] hover:border-[#9B51E0]/50 hover:shadow-[0_0_15px_-5px_rgba(155,81,224,0.2)]"
              }`}
            >
              {/* Question number and status */}
              <div className="flex items-center gap-2 mb-5">
                <span
                  className={`flex-shrink-0 w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center border ${
                    isSubmitted && isCorrect
                      ? "bg-[#00E5B3]/10 text-[#00E5B3] border-[#00E5B3]/30"
                      : isSubmitted && isWrong
                      ? "bg-[#EB5757]/10 text-[#EB5757] border-[#EB5757]/30"
                      : "bg-[#161920] text-[#A1A8B3] border-[#23262D]"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider bg-[#161920] px-2 py-0.5 rounded border border-[#23262D]">
                  MCQ
                </span>
                {/* Historical Performance Badge */}
                {q.stats && q.stats.attempts > 0 && !isSubmitted && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border border-[#9B51E0]/30 bg-[#9B51E0]/10 text-[#9B51E0]">
                    <BarChart3 size={10} />
                    {q.stats.attempts}x &middot; {q.stats.successRate}%
                  </span>
                )}
                {showCorrect && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      isCorrect
                        ? "text-[#00E5B3] bg-[#00E5B3]/10 border-[#00E5B3]/30"
                        : "text-[#EB5757] bg-[#EB5757]/10 border-[#EB5757]/30"
                    }`}
                  >
                    {isCorrect
                      ? "✓ Correct"
                      : `✗ Correct: ${getBengaliLetter(q.correctAnswer!)}`}
                  </span>
                )}
              </div>

              <h3 className="text-base font-medium leading-relaxed text-[#F5F7FA] mb-6">
                {q.question}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {q.options.map((opt, optIndex) => {
                  const isSelected = selected === optIndex;
                  const isRightAnswer =
                    showCorrect && q.correctAnswer === optIndex;
                  let optionStyle =
                    "border-[#23262D] hover:border-[#9B51E0]/50 hover:bg-[#161920]";

                  if (isSubmitted) {
                    if (isRightAnswer)
                      optionStyle =
                        "border-[#00E5B3] bg-[#00E5B3]/10";
                    else if (isSelected && !isRightAnswer)
                      optionStyle =
                        "border-[#EB5757] bg-[#EB5757]/10";
                    else optionStyle = "border-[#23262D] opacity-60";
                  } else if (isSelected) {
                    optionStyle =
                      "border-[#9B51E0] bg-[#9B51E0]/10 shadow-[0_0_10px_-3px_rgba(155,81,224,0.3)]";
                  }

                  return (
                    <button
                      key={optIndex}
                      onClick={() => handleAnswerSelect(index, optIndex)}
                      disabled={isSubmitted}
                      className={`group flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ${optionStyle}`}
                    >
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                          isSubmitted && isRightAnswer
                            ? "bg-[#00E5B3] text-black border-[#00E5B3]"
                            : isSubmitted && isSelected && !isRightAnswer
                            ? "bg-[#EB5757] text-white border-[#EB5757]"
                            : isSelected
                            ? "bg-[#9B51E0] text-white border-[#9B51E0]"
                            : "bg-[#161920] text-[#A1A8B3] border-[#23262D] group-hover:border-[#9B51E0]/50 group-hover:text-[#9B51E0]"
                        }`}
                      >
                        {getBengaliLetter(optIndex)}
                      </div>
                      <span
                        className={`text-[15px] ${
                          isSubmitted && isRightAnswer
                            ? "text-[#00E5B3] font-medium"
                            : isSubmitted && isSelected && !isRightAnswer
                            ? "text-[#EB5757] font-medium"
                            : isSelected
                            ? "text-[#F5F7FA] font-medium"
                            : "text-[#A1A8B3]"
                        }`}
                      >
                        {opt}
                      </span>
                      {isSubmitted && isRightAnswer && (
                        <CheckCircle className="ml-auto text-[#00E5B3] flex-shrink-0" size={20} />
                      )}
                      {isSubmitted && isSelected && !isRightAnswer && (
                        <X className="ml-auto text-[#EB5757] flex-shrink-0" size={20} />
                      )}
                    </button>
                  );
                })}
              </div>

              {selected !== undefined && !isSubmitted && (
                <div className="mt-4 pt-3 border-t border-[#23262D] flex justify-end">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#00E5B3] bg-[#00E5B3]/10 px-3 py-1 rounded-full border border-[#00E5B3]/30">
                    <CheckCircle size={12} /> উত্তর সংরক্ষিত
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default QuizPreatise;