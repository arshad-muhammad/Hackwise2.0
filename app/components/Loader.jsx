"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import DecryptedText from "./DecryptedText";

export default function Loader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Disable scroll when loading
    if (loading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3 seconds splash duration

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "auto";
    };
  }, [loading]);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            filter: "blur(10px)",
            transition: { duration: 0.8, ease: "easeInOut" }
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0A090F]"
          suppressHydrationWarning
        >
            <div className="relative flex flex-col items-center">
                 {/* Glowing effect behind logo */}
                 <div className="absolute inset-0 bg-orange-500/20 blur-[100px] rounded-full" />
                 
                 <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative w-32 h-32 md:w-40 md:h-40 mb-8 z-10"
                 >
                    <Image 
                        src="/assets/Hackloho.png" 
                        alt="Hackwise Logo" 
                        fill 
                        className="object-contain drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" 
                        priority
                    />
                 </motion.div>
                
                <div className="z-10 text-center">
                    <div className="text-2xl md:text-4xl font-bold font-mono text-white mb-2 tracking-wider">
                         <DecryptedText 
                            text="HACKWISE 2.0" 
                            animateOn="view" 
                            revealDirection="center" 
                            speed={100}
                            maxIterations={20}
                            characters="ABCD1234!@#$"
                            className="text-white"
                        />
                    </div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="text-white/50 font-mono text-sm tracking-[0.2em] uppercase"
                    >
                        Innovate • Deploy • Disrupt
                    </motion.div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-20 w-64 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                    className="h-full bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-500"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.8, ease: "easeInOut" }}
                />
            </div>
            
            {/* Loading text */}
             <motion.div 
                className="absolute bottom-12 text-xs font-mono text-white/30"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
             >
                INITIALIZING SYSTEM...
             </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}

