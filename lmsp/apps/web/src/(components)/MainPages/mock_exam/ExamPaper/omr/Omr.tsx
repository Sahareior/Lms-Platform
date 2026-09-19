import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, useBlocker } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Send, Clock, AlertCircle, Loader2 } from 'lucide-react';
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
} from '@my-monorepo/store';
import { emitXpGained, emitLevelUp } from '../../../../../gamification/GamificationToast';
import { usePostUserQuizsMutation } from '@my-monorepo/store/src/redux/api/userPerformanceApi';
import type { RecordMistakeQuestion } from '@my-monorepo/store';
import FormattedQuestion from '../_components/FormattedQuestion.tsx';
import {
    computeLocalScore,
    buildLocalReview,
} from '../_components/quizTypes.ts';
import type { QuestionItem, QuizResultData } from '../_components/quizTypes.ts';
import {
    QuizLoading,
    NoExamSelected,
    NoQuestionsAvailable,
} from '../_components/QuizStates.tsx';
import type { ExamPaperProps } from '../ExamPaper.tsx';
import { useExamSecurity } from '../examSecurity/useExamSecurity.ts';
import Watermark from '../examSecurity/Watermark.tsx';
import { useTheme } from '../../../../../theme/ThemeContext.tsx';


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
    const { isDark } = useTheme();

    const userId = useAppSelector((state) => state.user.user?._id) || '';

    const { data: userPerformance } = useGetUserPerformanceQuery(
        { userId, type: 'mockExam' },
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
            if (scheduleId) return attemptScheduleId === String(scheduleId);
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
    const { data: examVersions } = useGetExamVersionsByExamQuery(examId, { skip: !examId });
    const { data: scheduleExams } = useGetScheduleExamsByExamQuery(examId, { skip: !examId });
    const { data: scheduleQuestionsData, isLoading: scheduleQuestionsLoading } =
        useGetScheduleExamQuestionsQuery(scheduleId, { skip: !scheduleId });
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
    const [completeAttempt, { isLoading: isCompleting }] = useCompleteAttemptMutation();
    const [postUserQuizs] = usePostUserQuizsMutation();
    const [recordMistakes] = useRecordMistakesMutation();
    const { data: tempSubmission } = useGetTempExamSubmissionQuery(
        { userId, examId, versionId: versionId || undefined, scheduleExamId: scheduleId || undefined, board: board || undefined },
        { skip: !userId || !examId }
    );
    const [saveTempExamSubmission] = useSaveTempExamSubmissionMutation();
    const [deleteTempExamSubmission] = useDeleteTempExamSubmissionMutation();
    const [recordQuestionStats] = useRecordQuestionStatsMutation();

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
        (typeof schedule?.examVersion === 'object'
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

    const [mobileTab, setMobileTab] = useState<'questions' | 'omr'>('questions');
    const [selectedExam, setSelectedExam] = useState<string>('ssc');
    const [rollDigits, setRollDigits] = useState<string[]>(['', '', '', '', '', '']);
    const [candidateName, setCandidateName] = useState<string>('');
    const [subjectDigits, setSubjectDigits] = useState<(number | null)[]>([null, null, null, null, null]);
    const [paperCode, setPaperCode] = useState<number | null>(null);
    const [extraDigits, setExtraDigits] = useState<(number | null)[]>([null, null, null, null, null]);
    const [setDigits, setSetDigits] = useState<(number | null)[]>([null, null]);

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
    const [timeLeft, setTimeLeft] = useState<number>(restoredTimeLeft ?? 7200);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const { data: activeAttempt } = useGetActiveAttemptQuery(
        { userId, examId: examId || undefined, scheduleExamId: scheduleId || undefined, versionId: versionId || undefined },
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
        if (restoredTimeLeft === null) setTimeLeft(durationSeconds);
    }, [durationSeconds, isSubmitted, scheduleExams, restoredTimeLeft]);

    useEffect(() => {
        if (isSubmitted || isSubmitting || submitInFlightRef.current || attemptsLoading) return;
        if (hasCompletedAttempt) navigate('/mock-exam', { replace: true });
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
                    type: 'practice',
                    source: 'mock_exam',
                    totalQuestions: allQuestions.length,
                    board: board || undefined,
                }).unwrap();
                attemptIdRef.current = result._id;
                startTimeRef.current = Date.now();
                setError(null);
                try {
                    localStorage.setItem(timerStorageKey, JSON.stringify({ savedAt: Date.now(), timeLeft: durationSeconds }));
                } catch { /* ignore */ }
            } catch (err: any) {
                if (err?.status === 409 || err?.data?.message?.includes('already completed')) {
                    navigate('/mock-exam', { replace: true });
                } else {
                    const msg = err instanceof Error ? err.message : 'Failed to start attempt';
                    console.error('Failed to start attempt:', msg);
                    setError('Could not save progress to server — scores shown locally only.');
                }
            }
        };
        initAttempt();
    }, [examId, versionId, userId, allQuestions.length, startAttempt, navigate, hasCompletedAttempt, attemptsLoading, board, scheduleId, durationSeconds, timerStorageKey]);

    useEffect(() => {
        if (!tempSubmission || isSubmitted) return;
        if (tempSubmission.attemptId && !attemptIdRef.current) attemptIdRef.current = tempSubmission.attemptId;
        if (tempSubmission.selectedAnswers && Object.keys(tempSubmission.selectedAnswers).length > 0) {
            setSelectedAnswers((prev) => {
                if (Object.keys(prev).length > 0) return prev;
                const restored: Record<number, number> = {};
                Object.entries(tempSubmission.selectedAnswers).forEach(([k, v]) => {
                    const qIdx = Number(k);
                    if (!isNaN(qIdx)) restored[qIdx] = Number(v);
                });
                return restored;
            });
        }
        if (tempSubmission.rollDigits && Array.isArray(tempSubmission.rollDigits) && tempSubmission.rollDigits.length > 0) setRollDigits(tempSubmission.rollDigits);
        if (tempSubmission.candidateName) setCandidateName(tempSubmission.candidateName);
        if (tempSubmission.subjectDigits && Array.isArray(tempSubmission.subjectDigits)) setSubjectDigits(tempSubmission.subjectDigits);
        if (tempSubmission.paperCode !== undefined && tempSubmission.paperCode !== null) setPaperCode(tempSubmission.paperCode);
        if (tempSubmission.extraDigits && Array.isArray(tempSubmission.extraDigits)) setExtraDigits(tempSubmission.extraDigits);
        if (tempSubmission.setDigits && Array.isArray(tempSubmission.setDigits)) setSetDigits(tempSubmission.setDigits);
        if (typeof tempSubmission.timeLeft === 'number' && tempSubmission.timeLeft > 0 && restoredTimeLeft === null) setTimeLeft(tempSubmission.timeLeft);
    }, [tempSubmission, isSubmitted, restoredTimeLeft]);

    useEffect(() => {
        if (!activeAttempt?.questions || activeAttempt.questions.length === 0) return;
        if (Object.keys(selectedAnswers).length > 0) return;
        const restored: Record<number, number> = {};
        activeAttempt.questions.forEach((q: any) => {
            if (!q.selectedOption) return;
            const qIdx = allQuestions.findIndex((aq) => (aq.questionNumber || 0) === q.questionNumber);
            if (qIdx === -1) return;
            const optIdx = allQuestions[qIdx].optionKeys?.indexOf(q.selectedOption) ?? -1;
            if (optIdx >= 0) restored[qIdx] = optIdx;
        });
        if (Object.keys(restored).length > 0) setSelectedAnswers(restored);
    }, [activeAttempt, allQuestions, selectedAnswers]);

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
    }, [examId, versionId, durationSeconds, restoredTimeLeft]);

    const persistTempProgress = useCallback(
        (answersMap: Record<number, number>, overrides: Record<string, any> = {}) => {
            if (!userId || !examId || isSubmitted || isSubmitting) return;
            const submittedList = Object.entries(answersMap).map(([idxStr, optIdx]) => {
                const q = allQuestions[Number(idxStr)];
                return {
                    questionId: q?.id,
                    questionNumber: q?.questionNumber || Number(idxStr) + 1,
                    selectedOption: q?.optionKeys?.[optIdx] ?? q?.options[optIdx] ?? '',
                    selectedIndex: optIdx,
                };
            });
            saveTempExamSubmission({
                userId, examId,
                examVersionId: versionId || undefined,
                scheduleExamId: scheduleId || undefined,
                board: board || undefined,
                paperType: 'Type1',
                selectedAnswers: answersMap,
                submittedAnswers: submittedList,
                timeLeft,
                attemptId: attemptIdRef.current || undefined,
                ...overrides,
            }).catch((err) => { console.warn('Temporary exam submission save failed:', err); });
        },
        [userId, examId, isSubmitted, isSubmitting, allQuestions, versionId, scheduleId, board, timeLeft, saveTempExamSubmission]
    );

    const handleAnswerSelect = useCallback(
        (qIndex: number, oIndex: number) => {
            if (isSubmitted || isSubmitting) return;
            const qItem = allQuestions[qIndex];
            if (!qItem) return;
            if (selectedAnswers[qIndex] !== undefined) return;
            if (!questionStartTimes.current[qIndex]) questionStartTimes.current[qIndex] = Date.now();

            setSelectedAnswers((prev) => {
                if (prev[qIndex] !== undefined) return prev;
                const updated = { ...prev, [qIndex]: oIndex };
                const optionKey = qItem.optionKeys?.[oIndex] ?? qItem.options[oIndex] ?? '';
                const attemptId = attemptIdRef.current;
                if (attemptId && userId) {
                    const qNumber = qItem.questionNumber || qIndex + 1;
                    const timeTaken = Math.round((Date.now() - questionStartTimes.current[qIndex]) / 1000);
                    saveAnswer({ attemptId, questionNumber: qNumber, selectedOption: optionKey, timeTaken: Math.max(1, timeTaken) })
                        .catch((err) => { console.warn('Auto-save failed:', err); });
                }
                persistTempProgress(updated);
                if (userId && qItem.id && examId) {
                    postUserQuizs({
                        user: userId, exam: examId,
                        examVersion: effectiveVersionId || null, subject: null,
                        submittedQuestions: [{ question: qItem.id, providedAnswer: qItem.optionKeys?.[oIndex] ?? '' }],
                    }).unwrap().catch((err) => { console.warn('Failed to save quiz performance:', err); });
                }
                if (qItem.id) {
                    const isCorr = oIndex === qItem.correctAnswer;
                    recordQuestionStats({
                        questionId: String(qItem.id),
                        isCorrect: isCorr,
                        selectedOption: qItem.optionKeys?.[oIndex] ?? String(oIndex),
                    }).catch((err) => { console.warn('Failed to record question stat in OMR:', err); });
                }
                return updated;
            });
        },
        [isSubmitted, isSubmitting, userId, allQuestions, saveAnswer, postUserQuizs, recordQuestionStats, selectedAnswers, persistTempProgress, examId, effectiveVersionId]
    );

    const handleSubmit = useCallback(
        async (auto = false) => {
            if (isSubmitted || isCompleting || isSubmitting) return;
            if (submitInFlightRef.current) return;
            submitInFlightRef.current = true;

            const unanswered = totalQuestions - answeredCount;
            if (!auto && unanswered > 0) {
                if (!window.confirm(`আপনি ${unanswered} টি প্রশ্নের উত্তর দেননি। তবুও সাবমিট করবেন?`)) {
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
                                selectedOption: selIdx !== undefined ? (q.optionKeys?.[selIdx] ?? q.options[selIdx] ?? '') : null,
                                timeTaken: startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : 1,
                            };
                        }),
                    }).unwrap();
                    await completeAttempt({ attemptId }).unwrap().then((res) => {
                        const gm = res?.gamification;
                        if (gm && gm.xpAwarded > 0) {
                            emitXpGained({
                                xpAwarded: gm.xpAwarded, level: gm.level,
                                xpIntoLevel: gm.xpIntoLevel, xpForNextLevel: gm.xpForNextLevel,
                                progress: gm.progress, currentStreak: gm.currentStreak, source: 'mock_exam',
                            });
                            if (gm.levelUp) {
                                emitLevelUp({ level: gm.level, xpIntoLevel: gm.xpIntoLevel, xpForNextLevel: gm.xpForNextLevel });
                            }
                        }
                    });
                }

                if (userId && examId) {
                    const answeredSubmissions = allQuestions
                        .map((q, idx) => {
                            const selIdx = selectedAnswers[idx];
                            if (selIdx === undefined || !q.id) return null;
                            return { question: q.id, providedAnswer: q.optionKeys?.[selIdx] ?? '' };
                        })
                        .filter(Boolean);
                    if (answeredSubmissions.length > 0) {
                        await postUserQuizs({
                            user: userId, exam: examId,
                            examVersion: effectiveVersionId || null, subject: null,
                            submittedQuestions: answeredSubmissions,
                        }).unwrap().catch((err) => { console.warn('Bulk quiz performance save failed:', err); });
                    }
                    const wrongMistakes = allQuestions
                        .map((q, idx) => {
                            const selIdx = selectedAnswers[idx];
                            if (selIdx === undefined || !q.id) return null;
                            if (selIdx === q.correctAnswer) return null;
                            return {
                                questionId: String(q.id),
                                questionText: q.question || '',
                                options: Object.fromEntries((q.optionKeys ?? []).map((k, oi) => [k, q.options[oi] ?? ''])),
                                correctAnswer: q.optionKeys?.[q.correctAnswer ?? -1] ?? null,
                                lastWrongAnswer: q.optionKeys?.[selIdx] ?? null,
                                exam: examId, examName: currentExam?.name || '',
                            } as RecordMistakeQuestion;
                        })
                        .filter(Boolean) as RecordMistakeQuestion[];
                    if (wrongMistakes.length > 0) {
                        recordMistakes({ questions: wrongMistakes }).catch((err) => { console.warn('Failed to add mistakes to notebook:', err); });
                    }
                }
                if (userId && examId) {
                    await deleteTempExamSubmission({
                        userId, examId,
                        versionId: versionId || undefined,
                        scheduleExamId: scheduleId || undefined,
                        board: board || undefined,
                    }).unwrap().catch((err) => { console.warn('Failed to delete temp exam submission:', err); });
                }
            } catch (err) {
                console.error('Failed to persist attempt to server:', err);
            } finally {
                const qs = new URLSearchParams({
                    examName: result.examName, versionName: result.versionName, title: result.title,
                    correct: String(result.correctCount), incorrect: String(result.incorrectCount),
                    unanswered: String(result.unansweredCount), total: String(result.totalQuestions),
                    percentage: String(result.percentage), score: String(result.score),
                    timeTaken: String(result.timeTaken), duration: String(result.durationSeconds),
                }).toString();
                navigate(`/mock-exam/result?${qs}`, { state: result, replace: true });
            }
        },
        [isSubmitted, isCompleting, isSubmitting, totalQuestions, answeredCount, allQuestions, selectedAnswers,
         completeAttempt, batchSaveAnswers, deleteTempExamSubmission, postUserQuizs, userId, examId, versionId,
         board, timerStorageKey, durationSeconds, timeLeft, currentExam, currentVersion, schedule, navigate, scheduleId, effectiveVersionId]
    );

    useEffect(() => {
        if (timeLeft === 0 && !isSubmitted && totalQuestions > 0) handleSubmit(true);
    }, [timeLeft, isSubmitted, totalQuestions, handleSubmit]);

    const handleRollChange = (index: number, val: string) => {
        const digit = val.replace(/\D/g, '').slice(-1);
        const updated = [...rollDigits];
        updated[index] = digit;
        setRollDigits(updated);
        persistTempProgress(selectedAnswers, { rollDigits: updated });
    };

    const toggleSubjectDigit = (col: number, digit: number) => {
        setSubjectDigits((prev) => {
            const next = [...prev];
            next[col] = next[col] === digit ? null : digit;
            persistTempProgress(selectedAnswers, { subjectDigits: next });
            return next;
        });
    };

    const togglePaperCode = (digit: number) => {
        setPaperCode((prev) => {
            const next = prev === digit ? null : digit;
            persistTempProgress(selectedAnswers, { paperCode: next });
            return next;
        });
    };

    const toggleExtraDigit = (col: number, digit: number) => {
        setExtraDigits((prev) => {
            const next = [...prev];
            next[col] = next[col] === digit ? null : digit;
            persistTempProgress(selectedAnswers, { extraDigits: next });
            return next;
        });
    };

    const toggleSetDigit = (col: number, digit: number) => {
        setSetDigits((prev) => {
            const next = [...prev];
            next[col] = next[col] === digit ? null : digit;
            persistTempProgress(selectedAnswers, { setDigits: next });
            return next;
        });
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

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
                localStorage.setItem(timerStorageKey, JSON.stringify({ savedAt: Date.now(), timeLeft }));
            } catch { /* ignore */ }
        };
        const onVisibilityChange = () => { if (document.visibilityState === 'hidden') saveTimerSnapshot(); };
        const onBeforeUnload = () => { saveTimerSnapshot(); };
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

    useEffect(() => {
        if (blocker.state !== 'blocked') return;
        Swal.fire({
            title: 'Leave Exam?',
            text: 'Leaving will submit your current answers and finish the exam.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#9B51E0',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Submit & finish now',
            cancelButtonText: 'Stay in exam',
        }).then((result) => {
            if (result.isConfirmed) {
                blocker.reset();
                handleSubmit(false);
            } else {
                blocker.reset();
            }
        });
    }, [blocker, handleSubmit]);

    if (attemptsLoading || questionsLoading || isStarting) {
        return <QuizLoading loadingQuestions={questionsLoading || attemptsLoading} />;
    }

    if (!examId) {
        return <NoExamSelected onBack={() => navigate('/mock-exam')} />;
    }

    if (allQuestions.length === 0) {
        return <NoQuestionsAvailable onBack={() => navigate('/mock-exam')} />;
    }

    /* ────────────────────────────────────────────────────────────
       THEME TOKENS
    ──────────────────────────────────────────────────────────── */
    const chrome = isDark
        ? {
            pageBg: '#1c1f26',
            panelBg: '#111318',
            panelBorder: '#2e333d',
            innerBg: '#1e222b',
            innerBorder: '#2e333d',
            hoverBg: '#2c3345',
            textPrimary: '#ffffff',
            textSecondary: '#9CA3AF',
            textMuted: '#6B7280',
            progressTrack: '#2a2f3d',
            progressFill: '#10b981',
            timerBg: '#1e222b',
            timerBorder: '#2e333d',
            timerText: '#10b981',
            timerDangerBg: 'rgba(76, 5, 25, 0.7)',
            timerDangerBorder: 'rgba(220, 38, 38, 0.5)',
            timerDangerText: '#fb7185',
            optionBg: '#222734',
            optionBorder: '#373e4f',
            optionText: '#d1d5db',
            optionSelectedBg: '#059669',
            optionSelectedBorder: '#10b981',
            optionSelectedText: '#ffffff',
            questionCardBg: '#1e222b',
            questionCardBorder: '#2e333d',
            questionCardActiveBorder: 'rgba(16, 185, 129, 0.5)',
            questionCardActiveBg: '#1e272b',
            numBadgeActiveBg: '#059669',
            numBadgeActiveText: '#ffffff',
            numBadgeBg: '#2a2f3d',
            numBadgeText: '#d1d5db',
            submitBtnBg: '#059669',
            submitBtnHover: '#10b981',
            submitBtnText: '#ffffff',
            errorBg: 'rgba(69, 26, 3, 0.8)',
            errorBorder: 'rgba(217, 119, 6, 0.5)',
            errorText: '#fde68a',
        }
        : {
            pageBg: '#e8e4db',
            panelBg: '#f2efe9',
            panelBorder: '#1a1a1a',
            innerBg: '#e0dcd5',
            innerBorder: '#d8d4cb',
            hoverBg: '#e0dcd5',
            textPrimary: '#1a1a1a',
            textSecondary: '#333333',
            textMuted: '#4a4a4a',
            progressTrack: '#e0dcd5',
            progressFill: '#b91c1c',
            timerBg: '#f2efe9',
            timerBorder: '#1a1a1a',
            timerText: '#1a1a1a',
            timerDangerBg: '#f2efe9',
            timerDangerBorder: '#b91c1c',
            timerDangerText: '#b91c1c',
            optionBg: '#f2efe9',
            optionBorder: '#d8d4cb',
            optionText: '#333333',
            optionSelectedBg: '#1a1a1a',
            optionSelectedBorder: '#1a1a1a',
            optionSelectedText: '#f2efe9',
            questionCardBg: '#f2efe9',
            questionCardBorder: '#d8d4cb',
            questionCardActiveBorder: '#1a1a1a',
            questionCardActiveBg: '#f2efe9',
            numBadgeActiveBg: '#1a1a1a',
            numBadgeActiveText: '#f2efe9',
            numBadgeBg: '#e0dcd5',
            numBadgeText: '#333333',
            submitBtnBg: '#1a1a1a',
            submitBtnHover: '#333333',
            submitBtnText: '#f2efe9',
            errorBg: '#f2efe9',
            errorBorder: '#b91c1c',
            errorText: '#b91c1c',
        };

    return (
        <div
            className="min-h-screen py-4 sm:py-6 px-2 sm:px-4 font-sans print:bg-white print:p-0 relative"
            style={{
                backgroundColor: chrome.pageBg,
                color: chrome.textPrimary,
                ...(isDark ? {} : {
                    backgroundImage: 'radial-gradient(#d8d4cb 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                }),
            }}
        >
            {(isSubmitting || isCompleting) && (
                <div className="fixed inset-0 z-50 backdrop-blur-sm flex flex-col items-center justify-center gap-4" style={{ backgroundColor: isDark ? 'rgba(11,13,18,0.9)' : 'rgba(232,228,219,0.9)' }}>
                    <Loader2 className={`w-10 h-10 animate-spin ${isDark ? 'text-emerald-500' : 'text-[#b91c1c]'}`} />
                    <p className={`text-base sm:text-lg font-bold tracking-wide ${isDark ? 'text-white' : 'text-[#1a1a1a] font-serif'}`}>
                        {isDark ? 'Submitting OMR sheet and finalizing results...' : 'OMR শিট সাবমিট হচ্ছে এবং ফলাফল প্রস্তুত হচ্ছে...'}
                    </p>
                </div>
            )}

            {/* ─── TOP CONTROLS ─── */}
            <div className="max-w-[1700px] mx-auto mb-4 sm:mb-5 print:hidden">
                <div
                    className={`rounded-xl p-3 sm:p-4 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 ${isDark ? '' : 'border-2 shadow-[3px_3px_0px_0px_#1a1a1a]'}`}
                    style={{
                        backgroundColor: chrome.panelBg,
                        borderColor: chrome.panelBorder,
                    }}
                >
                    <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4">
                        <div
                            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg ${isDark ? '' : 'border shadow-[1px_1px_0px_0px_#1a1a1a]'}`}
                            style={{ backgroundColor: chrome.innerBg, borderColor: chrome.innerBorder }}
                        >
                            <span
                                className={`text-[11px] sm:text-xs block ${isDark ? 'text-gray-400 font-medium' : 'font-serif font-bold'}`}
                                style={{ color: chrome.textSecondary }}
                            >
                                {isDark ? 'ভরাটকৃত উত্তর (Answered)' : 'ভরাটকৃত উত্তর'}
                            </span>
                            <span
                                className={`text-base sm:text-lg font-bold font-mono ${isDark ? 'text-white' : 'font-serif'}`}
                                style={{ color: chrome.textPrimary }}
                            >
                                {answeredCount} <span className={`text-xs font-normal ${isDark ? 'text-gray-400' : ''}`} style={{ color: chrome.textMuted }}>/ {totalQuestions}</span>
                            </span>
                        </div>

                        <div className="hidden md:block w-36 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: chrome.progressTrack }}>
                            <div
                                className="h-full transition-all duration-300 rounded-full"
                                style={{ width: `${progressPercentage}%`, backgroundColor: chrome.progressFill }}
                            />
                        </div>

                        <div
                            className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg font-mono font-bold text-xs sm:text-sm ${timeLeft < 300 ? 'animate-pulse' : ''} ${isDark ? '' : 'border shadow-[1px_1px_0px_0px_#1a1a1a]'}`}
                            style={{
                                backgroundColor: timeLeft < 300 ? chrome.timerDangerBg : chrome.timerBg,
                                borderColor: timeLeft < 300 ? chrome.timerDangerBorder : chrome.timerBorder,
                                color: timeLeft < 300 ? chrome.timerDangerText : chrome.timerText,
                                border: isDark ? '1px solid' : `1px solid ${timeLeft < 300 ? chrome.timerDangerBorder : chrome.timerBorder}`,
                            }}
                        >
                            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>{formatTime(timeLeft)}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleSubmit(false)}
                            disabled={isCompleting}
                            className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 text-xs rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${isDark ? 'font-semibold' : 'font-serif font-black border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#b91c1c] hover:shadow-[3px_3px_0px_0px_#b91c1c]'}`}
                            style={{
                                backgroundColor: isDark ? chrome.submitBtnBg : '#1a1a1a',
                                color: chrome.submitBtnText,
                            }}
                            onMouseEnter={(e) => { if (isDark) e.currentTarget.style.backgroundColor = chrome.submitBtnHover; }}
                            onMouseLeave={(e) => { if (isDark) e.currentTarget.style.backgroundColor = chrome.submitBtnBg; }}
                        >
                            {isCompleting ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Send className="w-3.5 h-3.5" />
                            )}
                            {isCompleting ? (isDark ? 'সাবমিট হচ্ছে...' : 'সাবমিট হচ্ছে...') : (isDark ? 'পরীক্ষা সম্পন্ন করুন (Submit)' : 'পরীক্ষা সম্পন্ন করুন')}
                        </button>
                    </div>
                </div>

                {error && (
                    <div
                        className={`mt-3 px-4 py-2.5 rounded-lg flex items-center gap-2 text-xs ${isDark ? '' : 'border-2 shadow-[2px_2px_0px_0px_#b91c1c] font-serif'}`}
                        style={{
                            backgroundColor: chrome.errorBg,
                            borderColor: chrome.errorBorder,
                            color: chrome.errorText,
                        }}
                    >
                        <AlertCircle className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-amber-400' : 'text-[#b91c1c]'}`} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Mobile Tab Switcher */}
                <div
                    className={`lg:hidden flex items-center justify-center p-1 rounded-xl mt-3 ${isDark ? '' : 'border-2 shadow-[2px_2px_0px_0px_#1a1a1a]'}`}
                    style={{ backgroundColor: chrome.panelBg, borderColor: chrome.panelBorder }}
                >
                    <button
                        type="button"
                        onClick={() => setMobileTab('questions')}
                        className={`flex-1 py-2 text-xs sm:text-sm rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            mobileTab === 'questions'
                                ? (isDark ? 'bg-emerald-600 text-white font-bold shadow-md' : 'bg-[#1a1a1a] text-[#f2efe9] font-serif font-black')
                                : (isDark ? 'text-gray-400 hover:text-white font-bold' : 'text-[#4a4a4a] hover:text-[#1a1a1a] font-serif font-bold')
                        }`}
                    >
                        <span>📝 প্রশ্নসমূহ ({answeredCount}/{totalQuestions})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setMobileTab('omr')}
                        className={`flex-1 py-2 text-xs sm:text-sm rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            mobileTab === 'omr'
                                ? (isDark ? 'bg-emerald-600 text-white font-bold shadow-md' : 'bg-[#1a1a1a] text-[#f2efe9] font-serif font-black')
                                : (isDark ? 'text-gray-400 hover:text-white font-bold' : 'text-[#4a4a4a] hover:text-[#1a1a1a] font-serif font-bold')
                        }`}
                    >
                        <span>📄 OMR শিট (OMR Sheet)</span>
                    </button>
                </div>
            </div>

            {/* ─── MAIN FLEX ROW ─── */}
            <div className="max-w-[96vw] mx-auto flex flex-col lg:flex-row gap-5">
                {/* ── LEFT: QUESTIONS ── */}
                <div className={`w-full lg:w-[500px] flex-shrink-0 ${mobileTab === 'questions' ? 'block' : 'hidden lg:block'}`}>
                    <div
                        className={`rounded-xl p-4 shadow-xl ${isDark ? '' : 'border-2 shadow-[3px_3px_0px_0px_#1a1a1a]'}`}
                        style={{ backgroundColor: chrome.panelBg, borderColor: chrome.panelBorder }}
                    >
                        <div
                            className={`flex items-center justify-between mb-3 pb-2 ${isDark ? 'border-b' : 'border-b-2'}`}
                            style={{ borderColor: chrome.panelBorder }}
                        >
                            <h2
                                className={`text-base ${isDark ? 'text-white font-bold' : 'font-serif font-black'}`}
                                style={{ color: chrome.textPrimary }}
                            >
                                {isDark ? 'প্রশ্নসমূহ (Questions)' : 'প্রশ্নসমূহ'}
                            </h2>
                            <span
                                className={`text-xs font-mono ${isDark ? 'text-gray-400' : 'font-serif font-bold'}`}
                                style={{ color: chrome.textSecondary }}
                            >
                                {answeredCount} / {totalQuestions} {isDark ? 'সম্পন্ন' : 'সম্পন্ন'}
                            </span>
                        </div>

                        <div className="space-y-3.5 h-[750px] overflow-y-auto pr-1.5 custom-scrollbar">
                            {allQuestions.map((q, qIndex) => {
                                const selectedOptIdx = selectedAnswers[qIndex];
                                const displayQNum = q.questionNumber || qIndex + 1;

                                return (
                                    <div
                                        key={q.id || qIndex}
                                        className={`rounded-lg p-3.5 transition-colors border-2`}
                                        style={{
                                            backgroundColor: chrome.questionCardBg,
                                            borderColor: selectedOptIdx !== undefined
                                                ? (isDark ? chrome.questionCardActiveBorder : '#1a1a1a')
                                                : chrome.questionCardBorder,
                                            boxShadow: isDark ? 'none' : (selectedOptIdx !== undefined
                                                ? '3px 3px 0px 0px #b91c1c'
                                                : '2px 2px 0px 0px #1a1a1a'),
                                        }}
                                    >
                                        {/* Question Header & Text */}
                                        <div className="flex items-start justify-center gap-2.5 mb-2.5">
                                            <span
                                                className="text-xs mt-1 font-bold px-2 py-0.5 rounded flex-shrink-0 font-mono"
                                                style={{
                                                    backgroundColor: selectedOptIdx !== undefined ? chrome.numBadgeActiveBg : chrome.numBadgeBg,
                                                    color: selectedOptIdx !== undefined ? chrome.numBadgeActiveText : chrome.numBadgeText,
                                                }}
                                            >
                                                {String(displayQNum).padStart(2, '0')}
                                            </span>

                                            <div className="flex-1 min-w-0">
                                                <div
                                                    className={`text-[16px] leading-relaxed ${isDark ? 'font-medium text-gray-200' : 'font-serif'}`}
                                                    style={{ color: isDark ? undefined : chrome.textPrimary }}
                                                >
                                                    <FormattedQuestion text={q.question} />
                                                </div>

                                                {q.scenarioText && (
                                                    <div
                                                        className={`mb-5 rounded-xl mt-5 p-4 ${isDark ? 'border border-[#9B51E0]/25 bg-[#9B51E0]/5' : 'border-2 border-[#1a1a1a] bg-[#e0dcd5] shadow-[2px_2px_0px_0px_#1a1a1a]'}`}
                                                    >
                                                        <p
                                                            className={`text-sm leading-relaxed whitespace-pre-line ${isDark ? 'text-[#C9D0DA]' : 'font-serif'}`}
                                                            style={{ color: isDark ? undefined : chrome.textPrimary }}
                                                        >
                                                            {q.scenarioText}
                                                        </p>
                                                    </div>
                                                )}

                                                {q.imageUrl && (
                                                    <img
                                                        src={q.imageUrl}
                                                        alt={`Question ${displayQNum}`}
                                                        className={`mt-2 max-h-36 rounded object-contain ${isDark ? 'border border-gray-700' : 'border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]'}`}
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
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[15px] text-left transition-all border-2`}
                                                        style={{
                                                            backgroundColor: isSelected ? chrome.optionSelectedBg : chrome.optionBg,
                                                            borderColor: isSelected ? chrome.optionSelectedBorder : chrome.optionBorder,
                                                            color: isSelected ? chrome.optionSelectedText : chrome.optionText,
                                                            boxShadow: isDark ? 'none' : (isSelected
                                                                ? '2px 2px 0px 0px #b91c1c'
                                                                : '1px 1px 0px 0px #1a1a1a'),
                                                            fontWeight: isDark ? 500 : (isSelected ? 900 : 700),
                                                            fontFamily: isDark ? undefined : 'serif',
                                                        }}
                                                    >
                                                        <span
                                                            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                                                            style={{
                                                                backgroundColor: isSelected
                                                                    ? (isDark ? '#ffffff' : '#f2efe9')
                                                                    : (isDark ? '#373e4f' : '#e0dcd5'),
                                                                color: isSelected
                                                                    ? (isDark ? '#059669' : '#1a1a1a')
                                                                    : (isDark ? '#d1d5db' : '#333333'),
                                                            }}
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

                {/* ── RIGHT: OMR SHEET (unchanged — always light) ── */}
                <div className={`flex-1 min-w-0 ${mobileTab === 'omr' ? 'block' : 'hidden lg:block'}`}>
                    <div
                        className={`lg:hidden text-xs mb-2 flex items-center justify-between px-1 ${isDark ? 'text-gray-400' : 'font-serif'}`}
                        style={{ color: isDark ? undefined : chrome.textSecondary }}
                    >
                        <span>👉 সম্পূর্ণ শিট দেখতে ডানে-বামে স্ক্রোল করুন</span>
                        <span
                            className={`font-mono font-bold ${isDark ? 'text-emerald-400' : ''}`}
                            style={{ color: isDark ? undefined : '#b91c1c' }}
                        >
                            {answeredCount}/{totalQuestions} ভরাটকৃত
                        </span>
                    </div>

                    <div className="overflow-x-auto pb-6 custom-scrollbar">
                        <div
                            id="omr-print-area"
                            className="relative w-[780px] min-w-[780px] bg-white text-black border-[2px] border-black p-4 sm:p-6 shadow-2xl select-none mx-auto"
                            style={{ fontFamily: '"Noto Sans Bengali", "Kalpurush", "SolaimanLipi", sans-serif' }}
                        >
                            {/* ... [OMR SHEET CONTENT — UNCHANGED FROM ORIGINAL] ... */}
                            {/* Keep every existing OMR sheet line exactly as-is. The sheet is intentionally 
                                always-white and has nothing theme-dependent. */}

                            {/* To keep this file complete, the OMR sheet content is included below unchanged: */}

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
                                <div className="text-center mb-1">
                                    <div className="inline-block bg-black text-white px-7 py-1 rounded-[4px] text-base sm:text-[17px] font-extrabold tracking-wider">
                                        SSC/HSC MCQ OMR Sheet
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-3 my-1.5">
                                    <BoardLogo className="w-11 h-11 flex-shrink-0" />
                                    <h1 className="text-lg sm:text-[22px] font-black tracking-tight text-center">
                                        মাধ্যমিক ও উচ্চমাধ্যমিক শিক্ষা বোর্ড, বাংলাদেশ
                                    </h1>
                                </div>

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
                                                    className={`w-4 h-4 border-[1.5px] border-black flex items-center justify-center text-[11px] font-bold ${selectedExam === exam.id ? 'bg-black text-white' : 'bg-white'}`}
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

                                <div className="mt-2.5 mb-3 border-[1.5px] border-black rounded-md px-2 py-1 text-center text-[10.5px] font-bold tracking-tight bg-gray-50/50">
                                    <span>নির্দেশাবলী: </span>
                                    <span className="font-semibold">১. কালো বল পেন ব্যবহার করুন</span>
                                    <span className="mx-1.5 font-normal">|</span>
                                    <span className="font-semibold">২. উত্তর সম্পূর্ণ গোল ঘরের ভিতর ভরাট করুন</span>
                                    <span className="mx-1.5 font-normal">|</span>
                                    <span className="font-semibold">৩. একাধিক উত্তর ভরাট করবেন না</span>
                                </div>

                                <div className="grid grid-cols-12 gap-2 sm:gap-3">
                                    {/* LEFT COLUMN: Q01-25 */}
                                    <div className="col-span-4 sm:col-span-3 border-[1.5px] border-black">
                                        <div className="grid grid-cols-[30px_1fr] border-b-[1.5px] border-black bg-gray-50 text-center font-black text-[10px] sm:text-[11px]">
                                            <div className="py-0.5 border-r-[1.5px] border-black flex items-center justify-center">
                                                প্রশ্ন<br />নং
                                            </div>
                                            <div className="py-0.5 flex items-center justify-center">উত্তর</div>
                                        </div>

                                        {Array.from({ length: 25 }, (_, i) => i).map((i) => {
                                            const slotNum = i + 1;
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

                                    {/* MIDDLE COLUMN: Q26-50 */}
                                    <div className="col-span-4 sm:col-span-3 border-[1.5px] border-black">
                                        <div className="grid grid-cols-[30px_1fr] border-b-[1.5px] border-black bg-gray-50 text-center font-black text-[10px] sm:text-[11px]">
                                            <div className="py-0.5 border-r-[1.5px] border-black flex items-center justify-center">
                                                প্রশ্ন<br />নং
                                            </div>
                                            <div className="py-0.5 flex items-center justify-center">উত্তর</div>
                                        </div>

                                        {Array.from({ length: 25 }, (_, i) => i).map((i) => {
                                            const slotNum = i + 26;
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

                                    {/* RIGHT SECTION: CODING MATRICES */}
                                    <div className="col-span-4 sm:col-span-6 flex flex-col justify-between pl-1">
                                        <div className="flex items-start gap-2">
                                            {/* বিষয় কোড */}
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

                                            {/* পত্র কোড */}
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

                                            {/* Signature Box */}
                                            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-gray-600 rounded-sm min-h-[195px] px-1 py-2">
                                                <div
                                                    className="text-[10px] font-bold text-gray-700 text-center tracking-tight"
                                                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                                                >
                                                    পরীক্ষার্থীর স্বাক্ষর (Signature of Candidate)
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2 mt-2">
                                            {/* অতিরিক্ত কোড */}
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

                                            {/* সেট কোড */}
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

                                        {/* INSTRUCTIONS */}
                                        <div className="mt-2.5 pt-1 text-left">
                                            <h3 className="font-bold text-[11px] mb-1 leading-tight text-black">
                                                বি. দ্র: নিচের কোনো নির্দেশনা ভঙ্গ করা যাবে না:
                                            </h3>
                                            <ul className="text-[9.5px] space-y-[2px] leading-tight text-gray-900 list-none pl-0">
                                                <li className="flex items-start gap-1"><span className="font-bold">•</span><span>উত্তর কালো বল পেন দিয়ে পূরণ করতে হবে। পেন্সিল ব্যবহার করা যাবে না।</span></li>
                                                <li className="flex items-start gap-1"><span className="font-bold">•</span><span>একাধিক উত্তর ভরাট করা যাবে না।</span></li>
                                                <li className="flex items-start gap-1"><span className="font-bold">•</span><span>উত্তর সম্পূর্ণ গোল ঘরের ভিতর ভরাট করতে হবে।</span></li>
                                                <li className="flex items-start gap-1"><span className="font-bold">•</span><span>উত্তর ঘষা বা কেটে পরিবর্তন করা যাবে না।</span></li>
                                                <li className="flex items-start gap-1"><span className="font-bold">•</span><span>ময়লা বা দাগযুক্ত OMR Sheet বাতিল বলে গণ্য হবে।</span></li>
                                                <li className="flex items-start gap-1"><span className="font-bold">•</span><span>OMR Sheet ভাঁজ, ছেঁড়া বা ক্ষতিগ্রস্ত করা যাবে না।</span></li>
                                                <li className="flex items-start gap-1"><span className="font-bold">•</span><span>নির্দেশনা ভঙ্গ করলে পরীক্ষার্থীকে বহিষ্কার করা হতে পারে।</span></li>
                                                <li className="flex items-start gap-1"><span className="font-bold">•</span><span>মূল্যবান OMR Sheet পরীক্ষার শেষ না হওয়া পর্যন্ত জমা রাখুন।</span></li>
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