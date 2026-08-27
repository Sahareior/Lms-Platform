import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { gradientBtn } from "../landingTools/landingTools";

// Only sections that exist on the page — keeps the nav honest and minimal.
const navLinks = ["Home", "Features"];

const LandingNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav aria-label="Main navigation" className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#03050a]/20 backdrop-blur-md border-b border-white/[0.05]">
      <div className="max-w-[1400px] mx-auto h-full px-2 lg:px-14">
        <div className="h-full flex items-center justify-between">

          {/* Logo */}
          <Link to="/" aria-label="Geneseon home" className="flex items-center gap-2.5 group">
          <img className='w-9' src="/nav.png" alt="" />

            <span className="text-sm font-semibold tracking-[0.3em] text-white" style={{ fontFeatureSettings: '"ss01"' }}>
              GENESEON
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-9">
            {navLinks.map((item, index) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className={`
                  relative text-[13px] font-medium tracking-wide
                  transition-colors duration-300
                  ${
                    index === 0
                      ? "text-[#8b8cff]"
                      : "text-gray-400 hover:text-white"
                  }
                `}
              >
                {item}

                {index === 0 && (
                  <span className="absolute -bottom-[18px] left-1/2 -translate-x-1/2 w-5 h-[1px] bg-[#7568ff]" />
                )}
              </a>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-5">
            <Link
              to="/login"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign in
            </Link>

            <Link
              to="/register"
              className={`
                ${gradientBtn}
                !rounded-[6px]
                !px-5
                !py-2.5
                text-[13px]
                shadow-[0_0_20px_rgba(99,102,241,0.25)]
              `}
            >
              Get Started
            </Link>
          </div>

          {/* Mobile */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="lg:hidden text-gray-300"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`
          lg:hidden absolute top-16 left-0 right-0
          bg-[#03050a]/95 backdrop-blur-xl
          border-b border-white/[0.06]
          transition-all duration-300 overflow-hidden
          ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="px-6 py-8 space-y-6">
          {navLinks.map((item, index) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={() => setIsOpen(false)}
              className={`block text-base ${
                index === 0
                  ? "text-[#8b8cff]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {item}
            </a>
          ))}

          <div className="pt-4 border-t border-white/[0.06] space-y-8">
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block text-base text-gray-400 hover:text-white"
            >
              Sign in
            </Link>

<Link
  to="/register"
  onClick={() => setIsOpen(false)}
  className="
    mt-5
    flex
    w-full
    items-center
    justify-center
    rounded-lg
    px-5
    py-2.5
    text-sm
    font-semibold
    text-white
    bg-gradient-to-r
    from-[#7C3AED]
    via-[#6366F1]
    to-[#22D3EE]
    shadow-[0_4px_20px_rgba(99,102,241,0.25)]
    transition-all
    duration-300
    hover:shadow-[0_6px_28px_rgba(99,102,241,0.4)]
    hover:brightness-110
    active:scale-[0.98]
  "
>
  Get Started
</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LandingNav;