import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Home,
  Building2,
  GraduationCap,
  Target,
  Check,
  BookOpen,
  Sparkles,
  AlertCircle,
  Loader2,
  X,
  Plus,
  Bell,
  Shield,
  Palette,
  Globe,
  CheckCircle2,
  Camera,
  SunMedium,
  MoonStar,
  PanelLeft,
  LayoutGrid,
} from 'lucide-react';
import {
  useAppDispatch,
  useGetMeQuery,
  useGetExamsQuery,
  useSelectExamMutation,
  useRemoveExamMutation,
  useAddUserInfoMutation,
  useUploadImageMutation,
  updateUser,
  getAuthToken,
} from '@my-monorepo/store';
import { persistAuth } from '../auth/AuthInitializer';
import { useTheme } from '../theme/ThemeContext';
import { useNavigationMode } from '../navigation/NavigationContext';


// ─── Bangladesh Divisions & Districts ─────────────────────
const divisions = [
  'Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal',
  'Sylhet', 'Rangpur', 'Mymensingh'
];

const districtsByDivision: Record<string, string[]> = {
  'Dhaka': ['Dhaka', 'Faridpur', 'Gazipur', 'Gopalganj', 'Kishoreganj', 'Madaripur', 'Manikganj', 'Munshiganj', 'Narayanganj', 'Narsingdi', 'Rajbari', 'Shariatpur', 'Tangail'],
  'Chattogram': ['Bandarban', 'Brahmanbaria', 'Chandpur', 'Chattogram', 'Comilla', "Cox's Bazar", 'Feni', 'Khagrachari', 'Lakshmipur', 'Noakhali', 'Rangamati'],
  'Rajshahi': ['Bogra', 'Joypurhat', 'Naogaon', 'Natore', 'Nawabganj', 'Pabna', 'Rajshahi', 'Sirajganj'],
  'Khulna': ['Bagerhat', 'Chuadanga', 'Jashore', 'Jhenaidah', 'Khulna', 'Kushtia', 'Magura', 'Meherpur', 'Narail', 'Sathkhira'],
  'Barishal': ['Barguna', 'Barishal', 'Bhola', 'Jhalokati', 'Patuakhali', 'Pirojpur'],
  'Sylhet': ['Habiganj', 'Moulvibazar', 'Sunamganj', 'Sylhet'],
  'Rangpur': ['Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 'Panchagarh', 'Rangpur', 'Thakurgaon'],
  'Mymensingh': ['Jamalpur', 'Mymensingh', 'Netrokona', 'Sherpur']
};

const educationLevels = [
  'SSC / O-Level', 'HSC / A-Level', "Bachelor's (Honours)",
  "Bachelor's (Pass)", "Master's", 'PhD', 'Diploma',
  'Other'
];

const hearAboutOptions = [
  'Facebook', 'YouTube', 'Google Search', 'Friend / Family',
  'Facebook Group', 'YouTube Channel', 'Educational Blog',
  'Newspaper', 'Other'
];

// ─── Vibrant gradients for exam cards ─────────────────────
const gradientMap = [
  'from-blue-600 via-blue-500 to-indigo-400',
  'from-amber-500 via-amber-400 to-orange-300',
  'from-violet-500 via-violet-400 to-purple-300',
  'from-emerald-500 via-emerald-400 to-teal-300',
  'from-rose-500 via-rose-400 to-pink-300',
  'from-cyan-500 via-cyan-400 to-sky-300',
];

// ─── Profile form state ───────────────────────────────────
interface ProfileForm {
  name: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  division: string;
  district: string;
  thana: string;
  village: string;
  postCode: string;
  fullAddress: string;
  education: string;
  institute: string;
  targetDate: string;
  preferredCenter: string;
  hearAbout: string;
  notes: string;
}

const emptyForm: ProfileForm = {
  name: '', phone: '', email: '', dateOfBirth: '',
  division: '', district: '', thana: '', village: '', postCode: '', fullAddress: '',
  education: '', institute: '', targetDate: '', preferredCenter: '', hearAbout: '', notes: '',
};

// ─── Reusable form primitives ─────────────────────────────
const Field = ({
  label,
  required,
  error,
  children,
  isDark,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  isDark: boolean;
}) => (
  <div className="space-y-1.5">
    <label className={`block text-xs tracking-wide uppercase ${
      isDark ? 'font-semibold text-[#A1A8B3]' : 'font-bold text-[#4a4a4a] font-serif'
    }`}>
      {label}
      {required && <span className="text-[#EB5757] ml-1">*</span>}
    </label>
    {children}
    {error && (
      <p className={`flex items-center gap-1 text-[11px] font-medium ${
        isDark ? 'text-[#EB5757]' : 'text-[#b91c1c] font-serif'
      }`}>
        <AlertCircle size={11} />
        {error}
      </p>
    )}
  </div>
);

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode; isDark?: boolean }>(
  ({ icon, className = '', isDark = true, ...props }, ref) => (
    <div className="relative">
      {icon && (
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${
          isDark ? 'text-[#6B7280]' : 'text-[#4a4a4a]'
        }`}>
          {icon}
        </div>
      )}
      <input
        ref={ref}
        {...props}
        className={`
          w-full px-4 py-3 rounded-xl transition-all duration-200
          focus:outline-none
          disabled:opacity-60 disabled:cursor-not-allowed
          ${icon ? 'pl-10' : ''}
          ${isDark 
            ? 'border border-[#23262D] bg-[#161920] text-sm text-[#F5F7FA] placeholder:text-[#6B7280] focus:ring-2 focus:ring-[#00E5B3]/30 focus:border-[#00E5B3] hover:border-[#323742]'
            : 'border border-[#d8d4cb] bg-[#f2efe9] text-sm text-[#1a1a1a] placeholder:text-[#6B7280] font-serif shadow-[1px_1px_0px_0px_#1a1a1a] focus:ring-2 focus:ring-[#b91c1c]/30 focus:border-[#b91c1c]'
          }
          ${className}
        `}
      />
    </div>
  )
);
Input.displayName = 'Input';

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { icon?: React.ReactNode; isDark?: boolean }>(
  ({ icon, className = '', children, isDark = true, ...props }, ref) => (
    <div className="relative">
      {icon && (
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10 ${
          isDark ? 'text-[#6B7280]' : 'text-[#4a4a4a]'
        }`}>
          {icon}
        </div>
      )}
      <select
        ref={ref}
        {...props}
        className={`
          w-full px-4 py-3 rounded-xl appearance-none transition-all duration-200
          focus:outline-none
          disabled:opacity-60 disabled:cursor-not-allowed
          ${icon ? 'pl-10' : ''}
          ${isDark 
            ? 'border border-[#23262D] bg-[#161920] text-sm text-[#F5F7FA] focus:ring-2 focus:ring-[#00E5B3]/30 focus:border-[#00E5B3] hover:border-[#323742]'
            : 'border border-[#d8d4cb] bg-[#f2efe9] text-sm text-[#1a1a1a] font-serif shadow-[1px_1px_0px_0px_#1a1a1a] focus:ring-2 focus:ring-[#b91c1c]/30 focus:border-[#b91c1c]'
          }
          ${className}
        `}
      >
        {children}
      </select>
      <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
        isDark ? 'text-[#6B7280]' : 'text-[#4a4a4a]'
      }`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </div>
  )
);
Select.displayName = 'Select';

const TextArea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { isDark?: boolean }>(
  ({ className = '', isDark = true, ...props }, ref) => (
    <textarea
      ref={ref}
      {...props}
      className={`
        w-full px-4 py-3 rounded-xl resize-none transition-all duration-200
        focus:outline-none
        ${isDark 
          ? 'border border-[#23262D] bg-[#161920] text-sm text-[#F5F7FA] placeholder:text-[#6B7280] focus:ring-2 focus:ring-[#00E5B3]/30 focus:border-[#00E5B3] hover:border-[#323742]'
          : 'border border-[#d8d4cb] bg-[#f2efe9] text-sm text-[#1a1a1a] placeholder:text-[#6B7280] font-serif shadow-[1px_1px_0px_0px_#1a1a1a] focus:ring-2 focus:ring-[#b91c1c]/30 focus:border-[#b91c1c]'
        }
        ${className}
      `}
    />
  )
);
TextArea.displayName = 'TextArea';

// ─── Main Component ───────────────────────────────────────
const Settings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: userData, isLoading: profileLoading } = useGetMeQuery();
  const { data: exams = [], isLoading: examsLoading } = useGetExamsQuery();
  const [selectExam, { isLoading: isSelecting }] = useSelectExamMutation();
  const [removeExam, { isLoading: isRemoving }] = useRemoveExamMutation();
  const [addUserInfo, { isLoading: isSavingProfile }] = useAddUserInfoMutation();
  const { isDark, toggleTheme } = useTheme();
  const { mode: navMode, setMode: setNavMode } = useNavigationMode();

  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [formInitialized, setFormInitialized] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [avatarStatus, setAvatarStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [pendingExamId, setPendingExamId] = useState<string | null>(null);
  const [uploadImage] = useUploadImageMutation();

  const userId = userData?._id || '';

  useEffect(() => {
    if (userData && !formInitialized) {
      setForm({
        name: userData.name || userData.username || '',
        phone: (userData as any).phone || '',
        email: userData.email || '',
        dateOfBirth: userData.dateOfBirth || '',
        division: userData.division || '',
        district: userData.district || '',
        thana: userData.thana || '',
        village: userData.village || '',
        postCode: userData.postCode || '',
        fullAddress: userData.fullAddress || '',
        education: userData.education || '',
        institute: userData.institute || '',
        targetDate: userData.targetDate || '',
        preferredCenter: userData.preferredCenter || '',
        hearAbout: userData.hearAbout || '',
        notes: userData.notes || '',
      });
      setFormInitialized(true);
    }
  }, [userData, formInitialized]);

  const selectedExams = useMemo<any[]>(() => (userData?.selectedExams as any[]) || [], [userData]);
  const selectedIds = useMemo(() => new Set(selectedExams.map((e) => e?._id).filter(Boolean)), [selectedExams]);

  const updateField = useCallback((field: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }, []);

  const validateForm = (): boolean => {
    const next: Partial<Record<keyof ProfileForm, string>> = {};
    if (!form.name.trim()) next.name = 'Full name is required';
    if (!form.phone.trim()) next.phone = 'Phone number is required';
    if (!form.division) next.division = 'Select your division';
    if (!form.district) next.district = 'Select your district';
    if (!form.thana.trim()) next.thana = 'Thana/Upazila is required';
    if (!form.postCode.trim()) next.postCode = 'Post code is required';
    else if (!/^\d{4}$/.test(form.postCode)) next.postCode = 'Post code must be 4 digits';
    if (!form.education) next.education = 'Select your educational qualification';
    if (!form.targetDate) next.targetDate = 'Please select your target exam date';
    else if (new Date(form.targetDate) < new Date()) next.targetDate = 'Target date must be in the future';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;
    setSaveStatus('idle');
    try {
      await addUserInfo({ id: userId, data: { ...form } }).unwrap();
      dispatch(updateUser({ name: form.name, email: form.email }));
      const token = getAuthToken();
      if (token) {
        persistAuth(token, {
          _id: userId,
          name: form.name,
          email: form.email,
          role: userData?.role || 'student',
        });
      }
      setSaveStatus('success');
    } catch (err) {
      console.error('Failed to save profile:', err);
      setSaveStatus('error');
    }
  };

  const handleProfilePicUpload = async (file: File) => {
    if (!userId) return;
    setAvatarStatus('uploading');
    try {
      const res = await uploadImage(file).unwrap();
      await addUserInfo({ id: userId, data: { profilePic: res.url } }).unwrap();
      setAvatarStatus('success');
    } catch (err) {
      console.error('Failed to upload profile picture:', err);
      setAvatarStatus('error');
    }
  };

  const handleToggleExam = async (exam: any) => {
    const id = exam?._id;
    if (!userId || !id || pendingExamId) return;
    setPendingExamId(id);
    try {
      if (selectedIds.has(id)) {
        await removeExam({ userId, examId: [id] }).unwrap();
      } else {
        await selectExam({ userId, examId: [id] }).unwrap();
      }
    } catch (err) {
      console.error('Failed to update exam selection:', err);
    } finally {
      setPendingExamId(null);
    }
  };

  const handleRemoveSelected = async (id: string) => {
    if (!userId || pendingExamId) return;
    setPendingExamId(id);
    try {
      await removeExam({ userId, examId: [id] }).unwrap();
    } catch (err) {
      console.error('Failed to remove exam:', err);
    } finally {
      setPendingExamId(null);
    }
  };

  const isBusy = isSelecting || isRemoving;

  const moreGroups = [
    // { icon: <Bell size={18} />, title: 'Notifications', description: 'Configure push notifications and email alerts' },
    // { icon: <Shield size={18} />, title: 'Privacy & Security', description: 'Control your account security and data privacy' },
    { icon: <Palette size={18} />, title: 'Appearance', description: 'Customize theme, colors, and display options' },
    // { icon: <Globe size={18} />, title: 'Language & Region', description: 'Set your preferred language and regional settings' },
  ];

  const AppearanceToggle = () => (
    <div
      className={`mt-4 flex items-center justify-between gap-4 rounded-xl border px-4 py-3 transition-all ${
        isDark
          ? 'border-[#23262D] bg-[#161920] text-[#F5F7FA]'
          : 'border-[#d8d4cb] bg-[#f2efe9] text-[#1a1a1a] shadow-[1px_1px_0px_0px_#1a1a1a]'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${isDark ? 'bg-[#9B51E0]/10 text-[#9B51E0]' : 'bg-[#e8e4db] text-[#1a1a1a]'}`}>
          {isDark ? <SunMedium size={18} /> : <MoonStar size={18} />}
        </span>
        <div className="text-left">
          <div className="text-sm font-bold">Theme</div>
          <div className={`text-xs ${isDark ? 'text-[#A1A8B3]' : 'text-[#4a4a4a] font-serif italic'}`}>
            {isDark ? 'Dark mode enabled' : 'Light mode enabled'}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${
          isDark ? 'bg-[#2F80ED]' : 'bg-[#1a1a1a]'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            isDark ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  // ─── Navigation mode picker (sidebar vs hub page) ──────────
  const NavigationModePicker = ({ isDark }: { isDark: boolean }) => (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {([
        { value: 'sidebar', icon: <PanelLeft size={18} />, title: 'Sidebar Menu', description: 'Classic side navigation always visible' },
        { value: 'hub', icon: <LayoutGrid size={18} />, title: 'Navigation Hub', description: 'A menu page listing all sections' },
      ] as const).map((option) => {
        const selected = navMode === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setNavMode(option.value)}
            className={`relative flex items-start gap-3 rounded-xl p-4 text-left transition-all border ${
              isDark
                ? selected
                  ? 'bg-[#161920] border-[#00E5B3]/60 shadow-[0_0_0_1px_rgba(0,229,179,0.25),0_8px_24px_-12px_rgba(0,229,179,0.4)]'
                  : 'bg-[#161920] border-[#23262D] hover:border-[#323742]'
                : selected
                ? 'bg-[#f2efe9] border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a]'
                : 'bg-[#f2efe9] border-[#d8d4cb] shadow-[2px_2px_0px_0px_#d8d4cb] hover:shadow-[3px_3px_0px_0px_#1a1a1a]'
            }`}
          >
            <span
              className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                isDark
                  ? selected
                    ? 'bg-[#00E5B3]/15 text-[#00E5B3] ring-1 ring-[#00E5B3]/30'
                    : 'bg-[#1D2029] text-[#A1A8B3] ring-1 ring-[#23262D]'
                  : selected
                  ? 'bg-[#1a1a1a] text-[#f2efe9]'
                  : 'bg-[#e0dcd5] text-[#4a4a4a]'
              }`}
            >
              {option.icon}
            </span>
            <span className="flex-1">
              <span className={`block text-sm ${isDark ? 'font-semibold text-[#F5F7FA]' : 'font-black font-serif text-[#1a1a1a]'}`}>
                {option.title}
                {selected && (
                  <span className={`ml-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                    isDark ? 'text-[#00E5B3] bg-[#00E5B3]/10' : 'text-[#b91c1c] bg-[#e0dcd5] border border-[#b91c1c]/40'
                  }`}>
                    <CheckCircle2 size={10} /> Active
                  </span>
                )}
              </span>
              <span className={`block text-xs mt-0.5 ${isDark ? 'text-[#8A919E]' : 'text-[#4a4a4a] font-serif italic'}`}>
                {option.description}
              </span>
            </span>
            <span
              className={`shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                selected
                  ? isDark
                    ? 'bg-[#00E5B3] border-[#00E5B3] text-black'
                    : 'bg-[#1a1a1a] border-[#1a1a1a] text-[#f2efe9]'
                  : isDark
                  ? 'border-[#323742] text-transparent'
                  : 'border-[#d8d4cb] text-transparent'
              }`}
            >
              <Check size={12} strokeWidth={3} />
            </span>
          </button>
        );
      })}
    </div>
  );

  // ─── LIGHT MODE (Vintage Paper Style) ───────────────────────
  if (!isDark) {
    return (
      <div 
        className="font-sans md:p-2 p-1  text-[#1a1a1a] space-y-8 min-h-screen"
        style={{
          backgroundImage: 'radial-gradient(#d8d4cb 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] border border-[#1a1a1a] flex items-center justify-center">
            <SettingsIcon size={20} className="text-[#f2efe9]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#1a1a1a] font-serif">Settings</h1>
            <p className="text-sm text-[#4a4a4a] font-serif italic">Manage your profile and the exams you're preparing for</p>
          </div>
        </div>

        {profileLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[#b91c1c]" />
          </div>
        ) : (
          <>
            {/* ── Profile Details ─────────────────────────────── */}
            <section className="bg-[#f2efe9] border border-[#d8d4cb] rounded-lg overflow-hidden shadow-[3px_3px_0px_0px_#1a1a1a]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#d8d4cb]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-md bg-[#1a1a1a] text-[#f2efe9]">
                    <User size={16} />
                  </div>
                  <div>
                    <h2 className="font-black text-base text-[#1a1a1a] font-serif">Profile Details</h2>
                    <p className="text-xs text-[#4a4a4a] font-serif italic">Fill in your personal information to complete your profile</p>
                  </div>
                </div>
                {saveStatus === 'success' && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1a1a1a] bg-[#e0dcd5] border border-[#1a1a1a] rounded-full px-3 py-1.5 font-serif">
                    <CheckCircle2 size={13} />
                    Profile saved
                  </span>
                )}
                {saveStatus === 'error' && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b91c1c] bg-[#f2efe9] border border-[#b91c1c] rounded-full px-3 py-1.5 font-serif">
                    <AlertCircle size={13} />
                    Failed to save
                  </span>
                )}
              </div>

              <div className="p-6 space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#1a1a1a] flex items-center justify-center text-[#f2efe9] font-black text-2xl border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#b91c1c]">
                      {(userData as any)?.profilePic ? (
                        <img src={(userData as any).profilePic} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        (form.name || 'S')[0].toUpperCase()
                      )}
                    </div>
                    {avatarStatus === 'uploading' && (
                      <div className="absolute inset-0 rounded-lg bg-black/50 flex items-center justify-center">
                        <Loader2 size={22} className="animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-black text-sm text-[#1a1a1a] font-serif">Profile Picture</h3>
                    <p className="text-xs text-[#4a4a4a] font-serif italic">Uploaded images are stored securely on Cloudinary.</p>
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold cursor-pointer bg-[#1a1a1a] border border-[#1a1a1a] text-[#f2efe9] font-serif shadow-[2px_2px_0px_0px_#b91c1c] hover:shadow-[3px_3px_0px_0px_#b91c1c] transition-all">
                        <Camera size={14} />
                        {avatarStatus === 'uploading' ? 'Uploading...' : (userData as any)?.profilePic ? 'Change Photo' : 'Upload Photo'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={avatarStatus === 'uploading'}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleProfilePicUpload(file);
                            e.target.value = '';
                          }}
                        />
                      </label>
                      {avatarStatus === 'success' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1a1a1a] font-serif">
                          <CheckCircle2 size={13} /> Updated
                        </span>
                      )}
                      {avatarStatus === 'error' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#b91c1c] font-serif">
                          <AlertCircle size={13} /> Upload failed
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Personal */}
                <div>
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-[#4a4a4a] mb-3 font-serif">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Full Name" required error={errors.name} isDark={false}>
                      <Input isDark={false} icon={<User size={15} />} placeholder="e.g., Md. Rahim Uddin" value={form.name} onChange={(e) => updateField('name', e.target.value)} />
                    </Field>
                    <Field label="Phone Number" required error={errors.phone} isDark={false}>
                      <Input isDark={false} icon={<Phone size={15} />} placeholder="e.g., 017XXXXXXXX" type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
                    </Field>
                    <Field label="Email Address" isDark={false}>
                      <Input isDark={false} icon={<Mail size={15} />} type="email" placeholder="you@example.com" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
                    </Field>
                    <Field label="Date of Birth" isDark={false}>
                      <Input isDark={false} icon={<Calendar size={15} />} type="date" value={form.dateOfBirth} onChange={(e) => updateField('dateOfBirth', e.target.value)} />
                    </Field>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-[#4a4a4a] mb-3 font-serif">Address & Location</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Division" required error={errors.division} isDark={false}>
                      <Select isDark={false} icon={<Building2 size={15} />} value={form.division} onChange={(e) => { updateField('division', e.target.value); updateField('district', ''); }}>
                        <option value="">Select Division</option>
                        {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
                      </Select>
                    </Field>
                    <Field label="District" required error={errors.district} isDark={false}>
                      <Select isDark={false} icon={<MapPin size={15} />} value={form.district} onChange={(e) => updateField('district', e.target.value)} disabled={!form.division}>
                        <option value="">Select District</option>
                        {(districtsByDivision[form.division] || []).map((d) => <option key={d} value={d}>{d}</option>)}
                      </Select>
                    </Field>
                    <Field label="Thana / Upazila" required error={errors.thana} isDark={false}>
                      <Input isDark={false} icon={<MapPin size={15} />} placeholder="e.g., Mirpur, Sadar" value={form.thana} onChange={(e) => updateField('thana', e.target.value)} />
                    </Field>
                    <Field label="Post Code" required error={errors.postCode} isDark={false}>
                      <Input isDark={false} icon={<Mail size={15} />} placeholder="e.g., 1216" maxLength={4} value={form.postCode} onChange={(e) => updateField('postCode', e.target.value)} />
                    </Field>
                    <Field label="Village / Area" isDark={false}>
                      <Input isDark={false} icon={<Home size={15} />} placeholder="e.g., Bashundhara R/A, Section-13" value={form.village} onChange={(e) => updateField('village', e.target.value)} />
                    </Field>
                    <Field label="Full Address" isDark={false}>
                      <TextArea isDark={false} rows={2} placeholder="Write your complete address..." value={form.fullAddress} onChange={(e) => updateField('fullAddress', e.target.value)} />
                    </Field>
                  </div>
                </div>

                {/* Education & Target */}
                <div>
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-[#4a4a4a] mb-3 font-serif">Education & Target</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Educational Qualification" required error={errors.education} isDark={false}>
                      <Select isDark={false} icon={<GraduationCap size={15} />} value={form.education} onChange={(e) => updateField('education', e.target.value)}>
                        <option value="">Select Qualification</option>
                        {educationLevels.map((edu) => <option key={edu} value={edu}>{edu}</option>)}
                      </Select>
                    </Field>
                    <Field label="Current / Last Institute" isDark={false}>
                      <Input isDark={false} icon={<Building2 size={15} />} placeholder="e.g., Dhaka University" value={form.institute} onChange={(e) => updateField('institute', e.target.value)} />
                    </Field>
                    <Field label="Target Exam Date" required error={errors.targetDate} isDark={false}>
                      <Input isDark={false} icon={<Calendar size={15} />} type="date" value={form.targetDate} onChange={(e) => updateField('targetDate', e.target.value)} />
                    </Field>
                    <Field label="Preferred Exam Center City" isDark={false}>
                      <Input isDark={false} icon={<Target size={15} />} placeholder="e.g., Dhaka, Chattogram" value={form.preferredCenter} onChange={(e) => updateField('preferredCenter', e.target.value)} />
                    </Field>
                    <Field label="How did you hear about us?" isDark={false}>
                      <Select isDark={false} icon={<Sparkles size={15} />} value={form.hearAbout} onChange={(e) => updateField('hearAbout', e.target.value)}>
                        <option value="">Select an option</option>
                        {hearAboutOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </Select>
                    </Field>
                    <Field label="Additional Notes" isDark={false}>
                      <Input isDark={false} icon={<BookOpen size={15} />} placeholder="Any specific requirements..." value={form.notes} onChange={(e) => updateField('notes', e.target.value)} />
                    </Field>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile || !userId}
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-md font-black text-sm font-serif bg-[#1a1a1a] text-[#f2efe9] border border-[#1a1a1a] shadow-[2px_2px_0px_0px_#b91c1c] hover:shadow-[3px_3px_0px_0px_#b91c1c] transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSavingProfile ? (
                      <><Loader2 size={16} className="animate-spin" /> Saving...</>
                    ) : (
                      <><Check size={16} /> Save Profile</>
                    )}
                  </button>
                </div>
              </div>
            </section>

            {/* ── My Exams ────────────────────────────────────── */}
            <section className="bg-[#f2efe9] border border-[#d8d4cb] rounded-lg overflow-hidden shadow-[3px_3px_0px_0px_#1a1a1a]">
              <div className="px-3 sm:px-6 py-4 border-b border-[#d8d4cb] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-md bg-[#1a1a1a] text-[#f2efe9]">
                    <GraduationCap size={16} />
                  </div>
                  <div>
                    <h2 className="font-black text-base text-[#1a1a1a] font-serif">My Exams</h2>
                    <p className="md:text-xs text-[9px] text-[#4a4a4a] font-serif italic">Select or remove the exams you're preparing for</p>
                  </div>
                </div>
                <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-[#1a1a1a] bg-[#e0dcd5] border border-[#1a1a1a] rounded-full px-3 py-1.5 font-serif">
                  <CheckCircle2 size={13} />
                  {selectedIds.size} selected
                </span>
              </div>

              <div className="p-6 space-y-6">
                {selectedExams.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedExams.map((exam: any) => (
                      <span key={exam._id} className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full text-xs font-bold bg-[#e0dcd5] border border-[#1a1a1a] text-[#1a1a1a] font-serif">
                        {exam.name || 'Exam'}
                        <button onClick={() => handleRemoveSelected(exam._id)} disabled={isBusy} className="p-0.5 rounded-full hover:bg-[#b91c1c]/20 hover:text-[#b91c1c] transition-colors disabled:opacity-50" title="Remove exam">
                          {pendingExamId === exam._id ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {examsLoading ? (
                  <div className="flex items-center justify-center py-14">
                    <Loader2 size={28} className="animate-spin text-[#b91c1c]" />
                  </div>
                ) : exams.length === 0 ? (
                  <p className="text-sm text-[#4a4a4a] text-center py-10 font-serif italic">No exams available yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {exams.map((exam: any) => {
                      const id = exam._id;
                      const isSelected = selectedIds.has(id);
                      const isPending = pendingExamId === id;

                      return (
                        <button
                          key={id}
                          onClick={() => handleToggleExam(exam)}
                          disabled={isBusy}
                          className={`group relative text-left rounded-lg overflow-hidden border transition-all duration-300 ${
                            isSelected
                              ? 'bg-[#f2efe9] border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a]'
                              : 'bg-[#f2efe9] border-[#d8d4cb] hover:shadow-[3px_3px_0px_0px_#1a1a1a] shadow-[2px_2px_0px_0px_#d8d4cb]'
                          } disabled:opacity-70 disabled:cursor-not-allowed`}
                        >
                          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#b91c1c]" />

                          <div className="relative p-4 flex items-start gap-3.5">
                            <div className={`shrink-0 w-11 h-11 rounded-lg flex items-center justify-center transition-all duration-300 border ${
                              isSelected ? 'bg-[#1a1a1a] text-[#f2efe9] border-[#1a1a1a]' : 'bg-[#e0dcd5] text-[#4a4a4a] border-[#d8d4cb]'
                            }`}>
                              <BookOpen size={18} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-black text-sm text-[#1a1a1a] font-serif truncate pr-1">{exam.name}</h3>
                                <span className={`shrink-0 mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-all duration-200 ${
                                  isSelected ? 'bg-[#1a1a1a] border-[#1a1a1a] text-[#f2efe9]' : 'border-[#d8d4cb] text-transparent'
                                }`}>
                                  {isPending ? <Loader2 size={11} className="animate-spin text-[#f2efe9]" /> : <Check size={12} strokeWidth={3} />}
                                </span>
                              </div>
                              <p className="text-xs text-[#4a4a4a] line-clamp-2 mt-1 leading-relaxed font-serif italic">
                                {exam.description || 'Comprehensive preparation for this exam.'}
                              </p>
                              <div className="mt-3 flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md font-serif ${
                                  isSelected ? 'text-[#1a1a1a] bg-[#e0dcd5] border border-[#1a1a1a]' : 'text-[#4a4a4a] bg-[#e0dcd5] border border-[#d8d4cb]'
                                }`}>
                                  {isPending ? 'Saving…' : isSelected ? 'Selected' : 'Not selected'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* ── More Settings ─────────────────── */}
            <section>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-[#4a4a4a] mb-3 font-serif">
                More Settings <span className="text-[10px] text-[#4a4a4a] italic">(coming soon)</span>
              </h3>

              <div className="bg-[#f2efe9] border border-[#d8d4cb] rounded-lg p-5 shadow-[2px_2px_0px_0px_#1a1a1a]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-md bg-[#1a1a1a] flex items-center justify-center text-[#f2efe9]">
                    <LayoutGrid size={18} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-[#1a1a1a] font-serif">Dashboard Navigation</h3>
                    <p className="text-xs text-[#4a4a4a] font-serif italic">Choose how you move between sections</p>
                  </div>
                </div>
                <NavigationModePicker isDark={false} />
              </div>

              <div className="bg-[#f2efe9] border border-[#d8d4cb] rounded-lg p-5 shadow-[2px_2px_0px_0px_#1a1a1a] mt-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-md bg-[#1a1a1a] flex items-center justify-center text-[#f2efe9]">
                    <Palette size={18} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-[#1a1a1a] font-serif">Appearance</h3>
                    <p className="text-xs text-[#4a4a4a] font-serif italic">Customize theme, colors, and display options</p>
                  </div>
                </div>
                <AppearanceToggle />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {moreGroups.filter((group) => group.title !== 'Appearance').map((group, index) => (
                  <div key={index} className="bg-[#f2efe9] border border-[#d8d4cb] rounded-lg p-5 flex items-start gap-4 hover:shadow-[3px_3px_0px_0px_#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a] transition-all group">
                    <div className="w-10 h-10 rounded-md bg-[#1a1a1a] flex items-center justify-center text-[#f2efe9]">
                      {group.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-sm text-[#1a1a1a] font-serif">{group.title}</h3>
                      <p className="text-xs text-[#4a4a4a] font-serif italic">{group.description}</p>
                    </div>
                    <div className="text-[#4a4a4a] group-hover:text-[#b91c1c] transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    );
  }

  // ─── DARK MODE (Original Code - Unchanged) ─────────────────
  return (
    <div className="font-sans text-[#F5F7FA] space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#00E5B3]/10 border border-[#00E5B3]/30 flex items-center justify-center">
          <SettingsIcon size={20} className="text-[#00E5B3]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#F5F7FA]">Settings</h1>
          <p className="text-sm text-[#A1A8B3]">Manage your profile and the exams you're preparing for</p>
        </div>
      </div>

      {profileLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[#2F80ED]" />
        </div>
      ) : (
        <>
          {/* Profile Details */}
          <section className="bg-[#111318] border border-[#23262D] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#23262D]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#2F80ED]/10 text-[#2F80ED]">
                  <User size={16} />
                </div>
                <div>
                  <h2 className="font-bold text-base text-[#F5F7FA]">Profile Details</h2>
                  <p className="text-xs text-[#A1A8B3]">Fill in your personal information to complete your profile</p>
                </div>
              </div>
              {saveStatus === 'success' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00E5B3] bg-[#00E5B3]/10 border border-[#00E5B3]/30 rounded-full px-3 py-1.5">
                  <CheckCircle2 size={13} />
                  Profile saved
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#EB5757] bg-[#EB5757]/10 border border-[#EB5757]/30 rounded-full px-3 py-1.5">
                  <AlertCircle size={13} />
                  Failed to save
                </span>
              )}
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-[#00E5B3] to-[#2F80ED] flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {(userData as any)?.profilePic ? (
                      <img src={(userData as any).profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      (form.name || 'S')[0].toUpperCase()
                    )}
                  </div>
                  {avatarStatus === 'uploading' && (
                    <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center">
                      <Loader2 size={22} className="animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-[#F5F7FA]">Profile Picture</h3>
                  <p className="text-xs text-[#A1A8B3]">Uploaded images are stored securely on Cloudinary.</p>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer bg-[#161920] border border-[#23262D] text-[#F5F7FA] hover:border-[#00E5B3]/50 hover:text-[#00E5B3] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      <Camera size={14} />
                      {avatarStatus === 'uploading' ? 'Uploading...' : (userData as any)?.profilePic ? 'Change Photo' : 'Upload Photo'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={avatarStatus === 'uploading'}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleProfilePicUpload(file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                    {avatarStatus === 'success' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#00E5B3]">
                        <CheckCircle2 size={13} /> Updated
                      </span>
                    )}
                    {avatarStatus === 'error' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#EB5757]">
                        <AlertCircle size={13} /> Upload failed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal */}
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-3">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Full Name" required error={errors.name} isDark={true}>
                    <Input isDark={true} icon={<User size={15} />} placeholder="e.g., Md. Rahim Uddin" value={form.name} onChange={(e) => updateField('name', e.target.value)} />
                  </Field>
                  <Field label="Phone Number" required error={errors.phone} isDark={true}>
                    <Input isDark={true} icon={<Phone size={15} />} placeholder="e.g., 017XXXXXXXX" type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
                  </Field>
                  <Field label="Email Address" isDark={true}>
                    <Input isDark={true} icon={<Mail size={15} />} type="email" placeholder="you@example.com" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
                  </Field>
                  <Field label="Date of Birth" isDark={true}>
                    <Input isDark={true} icon={<Calendar size={15} />} type="date" value={form.dateOfBirth} onChange={(e) => updateField('dateOfBirth', e.target.value)} />
                  </Field>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-3">Address & Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Division" required error={errors.division} isDark={true}>
                    <Select isDark={true} icon={<Building2 size={15} />} value={form.division} onChange={(e) => { updateField('division', e.target.value); updateField('district', ''); }}>
                      <option value="">Select Division</option>
                      {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
                    </Select>
                  </Field>
                  <Field label="District" required error={errors.district} isDark={true}>
                    <Select isDark={true} icon={<MapPin size={15} />} value={form.district} onChange={(e) => updateField('district', e.target.value)} disabled={!form.division}>
                      <option value="">Select District</option>
                      {(districtsByDivision[form.division] || []).map((d) => <option key={d} value={d}>{d}</option>)}
                    </Select>
                  </Field>
                  <Field label="Thana / Upazila" required error={errors.thana} isDark={true}>
                    <Input isDark={true} icon={<MapPin size={15} />} placeholder="e.g., Mirpur, Sadar" value={form.thana} onChange={(e) => updateField('thana', e.target.value)} />
                  </Field>
                  <Field label="Post Code" required error={errors.postCode} isDark={true}>
                    <Input isDark={true} icon={<Mail size={15} />} placeholder="e.g., 1216" maxLength={4} value={form.postCode} onChange={(e) => updateField('postCode', e.target.value)} />
                  </Field>
                  <Field label="Village / Area" isDark={true}>
                    <Input isDark={true} icon={<Home size={15} />} placeholder="e.g., Bashundhara R/A, Section-13" value={form.village} onChange={(e) => updateField('village', e.target.value)} />
                  </Field>
                  <Field label="Full Address" isDark={true}>
                    <TextArea isDark={true} rows={2} placeholder="Write your complete address..." value={form.fullAddress} onChange={(e) => updateField('fullAddress', e.target.value)} />
                  </Field>
                </div>
              </div>

              {/* Education & Target */}
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-3">Education & Target</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Educational Qualification" required error={errors.education} isDark={true}>
                    <Select isDark={true} icon={<GraduationCap size={15} />} value={form.education} onChange={(e) => updateField('education', e.target.value)}>
                      <option value="">Select Qualification</option>
                      {educationLevels.map((edu) => <option key={edu} value={edu}>{edu}</option>)}
                    </Select>
                  </Field>
                  <Field label="Current / Last Institute" isDark={true}>
                    <Input isDark={true} icon={<Building2 size={15} />} placeholder="e.g., Dhaka University" value={form.institute} onChange={(e) => updateField('institute', e.target.value)} />
                  </Field>
                  <Field label="Target Exam Date" required error={errors.targetDate} isDark={true}>
                    <Input isDark={true} icon={<Calendar size={15} />} type="date" value={form.targetDate} onChange={(e) => updateField('targetDate', e.target.value)} />
                  </Field>
                  <Field label="Preferred Exam Center City" isDark={true}>
                    <Input isDark={true} icon={<Target size={15} />} placeholder="e.g., Dhaka, Chattogram" value={form.preferredCenter} onChange={(e) => updateField('preferredCenter', e.target.value)} />
                  </Field>
                  <Field label="How did you hear about us?" isDark={true}>
                    <Select isDark={true} icon={<Sparkles size={15} />} value={form.hearAbout} onChange={(e) => updateField('hearAbout', e.target.value)}>
                      <option value="">Select an option</option>
                      {hearAboutOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </Select>
                  </Field>
                  <Field label="Additional Notes" isDark={true}>
                    <Input isDark={true} icon={<BookOpen size={15} />} placeholder="Any specific requirements..." value={form.notes} onChange={(e) => updateField('notes', e.target.value)} />
                  </Field>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile || !userId}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm bg-[#00E5B3] text-black hover:bg-[#00C298] shadow-lg shadow-[#00E5B3]/20 transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSavingProfile ? (
                    <><Loader2 size={16} className="animate-spin" /> Saving...</>
                  ) : (
                    <><Check size={16} /> Save Profile</>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* My Exams */}
          <section className="bg-[#111318] border border-[#23262D] rounded-2xl overflow-hidden">
            <div className="px-3 sm:px-6 py-4 border-b border-[#23262D] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#00E5B3]/10 text-[#00E5B3]">
                  <GraduationCap size={16} />
                </div>
                <div>
                  <h2 className="font-bold text-base text-[#F5F7FA]">My Exams</h2>
                  <p className="md:text-xs text-[9px] text-[#A1A8B3]">Select or remove the exams you're preparing for</p>
                </div>
              </div>
              <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-[#00E5B3] bg-[#00E5B3]/10 border border-[#00E5B3]/30 rounded-full px-3 py-1.5">
                <CheckCircle2 size={13} />
                {selectedIds.size} selected
              </span>
            </div>

            <div className="p-6 space-y-6">
              {selectedExams.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedExams.map((exam: any) => (
                    <span key={exam._id} className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full text-xs font-semibold bg-[#00E5B3]/10 border border-[#00E5B3]/30 text-[#00E5B3]">
                      {exam.name || 'Exam'}
                      <button onClick={() => handleRemoveSelected(exam._id)} disabled={isBusy} className="p-0.5 rounded-full hover:bg-[#EB5757]/20 hover:text-[#EB5757] transition-colors disabled:opacity-50" title="Remove exam">
                        {pendingExamId === exam._id ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {examsLoading ? (
                <div className="flex items-center justify-center py-14">
                  <Loader2 size={28} className="animate-spin text-[#2F80ED]" />
                </div>
              ) : exams.length === 0 ? (
                <p className="text-sm text-[#A1A8B3] text-center py-10">No exams available yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exams.map((exam: any, index: number) => {
                    const id = exam._id;
                    const isSelected = selectedIds.has(id);
                    const isPending = pendingExamId === id;
                    const gradient = gradientMap[index % gradientMap.length];

                    return (
                      <button
                        key={id}
                        onClick={() => handleToggleExam(exam)}
                        disabled={isBusy}
                        className={`group relative text-left rounded-2xl overflow-hidden bg-[#161920] border transition-all duration-300 ${
                          isSelected
                            ? 'border-[#00E5B3]/60 shadow-[0_0_0_1px_rgba(0,229,179,0.25),0_8px_24px_-12px_rgba(0,229,179,0.4)]'
                            : 'border-[#23262D] hover:border-[#323742] hover:bg-[#181B23]'
                        } disabled:opacity-70 disabled:cursor-not-allowed`}
                      >
                        <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${gradient} ${isSelected ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'} transition-opacity`} />
                        <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl transition-opacity duration-300 ${isSelected ? 'bg-[#00E5B3]/10' : 'bg-white/[0.02] group-hover:bg-white/[0.04]'}`} />

                        <div className="relative p-4 flex items-start gap-3.5">
                          <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                            isSelected ? 'bg-[#00E5B3]/15 text-[#00E5B3] ring-1 ring-[#00E5B3]/30' : 'bg-[#1D2029] text-[#A1A8B3] ring-1 ring-[#23262D] group-hover:text-[#F5F7FA]'
                          }`}>
                            <BookOpen size={18} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-semibold text-sm text-[#F5F7FA] truncate pr-1">{exam.name}</h3>
                              <span className={`shrink-0 mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-all duration-200 ${
                                isSelected ? 'bg-[#00E5B3] border-[#00E5B3] text-black' : 'border-[#323742] text-transparent group-hover:border-[#4A5160]'
                              }`}>
                                {isPending ? <Loader2 size={11} className="animate-spin text-black" /> : <Check size={12} strokeWidth={3} />}
                              </span>
                            </div>
                            <p className="text-xs text-[#8A919E] line-clamp-2 mt-1 leading-relaxed">{exam.description || 'Comprehensive preparation for this exam.'}</p>
                            <div className="mt-3 flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${
                                isSelected ? 'text-[#00E5B3] bg-[#00E5B3]/10' : 'text-[#6B7280] bg-[#1D2029]'
                              }`}>
                                {isPending ? 'Saving…' : isSelected ? 'Selected' : 'Not selected'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* More Settings */}
          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-3">
              More Settings <span className="text-[10px] text-[#A1A8B3]"> (coming soon)</span>
            </h3>

            <div className="bg-[#111318] border border-[#23262D] rounded-xl p-5 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#00E5B3]/10 border border-[#00E5B3]/20 flex items-center justify-center text-[#00E5B3]">
                  <LayoutGrid size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#F5F7FA]">Dashboard Navigation</h3>
                  <p className="text-xs text-[#A1A8B3]">Choose how you move between sections</p>
                </div>
              </div>
              <NavigationModePicker isDark={true} />
            </div>

            <div className="bg-[#111318] border border-[#23262D] rounded-xl p-5 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#00E5B3]/10 border border-[#00E5B3]/20 flex items-center justify-center text-[#00E5B3]">
                  <Palette size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#F5F7FA]">Appearance</h3>
                  <p className="text-xs text-[#A1A8B3]">Customize theme, colors, and display options</p>
                </div>
              </div>
              <AppearanceToggle />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {moreGroups.filter((group) => group.title !== 'Appearance').map((group, index) => (
                <div key={index} className="bg-[#111318] border border-[#23262D] rounded-xl p-5 flex items-start gap-4 hover:border-[#323742] transition-all group">
                  <div className="w-10 h-10 rounded-lg bg-[#161920] flex items-center justify-center text-[#6B7280] group-hover:text-[#00E5B3] transition-colors">
                    {group.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-[#F5F7FA]">{group.title}</h3>
                    <p className="text-xs text-[#A1A8B3]">{group.description}</p>
                  </div>
                  <div className="text-[#323742] group-hover:text-[#A1A8B3] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Settings;