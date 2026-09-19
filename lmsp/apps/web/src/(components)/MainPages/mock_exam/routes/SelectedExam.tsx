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
  CheckCircle2,
} from "lucide-react";
import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  useGetExamsQuery,
  useGetScheduleExamsByExamQuery,
  useGetUserAttemptsQuery,
  useAppSelector,
} from "@my-monorepo/store";
import type { ScheduleExam } from "@my-monorepo/store";
import { useTheme } from "../../../../theme/ThemeContext";


// ─── Status styling (theme aware) ──────────────────────────────
const getStatusBadge = (status: string, isDark: boolean) => {
  if (!isDark) {
    switch (status) {
      case "active":
        return "bg-[#f2efe9] text-[#1a1a1a] border border-[#1a1a1a] font-serif font-bold uppercase tracking-wider";
      case "upcoming":
        return "bg-[#f2efe9] text-[#4a4a4a] border border-[#d8d4cb] font-serif font-bold uppercase tracking-wider";
      case "completed":
        return "bg-[#f2efe9] text-[#4a4a4a] border border-[#d8d4cb] font-serif font-bold uppercase tracking-wider";
      case "cancelled":
        return "bg-[#f2efe9] text-[#b91c1c] border border-[#b91c1c] font-serif font-bold uppercase tracking-wider";
      default:
        return "bg-[#f2efe9] text-[#4a4a4a] border border-[#d8d4cb] font-serif font-bold uppercase tracking-wider";
    }
  }
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
  const userId = useAppSelector((state) => state.user.user?._id) || "";
  const { isDark } = useTheme();

  const { data: exams } = useGetExamsQuery();
  const { data: scheduleExams, isLoading } = useGetScheduleExamsByExamQuery(examId!, {
    skip: !examId,
    refetchOnMountOrArgChange: true,
  });
  const { data: userAttempts } = useGetUserAttemptsQuery(
    { userId, source: "mock_exam", limit: 50 },
    { skip: !userId || !examId, refetchOnMountOrArgChange: true }
  );

  const currentExam = exams?.find((e: any) => e._id === examId);

  const availableExams =
    scheduleExams?.filter((s: ScheduleExam) => {
      const eff = getEffectiveStatus(s);
      return eff === "active" || eff === "upcoming";
    }) ?? [];

  const isExamOngoing = (scheduled: ScheduleExam) => {
    if (!userAttempts || !examId) return false;
    if (!isExamActive(scheduled)) return false;

    const scheduledVersionId =
      scheduled.examVersion && typeof scheduled.examVersion === "object"
        ? String((scheduled.examVersion as any)._id || "")
        : String(scheduled.examVersion || "");
    const scheduledBoard =
      scheduled.board && scheduled.board !== "undefined" && scheduled.board !== "null"
        ? String(scheduled.board)
        : "";

    return userAttempts.some((a: any) => {
      if (a.isCompleted) return false;

      const attemptScheduleId = String(a.scheduleExam?._id || a.scheduleExam || "");
      if (attemptScheduleId && scheduled._id) {
        return attemptScheduleId === String(scheduled._id);
      }

      const attemptExamId = String(a.exam?._id || a.exam || "");
      if (attemptExamId !== String(examId)) return false;

      if (scheduledVersionId) {
        const attemptVersionId = String(a.examVersion?._id || a.examVersion || "");
        if (attemptVersionId && attemptVersionId !== scheduledVersionId) return false;
      }

      if (scheduledBoard) {
        const attemptBoard = String(a.board || "");
        if (attemptBoard && attemptBoard !== scheduledBoard) return false;
      }

      return true;
    });
  };

  const isExamParticipated = (scheduled: ScheduleExam) => {
    if (!userAttempts || !examId) return false;
    const scheduledVersionId =
      scheduled.examVersion && typeof scheduled.examVersion === "object"
        ? String((scheduled.examVersion as any)._id || "")
        : String(scheduled.examVersion || "");
    const scheduledBoard =
      scheduled.board && scheduled.board !== "undefined" && scheduled.board !== "null"
        ? String(scheduled.board)
        : "";

    return userAttempts.some((a: any) => {
      if (!a.isCompleted) return false;

      const attemptScheduleId = String(a.scheduleExam?._id || a.scheduleExam || "");
      if (attemptScheduleId && scheduled._id) {
        return attemptScheduleId === String(scheduled._id);
      }

      const attemptExamId = String(a.exam?._id || a.exam || "");
      if (attemptExamId !== String(examId)) return false;

      if (scheduledVersionId) {
        const attemptVersionId = String(a.examVersion?._id || a.examVersion || "");
        if (attemptVersionId && attemptVersionId !== scheduledVersionId) return false;
      }

      if (scheduledBoard) {
        const attemptBoard = String(a.board || "");
        if (attemptBoard && attemptBoard !== scheduledBoard) return false;
      }

      return true;
    });
  };

  const handleExamClick = (scheduled: ScheduleExam) => {
    if (isExamParticipated(scheduled)) return;
    if (!isExamActive(scheduled)) return;

    const versionId =
      scheduled.examVersion && typeof scheduled.examVersion === "object"
        ? (scheduled.examVersion as any)._id || ""
        : (scheduled.examVersion as string) || "";
    
    const versionParam = versionId ? `&versionId=${versionId}` : "";
    const boardParam =
      scheduled?.board && scheduled.board !== "undefined" && scheduled.board !== "null"
        ? `&board=${encodeURIComponent(scheduled.board)}`
        : "";

    navigate(
      `/mock-exam/selected-exam/exam-page?examId=${examId}${versionParam}&scheduleId=${scheduled._id}${boardParam}`
    );
  };

  return (
    <div>
      {location.pathname === "/mock-exam/selected-exam" ? (
        <div className={`min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 ${
          isDark ? "bg-[#0B0D12] text-[#F5F7FA]" : "bg-[#e8e4db] text-[#1a1a1a]"
        }`}>
          <div className="max-w-6xl mx-auto">
            {/* Back button */}
            <button
              onClick={() => navigate("/mock-exam")}
              className={`flex items-center gap-2 text-sm font-semibold mb-4 sm:mb-6 transition-colors ${
                isDark 
                  ? "text-[#A1A8B3] hover:text-[#F5F7FA]" 
                  : "text-[#4a4a4a] hover:text-[#1a1a1a] font-serif"
              }`}
            >
              <ArrowLeft size={18} />
              Back to Exam Selection
            </button>

            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className={`text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight mb-1 ${
                isDark ? "" : "font-serif font-black text-[#1a1a1a]"
              }`}>
                {currentExam?.name || "Select an Exam"}
              </h1>
              <p className={`text-xs sm:text-sm ${
                isDark ? "text-[#A1A8B3]" : "text-[#4a4a4a] font-serif italic"
              }`}>
                Choose an active exam to participate
              </p>
            </div>

            {/* Loading */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={32} className={`animate-spin ${isDark ? "text-[#2F80ED]" : "text-[#b91c1c]"}`} />
              </div>
            ) : availableExams.length === 0 ? (
              /* Empty state */
              <div className={`text-center py-12 sm:py-16 rounded-xl border border-dashed px-4 ${
                isDark 
                  ? "bg-[#111318] border-[#323742]" 
                  : "bg-[#f2efe9] border-[#d8d4cb] shadow-[3px_3px_0px_0px_#1a1a1a]"
              }`}>
                <BookOpen size={40} className={`mx-auto mb-4 ${isDark ? "text-[#6B7280]" : "text-[#1a1a1a]"}`} />
                <p className={`font-semibold text-base sm:text-lg ${
                  isDark ? "text-[#A1A8B3]" : "text-[#1a1a1a] font-serif font-black"
                }`}>
                  No active exams right now
                </p>
                <p className={`text-xs sm:text-sm mt-1 ${
                  isDark ? "text-[#6B7280]" : "text-[#4a4a4a] font-serif italic"
                }`}>
                  Admin needs to schedule exams from the admin panel
                </p>
              </div>
            ) : (
              /* Exam list */
              <div className="space-y-3 sm:space-y-4">
                {availableExams.map((scheduled: ScheduleExam) => {
                  const isParticipated = isExamParticipated(scheduled);
                  const isOngoing = !isParticipated && isExamOngoing(scheduled);
                  const isActive = isExamActive(scheduled) && !isParticipated;
                  const effectiveStatus = getEffectiveStatus(scheduled);
                  const timeRemaining = getTimeRemaining(scheduled.startDate);

                  return (
                    <div
                      key={scheduled._id}
                      onClick={() => handleExamClick(scheduled)}
                      className={`rounded-xl sm:rounded-lg border transition-all duration-200 group relative ${
                        isDark
                          ? isParticipated
                            ? "border-emerald-500/30 bg-[#111318]/90 opacity-80 cursor-not-allowed"
                            : isOngoing
                            ? "border-[#F2994A]/50 bg-[#111318] hover:border-[#F2994A] hover:shadow-[0_0_20px_-5px_rgba(242,153,74,0.35)] cursor-pointer"
                            : isActive
                            ? "border-[#23262D] hover:border-[#9B51E0]/50 hover:shadow-[0_0_20px_-5px_rgba(155,81,224,0.25)] cursor-pointer"
                            : "border-[#23262D] opacity-50 cursor-not-allowed hover:border-[#EB5757]/30"
                          : isParticipated
                            ? "border-[#d8d4cb] bg-[#f2efe9] opacity-80 cursor-not-allowed shadow-[2px_2px_0px_0px_#d8d4cb]"
                            : isOngoing
                            ? "border-[#b91c1c] bg-[#f2efe9] hover:shadow-[4px_4px_0px_0px_#1a1a1a] cursor-pointer shadow-[3px_3px_0px_0px_#1a1a1a]"
                            : isActive
                            ? "border-[#d8d4cb] bg-[#f2efe9] hover:shadow-[4px_4px_0px_0px_#1a1a1a] cursor-pointer shadow-[3px_3px_0px_0px_#1a1a1a]"
                            : "border-[#d8d4cb] bg-[#f2efe9] opacity-60 cursor-not-allowed shadow-[2px_2px_0px_0px_#d8d4cb]"
                      }`}
                      style={!isDark ? {
                        backgroundImage: 'radial-gradient(#d8d4cb 1px, transparent 1px)',
                        backgroundSize: '16px 16px',
                      } : undefined}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 md:p-5 gap-3 sm:gap-4">
                        <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          {/* Icon */}
                          <div
                            className={`h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${
                              isDark
                                ? isParticipated
                                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                                  : isOngoing
                                  ? "bg-[#F2994A]/15 border border-[#F2994A]/40 text-[#F2994A]"
                                  : isActive
                                  ? effectiveStatus === "active"
                                    ? "bg-[#9B51E0]/10 border border-[#9B51E0]/30 text-[#9B51E0]"
                                    : "bg-[#2F80ED]/10 border border-[#2F80ED]/30 text-[#2F80ED]"
                                  : "bg-[#323742]/10 border border-[#323742]/30 text-[#6B7280]"
                                : isParticipated
                                  ? "bg-[#e0dcd5] border border-[#d8d4cb] text-[#4a4a4a]"
                                  : isOngoing || isActive
                                  ? "bg-[#1a1a1a] border border-[#1a1a1a] text-[#f2efe9]"
                                  : "bg-[#e0dcd5] border border-[#d8d4cb] text-[#6B7280]"
                            }`}
                          >
                            {isParticipated ? (
                              <CheckCircle2 size={22} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />
                            ) : isOngoing ? (
                              <PlayCircle size={22} className="sm:w-6 sm:h-6 md:w-7 md:h-7 animate-pulse" />
                            ) : isActive ? (
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
                              <h2 className={`text-sm sm:text-base md:text-lg font-bold truncate max-w-full ${
                                isDark ? "text-[#F5F7FA]" : "text-[#1a1a1a] font-serif font-black"
                              }`}>
                                {scheduled.title}
                              </h2>
                              {!isParticipated && !isOngoing && timeRemaining && (
                                <span className={`text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap ${
                                  isDark 
                                    ? "text-[#F2994A] bg-[#F2994A]/10" 
                                    : "text-[#b91c1c] bg-[#f2efe9] border border-[#b91c1c] font-serif"
                                }`}>
                                  <Timer size={10} className="sm:w-3 sm:h-3" />
                                  {timeRemaining}
                                </span>
                              )}
                            </div>
                            
                            {/* Mobile: Show status badges inline */}
                            <div className="flex sm:hidden items-center gap-2 mb-1.5">
                              {isParticipated ? (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap flex items-center gap-1 ${
                                  isDark 
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" 
                                    : "bg-[#e0dcd5] text-[#4a4a4a] border border-[#d8d4cb] font-serif"
                                }`}>
                                  <CheckCircle2 size={10} /> Participated
                                </span>
                              ) : isOngoing ? (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap flex items-center gap-1 animate-pulse ${
                                  isDark 
                                    ? "bg-[#F2994A]/15 text-[#F2994A] border border-[#F2994A]/40" 
                                    : "bg-[#f2efe9] text-[#b91c1c] border border-[#b91c1c] font-serif"
                                }`}>
                                  <PlayCircle size={10} /> Ongoing (Continue)
                                </span>
                              ) : (
                                <>
                                  {isActive && effectiveStatus === "active" && (
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                                      isDark 
                                        ? "bg-[#00E5B3]/10 text-[#00E5B3] border border-[#00E5B3]/30" 
                                        : "bg-[#f2efe9] text-[#b91c1c] border border-[#b91c1c] font-serif"
                                    }`}>
                                      ● LIVE
                                    </span>
                                  )}
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] ${getStatusBadge(effectiveStatus, isDark)}`}
                                  >
                                    {effectiveStatus.charAt(0).toUpperCase() + effectiveStatus.slice(1)}
                                  </span>
                                </>
                              )}
                            </div>
                            
                            <div className={`flex flex-wrap items-center gap-1.5 sm:gap-3 text-[11px] sm:text-sm ${
                              isDark ? "text-[#A1A8B3]" : "text-[#4a4a4a] font-serif"
                            }`}>
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
                              <span className="sm:hidden flex items-center gap-1 text-[10px]">
                                <Calendar size={10} />
                                {formatDate(scheduled.startDate)}
                              </span>
                              {scheduled.totalQuestions > 0 && (
                                <span className={`text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded whitespace-nowrap ${
                                  isDark 
                                    ? "text-[#A1A8B3] bg-[#23262D]" 
                                    : "text-[#1a1a1a] bg-[#e0dcd5] border border-[#d8d4cb] font-serif"
                                }`}>
                                  {scheduled.totalQuestions} Questions
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right side: status badges + chevron (desktop only) */}
                        <div className="hidden sm:flex items-center gap-3 ml-4 shrink-0">
                          {isParticipated ? (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 ${
                              isDark 
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" 
                                : "bg-[#e0dcd5] text-[#4a4a4a] border border-[#d8d4cb] font-serif"
                            }`}>
                              <CheckCircle2 size={14} /> Participated
                            </span>
                          ) : isOngoing ? (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 animate-pulse ${
                              isDark 
                                ? "bg-[#F2994A]/15 text-[#F2994A] border border-[#F2994A]/40" 
                                : "bg-[#f2efe9] text-[#b91c1c] border border-[#b91c1c] font-serif"
                            }`}>
                              <PlayCircle size={14} /> Ongoing
                            </span>
                          ) : (
                            <>
                              {isActive && effectiveStatus === "active" && (
                                <span className={`px-3 py-1 rounded-full text-sm font-bold animate-pulse whitespace-nowrap ${
                                  isDark 
                                    ? "bg-[#00E5B3]/10 text-[#00E5B3] border border-[#00E5B3]/30" 
                                    : "bg-[#f2efe9] text-[#b91c1c] border border-[#b91c1c] font-serif"
                                }`}>
                                  ● LIVE
                                </span>
                              )}
                              <span
                                className={`px-3 py-1 rounded-full text-xs ${getStatusBadge(effectiveStatus, isDark)}`}
                              >
                                {effectiveStatus.charAt(0).toUpperCase() + effectiveStatus.slice(1)}
                              </span>
                            </>
                          )}
                          <ChevronRight
                            size={22}
                            className={`transition-all ${
                              isDark
                                ? isActive
                                  ? "text-[#6B7280] group-hover:text-[#F5F7FA] group-hover:translate-x-0.5"
                                  : "text-[#4A4F58]"
                                : isActive
                                  ? "text-[#4a4a4a] group-hover:text-[#b91c1c] group-hover:translate-x-0.5"
                                  : "text-[#d8d4cb]"
                            }`}
                          />
                        </div>
                        
                        {/* Mobile chevron */}
                        <ChevronRight
                          size={18}
                          className={`sm:hidden absolute right-3 top-1/2 -translate-y-1/2 transition-all ${
                            isDark
                              ? isActive ? "text-[#6B7280]" : "text-[#4A4F58]"
                              : isActive ? "text-[#4a4a4a]" : "text-[#d8d4cb]"
                          }`}
                        />
                      </div>
                      
                      {/* Sub message */}
                      {isParticipated ? (
                        <div className="px-3 sm:px-5 pb-3 sm:pb-4">
                          <p className={`text-[10px] sm:text-xs flex items-center gap-1 ${
                            isDark ? "text-emerald-400/90" : "text-[#4a4a4a] font-serif italic"
                          }`}>
                            <CheckCircle2 size={12} className="sm:w-3.5 sm:h-3.5" />
                            You have already participated in this exam.
                          </p>
                        </div>
                      ) : isOngoing ? (
                        <div className="px-3 sm:px-5 pb-3 sm:pb-4">
                          <p className={`text-[10px] sm:text-xs flex items-center gap-1 font-medium ${
                            isDark ? "text-[#F2994A]" : "text-[#b91c1c] font-serif"
                          }`}>
                            <PlayCircle size={12} className="sm:w-3.5 sm:h-3.5" />
                            Exam in progress. Click to continue your exam.
                          </p>
                        </div>
                      ) : !isActive && (
                        <div className="px-3 sm:px-5 pb-3 sm:pb-4">
                          <p className={`text-[10px] sm:text-xs flex items-center gap-1 ${
                            isDark ? "text-[#EB5757]" : "text-[#4a4a4a] font-serif italic"
                          }`}>
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