import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, useSearchParams, useBlocker } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Swal from 'sweetalert2';
import {
  useGetExamsQuery,
  useGetQuestionsByExamQuery,
  useGetScheduleExamQuestionsQuery,
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
  useRecordQuestionStatsMutation,
  useRecordMistakesMutation,
  getAuthToken,
} from "@my-monorepo/store";
import { emitXpGained, emitLevelUp } from "../../../../gamification/GamificationToast";
import { usePostUserQuizsMutation } from "@my-monorepo/store/src/redux/api/userPerformanceApi";
import type { RecordMistakeQuestion } from "@my-monorepo/store";
import QuestionCard from "./_components/QuestionCard.tsx";
import QuizHeader from "./_components/QuizHeader.tsx";
import QuizProgressBar from "./_components/QuizProgressBar.tsx";
import {
  QuizLoading, NoExamSelected, NoQuestionsAvailable,
} from "./_components/QuizStates.tsx";
import {
  computeLocalScore, buildLocalReview,
} from "./_components/quizTypes.ts";
import type { QuestionItem, QuizResultData } from "./_components/quizTypes.ts";
import { useExamSecurity } from "./examSecurity/useExamSecurity.ts";
import Watermark from "./examSecurity/Watermark.tsx";
import { useTheme } from "../../../../theme/ThemeContext.tsx";


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
  const { isDark } = useTheme();

  const userId = useAppSelector((state) => state.user.user?._id) || "";

  const { data: userPerformance } = useGetUserPerformanceQuery(
    { userId, type: "mockExam" },
    { skip: !userId }
  );

  const { data: userAttempts, isLoading: attemptsLoading } = useGetUserAttemptsQuery(
    { userId, source: 'mock_exam', limit: 50 },
    { skip: !userId || !examId }
  );

  const hasCompletedAttempt = useMemo(() => {
    if (!userAttempts || !examId) return false;
    return userAttempts.some((a: any) => {
      if (!a.isCompleted) return false;

      const attemptScheduleId = String(a.scheduleExam?._id || a.scheduleExam || '');

      if (scheduleId) {
        return attemptScheduleId === String(scheduleId);
      }

      if (attemptScheduleId) return false;

      const attemptExamId = String(a.exam?._id || a.exam || '');
      if (attemptExamId !== String(examId)) return false;

      if (versionId) {
        const attemptVersionId = String(a.examVersion?._id || a.examVersion || '');
        if (attemptVersionId && attemptVersionId !== String(versionId)) return false;
      }

      if (board) {
        const attemptBoard = String(a.board || '');
        if (attemptBoard && attemptBoard !== String(board)) return false;
      }

      return true;
    });
  }, [userAttempts, examId, versionId, board, scheduleId]);

  const { data: exams } = useGetExamsQuery();
  const { data: examVersions } = useGetExamVersionsByExamQuery(examId, {
    skip: !examId,
  });
  const { data: scheduleExams } = useGetScheduleExamsByExamQuery(examId, {
    skip: !examId,
  });
  const { data: scheduleQuestionsData, isLoading: scheduleQuestionsLoading } =
    useGetScheduleExamQuestionsQuery(scheduleId, {
      skip: !scheduleId,
    });
  const { data: standardQuestionsData, isLoading: standardQuestionsLoading } =
    useGetQuestionsByExamQuery(
      { examId, versionId: versionId || undefined, board: board || undefined },
      { skip: !examId || Boolean(scheduleId) }
    );

  const questionsData = scheduleId && scheduleQuestionsData ? scheduleQuestionsData : standardQuestionsData;
  const questionsLoading = scheduleId ? scheduleQuestionsLoading : standardQuestionsLoading;

  const [startAttempt, { isLoading: isStarting }] = useStartAttemptMutation();
  const [saveAnswer] = useSaveAnswerMutation();
  const [batchSaveAnswers] = useBatchSaveAnswersMutation();
  const [completeAttempt, { isLoading: isCompleting }] =
    useCompleteAttemptMutation();
  const [postUserQuizs] = usePostUserQuizsMutation();
  const { data: tempSubmission } = useGetTempExamSubmissionQuery(
    {
      userId,
      examId,
      versionId: versionId || undefined,
      scheduleExamId: scheduleId || undefined,
      board: board || undefined,
    },
    { skip: !userId || !examId }
  );
  const [saveTempExamSubmission] = useSaveTempExamSubmissionMutation();
  const [deleteTempExamSubmission] = useDeleteTempExamSubmissionMutation();
  const [recordQuestionStats] = useRecordQuestionStatsMutation();
  const [recordMistakes] = useRecordMistakesMutation();

  const attemptIdRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const questionStartTimes = useRef<Record<number, number>>({});
  const submitInFlightRef = useRef(false);

  const currentExam = exams?.find((e: any) => e._id === examId);
  const currentVersion = examVersions?.find((v: any) => v._id === versionId);
  const schedule =
    scheduleExams?.find((s: any) => s._id === scheduleId) ??
    (scheduleExams?.length === 1 ? scheduleExams[0] : undefined);

  const durationSeconds = (schedule?.duration ?? 120) * 60;

  const effectiveVersionId =
    versionId ||
    (typeof schedule?.examVersion === "object"
      ? (schedule?.examVersion as any)?._id
      : (schedule?.examVersion as string)) ||
    undefined;

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: activeAttempt } = useGetActiveAttemptQuery(
    {
      userId,
      examId: examId || undefined,
      scheduleExamId: scheduleId || undefined,
      versionId: versionId || undefined,
    },
    { skip: !userId || !examId || !attemptIdRef.current || isSubmitted }
  );

  const totalQuestions = allQuestions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

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

  useEffect(() => {
    if (isSubmitted || scheduleExams === undefined) return;
    if (restoredTimeLeft === null) {
      setTimeLeft(durationSeconds);
    }
  }, [durationSeconds, isSubmitted, scheduleExams, restoredTimeLeft]);

  useEffect(() => {
    if (isSubmitted || isSubmitting || submitInFlightRef.current || attemptsLoading) return;

    if (hasCompletedAttempt) {
      navigate('/mock-exam', { replace: true });
    }
  }, [hasCompletedAttempt, attemptsLoading, navigate, isSubmitted, isSubmitting]);

  useEffect(() => {
    if (attemptsLoading) return;
    if (hasCompletedAttempt) return;
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

        try {
          localStorage.setItem(timerStorageKey, JSON.stringify({
            savedAt: Date.now(),
            timeLeft: durationSeconds,
          }));
        } catch { /* ignore */ }
      } catch (err: any) {
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

  useEffect(() => {
    if (!activeAttempt || isSubmitted) return;
    if (Object.keys(selectedAnswers).length > 0) return;
    if (!activeAttempt.questions || activeAttempt.questions.length === 0) return;

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
  }, [activeAttempt, allQuestions, selectedAnswers, isSubmitted]);

  useEffect(() => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setIsSubmitting(false);
    setError(null);
    setTimeLeft(restoredTimeLeft ?? durationSeconds);
    attemptIdRef.current = null;
    submitInFlightRef.current = false;
    startTimeRef.current = Date.now();
    questionStartTimes.current = {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, versionId]);

  const handleAnswerSelect = useCallback(
    (qIndex: number, oIndex: number) => {
      if (isSubmitted || isSubmitting) return;

      const qItem = allQuestions[qIndex];
      if (!qItem) return;

      const qId = qItem.id;

      if (!questionStartTimes.current[qIndex]) {
        questionStartTimes.current[qIndex] = Date.now();
      }

      setSelectedAnswers((prev) => {
        if (prev[qIndex] !== undefined) return prev;
        const updated = { ...prev, [qIndex]: oIndex };

        const optionKey = qItem.optionKeys?.[oIndex] ?? qItem.options[oIndex] ?? "";

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

        if (userId && examId) {
          saveTempExamSubmission({
            userId,
            examId,
            examVersionId: versionId || undefined,
            scheduleExamId: scheduleId || undefined,
            board: board || undefined,
            attemptId: attemptIdRef.current || undefined,
            selectedAnswers: updated,
            timeLeft,
          }).catch((err) => {
            console.warn("Failed to persist temp progress:", err);
          });
        }

        if (qId && userId && examId) {
          postUserQuizs({
            user: userId,
            exam: examId,
            examVersion: effectiveVersionId || null,
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

        if (qItem.id) {
          const isCorr = oIndex === qItem.correctAnswer;
          recordQuestionStats({
            questionId: String(qItem.id),
            isCorrect: isCorr,
            selectedOption: qItem.optionKeys?.[oIndex] ?? String(oIndex),
          }).catch((err) => {
            console.warn("Failed to record question stat:", err);
          });
        }

        return updated;
      });
    },
    [isSubmitted, isSubmitting, userId, allQuestions, saveAnswer, saveTempExamSubmission, postUserQuizs, recordQuestionStats, examId, effectiveVersionId, scheduleId, board, timeLeft]
  );

  const handleSubmit = useCallback(
    async (auto = false) => {
      if (isSubmitted || isCompleting || isSubmitting) return;
      if (submitInFlightRef.current) return;
      submitInFlightRef.current = true;

      const unanswered = totalQuestions - answeredCount;
      if (!auto && unanswered > 0) {
        const result = await Swal.fire({
          title: isDark ? 'Submit Exam?' : 'পরীক্ষা জমা দিবেন?',
          text: isDark 
            ? `You have ${unanswered} unanswered question(s). Submit anyway?`
            : `আপনি ${unanswered} টি প্রশ্নের উত্তর দেননি। তবুও সাবমিট করবেন?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: isDark ? '#9B51E0' : '#1a1a1a',
          cancelButtonColor: isDark ? '#6b7280' : '#4a4a4a',
          confirmButtonText: isDark ? 'Submit' : 'জমা দিন',
          cancelButtonText: isDark ? 'Cancel' : 'বাতিল',
          background: isDark ? '#1C1F26' : '#f2efe9',
          color: isDark ? '#F5F7FA' : '#1a1a1a',
        });
        if (!result.isConfirmed) {
          submitInFlightRef.current = false;
          return;
        }
      }

      setIsSubmitting(true);

      const localCorrect = computeLocalScore(allQuestions, selectedAnswers);
      setIsSubmitted(true);

      try {
        localStorage.removeItem('selectedPaperType');
        localStorage.removeItem(timerStorageKey);
        localStorage.removeItem(violationStorageKey);
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

      try {
        const attemptId = attemptIdRef.current;
        if (attemptId) {
          await batchSaveAnswers({
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
          }).unwrap();

          await completeAttempt({ attemptId }).unwrap().then((res) => {
            const gm = res?.gamification;
            if (gm && gm.xpAwarded > 0) {
              emitXpGained({
                xpAwarded: gm.xpAwarded,
                level: gm.level,
                xpIntoLevel: gm.xpIntoLevel,
                xpForNextLevel: gm.xpForNextLevel,
                progress: gm.progress,
                currentStreak: gm.currentStreak,
                source: 'mock_exam',
              });
              if (gm.levelUp) {
                emitLevelUp({
                  level: gm.level,
                  xpIntoLevel: gm.xpIntoLevel,
                  xpForNextLevel: gm.xpForNextLevel,
                });
              }
            }
          });
        }

        if (userId && examId) {
          const answeredSubmissions = allQuestions
            .map((q, idx) => {
              const selIdx = selectedAnswers[idx];
              if (selIdx === undefined || !q.id) return null;
              return {
                question: q.id,
                providedAnswer: q.optionKeys?.[selIdx] ?? "",
              };
            })
            .filter(Boolean);

          if (answeredSubmissions.length > 0) {
            await postUserQuizs({
              user: userId,
              exam: examId,
              examVersion: effectiveVersionId || null,
              subject: null,
              submittedQuestions: answeredSubmissions,
            })
              .unwrap()
              .catch((err) => {
                console.warn("Bulk quiz performance save failed:", err);
              });
          }

          const wrongMistakes = allQuestions
            .map((q, idx) => {
              const selIdx = selectedAnswers[idx];
              if (selIdx === undefined || !q.id) return null;
              if (selIdx === q.correctAnswer) return null;
              return {
                questionId: String(q.id),
                questionText: q.question || '',
                options: Object.fromEntries(
                  (q.optionKeys ?? []).map((k, oi) => [k, q.options[oi] ?? ''])
                ),
                correctAnswer: q.optionKeys?.[q.correctAnswer ?? -1] ?? null,
                lastWrongAnswer: q.optionKeys?.[selIdx] ?? null,
                exam: examId,
                examName: currentExam?.name || '',
              } as RecordMistakeQuestion;
            })
            .filter(Boolean) as RecordMistakeQuestion[];

          if (wrongMistakes.length > 0) {
            recordMistakes({ questions: wrongMistakes }).catch((err) => {
              console.warn('Failed to add mistakes to notebook:', err);
            });
          }
        }

        if (userId && examId) {
          await deleteTempExamSubmission({
            userId,
            examId,
            versionId: versionId || undefined,
            scheduleExamId: scheduleId || undefined,
            board: board || undefined,
          }).unwrap().catch((err) => {
            console.warn("Failed to delete temp exam submission:", err);
          });
        }
      } catch (err) {
        console.error("Failed to persist attempt to server:", err);
      } finally {
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
      }
    },
    [
      isSubmitted,
      isCompleting,
      isSubmitting,
      totalQuestions,
      answeredCount,
      allQuestions,
      selectedAnswers,
      completeAttempt,
      batchSaveAnswers,
      deleteTempExamSubmission,
      postUserQuizs,
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
      isDark,
    ]
  );

  useEffect(() => {
    if (timeLeft === 0 && !isSubmitted && totalQuestions > 0) {
      handleSubmit(true);
    }
  }, [timeLeft, isSubmitted, totalQuestions, handleSubmit]);

  const violationStorageKey = `examViolations:${examId}:${versionId}:${scheduleId}`;

  const violations = useExamSecurity({
    isSubmitted,
    storageKey: violationStorageKey,
    onViolationLimitReached: () => handleSubmit(true),
  });

  useEffect(() => {
    if (isSubmitted) return;

    const saveTimerSnapshot = () => {
      try {
        localStorage.setItem(
          timerStorageKey,
          JSON.stringify({
            savedAt: Date.now(),
            timeLeft,
          })
        );
      } catch { /* ignore */ }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveTimerSnapshot();
      }
    };

    const onBeforeUnload = () => {
      saveTimerSnapshot();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [isSubmitted, timeLeft, timerStorageKey]);

  const shouldBlock = useCallback(
    ({ nextLocation }: { currentLocation: any; nextLocation: any }) => {
      if (isSubmitted) return false;
      if (nextLocation.pathname === '/mock-exam/result') return false;
      return true;
    },
    [isSubmitted]
  );

  const blocker = useBlocker(shouldBlock);
  const leaveExamPromptShownRef = useRef(false);

  useEffect(() => {
    if (blocker.state !== 'blocked' || leaveExamPromptShownRef.current) return;

    leaveExamPromptShownRef.current = true;

    Swal.fire({
      title: isDark ? 'Leave Exam?' : 'পরীক্ষা ছেড়ে যাবেন?',
      text: isDark 
        ? 'Leaving will submit your current answers and finish the exam.'
        : 'চলে গেলে আপনার বর্তমান উত্তর জমা হয়ে পরীক্ষা শেষ হয়ে যাবে।',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: isDark ? '#9B51E0' : '#1a1a1a',
      cancelButtonColor: isDark ? '#6b7280' : '#4a4a4a',
      confirmButtonText: isDark ? 'Submit & finish now' : 'জমা দিন ও শেষ করুন',
      cancelButtonText: isDark ? 'Stay in exam' : 'পরীক্ষায় থাকুন',
      background: isDark ? '#1C1F26' : '#f2efe9',
      color: isDark ? '#F5F7FA' : '#1a1a1a',
    }).then((result) => {
      leaveExamPromptShownRef.current = false;
      if (result.isConfirmed) {
        blocker.reset();
        handleSubmit(false);
      } else {
        blocker.reset();
      }
    });
  }, [blocker.state, handleSubmit, isDark]);

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

  // ─── LIGHT MODE (Vintage Paper Style) ───────────────────────
  if (!isDark) {
    return (
      <div 
        className="min-h-screen bg-[#e8e4db] w-full text-[#1a1a1a] pb-12 relative"
        style={{
          backgroundImage: 'radial-gradient(#d8d4cb 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        {/* Submitting Overlay */}
        {(isSubmitting || isCompleting) && (
          <div className="fixed inset-0 z-50 bg-[#e8e4db]/95 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-[#b91c1c] animate-spin" />
            <p className="text-base sm:text-lg font-black text-[#1a1a1a] font-serif tracking-wide">
              Submitting exam and finalizing results...
            </p>
          </div>
        )}
        
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

        <main className="w-full mx-auto px-3 sm:px-4 md:px-6 mt-6 sm:mt-8 space-y-4 sm:space-y-6 pb-16">
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
  }

  // ─── DARK MODE (Original Code - Unchanged) ─────────────────
  return (
    <div className="min-h-screen bg-[#0B0D12] w-full text-[#F5F7FA] pb-12 relative">
      {(isSubmitting || isCompleting) && (
        <div className="fixed inset-0 z-50 bg-[#0B0D12]/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-[#9B51E0] animate-spin" />
          <p className="text-base sm:text-lg font-bold text-white tracking-wide">
            Submitting exam and finalizing results...
          </p>
        </div>
      )}

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

      <main className="w-full mx-auto px-3 sm:px-4 md:px-6 mt-6 sm:mt-8 space-y-4 sm:space-y-6 pb-16">
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