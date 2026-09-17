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
}: {
  strengths: Strength[];
  weakAreas: WeakArea[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Strengths */}
      <div className="bg-[#111318] rounded-2xl border border-[#23262D] p-5 md:p-6 flex flex-col">
        <div className="flex items-center justify-between mb-5 gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00E5B3]/10 border border-[#00E5B3]/30 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} className="text-[#00E5B3]" />
            </div>
            <div>
              <h3 className="font-bold text-[#F5F7FA] text-lg">Strengths (শক্তিশালী দিক)</h3>
              <p className="text-sm text-[#A1A8B3] mt-0.5">যেসব টপিকে আপনার প্রস্তুতি ও পারফরম্যান্স ভালো</p>
            </div>
          </div>
          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-[#00E5B3]/10 text-[#00E5B3] border border-[#00E5B3]/20 whitespace-nowrap self-start sm:self-auto shrink-0">
            {strengths.length}টি টপিক
          </span>
        </div>
        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#323742] [&::-webkit-scrollbar-thumb]:rounded-full flex-1">
          {strengths.length > 0 ? (
            strengths.map((s, idx) => (
              <div
                key={idx}
                className="bg-[#161920] border border-[#23262D] border-l-4 border-l-[#00E5B3] rounded-xl p-4 md:p-5"
              >
                <div className="flex justify-between items-start md:items-center gap-3 mb-2">
                  <h4 className="text-base font-bold text-[#F5F7FA] leading-relaxed">{s.topic}</h4>
                  <span className="text-sm font-bold text-[#00E5B3] bg-[#00E5B3]/10 px-2.5 py-1 rounded shrink-0">
                    {s.accuracy}%
                  </span>
                </div>
                <p className="text-sm md:text-base text-[#A1A8B3] mt-2 leading-relaxed">{s.detail}</p>
              </div>
            ))
          ) : (
            <p className="text-sm md:text-base text-[#A1A8B3] py-6 text-center leading-relaxed">
              পর্যাপ্ত ডেটা নেই — আরও কিছু কুইজ সম্পন্ন করলে আপনার শক্তিশালী দিকগুলো শনাক্ত হবে।
            </p>
          )}
        </div>
      </div>

      {/* Weak Areas */}
      <div className="bg-[#111318] rounded-2xl border border-[#23262D] p-5 md:p-6 flex flex-col">
        <div className="flex items-center justify-between mb-5 gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EB5757]/10 border border-[#EB5757]/30 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-[#EB5757]" />
            </div>
            <div>
              <h3 className="font-bold text-[#F5F7FA] text-lg">Weak Areas (উন্নতির ক্ষেত্র)</h3>
              <p className="text-sm text-[#A1A8B3] mt-0.5">যেসব টপিকে ভুল হয়েছে এবং বাড়তি নজর দেওয়া প্রয়োজন</p>
            </div>
          </div>
          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-[#EB5757]/10 text-[#EB5757] border border-[#EB5757]/20 whitespace-nowrap self-start sm:self-auto shrink-0">
            {weakAreas.length}টি টপিক
          </span>
        </div>
        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#323742] [&::-webkit-scrollbar-thumb]:rounded-full flex-1">
          {weakAreas.length > 0 ? (
            weakAreas.map((w, idx) => (
              <div
                key={idx}
                className="bg-[#161920] border border-[#23262D] border-l-4 border-l-[#EB5757] rounded-xl p-4 md:p-5 space-y-3"
              >
                <div className="flex justify-between items-start md:items-center gap-3 mb-1">
                  <h4 className="text-base font-bold text-[#F5F7FA] leading-relaxed">{w.topic}</h4>
                  <span className="text-sm font-bold text-[#EB5757] bg-[#EB5757]/10 px-2.5 py-1 rounded shrink-0">
                    {w.accuracy}%
                  </span>
                </div>
                <div className="text-sm md:text-base text-[#D1D5DB] leading-relaxed">
                  <span className="text-[#EB5757] font-semibold">ভুলের কারণ: </span>
                  {w.reason}
                </div>
                <div className="bg-[#00E5B3]/5 border border-[#00E5B3]/20 rounded-xl p-3.5 flex items-start gap-2.5 text-sm md:text-base text-[#00E5B3] leading-relaxed mt-3">
                  <Lightbulb size={18} className="flex-shrink-0 mt-0.5 text-[#00E5B3]" />
                  <div>
                    <span className="font-bold text-[#00E5B3] block mb-1">করণীয় ও পরামর্শ: </span>
                    <span className="text-[#A1A8B3]">{w.recommendation}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm md:text-base text-[#00E5B3] py-6 text-center leading-relaxed">
              চমৎকার! কোনো উল্লেখযোগ্য দুর্বল দিক পাওয়া যায়নি। এই ধারাবাহিকতা বজায় রাখুন।
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
