"use client";
import React from "react";
import DecryptedText from "../components/DecryptedText";

export default function AccommodationContent() {
  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center items-center px-6 md:px-12 lg:px-24">
      
      <div className="text-center relative z-10">
        <div className="inline-flex items-center gap-2 mb-6 justify-center">
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          <span className="font-mono text-sm text-orange-500 uppercase tracking-widest">
            Stay Tuned
          </span>
        </div>
        
        <h1 className="font-hackwise text-4xl md:text-6xl lg:text-8xl text-white tracking-wide uppercase mb-6">
          COMING <span className="text-orange-500">SOON</span>
        </h1>
        
        <p className="text-white/60 font-mono text-lg md:text-xl max-w-2xl mx-auto mb-12">
          We are finalizing the accommodation arrangements for Hackwise 2.0. 
          <br className="hidden md:block"/>
          Details regarding stay and logistics will be updated shortly.
        </p>

        <div 
            className="relative inline-block group"
            style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
        >
             {/* Border Layer */}
             <div className="absolute inset-0 bg-orange-500/50 group-hover:bg-orange-500 transition-colors duration-300" />
             
             <div 
                className="relative bg-[#0A090F] px-8 py-4 m-px w-[calc(100%-2px)] h-[calc(100%-2px)] flex items-center justify-center backdrop-blur-md"
                style={{ 
                    clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)"
                }}
             >
                 {/* Tint Layer */}
                 <div className="absolute inset-0 bg-orange-500/10 transition-colors duration-300" />

                 <div className="relative z-10 text-center w-full flex justify-center">
                    <DecryptedText 
                        text="SYSTEM.UPDATE_PENDING..." 
                        speed={80} 
                        className="text-orange-500 font-mono tracking-widest text-sm md:text-base inline-block text-center"
                    />
                 </div>
             </div>
        </div>
      </div>

    </section>
  );
}

