import { Target } from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from 'recharts';

// ─── Subject Strength Map (radar chart) ────────────────────
export default function RadarChartCard({
  radarData,
  primaryColor,
  strongest,
  weakest,
  isDark,
}: {
  radarData: Array<{ subject: string; value: number; fullMark: number }>;
  primaryColor: string;
  strongest: { subject: string; value: number } | null;
  weakest: { subject: string; value: number } | null;
  isDark: boolean;
}) {
  const cardClass = isDark ? 'bg-[#111318] border-[#23262D]' : 'bg-[#f2efe9] border-[#d8d4cb] shadow-[2px_2px_0px_0px_#1a1a1a]';
  const titleClass = isDark ? 'text-[#F5F7FA]' : 'text-[#1a1a1a] font-serif';
  const subClass = isDark ? 'text-[#A1A8B3]' : 'text-[#4a4a4a] font-serif italic';
  const strongText = isDark ? 'text-[#F5F7FA]' : 'text-[#1a1a1a] font-serif';

  return (
    <div className={`p-5 rounded-2xl border ${cardClass}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className={`font-bold ${titleClass}`}>Subject Strength Map</h3>
          <p className={`text-[10px] ${subClass}`}>
            {radarData.length > 0
              ? `Accuracy % across ${radarData.length} subject${radarData.length !== 1 ? 's' : ''}`
              : 'No subject data yet'}
          </p>
        </div>
      </div>
      {radarData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[280px] text-center gap-2">
          <Target size={22} className={isDark ? 'text-[#2F80ED]' : 'text-[#1a1a1a]'} />
          <p className={`text-xs ${subClass}`}>
            No subject data yet — generate an AI report to see your strengths and weak areas.
          </p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 h-[280px]">
          <div className="w-full h-full max-w-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke={isDark ? '#23262D' : '#d8d4cb'} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: isDark ? '#A1A8B3' : '#4a4a4a', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: isDark ? '#A1A8B3' : '#4a4a4a' }} />
                <Radar name="Accuracy" dataKey="value" stroke={primaryColor} fill={primaryColor} fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-1 text-xs">
            {strongest && weakest ? (
              <>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#00E5B3]"></div>
                  <span className={`font-semibold ${strongText}`}>Strongest:</span> {strongest.subject} {strongest.value}%
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#EB5757]"></div>
                  <span className={`font-semibold ${strongText}`}>Weakest:</span> {weakest.subject} {weakest.value}%
                </div>
              </>
            ) : (
              <div className={`text-[10px] ${subClass}`}>More subject data needed for comparison.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
