import React, { useState } from 'react';
import {
  Mail, Lock, Eye, EyeOff, User, ArrowRight,
  CheckCircle2, BookOpen, Sparkles, AlertTriangle, X,
  Loader2, // Spinner icon
} from 'lucide-react';
import {
  useAppDispatch, useLoginMutation, useRegisterMutation,
  useForgotPasswordMutation, useResetPasswordMutation,
  loginSuccess, setAuthToken,
} from '@my-monorepo/store';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { persistAuth } from './AuthInitializer';

// ---------- BrainForge Dark Themed Auth Layout ----------
interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  isLogin?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle, isLogin }) => {
  return (
    <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-5xl bg-[#111318] rounded-3xl border border-[#23262D] overflow-hidden flex flex-col lg:flex-row shadow-2xl shadow-black/20">
        
        {/* Left: Form Section */}
        <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col relative">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-[#00E5B3]/5 rounded-full blur-3xl pointer-events-none" />
          
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className=" ">
              <img src="/logo1.png" className="w-36 object-cover" alt="Geneseon" />
            </div>
            <div className="flex flex-col leading-none">
              {/* <span className="font-bold text-base text-[#F5F7FA] tracking-wide">Geneseon</span> */}
              {/* <span className="text-[9px] text-[#A1A8B3] font-medium">BanglaPrep</span> */}
            </div>
          </div>

          <div className="mb-10 relative z-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#F5F7FA] tracking-tight mb-2">{title}</h1>
            <p className="text-[#A1A8B3] text-sm">{subtitle}</p>
          </div>

          {/* Form Content */}
          {children}

          {/* Bottom Link */}
          <div className="mt-auto pt-8 text-center text-sm text-[#A1A8B3] relative z-10">
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-[#00E5B3] hover:text-[#00C298] transition-colors">
                  Sign up here
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-[#00E5B3] hover:text-[#00C298] transition-colors">
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Right: Visual / Branding Section */}
        <div className="hidden lg:flex lg:w-[45%] bg-[#161920] p-12 flex-col justify-between text-white relative overflow-hidden border-l border-[#23262D]">
          {/* Decorative gradients */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#00E5B3]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#2F80ED]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#00E5B3]/10 border border-[#00E5B3]/30 p-2 rounded-xl">
                <BookOpen className="text-[#00E5B3]" size={24} />
              </div>
              {/* <span className="font-bold text-lg text-[#F5F7FA]">BCS & Govt Job Prep</span> */}
            </div>
            <h2 className="text-4xl font-bold leading-tight text-[#F5F7FA]">
              Master your dream <br /> exam today.
            </h2>
            <p className="text-[#A1A8B3] text-sm leading-relaxed max-w-sm">
              Access thousands of quizzes, mock tests, and personalized learning paths tailored for Bangladesh's competitive exams.
            </p>
          </div>

          {/* Stats / Testimonial */}
          <div className="relative z-10 bg-[#111318] border border-[#23262D] rounded-2xl p-6 space-y-4">
            <div className="flex gap-2">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-[#2F80ED]/10 border border-[#2F80ED]/30 flex items-center justify-center text-xs font-bold text-[#2F80ED]">
                  <User size={14} />
                </div>
              ))}
            </div>
            <div>
              <p className="font-bold text-xl text-[#F5F7FA]">12,000+</p>
              <p className="text-[#A1A8B3] text-[10px] font-medium uppercase tracking-wider">Active students preparing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Dark Themed Input Component ----------
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ReactNode;
  rightElement?: React.ReactNode;
}

const FormInput: React.FC<FormInputProps> = ({ icon, rightElement, className = '', ...props }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A1A8B3]">
      {icon}
    </div>
    <input
      {...props}
      className={`
        w-full pl-10 pr-4 py-3 bg-[#161920] border border-[#23262D] rounded-xl
        text-sm text-[#F5F7FA] placeholder:text-[#6B7280]
        focus:outline-none focus:ring-2 focus:ring-[#00E5B3]/30 focus:border-[#00E5B3]
        transition-all font-medium
        ${rightElement ? 'pr-12' : ''}
        ${className}
      `}
    />
    {rightElement && (
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
        {rightElement}
      </div>
    )}
  </div>
);

// ---------- Dark Themed Button ----------
const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }> = ({ children, ...props }) => (
  <button
    {...props}
    className="w-full bg-[#00E5B3] text-black font-bold py-3.5 rounded-xl hover:bg-[#00C298] transition-all shadow-lg shadow-[#00E5B3]/25 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
  >
    {children}
  </button>
);

// ---------- LOGIN COMPONENT ----------
export const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [login, { isLoading }] = useLoginMutation(); // isLoading flag

  const handleLogin = async (email: string, password: string) => {
    setErrorMessage(null);
    try {
      const data = await login({ email, password }).unwrap();
      
      const userInfo = {
        _id: data.user._id,
        name: data.user.name || email.split('@')[0],
        email: data.user.email,
        role: data.user.role || 'student',
      };

      setAuthToken(data.token);
      persistAuth(data.token, userInfo);
      dispatch(loginSuccess(userInfo));

      const from = (location.state as any)?.from || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
      const message = (error as any)?.data?.message;
      setErrorMessage(
        message || 'Login failed. Please check your credentials and try again.'
      );
    }
  };

  return (
    <AuthLayout 
      title="Welcome back!" 
      subtitle="Log in to your account to continue your preparation."
      isLogin={true}
    >
      <form className="space-y-5" onSubmit={(e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        handleLogin(form.email.value, form.password.value);
      }}>

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="relative z-10 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 animate-in"
          >
            <AlertTriangle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-400 mb-0.5">Login Failed</p>
              <p className="text-xs text-red-300/80 leading-relaxed">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              aria-label="Dismiss error"
              className="text-red-400/60 hover:text-red-300 transition-colors flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        )}
        
        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-[#A1A8B3] mb-1.5 uppercase tracking-wider">Email Address</label>
          <FormInput
            name="email"
            type="email"
            placeholder="rahim@example.com"
            icon={<Mail size={18} />}
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-bold text-[#A1A8B3] uppercase tracking-wider">Password</label>
            <Link to="/forgot-password" className="text-[11px] font-bold text-[#00E5B3] hover:text-[#00C298] transition-colors">
              Forgot password?
            </Link>
          </div>
          <FormInput
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            icon={<Lock size={18} />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#A1A8B3] hover:text-[#F5F7FA] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
        </div>

        {/* Submit Button with Loading Spinner */}
        <PrimaryButton type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Logging in...
            </>
          ) : (
            <>
              Log In <ArrowRight size={18} />
            </>
          )}
        </PrimaryButton>
      
      </form>
    </AuthLayout>
  );
};

// ---------- SIGN UP COMPONENT ----------
export const SignUp: React.FC = () => {
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [register, { isLoading }] = useRegisterMutation(); // isLoading flag
  const navigate = useNavigate();

  const handleCreateUser = async (email: string, password: string, name: string) => {
    try {
      const data = await register({ email, password, name }).unwrap();
      
      const userInfo = {
        _id: data.user._id,
        name: data.user.name || name,
        email: data.user.email,
        role: data.user.role || 'student',
      };

      setAuthToken(data.token);
      persistAuth(data.token, userInfo);
      dispatch(loginSuccess(userInfo));

      // First-time users land on the onboarding page (AuthGuard redirects them there)
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Registration failed:', error);
      // You could add an error state here if desired
    }
  };

  return (
    <AuthLayout 
      title="Create an Account" 
      subtitle="Join thousands of aspirants and start your journey today."
      isLogin={false}
    >
      <form className="space-y-4" onSubmit={(e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        handleCreateUser(form.email.value, form.password.value, form.name.value);
      }}>
        
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-[#A1A8B3] mb-1.5 uppercase tracking-wider">Full Name</label>
          <FormInput
            name="name"
            type="text"
            placeholder="Md. Rahim Uddin"
            icon={<User size={18} />}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-[#A1A8B3] mb-1.5 uppercase tracking-wider">Email Address</label>
          <FormInput
            name="email"
            type="email"
            placeholder="rahim@example.com"
            icon={<Mail size={18} />}
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-[#A1A8B3] mb-1.5 uppercase tracking-wider">Password</label>
          <FormInput
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            icon={<Lock size={18} />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#A1A8B3] hover:text-[#F5F7FA] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
        </div>

        {/* Terms & Conditions */}
        <div className="flex justify-center items-start gap-3 pt-1">
          <button
            type="button"
            onClick={() => setAgreed(!agreed)}
            className={` w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
              agreed
                ? 'bg-[#00E5B3] border-[#00E5B3]'
                : 'border-[#323742] bg-[#161920]'
            }`}
          >
            {agreed && <CheckCircle2 size={14} className="text-black" />}
          </button>
          <p className="text-xs text-[#A1A8B3] leading-relaxed select-none">
            I agree to the{' '}
            <a href="#" className="font-bold text-[#F5F7FA] hover:text-[#00E5B3] transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="font-bold text-[#F5F7FA] hover:text-[#00E5B3] transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>

        {/* Submit Button with Loading Spinner */}
        <PrimaryButton type="submit" disabled={!agreed || isLoading}>
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create Account <ArrowRight size={18} />
            </>
          )}
        </PrimaryButton>
      
      </form>
    </AuthLayout>
  );
};

// ---------- FORGOT PASSWORD COMPONENT ----------
export const ForgotPassword: React.FC = () => {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email.trim()) {
      setErrorMessage('Please enter your email address');
      return;
    }
    try {
      await forgotPassword({ email }).unwrap();
      setSent(true);
    } catch (error) {
      setErrorMessage(
        (error as any)?.data?.message || 'Something went wrong. Please try again.'
      );
    }
  };

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset link."
    >
      {sent ? (
        <div className="flex items-start gap-3 bg-[#00E5B3]/10 border border-[#00E5B3]/30 rounded-xl p-4">
          <CheckCircle2 size={18} className="text-[#00E5B3] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-[#00E5B3] mb-0.5">Check your inbox</p>
            <p className="text-xs text-[#A1A8B3] leading-relaxed">
              If an account exists for that email, a password reset link has been sent.
            </p>
          </div>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          {errorMessage && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <AlertTriangle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-300/80 leading-relaxed flex-1">{errorMessage}</p>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-[#A1A8B3] mb-1.5 uppercase tracking-wider">Email Address</label>
            <FormInput
              type="email"
              placeholder="rahim@example.com"
              icon={<Mail size={18} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <PrimaryButton type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Send Reset Link <ArrowRight size={18} />
              </>
            )}
          </PrimaryButton>
        </form>
      )}
    </AuthLayout>
  );
};

// ---------- RESET PASSWORD COMPONENT ----------
export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const form = e.target as HTMLFormElement;
    const newPassword = form.password.value;
    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }
    if (!token) {
      setErrorMessage('This reset link is invalid. Please request a new one.');
      return;
    }
    try {
      await resetPassword({ token, email, newPassword }).unwrap();
      setDone(true);
    } catch (error) {
      setErrorMessage(
        (error as any)?.data?.message || 'Unable to reset password. Please try again.'
      );
    }
  };

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a strong password for your account."
    >
      {done ? (
        <div className="flex items-start gap-3 bg-[#00E5B3]/10 border border-[#00E5B3]/30 rounded-xl p-4">
          <CheckCircle2 size={18} className="text-[#00E5B3] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-[#00E5B3] mb-0.5">Password updated</p>
            <p className="text-xs text-[#A1A8B3] leading-relaxed">You can now sign in with your new password.</p>
          </div>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          {errorMessage && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <AlertTriangle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-300/80 leading-relaxed flex-1">{errorMessage}</p>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-[#A1A8B3] mb-1.5 uppercase tracking-wider">New Password</label>
            <FormInput
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 6 characters"
              icon={<Lock size={18} />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#A1A8B3] hover:text-[#F5F7FA] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
          </div>
          <PrimaryButton type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Updating...
              </>
            ) : (
              <>
                Update Password <ArrowRight size={18} />
              </>
            )}
          </PrimaryButton>
        </form>
      )}
    </AuthLayout>
  );
};

export default { Login, SignUp, ForgotPassword, ResetPassword };