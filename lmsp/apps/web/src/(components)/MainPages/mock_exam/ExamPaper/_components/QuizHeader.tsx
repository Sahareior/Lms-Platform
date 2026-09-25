import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import { formatTime } from "./quizTypes";
import { useTheme } from "../../../../../theme/ThemeContext";


interface QuizHeaderProps {
  examName: string;
  versionName: string;
  totalQuestions: number;
  timeLeft: number;
  isSubmitted: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

// ─── Sticky quiz header (back, title, timer, submit) ────────
export default function QuizHeader({
  examName,
  versionName,
  totalQuestions,
  timeLeft,
  isSubmitted,
  onBack,
  onSubmit,
}: QuizHeaderProps) {
  const { isDark } = useTheme();

  // ─── LIGHT MODE (Vintage Paper Style) ───────────────────────
  if (!isDark) {
    const isLowTime = timeLeft < 300;
    return (
      <header className="sticky -top-1 z-40 bg-[#f2efe9] border-b border-[#d8d4cb] px-4 md:px-8 py-3 flex justify-between items-center shadow-[0_3px_0px_0px_#1a1a1a]">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-[#e0dcd5] rounded-md transition text-[#4a4a4a] hover:text-[#1a1a1a]"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="hidden sm:flex items-center gap-2">
            <div className="bg-[#1a1a1a] text-[#f2efe9] p-1.5 rounded-md">
              <BookOpen size={20} />
            </div>
            <span className="font-black text-lg tracking-tight font-serif text-[#1a1a1a]">{examName || "Quiz"}</span>
          </div>
        </div>
        <div className="hidden md:block text-center">
          <span className="text-xs font-bold text-[#4a4a4a] font-serif italic">
            {versionName || ""} &bull; {totalQuestions} Questions
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border-2 font-serif ${
              isLowTime
                ? "bg-[#f2efe9] border-[#b91c1c] text-[#b91c1c] shadow-[2px_2px_0px_0px_#b91c1c]"
                : "bg-[#f2efe9] border-[#1a1a1a] text-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]"
            }`}
          >
            <Clock size={16} />
            <span className="text-sm font-mono font-black">{formatTime(timeLeft)}</span>
          </div>
          {!isSubmitted && (
            <button
              onClick={onSubmit}
              className="bg-[#1a1a1a] hover:bg-[#333] text-[#f2efe9] px-6 py-2 rounded-md font-black text-sm font-serif transition-all shadow-[2px_2px_0px_0px_#b91c1c] hover:shadow-[3px_3px_0px_0px_#b91c1c] active:scale-95"
            >
              সাবমিট
            </button>
          )}
        </div>
      </header>
    );
  }

  // ─── DARK MODE (Original Code - Unchanged) ─────────────────
  return (
    <header className="sticky -top-1 z-40 bg-[#111318]/95 backdrop-blur-sm border-b border-[#23262D] px-4 md:px-8 py-3 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-[#161920] rounded-lg transition text-[#A1A8B3] hover:text-[#F5F7FA]"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="hidden sm:flex items-center gap-2">
          <div className="bg-[#9B51E0] text-white p-1.5 rounded-lg">
            <BookOpen size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight">{examName || "Quiz"}</span>
        </div>
      </div>
      <div className="hidden md:block text-center">
        <span className="text-xs font-semibold text-[#A1A8B3]">
          {versionName || ""} &bull; {totalQuestions} Questions
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
            onClick={onSubmit}
            className="bg-[#9B51E0] hover:bg-[#7E3CC4] text-white px-6 py-2 rounded-full font-bold text-sm transition-all shadow-[0_0_15px_-3px_rgba(155,81,224,0.4)] active:scale-95"
          >
            সাবমিট
          </button>
        )}
      </div>
    </header>
  );
}