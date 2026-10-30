import React from "react";
import { CheckCircle, X, BarChart3 } from "lucide-react";
import { getBengaliLetter } from "./quizTypes";
import type { QuestionItem } from "./quizTypes";
import FormattedQuestion from "./FormattedQuestion";
import { useTheme } from "../../../../../theme/ThemeContext";


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
  const { isDark } = useTheme();

  const isCorrect =
    isSubmitted && q.correctAnswer !== undefined && selected === q.correctAnswer;
  const isWrong =
    isSubmitted &&
    selected !== undefined &&
    q.correctAnswer !== undefined &&
    selected !== q.correctAnswer;
  const showCorrect = isSubmitted && q.correctAnswer !== undefined;

  // ─── LIGHT MODE (Vintage Paper Style) ───────────────────────
  if (!isDark) {
    return (
      <div
        className={`bg-[#f2efe9] border rounded-lg p-6 transition-all duration-300 shadow-[3px_3px_0px_0px_#1a1a1a] ${
          isSubmitted
            ? isCorrect
              ? "border-[#1a1a1a]"
              : isWrong
              ? "border-[#b91c1c]"
              : "border-[#d8d4cb]"
            : "border-[#d8d4cb] hover:shadow-[4px_4px_0px_0px_#1a1a1a] hover:-translate-y-0.5"
        }`}
        style={{
          backgroundImage: 'radial-gradient(#d8d4cb 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        {/* Question number and status */}
        <div className="flex items-center gap-2 mb-5 relative z-10">
          <span
            className={`flex-shrink-0 w-7 h-7 rounded-full text-xs font-black flex items-center justify-center border-2 font-serif ${
              isSubmitted && isCorrect
                ? "bg-[#1a1a1a] text-[#f2efe9] border-[#1a1a1a]"
                : isSubmitted && isWrong
                ? "bg-[#b91c1c] text-[#f2efe9] border-[#b91c1c]"
                : "bg-[#e0dcd5] text-[#1a1a1a] border-[#d8d4cb]"
            }`}
          >
            {index + 1}
          </span>
          <span className="text-[10px] font-bold text-[#4a4a4a] uppercase tracking-widest bg-[#e0dcd5] px-2 py-0.5 rounded border border-[#d8d4cb] font-serif">
            MCQ
          </span>
          {q.stats && q.stats.attempts > 0 && !isSubmitted && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border border-[#1a1a1a] bg-[#f2efe9] text-[#1a1a1a] font-serif">
              <BarChart3 size={10} />
              {q.stats.attempts}x &middot; {q.stats.successRate}%
            </span>
          )}
          {showCorrect && (
            <span
              className={`text-[15px] font-black px-2 py-0.5 rounded border font-serif ${
                isCorrect
                  ? "text-[#1a1a1a] bg-[#f2efe9] border-[#1a1a1a]"
                  : "text-[#b91c1c] bg-[#f2efe9] border-[#b91c1c]"
              }`}
            >
              {isCorrect ? "✓ Correct" : `✗ Correct: ${getBengaliLetter(q.correctAnswer!)}`}
            </span>
          )}
        </div>

        <div className="text-[21px] font-semibold leading-relaxed text-[#1a1a1a] mb-6 font-serif relative z-10">
          <FormattedQuestion text={q.question} />
        </div>

        {/* Scenario / passage text */}
        {q.scenarioText && (
          <div className="mb-5 rounded-md border border-[#d8d4cb] bg-[#e0dcd5] p-4 shadow-[1px_1px_0px_0px_#1a1a1a] relative z-10">
            <p className="text-xs font-black uppercase tracking-widest text-[#b91c1c] mb-2 font-serif">
              Scenario / Passage
            </p>
            <p className="text-[21px] font-semibold leading-relaxed text-[#1a1a1a] whitespace-pre-line font-serif">
              {q.scenarioText}
            </p>
          </div>
        )}

        {/* Question image */}
        {q.imageUrl && (
          <div className="mb-5 relative z-10">
            <img
              src={q.imageUrl}
              alt="Question diagram"
              className="max-w-full max-h-72 object-contain rounded-md border border-[#d8d4cb] bg-[#e0dcd5] shadow-[2px_2px_0px_0px_#1a1a1a]"
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
          {q.options.map((opt, optIndex) => {
            const isSelected = selected === optIndex;
            const isRightAnswer = showCorrect && q.correctAnswer === optIndex;
            let optionStyle = "border-[#d8d4cb] bg-[#f2efe9] hover:shadow-[2px_2px_0px_0px_#1a1a1a] shadow-[1px_1px_0px_0px_#1a1a1a]";

            if (isSubmitted) {
              if (isRightAnswer) optionStyle = "border-[#1a1a1a] bg-[#f2efe9] shadow-[2px_2px_0px_0px_#1a1a1a]";
              else if (isSelected && !isRightAnswer) optionStyle = "border-[#b91c1c] bg-[#f2efe9] shadow-[2px_2px_0px_0px_#b91c1c]";
              else optionStyle = "border-[#d8d4cb] bg-[#f2efe9] opacity-60 shadow-[1px_1px_0px_0px_#d8d4cb]";
            } else if (isSelected) {
              optionStyle = "border-[#1a1a1a] bg-[#f2efe9] shadow-[2px_2px_0px_0px_#b91c1c]";
            }

            return (
              <button
                key={optIndex}
                onClick={() => onSelect(index, optIndex)}
                disabled={isSubmitted}
                className={`group flex items-center gap-4 p-4 rounded-md border-2 transition-all duration-200 text-left ${optionStyle}`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all font-serif ${
                    isSubmitted && isRightAnswer
                      ? "bg-[#1a1a1a] text-[#f2efe9] border-[#1a1a1a]"
                      : isSubmitted && isSelected && !isRightAnswer
                      ? "bg-[#b91c1c] text-[#f2efe9] border-[#b91c1c]"
                      : isSelected
                      ? "bg-[#1a1a1a] text-[#f2efe9] border-[#1a1a1a]"
                      : "bg-[#e0dcd5] text-[#1a1a1a] border-[#d8d4cb] group-hover:border-[#1a1a1a]"
                  }`}
                >
                  {getBengaliLetter(optIndex)}
                </div>
                <span
                  className={`text-[18px] font-semibold font-serif ${
                    isSubmitted && isRightAnswer
                      ? "text-[#1a1a1a] font-bold"
                      : isSubmitted && isSelected && !isRightAnswer
                      ? "text-[#b91c1c] font-bold"
                      : isSelected
                      ? "text-[#1a1a1a] font-bold"
                      : "text-[#4a4a4a]"
                  }`}
                >
                  {opt}
                </span>
                {isSubmitted && isRightAnswer && (
                  <CheckCircle className="ml-auto text-[#1a1a1a] flex-shrink-0" size={20} />
                )}
                {isSubmitted && isSelected && !isRightAnswer && (
                  <X className="ml-auto text-[#b91c1c] flex-shrink-0" size={20} />
                )}
              </button>
            );
          })}
        </div>

        {selected !== undefined && !isSubmitted && (
          <div className="mt-4 pt-3 border-t border-[#d8d4cb] flex justify-end relative z-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1a1a1a] bg-[#e0dcd5] px-3 py-1 rounded-full border border-[#1a1a1a] font-serif">
              <CheckCircle size={12} /> উত্তর সংরক্ষিত
            </span>
          </div>
        )}
      </div>
    );
  }

  // ─── DARK MODE (Original Code - Unchanged) ─────────────────
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
            className={`text-[15px] font-bold px-2 py-0.5 rounded border ${
              isCorrect
                ? "text-[#00E5B3] bg-[#00E5B3]/10 border-[#00E5B3]/30"
                : "text-[#EB5757] bg-[#EB5757]/10 border-[#EB5757]/30"
            }`}
          >
            {isCorrect ? "✓ Correct" : `✗ Correct: ${getBengaliLetter(q.correctAnswer!)}`}
          </span>
        )}
      </div>

      <div className="text-[19px] font-medium leading-relaxed text-[#F5F7FA] mb-6">
        <FormattedQuestion text={q.question} />
      </div>

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

      {q.imageUrl && (
        <div className="mb-5">
          <img
            src={q.imageUrl}
            alt="Question diagram"
            className="max-w-full max-h-72 object-contain rounded-xl border border-[#23262D] bg-[#161920]"
          />
        </div>
      )}

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

export default QuestionCard;