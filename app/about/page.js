'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import DecryptedText from '../components/DecryptedText';
import { Linkedin, Github, Twitter, ExternalLink, Mail } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const CARD_CLIP = 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)';

export default function AboutPage() {
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const headerRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const descriptionCardRef = useRef(null);
  const descriptionTitleRef = useRef(null);
  const descriptionTextRef = useRef(null);
  const descriptionDotRef = useRef(null);
  const membersGridRef = useRef(null);
  const memberCardsRef = useRef([]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/committee-members');
      const data = await res.json();
      setMembers(data.members || []);
    } catch (error) {
      console.error('Error fetching members:', error);
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
      }

      // Simple and performant Members grid scroll animations
      if (membersGridRef.current && membersGridRef.current.children.length > 0) {
        const cards = Array.from(membersGridRef.current.children);
        
        cards.forEach((card, index) => {
          // Set initial state - simple fade and slide up
          gsap.set(card, {
            opacity: 0,
            y: 40,
          });

          // Simple scroll trigger animation - no complex effects
          gsap.to(card, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
            delay: index * 0.08,
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          });
        });
      }

      // Simple card hover animations (CSS-based for better performance)
      // GSAP hover animations removed - using CSS transitions instead
    });

    return () => ctx.revert();
  }, [loading, members]);

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
    <section className="section-container border-t border-white/10 pb-24 pt-28">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div ref={headerRef} className="w-full flex justify-center mb-16">
          <div className="inline-block border border-white/20 bg-[#0A090F]/90 px-8 py-4 backdrop-blur-md">
            <h1
              ref={titleRef}
              className="text-3xl md:text-5xl font-hackwise text-white uppercase tracking-wider text-center"
            >
              About <span className="text-orange-500">Sphere Hive</span>
            </h1>
          </div>
        </div>

        {/* Description Section */}
        <div
          ref={descriptionRef}
          className="max-w-4xl mx-auto mb-20"
        >
          <div
            ref={descriptionCardRef}
            className="relative group"
            style={{ clipPath: CARD_CLIP }}
          >
            <div className="absolute inset-0 bg-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative p-px" style={{ filter: 'drop-shadow(0 0 15px rgba(0,0,0,0.5))' }}>
              <div
                className="absolute inset-0 bg-white/20 group-hover:bg-orange-500/50 transition-colors duration-300"
                style={{ clipPath: CARD_CLIP }}
              />
              <div
                className="relative bg-[#0A090F]/95 backdrop-blur-md p-8 md:p-12 border border-white/10"
                style={{ clipPath: CARD_CLIP }}
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div
                      ref={descriptionDotRef}
                      className="w-4 h-4 bg-orange-500 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.6)]"
                    />
                    <h2
                      ref={descriptionTitleRef}
                      className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-white uppercase"
                    >
                      <span>The Foundry of </span>
                      <span className="text-orange-500">Future Tech Leaders</span>
                    </h2>
                  </div>
                  <div ref={descriptionTextRef} className="space-y-6">
                    <p className="text-body font-sans text-base md:text-lg leading-relaxed text-white/90">
                      Sphere Hive is the crucible of innovation. We don't just teach technology; we forge the leaders who will define it. By fusing bleeding-edge tech with radical creativity, we empower you to solve the unsolvable.
                    </p>
                    <p className="text-body font-sans text-base md:text-lg leading-relaxed text-white/70">
                      Our organizing committee is a diverse group of passionate individuals dedicated to creating transformative experiences and pushing the boundaries of what's possible in technology and innovation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Organizing Committee Section */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-2 h-2 bg-orange-500 animate-pulse" />
            <h2 className="text-2xl md:text-3xl font-hackwise text-white uppercase tracking-wider">
              Organizing <span className="text-orange-500">Committee</span>
            </h2>
            <div className="w-2 h-2 bg-orange-500 animate-pulse" />
          </div>
        </div>

        {/* Members Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto animate-spin" />
            <p className="mt-4 text-white/60 font-mono">Loading members...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/60 font-mono">No committee members found.</p>
          </div>
        ) : (
          <div
            ref={membersGridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
          >
            {members.map((member, index) => (
              <div
                key={member.id}
                ref={(el) => (memberCardsRef.current[index] = el)}
                className="flex flex-col items-center group"
              >
                {/* Card Container */}
                <div
                  onClick={() => handleMemberClick(member.id)}
                  className="relative group cursor-pointer w-full mb-4"
                  style={{ clipPath: CARD_CLIP }}
                >
                  <div className="absolute inset-0 bg-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative p-px" style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}>
                    <div
                      className="absolute inset-0 bg-white/20 group-hover:bg-orange-500/50 transition-colors duration-300"
                      style={{ clipPath: CARD_CLIP }}
                    />
                    <div
                      className="relative bg-[#0A090F] overflow-hidden"
                      style={{ clipPath: CARD_CLIP }}
                    >
                      {/* Member Image */}
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={getValidImageUrl(member.image_url)}
                          alt={member.name}
                          className="member-image w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="member-overlay absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-300 group-hover:opacity-100 opacity-70" />
                      </div>

                      {/* Member Bio and View Details - On Hover */}
                      <div className="member-content absolute bottom-0 left-0 right-0 p-4 md:p-6 z-20 opacity-0 group-hover:opacity-100 translate-y-5 group-hover:translate-y-0 transition-all duration-300">
                        {member.bio && (
                          <p className="text-xs text-white/80 line-clamp-2 mb-3 drop-shadow-lg">
                            {member.bio}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-white/60">
                          <span className="text-[10px] font-mono uppercase tracking-wider drop-shadow-lg">
                            View Details
                          </span>
                          <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Member Name and Role - Outside Card, Centered */}
                <div className="text-center w-full mt-2 space-y-1">
                  <h3 className="text-lg md:text-xl font-hackwise text-white uppercase transition-colors duration-300">
                    {member.name}
                  </h3>
                  <p className="text-sm text-orange-400 font-mono tracking-wider">
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

