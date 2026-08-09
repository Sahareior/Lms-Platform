import {
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardList,
  University,
  School,
  Video,
  FileText,
  Users,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useGetMeQuery } from "@my-monorepo/store";

// ─── Icon mapping based on exam name patterns ──────────────
const getExamIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("bcs") || lower.includes("বিসিএস")) return <University size={20} />;
  if (lower.includes("bank") || lower.includes("ব্যাংক")) return <ClipboardList size={20} />;
  if (lower.includes("teacher") || lower.includes("শিক্ষক") || lower.includes("নিবন্ধন")) return <School size={20} />;
  if (lower.includes("job") || lower.includes("সল্যুশন") || lower.includes("চাকরি")) return <Calendar size={20} />;
  return <GraduationCap size={20} />;
};

const studyItems = [
  { title: "Video Section", icon: <Video size={18} /> },
  { title: "PDF Section", icon: <FileText size={18} /> },
  { title: "সাম্প্রতিক পোস্ট", icon: <BookOpen size={18} /> },
  { title: "Central Job Solutions", icon: <BookOpen size={18} /> },
  { title: "Study Group", icon: <Users size={18} /> },
];

const ExamOptions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: userData, isLoading } = useGetMeQuery();
  const selectedExams = userData?.selectedExams || [];

  return (
    <div>
      {location.pathname === "/mock-exam" ? (
        <div className="min-h-screen bg-[#0B0D12] text-[#F5F7FA]  md:p-6">
          <div className="mx-auto max-w-6xl rounded-2xl bg-[#111318] border border-[#23262D] p-6 shadow-sm">
            {/* Header */}
            <h2 className="mb-6 text-center text-2xl md:text-3xl font-extrabold tracking-tight">
              Exam Section
            </h2>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={32} className="animate-spin text-[#2F80ED]" />
              </div>
            ) : selectedExams.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16 bg-[#161920] rounded-xl border border-dashed border-[#323742]">
                <BookOpen size={40} className="mx-auto text-[#6B7280] mb-4" />
                <p className="text-[#A1A8B3] font-semibold text-lg">No exams selected yet</p>
                <p className="text-[#6B7280] text-sm mt-1 mb-4">
                  Select your exams from the Settings page
                </p>
                <button
                  onClick={() => navigate("/settings")}
                  className="inline-flex items-center gap-2 bg-[#2F80ED] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#256BCE] transition-all active:scale-[0.98]"
                >
                  Select Exams
                </button>
              </div>
            ) : (
              /* Exam List */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedExams.map((exam: any) => (
                  <div
                    key={exam._id}
                    onClick={() => navigate(`/mock-exam/selected-exam?examId=${exam._id}`)}
                    className="relative flex items-center gap-3 rounded-lg border border-[#23262D] bg-[#161920] px-4 py-3 transition hover:bg-[#1C1F26] hover:border-[#2F80ED]/50 cursor-pointer group"
                  >
                    <span className="text-[#2F80ED] group-hover:text-[#2F80ED] transition-colors">
                      {getExamIcon(exam.name)}
                    </span>
                    <span className="flex-1 text-[#F5F7FA] font-medium">{exam.name}</span>
                    <ChevronRight size={16} className="text-[#6B7280] group-hover:text-[#2F80ED] transition-colors" />
                  </div>
                ))}
              </div>
            )}

            {/* Study Section */}
            <div className="mt-8 border border-[#23262D] rounded-xl overflow-hidden">
              <h2 className="border-b border-[#23262D] py-4 text-center text-xl font-bold bg-[#161920]">
                Study Section
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2">
                {studyItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 border-b border-[#23262D] px-4 py-4 last:border-b-0 hover:bg-[#161920] transition cursor-pointer"
                  >
                    <span className="text-[#2F80ED]">{item.icon}</span>
                    <span className="text-[#F5F7FA] text-sm">{item.title}</span>
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

export default ExamOptions;