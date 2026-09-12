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

function WeeklyTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null;
  const day = payload[0].payload as WeeklyDay;
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
}: {
  weeklyDays: WeeklyDay[];
  todayIndex: number;
  weeklyTotalAttempts: number;
  isLoading: boolean;
}) {
  return (
    <div className="bg-[#111318] border border-[#23262D] rounded-2xl p-6">
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
                content={<WeeklyTooltip />}
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
