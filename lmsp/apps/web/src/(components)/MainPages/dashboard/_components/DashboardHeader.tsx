import { ArrowRight, Calendar, Shield } from "lucide-react";

// ─── Dashboard top header (greeting + admin panel shortcut) ─
export default function DashboardHeader({
  user,
  greeting,
  dateStr,
  onAdminPanel,
  isDark
}: {
  user: any;
  greeting: string;
  dateStr: string;
  onAdminPanel: () => void;
  isDark: boolean;
}) {
  // ─── LIGHT MODE (Exact Image Style) ────────────────────────
  if (!isDark) {
    return (
      <div className="relative w-full overflow-hidden rounded-2xl bg-[#f2efe9] border border-[#e0dcd5] shadow-sm font-sans">
        <div className="flex flex-col md:flex-row">
          
          {/* LEFT SIDE: Greeting & Quote */}
          <div className="flex-1 p-6 md:p-10 flex flex-col justify-center">
            {/* Greeting Line */}
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-5xl font-black text-[#1a1a1a] leading-tight font-serif">
                {greeting},
              </h1>
              <span className="text-3xl md:text-4xl">👋</span>
            </div>

            {/* Name */}
            <h2 className="text-3xl md:text-5xl font-black text-[#b91c1c] leading-tight mb-6 font-serif">
              {user?.name || "Student"}!
            </h2>

            {/* Keep pushing forward */}
            <p className="text-sm md:text-base font-bold text-[#1a1a1a] mb-1">
              Keep pushing forward!
            </p>

            {/* Quote */}
            <p className="text-xs md:text-sm text-[#4a4a4a] italic font-serif border-l-2 border-[#b91c1c] pl-3 max-w-md">
              "A little progress each day adds up to big results."
            </p>
          </div>

          {/* RIGHT SIDE: Illustration & Admin Panel */}
          <div className="relative md:w-[48%] min-h-[220px] md:min-h-full bg-[#e8e4db] p-6 md:p-8 flex flex-col justify-between">
            {/* Dotted Texture */}
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{ 
                backgroundImage: 'radial-gradient(#1a1a1a 1px, transparent 1px)', 
                backgroundSize: '10px 10px' 
              }}
            />

            {/* Admin Panel Button (Top Right) */}
            {user?.role === 'admin' && (
              <div className="relative z-20 flex justify-end">
                <button
                  onClick={onAdminPanel}
                  className="group inline-flex items-center gap-2 px-3 py-1.5 bg-[#f2efe9] border-2 border-[#1a1a1a] rounded-lg shadow-[4px_4px_0px_0px_#1a1a1a] hover:shadow-[2px_2px_0px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
                >
                  <Shield className="w-3.5 h-3.5 text-[#b91c1c]" />
                  <div className="flex flex-col items-start text-left">
                    <span className="text-[11px] font-bold text-[#1a1a1a] leading-none">Admin Panel</span>
                    <span className="text-[9px] text-[#4a4a4a] font-medium uppercase tracking-wider leading-none mt-0.5">Manage Everything</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-[#b91c1c] group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}

            {/* Center Illustration Text (Some Students Bigger Dreams) */}
            <div className="relative z-10 flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-[#1a1a1a] font-serif leading-tight rotate-[-6deg]">
                  Some<br/>
                  Students<br/>
                  <span className="text-[#b91c1c]">Bigger</span><br/>
                  Dreams.
                </p>
                {/* Red Underline */}
                <div className="w-24 h-1 bg-[#b91c1c] mt-2 rotate-[-6deg] mx-auto rounded-full" />
              </div>
            </div>

            {/* Date (Bottom Right) */}
            <div className="relative z-20 flex justify-end mt-4 md:mt-0">
              <p className="text-[9px] text-[#4a4a4a] font-medium uppercase tracking-widest flex items-center gap-1.5">
                <Calendar size={10} /> {dateStr}
              </p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ─── DARK MODE (Original Code - Unchanged) ─────────────────
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