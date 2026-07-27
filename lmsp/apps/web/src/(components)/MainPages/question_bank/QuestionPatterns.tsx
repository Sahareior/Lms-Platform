import { useGetAnalyzedQuestionsQuery } from "@my-monorepo/store/src/redux/api/examApi";
import { useState, useMemo } from "react";
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

const QuestionPatterns = () => {
  const { data: analysisData, isLoading, isError } = useGetAnalyzedQuestionsQuery();
  const [selectedExam, setSelectedExam] = useState("BCS");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [yearRange, setYearRange] = useState({ start: 2015, end: 2024 });

  // Process API data
  const processedData = useMemo(() => {
    if (!analysisData || analysisData.length === 0) return null;
    
    const rawData = analysisData[0] as AnalysisData;
    
    // Calculate total questions
    const totalQuestions = Object.values(rawData.subjects).reduce((a, b) => a + b, 0);
    
    // Get top subjects by count
    const topSubjects = Object.entries(rawData.subjects)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
    
    // Get top topics (most frequent)
    const topicFrequency: Record<string, number> = {};
    rawData.categorized_questions.forEach(item => {
      topicFrequency[item.topic] = (topicFrequency[item.topic] || 0) + 1;
    });
    
    const topTopics = Object.entries(topicFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    // Group topics by subject
    const topicsBySubject: Record<string, TopicData[]> = {};
    rawData.categorized_questions.forEach(item => {
      if (!topicsBySubject[item.subject]) {
        topicsBySubject[item.subject] = [];
      }
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen font-sans text-slate-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 font-medium">Analyzing question patterns...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !processedData) {
    return (
      <div className="flex-1 min-h-screen font-sans text-slate-800 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-red-50 rounded-2xl border border-red-200">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-bold text-red-700 mb-2">Unable to load analysis</h3>
          <p className="text-red-600 text-sm">Please try refreshing the page or check your connection.</p>
        </div>
      </div>
    );
  }

  const { raw, totalQuestions, topSubjects, topTopics, topicsBySubject, subjectCount, topicCount } = processedData;

  // Filter topics by selected subject
  const filteredTopics = selectedSubject 
    ? topicsBySubject[selectedSubject] || []
    : raw.categorized_questions;

  // Get color for subject
  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      'Math': 'from-blue-500 to-indigo-400',
      'Mental Ability': 'from-purple-500 to-violet-400',
      'Computer & Information Technology': 'from-cyan-500 to-blue-400',
      'International Affairs': 'from-rose-500 to-pink-400',
      'Bengali Literature': 'from-emerald-500 to-teal-400',
      'English Literature': 'from-amber-500 to-yellow-400',
      'General Science': 'from-indigo-500 to-purple-400',
      'Bangladesh Affairs': 'from-red-500 to-rose-400',
      'Governance & Good Governance': 'from-orange-500 to-amber-400',
      'Bengali Language': 'from-teal-500 to-emerald-400',
      'Geography, Environment & Disaster Management': 'from-sky-500 to-cyan-400',
      'English Language': 'from-fuchsia-500 to-pink-400',
    };
    return colors[subject] || 'from-slate-500 to-slate-400';
  };

  // Get badge color for subject
  const getSubjectBadgeColor = (subject: string) => {
    const colors: Record<string, string> = {
      'Math': 'bg-blue-100 text-blue-700 border-blue-200',
      'Mental Ability': 'bg-purple-100 text-purple-700 border-purple-200',
      'Computer & Information Technology': 'bg-cyan-100 text-cyan-700 border-cyan-200',
      'International Affairs': 'bg-rose-100 text-rose-700 border-rose-200',
      'Bengali Literature': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'English Literature': 'bg-amber-100 text-amber-700 border-amber-200',
      'General Science': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'Bangladesh Affairs': 'bg-red-100 text-red-700 border-red-200',
      'Governance & Good Governance': 'bg-orange-100 text-orange-700 border-orange-200',
      'Bengali Language': 'bg-teal-100 text-teal-700 border-teal-200',
      'Geography, Environment & Disaster Management': 'bg-sky-100 text-sky-700 border-sky-200',
      'English Language': 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
    };
    return colors[subject] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="flex-1 min-h-screen font-sans text-slate-800 bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-8xl mx-auto  py-6 space-y-7">

        {/* ═══════════ HERO HEADER ═══════════ */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-7 md:p-10 shadow-2xl">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-blue-500/15 rounded-full blur-3xl"></div>

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5.5 h-5.5 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Question Pattern Analysis</h1>
                  <p className="text-sm text-slate-400 mt-1 max-w-xl">
                    Discover high-probability topics and trends from 10 years of exam data powered by AI analysis.
                  </p>
                </div>
              </div>
            </div>
         
              <div className="flex md:mb-6  items-center gap-3 text-xs font-semibold bg-white/10 backdrop-blur-sm text-white/90 px-4 py-2.5 rounded-xl border border-white/10">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> 10 Years
                </span>
                <span className="w-px h-3.5 bg-white/20"></span>
                <span>{raw.categorized_questions.length} Topics</span>
                <span className="w-px h-3.5 bg-white/20"></span>
                <span>{totalQuestions}+ Qs</span>
              </div>
              {/* <button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/25 active:scale-95">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download Report
              </button> */}
          
          </div>
        </div>

        {/* ═══════════ STATS ═══════════ */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { number: totalQuestions.toLocaleString() + "+", label: "Questions Analyzed", accent: "border-blue-500", iconBg: "bg-blue-50", icon: "📊" },
            { number: topicCount, label: "Topics Identified", accent: "border-indigo-500", iconBg: "bg-indigo-50", icon: "📈" },
            { number: subjectCount, label: "Subjects Covered", accent: "border-emerald-500", iconBg: "bg-emerald-50", icon: "🎯" },
            { number: "45", label: "Exams Covered", accent: "border-amber-500", iconBg: "bg-amber-50", icon: "📝" },
            { number: "91%", label: "Predicted Accuracy", accent: "border-violet-500", iconBg: "bg-violet-50", icon: "✅" },
          ].map((stat, i) => (
            <div key={i} className={`bg-white rounded-2xl shadow-sm border   ${stat.accent} p-2 md:py-4 md:p-2 flex items-center gap-3.5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${stat.iconBg}`}>
                {stat.icon}
              </div>
              <div className="min-w-0">
                <div className="text-lg md:text-xl font-extrabold text-slate-950 leading-tight">{stat.number}</div>
                <div className="text-[11px] text-slate-500 font-semibold mt-0.5 truncate">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ═══════════ FILTERS ═══════════ */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="p-5 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Exam Type */}
              <div className="w-full md:w-48 shrink-0 space-y-2.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Exam Type</label>
                <div className="flex flex-col gap-2.5">
                  {['BCS', 'Bank Job', 'Primary Teacher', 'NTRCA'].map((exam) => (
                    <button
                      key={exam}
                      onClick={() => setSelectedExam(exam)}
                      className={`w-full px-4 py-2.5 text-xs font-bold rounded-xl transition-all text-center ${
                        selectedExam === exam
                          ? 'bg-[#0f172a] text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100 border border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {exam}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div className="flex-1 space-y-2.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Subject</label>
                <div className="flex flex-wrap gap-2.5">
                  <div
                   
                    className={`px-3 py-2.5 text-xs font-bold rounded-xl transition-all text-center whitespace-nowrap ${
                      !selectedSubject
                        ? 'bg-[#0f172a] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    All Subjects
                  </div>
                  {Object.keys(raw.subjects).map((subject) => (
                    <div
                      key={subject}
                      onClick={() => setSelectedSubject(subject)}
                      className={`px-3 py-2.5 text-xs font-bold rounded-xl transition-all text-center whitespace-nowrap ${
                        selectedSubject === subject
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100 border border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {subject}
                      <span className="ml-1.5 text-[10px] opacity-60">({raw.subjects[subject]})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Filter Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 md:px-6 py-4 bg-slate-50/80 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 w-full sm:w-auto">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest shrink-0">Year Range</span>
              <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm w-full sm:w-auto min-w-[240px]">
                <span className="text-xs text-slate-500 font-semibold shrink-0">{yearRange.start}</span>
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full relative">
                  <div className="w-full h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"></div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-emerald-500 rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform"></div>
                </div>
                <span className="text-xs text-slate-900 font-bold shrink-0">{yearRange.end}</span>
              </div>
            </div>
            <button className="w-full sm:w-auto bg-[#0f172a] text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-[#1e293b] transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013l-1.548.915a2.25 2.25 0 0 1-3.006-2.013v-3.842a2.25 2.25 0 0 0-.659-1.591L4.659 6.29A2.25 2.25 0 0 1 4 4.699V3.774c0-.54.384-1.006.917-1.096A47.966 47.966 0 0 1 12 3z" />
              </svg>
              Apply Filters
            </button>
          </div>
        </div>

        {/* ═══════════ CHARTS ROW ═══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Top Subjects */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Top Subjects</h3>
                <p className="text-[13px] inter text-slate-800 mt-0.5">By question count</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 animate-pulse">LIVE</span>
            </div>
            <div className="space-y-4 flex-1">
              {topSubjects.map(([subject, count], idx) => {
                const maxCount = topSubjects[0][1];
                const percentage = (count / maxCount) * 100;
                return (
                  <div key={idx} className="group">
                    <div className="flex justify-between items-baseline text-xs mb-1.5">
                      <span className="font-semibold text-slate-700 group-hover:text-slate-900 transition-colors truncate pr-2">{subject}</span>
                      <span className="text-slate-950 font-extrabold text-sm flex-shrink-0">{count}</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${getSubjectColor(subject)} rounded-full transition-all duration-500 group-hover:shadow-sm`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 2: Subject-wise Distribution (Donut) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col">
            <div className="mb-5">
              <h3 className="font-bold text-slate-900 text-sm">Subject Distribution</h3>
              <p className="text-[13px] inter text-slate-800 mt-0.5">BCS Previous 40 (2015-2024)</p>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 gap-5">
              <div className="relative w-36 h-36 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                  {topSubjects.map(([subject, count], idx) => {
                    const percentage = (count / totalQuestions) * 100;
                    const colors = ['#0d9488', '#7c3aed', '#2563eb', '#f59e0b', '#ef4444', '#ec4899'];
                    const offset = topSubjects.slice(0, idx).reduce((acc, [, c]) => acc + (c / totalQuestions) * 100, 0);
                    return (
                      <circle
                        key={idx}
                        cx="18"
                        cy="18"
                        r="15.9155"
                        fill="none"
                        stroke={colors[idx % colors.length]}
                        strokeWidth="4.5"
                        strokeDasharray={`${percentage}, 100`}
                        strokeDashoffset={`-${offset}`}
                        strokeLinecap="round"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl font-extrabold text-slate-950">{totalQuestions}</div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Questions</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-xs w-full">
                {topSubjects.map(([subject, count], idx) => {
                  const colors = ['bg-teal-500', 'bg-violet-600', 'bg-blue-600', 'bg-amber-500', 'bg-red-500', 'bg-pink-500'];
                  return (
                    <div key={idx} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <span className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]} flex-shrink-0`}></span>
                        <span className="truncate text-slate-600 text-[13px] font-medium">{subject}</span>
                      </span>
                      <span className="font-extrabold text-slate-900">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chart 3: Top Topics */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Most Frequent Topics</h3>
              <p className="text-[13px] inter text-slate-800 mt-0.5">Across all subjects</p>
            </div>
            <div className="space-y-3 flex-1">
              {topTopics.map(([topic, count], idx) => {
                const maxCount = topTopics[0][1];
                const percentage = (count / maxCount) * 100;
                const topicData = raw.categorized_questions.find(t => t.topic === topic);
                return (
                  <div key={idx} className="group">
                    <div className="flex justify-between items-center text-[13px] mb-1">
                      <span className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors truncate pr-2 flex-1">{topic}</span>
                      <span className="flex items-center gap-2 flex-shrink-0">
                        {topicData && (
                          <span className={`text-[13px] px-1.5 py-0.5 rounded ${getSubjectBadgeColor(topicData.subject)}`}>
                            {topicData.subject}
                          </span>
                        )}
                        <span className="font-extrabold text-slate-900">{count}</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 text-xs text-emerald-700 font-semibold leading-relaxed flex items-start gap-2">
              <span className="text-base flex-shrink-0">⚡</span>
              <span><strong className="text-emerald-900">{topTopics[0]?.[0]}</strong> appears most frequently with <strong className="text-emerald-900">{topTopics[0]?.[1]}</strong> occurrences.</span>
            </div>
          </div>
        </div>

        {/* ═══════════ ALL TOPICS GRID ═══════════ */}
         <AiPredictTopic />

        {/* ═══════════ FOOTER CTA ═══════════ */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-7 md:p-8 shadow-xl">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-white">Download Full Pattern Analysis Report</h3>
                <p className="text-slate-400 text-xs md:text-sm">PDF • 28 pages • BCS 2015-2024 • Chapter-wise breakdown & predictions.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button className="border border-white/20 hover:bg-white/10 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all w-full md:w-auto text-center active:scale-95">
                Preview
              </button>
              <button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all w-full md:w-auto flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
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