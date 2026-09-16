import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Check,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  University,
  ClipboardList,
  School,
  Calendar,
  GraduationCap,
  Briefcase,
  AlertCircle,
  Phone,
  MapPin,
  Home,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import {
  useAppSelector,
  useGetMeQuery,
  useGetExamsQuery,
  useSelectExamMutation,
  useAddUserInfoMutation,
  type ExamCategory,
} from '@my-monorepo/store';

type Exam = {
  _id: string;
  name: string;
  description?: string;
  category?: ExamCategory;
};

// ─── Vibrant gradients for exam card accents ──────────────
const gradientMap = [
  'from-blue-600 to-indigo-500',
  'from-amber-500 to-orange-400',
  'from-violet-500 to-purple-400',
  'from-emerald-500 to-teal-400',
  'from-rose-500 to-pink-400',
  'from-cyan-500 to-sky-400',
];

// ─── Exam categories ───────────────────────────────────────
const CATEGORIES: Array<{
  id: ExamCategory;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  glow: string;
  chip: string;
}> = [
  {
    id: 'academic',
    title: 'Academic',
    subtitle: 'SSC · HSC · Admission',
    description:
      'Board exams and university admission tests. Study plans, question banks and mock tests tuned for academic success.',
    icon: <GraduationCap size={30} />,
    gradient: 'from-blue-600 to-indigo-500',
    glow: 'bg-blue-500/20',
    chip: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
  {
    id: 'job_preparation',
    title: 'Job Preparation',
    subtitle: 'BCS · Bank · Teacher · Govt.',
    description:
      'Government and private job exams. Targeted preparation with past papers, current affairs and full mock exams.',
    icon: <Briefcase size={30} />,
    gradient: 'from-amber-500 to-orange-500',
    glow: 'bg-amber-500/20',
    chip: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
];

// ─── Bangladesh 64 Districts for Auto-suggestion ───────────
const BD_DISTRICTS = [
  'Bagerhat', 'Bandarban', 'Barguna', 'Barishal', 'Bhola', 'Bogura', 'Brahmanbaria', 'Chandpur',
  'Chattogram', 'Chuadanga', "Cox's Bazar", 'Cumilla', 'Dhaka', 'Dinajpur', 'Faridpur', 'Feni',
  'Gaibandha', 'Gazipur', 'Gopalganj', 'Habiganj', 'Jamalpur', 'Jashore', 'Jhalokathi', 'Jhenaidah',
  'Joypurhat', 'Khagrachhari', 'Khulna', 'Kishoreganj', 'Kurigram', 'Kushtia', 'Lakshmipur',
  'Lalmonirhat', 'Madaripur', 'Magura', 'Manikganj', 'Meherpur', 'Moulvibazar', 'Munshiganj',
  'Mymensingh', 'Naogaon', 'Narail', 'Narayanganj', 'Narsingdi', 'Natore', 'Netrokona', 'Nilphamari',
  'Noakhali', 'Pabna', 'Panchagarh', 'Patuakhali', 'Pirojpur', 'Rajbari', 'Rajshahi', 'Rangamati',
  'Rangpur', 'Satkhira', 'Shariatpur', 'Sherpur', 'Sirajganj', 'Sunamganj', 'Sylhet', 'Tangail',
  'Thakurgaon',
];

// ─── Academic Classes ──────────────────────────────────────
const ACADEMIC_CLASSES = [
  { id: 'Class 9', label: 'Class 9', badge: 'Secondary' },
  { id: 'Class 10', label: 'Class 10', badge: 'SSC Candidate' },
  { id: 'Class 11', label: 'Class 11', badge: 'College 1st Year' },
  { id: 'Class 12', label: 'Class 12', badge: 'HSC Candidate' },
  { id: 'Admission', label: 'Admission', badge: 'University Entrance' },
  { id: 'other', label: 'Other', badge: 'Custom' },
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
  if (lower.includes('ssc') || lower.includes('hsc') || lower.includes('admission'))
    return <BookOpen size={22} />;
  return <GraduationCap size={22} />;
};

// ─── Onboarding Component ─────────────────────────────────
const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAppSelector((state) => state.user);
  const { data: userData, refetch: refetchUser } = useGetMeQuery();
  const { data: exams = [], isLoading: examsLoading } = useGetExamsQuery();
  const [selectExam, { isLoading: isSaving }] = useSelectExamMutation();
  const [addUserInfo, { isLoading: isUpdatingInfo }] = useAddUserInfoMutation();

  const queryStep = searchParams.get('step');
  const queryCategory = searchParams.get('category') as ExamCategory | null;
  const queryExam = searchParams.get('exam');

  const [selectedId, setSelectedId] = useState<string | null>(queryExam || null);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [phone, setPhone] = useState(userData?.phone || '');
  const [selectedClass, setSelectedClass] = useState<string>(
    userData?.studentClass || userData?.class || 'Class 10'
  );
  const [customClass, setCustomClass] = useState('');
  const [hometown, setHometown] = useState(userData?.hometown || userData?.district || '');
  const [location, setLocation] = useState(userData?.location || userData?.district || '');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const userId = userData?._id || user?._id || '';

  // Synchronize query parameters
  useEffect(() => {
    if (queryExam && queryExam !== selectedId) {
      setSelectedId(queryExam);
    }
  }, [queryExam]);

  // Determine current active step
  let step: 'category' | 'exam' | 'details' = 'category';
  if (queryStep === 'details' && (selectedId || queryExam)) {
    step = 'details';
  } else if (queryStep === 'exam' && queryCategory) {
    step = 'exam';
  }

  const selectedCategory = queryCategory || null;

  const categoryExams = useMemo(
    () => exams.filter((exam) => exam.category === selectedCategory),
    [exams, selectedCategory]
  );

  const selectedExam = useMemo(
    () => exams.find((e) => e._id === (selectedId || queryExam)),
    [exams, selectedId, queryExam]
  );

  // Determine if target is academic
  const isAcademic = useMemo(() => {
    if (selectedCategory === 'academic') return true;
    if (selectedExam?.category === 'academic') return true;
    const lower = (selectedExam?.name || '').toLowerCase();
    return lower.includes('ssc') || lower.includes('hsc') || lower.includes('admission');
  }, [selectedCategory, selectedExam]);

  const countFor = (category: ExamCategory) =>
    exams.filter((exam) => exam.category === category).length;

  const pickCategory = (category: ExamCategory) => {
    setSelectedId(null);
    setError(null);
    setSearchParams({ step: 'exam', category });
  };

  const handleProceedToDetails = () => {
    if (!selectedId) return;
    setError(null);
    setSearchParams({
      step: 'details',
      category: selectedCategory || (selectedExam?.category as ExamCategory) || 'academic',
      exam: selectedId,
    });
  };

  const handleBackToCategory = () => {
    setSelectedId(null);
    setError(null);
    setSearchParams({ step: 'category' });
  };

  const handleBackToExams = () => {
    setError(null);
    setSearchParams({
      step: 'exam',
      category: selectedCategory || (selectedExam?.category as ExamCategory) || 'academic',
    });
  };

  const handleFinalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const effectiveExamId = selectedId || queryExam;
    if (!effectiveExamId || !userId || isSaving || isUpdatingInfo) return;

    const errors: Record<string, string> = {};
    const trimmedPhone = phone.trim();

    // Phone validation
    if (!trimmedPhone) {
      errors.phone = 'Phone number is required';
    } else {
      const cleanPhone = trimmedPhone.replace(/[\s-]/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        errors.phone = 'Please enter a valid mobile number (e.g. 017XXXXXXXX)';
      }
    }

    const effectiveClass = selectedClass === 'other' ? customClass.trim() : selectedClass;

    if (isAcademic) {
      if (!effectiveClass) {
        errors.selectedClass = 'Please select or enter your class';
      }
      if (!hometown.trim()) {
        errors.hometown = 'Hometown / Home district is required';
      }
    } else {
      if (!location.trim()) {
        errors.location = 'Current location / district is required';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setError(null);

    const payload = {
      userId,
      examId: [effectiveExamId],
      phone: trimmedPhone,
      studentClass: isAcademic ? effectiveClass : undefined,
      class: isAcademic ? effectiveClass : undefined,
      education: isAcademic ? effectiveClass : undefined,
      hometown: isAcademic ? hometown.trim() : undefined,
      location: !isAcademic ? location.trim() : hometown.trim(),
      district: isAcademic ? hometown.trim() : location.trim(),
    };

    try {
      await selectExam(payload).unwrap();
    } catch (err: any) {
      console.error('Failed to save exam selection:', err);
      setError(err?.data?.message || 'Could not save your selection. Please try again.');
      return;
    }

    // Also call addUserInfo to ensure user document profile is completely synchronized
    try {
      await addUserInfo({
        id: userId,
        data: {
          phone: trimmedPhone,
          studentClass: isAcademic ? effectiveClass : undefined,
          class: isAcademic ? effectiveClass : undefined,
          education: isAcademic ? effectiveClass : undefined,
          hometown: isAcademic ? hometown.trim() : undefined,
          location: !isAcademic ? location.trim() : hometown.trim(),
          district: isAcademic ? hometown.trim() : location.trim(),
        },
      }).unwrap();
    } catch (err) {
      console.warn('Profile info updated via selectExam:', err);
    }

    try {
      await refetchUser();
    } catch (err) {
      console.warn('Could not refresh user session data:', err);
    }

    navigate('/dashboard', { replace: true });
  };

  const activeCategory = CATEGORIES.find((c) => c.id === selectedCategory);
  const isSubmitting = isSaving || isUpdatingInfo;

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F5F7FA] flex flex-col relative overflow-x-hidden">
      {/* Datalist for district auto-complete */}
      <datalist id="bangladesh-districts">
        {BD_DISTRICTS.map((d) => (
          <option key={d} value={d} />
        ))}
      </datalist>

      {/* Subtle ambient lighting glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#2F80ED]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#9B51E0]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#00E5B3]/5 rounded-full blur-3xl" />
      </div>

      {/* Top Navbar */}
      <nav className="relative z-10 flex items-center justify-between w-full bg-[#111318]/80 backdrop-blur px-6 py-4 border-b border-[#23262D]">
        <div className="flex items-center gap-3">
          <img src="/nav.png" className="w-9 h-9 object-contain" alt="Logo" />
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-xl tracking-tight text-[#F5F7FA]">Geneseon</span>
            <span className="text-[10px] text-[#A1A8B3] uppercase tracking-widest font-semibold">
              Personalized Setup
            </span>
          </div>
        </div>

        {/* Multi-step indicator */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#A1A8B3] mr-2">
            <span className={step === 'category' ? 'text-[#00E5B3] font-bold' : 'text-[#6B7280]'}>
              1. Category
            </span>
            <span className="text-[#323742]">→</span>
            <span className={step === 'exam' ? 'text-[#00E5B3] font-bold' : 'text-[#6B7280]'}>
              2. Target Exam
            </span>
            <span className="text-[#323742]">→</span>
            <span className={step === 'details' ? 'text-[#00E5B3] font-bold' : 'text-[#6B7280]'}>
              3. Details
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#161920] border border-[#23262D] px-3 py-1 rounded-full text-xs font-medium">
            <span className="text-[#A1A8B3]">Step</span>
            <span className="font-bold text-[#00E5B3]">
              {step === 'category' ? '1' : step === 'exam' ? '2' : '3'}
            </span>
            <span className="text-[#6B7280]">/ 3</span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex-1 w-full max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 pb-24 flex flex-col">
        {/* Navigation Breadcrumbs / Back button */}
        <div className="mb-6">
          {step === 'exam' && (
            <button
              onClick={handleBackToCategory}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A1A8B3] hover:text-white transition-colors bg-[#161920]/80 border border-[#23262D] px-3 py-1.5 rounded-lg hover:border-[#323742]"
            >
              <ArrowLeft size={14} />
              Change Category
            </button>
          )}

          {step === 'details' && (
            <button
              onClick={handleBackToExams}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A1A8B3] hover:text-white transition-colors bg-[#161920]/80 border border-[#23262D] px-3 py-1.5 rounded-lg hover:border-[#323742]"
            >
              <ArrowLeft size={14} />
              Change Target Exam
            </button>
          )}
        </div>

        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#00E5B3]/10 text-[#00E5B3] text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-4 border border-[#00E5B3]/25 shadow-sm shadow-[#00E5B3]/10">
            <Sparkles size={13} />
            {step === 'details' ? 'Profile Setup' : 'Personalized Learning Path'}
            <Sparkles size={13} />
          </div>

          {step === 'category' && (
            <>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
                Welcome,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#A1A8B3]">
                  {userData?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Student'}
                </span>{' '}
                👋
              </h1>
              <p className="text-[#A1A8B3] text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                What are you preparing for? Choose a track to personalize your questions, mock
                tests, and study schedule.
              </p>
            </>
          )}

          {step === 'exam' && (
            <>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
                Pick your {activeCategory?.title || 'Target'} Exam
              </h1>
              <p className="text-[#A1A8B3] text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                Select your primary exam. All mock exams, analytics, and syllabus roadmaps will be
                tuned for this.
              </p>
            </>
          )}

          {step === 'details' && (
            <>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
                {isAcademic ? 'Academic Profile Details' : 'Candidate Profile Details'}
              </h1>
              <p className="text-[#A1A8B3] text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                {isAcademic
                  ? 'Please provide your mobile number, class, and hometown so we can tailor the curriculum and local exam notifications.'
                  : 'Please provide your phone number and location so we can keep your mock tests and circular updates synced.'}
              </p>
            </>
          )}
        </div>

        {/* ── STEP 1: Category Selection ── */}
        {step === 'category' && (
          examsLoading ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-[#00E5B3]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto w-full">
              {CATEGORIES.map((cat) => {
                const count = countFor(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => pickCategory(cat.id)}
                    className={`group relative text-left rounded-2xl overflow-hidden border p-7 transition-all duration-300 ease-out flex flex-col
                      border-[#1F2229] bg-[#111318] hover:border-[#2D3139] hover:bg-[#14161C] hover:-translate-y-1
                      hover:shadow-[0_16px_40px_rgba(0,0,0,0.45)]`}
                  >
                    <div
                      className={`absolute -top-16 -right-16 w-36 h-36 rounded-full blur-2xl opacity-20 transition-all duration-500 group-hover:opacity-40 ${cat.glow}`}
                    />

                    <div className="flex items-center justify-between mb-5">
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-white shadow-lg`}
                      >
                        {cat.icon}
                      </div>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${cat.chip}`}>
                        {count} {count === 1 ? 'Exam' : 'Exams'}
                      </span>
                    </div>

                    <div className="mb-2">
                      <h2 className="text-xl font-bold text-[#F5F7FA] group-hover:text-white transition-colors">
                        {cat.title}
                      </h2>
                      <p className="text-xs font-semibold text-[#00E5B3] mt-0.5">{cat.subtitle}</p>
                    </div>

                    <p className="text-xs text-[#8A92A0] leading-relaxed mb-6 flex-1">
                      {cat.description}
                    </p>

                    <div className="flex items-center gap-2 text-xs font-bold text-[#00E5B3] group-hover:translate-x-1 transition-transform">
                      <span>Select Track</span>
                      <ArrowRight size={14} />
                    </div>
                  </button>
                );
              })}
            </div>
          )
        )}

        {/* ── STEP 2: Exam Selection ── */}
        {step === 'exam' && (
          examsLoading ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-[#00E5B3]" />
            </div>
          ) : categoryExams.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 bg-[#161920] border border-[#23262D] rounded-2xl flex items-center justify-center mb-4">
                <BookOpen size={24} className="text-[#6B7280]" />
              </div>
              <p className="font-semibold text-[#F5F7FA]">No exams available in this category</p>
              <button
                onClick={handleBackToCategory}
                className="mt-4 inline-flex items-center gap-2 bg-[#2F80ED] text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-[#256BCE] transition-all"
              >
                <ArrowLeft size={14} /> Choose another track
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
              {categoryExams.map((exam, idx) => {
                const isSelected = selectedId === exam._id;
                const grad = gradientMap[idx % gradientMap.length];

                return (
                  <button
                    key={exam._id}
                    onClick={() => setSelectedId(exam._id)}
                    className={`group relative text-left rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between overflow-hidden
                      ${
                        isSelected
                          ? 'border-[#00E5B3] bg-[#00E5B3]/5 shadow-[0_0_24px_rgba(0,229,179,0.18)] ring-1 ring-[#00E5B3]/40'
                          : 'border-[#1F2229] bg-[#111318] hover:border-[#2D3139] hover:bg-[#14161C] hover:-translate-y-0.5'
                      }`}
                  >
                    <div className="flex items-start justify-between w-full mb-4">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white shadow-md`}
                      >
                        {getExamIcon(exam.name)}
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#00E5B3] border-[#00E5B3] text-black scale-105'
                            : 'border-[#323742] bg-[#161920] text-transparent'
                        }`}
                      >
                        {isSelected && <Check size={13} strokeWidth={3.5} />}
                      </div>
                    </div>

                    <div>
                      <h3
                        className={`font-bold text-sm mb-1.5 transition-colors ${
                          isSelected ? 'text-[#00E5B3]' : 'text-[#F5F7FA] group-hover:text-white'
                        }`}
                      >
                        {exam.name}
                      </h3>
                      <p className="text-[11px] text-[#6B7280] line-clamp-2 leading-relaxed">
                        {exam.description || 'Targeted syllabus, mock papers, and ranking.'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )
        )}

        {/* ── STEP 3: User Details Page ── */}
        {step === 'details' && (
          <div className="max-w-2xl mx-auto w-full">
            {/* Target Exam Summary Banner */}
            <div className="bg-[#111318] border border-[#23262D] rounded-2xl p-4 md:p-5 mb-8 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md">
                  {getExamIcon(selectedExam?.name || '')}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#00E5B3] bg-[#00E5B3]/10 px-2 py-0.5 rounded-full border border-[#00E5B3]/20">
                      Target Exam
                    </span>
                    <span className="text-[11px] text-[#6B7280] capitalize">
                      {selectedCategory === 'academic' || isAcademic ? 'Academic Track' : 'Job Prep Track'}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white">
                    {selectedExam?.name || 'Selected Exam'}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={handleBackToExams}
                className="text-xs font-semibold text-[#00E5B3] hover:underline px-2.5 py-1"
              >
                Change
              </button>
            </div>

            {/* Profile Input Form */}
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              {/* Phone Number Field */}
              <div className="bg-[#111318] border border-[#23262D] rounded-2xl p-5 md:p-6 transition-all hover:border-[#2D3139]">
                <label className="block text-xs font-bold text-[#E1E4EA] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Phone size={14} className="text-[#00E5B3]" />
                  Phone Number <span className="text-[#EB5757]">*</span>
                </label>
                <p className="text-xs text-[#8A92A0] mb-3">
                  Used for account security, verification, and critical exam reminders.
                </p>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280] text-sm font-medium">
                    +880
                  </div>
                  <input
                    type="tel"
                    value={phone.startsWith('+880') ? phone.slice(4) : phone}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPhone(val.startsWith('+880') ? val : `+880${val.replace(/^0+/, '')}`);
                      if (formErrors.phone) {
                        setFormErrors((prev) => ({ ...prev, phone: '' }));
                      }
                    }}
                    placeholder="17XXXXXXXX"
                    className={`w-full pl-16 pr-4 py-3 bg-[#161920] border rounded-xl text-sm text-[#F5F7FA] placeholder-[#4B5260] focus:outline-none transition-all ${
                      formErrors.phone
                        ? 'border-[#EB5757] focus:border-[#EB5757] focus:ring-1 focus:ring-[#EB5757]'
                        : 'border-[#23262D] focus:border-[#00E5B3] focus:ring-1 focus:ring-[#00E5B3]/50'
                    }`}
                  />
                </div>
                {formErrors.phone && (
                  <p className="text-xs text-[#EB5757] mt-1.5 flex items-center gap-1">
                    <AlertCircle size={12} /> {formErrors.phone}
                  </p>
                )}
              </div>

              {/* Academic Track: Class Selection + Hometown */}
              {isAcademic ? (
                <>
                  {/* Class Selection */}
                  <div className="bg-[#111318] border border-[#23262D] rounded-2xl p-5 md:p-6 transition-all hover:border-[#2D3139]">
                    <label className="block text-xs font-bold text-[#E1E4EA] uppercase tracking-wider mb-2 flex items-center gap-2">
                      <GraduationCap size={15} className="text-[#00E5B3]" />
                      Current Class / Academic Level <span className="text-[#EB5757]">*</span>
                    </label>
                    <p className="text-xs text-[#8A92A0] mb-4">
                      Select your current academic standard so questions and practice sets align
                      perfectly with your syllabus.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                      {ACADEMIC_CLASSES.map((cls) => {
                        const isChosen = selectedClass === cls.id;
                        return (
                          <button
                            type="button"
                            key={cls.id}
                            onClick={() => {
                              setSelectedClass(cls.id);
                              if (formErrors.selectedClass) {
                                setFormErrors((prev) => ({ ...prev, selectedClass: '' }));
                              }
                            }}
                            className={`p-3 rounded-xl border text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                              isChosen
                                ? 'bg-[#00E5B3]/10 border-[#00E5B3] text-white shadow-md shadow-[#00E5B3]/10'
                                : 'bg-[#161920] border-[#23262D] text-[#A1A8B3] hover:border-[#323742] hover:text-[#F5F7FA]'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-sm text-[#F5F7FA]">{cls.label}</span>
                              {isChosen && (
                                <CheckCircle2 size={15} className="text-[#00E5B3]" />
                              )}
                            </div>
                            <span className="text-[10px] text-[#6B7280]">{cls.badge}</span>
                          </button>
                        );
                      })}
                    </div>

                    {selectedClass === 'other' && (
                      <div className="mt-3">
                        <input
                          type="text"
                          value={customClass}
                          onChange={(e) => {
                            setCustomClass(e.target.value);
                            if (formErrors.selectedClass) {
                              setFormErrors((prev) => ({ ...prev, selectedClass: '' }));
                            }
                          }}
                          placeholder="e.g. A-Levels, Diploma, Medical Second Timer..."
                          className="w-full px-4 py-2.5 bg-[#161920] border border-[#23262D] rounded-xl text-sm text-[#F5F7FA] placeholder-[#4B5260] focus:outline-none focus:border-[#00E5B3]"
                        />
                      </div>
                    )}

                    {formErrors.selectedClass && (
                      <p className="text-xs text-[#EB5757] mt-2 flex items-center gap-1">
                        <AlertCircle size={12} /> {formErrors.selectedClass}
                      </p>
                    )}
                  </div>

                  {/* Hometown Field */}
                  <div className="bg-[#111318] border border-[#23262D] rounded-2xl p-5 md:p-6 transition-all hover:border-[#2D3139]">
                    <label className="block text-xs font-bold text-[#E1E4EA] uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Home size={14} className="text-[#00E5B3]" />
                      Hometown / Home District <span className="text-[#EB5757]">*</span>
                    </label>
                    <p className="text-xs text-[#8A92A0] mb-3">
                      Select or type your hometown or home district.
                    </p>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                        <MapPin size={16} />
                      </div>
                      <input
                        type="text"
                        list="bangladesh-districts"
                        value={hometown}
                        onChange={(e) => {
                          setHometown(e.target.value);
                          if (formErrors.hometown) {
                            setFormErrors((prev) => ({ ...prev, hometown: '' }));
                          }
                        }}
                        placeholder="e.g. Dhaka, Chattogram, Sylhet, Rajshahi, Bogura..."
                        className={`w-full pl-10 pr-4 py-3 bg-[#161920] border rounded-xl text-sm text-[#F5F7FA] placeholder-[#4B5260] focus:outline-none transition-all ${
                          formErrors.hometown
                            ? 'border-[#EB5757] focus:border-[#EB5757] focus:ring-1 focus:ring-[#EB5757]'
                            : 'border-[#23262D] focus:border-[#00E5B3] focus:ring-1 focus:ring-[#00E5B3]/50'
                        }`}
                      />
                    </div>
                    {formErrors.hometown && (
                      <p className="text-xs text-[#EB5757] mt-1.5 flex items-center gap-1">
                        <AlertCircle size={12} /> {formErrors.hometown}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                /* Non-Academic Track: Phone + Location */
                <div className="bg-[#111318] border border-[#23262D] rounded-2xl p-5 md:p-6 transition-all hover:border-[#2D3139]">
                  <label className="block text-xs font-bold text-[#E1E4EA] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <MapPin size={14} className="text-[#00E5B3]" />
                    Current Location / District <span className="text-[#EB5757]">*</span>
                  </label>
                  <p className="text-xs text-[#8A92A0] mb-3">
                    Your current city or district to tailor regional job circulars and test centers.
                  </p>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                      <MapPin size={16} />
                    </div>
                    <input
                      type="text"
                      list="bangladesh-districts"
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        if (formErrors.location) {
                          setFormErrors((prev) => ({ ...prev, location: '' }));
                        }
                      }}
                      placeholder="e.g. Dhaka, Chattogram, Rajshahi, Khulna..."
                      className={`w-full pl-10 pr-4 py-3 bg-[#161920] border rounded-xl text-sm text-[#F5F7FA] placeholder-[#4B5260] focus:outline-none transition-all ${
                        formErrors.location
                          ? 'border-[#EB5757] focus:border-[#EB5757] focus:ring-1 focus:ring-[#EB5757]'
                          : 'border-[#23262D] focus:border-[#00E5B3] focus:ring-1 focus:ring-[#00E5B3]/50'
                      }`}
                    />
                  </div>
                  {formErrors.location && (
                    <p className="text-xs text-[#EB5757] mt-1.5 flex items-center gap-1">
                      <AlertCircle size={12} /> {formErrors.location}
                    </p>
                  )}
                </div>
              )}
            </form>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="mt-6 max-w-2xl mx-auto w-full flex items-center justify-between gap-2 text-xs font-semibold text-[#EB5757] bg-[#EB5757]/10 border border-[#EB5757]/30 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-[#EB5757] hover:underline shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}
      </main>

      {/* Sticky Bottom Footer CTA Bar */}
      <div className="sticky bottom-0 relative z-20 shrink-0 border-t border-[#23262D] bg-[#111318]/95 backdrop-blur px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {step === 'category' && (
            <div className="text-sm text-center sm:text-left text-[#A1A8B3]">
              First pick your target track. You can change this anytime from your dashboard settings.
            </div>
          )}

          {step === 'exam' && (
            <>
              <div className="text-sm text-[#A1A8B3]">
                {selectedId ? (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00E5B3] animate-pulse" />
                    <span className="text-white font-medium">
                      Selected: <strong className="text-[#00E5B3]">{selectedExam?.name}</strong>
                    </span>
                  </div>
                ) : (
                  <>Select an exam card to proceed</>
                )}
              </div>

              <button
                type="button"
                onClick={handleProceedToDetails}
                disabled={!selectedId}
                className="inline-flex items-center gap-2 bg-[#00E5B3] text-black font-bold px-8 py-3.5 rounded-xl hover:bg-[#00C298] transition-all shadow-lg shadow-[#00E5B3]/20 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Continue</span>
                <ArrowRight size={17} />
              </button>
            </>
          )}

          {step === 'details' && (
            <>
              <div className="flex items-center gap-2 text-xs text-[#8A92A0]">
                <ShieldCheck size={16} className="text-[#00E5B3]" />
                <span>Your information is encrypted and never shared.</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
   
                <button
                  type="button"
                  onClick={() => handleFinalSubmit()}
                  disabled={isSubmitting || !userId}
                  className="md:flex-1 sm:flex-none inline-flex mx-auto md:w-fit w-[60vw] items-center justify-center gap-2 bg-[#00E5B3] text-black font-bold md:px-8 py-3 rounded-xl hover:bg-[#00C298] transition-all shadow-lg shadow-[#00E5B3]/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <span>Launch Dashboard</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;