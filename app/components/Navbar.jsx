"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DecryptedText from "./DecryptedText";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  // Smooth scroll function
  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  const navLinks = [
    { name: "About", id: "about" },
    { name: "Flow", id: "flow" },
    { name: "Prizes", id: "prizes" },
    { name: "Sponsors", id: "sponsors" },
    { name: "FAQ", id: "faq" },
  ];

  return (
    <div className="absolute top-0 left-0 w-full z-50 flex justify-center pt-4 px-4">
      <div className="relative w-full max-w-100vw">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-orange-500/10 blur-xl rounded-lg -z-10" />

        {/* Navbar Container */}
        <div className="relative w-full h-[70px] filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
          {/* Border Shape */}
          <div
            className="absolute inset-0 bg-white/20"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0 calc(100% - 20px))",
            }}
          />

          {/* Inner Background */}
          <div
            className="absolute inset-px bg-[#0A090F]/90 backdrop-blur-md flex items-center justify-between px-6 md:px-12"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0 calc(100% - 20px))",
            }}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 cursor-pointer">
              <div className="w-8 h-8 md:w-10 md:h-10 relative">
                <Image
                  src="/assets/Hackloho.png"
                  alt="SphereHive Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-hackwise text-lg md:text-xl text-white tracking-wide">
                HACKWISE 2.0
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={isHomePage ? `#${link.id}` : `/#${link.id}`}
                  className="font-mono text-sm text-white/70 hover:text-orange-500 transition-colors uppercase tracking-wider group"
                >
                  <DecryptedText text={link.name} speed={30} className="group-hover:text-orange-500 transition-colors" />
                </a>
              ))}
              {/* New Accommodation Link */}
              <Link
                href="/accommodation"
                className="font-mono text-sm text-white/70 hover:text-orange-500 transition-colors uppercase tracking-wider group"
              >
                 <DecryptedText text="Accommodation" speed={30} className="group-hover:text-orange-500 transition-colors" />
              </Link>
              <Link
                href="/contact"
                className="font-mono text-sm text-white/70 hover:text-orange-500 transition-colors uppercase tracking-wider group"
              >
                 <DecryptedText text="Contact" speed={30} className="group-hover:text-orange-500 transition-colors" />
              </Link>
            </div>

            {/* Action Button & Mobile Menu Toggle */}
            <div className="flex items-center gap-4">
              <a
                href="https://unstop.com/o/XIlFdnH?lb=yGGr6gxO&utm_medium=Share&utm_source=muhamr70994&utm_campaign=Online_coding_challenge"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:block group relative p-px bg-orange-500/50 font-mono text-sm text-orange-500 transition-all duration-300"
                style={{
                  clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)"
                }}
              >
                <div
                  className="w-full h-full bg-[#0A090F] px-6 py-2 flex items-center justify-center"
                  style={{
                    clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)"
                  }}
                >
                  <DecryptedText text="Register" sequential speed={30} className="group-hover:text-orange-400 transition-colors" />
                </div>
              </a>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden text-white text-2xl"
                onClick={() => setIsOpen(!isOpen)}
              >
                <i className={isOpen ? "ri-close-line" : "ri-menu-line"} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="absolute top-[80px] left-0 w-full bg-[#0A090F]/95 backdrop-blur-xl border border-white/10 p-6 flex flex-col gap-4 md:hidden clip-path-polygon">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={isHomePage ? `#${link.id}` : `/#${link.id}`}
                onClick={() => setIsOpen(false)}
                className="font-mono text-lg text-white/80 hover:text-orange-500 transition-colors uppercase group"
              >
                <DecryptedText text={link.name} speed={30} className="group-hover:text-orange-500 transition-colors" />
              </a>
            ))}
            <Link
                href="/accommodation"
                onClick={() => setIsOpen(false)}
                className="font-mono text-lg text-white/80 hover:text-orange-500 transition-colors uppercase group"
            >
                <DecryptedText text="Accommodation" speed={30} className="group-hover:text-orange-500 transition-colors" />
            </Link>
            <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                className="font-mono text-lg text-white/80 hover:text-orange-500 transition-colors uppercase group"
            >
                <DecryptedText text="Contact" speed={30} className="group-hover:text-orange-500 transition-colors" />
            </Link>
            <a 
              href="https://unstop.com/o/XIlFdnH?lb=yGGr6gxO&utm_medium=Share&utm_source=muhamr70994&utm_campaign=Online_coding_challenge"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 mt-2 border border-orange-500 bg-orange-500 text-black font-bold font-mono uppercase text-center block"
            >
              Register Now
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;

