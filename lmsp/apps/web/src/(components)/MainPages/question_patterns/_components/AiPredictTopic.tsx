import React from 'react';
import { Clock } from 'lucide-react';

const AiPredictTopic = () => {
  // ─── Level colour map (BrainForge) ──────────────────
  const levelStyles: Record<string, string> = {
    High: 'bg-[#00E5B3]/10 text-[#00E5B3] border-[#00E5B3]/30',
    Medium: 'bg-[#F2C94C]/10 text-[#F2C94C] border-[#F2C94C]/30',
    Low: 'bg-[#A1A8B3]/10 text-[#A1A8B3] border-[#A1A8B3]/30',
  };

  const dotStyles: Record<string, string> = {
    High: 'bg-[#00E5B3]',
    Medium: 'bg-[#F2C94C]',
    Low: 'bg-[#A1A8B3]',
  };

  return (
    <div className="space-y-5">
      {/* ─── Header with legend ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00E5B3]/10 border border-[#00E5B3]/30 flex items-center justify-center text-[#00E5B3] text-xs font-extrabold">
            AI
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#F5F7FA] tracking-tight">
              AI Predicted High‑Probability Topics
            </h2>
            <p className="text-xs text-[#A1A8B3] font-medium">
              For Next BCS Exam • Pattern Analysis 2015‑2024
            </p>
          </div>
        </div>
        <div className="flex items-center gap-5 text-[11px] font-bold text-[#A1A8B3]">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${dotStyles.High}`} /> High
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${dotStyles.Medium}`} /> Medium
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${dotStyles.Low}`} /> Low
          </span>
        </div>
      </div>

      {/* ─── Cards grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          {
            id: 1,
            title: 'বাংলা সাহিত্যের ইতিহাস ও ধারা',
            sub: 'Bangla Literature',
            freq: '47 Times',
            time: '8:45h',
            level: 'High',
          },
          {
            id: 2,
            title: 'Profit, Loss & Percentage — Word Problems',
            sub: 'Mathematics',
            freq: '42 Times',
            time: '6:30h',
            level: 'High',
          },
          {
            id: 3,
            title: 'Bangladesh Constitution — Fundamental Rights',
            sub: 'Bangladesh Affairs',
            freq: '38 Times',
            time: '5:15h',
            level: 'High',
          },
          {
            id: 4,
            title: 'English — Correction & Prepositions',
            sub: 'English',
            freq: '35 Times',
            time: '4:20h',
            level: 'Medium',
          },
          {
            id: 5,
            title: 'Liberation War — Timeline & Key Events',
            sub: 'Bangladesh Affairs',
            freq: '33 Times',
            time: '7:10h',
            level: 'Medium',
          },
          {
            id: 6,
            title: 'Computer Networks & Internet Basics',
            sub: 'Science & ICT',
            freq: '21 Times',
            time: '3:00h',
            level: 'Low',
          },
        ].map((item) => (
          <div
            key={item.id}
            className="bg-[#111318] rounded-2xl border border-[#23262D] overflow-hidden hover:border-[#00E5B3]/50 hover:shadow-[0_0_15px_-3px_rgba(0,229,179,0.15)] hover:-translate-y-1 transition-all duration-300 group"
          >
            {/* Top accent strip — teal for AI section */}
            <div className="h-1 bg-gradient-to-r from-[#00E5B3] to-[#00C8FF]" />

            <div className="p-5">
              <div className="flex justify-between items-start gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 bg-gradient-to-br from-[#00E5B3] to-[#00C8FF] text-black text-xs font-bold rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.id}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#F5F7FA] leading-snug group-hover:text-[#00E5B3] transition-colors">
                      {item.title}
                    </h4>
                    <span className="text-[11px] text-[#A1A8B3] font-semibold">
                      {item.sub}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg flex-shrink-0 ${levelStyles[item.level]}`}
                >
                  {item.level}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-[#23262D] pt-3.5 mt-1 text-xs">
                <span className="font-bold text-[#F5F7FA]">{item.freq}</span>
                <span className="flex items-center gap-1 text-[#A1A8B3]">
                  <Clock size={14} />
                  {item.time}
                </span>
                <button className="bg-[#00E5B3] hover:bg-[#00C298] text-black px-4 py-1.5 rounded-lg font-bold transition-all text-xs active:scale-95">
                  Practice →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiPredictTopic;