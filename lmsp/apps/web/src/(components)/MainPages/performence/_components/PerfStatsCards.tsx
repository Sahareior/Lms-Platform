import React from 'react';
import DeltaBadge from './DeltaBadge';

interface StatCardDef {
  label: string;
  value: string;
  sub: string;
  delta: number | null;
  deltaSuffix: string;
  deltaInvert: boolean;
  icon: React.ReactNode;
  color: string;
}

// ─── Stats cards row ───────────────────────────────────────
export default function PerfStatsCards({ stats, isDark }: { stats: StatCardDef[]; isDark: boolean }) {
  if (!isDark) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-[#f2efe9] p-4 rounded-2xl border border-[#d8d4cb] flex flex-col shadow-[2px_2px_0px_0px_#1a1a1a]">
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-medium text-[#4a4a4a] font-serif uppercase tracking-widest">{stat.label}</span>
              <div className="p-1.5 rounded-lg bg-[#1a1a1a]/5">{stat.icon}</div>
            </div>
            <div className="text-2xl font-bold text-[#1a1a1a] mb-0.5 font-serif">{stat.value}</div>
            <div className="flex items-center gap-1.5 text-[10px] font-medium flex-wrap">
              {stat.delta !== null && stat.delta !== 0 ? (
                <>
                  <DeltaBadge delta={stat.delta} suffix={stat.deltaSuffix} invert={stat.deltaInvert} />
                  <span className="text-[#4a4a4a]">vs previous</span>
                </>
              ) : (
                <span className="text-[#4a4a4a]">{stat.sub}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-[#111318] p-4 rounded-2xl border border-[#23262D] flex flex-col">
          <div className="flex justify-between items-start mb-1">
            <span className="text-xs font-medium text-[#A1A8B3]">{stat.label}</span>
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${stat.color}1A` }}>
              {stat.icon}
            </div>
          </div>
          <div className="text-2xl font-bold text-[#F5F7FA] mb-0.5">{stat.value}</div>
          <div className="flex items-center gap-1.5 text-[10px] font-medium flex-wrap">
            {stat.delta !== null && stat.delta !== 0 ? (
              <>
                <DeltaBadge delta={stat.delta} suffix={stat.deltaSuffix} invert={stat.deltaInvert} />
                <span className="text-[#6B7280]">vs previous</span>
              </>
            ) : (
              <span className="text-[#A1A8B3]">{stat.sub}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
