import { ArrowRight } from "lucide-react";

// ─── Quick Action Card ─────────────────────────────────────
export default function QuickAction({
  icon: Icon,
  label,
  description,
  onClick,
  color,
  isDark,
}: {
  icon: any;
  label: string;
  description: string;
  onClick: () => void;
  color: string;
  isDark: boolean;
}) {
  // ─── LIGHT MODE (Vintage/Editorial Style) ──────────────────
  if (!isDark) {
    return (
      <button
        onClick={onClick}
        className="group flex items-center gap-4 w-full bg-[#f2efe9] border border-[#d8d4cb] rounded-xl p-4 text-left shadow-[2px_2px_0px_0px_#1a1a1a] hover:shadow-[3px_3px_0px_0px_#1a1a1a] hover:-translate-y-0.5 transition-all duration-200"
      >
        {/* Icon Box */}
        <div className="p-2.5 rounded-lg bg-[#1a1a1a] flex items-center justify-center shrink-0">
          <Icon size={20} className="text-[#f2efe9]" />
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm text-[#1a1a1a] font-serif leading-tight">
            {label}
          </h4>
          <p className="text-[11px] text-[#4a4a4a] font-serif mt-0.5">
            {description}
          </p>
        </div>

        {/* Arrow */}
        <ArrowRight 
          size={16} 
          className="ml-2 text-[#1a1a1a] group-hover:translate-x-1 transition-transform shrink-0" 
        />
      </button>
    );
  }

  // ─── DARK MODE (Original Code - Unchanged) ─────────────────
  return (
    <button
      onClick={onClick}
      className="group bg-[#111318] border border-[#23262D] rounded-2xl p-5 text-left hover:border-[#323742] transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 border border-opacity-30`}>
          <Icon size={20} className={color} />
        </div>
        <div>
          <h4 className="font-bold text-sm text-[#F5F7FA]">{label}</h4>
          <p className="text-[10px] text-[#A1A8B3]">{description}</p>
        </div>
        <ArrowRight size={16} className="ml-auto text-[#A1A8B3] group-hover:text-[#F5F7FA] transition-colors" />
      </div>
    </button>
  );
}