import React, { useState, useMemo } from "react";
import {
  FiArrowLeft,
  FiMoon,
  FiChevronDown,
  FiBarChart2,
  FiHeart,
  FiCheckCircle,
  FiBookOpen,
  FiClock,
  FiRefreshCw,
  FiFlag,
  FiShare2,
  FiAlertCircle,
  FiSun,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import CustomModal from "../../../../reusable/CustomModal";

// Theme and color utilities
const colors = {
  light: {
    bg: "bg-white",
    bgHover: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-700",
    textSecondary: "text-gray-500",
    accent: "bg-blue-600",
    accentBorder: "border-blue-300",
  },
  dark: {
    bg: "bg-slate-800",
    bgHover: "bg-slate-700",
    border: "border-slate-700",
    text: "text-slate-100",
    textSecondary: "text-slate-400",
    accent: "bg-blue-600",
    accentBorder: "border-blue-500",
  },
};

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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isTopicOpen, setIsTopicOpen] = useState(false);
  
  // Available topics
  const topics = [
    "বাংলাদেশ বিষয়াবলী",
    "বাংলা সাহিত্য",
    "ইংরেজি",
    "গণিত",
    "বিজ্ঞান",
    "সামাজিক বিজ্ঞান",
  ];
  
  const [selectedTopic, setSelectedTopic] = useState(topics[0]);

  // Memoize theme colors
  const theme = useMemo(() => (isDarkMode ? colors.dark : colors.light), [isDarkMode]);

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
    const isCorrect = isAnswered && selected[qId] === questions.find(q => q.id === qId)?.correctAnswer;
    const isWrong = isAnswered && !isCorrect;
    return { isAnswered, isCorrect, isWrong };
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-slate-900" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-30 transition-colors duration-300 ${
          isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
        } border-b`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Top Row */}
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? "hover:bg-slate-700 text-slate-300" : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <FiArrowLeft size={20} />
            </button>

            <div className={`text-sm font-semibold ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>
              Quiz Mode
            </div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? "hover:bg-slate-700 text-slate-300" : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              {isDarkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
          </div>

          {/* Progress & Topic Row */}
          <div className="flex items-center justify-between pb-4 gap-4">
            <div className="relative">
              <button
                onClick={() => setIsTopicOpen(!isTopicOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors border ${
                  isDarkMode
                    ? "border-slate-600 hover:bg-slate-700 text-slate-300"
                    : "border-gray-300 hover:bg-gray-100 text-gray-600"
                }`}
              >
                <span className="text-sm font-medium">{selectedTopic}</span>
                <FiChevronDown size={16} className={`transition-transform ${isTopicOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {isTopicOpen && (
                <div
                  className={`absolute top-full left-0 mt-2 w-48 rounded-lg border shadow-lg z-50 ${
                    isDarkMode
                      ? "bg-slate-800 border-slate-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  {topics.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => {
                        setSelectedTopic(topic);
                        setIsTopicOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 transition-colors text-sm ${
                        selectedTopic === topic
                          ? isDarkMode
                            ? "bg-blue-600/30 text-blue-400 font-semibold"
                            : "bg-blue-100 text-blue-700 font-semibold"
                          : isDarkMode
                          ? "hover:bg-slate-700 text-slate-300"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className={`${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                {getAnsweredCount()}/{totalQuestions} answered
              </div>
             
            </div>
          </div>

          {/* Progress Bar */}
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
                          ? "bg-green-600"
                          : "bg-red-600"
                        : isDarkMode
                        ? "bg-slate-700"
                        : "bg-gray-300"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {questions.map((q, qIdx) => {
          const { isAnswered, isCorrect, isWrong } = getQuestionState(q.id);
          const isSelected = selected[q.id] !== undefined;
          const isBookmarked = bookmarked[q.id];

          return (
            <div
              key={q.id}
              className={`relative border rounded-lg transition-colors ${
                isDarkMode ? `${theme.bg} border-slate-700` : `${theme.bg} border-gray-200`
              } shadow-sm`}
            >
              {/* Question Badge */}
              <div className={`px-4 py-1 text-xs font-semibold ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>
                Question {q.id}
              </div>

              <div className="p-6 sm:p-8 pt-4">
                {/* Question Title */}
                <h2
                  className={`font-semibold text-lg leading-7 mb-6 ${
                    isDarkMode ? "text-slate-100" : "text-gray-800"
                  }`}
                >
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
                        className={`relative flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all border-2 ${
                          isCorrectOption
                            ? "bg-green-50 border-green-400"
                            : isOptionSelected && isWrong
                            ? "bg-red-50 border-red-400"
                            : isOptionSelected
                            ? `${isDarkMode ? "bg-slate-700 border-blue-500" : "bg-blue-50 border-blue-300"}`
                            : isDarkMode
                            ? "border-slate-700 bg-slate-700/40 hover:bg-slate-700/60"
                            : "border-gray-200 bg-gray-100/50 hover:bg-gray-50"
                        } ${isSelected ? "pointer-events-none" : ""}`}
                      >
                        <input
                          type="radio"
                          className="hidden"
                          name={`q-${q.id}`}
                          checked={isOptionSelected}
                          onChange={() =>
                            setSelected({
                              ...selected,
                              [q.id]: i,
                            })
                          }
                        />

                        {/* Letter Circle */}
                        <div
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-semibold shrink-0 transition-colors ${
                            isCorrectOption
                              ? "bg-green-500 border-green-500 text-white"
                              : isOptionSelected && isWrong
                              ? "bg-red-500 border-red-500 text-white"
                              : isOptionSelected
                              ? "bg-blue-500 border-blue-500 text-white"
                              : isDarkMode
                              ? "border-slate-600 text-slate-400 bg-slate-600/30"
                              : "border-gray-300 text-gray-600 bg-white"
                          }`}
                        >
                          {letters[i]}
                        </div>

                        {/* Option Text */}
                        <span
                          className={`text-base font-medium flex-1 ${
                            isCorrectOption
                              ? "text-green-700"
                              : isOptionSelected && isWrong
                              ? "text-red-700"
                              : isOptionSelected
                              ? isDarkMode ? "text-slate-100" : "text-blue-700"
                              : isDarkMode
                              ? "text-slate-300"
                              : "text-gray-700"
                          }`}
                        >
                          {option}
                        </span>

                        {/* Icons */}
                        {isCorrectOption && (
                          <FiCheckCircle className="text-green-600" size={20} />
                        )}
                        {isOptionSelected && isWrong && (
                          <FiAlertCircle className="text-red-600" size={20} />
                        )}
                      </label>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className={`pt-5 border-t ${isDarkMode ? "border-slate-700" : "border-gray-200"}`}>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "উত্তর", icon: FiCheckCircle, type: "answer" },
                      { label: "পরিসংখ্যান", icon: FiBarChart2, type: "statistics" },
                      { label: "ব্যাখ্যা", icon: FiBookOpen, type: "explanation" },
                    ].map(({ label, icon: Icon, type }) => (
                      <button
                        key={type}
                        onClick={() => openModal(type as any, qIdx)}
                        className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg transition-colors border-2 border-transparent ${
                          isDarkMode
                            ? "hover:bg-slate-700 text-slate-400 hover:text-slate-300"
                            : "hover:bg-blue-50 text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <Icon size={16} />
                        <span className="text-[11px] font-semibold">{label}</span>
                      </button>
                    ))}

                    {/* Bookmark Button */}
                    <button
                      onClick={() => toggleBookmark(q.id)}
                      className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg transition-colors border-2 ${
                        isBookmarked
                          ? `${isDarkMode ? "bg-slate-700 border-blue-500" : "bg-blue-50 border-blue-300"} text-blue-600`
                          : isDarkMode
                          ? "hover:bg-slate-700 text-slate-400 hover:text-slate-300 border-transparent"
                          : "hover:bg-blue-50 text-gray-500 hover:text-gray-700 border-transparent"
                      }`}
                    >
                      <FiHeart size={16} fill={isBookmarked ? "currentColor" : "none"} />
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

      {/* Bottom Action Bar */}
      <div
        className={`sticky bottom-0 z-30 border-t transition-colors ${
          isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className={`flex items-center gap-3 text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
            <FiFlag size={14} />
            <span>
              {getAnsweredCount()} of {totalQuestions} answered
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDarkMode
                  ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              <FiRefreshCw size={14} />
              Reset
            </button>
            <button className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${theme.accent} hover:bg-blue-700 active:scale-95`}>
              <FiShare2 size={14} />
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
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