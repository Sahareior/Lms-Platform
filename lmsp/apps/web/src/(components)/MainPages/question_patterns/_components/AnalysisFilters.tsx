import { Loader2 } from "lucide-react";

// ─── Version + subject filters ───────────────────────────────
export default function AnalysisFilters({
  versions,
  selectedVersionId,
  onVersionSelect,
  subjectOptions,
  rawSubjects,
  selectedSubject,
  onSubjectSelect,
  isFetching,
}: {
  versions: any[];
  selectedVersionId: string | null;
  onVersionSelect: (id: string) => void;
  subjectOptions: Array<{ name: string; _id: string }>;
  rawSubjects: Record<string, number>;
  selectedSubject: string | null;
  onSubjectSelect: (name: string) => void;
  isFetching: boolean;
}) {
  return (
    <div className="bg-[#111318] rounded-2xl border border-[#23262D] overflow-hidden">
      <div className="p-5 md:p-6 space-y-6">
        <div className="flex flex-col gap-6">
          {/* Exam Version Filter */}
          {versions.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-[#A1A8B3] uppercase tracking-widest">
                  Filter
                </label>
                <span className="text-[10px] font-semibold text-[#6B7280] flex items-center gap-1.5">
                  {isFetching && (
                    <Loader2 size={11} className="animate-spin text-[#9B51E0]" />
                  )}
                  {versions.length} version{versions.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {versions.map((version: any) => (
                  <button
                    key={version._id}
                    onClick={() => onVersionSelect(version._id)}
                    className={`px-3 py-2.5 text-xs font-bold rounded-xl transition-all text-center whitespace-nowrap ${
                      selectedVersionId === version._id
                        ? "bg-[#9B51E0]/10 text-[#9B51E0] border border-[#9B51E0]/30"
                        : "bg-[#161920] text-[#A1A8B3] border border-[#23262D] hover:border-[#323742] hover:text-[#F5F7FA]"
                    }`}
                  >
                    {version.examVersion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subject Filter */}
          <div className="space-y-2.5">
            <label className="block text-[11px] font-bold text-[#A1A8B3] uppercase tracking-widest">
              Topics
            </label>
            <div className="flex flex-wrap gap-2.5">
              {subjectOptions.map((sub: any) => {
                const count = rawSubjects[sub.name];
                return (
                  <button
                    key={sub._id || sub.name}
                    onClick={() => onSubjectSelect(sub.name)}
                    className={`px-3 py-2.5 text-xs font-bold rounded-xl transition-all text-center whitespace-nowrap ${
                      selectedSubject === sub.name
                        ? "bg-[#9B51E0]/10 text-[#9B51E0] border border-[#9B51E0]/30"
                        : "bg-[#161920] text-[#A1A8B3] border border-[#23262D] hover:border-[#323742] hover:text-[#F5F7FA]"
                    }`}
                  >
                    {sub.name}
                    {count !== undefined && (
                      <span className="ml-1.5 text-[10px] opacity-60">
                        ({count})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
