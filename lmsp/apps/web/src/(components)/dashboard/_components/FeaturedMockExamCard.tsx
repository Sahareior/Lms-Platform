import { useState, useEffect } from "react";
import { ClipboardCheck, Clock, Loader2, PlayCircle } from "lucide-react";

// ─── Countdown hook for the featured mock exam ────────────
function useCountdown(targetIso?: string | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!targetIso) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  if (!targetIso) return null;
  const diff = Math.max(0, new Date(targetIso).getTime() - now);
  const hours = Math.floor(diff / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  const secs = Math.floor((diff % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return { diff, hours: pad(hours), mins: pad(mins), secs: pad(secs) };
}

// ─── Featured Mock Exam Card ──────────────────────────────
export default function FeaturedMockExamCard({
  featured,
  isLoading,
  onStart,
}: {
  featured: any;
  isLoading: boolean;
  onStart: () => void;
}) {
  const examName = featured && typeof featured.exam === "object" ? featured.exam.name : "";
  const versionName =
    featured && typeof featured.examVersion === "object" ? featured.examVersion.examVersion : "";
  const status = featured?.status;
  const isLive = status === "active";
  const isUpcoming = status === "upcoming";
  // Count down to the start date for upcoming exams, otherwise to the end date
  const countdownTarget = isUpcoming ? featured?.startDate : featured?.endDate;
  const countdown = useCountdown(countdownTarget);
  // Expired when the backend marked it completed/cancelled, or the countdown ran out
  const isExpired =
    status === "completed" ||
    status === "cancelled" ||
    (!isUpcoming && countdown?.diff === 0);

  if (isLoading) {
    return (
      <div className="lg:col-span-2 bg-[#111318] border border-[#23262D] rounded-2xl p-6 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#9B51E0]" />
      </div>
    );
  }

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
          onClick={onStart}
          className="inline-flex items-center gap-2 bg-[#161920] text-[#F5F7FA] border border-[#23262D] px-5 py-2.5 rounded-xl font-bold text-xs hover:border-[#9B51E0]/50 hover:text-[#9B51E0] transition-all"
        >
          <PlayCircle size={15} />
          Browse Mock Exams
        </button>
      </div>
    );
  }

  // Time limit expired → show a suitable ended/cancelled banner instead of the live card
  if (isExpired) {
    const isCancelled = status === "cancelled";
    return (
      <div className="lg:col-span-2 bg-[#111318] border border-[#23262D] rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[260px]">
        <div className="w-14 h-14 bg-[#EB5757]/10 border border-[#EB5757]/30 rounded-2xl flex items-center justify-center mb-4">
          <Clock size={24} className="text-[#EB5757]" />
        </div>
        <span className="px-2.5 py-1 bg-[#EB5757]/10 text-[#EB5757] border border-[#EB5757]/30 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
          {isCancelled ? "Cancelled" : "Time Limit Expired"}
        </span>
        <h3 className="font-bold text-base text-[#F5F7FA] mb-1">
          {isCancelled ? "Mock Exam Cancelled" : "Mock Exam Has Ended"}
        </h3>
        <p className="text-xs text-[#A1A8B3] max-w-sm mb-5">
          {isCancelled
            ? "This mock exam was cancelled. Browse all available mock exams and practice tests."
            : `The time window for "${featured.title}" has expired. Browse all available mock exams and practice tests.`}
        </p>
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 bg-[#161920] text-[#F5F7FA] border border-[#23262D] px-5 py-2.5 rounded-xl font-bold text-xs hover:border-[#9B51E0]/50 hover:text-[#9B51E0] transition-all"
        >
          <PlayCircle size={15} />
          Browse Mock Exams
        </button>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 bg-gradient-to-br from-[#111318] to-[#1C1F26] border border-[#23262D] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#9B51E0]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-1 bg-[#9B51E0]/20 text-[#9B51E0] border border-[#9B51E0]/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
            {isLive ? "Live Now" : isUpcoming ? "Upcoming Mock Exam" : "Featured Mock Exam"}
          </span>
          <span className="text-[11px] text-[#A1A8B3] flex items-center gap-1">
            <Clock size={12} className="text-[#9B51E0]" />
            {isUpcoming
              ? `Starts in ${countdown?.hours}:${countdown?.mins}:${countdown?.secs}`
              : `${countdown?.hours}:${countdown?.mins}:${countdown?.secs} remaining`}
          </span>
        </div>
        <h2 className="text-2xl font-extrabold text-[#F5F7FA] mb-1">{featured.title}</h2>
        <p className="text-xs text-[#A1A8B3] mb-6">
          {[examName, versionName, featured.totalQuestions ? `${featured.totalQuestions} Questions` : "", featured.duration ? `${featured.duration} Minutes` : ""]
            .filter(Boolean)
            .join(" • ") || featured.description || "Mock Exam"}
        </p>
        <div className="grid grid-cols-3 gap-3 mb-6 max-w-xs">
          {[
            { val: countdown?.hours ?? "--", label: "Hours" },
            { val: countdown?.mins ?? "--", label: "Mins" },
            { val: countdown?.secs ?? "--", label: "Secs" },
          ].map((t, i) => (
            <div key={i} className="bg-[#161920] border border-[#23262D] p-3 rounded-xl text-center">
              <div className="text-xl font-extrabold text-[#F5F7FA]">{t.val}</div>
              <div className="text-[9px] text-[#9B51E0] uppercase font-bold mt-0.5">{t.label}</div>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={onStart}
        className="w-full bg-[#9B51E0] text-white py-3 rounded-xl font-bold text-xs hover:bg-[#883ECE] transition-all shadow-[0_4px_12px_rgba(155,81,224,0.4)] hover:shadow-[0_4px_20px_rgba(155,81,224,0.6)]"
      >
        Start Exam Now
      </button>
    </div>
  );
}
