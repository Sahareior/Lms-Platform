import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Download } from "lucide-react";
import { gradientBtn } from "../landingTools/landingTools";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";

// Only sections that exist on the page — keeps the nav honest and minimal.
const navLinks = ["Home", "Features"];

const LandingNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showInstallPopup, setShowInstallPopup] = useState(false);
  const { deferredPrompt, handleInstallClick } = useInstallPrompt();

  useEffect(() => {
    if (deferredPrompt) {
      const timer = window.setTimeout(() => setShowInstallPopup(true), 500);
      return () => window.clearTimeout(timer);
    }

    setShowInstallPopup(false);
  }, [deferredPrompt]);

  const handleAppInstall = async () => {
    setShowInstallPopup(false);
    if (deferredPrompt) {
      await handleInstallClick();
    }
  };

  return (
    <>
    <nav aria-label="Main navigation" className="fixed -top-1 left-0 right-0 z-50 h-16 bg-[#03050a]/20 backdrop-blur-md border-b border-white/[0.05]">
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
          lg:hidden fixed inset-x-3 top-20 z-40
          transition-all duration-300 ease-out
          ${isOpen ? "translate-y-0 opacity-100 visible" : "-translate-y-3 opacity-0 invisible"}
        `}
      >
        <div className="rounded-[28px] border border-white/10 bg-[#08111d]/98 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.7)] backdrop-blur-2xl">
          <div className="mb-4 flex items-center justify-between border-b border-white/8 pb-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#8b8cff]">
                Menu
              </p>
              <h3 className="mt-1 text-base font-semibold text-white">Explore</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition-colors hover:border-white/20 hover:text-white"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-2">
            {navLinks.map((item, index) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-medium transition-all
                  ${index === 0
                    ? "bg-[#8b8cff]/10 text-[#8b8cff]"
                    : "bg-white/[0.03] text-gray-300 hover:bg-white/[0.06] hover:text-white"}
                `}
              >
                <span>{item}</span>
                <span className="text-xs text-gray-500">0{index + 1}</span>
              </a>
            ))}
          </div>

          <div className="mt-5 space-y-3 border-t border-white/8 pt-4">
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-gray-200 transition-colors hover:bg-white/[0.07] hover:text-white"
            >
              Sign in
            </Link>

            <Link
              to="/register"
              onClick={() => setIsOpen(false)}
              className="
                flex
                w-full
                items-center
                justify-center
                rounded-2xl
                px-4
                py-3.5
                text-sm
                font-semibold
                text-white
                bg-gradient-to-r
                from-[#7C3AED]
                via-[#6366F1]
                to-[#22D3EE]
                shadow-[0_6px_26px_rgba(99,102,241,0.35)]
                transition-all
                duration-300
                hover:brightness-110
                active:scale-[0.99]
              "
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>

    {deferredPrompt && showInstallPopup && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b1120]/95 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.8)]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7C3AED]/20 text-[#8b8cff]">
                <Download size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-200">Install the app</p>
                <p className="text-xs text-gray-400">Get a faster experience</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowInstallPopup(false)}
              className="text-gray-400 transition-colors hover:text-white"
              aria-label="Close install popup"
            >
              <X size={18} />
            </button>
          </div>

          <p className="text-sm leading-6 text-gray-300">
            Download the Geneseon app to access your learning dashboard faster and keep everything ready on your device.
          </p>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setShowInstallPopup(false)}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-200 transition-colors hover:bg-white/10"
            >
              Later
            </button>
            <button
              type="button"
              onClick={handleAppInstall}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#22D3EE] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(99,102,241,0.35)] transition-all hover:brightness-110"
            >
              <Download size={16} />
              Download
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default LandingNav;