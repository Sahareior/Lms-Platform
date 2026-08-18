// ─── Sticky progress bar under the quiz header ─────────────
export default function QuizProgressBar({
  answeredCount,
  totalQuestions,
  progressPercentage,
  error,
}: {
  answeredCount: number;
  totalQuestions: number;
  progressPercentage: number;
  error: string | null;
}) {
  return (
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
  );
}
