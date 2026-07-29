import {
  useGetAnalyzedQuestionsQuery,
  useGetSubjectsByExamQuery,
} from "@my-monorepo/store/src/redux/api/examApi";
import { useGetProfileQuery } from "@my-monorepo/store";
import { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  BookOpen,
  BarChart3,
  Sparkles,
  ArrowRight,
  Search,
  Clock,
  ChevronRight,
  Target,
  GraduationCap,
  PlayCircle,
  Users,
  Star,
  Loader2,
  FileText,
  Brain,
  Download,
} from "lucide-react";
import AiPredictTopic from "./_components/AiPredictTopic";

// Types
interface TopicData {
  _id: string;
  topic: string;
  subject: string;
}

interface AnalysisData {
  _id: string;
  subjects: Record<string, number>;
  categorized_questions: TopicData[];
}

/* ==================================================================
   EXAM SELECTION SCREEN (shown when no examId is in the URL)
   ================================================================== */
function ExamSelectionScreen({ onSelectExam }: { onSelectExam: (examId: string) => void }) {
  const navigate = useNavigate();
  const { data: userData, isLoading: profileLoading } = useGetProfileQuery("6a5ee4291fda2cffc2eafca3");
  const selectedExams = userData?.selectedExams || [];

  const accentColors = [
    "border-[#9B51E0]/50 hover:border-[#9B51E0]",
    "border-[#2F80ED]/50 hover:border-[#2F80ED]",
    "border-[#00E5B3]/50 hover:border-[#00E5B3]",
    "border-[#F2C94C]/50 hover:border-[#F2C94C]",
    "border-[#EB5757]/50 hover:border-[#EB5757]",
  ];

  if (profileLoading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-[#0B0D12]">
        <div className="text-center space-y-4">
          <Loader2 size={32} className="animate-spin text-[#9B51E0] mx-auto" />
          <p className="text-[#A1A8B3] font-semibold">Loading your exams...</p>
        </div>
      </div>
    );
  }

  if (!selectedExams || selectedExams.length === 0) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-[#0B0D12]">
        <div className="text-center max-w-md p-10 bg-[#111318] rounded-2xl border border-[#23262D]">
          <div className="w-16 h-16 bg-[#161920] border border-[#23262D] rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={28} className="text-[#6B7280]" />
          </div>
          <h3 className="text-lg font-bold text-[#F5F7FA] mb-2">No Exams Selected Yet</h3>
          <p className="text-sm text-[#A1A8B3] mb-6">
            You haven't selected any exams yet. Start by enrolling in a course from your dashboard.
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 bg-[#2F80ED] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#256BCE] transition-all active:scale-95"
          >
            <ArrowRight size={15} />
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-8xl space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-[#9B51E0]/10 text-[#9B51E0] text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-[#9B51E0]/30">
            <Sparkles size={11} />
            Question Pattern Analysis
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            Choose an Exam to Analyze
          </h1>
          <p className="text-[#A1A8B3] text-sm leading-relaxed">
            Select one of your enrolled exams to discover high-probability topics, subject distributions, and AI-powered pattern insights.
          </p>
        </div>

        {/* Exam Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedExams.map((exam: any, idx: number) => {
            const accent = accentColors[idx % accentColors.length];
            return (
              <button
                key={exam._id}
                onClick={() => onSelectExam(exam._id)}
                className={`group bg-[#111318] rounded-2xl overflow-hidden border ${accent} shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left active:scale-[0.98]`}
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#9B51E0]/10 border border-[#9B51E0]/30 flex items-center justify-center flex-shrink-0">
                      <FileText size={22} className="text-[#9B51E0]" />
                    </div>
                    <ChevronRight size={18} className="text-[#6B7280] group-hover:text-[#9B51E0] group-hover:translate-x-1 transition-all" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#F5F7FA] group-hover:text-[#9B51E0] transition-colors">{exam.name}</h3>
                    <p className="text-xs text-[#A1A8B3] font-medium mt-1">Click to view question patterns</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#6B7280] pt-2 border-t border-[#23262D]">
                    <BarChart3 size={12} />
                    <span>Pattern Analysis</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer link back to dashboard */}
        <div className="text-center">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B7280] hover:text-[#F5F7FA] transition-colors"
          >
            <ArrowRight size={14} className="rotate-180" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==================================================================
   MAIN QuestionPatterns COMPONENT
   ================================================================== */
const QuestionPatterns = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const examId = searchParams.get("examId");

  const {
    data: analysisData,
    isLoading: isAnalysisLoading,
    isError: isAnalysisError,
  } = useGetAnalyzedQuestionsQuery(examId || undefined);

  const {
    data: subjects,
    isLoading: isSubjectsLoading,
  } = useGetSubjectsByExamQuery(examId || "", { skip: !examId });

  const { data: userData } = useGetProfileQuery("6a5ee4291fda2cffc2eafca3");

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Find the current exam name from user's selected exams
  const currentExam = useMemo(() => {
    if (!examId || !userData?.selectedExams) return null;
    return userData.selectedExams.find((ex: any) => ex._id === examId);
  }, [examId, userData]);

  // Process API data
  const processedData = useMemo(() => {
    if (!analysisData || analysisData.length === 0) return null;
    const rawData = analysisData[0] as AnalysisData;

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

    const topicsBySubject: Record<string, TopicData[]> = {};
    rawData.categorized_questions.forEach((item) => {
      if (!topicsBySubject[item.subject]) topicsBySubject[item.subject] = [];
      topicsBySubject[item.subject].push(item);
    });

    return {
      raw: rawData,
      totalQuestions,
      topSubjects,
      topTopics,
      topicsBySubject,
      subjectCount: Object.keys(rawData.subjects).length,
      topicCount: rawData.categorized_questions.length,
    };
  }, [analysisData]);

  const handleSelectExam = (id: string) => {
    setSearchParams({ examId: id });
    setSelectedSubject(null);
  };

  const handleClearExam = () => {
    setSearchParams({});
    setSelectedSubject(null);
  };

  // ═══════════════════ SHOW EXAM SELECTION ═══════════════════
  if (!examId) {
    return <ExamSelectionScreen onSelectExam={handleSelectExam} />;
  }

  // ═══════════════════ LOADING ═══════════════════
  if (isAnalysisLoading) {
    return (
      <div className="flex-1 min-h-screen font-sans flex items-center justify-center bg-[#0B0D12]">
        <div className="text-center space-y-4">
          <Loader2 size={32} className="animate-spin text-[#9B51E0] mx-auto" />
          <p className="text-[#A1A8B3] font-medium">Analyzing question patterns...</p>
        </div>
      </div>
    );
  }

  // ═══════════════════ ERROR / NO DATA ═══════════════════
  if (isAnalysisError || !processedData) {
    return (
      <div className="flex-1 min-h-screen font-sans flex items-center justify-center bg-[#0B0D12]">
        <div className="text-center max-w-md p-8 bg-[#111318] rounded-2xl border border-[#23262D]">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-bold text-[#EB5757] mb-2">Unable to load analysis</h3>
          <p className="text-[#A1A8B3] text-sm mb-4">
            No question patterns found for this exam yet. Try uploading a question paper first.
          </p>
          <button
            onClick={handleClearExam}
            className="inline-flex items-center gap-2 bg-[#161920] text-[#F5F7FA] border border-[#23262D] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1C1F26] transition-all"
          >
            Choose Another Exam
          </button>
        </div>
      </div>
    );
  }

  const { raw, totalQuestions, topSubjects, topTopics, topicsBySubject, subjectCount, topicCount } = processedData;

  // Build the subject filter list: merge subjects from analysis with the subjects fetched by exam
  const analysisSubjectNames = Object.keys(raw.subjects);
  const examSubjects = subjects || [];
  const subjectOptions = examSubjects.length > 0
    ? examSubjects.map((s: any) => ({ name: s.name, _id: s._id }))
    : analysisSubjectNames.map((name) => ({ name, _id: name }));

  // Filter topics by selected subject
  const filteredTopics = selectedSubject
    ? topicsBySubject[selectedSubject] || []
    : raw.categorized_questions;

  // BrainForge consistent accent colors for charts
  const chartColors = ["#2F80ED", "#9B51E0", "#00E5B3", "#F2C94C", "#EB5757", "#00C8FF"];

  const getSubjectColor = (subject: string) => {
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

  const getSubjectBadgeColor = (subject: string) => {
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

  /* ═══════════════════ RENDER ANALYSIS PAGE ═══════════════════ */
  return (
    <div className="flex-1 min-h-screen font-sans text-[#F5F7FA] bg-[#0B0D12]">
      <div className="max-w-8xl mx-auto py-6 px-4 md:px-6 space-y-7">
        {/* ── TOP NAV BACK ── */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleClearExam}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A1A8B3] hover:text-[#F5F7FA] transition-colors group"
          >
            <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" />
            <span>Change Exam</span>
          </button>
          {currentExam && (
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#F5F7FA] bg-[#111318] px-3 py-1.5 rounded-xl border border-[#23262D]">
              <GraduationCap size={13} className="text-[#9B51E0]" />
              <span>{currentExam.name}</span>
            </div>
          )}
        </div>

        {/* ═══════════ HERO HEADER ═══════════ */}
        <div className="relative overflow-hidden rounded-2xl bg-[#111318] border border-[#23262D] p-7 md:p-10 shadow-sm">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#9B51E0]/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-[#2F80ED]/15 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#9B51E0]/10 border border-[#9B51E0]/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Brain size={22} className="text-[#9B51E0]" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                    Question Pattern Analysis
                  </h1>
                  <p className="text-sm text-[#A1A8B3] mt-1 max-w-xl">
                    {currentExam
                      ? `High-probability topics and trends for ${currentExam.name}`
                      : "Discover high-probability topics and trends from exam data powered by AI analysis."}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex md:mb-6 items-center gap-3 text-xs font-semibold bg-[#161920] text-[#F5F7FA] px-4 py-2.5 rounded-xl border border-[#23262D]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00E5B3] animate-pulse" />{" "}
                10 Years
              </span>
              <span className="w-px h-3.5 bg-[#23262D]" />
              <span>{raw.categorized_questions.length} Topics</span>
              <span className="w-px h-3.5 bg-[#23262D]" />
              <span>{totalQuestions}+ Qs</span>
            </div>
          </div>
        </div>

        {/* ═══════════ STATS ═══════════ */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            {
              number: totalQuestions.toLocaleString() + "+",
              label: "Questions Analyzed",
              accent: "border-[#2F80ED]",
              iconBg: "bg-[#2F80ED]/10 text-[#2F80ED] border border-[#2F80ED]/30",
              icon: <BarChart3 size={18} />,
            },
            {
              number: topicCount,
              label: "Topics Identified",
              accent: "border-[#9B51E0]",
              iconBg: "bg-[#9B51E0]/10 text-[#9B51E0] border border-[#9B51E0]/30",
              icon: <Target size={18} />,
            },
            {
              number: subjectCount,
              label: "Subjects Covered",
              accent: "border-[#00E5B3]",
              iconBg: "bg-[#00E5B3]/10 text-[#00E5B3] border border-[#00E5B3]/30",
              icon: <BookOpen size={18} />,
            },
            {
              number: "45",
              label: "Exams Covered",
              accent: "border-[#F2C94C]",
              iconBg: "bg-[#F2C94C]/10 text-[#F2C94C] border border-[#F2C94C]/30",
              icon: <FileText size={18} />,
            },
            {
              number: "91%",
              label: "Predicted Accuracy",
              accent: "border-[#00C8FF]",
              iconBg: "bg-[#00C8FF]/10 text-[#00C8FF] border border-[#00C8FF]/30",
              icon: <Sparkles size={18} />,
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`bg-[#111318] rounded-2xl border ${stat.accent} p-4 flex items-center gap-3.5 hover:border-opacity-70 transition-all duration-200`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.iconBg}`}>
                {stat.icon}
              </div>
              <div className="min-w-0">
                <div className="text-lg md:text-xl font-extrabold text-[#F5F7FA] leading-tight">
                  {stat.number}
                </div>
                <div className="text-[11px] text-[#A1A8B3] font-semibold mt-0.5 truncate">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ═══════════ FILTERS ═══════════ */}
        <div className="bg-[#111318] rounded-2xl border border-[#23262D] overflow-hidden">
          <div className="p-5 md:p-6 space-y-6">
            <div className="flex flex-col gap-6">
              {/* Subject Filter */}
              <div className="space-y-2.5">
                <label className="block text-[11px] font-bold text-[#A1A8B3] uppercase tracking-widest">
                  Filter by Subject
                </label>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => setSelectedSubject(null)}
                    className={`px-3 py-2.5 text-xs font-bold rounded-xl transition-all text-center whitespace-nowrap ${
                      !selectedSubject
                        ? "bg-[#2F80ED] text-white border-transparent"
                        : "bg-[#161920] text-[#A1A8B3] border border-[#23262D] hover:border-[#323742] hover:text-[#F5F7FA]"
                    }`}
                  >
                    All Subjects
                  </button>
                  {subjectOptions.map((sub: any) => {
                    const count = raw.subjects[sub.name];
                    return (
                      <button
                        key={sub._id || sub.name}
                        onClick={() => setSelectedSubject(sub.name)}
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

        {/* ═══════════ CHARTS ROW ═══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Top Subjects */}
          <div className="bg-[#111318] rounded-2xl border border-[#23262D] p-6 flex h-[440px] overflow-y-scroll flex-col">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-bold text-[#F5F7FA] text-sm">Top Subjects</h3>
                <p className="text-[13px] text-[#A1A8B3] mt-0.5">By question count</p>
              </div>
              <span className="text-[10px] font-bold text-[#00E5B3] bg-[#00E5B3]/10 px-2.5 py-1 rounded-lg border border-[#00E5B3]/30">
                LIVE
              </span>
            </div>
            <div className="space-y-4 flex-1">
              {topSubjects.map(([subject, count], idx) => {
                const maxCount = topSubjects[0][1];
                const percentage = (count / maxCount) * 100;
                const gradient = getSubjectColor(subject);
                return (
                  <div key={idx} className="group">
                    <div className="flex justify-between items-baseline text-xs mb-1.5">
                      <span className="font-semibold text-[#F5F7FA] group-hover:text-[#2F80ED] transition-colors truncate pr-2">
                        {subject}
                      </span>
                      <span className="text-[#F5F7FA] font-extrabold text-sm flex-shrink-0">
                        {count}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-[#1C1F26] rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500 group-hover:shadow-sm`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 2: Subject Distribution (Donut) */}
          <div className="bg-[#111318] rounded-2xl border border-[#23262D] p-6 flex flex-col">
            <div className="mb-5">
              <h3 className="font-bold text-[#F5F7FA] text-sm">
                Subject Distribution
              </h3>
              <p className="text-[13px] text-[#A1A8B3] mt-0.5">
                {currentExam ? currentExam.name : "BCS"} Previous 40 (2015-2024)
              </p>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 gap-5">
              <div className="relative w-36 h-36 flex-shrink-0">
                <svg
                  viewBox="0 0 36 36"
                  className="w-full h-full transform -rotate-90"
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="#1C1F26"
                    strokeWidth="4"
                  />
                  {topSubjects.map(([subject, count], idx) => {
                    const percentage = (count / totalQuestions) * 100;
                    const offset = topSubjects
                      .slice(0, idx)
                      .reduce(
                        (acc, [, c]) => acc + (c / totalQuestions) * 100,
                        0
                      );
                    return (
                      <circle
                        key={idx}
                        cx="18"
                        cy="18"
                        r="15.9155"
                        fill="none"
                        stroke={chartColors[idx % chartColors.length]}
                        strokeWidth="4.5"
                        strokeDasharray={`${percentage}, 100`}
                        strokeDashoffset={`-${offset}`}
                        strokeLinecap="round"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl font-extrabold text-[#F5F7FA]">
                    {totalQuestions}
                  </div>
                  <div className="text-[9px] text-[#A1A8B3] font-bold uppercase tracking-widest">
                    Questions
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-xs w-full">
                {topSubjects.map(([subject, count], idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: chartColors[idx % chartColors.length] }}
                      />
                      <span className="truncate text-[#A1A8B3] text-[13px] font-medium">
                        {subject}
                      </span>
                    </span>
                    <span className="font-extrabold text-[#F5F7FA]">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 3: Top Topics */}
          <div className="bg-[#111318]  h-[440px] overflow-y-scroll rounded-2xl border border-[#23262D] p-6 flex flex-col gap-4">
            <div>
              <h3 className="font-bold text-[#F5F7FA] text-sm">
                Most Frequent Topics
              </h3>
              <p className="text-[13px] text-[#A1A8B3] mt-0.5">
                Across all subjects
              </p>
            </div>
            <div className="space-y-6 flex-1">
              {topTopics.map(([topic, count], idx) => {
                const maxCount = topTopics[0][1];
                const percentage = (count / maxCount) * 100;
                const topicData = raw.categorized_questions.find(
                  (t) => t.topic === topic
                );
                return (
                  <div key={idx} className="group  ">
                    <div className="flex flex-col gap-3 justify-between items-center text-[13px] mb-1">
                      <span className="font-medium text-[#F5F7FA] group-hover:text-[#2F80ED] transition-colors truncate pr-2 flex-1">
                        {topic}
                      </span>
                      <span className="flex items-center gap-2 flex-shrink-0">
                        {topicData && (
                          <span className={`text-[13px] px-1.5 py-0.5 rounded ${getSubjectBadgeColor(topicData.subject)}`}>
                            {topicData.subject}
                          </span>
                        )}
                        <span className="font-extrabold text-[#F5F7FA]">
                          {count}
                        </span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#1C1F26] mt-3 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#2F80ED] to-[#00E5B3] rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="bg-[#00E5B3]/10 border border-[#00E5B3]/30 rounded-xl p-3.5 text-xs text-[#00E5B3] font-semibold leading-relaxed flex items-start gap-2">
              <span className="text-base flex-shrink-0">⚡</span>
              <span>
                <strong className="text-[#00E5B3]">{topTopics[0]?.[0]}</strong>{" "}
                appears most frequently with{" "}
                <strong className="text-[#00E5B3]">{topTopics[0]?.[1]}</strong>{" "}
                occurrences.
              </span>
            </div>
          </div>
        </div>

        {/* ═══════════ AI PREDICTED TOPICS ═══════════ */}
        <AiPredictTopic />

        {/* ═══════════ FOOTER CTA ═══════════ */}
        <div className="relative overflow-hidden rounded-2xl bg-[#111318] border border-[#23262D] p-7 md:p-8 shadow-sm">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#9B51E0]/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-[#2F80ED]/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-[#9B51E0]/10 border border-[#9B51E0]/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                <FileText size={24} className="text-[#9B51E0]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-[#F5F7FA]">
                  Download Full Pattern Analysis Report
                </h3>
                <p className="text-[#A1A8B3] text-xs md:text-sm">
                  PDF &bull; 28 pages &bull;{" "}
                  {currentExam ? currentExam.name : "BCS"} 2015-2024 &bull;
                  Chapter-wise breakdown & predictions.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button className="border border-[#23262D] hover:bg-[#161920] text-[#F5F7FA] text-sm font-semibold px-5 py-2.5 rounded-xl transition-all w-full md:w-auto text-center active:scale-95">
                Preview
              </button>
              <button className="bg-[#9B51E0] hover:bg-[#7E3CC4] text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all w-full md:w-auto flex items-center justify-center gap-2 shadow-lg shadow-[#9B51E0]/25 active:scale-95">
                <Download size={16} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPatterns;