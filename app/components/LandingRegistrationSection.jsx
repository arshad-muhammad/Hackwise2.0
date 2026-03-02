'use client';

import { useEffect, useState } from 'react';
import TimerSection from './TimerSection';

export default function LandingRegistrationSection() {
  const [registrationClosed, setRegistrationClosed] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/registration-status');
        if (res.ok) {
          const data = await res.json();
          setRegistrationClosed(Boolean(data.registration_closed));
        }
      } catch (error) {
        console.error('Failed to fetch registration status for landing page:', error);
        // Fallback: keep timer visible
      }
    };

    fetchStatus();
  }, []);

  if (!registrationClosed) {
    return <TimerSection />;
  }

  return (
    <section className="w-full py-16 flex flex-col items-center justify-center border-b border-white/10 relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,122,26,0.18),transparent_60%)] pointer-events-none -z-10" />

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        {/* Pill label */}
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-orange-500/40 bg-black/60 mb-6">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-white/70">
            Registration Closed
          </span>
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        </div>

        {/* Main card */}
        <div className="relative p-px rounded-[22px] bg-gradient-to-r from-orange-500/80 via-yellow-400/60 to-orange-500/80 shadow-[0_0_40px_rgba(249,115,22,0.6)]">
          <div className="relative rounded-[20px] bg-[#050509]/95 border border-white/10 px-6 py-8 md:px-10 md:py-10 overflow-hidden">
            {/* subtle grid */}
            <div className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,#ffffff20,transparent_0)] bg-[length:16px_16px]" />

            <div className="relative space-y-5">
              <h2 className="font-hackwise text-3xl md:text-4xl lg:text-5xl uppercase tracking-wide text-white">
                Entries Locked
                <span className="block text-orange-400 text-lg md:text-2xl mt-1">
                  See you at Hackwise&nbsp;2.0
                </span>
              </h2>

              <p className="text-sm md:text-base font-sans text-white/70 max-w-xl mx-auto">
                Registrations are now closed. Our teams are gearing up for an intense 24-hour
                build sprint. Join the community to catch live updates, behind-the-scenes,
                and future announcements.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <a
                  href="https://chat.whatsapp.com/JvCxszNiFPb1Qq7H8zrftl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cut-btn group bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 px-0 py-0"
                >
                  <div className="cut-btn-inner px-8 py-3 bg-black/80 flex items-center gap-2 font-mono text-sm md:text-base font-bold uppercase tracking-wide text-white group-hover:bg-black transition-colors">
                    <span>Join Community Channel</span>
                    <i className="ri-whatsapp-line text-lg text-green-400" />
                  </div>
                </a>

                <a
                  href="https://spherehive.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 border border-white/20 bg-white/5 hover:bg-white/10 transition-colors font-mono text-xs md:text-sm uppercase tracking-wide flex items-center gap-2 rounded-none"
                >
                  <span>Explore Sphere Hive</span>
                  <i className="ri-arrow-right-up-line text-base" />
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}


