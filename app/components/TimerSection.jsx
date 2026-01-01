import React from "react";
import CountdownTimer from "./CountdownTimer";

const TimerSection = () => {
  // Set target date to January 21, 2026
  const targetDate = new Date("2026-02-28T11:11:11");

  return (
    <section className="w-full py-12 flex flex-col items-center justify-center border-b border-white/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_50%_50%,rgba(255,122,26,0.05),transparent_60%)] -z-10 pointer-events-none" />

      <div className="flex flex-col items-center gap-6 z-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-orange-500 animate-pulse rounded-full" />
          <p className="font-mono text-sm md:text-base text-white/70 uppercase tracking-[0.2em]">
            Registration closes in
          </p>
          <div className="w-2 h-2 bg-orange-500 animate-pulse rounded-full" />
        </div>

        <CountdownTimer targetDate={targetDate} />
      </div>
    </section>
  );
};

export default TimerSection;
