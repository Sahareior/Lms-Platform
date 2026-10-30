import { useState } from "react";
import { ArrowLeft, CalendarDays, BookOpen, Search, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useGetBlogPostsQuery, type BlogPost } from "@my-monorepo/store";
import { useTheme } from "../../../theme/ThemeContext";

// ─── Post card ─────────────────────────────────────────────────
const PostCard = ({ post, isDark, onOpen }: { post: BlogPost; isDark: boolean; onOpen: () => void }) => (
  <div
    onClick={onOpen}
    className={`group flex cursor-pointer flex-col overflow-hidden rounded-xl transition duration-200 ${
      isDark
        ? "border border-[#23262D] bg-[#111318] hover:border-[#2F80ED]/50 hover:bg-[#161920]"
        : "border border-[#d8d4cb] bg-[#f2efe9] shadow-[1px_1px_0px_0px_#1a1a1a] hover:shadow-[3px_3px_0px_0px_#1a1a1a] hover:-translate-y-0.5"
    }`}
  >
    {post.coverImage ? (
      <img src={post.coverImage} alt={post.title} className="h-36 w-full object-cover" loading="lazy" />
    ) : (
      <div
        className={`flex h-36 w-full items-center justify-center ${
          isDark ? "bg-gradient-to-br from-[#161920] to-[#0B0D12] text-[#2F80ED]/40" : "bg-[#e8e4db] text-[#b91c1c]/30"
        }`}
      >
        <BookOpen size={36} />
      </div>
    )}
    <div className="flex flex-1 flex-col p-4">
      <h3 className={`mb-2 line-clamp-2 text-base font-semibold leading-snug ${isDark ? "text-[#F5F7FA]" : "text-[#1a1a1a] font-serif font-bold"}`}>
        {post.title}
      </h3>
      <p className={`mb-3 line-clamp-3 text-sm leading-6 ${isDark ? "text-[#A1A8B3]" : "text-[#4a4a4a] font-serif"}`}>
        {post.excerpt || post.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}
      </p>
      <div className={`mt-auto flex items-center justify-between border-t pt-2 text-xs ${isDark ? "border-[#23262D] text-[#6B7280]" : "border-[#d8d4cb] text-[#7a7a7a]"}`}>
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays size={12} />
          {dayjs(post.createdAt).format("DD MMM YYYY")}
        </span>
        {post.tags && post.tags.length > 0 && (
          <span className="inline-flex max-w-[55%] items-center gap-1 truncate">
            <Tag size={12} className="shrink-0" />
            <span className="truncate">{post.tags.slice(0, 2).join(", ")}</span>
          </span>
        )}
      </div>
    </div>
  </div>
);

const PostCardSkeleton = ({ isDark }: { isDark: boolean }) => (
  <div className={`overflow-hidden rounded-xl border ${isDark ? "border-[#23262D] bg-[#111318]" : "border-[#d8d4cb] bg-[#f2efe9]"}`}>
    <div className={`h-36 w-full animate-pulse ${isDark ? "bg-[#23262D]" : "bg-[#e0dcd5]"}`} />
    <div className="p-4">
      <div className={`mb-2 h-4 w-3/4 animate-pulse rounded ${isDark ? "bg-[#23262D]" : "bg-[#e0dcd5]"}`} />
      <div className={`mb-2 h-3 w-full animate-pulse rounded ${isDark ? "bg-[#23262D]" : "bg-[#e0dcd5]"}`} />
      <div className={`h-3 w-1/2 animate-pulse rounded ${isDark ? "bg-[#23262D]" : "bg-[#e0dcd5]"}`} />
    </div>
  </div>
);

const BlogSection = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGetBlogPostsQuery();
  const posts = (data?.posts ?? []).filter((p) =>
    search ? p.title.toLowerCase().includes(search.toLowerCase()) : true
  );

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
            <h1 className={`text-2xl font-extrabold tracking-tight md:text-3xl ${isDark ? "" : "font-serif"}`}>
              সাম্প্রতিক পোস্ট
            </h1>
            <p className={`text-sm ${isDark ? "text-[#A1A8B3]" : "text-[#4a4a4a] font-serif italic"}`}>
              সর্বশেষ খবর, টিপস ও আপডেট
            </p>
          </div>
        </div>

        {/* ── Search ────────────────────────────────────────── */}
        <div className="mb-5 flex justify-end">
          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${isDark ? "border border-[#23262D] bg-[#111318]" : "border border-[#d8d4cb] bg-[#f2efe9]"}`}>
            <Search size={14} className={isDark ? "text-[#6B7280]" : "text-[#7a7a7a]"} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="পোস্ট খুঁজুন…"
              className={`w-44 bg-transparent text-sm outline-none md:w-64 ${
                isDark ? "text-[#F5F7FA] placeholder:text-[#6B7280]" : "text-[#1a1a1a] placeholder:text-[#9a9a9a]"
              }`}
            />
          </div>
        </div>

        {/* ── Grid ──────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <PostCardSkeleton key={i} isDark={isDark} />)}
          </div>
        ) : posts.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center rounded-xl border py-16 text-center ${
              isDark ? "border-[#23262D] bg-[#111318] text-[#A1A8B3]" : "border-[#d8d4cb] bg-[#f2efe9] text-[#4a4a4a]"
            }`}
          >
            <BookOpen size={36} className="mb-3 opacity-40" />
            <p className="text-base font-medium">কোনো পোস্ট পাওয়া যায়নি</p>
            <p className="mt-1 text-sm opacity-70">{search ? "অন্য কিছু দিয়ে খুঁজে দেখুন" : "শীঘ্রই নতুন পোস্ট আসছে"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                isDark={isDark}
                onOpen={() => navigate(`/study-section/posts/${post._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogSection;
