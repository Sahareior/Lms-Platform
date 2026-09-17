import { Database } from 'lucide-react';

// ─── Subject Performance Breakdown table ───────────────────
export default function SubjectPerformanceTable({ subjectData }: { subjectData: any[] }) {
  return (
    <div className="bg-[#111318] rounded-2xl border border-[#23262D] overflow-hidden">
      <div className="p-5 border-b border-[#23262D]">
        <h3 className="font-bold text-[#F5F7FA]">Subject Performance Breakdown</h3>
        <p className="text-xs text-[#A1A8B3]">Weak subjects highlighted. Click to drill down.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#161920] text-[11px] font-medium text-[#A1A8B3] uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 text-left">Subject</th>
              <th className="px-5 py-3 text-center">Attempted</th>
              <th className="px-5 py-3 text-center">Correct</th>
              <th className="px-5 py-3 text-left w-[200px]">Accuracy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#23262D]">
            {subjectData.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Database size={20} className="text-[#2F80ED]" />
                    <p className="text-xs text-[#A1A8B3]">
                      No subject data yet — generate an AI report to see your per-subject breakdown.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              subjectData.map((row, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-[#161920] transition ${
                    row.isCritical ? 'bg-[#EB5757]/5' : row.isWeak ? 'bg-[#EB5757]/[0.02]' : ''
                  }`}
                >
                  <td className="px-5 py-3 font-medium text-[#F5F7FA]">
                    <div className="flex items-center gap-2">
                      {row.subject}
                      {row.isWeak && (
                        <span className="text-[10px] bg-[#EB5757]/10 text-[#EB5757] px-1.5 py-0.5 rounded border border-[#EB5757]/30">
                          Weak
                        </span>
                      )}
                      {row.isCritical && (
                        <span className="text-[10px] bg-[#EB5757] text-white px-1.5 py-0.5 rounded">
                          Critical
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center text-[#A1A8B3]">{row.attempted}</td>
                  <td className="px-5 py-3 text-center text-[#A1A8B3]">{row.correct}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-full h-1.5 bg-[#1C1F26] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#2F80ED] to-[#00E5B3]"
                          style={{ width: `${row.accuracy}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-[#F5F7FA] min-w-[35px]">{row.accuracy}%</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
