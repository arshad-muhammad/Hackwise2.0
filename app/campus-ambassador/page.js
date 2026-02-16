"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import DecryptedText from "../components/DecryptedText";

export default function CampusAmbassadorPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    college_abbreviation: "",
    branch: "",
    year: "",
    why_interested: "",
    previous_experience: "",
    instagram: "",
    linkedin: "",
    twitter: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confetti, setConfetti] = useState([]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.college ||
      !formData.why_interested ||
      !formData.password
    ) {
      setError("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    // Password validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsSubmitting(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }

    // Phone validation (basic)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ""))) {
      setError("Please enter a valid 10-digit phone number");
      setIsSubmitting(false);
      return;
    }

    try {
      const socialMediaLinks = {};
      if (formData.instagram) socialMediaLinks.instagram = formData.instagram;
      if (formData.linkedin) socialMediaLinks.linkedin = formData.linkedin;
      if (formData.twitter) socialMediaLinks.twitter = formData.twitter;

      const res = await fetch("/api/ca/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone.replace(/\D/g, ""),
          college: formData.college,
          college_abbreviation: formData.college_abbreviation.toUpperCase(),
          branch: formData.branch,
          year: formData.year,
          why_interested: formData.why_interested,
          previous_experience: formData.previous_experience || null,
          social_media_links: socialMediaLinks,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(
          `/campus-ambassador/success?email=${encodeURIComponent(formData.email)}`,
        );
      } else {
        setError(data.error || "Application failed. Please try again.");
      }
    } catch (err) {
      console.error("Application error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerConfetti = (e) => {
    e.preventDefault();
    const colors = ['#f97316', '#fb923c', '#fdba74', '#fbbf24', '#facc15', '#fde047', '#f59e0b', '#eab308', '#ffffff'];
    const particles = [];
    const particleCount = 60;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const velocity = 150 + Math.random() * 250;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity - 50; // Slight upward bias
      
      particles.push({
        id: Date.now() + i,
        vx: vx,
        vy: vy,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 10,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 30,
        gravity: 300 + Math.random() * 200,
      });
    }
    
    setConfetti(particles);
    
    // Clear confetti after animation
    setTimeout(() => {
      setConfetti([]);
    }, 2500);
  };

  const cardClipPath =
    "polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)";
  const btnClipPath =
    "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)";

  const benefits = [
    {
      icon: "ri-money-dollar-circle-fill",
      title: "Cash Prizes & Goodies",
      description: "Win exciting rewards based on your performance",
      color: "yellow",
    },
    {
      icon: "ri-team-fill",
      title: "Organising Team Selection",
      description: "Top performers join the Hackwise 2.0 team",
      color: "orange",
    },
    {
      icon: "ri-file-text-fill",
      title: "Letters of Recommendation",
      description: "Top performers receive LORs for their achievements",
      color: "purple",
    },
    {
      icon: "ri-building-fill",
      title: "Sphere Hive Club Leadership",
      description:
        "Open and lead Sphere Hive club at your college as President, backed by Sphere Hive",
      color: "green",
    },
    {
      icon: "ri-group-fill",
      title: "Networking Opportunities",
      description: "Connect with industry professionals",
      color: "blue",
    },
    {
      icon: "ri-award-fill",
      title: "Leadership Experience",
      description: "Build your portfolio and skills",
      color: "orange",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="section-container border-t border-white/10 pb-16 sm:pb-24 md:pb-32 pt-32 md:pt-40 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Header Section with Login Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full flex justify-center mb-8 md:mb-12 mt-8 md:mt-12 relative z-10 px-4"
      >
        <div className="inline-block border border-white/20 bg-[#0A090F] px-4 py-3 md:px-8 md:py-4 relative max-w-full">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-hackwise text-white uppercase tracking-wider text-center pr-16 md:pr-0">
            Campus Ambassador Program
          </h1>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto relative z-10 px-4 md:px-6">
        {/* Login Modal */}
        <AnimatePresence>
          {showLogin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
              onClick={() => setShowLogin(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#0A090F] border border-white/10 p-6 sm:p-8 rounded-3xl w-full max-w-md mx-4"
                style={{ clipPath: cardClipPath }}
              >
                <div className="flex justify-between items-center mb-6 ">
                  <h2 className="text-2xl font-hackwise text-white uppercase">
                    CA Login
                  </h2>
                  <button
                    onClick={() => setShowLogin(false)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <i className="ri-close-line text-2xl" />
                  </button>
                </div>
                <p className="text-white/60 font-sans mb-6">
                  Already have a CA code? Login to access your dashboard.
                </p>
                <motion.button
                  onClick={() => {
                    setShowLogin(false);
                    router.push("/campus-ambassador/login");
                  }}
                  className="relative w-full block group cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className="absolute inset-0 bg-orange-500/50 group-hover:bg-orange-500 transition-colors duration-300"
                    style={{ clipPath: btnClipPath }}
                  />
                  <div
                    className="relative bg-[#0A090F] m-px py-4 text-center transition-all duration-300"
                    style={{ clipPath: btnClipPath }}
                  >
                    <div className="absolute inset-0 bg-white/5 group-hover:bg-orange-500/10 transition-colors duration-300" />
                    <span className="relative text-white font-sans font-bold text-sm sm:text-base md:text-lg uppercase tracking-wide flex items-center justify-center gap-2">
                      Go to Login Page
                      <i className="ri-arrow-right-line text-lg sm:text-xl" />
                    </span>
                  </div>
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Information Section */}
        <AnimatePresence mode="wait">
          {!showForm ? (
            <motion.div
              key="info"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-8 sm:space-y-10 md:space-y-12"
            >
              {/* Hero Card */}
              <motion.div variants={itemVariants} className="relative group">
                <div className="absolute inset-0 bg-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div
                  className="relative p-px"
                  style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}
                >
                  <div
                    className="absolute inset-0 bg-white/20 group-hover:bg-orange-500/50 transition-colors duration-300"
                    style={{ clipPath: cardClipPath }}
                  />
                  <div
                    className="relative bg-[#0A090F] p-6 md:p-8 lg:p-12"
                    style={{ clipPath: cardClipPath }}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6"
                    >
                      <motion.div
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-orange-500 flex items-center justify-center text-black font-bold text-xl sm:text-2xl font-hackwise flex-shrink-0"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        CA
                      </motion.div>
                      <div>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-hackwise text-white uppercase">
                          Become a Campus Ambassador
                        </h2>
                        <p className="text-xs sm:text-sm text-white/60 font-sans">
                          Represent Hackwise 2.0 at your college
                        </p>
                      </div>
                    </motion.div>

                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-sm sm:text-base md:text-lg text-white/80 font-sans mb-6 md:mb-8 leading-relaxed"
                    >
                      Join our elite team of Campus Ambassadors and help spread
                      the word about Hackwise 2.0! Earn rewards, build your
                      network, and gain valuable leadership experience while
                      promoting one of the most exciting hackathons in the
                      country.
                    </motion.p>
                    <motion.button
                      onClick={() => {
                        setShowLogin(true);
                        setShowForm(false);
                      }}
                      className="top-[300px] right-70 z-[9999] px-2 py-1.5 md:px-4 md:py-2 bg-orange-500 text-black font-mono font-bold text-xs md:text-sm  transition-colors flex items-center gap-1 uppercase"
                      style={{ clipPath: btnClipPath }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <i className="ri-login-box-line text-sm md:text-base" />
                      <span className="hidden sm:inline">CA Login</span>
                      <span className="sm:hidden">Login</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* Benefits Grid */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
              >
                {benefits.map((benefit, index) => {
                  const colorClasses = {
                    yellow: {
                      bg: "bg-yellow-500/20",
                      text: "text-yellow-500",
                      hover: "bg-yellow-500/30",
                    },
                    orange: {
                      bg: "bg-orange-500/20",
                      text: "text-orange-500",
                      hover: "bg-orange-500/30",
                    },
                    blue: {
                      bg: "bg-blue-500/20",
                      text: "text-blue-500",
                      hover: "bg-blue-500/30",
                    },
                    green: {
                      bg: "bg-green-500/20",
                      text: "text-green-500",
                      hover: "bg-green-500/30",
                    },
                    purple: {
                      bg: "bg-purple-500/20",
                      text: "text-purple-500",
                      hover: "bg-purple-500/30",
                    },
                  };
                  const colors =
                    colorClasses[benefit.color] || colorClasses.orange;
                  return (
                    <motion.div
                      key={index}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="relative group"
                    >
                      <div
                        className={`absolute inset-0 ${colors.bg} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                      />
                      <div
                        className="relative p-px"
                        style={{
                          filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))",
                        }}
                      >
                        <div
                          className="absolute inset-0 bg-white/20 group-hover:bg-orange-500/50 transition-colors duration-300"
                          style={{ clipPath: cardClipPath }}
                        />
                        <div
                          className="relative bg-[#0A090F] p-4 sm:p-6"
                          style={{ clipPath: cardClipPath }}
                        >
                          <motion.div
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${colors.bg} flex items-center justify-center mb-3 sm:mb-4`}
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <i
                              className={`${benefit.icon} ${colors.text} text-xl sm:text-2xl`}
                            />
                          </motion.div>
                          <h3 className="text-lg sm:text-xl font-hackwise text-white uppercase mb-2">
                            {benefit.title}
                          </h3>
                          <p className="text-white/70 font-sans text-xs sm:text-sm leading-relaxed">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Role & Performance Section */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6"
              >
                {/* Your Role */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div
                    className="relative p-px"
                    style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}
                  >
                    <div
                      className="absolute inset-0 bg-white/20 group-hover:bg-blue-500/50 transition-colors duration-300"
                      style={{ clipPath: cardClipPath }}
                    />
                    <div
                      className="relative bg-[#0A090F] p-4 sm:p-6"
                      style={{ clipPath: cardClipPath }}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 mb-4">
                        <i className="ri-focus-3-line text-blue-500 text-xl sm:text-2xl flex-shrink-0" />
                        <h3 className="text-lg sm:text-xl font-hackwise text-white uppercase">
                          Your Role
                        </h3>
                      </div>
                      <ul className="space-y-2 sm:space-y-3 text-white/70 font-sans text-xs sm:text-sm">
                        {[
                          "Promote Hackwise 2.0 through social media and campus events",
                          "Share your unique referral link to track registrations",
                          "Complete assigned tasks and challenges",
                          "Engage with participants and answer questions",
                        ].map((item, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                            className="flex gap-2 items-start"
                          >
                            <i className="ri-checkbox-circle-fill text-orange-500 mt-0.5 shrink-0 text-base" />
                            <span>{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>

                {/* Performance Scoring */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-green-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div
                    className="relative p-px"
                    style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}
                  >
                    <div
                      className="absolute inset-0 bg-white/20 group-hover:bg-green-500/50 transition-colors duration-300"
                      style={{ clipPath: cardClipPath }}
                    />
                    <div
                      className="relative bg-[#0A090F] p-4 sm:p-6"
                      style={{ clipPath: cardClipPath }}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 mb-4">
                        <i className="ri-line-chart-fill text-green-500 text-xl sm:text-2xl flex-shrink-0" />
                        <h3 className="text-lg sm:text-xl font-hackwise text-white uppercase">
                          Performance Scoring
                        </h3>
                      </div>
                      <ul className="space-y-2 sm:space-y-3 text-white/70 font-sans text-xs sm:text-sm">
                        {[
                          "Verified registrations through your referral link",
                          "Completed and approved tasks",
                          "Early task submissions (bonus points)",
                          "Leaderboard ranking and rewards",
                        ].map((item, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className="flex gap-2 items-start"
                          >
                            <i className="ri-flashlight-fill text-orange-500 mt-0.5 shrink-0 text-base" />
                            <span>{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Reg Closed Button */}
              <motion.div
                variants={itemVariants}
                className="flex justify-center relative"
              >
                {/* Confetti Particles */}
                <AnimatePresence>
                  {confetti.map((particle) => (
                    <motion.div
                      key={particle.id}
                      className="absolute pointer-events-none z-50"
                      style={{
                        left: '50%',
                        top: '50%',
                        width: particle.size,
                        height: particle.size,
                        backgroundColor: particle.color,
                        borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                        boxShadow: `0 0 ${particle.size}px ${particle.color}`,
                      }}
                      initial={{
                        x: 0,
                        y: 0,
                        opacity: 1,
                        scale: 0,
                        rotate: particle.rotation,
                      }}
                      animate={{
                        x: particle.vx,
                        y: [particle.vy, particle.vy + particle.gravity],
                        opacity: [1, 1, 1, 0],
                        scale: [0, 1.2, 1, 0.8],
                        rotate: particle.rotation + particle.rotationSpeed * 15,
                      }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{
                        duration: 2.5,
                        ease: [0.25, 0.46, 0.45, 0.94],
                        times: [0, 0.2, 0.8, 1],
                      }}
                    />
                  ))}
                </AnimatePresence>

                <motion.div
                  className="relative w-full max-w-md block group cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6,
                    ease: "easeOut"
                  }}
                  onClick={triggerConfetti}
                >
                  {/* Glowing Orange Outline Effect */}
                  <motion.div
                    className="absolute inset-0"
                    style={{ clipPath: btnClipPath }}
                    animate={{
                      boxShadow: [
                        "0 0 20px rgba(249, 115, 22, 0.4)",
                        "0 0 30px rgba(249, 115, 22, 0.6)",
                        "0 0 20px rgba(249, 115, 22, 0.4)",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 opacity-80" />
                  </motion.div>

                  <motion.div
                    className="relative"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      delay: 0.2
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Orange Glowing Border */}
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500"
                      style={{ clipPath: btnClipPath }}
                    />
                    
                    {/* Dark Grey Background */}
                    <div
                      className="relative bg-gray-800 m-[2px] py-5 px-6 text-center overflow-visible"
                      style={{ clipPath: btnClipPath }}
                    >
                      {/* Subtle Shimmer */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                        animate={{
                          x: ["-100%", "200%"],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          repeatDelay: 2,
                          ease: "easeInOut",
                        }}
                      />
                      
                      <motion.span 
                        className="relative text-white font-sans font-bold text-base sm:text-lg md:text-xl uppercase tracking-wider flex items-center justify-center gap-3 z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                      >
                        <motion.i 
                          className="ri-checkbox-circle-fill text-orange-400 text-2xl sm:text-3xl"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ 
                            type: "spring",
                            stiffness: 400,
                            damping: 15,
                            delay: 0.4
                          }}
                        />
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5, duration: 0.4 }}
                        >
                          Registration Closed
                        </motion.span>
                        <motion.i 
                          className="ri-checkbox-circle-fill text-orange-400 text-2xl sm:text-3xl"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ 
                            type: "spring",
                            stiffness: 400,
                            damping: 15,
                            delay: 0.4
                          }}
                        />
                      </motion.span>
                    
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            /* Application Form */
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div
                className="relative p-px"
                style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}
              >
                <div
                  className="absolute inset-0 bg-white/20 group-hover:bg-orange-500/50 transition-colors duration-300"
                  style={{ clipPath: cardClipPath }}
                />
                <div
                  className="relative bg-[#0A090F] p-4 sm:p-6 md:p-8 lg:p-12"
                  style={{ clipPath: cardClipPath }}
                >
                  <div className="flex items-center justify-between mb-6 md:mb-8">
                    <h2 className="text-xl sm:text-2xl font-hackwise text-white uppercase">
                      Application Form
                    </h2>
                    <motion.button
                      onClick={() => setShowForm(false)}
                      className="text-white/60 hover:text-white transition-colors flex-shrink-0"
                      whileHover={{ rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <i className="ri-close-line text-xl sm:text-2xl" />
                    </motion.button>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4 sm:space-y-6"
                  >
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-3 sm:p-4 bg-red-500/10 border-l-4 border-red-500 text-red-500 text-xs sm:text-sm font-mono"
                        >
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      {[
                        {
                          name: "name",
                          label: "Full Name",
                          type: "text",
                          required: true,
                          placeholder: "Enter your full name",
                        },
                        {
                          name: "email",
                          label: "Email",
                          type: "email",
                          required: true,
                          placeholder: "your.email@example.com",
                        },
                        {
                          name: "phone",
                          label: "Phone Number",
                          type: "tel",
                          required: true,
                          placeholder: "10-digit phone number",
                        },
                        {
                          name: "year",
                          label: "Year of Study",
                          type: "select",
                          options: [
                            "",
                            "1st Year",
                            "2nd Year",
                            "3rd Year",
                            "4th Year",
                            "Post Graduate",
                          ],
                        },
                        {
                          name: "college",
                          label: "College Name",
                          type: "text",
                          required: true,
                          placeholder: "Full college name",
                        },
                        {
                          name: "college_abbreviation",
                          label: "College Abbreviation",
                          type: "text",
                          placeholder: "KVGCE",
                          maxLength: 20,
                        },
                        {
                          name: "branch",
                          label: "Branch",
                          type: "text",
                          placeholder: "Computer Science, ECE, etc.",
                        },
                      ].map((field, index) => (
                        <motion.div
                          key={field.name}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <label className="block text-xs sm:text-sm font-mono text-orange-500/80 mb-2 uppercase tracking-wide">
                            {field.label}{" "}
                            {field.required && (
                              <span className="text-red-500">*</span>
                            )}
                          </label>
                          {field.type === "select" ? (
                            <select
                              name={field.name}
                              value={formData[field.name]}
                              onChange={handleChange}
                              className="w-full bg-white/5 border border-white/10 px-3 sm:px-4 py-2 sm:py-3 text-white font-sans text-sm sm:text-base focus:outline-none focus:border-orange-500/50 transition-colors"
                            >
                              {field.options.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt || "Select year"}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={field.type}
                              name={field.name}
                              value={formData[field.name]}
                              onChange={handleChange}
                              required={field.required}
                              maxLength={field.maxLength}
                              className="w-full bg-white/5 border border-white/10 px-3 sm:px-4 py-2 sm:py-3 text-white font-sans text-sm sm:text-base focus:outline-none focus:border-orange-500/50 transition-colors"
                              placeholder={field.placeholder}
                              style={
                                field.name === "college_abbreviation"
                                  ? { textTransform: "uppercase" }
                                  : {}
                              }
                            />
                          )}
                          {field.name === "college_abbreviation" && (
                            <p className="text-xs text-white/50 mt-1">
                              Used for CA code generation (e.g., KVGCE001)
                            </p>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label className="block text-xs sm:text-sm font-mono text-orange-500/80 mb-2 uppercase tracking-wide">
                        Why are you interested in becoming a Campus Ambassador?{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="why_interested"
                        value={formData.why_interested}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 px-3 sm:px-4 py-2 sm:py-3 text-white font-sans text-sm sm:text-base focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
                        placeholder="Tell us why you want to be a CA..."
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <label className="block text-xs sm:text-sm font-mono text-orange-500/80 mb-2 uppercase tracking-wide">
                        Previous Experience (Optional)
                      </label>
                      <textarea
                        name="previous_experience"
                        value={formData.previous_experience}
                        onChange={handleChange}
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 px-3 sm:px-4 py-2 sm:py-3 text-white font-sans text-sm sm:text-base focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
                        placeholder="Any previous ambassador/marketing experience..."
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <label className="block text-xs sm:text-sm font-mono text-orange-500/80 mb-2 uppercase tracking-wide">
                        Social Media Links (Optional)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                        {["instagram", "linkedin", "twitter"].map((social) => (
                          <input
                            key={social}
                            type="url"
                            name={social}
                            value={formData[social]}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 px-3 sm:px-4 py-2 sm:py-3 text-white font-sans focus:outline-none focus:border-orange-500/50 transition-colors text-xs sm:text-sm"
                            placeholder={`${social.charAt(0).toUpperCase() + social.slice(1)} URL`}
                          />
                        ))}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="pt-4 border-t border-white/10"
                    >
                      <p className="text-xs sm:text-sm text-white/60 font-sans mb-3 sm:mb-4">
                        Create a password for your CA dashboard access. You'll
                        use your CA code and this password to login.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {[
                          {
                            name: "password",
                            label: "Password",
                            placeholder: "Minimum 6 characters",
                          },
                          {
                            name: "confirmPassword",
                            label: "Confirm Password",
                            placeholder: "Re-enter password",
                          },
                        ].map((field) => (
                          <div key={field.name}>
                            <label className="block text-xs sm:text-sm font-mono text-orange-500/80 mb-2 uppercase tracking-wide">
                              {field.label}{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="password"
                              name={field.name}
                              value={formData[field.name]}
                              onChange={handleChange}
                              required
                              minLength={6}
                              className="w-full bg-white/5 border border-white/10 px-3 sm:px-4 py-2 sm:py-3 text-white font-sans text-sm sm:text-base focus:outline-none focus:border-orange-500/50 transition-colors"
                              placeholder={field.placeholder}
                            />
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="pt-4"
                    >
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        className="relative w-full block group cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div
                          className="absolute inset-0 bg-orange-500/50 group-hover:bg-orange-500 transition-colors duration-300"
                          style={{ clipPath: btnClipPath }}
                        />
                        <div
                          className="relative bg-[#0A090F] m-px py-4 text-center transition-all duration-300"
                          style={{ clipPath: btnClipPath }}
                        >
                          <div className="absolute inset-0 bg-white/5 group-hover:bg-orange-500/10 transition-colors duration-300" />
                          <span className="relative text-white font-sans font-bold text-sm sm:text-base md:text-lg uppercase tracking-wide">
                            {isSubmitting
                              ? "Submitting..."
                              : "Submit Application"}
                          </span>
                        </div>
                      </motion.button>
                    </motion.div>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
