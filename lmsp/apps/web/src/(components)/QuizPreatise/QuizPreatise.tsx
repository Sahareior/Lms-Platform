import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Clock,
  CheckCircle,
  X,
  BookOpen,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useGetExamsQuery,
  useGetQuestionsByExamQuery,
  useGetExamVersionsByExamQuery,
} from "@my-monorepo/store";

interface QuestionItem {
  question: string;
  options: string[];
  correctAnswer?: number;
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

  const { data: exams } = useGetExamsQuery();
  const { data: examVersions } = useGetExamVersionsByExamQuery(examId, {
    skip: !examId,
  });
  const { data: questionsData, isLoading: questionsLoading } =
    useGetQuestionsByExamQuery(
      { examId, versionId: versionId || undefined },
      { skip: !examId }
    );

  const currentExam = exams?.find((e: any) => e._id === examId);
  const currentVersion = examVersions?.find((v: any) => v._id === versionId);

  const allQuestions = useMemo(() => {
    if (!questionsData || questionsData.length === 0) return [];
    const flattened: QuestionItem[] = [];
    questionsData.forEach((doc: any) => {
      if (doc.data && Array.isArray(doc.data)) {
        const sorted = [...doc.data].sort(
          (a: any, b: any) => (a.question_number || 0) - (b.question_number || 0)
        );
        sorted.forEach((q: any) => {
          const opts = q.options
            ? (Object.values(q.options).filter((v: any) => v) as string[])
            : [];
          const correctIdx = q.correct_answer
            ? opts.findIndex((o: string) => o === q.correct_answer)
            : -1;
          flattened.push({
            question: q.question_text,
            options: opts,
            correctAnswer: correctIdx >= 0 ? correctIdx : undefined,
          });
        });
      }
    });
    return flattened;
  }, [questionsData]);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>(
    {}
  );
  const [timeLeft, setTimeLeft] = useState(7200);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const totalQuestions = allQuestions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercentage =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = useCallback(
    (qIndex: number, oIndex: number) => {
      if (isSubmitted) return;
      setSelectedAnswers((prev) => ({
        ...prev,
        [qIndex]: oIndex,
      }));
    },
    [isSubmitted]
  );

  const handleSubmit = useCallback(() => {
    if (isSubmitted) return;
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
  }, [isSubmitted, totalQuestions, answeredCount, allQuestions, selectedAnswers]);

  useEffect(() => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScore(0);
    setTimeLeft(7200);
  }, [examId, versionId]);

  if (questionsLoading) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-3xl text-[#9B51E0] mx-auto mb-4" />
          <p className="text-[#A1A8B3] font-medium">Loading questions...</p>
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
          <div className="max-w-3xl mx-auto flex items-center justify-between">
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
            <button
              onClick={() => navigate("/mock-exam")}
              className="text-xs font-semibold text-[#00E5B3] bg-[#00E5B3]/10 border border-[#00E5B3]/30 px-4 py-1.5 rounded-full hover:bg-[#00E5B3]/20 transition"
            >
              Back to Exams
            </button>
          </div>
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