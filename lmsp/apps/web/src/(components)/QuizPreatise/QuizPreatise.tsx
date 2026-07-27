import React, { useState } from "react";
import { FiMenu, FiChevronDown, FiClock, FiCheckCircle, FiX, FiBookOpen } from "react-icons/fi";

// --- Types ---
interface Question {
  question: string;
  options: string[];
  correctAnswer?: number;
}

interface EducationalExamDinProps {
  questions?: Question[];
}

// --- Mock Data ---
const BCS_SUBJECTS = [
  { id: "bangla", name: "বাংলা", icon: "📖" },
  { id: "english", name: "ইংরেজি", icon: "🌍" },
  { id: "math", name: "গণিত", icon: "📐" },
  { id: "gk", name: "সাধারণ জ্ঞান", icon: "📜" },
  { id: "bangladesh_affairs", name: "বাংলাদেশ বিষয়াবলী", icon: "🇧🇩" },
  { id: "mental_ability", name: "মানসিক দক্ষতা", icon: "🧠" },
];

const defaultQuestions: Question[] = [
  {
    question: "পরিবার থেকে শিক্ষা অর্জন - আশানুরূপ 'ই' এর ব্যবহারিক পরিচয় কী?",
    options: ["উৎসব", "প্রত্যয়", "যাত্রা", "বন্ধন"],
  },
  {
    question: "আহমদ শরীফের মতে মধ্যযুগে চণ্ডীদাস নামে কতজন কবি ছিলেন?",
    options: ["২ জন", "৩ জন", "৪ জন", "৫ জন"],
  },
  {
    question: "'স্মৃতি' শব্দের সন্ধি বিচ্ছেদ কোনটি?",
    options: ["স্মৃতি + অ", "স্মৃতি + ঈ", "স্মৃতি + উ", "স্মৃতি + এ"],
  },
  {
    question: "বাংলা ভাষায় মৌলিক স্বরধ্বনি কয়টি?",
    options: ["৭টি", "৮টি", "৯টি", "১০টি"],
  },
];

// --- Main Component ---
const EducationalExamDin: React.FC<EducationalExamDinProps> = ({ questions = defaultQuestions }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState("বাংলাদেশ বিষয়াবলী");
  const [timeLeft] = useState("০৪:০৯:৩৩");

  // Statistics
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const handleAnswerSelect = (qIndex: number, oIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIndex]: oIndex,
    }));
  };

  const handleSubmit = () => {
    const unanswered = totalQuestions - answeredCount;
    if (unanswered > 0) {
      alert(`আপনি ${unanswered} টি প্রশ্নের উত্তর দেননি। অনুগ্রহ করে সবগুলো প্রশ্নের উত্তর দিন।`);
      return;
    }
    alert("আপনার উত্তর সফলভাবে সাবমিট করা হয়েছে। শুভ কামনা!");
  };

  // Helper to generate Bengla letters (ক, খ, গ, ঘ)
  const getBengaliLetter = (index: number) => {
    const letters = ['ক', 'খ', 'গ', 'ঘ'];
    return letters[index] || '?';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-12">
      
      {/* ═══════════ TOP NAVBAR ═══════════ */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-slate-200 shadow-sm px-4 md:px-8 py-3 flex justify-between items-center">
        {/* Left: Brand & Menu */}
        <div className="flex items-center gap-4">
       
          <div className="hidden sm:flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <FiBookOpen className="text-xl" />
            </div>
            <span className="font-bold text-slate-800 text-lg tracking-tight">BCS প্রস্তুতি</span>
          </div>
        </div>

        {/* Center: Subject Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsSubjectOpen(!isSubjectOpen)}
            className="flex items-center gap-2 px-5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-all text-slate-700 font-medium text-sm"
          >
            <span className="text-base mr-1">📚</span>
            {currentSubject}
            <FiChevronDown className={`ml-1 transition-transform duration-200 ${isSubjectOpen ? 'rotate-180' : ''}`} />
          </button>

          {isSubjectOpen && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
              <div className="py-1.5 px-4 bg-slate-50 border-b border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">বিষয় নির্বাচন করুন</span>
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {BCS_SUBJECTS.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setCurrentSubject(sub.name);
                      setIsSubjectOpen(false);
                    }}
                    className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${
                      currentSubject === sub.name ? 'text-blue-700 bg-blue-50/50 font-medium' : 'text-slate-700'
                    }`}
                  >
                    <span>{sub.icon}</span>
                    <span>{sub.name}</span>
                    {currentSubject === sub.name && <span className="ml-auto text-blue-600 text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Timer & Submit */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
            <FiClock className="text-amber-600 text-sm" />
            <span className="text-sm font-mono font-bold text-amber-700">{timeLeft}</span>
          </div>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-semibold text-sm transition-all shadow-md shadow-blue-600/20 active:scale-95"
          >
            সাবমিট
          </button>
        </div>
      </header>

      {/* ═══════════ PROGRESS BAR ═══════════ */}
      <div className="sticky top-[68px] z-30 bg-white/80 backdrop-blur-sm px-4 md:px-8 py-2 border-b border-slate-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
            অগ্রগতি: {answeredCount}/{totalQuestions}
          </span>
          <div className="h-2.5 bg-slate-100 rounded-full flex-1 max-w-md">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-xs font-bold text-blue-600 whitespace-nowrap w-10 text-right">
            {Math.round(progressPercentage)}%
          </span>
        </div>
      </div>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <main className="max-w-3xl mx-auto px-4 md:px-6 mt-8 space-y-6 pb-16">
        
        {questions.map((q, index) => {
          const selected = selectedAnswers[index];
          return (
            <div
              key={index}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)] transition-shadow duration-300"
            >
              {/* Question Header */}
              <div className="flex items-center gap-2 mb-5">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center border border-slate-200">
                  {index + 1}
                </span>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                  MCQ
                </span>
              </div>

              {/* Question Text */}
              <h3 className="text-base font-medium leading-relaxed text-slate-800 mb-6">
                {q.question}
              </h3>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {q.options.map((opt, optIndex) => {
                  const isSelected = selected === optIndex;
                  return (
                    <button
                      key={optIndex}
                      onClick={() => handleAnswerSelect(index, optIndex)}
                      className={`group flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        isSelected
                          ? "border-blue-500 bg-blue-50/50 shadow-[0_0_0_1px_rgba(59,130,246,0.2)]"
                          : "border-slate-100 hover:border-blue-300 hover:bg-slate-50/70"
                      }`}
                    >
                      {/* Bengali Radio Circle */}
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                            : "bg-white text-slate-500 border-slate-300 group-hover:border-blue-400 group-hover:text-blue-500"
                        }`}
                      >
                        {getBengaliLetter(optIndex)}
                      </div>

                      <span className={`text-[15px] ${isSelected ? "text-blue-800 font-medium" : "text-slate-700"}`}>
                        {opt}
                      </span>
                      
                      {isSelected && (
                        <FiCheckCircle className="ml-auto text-blue-600 text-lg flex-shrink-0 animate-in fade-in zoom-in duration-200" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Little status indicator for answered questions */}
              {selected !== undefined && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    <FiCheckCircle className="text-emerald-500" />
                    উত্তর সংরক্ষিত
                  </span>
                </div>
              )}
            </div>
          );
        })}
        
        {questions.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
            <p className="text-slate-400 text-base">এই বিষয়ে এখনো কোনো প্রশ্ন যোগ করা হয়নি।</p>
          </div>
        )}

      </main>
    </div>
  );
};

export default EducationalExamDin;