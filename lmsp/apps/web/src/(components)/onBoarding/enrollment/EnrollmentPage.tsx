import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  User, Phone, Mail, Calendar, MapPin, Home, Building2,
  GraduationCap, Target, ArrowLeft, ArrowRight,
  ChevronRight, ChevronLeft, Check, Sparkles, BookOpen, 
  Clock, Send, AlertCircle, ShieldCheck, CreditCard, Globe,
  Landmark
} from 'lucide-react';
import { useAddUserInfoMutation, useAppSelector } from '@my-monorepo/store';
import { useSelectExamMutation } from '@my-monorepo/store/src/redux/api/examApi';

// ─── Bangladesh Districts & Divisions Data ───────────────────
const divisions = [
  'Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal',
  'Sylhet', 'Rangpur', 'Mymensingh'
];

const districtsByDivision: Record<string, string[]> = {
  'Dhaka': ['Dhaka', 'Faridpur', 'Gazipur', 'Gopalganj', 'Kishoreganj', 'Madaripur', 'Manikganj', 'Munshiganj', 'Narayanganj', 'Narsingdi', 'Rajbari', 'Shariatpur', 'Tangail'],
  'Chattogram': ['Bandarban', 'Brahmanbaria', 'Chandpur', 'Chattogram', 'Comilla', 'Cox\'s Bazar', 'Feni', 'Khagrachari', 'Lakshmipur', 'Noakhali', 'Rangamati'],
  'Rajshahi': ['Bogra', 'Joypurhat', 'Naogaon', 'Natore', 'Nawabganj', 'Pabna', 'Rajshahi', 'Sirajganj'],
  'Khulna': ['Bagerhat', 'Chuadanga', 'Jashore', 'Jhenaidah', 'Khulna', 'Kushtia', 'Magura', 'Meherpur', 'Narail', 'Sathkhira'],
  'Barishal': ['Barguna', 'Barishal', 'Bhola', 'Jhalokati', 'Patuakhali', 'Pirojpur'],
  'Sylhet': ['Habiganj', 'Moulvibazar', 'Sunamganj', 'Sylhet'],
  'Rangpur': ['Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 'Panchagarh', 'Rangpur', 'Thakurgaon'],
  'Mymensingh': ['Jamalpur', 'Mymensingh', 'Netrokona', 'Sherpur']
};

const educationLevels = [
  'SSC / O-Level', 'HSC / A-Level', 'Bachelor\'s (Honours)',
  'Bachelor\'s (Pass)', 'Master\'s', 'PhD', 'Diploma',
  'Other'
];

const hearAboutOptions = [
  'Facebook', 'YouTube', 'Google Search', 'Friend / Family',
  'Facebook Group', 'YouTube Channel', 'Educational Blog',
  'Newspaper', 'Other'
];

// ─── Helper: BD Phone Validation ─────────────────────────────
const isValidBDPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[\s-]/g, '');
  return /^(\+?880)?1[3-9]\d{8}$/.test(cleaned);
};

const formatBDPhone = (phone: string): string => {
  const cleaned = phone.replace(/[\s-]/g, '');
  if (cleaned.startsWith('+880')) return cleaned;
  if (cleaned.startsWith('880')) return `+${cleaned}`;
  if (cleaned.startsWith('01')) return `+880${cleaned.slice(1)}`;
  return phone;
};

// ─── Step Indicator Component ────────────────────────────────
const steps = [
  { num: 1, label: 'Personal Info', icon: User },
  { num: 2, label: 'Address', icon: MapPin },
  { num: 3, label: 'Education & Date', icon: GraduationCap },
  { num: 4, label: 'Review & Confirm', icon: ShieldCheck },
];

const StepIndicator = ({ currentStep }: { currentStep: number }) => (
  <div className="w-full max-w-3xl mx-auto mb-8 md:mb-12">
    {/* Desktop: horizontal steps */}
    <div className="hidden md:flex items-center justify-between">
      {steps.map((step, i) => {
        const StepIcon = step.icon;
        const isCompleted = currentStep > step.num;
        const isCurrent = currentStep === step.num;
        return (
          <React.Fragment key={step.num}>
            <div className="flex flex-col items-center">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center
                transition-all duration-500 font-bold text-sm relative
                ${isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200/50' : ''}
                ${isCurrent ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-200/50 ring-4 ring-emerald-100' : ''}
                ${!isCompleted && !isCurrent ? 'bg-slate-100 text-slate-400' : ''}
              `}>
                {isCompleted ? <Check size={18} strokeWidth={3} /> : <StepIcon size={18} />}
              </div>
              <span className={`
                text-xs font-semibold mt-2 transition-colors duration-300
                ${isCompleted || isCurrent ? 'text-emerald-700' : 'text-slate-400'}
              `}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-4 relative">
                <div className="absolute inset-0 bg-slate-200 rounded-full" />
                <div className={`
                  absolute inset-y-0 left-0 bg-emerald-400 rounded-full
                  transition-all duration-500
                  ${isCompleted ? 'w-full' : 'w-0'}
                `} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>

    {/* Mobile: compact progress */}
    <div className="md:hidden flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
          {currentStep}
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 font-medium">Step {currentStep} of {steps.length}</span>
          <span className="text-sm font-bold text-slate-800">{steps[currentStep - 1]?.label}</span>
        </div>
      </div>
      <div className="flex gap-1.5">
        {steps.map((_, i) => (
          <div key={i} className={`
            w-2 h-2 rounded-full transition-all duration-300
            ${i + 1 === currentStep ? 'w-6 bg-emerald-500' : ''}
            ${i + 1 < currentStep ? 'bg-emerald-300' : ''}
            ${i + 1 > currentStep ? 'bg-slate-200' : ''}
          `} />
        ))}
      </div>
    </div>
  </div>
);

// ─── Top Navigation ──────────────────────────────────────────
const TopNav = ({ onBack }: { onBack?: () => void }) => (
  <nav className="flex items-center justify-between w-full bg-[#0f172a] px-6 py-4 text-white font-sans border-b border-[#1e293b] shadow-lg shadow-black/10">
    <div className="flex items-center gap-3">
      {onBack && (
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl transition-colors mr-1">
          <ArrowLeft size={18} />
        </button>
      )}
      <div className="flex items-center gap-3 group cursor-pointer">
        <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white">
            <path d="M12 2l9 5.25v10.5L12 23l-9-5.25V7.25L12 2z" />
          </svg>
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-bold text-sm tracking-wide text-white/90">বনীকা প্রস্তুতি</span>
          <span className="text-[9px] text-gray-500 tracking-widest uppercase">BanglaPrep</span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5">
      <Sparkles size={12} className="text-emerald-400" />
      <span className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wider">Enrollment</span>
    </div>
  </nav>
);

// ─── Form Field Components ───────────────────────────────────
interface FieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

const FormField = ({ label, error, required, children }: FieldProps) => (
  <div className="space-y-1.5">
    <label className="block text-md font-semibold text-slate-700 tracking-wide">
      {label}
      {required && <span className="text-rose-500 ml-1">*</span>}
    </label>
    {children}
    {error && (
      <p className="flex items-center gap-1 text-[11px] text-rose-500 font-medium mt-1">
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
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
      )}
      <input
        ref={ref}
        {...props}
        className={`
          w-full px-4 py-3 rounded-xl border border-slate-200 bg-white
          text-[16px] text-slate-800 placeholder:text-slate-400
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400
          hover:border-slate-300
          disabled:bg-slate-50 disabled:text-slate-500
          ${icon ? 'pl-10' : ''}
          ${props.disabled ? 'opacity-60 cursor-not-allowed' : ''}
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
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
          {icon}
        </div>
      )}
      <select
        ref={ref}
        {...props}
        className={`
          w-full px-4 py-3 rounded-xl border border-slate-200 bg-white
          text-sm text-slate-800
          transition-all duration-200 appearance-none
          focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400
          hover:border-slate-300
          disabled:bg-slate-50 disabled:text-slate-500
          ${icon ? 'pl-10' : ''}
          ${props.disabled ? 'opacity-60 cursor-not-allowed' : ''}
          ${className}
        `}
      >
        {children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <ChevronRight size={14} className="rotate-90" />
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
        w-full px-4 py-3 rounded-xl border border-slate-200 bg-white
        text-sm text-slate-800 placeholder:text-slate-400 resize-none
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400
        hover:border-slate-300
        disabled:bg-slate-50 disabled:text-slate-500
        ${className}
      `}
    />
  )
);
TextArea.displayName = 'TextArea';

// ─── Floating Background Decorations ─────────────────────────
const BackgroundDecorations = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
    <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-teal-200/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-indigo-200/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
    <div className="absolute top-1/3 left-2/3 w-64 h-64 bg-gradient-to-br from-violet-100/15 to-fuchsia-100/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
    <svg className="absolute top-0 left-0 w-full h-full opacity-[0.012]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dots2" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.5" fill="#6366f1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots2)" />
    </svg>
  </div>
);

// ─── Main Component ──────────────────────────────────────────
type FormData = {
  // Step 1: Personal
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  // Step 2: Address
  division: string;
  district: string;
  thana: string;
  village: string;
  postCode: string;
  fullAddress: string;
  // Step 3: Education & Target
  education: string;
  institute: string;
  targetDate: string;
  preferredCenter: string;
  hearAbout: string;
  notes: string;
  // Step 4: Terms
  agreed: boolean;
};

const initialFormData: FormData = {
  fullName: '', phone: '', email: '', dateOfBirth: '',
  division: '', district: '', thana: '', village: '', postCode: '', fullAddress: '',
  education: '', institute: '', targetDate: '', preferredCenter: '', hearAbout: '', notes: '',
  agreed: false,
};

export default function EnrollmentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedExams = (location.state as any)?.selectedIds || [];
  const [addUserInfo] = useAddUserInfoMutation()
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userState =useAppSelector((state)=>state.user?.user?._id || '6a5ee4291fda2cffc2eafca3')
  console.log(userState,'this is user state')
  const [selectExam] = useSelectExamMutation()

  const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => prev[field] ? { ...prev, [field]: undefined } : prev);
  }, []);

  // ─── Validation ──────────────────────────────────────────
  const validateStep = (s: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (s === 1) {
           
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      // else if (!isValidBDPhone(formData.phone)) newErrors.phone = 'Enter a valid BD number (e.g., 017XXXXXXXX)';
      
          }
    
    if (s === 2) {
      if (!formData.division) newErrors.division = 'Select your division';
      if (!formData.district) newErrors.district = 'Select your district';
      if (!formData.thana.trim()) newErrors.thana = 'Thana/Upazila is required';
      if (!formData.postCode.trim()) newErrors.postCode = 'Post code is required';
      else if (!/^\d{4}$/.test(formData.postCode)) newErrors.postCode = 'Post code must be 4 digits';
    }
    
    if (s === 3) {
      if (!formData.education) newErrors.education = 'Select your educational qualification';
      if (!formData.targetDate) newErrors.targetDate = 'Please select your target exam date';
      else if (new Date(formData.targetDate) < new Date()) newErrors.targetDate = 'Target date must be in the future';
    }
    
    if (s === 4) {
      if (!formData.agreed) newErrors.agreed = 'You must agree to the terms to proceed';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Navigation ──────────────────────────────────────────
  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (step > 1 && step <= 4) {
      setStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/on-boarding');
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    setIsSubmitting(true);

    const demoId= '6a5ee4291fda2cffc2eafca3'

  const payloadData = {
   userId:demoId,
   examId:selectedExams,
    ...formData
    }
    console.log('Payload Data:', payloadData);
    const res1 = await selectExam(payloadData)
    // const res = await addUserInfo({id:demoId, data:payloadData})
    console.log('Form Data:', res1);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setStep(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToDashboard = () => {
    console.log('Form Data:', formData);
    console.log('Selected Exam IDs:', selectedExams);
    navigate('/');
  };

  // ─── Render Functions for Each Step ──────────────────────
  const renderStep1 = () => (
    <div className="animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-full border border-blue-200/60 mb-4">
          <User size={11} />
          <span>Step 1 of 4</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">Personal Information</h2>
        <p className="text-sm text-slate-500">Tell us about yourself so we can create your enrollment profile</p>
      </div>

      <div className="max-w-xl mx-auto space-y-5">
       

        <FormField label="Phone Number (মোবাইল নম্বর)" required error={errors.phone}>
          <Input
            icon={<Phone size={16} />}
            placeholder="e.g., 017XXXXXXXX"
            value={formData.phone}
            onChange={e => updateField('phone', e.target.value)}
            type="tel"
          />
          <p className="text-[10px] text-slate-400 mt-1">BD mobile number with 11 digits (e.g., 01712345678)</p>
        </FormField>

      

        <FormField label="Date of Birth (জন্ম তারিখ)">
          <Input
            icon={<Calendar size={16} />}
            type="date"
            value={formData.dateOfBirth}
            onChange={e => updateField('dateOfBirth', e.target.value)}
          />
        </FormField>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-200/60 mb-4">
          <MapPin size={11} />
          <span>Step 2 of 4</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">Address & Location</h2>
        <p className="text-sm text-slate-500">Where are you located? We'll use this for exam center suggestions</p>
      </div>

      <div className="max-w-xl mx-auto space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Division (বিভাগ)" required error={errors.division}>
            <Select
              icon={<Building2 size={16} />}
              value={formData.division}
              onChange={e => { updateField('division', e.target.value); updateField('district', ''); }}
            >
              <option value="">Select Division</option>
              {divisions.map(d => <option key={d} value={d}>{d}</option>)}
            </Select>
          </FormField>

          <FormField label="District (জেলা)" required error={errors.district}>
            <Select
              icon={<Landmark size={16} />}
              value={formData.district}
              onChange={e => updateField('district', e.target.value)}
              disabled={!formData.division}
            >
              <option value="">Select District</option>
              {(districtsByDivision[formData.division] || []).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Thana / Upazila (থানা)" required error={errors.thana}>
            <Input
              icon={<MapPin size={16} />}
              placeholder="e.g., Mirpur, Sadar"
              value={formData.thana}
              onChange={e => updateField('thana', e.target.value)}
            />
          </FormField>

          <FormField label="Post Code (পোস্ট কোড)" required error={errors.postCode}>
            <Input
              icon={<Mail size={16} />}
              placeholder="e.g., 1216"
              value={formData.postCode}
              onChange={e => updateField('postCode', e.target.value)}
              maxLength={4}
            />
          </FormField>
        </div>

        <FormField label="Village / Area (গ্রাম/এলাকা)">
          <Input
            icon={<Home size={16} />}
            placeholder="e.g., Bashundhara R/A, Section-13"
            value={formData.village}
            onChange={e => updateField('village', e.target.value)}
          />
        </FormField>

        <FormField label="Full Address (পূর্ণ ঠিকানা)">
          <TextArea
            placeholder="Write your complete address including landmarks..."
            rows={3}
            value={formData.fullAddress}
            onChange={e => updateField('fullAddress', e.target.value)}
          />
        </FormField>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 text-[10px] font-bold px-3 py-1 rounded-full border border-violet-200/60 mb-4">
          <GraduationCap size={11} />
          <span>Step 3 of 4</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">Education & Target Date</h2>
        <p className="text-sm text-slate-500">Help us personalize your learning journey</p>
      </div>

      <div className="max-w-xl mx-auto space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Educational Qualification" required error={errors.education}>
            <Select
              icon={<GraduationCap size={16} />}
              value={formData.education}
              onChange={e => updateField('education', e.target.value)}
            >
              <option value="">Select Qualification</option>
              {educationLevels.map(edu => <option key={edu} value={edu}>{edu}</option>)}
            </Select>
          </FormField>

          <FormField label="Current / Last Institute">
            <Input
              icon={<Building2 size={16} />}
              placeholder="e.g., Dhaka University"
              value={formData.institute}
              onChange={e => updateField('institute', e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="Target Exam Date" required error={errors.targetDate}>
          <Input
            icon={<Calendar size={16} />}
            type="date"
            value={formData.targetDate}
            onChange={e => updateField('targetDate', e.target.value)}
          />
          <p className="text-[10px] text-slate-400 mt-1">When do you plan to appear for the exam?</p>
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Preferred Exam Center City">
            <Input
              icon={<Globe size={16} />}
              placeholder="e.g., Dhaka, Chattogram"
              value={formData.preferredCenter}
              onChange={e => updateField('preferredCenter', e.target.value)}
            />
          </FormField>

          <FormField label="How did you hear about us?">
            <Select
              icon={<Target size={16} />}
              value={formData.hearAbout}
              onChange={e => updateField('hearAbout', e.target.value)}
            >
              <option value="">Select an option</option>
              {hearAboutOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </Select>
          </FormField>
        </div>

        <FormField label="Additional Notes (if any)">
          <TextArea
            placeholder="Any specific requirements, questions, or comments..."
            rows={2}
            value={formData.notes}
            onChange={e => updateField('notes', e.target.value)}
          />
        </FormField>
      </div>
    </div>
  );

  const renderStep4 = () => {
    return (
      <div className="animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-200/60 mb-4">
            <ShieldCheck size={11} />
            <span>Step 4 of 4</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">Review & Confirm</h2>
          <p className="text-sm text-slate-500">Please review all your information before submitting</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Personal Info Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-3 border-b border-blue-100/50">
              <div className="flex items-center gap-2">
                <User size={14} className="text-blue-600" />
                <span className="font-bold text-sm text-blue-800">Personal Information</span>
              </div>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Full Name</span>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{formData.fullName || '—'}</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Phone</span>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{formData.phone ? formatBDPhone(formData.phone) : '—'}</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Email</span>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{formData.email || '—'}</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Date of Birth</span>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{formData.dateOfBirth || '—'}</p>
              </div>
            </div>
          </div>

          {/* Address Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-3 border-b border-amber-100/50">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-amber-600" />
                <span className="font-bold text-sm text-amber-800">Address & Location</span>
              </div>
            </div>
            <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Division</span>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{formData.division || '—'}</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">District</span>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{formData.district || '—'}</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Thana</span>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{formData.thana || '—'}</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Post Code</span>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{formData.postCode || '—'}</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Area/Village</span>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{formData.village || '—'}</p>
              </div>
              <div className="col-span-2 md:col-span-3">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Full Address</span>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{formData.fullAddress || '—'}</p>
              </div>
            </div>
          </div>

          {/* Education & Target Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-5 py-3 border-b border-violet-100/50">
              <div className="flex items-center gap-2">
                <GraduationCap size={14} className="text-violet-600" />
                <span className="font-bold text-sm text-violet-800">Education & Target</span>
              </div>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Qualification</span>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{formData.education || '—'}</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Institute</span>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{formData.institute || '—'}</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Target Exam Date</span>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{formData.targetDate || '—'}</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Preferred Center</span>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{formData.preferredCenter || '—'}</p>
              </div>
            </div>
          </div>

          {/* Selected Exams Summary */}
          {selectedExams.length > 0 && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={14} className="text-emerald-600" />
                <span className="font-bold text-sm text-emerald-800">Selected Exams ({selectedExams.length})</span>
              </div>
              <p className="text-sm text-emerald-700">You've selected {selectedExams.length} exam(s) to prepare for.</p>
            </div>
          )}

          {/* Payment Info Placeholder */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard size={14} className="text-amber-600" />
              <span className="font-bold text-sm text-amber-800">Course Fee & Payment</span>
            </div>
            <p className="text-sm text-amber-700 mb-1">
              Course fee: <span className="font-bold">বাংলাদেশী টাকা</span>
            </p>
            <p className="text-xs text-amber-600">
              Payment details will be shared after enrollment confirmation. You can pay via bKash, Nagad, Rocket, or Bank Transfer.
            </p>
          </div>

          {/* Terms */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.agreed}
                onChange={e => updateField('agreed', e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-400 focus:ring-offset-0"
              />
              <div>
                <span className="text-sm text-slate-700 font-medium">
                  I confirm that all the information provided above is accurate and I agree to the{' '}
                  <span className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2">Terms & Conditions</span>
                  {' '}and{' '}
                  <span className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2">Privacy Policy</span>.
                </span>
                {errors.agreed && (
                  <p className="flex items-center gap-1 text-[11px] text-rose-500 font-medium mt-1">
                    <AlertCircle size={11} />
                    {errors.agreed}
                  </p>
                )}
              </div>
            </label>
          </div>
        </div>
      </div>
    );
  };

  const renderSuccess = () => (
    <div className="animate-fade-in-up flex flex-col items-center justify-center py-12 md:py-20">
      {/* Success Animation */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-200/50">
          <Check size={44} strokeWidth={3} className="text-white animate-scale-check" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-200/40 animate-bounce-in" style={{ animationDelay: '0.3s' }}>
          <Sparkles size={16} className="text-white" />
        </div>
      </div>

      <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 text-center">
        Enrollment Submitted! 🎉
      </h2>
      <p className="text-slate-500 text-center max-w-md mb-8">
        Thank you, <span className="font-bold text-slate-700">{formData.fullName}</span>! 
        Your enrollment has been received. We'll contact you at{' '}
        <span className="font-bold text-slate-700">{formData.phone}</span> or{' '}
        <span className="font-bold text-slate-700">{formData.email}</span> with next steps.
      </p>

      {/* What happens next */}
      <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
        <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2">
          <Clock size={14} className="text-emerald-500" />
          What happens next?
        </h3>
        <div className="space-y-3">
          {[
            { icon: Phone, text: 'Our team will call you within 24 hours for confirmation', color: 'text-blue-500', bg: 'bg-blue-50' },
            { icon: Mail, text: 'You\'ll receive course access details via email/SMS', color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { icon: BookOpen, text: 'Your personalized study plan will be created based on your target date', color: 'text-violet-500', bg: 'bg-violet-50' },
            { icon: Target, text: 'We\'ll match you with the best preparation resources for your exams', color: 'text-amber-500', bg: 'bg-amber-50' },
          ].map((item, i) => {
            const ItemIcon = item.icon;
            return (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                  <ItemIcon size={14} className={item.color} />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pt-1.5">{item.text}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dashboard Button */}
      <button
        onClick={handleGoToDashboard}
        className="
          inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm
          bg-gradient-to-r from-emerald-500 to-emerald-600 text-white
          shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-200/60
          hover:from-emerald-600 hover:to-emerald-700
          transition-all duration-300 active:scale-95
        "
      >
        <BookOpen size={16} />
        Go to Dashboard
        <ArrowRight size={16} />
      </button>
    </div>
  );

  // ─── Step Renderer ───────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderSuccess();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-sans flex flex-col relative">
      <BackgroundDecorations />
      <TopNav onBack={step > 1 && step <= 4 ? handleBack : undefined} />

      <main className="flex-1 max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 w-full flex flex-col">
        {/* Step Indicator */}
        {step <= 4 && <StepIndicator currentStep={step} />}

        {/* Step Content */}
        <div className="flex-1">
          {renderStep()}
        </div>

        {/* Navigation Buttons (only for steps 1-4) */}
        {step <= 4 && (
          <div className="flex items-center justify-between mt-10 md:mt-12 pt-6 border-t border-slate-100">
            {/* Back */}
            <button
              onClick={handleBack}
              className="
                inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm
                text-slate-600 hover:text-slate-800 bg-white border border-slate-200
                hover:border-slate-300 hover:bg-slate-50
                transition-all duration-200 active:scale-95
              "
            >
              <ChevronLeft size={16} />
              {step > 1 ? `Back: ${steps[step - 2]?.label || ''}` : 'Back to Exams'}
            </button>

            {/* Next / Submit */}
            {step < 4 ? (
              <button
                onClick={handleNext}
                className="
                  inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm
                  bg-gradient-to-r from-emerald-500 to-emerald-600 text-white
                  shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-200/60
                  hover:from-emerald-600 hover:to-emerald-700
                  transition-all duration-300 active:scale-95
                "
              >
                Next: {steps[step]?.label || ''}
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="
                  inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm
                  bg-gradient-to-r from-emerald-500 to-emerald-600 text-white
                  shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-200/60
                  hover:from-emerald-600 hover:to-emerald-700
                  transition-all duration-300 active:scale-95
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Confirm & Submit
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </main>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { transform: scale(1.1); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes scale-check {
          0% { transform: scale(0) rotate(-45deg); }
          60% { transform: scale(1.2) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out both; }
        .animate-bounce-in { animation: bounce-in 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) both; }
        .animate-scale-check { animation: scale-check 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) both; }
      `}</style>
    </div>
  );
}
