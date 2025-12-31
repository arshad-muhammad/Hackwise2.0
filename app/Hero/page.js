import React from "react";
import DecryptedText from "../components/DecryptedText.jsx";
import Image from "next/image";

export default function Home() {
  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center pt-20">
      <div className="w-full max-w-7xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-6 md:px-12 lg:px-24">
          {/* Left Column: Text */}
          <div className="flex flex-col gap-6 lg:gap-8 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 mb-[-10px]">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="font-mono text-sm md:text-base text-orange-500 uppercase tracking-widest">
                Hosted by <b>Sphere Hive</b>
              </span>
            </div>
            <h1 className="font-hackwise text-5xl md:text-7xl lg:text-8xl leading-[0.9] text-white tracking-wide uppercase">
              HACKWISE <span className="text-orange-500">2.0</span>
            </h1>
            <span className="block text-2xl md:text-4xl mt-2 tracking-normal font-sans text-white/90 normal-case font-bold">
              National Level Hackathon
            </span>
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-6">
                <p className="text-white/80 font-mono text-lg md:text-xl border-l-4 border-orange-500 pl-4">
                  Build real SaaS products. Win ₹40,000. Get hired.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="https://unstop.com/o/XIlFdnH?lb=yGGr6gxO&utm_medium=Share&utm_source=muhamr70994&utm_campaign=Online_coding_challenge" // Replace with actual Unstop link
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit px-8 py-3 text-black flex items-center font-bold font-mono bg-orange-500 transition-all duration-300 rounded-none cursor-pointer shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]"
                    style={{
                      clipPath:
                        "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
                    }}
                  >
                    <DecryptedText
                      text="Register on Unstop"
                      sequential
                      speed={40}
                    />
                  </a>

                  <a
                    href="https://chat.whatsapp.com/JvCxszNiFPb1Qq7H8zrftl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/btn relative w-fit p-px bg-orange-500/30 transition-all duration-300"
                    style={{
                      clipPath:
                        "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
                    }}
                  >
                    <div
                      className="w-full h-full bg-[#0A090F] transition-colors duration-300 px-8 py-4 flex items-center gap-2 font-mono font-bold text-orange-500"
                      style={{
                        clipPath:
                          "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
                      }}
                    >
                      <DecryptedText
                        text="Join WhatsApp"
                        sequential
                        speed={40}
                      />
                      <i className="ri-whatsapp-line text-xl" />
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Image */}
          <div className="flex justify-center lg:justify-end order-1 lg:order-2">
            <div className="w-64 h-64 md:w-80 md:h-80 border border-white/20 flex items-center justify-center p-6 bg-black/40 backdrop-blur-md relative group">
              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-2 h-2 bg-orange-500" />
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-orange-500" />

              <img
                src="/assets/Hackloho.png"
                alt="Hackwise 2.0 Hero"
                className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,122,26,0.6)]"
              />

              {/* Floating Date Badge - Unique Positioning */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 -translate-x-1/2 -rotate-90 origin-center hidden md:flex items-center gap-4 whitespace-nowrap z-[-1]">
                <div className="h-px w-16 bg-linear-to-l from-orange-500 to-transparent"></div>
                <div className="flex flex-col items-center">
                  <span className="font-mono text-orange-500 font-bold text-xl tracking-widest">
                    4 & 5 APRIL
                  </span>
                  <span className="text-white/50 text-xs tracking-[0.5em] uppercase">
                    2026
                  </span>
                </div>
                <div className="h-px w-16 bg-linear-to-r from-orange-500 to-transparent"></div>
              </div>

              {/* Mobile/Tablet Date Badge - Bottom Overlap */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 md:hidden bg-[#0A090F] border border-orange-500/30 px-6 py-2 w-max">
                <div className="flex items-center gap-2">
                  <i className="ri-calendar-event-line text-orange-500"></i>
                  <span className="font-mono text-white font-bold text-sm tracking-widest">
                    4 & 5 APRIL 2026
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Sidebar - Fixed Right */}
        <div className="absolute top-1/2 -translate-y-1/2 right-0 hidden lg:flex flex-col gap-0 z-20 border border-white/10 bg-black/80 backdrop-blur-sm">
          {/* Top Box */}
          <div className="w-12 h-12 flex items-center justify-center border-b border-white/10">
            <i className="ri-donut-chart-fill text-orange-500 text-xl" />
          </div>

          {[
            {
              icon: "ri-instagram-line",
              link: "https://www.instagram.com/spherehive?igsh=YmdwNjViZDlvcHZp",
            },
            { icon: "ri-global-line", link: "https://spherehive.in/" },
            {
              icon: "ri-linkedin-fill",
              link: "https://www.linkedin.com/company/spherehive/",
            },
            {
              icon: "ri-whatsapp-line",
              link: "https://chat.whatsapp.com/JvCxszNiFPb1Qq7H8zrftl",
            },
          ].map(({ icon, link }, i) => (
            <a
              key={i}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="w-12 h-12 flex items-center justify-center border-t border-white/10 hover:bg-white transition-colors duration-300 cursor-pointer">
                <i
                  className={`${icon} text-white/70 text-xl transition-colors duration-300 group-hover:text-black`}
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
