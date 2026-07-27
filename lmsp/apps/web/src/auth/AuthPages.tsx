import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, CheckCircle2, BookOpen } from 'lucide-react';
import { useAppDispatch, useLoginMutation, useRegisterMutation, loginSuccess } from '@my-monorepo/store';
import { useNavigate } from 'react-router-dom';

// --- Shared Auth Layout Wrapper ---
interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  isLogin?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle, isLogin }) => {
  return (
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col lg:flex-row">
        
        {/* Left: Form Section */}
        <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-10">
            <div className="bg-[#10b981] p-1.5 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-black">
                <path d="M12 2l9 5.25v10.5L12 23l-9-5.25V7.25L12 2z" />
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-base text-slate-900 tracking-wide">বনীকা প্রস্তুতি</span>
              <span className="text-[9px] text-slate-500 font-medium">BanglaPrep</span>
            </div>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">{title}</h1>
            <p className="text-slate-500 text-sm">{subtitle}</p>
          </div>

          {/* Form Content Injection */}
          {children}

          {/* Bottom Link */}
          <div className="mt-auto pt-8 text-center text-sm text-slate-500">
            {isLogin ? (
              <>Don't have an account? <a href="#" className="font-bold text-[#10b981] hover:text-[#059669] transition-colors">Sign up here</a></>
            ) : (
              <>Already have an account? <a href="#" className="font-bold text-[#10b981] hover:text-[#059669] transition-colors">Log in</a></>
            )}
          </div>
        </div>

        {/* Right: Visual / Branding Section */}
        <div className="hidden lg:flex lg:w-[45%] bg-[#1e293b] p-12 flex-col justify-between text-white relative overflow-hidden">
          {/* Decorative gradients */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#10b981]/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#10b981]/20 p-2 rounded-xl">
                <BookOpen className="text-[#10b981]" size={24} />
              </div>
              <span className="font-bold text-lg">BCS & Govt Job Prep</span>
            </div>
            <h2 className="text-4xl font-bold leading-tight">
              Master your dream <br /> exam today.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Access thousands of quizzes, mock tests, and personalized learning paths tailored for Bangladesh's competitive exams.
            </p>
          </div>

          {/* Testimonial / Stats */}
          <div className="relative z-10 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex gap-2">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-white/20 border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                  <User size={14} />
                </div>
              ))}
            </div>
            <div>
              <p className="font-bold text-xl">12,000+</p>
              <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Active students preparing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- LOGIN COMPONENT ---
export const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [login, { isSuccess }] = useLoginMutation();

  const handelLogin = async (email: string, password: string) => {
    try {
      const data = await login({ email, password }).unwrap();
      console.log(data);
      
      // Adapt API response to match the User interface in types.ts
      const userInfo = {
        id: data.user._id,
        name: data.user.name || email.split('@')[0], // Fallback if name is missing in response
        email: data.user.email,
        role: 'student' as const,
      };

      // Store in userSlice
      dispatch(loginSuccess(userInfo));

      navigate("/on-boarding");
    } catch (error) {
      console.error("Login failed:", error);
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
        handelLogin(e.target.email.value, e.target.password.value)
      }}>
        
        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail size={18} />
            </div>
            <input 
            name='email'
              type="email" 
              placeholder="rahim@example.com" 
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all font-medium"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
            <a href="#" className="text-[11px] font-bold text-[#10b981] hover:text-[#059669] transition-colors">Forgot password?</a>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock size={18} />
            </div>
            <input 
             name='password' 
              type={showPassword ? "text" : "password"} 
              placeholder="Enter your password" 
              className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all font-medium"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Login Button */}
        <button className="w-full bg-[#10b981] text-white font-bold py-3.5 rounded-xl hover:bg-[#059669] transition-all shadow-md shadow-green-200/50 active:scale-[0.98] mt-2 flex items-center justify-center gap-2">
          Log In <ArrowRight size={18} />
        </button>
      
      </form>
    </AuthLayout>
  );
};

// --- SIGN UP COMPONENT ---
export const SignUp: React.FC = () => {
  const dispatch = useAppDispatch()
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [register] = useRegisterMutation()

  const handelCreateUser = async (email: string, password: string, name:string) => {
   const data = await register({email, password, name}).unwrap()
    console.log(data,'this sisa')
   

  }

  return (
    <AuthLayout 
      title="Create an Account" 
      subtitle="Join thousands of aspirants and start your journey today."
      isLogin={false}
    >
      <form className="space-y-4" onSubmit={(e) => {
        e.preventDefault(),
       console.log(e.target.email.value,e.target.password.value)
       handelCreateUser(e.target.email.value,e.target.password.value,e.target.name.value)
      }}>
        
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User size={18} />
            </div>
            <input 
            name="name"
              type="text" 
              placeholder="Md. Rahim Uddin" 
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all font-medium"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail size={18} />
            </div>
            <input 
            name="email"
              type="email" 
              placeholder="rahim@example.com" 
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all font-medium"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock size={18} />
            </div>
            <input 
            name="password"
              type={showPassword ? "text" : "password"} 
              placeholder="Create a strong password" 
              className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all font-medium"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="flex items-start gap-3 pt-1">
          <button
            type="button"
            onClick={() => setAgreed(!agreed)}
            className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
              agreed ? 'bg-[#10b981] border-[#10b981]' : 'border-slate-300 bg-white'
            }`}
          >
            {agreed && <CheckCircle2 size={14} className="text-white fill-current" />}
          </button>
          <p className="text-xs text-slate-500 leading-relaxed select-none">
            I agree to the <a href="#" className="font-bold text-slate-700 hover:text-[#10b981]">Terms of Service</a> and <a href="#" className="font-bold text-slate-700 hover:text-[#10b981]">Privacy Policy</a>
          </p>
        </div>

        {/* Sign Up Button */}
        <button className="w-full bg-[#10b981] text-white font-bold py-3.5 rounded-xl hover:bg-[#059669] transition-all shadow-md shadow-green-200/50 active:scale-[0.98] mt-2 flex items-center justify-center gap-2">
          Create Account <ArrowRight size={18} />
        </button>
      
      </form>
    </AuthLayout>
  );
};

export default { Login, SignUp };