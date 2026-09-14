// ─── BrainForge consistent accent colors for charts ─────────
export const chartColors = ["#2F80ED", "#9B51E0", "#00E5B3", "#F2C94C", "#EB5757", "#00C8FF", "#FF7A00", "#A259FF"];

export interface TopicData {
  _id?: string;
  topic: string;
  subject: string;
}

export interface AnalysisData {
  _id?: string;
  exam?: any;
  examVersion?: any;
  subject?: any;
  board?: string;
  subjects: Record<string, number>;
  topics?: Record<string, number>;
  categorized_questions: TopicData[];
}

export interface ProcessedAnalysis {
  raw: AnalysisData;
  totalQuestions: number;
  topSubjects: [string, number][];
  topTopics: [string, number][];
  subjectCount: number;
  topicCount: number;
}

export const getSubjectColor = (subject: string) => {
  const s = (subject || "").toLowerCase();
  if (s.includes("math") || s.includes("গণিত")) return "from-[#00E5B3] to-[#00C8FF]";
  if (s.includes("physics") || s.includes("পদার্থ")) return "from-[#9B51E0] to-[#D04EDB]";
  if (s.includes("chem") || s.includes("রসায়ন")) return "from-[#FF7A00] to-[#F2C94C]";
  if (s.includes("bio") || s.includes("জীব")) return "from-[#00E5B3] to-[#2F80ED]";
  if (s.includes("ict") || s.includes("computer") || s.includes("তথ্য")) return "from-[#00C8FF] to-[#2F80ED]";
  if (s.includes("bangla") || s.includes("বাংলা") || s.includes("bengali")) return "from-[#EB5757] to-[#F2994A]";
  if (s.includes("english") || s.includes("ইংরেজি")) return "from-[#2F80ED] to-[#9B51E0]";
  if (s.includes("accounting") || s.includes("হিসাব")) return "from-[#00E5B3] to-[#F2C94C]";
  if (s.includes("gk") || s.includes("general") || s.includes("জ্ঞান")) return "from-[#F2C94C] to-[#EB5757]";
  
  return "from-[#2F80ED] to-[#00E5B3]";
};

export const getSubjectBadgeColor = (subject: string) => {
  const s = (subject || "").toLowerCase();
  if (s.includes("math") || s.includes("গণিত")) return "bg-[#00E5B3]/10 text-[#00E5B3] border-[#00E5B3]/30";
  if (s.includes("physics") || s.includes("পদার্থ")) return "bg-[#9B51E0]/10 text-[#9B51E0] border-[#9B51E0]/30";
  if (s.includes("chem") || s.includes("রসায়ন")) return "bg-[#FF7A00]/10 text-[#FF7A00] border-[#FF7A00]/30";
  if (s.includes("bio") || s.includes("জীব")) return "bg-[#00E5B3]/10 text-[#00E5B3] border-[#00E5B3]/30";
  if (s.includes("ict") || s.includes("computer") || s.includes("তথ্য")) return "bg-[#00C8FF]/10 text-[#00C8FF] border-[#00C8FF]/30";
  if (s.includes("bangla") || s.includes("বাংলা") || s.includes("bengali")) return "bg-[#EB5757]/10 text-[#EB5757] border-[#EB5757]/30";
  if (s.includes("english") || s.includes("ইংরেজি")) return "bg-[#2F80ED]/10 text-[#2F80ED] border-[#2F80ED]/30";
  if (s.includes("accounting") || s.includes("হিসাব")) return "bg-[#00E5B3]/10 text-[#00E5B3] border-[#00E5B3]/30";
  if (s.includes("gk") || s.includes("general") || s.includes("জ্ঞান")) return "bg-[#F2C94C]/10 text-[#F2C94C] border-[#F2C94C]/30";
  
  return "bg-[#A1A8B3]/10 text-[#A1A8B3] border-[#A1A8B3]/30";
};

// Process single or array of API data into derived stats for the analysis page.
export const processAnalysis = (
  data: AnalysisData | AnalysisData[] | null | undefined,
  selectedSubjectName?: string | null
): ProcessedAnalysis | null => {
  if (!data) return null;

  const items: AnalysisData[] = Array.isArray(data) ? data : [data];
  if (items.length === 0) return null;

  // Aggregate subjects and categorized questions across all matching patterns
  const mergedSubjects: Record<string, number> = {};
  const mergedQuestions: TopicData[] = [];

  for (const item of items) {
    if (item?.subjects) {
      for (const [subKey, count] of Object.entries(item.subjects)) {
        mergedSubjects[subKey] = (mergedSubjects[subKey] || 0) + (typeof count === "number" ? count : Number(count) || 0);
      }
    }
    if (Array.isArray(item?.categorized_questions)) {
      mergedQuestions.push(...item.categorized_questions);
    }
  }

  // Filter categorized questions if a subject is selected
  const activeQuestions = selectedSubjectName
    ? mergedQuestions.filter(
        (q) => q.subject?.trim().toLowerCase() === selectedSubjectName.trim().toLowerCase()
      )
    : mergedQuestions;

  // If filtered questions is empty (e.g. subject name variation), fall back to all merged questions
  const effectiveQuestions = activeQuestions.length > 0 ? activeQuestions : mergedQuestions;

  const totalQuestions = Object.values(mergedSubjects).reduce((a, b) => a + b, 0);

  const topSubjects = Object.entries(mergedSubjects)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const topicFrequency: Record<string, number> = {};
  effectiveQuestions.forEach((item) => {
    if (item?.topic) {
      topicFrequency[item.topic] = (topicFrequency[item.topic] || 0) + 1;
    }
  });

  const topTopics = Object.entries(topicFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const rawData: AnalysisData = {
    _id: items[0]?._id,
    subjects: mergedSubjects,
    categorized_questions: effectiveQuestions,
  };

  return {
    raw: rawData,
    totalQuestions: totalQuestions > 0 ? totalQuestions : effectiveQuestions.length,
    topSubjects,
    topTopics,
    subjectCount: Object.keys(mergedSubjects).length,
    topicCount: effectiveQuestions.length,
  };
};
