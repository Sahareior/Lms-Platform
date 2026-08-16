import { ArrowRight } from "lucide-react";
import { cards } from "../landingTools/landingTools";

const cardImages = [
  "/landingpage_assets/02-feature-smart-learning.png",
  "/landingpage_assets/03-feature-advanced-analytics.png",
  "/landingpage_assets/04-feature-seamless-experience.png",
];

const LandingPowerfulFeatures = () => {
  return (
    <section className="py-24 px-6 lg:px-8 bg-[#0a0c14]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Content */}
          <div className="lg:w-[280px] flex-shrink-0">
            <p className="text-[11px] font-bold tracking-[0.25em] text-indigo-400 uppercase mb-4">
              BUILT FOR THE FUTURE
            </p>
            <h2 className="text-3xl lg:text-[2rem] font-bold mb-5 leading-[1.15]">
              Powerful features for limitless potential.
            </h2>
            <p className="text-gray-400 mb-8 text-[14px] leading-relaxed">
              Geneseon combines technology and education to deliver a seamless learning experience that adapts to you.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium"
            >
              Discover all features <ArrowRight size={14} />
            </a>
          </div>

          {/* Right Cards */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-5">
            {cards.map((card, index) => (
              <div
                key={index}
                className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer overflow-hidden flex flex-col"
              >
                {/* Card Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={cardImages[index]}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c14] via-transparent to-transparent"></div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h4 className="text-[15px] font-semibold mb-2 text-white">{card.title}</h4>
                  <p className="text-[13px] text-gray-500 leading-relaxed flex-1">{card.desc}</p>
                  <div className="flex justify-end mt-4">
                    <ArrowRight
                      size={16}
                      className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingPowerfulFeatures;