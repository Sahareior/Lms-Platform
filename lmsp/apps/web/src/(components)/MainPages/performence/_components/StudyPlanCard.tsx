import { BookOpen, ChevronRight, Clock } from 'lucide-react';

// ─── AI Study Plan — This Week ─────────────────────────────
export default function StudyPlanCard({
  studyPlan,
  verdictColor,
}: {
  studyPlan: any[];
  verdictColor: string;
}) {
  return (
    <div className="bg-[#111318] rounded-2xl border border-[#23262D] p-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 border-b border-[#23262D] pb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#00E5B3]/10 border border-[#00E5B3]/30 flex items-center justify-center text-[#00E5B3] text-xs font-bold">
            AI
          </div>
          <h3 className="font-bold text-[#F5F7FA]">AI Study Plan — This Week</h3>
          <span className="text-[10px] text-[#A1A8B3] hidden sm:inline">
            Personalized for weak areas • auto‑updated daily
          </span>
        </div>
      </div>

      {studyPlan.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {studyPlan.map((plan, idx) => (
            <div key={idx} className="bg-[#161920] border border-[#23262D] rounded-lg p-3 hover:border-[#323742] transition">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-[#A1A8B3]">{plan.day || `DAY ${idx + 1}`}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold truncate max-w-full" style={{ color: verdictColor, background: `${verdictColor}14` }}>
                  {plan.focus_subject || 'FOCUS'}
                </span>
              </div>
              <div className="text-xs font-bold text-[#F5F7FA] mb-1">{plan.title}</div>
              <div className="text-[10px] text-[#A1A8B3] leading-tight mb-2">{plan.description}</div>
              <div className="flex justify-between items-center text-[10px] text-[#6B7280] border-t border-[#23262D] pt-1">
                <div className="flex items-center gap-1"><Clock size={10} /> {plan.duration_minutes || 60} min</div>
                <ChevronRight size={12} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
          <BookOpen size={22} className="text-[#2F80ED]" />
          <p className="text-xs text-[#A1A8B3]">
            No study plan yet — generate an AI report to get a personalized weekly plan.
          </p>
        </div>
      )}
    </div>
  );
}
