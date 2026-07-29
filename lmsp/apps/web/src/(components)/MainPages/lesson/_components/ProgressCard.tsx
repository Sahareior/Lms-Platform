import { CheckCircle, Clock, PenTool, Check } from 'lucide-react';
import { ProgressRing } from './VideoPlayer';

interface ProgressCardProps {
  completedCount: number;
  totalCount: number;
  completionCriteria?: 'WATCH' | 'QUIZ' | 'MANUAL';
  hasQuiz?: boolean;
}

export default function ProgressCard({ completedCount, totalCount, completionCriteria, hasQuiz }: ProgressCardProps) {
  const remaining = totalCount - completedCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-[#111318] rounded-2xl p-5 border border-[#23262D]">
      {/* Header with progress ring */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[#F5F7FA] text-sm">Your Progress</h3>
        <ProgressRing progress={progressPercent} size={36} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#00E5B3]/10 border border-[#00E5B3]/30 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-[#00E5B3]">
            <CheckCircle size={18} />
            <span className="font-bold text-lg text-[#F5F7FA]">{completedCount}</span>
          </div>
          <div className="text-[10px] text-[#A1A8B3] font-medium">Done</div>
        </div>
        <div className="bg-[#2F80ED]/10 border border-[#2F80ED]/30 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-[#2F80ED]">
            <Clock size={18} />
            <span className="font-bold text-lg text-[#F5F7FA]">{remaining}</span>
          </div>
          <div className="text-[10px] text-[#A1A8B3] font-medium">Left</div>
        </div>
      </div>

      {/* Action button */}
      {completionCriteria === 'QUIZ' && hasQuiz ? (
        <button className="w-full bg-[#00E5B3] text-black hover:bg-[#00C298] font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition active:scale-[0.98]">
          <PenTool size={16} />
          <span>Take Required Quiz</span>
        </button>
      ) : (
        <button className="w-full bg-[#00E5B3] text-black hover:bg-[#00C298] font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition active:scale-[0.98]">
          <Check size={16} />
          <span>Mark as Complete</span>
        </button>
      )}
    </div>
  );
}