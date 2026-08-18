// ─── BrainForge consistent accent colors for charts ─────────
export const chartColors = ["#2F80ED", "#9B51E0", "#00E5B3", "#F2C94C", "#EB5757", "#00C8FF"];

export interface TopicData {
  _id: string;
  topic: string;
  subject: string;
}

export interface AnalysisData {
  _id: string;
  subjects: Record<string, number>;
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
  const colors: Record<string, string> = {
    Math: "from-[#2F80ED] to-[#00C8FF]",
    "Mental Ability": "from-[#9B51E0] to-[#D04EDB]",
    "Computer & Information Technology": "from-[#00E5B3] to-[#00C8FF]",
    "International Affairs": "from-[#F2C94C] to-[#F2994A]",
    "Bengali Literature": "from-[#00E5B3] to-[#2F80ED]",
    "English Literature": "from-[#2F80ED] to-[#F2C94C]",
    "General Science": "from-[#9B51E0] to-[#2F80ED]",
    "Bangladesh Affairs": "from-[#EB5757] to-[#9B51E0]",
    "Governance & Good Governance": "from-[#F2C94C] to-[#EB5757]",
    "Bengali Language": "from-[#00C8FF] to-[#2F80ED]",
    "Geography, Environment & Disaster Management": "from-[#00E5B3] to-[#9B51E0]",
    "English Language": "from-[#9B51E0] to-[#00E5B3]",
  };
  return colors[subject] || "from-[#2F80ED] to-[#00E5B3]";
};

export const getSubjectBadgeColor = (subject: string) => {
  const colors: Record<string, string> = {
    Math: "bg-[#2F80ED]/10 text-[#2F80ED] border-[#2F80ED]/30",
    "Mental Ability": "bg-[#9B51E0]/10 text-[#9B51E0] border-[#9B51E0]/30",
    "Computer & Information Technology": "bg-[#00E5B3]/10 text-[#00E5B3] border-[#00E5B3]/30",
    "International Affairs": "bg-[#F2C94C]/10 text-[#F2C94C] border-[#F2C94C]/30",
    "Bengali Literature": "bg-[#00E5B3]/10 text-[#00E5B3] border-[#00E5B3]/30",
    "English Literature": "bg-[#2F80ED]/10 text-[#2F80ED] border-[#2F80ED]/30",
    "General Science": "bg-[#9B51E0]/10 text-[#9B51E0] border-[#9B51E0]/30",
    "Bangladesh Affairs": "bg-[#EB5757]/10 text-[#EB5757] border-[#EB5757]/30",
    "Governance & Good Governance": "bg-[#F2C94C]/10 text-[#F2C94C] border-[#F2C94C]/30",
    "Bengali Language": "bg-[#00C8FF]/10 text-[#00C8FF] border-[#00C8FF]/30",
    "Geography, Environment & Disaster Management": "bg-[#00E5B3]/10 text-[#00E5B3] border-[#00E5B3]/30",
    "English Language": "bg-[#2F80ED]/10 text-[#2F80ED] border-[#2F80ED]/30",
  };
  return colors[subject] || "bg-[#A1A8B3]/10 text-[#A1A8B3] border-[#A1A8B3]/30";
};

// Process API data into derived stats for the analysis page.
export const processAnalysis = (data: AnalysisData | null | undefined): ProcessedAnalysis | null => {
  if (!data) return null;
  const rawData = data;

  const totalQuestions = Object.values(rawData.subjects).reduce((a, b) => a + b, 0);
  const topSubjects = Object.entries(rawData.subjects)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const topicFrequency: Record<string, number> = {};
  rawData.categorized_questions.forEach((item) => {
    topicFrequency[item.topic] = (topicFrequency[item.topic] || 0) + 1;
  });
  const topTopics = Object.entries(topicFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    raw: rawData,
    totalQuestions,
    topSubjects,
    topTopics,
    subjectCount: Object.keys(rawData.subjects).length,
    topicCount: rawData.categorized_questions.length,
  };
};
