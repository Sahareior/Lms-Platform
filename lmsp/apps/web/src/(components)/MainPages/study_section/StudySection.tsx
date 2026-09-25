import {
  BookOpen,
  FileText,
  Users,
  ArrowRight,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../../theme/ThemeContext";

// ─── Study section items ───────────────────────────────────────
const studyItems = [
  {
    title: "টেস্ট পেপার প্রশ্নব্যাংক (CQ)",
    icon: <GraduationCap size={22} />,
    path: "reading",
    description: "এইচএসসি ও এসএসসি বোর্ড ও শীর্ষ কলেজের সৃজনশীল প্রশ্ন ও পূর্ণাঙ্গ উত্তর",
    accent: "reading",
  },
  {
    title: "PDF Section",
    icon: <FileText size={22} />,
    path: "pdf",
    description: "Academic and job preparation PDFs",
    accent: "pdf",
  },
  {
    title: "সাম্প্রতিক পোস্ট",
    icon: <BookOpen size={22} />,
    path: "posts",
    description: "Latest posts, tips and updates",
    accent: "posts",
  },
  {
    title: "Study Group",
    icon: <Users size={22} />,
    path: "study-group",
    description: "Join our Facebook, Instagram and YouTube communities",
    accent: "group",
  },
];

const StudySection = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname !== "/study-section") {
    return <Outlet />;
  }

  return (
    <div
      className={`min-h-screen md:p-4 p-1 ${
        isDark ? "bg-[#0B0D12] text-[#F5F7FA]" : "bg-[#e8e4db] text-[#1a1a1a]"
      }`}
      style={
        isDark
          ? undefined
          : {
              backgroundImage:
                "radial-gradient(#d8d4cb 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }
      }
    >
      <div className="mx-auto max-w-8xl">
        {/* ── Hero Header ───────────────────────────────────── */}
        {isDark ? (
          <div className="relative overflow-hidden rounded-2xl border border-[#23262D] bg-gradient-to-br from-[#161920] via-[#111318] to-[#0B0D12] p-6 md:p-8 mb-6">
            <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#2F80ED]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#00C8FF]/15 blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#2F80ED]/30 bg-[#2F80ED]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#2F80ED] mb-3">
                <Sparkles size={11} />
                Study Resources
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
                Study Section
              </h1>
              <p className="text-[#A1A8B3] text-sm max-w-xl leading-relaxed">
                PDFs, posts and study groups — everything you need to prepare,
                all in one place.
              </p>
            </div>
          </div>
        ) : (
          /* Light Mode Hero Header */
          <div
            className="relative overflow-hidden rounded-lg border-2 border-[#1a1a1a] bg-[#f2efe9] p-6 md:p-8 mb-6 shadow-[4px_4px_0px_0px_#1a1a1a]"
            style={{
              backgroundImage: "radial-gradient(#d8d4cb 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          >
            <div className="relative">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#b91c1c] bg-[#f2efe9] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#b91c1c] font-serif mb-3 shadow-[1px_1px_0px_0px_#1a1a1a]">
                <Sparkles size={11} />
                Study Resources
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 text-[#1a1a1a] font-serif">
                Study Section
              </h1>
              <p className="text-[#333] text-sm md:text-base max-w-xl leading-relaxed font-serif">
                PDFs, posts and study groups — everything you need to prepare,
                all in one place.
              </p>
            </div>
          </div>
        )}

        {/* ── Study Section Grid ────────────────────────────── */}
        <div className="grid grid-cols-1 px-4 md:px-0 mt-5 md:mt-12 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {studyItems.map((item, index) => {
            if (isDark) {
              return (
                <button
                  key={index}
                  onClick={() => navigate(item.path)}
                  className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-[#23262D] bg-[#111318] p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2F80ED]/50 hover:bg-[#141720] hover:shadow-[0_8px_32px_-12px_rgba(47,128,237,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F80ED]/50"
                >
                  {/* Soft glow on hover */}
                  <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#2F80ED]/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

                  {/* Icon */}
                  <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#2F80ED]/25 bg-[#2F80ED]/10 text-[#2F80ED] transition-transform duration-300 group-hover:scale-105">
                    {item.icon}
                  </span>

                  {/* Content */}
                  <div className="relative flex-1">
                    <h3 className="mb-1 text-base font-bold text-[#F5F7FA] transition-colors group-hover:text-[#2F80ED]">
                      {item.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-[#A1A8B3]">
                      {item.description}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="relative flex items-center gap-1 text-[11px] font-bold text-[#2F80ED] opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100">
                    Open
                    <ArrowRight size={12} />
                  </div>
                </button>
              );
            }

            // ─── LIGHT MODE: vintage editorial card ───
            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className="group relative flex flex-col gap-3 overflow-hidden rounded-lg border-2 border-[#1a1a1a] bg-[#f2efe9] p-5 text-left shadow-[3px_3px_0px_0px_#1a1a1a] transition-all duration-300 hover:-translate-y-1 hover:shadow-[5px_5px_0px_0px_#1a1a1a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b91c1c]/50"
                style={{
                  backgroundImage:
                    "radial-gradient(#d8d4cb 1px, transparent 1px)",
                  backgroundSize: "16px 16px",
                }}
              >
                {/* Icon — solid black box with red offset shadow */}
                <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-lg border-2 border-[#1a1a1a] bg-[#1a1a1a] text-[#f2efe9] shadow-[2px_2px_0px_0px_#b91c1c] transition-transform duration-300 group-hover:scale-105">
                  {item.icon}
                </span>

                {/* Content */}
                <div className="relative flex-1">
                  <h3 className="mb-1 text-base font-black font-serif text-[#1a1a1a] transition-colors group-hover:text-[#b91c1c]">
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-[#333] font-serif">
                    {item.description}
                  </p>
                </div>

                {/* CTA */}
                <div className="relative flex items-center gap-1 text-[11px] font-black font-serif uppercase tracking-widest text-[#b91c1c] transition-all duration-300 group-hover:translate-x-0.5">
                  Open
                  <ArrowRight
                    size={12}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudySection;