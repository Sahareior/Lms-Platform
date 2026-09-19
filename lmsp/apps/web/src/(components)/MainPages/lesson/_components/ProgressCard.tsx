import { CheckCircle, Clock, PenTool, Check } from 'lucide-react';

import { ProgressRing } from './VideoPlayer';
import { useTheme } from '../../../../theme/ThemeContext';

interface ProgressCardProps {
  completedCount: number;
  totalCount: number;
  completionCriteria?: 'WATCH' | 'QUIZ' | 'MANUAL';
  hasQuiz?: boolean;
  isCurrentCompleted?: boolean;
  isCompleting?: boolean;
  onMarkComplete?: () => void;
}

export default function ProgressCard({ completedCount, totalCount, completionCriteria, hasQuiz, isCurrentCompleted, isCompleting, onMarkComplete }: ProgressCardProps) {
  const { isDark } = useTheme();
  const remaining = totalCount - completedCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className={isDark ? 'bg-[#111318] rounded-2xl p-5 border border-[#23262D]' : 'bg-[#f2efe9] rounded-lg p-5 border border-[#d8d4cb] shadow-[2px_2px_0px_0px_#1a1a1a]'}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={isDark ? 'font-bold text-[#F5F7FA] text-sm' : 'font-black text-[#1a1a1a] text-sm font-serif'}>Your Progress</h3>
        <ProgressRing progress={progressPercent} size={36} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className={isDark ? 'bg-[#00E5B3]/10 border border-[#00E5B3]/30 p-3 rounded-lg' : 'bg-[#e0dcd5] border border-[#d8d4cb] p-3 rounded-md'}>
          <div className={`flex items-center gap-2 ${isDark ? 'text-[#00E5B3]' : 'text-[#1a1a1a]'}`}>
            <CheckCircle size={18} />
            <span className={isDark ? 'font-bold text-lg text-[#F5F7FA]' : 'font-black text-lg text-[#1a1a1a] font-serif'}>{completedCount}</span>
          </div>
          <div className={isDark ? 'text-[10px] text-[#A1A8B3] font-medium' : 'text-[10px] text-[#4a4a4a] font-bold font-serif'}>Done</div>
        </div>
        <div className={isDark ? 'bg-[#2F80ED]/10 border border-[#2F80ED]/30 p-3 rounded-lg' : 'bg-[#e0dcd5] border border-[#d8d4cb] p-3 rounded-md'}>
          <div className={`flex items-center gap-2 ${isDark ? 'text-[#2F80ED]' : 'text-[#1a1a1a]'}`}>
            <Clock size={18} />
            <span className={isDark ? 'font-bold text-lg text-[#F5F7FA]' : 'font-black text-lg text-[#1a1a1a] font-serif'}>{remaining}</span>
          </div>
          <div className={isDark ? 'text-[10px] text-[#A1A8B3] font-medium' : 'text-[10px] text-[#4a4a4a] font-bold font-serif'}>Left</div>
        </div>
      </div>

      {completionCriteria === 'QUIZ' && hasQuiz ? (
        <button className={isDark ? 'w-full bg-[#00E5B3] text-black hover:bg-[#00C298] font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition active:scale-[0.98]' : 'w-full bg-[#1a1a1a] text-[#f2efe9] hover:bg-[#2b2b2b] font-black py-2.5 rounded-md text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] font-serif'}>
          <PenTool size={16} />
          <span>Take Required Quiz</span>
        </button>
      ) : (
        <button
          onClick={onMarkComplete}
          disabled={isCompleting || isCurrentCompleted}
          className={`w-full font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] ${
            isCurrentCompleted
              ? (isDark ? 'bg-[#00E5B3]/15 text-[#00E5B3] border border-[#00E5B3]/30 cursor-default' : 'bg-[#e0dcd5] text-[#1a1a1a] border border-[#d8d4cb] cursor-default font-serif')
              : (isDark ? 'bg-[#00E5B3] text-black hover:bg-[#00C298] disabled:opacity-60' : 'bg-[#1a1a1a] text-[#f2efe9] hover:bg-[#2b2b2b] disabled:opacity-60 font-serif')
          }`}
        >
          <Check size={16} />
          <span>{isCurrentCompleted ? 'Completed' : isCompleting ? 'Marking…' : 'Mark as Complete'}</span>
        </button>
      )}
    </div>
  );
}