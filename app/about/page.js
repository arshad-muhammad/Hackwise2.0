'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import DecryptedText from '../components/DecryptedText';
import { Linkedin, Github, Twitter, ExternalLink, Mail, MapPin, GraduationCap, Building2, Award, BookOpen, Users, Zap, Lightbulb, Code2, Target, Rocket, Cpu } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const CARD_CLIP = 'polygon(14px 0%, 100% 0%, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0% 100%, 0% 14px)';

export default function AboutPage() {
  const router = useRouter();
  const [committees, setCommittees] = useState([]);
  const [unassignedMembers, setUnassignedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const headerRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const descriptionCardRef = useRef(null);
  const descriptionTitleRef = useRef(null);
  const descriptionTextRef = useRef(null);
  const descriptionDotRef = useRef(null);
  const sphereStatsRef = useRef(null);
  const collegeSectionRef = useRef(null);
  const collegeCardRef = useRef(null);
  const collegeStatsRef = useRef(null);
  const committeesRef = useRef([]);
  const memberCardsRef = useRef([]);

  useEffect(() => {
    fetchCommittees();
  }, []);

  const fetchCommittees = async () => {
    try {
      const res = await fetch('/api/committees');
      const data = await res.json();
      setCommittees(data.committees || []);
      setUnassignedMembers(data.unassignedMembers || []);
    } catch (error) {
      console.error('Error fetching committees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      // Header animation
      gsap.from(headerRef.current, {
        opacity: 0,
        y: -50,
        duration: 1,
        ease: 'power3.out',
      });

      // Title animation
      gsap.from(titleRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 1.2,
        delay: 0.3,
        ease: 'back.out(1.7)',
      });

      // Description section animations
      if (descriptionRef.current) {
        // Container animation
        gsap.from(descriptionRef.current, {
          opacity: 0,
          y: 50,
          duration: 1.2,
          delay: 0.6,
          ease: 'power3.out',
        });

        // Card animation with scale and blur
        if (descriptionCardRef.current) {
          gsap.from(descriptionCardRef.current, {
            opacity: 0,
            scale: 0.95,
            y: 40,
            duration: 1,
            delay: 0.8,
            ease: 'power3.out',
          });

          // Animated border glow on hover
          descriptionCardRef.current.addEventListener('mouseenter', () => {
            gsap.to(descriptionCardRef.current, {
              scale: 1.02,
              duration: 0.5,
              ease: 'power2.out',
            });
          });

          descriptionCardRef.current.addEventListener('mouseleave', () => {
            gsap.to(descriptionCardRef.current, {
              scale: 1,
              duration: 0.5,
              ease: 'power2.out',
            });
          });
        }

        // Dot animation
        if (descriptionDotRef.current) {
          gsap.from(descriptionDotRef.current, {
            scale: 0,
            opacity: 0,
            duration: 0.8,
            delay: 1,
            ease: 'back.out(2)',
          });
          // Pulsing animation
          gsap.to(descriptionDotRef.current, {
            scale: 1.2,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut',
            delay: 1.5,
          });
        }

        // Title animation
        if (descriptionTitleRef.current) {
          gsap.from(descriptionTitleRef.current.children, {
            opacity: 0,
            x: -30,
            duration: 0.8,
            stagger: 0.1,
            delay: 1.1,
            ease: 'power3.out',
          });
        }

        // Text paragraphs animation
        if (descriptionTextRef.current) {
          gsap.from(descriptionTextRef.current.children, {
            opacity: 0,
            y: 20,
            duration: 0.8,
            stagger: 0.15,
            delay: 1.3,
            ease: 'power2.out',
          });
        }

        if (sphereStatsRef.current) {
          const items = sphereStatsRef.current.querySelectorAll('.sphere-stat');
          items.forEach((item, index) => {
            gsap.from(item, {
              opacity: 0,
              y: 30,
              scale: 0.9,
              duration: 0.6,
              delay: 1.5 + index * 0.12,
              ease: 'back.out(1.4)',
            });
          });
        }
      }

      // College section animations
      if (collegeSectionRef.current) {
        gsap.from(collegeSectionRef.current, {
          opacity: 0,
          y: 60,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: collegeSectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        });
      }

      if (collegeCardRef.current) {
        gsap.from(collegeCardRef.current, {
          opacity: 0,
          scale: 0.95,
          y: 40,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: collegeCardRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        });
      }

      if (collegeStatsRef.current) {
        const statItems = collegeStatsRef.current.querySelectorAll('.college-stat');
        statItems.forEach((item, index) => {
          gsap.from(item, {
            opacity: 0,
            y: 30,
            scale: 0.9,
            duration: 0.6,
            delay: index * 0.1,
            ease: 'back.out(1.4)',
            scrollTrigger: {
              trigger: collegeStatsRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          });
        });
      }

      // Animate committees sections
      committeesRef.current.forEach((committeeSection) => {
        if (!committeeSection) return;

        const header = committeeSection.querySelector('.committee-header');
        if (header) {
          gsap.from(header, {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: header,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          });
        }

        const cards = committeeSection.querySelectorAll('.member-card');
        cards.forEach((card, index) => {
          gsap.set(card, { opacity: 0, y: 50, scale: 0.95 });
          gsap.to(card, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: 'power3.out',
            delay: index * 0.1,
            scrollTrigger: {
              trigger: committeeSection,
              start: 'top 75%',
              toggleActions: 'play none none none',
            },
          });
        });
      });
    });

    return () => ctx.revert();
  }, [loading, committees]);

  const handleMemberClick = (id) => {
    router.push(`/member/${id}`);
  };

  // Helper function to get valid image URL (reject base64)
  const getValidImageUrl = (url) => {
    if (!url || url.startsWith('data:')) {
      return '/assets/logo.png';
    }
    return url;
  };

  return (
    <section className="section-container border-t border-white/10 pb-12 sm:pb-16 md:pb-24 pt-20 sm:pt-24 md:pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div ref={headerRef} className="w-full flex justify-center mb-10 sm:mb-12 md:mb-16">
          <div className="inline-block border border-white/20 bg-[#0A090F]/90 px-4 sm:px-6 md:px-8 py-3 md:py-4 backdrop-blur-md">
            <h1
              ref={titleRef}
              className="text-2xl sm:text-3xl md:text-5xl font-hackwise text-white uppercase tracking-wider text-center"
            >
              About <span className="text-orange-500">Sphere Hive</span>
            </h1>
          </div>
        </div>

        {/* Sphere Hive Description Section */}
        <div
          ref={descriptionRef}
          className="max-w-6xl mx-auto mb-14 md:mb-24"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8 md:mb-10">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6">
              <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
              <h2 className="text-lg sm:text-2xl md:text-3xl font-hackwise text-white uppercase tracking-wider text-center">
                Who We <span className="text-orange-500">Are</span>
              </h2>
              <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
          </div>

          <div
            ref={descriptionCardRef}
            className="relative group"
            style={{ clipPath: CARD_CLIP }}
          >
            <div className="absolute inset-0 bg-orange-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative p-px" style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))' }}>
              <div
                className="absolute inset-0 bg-white/15 group-hover:bg-orange-500/40 transition-colors duration-500"
                style={{ clipPath: CARD_CLIP }}
              />
              <div
                className="relative bg-[#0A090F]/95 backdrop-blur-md overflow-hidden"
                style={{ clipPath: CARD_CLIP }}
              >
                <div className="absolute top-0 left-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/3 -translate-x-1/3" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl translate-y-1/3 translate-x-1/3" />
                <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-orange-400/3 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />

                <div className="relative z-10 p-5 sm:p-8 md:p-12 lg:p-16">
                  <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
                    <div className="flex-1 space-y-4 sm:space-y-6">
                      <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                        <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
                        <span className="text-orange-500 font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em]">Tech Community</span>
                      </div>

                      <h3
                        ref={descriptionTitleRef}
                        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-hackwise text-white uppercase leading-tight"
                      >
                        <span>The Foundry of</span>
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500">
                          Future Tech Leaders
                        </span>
                      </h3>

                      <div className="flex items-center gap-2 text-white/50">
                        <div
                          ref={descriptionDotRef}
                          className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.6)] flex-shrink-0"
                        />
                        <span className="font-mono text-xs sm:text-sm">Innovation Driven &middot; Community Powered</span>
                      </div>

                      <div ref={descriptionTextRef} className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
                        <p className="text-sm sm:text-base md:text-lg leading-relaxed text-white/85 font-sans">
                          Sphere Hive is the crucible of innovation. We don&apos;t just teach technology — we forge the leaders who will define it. By fusing bleeding-edge tech with radical creativity, we empower you to solve the unsolvable.
                        </p>
                        <p className="text-sm sm:text-base md:text-lg leading-relaxed text-white/65 font-sans">
                          Our organizing committee is a diverse group of passionate individuals dedicated to creating transformative experiences and pushing the boundaries of what&apos;s possible in technology and innovation.
                        </p>
                        <p className="text-sm sm:text-base md:text-lg leading-relaxed text-white/65 font-sans">
                          From hackathons to workshops, from ideation sprints to real-world problem solving — Sphere Hive is where curiosity meets execution, and ideas become impact.
                        </p>
                      </div>
                    </div>

                    <div className="lg:w-80 w-full max-w-[280px] mx-auto lg:max-w-none lg:mx-0 flex-shrink-0">
                      <div
                        className="relative overflow-hidden border border-white/10 group/img"
                        style={{ clipPath: CARD_CLIP }}
                      >
                        <img
                          src="/assets/logo.png"
                          alt="Sphere Hive"
                          className="w-full aspect-square object-contain bg-white/5 p-6 sm:p-8 transition-transform duration-500 group-hover/img:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A090F] via-transparent to-transparent opacity-40" />
                      </div>
                    </div>
                  </div>

                  <div
                    ref={sphereStatsRef}
                    className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 sm:mt-12 sm:pt-10 border-t border-white/10"
                  >
                    {[
                      { icon: Zap, label: 'Hackathons', value: 'Hackwise', desc: 'Flagship Event' },
                      { icon: Lightbulb, label: 'Innovation', value: '10+', desc: 'Ideas Incubated' },
                      { icon: Code2, label: 'Workshops', value: '5+', desc: 'Sessions Conducted' },
                      { icon: Target, label: 'Mission', value: 'Build', desc: 'Learn & Grow' },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="sphere-stat relative group/stat p-3 sm:p-5 border border-white/5 hover:border-orange-500/30 transition-all duration-300 text-center"
                        style={{ clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)' }}
                      >
                        <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300" />
                        <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500/70 mx-auto mb-2 sm:mb-3 group-hover/stat:text-orange-400 transition-colors" />
                        <div className="text-xl sm:text-2xl md:text-3xl font-hackwise text-white mb-0.5 sm:mb-1">{stat.value}</div>
                        <div className="text-[10px] sm:text-xs font-mono text-orange-500/80 uppercase tracking-wider mb-0.5 sm:mb-1">{stat.label}</div>
                        <div className="text-[10px] sm:text-[11px] text-white/40 font-sans">{stat.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KVG College of Engineering Section */}
        <div ref={collegeSectionRef} className="max-w-6xl mx-auto mb-14 md:mb-24">
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8 md:mb-10">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
              <h2 className="text-lg sm:text-2xl md:text-3xl font-hackwise text-white uppercase tracking-wider text-center">
                Our <span className="text-orange-500">Institution</span>
              </h2>
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
          </div>

          <div
            ref={collegeCardRef}
            className="relative group"
            style={{ clipPath: CARD_CLIP }}
          >
            <div className="absolute inset-0 bg-orange-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative p-px" style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))' }}>
              <div
                className="absolute inset-0 bg-white/15 group-hover:bg-orange-500/40 transition-colors duration-500"
                style={{ clipPath: CARD_CLIP }}
              />
              <div
                className="relative bg-[#0A090F]/95 backdrop-blur-md overflow-hidden"
                style={{ clipPath: CARD_CLIP }}
              >
                <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 p-5 sm:p-8 md:p-12 lg:p-16">
                  <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
                    <div className="flex-1 space-y-4 sm:space-y-6">
                      <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                        <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
                        <span className="text-orange-500 font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em]">Est. 1986</span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-hackwise text-white uppercase leading-tight">
                        KVG College of
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500">
                          Engineering
                        </span>
                      </h3>

                      <div className="flex items-center gap-2 text-white/50">
                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500/70 flex-shrink-0" />
                        <span className="font-mono text-xs sm:text-sm">Sullia, Dakshina Kannada, Karnataka</span>
                      </div>

                      <div className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
                        <p className="text-sm sm:text-base md:text-lg leading-relaxed text-white/85 font-sans">
                          KVG College of Engineering, Sullia, is a premier technical institution established under the KVG Educational Trust. Affiliated to Visvesvaraya Technological University (VTU), Belagavi, and approved by AICTE, the college has been nurturing engineering talent for over seven decades.
                        </p>
                        <p className="text-sm sm:text-base md:text-lg leading-relaxed text-white/65 font-sans">
                          Nestled in the serene Western Ghats, the campus offers a perfect blend of academic rigor and natural beauty. With state-of-the-art laboratories, a well-stocked library, and dedicated faculty, KVGCE provides a transformative learning environment that molds students into industry-ready professionals and innovative thinkers.
                        </p>
                        <p className="text-sm sm:text-base md:text-lg leading-relaxed text-white/65 font-sans">
                          The institution is committed to fostering research, entrepreneurship, and holistic development — empowering students to make meaningful contributions to society and the ever-evolving world of technology.
                        </p>
                      </div>
                    </div>

                    <div className="lg:w-80 w-full max-w-[280px] mx-auto lg:max-w-none lg:mx-0 flex-shrink-0">
                      <div
                        className="relative overflow-hidden border border-white/10 group/img"
                        style={{ clipPath: CARD_CLIP }}
                      >
                        <img
                          src="/assets/kvg-logo.png"
                          alt="KVG College of Engineering"
                          className="w-full aspect-square object-contain bg-white/5 p-6 sm:p-8 transition-transform duration-500 group-hover/img:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A090F] via-transparent to-transparent opacity-40" />
                      </div>
                    </div>
                  </div>

                  <div
                    ref={collegeStatsRef}
                    className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 sm:mt-12 sm:pt-10 border-t border-white/10"
                  >
                    {[
                      { icon: BookOpen, label: 'Programs', value: '6+', desc: 'UG & PG Courses' },
                      { icon: Users, label: 'Students', value: '2000+', desc: 'Enrolled Learners' },
                      { icon: Award, label: 'Accredited', value: 'NAAC', desc: 'Quality Assured' },
                      { icon: GraduationCap, label: 'Legacy', value: '41+', desc: 'Years of Excellence' },
                    ].map((stat, i) => (
                      <div
                        key={stat.label}
                        className="college-stat relative group/stat p-3 sm:p-5 border border-white/5 hover:border-orange-500/30 transition-all duration-300 text-center"
                        style={{ clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)' }}
                      >
                        <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300" />
                        <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500/70 mx-auto mb-2 sm:mb-3 group-hover/stat:text-orange-400 transition-colors" />
                        <div className="text-xl sm:text-2xl md:text-3xl font-hackwise text-white mb-0.5 sm:mb-1">{stat.value}</div>
                        <div className="text-[10px] sm:text-xs font-mono text-orange-500/80 uppercase tracking-wider mb-0.5 sm:mb-1">{stat.label}</div>
                        <div className="text-[10px] sm:text-[11px] text-white/40 font-sans">{stat.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Committees Section */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto animate-spin" />
            <p className="mt-4 text-white/60 font-mono">Loading committees...</p>
          </div>
        ) : (
          <>
            {/* Display Committees */}
            {committees.map((committee, committeeIndex) => {
              if (!committee.members || committee.members.length === 0) return null;

              const accentColors = [
                { text: 'text-orange-500', bg: 'bg-orange-500', glow: 'bg-orange-500/20', hoverBorder: 'group-hover:bg-orange-500/50', gradient: 'from-orange-500/10' },
                { text: 'text-blue-400', bg: 'bg-blue-400', glow: 'bg-blue-400/20', hoverBorder: 'group-hover:bg-blue-400/50', gradient: 'from-blue-400/10' },
                { text: 'text-purple-400', bg: 'bg-purple-400', glow: 'bg-purple-400/20', hoverBorder: 'group-hover:bg-purple-400/50', gradient: 'from-purple-400/10' },
                { text: 'text-emerald-400', bg: 'bg-emerald-400', glow: 'bg-emerald-400/20', hoverBorder: 'group-hover:bg-emerald-400/50', gradient: 'from-emerald-400/10' },
              ];
              const accent = accentColors[committeeIndex % accentColors.length];

              return (
                <div
                  key={committee.id}
                  ref={(el) => (committeesRef.current[committeeIndex] = el)}
                  className="mb-12 md:mb-20"
                >
                  {/* Committee Header */}
                  <div className="committee-header mb-8 md:mb-12">
                    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                      <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 min-w-0">
                        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 ${accent.bg} rounded-full animate-pulse shadow-lg flex-shrink-0`} />
                        <h2 className="text-base sm:text-2xl md:text-3xl font-hackwise text-white uppercase tracking-wide sm:tracking-wider text-center">
                          {committee.name}
                        </h2>
                        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 ${accent.bg} rounded-full animate-pulse shadow-lg flex-shrink-0`} />
                      </div>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                    </div>
                    {committee.description && (
                      <p className="text-center text-white/50 font-sans text-xs sm:text-sm md:text-base max-w-2xl mx-auto px-2">
                        {committee.description}
                      </p>
                    )}
                  </div>

                  {/* Members — flexbox centered */}
                  <div className="flex flex-wrap justify-center gap-3 sm:gap-5 md:gap-6 lg:gap-8">
                    {committee.members.map((member) => (
                      <div
                        key={member.id}
                        className="member-card flex flex-col items-center w-[calc(50%-0.375rem)] sm:w-[calc(33.33%-1.1rem)] md:w-[calc(25%-1.15rem)] lg:w-[calc(20%-1.6rem)] max-w-[220px]"
                      >
                        <div
                          onClick={() => handleMemberClick(member.id)}
                          className="relative group cursor-pointer w-full mb-2 sm:mb-3"
                          style={{ clipPath: CARD_CLIP }}
                        >
                          <div className={`absolute inset-0 ${accent.glow} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                          <div className="relative p-px" style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}>
                            <div
                              className={`absolute inset-0 bg-white/10 ${accent.hoverBorder} transition-colors duration-300`}
                              style={{ clipPath: CARD_CLIP }}
                            />
                            <div
                              className={`relative bg-[#0A090F] overflow-hidden bg-gradient-to-br ${accent.gradient} to-transparent`}
                              style={{ clipPath: CARD_CLIP }}
                            >
                              <div className="relative aspect-[3/4] overflow-hidden">
                                <img
                                  src={getValidImageUrl(member.image_url)}
                                  alt={member.name}
                                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                              </div>

                              <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 z-20 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                {member.bio && (
                                  <p className="text-[10px] sm:text-[11px] text-white/80 line-clamp-2 mb-1.5 sm:mb-2 drop-shadow-lg">
                                    {member.bio}
                                  </p>
                                )}
                                <div className="flex items-center gap-1 sm:gap-1.5 text-white/60">
                                  <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider">View Profile</span>
                                  <ExternalLink size={10} className="sm:hidden group-hover:translate-x-0.5 transition-transform" />
                                  <ExternalLink size={12} className="hidden sm:block group-hover:translate-x-0.5 transition-transform" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-center w-full space-y-0.5 px-0.5 sm:px-1">
                          <h3 className="text-xs sm:text-sm md:text-base font-hackwise text-white uppercase leading-tight">
                            {member.name}
                          </h3>
                          <p className={`text-[10px] sm:text-xs ${accent.text} font-mono tracking-wider`}>
                            {member.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Unassigned Members */}
            {unassignedMembers.length > 0 && (
              <div
                ref={(el) => (committeesRef.current[committees.length] = el)}
                className="mb-12 md:mb-20"
              >
                <div className="committee-header mb-8 md:mb-12">
                  <div className="flex items-center justify-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                    <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full animate-pulse shadow-lg flex-shrink-0" />
                      <h2 className="text-base sm:text-2xl md:text-3xl font-hackwise text-white uppercase tracking-wide sm:tracking-wider text-center">
                        Other <span className="text-orange-500">Members</span>
                      </h2>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full animate-pulse shadow-lg flex-shrink-0" />
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3 sm:gap-5 md:gap-6 lg:gap-8">
                  {unassignedMembers.map((member) => (
                    <div
                      key={member.id}
                      className="member-card flex flex-col items-center w-[calc(50%-0.375rem)] sm:w-[calc(33.33%-1.1rem)] md:w-[calc(25%-1.15rem)] lg:w-[calc(20%-1.6rem)] max-w-[220px]"
                    >
                      <div
                        onClick={() => handleMemberClick(member.id)}
                        className="relative group cursor-pointer w-full mb-2 sm:mb-3"
                        style={{ clipPath: CARD_CLIP }}
                      >
                        <div className="absolute inset-0 bg-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative p-px" style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}>
                          <div
                            className="absolute inset-0 bg-white/10 group-hover:bg-orange-500/50 transition-colors duration-300"
                            style={{ clipPath: CARD_CLIP }}
                          />
                          <div
                            className="relative bg-[#0A090F] overflow-hidden bg-gradient-to-br from-orange-500/10 to-transparent"
                            style={{ clipPath: CARD_CLIP }}
                          >
                            <div className="relative aspect-[3/4] overflow-hidden">
                              <img
                                src={getValidImageUrl(member.image_url)}
                                alt={member.name}
                                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 z-20 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                              {member.bio && (
                                <p className="text-[10px] sm:text-[11px] text-white/80 line-clamp-2 mb-1.5 sm:mb-2 drop-shadow-lg">
                                  {member.bio}
                                </p>
                              )}
                              <div className="flex items-center gap-1 sm:gap-1.5 text-white/60">
                                <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider">View Profile</span>
                                <ExternalLink size={10} className="sm:hidden group-hover:translate-x-0.5 transition-transform" />
                                <ExternalLink size={12} className="hidden sm:block group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-center w-full space-y-0.5 px-0.5 sm:px-1">
                        <h3 className="text-xs sm:text-sm md:text-base font-hackwise text-white uppercase leading-tight">
                          {member.name}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-orange-500 font-mono tracking-wider">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {committees.length === 0 && unassignedMembers.length === 0 && (
              <div className="text-center py-20">
                <p className="text-white/60 font-mono">No committee members found.</p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

