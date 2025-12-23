import React from "react";

function AboutPage() {
  return (
    <section className="h-[100vh] text-white">
      <div className="absolute top-190 left-[90px] right-[90px] w-166 h-35 text-black bg-white/90 flex items-center justify-center">
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
    </section>
  );
}

export default AboutPage;
