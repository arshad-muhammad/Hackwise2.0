import React from "react";
import DecryptedText from "../components/DecryptedText";

const Gallery = () => {
  // Bento Grid Layout Data
  const galleryImages = [
    { 
        id: 1, 
        title: "Winners", 
        category: "Celebration", 
        size: "md:col-span-2 md:row-span-2",
        description: "Victory achieved.",
        src: "/assets/01.jpg"
    },
    { 
        id: 2, 
        title: "Runner Up", 
        category: "Celebration", 
        size: "md:col-span-1 md:row-span-1",
        description: "Victory achieved.",
        src: "/assets/02.jpg"
    },
    { 
        id: 3, 
        title: "Coding Sprint", 
        category: "Development", 
        size: "md:col-span-1 md:row-span-2",
        description: "24 hours of focus.",
        src: "/assets/03.jpg"
    },
    { 
        id: 4, 
        title: "Venue", 
        category: "Environment", 
        size: "md:col-span-1 md:row-span-1",
        description: "Great ambiance.",
        src: "/assets/04.jpg"
    },
    { 
        id: 5, 
        title: "Final Pitch", 
        category: "Presentation", 
        size: "md:col-span-2 md:row-span-1",
        description: "Showcasing innovation.", 
        src: "/assets/05.jpg"
    },
    { 
        id: 6, 
        title: "Mentorship", 
        category: "Guidance", 
        size: "md:col-span-2 md:row-span-1",
        description: "Expert guidance.",
        src: "/assets/06.jpg"
    },
  ];

  return (
    <section className="section-container border-t border-white/10">
      
      {/* Header Section */}
      <div className="w-full flex justify-start mb-16 relative">
        <div className="inline-block border border-white/20 bg-[#0A090F] px-8 py-4 z-10">
          <h1 className="text-3xl md:text-5xl font-hackwise text-white uppercase tracking-wider text-left">
            Previous Highlights
          </h1>
        </div>
        {/* Decorative element */}
        <div className="absolute top-1/2 right-0 w-1/3 h-px bg-linear-to-l from-white/20 to-transparent hidden md:block"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[200px] gap-4 w-full">
        {galleryImages.map((item, index) => (
           <div 
             key={index} 
             className={`group relative overflow-hidden border border-white/10 bg-[#0A090F] hover:border-orange-500/50 transition-all duration-500 ${item.size}`}
           >
                {/* Image */}
                <div className="absolute inset-0">
                    <img 
                        src={item.src}
                        alt={item.title}
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    />
                </div>
                
                {/* Overlay Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-linear-to-t from-black/90 via-black/50 to-transparent">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-orange-500 text-xs font-mono tracking-widest uppercase mb-1">{item.category}</p>
                        <h3 className="text-white font-display text-xl uppercase mb-1">{item.title}</h3>
                        <p className="text-white/60 text-xs font-sans">{item.description}</p>
                    </div>
                </div>

                {/* Corner Accents */}
                <div className="absolute top-0 right-0 w-2 h-2 bg-white/20 group-hover:bg-orange-500 transition-colors duration-300"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 bg-white/20 group-hover:bg-orange-500 transition-colors duration-300"></div>
                
                {/* Hover decorative lines */}
                <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 pointer-events-none transition-colors duration-500 m-2"></div>
           </div>
        ))}
      </div>
      
       <div className="mt-16 w-full flex justify-center items-center gap-4">
             <div className="w-2 h-2 bg-orange-500 animate-pulse"></div>
             <p className="text-white/50 font-mono text-sm uppercase tracking-widest">
                <DecryptedText text="Reliving the legacy of Hackwise 1.0" sequential />
             </p>
             <div className="w-2 h-2 bg-orange-500 animate-pulse"></div>
       </div>
    </section>
  );
};

export default Gallery;
