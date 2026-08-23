import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
import QuestionCard from "./_components/QuestionCard";
import QuizHeader from "./_components/QuizHeader";
import QuizProgressBar from "./_components/QuizProgressBar";
import {
  QuizLoading, NoExamSelected, NoQuestionsAvailable,
} from "./_components/QuizStates";
import {
  computeLocalScore, buildLocalReview,
} from "./_components/quizTypes";
import type { QuestionItem, QuizResultData } from "./_components/quizTypes";

interface QuizPreatiseProps {
  examId?: string;
  versionId?: string;
  board?:string
}

const QuizPreatise: React.FC<QuizPreatiseProps> = ({
  examId: propExamId,
  versionId: propVersionId,
  board:propBoard
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const examId = propExamId || searchParams.get("examId") || "";
  const versionId = propVersionId || searchParams.get("versionId") || "";
  const board = propBoard || searchParams.get("board") || "";
  const scheduleId = searchParams.get("scheduleId") || "";
  const [postUserQuizs] = usePostUserQuizsMutation();
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
      { examId, versionId: versionId || undefined, board:board || undefined },
      { skip: !examId }
    );

  const [startAttempt, { isLoading: isStarting }] = useStartAttemptMutation();
  const [saveAnswer] = useSaveAnswerMutation();
  const [batchSaveAnswers] = useBatchSaveAnswersMutation();
  const [completeAttempt, { isLoading: isCompleting }] =
    useCompleteAttemptMutation();

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
          subject: questionsData?.[0]?.subject?._id,
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
    return <QuizLoading loadingQuestions={questionsLoading} />;
  }

  if (!examId) {
    return <NoExamSelected onBack={() => navigate("/mock-exam")} />;
  }

  if (totalQuestions === 0) {
    return (
      <NoQuestionsAvailable
        examName={currentExam?.name || ""}
        versionName={currentVersion?.examVersion || ""}
        onBack={() => navigate("/mock-exam")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F5F7FA] pb-12">
      <QuizHeader
        examName={currentExam?.name || ""}
        versionName={currentVersion?.examVersion || ""}
        totalQuestions={totalQuestions}
        timeLeft={timeLeft}
        isSubmitted={isSubmitted}
        onBack={() => navigate(-1)}
        onSubmit={() => handleSubmit()}
      />

      <QuizProgressBar
        answeredCount={answeredCount}
        totalQuestions={totalQuestions}
        progressPercentage={progressPercentage}
        error={error}
      />

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
