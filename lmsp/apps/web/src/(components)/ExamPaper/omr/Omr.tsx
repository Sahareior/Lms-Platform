import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Send, Clock, AlertCircle } from 'lucide-react';
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
} from '@my-monorepo/store';
import {
    computeLocalScore,
    buildLocalReview,
} from '../_components/quizTypes';
import type { QuestionItem, QuizResultData } from '../_components/quizTypes';
import {
    QuizLoading,
    NoExamSelected,
    NoQuestionsAvailable,
} from '../_components/QuizStates';
import type { ExamPaperProps } from '../ExamPaper';

/* -------------------------------------------------------------------------- */
/*                                 CONSTANTS                                  */
/* -------------------------------------------------------------------------- */

const OPTIONS = ['A', 'B', 'C', 'D'] as const;
type OptionType = (typeof OPTIONS)[number];

const EXAM_TYPES = [
    { id: 'ssc', label: 'এসএসসি' },
    { id: 'hsc', label: 'এইচএসসি' },
    { id: 'alim', label: 'আলিম' },
    { id: 'vocational', label: 'ভোকেশনাল' },
] as const;

/* -------------------------------------------------------------------------- */
/*                              HELPER SVGS & ICONS                           */
/* -------------------------------------------------------------------------- */

// Corner crosshair / registration mark
const Crosshair: React.FC<{ className?: string }> = ({ className = '' }) => (
    <svg
        className={`w-6 h-6 text-black select-none pointer-events-none ${className}`}
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
    >
        <circle cx="16" cy="16" r="7.5" />
        <line x1="16" y1="1" x2="16" y2="31" />
        <line x1="1" y1="16" x2="31" y2="16" />
    </svg>
);

// Bangladesh Education Board Emblem
const BoardLogo: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
    <svg
        className={`${className} text-black select-none`}
        viewBox="0 0 100 100"
        fill="currentColor"
    >
        <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="50" cy="50" r="43" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
        <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path
            d="M32 58 C 42 54, 48 56, 50 62 C 52 56, 58 54, 68 58 L 68 42 C 58 38, 52 40, 50 46 C 48 40, 42 38, 32 42 Z"
            fill="currentColor"
        />
        <path d="M 50 28 C 47 33, 47 37, 50 40 C 53 37, 53 33, 50 28 Z" fill="currentColor" />
        <polygon points="50,15 52,20 57,20 53,23 55,28 50,25 45,28 47,23 43,20 48,20" fill="currentColor" />
        <polygon points="20,50 22,53 26,53 23,55 24,59 20,57 16,59 17,55 14,53 18,53" fill="currentColor" transform="scale(0.8) translate(5,10)" />
        <polygon points="80,50 82,53 86,53 83,55 84,59 80,57 76,59 77,55 74,53 78,53" fill="currentColor" transform="scale(0.8) translate(20,10)" />
        <path d="M 25 74 Q 50 84 75 74" fill="none" stroke="currentColor" strokeWidth="2" />
        <text x="50" y="88" fontSize="6.5" fontWeight="bold" textAnchor="middle" fill="currentColor">
            শিক্ষা বোর্ড
        </text>
    </svg>
);

/* -------------------------------------------------------------------------- */
/*                            MAIN OMR COMPONENT                              */
/* -------------------------------------------------------------------------- */

const Omer: React.FC<ExamPaperProps> = ({
    examId: propExamId,
    versionId: propVersionId,
    board: propBoard,
}) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const examId = propExamId || searchParams.get('examId') || '';
    const versionId = propVersionId || searchParams.get('versionId') || '';
    const rawBoard = propBoard || searchParams.get('board') || '';
    const board = rawBoard === 'undefined' || rawBoard === 'null' ? '' : rawBoard;
    const scheduleId = searchParams.get('scheduleId') || '';

    const userId = useAppSelector((state) => state.user.user?._id) || '';

    // Performance query
    const { data: userPerformance } = useGetUserPerformanceQuery(
        { userId, type: 'mockExam' },
        { skip: !userId }
    );

    // Pre-check completed attempts — query by source (not type) because
    // mock-exam attempts are stored with type:'practice' and source:'mock_exam'.
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

    // Exam info & questions queries
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

    // Mutations
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
    const alertShownRef = useRef(false);

    const currentExam = exams?.find((e: any) => e._id === examId);
    const currentVersion = examVersions?.find((v: any) => v._id === versionId);
    const schedule =
        scheduleExams?.find((s: any) => s._id === scheduleId) ??
        (scheduleExams?.length === 1 ? scheduleExams[0] : undefined);

    const durationSeconds = (schedule?.duration ?? 120) * 60;

    // Correct answer index resolver
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

    // Process all questions into QuestionItem format
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
                        scenarioText: q.scenario_text || '',
                        imageUrl: q.image_url || '',
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

    // Exam / candidate metadata states
    const [mobileTab, setMobileTab] = useState<'questions' | 'omr'>('questions');
    const [selectedExam, setSelectedExam] = useState<string>('ssc');
    const [rollDigits, setRollDigits] = useState<string[]>(['', '', '', '', '', '']);
    const [candidateName, setCandidateName] = useState<string>('');
    const [subjectDigits, setSubjectDigits] = useState<(number | null)[]>([null, null, null, null, null]);
    const [paperCode, setPaperCode] = useState<number | null>(null);
    const [extraDigits, setExtraDigits] = useState<(number | null)[]>([null, null, null, null, null]);
    const [setDigits, setSetDigits] = useState<(number | null)[]>([null, null]);

    // Quiz submission states
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [timeLeft, setTimeLeft] = useState<number>(7200);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const totalQuestions = allQuestions.length;
    const answeredCount = Object.keys(selectedAnswers).length;
    const progressPercentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

    // ─── Timer countdown ───
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

    // Sync countdown with schedule duration
    useEffect(() => {
        if (isSubmitted || scheduleExams === undefined) return;
        if (answeredCount === 0) {
            setTimeLeft(durationSeconds);
        }
    }, [durationSeconds, isSubmitted, answeredCount, scheduleExams]);

    // ─── Show SweetAlert2 when exam is already completed ───
    useEffect(() => {
        if (attemptsLoading || alertShownRef.current) return;
        
        if (hasCompletedAttempt) {
            alertShownRef.current = true;
            
            Swal.fire({
                title: 'Already Participated',
                text: 'You have already participated in this exam. You cannot take it again.',
                icon: 'warning',
                confirmButtonText: 'Go to Exams',
                confirmButtonColor: '#9B51E0',
                allowOutsideClick: false,
                allowEscapeKey: false,
            }).then(() => {
                navigate('/mock-exam', { replace: true });
            });
        }
    }, [hasCompletedAttempt, attemptsLoading, navigate]);

    // ─── Start Attempt ───
    useEffect(() => {
        // Don't fire check or startAttempt until the pre-check query has loaded
        if (attemptsLoading) return;

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
                    type: 'practice',
                    source: 'mock_exam',
                    totalQuestions: allQuestions.length,
                    board: board || undefined,
                }).unwrap();
                attemptIdRef.current = result._id;
                startTimeRef.current = Date.now();
                setError(null);
            } catch (err: any) {
                if (err?.status === 409 || err?.data?.message?.includes('already completed')) {
                    if (!alertShownRef.current) {
                        alertShownRef.current = true;
                        
                        Swal.fire({
                            title: 'Already Participated',
                            text: 'You have already participated in this exam. You cannot take it again.',
                            icon: 'warning',
                            confirmButtonText: 'Go to Exams',
                            confirmButtonColor: '#9B51E0',
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                        }).then(() => {
                            navigate('/mock-exam', { replace: true });
                        });
                    }
                } else {
                    const msg = err instanceof Error ? err.message : 'Failed to start attempt';
                    console.error('Failed to start attempt:', msg);
                    setError('Could not save progress to server — scores shown locally only.');
                }
            }
        };

        initAttempt();
    }, [examId, versionId, userId, allQuestions.length, startAttempt, navigate, hasCompletedAttempt, attemptsLoading, board]);

    // Reset state on exam change
    useEffect(() => {
        setSelectedAnswers({});
        setIsSubmitted(false);
        setError(null);
        setTimeLeft(durationSeconds);
        attemptIdRef.current = null;
        submitInFlightRef.current = false;
        startTimeRef.current = Date.now();
        questionStartTimes.current = {};
        alertShownRef.current = false;
    }, [examId, versionId, durationSeconds]);

    // ─── Handle answer selection ───
    const handleAnswerSelect = useCallback(
        (qIndex: number, oIndex: number) => {
            if (isSubmitted) return;

            const qItem = allQuestions[qIndex];
            if (!qItem) return;

            // Once chosen, an answer cannot be changed or cleared
            if (selectedAnswers[qIndex] !== undefined) return;

            if (!questionStartTimes.current[qIndex]) {
                questionStartTimes.current[qIndex] = Date.now();
            }

            setSelectedAnswers((prev) => {
                if (prev[qIndex] !== undefined) return prev;

                const updated = { ...prev, [qIndex]: oIndex };
                const optionKey = qItem.optionKeys?.[oIndex] ?? qItem.options[oIndex] ?? '';

                // Auto-save to backend
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
                        console.warn('Auto-save failed:', err);
                    });
                }

                return updated;
            });
        },
        [isSubmitted, userId, allQuestions, saveAnswer, selectedAnswers]
    );

    // ─── Handle Submit ───
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

            const localCorrect = computeLocalScore(allQuestions, selectedAnswers);
            setIsSubmitted(true);

            const timeTaken = Math.max(1, durationSeconds - timeLeft);
            const result: QuizResultData = {
                examName: currentExam?.name || 'Quiz',
                versionName: currentVersion?.examVersion || '',
                title: schedule?.title || currentExam?.name || 'Quiz',
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

            // Persist in background
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
                                    ? (q.optionKeys?.[selIdx] ?? q.options[selIdx] ?? '')
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
                        console.error('Failed to persist attempt to server:', err);
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

    // Auto-submit when time reaches zero
    useEffect(() => {
        if (timeLeft === 0 && !isSubmitted && totalQuestions > 0) {
            handleSubmit(true);
        }
    }, [timeLeft, isSubmitted, totalQuestions, handleSubmit]);

    const handleRollChange = (index: number, val: string) => {
        const digit = val.replace(/\D/g, '').slice(-1);
        const updated = [...rollDigits];
        updated[index] = digit;
        setRollDigits(updated);
    };

    const toggleSubjectDigit = (col: number, digit: number) => {
        setSubjectDigits((prev) => {
            const next = [...prev];
            next[col] = next[col] === digit ? null : digit;
            return next;
        });
    };

    const togglePaperCode = (digit: number) => {
        setPaperCode((prev) => (prev === digit ? null : digit));
    };

    const toggleExtraDigit = (col: number, digit: number) => {
        setExtraDigits((prev) => {
            const next = [...prev];
            next[col] = next[col] === digit ? null : digit;
            return next;
        });
    };

    const toggleSetDigit = (col: number, digit: number) => {
        setSetDigits((prev) => {
            const next = [...prev];
            next[col] = next[col] === digit ? null : digit;
            return next;
        });
    };

    // Format time mm:ss
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    // Loading & empty states
    if (attemptsLoading || questionsLoading || isStarting) {
        return <QuizLoading loadingQuestions={questionsLoading || attemptsLoading} />;
    }

    if (!examId) {
        return <NoExamSelected onBack={() => navigate('/mock-exam')} />;
    }

    if (allQuestions.length === 0) {
        return <NoQuestionsAvailable onBack={() => navigate('/mock-exam')} />;
    }

    return (
        <div className="min-h-screen bg-[#1c1f26] py-4 sm:py-6 px-2 sm:px-4 text-slate-900 font-sans print:bg-white print:p-0">
            {/* ──────────────────────────────────────────────────────────── */}
            {/* TOP CONTROLS & TOOLBAR (Hidden in Print)                     */}
            {/* ──────────────────────────────────────────────────────────── */}
            <div className="max-w-[1700px] mx-auto mb-4 sm:mb-5 print:hidden">
                <div className="bg-[#111318] border border-[#2e333d] rounded-xl p-3 sm:p-4 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 text-white">
                    {/* Progress Overview */}
                    <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4">
                        <div className="bg-[#1e222b] px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg border border-[#2e333d]">
                            <span className="text-[11px] sm:text-xs text-gray-400 block font-medium">ভরাটকৃত উত্তর (Answered)</span>
                            <span className="text-base sm:text-lg font-bold text-white font-mono">
                                {answeredCount} <span className="text-xs text-gray-400 font-normal">/ {totalQuestions}</span>
                            </span>
                        </div>

                        <div className="hidden md:block w-36 bg-[#2a2f3d] h-2.5 rounded-full overflow-hidden">
                            <div
                                className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>

                        {/* Live Countdown Timer */}
                        <div
                            className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg border font-mono font-bold text-xs sm:text-sm ${timeLeft < 300
                                    ? 'bg-rose-950/70 border-rose-600/50 text-rose-400 animate-pulse'
                                    : 'bg-[#1e222b] border-[#2e333d] text-emerald-400'
                                }`}
                        >
                            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>{formatTime(timeLeft)}</span>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleSubmit(false)}
                            disabled={isCompleting}
                            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {isCompleting ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Send className="w-3.5 h-3.5" />
                            )}
                            {isCompleting ? 'সাবমিট হচ্ছে...' : 'পরীক্ষা সম্পন্ন করুন (Submit)'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mt-3 bg-amber-950/80 border border-amber-600/50 text-amber-200 px-4 py-2.5 rounded-lg flex items-center gap-2 text-xs">
                        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* ── Mobile Tab Switcher (Visible only on screens < lg) ── */}
                <div className="lg:hidden flex items-center justify-center p-1 bg-[#111318] border border-[#2e333d] rounded-xl mt-3">
                    <button
                        type="button"
                        onClick={() => setMobileTab('questions')}
                        className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${mobileTab === 'questions'
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <span>📝 প্রশ্নসমূহ ({answeredCount}/{totalQuestions})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setMobileTab('omr')}
                        className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${mobileTab === 'omr'
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <span>📄 OMR শিট (OMR Sheet)</span>
                    </button>
                </div>
            </div>

            {/* ──────────────────────────────────────────────────────────── */}
            {/* FLEX ROW: QUESTIONS (LEFT) + OMR SHEET (RIGHT)               */}
            {/* ──────────────────────────────────────────────────────────── */}
            <div className="max-w-[96vw] mx-auto flex flex-col lg:flex-row gap-5">
                {/* ─────────────────────────────────────────────────────────── */}
                {/* LEFT PANEL: QUESTIONS LIST                                  */}
                {/* ─────────────────────────────────────────────────────────── */}
                <div className={`w-full lg:w-[500px] flex-shrink-0 ${mobileTab === 'questions' ? 'block' : 'hidden lg:block'}`}>
                    <div className="bg-[#111318] border border-[#2e333d] rounded-xl p-4 shadow-xl">
                        <div className="flex items-center justify-between mb-3 border-b border-[#2e333d] pb-2">
                            <h2 className="text-white text-base font-bold">প্রশ্নসমূহ (Questions)</h2>
                            <span className="text-xs text-gray-400 font-mono">
                                {answeredCount} / {totalQuestions} সম্পন্ন
                            </span>
                        </div>

                        <div className="space-y-3.5 h-[750px] overflow-y-auto pr-1.5 custom-scrollbar">
                            {allQuestions.map((q, qIndex) => {
                                const selectedOptIdx = selectedAnswers[qIndex];
                                const displayQNum = q.questionNumber || qIndex + 1;

                                return (
                                    <div
                                        key={q.id || qIndex}
                                        className={`bg-[#1e222b] border rounded-lg p-3.5 transition-colors ${selectedOptIdx !== undefined
                                                ? 'border-emerald-500/50 bg-[#1e272b]'
                                                : 'border-[#2e333d] hover:border-[#4a5568]'
                                            }`}
                                    >
                                        {/* Question Header & Text */}
                                        <div className="flex items-start gap-2.5 mb-2.5">
                                            <span
                                                className={`text-xs font-bold px-2 py-0.5 rounded flex-shrink-0 font-mono ${selectedOptIdx !== undefined
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'bg-[#2a2f3d] text-gray-300'
                                                    }`}
                                            >
                                                {String(displayQNum).padStart(2, '0')}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                {q.scenarioText && (
                                                    <p className="text-[14px] text-gray-400 italic mb-1 bg-[#151820] p-2 rounded border border-[#23262d]">
                                                        {q.scenarioText}
                                                    </p>
                                                )}
                                                <p className="text-gray-200 text-[16px] leading-relaxed font-medium">
                                                    {q.question}
                                                </p>
                                                {q.imageUrl && (
                                                    <img
                                                        src={q.imageUrl}
                                                        alt={`Question ${displayQNum}`}
                                                        className="mt-2 max-h-36 rounded border border-gray-700 object-contain"
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        {/* Options Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                            {q.options.map((optText, oIdx) => {
                                                const optLetter = OPTIONS[oIdx];
                                                const isSelected = selectedOptIdx === oIdx;

                                                return (
                                                    <button
                                                        key={oIdx}
                                                        type="button"
                                                        onClick={() => handleAnswerSelect(qIndex, oIdx)}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[15px] font-medium text-left transition-all ${isSelected
                                                                ? 'bg-emerald-600 text-white border border-emerald-500 shadow-md scale-[1.01]'
                                                                : 'bg-[#222734] border border-[#373e4f] text-gray-300 hover:bg-[#2c3345] hover:text-white'
                                                            }`}
                                                    >
                                                        <span
                                                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-colors ${isSelected
                                                                    ? 'bg-white text-emerald-600'
                                                                    : 'bg-[#373e4f] text-gray-300'
                                                                }`}
                                                        >
                                                            {optLetter}
                                                        </span>
                                                        <span className="truncate leading-tight">{optText}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ─────────────────────────────────────────────────────────── */}
                {/* RIGHT PANEL: AUTHENTIC BANGLADESH OMR SHEET                 */}
                {/* ─────────────────────────────────────────────────────────── */}
                <div className={`flex-1 min-w-0 ${mobileTab === 'omr' ? 'block' : 'hidden lg:block'}`}>
                    {/* Mobile horizontal scroll hint */}
                    <div className="lg:hidden text-xs text-gray-400 mb-2 flex items-center justify-between px-1">
                        <span>👉 সম্পূর্ণ শিট দেখতে ডানে-বামে স্ক্রোল করুন</span>
                        <span className="font-mono text-emerald-400 font-bold">{answeredCount}/{totalQuestions} ভরাটকৃত</span>
                    </div>

                    <div className="overflow-x-auto pb-6 custom-scrollbar">
                        <div
                            id="omr-print-area"
                            className="relative w-[780px] min-w-[780px] bg-white text-black border-[2px] border-black p-4 sm:p-6 shadow-2xl select-none mx-auto"
                            style={{ fontFamily: '"Noto Sans Bengali", "Kalpurush", "SolaimanLipi", sans-serif' }}
                        >
                            {/* ── 4 Solid Black Registration Corner Squares ── */}
                            <div className="absolute top-1.5 left-1.5 w-3.5 h-3.5 bg-black" />
                            <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-black" />
                            <div className="absolute bottom-1.5 left-1.5 w-3.5 h-3.5 bg-black" />
                            <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 bg-black" />

                            {/* ── 4 Corner Crosshairs ── */}
                            <Crosshair className="absolute top-4 left-6" />
                            <Crosshair className="absolute top-4 right-6" />
                            <Crosshair className="absolute bottom-4 left-6" />
                            <Crosshair className="absolute bottom-4 right-6" />

                            {/* ── Full Height Left Timing Track ── */}
                            <div className="absolute left-2.5 top-12 bottom-12 flex flex-col justify-between w-3.5 pointer-events-none">
                                {Array.from({ length: 44 }).map((_, i) => (
                                    <div key={i} className="w-full h-[5px] bg-black" />
                                ))}
                            </div>

                            {/* ── Sheet Content ── */}
                            <div className="pl-6 sm:pl-7 pr-2">
                                {/* 1. TOP CENTER BADGE */}
                                <div className="text-center mb-1">
                                    <div className="inline-block bg-black text-white px-7 py-1 rounded-[4px] text-base sm:text-[17px] font-extrabold tracking-wider">
                                        SSC/HSC MCQ OMR Sheet
                                    </div>
                                </div>

                                {/* 2. BOARD CREST & TITLE */}
                                <div className="flex items-center justify-center gap-3 my-1.5">
                                    <BoardLogo className="w-11 h-11 flex-shrink-0" />
                                    <h1 className="text-lg sm:text-[22px] font-black tracking-tight text-center">
                                        মাধ্যমিক ও উচ্চমাধ্যমিক শিক্ষা বোর্ড, বাংলাদেশ
                                    </h1>
                                </div>

                                {/* 3. EXAM TYPE & ROLL NUMBER ROW */}
                                <div className="flex flex-wrap items-center justify-between gap-y-2 mt-2 text-[13px] font-bold">
                                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                        <span>পরীক্ষার নাম :</span>
                                        {EXAM_TYPES.map((exam) => (
                                            <label
                                                key={exam.id}
                                                onClick={() => setSelectedExam(exam.id)}
                                                className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                                            >
                                                <span
                                                    className={`w-4 h-4 border-[1.5px] border-black flex items-center justify-center text-[11px] font-bold ${selectedExam === exam.id ? 'bg-black text-white' : 'bg-white'
                                                        }`}
                                                >
                                                    {selectedExam === exam.id ? '✓' : ''}
                                                </span>
                                                <span>{exam.label}</span>
                                            </label>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-1.5 ml-auto">
                                        <span className="font-bold">রোল নম্বর</span>
                                        <div className="flex border-[1.5px] border-black divide-x-[1.5px] divide-black">
                                            {rollDigits.map((digit, idx) => (
                                                <input
                                                    key={idx}
                                                    type="text"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) => handleRollChange(idx, e.target.value)}
                                                    className="w-5 h-6 text-center text-xs font-bold font-mono outline-none bg-transparent"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* 4. CANDIDATE FULL NAME ROW */}
                                <div className="flex items-center gap-2 mt-2 text-[12px] font-bold">
                                    <span className="whitespace-nowrap">পরীক্ষার্থীর পূর্ণ নাম (বাংলায়) :</span>
                                    <div className="flex-1 flex border-[1.5px] border-black divide-x-[1.5px] divide-black overflow-x-auto">
                                        {Array.from({ length: 22 }).map((_, idx) => {
                                            const char = candidateName[idx] || '';
                                            return (
                                                <input
                                                    key={idx}
                                                    type="text"
                                                    maxLength={1}
                                                    value={char}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        const arr = candidateName.split('');
                                                        arr[idx] = val;
                                                        setCandidateName(arr.join(''));
                                                    }}
                                                    className="min-w-[18px] flex-1 h-5 text-center text-[11px] font-bold outline-none bg-transparent"
                                                />
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* 5. INSTRUCTION BANNER */}
                                <div className="mt-2.5 mb-3 border-[1.5px] border-black rounded-md px-2 py-1 text-center text-[10.5px] font-bold tracking-tight bg-gray-50/50">
                                    <span>নির্দেশাবলী: </span>
                                    <span className="font-semibold">১. কালো বল পেন ব্যবহার করুন</span>
                                    <span className="mx-1.5 font-normal">|</span>
                                    <span className="font-semibold">২. উত্তর সম্পূর্ণ গোল ঘরের ভিতর ভরাট করুন</span>
                                    <span className="mx-1.5 font-normal">|</span>
                                    <span className="font-semibold">৩. একাধিক উত্তর ভরাট করবেন না</span>
                                </div>

                                {/* 6. MAIN BODY: MCQ BUBBLE COLUMNS + CODING MATRICES */}
                                <div className="grid grid-cols-12 gap-2 sm:gap-3">
                                    {/* LEFT COLUMN: QUESTIONS 01 TO 25 */}
                                    <div className="col-span-4 sm:col-span-3 border-[1.5px] border-black">
                                        <div className="grid grid-cols-[30px_1fr] border-b-[1.5px] border-black bg-gray-50 text-center font-black text-[10px] sm:text-[11px]">
                                            <div className="py-0.5 border-r-[1.5px] border-black flex items-center justify-center">
                                                প্রশ্ন<br />নং
                                            </div>
                                            <div className="py-0.5 flex items-center justify-center">উত্তর</div>
                                        </div>

                                        {Array.from({ length: 25 }, (_, i) => i).map((i) => {
                                            const slotNum = i + 1; // 01 to 25
                                            const qFormatted = String(slotNum).padStart(2, '0');
                                            const qIndex = allQuestions.findIndex((q) => (q.questionNumber || 0) === slotNum);
                                            const targetIndex = qIndex !== -1 ? qIndex : i;
                                            const selectedOptIdx = selectedAnswers[targetIndex];

                                            return (
                                                <div
                                                    key={slotNum}
                                                    className="grid grid-cols-[30px_1fr] border-b border-gray-300 last:border-b-0 h-[21px] items-center text-[11px]"
                                                >
                                                    <div className="border-r-[1.5px] border-black h-full flex items-center justify-center font-bold font-mono text-[10px]">
                                                        {qFormatted}
                                                    </div>
                                                    <div className="flex items-center justify-around px-1">
                                                        {OPTIONS.map((optLetter, oIdx) => {
                                                            const isFilled = selectedOptIdx === oIdx;
                                                            return (
                                                                <button
                                                                    key={optLetter}
                                                                    type="button"
                                                                    onClick={() => handleAnswerSelect(targetIndex, oIdx)}
                                                                    aria-label={`Question ${slotNum} option ${optLetter}`}
                                                                    className={`w-[16px] h-[16px] rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-75 ${isFilled
                                                                            ? 'bg-black text-white border border-black scale-105'
                                                                            : 'border border-[#a82329] text-[#a82329] hover:bg-rose-50'
                                                                        }`}
                                                                >
                                                                    {optLetter}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* MIDDLE COLUMN: QUESTIONS 26 TO 50 */}
                                    <div className="col-span-4 sm:col-span-3 border-[1.5px] border-black">
                                        <div className="grid grid-cols-[30px_1fr] border-b-[1.5px] border-black bg-gray-50 text-center font-black text-[10px] sm:text-[11px]">
                                            <div className="py-0.5 border-r-[1.5px] border-black flex items-center justify-center">
                                                প্রশ্ন<br />নং
                                            </div>
                                            <div className="py-0.5 flex items-center justify-center">উত্তর</div>
                                        </div>

                                        {Array.from({ length: 25 }, (_, i) => i).map((i) => {
                                            const slotNum = i + 26; // 26 to 50
                                            const qIndex = allQuestions.findIndex((q) => (q.questionNumber || 0) === slotNum);
                                            const targetIndex = qIndex !== -1 ? qIndex : (i + 25);
                                            const selectedOptIdx = selectedAnswers[targetIndex];

                                            return (
                                                <div
                                                    key={slotNum}
                                                    className="grid grid-cols-[30px_1fr] border-b border-gray-300 last:border-b-0 h-[21px] items-center text-[11px]"
                                                >
                                                    <div className="border-r-[1.5px] border-black h-full flex items-center justify-center font-bold font-mono text-[10px]">
                                                        {slotNum}
                                                    </div>
                                                    <div className="flex items-center justify-around px-1">
                                                        {OPTIONS.map((optLetter, oIdx) => {
                                                            const isFilled = selectedOptIdx === oIdx;
                                                            return (
                                                                <button
                                                                    key={optLetter}
                                                                    type="button"
                                                                    onClick={() => handleAnswerSelect(targetIndex, oIdx)}
                                                                    aria-label={`Question ${slotNum} option ${optLetter}`}
                                                                    className={`w-[16px] h-[16px] rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-75 ${isFilled
                                                                            ? 'bg-black text-white border border-black scale-105'
                                                                            : 'border border-[#a82329] text-[#a82329] hover:bg-rose-50'
                                                                        }`}
                                                                >
                                                                    {optLetter}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* RIGHT SECTION: BUBBLE CODING MATRICES & INSTRUCTIONS */}
                                    <div className="col-span-4 sm:col-span-6 flex flex-col justify-between pl-1">
                                        {/* TOP ROW OF MATRICES */}
                                        <div className="flex items-start gap-2">
                                            {/* 1. বিষয় কোড (Subject Code - 5 cols) */}
                                            <div className="border-[1.5px] border-black">
                                                <div className="text-center font-bold text-[10px] border-b-[1.5px] border-black py-0.5 bg-gray-50">
                                                    বিষয় কোড
                                                </div>
                                                <div className="grid grid-cols-5 border-b-[1.5px] border-black divide-x divide-black h-5">
                                                    {subjectDigits.map((d, i) => (
                                                        <div key={i} className="flex items-center justify-center text-[10px] font-bold font-mono">
                                                            {d !== null ? d : ''}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="p-0.5">
                                                    {Array.from({ length: 10 }, (_, row) => (
                                                        <div key={row} className="grid grid-cols-5 gap-x-1 py-[1.5px] justify-items-center">
                                                            {subjectDigits.map((sel, col) => (
                                                                <button
                                                                    key={col}
                                                                    type="button"
                                                                    onClick={() => toggleSubjectDigit(col, row)}
                                                                    className={`w-[13px] h-[13px] rounded-full flex items-center justify-center text-[8px] font-bold transition-all ${sel === row
                                                                            ? 'bg-black text-white border border-black'
                                                                            : 'border border-[#a82329] text-[#a82329] hover:bg-rose-50'
                                                                        }`}
                                                                >
                                                                    {row}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* 2. পত্র কোড (Paper Code - 1 col) */}
                                            <div className="border-[1.5px] border-black">
                                                <div className="text-center font-bold text-[9px] border-b-[1.5px] border-black py-0.5 px-1 bg-gray-50">
                                                    পত্র কোড
                                                </div>
                                                <div className="border-b-[1.5px] border-black h-5 flex items-center justify-center text-[10px] font-bold font-mono">
                                                    {paperCode !== null ? paperCode : ''}
                                                </div>
                                                <div className="p-0.5 flex flex-col items-center gap-[2px]">
                                                    {Array.from({ length: 9 }, (_, i) => i + 1).map((row) => (
                                                        <button
                                                            key={row}
                                                            type="button"
                                                            onClick={() => togglePaperCode(row)}
                                                            className={`w-[13px] h-[13px] rounded-full flex items-center justify-center text-[8px] font-bold transition-all ${paperCode === row
                                                                    ? 'bg-black text-white border border-black'
                                                                    : 'border border-[#a82329] text-[#a82329] hover:bg-rose-50'
                                                                }`}
                                                        >
                                                            {row}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* 3. Candidate Signature Box */}
                                            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-gray-600 rounded-sm min-h-[195px] px-1 py-2">
                                                <div
                                                    className="text-[10px] font-bold text-gray-700 text-center tracking-tight"
                                                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                                                >
                                                    পরীক্ষার্থীর স্বাক্ষর (Signature of Candidate)
                                                </div>
                                            </div>
                                        </div>

                                        {/* SECOND ROW OF MATRICES */}
                                        <div className="flex items-start gap-2 mt-2">
                                            {/* অতিরিক্ত কোড (Extra Code - 5 cols) */}
                                            <div className="border-[1.5px] border-black flex-1">
                                                <div className="text-center font-bold text-[10px] border-b-[1.5px] border-black py-0.5 bg-gray-50">
                                                    অতিরিক্ত কোড
                                                </div>
                                                <div className="grid grid-cols-5 border-b-[1.5px] border-black divide-x divide-black h-5">
                                                    {extraDigits.map((d, i) => (
                                                        <div key={i} className="flex items-center justify-center text-[10px] font-bold font-mono">
                                                            {d !== null ? d : ''}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="p-0.5">
                                                    {Array.from({ length: 10 }, (_, row) => (
                                                        <div key={row} className="grid grid-cols-5 gap-x-1 py-[1.5px] justify-items-center">
                                                            {extraDigits.map((sel, col) => (
                                                                <button
                                                                    key={col}
                                                                    type="button"
                                                                    onClick={() => toggleExtraDigit(col, row)}
                                                                    className={`w-[13px] h-[13px] rounded-full flex items-center justify-center text-[8px] font-bold transition-all ${sel === row
                                                                            ? 'bg-black text-white border border-black'
                                                                            : 'border border-[#a82329] text-[#a82329] hover:bg-rose-50'
                                                                        }`}
                                                                >
                                                                    {row}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* সেট কোড (Set Code - 2 cols) */}
                                            <div className="border-[1.5px] border-black w-16">
                                                <div className="text-center font-bold text-[10px] border-b-[1.5px] border-black py-0.5 bg-gray-50">
                                                    সেট কোড
                                                </div>
                                                <div className="grid grid-cols-2 border-b-[1.5px] border-black divide-x divide-black h-5">
                                                    {setDigits.map((d, i) => (
                                                        <div key={i} className="flex items-center justify-center text-[10px] font-bold font-mono">
                                                            {d !== null ? d : ''}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="p-0.5">
                                                    {Array.from({ length: 10 }, (_, row) => (
                                                        <div key={row} className="grid grid-cols-2 gap-x-1 py-[1.5px] justify-items-center">
                                                            {setDigits.map((sel, col) => (
                                                                <button
                                                                    key={col}
                                                                    type="button"
                                                                    onClick={() => toggleSetDigit(col, row)}
                                                                    className={`w-[13px] h-[13px] rounded-full flex items-center justify-center text-[8px] font-bold transition-all ${sel === row
                                                                            ? 'bg-black text-white border border-black'
                                                                            : 'border border-[#a82329] text-[#a82329] hover:bg-rose-50'
                                                                        }`}
                                                                >
                                                                    {row}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* CRUCIAL INSTRUCTIONS / NOTICE SECTION */}
                                        <div className="mt-2.5 pt-1 text-left">
                                            <h3 className="font-bold text-[11px] mb-1 leading-tight text-black">
                                                বি. দ্র: নিচের কোনো নির্দেশনা ভঙ্গ করা যাবে না:
                                            </h3>
                                            <ul className="text-[9.5px] space-y-[2px] leading-tight text-gray-900 list-none pl-0">
                                                <li className="flex items-start gap-1">
                                                    <span className="font-bold">•</span>
                                                    <span>উত্তর কালো বল পেন দিয়ে পূরণ করতে হবে। পেন্সিল ব্যবহার করা যাবে না।</span>
                                                </li>
                                                <li className="flex items-start gap-1">
                                                    <span className="font-bold">•</span>
                                                    <span>একাধিক উত্তর ভরাট করা যাবে না।</span>
                                                </li>
                                                <li className="flex items-start gap-1">
                                                    <span className="font-bold">•</span>
                                                    <span>উত্তর সম্পূর্ণ গোল ঘরের ভিতর ভরাট করতে হবে।</span>
                                                </li>
                                                <li className="flex items-start gap-1">
                                                    <span className="font-bold">•</span>
                                                    <span>উত্তর ঘষা বা কেটে পরিবর্তন করা যাবে না।</span>
                                                </li>
                                                <li className="flex items-start gap-1">
                                                    <span className="font-bold">•</span>
                                                    <span>ময়লা বা দাগযুক্ত OMR Sheet বাতিল বলে গণ্য হবে।</span>
                                                </li>
                                                <li className="flex items-start gap-1">
                                                    <span className="font-bold">•</span>
                                                    <span>OMR Sheet ভাঁজ, ছেঁড়া বা ক্ষতিগ্রস্ত করা যাবে না।</span>
                                                </li>
                                                <li className="flex items-start gap-1">
                                                    <span className="font-bold">•</span>
                                                    <span>নির্দেশনা ভঙ্গ করলে পরীক্ষার্থীকে বহিষ্কার করা হতে পারে।</span>
                                                </li>
                                                <li className="flex items-start gap-1">
                                                    <span className="font-bold">•</span>
                                                    <span>মূল্যবান OMR Sheet পরীক্ষার শেষ না হওয়া পর্যন্ত জমা রাখুন।</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Omer;