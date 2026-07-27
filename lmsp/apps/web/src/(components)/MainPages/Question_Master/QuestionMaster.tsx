import { useMemo } from "react";
import {
  FiArrowLeft,
  FiClock,
  FiFileText,
  FiSearch,
  FiGrid,
} from "react-icons/fi";
import { Outlet, useParams, useNavigate, useLocation } from "react-router-dom";

interface Exam {
  id: number;
  date: string;
  title: string;
  marks: number;
  duration: string;
  description: string;
  status: string;
}

// Demo data grouped by exam category
const examDataByCategory: Record<string, { title: string; exams: Exam[] }> = {
  bcs: {
    title: "BCS Preliminary",
    exams: [
      {
        id: 1,
        date: "April 5, 2026",
        title: "বিসিএস জব সল্যুশন | ৫০ম - ৫৩তম বিসিএস",
        marks: 50,
        duration: "25 mins",
        description:
          "৫৩তম বিসিএস ভিত্তিক মানসিক ক্ষমতার মূল প্রশ্নের উপর লাইভ পরীক্ষা।",
        status: "Checked",
      },
      {
        id: 2,
        date: "April 20, 2026",
        title: "বিসিএস জব সল্যুশন | ৫০ম - ৫৩তম বিসিএস",
        marks: 150,
        duration: "55 mins",
        description:
          "৫০তম বিসিএস ভিত্তিক মানসিক ক্ষমতার মূল প্রশ্নের উপর লাইভ পরীক্ষা।",
        status: "Checked",
      },
      {
        id: 3,
        date: "Jan 31, 2026",
        title: "বিসিএস জব সল্যুশন | ৫০ম - ৫৩তম বিসিএস",
        marks: 200,
        duration: "90 mins",
        description:
          "৫০তম বিসিএস মূল প্রশ্নের উপর Live পরীক্ষা।",
        status: "Checked",
      },
    ],
  },
  bank: {
    title: "Bank Job",
    exams: [
      {
        id: 4,
        date: "March 15, 2026",
        title: "সোনালী ব্যাংক অফিসার (ক্যাশ) নিয়োগ পরীক্ষা",
        marks: 100,
        duration: "60 mins",
        description:
          "সোনালী ব্যাংকের ক্যাশ অফিসার পদে নিয়োগ পরীক্ষার মডেল টেস্ট।",
        status: "Checked",
      },
      {
        id: 5,
        date: "March 28, 2026",
        title: "জনতা ব্যাংক আইটি অফিসার নিয়োগ পরীক্ষা",
        marks: 120,
        duration: "75 mins",
        description:
          "জনতা ব্যাংকের আইটি অফিসার পদের জন্য বিশেষায়িত মডেল টেস্ট।",
        status: "Checked",
      },
      {
        id: 6,
        date: "Feb 10, 2026",
        title: "ব্যাংকিং ক্যাডার প্রিলিমিনারি টেস্ট",
        marks: 200,
        duration: "120 mins",
        description:
          "সব ধরনের ব্যাংকিং ক্যাডারের জন্য সাধারণ প্রিলিমিনারি মডেল টেস্ট।",
        status: "Checked",
      },
    ],
  },
  ssc: {
    title: "SSC Exam",
    exams: [
      {
        id: 7,
        date: "April 10, 2026",
        title: "এসএসসি গণিত মডেল টেস্ট ২০২৬",
        marks: 100,
        duration: "3 hrs",
        description:
          "এসএসসি পরীক্ষার্থীদের জন্য গণিত বিষয়ের পূর্ণাঙ্গ মডেল টেস্ট।",
        status: "Checked",
      },
    ],
  },
  hsc: {
    title: "HSC Exam",
    exams: [
      {
        id: 8,
        date: "April 15, 2026",
        title: "এইচএসসি পদার্থ বিজ্ঞান মডেল টেস্ট",
        marks: 100,
        duration: "3 hrs",
        description:
          "এইচএসসি পরীক্ষার্থীদের জন্য পদার্থ বিজ্ঞান বিষয়ের বিশেষ মডেল টেস্ট।",
        status: "Checked",
      },
    ],
  },
  teacher: {
    title: "Primary Teacher",
    exams: [
      {
        id: 9,
        date: "March 5, 2026",
        title: "প্রাথমিক শিক্ষক নিবন্ধন মডেল টেস্ট ২০২৬",
        marks: 100,
        duration: "2 hrs",
        description:
          "প্রাথমিক শিক্ষক নিবন্ধন পরীক্ষার জন্য পূর্ণাঙ্গ মডেল টেস্ট ও প্রস্তুতি।",
        status: "Checked",
      },
    ],
  },
  govt: {
    title: "Govt Job",
    exams: [
      {
        id: 10,
        date: "March 22, 2026",
        title: "পল্লী বিদ্যুৎ সহকারী প্রকৌশলী নিয়োগ পরীক্ষা",
        marks: 150,
        duration: "90 mins",
        description:
          "পল্লী বিদ্যুৎ সমিতির সহকারী প্রকৌশলী পদে নিয়োগ পরীক্ষার মডেল টেস্ট।",
        status: "Checked",
      },
    ],
  },
};

const categoryMeta: Record<string, { subtitle: string; color: string }> = {
  bcs: { subtitle: "BCS প্রশ্ন ব্যাংক", color: "from-blue-600 via-blue-500 to-indigo-400" },
  bank: { subtitle: "ব্যাংক জব প্রশ্ন ব্যাংক", color: "from-amber-500 via-amber-400 to-orange-300" },
  ssc: { subtitle: "এসএসসি প্রশ্ন ব্যাংক", color: "from-emerald-500 via-emerald-400 to-teal-300" },
  hsc: { subtitle: "এইচএসসি প্রশ্ন ব্যাংক", color: "from-violet-500 via-violet-400 to-purple-300" },
  teacher: { subtitle: "শিক্ষক নিবন্ধন প্রশ্ন ব্যাংক", color: "from-rose-500 via-rose-400 to-pink-300" },
  govt: { subtitle: "সরকারি চাকরি প্রশ্ন ব্যাংক", color: "from-cyan-500 via-cyan-400 to-sky-300" },
};

export default function QuestionMaster() {
  const { examType } = useParams<{ examType: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if we're on a child route (exam-din)
  const isChildRoute = location.pathname.includes("/exam-din");

  // Get category data
  const categoryData = useMemo(() => {
    if (!examType) return null;
    return examDataByCategory[examType];
  }, [examType]);

  const meta = examType ? categoryMeta[examType] : null;

  // If on child route (exam-din), just render the outlet
  if (isChildRoute) {
    return <Outlet />;
  }

  // If exam type not found
  if (!examType || !categoryData) {
    navigate("/question-center", { replace: true });
    return null;
  }

  const { title, exams } = categoryData;
  const headerGradient = meta?.color || "from-indigo-600 to-purple-600";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header with gradient */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => navigate("/question-center")}
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
            >
              <FiArrowLeft size={20} />
            </button>

            <div className="flex items-center gap-2">
              <div
                className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${headerGradient} animate-pulse`}
              />
              <h1 className="font-bold text-lg text-slate-800">{title}</h1>
            </div>

            <button
              onClick={() => navigate("/question-center")}
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
            >
              <FiGrid size={18} />
            </button>
          </div>

          {/* Search */}
          <div className="pb-4">
            <div className="flex gap-3">
              <div className="flex-1 flex items-center bg-gray-100 rounded-xl px-4">
                <FiSearch className="text-gray-400 shrink-0" />
                <input
                  placeholder="Search exams..."
                  className="bg-transparent flex-1 px-3 py-2.5 outline-none text-sm"
                />
              </div>
              <select className="rounded-xl border border-gray-200 px-4 bg-white text-sm text-gray-600 outline-none">
                <option>All</option>
                <option>Checked</option>
                <option>Pending</option>
              </select>
            </div>
          </div>

          {/* Subtitle */}
          {meta && (
            <div className="pb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-medium">
                {meta.subtitle} • {exams.length} exams available
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Exam Cards */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 p-6 group"
          >
            {/* Top Row */}
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-gray-400">{exam.date}</p>
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                {exam.status}
              </span>
            </div>

            {/* Title */}
            <h2 className="font-bold text-lg sm:text-xl text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors">
              {exam.title}
            </h2>

            {/* Info Row */}
            <div className="flex flex-wrap gap-5 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-2">
                <FiFileText className="text-gray-400" size={15} />
                Total Marks: {exam.marks}
              </div>
              <div className="flex items-center gap-2">
                <FiClock className="text-gray-400" size={15} />
                Duration: {exam.duration}
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-7 mb-6 text-sm">
              {exam.description}
            </p>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button className="border border-gray-200 rounded-xl py-3 font-semibold text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
                প্রশ্ন দেখুন
              </button>
              <button
                onClick={() => navigate(`/question-center/${examType}/exam-din`)}
                className={`bg-gradient-to-r ${headerGradient} hover:opacity-90 text-white rounded-xl py-3 font-semibold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all active:scale-[0.98]`}
              >
                পরীক্ষা দিন
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Outlet for potential nested child routes */}
      <Outlet />
    </div>
  );
}