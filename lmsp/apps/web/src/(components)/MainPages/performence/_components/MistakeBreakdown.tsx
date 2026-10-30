import { CheckCircle2, HelpCircle, XCircle } from 'lucide-react';

interface Mistake {
  question_text: string;
  identified_subject: string;
  explanation: string;
  user_answer: string;
  correct_answer: string;
}

// ─── Mistake Breakdown ─────────────────────────────────────
export default function MistakeBreakdown({ mistakes, isDark }: { mistakes: Mistake[]; isDark: boolean }) {
  if (mistakes.length === 0) return null;

  const panelClass = isDark ? 'bg-[#111318] border-[#23262D]' : 'bg-[#f2efe9] border-[#d8d4cb] shadow-[2px_2px_0px_0px_#1a1a1a]';
  const rowClass = isDark ? 'bg-[#161920] border-[#23262D]' : 'bg-[#e8e4db] border-[#d8d4cb]';
  const headingText = isDark ? 'text-[#F5F7FA]' : 'text-[#1a1a1a] font-serif';
  const bodyText = isDark ? 'text-[#A1A8B3]' : 'text-[#4a4a4a] font-serif italic';

  return (
    <div className={`rounded-2xl border overflow-hidden ${panelClass}`}>
      <div className={`p-5 md:p-6 border-b ${isDark ? 'border-[#23262D]' : 'border-[#d8d4cb]'} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div>
          <h3 className={`font-bold text-lg ${headingText}`}>ভুল উত্তরের পর্যালোচনা (Mistake Breakdown)</h3>
          <p className={`text-sm mt-1.5 ${bodyText}`}>যেসব প্রশ্নে ভুল হয়েছিল, সেগুলোর সঠিক ব্যাখ্যা জেনে ভুল সংশোধন করুন।</p>
        </div>
        <span className={`text-sm font-semibold px-3.5 py-1.5 rounded-full ${isDark ? 'bg-[#EB5757]/10 text-[#EB5757] border-[#EB5757]/20' : 'bg-[#b91c1c]/5 text-[#b91c1c] border-[#b91c1c]/10'} border whitespace-nowrap self-start sm:self-auto`}>
          {mistakes.length}টি ভুল উত্তর
        </span>
      </div>
      <div className={`divide-y ${isDark ? 'divide-[#23262D]' : 'divide-[#d8d4cb]'}`}>
        {mistakes.map((m, idx) => (
          <div key={idx} className="p-5 md:p-6 flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-1 w-full">
              <div className="mb-3">
                <span className={`text-xs px-2.5 py-1 rounded-md ${isDark ? 'bg-[#2F80ED]/10 text-[#2F80ED] border-[#2F80ED]/30' : 'bg-[#1a1a1a]/5 text-[#1a1a1a] border-[#1a1a1a]/10'} border font-medium inline-block`}>
                  {m.identified_subject}
                </span>
              </div>
              <p className={`text-base font-semibold mb-4 leading-relaxed ${headingText}`}>{m.question_text}</p>

              <div className={`p-4 rounded-xl ${isDark ? 'bg-[#2F80ED]/5 border-[#2F80ED]/20' : 'bg-[#1a1a1a]/5 border-[#1a1a1a]/10'} border`}>
                <span className={`font-bold text-sm flex items-center gap-1.5 mb-2.5 ${isDark ? 'text-[#2F80ED]' : 'text-[#1a1a1a]'}`}>
                  <HelpCircle size={16} /> ব্যাখ্যা ও ধারণা স্পষ্টকরণ:
                </span>
                <p className={`text-sm md:text-base leading-relaxed ${isDark ? 'text-[#E2E8F0]' : 'text-[#1a1a1a] font-serif italic'}`}>{m.explanation}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-4 w-full lg:w-auto lg:min-w-[240px]">
              <div className={`flex-1 ${rowClass} p-4 rounded-xl border`}>
                <span className={`text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 mb-2 ${isDark ? 'text-[#EB5757]' : 'text-[#b91c1c]'}`}>
                  <XCircle size={14} /> আপনার উত্তর
                </span>
                <span className={`text-sm md:text-base font-medium leading-relaxed ${isDark ? 'text-[#EB5757]' : 'text-[#b91c1c]'}`}>
                  {m.user_answer || 'উত্তর দেওয়া হয়নি'}
                </span>
              </div>
              <div className={`flex-1 ${rowClass} p-4 rounded-xl border`}>
                <span className={`text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 mb-2 ${isDark ? 'text-[#00E5B3]' : 'text-[#1a1a1a]'}`}>
                  <CheckCircle2 size={14} /> সঠিক উত্তর
                </span>
                <span className={`text-sm md:text-base font-bold leading-relaxed ${isDark ? 'text-[#00E5B3]' : 'text-[#1a1a1a]'}`}>
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
