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
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-[#A1A8B3] tracking-wide uppercase">
      {label}
      {required && <span className="text-[#EB5757] ml-1">*</span>}
    </label>
    {children}
    {error && (
      <p className="flex items-center gap-1 text-[11px] text-[#EB5757] font-medium">
        <AlertCircle size={11} />
        {error}
      </p>
    )}
  </div>
);

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode }>(
  ({ icon, className = '', ...props }, ref) => (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">
          {icon}
        </div>
      )}
      <input
        ref={ref}
        {...props}
        className={`
          w-full px-4 py-3 rounded-xl border border-[#23262D] bg-[#161920]
          text-sm text-[#F5F7FA] placeholder:text-[#6B7280]
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-[#00E5B3]/30 focus:border-[#00E5B3]
          hover:border-[#323742]
          disabled:opacity-60 disabled:cursor-not-allowed
          ${icon ? 'pl-10' : ''}
          ${className}
        `}
      />
    </div>
  )
);
Input.displayName = 'Input';

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { icon?: React.ReactNode }>(
  ({ icon, className = '', children, ...props }, ref) => (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none z-10">
          {icon}
        </div>
      )}
      <select
        ref={ref}
        {...props}
        className={`
          w-full px-4 py-3 rounded-xl border border-[#23262D] bg-[#161920]
          text-sm text-[#F5F7FA] appearance-none
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-[#00E5B3]/30 focus:border-[#00E5B3]
          hover:border-[#323742]
          disabled:opacity-60 disabled:cursor-not-allowed
          ${icon ? 'pl-10' : ''}
          ${className}
        `}
      >
        {children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B7280]">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </div>
  )
);
Select.displayName = 'Select';

const TextArea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = '', ...props }, ref) => (
    <textarea
      ref={ref}
      {...props}
      className={`
        w-full px-4 py-3 rounded-xl border border-[#23262D] bg-[#161920]
        text-sm text-[#F5F7FA] placeholder:text-[#6B7280] resize-none
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-[#00E5B3]/30 focus:border-[#00E5B3]
        hover:border-[#323742]
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

  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [formInitialized, setFormInitialized] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [avatarStatus, setAvatarStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [pendingExamId, setPendingExamId] = useState<string | null>(null);
  const [uploadImage] = useUploadImageMutation();

  const userId = userData?._id || '';

  // Prefill the profile form once the user document loads
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

  // Populated exam objects (backend populates selectedExams)
  const selectedExams = useMemo<any[]>(() => (userData?.selectedExams as any[]) || [], [userData]);
  const selectedIds = useMemo(() => new Set(selectedExams.map((e) => e?._id).filter(Boolean)), [selectedExams]);

  const updateField = useCallback((field: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear the error for this field once the user starts fixing it
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
      // Keep the persisted auth snapshot in sync so a page reload shows fresh data
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

  // Upload a profile picture via Cloudinary and persist it to the user doc
  const handleProfilePicUpload = async (file: File) => {
    if (!userId) return;
    setAvatarStatus('uploading');
    try {
      const res = await uploadImage(file).unwrap();
      // addUserInfo invalidates the 'User' tag, so getMe refetches and the
      // new profilePic appears across the app automatically.
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

  // ─── Remaining (placeholder) settings groups ────────────
  const moreGroups = [
    { icon: <Bell size={18} />, title: 'Notifications', description: 'Configure push notifications and email alerts' },
    { icon: <Shield size={18} />, title: 'Privacy & Security', description: 'Control your account security and data privacy' },
    { icon: <Palette size={18} />, title: 'Appearance', description: 'Customize theme, colors, and display options' },
    { icon: <Globe size={18} />, title: 'Language & Region', description: 'Set your preferred language and regional settings' },
  ];

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
          {/* ── Profile Details ─────────────────────────────── */}
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
                      <img
                        src={(userData as any).profilePic}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
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
                        <CheckCircle2 size={13} />
                        Updated
                      </span>
                    )}
                    {avatarStatus === 'error' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#EB5757]">
                        <AlertCircle size={13} />
                        Upload failed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal */}
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-3">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Full Name" required error={errors.name}>
                    <Input icon={<User size={15} />} placeholder="e.g., Md. Rahim Uddin" value={form.name} onChange={(e) => updateField('name', e.target.value)} />
                  </Field>
                  <Field label="Phone Number" required error={errors.phone}>
                    <Input icon={<Phone size={15} />} placeholder="e.g., 017XXXXXXXX" type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
                  </Field>
                  <Field label="Email Address">
                    <Input icon={<Mail size={15} />} type="email" placeholder="you@example.com" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
                  </Field>
                  <Field label="Date of Birth">
                    <Input icon={<Calendar size={15} />} type="date" value={form.dateOfBirth} onChange={(e) => updateField('dateOfBirth', e.target.value)} />
                  </Field>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-3">Address & Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Division" required error={errors.division}>
                    <Select
                      icon={<Building2 size={15} />}
                      value={form.division}
                      onChange={(e) => { updateField('division', e.target.value); updateField('district', ''); }}
                    >
                      <option value="">Select Division</option>
                      {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
                    </Select>
                  </Field>
                  <Field label="District" required error={errors.district}>
                    <Select
                      icon={<MapPin size={15} />}
                      value={form.district}
                      onChange={(e) => updateField('district', e.target.value)}
                      disabled={!form.division}
                    >
                      <option value="">Select District</option>
                      {(districtsByDivision[form.division] || []).map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Thana / Upazila" required error={errors.thana}>
                    <Input icon={<MapPin size={15} />} placeholder="e.g., Mirpur, Sadar" value={form.thana} onChange={(e) => updateField('thana', e.target.value)} />
                  </Field>
                  <Field label="Post Code" required error={errors.postCode}>
                    <Input icon={<Mail size={15} />} placeholder="e.g., 1216" maxLength={4} value={form.postCode} onChange={(e) => updateField('postCode', e.target.value)} />
                  </Field>
                  <Field label="Village / Area">
                    <Input icon={<Home size={15} />} placeholder="e.g., Bashundhara R/A, Section-13" value={form.village} onChange={(e) => updateField('village', e.target.value)} />
                  </Field>
                  <Field label="Full Address">
                    <TextArea rows={2} placeholder="Write your complete address..." value={form.fullAddress} onChange={(e) => updateField('fullAddress', e.target.value)} />
                  </Field>
                </div>
              </div>

              {/* Education & Target */}
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-3">Education & Target</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Educational Qualification" required error={errors.education}>
                    <Select
                      icon={<GraduationCap size={15} />}
                      value={form.education}
                      onChange={(e) => updateField('education', e.target.value)}
                    >
                      <option value="">Select Qualification</option>
                      {educationLevels.map((edu) => <option key={edu} value={edu}>{edu}</option>)}
                    </Select>
                  </Field>
                  <Field label="Current / Last Institute">
                    <Input icon={<Building2 size={15} />} placeholder="e.g., Dhaka University" value={form.institute} onChange={(e) => updateField('institute', e.target.value)} />
                  </Field>
                  <Field label="Target Exam Date" required error={errors.targetDate}>
                    <Input icon={<Calendar size={15} />} type="date" value={form.targetDate} onChange={(e) => updateField('targetDate', e.target.value)} />
                  </Field>
                  <Field label="Preferred Exam Center City">
                    <Input icon={<Target size={15} />} placeholder="e.g., Dhaka, Chattogram" value={form.preferredCenter} onChange={(e) => updateField('preferredCenter', e.target.value)} />
                  </Field>
                  <Field label="How did you hear about us?">
                    <Select icon={<Sparkles size={15} />} value={form.hearAbout} onChange={(e) => updateField('hearAbout', e.target.value)}>
                      <option value="">Select an option</option>
                      {hearAboutOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </Select>
                  </Field>
                  <Field label="Additional Notes">
                    <Input icon={<BookOpen size={15} />} placeholder="Any specific requirements..." value={form.notes} onChange={(e) => updateField('notes', e.target.value)} />
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
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Save Profile
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* ── My Exams ────────────────────────────────────── */}
          <section className="bg-[#111318] border border-[#23262D] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#23262D] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#00E5B3]/10 text-[#00E5B3]">
                  <GraduationCap size={16} />
                </div>
                <div>
                  <h2 className="font-bold text-base text-[#F5F7FA]">My Exams</h2>
                  <p className="text-xs text-[#A1A8B3]">Select or remove the exams you're preparing for</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00E5B3] bg-[#00E5B3]/10 border border-[#00E5B3]/30 rounded-full px-3 py-1.5">
                <CheckCircle2 size={13} />
                {selectedIds.size} selected
              </span>
            </div>

            <div className="p-6 space-y-6">
              {/* Selected chips */}
              {selectedExams.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedExams.map((exam: any) => (
                    <span
                      key={exam._id}
                      className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full text-xs font-semibold bg-[#00E5B3]/10 border border-[#00E5B3]/30 text-[#00E5B3]"
                    >
                      {exam.name || 'Exam'}
                      <button
                        onClick={() => handleRemoveSelected(exam._id)}
                        disabled={isBusy}
                        className="p-0.5 rounded-full hover:bg-[#EB5757]/20 hover:text-[#EB5757] transition-colors disabled:opacity-50"
                        title="Remove exam"
                      >
                        {pendingExamId === exam._id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <X size={12} />
                        )}
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Exam cards */}
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
                        className={`
                          group relative text-left rounded-2xl overflow-hidden border transition-all duration-300
                          ${isSelected
                            ? 'border-[#00E5B3] ring-2 ring-[#00E5B3]/30 shadow-[0_0_20px_-5px_rgba(0,229,179,0.35)]'
                            : 'border-[#23262D] hover:border-[#323742] hover:-translate-y-0.5'}
                          disabled:opacity-70 disabled:cursor-not-allowed
                        `}
                      >
                        <div className={`relative h-20 bg-gradient-to-br ${gradient}`}>
                          <div className="absolute w-20 h-20 rounded-full bg-white/10 -top-8 -right-6" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className={`p-2.5 rounded-xl backdrop-blur-sm transition-all duration-300 ${isSelected ? 'bg-[#111318]/80 scale-105' : 'bg-white/10 group-hover:bg-white/20'}`}>
                              <BookOpen size={20} className={isSelected ? 'text-[#00E5B3]' : 'text-white'} />
                            </div>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2.5 right-2.5 bg-[#00E5B3] text-black rounded-full p-1 shadow-lg">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-sm text-[#F5F7FA] mb-1">{exam.name}</h3>
                          <p className="text-xs text-[#A1A8B3] line-clamp-2 mb-3 min-h-[32px]">{exam.description || 'Comprehensive preparation for this exam.'}</p>
                          <div className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${isSelected ? 'bg-[#00E5B3]/10 text-[#00E5B3] border border-[#00E5B3]/30' : 'bg-[#161920] text-[#A1A8B3] border border-[#23262D] group-hover:text-[#F5F7FA]'}`}>
                            {isPending ? (
                              <>
                                <Loader2 size={11} className="animate-spin" />
                                <span>Saving...</span>
                              </>
                            ) : isSelected ? (
                              <>
                                <Check size={11} strokeWidth={3} />
                                <span>Selected — click to remove</span>
                              </>
                            ) : (
                              <>
                                <Plus size={11} />
                                <span>Select Exam</span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* ── More Settings (placeholder) ─────────────────── */}
          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-3">More Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {moreGroups.map((group, index) => (
                <div
                  key={index}
                  className="bg-[#111318] border border-[#23262D] rounded-xl p-5 flex items-start gap-4 hover:border-[#323742] transition-all group"
                >
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
