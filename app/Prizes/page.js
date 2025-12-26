import React from "react";
import DecryptedText from "../components/DecryptedText";

const Prizes = () => {
  const cardClipPath = "polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)";

  const prizes = [
    {
      rank: "1st",
      title: "Champion",
      amount: "₹40,000",
      perks: ["Direct Job Offer", "Exclusive Rewards", "Goodies"],
      color: "from-yellow-400 to-yellow-600",
      glow: "bg-yellow-500/20"
    },
    {
      rank: "2nd",
      title: "Runner Up",
      amount: "₹20,000",
      perks: ["Internship Offer", "Exclusive Rewards", "Goodies"],
      color: "from-gray-300 to-gray-500",
      glow: "bg-gray-400/20"
    },
    {
      rank: "3rd",
      title: "Second Runner Up",
      amount: "Internship",
      perks: ["Internship Offer", "Exclusive Rewards", "Goodies"],
      color: "from-orange-400 to-red-600", // Bronze-ish
      glow: "bg-orange-600/20"
    }
  ];

  return (
    <section id="prizes" className="section-container border-t border-white/10">
       <div className="w-full flex justify-center mb-16">
        <div className="inline-block border border-white/20 bg-[#0A090F] px-8 py-4">
          <h1 className="text-3xl md:text-5xl font-hackwise text-white uppercase tracking-wider text-center">
            Prize Pool
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {prizes.map((prize, index) => (
          <div 
            key={index} 
            className={`relative w-full group flex flex-col ${index === 0 ? 'md:-mt-12 md:order-2' : index === 1 ? 'md:order-1' : 'md:order-3'}`}
          >
             <div className={`absolute inset-0 ${prize.glow} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
             
             <div className="relative w-full grow flex flex-col" style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}>
                <div
                  className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors duration-300"
                  style={{ clipPath: cardClipPath }}
                />
                
                <div
                  className="relative bg-[#0A090F] p-8 flex flex-col items-center text-center grow min-h-[420px] justify-between gap-4"
                  style={{ 
                    clipPath: cardClipPath,
                    margin: '1px'
                  }}
                >
                    <div className="flex flex-col items-center gap-4 w-full">
                        <div className={`w-20 h-20 rounded-full bg-linear-to-br ${prize.color} flex items-center justify-center text-black font-bold text-3xl font-hackwise mb-4 shadow-lg shrink-0`}>
                            {prize.rank}
                        </div>

                        <h2 className="text-2xl font-hackwise text-white uppercase tracking-wide min-h-12 flex items-center justify-center">
                            {prize.title}
                        </h2>
                        
                        <div className="text-4xl font-mono text-orange-500 font-bold my-2 min-h-12 flex items-center justify-center">
                            {prize.amount}
                        </div>
                    </div>

                    <div className="w-full border-t border-white/10 pt-4 mt-auto">
                        <ul className="space-y-2">
                            {prize.perks.map((perk, i) => (
                                <li key={i} className="text-white/60 text-sm font-sans flex items-center justify-center gap-2">
                                    <span className="text-orange-500 text-xs shrink-0">●</span> <span>{perk}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
             </div>
          </div>
        ))}
      </div>
      
      
    </section>
  );
};

export default Prizes;

