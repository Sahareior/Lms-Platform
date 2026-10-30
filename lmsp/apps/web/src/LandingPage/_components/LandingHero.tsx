import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { gradientBtn } from "../landingTools/landingTools";
import { useTheme } from "../../theme/ThemeContext";

// Lazy-load the heavy Three.js earth (600KB JS + ~12MB textures)
const EarthCanvas = lazy(() => import("../../threejs/EarthCanvas"));

// Transparent placeholder while the 3D scene loads
const EarthFallback = () => <div className="absolute inset-0" />;

const LandingHero = () => {
  const { isDark } = useTheme();

  // ─── LIGHT MODE (Vintage Paper Style) ───────────────────────
  if (!isDark) {
    return (
      <section
        id="home"
        className="relative min-h-[calc(100vh+94px)] overflow-hidden bg-[#e8e4db] text-[#1a1a1a]"
      >
        {/* ─── HERO BACKGROUND ─── */}
        <div className="absolute inset-0">
          {/* Earth canvas kept as texture, but visually faded into paper */}
          <div className="absolute inset-0 opacity-30">
            <Suspense fallback={<EarthFallback />}>
              <EarthCanvas />
            </Suspense>
          </div>

          {/* Cream overlay for vintage paper look */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(#d8d4cb 1px, transparent 1px), linear-gradient(to right, rgba(232,228,219,0.95) 0%, rgba(232,228,219,0.75) 48%, rgba(232,228,219,0.4) 100%)",
              backgroundSize: "16px 16px, 100% 100%",
            }}
          />

          {/* Bottom fade into cream */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#e8e4db] to-transparent" />

          {/* Top fade */}
          <div className="absolute inset-x-0 -top-1 h-32 bg-gradient-to-b from-[#e8e4db]/80 to-transparent" />
        </div>

        {/* ─── HERO CONTENT ─── */}
        <div className="relative z-10 min-h-screen max-w-[1400px] mx-auto px-2 lg:px-14 pt-16">
          {/* Main left content */}
          <div className="min-h-[calc(100vh-64px)] flex items-center">
            <div className="w-full max-w-[600px] pb-28 lg:pb-20">
              {/* Eyebrow */}
              <p className="mt-9 mb-6 text-[11px] sm:text-xs font-black tracking-[0.35em] uppercase text-[#b91c1c] font-serif">
                Distanced. Advanced. Genesis.
              </p>

              {/* Heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[76px] font-black leading-[1.02] tracking-[0.02em] text-[#1a1a1a] font-serif">
                THE NEXT
                <br />
                GENESIS OF
                <br />
                <span className="text-[#b91c1c]">LEARNING</span>
              </h1>

              {/* Description */}
              <p className="mt-8 max-w-[460px] text-sm sm:text-base leading-relaxed text-[#4a4a4a] font-serif italic">
                Geneseon is a next-generation learning platform where knowledge
                meets innovation.
                <br className="hidden sm:block" />
                Learn beyond limits. Achieve beyond ordinary.
              </p>

              {/* Buttons */}
              <div className="mt-10 flex items-center gap-6">
                <Link
                  to="/register"
                  className="group flex items-center gap-2.5 rounded-md px-7 py-3.5 text-sm font-black font-serif text-[#f2efe9] bg-[#1a1a1a] border border-[#1a1a1a] shadow-[2px_2px_0px_0px_#b91c1c] hover:shadow-[3px_3px_0px_0px_#b91c1c] transition-all active:scale-[0.97]"
                >
                  Explore Platform
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>
          </div>

          {/* ─── RIGHT SIDE — MISSION ─── */}
          <div className="absolute right-[7%] top-[42%] hidden xl:block w-[190px]">
            {/* Connection point */}
            <div className="absolute -left-3 top-1 w-[7px] h-[7px] rounded-full border-2 border-[#b91c1c]" />
            <div className="absolute -left-[1px] top-[7px] w-px h-16 bg-gradient-to-b from-[#b91c1c] to-transparent" />

            <p className="text-[11px] tracking-[0.16em] uppercase text-[#b91c1c] mb-3 font-black font-serif">
              Our Mission
            </p>

            <p className="text-sm leading-relaxed text-[#1a1a1a] font-serif">
              To empower minds and shape the future through accessible, impactful education.
            </p>
          </div>

          {/* ─── GENESEON INFO — BOTTOM RIGHT ─── */}
          <div className="absolute right-[5%] bottom-[21%] hidden lg:block w-[170px]">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b91c1c]" />
              <span className="text-[10px] tracking-[0.22em] text-[#1a1a1a] font-black font-serif">
                GENESEON
              </span>
            </div>

            <p className="text-[13px] leading-relaxed text-[#4a4a4a] font-serif italic">
              Where curiosity
              <br />
              creates destiny.
            </p>
          </div>

          {/* ─── TRUSTED BY ─── */}
          <div className="absolute left-6 right-6 lg:left-14 lg:right-14 -bottom-16">
            <p className="mb-5 text-[11px] tracking-[0.18em] uppercase text-[#4a4a4a] font-black font-serif">
              Trusted by learners & educators
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ─── DARK MODE (Original, unchanged) ─────────────────────────
  return (
    <section
      id="home"
      className="relative min-h-[calc(100vh+94px)] overflow-hidden bg-[#020409] text-white"
    >
      {/* HERO BACKGROUND (THREE.JS 3D EARTH) */}
      <div className="absolute inset-0">
        <Suspense fallback={<EarthFallback />}>
          <EarthCanvas />
        </Suspense>

        {/* Dark overlay for left content readability */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#020409] via-[#020409]/75 via-[48%] to-transparent" />

        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#020409] to-transparent" />

        {/* Top fade */}
        <div className="absolute inset-x-0 -top-1 h-32 bg-gradient-to-b from-[#020409]/60 to-transparent" />

        {/* Subtle blue atmospheric glow */}
        <div className="absolute right-[15%] top-[25%] w-[350px] h-[350px] rounded-full bg-blue-500/[0.04] blur-[100px]" />
      </div>

      {/* HERO CONTENT */}
      <div className="relative z-10 min-h-screen max-w-[1400px] mx-auto px-2 lg:px-14 pt-16">
        {/* Main left content */}
        <div className="min-h-[calc(100vh-64px)] flex items-center">
          <div className="w-full max-w-[600px] pb-28 lg:pb-20">
            {/* Eyebrow */}
            <p className="mt-9 mb-6 text-[11px] sm:text-xs font-medium tracking-[0.35em] uppercase text-gray-400">
              Distanced. Advanced. Genesis.
            </p>

            {/* Heading */}
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-[76px] font-bold leading-[1.02] tracking-[0.04em] text-white"
              style={{ fontFeatureSettings: '"ss01", "ss02"' }}
            >
              THE NEXT
              <br />
              GENESIS OF
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9b8cff] via-[#716cff] to-[#4f8cff]">
                LEARNING
              </span>
            </h1>

            {/* Description */}
            <p className="mt-8 max-w-[460px] text-sm sm:text-base leading-relaxed text-gray-400">
              Geneseon is a next-generation learning platform where knowledge
              meets innovation.
              <br className="hidden sm:block" />
              Learn beyond limits. Achieve beyond ordinary.
            </p>

            {/* Buttons */}
            <div className="mt-10 flex items-center gap-6">
              <Link
                to="/register"
                className={`${gradientBtn} group flex items-center gap-2.5 !rounded-[6px] px-7 py-3.5 text-sm font-medium shadow-[0_0_30px_rgba(99,102,241,0.25)]`}
              >
                Explore Platform
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE — MISSION */}
        <div className="absolute right-[7%] top-[42%] hidden xl:block w-[190px]">
          <div className="absolute -left-3 top-1 w-[7px] h-[7px] rounded-full border border-[#9b8cff] shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
          <div className="absolute -left-[1px] top-[7px] w-px h-16 bg-gradient-to-b from-[#8b7cff] to-transparent" />

          <p className="text-[11px] tracking-[0.16em] uppercase text-gray-500 mb-3">
            Our Mission
          </p>

          <p className="text-sm leading-relaxed text-gray-300">
            To empower minds and shape the future through accessible, impactful education.
          </p>
        </div>

        {/* GENESEON INFO — BOTTOM RIGHT */}
        <div className="absolute right-[5%] bottom-[21%] hidden lg:block w-[170px]">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7568ff] shadow-[0_0_8px_#7568ff]" />
            <span className="text-[10px] tracking-[0.22em] text-[#8c83ff]">
              GENESEON
            </span>
          </div>

          <p className="text-[13px] leading-relaxed text-gray-400">
            Where curiosity
            <br />
            creates destiny.
          </p>
        </div>

        {/* TRUSTED BY */}
        <div className="absolute left-6 right-6 lg:left-14 lg:right-14 -bottom-16">
          <p className="mb-5 text-[11px] tracking-[0.18em] uppercase text-gray-600">
            Trusted by learners & educators
          </p>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;