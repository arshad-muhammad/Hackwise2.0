import React from "react";
import DecryptedText from "../components/DecryptedText.jsx";

function page() {
  return (
    <div>
      <section className="h-[100vh] text-white">
        <div className="absolute top-[2400px] left-[92px] right-[90px] w-166 h-35 text-white bg-[#0A090F] flex items-center justify-center border-t border-white/15">
          <h1 className="text-5xl font-hackwise">Hackathon Flow</h1>
        </div>
        <div className="flex justify-center items-center mt-[420px] gap-20">
          {/* Flow Card 1 */}
          <div className="relative w-[420px] h-[550px]">
            {/* Stroke Layer */}
            <div
              className="absolute inset-0 bg-white/15 z-[1]"
              style={{
                clipPath: `polygon(
        20px 0%,
        100% 0%,
        100% calc(100% - 20px),
        calc(100% - 20px) 100%,
        0% 100%,
        0% 20px
      )`,
              }}
            />

            {/* Main Card */}
            <div
              className="absolute inset-[1px] bg-[#0A090F] z-[2] text-white px-6 py-6"
              style={{
                clipPath: `polygon(
        20px 0%,
        100% 0%,
        100% calc(100% - 20px),
        calc(100% - 20px) 100%,
        0% 100%,
        0% 20px
      )`,
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-[50px] h-[50px] rounded-[10px] bg-white flex items-center justify-center text-black font-bold text-[20px] font-hackwise">
                  1
                </div>

                <div>
                  <h2 className="text-[20px] font-hackwise">
                    Online Screening
                  </h2>
                  <p className="text-sm text-white/60">Online</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-white/80 mb-4 leading-relaxed">
                Participants must submit their innovative SaaS idea to secure a
                spot in the final hackathon.
              </p>

              {/* Submissions */}
              <p className="text-sm mb-2">Submissions must include:</p>

              <ul className="text-sm text-white/80 space-y-2 mb-4">
                <li className="flex gap-2">
                  <span className="text-orange-500">■</span>
                  PPT (Problem, Solution, Features, Tech Stack, Market, USP)
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-500">■</span>
                  Concept Note (Brief explanation of the idea)
                </li>
              </ul>

              {/* Evaluation */}
              <p className="text-sm text-white/80 mb-4 leading-relaxed">
                All submissions will be evaluated in Round 1, and the evaluation
                of ideas will be done by{" "}
                <span className="font-semibold text-white">
                  Dyashin Technosoft
                </span>
                .
              </p>

              <p className="text-sm text-white/80 mb-4">
                Based on this evaluation, the Top 30 teams will be shortlisted
                for the final round.
              </p>

              <p className="text-sm text-white/80 mb-8">
                Registration and submission upload will be done through{" "}
                <span className="font-semibold text-white">Unstop</span>.
              </p>

              {/* Button */}
              <button
                type="button"
                href="spherehive.in"
                className="explore-btn cursor-pointer relative top-[30px] ml-20 text-white font-mono font-extralight px-[40px] py-2 border-2 rounded-[5px] border-orange-500 bg-black transition"
              >
                <a
                  href="https://spherehive.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <DecryptedText text="Register Now" sequential />
                </a>
              </button>
            </div>
          </div>

          {/* Flow Card 1 */}
          <div className="relative w-[420px] h-[550px]">
            {/* Stroke Layer */}
            <div
              className="absolute inset-0 bg-white/15"
              style={{
                clipPath: `polygon(
        20px 0%,
        100% 0%,
        100% calc(100% - 20px),
        calc(100% - 20px) 100%,
        0% 100%,
        0% 20px
      )`,
              }}
            />

            {/* Main Card */}
            <div
              className="absolute inset-[1px] bg-[#0A090F] text-white px-6 py-6"
              style={{
                clipPath: `polygon(
        20px 0%,
        100% 0%,
        100% calc(100% - 20px),
        calc(100% - 20px) 100%,
        0% 100%,
        0% 20px
      )`,
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-[50px] h-[50px] rounded-[10px] bg-white flex items-center justify-center text-black font-bold text-[20px] font-hackwise">
                  2
                </div>

                <div>
                  <h2 className="text-[20px] font-hackwise">
                    Onsite Hackathon
                  </h2>
                  <p className="text-sm text-white/60">KVGCE Campus</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-white/80 mb-4 leading-relaxed">
                Shortlisted teams will participate in a focused{" "}
                <span className="font-semibold text-white">
                  36-hour onsite hackathon
                </span>
                to develop and present their SaaS solution.
              </p>

              {/* Points */}
              <ul className="text-sm text-white/80 space-y-2 mb-4">
                <li className="flex gap-2">
                  <span className="text-orange-500">■</span>
                  36-hour development sprint
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-500">■</span>
                  ₹500 per team (includes food and accommodation)
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-500">■</span>
                  High-speed Wi-Fi and charging facilities
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-500">■</span>
                  Continuous mentor support
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-500">■</span>
                  Midnight Jam: networking and refreshments
                </li>
              </ul>

              {/* Opportunities */}
              <p className="text-sm font-semibold mb-2">Opportunities:</p>

              <ul className="text-sm text-white/80 space-y-2 mb-10">
                <li className="flex gap-2">
                  <span className="text-orange-500">■</span>
                  <span>
                    <span className="text-white font-semibold">
                      Winning team
                    </span>{" "}
                    receives placement opportunities from{" "}
                    <span className="text-white font-semibold">
                      Dyashin Technosoft
                    </span>
                    .
                  </span>
                </li>

                <li className="flex gap-2">
                  <span className="text-orange-500">■</span>
                  <span>
                    Selected teams will be offered internships by{" "}
                    <span className="text-white font-semibold">
                      Dyashin Technosoft
                    </span>
                    .
                  </span>
                </li>
              </ul>

              {/* Button */}
              <button
                type="button"
                href="spherehive.in"
                className="explore-btn cursor-pointer relative top-[0px] ml-20 text-white font-mono font-extralight px-[60px] py-2 border-2 rounded-[5px] border-orange-500 bg-black transition"
              >
                <a
                  href="https://spherehive.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <DecryptedText text="Know More" sequential />
                </a>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default page;
