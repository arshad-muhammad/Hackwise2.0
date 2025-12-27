"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import DecryptedText from "../components/DecryptedText";

export default function ContactContent() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error', null

  const handleChange = (e) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formState,
          metadata: {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        }),
      });

      if (res.ok) {
        setStatus("success");
        setFormState({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setStatus(null), 5000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus(null), 5000);
      }
    } catch (error) {
      console.error("Submission error:", error);
      setStatus("error");
      setTimeout(() => setStatus(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative w-full min-h-screen pt-24 pb-20 px-6 md:px-12 lg:px-24 flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-16 relative z-10">
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          <span className="font-mono text-sm text-orange-500 uppercase tracking-widest">
            Help Desk
          </span>
        </div>
        <h1 className="font-hackwise text-5xl md:text-7xl text-white tracking-wide uppercase mb-4">
          GET IN <span className="text-orange-500">TOUCH</span>
        </h1>
        <p className="text-white/60 font-mono max-w-2xl mx-auto">
          Have questions about Hackwise 2.0? The Sphere Hive team is here to help.
          Reach out for inquiries about registration, sponsorship, or general information.
        </p>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 relative z-10">
        {/* Contact Information */}
        <div className="flex flex-col gap-12 order-2 lg:order-1">
          
          {/* Info Cards */}
          <div className="flex flex-col gap-6">
            <div className="group p-6 border border-white/10 bg-white/5 backdrop-blur-sm hover:border-orange-500/50 transition-colors duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-orange-500/10 text-orange-500 text-2xl border border-orange-500/20 group-hover:bg-orange-500 group-hover:text-black transition-all duration-300">
                  <i className="ri-mail-send-line" />
                </div>
                <div>
                  <h3 className="text-lg text-white font-mono font-bold mb-1 uppercase">Email Us</h3>
                  <p className="text-white/60 text-sm mb-2">For general inquiries and support</p>
                  <a href="mailto:spherehive@kvgce.ac.in" className="text-orange-500 font-mono hover:text-white transition-colors">
                    spherehive@kvgce.ac.in
                  </a>
                </div>
              </div>
            </div>

            <div className="group p-6 border border-white/10 bg-white/5 backdrop-blur-sm hover:border-orange-500/50 transition-colors duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-orange-500/10 text-orange-500 text-2xl border border-orange-500/20 group-hover:bg-orange-500 group-hover:text-black transition-all duration-300">
                  <i className="ri-map-pin-line" />
                </div>
                <div>
                  <h3 className="text-lg text-white font-mono font-bold mb-1 uppercase">Location</h3>
                  <p className="text-white/60 text-sm mb-2">Sphere Hive HQ</p>
                  <p className="text-white/80 font-mono text-sm leading-relaxed">
                    KVG College of Engineering,<br />
                    Kurunjibhag, Sullia,<br />
                    Dakshina Kannada, Karnataka - 574327
                  </p>
                </div>
              </div>
            </div>

            <div className="group p-6 border border-white/10 bg-white/5 backdrop-blur-sm hover:border-orange-500/50 transition-colors duration-300">
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 flex items-center justify-center bg-orange-500/10 text-orange-500 text-2xl border border-orange-500/20 group-hover:bg-orange-500 group-hover:text-black transition-all duration-300">
                  <i className="ri-share-line" />
                </div>
                <div>
                  <h3 className="text-lg text-white font-mono font-bold mb-3 uppercase">Connect With Us</h3>
                  <div className="flex gap-4">
                    {[
                      { icon: "ri-instagram-line", link: "https://www.instagram.com/spherehive" },
                      { icon: "ri-linkedin-fill", link: "https://www.linkedin.com/company/spherehive/" },
                      { icon: "ri-twitter-x-fill", link: "https://twitter.com" },
                      { icon: "ri-global-line", link: "https://spherehive.in/" },
                    ].map((social, i) => (
                      <a 
                        key={i} 
                        href={social.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-orange-500 hover:border-orange-500/50 transition-all duration-300"
                      >
                        <i className={social.icon} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="order-1 lg:order-2">
          <div className="relative p-8 border border-white/10 bg-black/40 backdrop-blur-md">
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-2 h-2 bg-orange-500"/>
            <div className="absolute top-0 right-0 w-2 h-2 bg-orange-500"/>
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-orange-500"/>
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-orange-500"/>

            <h3 className="font-mono text-xl text-white mb-6 uppercase border-b border-white/10 pb-4">
              <span className="text-orange-500 mr-2">&gt;</span>
              Send Message
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-xs font-mono text-white/60 uppercase tracking-wider">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formState.name}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white font-mono focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all placeholder:text-white/20"
                    placeholder="JOHN DOE"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-xs font-mono text-white/60 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formState.email}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white font-mono focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all placeholder:text-white/20"
                    placeholder="JOHN@EXAMPLE.COM"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="subject" className="text-xs font-mono text-white/60 uppercase tracking-wider">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formState.subject}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white font-mono focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all placeholder:text-white/20"
                  placeholder="INQUIRY ABOUT..."
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-xs font-mono text-white/60 uppercase tracking-wider">Message</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formState.message}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white font-mono focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all placeholder:text-white/20 resize-none"
                  placeholder="TYPE YOUR MESSAGE HERE..."
                />
              </div>

              <div 
                className="relative w-full group"
                style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
              >
                {/* Border Layer */}
                <div className="absolute inset-0 bg-orange-500/50 group-hover:bg-orange-500 transition-colors duration-300" />
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="relative flex items-center justify-center py-4 m-px w-[calc(100%-2px)] bg-[#0A090F] hover:bg-orange-500 text-orange-500 hover:text-black font-bold font-mono uppercase tracking-widest transition-all duration-300"
                  style={{ 
                    clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
                    width: "calc(100% - 2px)",
                    height: "calc(100% - 2px)",
                    margin: "1px"
                  }}
                >
                  {/* Tint Layer for normal state */}
                  <div className="absolute inset-0 bg-orange-500/10 group-hover:bg-transparent transition-colors duration-300" />
                  
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <i className="ri-loader-4-line animate-spin text-xl" />
                        <span>Transmitting...</span>
                      </>
                    ) : status === "success" ? (
                      <>
                        <i className="ri-check-line text-xl" />
                        <span>Message Sent</span>
                      </>
                    ) : (
                      <>
                        <DecryptedText text="Submit Transmission" speed={50} className="group-hover:text-black" />
                        <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </button>
              </div>

              {status === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-green-500/10 border border-green-500/30 text-green-500 text-xs font-mono text-center uppercase"
                >
                  Transmission Received Successfully. We will respond shortly.
                </motion.div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

