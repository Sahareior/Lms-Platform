import { ArrowRight } from "lucide-react";

// ─── Quick Action Card ─────────────────────────────────────
export default function QuickAction({
  icon: Icon,
  label,
  description,
  onClick,
  color,
}: {
  icon: any;
  label: string;
  description: string;
  onClick: () => void;
  color: string;
}) {
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
