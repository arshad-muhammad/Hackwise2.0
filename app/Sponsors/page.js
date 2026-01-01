"use client";

import React from "react";
import { motion } from "framer-motion";
import DecryptedText from "../components/DecryptedText";

/* Media / Coming Soon */
const comingSoonItems = [
  { id: 1, img: "/assets/Media-logo.png", link: "https://www.instagram.com/summarise_app" },
  { id: 2, img: "/assets/Spectra-logo.png", link: "https://instagram.com/spectra.kvgce" },
];

const SponsorCard = ({ href, imgSrc, imgAlt, className, imgClassName }) => {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`relative group flex items-center justify-center bg-white/5 border border-white/10 rounded-sm overflow-hidden hover:border-orange-500/50 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] transition-all duration-300 ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Cyberpunk Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-white/20 group-hover:border-orange-500 transition-colors duration-300" />
      <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-white/20 group-hover:border-orange-500 transition-colors duration-300" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-white/20 group-hover:border-orange-500 transition-colors duration-300" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-white/20 group-hover:border-orange-500 transition-colors duration-300" />

      {/* Hover Gradient */}
      <div className="absolute inset-0 bg-linear-to-tr from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <img
        src={imgSrc}
        alt={imgAlt}
        className={`z-10 object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 ${imgClassName}`}
      />
    </motion.a>
  );
};

const SectionHeader = ({ title, colorClass = "text-white" }) => (
  <div className="flex items-center gap-4 mb-4 w-full max-w-4xl px-4 md:px-0">
    <div className="h-px bg-linear-to-r from-transparent via-white/20 to-transparent flex-1" />
    <h3 className={`font-mono text-xs sm:text-sm uppercase tracking-[0.2em] ${colorClass}`}>
      {title}
    </h3>
    <div className="h-px bg-linear-to-r from-transparent via-white/20 to-transparent flex-1" />
  </div>
);

const Sponsors = () => {
  return (
    <section
      id="sponsors"
      className="section-container border-t border-white/10 relative overflow-hidden py-12 sm:py-16"
    >
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.03),transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mb-10 sm:mb-14"
        >
          <div className="inline-block border-x border-orange-500/30 bg-[#0A090F]/80 backdrop-blur-sm px-8 py-3 relative">
            <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-orange-500/50 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-orange-500/50 to-transparent" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-hackwise text-white uppercase tracking-wider text-center">
            Our Sponsors
          </h1>
        </div>
        </motion.div>

        <div className="flex flex-col items-center gap-8 md:gap-10">
          {/* Top Tier: Title & Powered By */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
            {/* Title Sponsor */}
            <div className="flex flex-col items-center">
              <SectionHeader title="Title Sponsor" colorClass="text-orange-500" />
              <SponsorCard
                href="https://dyashin.com/"
                imgSrc="/assets/DyashinLogo.png"
                imgAlt="Dyashin Technosoft"
                className="w-full h-32 sm:h-40 p-6"
                imgClassName="max-h-full max-w-[80%]"
              />
      </div>

            {/* Powered By */}
            <div className="flex flex-col items-center">
              <SectionHeader title="Powered By" colorClass="text-blue-500" />
              <SponsorCard
                href="https://unstop.com/"
                imgSrc="/assets/unstop-logo.svg"
                imgAlt="Unstop"
                className="w-full h-32 sm:h-40 p-6"
                imgClassName="max-h-full max-w-[80%]"
            />
          </div>
        </div>

          {/* Middle Tier: Rewards */}
          <div className="w-full max-w-5xl flex flex-col items-center mt-2">
            <SectionHeader title="Reward Sponsors" colorClass="text-yellow-400" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <SponsorCard
                href="https://butti.in/"
                imgSrc="/assets/butti-logo.png"
                imgAlt="Butti"
                className="h-24 sm:h-28 p-4"
                imgClassName="max-h-full max-w-[70%] bg-white/90 rounded-full px-2 py-1"
              />
              <SponsorCard
                href="https://lovable.dev/"
                imgSrc="/assets/lovable-logo.webp"
                imgAlt="Lovable"
                className="h-24 sm:h-28 p-4"
                imgClassName="max-h-full max-w-[70%]"
            />
          </div>
        </div>

          {/* Bottom Tier: Media Partners */}
          <div className="w-full max-w-5xl flex flex-col items-center mt-2">
            <SectionHeader title="Media Partners" colorClass="text-gray-400" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
              {comingSoonItems.map((item) => (
                <SponsorCard
                  key={item.id}
                  href={item.link || "#"}
                  imgSrc={item.img}
                  imgAlt="Media Partner"
                  className="w-full h-24 sm:h-28 p-4"
                  imgClassName="max-h-full max-w-[70%]"
                />
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 text-center"
          >
            <p className="text-white/50 font-mono text-xs mb-4">
              &lt; WANT TO SUPPORT US? /&gt;
            </p>
          <a
            href="/contact"
              className="group relative inline-flex items-center gap-2 px-8 py-3 bg-orange-500 text-black font-mono font-bold uppercase tracking-wider transition-all duration-300 hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]"
            style={{
                clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)"
              }}
            >
              {/* Stroke Effect using pseudo-element simulation or borders */}
              <div 
                className="absolute inset-px bg-black group-hover:bg-zinc-900 transition-colors duration-300 -z-10"
                style={{
                  clipPath: "polygon(11px 0, 100% 0, 100% calc(100% - 11px), calc(100% - 11px) 100%, 0 100%, 0 11px)"
                }}
              />
              <span className="relative z-10 text-orange-500 group-hover:text-orange-400 transition-colors">
                <DecryptedText text="Become a Sponsor" speed={20} sequential />
              </span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Sponsors;
