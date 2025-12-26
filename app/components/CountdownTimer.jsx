"use client";

import { useState, useEffect } from "react";

const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeBox = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20 md:w-24 md:h-24 border border-white/20 bg-black/40 backdrop-blur-sm flex items-center justify-center mb-2 group hover:border-orange-500/50 transition-colors duration-300">
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-1.5 h-1.5 bg-white/30 group-hover:bg-orange-500 transition-colors" />
        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-white/30 group-hover:bg-orange-500 transition-colors" />
        
        <span className="font-display text-3xl md:text-4xl font-bold text-white">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="font-mono text-xs md:text-sm text-orange-500 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex gap-4 md:gap-6 lg:gap-8 justify-start">
      <TimeBox value={timeLeft.days} label="Days" />
      <TimeBox value={timeLeft.hours} label="Hours" />
      <TimeBox value={timeLeft.minutes} label="Mins" />
      <TimeBox value={timeLeft.seconds} label="Secs" />
    </div>
  );
};

export default CountdownTimer;

