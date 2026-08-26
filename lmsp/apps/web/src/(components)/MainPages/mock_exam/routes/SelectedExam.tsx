import React from "react";
import {
  Clock,
  PlayCircle,
  ArrowLeft,
  ChevronRight,
  Loader2,
  BookOpen,
  Calendar,
  Lock,
  Timer,
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

const getTimeRemaining = (startDate: string) => {
  const now = new Date();
  const start = new Date(startDate);
  const diff = start.getTime() - now.getTime();
  
  if (diff <= 0) return "";
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `Starts in ${days}d ${hours}h`;
  if (hours > 0) return `Starts in ${hours}h ${minutes}m`;
  return `Starts in ${minutes}m`;
};

const isExamActive = (scheduled: ScheduleExam) => {
  const currentDate = new Date();
  const startDate = new Date(scheduled.startDate);
  const endDate = new Date(scheduled.endDate);
  return currentDate >= startDate && currentDate <= endDate;
};

// Derive live status from dates — server status can be stale (cache/RTK query)
const getEffectiveStatus = (scheduled: ScheduleExam): string => {
  if (scheduled.status === "cancelled") return "cancelled";
  const now = new Date();
  const start = new Date(scheduled.startDate);
  const end = new Date(scheduled.endDate);
  if (now < start) return "upcoming";
  if (now > end) return "completed";
  return "active";
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

  // Only upcoming/active exams for students

  console.log(scheduleExams, "scheduleExams");

  const availableExams =
    scheduleExams?.filter((s: ScheduleExam) => {
      const eff = getEffectiveStatus(s);
      return eff === "active" || eff === "upcoming";
    }) ?? [];

  const handleExamClick = (scheduled: ScheduleExam) => {
    // Only navigate if the exam is active
    if (!isExamActive(scheduled)) {
      return; // Prevent navigation for future exams
    }

    const versionId =
      typeof scheduled.examVersion === "object"
        ? scheduled.examVersion._id
        : scheduled.examVersion;
    
    const boardParam =
      scheduled?.board && scheduled.board !== "undefined" && scheduled.board !== "null"
        ? `&board=${encodeURIComponent(scheduled.board)}`
        : "";

    navigate(
      `/mock-exam/selected-exam/exam-page?examId=${examId}&versionId=${versionId}&scheduleId=${scheduled._id}${boardParam}`
    );
  };

  return (
    <div>
      {location.pathname === "/mock-exam/selected-exam" ? (
        <div className="min-h-screen bg-[#0B0D12] py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 text-[#F5F7FA]">
          <div className="max-w-6xl mx-auto">
            {/* Back button */}
            <button
              onClick={() => navigate("/mock-exam")}
              className="flex items-center gap-2 text-sm font-semibold text-[#A1A8B3] hover:text-[#F5F7FA] mb-4 sm:mb-6 transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Exam Selection
            </button>

            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight mb-1">
                {currentExam?.name || "Select an Exam"}
              </h1>
              <p className="text-[#A1A8B3] text-xs sm:text-sm">
                Choose an active exam to participate
              </p>
            </div>

            {/* Loading */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={32} className="animate-spin text-[#2F80ED]" />
              </div>
            ) : availableExams.length === 0 ? (
              /* Empty state */
              <div className="text-center py-12 sm:py-16 bg-[#111318] rounded-xl border border-dashed border-[#323742] px-4">
                <BookOpen size={40} className="mx-auto text-[#6B7280] mb-4" />
                <p className="text-[#A1A8B3] font-semibold text-base sm:text-lg">
                  No active exams right now
                </p>
                <p className="text-[#6B7280] text-xs sm:text-sm mt-1">
                  Admin needs to schedule exams from the admin panel
                </p>
              </div>
            ) : (
              /* Exam list */
              <div className="space-y-3 sm:space-y-4">
                {availableExams.map((scheduled: ScheduleExam) => {
                  const isActive = isExamActive(scheduled);
                  const effectiveStatus = getEffectiveStatus(scheduled);
                  const timeRemaining = getTimeRemaining(scheduled.startDate);

                  return (
                    <div
                      key={scheduled._id}
                      onClick={() => handleExamClick(scheduled)}
                      className={`bg-[#111318] rounded-xl sm:rounded-2xl border transition-all duration-200 group ${
                        isActive
                          ? "border-[#23262D] hover:border-[#9B51E0]/50 hover:shadow-[0_0_20px_-5px_rgba(155,81,224,0.25)] cursor-pointer"
                          : "border-[#23262D] opacity-50 cursor-not-allowed hover:border-[#EB5757]/30"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 md:p-5 gap-3 sm:gap-4">
                        <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          {/* Icon */}                            <div
                              className={`h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${
                                isActive
                                  ? effectiveStatus === "active"
                                    ? "bg-[#9B51E0]/10 border border-[#9B51E0]/30 text-[#9B51E0]"
                                    : "bg-[#2F80ED]/10 border border-[#2F80ED]/30 text-[#2F80ED]"
                                  : "bg-[#323742]/10 border border-[#323742]/30 text-[#6B7280]"
                              }`}
                            >
                              {isActive ? (
                                effectiveStatus === "active" ? (
                                <PlayCircle size={22} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />
                              ) : (
                                <Calendar size={22} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />
                              )
                            ) : (
                              <Lock size={20} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                            )}
                          </div>

                          {/* Details */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1.5 sm:mb-2">
                              <h2 className="text-sm sm:text-base md:text-lg font-bold text-[#F5F7FA] truncate max-w-full">
                                {scheduled.title}
                              </h2>
                              {timeRemaining && (
                                <span className="text-[10px] sm:text-xs font-medium text-[#F2994A] bg-[#F2994A]/10 px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                                  <Timer size={10} className="sm:w-3 sm:h-3" />
                                  {timeRemaining}
                                </span>
                              )}
                            </div>
                            
                            {/* Mobile: Show status badges inline */}
                            <div className="flex sm:hidden items-center gap-2 mb-1.5">
                              {isActive && effectiveStatus === "active" && (
                                <span className="bg-[#00E5B3]/10 text-[#00E5B3] border border-[#00E5B3]/30 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap">
                                  ● LIVE
                                </span>
                              )}
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${getStatusBadge(
                                  effectiveStatus
                                )}`}
                              >
                                {effectiveStatus.charAt(0).toUpperCase() +
                                  effectiveStatus.slice(1)}
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-[11px] sm:text-sm text-[#A1A8B3]">
                              <span className="flex items-center gap-1 whitespace-nowrap">
                                <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
                                {scheduled.duration} min
                              </span>
                              <span className="hidden sm:inline-flex items-center gap-1">
                                <Calendar size={14} />
                                {formatDate(scheduled.startDate)}
                              </span>
                              <span className="hidden sm:inline text-[#6B7280]">→</span>
                              <span className="hidden sm:inline-flex items-center gap-1">
                                <Calendar size={14} />
                                {formatDate(scheduled.endDate)}
                              </span>
                              {/* Mobile: Show dates stacked */}
                              <span className="sm:hidden flex items-center gap-1 text-[10px]">
                                <Calendar size={10} />
                                {formatDate(scheduled.startDate)}
                              </span>
                              {scheduled.totalQuestions > 0 && (
                                <span className="text-[10px] sm:text-xs font-medium text-[#A1A8B3] bg-[#23262D] px-1.5 sm:px-2 py-0.5 rounded whitespace-nowrap">
                                  {scheduled.totalQuestions} Questions
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right side: status badges + chevron (desktop only) */}
                        <div className="hidden sm:flex items-center gap-3 ml-4 shrink-0">
                          {isActive && effectiveStatus === "active" && (
                            <span className="bg-[#00E5B3]/10 text-[#00E5B3] border border-[#00E5B3]/30 px-3 py-1 rounded-full text-sm font-bold animate-pulse whitespace-nowrap">
                              ● LIVE
                            </span>
                          )}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadge(
                              effectiveStatus
                            )}`}
                          >
                            {effectiveStatus.charAt(0).toUpperCase() +
                              effectiveStatus.slice(1)}
                          </span>
                          <ChevronRight
                            size={22}
                            className={`${
                              isActive
                                ? "text-[#6B7280] group-hover:text-[#F5F7FA] group-hover:translate-x-0.5"
                                : "text-[#4A4F58]"
                            } transition-all`}
                          />
                        </div>
                        
                        {/* Mobile chevron */}
                        <ChevronRight
                          size={18}
                          className={`sm:hidden absolute right-3 top-1/2 -translate-y-1/2 ${
                            isActive
                              ? "text-[#6B7280] group-hover:text-[#F5F7FA]"
                              : "text-[#4A4F58]"
                          } transition-all`}
                        />
                      </div>
                      
                      {/* Locked overlay for future exams */}
                      {!isActive && (
                        <div className="px-3 sm:px-5 pb-3 sm:pb-4">
                          <p className="text-[10px] sm:text-xs text-[#EB5757] flex items-center gap-1">
                            <Lock size={10} className="sm:w-3 sm:h-3" />
                            Exam will be accessible when it starts
                          </p>
                        </div>
                      )}
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