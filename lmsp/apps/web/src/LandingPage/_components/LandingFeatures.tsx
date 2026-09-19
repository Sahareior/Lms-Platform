import { BookOpen, BarChart2, Users, Award } from "lucide-react";
import { stats } from "../landingTools/landingTools";
import { useTheme } from "../../theme/ThemeContext";

const features = [
  {
    icon: <BookOpen size={18} />,
    title: "Interactive Learning",
    desc: "Engaging content with real-world projects and assessments.",
  },
  {
    icon: <BarChart2 size={18} />,
    title: "Track Progress",
    desc: "Advanced analytics to monitor growth and achievements.",
  },
  {
    icon: <Users size={18} />,
    title: "Global Community",
    desc: "Connect with learners and educators worldwide.",
  },
  {
    icon: <Award size={18} />,
    title: "Certified & Trusted",
    desc: "Earn certificates and showcase your skills with confidence.",
  },
];

const LandingFeatures = () => {
  const { isDark } = useTheme();

  // ─── LIGHT MODE (Vintage Paper Style) ───────────────────────
  if (!isDark) {
    return (
      <section
        id="features"
        className="relative overflow-hidden bg-[#e8e4db] px-2 lg:px-14 py-24 lg:py-28"
        style={{
          backgroundImage: 'radial-gradient(#d8d4cb 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        <div className="relative z-10 max-w-[1240px] mx-auto">

          {/* ── TOP FEATURE HIGHLIGHTS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 lg:gap-y-0 lg:divide-x lg:divide-[#d8d4cb] mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-5 lg:px-8 first:lg:pl-0 last:lg:pr-0"
              >
                {/* Icon */}
                <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-[#1a1a1a] border border-[#1a1a1a] text-[#f2efe9] shadow-[2px_2px_0px_0px_#b91c1c]">
                  <span className="relative">{feature.icon}</span>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-[15px] font-black tracking-wide text-[#1a1a1a] mb-2.5 font-serif">
                    {feature.title}
                  </h3>
                  <p className="max-w-[220px] text-[13px] leading-relaxed text-[#4a4a4a] font-serif">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ── STATS ── */}
          <div className="overflow-hidden rounded-lg border-2 border-[#1a1a1a] bg-[#f2efe9] mb-16 shadow-[4px_4px_0px_0px_#1a1a1a]">
            <div className="grid grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`relative flex flex-col items-center justify-center py-10 lg:py-9 px-5 ${
                    index < 2 ? "border-b border-[#d8d4cb] lg:border-b-0" : ""
                  } ${index % 2 === 0 ? "lg:border-r lg:border-[#d8d4cb]" : ""}`}
                >
                  {index !== 0 && (
                    <span className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 h-9 w-px bg-[#d8d4cb]" />
                  )}
                  <p
                    className="text-3xl lg:text-4xl font-black tracking-tight text-[#b91c1c] font-serif"
                    style={{ fontFeatureSettings: '"tnum"' }}
                  >
                    {stat.value}
                  </p>
                  <p className="mt-2 text-[13px] font-bold text-[#1a1a1a] font-serif">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── POWERFUL FEATURES ── */}
          <div className="mt-8">
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
              {/* Left intro */}
              <div className="w-full lg:w-[280px] flex-shrink-0">
                <p className="text-[11px] font-black tracking-[0.22em] text-[#b91c1c] uppercase mb-5 font-serif">
                  BUILT FOR THE FUTURE
                </p>

                <h2 className="max-w-[280px] text-3xl lg:text-4xl font-black leading-[1.15] tracking-[-0.01em] text-[#1a1a1a] font-serif">
                  Powerful features for limitless potential.
                </h2>

                <p className="mt-5 max-w-[260px] text-sm leading-relaxed text-[#4a4a4a] font-serif">
                  Geneseon combines technology and education to deliver a seamless learning experience that adapts to you.
                </p>
              </div>

              {/* Feature cards */}
              <FeatureCards isDark={false} />
            </div>
          </div>

        </div>
      </section>
    );
  }

  // ─── DARK MODE (Original, unchanged) ─────────────────────────
  return (
    <section
      id="features"
      className="relative overflow-hidden bg-[#020409] px-2 lg:px-14 py-24 lg:py-28"
    >
      <div className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-indigo-500/[0.025] blur-[120px]" />

      <div className="relative z-10 max-w-[1240px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 lg:gap-y-0 lg:divide-x lg:divide-white/[0.04] mb-16">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-5 lg:px-8 first:lg:pl-0 last:lg:pr-0">
              <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-indigo-400/10 bg-indigo-500/[0.08] text-indigo-400">
                <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-md" />
                <span className="relative">{feature.icon}</span>
              </div>
              <div>
                <h3 className="text-[15px] font-medium tracking-wide text-gray-200 mb-2.5">{feature.title}</h3>
                <p className="max-w-[220px] text-[13px] leading-relaxed text-gray-500">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.012] mb-16">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`relative flex flex-col items-center justify-center py-10 lg:py-9 px-5 ${
                  index < 2 ? "border-b border-white/[0.05] lg:border-b-0" : ""
                } ${index % 2 === 0 ? "lg:border-r lg:border-white/[0.05]" : ""}`}
              >
                {index !== 0 && (
                  <span className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 h-9 w-px bg-white/[0.07]" />
                )}
                <p
                  className="text-3xl lg:text-4xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#a28cff] to-[#648cff]"
                  style={{ fontFeatureSettings: '"tnum"' }}
                >
                  {stat.value}
                </p>
                <p className="mt-2 text-[13px] font-medium text-gray-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
            <div className="w-full lg:w-[280px] flex-shrink-0">
              <p className="text-[11px] font-medium tracking-[0.22em] text-[#6395ff] uppercase mb-5">
                BUILT FOR THE FUTURE
              </p>
              <h2
                className="max-w-[280px] text-3xl lg:text-4xl font-medium leading-[1.15] tracking-[-0.01em] text-white"
                style={{ fontFeatureSettings: '"ss01", "ss02"' }}
              >
                Powerful features for limitless potential.
              </h2>
              <p className="mt-5 max-w-[260px] text-sm leading-relaxed text-gray-500">
                Geneseon combines technology and education to deliver a seamless learning experience that adapts to you.
              </p>
            </div>
            <FeatureCards isDark={true} />
          </div>
        </div>
      </div>
    </section>
  );
};

/* =========================================================
   FEATURE CARDS
========================================================= */

const FeatureCards = ({ isDark }: { isDark: boolean }) => {
  const cards = [
    {
      image: "/landingpage_assets/02-feature-smart-learning.png",
      title: "Smart Learning Paths",
      desc: "Personalized learning paths designed for your goals and pace.",
    },
    {
      image: "/landingpage_assets/03-feature-advanced-analytics.png",
      title: "Advanced Analytics",
      desc: "Data-driven insights that help you focus on what matters.",
    },
    {
      image: "/landingpage_assets/04-feature-seamless-experience.png",
      title: "Seamless Experience",
      desc: "Beautiful, fast and intuitive across all your devices.",
    },
  ];

  // ─── LIGHT MODE CARDS ───
  if (!isDark) {
    return (
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-lg border border-[#d8d4cb] bg-[#f2efe9] transition-all duration-300 shadow-[3px_3px_0px_0px_#1a1a1a] hover:shadow-[4px_4px_0px_0px_#1a1a1a] hover:-translate-y-0.5"
          >
            {/* Image */}
            <div className="relative h-44 overflow-hidden border-b border-[#d8d4cb]">
              <img
                src={card.image}
                alt={card.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
              />
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[15px] font-black text-[#1a1a1a] font-serif">
                    {card.title}
                  </h3>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-[#4a4a4a] font-serif">
                    {card.desc}
                  </p>
                </div>
                <span className="mt-1 flex-shrink-0 text-base text-[#4a4a4a] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#b91c1c] font-serif">
                  →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ─── DARK MODE CARDS (Original) ───
  return (
    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="group relative overflow-hidden rounded-xl border border-white/[0.07] bg-[#05070d] transition-all duration-300 hover:border-indigo-400/20 hover:bg-white/[0.025]"
        >
          <div className="relative h-44 overflow-hidden">
            <img
              src={card.image}
              alt={card.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#05070d] via-transparent to-transparent" />
            <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 w-28 h-16 rounded-full bg-indigo-500/10 blur-2xl" />
          </div>

          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[15px] font-semibold text-gray-200">{card.title}</h3>
                <p className="mt-2.5 text-[13px] leading-relaxed text-gray-500">{card.desc}</p>
              </div>
              <span className="mt-1 flex-shrink-0 text-base text-indigo-400/70 transition-all duration-300 group-hover:translate-x-1 group-hover:text-indigo-300">
                →
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LandingFeatures;