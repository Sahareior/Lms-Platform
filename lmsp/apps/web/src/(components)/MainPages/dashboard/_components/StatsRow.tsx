interface StatItem {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  bg: string;
}

// ─── Dashboard stats row ───────────────────────────────────
export default function StatsRow({ 
  statsCards, 
  isDark 
}: { 
  statsCards: StatItem[]; 
  isDark: boolean;
}) {
  // ─── LIGHT MODE (Vintage Card Style) ───────────────────────
  if (!isDark) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statsCards.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="relative bg-[#f2efe9] rounded-xl p-3 md:p-4 border border-[#d8d4cb] shadow-[2px_2px_0px_0px_#1a1a1a] hover:shadow-[3px_3px_0px_0px_#1a1a1a] transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon size={24} className="text-[#1a1a1a]" />
                <span className="text-2xl md:text-3xl font-black text-[#1a1a1a] font-serif leading-none">
                  {item.value}
                </span>
              </div>
              <p className="text-[10px] md:text-[11px] font-bold text-[#1a1a1a] uppercase tracking-widest font-serif border-t border-[#d8d4cb] pt-2">
                {item.title}
              </p>
            </div>
          );
        })}
      </div>
    );
  }

  // ─── DARK MODE (Original Code - Unchanged) ─────────────────
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statsCards.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className={`bg-[#111318] rounded-2xl p-5 border border-[#23262D] hover:border-[#323742] transition-all duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${item.bg} border`}>
              <Icon size={20} className={item.color} />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#F5F7FA] mb-1 leading-none">
              {item.value}
            </h2>
            <p className="text-[11px] font-semibold text-[#A1A8B3] uppercase tracking-wider">
              {item.title}
            </p>
          </div>
        );
      })}
    </div>
  );
}