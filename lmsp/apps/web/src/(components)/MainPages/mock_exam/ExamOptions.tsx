import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Award,
  BookOpen,
  ChevronRight,
  ClipboardList,
  FileText,
  GraduationCap,
  Search,
  Star,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useGetMeQuery } from "@my-monorepo/store";
import { useTheme } from "../../../theme/ThemeContext";

// ─── Types ─────────────────────────────────────────────────────
interface SelectedExam {
  _id: string;
  name: string;
  image?: string;
  description?: string;
  applicants?: string;
  category?: "academic" | "job_preparation" | string;
}

// ─── Exam meta: icon + colour + bengali subtitle ───────────────
function examMeta(name: string): { icon: ReactNode; color: string; subtitle: string } {
  const lower = name.toLowerCase();
  if (lower.includes("bcs") || lower.includes("বিসিএস"))
    return { icon: <Award size={26} />, color: "#2F80ED", subtitle: "বিসিএস প্রস্তুতি" };
  if (lower.includes("bank") || lower.includes("ব্যাংক"))
    return { icon: <TrendingUp size={26} />, color: "#F2C94C", subtitle: "ব্যাংক জব প্রস্তুতি" };
  if (lower.includes("ssc") || lower.includes("এসএসসি"))
    return { icon: <BookOpen size={26} />, color: "#00E5B3", subtitle: "এসএসসি প্রস্তুতি" };
  if (lower.includes("hsc") || lower.includes("এইচএসসি"))
    return { icon: <ClipboardList size={26} />, color: "#9B51E0", subtitle: "এইচএসসি প্রস্তুতি" };
  if (lower.includes("teacher") || lower.includes("শিক্ষক") || lower.includes("নিবন্ধন"))
    return { icon: <UserCheck size={26} />, color: "#EB5757", subtitle: "শিক্ষক নিবন্ধন প্রস্তুতি" };
  if (lower.includes("govt") || lower.includes("job") || lower.includes("চাকরি") || lower.includes("সল্যুশন"))
    return { icon: <Zap size={26} />, color: "#00C8FF", subtitle: "সরকারি চাকরি প্রস্তুতি" };
  return { icon: <GraduationCap size={26} />, color: "#9B51E0", subtitle: "পরীক্ষার প্রস্তুতি" };
}

const getCategoryLabel = (category?: string) => {
  if (category === "academic") return "Academic";
  if (category === "job_preparation") return "Job Preparation";
  return null;
};

// ─── Study section items ───────────────────────────────────────
const studyItems = [
  { title: "Video Section", icon: <Video size={18} /> },
  { title: "PDF Section", icon: <FileText size={18} /> },
  { title: "সাম্প্রতিক পোস্ট", icon: <BookOpen size={18} /> },
  { title: "Central Job Solutions", icon: <Target size={18} /> },
  { title: "Study Group", icon: <Users size={18} /> },
];

// ─── Skeleton card for loading state ───────────────────────────
const ExamCardSkeleton = ({ isDark }: { isDark: boolean }) => (
  <div className={`rounded-2xl border p-5 ${
    isDark ? "border-[#23262D] bg-[#111318]" : "border-[#d8d4cb] bg-[#f2efe9]"
  }`}>
    <div className={`h-12 w-12 rounded-xl animate-pulse mb-4 ${isDark ? "bg-[#23262D]" : "bg-[#e0dcd5]"}`} />
    <div className={`h-4 w-3/4 rounded animate-pulse mb-2 ${isDark ? "bg-[#23262D]" : "bg-[#e0dcd5]"}`} />
    <div className={`h-3 w-1/2 rounded animate-pulse mb-4 ${isDark ? "bg-[#23262D]" : "bg-[#e0dcd5]"}`} />
    <div className={`h-3 w-full rounded animate-pulse mb-2 ${isDark ? "bg-[#23262D]" : "bg-[#e0dcd5]"}`} />
    <div className={`h-3 w-5/6 rounded animate-pulse ${isDark ? "bg-[#23262D]" : "bg-[#e0dcd5]"}`} />
  </div>
);

// ─── Stat chip ─────────────────────────────────────────────────
const StatChip = ({ 
  icon, value, label, color, isDark 
}: { 
  icon: ReactNode; value: number; label: string; color: string; isDark: boolean;
}) => {
  if (!isDark) {
    return (
      <div className="flex items-center gap-2.5 bg-[#f2efe9] border border-[#d8d4cb] rounded-md px-4 py-2.5 shadow-[2px_2px_0px_0px_#1a1a1a]">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1a1a1a] text-[#f2efe9]">
          {icon}
        </span>
        <div>
          <p className="text-base font-black leading-none text-[#1a1a1a] font-serif">{value}</p>
          <p className="text-[11px] text-[#4a4a4a] mt-1 font-serif italic">{label}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2.5 bg-[#111318]/80 border border-[#23262D] rounded-xl px-4 py-2.5 backdrop-blur">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${color}1A`, border: `1px solid ${color}4D`, color }}
      >
        {icon}
      </span>
      <div>
        <p className="text-base font-extrabold leading-none text-[#F5F7FA]">{value}</p>
        <p className="text-[11px] text-[#A1A8B3] mt-1">{label}</p>
      </div>
    </div>
  );
};

const ExamOptions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: userData, isLoading } = useGetMeQuery();
  const [query, setQuery] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const { theme, isDark, setTheme, toggleTheme } = useTheme();

  useEffect(() => {
    if (sessionStorage.getItem('examAlreadyCompleted') === '1') {
      setShowAlert(true);
      sessionStorage.removeItem('examAlreadyCompleted');
      const timer = setTimeout(() => setShowAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const selectedExams = (userData?.selectedExams || []) as SelectedExam[];

  const filteredExams = useMemo(
    () =>
      selectedExams.filter((exam) =>
        exam.name.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [selectedExams, query]
  );

  const academicCount = selectedExams.filter((e) => e.category === "academic").length;
  const jobCount = selectedExams.filter((e) => e.category === "job_preparation").length;

  const openExam = (examId: string) =>
    navigate(`/mock-exam/selected-exam?examId=${examId}`);

  return (
    <div>
      {location.pathname === "/mock-exam" ? (
        <div className={`min-h-screen md:p-4 p-1  ${isDark ? "bg-[#0B0D12] text-[#F5F7FA]" : "bg-[#e8e4db] text-[#1a1a1a]"}`}>
          <div className="mx-auto max-w-8xl">

            {/* ── Already Completed Alert ──────────────────────── */}
            {showAlert && (
              <div className={`mb-4 p-4 rounded-xl border flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300 ${
                isDark 
                  ? "border-[#EB5757]/30 bg-[#EB5757]/10" 
                  : "border-[#b91c1c] bg-[#f2efe9] shadow-[3px_3px_0px_0px_#1a1a1a]"
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🚫</span>
                  <div>
                    <p className={`text-sm font-bold ${isDark ? "text-[#EB5757]" : "text-[#b91c1c] font-serif"}`}>
                      You have already completed this mock exam.
                    </p>
                    <p className={`text-xs ${isDark ? "text-[#A1A8B3]" : "text-[#4a4a4a] font-serif italic"}`}>
                      Each exam can only be attempted once.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAlert(false)}
                  className={`text-lg font-bold px-2 ${
                    isDark ? "text-[#A1A8B3] hover:text-[#F5F7FA]" : "text-[#4a4a4a] hover:text-[#1a1a1a]"
                  }`}
                >
                  ×
                </button>
              </div>
            )}

            {/* ── Hero Header ───────────────────────────────────── */}
            {isDark ? (
              <div className="relative overflow-hidden rounded-2xl border border-[#23262D] bg-gradient-to-br from-[#161920] via-[#111318] to-[#0B0D12] p-6 md:p-8 mb-6">
                <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#9B51E0]/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#2F80ED]/15 blur-3xl" />

                <div className="relative">
                  <div className="inline-flex items-center gap-1.5 bg-[#9B51E0]/10 text-[#9B51E0] text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-4 border border-[#9B51E0]/30">
                    <Star size={11} />
                    <span>Mock Exam</span>
                    <Star size={11} />
                  </div>

                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
                    Exam Section
                  </h1>
                  <p className="text-[#A1A8B3] text-sm max-w-xl leading-relaxed">
                    Pick one of your selected exams and jump straight into a live
                    mock test — real questions, real timing, instant results.
                  </p>

                  {!isLoading && selectedExams.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-6">
                      <StatChip icon={<Target size={15} />} value={selectedExams.length} label="Selected Exams" color="#9B51E0" isDark={true} />
                      <StatChip icon={<BookOpen size={15} />} value={academicCount} label="Academic" color="#00E5B3" isDark={true} />
                      <StatChip icon={<BriefcaseIcon />} value={jobCount} label="Job Preparation" color="#F2C94C" isDark={true} />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Light Mode Hero Header */
              <div 
                className="relative overflow-hidden rounded-lg border border-[#d8d4cb] bg-[#f2efe9] p-6 md:p-8 mb-6 shadow-[3px_3px_0px_0px_#1a1a1a]"
                style={{
                  backgroundImage: 'radial-gradient(#d8d4cb 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }}
              >
                <div className="relative">
                  <div className="inline-flex items-center gap-1.5 bg-[#f2efe9] text-[#b91c1c] text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest mb-4 border border-[#b91c1c] font-serif">
                    <Star size={11} className="fill-[#b91c1c]" />
                    <span>Mock Exam</span>
                    <Star size={11} className="fill-[#b91c1c]" />
                  </div>

                  <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-2 text-[#1a1a1a] font-serif">
                    Exam Section
                  </h1>
                  <p className="text-[#4a4a4a] text-sm max-w-xl leading-relaxed font-serif italic">
                    Pick one of your selected exams and jump straight into a live
                    mock test — real questions, real timing, instant results.
                  </p>

                  {!isLoading && selectedExams.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-6">
                      <StatChip icon={<Target size={15} />} value={selectedExams.length} label="Selected Exams" color="#9B51E0" isDark={false} />
                      <StatChip icon={<BookOpen size={15} />} value={academicCount} label="Academic" color="#00E5B3" isDark={false} />
                      <StatChip icon={<BriefcaseIcon />} value={jobCount} label="Job Preparation" color="#F2C94C" isDark={false} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Content ───────────────────────────────────────── */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <ExamCardSkeleton key={i} isDark={isDark} />
                ))}
              </div>
            ) : selectedExams.length === 0 ? (
              /* Empty state */
              <div className={`text-center py-16 rounded-2xl border border-dashed ${
                isDark 
                  ? "bg-[#111318] border-[#323742]" 
                  : "bg-[#f2efe9] border-[#d8d4cb] shadow-[3px_3px_0px_0px_#1a1a1a]"
              }`}>
                <div className={`mx-auto h-16 w-16 rounded-2xl flex items-center justify-center mb-4 border ${
                  isDark ? "bg-[#9B51E0]/10 border-[#9B51E0]/30" : "bg-[#e0dcd5] border-[#1a1a1a]"
                }`}>
                  <BookOpen size={28} className={isDark ? "text-[#9B51E0]" : "text-[#1a1a1a]"} />
                </div>
                <p className={`font-semibold text-lg ${isDark ? "text-[#F5F7FA]" : "text-[#1a1a1a] font-serif font-black"}`}>
                  No exams selected yet
                </p>
                <p className={`text-sm mt-1 mb-5 ${isDark ? "text-[#6B7280]" : "text-[#4a4a4a] font-serif italic"}`}>
                  Select your exams from the Settings page to unlock mock tests
                </p>
                <button
                  onClick={() => navigate("/settings")}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${
                    isDark 
                      ? "bg-[#9B51E0] text-white hover:bg-[#8A44D1]" 
                      : "bg-[#1a1a1a] text-[#f2efe9] font-serif shadow-[2px_2px_0px_0px_#b91c1c] hover:shadow-[3px_3px_0px_0px_#b91c1c]"
                  }`}
                >
                  Select Exams
                </button>
              </div>
            ) : (
              <>
                {/* Search */}
                <div className="relative mb-5">
                  <Search
                    size={18}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-[#6B7280]" : "text-[#4a4a4a]"}`}
                  />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search your exams..."
                    className={`w-full rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 transition ${
                      isDark 
                        ? "bg-[#111318] border border-[#23262D] text-[#F5F7FA] placeholder:text-[#6B7280] focus:border-[#9B51E0]/50 focus:ring-[#9B51E0]/20"
                        : "bg-[#f2efe9] border border-[#d8d4cb] text-[#1a1a1a] placeholder:text-[#6B7280] focus:border-[#b91c1c] focus:ring-[#b91c1c]/20 font-serif shadow-[2px_2px_0px_0px_#1a1a1a]"
                    }`}
                  />
                </div>

                {filteredExams.length === 0 ? (
                  /* Search empty state */
                  <div className={`text-center py-16 rounded-2xl border border-dashed ${
                    isDark 
                      ? "bg-[#111318] border-[#323742]" 
                      : "bg-[#f2efe9] border-[#d8d4cb] shadow-[3px_3px_0px_0px_#1a1a1a]"
                  }`}>
                    <Search size={32} className={`mx-auto mb-3 ${isDark ? "text-[#6B7280]" : "text-[#4a4a4a]"}`} />
                    <p className={`font-semibold ${isDark ? "text-[#A1A8B3]" : "text-[#1a1a1a] font-serif"}`}>
                      No exams match "{query}"
                    </p>
                    <button
                      onClick={() => setQuery("")}
                      className={`mt-3 text-sm hover:underline font-medium ${
                        isDark ? "text-[#9B51E0]" : "text-[#b91c1c] font-serif font-bold"
                      }`}
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  /* Exam grid */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredExams.map((exam) => {
                      const { icon, color, subtitle } = examMeta(exam.name);
                      const categoryLabel = getCategoryLabel(exam.category);
                      return (
                        <div
                          key={exam._id}
                          role="button"
                          tabIndex={0}
                          onClick={() => openExam(exam._id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openExam(exam._id);
                            }
                          }}
                          className={`group relative flex flex-col overflow-hidden cursor-pointer transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 ${
                            isDark 
                              ? "rounded-2xl border border-[#23262D] bg-[#111318] hover:border-[#9B51E0]/50 hover:shadow-[0_0_20px_-5px_rgba(155,81,224,0.3)] hover:-translate-y-0.5 active:scale-[0.98] focus-visible:ring-[#9B51E0]/50"
                              : "rounded-lg border border-[#d8d4cb] bg-[#f2efe9] hover:shadow-[4px_4px_0px_0px_#1a1a1a] hover:-translate-y-0.5 active:scale-[0.98] focus-visible:ring-[#b91c1c]/50 shadow-[3px_3px_0px_0px_#1a1a1a]"
                          }`}
                        >
                          {/* Top accent bar */}
                          <div
                            className="h-1.5 w-full"
                            style={{ backgroundColor: isDark ? color : "#b91c1c" }}
                          />

                          <div className="flex flex-1 flex-col p-5">
                            {/* Icon + chevron */}
                            <div className="flex items-start justify-between mb-4">
                              <div
                                className="h-12 w-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                                style={
                                  isDark 
                                    ? { backgroundColor: `${color}1A`, border: `1px solid ${color}4D`, color }
                                    : { backgroundColor: "#1a1a1a", border: "1px solid #1a1a1a", color: "#f2efe9" }
                                }
                              >
                                {icon}
                              </div>
                              <ChevronRight
                                size={18}
                                className={`transition-all ${
                                  isDark 
                                    ? "text-[#6B7280] group-hover:text-[#F5F7FA] group-hover:translate-x-0.5" 
                                    : "text-[#4a4a4a] group-hover:text-[#b91c1c] group-hover:translate-x-0.5"
                                }`}
                              />
                            </div>

                            {/* Title */}
                            <h3 className={`font-bold leading-snug ${
                              isDark ? "text-base text-[#F5F7FA]" : "text-lg text-[#1a1a1a] font-serif font-black"
                            }`}>
                              {exam.name}
                            </h3>
                            <p
                              className={`text-xs font-medium mt-1 mb-3 ${isDark ? "" : "font-serif italic"}`}
                              style={{ color: isDark ? color : "#b91c1c" }}
                            >
                              {subtitle}
                            </p>

                            {/* Description */}
                            {exam.description && (
                              <p className={`min-h-[2.5rem] text-sm leading-relaxed mb-4 line-clamp-2 ${
                                isDark ? "text-[#A1A8B3]" : "text-[#4a4a4a] font-serif"
                              }`}>
                                {exam.description}
                              </p>
                            )}

                            {/* Footer */}
                            <div className={`mt-auto flex items-center justify-between pt-4 border-t ${
                              isDark ? "border-[#23262D]" : "border-[#d8d4cb]"
                            }`}>
                              {exam.applicants ? (
                                <span className={`flex items-center gap-1.5 text-xs ${
                                  isDark ? "text-[#6B7280]" : "text-[#4a4a4a] font-serif"
                                }`}>
                                  <Users size={13} />
                                  {exam.applicants} applicants
                                </span>
                              ) : (
                                <span className={`flex items-center gap-1.5 text-xs ${
                                  isDark ? "text-[#6B7280]" : "text-[#4a4a4a] font-serif"
                                }`}>
                                  <GraduationCap size={13} />
                                  Mock test ready
                                </span>
                              )}
                              {categoryLabel && (
                                <span
                                  className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${
                                    isDark ? "font-semibold" : "font-serif uppercase tracking-wider"
                                  }`}
                                  style={
                                    isDark 
                                      ? { backgroundColor: `${color}1A`, color, border: `1px solid ${color}4D` }
                                      : { backgroundColor: "#f2efe9", color: "#1a1a1a", border: "1px solid #1a1a1a" }
                                  }
                                >
                                  {categoryLabel}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* ── Study Section ─────────────────────────────────── */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`font-bold ${isDark ? "text-lg" : "text-xl font-serif font-black text-[#1a1a1a]"}`}>
                  Study Section
                </h2>
                <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                  isDark 
                    ? "bg-[#EB5757]/10 text-[#EB5757] border-[#EB5757]/30" 
                    : "bg-[#f2efe9] text-[#b91c1c] border-[#b91c1c] font-serif"
                }`}>
                  Coming Soon
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {studyItems.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 rounded-xl px-4 py-4 transition ${
                      isDark 
                        ? "border border-[#23262D] bg-[#111318] hover:bg-[#161920]" 
                        : "border border-[#d8d4cb] bg-[#f2efe9] hover:shadow-[2px_2px_0px_0px_#1a1a1a] shadow-[1px_1px_0px_0px_#1a1a1a]"
                    }`}
                  >
                    <span className={isDark ? "text-[#2F80ED]" : "text-[#b91c1c]"}>
                      {item.icon}
                    </span>
                    <span className={`text-sm font-medium ${
                      isDark ? "text-[#F5F7FA]" : "text-[#1a1a1a] font-serif font-bold"
                    }`}>
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <Outlet />
        </div>
      )}
    </div>
  );
};

// Small inline icon (briefcase)
const BriefcaseIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

export default ExamOptions;