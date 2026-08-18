import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { gradientBtn } from "../landingTools/landingTools";

const LandingHero = () => {
  return (
    <section
      id="home"
      className="
        relative min-h-[calc(100vh+94px)]
        overflow-hidden
        bg-[#020409]
        text-white
      "
    >
      {/* =========================================
          HERO BACKGROUND
      ========================================== */}

      <div className="absolute inset-0">
        <img
          src="/landingpage_assets/hero.png"
          alt="Geneseon AI-powered learning platform – exam preparation, mock tests and personalized performance reports"
          className="
            absolute inset-0
            w-full h-full
            object-cover
            object-center
          "
        />

        {/* Dark overlay */}
        <div
          className="
          absolute inset-0
          bg-gradient-to-r
          from-[#020409]
          via-[#020409]/75
          via-[48%]
          to-transparent
        "
        />

        {/* Bottom fade */}
        <div
          className="
          absolute inset-x-0 bottom-0
          h-40
          bg-gradient-to-t
          from-[#020409]
          to-transparent
        "
        />

        {/* Top fade */}
        <div
          className="
          absolute inset-x-0 top-0
          h-32
          bg-gradient-to-b
          from-[#020409]/60
          to-transparent
        "
        />

        {/* Subtle blue atmospheric glow */}
        <div
          className="
          absolute
          right-[15%]
          top-[25%]
          w-[350px]
          h-[350px]
          rounded-full
          bg-blue-500/[0.04]
          blur-[100px]
        "
        />
      </div>

      {/* =========================================
          HERO CONTENT
      ========================================== */}

      <div
        className="
        relative z-10
        min-h-screen
        max-w-[1400px]
        mx-auto
        px-2 lg:px-14
        pt-16
      "
      >
        {/* Main left content */}
        <div
          className="
          min-h-[calc(100vh-64px)]
          flex items-center
        "
        >
          <div
            className="
            w-full
            max-w-[600px]
            pb-28
            lg:pb-20
          "
          >
            {/* Eyebrow */}
            <p
              className="
              mt-9 mb-6
              text-[11px]
              sm:text-xs
              font-medium
              tracking-[0.28em]
              uppercase
              text-gray-400
            "
            >
              Distanced. Advanced. Genesis.
            </p>

            {/* Heading */}
            <h1
              className="
              text-5xl
              sm:text-6xl
              lg:text-7xl
              xl:text-[76px]
              font-semibold
              leading-[1.02]
              tracking-[0.08em]
              text-white
            "
            >
              THE NEXT
              <br />
              GENESIS OF
              <br />
              <span
                className="
                text-transparent
                bg-clip-text
                bg-gradient-to-r
                from-[#9b8cff]
                via-[#716cff]
                to-[#4f8cff]
              "
              >
                LEARNING
              </span>
            </h1>

            {/* Description */}
            <p
              className="
              mt-8
              max-w-[460px]
              text-sm
              sm:text-base
              leading-relaxed
              text-gray-400
            "
            >
              Geneseon is a next-generation learning platform where knowledge
              meets innovation.
              <br className="hidden sm:block" />
              Learn beyond limits. Achieve beyond ordinary.
            </p>

            {/* Buttons */}
            <div className="mt-10 flex items-center gap-6">              <Link
                to="/register"
                className={`
                  ${gradientBtn}
                  group
                  flex items-center gap-2.5
                  !rounded-[6px]
                  px-7 py-3.5
                  text-sm
                  font-medium
                  shadow-[0_0_30px_rgba(99,102,241,0.25)]
                `}
              >
                Explore Platform

                <ArrowRight
                  size={16}
                  className="
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </Link>
            </div>
          </div>
        </div>

        {/* =========================================
            RIGHT SIDE — MISSION
        ========================================== */}

        <div
          className="
          absolute
          right-[7%]
          top-[42%]
          hidden
          xl:block
          w-[190px]
        "
        >
          {/* Connection point */}
          <div
            className="
            absolute
            -left-3
            top-1
            w-[7px]
            h-[7px]
            rounded-full
            border
            border-[#9b8cff]
            shadow-[0_0_10px_rgba(139,92,246,0.8)]
          "
          />

          <div
            className="
            absolute
            -left-[1px]
            top-[7px]
            w-px
            h-16
            bg-gradient-to-b
            from-[#8b7cff]
            to-transparent
          "
          />

          <p
            className="
            text-[11px]
            tracking-[0.16em]
            uppercase
            text-gray-500
            mb-3
          "
          >
            Our Mission
          </p>

          <p
            className="
            text-sm
            leading-relaxed
            text-gray-300
          "
          >
            To empower minds and shape the future through accessible, impactful
            education.
          </p>
        </div>

        {/* =========================================
            GENESEON INFO — BOTTOM RIGHT
        ========================================== */}

        <div
          className="
          absolute
          right-[5%]
          bottom-[21%]
          hidden
          lg:block
          w-[170px]
        "
        >
          <div
            className="
            flex items-center gap-2
            mb-2
          "
          >
            <span
              className="
              w-1.5 h-1.5
              rounded-full
              bg-[#7568ff]
              shadow-[0_0_8px_#7568ff]
            "
            />

            <span
              className="
              text-[10px]
              tracking-[0.22em]
              text-[#8c83ff]
            "
            >
              GENESEON
            </span>
          </div>

          <p
            className="
            text-[13px]
            leading-relaxed
            text-gray-400
          "
          >
            Where curiosity
            <br />
            creates destiny.
          </p>

         
        </div>

        {/* =========================================
            TRUSTED BY
        ========================================== */}

        <div
          className="
          absolute
          left-6
          right-6
          lg:left-14
          lg:right-14
          -bottom-16
        "
        >
          <p
            className="
            mb-5
            text-[11px]
            tracking-[0.18em]
            uppercase
            text-gray-600
          "
          >
            Trusted by learners & educators
          </p>

        </div>
      </div>
    </section>
  );
};

export default LandingHero;
