import React from "react";
import DecryptedText from "../components/DecryptedText.jsx";

export default function page() {
  return (
    <section className="section-container border-t border-white/10">
        
        {/* Header Section */}
        <div className="w-full flex justify-end mb-12">
            <div className="inline-block border border-white/20 bg-[#0A090F] px-8 py-4">
                <h1 className="text-3xl md:text-5xl font-hackwise text-white uppercase tracking-wider text-right">
                  About Sphere Hive
                </h1>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full items-start">
            
            {/* Left Column: Visuals & Logo */}
            <div className="lg:col-span-4 flex flex-col gap-8 order-2 lg:order-1">
                 <div className="w-40 h-40 md:w-56 md:h-56 border border-white/20 flex items-center justify-center bg-black/40 backdrop-blur-md relative self-center lg:self-start">
                      <div className="absolute top-0 left-0 w-2 h-2 bg-orange-500"/>
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-orange-500"/>
                      <img
                        src="/assets/logo.png"
                        alt="Sphere Hive Logo"
                        className="w-24 h-24 md:w-32 md:h-32 object-contain"
                      />
                </div>
                 
                 <div className="hidden lg:flex flex-col gap-24 items-end pr-12 opacity-50">
                    <div className="w-2 h-2 bg-orange-500" />
                    <div className="w-2 h-2 bg-orange-500" />
                 </div>
            </div>

            {/* Right Column: Content */}
            <div className="lg:col-span-8 flex flex-col gap-8 order-1 lg:order-2">
                 <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-3 h-3 bg-orange-500 shadow-[0_0_10px_rgba(255,122,26,0.5)]"></div>
                        <p className="text-2xl md:text-3xl font-display font-bold leading-tight uppercase">
                            The Foundry of <br className="hidden md:block" />
                            <span className="text-orange-500">Future Tech Leaders.</span>
                        </p>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 md:p-10 backdrop-blur-sm relative group hover:border-orange-500/30 transition-colors duration-500">
                    <p className="text-body font-sans text-sm md:text-base mb-8">
                        Sphere Hive is the crucible of innovation. We don't just teach technology; we forge the leaders who will define it.
                        By fusing bleeding-edge tech with radical creativity, we empower you to solve the unsolvable.
                    </p>

                    <div className="flex justify-end">
                        <a
                            href="https://spherehive.in/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-fit px-8 py-3 bg-orange-500 text-black font-mono font-bold hover:bg-orange-600 transition-all duration-300 rounded-none inline-block text-center cursor-pointer shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)]"
                            style={{
                                clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)"
                            }}
                        >
                            <DecryptedText text="Explore the Hive" sequential />
                        </a>
                    </div>
                </div>
            </div>
        </div>

        {/* Group Photo Section */}
        <div className="w-full mt-24 relative group cursor-pointer overflow-hidden border border-white/10 rounded-sm">
             {/* Decorative corners */}
             <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-orange-500 z-20"></div>
             <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-orange-500 z-20"></div>
             <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-orange-500 z-20"></div>
             <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-orange-500 z-20"></div>

             <div className="relative aspect-21/9 w-full overflow-hidden">
                <img 
                    src="/assets/group-photo-placeholder.jpg" // Replace with actual image path
                    alt="Sphere Hive Team" 
                    className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out scale-100 group-hover:scale-105"
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-100 group-hover:opacity-60 transition-opacity duration-500"></div>
                
                {/* Caption */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    <p className="text-orange-500 font-mono text-sm tracking-[0.3em] uppercase mb-2">The Team</p>
                    <h3 className="text-white font-display text-2xl uppercase">Behind The Innovation</h3>
                </div>
             </div>
        </div>

    </section>
  );
}
