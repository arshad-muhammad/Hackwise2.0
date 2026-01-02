import React from "react";
import DecryptedText from "../components/DecryptedText.jsx";

function FlowPage() {
  const cardClipPath =
    "polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)";
  const btnClipPath =
    "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)";

  return (
    <section className="section-container border-t border-white/10 pb-32">
      {/* Header Section */}
      <div className="w-full flex justify-center mb-20">
        <div className="inline-block border border-white/20 bg-[#0A090F] px-8 py-4">
          <h1 className="text-3xl md:text-5xl font-hackwise text-white uppercase tracking-wider text-center">
            Hackathon Flow
          </h1>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-center items-stretch gap-8 lg:gap-12 w-full">
        {/* Card 1: Online Screening */}
        <div className="relative w-full max-w-md lg:w-1/2 flex-1 group">
          {/* Hover Glow Effect */}
          <div className="absolute inset-0 bg-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div
            className="relative h-full p-px"
            style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}
          >
            {/* Border Layer - Absolute behind content */}
            <div
              className="absolute inset-0 bg-white/20 group-hover:bg-orange-500/50 transition-colors duration-300"
              style={{ clipPath: cardClipPath }}
            />

            {/* Content Layer - Relative to give height */}
            <div
              className="relative bg-[#0A090F] p-8 flex flex-col h-full"
              style={{
                clipPath: cardClipPath,
              }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-black font-bold text-xl font-hackwise">
                  1
                </div>
                <div>
                  <h2 className="text-xl font-hackwise text-white uppercase">
                    Phase 1: The Gauntlet
                  </h2>
                  <p className="text-sm text-white/60 font-sans">
                    Online Screening
                  </p>
                  <p className="text-xs text-orange-500 font-mono mt-1">
                    14 Jan 2026 - 28 Feb 2026
                  </p>
                </div>
              </div>

              <p className="text-sm text-white/80 mb-6 leading-relaxed font-sans">
                Prove your worth. Submit a game-changing SaaS concept to secure
                your deployment in the finals.
              </p>

              <div className="space-y-4 mb-6 grow font-sans text-sm">
                <div className="mb-4 text-white/90">
                  <span className="text-orange-500 font-bold">
                    Eligibility:
                  </span>{" "}
                  Teams of 2-4 members. Open to students from any branch and any
                  college.
                </div>
                <p className="font-semibold text-orange-500 uppercase tracking-wide">
                  Mission Brief:
                </p>
                <ul className="space-y-2 text-white/70">
                  <li className="flex gap-2 items-start">
                    <span className="text-orange-500 mt-0">■</span>
                    Detailed PPT (Problem, Solution, Tech Stack, USP)
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-orange-500 mt-0">■</span>
                    Comprehensive Concept Note
                  </li>
                </ul>
              </div>

              <div className="text-xs text-white/50 mb-8 font-sans border-t border-white/10 pt-4">
                <div className="mb-2">
                  <span className="text-orange-400">Evaluation & Results:</span>{" "}
                  First 2 weeks of March
                </div>
                Evaluated by{" "}
                <span className="text-white">Dyashin Technosoft</span>.<br />
                Top teams shortlisted.
              </div>

              <a
                href="https://unstop.com/o/XIlFdnH?lb=yGGr6gxO&utm_medium=Share&utm_source=muhamr70994&utm_campaign=Online_coding_challenge"
                target="_blank"
                rel="noopener noreferrer"
                className="relative w-full block group cursor-pointer"
              >
                <div
                  className="absolute inset-0 bg-orange-500/50 group-hover:bg-orange-500 transition-colors duration-300"
                  style={{ clipPath: btnClipPath }}
                />
                <div
                  className="relative bg-[#0A090F] m-[1px] py-3 text-center transition-all duration-300"
                  style={{ clipPath: btnClipPath }}
                >
                  <div className="absolute inset-0 bg-white/5 group-hover:bg-orange-500/10 transition-colors duration-300" />
                  <span className="relative text-white font-sans">
                    <DecryptedText
                      text="Register on Unstop"
                      sequential
                      speed={30}
                    />
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Card 2: Onsite Hackathon */}
        <div className="relative w-full max-w-md lg:w-1/2 flex-1 group">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div
            className="relative h-full p-px"
            style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}
          >
            <div
              className="absolute inset-0 bg-white/20 group-hover:bg-blue-500/50 transition-colors duration-300"
              style={{ clipPath: cardClipPath }}
            />

            <div
              className="relative bg-[#0A090F] p-8 flex flex-col h-full"
              style={{
                clipPath: cardClipPath,
              }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-black font-bold text-xl font-hackwise">
                  2
                </div>
                <div>
                  <h2 className="text-xl font-hackwise text-white uppercase">
                    Phase 2: The Showdown
                  </h2>
                  <p className="text-sm text-white/60 font-sans">
                    KVGCE Campus
                  </p>
                  <p className="text-xs text-blue-500 font-mono mt-1">
                    4 & 5 April 2026
                  </p>
                </div>
              </div>

              <p className="text-sm text-white/80 mb-6 leading-relaxed font-sans">
                24 hours of adrenaline, code, and caffeine. Build, break, and
                rebuild your vision into reality.
              </p>

              <ul className="space-y-2 text-sm text-white/70 mb-6 font-sans">
                <li className="flex gap-2 items-center">
                  <span className="text-orange-500">■</span> 24-hour Non-Stop
                  Sprint
                </li>
                <li className="flex gap-2 items-center">
                  <span className="text-orange-500">■</span> Full Logistics
                  Support
                </li>
                <li className="flex gap-2 items-center">
                  <span className="text-orange-500">■</span> Mentor Access &
                  High-Speed Net
                </li>
              </ul>

              <div className="space-y-3 mb-8 grow font-sans text-sm border-t border-white/10 pt-4">
                <div className="mb-4 text-white/90">
                  <span className="text-orange-500 font-bold">
                    Registration Fee:
                  </span>{" "}
                  ₹500 per team (Only for shortlisted teams).
                </div>
                <p className="font-semibold text-white uppercase tracking-wide">
                  Rewards:
                </p>
                <ul className="space-y-2 text-white/70">
                  <li className="flex gap-2 items-start">
                    <span className="text-orange-500 mt-0">■</span>
                    <span>
                      Winning team receives placement opportunities from{" "}
                      <span className="text-white font-semibold">
                        Dyashin Technosoft
                      </span>
                    </span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-orange-500 mt-0">■</span>
                    <span>
                      Selected teams offered internships by{" "}
                      <span className="text-white font-semibold">
                        Dyashin Technosoft
                      </span>
                    </span>
                  </li>
                </ul>
              </div>

              <a
                href="https://unstop.com/o/XIlFdnH?lb=yGGr6gxO&utm_medium=Share&utm_source=muhamr70994&utm_campaign=Online_coding_challenge"
                target="_blank"
                rel="noopener noreferrer"
                className="relative w-full block group cursor-pointer"
              >
                <div
                  className="absolute inset-0 bg-orange-500/50 group-hover:bg-orange-500 transition-colors duration-300"
                  style={{ clipPath: btnClipPath }}
                />
                <div
                  className="relative bg-[#0A090F] m-[1px] py-3 text-center transition-all duration-300"
                  style={{ clipPath: btnClipPath }}
                >
                  <div className="absolute inset-0 bg-white/5 group-hover:bg-orange-500/10 transition-colors duration-300" />
                  <span className="relative text-white font-sans">
                    <DecryptedText text="View Details" sequential speed={30} />
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FlowPage;
