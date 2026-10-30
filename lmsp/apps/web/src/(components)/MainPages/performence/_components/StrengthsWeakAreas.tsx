import { AlertTriangle, CheckCircle2, Lightbulb, Sparkles } from 'lucide-react';

interface Strength {
  topic: string;
  accuracy: number;
  detail: string;
}

interface WeakArea {
  topic: string;
  accuracy: number;
  reason: string;
  recommendation: string;
}

// ─── Strengths & Weak Areas ────────────────────────────────
export default function StrengthsWeakAreas({
  strengths,
  weakAreas,
  isDark,
}: {
  strengths: Strength[];
  weakAreas: WeakArea[];
  isDark: boolean;
}) {
  const panelClass = isDark ? 'bg-[#111318] border-[#23262D]' : 'bg-[#f2efe9] border-[#d8d4cb] shadow-[2px_2px_0px_0px_#1a1a1a]';
  const innerClass = isDark ? 'bg-[#161920] border-[#23262D]' : 'bg-[#e8e4db] border-[#d8d4cb]';
  const headingText = isDark ? 'text-[#F5F7FA]' : 'text-[#1a1a1a] font-serif';
  const bodyText = isDark ? 'text-[#A1A8B3]' : 'text-[#4a4a4a] font-serif italic';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className={`rounded-2xl border p-5 md:p-6 flex flex-col ${panelClass}`}>
        <div className="flex items-center justify-between mb-5 gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-[#00E5B3]/10 border-[#00E5B3]/30' : 'bg-[#1a1a1a]/5 border-[#1a1a1a]/20'} border flex items-center justify-center shrink-0`}>
              <CheckCircle2 size={20} className={isDark ? 'text-[#00E5B3]' : 'text-[#1a1a1a]'} />
            </div>
            <div>
              <h3 className={`font-bold text-lg ${headingText}`}>Strengths (শক্তিশালী দিক)</h3>
              <p className={`text-sm mt-0.5 ${bodyText}`}>যেসব টপিকে আপনার প্রস্তুতি ও পারফরম্যান্স ভালো</p>
            </div>
          </div>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${isDark ? 'bg-[#00E5B3]/10 text-[#00E5B3] border-[#00E5B3]/20' : 'bg-[#1a1a1a]/5 text-[#1a1a1a] border-[#1a1a1a]/10'} border whitespace-nowrap self-start sm:self-auto shrink-0`}>
            {strengths.length}টি টপিক
          </span>
        </div>
        <div className={`space-y-4 max-h-[380px] overflow-y-auto pr-2 ${isDark ? '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#323742] [&::-webkit-scrollbar-thumb]:rounded-full' : '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#b8b1a8] [&::-webkit-scrollbar-thumb]:rounded-full'} flex-1`}>
          {strengths.length > 0 ? (
            strengths.map((s, idx) => (
              <div
                key={idx}
                className={`${innerClass} border ${isDark ? 'border-l-[#00E5B3]' : 'border-l-[#1a1a1a]'} border-l-4 rounded-xl p-4 md:p-5`}
              >
                <div className="flex justify-between items-start md:items-center gap-3 mb-2">
                  <h4 className={`text-base font-bold leading-relaxed ${headingText}`}>{s.topic}</h4>
                  <span className={`text-sm font-bold ${isDark ? 'text-[#00E5B3] bg-[#00E5B3]/10' : 'text-[#1a1a1a] bg-[#1a1a1a]/5'} px-2.5 py-1 rounded shrink-0`}>
                    {s.accuracy}%
                  </span>
                </div>
                <p className={`text-sm md:text-base mt-2 leading-relaxed ${isDark ? 'text-[#A1A8B3]' : 'text-[#4a4a4a] font-serif italic'}`}>{s.detail}</p>
              </div>
            ))
          ) : (
            <p className={`text-sm md:text-base py-6 text-center leading-relaxed ${bodyText}`}>
              পর্যাপ্ত ডেটা নেই — আরও কিছু কুইজ সম্পন্ন করলে আপনার শক্তিশালী দিকগুলো শনাক্ত হবে।
            </p>
          )}
        </div>
      </div>

      <div className={`rounded-2xl border p-5 md:p-6 flex flex-col ${panelClass}`}>
        <div className="flex items-center justify-between mb-5 gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-[#EB5757]/10 border-[#EB5757]/30' : 'bg-[#b91c1c]/5 border-[#b91c1c]/20'} border flex items-center justify-center shrink-0`}>
              <AlertTriangle size={20} className={isDark ? 'text-[#EB5757]' : 'text-[#b91c1c]'} />
            </div>
            <div>
              <h3 className={`font-bold text-lg ${headingText}`}>Weak Areas (উন্নতির ক্ষেত্র)</h3>
              <p className={`text-sm mt-0.5 ${bodyText}`}>যেসব টপিকে ভুল হয়েছে এবং বাড়তি নজর দেওয়া প্রয়োজন</p>
            </div>
          </div>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${isDark ? 'bg-[#EB5757]/10 text-[#EB5757] border-[#EB5757]/20' : 'bg-[#b91c1c]/5 text-[#b91c1c] border-[#b91c1c]/10'} border whitespace-nowrap self-start sm:self-auto shrink-0`}>
            {weakAreas.length}টি টপিক
          </span>
        </div>
        <div className={`space-y-4 max-h-[380px] overflow-y-auto pr-2 ${isDark ? '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#323742] [&::-webkit-scrollbar-thumb]:rounded-full' : '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#b8b1a8] [&::-webkit-scrollbar-thumb]:rounded-full'} flex-1`}>
          {weakAreas.length > 0 ? (
            weakAreas.map((w, idx) => (
              <div
                key={idx}
                className={`${innerClass} border ${isDark ? 'border-l-[#EB5757]' : 'border-l-[#b91c1c]'} border-l-4 rounded-xl p-4 md:p-5 space-y-3`}
              >
                <div className="flex justify-between items-start md:items-center gap-3 mb-1">
                  <h4 className={`text-base font-bold leading-relaxed ${headingText}`}>{w.topic}</h4>
                  <span className={`text-sm font-bold ${isDark ? 'text-[#EB5757] bg-[#EB5757]/10' : 'text-[#b91c1c] bg-[#b91c1c]/5'} px-2.5 py-1 rounded shrink-0`}>
                    {w.accuracy}%
                  </span>
                </div>
                <div className={`text-sm md:text-base leading-relaxed ${isDark ? 'text-[#D1D5DB]' : 'text-[#1a1a1a]'}`}>
                  <span className={isDark ? 'text-[#EB5757] font-semibold' : 'text-[#b91c1c] font-semibold'}>ভুলের কারণ: </span>
                  {w.reason}
                </div>
                <div className={`${isDark ? 'bg-[#00E5B3]/5 border-[#00E5B3]/20 text-[#00E5B3]' : 'bg-[#1a1a1a]/5 border-[#1a1a1a]/10 text-[#1a1a1a]'} border rounded-xl p-3.5 flex items-start gap-2.5 text-sm md:text-base leading-relaxed mt-3`}>
                  <Lightbulb size={18} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <span className={`font-bold block mb-1 ${isDark ? 'text-[#00E5B3]' : 'text-[#1a1a1a]'}`}>করণীয় ও পরামর্শ: </span>
                    <span className={isDark ? 'text-[#A1A8B3]' : 'text-[#4a4a4a] font-serif italic'}>{w.recommendation}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className={`text-sm md:text-base py-6 text-center leading-relaxed ${isDark ? 'text-[#00E5B3]' : 'text-[#1a1a1a] font-serif italic'}`}>
              চমৎকার! কোনো উল্লেখযোগ্য দুর্বল দিক পাওয়া যায়নি। এই ধারাবাহিকতা বজায় রাখুন।
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
