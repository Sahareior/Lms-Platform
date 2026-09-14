interface StatItem {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  bg: string;
}

// ─── Dashboard stats row ───────────────────────────────────
export default function StatsRow({ statsCards }: { statsCards: StatItem[] }) {
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
