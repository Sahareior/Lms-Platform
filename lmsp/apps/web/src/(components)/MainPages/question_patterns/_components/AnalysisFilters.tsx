import { BookOpen, Calendar, Globe, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { BANGLADESH_BOARDS } from "@my-monorepo/store";
import type { BangladeshBoard } from "@my-monorepo/store";
import { getSubjectBadgeColor } from "./patternUtils";

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
  const hasActiveFilters = Boolean(selectedSubjectId || selectedSubjectName || selectedVersionId || selectedBoard);

  const handleResetFilters = () => {
    onSubjectSelect(null, null);
    onVersionSelect(null);
    onBoardSelect(null);
  };

  const selectedVersionObj = versions.find((v) => v._id === selectedVersionId);

  return (
    <div className="bg-[#111318] rounded-2xl border border-[#23262D] overflow-hidden shadow-lg shadow-black/20">
      {/* ── Top Header / Status bar ── */}
      <div className="border-b border-[#23262D] px-5 py-4 bg-[#14171E] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#9B51E0]/10 border border-[#9B51E0]/30 flex items-center justify-center text-[#9B51E0]">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
              <span>Pattern Navigator</span>
              {examName && (
                <span className="text-xs font-semibold text-[#A1A8B3] bg-[#1C1F26] px-2 py-0.5 rounded-md border border-[#2B303C]">
                  {examName}
                </span>
              )}
            </h3>
            <p className="text-[11px] text-[#A1A8B3]">
              Select Subject, then narrow down by Year & Board
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isFetching && (
            <span className="text-[11px] font-semibold text-[#9B51E0] flex items-center gap-1.5 bg-[#9B51E0]/10 px-2.5 py-1 rounded-lg border border-[#9B51E0]/20">
              <Loader2 size={12} className="animate-spin" />
              Updating pattern...
            </span>
          )}

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A1A8B3] hover:text-[#EB5757] bg-[#161920] hover:bg-[#EB5757]/10 px-3 py-1.5 rounded-xl border border-[#23262D] hover:border-[#EB5757]/30 transition-all"
            >
              <RotateCcw size={12} />
              <span>Reset All</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-5 md:p-6 space-y-6">
        {/* ══════════════════ 1. SUBJECT SELECTION ══════════════════ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-extrabold text-[#A1A8B3] uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={13} className="text-[#00E5B3]" />
              <span>Step 1 &bull; Select Subject</span>
            </label>
            <span className="text-[10px] font-semibold text-[#6B7280]">
              {subjectOptions.length} Subjects Available
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5">
            {/* All Subjects option */}
            <button
              onClick={() => onSubjectSelect(null, null)}
              className={`px-3.5 py-3 text-left rounded-xl font-bold transition-all flex flex-col justify-between gap-1 border ${
                !selectedSubjectId && !selectedSubjectName
                  ? "bg-gradient-to-r from-[#9B51E0]/20 to-[#2F80ED]/20 text-[#F5F7FA] border-[#9B51E0]/60 shadow-[0_0_15px_-3px_rgba(155,81,224,0.3)]"
                  : "bg-[#161920] text-[#A1A8B3] border-[#23262D] hover:border-[#323742] hover:text-[#F5F7FA]"
              }`}
            >
              <span className="text-xs truncate font-extrabold">All Subjects</span>
              <span className="text-[10px] text-[#6B7280] font-normal">Complete Overview</span>
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
                      ? "bg-gradient-to-r from-[#9B51E0]/20 to-[#00C8FF]/20 text-[#F5F7FA] border-[#00C8FF]/60 shadow-[0_0_15px_-3px_rgba(0,200,255,0.3)]"
                      : "bg-[#161920] text-[#A1A8B3] border-[#23262D] hover:border-[#323742] hover:text-[#F5F7FA]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 w-full">
                    <span className="text-xs truncate font-extrabold group-hover:text-white transition-colors">
                      {sub.name}
                    </span>
                    {count !== undefined && count > 0 && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#1C1F26] text-[#A1A8B3] border border-[#2B303C] shrink-0">
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

        {/* ══════════════════ 2. UNDER SUBJECT: YEAR & BOARD FILTERS ══════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-3 border-t border-[#23262D]/60">
          {/* Year (Exam Version) Filter */}
          <div className="space-y-2.5 bg-[#14171E] p-4 rounded-xl border border-[#23262D]">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold text-[#A1A8B3] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={13} className="text-[#2F80ED]" />
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
                        ? "bg-[#2F80ED] text-white shadow-md shadow-[#2F80ED]/30 font-extrabold"
                        : "bg-[#161920] text-[#A1A8B3] border border-[#23262D] hover:border-[#323742] hover:text-[#F5F7FA]"
                    }`}
                  >
                    {version.examVersion}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Board Filter */}
          <div className="space-y-2.5 bg-[#14171E] p-4 rounded-xl border border-[#23262D]">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold text-[#A1A8B3] uppercase tracking-wider flex items-center gap-1.5">
                <Globe size={13} className="text-[#F2C94C]" />
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
                        ? "bg-[#F2C94C] text-[#0B0D12] shadow-md shadow-[#F2C94C]/30 font-extrabold"
                        : "bg-[#161920] text-[#A1A8B3] border border-[#23262D] hover:border-[#323742] hover:text-[#F5F7FA]"
                    }`}
                  >
                    {board}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Filter Chips / Trail */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            <span className="text-[11px] font-bold text-[#6B7280]">Active Filter:</span>
            {examName && (
              <span className="px-2.5 py-1 rounded-lg bg-[#161920] text-[#F5F7FA] border border-[#23262D] font-bold">
                Exam: {examName}
              </span>
            )}
            {selectedSubjectName && (
              <span className="px-2.5 py-1 rounded-lg bg-[#00C8FF]/10 text-[#00C8FF] border border-[#00C8FF]/30 font-bold flex items-center gap-1">
                Subject: {selectedSubjectName}
                <button
                  onClick={() => onSubjectSelect(null, null)}
                  className="hover:text-white ml-0.5 text-xs"
                >
                  &times;
                </button>
              </span>
            )}
            {selectedVersionObj && (
              <span className="px-2.5 py-1 rounded-lg bg-[#2F80ED]/10 text-[#2F80ED] border border-[#2F80ED]/30 font-bold flex items-center gap-1">
                Year: {selectedVersionObj.examVersion}
              </span>
            )}
            {selectedBoard && (
              <span className="px-2.5 py-1 rounded-lg bg-[#F2C94C]/10 text-[#F2C94C] border border-[#F2C94C]/30 font-bold flex items-center gap-1">
                Board: {selectedBoard}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

