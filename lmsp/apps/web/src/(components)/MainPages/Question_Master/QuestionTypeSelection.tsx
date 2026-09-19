import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, GraduationCap, Swords, ChevronRight } from 'lucide-react';
import { useTheme } from '../../../theme/ThemeContext';

// BrainForge accent colours per category
const categoryAccent: Record<string, string> = {
  bcs: '#2F80ED',
  bank: '#F2C94C',
  ssc: '#00E5B3',
  hsc: '#9B51E0',
  teacher: '#EB5757',
  govt: '#00C8FF',
};

const QUESTION_TYPE_OPTIONS = [
  {
    value: 'board',
    label: 'Board Questions',
    labelBn: 'বোর্ড প্রশ্ন',
    description: 'Official board examination questions from all Bangladesh education boards.',
    descriptionBn: 'বাংলাদেশের সকল শিক্ষা বোর্ডের প্রশ্নপত্র',
    icon: GraduationCap,
    gradient: 'from-[#9B51E0]/20 to-[#6B35A0]/5',
    borderColor: '#9B51E0',
    iconColor: '#9B51E0',
    badge: 'Official',
  },
  {
    value: 'testpaper',
    label: 'College Testpapers',
    labelBn: 'কলেজ টেস্ট পেপার',
    description: 'Testpapers from top colleges across the country — great for final prep.',
    descriptionBn: 'দেশের শীর্ষ কলেজের টেস্ট পেপার',
    icon: BookOpen,
    gradient: 'from-[#2F80ED]/20 to-[#1a5fad]/5',
    borderColor: '#2F80ED',
    iconColor: '#2F80ED',
    badge: 'College',
  },
  {
    value: 'mockexam',
    label: 'Mock Exams',
    labelBn: 'মক পরীক্ষা',
    description: 'Practice under real exam conditions with our curated mock question sets.',
    descriptionBn: 'মডেল টেস্ট এবং মক পরীক্ষার প্রশ্নসমূহ',
    icon: Swords,
    gradient: 'from-[#00E5B3]/20 to-[#009e7c]/5',
    borderColor: '#00E5B3',
    iconColor: '#00E5B3',
    badge: 'Practice',
  },
];

export default function QuestionTypeSelection() {
  const { examType, subjectId } = useParams<{ examType: string; subjectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();

  const subjectName: string = location.state?.subjectName || 'Subject';
  const examName: string = location.state?.examName || 'Exam';

  const accent = examType ? categoryAccent[examType] || '#9B51E0' : '#9B51E0';

  const handleSelect = (questionType: string) => {
    navigate(`/question-center/${examType}/${subjectId}`, {
      state: {
        subjectName,
        examName,
        questionType,
      },
    });
  };

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
          <div className="max-w-8xl mx-auto px-4 sm:px-6 py-5">
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => navigate(`/question-center/${examType}`, { state: location.state })}
                className="p-2.5 rounded-xl border border-[#d8d4cb] bg-[#f2efe9] text-[#4a4a4a] hover:text-[#1a1a1a] hover:shadow-[2px_2px_0px_0px_#1a1a1a] shadow-[1px_1px_0px_0px_#1a1a1a] transition-all active:scale-95"
                title="Back to Subjects"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-[#d8d4cb] bg-[#e0dcd5] text-[#1a1a1a] font-serif">
                    {examName}
                  </span>
                  <span className="text-xs text-[#4a4a4a]">/</span>
                  <span className="text-xs font-bold text-[#b91c1c] font-serif">{subjectName}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black mt-1 tracking-tight text-[#1a1a1a] font-serif">
                  Select Question Type
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 pb-24">
          <p className="text-sm mb-8 text-center text-[#4a4a4a] font-serif italic">
            Choose the type of questions you want to practice for{' '}
            <span className="font-bold text-[#1a1a1a]">{subjectName}</span>
          </p>

          <div className="space-y-4">
            {QUESTION_TYPE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className="w-full group relative flex items-center gap-5 p-6 rounded-lg border border-[#d8d4cb] bg-[#f2efe9] transition-all duration-300 text-left active:scale-[0.985] overflow-hidden shadow-[3px_3px_0px_0px_#1a1a1a] hover:shadow-[4px_4px_0px_0px_#1a1a1a] hover:-translate-y-0.5"
                >
                  {/* Icon Box */}
                  <div className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 border border-[#1a1a1a] bg-[#1a1a1a] transition-transform group-hover:scale-105">
                    <Icon size={26} className="text-[#f2efe9]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-base font-black tracking-tight text-[#1a1a1a] font-serif">
                        {opt.label}
                      </h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#1a1a1a] bg-[#f2efe9] text-[#1a1a1a] uppercase tracking-wider font-serif">
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-xs mb-0.5 text-[#4a4a4a] font-serif">{opt.labelBn}</p>
                    <p className="text-sm leading-relaxed hidden sm:block text-[#4a4a4a] font-serif italic">
                      {opt.description}
                    </p>
                  </div>

                  <ChevronRight
                    size={20}
                    className="flex-shrink-0 text-[#4a4a4a] group-hover:text-[#b91c1c] group-hover:translate-x-0.5 transition-all"
                  />
                </button>
              );
            })}
          </div>

          <p className="text-center text-xs mt-8 text-[#4a4a4a] font-serif italic">
            Want all types?{' '}
            <button
              onClick={() =>
                navigate(`/question-center/${examType}/${subjectId}`, {
                  state: { subjectName, examName, questionType: '' },
                })
              }
              className="underline transition text-[#1a1a1a] hover:text-[#b91c1c] font-bold"
            >
              Show all question sets
            </button>
          </p>
        </div>
      </div>
    );
  }

  // ─── DARK MODE (Original Code - Unchanged) ─────────────────
  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F5F7FA]">
      <div className="sticky -top-1 z-20 border-b backdrop-blur-xl bg-[#111318]/95 border-[#23262D]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => navigate(`/question-center/${examType}`, { state: location.state })}
              className="p-2.5 rounded-xl border transition-all active:scale-95 bg-[#161920] border-[#23262D] text-[#A1A8B3] hover:text-[#F5F7FA] hover:bg-[#1C1F26]"
              title="Back to Subjects"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border"
                  style={{ color: accent, borderColor: `${accent}40`, backgroundColor: `${accent}15` }}
                >
                  {examName}
                </span>
                <span className="text-xs text-[#6B7280]">/</span>
                <span className="text-xs font-medium text-[#00C8FF]">{subjectName}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold mt-1 tracking-tight text-[#F5F7FA]">
                Select Question Type
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 pb-24">
        <p className="text-sm mb-8 text-center text-[#6B7280]">
          Choose the type of questions you want to practice for{' '}
          <span className="font-semibold text-[#A1A8B3]">{subjectName}</span>
        </p>

        <div className="space-y-4">
          {QUESTION_TYPE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full group relative flex items-center gap-5 p-6 rounded-2xl border bg-gradient-to-br ${opt.gradient} transition-all duration-300 text-left active:scale-[0.985] overflow-hidden border-[#23262D] hover:border-opacity-80 hover:shadow-[0_0_28px_-6px]`}
                style={{
                  '--tw-shadow-color': `${opt.borderColor}50`,
                  borderColor: `${opt.borderColor}30`,
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${opt.borderColor}80`;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 28px -6px ${opt.borderColor}50`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${opt.borderColor}30`;
                  (e.currentTarget as HTMLElement).style.boxShadow = '';
                }}
              >
                <div
                  className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20"
                  style={{ backgroundColor: opt.iconColor }}
                />

                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border transition-transform group-hover:scale-105"
                  style={{
                    backgroundColor: `${opt.iconColor}15`,
                    borderColor: `${opt.iconColor}30`,
                  }}
                >
                  <Icon size={26} style={{ color: opt.iconColor }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-base font-extrabold tracking-tight text-[#F5F7FA] group-hover:text-white">
                      {opt.label}
                    </h2>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider"
                      style={{
                        color: opt.iconColor,
                        borderColor: `${opt.iconColor}40`,
                        backgroundColor: `${opt.iconColor}10`,
                      }}
                    >
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-xs mb-0.5 text-[#6B7280]">{opt.labelBn}</p>
                  <p className="text-sm leading-relaxed hidden sm:block text-[#A1A8B3]">
                    {opt.description}
                  </p>
                </div>

                <ChevronRight
                  size={20}
                  className="flex-shrink-0 transition-all text-[#6B7280] group-hover:text-[#A1A8B3] group-hover:translate-x-0.5"
                />
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs mt-8 text-[#6B7280]">
          Want all types?{' '}
          <button
            onClick={() =>
              navigate(`/question-center/${examType}/${subjectId}`, {
                state: { subjectName, examName, questionType: '' },
              })
            }
            className="underline transition text-[#A1A8B3] hover:text-[#F5F7FA]"
          >
            Show all question sets
          </button>
        </p>
      </div>
    </div>
  );
}