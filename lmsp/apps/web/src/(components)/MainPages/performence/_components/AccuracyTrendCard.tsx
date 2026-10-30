import { BookOpen } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ─── Accuracy Trend (area chart) ───────────────────────────
export default function AccuracyTrendCard({
  trendData,
  usingHistoryTrend,
  overallAccuracy,
  verdict,
  successColor,
  isDark,
}: {
  trendData: Array<{ day: string; accuracy: number }>;
  usingHistoryTrend: boolean;
  overallAccuracy: number | null | undefined;
  verdict?: string;
  successColor: string;
  isDark: boolean;
}) {
  const cardClass = isDark ? 'bg-[#111318] border-[#23262D]' : 'bg-[#f2efe9] border-[#d8d4cb] shadow-[2px_2px_0px_0px_#1a1a1a]';
  const titleClass = isDark ? 'text-[#F5F7FA]' : 'text-[#1a1a1a] font-serif';
  const subClass = isDark ? 'text-[#A1A8B3]' : 'text-[#4a4a4a] font-serif italic';

  return (
    <div className={`p-5 rounded-2xl border ${cardClass}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className={`font-bold ${titleClass}`}>Accuracy Trend</h3>
          <p className={`text-[10px] ${subClass}`}>
            {usingHistoryTrend
              ? `Progress over time • ${trendData.length} saved daily report${trendData.length !== 1 ? 's' : ''}`
              : 'No trend data yet'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-[#00E5B3]">{overallAccuracy != null ? `${overallAccuracy.toFixed(1)}%` : '—'}</div>
          <div className="text-[10px] text-[#00E5B3] font-medium">{verdict || '—'}</div>
        </div>
      </div>
      {trendData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[200px] text-center gap-2">
          <BookOpen size={22} className={isDark ? 'text-[#2F80ED]' : 'text-[#1a1a1a]'} />
          <p className={`text-xs ${subClass}`}>
            No saved reports yet — your daily accuracy trend will appear after you generate AI reports.
          </p>
        </div>
      ) : (
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#23262D' : '#d8d4cb'} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: isDark ? '#A1A8B3' : '#4a4a4a' }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: isDark ? '#A1A8B3' : '#4a4a4a' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: `1px solid ${isDark ? '#23262D' : '#d8d4cb'}`,
                  backgroundColor: isDark ? '#111318' : '#f8f5f1',
                  color: isDark ? '#F5F7FA' : '#1a1a1a',
                }}
                itemStyle={{ fontSize: '12px' }}
              />
              <defs>
                <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={successColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={successColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="accuracy" stroke={successColor} fillOpacity={1} fill="url(#colorAcc)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
