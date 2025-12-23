import { Span } from "next/dist/trace";
import React from "react";

function AboutPage() {
  return (
    <section className="h-[100vh] text-white">
      <div className="absolute top-[760px] left-[92px] right-[90px] w-166 h-35 text-white bg-[#0A090F] flex items-center justify-center border-t border-white/15">
        <h1 className="text-5xl font-hackwise">ABOUT HACKWISE 2.0</h1>
      </div>
      <div className="w-35 h-35 ml-[1089px] mt-[62px] border border-white/80 flex items-center justify-center">
        <img
          src="/assets/Hackloho.png"
          alt="Hackwise Icon"
          className="w-20 h-20 object-contain"
        />
      </div>
      <div className="ml-[120px]">
        <div className="theme flex items-center mt-[30px] gap-3">
          <div className="w-[11px] h-[11px] bg-orange-500"></div>
          <h3 className="font-mono text-[20px]">Theme</h3>
        </div>
        <p className="pl-[27px] text-[20px]">
          Building a SaaS-Software that <br /> Serves the World.
        </p>
      </div>
      <div className="w-333 h-[40vh] bg-[#0A090F]  ml-[90px] mt-[30px] border border-white/15">
        <p className="font-mono px-[50px] pt-[50px]">
          <span className="font-sans font-bold">Hackwise 2.0</span> is a
          national-level SaaS hackathon that brings together the brightest minds
          in software engineering to create innovative Software as a Service
          solutions that address real-world challenges.
        </p>

        <p className="font-mono px-[50px] pt-[15px]">
          Hosted by <span className="font-sans font-bold">Sphere Hive</span> at
          <span className="font-sans font-bold px-[8px]">
            KVG College of Engineering
          </span>
          , this 36-hour event challenges participants to ideate, design, and
          develop SaaS products that can scale globally and serve millions of
          users
        </p>

        <p className="font-mono px-[50px] pt-[15px]">
          Our mission is to foster innovation in cloud computing, artificial
          intelligence, and modern web technologies while building a community
          of creators who are passionate about solving problems through
          software.
        </p>
      </div>
    </section>
  );
}

export default AboutPage;
