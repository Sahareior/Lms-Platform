import React from 'react';
import { Clock, TrendingUp, CalendarRange } from 'lucide-react';
import { useGetImportentTopicsQuery } from '@my-monorepo/store/src/redux/api/examApi';

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

  const getLevel = (score: number): keyof typeof levelStyles => {
    if (score >= 75) return 'High';
    if (score >= 50) return 'Medium';
    return 'Low';
  };

  const renderEmptyState = () => (
    <div className="rounded-2xl border border-[#23262D] bg-[#111318] p-6 text-sm text-[#A1A8B3]">
      No high-probability topic prediction is available for this exam yet.
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00E5B3]/10 border border-[#00E5B3]/30 flex items-center justify-center text-[#00E5B3] text-xs font-extrabold">
            AI
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#F5F7FA] tracking-tight">
              AI Predicted High-Probability Topics
            </h2>
            <p className="text-xs text-[#A1A8B3] font-medium">
              {examId ? `Exam pattern insights for ${examId.slice(-8)}` : 'Pattern Analysis Overview'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-5 text-[11px] font-bold text-[#A1A8B3]">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${dotStyles.High}`} /> High
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${dotStyles.Medium}`} /> Medium
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${dotStyles.Low}`} /> Low
          </span>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-[#23262D] bg-[#111318] p-6 text-sm text-[#A1A8B3]">
          Loading predicted topics...
        </div>
      )}

      {isError && !isLoading && renderEmptyState()}

      {!isLoading && !isError && topics.length === 0 && renderEmptyState()}

      {!isLoading && !isError && topics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {topics.map((item) => {
            const level = getLevel(item.score);
            const versionCount = Object.values(item.examVersionsHistory ?? {}).reduce((sum, value) => sum + value, 0);

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

                  <div className="space-y-2 text-[11px] text-[#A1A8B3] mb-3">
                    <div className="flex items-center gap-2">
                      <Clock size={13} />
                      <span>{item.frequency} {item.frequency === 1 ? 'appearance' : 'appearances'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={13} />
                      <span>Score {item.score}% &bull; Trend +{item.positiveTrend}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarRange size={13} />
                      <span>Last appeared: {item.last_appeared || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#23262D] pt-3.5 mt-1 text-xs">
                    <span className="font-bold text-[#F5F7FA]">{item.frequency}x</span>
                    <span className="text-[#A1A8B3]">
                      {item.share_percentage.toFixed(1)}% share
                    </span>
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
