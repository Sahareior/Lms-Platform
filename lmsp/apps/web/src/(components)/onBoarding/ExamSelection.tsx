import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check, Briefcase, GraduationCap, Building2, BookOpen,
  Zap, Plus, ArrowRight, CheckCircle2, Users, Sparkles,
  Star, ChevronRight,
} from 'lucide-react';
import { useGetExamsQuery } from '@my-monorepo/store';

// ─── Vibrant gradients for the image/fallback section ──────────
const gradientMap = [
  'from-blue-600 via-blue-500 to-indigo-400',
  'from-amber-500 via-amber-400 to-orange-300',
  'from-violet-500 via-violet-400 to-purple-300',
  'from-emerald-500 via-emerald-400 to-teal-300',
  'from-rose-500 via-rose-400 to-pink-300',
  'from-cyan-500 via-cyan-400 to-sky-300',
];

// ─── Exam data ──────────────────────────────────────────────────
const exams = [
  {
    id: 1,
    title: 'BCS Preliminary',
    description: 'Comprehensive preparation for Bangladesh Civil Service preliminary examination.',
    subjects: ['Bangla', 'English', 'Math', 'GK', 'Science', 'Mental Ability'],
    applicants: '4,00,000+ yearly',
    icon: Briefcase,
    popularity: 98,
    image: null, // could be a real URL
  },
  // ... rest of exams (same structure)
  {
    id: 6,
    title: 'Custom Exam',
    description: 'Set your own syllabus and goals. We’ll tailor your experience.',
    subjects: ['Custom Syllabus', 'Your Goals', 'Flexible'],
    applicants: 'Any exam',
    icon: Plus,
    popularity: 100,
    image: null,
  },
];

// ─── Top Navigation ────────────────────────────────────────────
const TopNav = () => (
  <nav className="flex items-center justify-between w-full bg-[#111318] px-6 py-4 text-[#F5F7FA] border-b border-[#23262D]">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-xl bg-[#2F80ED]/10 border border-[#2F80ED]/30">
        <BookOpen size={18} className="text-[#2F80ED]" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-bold text-sm">BrainForge</span>
        <span className="text-[10px] text-[#A1A8B3]">Exam Selection</span>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <span className="text-xs font-medium text-[#A1A8B3]">
        Step <span className="text-[#F5F7FA] font-bold">1</span> of 3
      </span>
      <div className="flex gap-1.5 items-center">
        <div className="w-8 h-2 bg-gradient-to-r from-[#00E5B3] to-[#00C298] rounded-full" />
        <div className="w-2 h-2 bg-[#23262D] rounded-full" />
        <div className="w-2 h-2 bg-[#23262D] rounded-full" />
      </div>
    </div>
  </nav>
);

// ─── Subject Pills ─────────────────────────────────────────────
const SubjectPills = ({ subjects }: { subjects: string[] }) => (
  <div className="flex flex-wrap gap-1.5 mb-3">
    {subjects?.slice(0, 3).map((subject, i) => (
      <span
        key={i}
        className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#161920] text-[#A1A8B3] border border-[#23262D]"
      >
        {subject}
      </span>
    ))}
    {subjects?.length > 3 && (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold text-[#A1A8B3] bg-[#161920] border border-[#23262D]">
        +{subjects?.length - 3}
      </span>
    )}
  </div>
);

// ─── Main Component ────────────────────────────────────────────
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

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F5F7FA] flex flex-col relative">
      {/* Subtle background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#2F80ED]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#9B51E0]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00E5B3]/5 rounded-full blur-3xl" />
      </div>

      <TopNav />

      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 w-full flex flex-col relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-1.5 bg-[#00E5B3]/10 text-[#00E5B3] text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-5 border border-[#00E5B3]/30">
            <Sparkles size={11} />
            <span>Personalised Learning Path</span>
            <Sparkles size={11} />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-[44px] font-extrabold tracking-tight mb-4 leading-tight">
            Which exam are you{' '}
            <span className="bg-gradient-to-r from-[#00E5B3] to-[#2F80ED] bg-clip-text text-transparent">
              preparing for?
            </span>
          </h1>

          <p className="text-[#A1A8B3] max-w-2xl text-sm md:text-base leading-relaxed">
            We’ll personalize your entire experience based on your goal.
            <br className="hidden sm:block" />
            <span className="text-[#6B7280]">You can select multiple exams to prepare for simultaneously.</span>
          </p>

          {selectedIds.length > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-[#00E5B3]/10 border border-[#00E5B3]/30 rounded-full px-4 py-1.5">
              <CheckCircle2 size={14} className="text-[#00E5B3]" />
              <span className="text-xs font-semibold text-[#00E5B3]">
                <span className="text-[#F5F7FA]">{selectedIds.length}</span> exam{selectedIds.length > 1 ? 's' : ''} selected
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
            const gradient = gradientMap[index % gradientMap.length];

            return (
              <div
                key={examId}
                onClick={() => toggleSelection(examId)}
                onMouseEnter={() => setHoveredId(examId)}
                onMouseLeave={() => setHoveredId(null)}
                className={`
                  group relative bg-[#111318] rounded-2xl cursor-pointer
                  transition-all duration-300 ease-out flex flex-col overflow-hidden
                  ${isSelected
                    ? 'ring-2 ring-[#00E5B3] ring-offset-2 ring-offset-[#0B0D12] shadow-[0_0_20px_-5px_rgba(0,229,179,0.3)] scale-[1.02]'
                    : 'ring-1 ring-[#23262D] hover:ring-[#323742] shadow-md hover:shadow-lg'
                  }
                  ${isHovered && !isSelected ? '-translate-y-1' : ''}
                  active:scale-[0.98]
                `}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleSelection(examId); }}
              >
                {/* Image / Gradient Section – image logic preserved */}
                <div className={`relative h-36 bg-gradient-to-br ${gradient} overflow-hidden`}>
                  {exam.image ? (
                    <img
                      src={exam.image}
                      alt={exam.name || exam.title}
                      className={`w-full h-full object-cover transition-all duration-500 ease-out ${
                        isHovered ? 'scale-105' : 'scale-100'
                      }`}
                    />
                  ) : (
                    <>
                      {/* Decorative circles */}
                      <div className="absolute w-32 h-32 rounded-full bg-white/10 -top-10 -right-10" />
                      <div className="absolute w-24 h-24 rounded-full bg-white/10 -bottom-8 -left-8" />
                      {/* Icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`p-4 rounded-2xl transition-all duration-300 ${
                          isSelected
                            ? 'bg-[#111318]/80 backdrop-blur-sm scale-110'
                            : 'bg-white/10 backdrop-blur-sm group-hover:bg-white/20 group-hover:scale-105'
                        }`}>
                          {React.createElement(exam.icon || BookOpen, {
                            size: 32,
                            className: `transition-all duration-300 ${isSelected ? 'text-[#00E5B3]' : 'text-white'}`,
                            strokeWidth: 1.5,
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Overlay gradient at bottom for smooth transition (always present) */}
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#111318] to-transparent" />

                  {/* Selected badge (always on top) */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 z-10">
                      <div className="relative">
                        <div className="absolute inset-0 bg-[#00E5B3] rounded-full animate-ping opacity-40" />
                        <div className="relative bg-gradient-to-br from-[#00E5B3] to-[#00C298] text-black rounded-full p-1.5 border-2 border-[#111318] shadow-lg">
                          <Check size={13} strokeWidth={3} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Popularity badge (always on top) */}
                  <div className="absolute bottom-3 left-3 z-10">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md ${
                      isSelected
                        ? 'bg-[#00E5B3] text-black'
                        : 'bg-black/40 text-white'
                    }`}>
                      <Star size={10} className={isSelected ? 'fill-black' : 'fill-[#F2C94C] text-[#F2C94C]'} />
                      <span>{exam.popularity || 95}% Match</span>
                    </div>
                  </div>
                </div>

                {/* Card content */}
                <div className="p-5 flex flex-col flex-1">
                  <SubjectPills subjects={exam.subjects} />

                  <h3 className="font-extrabold text-base leading-snug mb-2 text-[#F5F7FA]">
                    {exam.name || exam.title}
                  </h3>

                  <p className="text-xs text-[#A1A8B3] leading-relaxed flex-1 mb-4 line-clamp-2">
                    {exam.description}
                  </p>

                  <div className="mt-auto space-y-3">
                    <div className="h-px w-full bg-[#23262D]" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#A1A8B3] font-medium">
                        <Users size={12} className="text-[#6B7280]" />
                        <span className="truncate max-w-[160px]">{exam.applicants}</span>
                      </div>

                      <div className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                        isSelected
                          ? 'bg-[#00E5B3]/10 text-[#00E5B3] border border-[#00E5B3]/30'
                          : 'bg-[#161920] text-[#A1A8B3] border border-[#23262D] group-hover:border-[#323742] group-hover:text-[#F5F7FA]'
                      }`}>
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

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="flex justify-center mb-2">
          <button className="group inline-flex items-center gap-1.5 text-xs text-[#A1A8B3] hover:text-[#F5F7FA] bg-[#111318]/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-[#23262D] hover:border-[#323742] transition">
            <span>I'll decide later, skip for now</span>
            <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="bg-[#111318]/95 backdrop-blur-xl border-t border-[#23262D]">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                selectedIds.length > 0
                  ? 'bg-gradient-to-br from-[#00E5B3] to-[#00C298] text-black'
                  : 'bg-[#161920] text-[#A1A8B3] border border-[#23262D]'
              }`}>
                {selectedIds.length}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[#F5F7FA]">
                  {selectedIds.length > 0 ? 'Exams Selected' : 'No exams selected'}
                </span>
                <span className="text-xs text-[#A1A8B3]">
                  {selectedIds.length > 0 ? 'Ready to customize your learning path' : 'Pick the exams you want to prepare for'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {selectedIds.length > 0 && (
                <div className="hidden lg:flex items-center gap-2 max-w-[300px]">
                  <div className="flex -space-x-2">
                    {selectedIds.slice(0, 4).map((id) => {
                      const selectedExam = (examData || exams).find(
                        (e: any) => (e._id || e.id?.toString()) === id
                      ) as any;
                      const initial = (selectedExam?.name || selectedExam?.title || '?').charAt(0);
                      const idx = selectedIds.indexOf(id);
                      const color = gradientMap[idx % gradientMap.length].split(' ')[0].replace('from-', '');
                      return (
                        <div
                          key={id}
                          className="w-7 h-7 rounded-full border-2 border-[#111318] flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                          style={{ backgroundColor: color }}
                        >
                          {initial}
                        </div>
                      );
                    })}
                    {selectedIds.length > 4 && (
                      <div className="w-7 h-7 rounded-full bg-[#161920] border-2 border-[#111318] flex items-center justify-center text-[10px] font-bold text-[#A1A8B3]">
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
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                  selectedIds.length > 0
                    ? 'bg-[#00E5B3] text-black hover:bg-[#00C298] shadow-lg shadow-[#00E5B3]/25'
                    : 'bg-[#161920] text-[#6B7280] cursor-not-allowed border border-[#23262D]'
                }`}>
                <span>Next: Enroll Now</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="h-32 md:h-36 flex-shrink-0" />
    </div>
  );
}