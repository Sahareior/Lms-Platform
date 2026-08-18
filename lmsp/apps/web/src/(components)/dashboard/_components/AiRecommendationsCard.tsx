import { Brain, Calendar, Sparkles } from "lucide-react";

interface Recommendation {
  title: string;
  desc: string;
  color: string;
}

// ─── AI Recommended panel ──────────────────────────────────
export default function AiRecommendationsCard({
  scope,
  aiStats,
  aiReportLoading,
  aiReportError,
  aiInsights,
  activeVerdict,
  verdictColor,
  verdictMessage,
  recommendations,
  hasRecommendationContent,
  onViewAll,
}: {
  scope: string;
  aiStats: any;
  aiReportLoading: boolean;
  aiReportError: boolean | string | null;
  aiInsights: any;
  activeVerdict: string | null;
  verdictColor: string;
  verdictMessage: string;
  recommendations: Recommendation[];
  hasRecommendationContent: boolean;
  onViewAll: () => void;
}) {
  return (
    <div className="bg-[#111318] border border-[#23262D] rounded-2xl p-6 flex flex-col justify-between space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-[#00E5B3]/10 border border-[#00E5B3]/30 rounded-lg text-[#00E5B3]">
          <Brain size={16} />
        </div>
        <h2 className="font-bold text-base text-[#F5F7FA]">AI Recommended</h2>
        {scope !== "all" && aiStats?.exam && (
          <span className="ml-auto text-[10px] text-[#A1A8B3] bg-[#161920] px-2 py-0.5 rounded-lg border border-[#23262D]">
            {aiStats.exam}
          </span>
        )}
        {aiReportLoading && (
          <span className="ml-auto text-[10px] text-[#A1A8B3] animate-pulse">
            Analyzing…
          </span>
        )}
        {aiReportError && (
          <span className="ml-auto text-[10px] text-[#EB5757]">Unavailable</span>
        )}
      </div>
      {hasRecommendationContent ? (
        <div className="h-[310px] overflow-y-auto space-y-3">
          <div
            className="rounded-xl p-3 border text-center"
            style={{ borderColor: `${verdictColor}40`, background: `${verdictColor}14` }}
          >
            <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: verdictColor }}>
              {activeVerdict}
            </div>
            <p className="text-[10px] text-[#A1A8B3] mt-1 leading-relaxed">
              {verdictMessage}
            </p>
          </div>
          {(aiInsights?.study_plan?.length ?? 0) > 0 && (
            <div className="rounded-xl p-3 border border-[#2F80ED]/30 bg-[#2F80ED]/10">
              <div className="flex items-center gap-1.5 mb-2">
                <Calendar size={12} className="text-[#2F80ED]" />
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#2F80ED]">
                  Study Plan
                </span>
              </div>
              <div className="space-y-1.5">
                {aiInsights!.study_plan.slice(0, 3).map((plan: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-[10px]">
                    <span className="font-bold text-[#F5F7FA] flex-shrink-0">{plan.day}</span>
                    <span className="text-[#A1A8B3] leading-snug">
                      {plan.title}
                      <span className="text-[#6B7280] block">{plan.duration_minutes} min</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {recommendations.length > 0 ? (
            recommendations.map((item, index) => (
              <div
                key={index}
                className={`bg-[#161920] border border-[#23262D] border-l-4 ${item.color} rounded-xl p-3 hover:border-[#323742] transition-all`}
              >
                <h3 className="font-bold text-xs text-[#F5F7FA]">{item.title}</h3>
                <p className="text-[10px] font-semibold text-[#A1A8B3] mt-0.5">{item.desc}</p>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center text-center gap-2 py-8">
              <Sparkles size={20} className="text-[#00E5B3]" />
              <p className="text-[10px] text-[#A1A8B3]">
                No focus areas yet — keep practicing and we'll surface them here.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="h-[310px] flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 bg-[#00E5B3]/10 border border-[#00E5B3]/30 rounded-2xl flex items-center justify-center">
            <Brain size={20} className="text-[#00E5B3]" />
          </div>
          <p className="text-xs text-[#A1A8B3] max-w-[220px]">
            No performance data yet. Complete a few quizzes to unlock your personalized analysis.
          </p>
        </div>
      )}
      <button
        onClick={onViewAll}
        className="w-full text-xs font-bold text-[#00E5B3] bg-[#00E5B3]/10 border border-[#00E5B3]/30 rounded-xl py-2 hover:bg-[#00E5B3]/20 transition-all"
      >
        View All AI Insights
      </button>
    </div>
  );
}
