import { ArrowRight, Calendar, Shield } from "lucide-react";

// ─── Dashboard top header (greeting + admin panel shortcut) ─
export default function DashboardHeader({
  user,
  greeting,
  dateStr,
  onAdminPanel,
}: {
  user: any;
  greeting: string;
  dateStr: string;
  onAdminPanel: () => void;
}) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-[#23262D]">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
            {greeting}, <span className="text-[#2F80ED]">{user?.name || "Student"}</span> 👋
          </h1>
        </div>
        <p className="text-xs md:text-sm text-[#A1A8B3] flex items-center gap-2">
          <Calendar size={14} className="text-[#2F80ED]" />
          <span>{dateStr}</span>
          <span className="w-1 h-1 rounded-full bg-[#23262D]" />
          <span className="text-[#00E5B3] font-medium">Keep pushing forward!</span>
        </p>
      </div>
      {user?.role === 'admin' && (
        <div className="mb-3">
          <div className="h-px bg-[#23262D] mb-3" />
          <button
            onClick={onAdminPanel}
            className="group relative w-full md:w-auto inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#1a1d24] to-[#111318] border border-[#2F80ED]/20 rounded-2xl hover:border-[#2F80ED]/60 transition-all duration-300 hover:shadow-[0_8px_30px_-5px_rgba(47,128,237,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-[#2F80ED]/20 rounded-xl blur-lg scale-150 group-hover:bg-[#2F80ED]/40 transition-all duration-300" />
              <div className="relative p-2.5 bg-gradient-to-br from-[#2F80ED] to-[#1a5cb8] rounded-xl border border-[#2F80ED]/40 shadow-[0_4px_12px_rgba(47,128,237,0.3)]">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="flex flex-col items-start">
              <span className="font-bold text-sm text-[#F5F7FA] group-hover:text-white transition-colors">
                Admin Panel
              </span>
              <span className="text-[10px] text-[#A1A8B3] font-medium uppercase tracking-wider">
                Manage Everything
              </span>
            </div>

            <div className="ml-2 flex items-center gap-1">
              <ArrowRight
                size={16}
                className="text-[#A1A8B3] group-hover:text-[#2F80ED] group-hover:translate-x-1 transition-all duration-300"
              />
            </div>

            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div className="absolute -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-shine" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
