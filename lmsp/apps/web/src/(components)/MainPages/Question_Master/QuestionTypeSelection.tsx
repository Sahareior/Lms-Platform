import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, GraduationCap, Swords, ChevronRight } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F5F7FA]">
      {/* Sticky Header */}
      <div className="bg-[#111318]/95 backdrop-blur-xl border-b border-[#23262D] sticky -top-1 z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => navigate(`/question-center/${examType}`, { state: location.state })}
              className="p-2.5 rounded-xl bg-[#161920] border border-[#23262D] text-[#A1A8B3] hover:text-[#F5F7FA] hover:bg-[#1C1F26] transition-all active:scale-95"
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
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#F5F7FA] mt-1 tracking-tight">
                Select Question Type
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 pb-24">
        {/* Subtitle */}
        <p className="text-[#6B7280] text-sm mb-8 text-center">
          Choose the type of questions you want to practice for{' '}
          <span className="text-[#A1A8B3] font-semibold">{subjectName}</span>
        </p>

        {/* Cards */}
        <div className="space-y-4">
          {QUESTION_TYPE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full group relative flex items-center gap-5 p-6 rounded-2xl border bg-gradient-to-br ${opt.gradient} border-[#23262D] hover:border-opacity-80 transition-all duration-300 hover:shadow-[0_0_28px_-6px] text-left active:scale-[0.985] overflow-hidden`}
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
                {/* Decorative glow blob */}
                <div
                  className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20"
                  style={{ backgroundColor: opt.iconColor }}
                />

                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border transition-transform group-hover:scale-105"
                  style={{
                    backgroundColor: `${opt.iconColor}15`,
                    borderColor: `${opt.iconColor}30`,
                  }}
                >
                  <Icon size={26} style={{ color: opt.iconColor }} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-base font-extrabold text-[#F5F7FA] tracking-tight group-hover:text-white">
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
                  <p className="text-xs text-[#6B7280] mb-0.5">{opt.labelBn}</p>
                  <p className="text-sm text-[#A1A8B3] leading-relaxed hidden sm:block">
                    {opt.description}
                  </p>
                </div>

                {/* Arrow */}
                <ChevronRight
                  size={20}
                  className="flex-shrink-0 text-[#6B7280] group-hover:text-[#A1A8B3] group-hover:translate-x-0.5 transition-all"
                />
              </button>
            );
          })}
        </div>

        {/* Skip hint */}
        <p className="text-center text-xs text-[#6B7280] mt-8">
          Want all types?{' '}
          <button
            onClick={() =>
              navigate(`/question-center/${examType}/${subjectId}`, {
                state: { subjectName, examName, questionType: '' },
              })
            }
            className="text-[#A1A8B3] underline hover:text-[#F5F7FA] transition"
          >
            Show all question sets
          </button>
        </p>
      </div>
    </div>
  );
}
