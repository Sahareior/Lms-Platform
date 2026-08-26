import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, useSearchParams, useBlocker } from "react-router-dom";
import Swal from 'sweetalert2';
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
  useGetUserAttemptsQuery,
  useGetActiveAttemptQuery,
  useGetTempExamSubmissionQuery,
  useSaveTempExamSubmissionMutation,
  useDeleteTempExamSubmissionMutation,
  getAuthToken,
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
import { useExamSecurity } from "./examSecurity/useExamSecurity";
import Watermark from "./examSecurity/Watermark.tsx";

export interface ExamPaperProps {
  examId?: string;
  versionId?: string;
  board?: string
}

const ExamPaper: React.FC<ExamPaperProps> = ({
  examId: propExamId,
  versionId: propVersionId,
  board: propBoard
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const examId = propExamId || searchParams.get("examId") || "";
  const versionId = propVersionId || searchParams.get("versionId") || "";
  const rawBoard = propBoard || searchParams.get("board") || "";
  const board = rawBoard === "undefined" || rawBoard === "null" ? "" : rawBoard;
  const scheduleId = searchParams.get("scheduleId") || "";

  const userId = useAppSelector((state) => state.user.user?._id) || "";

  const { data: userPerformance } = useGetUserPerformanceQuery(
    { userId, type: "mockExam" },
    { skip: !userId }
  );

  // Pre-check: has this user already completed a mock_exam attempt for this exam?
  // Query by source (not type) because mock-exam attempts are stored with
  // type:'practice' and source:'mock_exam'.
  const { data: userAttempts, isLoading: attemptsLoading } = useGetUserAttemptsQuery(
    { userId, source: 'mock_exam', limit: 50 },
    { skip: !userId || !examId }
  );

  const hasCompletedAttempt = useMemo(() => {
    if (!userAttempts || !examId) return false;
    return userAttempts.some((a: any) => {
      if (!a.isCompleted) return false;

      // Must match exam
      const attemptExamId = String(a.exam?._id || a.exam || '');
      if (attemptExamId !== String(examId)) return false;

      // If versionId is specified, the attempt must match this version
      if (versionId) {
        const attemptVersionId = String(a.examVersion?._id || a.examVersion || '');
        if (attemptVersionId && attemptVersionId !== String(versionId)) return false;
      }

      // If board is specified, the attempt must match this board
      if (board) {
        const attemptBoard = String(a.board || '');
        if (attemptBoard && attemptBoard !== String(board)) return false;
      }

      return true;
    });
  }, [userAttempts, examId, versionId, board]);

  const { data: exams } = useGetExamsQuery();
  const { data: examVersions } = useGetExamVersionsByExamQuery(examId, {
    skip: !examId,
  });
  const { data: scheduleExams } = useGetScheduleExamsByExamQuery(examId, {
    skip: !examId,
  });
  const { data: questionsData, isLoading: questionsLoading } =
    useGetQuestionsByExamQuery(
      { examId, versionId: versionId || undefined, board: board || undefined },
      { skip: !examId }
    );

  const [startAttempt, { isLoading: isStarting }] = useStartAttemptMutation();
  const [saveAnswer] = useSaveAnswerMutation();
  const [batchSaveAnswers] = useBatchSaveAnswersMutation();
  const [completeAttempt, { isLoading: isCompleting }] =
    useCompleteAttemptMutation();
  const [postUserQuizs] = usePostUserQuizsMutation();
  const { data: tempSubmission } = useGetTempExamSubmissionQuery(
    { userId, examId, versionId: versionId || undefined, board: board || undefined },
    { skip: !userId || !examId }
  );
  const [saveTempExamSubmission] = useSaveTempExamSubmissionMutation();
  const [deleteTempExamSubmission] = useDeleteTempExamSubmissionMutation();

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
    const seenQuestionNumbers = new Set<number>();

    questionsData.forEach((doc: any) => {
      if (doc.data && Array.isArray(doc.data)) {
        const sorted = [...doc.data].sort(
          (a: any, b: any) => (a.question_number || 0) - (b.question_number || 0)
        );
        sorted.forEach((q: any) => {
          const qNum = q.question_number;
          if (qNum !== undefined && qNum !== null) {
            if (seenQuestionNumbers.has(qNum)) return;
            seenQuestionNumbers.add(qNum);
          }

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

  // ─── Restore timer from localStorage on mount ───
  const timerStorageKey = `examTimer:${examId}:${versionId}:${scheduleId}`;
  const restoredTimeLeft = useMemo(() => {
    try {
      const raw = localStorage.getItem(timerStorageKey);
      if (!raw) return null;
      const { savedAt, timeLeft: saved } = JSON.parse(raw) as { savedAt: number; timeLeft: number };
      if (typeof saved !== 'number' || typeof savedAt !== 'number') return null;
      const elapsed = Math.floor((Date.now() - savedAt) / 1000);
      const remaining = saved - elapsed;
      return remaining > 0 ? remaining : 0;
    } catch {
      return null;
    }
  }, [timerStorageKey]);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(restoredTimeLeft ?? 7200);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch the active attempt to restore saved answers (answers are saved
  // separately via saveAnswer, so startAttempt's response has empty questions)
  const { data: activeAttempt } = useGetActiveAttemptQuery(
    { userId, examId: examId || undefined },
    { skip: !userId || !examId || !attemptIdRef.current || isSubmitted }
  );

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
  // Only set from schedule when no timer was restored from localStorage
  // (i.e. first visit — not a refresh).
  useEffect(() => {
    if (isSubmitted || scheduleExams === undefined) return;
    if (restoredTimeLeft === null) {
      setTimeLeft(durationSeconds);
    }
  }, [durationSeconds, isSubmitted, scheduleExams, restoredTimeLeft]);

  // ─── Redirect when exam is already completed ───
  useEffect(() => {
    if (attemptsLoading) return;

    if (hasCompletedAttempt) {
      navigate('/mock-exam', { replace: true });
    }
  }, [hasCompletedAttempt, attemptsLoading, navigate]);

  // ─── Start attempt when exam loads ───
  useEffect(() => {
    // Don't fire check or startAttempt until the pre-check query has loaded
    if (attemptsLoading) return;

    // Pre-check: if already completed, skip starting attempt
    if (hasCompletedAttempt) {
      return;
    }

    if (!examId || !userId || allQuestions.length === 0) return;

    const initAttempt = async () => {
      try {
        const result = await startAttempt({
          userId,
          examId,
          examVersionId: versionId || undefined,
          scheduleExamId: scheduleId || undefined,
          type: "practice",
          source: "mock_exam",
          totalQuestions: allQuestions.length,
          board: board || undefined,
        }).unwrap();
        attemptIdRef.current = result._id;
        startTimeRef.current = Date.now();
        setError(null);

        // ── Save initial timer snapshot so refresh can restore it ──
        try {
          localStorage.setItem(timerStorageKey, JSON.stringify({
            savedAt: Date.now(),
            timeLeft: durationSeconds,
          }));
        } catch { /* ignore */ }
      } catch (err: any) {
        // 409 = already completed this specific mock exam → redirect
        if (err?.status === 409 || err?.data?.message?.includes('already completed')) {
          navigate('/mock-exam', { replace: true });
        } else {
          const msg = err instanceof Error ? err.message : "Failed to start attempt";
          console.error("Failed to start attempt:", msg);
          setError("Could not save progress to server — scores shown locally only.");
        }
      }
    };

    initAttempt();
  }, [examId, versionId, board, userId, allQuestions.length, startAttempt, navigate, hasCompletedAttempt, attemptsLoading]);

  // ─── Restore answers and timer from temporary exam submission ───
  useEffect(() => {
    if (!tempSubmission || isSubmitted) return;

    if (tempSubmission.attemptId && !attemptIdRef.current) {
      attemptIdRef.current = tempSubmission.attemptId;
    }

    if (tempSubmission.selectedAnswers && Object.keys(tempSubmission.selectedAnswers).length > 0) {
      setSelectedAnswers((prev) => {
        if (Object.keys(prev).length > 0) return prev;
        const restored: Record<number, number> = {};
        Object.entries(tempSubmission.selectedAnswers).forEach(([k, v]) => {
          const qIdx = Number(k);
          if (!isNaN(qIdx)) {
            restored[qIdx] = Number(v);
          }
        });
        return restored;
      });
    }

    if (typeof tempSubmission.timeLeft === 'number' && tempSubmission.timeLeft > 0 && restoredTimeLeft === null) {
      setTimeLeft(tempSubmission.timeLeft);
    }
  }, [tempSubmission, isSubmitted, restoredTimeLeft]);

  // ─── Restore answers from the active attempt once it loads ───
  useEffect(() => {
    if (!activeAttempt?.questions || activeAttempt.questions.length === 0) return;
    if (Object.keys(selectedAnswers).length > 0) return; // already restored

    const restored: Record<number, number> = {};
    activeAttempt.questions.forEach((q: any) => {
      if (!q.selectedOption) return;
      const qIdx = allQuestions.findIndex(
        (aq) => (aq.questionNumber || 0) === q.questionNumber
      );
      if (qIdx === -1) return;
      const optIdx = allQuestions[qIdx].optionKeys?.indexOf(q.selectedOption) ?? -1;
      if (optIdx >= 0) {
        restored[qIdx] = optIdx;
      }
    });
    if (Object.keys(restored).length > 0) {
      setSelectedAnswers(restored);
    }
  }, [activeAttempt, allQuestions, selectedAnswers]);

  // ─── Reset state on exam change ───
  useEffect(() => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setError(null);
    setTimeLeft(restoredTimeLeft ?? durationSeconds);
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
        // Once an answer is selected it cannot be withdrawn — ignore clicks
        // on the already-selected option.
        if (prev[qIndex] !== undefined) return prev;
        const updated = { ...prev, [qIndex]: oIndex };

        const optionKey = qItem.optionKeys?.[oIndex] ?? qItem.options[oIndex] ?? "";

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

        // Auto-save to Temporary Exam Submission API (fire-and-forget)
        if (userId && examId) {
          const submittedList = Object.entries(updated).map(([idxStr, optIdx]) => {
            const q = allQuestions[Number(idxStr)];
            return {
              questionId: q?.id,
              questionNumber: q?.questionNumber || Number(idxStr) + 1,
              selectedOption: q?.optionKeys?.[optIdx] ?? q?.options[optIdx] ?? "",
              selectedIndex: optIdx,
            };
          });

          saveTempExamSubmission({
            userId,
            examId,
            examVersionId: versionId || undefined,
            scheduleExamId: scheduleId || undefined,
            board: board || undefined,
            paperType: "Type2",
            selectedAnswers: updated,
            submittedAnswers: submittedList,
            timeLeft,
            attemptId: attemptIdRef.current || undefined,
          }).catch((err) => {
            console.warn("Temporary exam submission save failed:", err);
          });
        }

        // Persist quiz performance (fire-and-forget)
        if (userId && qItem.id && examId && versionId) {
          postUserQuizs({
            user: userId,
            exam: examId,
            examVersion: versionId,
            subject: null,
            submittedQuestions: [
              {
                question: qItem.id,
                providedAnswer: qItem.optionKeys?.[oIndex] ?? "",
              },
            ],
          })
            .unwrap()
            .catch((err) => {
              console.warn("Failed to save quiz performance:", err);
            });
        }

        return updated;
      });
    },
    [isSubmitted, userId, allQuestions, saveAnswer, saveTempExamSubmission, postUserQuizs, examId, versionId, scheduleId, board, timeLeft]
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

      // Clear saved paper-type selection and timer so the picker shows again next time
      try {
        localStorage.removeItem('selectedPaperType');
        localStorage.removeItem(timerStorageKey);
      } catch { /* ignore */ }

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
      //    left ExamPaper sitting in its `isSubmitted` state (showing
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

      // Delete temporary exam submission upon completion
      if (userId && examId) {
        deleteTempExamSubmission({
          userId,
          examId,
          versionId: versionId || undefined,
          board: board || undefined,
        }).catch((err) => {
          console.warn("Failed to delete temp exam submission:", err);
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
      deleteTempExamSubmission,
      userId,
      examId,
      versionId,
      board,
      timerStorageKey,
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

  const violations = useExamSecurity({
    isSubmitted,
    onViolationLimitReached: () => handleSubmit(true),
  });



  // ─── Auto-submit via sendBeacon when the user closes the tab ───
  // visibilitychange fires reliably on tab close / app quit;
  // beforeunload is the fallback. Both use navigator.sendBeacon
  // to fire-and-forget a force-submit to the backend.
  useEffect(() => {
    if (isSubmitted) return;

    const beaconSubmittedRef = { current: false };

    const fireBeaconSubmit = () => {
      if (beaconSubmittedRef.current) return;
      if (!attemptIdRef.current) return;

      beaconSubmittedRef.current = true;

      const token = getAuthToken();
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/';
      const url = `${apiUrl.replace(/\/$/, '')}/quiz-attempts/force-submit`;

      const answers = allQuestions.map((q, idx) => {
        const selIdx = selectedAnswers[idx];
        return {
          questionNumber: q.questionNumber || idx + 1,
          selectedOption:
            selIdx !== undefined
              ? (q.optionKeys?.[selIdx] ?? q.options[selIdx] ?? '')
              : null,
          timeTaken: questionStartTimes.current[idx]
            ? Math.max(1, Math.round((Date.now() - questionStartTimes.current[idx]) / 1000))
            : 1,
        };
      });

      const blob = new Blob(
        [JSON.stringify({ attemptId: attemptIdRef.current, answers, token })],
        { type: 'application/json' }
      );

      navigator.sendBeacon(url, blob);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Save timer to localStorage for potential refresh restoration
        try {
          localStorage.setItem(timerStorageKey, JSON.stringify({
            savedAt: Date.now(),
            timeLeft,
          }));
        } catch { /* ignore */ }

        fireBeaconSubmit();
      }
    };

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      // Save timer to localStorage
      try {
        localStorage.setItem(timerStorageKey, JSON.stringify({
          savedAt: Date.now(),
          timeLeft,
        }));
      } catch { /* ignore */ }

      fireBeaconSubmit();

      e.preventDefault();
      e.returnValue = '';
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [isSubmitted, timeLeft, timerStorageKey, allQuestions, selectedAnswers]);

  // ─── Block navigation when exam is in progress ───
  const shouldBlock = useCallback(
    ({ nextLocation }: { currentLocation: any; nextLocation: any }) => {
      // Don't block if exam is already submitted
      if (isSubmitted) return false;
      // Don't block if navigating to the result page (submit already handled it)
      if (nextLocation.pathname === '/mock-exam/result') return false;
      return true;
    },
    [isSubmitted]
  );

  const blocker = useBlocker(shouldBlock);

  useEffect(() => {
    if (blocker.state !== 'blocked') return;

    Swal.fire({
      title: 'Are you sure?',
      text: 'You have unsaved answers. If you leave now, your exam will be submitted automatically.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#9B51E0',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, submit & leave',
      cancelButtonText: 'No, stay here',
    }).then((result) => {
      if (result.isConfirmed) {
        // Submit the exam then reset the blocker (handleSubmit navigates to result)
        blocker.reset();
        handleSubmit(false);
      } else {
        blocker.reset();
      }
    });
  }, [blocker, handleSubmit]);

  // Show loading while checking if exam is already attempted
  if (attemptsLoading || questionsLoading || isStarting) {
    return <QuizLoading loadingQuestions={questionsLoading || attemptsLoading} />;
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
      {/* {!isSubmitted && <Watermark userId={userId} examId={examId} />} */}
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
      <main className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 mt-6 sm:mt-8 space-y-4 sm:space-y-6 pb-16">
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

export default ExamPaper;