import { CheckCircle2, HelpCircle, XCircle } from 'lucide-react';

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
      <div className="p-5 md:p-6 border-b border-[#23262D] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-[#F5F7FA] text-lg">ভুল উত্তরের পর্যালোচনা (Mistake Breakdown)</h3>
          <p className="text-sm text-[#A1A8B3] mt-1.5">যেসব প্রশ্নে ভুল হয়েছিল, সেগুলোর সঠিক ব্যাখ্যা জেনে ভুল সংশোধন করুন।</p>
        </div>
        <span className="text-sm font-semibold px-3.5 py-1.5 rounded-full bg-[#EB5757]/10 text-[#EB5757] border border-[#EB5757]/20 whitespace-nowrap self-start sm:self-auto">
          {mistakes.length}টি ভুল উত্তর
        </span>
      </div>
      <div className="divide-y divide-[#23262D]">
        {mistakes.map((m, idx) => (
          <div key={idx} className="p-5 md:p-6 flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-1 w-full">
              <div className="mb-3">
                <span className="text-xs px-2.5 py-1 rounded-md bg-[#2F80ED]/10 text-[#2F80ED] border border-[#2F80ED]/30 font-medium inline-block">
                  {m.identified_subject}
                </span>
              </div>
              <p className="text-base font-semibold text-[#F5F7FA] mb-4 leading-relaxed">{m.question_text}</p>
              
              <div className="p-4 rounded-xl bg-[#2F80ED]/5 border border-[#2F80ED]/20">
                <span className="font-bold text-[#2F80ED] text-sm flex items-center gap-1.5 mb-2.5">
                  <HelpCircle size={16} /> ব্যাখ্যা ও ধারণা স্পষ্টকরণ:
                </span>
                <p className="text-[#E2E8F0] text-sm md:text-base leading-relaxed">{m.explanation}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row lg:flex-col gap-4 w-full lg:w-auto lg:min-w-[240px]">
              <div className="flex-1 bg-[#161920] p-4 rounded-xl border border-[#23262D]">
                <span className="text-xs uppercase tracking-wider text-[#EB5757] font-bold flex items-center gap-1.5 mb-2">
                  <XCircle size={14} /> আপনার উত্তর
                </span>
                <span className="text-sm md:text-base text-[#EB5757] font-medium leading-relaxed">
                  {m.user_answer || 'উত্তর দেওয়া হয়নি'}
                </span>
              </div>
              <div className="flex-1 bg-[#161920] p-4 rounded-xl border border-[#23262D]">
                <span className="text-xs uppercase tracking-wider text-[#00E5B3] font-bold flex items-center gap-1.5 mb-2">
                  <CheckCircle2 size={14} /> সঠিক উত্তর
                </span>
                <span className="text-sm md:text-base text-[#00E5B3] font-bold leading-relaxed">
                  {m.correct_answer}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
