import React from "react";
import DecryptedText from "../components/DecryptedText";

const comingSoonItems = [
  { id: 1, img: "/assets/Media-logo.png" },
  { id: 2, img: "/assets/Spectra-logo.png" },
];

const Sponsors = () => {
  const sponsors = [
    {
      name: "Dyashin Technosoft",
      tier: "Title Sponsor",
      logo: "/assets/logo.png",
      size: "large",
    },
    // Add more placeholders
    { name: "Tech Corp", tier: "Gold Sponsor", logo: null, size: "medium" },
    { name: "Dev Tools", tier: "Gold Sponsor", logo: null, size: "medium" },
    { name: "Cloud Sol", tier: "Silver Sponsor", logo: null, size: "small" },
    {
      name: "Design Studio",
      tier: "Silver Sponsor",
      logo: null,
      size: "small",
    },
    { name: "Energy Drink", tier: "Silver Sponsor", logo: null, size: "small" },
  ];

  return (
    <section
      id="sponsors"
      className="section-container border-t border-white/10"
    >
      <div className="w-full flex justify-center mb-16">
        <div className="inline-block border border-white/20 bg-[#0A090F] px-8 py-4">
          <h1 className="text-3xl md:text-5xl font-hackwise text-white uppercase tracking-wider text-center">
            Our Sponsors
          </h1>
        </div>
      </div>

      <div className="flex flex-col items-center gap-12">
        {/* Title Sponsor */}
        <div className="w-full max-w-4xl flex flex-col items-center gap-6">
          <h3 className="text-orange-500 font-mono tracking-widest text-sm uppercase">
            Title Sponsor
          </h3>
          <div className="w-full md:w-2/3 aspect-video bg-white/5 border border-white/10 flex items-center justify-center p-8 rounded-sm hover:border-orange-500/50 transition-all duration-300 group cursor-pointer relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            {/* Placeholder for actual logo */}
            <img
              src="/assets/DyashinLogo.png"
              alt="Dyashin Technosoft Logo"
              className="max-h-20 md:max-h-32 object-contain z-10"
            />
            {/* <span className="text-3xl font-hackwise text-white/50 group-hover:text-white transition-colors">
              DYASHIN TECHNOSOFT
            </span> */}
          </div>
        </div>

        {/* Powered By */}
        <div className="w-full max-w-4xl flex flex-col items-center gap-6">
          <h3 className="text-blue-500 font-mono tracking-widest text-sm uppercase">
            Platform and Powered By Partner
          </h3>
          <div className="w-full md:w-2/3 aspect-video bg-white/5 border border-white/10 flex items-center justify-center p-8 rounded-sm hover:border-blue-500/50 transition-all duration-300 group cursor-pointer relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            {/* Placeholder for actual logo */}
            <img
              src="/assets/unstop-logo.svg"
              alt="Dyashin Technosoft Logo"
              className="max-h-20 md:max-h-32 object-contain z-10"
            />
            {/* <span className="text-3xl font-hackwise text-white/50 group-hover:text-white transition-colors">
              DYASHIN TECHNOSOFT
            </span> */}
          </div>
        </div>

        {/* Gold Sponsors */}
        <div className="w-full max-w-5xl flex flex-col items-center gap-6 mt-8">
          <h3 className="text-yellow-400/80 font-mono tracking-widest text-sm uppercase">
            Reward Sponsors
          </h3>

          <div className="grid grid-cols-2 gap-6 w-full">
            {/* Box 1 */}
            <div className="aspect-[3/1] bg-white/5 border border-white/10 flex items-center justify-center p-6 rounded-sm hover:border-yellow-500/30 transition-all">
              <img
                src="/assets/butti-logo.png"
                alt="Dyashin Technosoft Logo"
                className="max-h-20 md:max-h-32 object-contain z-10 h-30 w-30 bg-white rounded-full p-2"
              />
            </div>

            {/* Box 2 */}
            <div className="aspect-[3/1] bg-white/5 border border-white/10 flex items-center justify-center p-6 rounded-sm hover:border-yellow-500/30 transition-all">
              <img
                src="/assets/lovable-logo.webp"
                alt="Dyashin Technosoft Logo"
                className="max-h-20 md:max-h-32 object-contain z-10"
              />
            </div>
          </div>
        </div>

        {/* Silver Sponsors */}
        <div className="w-full max-w-5xl flex flex-col items-center gap-6 mt-8">
          <h3 className="text-gray-400 font-mono tracking-widest text-sm uppercase">
            Media Partners
          </h3>

          <div className="w-full flex justify-center items-center">
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              {comingSoonItems.map((item) => (
                <div
                  key={item.id}
                  className="aspect-[2/1] w-[220px] bg-white/5 border border-white/10 flex items-center justify-center p-4 rounded-sm hover:border-white/30 transition-all"
                >
                  <img
                    src={item.img}
                    alt="Coming soon"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-white/60 font-sans mb-4">
            Interested in sponsoring Hackwise 2.0?
          </p>
          <a
            href="/contact"
            className="inline-block px-8 py-3 bg-orange-500 text-black font-mono font-bold hover:bg-orange-600 transition-all duration-300 rounded-none cursor-pointer shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)]"
            style={{
              clipPath:
                "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
            }}
          >
            <DecryptedText text="Become a Sponsor" sequential />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Sponsors;
