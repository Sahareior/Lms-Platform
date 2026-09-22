import React from 'react';
import { Clock, TrendingUp, CalendarRange } from 'lucide-react';
import { useGetImportentTopicsQuery } from '@my-monorepo/store/src/redux/api/examApi';
import { useTheme } from '../../../../theme/ThemeContext';

interface TopicPrediction {
  rank: number;
  topic: string;
  subject: string;
  frequency: number;
  score: number;
  share_percentage: number;
  examVersionsHistory: Record<string, number>;
  last_appeared: string;
  gap: number;
  appearedInLastExam: number;
  positiveTrend: number;
}

interface ImportantTopicsApiResponse {
  success: boolean;
  topics: TopicPrediction[];
}

interface AiPredictTopicProps {
  examId?: string | null;
}

const AiPredictTopic = ({ examId }: AiPredictTopicProps) => {
  const { isDark } = useTheme();
  const { data, isLoading, isError } = useGetImportentTopicsQuery(examId || '', {
    skip: !examId,
  });

  const topics = (data as ImportantTopicsApiResponse | undefined)?.topics ?? [];

  const levelStyles: Record<string, string> = {
    High: 'bg-[#00E5B3]/10 text-[#00E5B3] border-[#00E5B3]/30',
    Medium: 'bg-[#F2C94C]/10 text-[#F2C94C] border-[#F2C94C]/30',
    Low: 'bg-[#A1A8B3]/10 text-[#A1A8B3] border-[#A1A8B3]/30',
  };

  const dotStyles: Record<string, string> = {
    High: 'bg-[#00E5B3]',
    Medium: 'bg-[#F2C94C]',
    Low: 'bg-[#A1A8B3]',
  };

  // Light-mode level badges (monochrome vintage)
  const levelStylesLight: Record<string, string> = {
    High: 'bg-[#1a1a1a] text-[#f2efe9] border-[#1a1a1a] font-serif',
    Medium: 'bg-[#f2efe9] text-[#b91c1c] border-[#b91c1c] font-serif',
    Low: 'bg-[#e0dcd5] text-[#4a4a4a] border-[#d8d4cb] font-serif',
  };

  const dotStylesLight: Record<string, string> = {
    High: 'bg-[#1a1a1a]',
    Medium: 'bg-[#b91c1c]',
    Low: 'bg-[#4a4a4a]',
  };

  const getLevel = (score: number): keyof typeof levelStyles => {
    if (score >= 75) return 'High';
    if (score >= 50) return 'Medium';
    return 'Low';
  };

  const renderEmptyState = () => (
    <div
      className={`rounded-2xl border p-6 text-sm ${
        isDark
          ? 'border-[#23262D] bg-[#111318] text-[#A1A8B3]'
          : 'border-2 border-[#1a1a1a] bg-[#f2efe9] text-[#333] font-serif shadow-[3px_3px_0px_0px_#1a1a1a]'
      }`}
    >
      No high-probability topic prediction is available for this exam yet.
    </div>
  );

  return (
    <div className="space-y-5 ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex  items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold ${
              isDark
                ? 'bg-[#00E5B3]/10 border border-[#00E5B3]/30 text-[#00E5B3]'
                : 'bg-[#1a1a1a] border-2 border-[#1a1a1a] text-[#f2efe9] font-serif shadow-[2px_2px_0px_0px_#b91c1c]'
            }`}
          >
            AI
          </div>
          <div>
            <h2
              className={
                isDark
                  ? 'text-lg font-extrabold text-[#F5F7FA] tracking-tight'
                  : 'text-lg font-black text-[#1a1a1a] tracking-tight font-serif'
              }
            >
              AI Predicted High-Probability Topics
            </h2>
            <p
              className={
                isDark
                  ? 'text-xs text-[#A1A8B3] font-medium'
                  : 'text-xs text-[#333] font-serif'
              }
            >
              {examId ? `Exam pattern insights for ${examId.slice(-8)}` : 'Pattern Analysis Overview'}
            </p>
          </div>
        </div>

        <div
          className={
            isDark
              ? 'flex items-center gap-5 text-[11px] font-bold text-[#A1A8B3]'
              : 'flex items-center gap-5 text-[11px] font-black text-[#1a1a1a] font-serif uppercase tracking-wider'
          }
        >
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isDark ? dotStyles.High : dotStylesLight.High}`} /> High
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isDark ? dotStyles.Medium : dotStylesLight.Medium}`} /> Medium
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isDark ? dotStyles.Low : dotStylesLight.Low}`} /> Low
          </span>
        </div>
      </div>

      {isLoading && (
        <div
          className={`rounded-2xl border p-6 text-sm ${
            isDark
              ? 'border-[#23262D] bg-[#111318] text-[#A1A8B3]'
              : 'border-2 border-[#1a1a1a] bg-[#f2efe9] text-[#333] font-serif shadow-[3px_3px_0px_0px_#1a1a1a]'
          }`}
        >
          Loading predicted topics...
        </div>
      )}

      {isError && !isLoading && renderEmptyState()}

      {!isLoading && !isError && topics.length === 0 && renderEmptyState()}

      {!isLoading && !isError && topics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {topics.map((item) => {
            const level = getLevel(item.score);
            const versionCount = Object.values(item.examVersionsHistory ?? {}).reduce(
              (sum, value) => sum + value,
              0
            );

            // ─── LIGHT MODE CARD ───
            if (!isDark) {
              return (
                <div
                  key={`${item.topic}-${item.rank}`}
                  className="bg-[#f2efe9] rounded-lg border-2 border-[#1a1a1a] overflow-hidden hover:-translate-y-1 transition-all duration-300 group shadow-[3px_3px_0px_0px_#1a1a1a] hover:shadow-[4px_4px_0px_0px_#1a1a1a]"
                  style={{
                    backgroundImage: 'radial-gradient(#d8d4cb 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                  }}
                >
                  {/* Top accent — solid dark red */}
                  <div className="h-1.5 bg-[#b91c1c]" />

                  <div className="p-5 relative z-10">
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 bg-[#1a1a1a] text-[#f2efe9] text-xs font-black rounded-md flex items-center justify-center flex-shrink-0 font-serif border border-[#1a1a1a] shadow-[1px_1px_0px_0px_#b91c1c]">
                          {item.rank}
                        </span>
                        <div>
                          <h4 className="text-sm font-black text-[#1a1a1a] leading-snug group-hover:text-[#b91c1c] transition-colors font-serif">
                            {item.topic}
                          </h4>
                          <span className="text-[11px] text-[#333] font-serif">
                            {item.subject}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] px-2.5 py-1 rounded-md flex-shrink-0 border-2 ${
                          levelStylesLight[level]
                        } font-black uppercase tracking-wider`}
                      >
                        {level}
                      </span>
                    </div>

                    <div className="space-y-2 text-[11px] mb-3 text-[#333] font-serif">
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-[#1a1a1a]" />
                        <span>
                          {item.frequency} {item.frequency === 1 ? 'appearance' : 'appearances'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp size={13} className="text-[#b91c1c]" />
                        <span>
                          Score <strong className="font-black text-[#1a1a1a]">{item.score}%</strong> &bull; Trend +
                          {item.positiveTrend}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarRange size={13} className="text-[#1a1a1a]" />
                        <span>Last appeared: {item.last_appeared || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t-2 border-[#d8d4cb] pt-3.5 mt-1 text-xs">
                      <span className="font-black text-[#1a1a1a] font-serif">{item.frequency}x</span>
                      <span className="text-[#333] font-serif">{item.share_percentage.toFixed(1)}% share</span>
                      <span className="text-[#333] font-serif">{versionCount} versions</span>
                    </div>
                  </div>
                </div>
              );
            }

            // ─── DARK MODE CARD (original) ───
            return (
              <div
                key={`${item.topic}-${item.rank}`}
                className="bg-[#111318] rounded-2xl border border-[#23262D] overflow-hidden hover:border-[#00E5B3]/50 hover:shadow-[0_0_15px_-3px_rgba(0,229,179,0.15)] hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="h-1 bg-gradient-to-r from-[#00E5B3] to-[#00C8FF]" />

                <div className="p-5">
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 bg-gradient-to-br from-[#00E5B3] to-[#00C8FF] text-black text-xs font-bold rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.rank}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-[#F5F7FA] leading-snug group-hover:text-[#00E5B3] transition-colors">
                          {item.topic}
                        </h4>
                        <span className="text-[11px] text-[#A1A8B3] font-semibold">
                          {item.subject}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg flex-shrink-0 ${levelStyles[level]}`}
                    >
                      {level}
                    </span>
                  </div>

                  <div className="space-y-2 text-[11px] mb-3 text-[#A1A8B3]">
                    <div className="flex items-center gap-2">
                      <Clock size={13} />
                      <span>
                        {item.frequency} {item.frequency === 1 ? 'appearance' : 'appearances'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={13} />
                      <span>
                        Score {item.score}% &bull; Trend +{item.positiveTrend}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarRange size={13} />
                      <span>Last appeared: {item.last_appeared || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#23262D] pt-3.5 mt-1 text-xs">
                    <span className="font-bold text-[#F5F7FA]">{item.frequency}x</span>
                    <span className="text-[#A1A8B3]">{item.share_percentage.toFixed(1)}% share</span>
                    <span className="text-[#A1A8B3]">{versionCount} versions</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AiPredictTopic;