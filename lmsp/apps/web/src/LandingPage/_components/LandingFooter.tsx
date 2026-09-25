import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTheme } from "../../theme/ThemeContext";

const LandingFooter = () => {
  const { isDark } = useTheme();

  // ─── LIGHT MODE (Vintage Paper Style) ───────────────────────
  if (!isDark) {
    return (
      <footer
        aria-label="Site footer"
        className="bg-[#e8e4db] px-2 lg:px-14 pt-16 pb-8 border-t-2 border-[#1a1a1a]"
        style={{
          backgroundImage: 'radial-gradient(#d8d4cb 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        <div className="max-w-[1240px] mx-auto">
          {/* FOOTER MAIN */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 pb-10">
            {/* Brand */}
            <div className="max-w-[300px]">
              <Link to="/" aria-label="Geneseon home" className="inline-flex items-center gap-2.5 mb-4">
                <img className="w-9" src="/logo1.webp" alt="" />
                <span className="text-sm font-black tracking-[0.3em] text-[#1a1a1a] font-serif">
                  GENESEON
                </span>
              </Link>

              <p className="max-w-[260px] text-sm leading-relaxed text-[#4a4a4a] font-serif italic">
                Empowering the next generation through accessible, innovative and impactful education.
              </p>
            </div>

            {/* Newsletter */}
            <div className="w-full md:w-auto md:max-w-[320px]">
              <h4 className="text-sm font-black text-[#1a1a1a] mb-4 font-serif">
                Stay updated
              </h4>

              <p className="text-[13px] text-[#4a4a4a] mb-4 font-serif italic">
                Subscribe to our newsletter
              </p>

              <div className="flex h-10 overflow-hidden rounded-md border border-[#1a1a1a] bg-[#f2efe9] shadow-[2px_2px_0px_0px_#1a1a1a]">
                <input
                  type="email"
                  name="newsletter-email"
                  aria-label="Email address for newsletter"
                  placeholder="Enter your email"
                  className="min-w-0 flex-1 bg-transparent px-3 text-[13px] text-[#1a1a1a] outline-none placeholder:text-[#4a4a4a] font-serif"
                />
                <button className="flex w-10 items-center justify-center bg-[#1a1a1a] text-[#f2efe9] hover:bg-[#333] transition-colors">
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* COPYRIGHT */}
          <div className="border-t border-[#d8d4cb] pt-6 text-center">
            <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-6">
              <p className="text-xs text-[#4a4a4a] font-serif">
                © 2026 Geneseon. All rights reserved.
              </p>

              <Link
                to="/privacy-policy"
                className="text-xs text-[#4a4a4a] transition-colors hover:text-[#b91c1c] font-serif"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // ─── DARK MODE (Original, unchanged) ─────────────────────────
  return (
    <footer
      aria-label="Site footer"
      className="bg-[#020409] px-2 lg:px-14 pt-16 pb-8"
    >
      <div className="max-w-[1240px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 pb-10">
          {/* Brand */}
          <div className="max-w-[300px]">
            <Link to="/" aria-label="Geneseon home" className="inline-flex items-center gap-2.5 mb-4">
              <img className="w-9" src="/logo1.webp" alt="" />
              <span className="text-sm font-medium tracking-[0.3em] text-white">
                GENESEON
              </span>
            </Link>

            <p className="max-w-[260px] text-sm leading-relaxed text-gray-500">
              Empowering the next generation through accessible, innovative and impactful education.
            </p>
          </div>

          {/* Newsletter */}
          <div className="w-full md:w-auto md:max-w-[320px]">
            <h4 className="text-sm font-medium text-gray-300 mb-4">
              Stay updated
            </h4>

            <p className="text-[13px] text-gray-500 mb-4">
              Subscribe to our newsletter
            </p>

            <div className="flex h-10 overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.02]">
              <input
                type="email"
                name="newsletter-email"
                aria-label="Email address for newsletter"
                placeholder="Enter your email"
                className="min-w-0 flex-1 bg-transparent px-3 text-[13px] text-white outline-none placeholder:text-gray-600"
              />
              <button className="flex w-10 items-center justify-center bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors">
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.05] pt-6 text-center">
          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-6">
            <p className="text-xs text-gray-600">
              © 2026 Geneseon. All rights reserved.
            </p>
            <Link
              to="/privacy-policy"
              className="text-xs text-gray-600 transition-colors hover:text-gray-300"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;