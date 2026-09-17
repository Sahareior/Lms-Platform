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

// Map subject names to dynamic icons and accent palettes
function subjectMeta(name: string): { icon: ReactNode; color: string; subtitle: string } {
  const lower = (name || "").toLowerCase();

  if (lower.includes("ict") || lower.includes("তথ্য") || lower.includes("কম্পিউটার") || lower.includes("computer")) {
    return {
      icon: <Code2 size={26} />,
      color: "#00C8FF",
      subtitle: "তথ্য ও যোগাযোগ প্রযুক্তি",
    };
  }
  if (lower.includes("physics") || lower.includes("পদার্থ") || lower.includes("science") || lower.includes("বিজ্ঞান")) {
    return {
      icon: <Atom size={26} />,
      color: "#9B51E0",
      subtitle: "বিজ্ঞান ও গবেষণা",
    };
  }
  if (lower.includes("math") || lower.includes("গণিত") || lower.includes("হিসাব") || lower.includes("accounting")) {
    return {
      icon: <Calculator size={26} />,
      color: "#00E5B3",
      subtitle: "গাণিতিক যুক্তি ও সমাধান",
    };
  }
  if (lower.includes("bangla") || lower.includes("বাংলা") || lower.includes("সাহিত্য")) {
    return {
      icon: <Languages size={26} />,
      color: "#EB5757",
      subtitle: "বাংলা ভাষা ও সাহিত্য",
    };
  }
  if (lower.includes("english") || lower.includes("ইংরেজি") || lower.includes("grammar")) {
    return {
      icon: <Globe2 size={26} />,
      color: "#2F80ED",
      subtitle: "English Language & Grammar",
    };
  }
  if (lower.includes("gk") || lower.includes("সাধারণ জ্ঞান") || lower.includes("general knowledge") || lower.includes("বাংলাদেশ") || lower.includes("আন্তর্জাতিক")) {
    return {
      icon: <Compass size={26} />,
      color: "#F2C94C",
      subtitle: "সাধারণ জ্ঞান ও আন্তর্জাতিক",
    };
  }

  // Default
  return {
    icon: <BookOpen size={26} />,
    color: "#9B51E0",
    subtitle: "বিষয়ভিত্তিক প্রস্তুতি",
  };
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

  const [searchQuery, setSearchQuery] = useState("");

  // 1. Fetch user data and all exams to get current Exam name and metadata
  const { data: userData } = useGetMeQuery();
  const { data: allExams } = useGetExamsQuery();

  // 2. Fetch subjects for this exam
  const {
    data: subjectsList,
    isLoading: isSubjectsLoading,
    isError: isSubjectsError,
  } = useGetSubjectsByExamQuery(examType || "", { skip: !examType });

  // 3. Fetch questions to compute set counts, question counts, and detect unlisted subjects
  const {
    data: questionSets,
    isLoading: isQuestionsLoading,
    isError: isQuestionsError,
  } = useGetQuestionsByExamQuery(
    { examId: examType! },
    { skip: !examType }
  );

  // Determine current exam object & name
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

  // Combine subject list with questions aggregation
  const enrichedSubjects = useMemo(() => {
    const map = new Map<string, EnrichedSubject>();

    // 1. Initialize from subjects API if available
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

    // 2. Aggregate question sets
    if (questionSets && Array.isArray(questionSets)) {
      questionSets.forEach((set: any) => {
        const subId =
          set?.subject?._id ||
          (typeof set?.subject === "string" ? set.subject : null) ||
          set?._id;
        const subName = set?.subject?.name || set?.subjectName || "General";
        const qCount = Array.isArray(set?.data) ? set.data.length : 0;
        const version = set?.examVersion?.examVersion || "";

        if (subId) {
          if (!map.has(subId)) {
            // Check if there is already an entry with matching name
            let foundExistingKey: string | null = null;
            for (const [key, val] of map.entries()) {
              if (val.name.trim().toLowerCase() === subName.trim().toLowerCase()) {
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
              map.set(subId, {
                _id: subId,
                name: subName,
                setCount: 1,
                totalQuestions: qCount,
                versions: version ? [version] : [],
              });
            }
          } else {
            const existing = map.get(subId)!;
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

  // Filter subjects by search
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

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F5F7FA]">
      {/* Top Header */}
      <div className="bg-[#111318]/95 backdrop-blur-xl border-b border-[#23262D] sticky -top-1 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            {/* Left: Back & Titles */}
            <div className="flex items-start sm:items-center gap-3.5">
              <button
                onClick={() => navigate("/question-center")}
                className="mt-0.5 sm:mt-0 p-2.5 rounded-xl bg-[#161920] border border-[#23262D] text-[#A1A8B3] hover:text-[#F5F7FA] hover:bg-[#1C1F26] hover:border-[#9B51E0]/40 transition-all active:scale-95"
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
                  <span className="text-xs text-[#A1A8B3] font-medium">Question Center</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#F5F7FA] mt-1 tracking-tight">
                  Select Subject
                </h1>
              </div>
            </div>

            {/* Right: Search Box */}
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
                className="w-full bg-[#161920] border border-[#23262D] text-[#F5F7FA] text-sm pl-10 pr-4 py-2.5 rounded-xl placeholder:text-[#6B7280] focus:outline-none focus:border-[#9B51E0] focus:ring-1 focus:ring-[#9B51E0] transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-24">
        
        {/* Subtitle Banner */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-[#A1A8B3]">
            Choose a subject under <span className="text-[#F5F7FA] font-semibold">{examName}</span> to view question sets and practice model tests.
          </p>
          {enrichedSubjects.length > 0 && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#161920] text-[#A1A8B3] border border-[#23262D] hidden sm:inline-block">
              {enrichedSubjects.length} {enrichedSubjects.length === 1 ? "Subject" : "Subjects"} Available
            </span>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={36} className="text-[#9B51E0] animate-spin" />
            <p className="text-[#A1A8B3] text-sm">Loading subjects...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 bg-[#111318] rounded-2xl border border-[#23262D] text-center max-w-md mx-auto p-8">
            <AlertCircle size={36} className="text-[#EB5757]" />
            <h3 className="text-base font-bold text-[#F5F7FA]">Failed to load subjects</h3>
            <p className="text-[#A1A8B3] text-sm">
              We couldn't retrieve subjects for this exam. Please try again.
            </p>
            <button
              onClick={() => navigate("/question-center")}
              className="mt-2 bg-[#161920] text-[#F5F7FA] border border-[#23262D] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1C1F26] transition"
            >
              Back to Exams
            </button>
          </div>
        )}

        {/* Subjects Grid */}
        {!isLoading && !isError && filteredSubjects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSubjects.map((subject) => {
              const { icon, color, subtitle } = subjectMeta(subject.name);

              return (
                <button
                  key={subject._id}
                  onClick={() =>
                    navigate(`/question-center/${examType}/${subject._id}`, {
                      state: {
                        subjectName: subject.name,
                        examName: examName,
                      },
                    })
                  }
                  className="group relative flex h-full flex-col bg-[#111318] rounded-2xl border border-[#23262D] hover:border-[#9B51E0]/50 hover:shadow-[0_0_24px_-5px_rgba(155,81,224,0.25)] transition-all duration-300 overflow-hidden text-left active:scale-[0.985]"
                >
                  {/* Top accent bar */}
                  <div
                    className="h-1.5 w-full transition-all duration-300 group-hover:h-2"
                    style={{ backgroundColor: color }}
                  />

                  <div className="flex flex-1 flex-col p-6">
                    {/* Header: Icon & Code Badge */}
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

                    {/* Subject Title */}
                    <h3 className="font-bold text-lg text-[#F5F7FA] mb-1 group-hover:text-white transition-colors">
                      {subject.name}
                    </h3>
                    <p className="text-xs font-medium text-[#A1A8B3] mb-4">
                      {subject.description || subtitle}
                    </p>

                    {/* Stats / Badges */}
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
                        <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#161920] text-[#A1A8B3] border border-[#23262D]">
                          <FileQuestion size={13} />
                          <span>{subject.totalQuestions} Questions</span>
                        </div>
                      )}
                    </div>

                    {/* Versions/Years preview if any */}
                    {subject.versions.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-[#A1A8B3] mb-4">
                        <span className="text-[#6B7280]">Years:</span>
                        {subject.versions.slice(0, 3).map((v) => (
                          <span
                            key={v}
                            className="bg-[#161920] border border-[#23262D] px-1.5 py-0.5 rounded font-mono text-[10px]"
                          >
                            {v}
                          </span>
                        ))}
                        {subject.versions.length > 3 && (
                          <span className="text-[#6B7280]">+{subject.versions.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#23262D]">
                      <span className="text-xs font-bold text-[#A1A8B3] group-hover:text-[#F5F7FA] transition-colors">
                        View Question Sets
                      </span>
                      <ChevronRight
                        size={16}
                        className="text-[#6B7280] group-hover:text-[#F5F7FA] group-hover:translate-x-1 transition-all"
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
          <div className="text-center py-16 bg-[#111318] rounded-2xl border border-[#23262D] max-w-md mx-auto p-8">
            <BookOpen size={36} className="text-[#6B7280] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#F5F7FA] mb-1">No subjects found</h3>
            <p className="text-[#A1A8B3] text-sm mb-4">
              {searchQuery
                ? `No subject matching "${searchQuery}" was found.`
                : `There are no subjects registered for ${examName} yet.`}
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="bg-[#161920] text-[#F5F7FA] border border-[#23262D] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#1C1F26] transition"
              >
                Clear Search
              </button>
            ) : (
              <button
                onClick={() => navigate("/question-center")}
                className="bg-[#161920] text-[#F5F7FA] border border-[#23262D] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#1C1F26] transition"
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
