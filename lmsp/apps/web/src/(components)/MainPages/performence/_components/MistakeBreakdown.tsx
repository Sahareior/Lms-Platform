import { CheckCircle2, XCircle } from 'lucide-react';

interface Mistake {
  question_text: string;
  identified_subject: string;
  explanation: string;
  user_answer: string;
  correct_answer: string;
}

// ─── Mistake Breakdown ─────────────────────────────────────
export default function MistakeBreakdown({ mistakes }: { mistakes: Mistake[] }) {
  if (mistakes.length === 0) return null;

  return (
    <div className="bg-[#111318] rounded-2xl border border-[#23262D] overflow-hidden">
      <div className="p-5 border-b border-[#23262D]">
        <h3 className="font-bold text-[#F5F7FA]">Mistake Breakdown</h3>
        <p className="text-xs text-[#A1A8B3]">Questions you got wrong, with explanations to learn from.</p>
      </div>
      <div className="divide-y divide-[#23262D]">
        {mistakes.map((m, idx) => (
          <div key={idx} className="p-5 grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-4 items-start">
            <div>
              <p className="text-sm font-semibold text-[#F5F7FA] mb-1">{m.question_text}</p>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#2F80ED]/10 text-[#2F80ED] border border-[#2F80ED]/30 font-medium">
                {m.identified_subject}
              </span>
              <p className="text-[11px] text-[#A1A8B3] mt-2 leading-relaxed">{m.explanation}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wide text-[#EB5757] font-bold flex items-center gap-1">
                <XCircle size={11} /> Your answer
              </span>
              <span className="text-xs text-[#A1A8B3]">{m.user_answer}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wide text-[#00E5B3] font-bold flex items-center gap-1">
                <CheckCircle2 size={11} /> Correct
              </span>
              <span className="text-xs text-[#F5F7FA] font-semibold">{m.correct_answer}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
