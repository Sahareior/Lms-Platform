import { BarChart3, Loader2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

export interface WeeklyDay {
  label: string;
  key: string;
  attempts: number;
  questions: number;
  correct: number;
}

function WeeklyTooltip({ active, payload, isDark }: any) {
  if (!active || !payload || payload.length === 0) return null;
  const day = payload[0].payload as WeeklyDay;

  if (!isDark) {
    return (
      <div className="bg-[#f2efe9] border-2 border-[#1a1a1a] rounded-md px-3 py-2 text-xs shadow-[3px_3px_0px_0px_#1a1a1a] font-serif">
        <p className="font-black text-[#1a1a1a] mb-1 uppercase tracking-wider text-[10px]">{day.label}</p>
        <p className="text-[#4a4a4a]">
          Attempts: <span className="text-[#1a1a1a] font-bold">{day.attempts}</span>
        </p>
        <p className="text-[#4a4a4a]">
          Questions: <span className="text-[#1a1a1a] font-bold">{day.questions}</span>
        </p>
        <p className="text-[#4a4a4a]">
          Correct: <span className="text-[#b91c1c] font-bold">{day.correct}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#1C1F26] border border-[#323742] rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="font-bold text-[#F5F7FA] mb-1">{day.label}</p>
      <p className="text-[#A1A8B3]">
        Attempts: <span className="text-[#F5F7FA] font-semibold">{day.attempts}</span>
      </p>
      <p className="text-[#A1A8B3]">
        Questions: <span className="text-[#F5F7FA] font-semibold">{day.questions}</span>
      </p>
      <p className="text-[#A1A8B3]">
        Correct: <span className="text-[#00E5B3] font-semibold">{day.correct}</span>
      </p>
    </div>
  );
}

// ─── Weekly Study Activity card ────────────────────────────
export default function WeeklyActivityChart({
  weeklyDays,
  todayIndex,
  weeklyTotalAttempts,
  isLoading,
  isDark,
}: {
  weeklyDays: WeeklyDay[];
  todayIndex: number;
  weeklyTotalAttempts: number;
  isLoading: boolean;
  isDark: boolean;
}) {
  // ─── LIGHT MODE (Vintage/Editorial Style) ──────────────────
  if (!isDark) {
    return (
      <div 
        className="bg-[#f2efe9] border border-[#d8d4cb] rounded-lg p-5 shadow-[3px_3px_0px_0px_#1a1a1a]"
        style={{
          backgroundImage: 'radial-gradient(#d8d4cb 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <BarChart3 size={18} className="text-[#1a1a1a]" />
              <h3 className="text-lg font-black text-[#1a1a1a] font-serif">Weekly Study Activity</h3>
            </div>
            <p className="text-xs text-[#4a4a4a] font-serif italic">Your daily quiz activity this week</p>
          </div>
          <span className="text-[10px] text-[#1a1a1a] bg-[#e0dcd5] px-2 py-1 rounded-md border border-[#d8d4cb] font-serif font-bold uppercase tracking-widest">
            {isLoading
              ? "This Week"
              : `${weeklyTotalAttempts} attempt${weeklyTotalAttempts !== 1 ? "s" : ""}`}
          </span>
        </div>

        {/* Chart */}
        {isLoading ? (
          <div className="flex items-center justify-center h-44">
            <Loader2 size={22} className="animate-spin text-[#b91c1c]" />
          </div>
        ) : weeklyTotalAttempts > 0 ? (
          <div className="h-44 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyDays} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#1a1a1a", fontSize: 11, fontFamily: "serif", fontWeight: "bold" }}
                  axisLine={{ stroke: "#1a1a1a" }}
                  tickLine={false}
                />
                <YAxis
                  width={32}
                  allowDecimals={false}
                  tick={{ fill: "#4a4a4a", fontSize: 10, fontFamily: "serif" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<WeeklyTooltip isDark={false} />}
                  cursor={{ fill: "rgba(185,28,28,0.08)" }}
                />
                <Bar dataKey="attempts" radius={[2, 2, 0, 0]} maxBarSize={28}>
                  {weeklyDays.map((d, i) => (
                    <Cell
                      key={d.key}
                      fill={i === todayIndex ? "#1a1a1a" : "#b91c1c"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-44 text-center gap-2">
            <BarChart3 size={22} className="text-[#1a1a1a]" />
            <p className="text-xs text-[#4a4a4a] font-serif italic max-w-[260px]">
              No study activity yet this week — complete quizzes to see your weekly progress
              here.
            </p>
          </div>
        )}
      </div>
    );
  }

  // ─── DARK MODE (Original Code - Unchanged) ─────────────────
  return (
    <div className="bg-[#111318] border border-[#23262D] rounded-2xl p-4">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-base font-bold text-[#F5F7FA]">Weekly Study Activity</h3>
          <p className="text-xs text-[#A1A8B3] mt-0.5">Your daily quiz activity this week</p>
        </div>
        <span className="text-[11px] text-[#A1A8B3] bg-[#161920] px-2.5 py-1 rounded-lg border border-[#23262D]">
          {isLoading
            ? "This Week"
            : `${weeklyTotalAttempts} attempt${weeklyTotalAttempts !== 1 ? "s" : ""} this week`}
        </span>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center h-44">
          <Loader2 size={22} className="animate-spin text-[#2F80ED]" />
        </div>
      ) : weeklyTotalAttempts > 0 ? (
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyDays} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fill: "#A1A8B3", fontSize: 11 }}
                axisLine={{ stroke: "#23262D" }}
                tickLine={false}
              />
              <YAxis
                width={32}
                allowDecimals={false}
                tick={{ fill: "#6B7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<WeeklyTooltip isDark={true} />}
                cursor={{ fill: "rgba(47,128,237,0.08)" }}
              />
              <Bar dataKey="attempts" radius={[6, 6, 0, 0]} maxBarSize={28}>
                {weeklyDays.map((d, i) => (
                  <Cell
                    key={d.key}
                    fill={i === todayIndex ? "#00E5B3" : "#2F80ED"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-44 text-center gap-2">
          <BarChart3 size={22} className="text-[#2F80ED]" />
          <p className="text-xs text-[#A1A8B3] max-w-[260px]">
            No study activity yet this week — complete quizzes to see your weekly progress
            here.
          </p>
        </div>
      )}
    </div>
  );
}