import { useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  ArrowRight,
  Code2,
  Atom,
  Calculator,
  Globe2,
  Languages,
  Compass,
  Sparkles,
  GraduationCap,
  Layers,
} from "lucide-react";
import type { ReactNode } from "react";
import { useTheme } from "../../../../theme/ThemeContext";


function getSubjectVisuals(name: string): {
  icon: ReactNode;
  gradient: string;
  badgeColor: string;
  borderColor: string;
} {
  const lower = (name || "").toLowerCase();

  if (lower.includes("ict") || lower.includes("তথ্য") || lower.includes("কম্পিউটার") || lower.includes("computer")) {
    return {
      icon: <Code2 size={24} className="text-[#00C8FF]" />,
      gradient: "from-[#00C8FF]/15 via-[#00C8FF]/5 to-transparent",
      badgeColor: "bg-[#00C8FF]/10 text-[#00C8FF] border-[#00C8FF]/30",
      borderColor: "hover:border-[#00C8FF]/50",
    };
  }
  if (lower.includes("physics") || lower.includes("পদার্থ") || lower.includes("science") || lower.includes("বিজ্ঞান")) {
    return {
      icon: <Atom size={24} className="text-[#9B51E0]" />,
      gradient: "from-[#9B51E0]/15 via-[#9B51E0]/5 to-transparent",
      badgeColor: "bg-[#9B51E0]/10 text-[#9B51E0] border-[#9B51E0]/30",
      borderColor: "hover:border-[#9B51E0]/50",
    };
  }
  if (lower.includes("chem") || lower.includes("রসায়ন")) {
    return {
      icon: <Layers size={24} className="text-[#FF7A00]" />,
      gradient: "from-[#FF7A00]/15 via-[#FF7A00]/5 to-transparent",
      badgeColor: "bg-[#FF7A00]/10 text-[#FF7A00] border-[#FF7A00]/30",
      borderColor: "hover:border-[#FF7A00]/50",
    };
  }
  if (lower.includes("math") || lower.includes("গণিত") || lower.includes("হিসাব") || lower.includes("accounting")) {
    return {
      icon: <Calculator size={24} className="text-[#00E5B3]" />,
      gradient: "from-[#00E5B3]/15 via-[#00E5B3]/5 to-transparent",
      badgeColor: "bg-[#00E5B3]/10 text-[#00E5B3] border-[#00E5B3]/30",
      borderColor: "hover:border-[#00E5B3]/50",
    };
  }
  if (lower.includes("bangla") || lower.includes("বাংলা") || lower.includes("সাহিত্য")) {
    return {
      icon: <Languages size={24} className="text-[#EB5757]" />,
      gradient: "from-[#EB5757]/15 via-[#EB5757]/5 to-transparent",
      badgeColor: "bg-[#EB5757]/10 text-[#EB5757] border-[#EB5757]/30",
      borderColor: "hover:border-[#EB5757]/50",
    };
  }
  if (lower.includes("english") || lower.includes("ইংরেজি") || lower.includes("grammar")) {
    return {
      icon: <Globe2 size={24} className="text-[#2F80ED]" />,
      gradient: "from-[#2F80ED]/15 via-[#2F80ED]/5 to-transparent",
      badgeColor: "bg-[#2F80ED]/10 text-[#2F80ED] border-[#2F80ED]/30",
      borderColor: "hover:border-[#2F80ED]/50",
    };
  }
  if (lower.includes("gk") || lower.includes("সাধারণ জ্ঞান") || lower.includes("general") || lower.includes("বাংলাদেশ")) {
    return {
      icon: <Compass size={24} className="text-[#F2C94C]" />,
      gradient: "from-[#F2C94C]/15 via-[#F2C94C]/5 to-transparent",
      badgeColor: "bg-[#F2C94C]/10 text-[#F2C94C] border-[#F2C94C]/30",
      borderColor: "hover:border-[#F2C94C]/50",
    };
  }

  return {
    icon: <BookOpen size={24} className="text-[#9B51E0]" />,
    gradient: "from-[#9B51E0]/15 via-[#9B51E0]/5 to-transparent",
    badgeColor: "bg-[#9B51E0]/10 text-[#9B51E0] border-[#9B51E0]/30",
    borderColor: "hover:border-[#9B51E0]/50",
  };
}

interface SubjectItem {
  _id: string;
  name: string;
  code?: string;
  description?: string;
}

interface SubjectSelectionScreenProps {
  examName: string;
  subjects: SubjectItem[];
  rawSubjectsCount: Record<string, number>;
  onSelectSubject: (id: string, name: string) => void;
  onViewAllCombined: () => void;
  onChangeExam: () => void;
}

export default function SubjectSelectionScreen({
  examName,
  subjects,
  rawSubjectsCount,
  onSelectSubject,
  onViewAllCombined,
  onChangeExam,
}: SubjectSelectionScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { isDark } = useTheme();

  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return subjects;
    const q = searchQuery.toLowerCase();
    return subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.code && s.code.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q))
    );
  }, [subjects, searchQuery]);

  return (
    <div className={`flex-1 min-h-screen font-sans ${isDark ? "text-[#F5F7FA] bg-[#0B0D12]" : "text-[#1a1a1a] bg-[#e8e4db]"}`}>
      <div className="max-w-8xl px-4 mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <button
            onClick={onChangeExam}
            className={isDark ? "inline-flex items-center gap-2 text-xs font-semibold text-[#A1A8B3] hover:text-[#F5F7FA] transition-colors group" : "inline-flex items-center gap-2 text-xs font-semibold text-[#4a4a4a] hover:text-[#1a1a1a] transition-colors group font-serif"}
          >
            <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" />
            <span>Change Exam</span>
          </button>

          <div className={`inline-flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-xl border ${isDark ? "text-[#F5F7FA] bg-[#111318] border-[#23262D]" : "text-[#1a1a1a] bg-[#f2efe9] border-[#d8d4cb] shadow-[2px_2px_0px_0px_#1a1a1a]"}`}>
            <GraduationCap size={14} className="text-[#9B51E0]" />
            <span>{examName}</span>
          </div>
        </div>

        <div className={`relative overflow-hidden rounded-3xl border p-8 md:p-10 ${isDark ? "bg-gradient-to-br from-[#14171E] via-[#111318] to-[#0D0F14] border-[#23262D] shadow-2xl" : "bg-[#f2efe9] border-[#d8d4cb] shadow-[3px_3px_0px_0px_#1a1a1a]"}`}>
          <div className={isDark ? "absolute -top-24 -right-24 w-80 h-80 bg-[#9B51E0]/20 rounded-full blur-3xl pointer-events-none" : "absolute -top-24 -right-24 w-80 h-80 bg-[#d6cfbe]/60 rounded-full blur-3xl pointer-events-none"} />
          <div className={isDark ? "absolute -bottom-24 -left-24 w-72 h-72 bg-[#00C8FF]/15 rounded-full blur-3xl pointer-events-none" : "absolute -bottom-24 -left-24 w-72 h-72 bg-[#e4dccd]/80 rounded-full blur-3xl pointer-events-none"} />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-extrabold tracking-wide uppercase ${isDark ? "bg-[#9B51E0]/10 border-[#9B51E0]/30 text-[#9B51E0]" : "bg-[#e8e4db] border-[#d8d4cb] text-[#1a1a1a]"}`}>
              <Sparkles size={13} />
              <span>Question Pattern Intelligence</span>
            </div>

            <h1 className={isDark ? "text-2xl md:text-2xl font-extrabold text-white tracking-tight leading-tight" : "text-3xl md:text-4xl font-black text-[#1a1a1a] tracking-tight leading-tight font-serif"}>
              Select a Subject to Explore Question Patterns
            </h1>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className={isDark ? "text-base font-extrabold text-[#F5F7FA] flex items-center gap-2" : "text-base font-black text-[#1a1a1a] flex items-center gap-2 font-serif"}>
              <BookOpen size={18} className={isDark ? "text-[#00E5B3]" : "text-[#b91c1c]"} />
              <span>Available Subjects ({filteredSubjects.length})</span>
            </h2>
          </div>

          {filteredSubjects.length === 0 ? (
            <div className={`p-12 text-center rounded-2xl border space-y-3 ${isDark ? "bg-[#111318] border-[#23262D]" : "bg-[#f2efe9] border-[#d8d4cb] shadow-[3px_3px_0px_0px_#1a1a1a]"}`}>
              <div className="text-3xl">📚</div>
              <h3 className={isDark ? "text-base font-bold text-[#F5F7FA]" : "text-base font-black text-[#1a1a1a] font-serif"}>No subjects match your search</h3>
              <p className={isDark ? "text-xs text-[#A1A8B3]" : "text-xs text-[#4a4a4a] font-serif italic"}>Try searching with a different term or clear the search query.</p>
              <button
                onClick={() => setSearchQuery("")}
                className={isDark ? "text-xs font-bold text-[#9B51E0] hover:underline" : "text-xs font-bold text-[#1a1a1a] hover:underline font-serif"}
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredSubjects.map((sub) => {
                const visuals = getSubjectVisuals(sub.name);
                const count = rawSubjectsCount[sub.name];

                return (
                  <div
                    key={sub._id || sub.name}
                    onClick={() => onSelectSubject(sub._id, sub.name)}
                    className={`cursor-pointer group relative overflow-hidden border ${visuals.borderColor} rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between ${isDark ? "bg-[#111318] hover:bg-[#14171E] border-[#23262D] hover:shadow-xl hover:shadow-black/40" : "bg-[#f2efe9] border-[#d8d4cb] shadow-[3px_3px_0px_0px_#1a1a1a] hover:shadow-[2px_2px_0px_0px_#1a1a1a]"}`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${visuals.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                    <div className="relative z-10 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center group-hover:scale-110 transition-transform ${isDark ? "bg-[#161920] border-[#23262D]" : "bg-[#e8e4db] border-[#d8d4cb]"}`}>
                          {visuals.icon}
                        </div>

                        {sub.code && (
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border ${visuals.badgeColor}`}>
                            {sub.code}
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className={isDark ? "text-base font-bold text-[#F5F7FA] group-hover:text-white transition-colors leading-snug" : "text-base font-black text-[#1a1a1a] group-hover:text-[#b91c1c] transition-colors leading-snug font-serif"}>
                          {sub.name}
                        </h3>
                        {sub.description && (
                          <p className={isDark ? "text-xs text-[#A1A8B3] mt-1 line-clamp-2" : "text-xs text-[#4a4a4a] mt-1 line-clamp-2 font-serif italic"}>
                            {sub.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className={`relative z-10 pt-4 mt-4 border-t flex items-center justify-between text-xs ${isDark ? "border-[#23262D]/60" : "border-[#d8d4cb]"}`}>
                      {count !== undefined && count > 0 ? (
                        <span className={isDark ? "text-[11px] font-bold text-[#00E5B3]" : "text-[11px] font-bold text-[#1a1a1a] font-serif"}>
                          {count} Questions Analyzed
                        </span>
                      ) : (
                        <span className={isDark ? "text-[11px] text-[#6B7280]" : "text-[11px] text-[#4a4a4a] font-serif italic"}>
                          Explore Pattern
                        </span>
                      )}

                      <span className={isDark ? "inline-flex items-center gap-1 font-bold text-[#9B51E0] group-hover:translate-x-1 transition-transform text-xs" : "inline-flex items-center gap-1 font-bold text-[#1a1a1a] group-hover:translate-x-1 transition-transform text-xs font-serif"}>
                        <span>Analyze</span>
                        <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
