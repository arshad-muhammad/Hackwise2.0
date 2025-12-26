import React from "react";
import Link from "next/link";
import { Hammer } from "lucide-react";

export default function AccommodationPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[100px] -z-10" />

      {/* Content */}
      <div className="relative z-10 text-center space-y-8 px-4">
        {/* Animated Icon */}
        <div className="w-24 h-24 mx-auto border border-orange-500/30 bg-orange-500/5 rounded-full flex items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-orange-500/10 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full" />
          <Hammer className="w-10 h-10 text-orange-500 animate-pulse" />
        </div>

        {/* Text Content */}
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-hackwise text-white uppercase tracking-wider">
            Coming Soon
          </h1>
          <p className="font-mono text-white/60 text-lg md:text-xl">
            Accommodation details are being finalized.
            <br />
            Stay tuned for updates!
          </p>
        </div>

        {/* Back Button */}
        <div className="pt-8">
          <Link
            href="/"
            className="inline-block px-8 py-3 border border-white/20 hover:border-orange-500 hover:bg-orange-500/10 text-white font-mono uppercase tracking-widest text-sm transition-all duration-300"
            style={{
              clipPath:
                "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
            }}
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

