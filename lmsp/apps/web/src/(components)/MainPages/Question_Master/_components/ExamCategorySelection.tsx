import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import {
  Award,
  TrendingUp,
  BookOpen,
  UserCheck,
  Zap,
  Clipboard,
  ChevronRight,
  Star,
} from "lucide-react";

interface ExamCategory {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: ReactNode;
  color: string; // BrainForge semantic colour
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
    icon: <Award size={28} />,
    color: "#2F80ED", // Electric Blue – brand primary
    examCount: 12,
    popularity: 98,
  },
  {
    id: "bank",
    title: "Bank Job",
    subtitle: "ব্যাংক জব",
    description:
      "সোনালী, জনতা, অগ্রণী, ব্যাংকিং ক্যাডার ও অন্যান্য ব্যাংকের নিয়োগ পরীক্ষার প্রস্তুতি।",
    icon: <TrendingUp size={28} />,
    color: "#F2C94C", // Gold – finance/prosperity
    examCount: 8,
    popularity: 95,
  },
  {
    id: "ssc",
    title: "SSC",
    subtitle: "এসএসসি পরীক্ষা",
    description:
      "মাধ্যমিক স্কুল সার্টিফিকেট পরীক্ষার জন্য মডেল টেস্ট ও প্রশ্নব্যাংক।",
    icon: <BookOpen size={28} />,
    color: "#00E5B3", // Teal – growth/learning
    examCount: 15,
    popularity: 92,
  },
  {
    id: "hsc",
    title: "HSC",
    subtitle: "এইচএসসি পরীক্ষা",
    description:
      "উচ্চ মাধ্যমিক সার্টিফিকেট পরীক্ষার জন্য বিশেষায়িত মডেল টেস্ট ও সমাধান।",
    icon: <Clipboard size={28} />,
    color: "#9B51E0", // Purple – exam identity
    examCount: 10,
    popularity: 90,
  },
  {
    id: "teacher",
    title: "Primary Teacher",
    subtitle: "প্রাথমিক শিক্ষক",
    description:
      "প্রাথমিক শিক্ষক নিবন্ধন পরীক্ষার জন্য পূর্ণাঙ্গ প্রস্তুতি ও মডেল টেস্ট।",
    icon: <UserCheck size={28} />,
    color: "#EB5757", // Red – energy/urgency
    examCount: 6,
    popularity: 93,
  },
  {
    id: "govt",
    title: "Govt Job",
    subtitle: "সরকারি চাকরি",
    description:
      "পল্লী বিদ্যুৎ, পোস্টাল, কাস্টমস ও অন্যান্য সরকারি চাকরির প্রস্তুতি।",
    icon: <Zap size={28} />,
    color: "#00C8FF", // Cyan – authority/official
    examCount: 9,
    popularity: 87,
  },
];

export default function ExamCategorySelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F5F7FA]">
      {/* Header */}
      <div className="bg-[#111318]/95 backdrop-blur-xl border-b border-[#23262D] sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 bg-[#9B51E0]/10 text-[#9B51E0] text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-4 border border-[#9B51E0]/30">
              <Star size={11} />
              <span>Question Center</span>
              <Star size={11} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
              Select Your Exam
            </h1>
            <p className="text-[#A1A8B3] text-sm max-w-xl mx-auto">
              Choose your target exam to access curated question banks, model tests, and past papers.
            </p>
          </div>
        </div>
      </div>

      {/* Category Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => {
            const { color } = cat;
            return (
              <button
                key={cat.id}
                onClick={() => navigate(`/question-center/${cat.id}`)}
                className="group relative bg-[#111318] rounded-2xl border border-[#23262D] hover:border-[#9B51E0]/50 hover:shadow-[0_0_20px_-5px_rgba(155,81,224,0.3)] transition-all duration-300 overflow-hidden text-left active:scale-[0.98]"
              >
                {/* Top accent bar */}
                <div
                  className="h-1.5 w-full transition-all duration-300 group-hover:h-2"
                  style={{ backgroundColor: color }}
                />

                <div className="p-5">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: `${color}1A`, // 10% opacity
                      border: `1px solid ${color}4D`, // 30% opacity
                      color: color,
                    }}
                  >
                    {cat.icon}
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="font-bold text-lg text-[#F5F7FA] mb-1">
                    {cat.title}
                  </h3>
                  <p className="text-xs font-medium text-[#A1A8B3] mb-3">
                    {cat.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-sm text-[#A1A8B3] leading-relaxed mb-4 line-clamp-2">
                    {cat.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#23262D]">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-medium text-[#6B7280]">
                        {cat.examCount} exams
                      </span>
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${color}1A`,
                          color: color,
                          border: `1px solid ${color}4D`,
                        }}
                      >
                        {cat.popularity}% match
                      </span>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-[#6B7280] group-hover:text-[#F5F7FA] group-hover:translate-x-0.5 transition-all"
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