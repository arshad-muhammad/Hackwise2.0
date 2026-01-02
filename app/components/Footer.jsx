import React from "react";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="relative w-full bg-[#050408] pt-20 pb-10 overflow-hidden border-t border-white/5">
      {/* Background Grid */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), 
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Top Glowing Border */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-[1px] bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 relative">
                <Image
                  src="/assets/Hackloho.png"
                  alt="Logo"
                  fill
                  className="object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                />
              </div>
              <span className="font-hackwise text-2xl text-white tracking-wide">
                HACKWISE <span className="text-orange-500">2.0</span>
              </span>
            </div>
            <p className="text-white/60 text-sm font-sans leading-relaxed max-w-md border-l-2 border-orange-500/30 pl-4">
              Empowering the next generation of developers to build the future
              of SaaS.
              <br />
              <span className="text-orange-500/80 font-mono text-xs mt-2 block">
                // SYSTEM.INITIATE_INNOVATION
              </span>
            </p>

            {/* Newsletter-ish Style Input */}
            <div className="mt-4 w-full max-w-sm relative">
              <input
                type="email"
                placeholder="ENTER_EMAIL_ADDRESS..."
                className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                suppressHydrationWarning
              />
              <button
                suppressHydrationWarning
                className="absolute right-1 top-1 bottom-1 px-3 bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-black transition-colors text-xs font-mono border border-orange-500/20"
              >
                SUBMIT
              </button>
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            {/* Quick Links */}
            <div className="flex flex-col gap-6">
              <h4 className="font-mono text-orange-500 text-xs tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                Navigation
              </h4>
              <ul className="space-y-3 font-mono text-sm text-white/60">
                {[
                  { name: "About", href: "#about" },
                  { name: "Timeline", href: "#timeline" },
                  { name: "Prizes", href: "#prizes" },
                  { name: "Sponsors", href: "#sponsors" },
                ].map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      className="hover:text-orange-500 transition-colors flex items-center gap-2 group"
                    >
                      <span className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-orange-500">
                        &gt;
                      </span>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="flex flex-col gap-6">
              <h4 className="font-mono text-orange-500 text-xs tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-white/20 rounded-full" />
                Legal
              </h4>
              <ul className="space-y-3 font-mono text-sm text-white/60">
                <li>
                  <a
                    href="/code-of-conduct"
                    className="hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-orange-500">
                      &gt;
                    </span>
                    Code of Conduct
                  </a>
                </li>
                <li>
                  <a
                    href="/terms-of-service"
                    className="hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-orange-500">
                      &gt;
                    </span>
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy-policy"
                    className="hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-orange-500">
                      &gt;
                    </span>
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Socials & Contact */}
            <div className="flex flex-col gap-6">
              <h4 className="font-mono text-orange-500 text-xs tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-white/20 rounded-full" />
                Network
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    icon: "ri-instagram-line",
                    link: "https://www.instagram.com/spherehive",
                  },
                  {
                    icon: "ri-linkedin-fill",
                    link: "https://www.linkedin.com/company/spherehive/",
                  },
                  {
                    icon: "ri-youtube-fill",
                    link: "https://www.youtube.com/@spherehive",
                  },
                  {
                    icon: "ri-whatsapp-line",
                    link: "https://chat.whatsapp.com/JvCxszNiFPb1Qq7H8zrftl",
                  },
                ].map((social, i) => (
                  <a
                    key={i}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/5 hover:text-orange-500 hover:border-orange-500/50 transition-all duration-300"
                  >
                    <i className={social.icon} />
                  </a>
                ))}
              </div>
              <div className="mt-1 text-xs font-mono text-white/40">
                <div className="flex items-center gap-2">
                  <i className="ri-mail-send-line text-orange-500" />
                  spherehive@kvgce.ac.in
                </div>
                <div className="flex items-center gap-2">
                  <i className="ri-map-pin-line text-orange-500" />
                  <p className="mt-6">
                    Sphere Hive HQ, KVGCE, Kurunjibhag, Sullia, Dakshina
                    Kannada, Karnataka - 574327
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-white/40 font-mono flex items-center gap-4">
            <span>&copy; {new Date().getFullYear()} HACKWISE 2.0</span>
            <span className="hidden md:inline text-white/10">|</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]" />
              SYSTEM ONLINE
            </span>
          </div>

          <div className="text-xs text-white/40 font-mono uppercase tracking-wider">
            Designed by{" "}
            <span className="text-white hover:text-orange-500 cursor-pointer transition-colors">
              Sphere Hive
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
