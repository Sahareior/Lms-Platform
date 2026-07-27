import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import {
  FiAward,
  FiTrendingUp,
  FiBookOpen,
  FiUserCheck,
  FiZap,
  FiClipboard,
  FiChevronRight,
  FiStar,
} from "react-icons/fi";

interface ExamCategory {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: ReactNode;
  gradient: string;
  badgeColor: string;
  examCount: number;
  popularity: number;
}

const categories: ExamCategory[] = [
  {
    id: "bcs",
    title: "BCS",
    subtitle: "বিসিএস প্রিলিমিনারি",
    description:
      "বাংলাদেশ সিভিল সার্ভিসের প্রিলিমিনারি ও লিখিত পরীক্ষার জন্য সম্পূর্ণ প্রস্তুতি।",
    icon: <FiAward size={28} />,
    gradient: "from-blue-600 via-blue-500 to-indigo-400",
    badgeColor: "bg-blue-100 text-blue-700",
    examCount: 12,
    popularity: 98,
  },
  {
    id: "bank",
    title: "Bank Job",
    subtitle: "ব্যাংক জব",
    description:
      "সোনালী, জনতা, অগ্রণী, ব্যাংকিং ক্যাডার ও অন্যান্য ব্যাংকের নিয়োগ পরীক্ষার প্রস্তুতি।",
    icon: <FiTrendingUp size={28} />,
    gradient: "from-amber-500 via-amber-400 to-orange-300",
    badgeColor: "bg-amber-100 text-amber-700",
    examCount: 8,
    popularity: 95,
  },
  {
    id: "ssc",
    title: "SSC",
    subtitle: "এসএসসি পরীক্ষা",
    description: "মাধ্যমিক স্কুল সার্টিফিকেট পরীক্ষার জন্য মডেল টেস্ট ও প্রশ্নব্যাংক।",
    icon: <FiBookOpen size={28} />,
    gradient: "from-emerald-500 via-emerald-400 to-teal-300",
    badgeColor: "bg-emerald-100 text-emerald-700",
    examCount: 15,
    popularity: 92,
  },
  {
    id: "hsc",
    title: "HSC",
    subtitle: "এইচএসসি পরীক্ষা",
    description: "উচ্চ মাধ্যমিক সার্টিফিকেট পরীক্ষার জন্য বিশেষায়িত মডেল টেস্ট ও সমাধান।",
    icon: <FiClipboard size={28} />,
    gradient: "from-violet-500 via-violet-400 to-purple-300",
    badgeColor: "bg-violet-100 text-violet-700",
    examCount: 10,
    popularity: 90,
  },
  {
    id: "teacher",
    title: "Primary Teacher",
    subtitle: "প্রাথমিক শিক্ষক",
    description:
      "প্রাথমিক শিক্ষক নিবন্ধন পরীক্ষার জন্য পূর্ণাঙ্গ প্রস্তুতি ও মডেল টেস্ট।",
    icon: <FiUserCheck size={28} />,
    gradient: "from-rose-500 via-rose-400 to-pink-300",
    badgeColor: "bg-rose-100 text-rose-700",
    examCount: 6,
    popularity: 93,
  },
  {
    id: "govt",
    title: "Govt Job",
    subtitle: "সরকারি চাকরি",
    description:
      "পল্লী বিদ্যুৎ, পোস্টাল, কাস্টমস ও অন্যান্য সরকারি চাকরির প্রস্তুতি।",
    icon: <FiZap size={28} />,
    gradient: "from-cyan-500 via-cyan-400 to-sky-300",
    badgeColor: "bg-cyan-100 text-cyan-700",
    examCount: 9,
    popularity: 87,
  },
];

const colorPairs = [
  { bg: "from-blue-100 to-indigo-100", text: "text-blue-600" },
  { bg: "from-amber-100 to-orange-100", text: "text-amber-600" },
  { bg: "from-emerald-100 to-teal-100", text: "text-emerald-600" },
  { bg: "from-violet-100 to-purple-100", text: "text-violet-600" },
  { bg: "from-rose-100 to-pink-100", text: "text-rose-600" },
  { bg: "from-cyan-100 to-sky-100", text: "text-cyan-600" },
];

export default function ExamCategorySelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-4 border border-indigo-200/60">
              <FiStar size={11} />
              <span>Question Center</span>
              <FiStar size={11} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
              Select Your Exam
            </h1>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              Choose your target exam to access curated question banks, model tests, and past papers.
            </p>
          </div>
        </div>
      </div>

      {/* Category Grid */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat, index) => {
            const colors = colorPairs[index % colorPairs.length];
            return (
              <button
                key={cat.id}
                onClick={() => navigate(`/question-center/${cat.id}`)}
                className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden text-left active:scale-[0.98]"
              >
                {/* Top Gradient Bar */}
                <div
                  className={`h-1.5 w-full bg-gradient-to-r ${cat.gradient} transition-all duration-300 group-hover:h-2`}
                />

                <div className="p-5">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center ${colors.text} mb-4 transition-transform duration-300 group-hover:scale-110`}
                  >
                    {cat.icon}
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="font-bold text-lg text-slate-800 mb-1">
                    {cat.title}
                  </h3>
                  <p className="text-xs font-medium text-indigo-600 mb-3">
                    {cat.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">
                    {cat.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-medium text-slate-400">
                        {cat.examCount} exams
                      </span>
                      <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {cat.popularity}% match
                      </span>
                    </div>
                    <FiChevronRight
                      size={16}
                      className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all"
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
