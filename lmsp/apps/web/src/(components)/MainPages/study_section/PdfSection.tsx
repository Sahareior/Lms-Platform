import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Download,
  FileText,
  Loader2,
  Search,
  X,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  useGetStudyPdfsQuery,
  useIncrementPdfDownloadMutation,
  type StudyPdf,
} from "@my-monorepo/store";
import { useTheme } from "../../../theme/ThemeContext";

/* ─────────────────────────────────────────────────────────────
   PDF Card
───────────────────────────────────────────────────────────── */
const PdfCard = ({
  pdf,
  isDark,
  onOpen,
  onDownload,
  isOpen,
}: {
  pdf: StudyPdf;
  isDark: boolean;
  onOpen: () => void;
  onDownload?: (e: React.MouseEvent, pdf: StudyPdf) => void;
  isOpen?: boolean;
}) => {
  const isAcademic = pdf.category === "academic";

  return (
    <article
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className={`group flex cursor-pointer flex-col rounded-xl p-4 transition-all duration-300 focus:outline-none focus-visible:ring-2 ${isDark
          ? "border border-[#23262D] bg-[#111318] hover:border-[#2F80ED]/60 hover:bg-[#141720] hover:shadow-[0_8px_32px_-12px_rgba(47,128,237,0.35)] hover:-translate-y-0.5 focus-visible:ring-[#2F80ED]/50"
          : "border-2 border-[#1a1a1a] bg-[#f2efe9] shadow-[3px_3px_0px_0px_#1a1a1a] hover:shadow-[5px_5px_0px_0px_#1a1a1a] hover:-translate-y-1 focus-visible:ring-[#b91c1c]/50"
        }`}
      style={
        !isDark
          ? {
            backgroundImage:
              "radial-gradient(#d8d4cb 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }
          : undefined
      }
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <span
          className={`inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg ${isDark
              ? "bg-[#EB5757]/10 text-[#EB5757] border border-[#EB5757]/25"
              : "bg-[#1a1a1a] text-[#f2efe9] border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#b91c1c]"
            }`}
        >
          <FileText size={20} />
        </span>

        <div className="flex flex-col items-end gap-1.5">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider ${isDark
                ? isAcademic
                  ? "bg-[#2F80ED]/10 text-[#2F80ED] border border-[#2F80ED]/25 font-bold"
                  : "bg-[#F2994A]/10 text-[#F2994A] border border-[#F2994A]/25 font-bold"
                : "bg-[#e0dcd5] text-[#1a1a1a] border border-[#d8d4cb] font-black font-serif"
              }`}
          >
            {isAcademic ? "Academic" : "Job"}
          </span>

          {(pdf.downloadCount ?? 0) > 0 && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${isDark
                  ? "bg-[#161920] text-[#A1A8B3] border border-[#23262D] font-medium"
                  : "bg-[#f2efe9] text-[#4a4a4a] border border-[#d8d4cb] font-black font-serif"
                }`}
            >
              <Download size={9} />
              {pdf.downloadCount}
            </span>
          )}
        </div>
      </div>

      <h3
        className={`mb-1.5 line-clamp-2 text-[15px] leading-snug transition-colors ${isDark
            ? "font-bold text-[#F5F7FA] group-hover:text-[#2F80ED]"
            : "font-black font-serif text-[#1a1a1a] group-hover:text-[#b91c1c]"
          }`}
      >
        {pdf.title}
      </h3>

      {pdf.description && (
        <p
          className={`mb-3 line-clamp-2 text-xs leading-relaxed ${isDark ? "text-[#A1A8B3]" : "text-[#333] font-serif"
            }`}
        >
          {pdf.description}
        </p>
      )}

      <div
        className={`mt-auto flex items-center justify-between border-t pt-3 text-[11px] ${isDark ? "border-[#23262D] text-[#6B7280]" : "border-[#d8d4cb] text-[#4a4a4a]"
          }`}
      >
        <span className="inline-flex items-center gap-1.5">
          <Download size={11} />
          {pdf.downloadCount ?? 0}{" "}
          <span className={isDark ? "" : "font-serif"}>downloads</span>
        </span>

        <div className="flex items-center gap-2">
          {onDownload && (
            <button
              type="button"
              onClick={(e) => onDownload(e, pdf)}
              title="Download file"
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded transition ${isDark
                  ? "hover:bg-[#23262D] text-[#A1A8B3] hover:text-[#F5F7FA]"
                  : "hover:bg-[#d8d4cb] text-[#4a4a4a] hover:text-[#1a1a1a]"
                }`}
            >
              <Download size={12} />
              <span>Save</span>
            </button>
          )}
          <span
            className={`inline-flex items-center gap-1 transition-transform group-hover:translate-x-0.5 ${isDark
                ? "font-bold text-[#2F80ED]"
                : "font-black font-serif text-[#b91c1c]"
              }`}
          >
            {isOpen ? "Opening…" : "Open"}
            {isOpen ? <Loader2 size={11} className="animate-spin" /> : <ExternalLink size={11} />}
          </span>
        </div>
      </div>
    </article>
  );
};

/* ─────────────────────────────────────────────────────────────
   Skeleton
───────────────────────────────────────────────────────────── */
const PdfCardSkeleton = ({ isDark }: { isDark: boolean }) => (
  <div
    className={`rounded-xl p-4 ${isDark
        ? "border border-[#23262D] bg-[#111318]"
        : "border-2 border-[#1a1a1a] bg-[#f2efe9] shadow-[3px_3px_0px_0px_#1a1a1a]"
      }`}
  >
    <div className="mb-3 flex items-start justify-between">
      <div
        className={`h-11 w-11 animate-pulse rounded-lg ${isDark ? "bg-[#23262D]" : "bg-[#e0dcd5]"
          }`}
      />
      <div
        className={`h-5 w-16 animate-pulse rounded-full ${isDark ? "bg-[#23262D]" : "bg-[#e0dcd5]"
          }`}
      />
    </div>
    <div
      className={`mb-2 h-4 w-3/4 animate-pulse rounded ${isDark ? "bg-[#23262D]" : "bg-[#e0dcd5]"
        }`}
    />
    <div
      className={`mb-2 h-3 w-full animate-pulse rounded ${isDark ? "bg-[#23262D]" : "bg-[#e0dcd5]"
        }`}
    />
    <div
      className={`mb-4 h-3 w-5/6 animate-pulse rounded ${isDark ? "bg-[#23262D]" : "bg-[#e0dcd5]"
        }`}
    />
    <div className="flex justify-between pt-2">
      <div
        className={`h-3 w-20 animate-pulse rounded ${isDark ? "bg-[#23262D]" : "bg-[#e0dcd5]"
          }`}
      />
      <div
        className={`h-3 w-12 animate-pulse rounded ${isDark ? "bg-[#23262D]" : "bg-[#e0dcd5]"
          }`}
      />
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   PdfSection
───────────────────────────────────────────────────────────── */
const PdfSection = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const activeCategory =
    (params.category as "academic" | "job" | undefined) ??
    (location.pathname.includes("/job") ? "job" : "academic");

  const [search, setSearch] = useState("");
  const { data, isLoading } = useGetStudyPdfsQuery({ category: activeCategory });
  const [incrementDownload] = useIncrementPdfDownloadMutation();

  const pdfs = data?.pdfs ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pdfs;
    return pdfs.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q)
    );
  }, [pdfs, search]);

  const [openingId, setOpeningId] = useState<string | null>(null);

  const handleOpen = async (pdf: StudyPdf) => {
    if (openingId) return;
    setOpeningId(pdf._id);
    try {
      const res = await fetch(pdf.fileUrl);
      if (!res.ok) throw new Error(`Failed to fetch PDF (${res.status})`);
      const blob = await res.blob();
      const pdfBlob = blob.type?.includes("pdf") ? blob : new Blob([blob], { type: "application/pdf" });
      const url = URL.createObjectURL(pdfBlob);
      const win = window.open(url, "_blank", "noopener,noreferrer");
      if (!win) {
        window.location.href = url;
      }
      // Give the new tab time to start loading before revoking.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      incrementDownload(pdf._id);
    } catch (err) {
      console.error("PDF open failed:", err);
      // Fallback: navigate directly to the original URL.
      window.open(pdf.fileUrl, "_blank", "noopener,noreferrer");
    } finally {
      setOpeningId(null);
    }
  };

  const handleDownload = async (e: React.MouseEvent, pdf: StudyPdf) => {
    e.stopPropagation();
    try {
      const res = await fetch(pdf.fileUrl);
      if (!res.ok) throw new Error(`Download failed (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = pdf.fileName || `${pdf.title.replace(/[^a-zA-Z0-9-_]/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      incrementDownload(pdf._id);
    } catch {
      window.open(pdf.fileUrl, "_blank", "noopener,noreferrer");
    }
  };

  const tabs: {
    key: "academic" | "job";
    label: string;
    subtitle: string;
    icon: React.ReactNode;
  }[] = [
      {
        key: "academic",
        label: "Academic",
        subtitle: "SSC · HSC · Admission",
        icon: <FileText size={16} />,
      },
      {
        key: "job",
        label: "Job",
        subtitle: "BCS · Bank · Teacher",
        icon: <FileText size={16} />,
      },
    ];

  return (
    <div
      className={`min-h-screen md:p-4 p-1 ${isDark ? "bg-[#0B0D12] text-[#F5F7FA]" : "bg-[#e8e4db] text-[#1a1a1a]"
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
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="mb-6 flex items-start gap-3">
          <button
            onClick={() => navigate("/study-section")}
            aria-label="Back to study section"
            className={`inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition ${isDark
                ? "border border-[#23262D] bg-[#111318] text-[#A1A8B3] hover:border-[#323742] hover:text-[#F5F7FA]"
                : "border-2 border-[#1a1a1a] bg-[#f2efe9] text-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a] hover:shadow-[3px_3px_0px_0px_#1a1a1a]"
              }`}
          >
            <ArrowLeft size={16} />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles
                size={14}
                className={isDark ? "text-[#EB5757]" : "text-[#b91c1c]"}
              />
              <span
                className={`text-[10px] uppercase tracking-widest ${isDark
                    ? "text-[#6B7280] font-bold"
                    : "text-[#b91c1c] font-black font-serif"
                  }`}
              >
                Study Section
              </span>
            </div>
            <h1
              className={`text-2xl tracking-tight md:text-3xl ${isDark
                  ? "font-extrabold"
                  : "font-black font-serif text-[#1a1a1a]"
                }`}
            >
              PDF Section
            </h1>
            <p
              className={`mt-1 text-xs md:text-sm ${isDark ? "text-[#A1A8B3]" : "text-[#333] font-serif"
                }`}
            >
              Academic ও Job প্রস্তুতির জন্য প্রয়োজনীয় PDF ডাউনলোড করুন
            </p>
          </div>
        </div>

        {/* ── Segmented Card Tabs (NEW DESIGN) ──────────────── */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {tabs.map((tab) => {
            const active = activeCategory === tab.key;

            if (isDark) {
              return (
                <button
                  key={tab.key}
                  onClick={() => navigate(`/study-section/pdf/${tab.key}`)}
                  className={`group relative flex items-center gap-4 overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 ${active
                      ? "border-[#2F80ED]/60 bg-gradient-to-br from-[#161920] to-[#0F1218] shadow-[0_8px_32px_-12px_rgba(47,128,237,0.5)]"
                      : "border-[#23262D] bg-[#111318] hover:border-[#323742] hover:bg-[#141720]"
                    }`}
                >
                  {/* Active glow */}
                  {active && (
                    <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#2F80ED]/20 blur-2xl" />
                  )}

                  {/* Icon */}
                  <div
                    className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border transition-all ${active
                        ? "border-[#2F80ED]/40 bg-[#2F80ED]/15 text-[#2F80ED] shadow-[0_0_20px_-4px_rgba(47,128,237,0.6)]"
                        : "border-[#23262D] bg-[#161920] text-[#6B7280] group-hover:text-[#A1A8B3]"
                      }`}
                  >
                    {tab.icon}
                  </div>

                  {/* Text */}
                  <div className="relative z-10 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-base tracking-tight ${active
                            ? "font-extrabold text-[#F5F7FA]"
                            : "font-bold text-[#A1A8B3] group-hover:text-[#F5F7FA]"
                          }`}
                      >
                        {tab.label}
                      </span>
                      {active && (
                        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#2F80ED] shadow-[0_0_8px_#2F80ED] animate-pulse" />
                      )}
                    </div>
                    <p
                      className={`mt-0.5 text-[11px] ${active ? "text-[#A1A8B3]" : "text-[#6B7280]"
                        }`}
                    >
                      {tab.subtitle}
                    </p>
                  </div>

                  {/* Active indicator bar */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-0.5 transition-transform duration-300 ${active ? "bg-[#2F80ED] scale-x-100" : "bg-transparent scale-x-0"
                      }`}
                  />
                </button>
              );
            }

            // ─── LIGHT MODE: vintage editorial card-tab ───
            return (
              <button
                key={tab.key}
                onClick={() => navigate(`/study-section/pdf/${tab.key}`)}
                className={`group relative flex items-center gap-4 overflow-hidden rounded-lg border-2 border-[#1a1a1a] p-4 text-left transition-all duration-300 ${active
                    ? "bg-[#f2efe9] shadow-[5px_5px_0px_0px_#1a1a1a] -translate-y-0.5"
                    : "bg-[#e8e4db] shadow-[2px_2px_0px_0px_#1a1a1a] hover:shadow-[4px_4px_0px_0px_#1a1a1a] hover:-translate-y-0.5"
                  }`}
                style={{
                  backgroundImage:
                    "radial-gradient(#d8d4cb 1px, transparent 1px)",
                  backgroundSize: "16px 16px",
                }}
              >
                {/* Icon — solid black box with red shadow when active */}
                <div
                  className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border-2 border-[#1a1a1a] transition-all ${active
                      ? "bg-[#1a1a1a] text-[#f2efe9] shadow-[2px_2px_0px_0px_#b91c1c]"
                      : "bg-[#f2efe9] text-[#1a1a1a]"
                    }`}
                >
                  {tab.icon}
                </div>

                {/* Text */}
                <div className="relative z-10 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-base tracking-tight font-black font-serif ${active
                          ? "text-[#b91c1c]"
                          : "text-[#1a1a1a] group-hover:text-[#b91c1c]"
                        } transition-colors`}
                    >
                      {tab.label}
                    </span>
                    {active && (
                      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#b91c1c]" />
                    )}
                  </div>
                  <p
                    className={`mt-0.5 text-[11px] font-serif ${active ? "text-[#333]" : "text-[#4a4a4a]"
                      }`}
                  >
                    {tab.subtitle}
                  </p>
                </div>

                {/* Right arrow indicator */}
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-md border-2 border-[#1a1a1a] transition-all ${active
                      ? "bg-[#b91c1c] text-[#f2efe9]"
                      : "bg-[#f2efe9] text-[#1a1a1a] group-hover:bg-[#1a1a1a] group-hover:text-[#f2efe9]"
                    }`}
                >
                  <span className="text-[10px] font-black font-serif">
                    {active ? "●" : "→"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Search ─────────────────────────────────────────── */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            className={`flex flex-1 items-center gap-2 rounded-lg px-3 py-2.5 sm:max-w-sm ${isDark
                ? "border border-[#23262D] bg-[#111318] focus-within:border-[#2F80ED]/60"
                : "border-2 border-[#1a1a1a] bg-[#f2efe9] shadow-[2px_2px_0px_0px_#1a1a1a] focus-within:shadow-[3px_3px_0px_0px_#1a1a1a]"
              } transition-all`}
          >
            <Search
              size={14}
              className={isDark ? "text-[#6B7280]" : "text-[#4a4a4a]"}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search PDFs…"
              className={`w-full bg-transparent text-sm outline-none ${isDark
                  ? "text-[#F5F7FA] placeholder:text-[#6B7280]"
                  : "text-[#1a1a1a] placeholder:text-[#7a7a7a] font-serif"
                }`}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className={`rounded-md p-1 transition ${isDark
                    ? "text-[#6B7280] hover:text-[#F5F7FA] hover:bg-[#161920]"
                    : "text-[#4a4a4a] hover:text-[#b91c1c] hover:bg-[#e0dcd5]"
                  }`}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {!isLoading && filtered.length > 0 && (
            <span
              className={`text-xs sm:text-right ${isDark
                  ? "text-[#6B7280] font-semibold"
                  : "text-[#4a4a4a] font-black font-serif"
                }`}
            >
              {filtered.length} {filtered.length === 1 ? "PDF" : "PDFs"}
              {search && ` · filtered`}
            </span>
          )}
        </div>

        {/* ── Grid ──────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <PdfCardSkeleton key={i} isDark={isDark} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center rounded-xl border py-20 text-center ${isDark
                ? "border-[#23262D] bg-[#111318] text-[#A1A8B3]"
                : "border-2 border-[#1a1a1a] bg-[#f2efe9] text-[#333] shadow-[3px_3px_0px_0px_#1a1a1a]"
              }`}
          >
            <FileText
              size={40}
              className={`mb-3 ${isDark ? "text-[#EB5757]/40" : "text-[#b91c1c]/50"
                }`}
            />
            <p
              className={`text-sm ${isDark ? "font-semibold" : "font-black font-serif"
                }`}
            >
              {search ? "No matching PDFs" : "No PDFs found"}
            </p>
            <p
              className={`mt-1 text-xs ${isDark ? "text-[#6B7280]" : "text-[#4a4a4a] font-serif"
                }`}
            >
              {search
                ? "Try a different search term"
                : `No ${activeCategory === "academic" ? "academic" : "job"} PDFs uploaded yet`}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className={`mt-4 rounded-md px-4 py-2 text-xs transition ${isDark
                    ? "bg-[#2F80ED] text-white font-semibold hover:bg-[#256BCE]"
                    : "border-2 border-[#1a1a1a] bg-[#1a1a1a] text-[#f2efe9] font-black font-serif shadow-[2px_2px_0px_0px_#b91c1c] hover:shadow-[3px_3px_0px_0px_#b91c1c]"
                  }`}
              >
                Reset search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((pdf) => (
              <PdfCard
                key={pdf._id}
                pdf={pdf}
                isDark={isDark}
                onOpen={() => handleOpen(pdf)}
                onDownload={handleDownload}
                isOpen={openingId === pdf._id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfSection;