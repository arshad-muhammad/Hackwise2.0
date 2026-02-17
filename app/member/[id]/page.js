'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { Linkedin, Github, Twitter, ExternalLink, Mail, ArrowLeft, FileText, MapPin } from 'lucide-react';
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

  // Helper function to get valid image URL (reject base64)
  const getValidImageUrl = (url) => {
    if (!url || url.startsWith('data:')) {
      return '/assets/logo.png';
    }
    return url;
  };

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
    <section
      className="border-t border-white/10 pb-24 pt-28 md:pt-32 bg-gradient-to-b from-[#050509] via-[#050509] to-[#050509]"
      ref={containerRef}
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <div className="flex items-center justify-start mb-8 mt-4">
        <button
          onClick={() => router.push('/about')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-mono text-xs md:text-sm uppercase tracking-[0.25em]">
              Back to Committee
            </span>
        </button>
        </div>

        {/* Hero Section */}
        <div className="relative mb-12 lg:mb-16">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-purple-500/10 to-transparent blur-3xl opacity-60" />
          <div className="relative grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)] gap-10 items-start bg-white/5 border border-white/10 backdrop-blur-md px-6 py-6 md:px-10 md:py-10">
            {/* Text */}
            <div ref={contentRef} className="order-2 xl:order-1 space-y-5 md:space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/70">
                  Portfolio
                </span>
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-hackwise text-white uppercase tracking-[0.18em] mb-3 leading-tight">
                  {member.name}
                </h1>
                <p className="text-sm md:text-base text-orange-400 font-mono mb-2 uppercase tracking-[0.3em]">
                  {member.role}
                </p>
                {(member.headline || member.location) && (
                  <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
                    {member.headline && (
                      <span className="font-sans text-[13px] md:text-sm">
                        {member.headline}
                      </span>
                    )}
                    {member.location && (
                      <span className="inline-flex items-center gap-1 text-white/50 text-[11px] font-mono uppercase tracking-[0.25em]">
                        <MapPin size={14} />
                        {member.location}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {member.short_bio && (
                <p className="mt-2 text-[13px] md:text-sm text-white/75 font-sans leading-relaxed whitespace-pre-line max-w-xl">
                  {member.short_bio}
                </p>
              )}

              {/* Quick stats row */}
              <div className="grid grid-cols-3 gap-3 pt-3 max-w-md">
                <div className="border border-white/10 bg-black/40 px-3 py-2">
                  <p className="text-[11px] text-white/50 font-mono uppercase tracking-[0.25em]">
                    Experience
                  </p>
                  <p className="text-sm text-white mt-1">
                    {member.experience
                      ? member.experience.split('\n').filter((l) => l.trim()).length
                      : 0}{' '}
                    roles
                  </p>
                </div>
                <div className="border border-white/10 bg-black/40 px-3 py-2">
                  <p className="text-[11px] text-white/50 font-mono uppercase tracking-[0.25em]">
                    Projects
                  </p>
                  <p className="text-sm text-white mt-1">
                    {member.projects_detail
                      ? member.projects_detail.split('\n').filter((l) => l.trim()).length
                      : member.projects
                      ? member.projects.split('\n').filter((l) => l.trim()).length
                      : 0}
                  </p>
                </div>
                <div className="border border-white/10 bg-black/40 px-3 py-2">
                  <p className="text-[11px] text-white/50 font-mono uppercase tracking-[0.25em]">
                    Skills
                  </p>
                  <p className="text-sm text-white mt-1">
                    {member.skills
                      ? member.skills.split(',').filter((s) => s.trim()).length
                      : 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Portrait */}
            <div className="order-1 xl:order-2 relative flex justify-center lg:justify-end">
              <div className="relative w-44 h-44 md:w-56 md:h-56 lg:w-64 lg:h-64">
                <div className="absolute inset-0 rounded-[32px] bg-gradient-to-tr from-orange-500/60 via-purple-500/40 to-blue-500/40 blur-2xl" />
                <div
                  className="relative w-full h-full border border-white/15 bg-black/60 overflow-hidden"
                style={{ clipPath: CARD_CLIP }}
                ref={imageRef}
              >
                <img
                  src={getValidImageUrl(member.image_url)}
                  alt={member.name}
                  className="w-full h-full object-cover object-top"
                />
                </div>
              </div>
            </div>
          </div>

          {/* Content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1.3fr)] gap-8 mt-10">
            {/* Left column: About, Experience, Projects */}
            <div className="space-y-8">
              {/* About Section */}
            {(member.bio || member.interests || member.career_objective) && (
              <div
                className="relative overflow-hidden bg-gradient-to-br from-white/5 via-white/2 to-white/5 border border-white/10 p-6 md:p-7 backdrop-blur-md"
                style={{ clipPath: CARD_CLIP }}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.25),_transparent_55%)]"
                  style={{ clipPath: CARD_CLIP }}
                />
                <h2 className="relative text-xs md:text-sm font-mono text-white/60 uppercase tracking-[0.35em] mb-4 flex items-center gap-3">
                  <span className="inline-block w-6 h-px bg-gradient-to-r from-orange-400 to-transparent" />
                  About
                </h2>
                <div className="relative space-y-4">
                  {member.bio && (
                    <p className="text-[13px] md:text-sm font-sans text-white/80 leading-relaxed whitespace-pre-line">
                      {member.bio}
                    </p>
                  )}
                  {(member.interests || member.career_objective) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/10 mt-2">
                      {member.interests && (
                        <div>
                          <h3 className="text-[11px] font-mono text-white/50 uppercase tracking-[0.35em] mb-1">
                            Interests
                          </h3>
                          <p className="text-xs text-white/75 whitespace-pre-line">
                            {member.interests}
                          </p>
                        </div>
                      )}
                      {member.career_objective && (
            <div>
                          <h3 className="text-[11px] font-mono text-white/50 uppercase tracking-[0.35em] mb-1">
                            Career Objective
                          </h3>
                          <p className="text-xs text-white/75 whitespace-pre-line">
                            {member.career_objective}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

              {/* Experience Section */}
              {member.experience && (
                <div
                  className="relative overflow-hidden bg-white/5 border border-white/10 p-6 backdrop-blur-sm"
                  style={{ clipPath: CARD_CLIP }}
                >
                  <h2 className="text-sm font-mono text-white/60 uppercase tracking-wider mb-3">
                    Experience
                  </h2>
                  <div className="relative border-l border-white/10 pl-5 space-y-5">
                    {member.experience
                      .split('\n')
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line, idx) => {
                        const [company, role, duration, desc, achievements] = line
                          .split('|')
                          .map((p) => p.trim());
                        return (
                          <div key={idx} className="relative">
                            <span className="absolute -left-2.5 top-2 w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.7)]" />
                            {company && (
                              <p className="text-sm font-mono text-orange-400 uppercase tracking-wider">
                                {company}
                              </p>
                            )}
                            {role && (
                              <p className="text-xs text-white/80 font-mono mt-1">
                                {role}{' '}
                                {duration && (
                                  <span className="text-white/50">• {duration}</span>
                                )}
                              </p>
                            )}
                            {desc && (
                              <p className="text-xs text-white/75 mt-2 font-sans whitespace-pre-line">
                                {desc}
                              </p>
                            )}
                            {achievements && (
                              <p className="text-[11px] text-white/60 mt-2 font-sans whitespace-pre-line">
                                {achievements}
                              </p>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Projects Section */}
              {(member.projects || member.projects_detail) && (
                <div
                  className="relative overflow-hidden bg-white/5 border border-white/10 p-6 backdrop-blur-sm"
                  style={{ clipPath: CARD_CLIP }}
                >
                  <h2 className="text-sm font-mono text-white/60 uppercase tracking-wider mb-3">
                    Projects
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {member.projects_detail &&
                      member.projects_detail
                        .split('\n')
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .map((line, idx) => {
                          const [
                            title,
                            description,
                            stack,
                            github,
                            live,
                            image,
                            featuredFlag,
                          ] = line.split('|').map((p) => p.trim());
                          const isFeatured = (featuredFlag || '').toLowerCase().startsWith('y');
                          return (
                            <div
                              key={`detail-${idx}`}
                              className={`relative border bg-white/5 overflow-hidden group ${
                                isFeatured
                                  ? 'border-orange-500/70 shadow-[0_0_25px_rgba(249,115,22,0.45)] md:col-span-2'
                                  : 'border-white/10'
                              }`}
                            >
                              {image && (
                                <div className="h-32 md:h-36 overflow-hidden">
                                  <img
                                    src={image}
                                    alt={title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                                </div>
                              )}
                              <div className="relative p-4 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-mono text-orange-400 uppercase tracking-wider">
                                    {title}
                                  </p>
                                  {isFeatured && (
                                    <span className="text-[10px] font-mono text-yellow-300 uppercase tracking-[0.25em]">
                                      Featured
                                    </span>
                                  )}
                                </div>
                                {description && (
                                  <p className="text-xs text-white/75 font-sans whitespace-pre-line">
                                    {description}
                                  </p>
                                )}
                                {stack && (
                                  <p className="text-[11px] text-white/50 mt-1 font-mono">
                                    Stack: {stack}
                                  </p>
                                )}
                                {(github || live) && (
                                  <div className="flex flex-wrap gap-3 mt-2">
                                    {github && (
                                      <a
                                        href={github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[11px] text-white/70 underline hover:text-orange-400"
                                      >
                                        GitHub
                                      </a>
                                    )}
                                    {live && (
                                      <a
                                        href={live}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[11px] text-white/70 underline hover:text-orange-400"
                                      >
                                        Live Demo
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    {member.projects &&
                      member.projects
                        .split('\n')
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .map((line, idx) => {
                          const [title, ...rest] = line.split('-');
                          const description = rest.join('-').trim();
                          return (
                            <div
                              key={`simple-${idx}`}
                              className="border border-white/10 bg-white/5 p-3"
                            >
                              <p className="text-sm font-mono text-orange-400 uppercase tracking-wider">
                                {title.trim()}
                              </p>
                              {description && (
                                <p className="text-xs text-white/70 mt-1 font-sans">
                                  {description}
                                </p>
                              )}
                            </div>
                          );
                        })}
                  </div>
                </div>
              )}
            </div>

            {/* Right column: Skills, Achievements, Education, Connect */}
            <div className="space-y-8">
              {/* Skills Section */}
            {(member.skills || member.tech_skills || member.soft_skills || member.tools) && (
              <div
                className="relative overflow-hidden bg-gradient-to-br from-white/5 via-white/2 to-white/5 border border-white/10 p-6 md:p-7 backdrop-blur-md"
                style={{ clipPath: CARD_CLIP }}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.25),_transparent_55%)]"
                  style={{ clipPath: CARD_CLIP }}
                />
                <h2 className="relative text-xs md:text-sm font-mono text-white/60 uppercase tracking-[0.35em] mb-4 flex items-center gap-3">
                  <span className="inline-block w-6 h-px bg-gradient-to-r from-blue-400 to-transparent" />
                  Skills
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {member.tech_skills && (
                    <div>
                      <h3 className="text-xs font-mono text-white/50 uppercase tracking-[0.25em] mb-2">
                        Technical
                      </h3>
                      <div className="space-y-2">
                        {member.tech_skills
                          .split(',')
                          .map((item) => item.trim())
                          .filter(Boolean)
                          .map((item, idx) => {
                            const [name, levelRaw] = item.split(':');
                            const level = (levelRaw || '').trim().toLowerCase();
                            const perc =
                              level === 'beginner'
                                ? 35
                                : level === 'intermediate'
                                ? 65
                                : level === 'advanced'
                                ? 90
                                : 60;
                            return (
                              <div key={idx}>
                                <div className="flex justify-between text-[11px] text-white/60 font-mono mb-1">
                                  <span>{name.trim()}</span>
                                  {level && <span className="uppercase">{level}</span>}
                                </div>
                                <div className="h-1.5 w-full bg-white/5 overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-orange-500 to-yellow-400"
                                    style={{ width: `${perc}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                  {(member.soft_skills || member.tools || member.skills) && (
                    <div className="space-y-3">
                      {member.soft_skills && (
                        <div>
                          <h3 className="text-xs font-mono text-white/50 uppercase tracking-[0.25em] mb-2">
                            Soft Skills
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {member.soft_skills
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean)
                              .map((s) => (
                                <span
                                  key={s}
                                  className="px-3 py-1 bg-white/5 border border-white/10 text-[11px] text-white/80 font-mono uppercase tracking-wider"
                                >
                                  {s}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                      {member.tools && (
                        <div>
                          <h3 className="text-xs font-mono text-white/50 uppercase tracking-[0.25em] mb-2">
                            Tools & Tech
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {member.tools
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean)
                              .map((s) => (
                                <span
                                  key={s}
                                  className="px-3 py-1 bg-white/5 border border-white/10 text-[11px] text-white/80 font-mono uppercase tracking-wider"
                                >
                                  {s}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                      {member.skills && !member.tech_skills && (
                        <div>
                          <h3 className="text-xs font-mono text-white/50 uppercase tracking-[0.25em] mb-2">
                            Skills & Stack
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {member.skills
                              .split(',')
                              .map((skill) => skill.trim())
                              .filter(Boolean)
                              .map((skill) => (
                                <span
                                  key={skill}
                                  className="px-3 py-1 bg-white/5 border border-white/10 text-xs text-white/80 font-mono uppercase tracking-wider"
                                >
                                  {skill}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

              {/* Achievements & Certifications */}
            {(member.achievements || member.certifications) && (
              <div
                className="relative overflow-hidden bg-gradient-to-br from-white/5 via-white/2 to-white/5 border border-white/10 p-6 md:p-7 backdrop-blur-md"
                style={{ clipPath: CARD_CLIP }}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(244,244,245,0.18),_transparent_55%)]"
                  style={{ clipPath: CARD_CLIP }}
                />
                <h2 className="relative text-xs md:text-sm font-mono text-white/60 uppercase tracking-[0.35em] mb-3 flex items-center gap-3">
                  <span className="inline-block w-6 h-px bg-gradient-to-r from-emerald-400 to-transparent" />
                  Achievements & Certifications
                </h2>
                {member.achievements && (
                  <div className="relative mb-4">
                    <h3 className="text-xs font-mono text-white/50 uppercase tracking-[0.25em] mb-2">
                      Achievements
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-sm text-white/80 font-sans">
                      {member.achievements
                        .split('\n')
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .map((line, idx) => (
                          <li key={idx}>{line}</li>
                        ))}
                    </ul>
                  </div>
                )}
                {member.certifications && (
                  <div>
                    <h3 className="text-xs font-mono text-white/50 uppercase tracking-[0.25em] mb-2">
                      Certifications
                    </h3>
                    <div className="space-y-2">
                      {member.certifications
                        .split('\n')
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .map((line, idx) => {
                          const [name, org, date, url] = line.split('|').map((p) => p.trim());
                          return (
                            <div key={idx} className="border border-white/10 bg-white/5 p-3">
                              <p className="text-xs font-mono text-white uppercase tracking-wider">
                                {name}
                              </p>
                              <p className="text-[11px] text-white/60 mt-1 font-mono">
                                {org} {date && <span>• {date}</span>}
                              </p>
                              {url && (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-orange-400 underline mt-1 inline-block"
                                >
                                  View Credential
                                </a>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}

              {/* Education */}
            {member.education && (
              <div
                className="relative overflow-hidden bg-gradient-to-br from-white/5 via-white/2 to-white/5 border border-white/10 p-6 md:p-7 backdrop-blur-md"
                style={{ clipPath: CARD_CLIP }}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_bottom,_rgba(96,165,250,0.25),_transparent_55%)]"
                  style={{ clipPath: CARD_CLIP }}
                />
                <h2 className="relative text-xs md:text-sm font-mono text-white/60 uppercase tracking-[0.35em] mb-3 flex items-center gap-3">
                  <span className="inline-block w-6 h-px bg-gradient-to-r from-purple-400 to-transparent" />
                  Education
                </h2>
                <div className="space-y-3">
                  {member.education
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((line, idx) => {
                      const [inst, degree, duration, score] = line.split('|').map((p) => p.trim());
                      return (
                        <div key={idx} className="border border-white/10 bg-white/5 p-3">
                          {inst && (
                            <p className="text-sm font-mono text-orange-400 uppercase tracking-wider">
                              {inst}
                            </p>
                          )}
                          {degree && (
                            <p className="text-xs text-white/80 mt-1 font-mono">{degree}</p>
                          )}
                          {(duration || score) && (
                            <p className="text-[11px] text-white/60 mt-1 font-mono">
                              {duration}
                              {duration && score && ' • '}
                              {score}
                            </p>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Contact, Resume & Social Links */}
            <div
              className="relative overflow-hidden bg-gradient-to-br from-white/5 via-white/2 to-white/5 border border-white/10 p-6 md:p-7 backdrop-blur-md"
              style={{ clipPath: CARD_CLIP }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.3),_transparent_55%)]"
                style={{ clipPath: CARD_CLIP }}
              />
              <h2 className="relative text-xs md:text-sm font-mono text-white/60 uppercase tracking-[0.35em] mb-4 flex items-center gap-3">
                <span className="inline-block w-6 h-px bg-gradient-to-r from-orange-400 to-transparent" />
                Connect
              </h2>
              <div className="relative flex flex-wrap gap-3">
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
                {member.resume_url && (
                  <a
                    href={member.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all duration-300 group"
                    style={{ clipPath: BTN_CLIP }}
                  >
                    <FileText size={16} className="text-white/60 group-hover:text-orange-400" />
                    <span className="text-xs font-mono text-white/80 group-hover:text-white">
                      Resume
                    </span>
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
      </div>
    </section>
  );
}

