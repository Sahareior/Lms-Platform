import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const LandingFooter = () => {
  return (
    <footer
      aria-label="Site footer"
      className="
        bg-[#020409]
        px-2
        lg:px-14
        pt-16
        pb-8
      "
    >
      <div className="max-w-[1240px] mx-auto">

        {/* =================================================
            FOOTER MAIN
        ================================================= */}

        <div
          className="
            flex
            flex-col
            md:flex-row
            md:items-start
            md:justify-between
            gap-10
            pb-10
          "
        >

          {/* Brand */}
          <div className="max-w-[300px]">

            <Link
              to="/"
              aria-label="Geneseon home"
              className="
                inline-flex
                items-center
                gap-2.5
                mb-4
              "
            >
              {/* Logo */}
               <img className='w-9' src="/logo1.png" alt="" />

              <span
                className="
                  text-sm
                  font-medium
                  tracking-[0.3em]
                  text-white
                "
              >
                GENESEON
              </span>
            </Link>

            <p
              className="
                max-w-[260px]
                text-sm
                leading-relaxed
                text-gray-500
              "
            >
              Empowering the next generation through accessible,
              innovative and impactful education.
            </p>

          </div>


          {/* Newsletter */}
          <div className="w-full md:w-auto md:max-w-[320px]">

            <h4
              className="
                text-sm
                font-medium
                text-gray-300
                mb-4
              "
            >
              Stay updated
            </h4>

            <p
              className="
                text-[13px]
                text-gray-500
                mb-4
              "
            >
              Subscribe to our newsletter
            </p>

            <div
              className="
                flex
                h-10
                overflow-hidden
                rounded-lg
                border
                border-white/[0.08]
                bg-white/[0.02]
              "
            >
              <input
                type="email"
                name="newsletter-email"
                aria-label="Email address for newsletter"
                placeholder="Enter your email"
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  px-3
                  text-[13px]
                  text-white
                  outline-none
                  placeholder:text-gray-600
                "
              />

              <button
                className="
                  flex
                  w-10
                  items-center
                  justify-center
                  bg-indigo-500/10
                  text-indigo-400
                  hover:bg-indigo-500/20
                  transition-colors
                "
              >
                <ArrowRight size={14} />
              </button>
            </div>

          </div>

        </div>


        {/* =================================================
            COPYRIGHT
        ================================================= */}

        <div
          className="
            border-t
            border-white/[0.05]
            pt-6
            text-center
          "
        >
          <p
            className="
              text-xs
              text-gray-600
            "
          >
            © 2024 Geneseon. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default LandingFooter;