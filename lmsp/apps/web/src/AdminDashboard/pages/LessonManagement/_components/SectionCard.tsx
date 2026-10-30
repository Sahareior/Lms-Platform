import React from 'react';

// ─── Section Wrapper ─────────────────────────────────────────
export default function SectionCard({
  icon,
  title,
  subtitle,
  children,
  accentColor = 'emerald',
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  accentColor?: string;
}) {
  const accentMap: Record<string, string> = {
    emerald: 'from-emerald-500 to-emerald-700 shadow-emerald-950/60',
    blue: 'from-emerald-400 to-emerald-600 shadow-emerald-950/60',
    violet: 'from-teal-400 to-emerald-600 shadow-emerald-950/60',
  };

  return (
    <div className="bg-[#0B0B0B] rounded-2xl shadow-sm border border-[#1F2B22] overflow-hidden hover:shadow-emerald-950/40 hover:border-emerald-500/30 transition-all duration-200">
      <div className="p-6 md:p-7">
        <div className="flex items-center gap-3.5 mb-6">
          <div
            className={`p-2.5 rounded-xl bg-gradient-to-br ${accentMap[accentColor] || accentMap.emerald} shadow-md`}
          >
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#E8F5EC] tracking-tight">{title}</h3>
            <p className="text-sm text-[#7A8A80] mt-0.5">{subtitle}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
