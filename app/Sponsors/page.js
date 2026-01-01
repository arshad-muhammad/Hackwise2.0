import React from "react";
import DecryptedText from "../components/DecryptedText";

/* Media / Coming Soon */
const comingSoonItems = [
  { id: 1, img: "/assets/Media-logo.png" },
  { id: 2, img: "/assets/Spectra-logo.png" },
];

/* Reusable Sponsor Box Styles (Media Partner base) */
const sponsorBoxBase =
  "bg-white/5 border border-white/10 flex items-center justify-center rounded-sm transition-all relative overflow-hidden";

const Sponsors = () => {
  return (
    <section
      id="sponsors"
      className="section-container border-t border-white/10 px-4 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <div className="w-full flex justify-center mb-8 sm:mb-12 md:mb-16">
        <div className="inline-block border border-white/20 bg-[#0A090F] px-4 sm:px-6 md:px-8 py-3 sm:py-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-hackwise text-white uppercase tracking-wider text-center">
            Our Sponsors
          </h1>
        </div>
      </div>

      <div className="flex flex-col items-center gap-8 sm:gap-10 md:gap-12">
        {/* ================= TITLE SPONSOR ================= */}
        <div className="w-full max-w-4xl flex flex-col items-center gap-4 sm:gap-6 px-4 sm:px-8 md:px-[100px]">
          <h3 className="text-orange-500 font-mono tracking-widest text-xs sm:text-sm uppercase">
            Title Sponsor
          </h3>

          <div
            className={`${sponsorBoxBase} group cursor-pointer hover:border-orange-500/40 w-full md:w-2/3 aspect-video p-4 sm:p-6 md:p-8`}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <img
              src="/assets/DyashinLogo.png"
              alt="Dyashin Technosoft Logo"
              className="max-h-12 sm:max-h-16 md:max-h-20 lg:max-h-32 object-contain z-10"
            />
          </div>
        </div>

        {/* ================= POWERED BY ================= */}
        <div className="w-full max-w-4xl flex flex-col items-center gap-4 sm:gap-6 px-4 sm:px-8 md:px-[100px]">
          <h3 className="text-blue-500 font-mono tracking-widest text-xs sm:text-sm uppercase text-center">
            Platform & Powered By Partner
          </h3>

          <div
            className={`${sponsorBoxBase} group cursor-pointer hover:border-blue-500/40 w-full md:w-2/3 aspect-video p-4 sm:p-6 md:p-8`}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <img
              src="/assets/unstop-logo.svg"
              alt="Unstop Logo"
              className="max-h-12 sm:max-h-16 md:max-h-20 lg:max-h-32 object-contain z-10"
            />
          </div>
        </div>

        {/* ================= REWARD SPONSORS ================= */}
        <div className="w-full max-w-5xl flex flex-col items-center gap-4 sm:gap-6 mt-4 sm:mt-6 md:mt-8 px-4 sm:px-8 md:px-[100px]">
          <h3 className="text-yellow-400/80 font-mono tracking-widest text-xs sm:text-sm uppercase">
            Reward Sponsors
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
            {/* Reward 1 */}
            <div
              className={`${sponsorBoxBase} 
    group cursor-pointer 
    col-span-1 sm:col-span-2 
    w-full md:w-2/3 
    mx-auto 
    aspect-video 
    p-4 sm:p-6 md:p-8 
    relative
    hover:border-yellow-500/30 `}
            >
              <div className="absolute inset-0  opacity-0 group-hover:opacity-100 transition-opacity" />

              <img
                src="/assets/butti-logo.png"
                alt="Butti Logo"
                className="max-h-30 object-contain bg-white rounded-full p-2 mx-auto"
              />
            </div>
            {/* Reward 2 */}{" "}
            {/* <div className={${sponsorBoxBase} aspect-[3/1] p-4 sm:p-6 hover:border-yellow-500/30} > 
            <img src="/assets/lovable-logo.webp" alt="Lovable Logo" className="max-h-16 object-contain" /> 
            </div> */}
          </div>
        </div>

        {/* ================= MEDIA PARTNERS ================= */}
        <div className="w-full max-w-5xl flex flex-col items-center gap-4 sm:gap-6 mt-4 sm:mt-6 md:mt-8 px-4 sm:px-0 md:px-[100px]">
          <h3 className="text-gray-400 font-mono tracking-widest text-xs sm:text-sm uppercase">
            Media Partners
          </h3>

          <div className="w-full flex justify-center items-center px-4 sm:px-8 md:px-[100px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-md sm:max-w-none">
              {comingSoonItems.map((item) => (
                <div
                  key={item.id}
                  className={`${sponsorBoxBase} aspect-[2/1] p-3 sm:p-4 hover:border-white/30 mx-auto`}
                >
                  <img
                    src={item.img}
                    alt="Media Partner"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= CTA ================= */}
        <div className="mt-8 sm:mt-12 md:mt-16 text-center px-4">
          <p className="text-white/60 font-sans mb-3 sm:mb-4 text-sm sm:text-base">
            Interested in sponsoring Hackwise 2.0?
          </p>

          <a
            href="/contact"
            className="inline-block px-6 sm:px-8 py-2.5 sm:py-3 bg-orange-500 text-black font-mono font-bold transition-all duration-300 shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)]"
            style={{
              clipPath:
                "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
            }}
          >
            <DecryptedText text="Become a Sponsor" sequential speed={30} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Sponsors;
