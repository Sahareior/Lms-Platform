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
  isDark,
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
  isDark: boolean;
}) {

  // ─── LIGHT MODE (Vintage/Editorial Style) ──────────────────
  if (!isDark) {
    return (
      <div 
        className="bg-[#f2efe9] border border-[#d8d4cb] rounded-lg p-5 flex flex-col justify-between space-y-4 shadow-[3px_3px_0px_0px_#1a1a1a]"
        style={{
          backgroundImage: 'radial-gradient(#d8d4cb 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 relative z-10">
          <Brain size={20} className="text-[#1a1a1a]" />
          <h2 className="font-black text-lg text-[#1a1a1a] font-serif">AI Recommended</h2>
          {scope !== "all" && aiStats?.exam && (
            <span className="ml-auto text-[10px] text-[#1a1a1a] bg-[#e0dcd5] px-2 py-0.5 rounded-md border border-[#d8d4cb] font-serif font-bold uppercase tracking-wider">
              {aiStats.exam}
            </span>
          )}
          {aiReportLoading && (
            <span className="ml-auto text-[10px] text-[#4a4a4a] animate-pulse font-serif italic">
              Analyzing…
            </span>
          )}
          {aiReportError && (
            <span className="ml-auto text-[10px] text-[#b91c1c] font-serif font-bold">Unavailable</span>
          )}
        </div>

        {/* Content */}
        {hasRecommendationContent ? (
          <div className="h-[310px] overflow-y-auto space-y-3 relative z-10">
            {/* Verdict */}
            <div
              className="rounded-lg p-3 border text-center shadow-[2px_2px_0px_0px_#1a1a1a]"
              style={{ borderColor: '#1a1a1a', background: '#e0dcd5' }}
            >
              <div className="text-[15px] uppercase tracking-wider font-black font-serif text-[#b91c1c]">
                {activeVerdict} 
              </div>
              <p className="text-sm text-[#1a1a1a] font-serif mt-1 leading-relaxed">
                {verdictMessage}
              </p>
            </div>

            {/* Study Plan */}
            {(aiInsights?.study_plan?.length ?? 0) > 0 && (
              <div className="rounded-lg p-3 border border-[#d8d4cb] bg-[#f2efe9] shadow-[2px_2px_0px_0px_#1a1a1a]">
                <div className="flex items-center gap-1.5 mb-2 border-b border-[#d8d4cb] pb-1.5">
                  <Calendar size={13} className="text-[#b91c1c]" />
                  <span className="text-[12px] uppercase tracking-widest font-black text-[#1a1a1a] font-serif">
                    AI Study Plan
                  </span>
                </div>
                <div className="space-y-2">
                  {aiInsights!.study_plan.slice(0, 3).map((plan: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                      <span className="font-bold text-[#f2efe9] bg-[#1a1a1a] px-1.5 py-0.5 rounded text-xs font-serif">{plan.day}</span>
                      <span className="text-[#4a4a4a] leading-snug font-serif">
                        <span className="text-[#1a1a1a] font-bold block">{plan.title}</span>
                        <span className="text-xs">{plan.duration_minutes} minutes</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 ? (
              recommendations.map((item, index) => (
                <div
                  key={index}
                  className={`bg-[#f2efe9] border border-[#d8d4cb] border-l-4 ${item.color.replace('border-', 'border-[#1a1a1a] border-l-')} rounded-lg p-3 hover:shadow-[2px_2px_0px_0px_#1a1a1a] transition-all shadow-[1px_1px_0px_0px_#1a1a1a]`}
                >
                  <h3 className="font-bold text-base text-[#1a1a1a] font-serif leading-snug">{item.title}</h3>
                  <p className="text-sm text-[#4a4a4a] mt-1 font-serif leading-relaxed">{item.desc}</p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center text-center gap-2 py-8">
                <Sparkles size={20} className="text-[#b91c1c]" />
                <p className="text-[11px] text-[#4a4a4a] font-serif italic">
                  No focus areas yet — keep practicing and we'll surface them here.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Empty State (matches reference image) */
          <div className="h-[310px] flex flex-col items-center justify-center text-center gap-4 relative z-10">
            {/* Robot Illustration Placeholder */}
            <div className="w-24 h-24 rounded-lg border-2 border-[#1a1a1a] bg-[#e0dcd5] flex items-center justify-center shadow-[3px_3px_0px_0px_#1a1a1a] mb-2">
                <Brain size={40} className="text-[#1a1a1a]" />
            </div>
            <p className="text-xs text-[#1a1a1a] font-serif max-w-[220px] leading-relaxed">
              No performance data yet. Complete a few quizzes to unlock your personalized analysis.
            </p>
          </div>
        )}

        {/* Footer Button */}
        <button
          onClick={onViewAll}
          className="w-full text-sm font-bold font-serif text-[#1a1a1a] bg-[#f2efe9] border-2 border-[#1a1a1a] rounded-md py-2.5 hover:bg-[#e0dcd5] transition-all shadow-[2px_2px_0px_0px_#b91c1c] hover:shadow-[3px_3px_0px_0px_#b91c1c] relative z-10 flex items-center justify-center gap-2"
        >
          View All AI Insights
          <span className="text-[#b91c1c]">→</span>
        </button>
      </div>
    );
  }

  // ─── DARK MODE (Original Code - Unchanged) ─────────────────
  return (
    <div className="bg-[#111318] border border-[#23262D] rounded-2xl p-4 flex flex-col justify-between space-y-4">
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
            <div className="text-[15px] uppercase tracking-wider font-bold" style={{ color: verdictColor }}>
              {activeVerdict} 
            </div>
            <p className="text-[17px] text-white font-medium text-[#A1A8B3] mt-1 leading-relaxed">
              {verdictMessage}
            </p>
          </div>
          {(aiInsights?.study_plan?.length ?? 0) > 0 && (
            <div className="rounded-xl p-3 border border-[#2F80ED]/30 bg-[#2F80ED]/10">
              <div className="flex items-center gap-1.5 mb-2">
                <Calendar size={12} className="text-[#2F80ED]" />
                <span className="text-[13px] uppercase tracking-wider font-bold text-[#2F80ED]">
                  AI স্টাডি প্ল্যান
                </span>
              </div>
              <div className="space-y-1.5">
                {aiInsights!.study_plan.slice(0, 3).map((plan: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 text-[15px]">
                    <span className="font-bold text-[#00E5B3] flex-shrink-0 bg-[#00E5B3]/10 px-1.5 py-0.5 rounded text-xs">{plan.day}</span>
                    <span className="text-[#A1A8B3] leading-snug">
                      <span className="text-[#F5F7FA] font-medium block">{plan.title}</span>
                      <span className="text-[#6B7280] text-xs">{plan.duration_minutes} মিনিট</span>
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
                <h3 className="font-bold text-[17px] text-[#F5F7FA] leading-snug">{item.title}</h3>
                <p className="text-[15px] text-[#A1A8B3] mt-1 leading-relaxed">{item.desc}</p>
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