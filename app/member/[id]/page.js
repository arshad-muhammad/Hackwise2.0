'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { Linkedin, Github, Twitter, ExternalLink, Mail, ArrowLeft } from 'lucide-react';
import DecryptedText from '@/app/components/DecryptedText';

const CARD_CLIP = 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)';
const BTN_CLIP = 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)';

export default function MemberPage() {
  const params = useParams();
  const router = useRouter();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    fetchMember();
  }, [params.id]);

  useEffect(() => {
    if (!member || loading) return;

    const ctx = gsap.context(() => {
      // Initial animations
      gsap.from(containerRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
      });

      gsap.from(imageRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 1,
        delay: 0.2,
        ease: 'back.out(1.7)',
      });

      gsap.from(contentRef.current.children, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.1,
        delay: 0.4,
        ease: 'power2.out',
      });
    });

    return () => ctx.revert();
  }, [member, loading]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!params.id) {
        throw new Error('Invalid member ID');
      }

      const res = await fetch(`/api/committee-members/${params.id}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Member not found');
      }
      
      if (!data.member) {
        throw new Error('Member data not available');
      }
      
      setMember(data.member);
    } catch (err) {
      console.error('Error fetching member:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="section-container border-t border-white/10 pb-24 pt-28">
        <div className="max-w-5xl mx-auto text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto animate-spin" />
          <p className="mt-4 text-white/60 font-mono">Loading member details...</p>
        </div>
      </section>
    );
  }

  if (error || !member) {
    return (
      <section className="section-container border-t border-white/10 pb-24 pt-28">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-hackwise text-white mb-4">Member Not Found</h1>
          <p className="text-white/60 font-mono mb-8">{error || 'The member you are looking for does not exist.'}</p>
          <button
            onClick={() => router.push('/about')}
            className="relative inline-flex items-center justify-center group cursor-pointer"
          >
            <div
              className="absolute inset-0 bg-orange-500/80 group-hover:bg-orange-500 transition-colors duration-300"
              style={{ clipPath: BTN_CLIP }}
            />
            <div
              className="relative m-[1px] px-6 py-3 text-center transition-all duration-300"
              style={{ clipPath: BTN_CLIP }}
            >
              <span className="relative text-white font-mono font-bold text-sm uppercase tracking-[0.3em] flex items-center gap-2">
                <ArrowLeft size={16} />
                Back to About
              </span>
            </div>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="section-container border-t border-white/10 pb-24 pt-32 md:pt-36" ref={containerRef}>
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/about')}
          className="mb-8 mt-4 flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-mono text-sm uppercase tracking-wider">Back to Committee</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Image */}
          <div className="relative group">
            <div className="absolute inset-0 bg-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative p-px" style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}>
              <div
                className="absolute inset-0 bg-white/20 group-hover:bg-orange-500/50 transition-colors duration-300"
                style={{ clipPath: CARD_CLIP }}
              />
              <div
                ref={imageRef}
                className="relative bg-[#0A090F] aspect-square overflow-hidden"
                style={{ clipPath: CARD_CLIP }}
              >
                <img
                  src={member.image_url || '/assets/logo.png'}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div ref={contentRef} className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-hackwise text-white uppercase tracking-wider mb-2">
                {member.name}
              </h1>
              <p className="text-lg text-orange-400 font-mono mb-6">{member.role}</p>
            </div>

            {member.bio && (
              <div className="bg-white/5 border border-white/10 p-6 backdrop-blur-sm">
                <h2 className="text-sm font-mono text-white/60 uppercase tracking-wider mb-3">About</h2>
                <p className="text-body font-sans text-white/80 leading-relaxed">{member.bio}</p>
              </div>
            )}

            {/* Contact & Social Links */}
            <div className="bg-white/5 border border-white/10 p-6 backdrop-blur-sm">
              <h2 className="text-sm font-mono text-white/60 uppercase tracking-wider mb-4">Connect</h2>
              <div className="flex flex-wrap gap-3">
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all duration-300 group"
                    style={{ clipPath: BTN_CLIP }}
                  >
                    <Mail size={16} className="text-white/60 group-hover:text-orange-400" />
                    <span className="text-xs font-mono text-white/80 group-hover:text-white">Email</span>
                  </a>
                )}
                {member.linkedin_url && (
                  <a
                    href={member.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all duration-300 group"
                    style={{ clipPath: BTN_CLIP }}
                  >
                    <Linkedin size={16} className="text-white/60 group-hover:text-orange-400" />
                    <span className="text-xs font-mono text-white/80 group-hover:text-white">LinkedIn</span>
                  </a>
                )}
                {member.github_url && (
                  <a
                    href={member.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all duration-300 group"
                    style={{ clipPath: BTN_CLIP }}
                  >
                    <Github size={16} className="text-white/60 group-hover:text-orange-400" />
                    <span className="text-xs font-mono text-white/80 group-hover:text-white">GitHub</span>
                  </a>
                )}
                {member.twitter_url && (
                  <a
                    href={member.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all duration-300 group"
                    style={{ clipPath: BTN_CLIP }}
                  >
                    <Twitter size={16} className="text-white/60 group-hover:text-orange-400" />
                    <span className="text-xs font-mono text-white/80 group-hover:text-white">Twitter</span>
                  </a>
                )}
                {member.portfolio_url && (
                  <a
                    href={member.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all duration-300 group"
                    style={{ clipPath: BTN_CLIP }}
                  >
                    <ExternalLink size={16} className="text-white/60 group-hover:text-orange-400" />
                    <span className="text-xs font-mono text-white/80 group-hover:text-white">Portfolio</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

