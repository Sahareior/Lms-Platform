import React from "react";
import {
  Clock,
  PlayCircle,
  ArrowLeft,
  ChevronRight,
  Loader2,
  BookOpen,
  Calendar,
} from "lucide-react";
import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useGetExamsQuery, useGetScheduleExamsByExamQuery } from "@my-monorepo/store";
import type { ScheduleExam } from "@my-monorepo/store";

// ─── Status styling (BrainForge dark theme) ──────────────────
const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return "bg-[#00E5B3]/10 text-[#00E5B3] border border-[#00E5B3]/30";
    case "upcoming":
      return "bg-[#2F80ED]/10 text-[#2F80ED] border border-[#2F80ED]/30";
    case "completed":
      return "bg-[#A1A8B3]/10 text-[#A1A8B3] border border-[#A1A8B3]/30";
    case "cancelled":
      return "bg-[#EB5757]/10 text-[#EB5757] border border-[#EB5757]/30";
    default:
      return "bg-[#A1A8B3]/10 text-[#A1A8B3] border border-[#A1A8B3]/30";
  }
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const SelectedExam = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const examId = searchParams.get("examId");

  const { data: exams } = useGetExamsQuery();
  const { data: scheduleExams, isLoading } = useGetScheduleExamsByExamQuery(examId!, {
    skip: !examId,
  });

  const currentExam = exams?.find((e: any) => e._id === examId);

  console.log("Current Exam:", scheduleExams);
  // Only upcoming/active exams for students
  const availableExams =
    scheduleExams?.filter(
      (s: ScheduleExam) => s.status === "active" || s.status === "upcoming"
    ) ?? [];

  return (
    <div>
      {location.pathname === "/mock-exam/selected-exam" ? (
        <div className="min-h-screen bg-[#0B0D12] py-8 px-4 text-[#F5F7FA]">
          <div className="max-w-4xl mx-auto">
            {/* Back button */}
            <button
              onClick={() => navigate("/mock-exam")}
              className="flex items-center gap-2 text-sm font-semibold text-[#A1A8B3] hover:text-[#F5F7FA] mb-6 transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Exam Selection
            </button>

            {/* Header */}
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1">
              {currentExam?.name || "Select an Exam"}
            </h1>
            <p className="text-[#A1A8B3] text-sm mb-8">
              Choose an exam to participate
            </p>

            {/* Loading */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={32} className="animate-spin text-[#2F80ED]" />
              </div>
            ) : availableExams.length === 0 ? (
              /* Empty state */
              <div className="text-center py-16 bg-[#111318] rounded-xl border border-dashed border-[#323742]">
                <BookOpen size={40} className="mx-auto text-[#6B7280] mb-4" />
                <p className="text-[#A1A8B3] font-semibold text-lg">
                  No active exams right now
                </p>
                <p className="text-[#6B7280] text-sm mt-1">
                  Admin needs to schedule exams from the admin panel
                </p>
              </div>
            ) : (
              /* Exam list */
              <div className="space-y-4">
                {availableExams.map((scheduled: ScheduleExam) => {
                  const examName =
                    typeof scheduled.exam === "object" ? scheduled.exam.name : "";
                  const versionName =
                    typeof scheduled.examVersion === "object"
                      ? scheduled.examVersion.examVersion
                      : "";

                  return (
                    <div
                      key={scheduled._id}
                      onClick={() => {
                        const versionId =
                          typeof scheduled.examVersion === "object"
                            ? scheduled.examVersion._id
                            : scheduled.examVersion;
                        navigate(
                          `/mock-exam/selected-exam/exam-page?examId=${examId}&versionId=${versionId}&scheduleId=${scheduled._id}`
                        );
                      }}
                      className="bg-[#111318] rounded-2xl border border-[#23262D] hover:border-[#9B51E0]/50 hover:shadow-[0_0_20px_-5px_rgba(155,81,224,0.25)] transition cursor-pointer group"
                    >
                      <div className="flex items-center justify-between p-5">
                        <div className="flex items-center gap-4">
                          {/* Icon */}
                          <div
                            className={`h-14 w-14 rounded-xl flex items-center justify-center ${
                              scheduled.status === "active"
                                ? "bg-[#9B51E0]/10 border border-[#9B51E0]/30 text-[#9B51E0]"
                                : "bg-[#2F80ED]/10 border border-[#2F80ED]/30 text-[#2F80ED]"
                            }`}
                          >
                            {scheduled.status === "active" ? (
                              <PlayCircle size={28} />
                            ) : (
                              <Calendar size={28} />
                            )}
                          </div>

                          {/* Details */}
                          <div>
                            <h2 className="text-lg font-bold text-[#F5F7FA]">
                              {scheduled.title}
                            </h2>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-[#A1A8B3]">
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {scheduled.duration} min
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {formatDate(scheduled.startDate)}
                              </span>
                              <span className="text-[#6B7280]">→</span>
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {formatDate(scheduled.endDate)}
                              </span>
                              {scheduled.totalQuestions > 0 && (
                                <span className="text-xs font-medium text-[#A1A8B3]">
                                  {scheduled.totalQuestions} Q
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right side: status badges + chevron */}
                        <div className="flex items-center gap-4">
                          {scheduled.status === "active" && (
                            <span className="bg-[#00E5B3]/10 text-[#00E5B3] border border-[#00E5B3]/30 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                              ● LIVE
                            </span>
                          )}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                              scheduled.status
                            )}`}
                          >
                            {scheduled.status.charAt(0).toUpperCase() +
                              scheduled.status.slice(1)}
                          </span>
                          <ChevronRight size={22} className="text-[#6B7280] group-hover:text-[#F5F7FA] transition" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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

export default SelectedExam;