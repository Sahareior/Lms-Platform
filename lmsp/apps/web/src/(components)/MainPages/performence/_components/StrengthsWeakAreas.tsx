import { AlertTriangle, CheckCircle2 } from 'lucide-react';

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
      <div className="bg-[#111318] rounded-2xl border border-[#23262D] p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-[#00E5B3]/10 border border-[#00E5B3]/30 flex items-center justify-center">
            <CheckCircle2 size={13} className="text-[#00E5B3]" />
          </div>
          <h3 className="font-bold text-[#F5F7FA]">Strengths</h3>
        </div>
        <div className="space-y-2.5">
          {strengths.map((s, idx) => (
            <div key={idx} className="bg-[#161920] border border-[#23262D] border-l-4 border-l-[#00E5B3] rounded-xl p-3">
              <div className="flex justify-between items-center gap-2">
                <h4 className="text-xs font-bold text-[#F5F7FA]">{s.topic}</h4>
                <span className="text-[10px] font-bold text-[#00E5B3]">{s.accuracy}%</span>
              </div>
              <p className="text-[10px] text-[#A1A8B3] mt-1">{s.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Weak Areas */}
      <div className="bg-[#111318] rounded-2xl border border-[#23262D] p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-[#EB5757]/10 border border-[#EB5757]/30 flex items-center justify-center">
            <AlertTriangle size={13} className="text-[#EB5757]" />
          </div>
          <h3 className="font-bold text-[#F5F7FA]">Weak Areas</h3>
        </div>
        <div className="space-y-2.5">
          {weakAreas.map((w, idx) => (
            <div key={idx} className="bg-[#161920] border border-[#23262D] border-l-4 border-l-[#EB5757] rounded-xl p-3">
              <div className="flex justify-between items-center gap-2">
                <h4 className="text-xs font-bold text-[#F5F7FA]">{w.topic}</h4>
                <span className="text-[10px] font-bold text-[#EB5757]">{w.accuracy}%</span>
              </div>
              <p className="text-[10px] text-[#A1A8B3] mt-1">{w.reason}</p>
              <p className="text-[10px] text-[#00E5B3] mt-1">{w.recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
