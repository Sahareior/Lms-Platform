import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { gradientBtn } from "../landingTools/landingTools";

const LandingCTA = () => {
  return (
    <section
      className="
        relative
        bg-[#020409]
        px-6
        lg:px-14
        py-36
        lg:py-24
      "
    >
      <div className="max-w-[1240px] mx-auto">

        {/* CTA CARD */}
        <div
          className="
            relative
            h-[290px]
            lg:h-[390px]
            overflow-hidden
            rounded-xl
            border
            border-white/[0.07]
            bg-[#03050a]
          "
        >

          {/* =========================================
              LEFT IMAGE
          ========================================== */}

          <div
            className="
              absolute
              inset-y-0
              left-0
              w-[52%]
              overflow-hidden
            "
          >
            <img
              src="/landingpage_assets/cta.png"
              alt="Students learning with Geneseon – start your journey towards mastery"
              className="
                absolute
                inset-0
                w-full
                h-full
                object-cover
                object-center
              "
            />

            {/* Fade image into dark right side */}
            <div
              className="
                absolute
                inset-y-0
                right-0
                w-[35%]
                bg-gradient-to-r
                from-transparent
                to-[#03050a]
              "
            />

            {/* Subtle bottom fade */}
            <div
              className="
                absolute
                inset-x-0
                bottom-0
                h-12
                bg-gradient-to-t
                from-[#03050a]/50
                to-transparent
              "
            />
          </div>


          {/* =========================================
              CTA CONTENT
          ========================================== */}

          <div
            className="
              absolute
              left-[52%]
              top-1/2
              -translate-y-1/2
              z-10
              pl-8
              lg:pl-10
            "
          >
            <h2
              className="
                text-3xl
                lg:text-4xl
                font-light
                leading-[1.15]
                tracking-[-0.02em]
                text-white
              "
            >
              Begin your journey
              <br />
              towards mastery.
            </h2>

            <p
              className="
                mt-4
                text-sm
                lg:text-base
                text-gray-400
              "
            >
              Join thousands of learners shaping their future with Geneseon.
            </p>

            <Link
              to="/register"
              className={`
                ${gradientBtn}
                group
                mt-6
                flex
                items-center
                gap-3
                !rounded-[6px]
                px-7
                py-3
                text-sm
                font-medium
                shadow-[0_0_25px_rgba(99,102,241,0.25)]
              `}
            >
              Get Started for Free

              <ArrowRight
                size={12}
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />
            </Link>
          </div>


          {/* =========================================
              VERTICAL TEXT
          ========================================== */}

          <div
            className="
              absolute
              right-5
              top-1/2
              -translate-y-1/2
              hidden
              lg:flex
              flex-col
              items-center
              gap-3
              z-20
            "
          >
            <span
              className="
                [writing-mode:vertical-rl]
                rotate-180
                text-[10px]
                tracking-[0.22em]
                text-gray-500
              "
            >
              YOUR FUTURE AWAITS
            </span>

            <div className="w-px h-7 bg-white/[0.08]" />

            <span
              className="
                w-[4px]
                h-[4px]
                rounded-full
                bg-[#8b6cff]
                shadow-[0_0_8px_#8b6cff]
              "
            />
          </div>

        </div>

      </div>
    </section>
  );
};

export default LandingCTA;