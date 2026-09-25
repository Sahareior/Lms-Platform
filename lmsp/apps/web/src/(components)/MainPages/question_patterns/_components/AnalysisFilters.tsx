import { BookOpen, Calendar, Globe, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { BANGLADESH_BOARDS } from "@my-monorepo/store";
import type { BangladeshBoard } from "@my-monorepo/store";

import { getSubjectBadgeColor } from "./patternUtils";
import { useTheme } from "../../../../theme/ThemeContext";

interface SubjectOption {
  _id: string;
  name: string;
  code?: string;
}

interface AnalysisFiltersProps {
  // Subjects
  subjectOptions: SubjectOption[];
  rawSubjects: Record<string, number>;
  selectedSubjectId: string | null;
  selectedSubjectName: string | null;
  onSubjectSelect: (subjectId: string | null, subjectName: string | null) => void;

  // Years / Versions
  versions: any[];
  selectedVersionId: string | null;
  onVersionSelect: (versionId: string | null) => void;

  // Boards
  selectedBoard: string | null;
  onBoardSelect: (board: string | null) => void;

  // Loading / Metadata
  isFetching: boolean;
  examName?: string;
}

export default function AnalysisFilters({
  subjectOptions,
  rawSubjects,
  selectedSubjectId,
  selectedSubjectName,
  onSubjectSelect,
  versions,
  selectedVersionId,
  onVersionSelect,
  selectedBoard,
  onBoardSelect,
  isFetching,
  examName,
}: AnalysisFiltersProps) {
  const { isDark } = useTheme();
  const selectedVersionObj = versions.find((version: any) => version._id === selectedVersionId) || null;
  const hasActiveFilters = Boolean(selectedSubjectId || selectedSubjectName || selectedVersionId || selectedBoard);

  const handleResetFilters = () => {
    onSubjectSelect(null, null);
    onVersionSelect(null);
    onBoardSelect(null);
  };

  return (
    <div className={`rounded-2xl border overflow-hidden ${isDark ? "bg-[#111318] border-[#23262D] shadow-lg shadow-black/20" : "bg-[#f2efe9] border-[#d8d4cb] shadow-[3px_3px_0px_0px_#1a1a1a]"}`}>
      <div className={`border-b px-5 py-4 flex flex-wrap items-center justify-between gap-3 ${isDark ? "border-[#23262D] bg-[#14171E]" : "border-[#d8d4cb] bg-[#e8e4db]"}`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? "bg-[#9B51E0]/10 border border-[#9B51E0]/30 text-[#9B51E0]" : "bg-[#f7f3ec] border border-[#d8d4cb] text-[#1a1a1a]"}`}>
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className={isDark ? "text-sm font-bold text-[#F5F7FA] flex items-center gap-2" : "text-sm font-black text-[#1a1a1a] flex items-center gap-2 font-serif"}>
              <span>Pattern Navigator</span>
              {examName && (
                <span className={isDark ? "text-xs font-semibold text-[#A1A8B3] bg-[#1C1F26] px-2 py-0.5 rounded-md border border-[#2B303C]" : "text-xs font-semibold text-[#4a4a4a] bg-[#f7f3ec] px-2 py-0.5 rounded-md border border-[#d8d4cb] font-serif"}>
                  {examName}
                </span>
              )}
            </h3>
            <p className={isDark ? "text-[11px] text-[#A1A8B3]" : "text-[11px] text-[#4a4a4a] font-serif italic"}>
              Select Subject, then narrow down by Year & Board
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isFetching && (
            <span className={`text-[11px] font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${isDark ? "text-[#9B51E0] bg-[#9B51E0]/10 border-[#9B51E0]/20" : "text-[#1a1a1a] bg-[#f7f3ec] border-[#d8d4cb] font-serif"}`}>
              <Loader2 size={12} className="animate-spin" />
              Updating pattern...
            </span>
          )}

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${isDark ? "text-[#A1A8B3] hover:text-[#EB5757] bg-[#161920] hover:bg-[#EB5757]/10 border-[#23262D] hover:border-[#EB5757]/30" : "text-[#1a1a1a] hover:text-[#b91c1c] bg-[#f7f3ec] border-[#d8d4cb] hover:border-[#1a1a1a] font-serif"}`}
            >
              <RotateCcw size={12} />
              <span>Reset All</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-5 md:p-6 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={isDark ? "text-[11px] font-extrabold text-[#A1A8B3] uppercase tracking-wider flex items-center gap-2" : "text-[11px] font-black text-[#4a4a4a] uppercase tracking-wider flex items-center gap-2 font-serif"}>
              <BookOpen size={13} className={isDark ? "text-[#00E5B3]" : "text-[#1a1a1a]"} />
              <span>Step 1 &bull; Select Subject</span>
            </label>
            <span className={isDark ? "text-[10px] font-semibold text-[#6B7280]" : "text-[10px] font-semibold text-[#4a4a4a] font-serif italic"}>
              {subjectOptions.length} Subjects Available
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5">
            <button
              onClick={() => onSubjectSelect(null, null)}
              className={`px-3.5 py-3 text-left rounded-xl font-bold transition-all flex flex-col justify-between gap-1 border ${
                !selectedSubjectId && !selectedSubjectName
                  ? isDark
                    ? "bg-gradient-to-r from-[#9B51E0]/20 to-[#2F80ED]/20 text-[#F5F7FA] border-[#9B51E0]/60 shadow-[0_0_15px_-3px_rgba(155,81,224,0.3)]"
                    : "bg-[#e8e4db] text-[#1a1a1a] border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]"
                  : isDark
                    ? "bg-[#161920] text-[#A1A8B3] border-[#23262D] hover:border-[#323742] hover:text-[#F5F7FA]"
                    : "bg-[#f7f3ec] text-[#4a4a4a] border-[#d8d4cb] hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
              }`}
            >
              <span className="text-xs truncate font-extrabold">All Subjects</span>
              <span className={isDark ? "text-[10px] text-[#6B7280] font-normal" : "text-[10px] text-[#4a4a4a] font-serif italic"}>Complete Overview</span>
            </button>

            {subjectOptions.map((sub) => {
              const isSelected =
                (selectedSubjectId && selectedSubjectId === sub._id) ||
                (selectedSubjectName && selectedSubjectName.toLowerCase() === sub.name.toLowerCase());
              const count = rawSubjects[sub.name];
              const badgeStyle = getSubjectBadgeColor(sub.name);

              return (
                <button
                  key={sub._id || sub.name}
                  onClick={() => onSubjectSelect(sub._id || null, sub.name)}
                  className={`px-3.5 py-3 text-left rounded-xl font-bold transition-all flex flex-col justify-between gap-1 border relative group ${
                    isSelected
                      ? isDark
                        ? "bg-gradient-to-r from-[#9B51E0]/20 to-[#00C8FF]/20 text-[#F5F7FA] border-[#00C8FF]/60 shadow-[0_0_15px_-3px_rgba(0,200,255,0.3)]"
                        : "bg-[#e8e4db] text-[#1a1a1a] border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]"
                      : isDark
                        ? "bg-[#161920] text-[#A1A8B3] border-[#23262D] hover:border-[#323742] hover:text-[#F5F7FA]"
                        : "bg-[#f7f3ec] text-[#4a4a4a] border-[#d8d4cb] hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 w-full">
                    <span className={isDark ? "text-xs truncate font-extrabold group-hover:text-white transition-colors" : "text-xs truncate font-extrabold group-hover:text-[#1a1a1a] transition-colors font-serif"}>
                      {sub.name}
                    </span>
                    {count !== undefined && count > 0 && (
                      <span className={isDark ? "text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#1C1F26] text-[#A1A8B3] border border-[#2B303C] shrink-0" : "text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#e8e4db] text-[#1a1a1a] border border-[#d8d4cb] shrink-0 font-serif"}>
                        {count} Qs
                      </span>
                    )}
                  </div>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded w-fit ${badgeStyle}`}>
                    {sub.code || "Subject"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-5 pt-3 border-t ${isDark ? "border-[#23262D]/60" : "border-[#d8d4cb]"}`}>
          <div className={`space-y-2.5 p-4 rounded-xl border ${isDark ? "bg-[#14171E] border-[#23262D]" : "bg-[#e8e4db] border-[#d8d4cb] shadow-[2px_2px_0px_0px_#1a1a1a]"}`}>
            <div className="flex items-center justify-between">
              <label className={isDark ? "text-[11px] font-extrabold text-[#A1A8B3] uppercase tracking-wider flex items-center gap-1.5" : "text-[11px] font-black text-[#4a4a4a] uppercase tracking-wider flex items-center gap-1.5 font-serif"}>
                <Calendar size={13} className={isDark ? "text-[#2F80ED]" : "text-[#1a1a1a]"} />
                <span>Step 2 &bull; Year (Exam Version)</span>
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              {versions.map((version: any) => {
                const isSelected = selectedVersionId === version._id;
                return (
                  <button
                    key={version._id}
                    onClick={() => onVersionSelect(version._id)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      isSelected
                        ? isDark
                          ? "bg-[#2F80ED] text-white shadow-md shadow-[#2F80ED]/30 font-extrabold"
                          : "bg-[#1a1a1a] text-[#f2efe9] shadow-[2px_2px_0px_0px_#b91c1c] font-extrabold"
                        : isDark
                          ? "bg-[#161920] text-[#A1A8B3] border border-[#23262D] hover:border-[#323742] hover:text-[#F5F7FA]"
                          : "bg-[#f7f3ec] text-[#4a4a4a] border border-[#d8d4cb] hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
                    }`}
                  >
                    {version.examVersion}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`space-y-2.5 p-4 rounded-xl border ${isDark ? "bg-[#14171E] border-[#23262D]" : "bg-[#e8e4db] border-[#d8d4cb] shadow-[2px_2px_0px_0px_#1a1a1a]"}`}>
            <div className="flex items-center justify-between">
              <label className={isDark ? "text-[11px] font-extrabold text-[#A1A8B3] uppercase tracking-wider flex items-center gap-1.5" : "text-[11px] font-black text-[#4a4a4a] uppercase tracking-wider flex items-center gap-1.5 font-serif"}>
                <Globe size={13} className={isDark ? "text-[#F2C94C]" : "text-[#b91c1c]"} />
                <span>Step 3 &bull; Education Board</span>
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              {BANGLADESH_BOARDS.map((board: BangladeshBoard) => {
                const isSelected = selectedBoard?.toLowerCase() === board.toLowerCase();
                return (
                  <button
                    key={board}
                    onClick={() => onBoardSelect(board)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      isSelected
                        ? isDark
                          ? "bg-[#F2C94C] text-[#0B0D12] shadow-md shadow-[#F2C94C]/30 font-extrabold"
                          : "bg-[#1a1a1a] text-[#f2efe9] shadow-[2px_2px_0px_0px_#b91c1c] font-extrabold"
                        : isDark
                          ? "bg-[#161920] text-[#A1A8B3] border border-[#23262D] hover:border-[#323742] hover:text-[#F5F7FA]"
                          : "bg-[#f7f3ec] text-[#4a4a4a] border border-[#d8d4cb] hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
                    }`}
                  >
                    {board}
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

