import React from 'react';
import { Sparkles } from 'lucide-react'; // adjust import to your icon lib
import { useTheme } from '../theme/ThemeContext';

const ReusableHeader = ({

  badge = 'Study Resources',
  title = 'Study Section',
  subtitle = 'PDFs, posts and study groups — everything you need to prepare, all in one place.',
  icon: Icon = Sparkles,
  className = '',
}) => {
  const { isDark } = useTheme();



  if (isDark) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl border border-[#23262D] bg-gradient-to-br from-[#161920] via-[#111318] to-[#0B0D12] p-6 md:p-8 mb-6 ${className}`}
      >
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#2F80ED]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#00C8FF]/15 blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#2F80ED]/30 bg-[#2F80ED]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#2F80ED] mb-3">
            {Icon && <Icon size={11} />}
            {badge}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 text-white">
            {title}
          </h1>
          <p className="text-[#A1A8B3] text-sm max-w-xl leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>
    );
  }

  // Light mode
  return (
    <div
      className={`relative overflow-hidden rounded-lg border-2 border-[#1a1a1a] bg-[#f2efe9] p-6 md:p-8 mb-6 shadow-[4px_4px_0px_0px_#1a1a1a] ${className}`}
      style={{
        backgroundImage: 'radial-gradient(#d8d4cb 1px, transparent 1px)',
        backgroundSize: '16px 16px',
      }}
    >
      <div className="relative">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#b91c1c] bg-[#f2efe9] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#b91c1c] font-serif mb-3 shadow-[1px_1px_0px_0px_#1a1a1a]">
          {Icon && <Icon size={11} />}
          {badge}
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 text-[#1a1a1a] font-serif">
          {title}
        </h1>
        <p className="text-[#333] text-sm md:text-base max-w-xl leading-relaxed font-serif">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default ReusableHeader;