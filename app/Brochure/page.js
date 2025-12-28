import React from "react";
import DecryptedText from "../components/DecryptedText";

const BrochurePage = () => {
  return (
    <section className="section-container border-t border-white/10 flex flex-col items-center justify-center py-24 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:4rem_4rem] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>
      
      {/* Main Card */}
      <div className="relative w-full max-w-5xl mx-auto px-4 md:px-0">
        
        {/* Glowing backdrop */}
        <div className="absolute inset-0 bg-orange-500/10 blur-3xl transform -rotate-1 pointer-events-none"></div>

        <div className="relative bg-[#0A090F]/80 backdrop-blur-md border border-white/10 p-8 md:p-16 overflow-hidden group hover:border-orange-500/30 transition-colors duration-500">
            
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-orange-500"/>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-orange-500"/>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-orange-500"/>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-orange-500"/>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                
                {/* Left: Content */}
                <div className="flex flex-col gap-8 relative z-10 text-center md:text-left items-center md:items-start">
                    <div className="space-y-4">
                       
                        <h2 className="font-hackwise text-4xl md:text-5xl lg:text-6xl text-white uppercase tracking-wide leading-tight">
                            Event <br className="hidden md:block" /><span className="text-orange-500">Brochure</span>
                        </h2>
                        <p className="text-white/60 font-sans text-lg max-w-md leading-relaxed">
                            Access the complete guide to Hackwise 2.0. Explore the problem statements, rules, judging criteria, and the complete schedule.
                        </p>
                    </div>

                    <a
                        href="/brochure.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="w-fit px-8 py-4 text-black font-bold font-mono bg-orange-500 hover:brightness-110 transition-all duration-300 rounded-none cursor-pointer shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] flex items-center gap-3 group/btn"
                        style={{
                            clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)"
                        }}
                    >
                        <i className="ri-download-line text-xl group-hover/btn:translate-y-0.5 transition-transform duration-300"></i>
                        <DecryptedText text="Download PDF" sequential speed={40} />
                    </a>
                </div>

                {/* Right: Visual */}
                <div className="relative flex items-center justify-center">
                    {/* Decorative Circle */}
                    <div className="absolute w-64 h-64 border border-white/5 rounded-full animate-[spin_10s_linear_infinite]"></div>
                    <div className="absolute w-48 h-48 border border-white/5 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                    
                    {/* Icon Box */}
                    <div className="w-48 h-64 border border-white/20 bg-white/5 backdrop-blur-sm flex flex-col items-center justify-center gap-4 relative transform rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-2xl">
                        <div className="absolute top-4 left-4 w-full h-full border border-orange-500/20 -z-10 rounded-sm"></div>
                        
                        <i className="ri-file-pdf-2-line text-6xl text-orange-500/80 group-hover:text-orange-500 transition-colors duration-300"></i>
                        <div className="flex flex-col gap-2 items-center w-full px-8">
                            <div className="h-1 w-full bg-white/10 rounded-full"></div>
                            <div className="h-1 w-2/3 bg-white/10 rounded-full"></div>
                            <div className="h-1 w-3/4 bg-white/10 rounded-full"></div>
                        </div>
                        
                        {/* "Corner" of the paper effect */}
                        <div className="absolute top-0 right-0 w-0 h-0 border-l-[30px] border-b-[30px] border-l-transparent border-b-white/5 backdrop-blur-md"></div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default BrochurePage;
