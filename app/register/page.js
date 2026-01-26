'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DecryptedText from '../components/DecryptedText';

function RegistrationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caCode = searchParams.get('ca') || '';
  
  const [teamData, setTeamData] = useState({
    team_name: '',
    ca_code: caCode.toUpperCase(),
    members: [
      {
        first_name: '',
        last_name: '',
        email: '',
        mobile: '',
        gender: '',
        location: '',
        institute_name: '',
        user_type: '',
        domain: '',
        course: '',
        course_specialization: '',
        graduating_year: '',
        course_duration: '',
        is_team_lead: true,
      },
    ],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addMember = () => {
    if (teamData.members.length >= 4) {
      setError('Maximum 4 team members allowed');
      return;
    }
    setTeamData({
      ...teamData,
      members: [
        ...teamData.members,
        {
          first_name: '',
          last_name: '',
          email: '',
          mobile: '',
          gender: '',
          location: '',
          institute_name: '',
          user_type: '',
          domain: '',
          course: '',
          course_specialization: '',
          graduating_year: '',
          course_duration: '',
          is_team_lead: false,
        },
      ],
    });
    setError('');
  };

  const removeMember = (index) => {
    if (teamData.members.length <= 2) {
      setError('Minimum 2 team members required');
      return;
    }
    const newMembers = teamData.members.filter((_, i) => i !== index);
    // Ensure at least one team lead
    if (!newMembers.some(m => m.is_team_lead)) {
      newMembers[0].is_team_lead = true;
    }
    setTeamData({ ...teamData, members: newMembers });
    setError('');
  };

  const updateMember = (index, field, value) => {
    const newMembers = [...teamData.members];
    newMembers[index][field] = value;
    setTeamData({ ...teamData, members: newMembers });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validation
    if (!teamData.team_name) {
      setError('Team name is required');
      setIsSubmitting(false);
      return;
    }

    if (teamData.members.length < 2) {
      setError('Minimum 2 team members required');
      setIsSubmitting(false);
      return;
    }

    if (teamData.members.length > 4) {
      setError('Maximum 4 team members allowed');
      setIsSubmitting(false);
      return;
    }

    // Validate all members
    for (let i = 0; i < teamData.members.length; i++) {
      const member = teamData.members[i];
      if (!member.first_name || !member.email || !member.mobile || !member.institute_name) {
        setError(`Please fill all required fields for team member ${i + 1}`);
        setIsSubmitting(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(member.email)) {
        setError(`Invalid email for team member ${i + 1}`);
        setIsSubmitting(false);
        return;
      }

      // Mobile validation
      const cleanMobile = member.mobile.replace(/\D/g, '');
      if (cleanMobile.length !== 10) {
        setError(`Invalid mobile number for team member ${i + 1}`);
        setIsSubmitting(false);
        return;
      }
    }

    // Ensure at least one team lead
    if (!teamData.members.some(m => m.is_team_lead)) {
      setError('Please select a team lead');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/register/success?team=${encodeURIComponent(teamData.team_name)}`);
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardClipPath = "polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)";
  const btnClipPath = "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)";

  return (
    <section className="section-container border-t border-white/10 pb-32">
      <div className="max-w-5xl mx-auto">
        <div className="w-full flex justify-center mb-12">
          <div className="inline-block border border-white/20 bg-[#0A090F] px-8 py-4">
            <h1 className="text-3xl md:text-5xl font-hackwise text-white uppercase tracking-wider text-center">
              Hackwise 2.0 Registration
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-red-500/10 border-l-4 border-red-500 text-red-500 text-sm font-mono">
              {error}
            </div>
          )}

          {/* Team Details */}
          <div className="relative group">
            <div className="absolute inset-0 bg-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative p-px" style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}>
              <div
                className="absolute inset-0 bg-white/20 group-hover:bg-orange-500/50 transition-colors duration-300"
                style={{ clipPath: cardClipPath }}
              />
              <div className="relative bg-[#0A090F] p-8 md:p-12" style={{ clipPath: cardClipPath }}>
                <h2 className="text-2xl font-hackwise text-white uppercase mb-6">Team Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-mono text-orange-500/80 mb-2 uppercase tracking-wide">
                      Team Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={teamData.team_name}
                      onChange={(e) => setTeamData({ ...teamData, team_name: e.target.value })}
                      required
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white font-sans focus:outline-none focus:border-orange-500/50 transition-colors"
                      placeholder="Enter your team name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-mono text-orange-500/80 mb-2 uppercase tracking-wide">
                      CA Code (if referred by Campus Ambassador)
                    </label>
                    <input
  type="text"
  value={teamData.ca_code}
  readOnly={!!caCode}
  onChange={(e) =>
    setTeamData({
      ...teamData,
      ca_code: e.target.value.toUpperCase().trim(),
    })
  }
  className={`w-full bg-white/5 border border-white/10 px-4 py-3 text-white font-mono uppercase focus:outline-none focus:border-orange-500/50 transition-colors
    ${caCode ? 'opacity-70 cursor-not-allowed' : ''}`}
  placeholder="KVGCE001"
/>

                    <p className="text-xs text-white/50 mt-1">Leave blank if not referred by a CA</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Members */}
          {teamData.members.map((member, index) => (
            <div key={index} className="relative group">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-px" style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}>
                <div
                  className="absolute inset-0 bg-white/20 group-hover:bg-blue-500/50 transition-colors duration-300"
                  style={{ clipPath: cardClipPath }}
                />
                <div className="relative bg-[#0A090F] p-8 md:p-12" style={{ clipPath: cardClipPath }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-hackwise text-white uppercase">
                      Team Member {index + 1} {member.is_team_lead && <span className="text-orange-500">(Team Lead)</span>}
                    </h2>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeMember(index)}
                        className="text-red-400 hover:text-red-300 text-sm font-mono"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Basic Details */}
                    <div>
                      <h3 className="text-sm font-mono text-orange-500/80 mb-4 uppercase tracking-wide border-b border-white/10 pb-2">
                        Basic Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-mono text-white/60 mb-1">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={member.first_name}
                            onChange={(e) => updateMember(index, 'first_name', e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-sans focus:outline-none focus:border-orange-500/50 transition-colors text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono text-white/60 mb-1">
                            Last Name
                          </label>
                          <input
                            type="text"
                            value={member.last_name}
                            onChange={(e) => updateMember(index, 'last_name', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-sans focus:outline-none focus:border-orange-500/50 transition-colors text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono text-white/60 mb-1">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={member.email}
                            onChange={(e) => updateMember(index, 'email', e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-sans focus:outline-none focus:border-orange-500/50 transition-colors text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono text-white/60 mb-1">
                            Mobile <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={member.mobile}
                            onChange={(e) => updateMember(index, 'mobile', e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-sans focus:outline-none focus:border-orange-500/50 transition-colors text-sm"
                            placeholder="10-digit number"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono text-white/60 mb-1">
                            Gender
                          </label>
                          <select
                            value={member.gender}
                            onChange={(e) => updateMember(index, 'gender', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-sans focus:outline-none focus:border-orange-500/50 transition-colors text-sm"
                          >
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-mono text-white/60 mb-1">
                            Location
                          </label>
                          <input
                            type="text"
                            value={member.location}
                            onChange={(e) => updateMember(index, 'location', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-sans focus:outline-none focus:border-orange-500/50 transition-colors text-sm"
                            placeholder="City, State, Country"
                          />
                        </div>
                      </div>
                    </div>

                    {/* User Details */}
                    <div>
                      <h3 className="text-sm font-mono text-orange-500/80 mb-4 uppercase tracking-wide border-b border-white/10 pb-2">
                        User Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-mono text-white/60 mb-1">
                            Institute Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={member.institute_name}
                            onChange={(e) => updateMember(index, 'institute_name', e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-sans focus:outline-none focus:border-orange-500/50 transition-colors text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono text-white/60 mb-1">
                            Type
                          </label>
                          <select
                            value={member.user_type}
                            onChange={(e) => updateMember(index, 'user_type', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-sans focus:outline-none focus:border-orange-500/50 transition-colors text-sm"
                          >
                            <option value="">Select</option>
                            <option value="Student">Student</option>
                            <option value="Professional">Professional</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-mono text-white/60 mb-1">
                            Domain
                          </label>
                          <select
                            value={member.domain}
                            onChange={(e) => updateMember(index, 'domain', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-sans focus:outline-none focus:border-orange-500/50 transition-colors text-sm"
                          >
                            <option value="">Select</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Science">Science</option>
                            <option value="Commerce">Commerce</option>
                            <option value="Arts">Arts</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-mono text-white/60 mb-1">
                            Course
                          </label>
                          <select
                            value={member.course}
                            onChange={(e) => updateMember(index, 'course', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-sans focus:outline-none focus:border-orange-500/50 transition-colors text-sm"
                          >
                            <option value="">Select</option>
                            <option value="B.Tech/BE">B.Tech/BE (Bachelor of Technology / Bachelor of Engineering)</option>
                            <option value="M.Tech/ME">M.Tech/ME (Master of Technology / Master of Engineering)</option>
                            <option value="BCA">BCA (Bachelor of Computer Applications)</option>
                            <option value="MCA">MCA (Master of Computer Applications)</option>
                            <option value="B.Sc">B.Sc (Bachelor of Science)</option>
                            <option value="M.Sc">M.Sc (Master of Science)</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-mono text-white/60 mb-1">
                            Course Specialization
                          </label>
                          <input
                            type="text"
                            value={member.course_specialization}
                            onChange={(e) => updateMember(index, 'course_specialization', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-sans focus:outline-none focus:border-orange-500/50 transition-colors text-sm"
                            placeholder="e.g., Computer Science and Engineering"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono text-white/60 mb-1">
                            Graduating Year
                          </label>
                          <input
                            type="text"
                            value={member.graduating_year}
                            onChange={(e) => updateMember(index, 'graduating_year', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-sans focus:outline-none focus:border-orange-500/50 transition-colors text-sm"
                            placeholder="e.g., 2026"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono text-white/60 mb-1">
                            Course Duration
                          </label>
                          <input
                            type="text"
                            value={member.course_duration}
                            onChange={(e) => updateMember(index, 'course_duration', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-sans focus:outline-none focus:border-orange-500/50 transition-colors text-sm"
                            placeholder="e.g., 4 years"
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-4">
                          <input
                            type="checkbox"
                            id={`team_lead_${index}`}
                            checked={member.is_team_lead}
                            onChange={(e) => {
                              const newMembers = [...teamData.members];
                              // Only one team lead allowed
                              if (e.target.checked) {
                                newMembers.forEach((m, i) => {
                                  m.is_team_lead = i === index;
                                });
                              } else {
                                newMembers[index].is_team_lead = false;
                              }
                              setTeamData({ ...teamData, members: newMembers });
                            }}
                            className="w-4 h-4 text-orange-500 bg-white/5 border-white/10 focus:ring-orange-500"
                          />
                          <label htmlFor={`team_lead_${index}`} className="text-sm text-white/80 font-sans">
                            Team Lead
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add Member Button */}
          {teamData.members.length < 4 && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={addMember}
                className="relative px-8 py-3 bg-white/10 text-white font-mono font-bold hover:bg-white/20 transition-colors uppercase"
                style={{ clipPath: btnClipPath }}
              >
                + Add Team Member
              </button>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="relative w-full block group cursor-pointer"
            >
              <div
                className="absolute inset-0 bg-orange-500/50 group-hover:bg-orange-500 transition-colors duration-300"
                style={{ clipPath: btnClipPath }}
              />
              <div
                className="relative bg-[#0A090F] m-[1px] py-4 text-center transition-all duration-300"
                style={{ clipPath: btnClipPath }}
              >
                <div className="absolute inset-0 bg-white/5 group-hover:bg-orange-500/10 transition-colors duration-300" />
                <span className="relative text-white font-sans font-bold text-lg uppercase tracking-wide">
                  {isSubmitting ? 'Registering...' : 'Register Team'}
                </span>
              </div>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default function RegistrationPage() {
  return (
    <Suspense fallback={
      <section className="section-container border-t border-white/10 pb-32">
        <div className="text-center text-white/60 font-mono">Loading...</div>
      </section>
    }>
      <RegistrationForm />
    </Suspense>
  );
}

