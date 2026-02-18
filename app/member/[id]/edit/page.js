'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, Lock, ArrowLeft, Upload } from 'lucide-react';

const CARD_CLIP = 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)';
const BTN_CLIP = 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)';

// Helpers to encode/decode structured fields into text for the API
const parseExperience = (text) =>
  (text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [company = '', role = '', duration = '', description = '', achievements = ''] =
        line.split('|').map((p) => p.trim());
      return { company, role, duration, description, achievements };
    });

const stringifyExperience = (items) =>
  (items || [])
    .map(
      ({ company, role, duration, description, achievements }) =>
        [company, role, duration, description, achievements].map((p) => p || '').join(' | ')
    )
    .join('\n');

const parseEducation = (text) =>
  (text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [institution = '', degree = '', duration = '', score = ''] =
        line.split('|').map((p) => p.trim());
      return { institution, degree, duration, score };
    });

const stringifyEducation = (items) =>
  (items || [])
    .map(({ institution, degree, duration, score }) =>
      [institution, degree, duration, score].map((p) => p || '').join(' | ')
    )
    .join('\n');

// Title | Description | Tech Stack | GitHub | Live | ImageURL | Featured[yes/no]
const parseProjectsDetail = (text) =>
  (text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title = '', description = '', stack = '', github = '', live = '', image = '', featured = ''] =
        line.split('|').map((p) => p.trim());
      return {
        title,
        description,
        stack,
        github,
        live,
        image,
        featured: (featured || '').toLowerCase().startsWith('y'),
      };
    });

const stringifyProjectsDetail = (items) =>
  (items || [])
    .map(({ title, description, stack, github, live, image, featured }) =>
      [
        title || '',
        description || '',
        stack || '',
        github || '',
        live || '',
        image || '',
        featured ? 'yes' : 'no',
      ].join(' | ')
    )
    .join('\n');

const parseAchievements = (text) =>
  (text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title = '', description = ''] = line.split('|').map((p) => p.trim());
      return { title, description };
    });

const stringifyAchievements = (items) =>
  (items || [])
    .map(({ title, description }) => [title || '', description || ''].join(' | '))
    .join('\n');

const parseCertifications = (text) =>
  (text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = '', organization = '', date = '', url = ''] = line.split('|').map((p) => p.trim());
      return { name, organization, date, url };
    });

const stringifyCertifications = (items) =>
  (items || [])
    .map(({ name, organization, date, url }) =>
      [name || '', organization || '', date || '', url || ''].join(' | ')
    )
    .join('\n');

export default function MemberEditPage() {
  const params = useParams();
  const router = useRouter();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    role: '',
    headline: '',
    location: '',
    short_bio: '',
    bio: '',
    interests: '',
    career_objective: '',
    skills: '',
    tech_skills: '',
    soft_skills: '',
    tools: '',
    achievements: '',
    experience: '',
    projects: '',
    projects_detail: '',
    certifications: '',
    education: '',
    portfolio_url: '',
    resume_url: '',
    linkedin_url: '',
    github_url: '',
    twitter_url: '',
    image_url: '',
    new_password: '',
  });

  const [experienceItems, setExperienceItems] = useState([]);
  const [educationItems, setEducationItems] = useState([]);
  const [projectDetailItems, setProjectDetailItems] = useState([]);
  const [achievementItems, setAchievementItems] = useState([]);
  const [certificationItems, setCertificationItems] = useState([]);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        if (!params.id) return;
        setLoading(true);
        const res = await fetch(`/api/committee-members/${params.id}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load member');
        }
        if (!data.member) {
          throw new Error('Member not found');
        }
        setMember(data.member);
        const nextForm = {
          name: data.member.name || '',
          role: data.member.role || '',
          headline: data.member.headline || '',
          location: data.member.location || '',
          short_bio: data.member.short_bio || '',
          bio: data.member.bio || '',
          interests: data.member.interests || '',
          career_objective: data.member.career_objective || '',
          skills: data.member.skills || '',
          tech_skills: data.member.tech_skills || '',
          soft_skills: data.member.soft_skills || '',
          tools: data.member.tools || '',
          achievements: data.member.achievements || '',
          experience: data.member.experience || '',
          projects: data.member.projects || '',
          projects_detail: data.member.projects_detail || '',
          certifications: data.member.certifications || '',
          education: data.member.education || '',
          portfolio_url: data.member.portfolio_url || '',
          resume_url: data.member.resume_url || '',
          linkedin_url: data.member.linkedin_url || '',
          github_url: data.member.github_url || '',
          twitter_url: data.member.twitter_url || '',
          image_url: data.member.image_url || '',
          new_password: '',
        };
        setForm(nextForm);
        setExperienceItems(parseExperience(nextForm.experience));
        setEducationItems(parseEducation(nextForm.education));
        setProjectDetailItems(parseProjectsDetail(nextForm.projects_detail));
        setAchievementItems(parseAchievements(nextForm.achievements));
        setCertificationItems(parseCertifications(nextForm.certifications));
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [params.id]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter the password to start editing.');
      return;
    }
    try {
      setError(null);
      const res = await fetch(`/api/committee-members/${params.id}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, verifyOnly: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid password');
      }
      setIsVerified(true);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter the password to update your portfolio.');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      // Sync structured arrays back into text fields for API
      const payload = {
        ...form,
        experience: stringifyExperience(experienceItems),
        education: stringifyEducation(educationItems),
        projects_detail: stringifyProjectsDetail(projectDetailItems),
        achievements: stringifyAchievements(achievementItems),
        certifications: stringifyCertifications(certificationItems),
      };

      const res = await fetch(`/api/committee-members/${params.id}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }
      if (form.new_password) {
        setPassword(form.new_password);
        setForm({ ...form, new_password: '' });
      }
      router.push(`/member/${params.id}`);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleProfileImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed');
      setForm((prev) => ({ ...prev, image_url: data.url }));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to upload image');
    }
  };

  const handleProjectImageUpload = async (index, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed');
      setProjectDetailItems((prev) => {
        const next = [...prev];
        if (!next[index]) return prev;
        next[index] = { ...next[index], image: data.url };
        return next;
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to upload project image');
    }
  };

  if (loading) {
    return (
      <section className="section-container border-t border-white/10 pb-24 pt-28">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto animate-spin" />
          <p className="mt-4 text-white/60 font-mono">Loading member...</p>
        </div>
      </section>
    );
  }

  if (error && !member) {
    return (
      <section className="section-container border-t border-white/10 pb-24 pt-28">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-hackwise text-white mb-4">Member Not Found</h1>
          <p className="text-white/60 font-mono mb-8">{error}</p>
          <button
            onClick={() => router.push('/about')}
            className="px-6 py-3 bg-orange-500 text-white font-mono text-sm uppercase tracking-[0.2em]"
          >
            Back to About
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="section-container border-t border-white/10 pb-24 pt-28">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push(`/member/${params.id}`)}
          className="mb-6 text-white/60 hover:text-white font-mono text-xs uppercase tracking-[0.2em]"
        >
          ← Back to Profile
        </button>

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-hackwise text-white uppercase tracking-wider">
            Edit Portfolio
          </h1>
          <p className="text-white/60 font-mono text-xs mt-2">
            Update your public portfolio details. Changes are visible on your member page.
          </p>
        </div>

        <div className="mb-6 bg-white/5 border border-white/10 p-4 md:p-6 backdrop-blur-sm">
          <h2 className="text-sm font-mono text-white/70 uppercase tracking-[0.25em] mb-3 flex items-center gap-2">
            <Lock size={16} />
            Security
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Your Password"
                className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-mono focus:outline-none focus:border-orange-500/60"
              />
              <p className="mt-1 text-[11px] text-white/40 font-mono">
                Ask your admin if you don't know your password.
              </p>
            </div>
            {isVerified && (
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                  New Password (optional)
                </label>
                <input
                  type="password"
                  value={form.new_password}
                  onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-mono focus:outline-none focus:border-orange-500/60"
                />
                <p className="mt-1 text-[11px] text-white/40 font-mono">
                  Leave empty to keep current password.
                </p>
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            {!isVerified && (
              <button
                onClick={handleVerify}
                className="relative inline-flex items-center justify-center group cursor-pointer"
                type="button"
              >
                <div
                  className="absolute inset-0 bg-orange-500/80 group-hover:bg-orange-500 transition-colors duration-300"
                  style={{ clipPath: BTN_CLIP }}
                />
                <div
                  className="relative m-[1px] px-5 py-2 text-center transition-all duration-300"
                  style={{ clipPath: BTN_CLIP }}
                >
                  <span className="relative text-white font-mono font-bold text-xs uppercase tracking-[0.25em] flex items-center gap-2">
                    Verify Password
                  </span>
                </div>
              </button>
            )}
          </div>
          {isVerified && (
            <p className="mt-2 text-[11px] text-green-400 font-mono">
              Password verified recently.
            </p>
          )}
          {error && (
            <p className="mt-2 text-[11px] text-red-400 font-mono">
              {error}
            </p>
          )}
        </div>

        {isVerified && (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-sans focus:outline-none focus:border-orange-500/60"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-sans focus:outline-none focus:border-orange-500/60"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                  Headline
                </label>
                <input
                  type="text"
                  value={form.headline}
                  onChange={(e) => setForm({ ...form, headline: e.target.value })}
                  placeholder="e.g. Full Stack Developer • ML Enthusiast"
                  className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-sans focus:outline-none focus:border-orange-500/60"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="City, Country"
                  className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-sans focus:outline-none focus:border-orange-500/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                Short Bio (2–4 lines)
              </label>
              <textarea
                value={form.short_bio}
                onChange={(e) => setForm({ ...form, short_bio: e.target.value })}
                rows={3}
                className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-sans focus:outline-none focus:border-orange-500/60"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                About
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={4}
                className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-sans focus:outline-none focus:border-orange-500/60"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                  Interests
                </label>
                <textarea
                  value={form.interests}
                  onChange={(e) => setForm({ ...form, interests: e.target.value })}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-sans focus:outline-none focus:border-orange-500/60"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                  Career Objective
                </label>
                <textarea
                  value={form.career_objective}
                  onChange={(e) => setForm({ ...form, career_objective: e.target.value })}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-sans focus:outline-none focus:border-orange-500/60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                  General Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  placeholder="React, Next.js, Node.js, Figma"
                  className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-sans focus:outline-none focus:border-orange-500/60"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                  Technical Skills (name:level, comma separated)
                </label>
                <input
                  type="text"
                  value={form.tech_skills}
                  onChange={(e) => setForm({ ...form, tech_skills: e.target.value })}
                  placeholder="React:Advanced, Next.js:Intermediate"
                  className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-sans focus:outline-none focus:border-orange-500/60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                  Soft Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={form.soft_skills}
                  onChange={(e) => setForm({ ...form, soft_skills: e.target.value })}
                  placeholder="Leadership, Communication"
                  className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-sans focus:outline-none focus:border-orange-500/60"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                  Tools & Technologies
                </label>
                <input
                  type="text"
                  value={form.tools}
                  onChange={(e) => setForm({ ...form, tools: e.target.value })}
                  placeholder="Git, Docker, Figma"
                  className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-sans focus:outline-none focus:border-orange-500/60"
                />
              </div>
            </div>

            {/* Achievements cards */}
            <div>
              <label className="block text-xs font-mono text-white/60 uppercase mb-3">
                Achievements
              </label>
              <div className="space-y-3">
                {achievementItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="border border-white/10 bg-white/5 p-3 space-y-2"
                  >
                    <input
                      type="text"
                      placeholder="Title"
                      value={item.title}
                      onChange={(e) => {
                        const next = [...achievementItems];
                        next[idx] = { ...next[idx], title: e.target.value };
                        setAchievementItems(next);
                      }}
                      className="w-full bg-transparent border border-white/10 px-3 py-1 text-xs text-white"
                    />
                    <textarea
                      placeholder="Description / context"
                      value={item.description}
                      onChange={(e) => {
                        const next = [...achievementItems];
                        next[idx] = { ...next[idx], description: e.target.value };
                        setAchievementItems(next);
                      }}
                      rows={2}
                      className="w-full bg-transparent border border-white/10 px-3 py-1 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...achievementItems];
                        next.splice(idx, 1);
                        setAchievementItems(next);
                      }}
                      className="text-[11px] text-red-400 mt-1 text-right"
                    >
                      Remove Achievement
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setAchievementItems((prev) => [...prev, { title: '', description: '' }])
                  }
                  className="text-[11px] text-orange-400 underline"
                >
                  + Add Achievement
                </button>
              </div>
            </div>

            {/* Simple projects (optional legacy text area, kept minimal) */}
            <div>
              <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                Additional Projects (optional quick list)
              </label>
              <textarea
                value={form.projects}
                onChange={(e) => setForm({ ...form, projects: e.target.value })}
                rows={3}
                className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-sans focus:outline-none focus:border-orange-500/60"
              />
            </div>

            {/* Certifications & Education cards could be added later; keep text areas minimal in admin */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                  Portfolio URL
                </label>
                <input
                  type="url"
                  value={form.portfolio_url}
                  onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-mono focus:outline-none focus:border-orange-500/60"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                  Resume URL (PDF)
                </label>
                <input
                  type="url"
                  value={form.resume_url}
                  onChange={(e) => setForm({ ...form, resume_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-mono focus:outline-none focus:border-orange-500/60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                  Profile Image
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 bg-white/5 border border-white/10 px-4 py-2 text-white font-mono focus:outline-none focus:border-orange-500/60"
                  />
                  <label className="relative inline-flex items-center justify-center cursor-pointer">
                    <div
                      className="absolute inset-0 bg-orange-500/80 hover:bg-orange-500 transition-colors duration-300"
                      style={{ clipPath: BTN_CLIP }}
                    />
                    <div
                      className="relative m-[1px] px-4 py-2 transition-all duration-300"
                      style={{ clipPath: BTN_CLIP }}
                    >
                      <Upload size={16} className="text-white" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleProfileImageUpload(file);
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Experience cards */}
            <div>
              <label className="block text-xs font-mono text-white/60 uppercase mb-3">
                Experience
              </label>
              <div className="space-y-3">
                {experienceItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="border border-white/10 bg-white/5 p-3 grid grid-cols-1 md:grid-cols-2 gap-3"
                  >
                    <input
                      type="text"
                      placeholder="Company"
                      value={item.company}
                      onChange={(e) => {
                        const next = [...experienceItems];
                        next[idx] = { ...next[idx], company: e.target.value };
                        setExperienceItems(next);
                      }}
                      className="bg-transparent border border-white/10 px-3 py-1 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Role"
                      value={item.role}
                      onChange={(e) => {
                        const next = [...experienceItems];
                        next[idx] = { ...next[idx], role: e.target.value };
                        setExperienceItems(next);
                      }}
                      className="bg-transparent border border-white/10 px-3 py-1 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Duration"
                      value={item.duration}
                      onChange={(e) => {
                        const next = [...experienceItems];
                        next[idx] = { ...next[idx], duration: e.target.value };
                        setExperienceItems(next);
                      }}
                      className="bg-transparent border border-white/10 px-3 py-1 text-xs text-white"
                    />
                    <textarea
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => {
                        const next = [...experienceItems];
                        next[idx] = { ...next[idx], description: e.target.value };
                        setExperienceItems(next);
                      }}
                      rows={2}
                      className="bg-transparent border border-white/10 px-3 py-1 text-xs text-white md:col-span-1"
                    />
                    <textarea
                      placeholder="Key Achievements"
                      value={item.achievements}
                      onChange={(e) => {
                        const next = [...experienceItems];
                        next[idx] = { ...next[idx], achievements: e.target.value };
                        setExperienceItems(next);
                      }}
                      rows={2}
                      className="bg-transparent border border-white/10 px-3 py-1 text-xs text-white md:col-span-2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...experienceItems];
                        next.splice(idx, 1);
                        setExperienceItems(next);
                      }}
                      className="text-[11px] text-red-400 mt-1 md:col-span-2 text-right"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setExperienceItems((prev) => [
                      ...prev,
                      { company: '', role: '', duration: '', description: '', achievements: '' },
                    ])
                  }
                  className="text-[11px] text-orange-400 underline"
                >
                  + Add Experience
                </button>
              </div>
            </div>

            {/* Detailed projects cards with image upload */}
            <div>
              <label className="block text-xs font-mono text-white/60 uppercase mb-3">
                Detailed Projects
              </label>
              <div className="space-y-3">
                {projectDetailItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="border border-white/10 bg-white/5 p-3 grid grid-cols-1 md:grid-cols-2 gap-3"
                  >
                    <input
                      type="text"
                      placeholder="Title"
                      value={item.title}
                      onChange={(e) => {
                        const next = [...projectDetailItems];
                        next[idx] = { ...next[idx], title: e.target.value };
                        setProjectDetailItems(next);
                      }}
                      className="bg-transparent border border-white/10 px-3 py-1 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Tech Stack"
                      value={item.stack}
                      onChange={(e) => {
                        const next = [...projectDetailItems];
                        next[idx] = { ...next[idx], stack: e.target.value };
                        setProjectDetailItems(next);
                      }}
                      className="bg-transparent border border-white/10 px-3 py-1 text-xs text-white"
                    />
                    <textarea
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => {
                        const next = [...projectDetailItems];
                        next[idx] = { ...next[idx], description: e.target.value };
                        setProjectDetailItems(next);
                      }}
                      rows={2}
                      className="bg-transparent border border-white/10 px-3 py-1 text-xs text-white md:col-span-2"
                    />
                    <input
                      type="url"
                      placeholder="GitHub URL"
                      value={item.github}
                      onChange={(e) => {
                        const next = [...projectDetailItems];
                        next[idx] = { ...next[idx], github: e.target.value };
                        setProjectDetailItems(next);
                      }}
                      className="bg-transparent border border-white/10 px-3 py-1 text-xs text-white"
                    />
                    <input
                      type="url"
                      placeholder="Live Demo URL"
                      value={item.live}
                      onChange={(e) => {
                        const next = [...projectDetailItems];
                        next[idx] = { ...next[idx], live: e.target.value };
                        setProjectDetailItems(next);
                      }}
                      className="bg-transparent border border-white/10 px-3 py-1 text-xs text-white"
                    />
                    <div className="flex items-center gap-2 md:col-span-2">
                      <span className="text-[11px] text-white/60">Featured</span>
                      <input
                        type="checkbox"
                        checked={item.featured}
                        onChange={(e) => {
                          const next = [...projectDetailItems];
                          next[idx] = { ...next[idx], featured: e.target.checked };
                          setProjectDetailItems(next);
                        }}
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-3">
                      <input
                        type="url"
                        placeholder="Image URL"
                        value={item.image || ''}
                        onChange={(e) => {
                          const next = [...projectDetailItems];
                          next[idx] = { ...next[idx], image: e.target.value };
                          setProjectDetailItems(next);
                        }}
                        className="flex-1 bg-transparent border border-white/10 px-3 py-1 text-xs text-white"
                      />
                      <label className="relative inline-flex items-center justify-center cursor-pointer">
                        <div
                          className="absolute inset-0 bg-orange-500/80 hover:bg-orange-500 transition-colors duration-300"
                          style={{ clipPath: BTN_CLIP }}
                        />
                        <div
                          className="relative m-[1px] px-3 py-1.5 transition-all duration-300"
                          style={{ clipPath: BTN_CLIP }}
                        >
                          <Upload size={14} className="text-white" />
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleProjectImageUpload(idx, file);
                          }}
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...projectDetailItems];
                        next.splice(idx, 1);
                        setProjectDetailItems(next);
                      }}
                      className="text-[11px] text-red-400 mt-1 md:col-span-2 text-right"
                    >
                      Remove Project
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setProjectDetailItems((prev) => [
                      ...prev,
                      {
                        title: '',
                        description: '',
                        stack: '',
                        github: '',
                        live: '',
                        image: '',
                        featured: false,
                      },
                    ])
                  }
                  className="text-[11px] text-orange-400 underline"
                >
                  + Add Project
                </button>
              </div>
            </div>

            {/* Certifications and Education remain text areas above, already wired to form */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={form.linkedin_url}
                  onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-mono focus:outline-none focus:border-orange-500/60"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                  GitHub
                </label>
                <input
                  type="url"
                  value={form.github_url}
                  onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-mono focus:outline-none focus:border-orange-500/60"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                  Twitter
                </label>
                <input
                  type="url"
                  value={form.twitter_url}
                  onChange={(e) => setForm({ ...form, twitter_url: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-mono focus:outline-none focus:border-orange-500/60"
                />
              </div>
            </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="relative inline-flex items-center justify-center group cursor-pointer disabled:opacity-60"
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
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </span>
              </div>
            </button>
          </div>
        </form>
        )}
      </div>
    </section>
  );
}


