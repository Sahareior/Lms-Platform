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
export default function PerfStatsCards({ stats }: { stats: StatCardDef[] }) {
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
