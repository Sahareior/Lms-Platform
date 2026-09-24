import React, { useState } from 'react';
import {
  Mail, Lock, Eye, EyeOff, User, ArrowRight, ArrowLeft,
  CheckCircle2, Sparkles, AlertTriangle, X,
  Loader2, Zap, Award, Star, ShieldCheck,
} from 'lucide-react';
import {
  useAppDispatch, useLoginMutation, useRegisterMutation,
  useForgotPasswordMutation, useResetPasswordMutation,
  loginSuccess, setAuthToken, useGoogleSignInMutation,
} from '@my-monorepo/store';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { persistAuth } from './AuthInitializer';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@my-firebase/Firebase';
import { useTheme } from '../theme/ThemeContext';


// ---------- Shared Theme-Aware Label ----------
const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDark } = useTheme();
  return (
    <label
      className={`block text-xs ${
        isDark
          ? 'font-medium text-[#A1A8B3]'
          : 'font-black text-[#1a1a1a] font-serif uppercase tracking-wider'
      }`}
    >
      {children}
    </label>
  );
};

// ---------- Auth Layout ----------
interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  isLogin?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle, isLogin }) => {
  const { isDark } = useTheme();

  // ─── LIGHT MODE ───
  if (!isDark) {
    return (
      <div
        className="min-h-screen bg-[#e8e4db] flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 font-sans relative overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(#d8d4cb 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        <div className="w-full max-w-5xl bg-[#f2efe9] rounded-lg border-2 border-[#1a1a1a] overflow-hidden flex flex-col lg:flex-row shadow-[6px_6px_0px_0px_#1a1a1a]">
          {/* Left: Form Section */}
          <div className="flex-1 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col relative justify-between">
            <div>
              <div className="flex items-center justify-between gap-4 md:mb-3 mb-6">
                <Link to="/" className="inline-flex items-center gap-2 group">
                    {
                  isDark? (<img className="md:h-20 h-16 w-auto object-contain" src="/logo1.png" alt="" />):(<img className="md:h-20 h-16 w-auto object-contain" src="/d.png" alt="" />)
                }
                  {/* <img src="/logo1.png" className="md:h-20 h-16 w-auto object-contain" alt="Geneseon" /> */}
                </Link>
                <Link
                  to="/"
                  className="text-xs text-[#1a1a1a] hover:bg-[#e0dcd5] inline-flex items-center gap-1.5 transition-colors py-1.5 px-3 rounded-md border-2 border-[#1a1a1a] font-serif font-black shadow-[1px_1px_0px_0px_#1a1a1a]"
                >
                  <ArrowLeft size={14} />
                  <span>Home</span>
                </Link>
              </div>

              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-black text-[#1a1a1a] tracking-tight mb-1.5 font-serif">
                  {title}
                </h1>
                <p className="text-[#333] text-[14px] sm:text-sm leading-relaxed font-serif">
                  {subtitle}
                </p>
              </div>

              {children}
            </div>

            {isLogin !== undefined && (
              <div className="mt-8 pt-5 border-t border-[#d8d4cb] text-center text-xs sm:text-sm text-[#333] font-serif">
                {isLogin ? (
                  <>
                    Don't have an account?{' '}
                    <Link
                      to="/register"
                      className="font-black text-[#b91c1c] hover:underline transition-colors ml-1 inline-flex items-center gap-1"
                    >
                      <span>Sign up for free</span>
                      <ArrowRight size={14} />
                    </Link>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="font-black text-[#b91c1c] hover:underline transition-colors ml-1 inline-flex items-center gap-1"
                    >
                      <span>Log in here</span>
                      <ArrowRight size={14} />
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right: Showcase Section */}
          <div className="hidden lg:flex lg:w-[44%] bg-[#e0dcd5] p-10 flex-col justify-between text-[#1a1a1a] relative overflow-hidden border-l-2 border-[#1a1a1a]">
            <div className="relative z-10 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a1a1a] border border-[#1a1a1a] text-[#f2efe9] text-xs font-black font-serif shadow-[2px_2px_0px_0px_#b91c1c]">
                <Sparkles size={14} />
                <span>Smart Exam Prep</span>
              </div>

              <h2 className="text-3xl font-black leading-tight text-[#1a1a1a] tracking-tight font-serif">
                Prepare with confidence. <br />
                <span className="text-[#b91c1c]">Succeed with precision.</span>
              </h2>

              <p className="text-[#333] text-xs sm:text-sm leading-relaxed font-serif">
                Gain access to verified question banks, live model tests with competitive percentiles, and AI-driven weak-topic diagnostics.
              </p>

              <div className="pt-2 space-y-2.5">
                <div className="flex items-center gap-3 p-3 rounded-md bg-[#f2efe9] border border-[#d8d4cb] shadow-[1px_1px_0px_0px_#1a1a1a]">
                  <div className="w-8 h-8 rounded-md bg-[#1a1a1a] text-[#f2efe9] flex items-center justify-center flex-shrink-0">
                    <Zap size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#1a1a1a] font-serif">Timed Real-Exam Simulations</p>
                    <p className="text-[11px] text-[#333] font-serif">Instant ranking & negative marking analytics</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-md bg-[#f2efe9] border border-[#d8d4cb] shadow-[1px_1px_0px_0px_#1a1a1a]">
                  <div className="w-8 h-8 rounded-md bg-[#1a1a1a] text-[#f2efe9] flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#1a1a1a] font-serif">AI Weakness Breakdown</p>
                    <p className="text-[11px] text-[#333] font-serif">Personalized study roadmaps based on errors</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-md bg-[#f2efe9] border border-[#d8d4cb] shadow-[1px_1px_0px_0px_#1a1a1a]">
                  <div className="w-8 h-8 rounded-md bg-[#1a1a1a] text-[#f2efe9] flex items-center justify-center flex-shrink-0">
                    <Award size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#1a1a1a] font-serif">Gamified Streaks & Badges</p>
                    <p className="text-[11px] text-[#333] font-serif">Stay motivated with daily streaks & achievements</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-6 bg-[#f2efe9] border border-[#1a1a1a] rounded-lg p-4 flex items-center justify-between shadow-[2px_2px_0px_0px_#1a1a1a]">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border-2 border-[#f2efe9] flex items-center justify-center text-[10px] font-black text-[#f2efe9] font-serif">RA</div>
                  <div className="w-8 h-8 rounded-full bg-[#b91c1c] border-2 border-[#f2efe9] flex items-center justify-center text-[10px] font-black text-[#f2efe9] font-serif">SK</div>
                  <div className="w-8 h-8 rounded-full bg-[#4a4a4a] border-2 border-[#f2efe9] flex items-center justify-center text-[10px] font-black text-[#f2efe9] font-serif">TH</div>
                </div>
                <div>
                  <p className="text-xs font-black text-[#1a1a1a] font-serif">15,000+ Aspirants</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={11} className="text-[#b91c1c] fill-[#b91c1c]" />
                    ))}
                    <span className="text-[10px] text-[#333] ml-1 font-serif">4.9/5</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 text-[10px] text-[#1a1a1a] font-black bg-[#f2efe9] px-2 py-1 rounded-full border border-[#1a1a1a] font-serif uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b91c1c] animate-pulse" />
                  Live Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── DARK MODE (Original, unchanged) ───
  return (
    <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 font-sans relative overflow-hidden selection:bg-[#00E5B3]/30 selection:text-white">
      <div className="fixed top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#00E5B3]/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#2F80ED]/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#9B51E0]/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="w-full max-w-5xl bg-[#111318]/90 backdrop-blur-2xl rounded-2xl md:rounded-3xl border border-[#23262D] overflow-hidden flex flex-col lg:flex-row shadow-2xl shadow-black/50 transition-all">
        <div className="flex-1 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col relative justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 md:mb-3 mb-6">
              <Link to="/" className="inline-flex items-center gap-2 group">
                <img src="/logo1.png" className="md:h-20 h-16 w-auto object-contain transition-transform group-hover:scale-105" alt="Geneseon" />
              </Link>
              <Link to="/" className="text-xs text-[#A1A8B3] hover:text-[#F5F7FA] inline-flex items-center gap-1.5 transition-colors py-1.5 px-3 rounded-lg hover:bg-[#161920] border border-transparent hover:border-[#23262D]">
                <ArrowLeft size={14} />
                <span>Home</span>
              </Link>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight mb-1.5">{title}</h1>
              <p className="text-[#A1A8B3] text-xs sm:text-sm leading-relaxed">{subtitle}</p>
            </div>

            {children}
          </div>

          {isLogin !== undefined && (
            <div className="mt-8 pt-5 border-t border-[#23262D]/60 text-center text-xs sm:text-sm text-[#A1A8B3]">
              {isLogin ? (
                <>
                  Don't have an account?{' '}
                  <Link to="/register" className="font-semibold text-[#00E5B3] hover:text-[#00C298] transition-colors ml-1 inline-flex items-center gap-1 group">
                    <span>Sign up for free</span>
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-[#00E5B3] hover:text-[#00C298] transition-colors ml-1 inline-flex items-center gap-1 group">
                    <span>Log in here</span>
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        <div className="hidden lg:flex lg:w-[44%] bg-gradient-to-br from-[#141720] via-[#10131A] to-[#0D0F14] p-10 flex-col justify-between text-white relative overflow-hidden border-l border-[#23262D]">
          <div className="absolute -top-1 right-0 w-80 h-80 bg-[#00E5B3]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#2F80ED]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00E5B3]/10 border border-[#00E5B3]/25 text-[#00E5B3] text-xs font-semibold">
              <Sparkles size={14} />
              <span>Smart Exam Prep</span>
            </div>

            <h2 className="text-3xl font-extrabold leading-tight text-[#F5F7FA] tracking-tight">
              Prepare with confidence. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5B3] via-[#00C8FF] to-[#2F80ED]">
                Succeed with precision.
              </span>
            </h2>

            <p className="text-[#A1A8B3] text-xs sm:text-sm leading-relaxed">
              Gain access to verified question banks, live model tests with competitive percentiles, and AI-driven weak-topic diagnostics.
            </p>

            <div className="pt-2 space-y-2.5">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#161920]/80 border border-[#23262D] backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-[#00E5B3]/15 text-[#00E5B3] flex items-center justify-center flex-shrink-0">
                  <Zap size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#F5F7FA]">Timed Real-Exam Simulations</p>
                  <p className="text-[11px] text-[#A1A8B3]">Instant ranking & negative marking analytics</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#161920]/80 border border-[#23262D] backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-[#2F80ED]/15 text-[#2F80ED] flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#F5F7FA]">AI Weakness Breakdown</p>
                  <p className="text-[11px] text-[#A1A8B3]">Personalized study roadmaps based on errors</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#161920]/80 border border-[#23262D] backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-[#F2C94C]/15 text-[#F2C94C] flex items-center justify-center flex-shrink-0">
                  <Award size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#F5F7FA]">Gamified Streaks & Badges</p>
                  <p className="text-[11px] text-[#A1A8B3]">Stay motivated with daily streaks & achievements</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-6 bg-[#111318]/90 border border-[#23262D] rounded-2xl p-4 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00E5B3] to-[#2F80ED] border-2 border-[#111318] flex items-center justify-center text-[10px] font-bold text-black">RA</div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#9B51E0] to-[#2F80ED] border-2 border-[#111318] flex items-center justify-center text-[10px] font-bold text-white">SK</div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#F2C94C] to-[#00E5B3] border-2 border-[#111318] flex items-center justify-center text-[10px] font-bold text-black">TH</div>
              </div>
              <div>
                <p className="text-xs font-bold text-[#F5F7FA]">15,000+ Aspirants</p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} className="text-[#F2C94C] fill-[#F2C94C]" />
                  ))}
                  <span className="text-[10px] text-[#A1A8B3] ml-1">4.9/5</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 text-[10px] text-[#00E5B3] font-semibold bg-[#00E5B3]/10 px-2 py-1 rounded-full border border-[#00E5B3]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5B3] animate-pulse" />
                Live Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Form Input (theme-aware) ----------
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ReactNode;
  rightElement?: React.ReactNode;
}

const FormInput: React.FC<FormInputProps> = ({ icon, rightElement, className = '', ...props }) => {
  const { isDark } = useTheme();

  return (
    <div className="relative group">
      <div
        className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
          isDark
            ? 'text-[#6B7280] group-focus-within:text-[#00E5B3]'
            : 'text-[#4a4a4a] group-focus-within:text-[#b91c1c]'
        }`}
      >
        {icon}
      </div>
      <input
        {...props}
        className={`w-full pl-10 pr-4 h-12 rounded-xl text-[18px] transition-all font-normal ${
          isDark
            ? 'bg-[#161920]/90 border border-[#23262D] text-[#F5F7FA] placeholder:text-[#4B5260] focus:outline-none focus:ring-2 focus:ring-[#00E5B3]/20 focus:border-[#00E5B3] hover:border-[#323742]'
            : 'bg-[#f2efe9] border-2 border-[#1a1a1a] text-[#1a1a1a] placeholder:text-[#8a8577] font-serif shadow-[2px_2px_0px_0px_#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#b91c1c]/20 focus:border-[#b91c1c]'
        } ${rightElement ? 'pr-11' : ''} ${className}`}
      />
      {rightElement && (
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">{rightElement}</div>
      )}
    </div>
  );
};

// ---------- Primary Button (theme-aware) ----------
const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }> = ({
  children,
  ...props
}) => {
  const { isDark } = useTheme();

  return (
    <button
      {...props}
      className={`w-full h-11 font-bold text-sm rounded-xl transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${
        isDark
          ? 'bg-[#00E5B3] text-[#0B0D12] hover:bg-[#00C298] shadow-md shadow-[#00E5B3]/20 hover:shadow-[#00E5B3]/30 active:scale-[0.99]'
          : 'bg-[#1a1a1a] text-[#f2efe9] border-2 border-[#1a1a1a] font-serif font-black shadow-[3px_3px_0px_0px_#b91c1c] hover:shadow-[4px_4px_0px_0px_#b91c1c] active:scale-[0.99]'
      }`}
    >
      {children}
    </button>
  );
};

// ---------- Google Button (theme-aware) ----------
const GoogleButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }> = ({
  loading,
  children,
  ...props
}) => {
  const { isDark } = useTheme();

  return (
    <button
      {...props}
      className={`w-full h-11 flex items-center justify-center gap-3 text-sm rounded-xl transition-all duration-150 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${
        isDark
          ? 'bg-[#161920] border border-[#23262D] hover:border-[#3A3F4D] text-[#F5F7FA] font-medium hover:bg-[#1C2028]'
          : 'bg-[#f2efe9] border-2 border-[#1a1a1a] hover:bg-[#e0dcd5] text-[#1a1a1a] font-serif font-black shadow-[2px_2px_0px_0px_#1a1a1a] hover:shadow-[3px_3px_0px_0px_#1a1a1a]'
      }`}
    >
      {loading ? (
        <Loader2 size={18} className={`animate-spin ${isDark ? 'text-[#00E5B3]' : 'text-[#b91c1c]'}`} />
      ) : (
        <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
          <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z" />
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.4 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.1C9.4 35.7 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6.2 5.2C41.1 36 44 30.4 44 24c0-1.3-.1-2.7-.4-3.9z" />
        </svg>
      )}
      <span>{children}</span>
    </button>
  );
};

// ---------- Or Divider (theme-aware) ----------
const OrDivider: React.FC = () => {
  const { isDark } = useTheme();
  return (
    <div className="flex items-center gap-3 my-4">
      <div className={`flex-1 h-px ${isDark ? 'bg-[#23262D]' : 'bg-[#b8b3a8]'}`} />
      <span
        className={`text-[11px] font-semibold uppercase tracking-wider ${
          isDark ? 'text-[#525A68]' : 'text-[#1a1a1a] font-serif font-black'
        }`}
      >
        or
      </span>
      <div className={`flex-1 h-px ${isDark ? 'bg-[#23262D]' : 'bg-[#b8b3a8]'}`} />
    </div>
  );
};

// ---------- Error Alert (theme-aware) ----------
const ErrorAlert: React.FC<{ title: string; message: string; onDismiss: () => void }> = ({
  title,
  message,
  onDismiss,
}) => {
  const { isDark } = useTheme();
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl p-3 mb-4 text-left ${
        isDark
          ? 'bg-red-500/10 border border-red-500/25'
          : 'bg-[#f2efe9] border-2 border-[#b91c1c] shadow-[2px_2px_0px_0px_#b91c1c]'
      }`}
    >
      <AlertTriangle
        size={17}
        className={`mt-0.5 flex-shrink-0 ${isDark ? 'text-red-400' : 'text-[#b91c1c]'}`}
      />
      <div className="flex-1 min-w-0">
        <p
          className={`text-xs ${
            isDark ? 'font-semibold text-red-400' : 'font-black text-[#b91c1c] font-serif'
          }`}
        >
          {title}
        </p>
        <p
          className={`text-[11px] leading-normal ${
            isDark ? 'text-red-300/80' : 'text-[#333] font-serif'
          }`}
        >
          {message}
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss error"
        className={`transition-colors flex-shrink-0 ${
          isDark ? 'text-red-400/60 hover:text-red-300' : 'text-[#b91c1c]/70 hover:text-[#b91c1c]'
        }`}
      >
        <X size={15} />
      </button>
    </div>
  );
};

// ---------- LOGIN COMPONENT ----------
export const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [login, { isLoading }] = useLoginMutation();
  const [googleSignIn] = useGoogleSignInMutation();
  const { isDark } = useTheme();

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const data = await googleSignIn({ idToken }).unwrap();

      const userInfo = {
        _id: data.user._id,
        name: data.user.name || result.user.displayName || '',
        email: data.user.email,
        role: data.user.role || 'student',
      };

      setAuthToken(data.token);
      persistAuth(data.token, userInfo, (data as any).refreshToken);
      dispatch(loginSuccess(userInfo));

      const from = (location.state as any)?.from || '/dashboard';
      navigate(from, { replace: true });
    } catch (error: any) {
      if (error?.code !== 'auth/popup-closed-by-user') {
        const message =
          error?.data?.message || error?.message || 'Google sign-in failed. Please try again.';
        setErrorMessage(message);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

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
      persistAuth(data.token, userInfo, (data as any).refreshToken);
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
      title="Welcome back"
      subtitle="Log in to your account to continue your exam preparation."
      isLogin={true}
    >
      {errorMessage && (
        <ErrorAlert
          title="Sign-in Failed"
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}

      <GoogleButton
        type="button"
        onClick={handleGoogleSignIn}
        loading={googleLoading}
        disabled={googleLoading || isLoading}
      >
        Continue with Google
      </GoogleButton>

      <OrDivider />

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          handleLogin(form.email.value, form.password.value);
        }}
      >
        <div className="space-y-1.5">
          <Label>Email Address</Label>
          <FormInput
            name="email"
            type="email"
            placeholder="name@example.com"
            icon={<Mail size={16} />}
            required
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label>Password</Label>
            <Link
              to="/forgot-password"
              className={`text-xs transition-colors ${
                isDark
                  ? 'text-[#00E5B3] hover:text-[#00C298]'
                  : 'font-black text-[#b91c1c] hover:underline font-serif'
              }`}
            >
              Forgot password?
            </Link>
          </div>
          <FormInput
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            icon={<Lock size={16} />}
            required
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`transition-colors ${
                  isDark ? 'text-[#6B7280] hover:text-[#F5F7FA]' : 'text-[#4a4a4a] hover:text-[#1a1a1a]'
                }`}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
        </div>

        <div className="pt-2">
          <PrimaryButton type="submit" disabled={isLoading || googleLoading}>
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <span>Log In</span>
                <ArrowRight size={16} />
              </>
            )}
          </PrimaryButton>
        </div>
      </form>
    </AuthLayout>
  );
};

// ---------- SIGN UP COMPONENT ----------
export const SignUp: React.FC = () => {
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [register, { isLoading }] = useRegisterMutation();
  const [googleSignIn] = useGoogleSignInMutation();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const data = await googleSignIn({ idToken }).unwrap();

      const userInfo = {
        _id: data.user._id,
        name: data.user.name || result.user.displayName || '',
        email: data.user.email,
        role: data.user.role || 'student',
      };

      setAuthToken(data.token);
      persistAuth(data.token, userInfo, (data as any).refreshToken);
      dispatch(loginSuccess(userInfo));
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      if (error?.code !== 'auth/popup-closed-by-user') {
        const message =
          error?.data?.message || error?.message || 'Google sign-in failed. Please try again.';
        setErrorMessage(message);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleCreateUser = async (email: string, password: string, name: string) => {
    setErrorMessage(null);
    try {
      const data = await register({ email, password, name }).unwrap();

      const userInfo = {
        _id: data.user._id,
        name: data.user.name || name,
        email: data.user.email,
        role: data.user.role || 'student',
      };

      setAuthToken(data.token);
      persistAuth(data.token, userInfo, (data as any).refreshToken);
      dispatch(loginSuccess(userInfo));
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      console.error('Registration failed:', error);
      const message =
        error?.data?.message || error?.message || 'Registration failed. Please try again.';
      setErrorMessage(message);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Join Bangladesh's premier competitive exam platform."
      isLogin={false}
    >
      {errorMessage && (
        <ErrorAlert
          title="Sign-up Failed"
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}

      <GoogleButton
        type="button"
        onClick={handleGoogleSignIn}
        loading={googleLoading}
        disabled={googleLoading || isLoading}
      >
        Continue with Google
      </GoogleButton>

      <OrDivider />

      <form
        className="space-y-3.5"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          handleCreateUser(form.userName.value, form.password.value, form.fullname.value);
        }}
      >
        <div className="space-y-1.5">
          <Label>Full Name</Label>
          <FormInput
            name="fullname"
            type="text"
            placeholder="Md. Rahim Uddin"
            icon={<User size={16} />}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label>Email Address</Label>
          <FormInput
            name="userName"
            type="email"
            placeholder="rahim@example.com"
            icon={<Mail size={16} />}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label>Password</Label>
          <FormInput
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password (min. 6 chars)"
            icon={<Lock size={16} />}
            required
            minLength={6}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`transition-colors ${
                  isDark ? 'text-[#6B7280] hover:text-[#F5F7FA]' : 'text-[#4a4a4a] hover:text-[#1a1a1a]'
                }`}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
        </div>

        <div className="flex items-start gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setAgreed(!agreed)}
            className={`w-4 h-4 mt-0.5 rounded border transition-all flex items-center justify-center flex-shrink-0 cursor-pointer ${
              agreed
                ? isDark
                  ? 'bg-[#00E5B3] border-[#00E5B3]'
                  : 'bg-[#1a1a1a] border-[#1a1a1a]'
                : isDark
                ? 'border-[#323742] bg-[#161920] hover:border-[#4B5260]'
                : 'border-2 border-[#1a1a1a] bg-[#f2efe9]'
            }`}
          >
            {agreed && (
              <CheckCircle2
                size={13}
                className={isDark ? 'text-[#0B0D12]' : 'text-[#f2efe9]'}
              />
            )}
          </button>
          <p
            className={`text-xs leading-snug select-none ${
              isDark ? 'text-[#A1A8B3]' : 'text-[#333] font-serif'
            }`}
          >
            I agree to the{' '}
            <Link
              to="/terms"
              className={`underline underline-offset-2 transition-colors ${
                isDark ? 'text-[#F5F7FA] hover:text-[#00E5B3]' : 'text-[#1a1a1a] hover:text-[#b91c1c] font-black'
              }`}
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              to="/privacy-policy"
              className={`underline underline-offset-2 transition-colors ${
                isDark ? 'text-[#F5F7FA] hover:text-[#00E5B3]' : 'text-[#1a1a1a] hover:text-[#b91c1c] font-black'
              }`}
            >
              Privacy Policy
            </Link>
          </p>
        </div>

        <div className="pt-2">
          <PrimaryButton type="submit" disabled={!agreed || isLoading || googleLoading}>
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={16} />
              </>
            )}
          </PrimaryButton>
        </div>
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
  const { isDark } = useTheme();

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
    } catch (error: any) {
      setErrorMessage(
        error?.data?.message || 'Something went wrong. Please try again.'
      );
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your verified email and we'll send you recovery instructions."
    >
      {sent ? (
        <div className="space-y-5">
          <div
            className={`flex items-start gap-3 rounded-xl p-4 ${
              isDark
                ? 'bg-[#00E5B3]/10 border border-[#00E5B3]/30'
                : 'bg-[#f2efe9] border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]'
            }`}
          >
            <CheckCircle2
              size={18}
              className={`mt-0.5 flex-shrink-0 ${isDark ? 'text-[#00E5B3]' : 'text-[#1a1a1a]'}`}
            />
            <div>
              <p
                className={`text-xs mb-0.5 ${
                  isDark ? 'font-bold text-[#00E5B3]' : 'font-black text-[#1a1a1a] font-serif'
                }`}
              >
                Check your inbox
              </p>
              <p
                className={`text-xs leading-relaxed ${
                  isDark ? 'text-[#A1A8B3]' : 'text-[#333] font-serif'
                }`}
              >
                If an account exists for{' '}
                <span className={isDark ? 'text-[#F5F7FA] font-medium' : 'text-[#1a1a1a] font-black'}>
                  {email}
                </span>
                , a password reset link has been dispatched.
              </p>
            </div>
          </div>
          <Link
            to="/login"
            className={`w-full h-11 text-sm rounded-xl flex items-center justify-center gap-2 transition-all ${
              isDark
                ? 'bg-[#161920] border border-[#23262D] hover:border-[#3A3F4D] text-[#F5F7FA] font-medium hover:bg-[#1C2028]'
                : 'bg-[#f2efe9] border-2 border-[#1a1a1a] text-[#1a1a1a] font-serif font-black shadow-[2px_2px_0px_0px_#1a1a1a] hover:shadow-[3px_3px_0px_0px_#1a1a1a] hover:bg-[#e0dcd5]'
            }`}
          >
            <ArrowLeft size={16} />
            <span>Return to Log In</span>
          </Link>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          {errorMessage && (
            <ErrorAlert
              title="Request Failed"
              message={errorMessage}
              onDismiss={() => setErrorMessage(null)}
            />
          )}
          <div className="space-y-1.5">
            <Label>Email Address</Label>
            <FormInput
              type="email"
              placeholder="rahim@example.com"
              icon={<Mail size={16} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="pt-2 space-y-3">
            <PrimaryButton type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Sending reset link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight size={16} />
                </>
              )}
            </PrimaryButton>

            <Link
              to="/login"
              className={`w-full py-2 text-center text-xs transition-colors inline-flex items-center justify-center gap-1.5 ${
                isDark
                  ? 'text-[#A1A8B3] hover:text-[#F5F7FA]'
                  : 'text-[#333] hover:text-[#b91c1c] font-black font-serif'
              }`}
            >
              <ArrowLeft size={14} />
              <span>Back to Login</span>
            </Link>
          </div>
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
  const { isDark } = useTheme();

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
      setErrorMessage('This reset link is invalid or expired. Please request a new one.');
      return;
    }
    try {
      await resetPassword({ token, email, newPassword }).unwrap();
      setDone(true);
    } catch (error: any) {
      setErrorMessage(
        error?.data?.message || 'Unable to reset password. Please try again.'
      );
    }
  };

  return (
    <AuthLayout
      title="Set new password"
      subtitle="Choose a secure password with at least 6 characters."
    >
      {done ? (
        <div className="space-y-5">
          <div
            className={`flex items-start gap-3 rounded-xl p-4 ${
              isDark
                ? 'bg-[#00E5B3]/10 border border-[#00E5B3]/30'
                : 'bg-[#f2efe9] border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]'
            }`}
          >
            <CheckCircle2
              size={18}
              className={`mt-0.5 flex-shrink-0 ${isDark ? 'text-[#00E5B3]' : 'text-[#1a1a1a]'}`}
            />
            <div>
              <p
                className={`text-xs mb-0.5 ${
                  isDark ? 'font-bold text-[#00E5B3]' : 'font-black text-[#1a1a1a] font-serif'
                }`}
              >
                Password updated successfully
              </p>
              <p
                className={`text-xs leading-relaxed ${
                  isDark ? 'text-[#A1A8B3]' : 'text-[#333] font-serif'
                }`}
              >
                You can now log in using your new password.
              </p>
            </div>
          </div>
          <Link
            to="/login"
            className={`w-full h-11 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all ${
              isDark
                ? 'bg-[#00E5B3] text-[#0B0D12] hover:bg-[#00C298] shadow-md shadow-[#00E5B3]/20'
                : 'bg-[#1a1a1a] text-[#f2efe9] border-2 border-[#1a1a1a] font-serif font-black shadow-[3px_3px_0px_0px_#b91c1c] hover:shadow-[4px_4px_0px_0px_#b91c1c]'
            }`}
          >
            <span>Proceed to Login</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          {errorMessage && (
            <ErrorAlert
              title="Reset Failed"
              message={errorMessage}
              onDismiss={() => setErrorMessage(null)}
            />
          )}
          <div className="space-y-1.5">
            <Label>New Password</Label>
            <FormInput
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 6 characters"
              icon={<Lock size={16} />}
              required
              minLength={6}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`transition-colors ${
                    isDark ? 'text-[#6B7280] hover:text-[#F5F7FA]' : 'text-[#4a4a4a] hover:text-[#1a1a1a]'
                  }`}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
          </div>
          <div className="pt-2">
            <PrimaryButton type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Updating password...</span>
                </>
              ) : (
                <>
                  <span>Update Password</span>
                  <ArrowRight size={16} />
                </>
              )}
            </PrimaryButton>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default { Login, SignUp, ForgotPassword, ResetPassword };