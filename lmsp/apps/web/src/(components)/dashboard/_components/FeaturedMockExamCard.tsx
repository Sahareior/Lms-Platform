import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck, Clock, Loader2, PlayCircle, CheckCircle2, Trophy } from "lucide-react";
import { useGetUserAttemptsQuery } from "@my-monorepo/store";

// ─── Countdown hook ───────────────────────────────────────────
function useCountdown(targetIso?: string | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!targetIso) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  if (!targetIso) return null;
  const diff = Math.max(0, new Date(targetIso).getTime() - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  const secs = Math.floor((diff % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return { diff, days, hours: pad(hours), mins: pad(mins), secs: pad(secs) };
}

// ─── Derive effective status from dates ───────────────────────
function getEffectiveStatus(featured: any): "upcoming" | "active" | "ended" | "cancelled" {
  if (!featured) return "ended";
  if (featured.status === "cancelled") return "cancelled";
  const now = Date.now();
  const start = new Date(featured.startDate).getTime();
  const end = new Date(featured.endDate).getTime();
  if (now < start) return "upcoming";
  if (now > end) return "ended";
  return "active";
}

// ─── Featured Mock Exam Card ──────────────────────────────────
export default function FeaturedMockExamCard({
  featured,
  isLoading,
  userId,
}: {
  featured: any;
  isLoading: boolean;
  userId?: string;
  /** @deprecated use internal navigate instead */
  onStart?: () => void;
}) {
  const navigate = useNavigate();

  const examId =
    featured && typeof featured.exam === "object" ? featured.exam._id : featured?.exam;
  const versionId =
    featured?.examVersion && typeof featured.examVersion === "object"
      ? featured.examVersion._id
      : featured?.examVersion;

  const examName = featured && typeof featured.exam === "object" ? featured.exam.name : "";
  const versionName =
    featured?.examVersion && typeof featured.examVersion === "object"
      ? featured.examVersion.examVersion
      : "";

  const effectiveStatus = getEffectiveStatus(featured);
  const isLive = effectiveStatus === "active";
  const isUpcoming = effectiveStatus === "upcoming";
  const isEnded = effectiveStatus === "ended" || effectiveStatus === "cancelled";
  const isCancelled = effectiveStatus === "cancelled";

  // Countdown target: upcoming → start date, live → end date
  const countdownTarget = isUpcoming ? featured?.startDate : featured?.endDate;
  const countdown = useCountdown(countdownTarget);

  // ─── Check if the user has already completed this scheduled exam ───
  const { data: userAttempts } = useGetUserAttemptsQuery(
    { userId: userId!, source: "mock_exam", limit: 50 },
    { skip: !userId || !examId }
  );

  const hasCompleted = !!userAttempts?.some((a: any) => {
    if (!a.isCompleted) return false;
    // Match by scheduleExam ID first
    const attemptScheduleId = String(a.scheduleExam?._id || a.scheduleExam || "");
    if (attemptScheduleId && featured?._id) {
      return attemptScheduleId === String(featured._id);
    }
    // Fallback: match by exam + version
    const attemptExamId = String(a.exam?._id || a.exam || "");
    if (attemptExamId !== String(examId)) return false;
    if (versionId) {
      const attemptVersionId = String(a.examVersion?._id || a.examVersion || "");
      if (attemptVersionId && attemptVersionId !== String(versionId)) return false;
    }
    return true;
  });

  // ─── Navigate directly into the exam page ─────────────────────────
  const handleStartExam = () => {
    if (!examId || !isLive || hasCompleted) return;
    const versionParam = versionId ? `&versionId=${versionId}` : "";
    const scheduleParam = featured?._id ? `&scheduleId=${featured._id}` : "";
    const boardParam =
      featured?.board && featured.board !== "undefined" && featured.board !== "null"
        ? `&board=${encodeURIComponent(featured.board)}`
        : "";
    navigate(
      `/mock-exam/selected-exam/exam-page?examId=${examId}${versionParam}${scheduleParam}${boardParam}`
    );
  };

  // ─── Loading skeleton ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="lg:col-span-2 bg-[#111318] border border-[#23262D] rounded-2xl p-6 flex items-center justify-center min-h-[260px]">
        <Loader2 size={28} className="animate-spin text-[#9B51E0]" />
      </div>
    );
  }

  // ─── No featured exam ──────────────────────────────────────────────
  if (!featured) {
    return (
      <div className="lg:col-span-2 bg-[#111318] border border-[#23262D] rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[260px]">
        <div className="w-14 h-14 bg-[#9B51E0]/10 border border-[#9B51E0]/30 rounded-2xl flex items-center justify-center mb-4">
          <ClipboardCheck size={24} className="text-[#9B51E0]" />
        </div>
        <h3 className="font-bold text-base text-[#F5F7FA] mb-1">No Featured Mock Exam</h3>
        <p className="text-xs text-[#A1A8B3] max-w-sm mb-5">
          No mock exam is being featured right now. Browse all available mock exams and practice tests.
        </p>
        <button
          onClick={() => navigate("/mock-exam")}
          className="inline-flex items-center gap-2 bg-[#161920] text-[#F5F7FA] border border-[#23262D] px-5 py-2.5 rounded-xl font-bold text-xs hover:border-[#9B51E0]/50 hover:text-[#9B51E0] transition-all"
        >
          <PlayCircle size={15} />
          Browse Mock Exams
        </button>
      </div>
    );
  }

  // ─── Ended / Cancelled banner ──────────────────────────────────────
  if (isEnded) {
    return (
      <div className="lg:col-span-2 bg-[#111318] border border-[#23262D] rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[260px]">
        <div className="w-14 h-14 bg-[#EB5757]/10 border border-[#EB5757]/30 rounded-2xl flex items-center justify-center mb-4">
          <Clock size={24} className="text-[#EB5757]" />
        </div>
        <span className="px-2.5 py-1 bg-[#EB5757]/10 text-[#EB5757] border border-[#EB5757]/30 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
          {isCancelled ? "Cancelled" : "Ended"}
        </span>
        <h3 className="font-bold text-base text-[#F5F7FA] mb-1">
          {isCancelled ? "Mock Exam Cancelled" : "Mock Exam Has Ended"}
        </h3>
        <p className="text-xs text-[#A1A8B3] max-w-sm mb-5">
          {isCancelled
            ? "This mock exam was cancelled."
            : `"${featured.title}" has ended. Browse other available mock exams.`}
        </p>
        <button
          onClick={() => navigate("/mock-exam")}
          className="inline-flex items-center gap-2 bg-[#161920] text-[#F5F7FA] border border-[#23262D] px-5 py-2.5 rounded-xl font-bold text-xs hover:border-[#9B51E0]/50 hover:text-[#9B51E0] transition-all"
        >
          <PlayCircle size={15} />
          Browse Mock Exams
        </button>
      </div>
    );
  }

  // ─── Main card (Upcoming or Live) ─────────────────────────────────
  return (
    <div className="lg:col-span-2 bg-gradient-to-br from-[#111318] to-[#1C1F26] border border-[#23262D] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#9B51E0]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              isLive
                ? "bg-[#00E5B3]/10 text-[#00E5B3] border-[#00E5B3]/30"
                : "bg-[#2F80ED]/10 text-[#2F80ED] border-[#2F80ED]/30"
            }`}
          >
            {isLive ? "🔴 Live Now" : "Upcoming Mock Exam"}
          </span>
          {isLive && (
            <span className="text-[11px] text-[#A1A8B3] flex items-center gap-1">
              <Clock size={12} className="text-[#9B51E0]" />
              {countdown
                ? countdown.days > 0
                  ? `${countdown.days}d ${countdown.hours}h ${countdown.mins}m remaining`
                  : `${countdown.hours}:${countdown.mins}:${countdown.secs} remaining`
                : "—"}
            </span>
          )}
        </div>

        <h2 className="text-2xl font-extrabold text-[#F5F7FA] mb-1">{featured.title}</h2>
        <p className="text-xs text-[#A1A8B3] mb-6">
          {[examName, versionName, featured.totalQuestions ? `${featured.totalQuestions} Questions` : "", featured.duration ? `${featured.duration} Minutes` : ""]
            .filter(Boolean)
            .join(" • ") || featured.description || "Mock Exam"}
        </p>

        {/* Countdown timer blocks */}
        <div className="grid grid-cols-4 gap-3 mb-6 max-w-xs">
          {[
            { val: countdown?.days != null ? String(countdown.days).padStart(2, "0") : "--", label: "Days" },
            { val: countdown?.hours ?? "--", label: isUpcoming ? "Hours" : "Hrs Left" },
            { val: countdown?.mins ?? "--", label: isUpcoming ? "Mins" : "Mins Left" },
            { val: countdown?.secs ?? "--", label: isUpcoming ? "Secs" : "Secs Left" },
          ].map((t, i) => (
            <div key={i} className="bg-[#161920] border border-[#23262D] p-3 rounded-xl text-center">
              <div className="text-xl font-extrabold text-[#F5F7FA]">{t.val}</div>
              <div className="text-[9px] text-[#9B51E0] uppercase font-bold mt-0.5">{t.label}</div>
            </div>
          ))}
        </div>

        {isUpcoming && (
          <p className="text-xs text-[#A1A8B3]">
            <Clock size={11} className="inline mr-1 text-[#2F80ED]" />
            This exam hasn't started yet. Come back when it goes live.
          </p>
        )}
      </div>

      {/* CTA — only shown for live exams */}
      {isLive && (
        hasCompleted ? (
          /* User already completed this exam */
          <div className="mt-4 w-full flex items-center justify-center gap-2 bg-[#00E5B3]/10 text-[#00E5B3] border border-[#00E5B3]/30 py-3 rounded-xl font-bold text-xs">
            <CheckCircle2 size={15} />
            You've Completed This Exam
            <Trophy size={14} className="ml-1 text-yellow-400" />
          </div>
        ) : (
          <button
            onClick={handleStartExam}
            className="mt-4 w-full bg-[#9B51E0] text-white py-3 rounded-xl font-bold text-xs hover:bg-[#883ECE] transition-all shadow-[0_4px_12px_rgba(155,81,224,0.4)] hover:shadow-[0_4px_20px_rgba(155,81,224,0.6)]"
          >
            Start Exam Now →
          </button>
        )
      )}
    </div>
  );
}
