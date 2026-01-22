'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function RegistrationSuccessContent() {
  const searchParams = useSearchParams();
  const teamName = searchParams.get('team');

  const cardClipPath = "polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)";
  const btnClipPath = "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)";

  return (
    <section className="section-container border-t border-white/10 pb-32">
      <div className="max-w-2xl mx-auto">
        <div className="relative group">
          <div className="absolute inset-0 bg-green-500/20 blur-xl opacity-50 transition-opacity duration-500" />
          <div className="relative p-px" style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}>
            <div
              className="absolute inset-0 bg-white/20 group-hover:bg-green-500/50 transition-colors duration-300"
              style={{ clipPath: cardClipPath }}
            />
            <div className="relative bg-[#0A090F] p-8 md:p-12 text-center" style={{ clipPath: cardClipPath }}>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <i className="ri-checkbox-circle-fill text-5xl text-green-500" />
              </div>

              <h1 className="text-3xl md:text-4xl font-hackwise text-white uppercase tracking-wider mb-4">
                Registration Successful!
              </h1>

              <p className="text-white/80 font-sans mb-6">
                {teamName ? (
                  <>
                    <span className="text-orange-500 font-bold">{teamName}</span> has been successfully registered for Hackwise 2.0!
                  </>
                ) : (
                  <>Your team has been successfully registered for Hackwise 2.0!</>
                )}
              </p>

              <div className="bg-white/5 border border-white/10 p-6 mb-6 text-left">
                <p className="text-sm text-white/70 font-sans mb-2">
                  <span className="text-orange-500 font-semibold">What's Next?</span>
                </p>
                <ul className="space-y-2 text-white/60 font-sans text-sm">
                  <li className="flex gap-2 items-start">
                    <span className="text-orange-500 mt-1">■</span>
                    <span>You'll receive a confirmation email shortly</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-orange-500 mt-1">■</span>
                    <span>Stay tuned for updates and announcements</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-orange-500 mt-1">■</span>
                    <span>Join our WhatsApp group for real-time updates</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/"
                  className="relative w-full sm:flex-1 block group cursor-pointer"
                >
                  <div
                    className="absolute inset-0 bg-orange-500/50 group-hover:bg-orange-500 transition-colors duration-300"
                    style={{ clipPath: btnClipPath }}
                  />
                  <div
                    className="relative bg-[#0A090F] m-[1px] py-3 text-center transition-all duration-300"
                    style={{ clipPath: btnClipPath }}
                  >
                    <div className="absolute inset-0 bg-white/5 group-hover:bg-orange-500/10 transition-colors duration-300" />
                    <span className="relative text-white font-sans font-bold uppercase tracking-wide">
                      Back to Home
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function RegistrationSuccessPage() {
  return (
    <Suspense fallback={
      <section className="section-container border-t border-white/10 pb-32">
        <div className="text-center text-white/60 font-mono">Loading...</div>
      </section>
    }>
      <RegistrationSuccessContent />
    </Suspense>
  );
}

