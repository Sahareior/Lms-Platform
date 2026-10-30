import { ArrowLeft, Globe, Link2, MessageCircle, Send, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";
import { useGetStudyGroupLinksQuery, type StudyGroupPlatform } from "@my-monorepo/store";
import { useTheme } from "../../../theme/ThemeContext";

// ─── Platform meta (icon + brand colour) ───────────────────────
const PLATFORM_META: Record<
  StudyGroupPlatform,
  { icon: React.ReactNode; color: string; bg: string; label: string }
> = {
  facebook: { icon: <FacebookOutlined style={{ fontSize: 22 }} />, color: "#1877F2", bg: "rgba(24,119,242,0.12)", label: "Facebook" },
  instagram: { icon: <InstagramOutlined style={{ fontSize: 22 }} />, color: "#E1306C", bg: "rgba(225,48,108,0.12)", label: "Instagram" },
  youtube: { icon: <YoutubeOutlined style={{ fontSize: 22 }} />, color: "#FF0000", bg: "rgba(255,0,0,0.12)", label: "YouTube" },
  whatsapp: { icon: <MessageCircle size={22} />, color: "#25D366", bg: "rgba(37,211,102,0.12)", label: "WhatsApp" },
  telegram: { icon: <Send size={22} />, color: "#229ED9", bg: "rgba(34,158,217,0.12)", label: "Telegram" },
  other: { icon: <Globe size={22} />, color: "#8B5CF6", bg: "rgba(139,92,246,0.12)", label: "Link" },
};

const StudyGroupSection = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const { data, isLoading } = useGetStudyGroupLinksQuery();
  const links = (data?.links ?? []).filter((l) => l.isActive);

  return (
    <div className={`min-h-screen md:p-4 p-1 ${isDark ? "bg-[#0B0D12] text-[#F5F7FA]" : "bg-[#e8e4db] text-[#1a1a1a]"}`}>
      <div className="mx-auto max-w-8xl">
        {/* ── Back + header ─────────────────────────────────── */}
        <div className="mb-5 flex items-center gap-3">
          <button
            onClick={() => navigate("/study-section")}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition ${
              isDark
                ? "border-[#23262D] bg-[#111318] text-[#A1A8B3] hover:bg-[#161920]"
                : "border-[#d8d4cb] bg-[#f2efe9] text-[#4a4a4a] hover:bg-[#e8e4db]"
            }`}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className={`text-xl font-extrabold tracking-tight md:text-2xl ${isDark ? "" : "font-serif"}`}>
              Study Group
            </h1>
            <p className={`text-xs ${isDark ? "text-[#A1A8B3]" : "text-[#4a4a4a] font-serif italic"}`}>
              আমাদের কমিউনিটিতে যোগ দিন — Facebook, Instagram, YouTube এবং আরও অনেক কিছু
            </p>
          </div>
        </div>

        {/* ── Links grid ────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`rounded-xl border p-5 ${isDark ? "border-[#23262D] bg-[#111318]" : "border-[#d8d4cb] bg-[#f2efe9]"}`}>
                <div className={`mb-4 h-12 w-12 animate-pulse rounded-xl ${isDark ? "bg-[#23262D]" : "bg-[#e0dcd5]"}`} />
                <div className={`mb-2 h-4 w-1/2 animate-pulse rounded ${isDark ? "bg-[#23262D]" : "bg-[#e0dcd5]"}`} />
                <div className={`h-3 w-3/4 animate-pulse rounded ${isDark ? "bg-[#23262D]" : "bg-[#e0dcd5]"}`} />
              </div>
            ))}
          </div>
        ) : links.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center rounded-xl border py-16 text-center ${
              isDark ? "border-[#23262D] bg-[#111318] text-[#A1A8B3]" : "border-[#d8d4cb] bg-[#f2efe9] text-[#4a4a4a]"
            }`}
          >
            <Users size={36} className="mb-3 opacity-40" />
            <p className="text-sm font-medium">কোনো লিংক যোগ করা হয়নি</p>
            <p className="mt-1 text-xs opacity-70">শীঘ্রই আমাদের সোশ্যাল মিডিয়া লিংক এখানে যুক্ত করা হবে</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((link) => {
              const meta = PLATFORM_META[link.platform] ?? PLATFORM_META.other;
              return (
                <a
                  key={link._id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-start gap-4 rounded-xl p-5 transition ${
                    isDark
                      ? "border border-[#23262D] bg-[#111318] hover:border-[#2F80ED]/50 hover:bg-[#161920]"
                      : "border border-[#d8d4cb] bg-[#f2efe9] shadow-[1px_1px_0px_0px_#1a1a1a] hover:shadow-[3px_3px_0px_0px_#1a1a1a] hover:-translate-y-0.5"
                  }`}
                >
                  <span
                    className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    {link.iconUrl ? <img src={link.iconUrl} alt="" className="h-6 w-6 object-contain" /> : meta.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className={`truncate text-sm font-semibold ${isDark ? "text-[#F5F7FA]" : "text-[#1a1a1a] font-serif font-bold"}`}>
                        {link.title}
                      </span>
                      <span className="shrink-0 opacity-0 transition group-hover:opacity-100">
                        <Link2 size={14} className={isDark ? "text-[#2F80ED]" : "text-[#b91c1c]"} />
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-wide" style={{ color: meta.color }}>
                      {meta.label}
                    </span>
                    {link.description && (
                      <span className={`mt-1 block text-xs leading-relaxed ${isDark ? "text-[#A1A8B3]" : "text-[#4a4a4a] font-serif"}`}>
                        {link.description}
                      </span>
                    )}
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyGroupSection;
