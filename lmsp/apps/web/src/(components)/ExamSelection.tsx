import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, Briefcase, GraduationCap, Building2, BookOpen, 
  Zap, Plus, ArrowRight, CheckCircle2, Users, Sparkles, 
  Star, ChevronRight 
} from 'lucide-react';
import { useGetExamsQuery } from '@my-monorepo/store';

// --- Color themes per exam category ---
const examThemes: Record<string, { pill: string; }> = {
  default: { pill: 'bg-emerald-50 text-emerald-700' },
  government: { pill: 'bg-blue-50 text-blue-700' },
  bank: { pill: 'bg-amber-50 text-amber-700' },
  teacher: { pill: 'bg-violet-50 text-violet-700' },
  custom: { pill: 'bg-rose-50 text-rose-700' },
};

// --- Mock Data with categorized subjects and themes ---
const exams = [
  {
    id: 1,
    title: "BCS Preliminary",
    description: "Comprehensive preparation for Bangladesh Civil Service preliminary examination with all required subjects.",
    subjects: ["Bangla", "English", "Math", "GK", "Science", "Mental Ability"],
    applicants: "4,00,000+ yearly applicants",
    icon: Briefcase,
    theme: 'government',
    gradient: 'from-blue-600 via-blue-500 to-indigo-400',
    popularity: 98,
  },
  {
    id: 2,
    title: "Bank Job",
    description: "Complete coverage for all bank recruitment exams including cash, IT, and officer positions.",
    subjects: ["Quantitative", "English", "GK", "Computer", "Bangladesh Economy"],
    applicants: "2,50,000+ yearly applicants",
    icon: Building2,
    theme: 'bank',
    gradient: 'from-amber-500 via-amber-400 to-orange-300',
    popularity: 95,
  },
  {
    id: 3,
    title: "Primary Teacher Registration",
    description: "Focused preparation for primary teacher registration exams with pedagogical techniques.",
    subjects: ["Bangla", "English", "Math", "Environmental Sci", "Pedagogy"],
    applicants: "3,50,000+ yearly applicants",
    icon: GraduationCap,
    theme: 'teacher',
    gradient: 'from-violet-500 via-violet-400 to-purple-300',
    popularity: 92,
  },
  {
    id: 4,
    title: "NTRCA",
    description: "National Teacher Registration exam preparation for secondary and higher secondary levels.",
    subjects: ["Subject Content", "GK", "Edu Psychology", "Pedagogy", "ICT"],
    applicants: "5,00,000+ yearly applicants",
    icon: BookOpen,
    theme: 'teacher',
    gradient: 'from-violet-500 via-purple-400 to-fuchsia-300',
    popularity: 90,
  },
  {
    id: 5,
    title: "Polli Bidyut / Govt Job",
    description: "Specialized preparation for rural electricity board and various government job exams.",
    subjects: ["Math", "Bangla", "English", "GK", "Electrical", "Rural Dev"],
    applicants: "1,20,000+ yearly applicants",
    icon: Zap,
    theme: 'government',
    gradient: 'from-blue-500 via-sky-400 to-cyan-300',
    popularity: 85,
  },
  {
    id: 6,
    title: "Custom / Other Exam",
    description: "Set your own syllabus and exam goals. We'll tailor your entire learning experience.",
    subjects: ["Custom Syllabus", "Your Goals", "Flexible"],
    applicants: "Any exam preparation",
    icon: Plus,
    theme: 'custom',
    gradient: 'from-rose-500 via-pink-400 to-rose-300',
    popularity: 100,
  }
];

// --- Top Navigation Component ---
const TopNav = () => (
  <nav className="flex items-center justify-between w-full bg-[#0f172a] px-6 py-4 text-white font-sans border-b border-[#1e293b] shadow-lg shadow-black/10">
    <div className="flex items-center gap-3 group cursor-pointer">
      <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white">
          <path d="M12 2l9 5.25v10.5L12 23l-9-5.25V7.25L12 2z" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-bold text-sm tracking-wide text-white/90">বনীকা প্রস্তুতি</span>
        <span className="text-[9px] text-gray-500 tracking-widest uppercase">BanglaPrep</span>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <span className="text-xs font-medium text-gray-400">Step <span className="text-white font-bold">1</span> of 3</span>
      <div className="flex gap-1.5 items-center">
        <div className="w-8 h-2 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full shadow-sm shadow-emerald-500/30"></div>
        <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
      </div>
    </div>
  </nav>
);

// --- Floating Background Decorations ---
const BackgroundDecorations = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
    <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-200/30 to-teal-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-indigo-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-violet-100/20 to-fuchsia-100/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
    <svg className="absolute top-0 left-0 w-full h-full opacity-[0.015]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.5" fill="#6366f1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  </div>
);

// --- Subject Pills ---
const SubjectPills = ({ subjects, themeKey }: { subjects: string[]; themeKey: string }) => {
  const theme = examThemes[themeKey] || examThemes.default;
  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      {subjects.slice(0, 3).map((subject, i) => (
        <span key={i} className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide ${theme.pill}`}>
          {subject}
        </span>
      ))}
      {subjects.length > 3 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold text-gray-400 bg-gray-100">
          +{subjects.length - 3}
        </span>
      )}
    </div>
  );
};

// --- Main Component ---
export default function ExamSelection() {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { data: examData } = useGetExamsQuery();

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }, []);

  const colors = [
    'from-blue-500 to-indigo-500',
    'from-amber-500 to-orange-500',
    'from-violet-500 to-purple-500',
    'from-emerald-500 to-teal-500',
    'from-rose-500 to-pink-500'
  ];

  const bgColors = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-violet-500', 'bg-rose-500'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-sans flex flex-col relative">
      <BackgroundDecorations />
      <TopNav />

      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 w-full flex flex-col">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-12 md:mb-16 relative">
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-5 border border-emerald-200/60 shadow-sm shadow-emerald-200/30 animate-fade-in">
            <Sparkles size={11} className="text-emerald-500" />
            <span>Personalised Learning Path</span>
            <Sparkles size={11} className="text-emerald-500" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-[44px] font-extrabold text-slate-900 tracking-tight mb-4 leading-tight animate-fade-in-up">
            Which exam are you
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent ml-2">
              preparing for?
            </span>
          </h1>

          <p className="text-slate-500 max-w-2xl text-sm md:text-base leading-relaxed animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            We'll personalize your entire experience based on your goal.
            <br className="hidden sm:block" />
            <span className="text-slate-400">You can select multiple exams to prepare for simultaneously.</span>
          </p>

          {selectedIds.length > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/50 rounded-full px-4 py-1.5 animate-fade-in">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-700">
                <span className="text-emerald-900">{selectedIds.length}</span> exam{selectedIds.length > 1 ? 's' : ''} selected
              </span>
            </div>
          )}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32 md:mb-36">
          {(examData || exams).map((exam: any, index: number) => {
            const examId = exam._id || exam.id?.toString();
            const isSelected = selectedIds.includes(examId);
            const isHovered = hoveredId === examId;
            const themeKey = exam.theme || 'default';
            const colorIndex = (exam.id || index) % colors.length;

            return (
              <div
                key={examId}
                onClick={() => toggleSelection(examId)}
                onMouseEnter={() => setHoveredId(examId)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ animationDelay: `${index * 80}ms` }}
                className={`
                  group relative bg-white rounded-2xl cursor-pointer
                  transition-all duration-300 ease-out
                  flex flex-col overflow-hidden
                  animate-fade-in-up
                  ${isSelected
                    ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-transparent shadow-xl shadow-emerald-200/40 scale-[1.02]'
                    : 'ring-1 ring-slate-100 hover:ring-slate-200 shadow-sm hover:shadow-xl'
                  }
                  ${isHovered && !isSelected ? '-translate-y-1' : ''}
                  active:scale-[0.98]
                `}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleSelection(examId); }}
              >
                {/* === TOP ACCENT BAR === */}
                <div className={`
                  h-1.5 w-full transition-all duration-500 ease-out flex-shrink-0
                  bg-gradient-to-r ${colors[colorIndex]}
                  ${isHovered ? 'h-2' : ''}
                  ${isSelected ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 h-2' : ''}
                `} />

                {/* === IMAGE / ICON SECTION === */}
                <div className="relative overflow-hidden">
                  <div className={`
                    h-36 w-full transition-all duration-500 ease-out
                    bg-gradient-to-br ${colors[colorIndex]}
                    ${isSelected ? 'bg-gradient-to-br from-emerald-100 to-teal-100' : 'opacity-90'}
                  `}>
                    {exam.image ? (
                      <img 
                        src={exam.image} 
                        alt={exam.name} 
                        className={`
                          w-full h-full object-cover transition-all duration-500 ease-out
                          ${isHovered ? 'scale-105' : 'scale-100'}
                        `}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center relative">
                        {/* Decorative circles */}
                        <div className={`
                          absolute w-32 h-32 rounded-full transition-all duration-500
                          ${isSelected ? 'bg-emerald-200/40 -top-10 -right-10' : 'bg-white/20 -top-10 -right-10'}
                        `} />
                        <div className={`
                          absolute w-24 h-24 rounded-full transition-all duration-500
                          ${isSelected ? 'bg-emerald-200/30 -bottom-8 -left-8' : 'bg-white/15 -bottom-8 -left-8'}
                        `} />
                        
                        {/* Icon */}
                        <div className={`
                          relative z-10 p-4 rounded-2xl transition-all duration-300
                          ${isSelected
                            ? 'bg-white shadow-lg shadow-emerald-200/40 scale-110'
                            : 'bg-white/20 backdrop-blur-sm group-hover:bg-white/30 group-hover:scale-105'
                          }
                        `}>
                          {React.createElement(exam.icon || BookOpen, {
                            size: 32,
                            className: `transition-all duration-300 ${isSelected ? 'text-emerald-500' : 'text-white'}`,
                            strokeWidth: 1.5,
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Gradient Overlay */}
                  <div className={`
                    absolute bottom-0 left-0 right-0 h-16 transition-all duration-500
                    ${isSelected ? 'bg-gradient-to-t from-white/90 to-transparent' : 'bg-gradient-to-t from-white/80 to-transparent'}
                  `} />

                  {/* Selected Badge - Top Right */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 z-10">
                      <div className="relative">
                        <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-40" style={{ animationDuration: '1.5s' }} />
                        <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-full p-1.5 border-2 border-white shadow-lg shadow-emerald-500/30 animate-bounce-in">
                          <Check size={13} strokeWidth={3} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Popularity Badge */}
                  <div className="absolute bottom-3 left-3 z-10">
                    <div className={`
                      inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold
                      backdrop-blur-md transition-all duration-300
                      ${isSelected
                        ? 'bg-emerald-500/90 text-white shadow-sm shadow-emerald-500/30'
                        : 'bg-white/80 text-slate-700 shadow-sm'
                      }
                    `}>
                      <Star size={10} className={isSelected ? 'fill-white' : 'fill-amber-400 text-amber-400'} />
                      <span>{exam.popularity || 95}% Match</span>
                    </div>
                  </div>
                </div>

                {/* === CONTENT SECTION === */}
                <div className="p-5 flex flex-col flex-1 relative">
                  {exam.subjects && (
                    <SubjectPills subjects={exam.subjects} themeKey={themeKey} />
                  )}

                  <h3 className={`
                    font-extrabold text-base leading-snug mb-2 transition-colors duration-300
                    ${isSelected ? 'text-emerald-800' : 'text-slate-900 group-hover:text-slate-800'}
                  `}>
                    {exam.name || exam.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed flex-1 mb-4 line-clamp-2">
                    {exam.description}
                  </p>

                  <div className="mt-auto space-y-3">
                    <div className={`
                      h-px w-full transition-all duration-300
                      ${isSelected ? 'bg-emerald-100' : 'bg-slate-100'}
                    `} />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                        <Users size={12} className="text-slate-300" />
                        <span className="truncate max-w-[160px]">{exam.applicants}</span>
                      </div>

                      <div className={`
                        flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg
                        transition-all duration-300
                        ${isSelected
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50'
                          : 'bg-slate-50 text-slate-400 border border-slate-200/50 group-hover:bg-slate-100 group-hover:text-slate-600'
                        }
                      `}>
                        {isSelected ? (
                          <><Check size={11} strokeWidth={3} /><span>Selected</span></>
                        ) : (
                          <><Plus size={11} /><span>Select</span></>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* === STICKY BOTTOM BAR === */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* Skip Link */}
        <div className="flex justify-center mb-2">
          <button className="
            group inline-flex items-center gap-1.5
            text-xs text-slate-400 hover:text-slate-600 
            transition-all duration-200
            bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full 
            border border-slate-200/60 shadow-sm
            hover:bg-white hover:border-slate-300 hover:shadow-md
          ">
            <span>I'll decide later, skip for now</span>
            <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Main Bar */}
        <div className="bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.08)]">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Selection Status */}
            <div className="flex items-center gap-3">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                transition-all duration-300
                ${selectedIds.length > 0
                  ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md shadow-emerald-200/40'
                  : 'bg-slate-100 text-slate-400'
                }
              `}>
                {selectedIds.length}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800">
                  {selectedIds.length > 0 ? 'Exams Selected' : 'No exams selected'}
                </span>
                <span className="text-xs text-slate-400">
                  {selectedIds.length > 0 ? 'Ready to customize your learning path' : 'Pick the exams you want to prepare for'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {selectedIds.length > 0 && (
                <div className="hidden lg:flex items-center gap-2 max-w-[300px]">
                  <div className="flex -space-x-2">
                    {selectedIds.slice(0, 4).map((id) => {
                      const selectedExam = (examData || exams).find((e: any) => (e._id || e.id?.toString()) === id) as any;
                      const initial = (selectedExam?.name || selectedExam?.title || '?').charAt(0);
                      const cIdx = selectedIds.indexOf(id) % bgColors.length;
                      return (
                        <div key={id} className={`
                          w-7 h-7 rounded-full ${bgColors[cIdx]} 
                          border-2 border-white flex items-center justify-center
                          text-[10px] font-bold text-white shadow-sm
                        `}>
                          {initial}
                        </div>
                      );
                    })}
                    {selectedIds.length > 4 && (
                      <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                        +{selectedIds.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  if (selectedIds.length > 0) {
                    navigate('/on-boarding/enroll', { state: { selectedIds } });
                  }
                }}
                className={`
                w-full sm:w-auto flex items-center justify-center gap-2 
                px-7 py-3 rounded-xl font-bold text-sm
                transition-all duration-300 active:scale-95
                ${selectedIds.length > 0
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-200/60 hover:from-emerald-600 hover:to-emerald-700'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }
              `}>
                <span>Next: Enroll Now</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-32 md:h-36 flex-shrink-0" />

      {/* Animation keyframes */}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { transform: scale(1.1); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out both; }
        .animate-fade-in { animation: fade-in 0.4s ease-out both; }
        .animate-bounce-in { animation: bounce-in 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) both; }
      `}</style>
    </div>
  );
}
