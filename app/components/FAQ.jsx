"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, X } from "lucide-react";
import { createPortal } from "react-dom";

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-white/10 last:border-none">
      <button
        onClick={onClick}
        className="w-full py-5 flex items-center justify-between text-left group"
      >
        <span
          className={`font-mono text-base md:text-lg transition-colors duration-300 ${
            isOpen ? "text-orange-500" : "text-white group-hover:text-orange-400"
          }`}
        >
          {question}
        </span>
        <div
          className={`relative flex items-center justify-center w-6 h-6 rounded-full border transition-all duration-300 ${
            isOpen
              ? "border-orange-500 bg-orange-500/10 rotate-180"
              : "border-white/20 group-hover:border-orange-500/50"
          }`}
        >
          {isOpen ? (
            <Minus className="w-3 h-3 text-orange-500" />
          ) : (
            <Plus className="w-3 h-3 text-white group-hover:text-orange-400" />
          )}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-white/70 font-sans leading-relaxed text-sm pr-6">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQModal = ({ isOpen, onClose, faqs }) => {
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
              className="bg-[#0A090F] border border-white/20 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-lg shadow-2xl relative"
            >
              {/* Decorative Header */}
              <div className="sticky top-0 left-0 w-full bg-[#0A090F]/95 backdrop-blur-md border-b border-white/10 p-6 z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-orange-500 rounded-full" />
                  <h2 className="text-xl md:text-2xl font-hackwise text-white uppercase tracking-wider">
                    Frequently Asked Questions
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors group"
                >
                  <X className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8">
                <div className="space-y-2">
                  {faqs.map((faq, index) => (
                    <FAQItem
                      key={index}
                      question={faq.question}
                      answer={faq.answer}
                      isOpen={openIndex === index}
                      onClick={() => handleToggle(index)}
                    />
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <p className="text-white/40 text-sm font-mono">
                        Still have questions? <a href="/contact" className="text-orange-500 hover:underline">Contact Us</a>
                    </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

const FAQ = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    // Fetch FAQs from API
    fetch('/api/faq')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setFaqs(data);
        } else {
            // Fallback content if DB is empty
            setFaqs([
                {
                  question: "Who can participate?",
                  answer: "Hackwise 2.0 is open to all students and innovators from any college or university. Whether you're a beginner or an expert, if you have a passion for building, you're welcome!",
                },
                // ... keep other fallbacks if desired, or just show empty
            ]);
        }
      })
      .catch(err => console.error("Failed to load FAQs", err));
  }, []);

  // Only show section if we have FAQs (or fallback)
  if (faqs.length === 0) return null;

  return (
    <>
      <section
        id="faq"
        className="w-full py-16 flex flex-col items-center justify-center border-t border-white/10 relative overflow-hidden"
      >
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A090F] to-orange-950/20 opacity-50 pointer-events-none" />

        <div className="relative z-10 text-center space-y-6">
          <div className="inline-block border border-white/20 bg-[#0A090F] px-8 py-3 transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-2xl md:text-3xl font-hackwise text-white uppercase tracking-wider">
              FAQ
            </h2>
          </div>
          
          <p className="text-white/60 font-mono text-sm max-w-md mx-auto px-4">
            Curious about the event? Check out our frequently asked questions.
          </p>

          <button
            onClick={() => setIsModalOpen(true)}
            className="group relative inline-flex items-center justify-center p-px bg-white/20 hover:bg-orange-500/50 transition-colors duration-300 overflow-hidden"
            style={{
              clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)"
            }}
          >
             <div 
               className="relative px-8 py-3 bg-[#0A090F] group-hover:bg-[#0A090F]/90 transition-colors w-full h-full"
               style={{
                clipPath: "polygon(11px 0, 100% 0, 100% calc(100% - 11px), calc(100% - 11px) 100%, 0 100%, 0 11px)"
               }}
             >
                <span className="relative z-10 font-mono text-orange-500 uppercase tracking-widest text-sm group-hover:text-white transition-colors">
                  View Questions
                </span>
             </div>
          </button>
        </div>
      </section>

      {/* Modal Portal */}
      <FAQModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        faqs={faqs}
      />
    </>
  );
};

export default FAQ;
