import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Check,
  Sparkles,
  ArrowRight,
  Loader2,
  University,
  ClipboardList,
  School,
  Calendar,
  GraduationCap,
  AlertCircle,
} from 'lucide-react';
import {
  useAppSelector,
  useGetMeQuery,
  useGetExamsQuery,
  useSelectExamMutation,
} from '@my-monorepo/store';

// ─── Vibrant gradients for exam card accents ──────────────
const gradientMap = [
  'from-blue-600 to-indigo-500',
  'from-amber-500 to-orange-400',
  'from-violet-500 to-purple-400',
  'from-emerald-500 to-teal-400',
  'from-rose-500 to-pink-400',
  'from-cyan-500 to-sky-400',
];

// ─── Icon mapping based on exam name patterns ─────────────
const getExamIcon = (name: string) => {
  const lower = (name || '').toLowerCase();
  if (lower.includes('bcs') || lower.includes('বিসিএস')) return <University size={22} />;
  if (lower.includes('bank') || lower.includes('ব্যাংক')) return <ClipboardList size={22} />;
  if (lower.includes('teacher') || lower.includes('শিক্ষক') || lower.includes('নিবন্ধন'))
    return <School size={22} />;
  if (lower.includes('job') || lower.includes('সল্যুশন') || lower.includes('চাকরি'))
    return <Calendar size={22} />;
  return <GraduationCap size={22} />;
};

// ─── First-time Onboarding: pick your target exam ─────────
const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.user);
  const { data: userData, refetch: refetchUser } = useGetMeQuery();
  const { data: exams = [], isLoading: examsLoading } = useGetExamsQuery();
  const [selectExam, { isLoading: isSaving }] = useSelectExamMutation();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const userId = userData?._id || user?._id || '';

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    setError(null);
  };

  const handleContinue = async () => {
    if (selectedIds.length === 0 || !userId || isSaving) return;
    setError(null);
    try {
      await selectExam({ userId, examId: selectedIds }).unwrap();
    } catch (err) {
      console.error('Failed to save exam selection:', err);
      setError('Could not save your selection. Please try again.');
      return;
    }
    try {
      await refetchUser();
    } catch (err) {
      console.warn('Could not refresh user data after saving exams:', err);
    }
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F5F7FA] flex flex-col relative overflow-x-hidden">
      {/* Subtle background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#2F80ED]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#9B51E0]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#00E5B3]/5 rounded-full blur-3xl" />
      </div>

      {/* Top nav */}
      <nav className="relative z-10 flex items-center justify-between w-full bg-[#111318]/80 backdrop-blur px-6 py-4 border-b border-[#23262D]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#00E5B3]/10 border border-[#00E5B3]/30">
            <img src="/logo.png" className="w-7 h-7 object-contain" alt="BrainForge" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold text-sm text-[#F5F7FA]">BrainForge</span>
            <span className="text-[10px] text-[#A1A8B3]">Welcome aboard</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#A1A8B3]">
          <span className="text-[#A1A8B3]">Setup</span>
          <span className="font-bold text-[#00E5B3]">1</span>
          <span className="text-[#323742]">/ 1</span>
        </div>
      </nav>

      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-14 pb-16 flex flex-col">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 bg-[#00E5B3]/10 text-[#00E5B3] text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-5 border border-[#00E5B3]/30">
            <Sparkles size={11} />
            Personalised Learning Path
            <Sparkles size={11} />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            Welcome,{' '}
            {userData?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Student'} 👋
          </h1>
          <p className="text-[#A1A8B3] text-sm md:text-base max-w-xl mx-auto">
            Select the exam you&apos;re targeting and we&apos;ll personalise your courses,
            mock tests and study plan around it.
          </p>
        </div>

        {/* Exam cards */}
        {examsLoading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[#00E5B3]" />
          </div>
        ) : exams.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-[#161920] border border-[#23262D] rounded-2xl flex items-center justify-center mb-4">
              <BookOpen size={24} className="text-[#6B7280]" />
            </div>
            <p className="font-semibold text-[#F5F7FA]">No exams available yet</p>
            <p className="text-sm text-[#6B7280] mt-1 mb-6">
              Please check back soon — exams are being added.
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 bg-[#2F80ED] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#256BCE] transition-all active:scale-[0.98]"
            >
              Go to Dashboard <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {exams.map((exam: any, index: number) => {
              const isSelected = selectedIds.includes(exam._id);
              const gradient = gradientMap[index % gradientMap.length];
              
              return (
                <button
                  key={exam._id}
                  onClick={() => toggleSelection(exam._id)}
                  className={`group relative text-left rounded-2xl overflow-hidden border p-5 transition-all duration-300 ease-out flex flex-col h-full
                    ${
                      isSelected
                        ? 'border-[#00E5B3] bg-[#00E5B3]/5 shadow-[0_8px_30px_rgba(0,229,179,0.15)]'
                        : 'border-[#1F2229] bg-[#111318] hover:border-[#2D3139] hover:bg-[#14161C] hover:-translate-y-1'
                    }`}
                >
                  {/* Background Accent Glow */}
                  <div
                    className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl bg-gradient-to-br ${gradient} transition-opacity duration-500 pointer-events-none ${
                      isSelected ? 'opacity-30' : 'opacity-[0.07] group-hover:opacity-20'
                    }`}
                  />

                  {/* Top Section: Icon & Status */}
                  <div className="relative z-10 flex items-start justify-between mb-8">
                    <div
                      className={`p-3.5 rounded-xl transition-all duration-300 ease-out shadow-lg
                        ${
                          isSelected
                            ? 'bg-[#00E5B3]/15 text-[#00E5B3] ring-1 ring-[#00E5B3]/30'
                            : `bg-gradient-to-br ${gradient} text-white shadow-black/20 group-hover:scale-110 group-hover:rotate-3`
                        }`}
                    >
                      {getExamIcon(exam.name)}
                    </div>

                    {/* Selection Indicator */}
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                        ${
                          isSelected
                            ? 'bg-[#00E5B3] border-[#00E5B3] scale-100'
                            : 'border-[#2A2F38] scale-90 group-hover:border-[#4A505C]'
                        }`}
                    >
                      {isSelected && <Check size={14} strokeWidth={4} className="text-black" />}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="relative z-10 mt-auto">
                    <h3
                      className={`font-bold text-base mb-2 transition-colors duration-300 ${
                        isSelected ? 'text-[#00E5B3]' : 'text-[#F5F7FA] group-hover:text-white'
                      }`}
                    >
                      {exam.name}
                    </h3>
                    <p className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed">
                      {exam.description || 'Comprehensive preparation for this exam.'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-[#EB5757] bg-[#EB5757]/10 border border-[#EB5757]/30 rounded-xl px-4 py-3">
            <AlertCircle size={14} /> {error}
          </div>
        )}
      </main>

      {/* Sticky footer CTA */}
      <div className="sticky bottom-0 relative z-10 shrink-0 border-t border-[#23262D] bg-[#111318]/95 backdrop-blur px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-[#A1A8B3]">
            {selectedIds.length > 0 ? (
              <>
                <span className="text-[#00E5B3] font-bold">{selectedIds.length}</span> exam
                {selectedIds.length > 1 ? 's' : ''} selected — you can change this anytime in
                Settings.
              </>
            ) : (
              'Select at least one exam to continue'
            )}
          </div>
          <button
            onClick={handleContinue}
            disabled={selectedIds.length === 0 || isSaving || !userId}
            className="inline-flex items-center gap-2 bg-[#00E5B3] text-black font-bold px-8 py-3.5 rounded-xl hover:bg-[#00C298] transition-all shadow-lg shadow-[#00E5B3]/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Continue to Dashboard
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;