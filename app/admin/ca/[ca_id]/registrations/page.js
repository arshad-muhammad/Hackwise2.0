'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Users, ArrowLeft, Download, X, Mail, Phone, MapPin, Building, GraduationCap, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function CARegistrationsPage() {
  const params = useParams();
  const caId = params.ca_id;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReg, setSelectedReg] = useState(null);
  const [regDetails, setRegDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (caId) {
      fetchRegistrations();
    }
  }, [caId]);

  const fetchRegistrations = async () => {
    try {
      const res = await fetch(`/api/admin/ca/${caId}/registrations`);
      const data = await res.json();
      setData(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch registrations', error);
      setLoading(false);
    }
  };

  const fetchRegistrationDetails = async (regId) => {
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/admin/ca/${caId}/registrations/${regId}`);
      const data = await res.json();
      setRegDetails(data);
    } catch (error) {
      console.error('Failed to fetch registration details', error);
      alert('Failed to load registration details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleExport = () => {
    window.location.href = `/api/admin/ca/${caId}/registrations/export`;
  };

  const handleRegClick = (regId) => {
    setSelectedReg(regId);
    fetchRegistrationDetails(regId);
  };

  const cardClipPath = "polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)";

  if (loading) {
    return (
      <div className="text-center text-white/60 font-mono py-12">Loading registrations...</div>
    );
  }

  if (!data || !data.ca) {
    return (
      <div className="text-center text-white/60 font-mono py-12">CA not found</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/ca"
            className="p-2 hover:bg-white/10 rounded transition-colors"
          >
            <ArrowLeft size={20} className="text-white/60" />
          </Link>
          <div>
            <h1 className="text-3xl font-hackwise text-white uppercase tracking-wider">
              Registrations: {data.ca.name}
            </h1>
            <p className="text-white/60 font-mono text-sm mt-1">
              CA Code: {data.ca.ca_code} • Total: {data.total}
            </p>
          </div>
        </div>
        {data.registrations.length > 0 && (
          <button
            onClick={handleExport}
            className="px-6 py-3 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-colors font-mono text-sm uppercase flex items-center gap-2"
            style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
          >
            <Download size={18} />
            Export CSV
          </button>
        )}
      </div>

      {data.registrations.length === 0 ? (
        <div className="text-center text-white/60 font-mono py-12">
          No registrations found for this CA yet.
        </div>
      ) : (
        <div className="space-y-4">
          {data.registrations.map((reg) => (
            <div
              key={reg.id}
              className="relative group cursor-pointer"
              onClick={() => handleRegClick(reg.id)}
            >
              <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-px" style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}>
                <div
                  className="absolute inset-0 bg-white/20 group-hover:bg-blue-500/50 transition-colors duration-300"
                  style={{ clipPath: cardClipPath }}
                />
                <div className="relative bg-[#0A090F] p-6" style={{ clipPath: cardClipPath }}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-hackwise text-white uppercase mb-2">{reg.team_name}</h3>
                      <div className="flex gap-4 text-sm text-white/60 font-sans">
                        <span>Members: {reg.member_count}</span>
                        <span>•</span>
                        <span>{new Date(reg.registration_date).toLocaleString()}</span>
                      </div>
                      {reg.member_names && (
                        <p className="text-xs text-white/50 font-sans mt-2">
                          {reg.member_names}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-xs font-bold ${
                        reg.is_verified
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}
                    >
                      {reg.is_verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 font-mono mt-3">Click to view details</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Registration Details Modal */}
      {selectedReg && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0A090F] border border-white/10 p-8 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl my-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-hackwise text-white uppercase">
                Registration Details
              </h2>
              <button
                onClick={() => {
                  setSelectedReg(null);
                  setRegDetails(null);
                }}
                className="p-2 hover:bg-white/10 rounded transition-colors"
              >
                <X size={24} className="text-white/60" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="text-center text-white/60 font-mono py-12">Loading details...</div>
            ) : regDetails ? (
              <div className="space-y-6">
                {/* Team Info */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                  <h3 className="text-lg font-hackwise text-white uppercase mb-4 flex items-center gap-2">
                    <Users size={20} className="text-orange-500" />
                    Team Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-white/60 font-mono">Team Name:</span>
                      <p className="text-white font-sans font-semibold">{regDetails.registration.team_name}</p>
                    </div>
                    <div>
                      <span className="text-white/60 font-mono">Registration Date:</span>
                      <p className="text-white font-sans">
                        {new Date(regDetails.registration.registration_date).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-white/60 font-mono">CA Code:</span>
                      <p className="text-white font-sans">{regDetails.registration.ca_code || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-white/60 font-mono">Status:</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          regDetails.registration.is_verified
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}
                      >
                        {regDetails.registration.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                <div>
                  <h3 className="text-lg font-hackwise text-white uppercase mb-4 flex items-center gap-2">
                    <Users size={20} className="text-blue-500" />
                    Team Members ({regDetails.members.length})
                  </h3>
                  <div className="space-y-4">
                    {regDetails.members.map((member, index) => (
                      <div
                        key={member.id}
                        className="bg-white/5 border border-white/10 p-6 rounded-lg"
                        style={{ clipPath: cardClipPath }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-hackwise text-white uppercase">
                              {member.first_name} {member.last_name || ''}
                              {member.is_team_lead && (
                                <span className="ml-2 text-orange-500 text-sm">(Team Lead)</span>
                              )}
                            </h4>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail size={16} className="text-white/40" />
                            <div>
                              <span className="text-white/60 font-mono text-xs">Email:</span>
                              <p className="text-white font-sans">{member.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={16} className="text-white/40" />
                            <div>
                              <span className="text-white/60 font-mono text-xs">Mobile:</span>
                              <p className="text-white font-sans">{member.mobile}</p>
                            </div>
                          </div>
                          {member.location && (
                            <div className="flex items-center gap-2">
                              <MapPin size={16} className="text-white/40" />
                              <div>
                                <span className="text-white/60 font-mono text-xs">Location:</span>
                                <p className="text-white font-sans">{member.location}</p>
                              </div>
                            </div>
                          )}
                          {member.gender && (
                            <div>
                              <span className="text-white/60 font-mono text-xs">Gender:</span>
                              <p className="text-white font-sans">{member.gender}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Building size={16} className="text-white/40" />
                            <div>
                              <span className="text-white/60 font-mono text-xs">Institute:</span>
                              <p className="text-white font-sans">{member.institute_name}</p>
                            </div>
                          </div>
                          {member.user_type && (
                            <div>
                              <span className="text-white/60 font-mono text-xs">Type:</span>
                              <p className="text-white font-sans">{member.user_type}</p>
                            </div>
                          )}
                          {member.domain && (
                            <div>
                              <span className="text-white/60 font-mono text-xs">Domain:</span>
                              <p className="text-white font-sans">{member.domain}</p>
                            </div>
                          )}
                          {member.course && (
                            <div>
                              <span className="text-white/60 font-mono text-xs">Course:</span>
                              <p className="text-white font-sans">{member.course}</p>
                            </div>
                          )}
                          {member.course_specialization && (
                            <div>
                              <span className="text-white/60 font-mono text-xs">Specialization:</span>
                              <p className="text-white font-sans">{member.course_specialization}</p>
                            </div>
                          )}
                          {member.graduating_year && (
                            <div>
                              <span className="text-white/60 font-mono text-xs">Graduating Year:</span>
                              <p className="text-white font-sans">{member.graduating_year}</p>
                            </div>
                          )}
                          {member.course_duration && (
                            <div>
                              <span className="text-white/60 font-mono text-xs">Duration:</span>
                              <p className="text-white font-sans">{member.course_duration}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-white/60 font-mono py-12">Failed to load details</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

