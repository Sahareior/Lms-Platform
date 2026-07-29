import React, { useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  BarChart3,
  Heart,
  CheckCircle,
  BookOpen,
  Clock,
  RefreshCw,
  Flag,
  Share2,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CustomModal from "../../../../reusable/CustomModal";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  stats: {
    totalAttempts: number;
    correctPercentage: number;
    averageTime: string;
    difficulty: "Easy" | "Medium" | "Hard";
  };
}

interface ModalState {
  isOpen: boolean;
  type: "answer" | "statistics" | "explanation" | "bookmark";
  questionIndex: number;
}

const questions: Question[] = [
  {
    id: 71,
    question:
      "কোন মুসলিম চিন্তাবিদ প্রথম দ্বি-জাতি তত্ত্ব সম্পর্কে স্পষ্ট ধারণা দেন?",
    options: [
      "আল্লামা ইকবাল",
      "সৈয়দ আহমদ খান",
      "মোহাম্মদ আলী জিন্নাহ",
      "মওলানা আকরম খাঁ",
    ],
    correctAnswer: 0,
    explanation:
      "আল্লামা ইকবাল ১৯৩০ সালের এলাহাবাদ ভাষণে প্রথম দ্বি-জাতি তত্ত্বের স্পষ্ট ধারণা দেন। তিনি বলেন, ভারতের মুসলমানরা একটি পৃথক জাতি এবং তাদের জন্য পৃথক রাষ্ট্র প্রয়োজন। পরবর্তীতে এই তত্ত্বই পাকিস্তান আন্দোলনের ভিত্তি হিসেবে কাজ করে।",
    stats: {
      totalAttempts: 4523,
      correctPercentage: 68,
      averageTime: "32 sec",
      difficulty: "Medium",
    },
  },
  {
    id: 72,
    question:
      "কোন বছর পাকিস্তান সরকার বাংলাকে অন্যতম রাষ্ট্রভাষা হিসেবে স্বীকৃতি দেয়?",
    options: ["১৯৫২", "১৯৫৪", "১৯৫৬", "১৯৬৯"],
    correctAnswer: 2,
    explanation:
      "১৯৫৬ সালের সংবিধানে বাংলাকে পাকিস্তানের অন্যতম রাষ্ট্রভাষা হিসেবে স্বীকৃতি দেওয়া হয়। এর আগে ১৯৫২ সালের ভাষা আন্দোলনের পর ১৯৫৪ সালে যুক্তফ্রন্ট নির্বাচনে জয়লাভ করে এবং ১৯৫৬ সালে সংবিধানে বাংলা ভাষাকে রাষ্ট্রভাষার মর্যাদা দেওয়া হয়।",
    stats: {
      totalAttempts: 5891,
      correctPercentage: 72,
      averageTime: "28 sec",
      difficulty: "Easy",
    },
  },
  {
    id: 73,
    question:
      "'তমদ্দুন মজলিস'-এর নেতা আবুল কাসেম ঢাকা বিশ্ববিদ্যালয়ের কোন বিষয়ের শিক্ষক ছিলেন?",
    options: [
      "রসায়ন বিজ্ঞান",
      "পদার্থ বিজ্ঞান",
      "গণিত",
      "বাংলা",
    ],
    correctAnswer: 0,
    explanation:
      "আবুল কাসেম ঢাকা বিশ্ববিদ্যালয়ের রসায়ন বিজ্ঞান বিভাগের অধ্যাপক ছিলেন। তিনি 'তমদ্দুন মজলিস' প্রতিষ্ঠা করেন যা ছিল একটি সাংস্কৃতিক ও রাজনৈতিক সংগঠন। এই সংগঠন ভাষা আন্দোলনে গুরুত্বপূর্ণ ভূমিকা পালন করে এবং বাংলা ভাষার মর্যাদা রক্ষায় কাজ করে।",
    stats: {
      totalAttempts: 2156,
      correctPercentage: 43,
      averageTime: "45 sec",
      difficulty: "Hard",
    },
  },
];

const letters = ["ক", "খ", "গ", "ঘ"];
const totalQuestions = questions.length;

export default function ExamDin() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [bookmarked, setBookmarked] = useState<Record<number, boolean>>({});
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    type: "answer",
    questionIndex: 0,
  });
  const [isTopicOpen, setIsTopicOpen] = useState(false);

  const topics = [
    "বাংলাদেশ বিষয়াবলী",
    "বাংলা সাহিত্য",
    "ইংরেজি",
    "গণিত",
    "বিজ্ঞান",
    "সামাজিক বিজ্ঞান",
  ];
  const [selectedTopic, setSelectedTopic] = useState(topics[0]);

  const openModal = (type: ModalState["type"], questionIndex: number) => {
    setModalState({ isOpen: true, type, questionIndex });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const toggleBookmark = (questionId: number) => {
    setBookmarked((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const getAnsweredCount = () => Object.keys(selected).length;

  const getQuestionState = (qId: number) => {
    const isAnswered = selected[qId] !== undefined;
    const isCorrect =
      isAnswered &&
      selected[qId] === questions.find((q) => q.id === qId)?.correctAnswer;
    const isWrong = isAnswered && !isCorrect;
    return { isAnswered, isCorrect, isWrong };
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F5F7FA]">
      {/* ── HEADER ── */}
      <div className="sticky top-0 z-30 bg-[#111318] border-b border-[#23262D]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Top Row */}
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-[#161920] text-[#A1A8B3] hover:text-[#F5F7FA] transition"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="text-sm font-semibold text-[#A1A8B3]">Quiz Mode</div>

            <div className="w-8" /> {/* spacer for symmetry */}
          </div>

          {/* Topic dropdown & progress */}
          <div className="flex items-center justify-between pb-4 gap-4">
            <div className="relative">
              <button
                onClick={() => setIsTopicOpen(!isTopicOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#23262D] bg-[#111318] hover:bg-[#161920] text-[#A1A8B3] hover:text-[#F5F7FA] transition"
              >
                <span className="text-sm font-medium">{selectedTopic}</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${isTopicOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isTopicOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 rounded-lg border border-[#23262D] bg-[#111318] shadow-lg z-50">
                  {topics.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => {
                        setSelectedTopic(topic);
                        setIsTopicOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition ${
                        selectedTopic === topic
                          ? "bg-[#9B51E0]/10 text-[#9B51E0] font-semibold border-l-2 border-[#9B51E0]"
                          : "text-[#A1A8B3] hover:bg-[#161920] hover:text-[#F5F7FA]"
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="text-sm text-[#A1A8B3]">
              {getAnsweredCount()}/{totalQuestions} answered
            </div>
          </div>

          {/* Progress bar */}
          <div className="pb-4">
            <div className="flex gap-1">
              {questions.map((q) => {
                const { isAnswered, isCorrect } = getQuestionState(q.id);
                return (
                  <div
                    key={q.id}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      isAnswered
                        ? isCorrect
                          ? "bg-[#00E5B3]"
                          : "bg-[#EB5757]"
                        : "bg-[#23262D]"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── QUESTIONS ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {questions.map((q, qIdx) => {
          const { isAnswered, isCorrect, isWrong } = getQuestionState(q.id);
          const isSelected = selected[q.id] !== undefined;
          const isBookmarked = bookmarked[q.id];

          return (
            <div
              key={q.id}
              className="relative bg-[#111318] border border-[#23262D] rounded-2xl shadow-sm"
            >
              <div className="px-4 py-1 text-xs font-semibold text-[#9B51E0]">
                Question {q.id}
              </div>

              <div className="p-6 sm:p-8 pt-4">
                <h2 className="font-semibold text-lg leading-7 mb-6 text-[#F5F7FA]">
                  {q.question}
                </h2>

                {/* Options */}
                <div className="space-y-3 mb-6">
                  {q.options.map((option, i) => {
                    const isOptionSelected = selected[q.id] === i;
                    const isCorrectOption = q.correctAnswer === i && isSelected;

                    return (
                      <label
                        key={i}
                        className={`relative flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                          isCorrectOption
                            ? "bg-[#00E5B3]/10 border-[#00E5B3]"
                            : isOptionSelected && isWrong
                            ? "bg-[#EB5757]/10 border-[#EB5757]"
                            : isOptionSelected
                            ? "bg-[#9B51E0]/10 border-[#9B51E0]"
                            : "bg-[#161920] border-[#23262D] hover:border-[#323742]"
                        } ${isSelected ? "pointer-events-none" : ""}`}
                      >
                        <input
                          type="radio"
                          className="hidden"
                          name={`q-${q.id}`}
                          checked={isOptionSelected}
                          onChange={() =>
                            setSelected({ ...selected, [q.id]: i })
                          }
                        />

                        {/* Letter circle */}
                        <div
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-semibold shrink-0 transition-colors ${
                            isCorrectOption
                              ? "bg-[#00E5B3] border-[#00E5B3] text-black"
                              : isOptionSelected && isWrong
                              ? "bg-[#EB5757] border-[#EB5757] text-white"
                              : isOptionSelected
                              ? "bg-[#9B51E0] border-[#9B51E0] text-white"
                              : "bg-[#161920] border-[#23262D] text-[#A1A8B3]"
                          }`}
                        >
                          {letters[i]}
                        </div>

                        <span
                          className={`text-base font-medium flex-1 ${
                            isCorrectOption
                              ? "text-[#00E5B3]"
                              : isOptionSelected && isWrong
                              ? "text-[#EB5757]"
                              : isOptionSelected
                              ? "text-[#F5F7FA]"
                              : "text-[#A1A8B3]"
                          }`}
                        >
                          {option}
                        </span>

                        {isCorrectOption && (
                          <CheckCircle className="text-[#00E5B3]" size={20} />
                        )}
                        {isOptionSelected && isWrong && (
                          <AlertCircle className="text-[#EB5757]" size={20} />
                        )}
                      </label>
                    );
                  })}
                </div>

                {/* Action buttons */}
                <div className="pt-5 border-t border-[#23262D]">
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "উত্তর", icon: CheckCircle, type: "answer" as const },
                      { label: "পরিসংখ্যান", icon: BarChart3, type: "statistics" as const },
                      { label: "ব্যাখ্যা", icon: BookOpen, type: "explanation" as const },
                    ].map(({ label, icon: Icon, type }) => (
                      <button
                        key={type}
                        onClick={() => openModal(type, qIdx)}
                        className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg hover:bg-[#161920] text-[#A1A8B3] hover:text-[#F5F7FA] transition border border-transparent hover:border-[#23262D]"
                      >
                        <Icon size={16} />
                        <span className="text-[11px] font-semibold">{label}</span>
                      </button>
                    ))}

                    <button
                      onClick={() => toggleBookmark(q.id)}
                      className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg transition border ${
                        isBookmarked
                          ? "bg-[#9B51E0]/10 border-[#9B51E0] text-[#9B51E0]"
                          : "border-transparent hover:bg-[#161920] hover:border-[#23262D] text-[#A1A8B3] hover:text-[#F5F7FA]"
                      }`}
                    >
                      <Heart
                        size={16}
                        fill={isBookmarked ? "currentColor" : "none"}
                      />
                      <span className="text-[11px] font-semibold">
                        {isBookmarked ? "সংরক্ষিত" : "বুকমার্ক"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── BOTTOM ACTION BAR ── */}
      <div className="sticky bottom-0 z-30 bg-[#111318] border-t border-[#23262D]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-[#A1A8B3]">
            <Flag size={14} />
            <span>
              {getAnsweredCount()} of {totalQuestions} answered
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#161920] text-[#A1A8B3] border border-[#23262D] hover:bg-[#1C1F26] hover:text-[#F5F7FA] transition">
              <RefreshCw size={14} />
              Reset
            </button>
            <button className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#9B51E0] hover:bg-[#7E3CC4] transition active:scale-95 shadow-[0_0_15px_-3px_rgba(155,81,224,0.4)]">
              <Share2 size={14} />
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* ── MODAL ── */}
      <CustomModal
        setIsModalOpen={closeModal}
        isModalOpen={modalState.isOpen}
        modalType={modalState.type}
        questionData={questions[modalState.questionIndex]}
        letterLabels={letters}
      />
    </div>
  );
}