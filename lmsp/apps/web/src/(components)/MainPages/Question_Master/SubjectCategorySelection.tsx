import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  BookOpen,
  Search,
  Loader2,
  AlertCircle,
  FileQuestion,
  ChevronRight,
  Code2,
  Atom,
  Calculator,
  Globe2,
  Languages,
  Compass,
  Layers,
} from "lucide-react";
import {
  useGetSubjectsByExamQuery,
  useGetQuestionsByExamQuery,
  useGetMeQuery,
  useGetExamsQuery,
} from "@my-monorepo/store";
import type { Exam, SubjectByExam } from "@my-monorepo/store";
import { useTheme } from "../../../theme/ThemeContext";

// Map subject names to dynamic icons and accent palettes
function subjectMeta(name: string): { icon: ReactNode; color: string; subtitle: string } {
  const lower = (name || "").toLowerCase();

  if (lower.includes("ict") || lower.includes("তথ্য") || lower.includes("কম্পিউটার") || lower.includes("computer")) {
    return { icon: <Code2 size={26} />, color: "#00C8FF", subtitle: "তথ্য ও যোগাযোগ প্রযুক্তি" };
  }
  if (lower.includes("physics") || lower.includes("পদার্থ") || lower.includes("science") || lower.includes("বিজ্ঞান")) {
    return { icon: <Atom size={26} />, color: "#9B51E0", subtitle: "বিজ্ঞান ও গবেষণা" };
  }
  if (lower.includes("math") || lower.includes("গণিত") || lower.includes("হিসাব") || lower.includes("accounting")) {
    return { icon: <Calculator size={26} />, color: "#00E5B3", subtitle: "গাণিতিক যুক্তি ও সমাধান" };
  }
  if (lower.includes("bangla") || lower.includes("বাংলা") || lower.includes("সাহিত্য")) {
    return { icon: <Languages size={26} />, color: "#EB5757", subtitle: "বাংলা ভাষা ও সাহিত্য" };
  }
  if (lower.includes("english") || lower.includes("ইংরেজি") || lower.includes("grammar")) {
    return { icon: <Globe2 size={26} />, color: "#2F80ED", subtitle: "English Language & Grammar" };
  }
  if (lower.includes("gk") || lower.includes("সাধারণ জ্ঞান") || lower.includes("general knowledge") || lower.includes("বাংলাদেশ") || lower.includes("আন্তর্জাতিক")) {
    return { icon: <Compass size={26} />, color: "#F2C94C", subtitle: "সাধারণ জ্ঞান ও আন্তর্জাতিক" };
  }

  return { icon: <BookOpen size={26} />, color: "#9B51E0", subtitle: "বিষয়ভিত্তিক প্রস্তুতি" };
}

interface EnrichedSubject {
  _id: string;
  name: string;
  code?: string;
  description?: string;
  setCount: number;
  totalQuestions: number;
  versions: string[];
}

export default function SubjectCategorySelection() {
  const { examType } = useParams<{ examType: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");

  const { data: userData } = useGetMeQuery();
  const { data: allExams } = useGetExamsQuery();

  const {
    data: subjectsList,
    isLoading: isSubjectsLoading,
    isError: isSubjectsError,
  } = useGetSubjectsByExamQuery(examType || "", { skip: !examType });

  const {
    data: questionSets,
    isLoading: isQuestionsLoading,
    isError: isQuestionsError,
  } = useGetQuestionsByExamQuery(
    { examId: examType! },
    { skip: !examType }
  );

  const currentExam = useMemo(() => {
    if (!examType) return null;
    const fromUser = userData?.selectedExams?.find((e: Exam) => e._id === examType);
    if (fromUser) return fromUser;
    const fromAll = allExams?.find((e: Exam) => e._id === examType);
    if (fromAll) return fromAll;
    if (questionSets && questionSets.length > 0 && questionSets[0].exam) {
      return questionSets[0].exam;
    }
    return null;
  }, [examType, userData, allExams, questionSets]);

  const examName = currentExam?.name || "Exam";

  const enrichedSubjects = useMemo(() => {
    const map = new Map<string, EnrichedSubject>();
    const normalizeSubjectKey = (value?: string) =>
      (value || "").trim().toLowerCase().replace(/\s+/g, " ");

    if (subjectsList && Array.isArray(subjectsList)) {
      subjectsList.forEach((sub: SubjectByExam) => {
        const id = sub._id || (typeof sub === "string" ? sub : "");
        if (id) {
          map.set(id, {
            _id: id,
            name: sub.name || "Subject",
            code: sub.code,
            description: sub.description,
            setCount: 0,
            totalQuestions: 0,
            versions: [],
          });
        }
      });
    }

    if (questionSets && Array.isArray(questionSets)) {
      questionSets.forEach((set: any) => {
        const subId =
          set?.subject?._id ||
          (typeof set?.subject === "string" ? set.subject : null);
        const legacySubjectName =
          set?.subject?.name ||
          set?.subjectName ||
          (Array.isArray(set?.data) ? set.data.find((q: any) => q?.subjectName)?.subjectName : "") ||
          "General";
        const subjectKey = subId || normalizeSubjectKey(legacySubjectName) || "general";
        const qCount = Array.isArray(set?.data) ? set.data.length : 0;
        const version = set?.examVersion?.examVersion || "";

        if (subjectKey) {
          if (!map.has(subjectKey)) {
            let foundExistingKey: string | null = null;
            for (const [key, val] of map.entries()) {
              if (normalizeSubjectKey(val.name) === normalizeSubjectKey(legacySubjectName)) {
                foundExistingKey = key;
                break;
              }
            }

            if (foundExistingKey) {
              const existing = map.get(foundExistingKey)!;
              existing.setCount += 1;
              existing.totalQuestions += qCount;
              if (version && !existing.versions.includes(version)) {
                existing.versions.push(version);
              }
            } else {
              map.set(subjectKey, {
                _id: subjectKey,
                name: legacySubjectName,
                setCount: 1,
                totalQuestions: qCount,
                versions: version ? [version] : [],
              });
            }
          } else {
            const existing = map.get(subjectKey)!;
            existing.setCount += 1;
            existing.totalQuestions += qCount;
            if (version && !existing.versions.includes(version)) {
              existing.versions.push(version);
            }
          }
        }
      });
    }

    return Array.from(map.values());
  }, [subjectsList, questionSets]);

  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return enrichedSubjects;
    const q = searchQuery.toLowerCase().trim();
    return enrichedSubjects.filter(
      (sub) =>
        sub.name.toLowerCase().includes(q) ||
        (sub.code && sub.code.toLowerCase().includes(q)) ||
        (sub.description && sub.description.toLowerCase().includes(q))
    );
  }, [enrichedSubjects, searchQuery]);

  const isLoading = isSubjectsLoading || isQuestionsLoading;
  const isError = isSubjectsError && isQuestionsError;

  // ─── LIGHT MODE (Vintage Paper Style) ───────────────────────
  if (!isDark) {
    return (
      <div 
        className="min-h-screen bg-[#e8e4db] text-[#1a1a1a]"
        style={{
          backgroundImage: 'radial-gradient(#d8d4cb 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        <div className="sticky -top-1 z-20 border-b border-[#d8d4cb] bg-[#f2efe9]/95 backdrop-blur-xl shadow-[0_3px_0px_0px_#1a1a1a]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <button
                  onClick={() => navigate("/question-center")}
                  className="mt-0.5 sm:mt-0 p-2.5 rounded-xl border border-[#d8d4cb] bg-[#f2efe9] text-[#4a4a4a] hover:text-[#1a1a1a] hover:shadow-[2px_2px_0px_0px_#1a1a1a] shadow-[1px_1px_0px_0px_#1a1a1a] transition-all active:scale-95"
                  title="Back to Exam Selection"
                >
                  <ArrowLeft size={18} />
                </button>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#e0dcd5] text-[#1a1a1a] border border-[#d8d4cb] uppercase tracking-wider font-serif">
                      {examName}
                    </span>
                    <span className="text-xs text-[#4a4a4a]">•</span>
                    <span className="text-xs font-bold text-[#b91c1c] font-serif">Question Center</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black mt-1 tracking-tight text-[#1a1a1a] font-serif">
                    Select Subject
                  </h1>
                </div>
              </div>

              <div className="relative w-full md:w-72">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4a4a4a]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search subject..."
                  className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl transition-all bg-[#f7f3ec] border border-[#d8d4cb] text-[#1a1a1a] placeholder:text-[#4a4a4a] focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] font-serif shadow-[1px_1px_0px_0px_#1a1a1a]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-24">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-[#4a4a4a] font-serif italic">
              Choose a subject under <span className="font-bold text-[#1a1a1a]">{examName}</span> to view question sets and practice model tests.
            </p>
            {enrichedSubjects.length > 0 && (
              <span className="text-xs font-bold px-3 py-1 rounded-full hidden sm:inline-block bg-[#f2efe9] text-[#1a1a1a] border border-[#d8d4cb] font-serif shadow-[1px_1px_0px_0px_#1a1a1a]">
                {enrichedSubjects.length} {enrichedSubjects.length === 1 ? "Subject" : "Subjects"}
              </span>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 size={36} className="text-[#b91c1c] animate-spin" />
              <p className="text-sm text-[#4a4a4a] font-serif italic">Loading subjects...</p>
            </div>
          )}

          {/* Error State */}
          {!isLoading && isError && (
            <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-lg border text-center max-w-md mx-auto p-8 bg-[#f2efe9] border-[#d8d4cb] shadow-[3px_3px_0px_0px_#1a1a1a]">
              <AlertCircle size={36} className="text-[#b91c1c]" />
              <h3 className="text-base font-black text-[#1a1a1a] font-serif">Failed to load subjects</h3>
              <p className="text-sm text-[#4a4a4a] font-serif italic">
                We couldn't retrieve subjects for this exam. Please try again.
              </p>
              <button
                onClick={() => navigate("/question-center")}
                className="mt-2 px-5 py-2.5 rounded-md font-bold text-sm transition bg-[#1a1a1a] text-[#f2efe9] border border-[#1a1a1a] font-serif shadow-[2px_2px_0px_0px_#b91c1c] hover:shadow-[3px_3px_0px_0px_#b91c1c]"
              >
                Back to Exams
              </button>
            </div>
          )}

          {/* Subjects Grid */}
          {!isLoading && !isError && filteredSubjects.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSubjects.map((subject) => {
                const { icon, subtitle } = subjectMeta(subject.name);

                return (
                  <button
                    key={subject._id}
                    onClick={() =>
                      navigate(`/question-center/${examType}/${subject._id}/type`, {
                        state: {
                          subjectName: subject.name,
                          examName: examName,
                        },
                      })
                    }
                    className="group relative flex h-full flex-col rounded-lg border transition-all duration-300 overflow-hidden text-left active:scale-[0.985] bg-[#f2efe9] border-[#d8d4cb] hover:border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a] hover:shadow-[4px_4px_0px_0px_#1a1a1a]"
                  >
                    {/* Top accent bar */}
                    <div className="h-1.5 w-full bg-[#b91c1c] transition-all duration-300 group-hover:h-2" />

                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-[#1a1a1a] border border-[#1a1a1a] text-[#f2efe9]">
                          {icon}
                        </div>

                        {subject.code && (
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#e0dcd5] text-[#1a1a1a] border border-[#d8d4cb]">
                            {subject.code}
                          </span>
                        )}
                      </div>

                      <h3 className="font-black text-lg mb-1 text-[#1a1a1a] font-serif">
                        {subject.name}
                      </h3>
                      <p className="text-xs font-medium mb-4 text-[#4a4a4a] font-serif italic">
                        {subject.description || subtitle}
                      </p>

                      <div className="flex items-center gap-2 flex-wrap mb-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md bg-[#e0dcd5] text-[#1a1a1a] border border-[#d8d4cb] font-serif">
                          <Layers size={13} />
                          <span>
                            {subject.setCount > 0
                              ? `${subject.setCount} Question ${subject.setCount === 1 ? "Set" : "Sets"}`
                              : "Available Sets"}
                          </span>
                        </div>

                        {subject.totalQuestions > 0 && (
                          <div className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border bg-[#f2efe9] text-[#4a4a4a] border-[#d8d4cb] font-serif">
                            <FileQuestion size={13} />
                            <span>{subject.totalQuestions} Questions</span>
                          </div>
                        )}
                      </div>

                      {subject.versions.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap text-[11px] mb-4 text-[#4a4a4a] font-serif">
                          <span>Years:</span>
                          {subject.versions.slice(0, 3).map((v) => (
                            <span
                              key={v}
                              className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-[#e0dcd5] border border-[#d8d4cb]"
                            >
                              {v}
                            </span>
                          ))}
                          {subject.versions.length > 3 && (
                            <span>+{subject.versions.length - 3}</span>
                          )}
                        </div>
                      )}

                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#d8d4cb]">
                        <span className="text-xs font-bold text-[#4a4a4a] group-hover:text-[#1a1a1a] font-serif">
                          View Question Sets
                        </span>
                        <ChevronRight
                          size={16}
                          className="group-hover:translate-x-1 transition-all text-[#4a4a4a] group-hover:text-[#b91c1c]"
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && filteredSubjects.length === 0 && (
            <div className="text-center py-16 rounded-lg border max-w-md mx-auto p-8 bg-[#f2efe9] border-[#d8d4cb] shadow-[3px_3px_0px_0px_#1a1a1a]">
              <BookOpen size={36} className="mx-auto mb-3 text-[#1a1a1a]" />
              <h3 className="text-base font-black mb-1 text-[#1a1a1a] font-serif">No subjects found</h3>
              <p className="text-sm mb-4 text-[#4a4a4a] font-serif italic">
                {searchQuery
                  ? `No subject matching "${searchQuery}" was found.`
                  : `There are no subjects registered for ${examName} yet.`}
              </p>
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="border px-4 py-2 rounded-md text-xs font-bold transition bg-[#1a1a1a] text-[#f2efe9] border-[#1a1a1a] font-serif shadow-[2px_2px_0px_0px_#b91c1c] hover:shadow-[3px_3px_0px_0px_#b91c1c]"
                >
                  Clear Search
                </button>
              ) : (
                <button
                  onClick={() => navigate("/question-center")}
                  className="border px-4 py-2 rounded-md text-xs font-bold transition bg-[#1a1a1a] text-[#f2efe9] border-[#1a1a1a] font-serif shadow-[2px_2px_0px_0px_#b91c1c] hover:shadow-[3px_3px_0px_0px_#b91c1c]"
                >
                  Back to Exams
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── DARK MODE (Original Code - Unchanged) ─────────────────
  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F5F7FA]">
      <div className="sticky -top-1 z-20 border-b backdrop-blur-xl bg-[#111318]/95 border-[#23262D]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <button
                onClick={() => navigate("/question-center")}
                className="mt-0.5 sm:mt-0 p-2.5 rounded-xl border transition-all active:scale-95 bg-[#161920] border-[#23262D] text-[#A1A8B3] hover:text-[#F5F7FA] hover:bg-[#1C1F26] hover:border-[#9B51E0]/40"
                title="Back to Exam Selection"
              >
                <ArrowLeft size={18} />
              </button>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#9B51E0]/15 text-[#9B51E0] border border-[#9B51E0]/30 uppercase tracking-wider">
                    {examName}
                  </span>
                  <span className="text-xs text-[#A1A8B3]">•</span>
                  <span className="text-xs font-medium text-[#A1A8B3]">Question Center</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold mt-1 tracking-tight text-[#F5F7FA]">
                  Select Subject
                </h1>
              </div>
            </div>

            <div className="relative w-full md:w-72">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A8B3]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subject..."
                className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl transition-all bg-[#161920] border border-[#23262D] text-[#F5F7FA] placeholder:text-[#6B7280] focus:border-[#9B51E0] focus:ring-1 focus:ring-[#9B51E0]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-24">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-[#A1A8B3]">
            Choose a subject under <span className="font-semibold text-[#F5F7FA]">{examName}</span> to view question sets and practice model tests.
          </p>
          {enrichedSubjects.length > 0 && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full hidden sm:inline-block bg-[#161920] text-[#A1A8B3] border border-[#23262D]">
              {enrichedSubjects.length} {enrichedSubjects.length === 1 ? "Subject" : "Subjects"} Available
            </span>
          )}
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={36} className="text-[#9B51E0] animate-spin" />
            <p className="text-sm text-[#A1A8B3]">Loading subjects...</p>
          </div>
        )}

        {!isLoading && isError && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border text-center max-w-md mx-auto p-8 bg-[#111318] border-[#23262D]">
            <AlertCircle size={36} className="text-[#EB5757]" />
            <h3 className="text-base font-bold text-[#F5F7FA]">Failed to load subjects</h3>
            <p className="text-sm text-[#A1A8B3]">
              We couldn't retrieve subjects for this exam. Please try again.
            </p>
            <button
              onClick={() => navigate("/question-center")}
              className="mt-2 px-5 py-2.5 rounded-xl font-bold text-sm transition bg-[#161920] text-[#F5F7FA] border border-[#23262D] hover:bg-[#1C1F26]"
            >
              Back to Exams
            </button>
          </div>
        )}

        {!isLoading && !isError && filteredSubjects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSubjects.map((subject) => {
              const { icon, color, subtitle } = subjectMeta(subject.name);

              return (
                <button
                  key={subject._id}
                  onClick={() =>
                    navigate(`/question-center/${examType}/${subject._id}/type`, {
                      state: {
                        subjectName: subject.name,
                        examName: examName,
                      },
                    })
                  }
                  className="group relative flex h-full flex-col rounded-2xl border transition-all duration-300 overflow-hidden text-left active:scale-[0.985] bg-[#111318] border-[#23262D] hover:border-[#9B51E0]/50 hover:shadow-[0_0_24px_-5px_rgba(155,81,224,0.25)]"
                >
                  <div
                    className="h-1.5 w-full transition-all duration-300 group-hover:h-2"
                    style={{ backgroundColor: color }}
                  />

                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                        style={{
                          backgroundColor: `${color}1A`,
                          border: `1px solid ${color}4D`,
                          color: color,
                        }}
                      >
                        {icon}
                      </div>

                      {subject.code && (
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#161920] text-[#A1A8B3] border border-[#23262D]">
                          {subject.code}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-lg mb-1 transition-colors text-[#F5F7FA] group-hover:text-white">
                      {subject.name}
                    </h3>
                    <p className="text-xs font-medium mb-4 text-[#A1A8B3]">
                      {subject.description || subtitle}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap mb-4">
                      <div
                        className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg"
                        style={{
                          backgroundColor: `${color}14`,
                          color: color,
                          border: `1px solid ${color}33`,
                        }}
                      >
                        <Layers size={13} />
                        <span>
                          {subject.setCount > 0
                            ? `${subject.setCount} Question ${subject.setCount === 1 ? "Set" : "Sets"}`
                            : "Available Sets"}
                        </span>
                      </div>

                      {subject.totalQuestions > 0 && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border bg-[#161920] text-[#A1A8B3] border-[#23262D]">
                          <FileQuestion size={13} />
                          <span>{subject.totalQuestions} Questions</span>
                        </div>
                      )}
                    </div>

                    {subject.versions.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap text-[11px] mb-4 text-[#A1A8B3]">
                        <span className="text-[#6B7280]">Years:</span>
                        {subject.versions.slice(0, 3).map((v) => (
                          <span
                            key={v}
                            className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-[#161920] border border-[#23262D]"
                          >
                            {v}
                          </span>
                        ))}
                        {subject.versions.length > 3 && (
                          <span className="text-[#6B7280]">+{subject.versions.length - 3}</span>
                        )}
                      </div>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#23262D]">
                      <span className="text-xs font-bold transition-colors text-[#A1A8B3] group-hover:text-[#F5F7FA]">
                        View Question Sets
                      </span>
                      <ChevronRight
                        size={16}
                        className="group-hover:translate-x-1 transition-all text-[#6B7280] group-hover:text-[#F5F7FA]"
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {!isLoading && !isError && filteredSubjects.length === 0 && (
          <div className="text-center py-16 rounded-2xl border max-w-md mx-auto p-8 bg-[#111318] border-[#23262D]">
            <BookOpen size={36} className="mx-auto mb-3 text-[#6B7280]" />
            <h3 className="text-base font-bold mb-1 text-[#F5F7FA]">No subjects found</h3>
            <p className="text-sm mb-4 text-[#A1A8B3]">
              {searchQuery
                ? `No subject matching "${searchQuery}" was found.`
                : `There are no subjects registered for ${examName} yet.`}
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="border px-4 py-2 rounded-xl text-xs font-bold transition bg-[#161920] text-[#F5F7FA] border-[#23262D] hover:bg-[#1C1F26]"
              >
                Clear Search
              </button>
            ) : (
              <button
                onClick={() => navigate("/question-center")}
                className="border px-4 py-2 rounded-xl text-xs font-bold transition bg-[#161920] text-[#F5F7FA] border-[#23262D] hover:bg-[#1C1F26]"
              >
                Back to Exams
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}