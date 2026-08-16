import {
  FacebookFilled,
  InstagramOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  GithubOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { footerLinks } from "../landingTools/landingTools";

const LandingFooter = () => {
  return (
    <footer
      aria-label="Site footer"
      className="
        bg-[#020409]
        px-6
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
            grid
            grid-cols-2
            md:grid-cols-4
            lg:grid-cols-[1.6fr_0.9fr_0.9fr_0.9fr_1.2fr]
            gap-x-10
            gap-y-12
            pb-10
          "
        >

          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">

            <Link
              to="/landing"
              aria-label="Geneseon home"
              className="
                inline-flex
                items-center
                gap-2.5
                mb-4
              "
            >
              {/* Logo */}
              <div className="relative w-6 h-6">

                <div
                  className="
                    absolute
                    inset-0
                    rounded-full
                    border-[2px]
                    border-transparent
                    border-t-[#a78bfa]
                    border-l-[#38bdf8]
                    rotate-[-35deg]
                  "
                />

                <div
                  className="
                    absolute
                    inset-[4px]
                    rounded-full
                    bg-[#020409]
                  "
                />

              </div>

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

            {/* Social */}
            <div
              className="
                flex
                items-center
                gap-4
                mt-5
                text-base
                text-gray-500
              "
            >
              <a
                href="#"
                aria-label="Geneseon on X (Twitter)"
                className="hover:text-white transition-colors"
              >
                <TwitterOutlined />
              </a>

              <a
                href="#"
                aria-label="Geneseon on LinkedIn"
                className="hover:text-white transition-colors"
              >
                <LinkedinOutlined />
              </a>

              <a
                href="#"
                aria-label="Geneseon on YouTube"
                className="hover:text-white transition-colors"
              >
                <YoutubeIcon />
              </a>

              <a
                href="#"
                aria-label="Geneseon on Instagram"
                className="hover:text-white transition-colors"
              >
                <InstagramOutlined />
              </a>

              <a
                href="#"
                aria-label="Geneseon on GitHub"
                className="hover:text-white transition-colors"
              >
                <GithubOutlined />
              </a>
            </div>
          </div>


          {/* Platform */}
          <FooterColumn
            title="Platform"
            links={footerLinks.platform}
          />


          {/* Resources */}
          <FooterColumn
            title="Resources"
            links={footerLinks.resources}
          />


          {/* Company */}
          <FooterColumn
            title="Company"
            links={footerLinks.company}
          />


          {/* Newsletter */}
          <div>

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


/* =========================================================
   FOOTER COLUMN
========================================================= */

const FooterColumn = ({ title, links }) => {
  return (
    <div>            <h4
              className="
                text-sm
                font-medium
                text-gray-300
                mb-4
              "
            >
              {title}
            </h4>

            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="
                      text-[13px]
                      text-gray-500
                      hover:text-white
                      transition-colors
                    "
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
    </div>
  );
};


/* Simple YouTube icon so we don't need another package */
const YoutubeIcon = () => {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.9V8.1l6.8 3.9-6.8 3.9Z" />
    </svg>
  );
};

export default LandingFooter;