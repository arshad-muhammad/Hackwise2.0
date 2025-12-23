import React from "react";
import DecryptedText from "../components/DecryptedText.jsx";
import Card from "../components/card.jsx";

export default function page() {
  return (
    <>
      <div className="mainSh h-[100vh] w-full">
        <div className="flex flex-col">
          <div className="absolute float-right top-[1480px] left-[758px] right-[90px] w-166 h-35 text-white bg-[#0A090F] flex items-center justify-center border-t border-white/15">
            <h1 className="text-5xl font-hackwise">ABOUT SPHERE HIVE</h1>
          </div>

          <div className="flex items-center gap-6 ml-[285px] mt-[21px]">
            {/* Logo */}
            <div className="w-35 h-35 border border-white/80 flex items-center justify-center">
              <img
                src="/assets/logo.png"
                alt="Hackwise Icon"
                className="w-30 h-30 object-contain"
              />
            </div>

            {/* Paragraph */}
            <div className="theme flex items-center -mt-[30px] ml-[20px]">
              <div className="w-[11px] h-[11px]  bg-orange-500"></div>
              <p className="text-white ml-[15px] mt-[35px] text-wrap">
                A space where ideas <br /> transform into groundbreaking <br />
                solutions.
              </p>
            </div>
          </div>
        </div>
        <div className="w-250 h-[40vh] bg-[#0A090F]  ml-[90px] mt-[80px] border border-white/15">
          <div className="absolute top-[1720px] left-[110px] flex flex-col gap-[215px]">
            <div className="w-[11px] h-[11px] bg-orange-500" />
            <div className="w-[11px] h-[11px] bg-orange-500" />
          </div>
          <div className="absolute top-[1720px] right-[445px] flex flex-col gap-[215px]">
            <div className="w-[11px] h-[11px] bg-orange-500" />
            <div className="w-[11px] h-[11px] bg-orange-500" />
          </div>
          <p className="text-white font-mono mt-[70px] px-[50px]">
            Sphere Hive is more than just a tech hub - it's an ecosystem where
            innovation thrives and future tech leaders are forged. We combine
            cutting-edge technology with creative thinking to solve complex
            challenges.
          </p>
          <button
            type="button"
            href="spherehive.in"
            className="explore-btn cursor-pointer relative top-[30px] ml-80 text-white font-mono font-extralight px-[60px] py-3 border-2 rounded-[5px] border-orange-500 bg-black transition"
          >
            <a
              href="https://spherehive.in/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <DecryptedText text="Sphere Hive" sequential />
            </a>
          </button>
        </div>
        <Card />
      </div>
    </>
  );
}
