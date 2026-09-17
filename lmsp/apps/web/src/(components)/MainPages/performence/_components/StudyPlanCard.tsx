import { BookOpen, ChevronRight, Clock, Sparkles } from 'lucide-react';

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 border-b border-[#23262D] pb-4 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#00E5B3]/10 border border-[#00E5B3]/30 flex items-center justify-center text-[#00E5B3] text-sm font-bold shrink-0">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="font-bold text-[#F5F7FA] text-lg">AI স্টাডি প্ল্যান (Study Plan)</h3>
            <span className="text-sm text-[#A1A8B3] block mt-0.5">
              দুর্বল বিষয়ের উপর ভিত্তি করে তৈরি দৈনিক অনুশীলনের রুটিন
            </span>
          </div>
        </div>
      </div>

      {studyPlan.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {studyPlan.map((plan, idx) => (
            <div
              key={idx}
              className="bg-[#161920] border border-[#23262D] rounded-xl p-4 hover:border-[#323742] transition flex flex-col justify-between"
            >
              <div>
                <div className="flex flex-col gap-2 mb-3 items-start">
                  <span className="text-sm font-bold text-[#00E5B3] bg-[#00E5B3]/10 px-2.5 py-1 rounded-md border border-[#00E5B3]/20 inline-block">
                    {plan.day || `দিন ${idx + 1}`}
                  </span>
                  <span
                    className="text-xs px-2.5 py-1.5 rounded-md font-semibold leading-relaxed w-full"
                    style={{ color: verdictColor, background: `${verdictColor}14` }}
                  >
                    {plan.focus_subject || 'মূল বিষয়'}
                  </span>
                </div>
                <div className="text-sm md:text-base font-bold text-[#F5F7FA] mb-2 leading-relaxed">
                  {plan.title}
                </div>
                <div className="text-sm text-[#A1A8B3] leading-relaxed mb-4">
                  {plan.description}
                </div>
              </div>
              <div className="flex justify-between items-center text-sm text-[#6B7280] border-t border-[#23262D] pt-3 mt-auto">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-[#A1A8B3]" />
                  <span>{plan.duration_minutes || 45} মিনিট</span>
                </div>
                <ChevronRight size={16} className="text-[#4B5563]" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
          <BookOpen size={28} className="text-[#2F80ED]" />
          <p className="text-sm md:text-base text-[#A1A8B3] max-w-md leading-relaxed">
            এখনো কোনো স্টাডি প্ল্যান তৈরি হয়নি — এআই পারফরম্যান্স রিপোর্ট জেনারেট করে আপনার উপযোগী স্টাডি প্ল্যান পান।
          </p>
        </div>
      )}
    </div>
  );
}
