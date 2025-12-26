import { Span } from "next/dist/trace";
import React from "react";

function AboutPage() {
  return (
    <section className="section-container border-t border-white/10">
      
      {/* Header Section */}
      <div className="w-full max-w-4xl mb-12 relative">
        <div className="inline-block border border-white/20 bg-[#0A090F] px-8 py-4 mb-8">
            <h1 className="text-3xl md:text-5xl font-hackwise text-white uppercase tracking-wider">
              About Hackwise 2.0
            </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full">
        
        {/* Left/Main Content: Theme & Description */}
        <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Theme Block */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-orange-500 shadow-[0_0_10px_rgba(255,122,26,0.5)]"></div>
                    <h3 className="font-mono text-xl text-orange-500 uppercase tracking-widest">The Mission</h3>
                </div>
                <p className="text-2xl md:text-4xl font-display font-bold leading-tight pl-7 uppercase">
                  Innovate. <span className="text-white/50">Deploy.</span> <span className="text-orange-500">Disrupt.</span>
                </p>
            </div>

            {/* Description Card */}
            <div className="bg-white/5 border border-white/10 p-6 md:p-10 backdrop-blur-sm relative overflow-hidden group hover:border-orange-500/30 transition-colors duration-500">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <i className="ri-code-s-slash-line text-6xl text-white"></i>
                </div>
                
                <div className="space-y-6 text-body font-sans text-sm md:text-base">
                    <p>
                        <span className="text-white font-bold">Hackwise 2.0</span> isn't just a hackathon; it's a launchpad.
                        We are summoning the nation's sharpest engineering minds to the ultimate SaaS battleground.
                    </p>

                    <p>
                        Powered by <span className="text-white font-bold">Sphere Hive</span> at
                        <span className="text-white font-bold mx-1">
                            KVG College of Engineering
                        </span>
                        , this 24-hour sprint challenges you to forge solutions that don't just work—they change the game.
                    </p>

                    <p>
                        We are looking for <span className="text-orange-500 font-bold">visionaries</span> ready to redefine cloud computing, AI, and modern web tech. 
                        Build for the world. Scale for the future.
                    </p>
                </div>
            </div>
        </div>

        {/* Right Content: Icon/Visual */}
        <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-start">
             <div className="w-40 h-40 md:w-56 md:h-56 border border-white/20 flex items-center justify-center bg-black/40 backdrop-blur-md relative mt-8 lg:mt-0">
                  <div className="absolute top-0 right-0 w-2 h-2 bg-orange-500"/>
                  <div className="absolute bottom-0 left-0 w-2 h-2 bg-orange-500"/>
                  <img
                    src="/assets/Hackloho.png"
                    alt="Hackwise Icon"
                    className="w-24 h-24 md:w-32 md:h-32 object-contain"
                  />
            </div>
        </div>

      </div>
    </section>
  );
}

export default AboutPage;
