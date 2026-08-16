import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Clock,
  CheckCircle,
  X,
  BookOpen,
  ArrowLeft,
  Loader2,
  BarChart3,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useGetExamsQuery,
  useGetQuestionsByExamQuery,
  useGetExamVersionsByExamQuery,
  useGetScheduleExamsByExamQuery,
  useAppSelector,
  useStartAttemptMutation,
  useSaveAnswerMutation,
  useBatchSaveAnswersMutation,
  useCompleteAttemptMutation,
  useGetUserPerformanceQuery,
} from "@my-monorepo/store";
import { usePostUserQuizsMutation } from "@my-monorepo/store/src/redux/api/userPerformanceApi";

interface QuestionStats {
  attempts: number;
  failures: number;
  successes: number;
  successRate: number;
}

interface QuestionItem {
  id?: string;
  question: string;
  scenarioText?: string;
  imageUrl?: string;
  options: string[];
  /** Original option keys from the backend (e.g. ["K","L","M","N"]) */
  optionKeys?: string[];
  correctAnswer?: number;
  questionNumber?: number;
  stats?: QuestionStats;
}

interface QuizPreatiseProps {
  examId?: string;
  versionId?: string;
}

interface QuestionReviewItem {
  question: string;
  options: string[];
  selectedIndex?: number;
  correctIndex?: number;
  isCorrect?: boolean;
}

interface QuizResultData {
  examName: string;
  versionName: string;
  title: string;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  totalQuestions: number;
  percentage: number;
  score: number;
  timeTaken: number;
  durationSeconds: number;
  questions?: QuestionReviewItem[];
}

const BENGALI_LETTERS = ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ"];
const getBengaliLetter = (index: number) =>
  BENGALI_LETTERS[index] || String.fromCharCode(65 + index);

/**
 * Computes the correct-count locally from the questions + selected answers.
 * This is the source of truth whenever the server doesn't return a
 * well-formed result (see the guard in handleSubmit below).
 */
const computeLocalScore = (
  allQuestions: QuestionItem[],
  selectedAnswers: Record<number, number>
) => {
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
  return correct;
};

const buildLocalReview = (
  allQuestions: QuestionItem[],
  selectedAnswers: Record<number, number>
): QuestionReviewItem[] =>
  allQuestions.map((q, idx) => ({
    question: q.question,
    options: q.options,
    selectedIndex: selectedAnswers[idx],
    correctIndex: q.correctAnswer,
    isCorrect:
      selectedAnswers[idx] !== undefined &&
      q.correctAnswer !== undefined &&
      selectedAnswers[idx] === q.correctAnswer,
  }));

// ─────────────────────────────────────────────────────────────────────────
// QuestionCard: extracted + memoized so that selecting an answer on one
// question does NOT re-render every other question on the page. This only
// works because the parent passes a referentially-stable `onSelect`
// callback (see handleAnswerSelect below, which no longer depends on
// `selectedAnswers`).
// ─────────────────────────────────────────────────────────────────────────
interface QuestionCardProps {
  index: number;
  item: QuestionItem;
  selectedIndex: number | undefined;
  isSubmitted: boolean;
  onSelect: (qIndex: number, oIndex: number) => void;
}

const QuestionCard = React.memo(function QuestionCard({
  index,
  item: q,
  selectedIndex: selected,
  isSubmitted,
  onSelect,
}: QuestionCardProps) {
  const isCorrect =
    isSubmitted && q.correctAnswer !== undefined && selected === q.correctAnswer;
  const isWrong =
    isSubmitted &&
    selected !== undefined &&
    q.correctAnswer !== undefined &&
    selected !== q.correctAnswer;
  const showCorrect = isSubmitted && q.correctAnswer !== undefined;

  return (
    <div
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
            {isCorrect ? "✓ Correct" : `✗ Correct: ${getBengaliLetter(q.correctAnswer!)}`}
          </span>
        )}
      </div>

      {/* Scenario / passage text */}
      {q.scenarioText && (
        <div className="mb-5 rounded-xl border border-[#9B51E0]/25 bg-[#9B51E0]/5 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#9B51E0] mb-2">
            Scenario / Passage
          </p>
          <p className="text-sm leading-relaxed text-[#C9D0DA] whitespace-pre-line">
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

      <h3 className="text-base font-medium leading-relaxed text-[#F5F7FA] mb-6">
        {q.question}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {q.options.map((opt, optIndex) => {
          const isSelected = selected === optIndex;
          const isRightAnswer = showCorrect && q.correctAnswer === optIndex;
          let optionStyle = "border-[#23262D] hover:border-[#9B51E0]/50 hover:bg-[#161920]";

          if (isSubmitted) {
            if (isRightAnswer) optionStyle = "border-[#00E5B3] bg-[#00E5B3]/10";
            else if (isSelected && !isRightAnswer) optionStyle = "border-[#EB5757] bg-[#EB5757]/10";
            else optionStyle = "border-[#23262D] opacity-60";
          } else if (isSelected) {
            optionStyle = "border-[#9B51E0] bg-[#9B51E0]/10 shadow-[0_0_10px_-3px_rgba(155,81,224,0.3)]";
          }

          return (
            <button
              key={optIndex}
              onClick={() => onSelect(index, optIndex)}
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
});

// ─────────────────────────────────────────────────────────────────────────

const QuizPreatise: React.FC<QuizPreatiseProps> = ({
  examId: propExamId,
  versionId: propVersionId,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const examId = propExamId || searchParams.get("examId") || "";
  const versionId = propVersionId || searchParams.get("versionId") || "";
  const scheduleId = searchParams.get("scheduleId") || "";
 const [postUserQuizs] = usePostUserQuizsMutation()
  const userId = useAppSelector((state) => state.user.user?._id) || "";

  const { data: userPerformance } = useGetUserPerformanceQuery(
    { userId, type: "mockExam" },
    { skip: !userId }
  );

  const { data: exams } = useGetExamsQuery();
  const { data: examVersions } = useGetExamVersionsByExamQuery(examId, {
    skip: !examId,
  });
  const { data: scheduleExams } = useGetScheduleExamsByExamQuery(examId, {
    skip: !examId,
  });
  const { data: questionsData, isLoading: questionsLoading } =
    useGetQuestionsByExamQuery(
      { examId, versionId: versionId || undefined },
      { skip: !examId }
    );

  const [startAttempt, { isLoading: isStarting }] = useStartAttemptMutation();
  const [saveAnswer] = useSaveAnswerMutation();
  const [batchSaveAnswers] = useBatchSaveAnswersMutation();
  const [completeAttempt, { isLoading: isCompleting }] =
    useCompleteAttemptMutation();

      console.log(scheduleExams,'sssssssss')

  const attemptIdRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const questionStartTimes = useRef<Record<number, number>>({});
  const submitInFlightRef = useRef(false);

  const currentExam = exams?.find((e: any) => e._id === examId);
  const currentVersion = examVersions?.find((v: any) => v._id === versionId);
  // Prefer the scheduleId from the URL; if it's missing (e.g. a direct
  // link to the exam page) fall back to the exam's only schedule.
  const schedule =
    scheduleExams?.find((s: any) => s._id === scheduleId) ??
    (scheduleExams?.length === 1 ? scheduleExams[0] : undefined);

  // Scheduled-exam duration is in minutes; regular practice quizzes get a
  // 2-hour default.
  const durationSeconds = (schedule?.duration ?? 120) * 60;


  // Map correct_answer string value from backend to option index. The
  // question bank stores correct_answer as the option KEY (e.g. "L"), so we
  // match the key against Object.keys(options). Falls back to text matching
  // for legacy banks that stored the option text instead.
  const getCorrectAnswerIndex = useCallback((q: any): number | undefined => {
    if (!q.correct_answer) return undefined;
    const entries = q.options
      ? (Object.entries(q.options).filter(([, v]) => v) as [string, string][])
      : [];
    const byKey = entries.findIndex(([k]) => k === q.correct_answer);
    if (byKey >= 0) return byKey;
    const byText = entries.findIndex(([, v]) => v === q.correct_answer);
    return byText >= 0 ? byText : undefined;
  }, []);

  const allQuestions = useMemo(() => {
    if (!questionsData || questionsData.length === 0) return [];
    const flattened: QuestionItem[] = [];
    questionsData.forEach((doc: any) => {
      if (doc.data && Array.isArray(doc.data)) {
        const sorted = [...doc.data].sort(
          (a: any, b: any) => (a.question_number || 0) - (b.question_number || 0)
        );
        sorted.forEach((q: any) => {
          const validEntries = q.options
            ? (Object.entries(q.options).filter(([, v]) => v) as [string, string][])
            : [];

          const performance = userPerformance?.mockExam?.find(
            (p: any) => p.questionNumber === q.question_number
          );
          flattened.push({
            id: q._id,
            question: q.question_text,
            scenarioText: q.scenario_text || "",
            imageUrl: q.image_url || "",
            options: validEntries.map(([, v]) => v),
            optionKeys: validEntries.map(([k]) => k),
            correctAnswer: getCorrectAnswerIndex(q),
            questionNumber: q.question_number,
            stats: performance
              ? {
                  attempts: performance.attempts || 0,
                  failures: performance.failures || 0,
                  successes: performance.successes || 0,
                  successRate:
                    performance.attempts > 0
                      ? Math.round((performance.successes / performance.attempts) * 100)
                      : 0,
                }
              : undefined,
          });
        });
      }
    });
    return flattened;
  }, [questionsData, getCorrectAnswerIndex, userPerformance]);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(7200);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalQuestions = allQuestions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

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

  // ─── Sync the countdown with the scheduled exam duration ───
  // The schedule is fetched asynchronously, so on first render the real
  // duration isn't known yet and the timer must NOT latch onto the 2-hour
  // default. Once the schedule query settles (`scheduleExams !== undefined`)
  // we apply the correct duration — but only while the user hasn't started
  // answering, so the countdown never resets mid-quiz.
  useEffect(() => {
    if (isSubmitted || scheduleExams === undefined) return;
    if (answeredCount === 0) {
      setTimeLeft(durationSeconds);
    }
  }, [durationSeconds, isSubmitted, answeredCount, scheduleExams]);

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
        const msg = err instanceof Error ? err.message : "Failed to start attempt";
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
    setError(null);
    setTimeLeft(durationSeconds);
    attemptIdRef.current = null;
    submitInFlightRef.current = false;
    startTimeRef.current = Date.now();
    questionStartTimes.current = {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, versionId]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ─── Answer selection ───
  // Uses a functional state update so this callback's identity only
  // depends on [isSubmitted, userId, allQuestions, saveAnswer] — NOT on
  // selectedAnswers. That keeps it stable across every answer selection,
  // which lets the memoized QuestionCard below skip re-rendering unrelated
  // questions.
  const handleAnswerSelect = useCallback(
    (qIndex: number, oIndex: number) => {
      if (isSubmitted) return;
      
      const qItem = allQuestions[qIndex];
      if (!qItem) return;

      const qId = qItem.id;
      console.log(qId, "Selected Answer");
      console.log(allQuestions, 'allQuestions');
      
      if (!questionStartTimes.current[qIndex]) {
        questionStartTimes.current[qIndex] = Date.now();
      }

      setSelectedAnswers((prev) => {
        const isDeselect = prev[qIndex] === oIndex;
        const updated = { ...prev };
        if (isDeselect) {
          delete updated[qIndex];
        } else {
          updated[qIndex] = oIndex;
        }

        const optionKey = isDeselect
          ? null
          : (qItem.optionKeys?.[oIndex] ?? qItem.options[oIndex] ?? "");

        const payload = {
          user: userId,
          exam: examId,
          examVersion: versionId || null,
          subject: questionsData[0]?.subject?._id,
          submittedQuestions: [
            {
              question: qId,
              providedAnswer: optionKey ?? "",
            }
          ]
        };

        postUserQuizs(payload)
          .unwrap()
          .then((res) => {
            console.log("Quiz performance saved:", res);
          })
          .catch((err) => {
            console.error("Failed to save quiz performance:", err);
          });

        // Auto-save to backend (fire-and-forget). The backend matches
        // against correct_answer, which is the option KEY ("K"/"L"/…), so
        // we send the key — or null when the answer is cleared.
        const attemptId = attemptIdRef.current;
        if (attemptId && userId) {
          const qNumber = qItem.questionNumber || qIndex + 1;
          const timeTaken = Math.round(
            (Date.now() - questionStartTimes.current[qIndex]) / 1000
          );
          saveAnswer({
            attemptId,
            questionNumber: qNumber,
            selectedOption: optionKey,
            timeTaken: Math.max(1, timeTaken),
          }).catch((err) => {
            console.warn("Auto-save failed:", err);
          });
        }

        return updated;
      });
    },
    [isSubmitted, userId, allQuestions, saveAnswer, examId, versionId, searchParams, postUserQuizs]
  );

  const handleSubmit = useCallback(
    async (auto = false) => {
      if (isSubmitted || isCompleting) return;
      if (submitInFlightRef.current) return;
      submitInFlightRef.current = true;

      const unanswered = totalQuestions - answeredCount;
      if (!auto && unanswered > 0) {
        if (
          !window.confirm(`আপনি ${unanswered} টি প্রশ্নের উত্তর দেননি। তবুও সাবমিট করবেন?`)
        ) {
          submitInFlightRef.current = false;
          return;
        }
      }

      // ── Locally-verified score (this is the single source of truth —
      // see the note below on why we don't wait on / trust the server for
      // grading) ──
      const localCorrect = computeLocalScore(allQuestions, selectedAnswers);
      setIsSubmitted(true);

      const timeTaken = Math.max(1, durationSeconds - timeLeft);
      const result: QuizResultData = {
        examName: currentExam?.name || "Quiz",
        versionName: currentVersion?.examVersion || "",
        title: schedule?.title || currentExam?.name || "Quiz",
        correctCount: localCorrect,
        incorrectCount: answeredCount - localCorrect,
        unansweredCount: unanswered,
        totalQuestions,
        percentage: totalQuestions > 0 ? Math.round((localCorrect / totalQuestions) * 100) : 0,
        score: localCorrect,
        timeTaken,
        durationSeconds,
        questions: buildLocalReview(allQuestions, selectedAnswers),
      };

      // Persist the attempt to the server in the BACKGROUND — this is not
      // awaited, and does not block navigation. Two reasons:
      //
      // 1. UX: navigation used to wait on this network round-trip, which
      //    left QuizPreatise sitting in its `isSubmitted` state (showing
      //    the full green/red answer review) for as long as the request
      //    took. That's the "report" flash you were seeing — the user
      //    should go straight to the result page, no in-between screen.
      //
      // 2. Correctness: the server's own grading (completeAttempt's
      //    correctCount/isCorrect fields) has been unreliable — it's
      //    previously marked answers "incorrect" that were provably
      //    correct against the locally-computed correctAnswer index. The
      //    frontend already grades deterministically and correctly (see
      //    getCorrectAnswerIndex / computeLocalScore), so it stays the
      //    single source of truth for what the user sees, regardless of
      //    what the server responds with. This call only exists to
      //    persist the attempt for your backend's own records/analytics.
      const attemptId = attemptIdRef.current;
      if (attemptId) {
        batchSaveAnswers({
          attemptId,
          answers: allQuestions.map((q, idx) => {
            const selIdx = selectedAnswers[idx];
            const startedAt = questionStartTimes.current[idx];
            return {
              questionNumber: q.questionNumber || idx + 1,
              selectedOption:
                selIdx !== undefined
                  ? (q.optionKeys?.[selIdx] ?? q.options[selIdx] ?? "")
                  : null,
              timeTaken: startedAt
                ? Math.max(1, Math.round((Date.now() - startedAt) / 1000))
                : 1,
            };
          }),
        })
          .unwrap()
          .then(() => completeAttempt({ attemptId }).unwrap())
          .catch((err) => {
            console.error("Failed to persist attempt to server:", err);
          });
      }

      const qs = new URLSearchParams({
        examName: result.examName,
        versionName: result.versionName,
        title: result.title,
        correct: String(result.correctCount),
        incorrect: String(result.incorrectCount),
        unanswered: String(result.unansweredCount),
        total: String(result.totalQuestions),
        percentage: String(result.percentage),
        score: String(result.score),
        timeTaken: String(result.timeTaken),
        duration: String(result.durationSeconds),
      }).toString();
      navigate(`/mock-exam/result?${qs}`, {
        state: result,
        replace: true,
      });
    },
    [
      isSubmitted,
      isCompleting,
      totalQuestions,
      answeredCount,
      allQuestions,
      selectedAnswers,
      completeAttempt,
      batchSaveAnswers,
      durationSeconds,
      timeLeft,
      currentExam,
      currentVersion,
      schedule,
      navigate,
    ]
  );

  // ─── Auto-submit when the timer reaches zero ───
  useEffect(() => {
    if (timeLeft === 0 && !isSubmitted && totalQuestions > 0) {
      handleSubmit(true);
    }
  }, [timeLeft, isSubmitted, totalQuestions, handleSubmit]);

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
          <h2 className="text-xl font-bold text-[#F5F7FA] mb-2">No Exam Selected</h2>
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
          <h2 className="text-xl font-bold text-[#F5F7FA] mb-2">No Questions Available</h2>
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
            <span className="font-bold text-lg tracking-tight">{currentExam?.name || "Quiz"}</span>
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
            <span className="text-sm font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
          {!isSubmitted && (
            <button
              onClick={() => handleSubmit()}
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
          <div className="h-2.5 bg-[#1C1F26] rounded-full flex-1 w-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#9B51E0] to-[#00E5B3] transition-all duration-700"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-xs font-bold text-[#9B51E0] whitespace-nowrap w-10 text-right">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        {error && (
          <span className="text-[10px] font-medium text-[#F2C94C] whitespace-nowrap hidden lg:inline">
            {error}
          </span>
        )}
      </div>

      {/* ────── QUESTIONS ────── */}
      <main className="max-w-3xl mx-auto px-4 md:px-6 mt-8 space-y-6 pb-16">
        {allQuestions.map((q, index) => (
          <QuestionCard
            key={q.questionNumber ?? index}
            index={index}
            item={q}
            selectedIndex={selectedAnswers[index]}
            isSubmitted={isSubmitted}
            onSelect={handleAnswerSelect}
          />
        ))}
      </main>
    </div>
  );
};

export default QuizPreatise;