import { ArrowLeft, CalendarDays, User } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { useGetBlogPostByIdQuery } from "@my-monorepo/store";
import { useTheme } from "../../../theme/ThemeContext";

const BlogPostDetail = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { postId } = useParams();

  const { data, isLoading, error } = useGetBlogPostByIdQuery(postId!, {
    skip: !postId,
  });

  const post = data?.post;

  return (
    <div
      className={`min-h-screen md:p-4 p-1 ${
        isDark ? "bg-[#0B0D12] text-[#F5F7FA]" : "bg-[#e8e4db] text-[#1a1a1a]"
      }`}
      style={
        isDark
          ? undefined
          : {
              backgroundImage: "radial-gradient(#d8d4cb 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }
      }
    >
      {/* Scoped overrides for Quill HTML content so it can't overflow the card */}
      <style>{`
        .blog-content,
        .blog-content * {
          max-width: 100%;
          box-sizing: border-box;
        }
        .blog-content {
          word-wrap: break-word;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .blog-content img,
        .blog-content iframe,
        .blog-content video,
        .blog-content table {
          max-width: 100% !important;
          height: auto !important;
        }
        .blog-content pre,
        .blog-content code {
          white-space: pre-wrap;
          word-break: break-word;
          overflow-x: auto;
        }
        .blog-content table {
          width: 100%;
          border-collapse: collapse;
          display: block;
          overflow-x: auto;
        }
        .blog-content ol,
        .blog-content ul {
          padding-left: 1.25rem;
        }
        .blog-content blockquote {
          border-left: 3px solid currentColor;
          padding-left: 1rem;
          margin-left: 0;
          margin-right: 0;
          opacity: 0.85;
        }
      `}</style>

      <div className="mx-auto max-w-7xl w-full">
        {/* ── Back button ───────────────────────────────────── */}
        <button
          onClick={() => navigate("/study-section/posts")}
          className={`mb-5 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
            isDark
              ? "border-[#23262D] bg-[#111318] text-[#A1A8B3] font-medium hover:bg-[#161920]"
              : "border-2 border-[#1a1a1a] bg-[#f2efe9] text-[#1a1a1a] font-black font-serif shadow-[2px_2px_0px_0px_#1a1a1a] hover:shadow-[3px_3px_0px_0px_#1a1a1a]"
          }`}
        >
          <ArrowLeft size={14} />
          সব পোস্ট
        </button>

        {isLoading ? (
          <div className="animate-pulse">
            <div
              className={`mb-4 h-56 w-full rounded-xl ${
                isDark ? "bg-[#23262D]" : "bg-[#e0dcd5] border-2 border-[#1a1a1a]"
              }`}
            />
            <div
              className={`mb-3 h-6 w-3/4 rounded ${
                isDark ? "bg-[#23262D]" : "bg-[#e0dcd5] border-2 border-[#1a1a1a]"
              }`}
            />
            <div
              className={`mb-2 h-4 w-full rounded ${
                isDark ? "bg-[#23262D]" : "bg-[#e0dcd5] border-2 border-[#1a1a1a]"
              }`}
            />
            <div
              className={`mb-2 h-4 w-full rounded ${
                isDark ? "bg-[#23262D]" : "bg-[#e0dcd5] border-2 border-[#1a1a1a]"
              }`}
            />
            <div
              className={`h-4 w-2/3 rounded ${
                isDark ? "bg-[#23262D]" : "bg-[#e0dcd5] border-2 border-[#1a1a1a]"
              }`}
            />
          </div>
        ) : error || !post ? (
          <div
            className={`flex flex-col items-center justify-center rounded-xl border py-16 text-center ${
              isDark
                ? "border-[#23262D] bg-[#111318] text-[#A1A8B3]"
                : "border-2 border-[#1a1a1a] bg-[#f2efe9] text-[#333] shadow-[3px_3px_0px_0px_#1a1a1a]"
            }`}
          >
            <p
              className={`text-sm ${
                isDark ? "font-medium" : "font-black font-serif"
              }`}
            >
              পোস্টটি পাওয়া যায়নি
            </p>
            <button
              onClick={() => navigate("/study-section/posts")}
              className={`mt-3 rounded-lg px-4 py-2 text-xs ${
                isDark
                  ? "bg-[#2F80ED] text-white font-semibold"
                  : "bg-[#1a1a1a] text-[#f2efe9] border-2 border-[#1a1a1a] font-black font-serif shadow-[2px_2px_0px_0px_#b91c1c] hover:shadow-[3px_3px_0px_0px_#b91c1c]"
              }`}
            >
              সব পোস্ট দেখুন
            </button>
          </div>
        ) : (
          <article className="w-full min-w-0">
            {post.coverImage && (
              <img
                src={post.coverImage}
                alt={post.title}
                className={`mb-6 h-[80vh] w-full rounded-xl object-cover ${
                  isDark
                    ? ""
                    : "border-2 border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a]"
                }`}
              />
            )}

            <h1
              className={`mb-3 text-3xl tracking-tight md:text-5xl ${
                isDark ? "font-extrabold" : "font-black font-serif text-[#1a1a1a]"
              }`}
            >
              {post.title}
            </h1>

            <div
              className={`mb-6 flex flex-wrap items-center gap-4 text-sm ${
                isDark ? "text-[#A1A8B3]" : "text-[#333] font-serif"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <User size={13} />
                {post.author || "BrainForge Team"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={13} />
                {dayjs(post.createdAt).format("DD MMMM YYYY")}
              </span>
              {(post.excerpt || post.content) && (
                <span className="hidden md:inline">
                  {Math.max(
                    1,
                    Math.ceil(
                      post.content.replace(/<[^>]+>/g, " ").split(/\s+/).length /
                        200
                    )
                  )}{" "}
                  min read
                </span>
              )}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`rounded-full px-3 py-1 text-[11px] ${
                      isDark
                        ? "bg-[#2F80ED]/10 text-[#2F80ED] font-medium"
                        : "bg-[#e0dcd5] text-[#1a1a1a] border border-[#d8d4cb] font-black font-serif"
                    }`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* ── Rich text content (Quill HTML) ─────────────── */}
            <div
              className={`blog-content text-base leading-8 w-full overflow-hidden ${
                isDark
                  ? "text-[#C9CFD8]"
                  : "text-[#1a1a1a] font-serif bg-[#f2efe9] border-2 border-[#1a1a1a] rounded-lg p-6 shadow-[4px_4px_0px_0px_#1a1a1a]"
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
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>
        )}
      </div>
    </div>
  );
};

export default BlogPostDetail;