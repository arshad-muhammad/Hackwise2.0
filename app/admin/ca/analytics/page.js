'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  Award,
  Download,
  Trophy,
  BarChart3,
  Calendar,
  Building,
} from 'lucide-react';

export default function CAAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaderboardVisible, setLeaderboardVisible] = useState(true);
  const [registrationClosed, setRegistrationClosed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/ca/settings');
      const settings = await res.json();
      setLeaderboardVisible(settings.ca_leaderboard_visible);
      setRegistrationClosed(settings.ca_registration_closed || false);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleToggleLeaderboard = async (value) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/ca/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ca_leaderboard_visible: value }),
      });

      if (res.ok) {
        setLeaderboardVisible(value);
        alert(`Leaderboard ${value ? 'enabled' : 'disabled'} for CA dashboard`);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update setting');
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      alert('Error updating setting');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRegistration = async (value) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/ca/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ca_registration_closed: value }),
      });

      if (res.ok) {
        setRegistrationClosed(value);
        alert(`Registration ${value ? 'closed' : 'opened'} for CA applications`);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update setting');
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      alert('Error updating setting');
    } finally {
      setSaving(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/ca/analytics');
      const data = await res.json();
      setData(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics', error);
      setLoading(false);
    }
  };

  const handleExport = () => {
    window.location.href = '/api/admin/ca/analytics/export';
  };

  const cardClipPath = "polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)";
  const btnClipPath = "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)";

  if (loading) {
    return (
      <div className="text-center text-white/60 font-mono py-12">Loading analytics...</div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-white/60 font-mono py-12">Failed to load analytics</div>
    );
  }

  const { leaderboard, registrationsByCA, totalStats, registrationsOverTime, topPerformers } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-hackwise text-white uppercase tracking-wider">
            CA Analytics
          </h1>
          <p className="text-white/60 font-mono text-sm mt-2">
            Comprehensive analytics for Campus Ambassadors
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-6 py-3 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-colors font-mono text-sm uppercase flex items-center gap-2"
          style={{ clipPath: btnClipPath }}
        >
          <Download size={18} />
          Export All Registrations
        </button>
      </div>

      {/* Leaderboard Visibility Toggle */}
      <div className="relative group">
        <div className="absolute inset-0 bg-orange-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative p-px" style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}>
          <div
            className="absolute inset-0 bg-white/20 group-hover:bg-orange-500/50 transition-colors duration-300"
            style={{ clipPath: cardClipPath }}
          />
          <div className="relative bg-[#0A090F] p-6" style={{ clipPath: cardClipPath }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-hackwise text-white uppercase mb-2">
                  Leaderboard Visibility
                </h3>
                <p className="text-white/60 font-mono text-sm">
                  Control whether the leaderboard tab is visible in CA dashboard
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-mono text-sm ${leaderboardVisible ? 'text-green-400' : 'text-red-400'}`}>
                  {leaderboardVisible ? 'Visible' : 'Hidden'}
                </span>
                <button
                  onClick={() => handleToggleLeaderboard(!leaderboardVisible)}
                  disabled={saving}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                    leaderboardVisible ? 'bg-green-500' : 'bg-gray-600'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      leaderboardVisible ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Status Toggle */}
      <div className="relative group">
        <div className="absolute inset-0 bg-orange-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative p-px" style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}>
          <div
            className="absolute inset-0 bg-white/20 group-hover:bg-orange-500/50 transition-colors duration-300"
            style={{ clipPath: cardClipPath }}
          />
          <div className="relative bg-[#0A090F] p-6" style={{ clipPath: cardClipPath }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-hackwise text-white uppercase mb-2">
                  Registration Status
                </h3>
                <p className="text-white/60 font-mono text-sm">
                  {registrationClosed 
                    ? 'Registration is currently CLOSED - shows "Registration Closed" button'
                    : 'Registration is currently OPEN - shows "Apply Now" button'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-mono text-sm ${registrationClosed ? 'text-red-400' : 'text-green-400'}`}>
                  {registrationClosed ? 'Closed' : 'Open'}
                </span>
                <button
                  onClick={() => handleToggleRegistration(!registrationClosed)}
                  disabled={saving}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                    registrationClosed ? 'bg-red-500' : 'bg-green-500'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      registrationClosed ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Registrations"
          value={totalStats.total_registrations || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          label="Total Participants"
          value={totalStats.total_participants || 0}
          icon={Users}
          color="green"
        />
        <StatCard
          label="Active CAs"
          value={totalStats.total_active_cas || 0}
          icon={Award}
          color="orange"
        />
        <StatCard
          label="Verified Registrations"
          value={totalStats.verified_registrations || 0}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Top Performers */}
      <div className="relative group">
        <div className="absolute inset-0 bg-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative p-px" style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}>
          <div
            className="absolute inset-0 bg-white/20 group-hover:bg-orange-500/50 transition-colors duration-300"
            style={{ clipPath: cardClipPath }}
          />
          <div className="relative bg-[#0A090F] p-8" style={{ clipPath: cardClipPath }}>
            <h2 className="text-2xl font-hackwise text-white uppercase mb-6 flex items-center gap-2">
              <Trophy size={28} className="text-yellow-500" />
              Top 10 Performers
            </h2>
            <div className="space-y-3">
              {topPerformers.length === 0 ? (
                <p className="text-white/60 font-mono text-center py-8">No data available</p>
              ) : (
                topPerformers.map((ca, index) => (
                  <div
                    key={ca.id}
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center font-bold text-lg">
                        {index === 0 ? (
                          <Trophy className="text-yellow-500" size={24} />
                        ) : index === 1 ? (
                          <Trophy className="text-gray-400" size={24} />
                        ) : index === 2 ? (
                          <Trophy className="text-orange-600" size={24} />
                        ) : (
                          <span className="text-white/40 font-mono">#{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-hackwise uppercase">
                          {ca.name}
                          {ca.is_organising_team_candidate && (
                            <span className="ml-2 text-xs text-green-400">(OT Candidate)</span>
                          )}
                        </h3>
                        <p className="text-white/60 font-mono text-sm">{ca.ca_code} • {ca.college}</p>
                      </div>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <div className="text-center">
                        <div className="text-orange-500 font-bold text-lg">{ca.performance_score || 0}</div>
                        <div className="text-white/60 text-xs">Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-blue-400 font-bold text-lg">{ca.verified_registrations || 0}</div>
                        <div className="text-white/60 text-xs">Regs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-400 font-bold text-lg">{ca.approved_tasks || 0}</div>
                        <div className="text-white/60 text-xs">Tasks</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Registrations by CA */}
      <div className="relative group">
        <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative p-px" style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}>
          <div
            className="absolute inset-0 bg-white/20 group-hover:bg-blue-500/50 transition-colors duration-300"
            style={{ clipPath: cardClipPath }}
          />
          <div className="relative bg-[#0A090F] p-8" style={{ clipPath: cardClipPath }}>
            <h2 className="text-2xl font-hackwise text-white uppercase mb-6 flex items-center gap-2">
              <BarChart3 size={28} className="text-blue-500" />
              Registrations by CA
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 font-mono text-sm text-white/60 uppercase">Rank</th>
                    <th className="text-left p-4 font-mono text-sm text-white/60 uppercase">CA Name</th>
                    <th className="text-left p-4 font-mono text-sm text-white/60 uppercase">CA Code</th>
                    <th className="text-center p-4 font-mono text-sm text-white/60 uppercase">Registrations</th>
                    <th className="text-center p-4 font-mono text-sm text-white/60 uppercase">Participants</th>
                    <th className="text-left p-4 font-mono text-sm text-white/60 uppercase">First Reg</th>
                    <th className="text-left p-4 font-mono text-sm text-white/60 uppercase">Last Reg</th>
                  </tr>
                </thead>
                <tbody>
                  {registrationsByCA.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-white/60 font-mono">
                        No registrations found
                      </td>
                    </tr>
                  ) : (
                    registrationsByCA.map((ca, index) => (
                      <tr
                        key={ca.ca_id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="p-4 font-mono text-white/60">#{index + 1}</td>
                        <td className="p-4 font-hackwise text-white uppercase">{ca.ca_name}</td>
                        <td className="p-4 font-mono text-orange-500">{ca.ca_code}</td>
                        <td className="p-4 text-center font-mono text-white">{ca.total_registrations}</td>
                        <td className="p-4 text-center font-mono text-white">{ca.total_members}</td>
                        <td className="p-4 font-mono text-white/60 text-sm">
                          {ca.first_registration
                            ? new Date(ca.first_registration).toLocaleDateString()
                            : 'N/A'}
                        </td>
                        <td className="p-4 font-mono text-white/60 text-sm">
                          {ca.last_registration
                            ? new Date(ca.last_registration).toLocaleDateString()
                            : 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Full Leaderboard */}
      <div className="relative group">
        <div className="absolute inset-0 bg-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative p-px" style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}>
          <div
            className="absolute inset-0 bg-white/20 group-hover:bg-purple-500/50 transition-colors duration-300"
            style={{ clipPath: cardClipPath }}
          />
          <div className="relative bg-[#0A090F] p-8" style={{ clipPath: cardClipPath }}>
            <h2 className="text-2xl font-hackwise text-white uppercase mb-6 flex items-center gap-2">
              <Award size={28} className="text-purple-500" />
              Complete Leaderboard
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 font-mono text-sm text-white/60 uppercase">Rank</th>
                    <th className="text-left p-4 font-mono text-sm text-white/60 uppercase">CA Name</th>
                    <th className="text-left p-4 font-mono text-sm text-white/60 uppercase">CA Code</th>
                    <th className="text-left p-4 font-mono text-sm text-white/60 uppercase">College</th>
                    <th className="text-center p-4 font-mono text-sm text-white/60 uppercase">Score</th>
                    <th className="text-center p-4 font-mono text-sm text-white/60 uppercase">Registrations</th>
                    <th className="text-center p-4 font-mono text-sm text-white/60 uppercase">Tasks</th>
                    <th className="text-center p-4 font-mono text-sm text-white/60 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-white/60 font-mono">
                        No CAs found
                      </td>
                    </tr>
                  ) : (
                    leaderboard.map((ca, index) => (
                      <tr
                        key={ca.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="p-4 font-mono text-white/60">#{index + 1}</td>
                        <td className="p-4 font-hackwise text-white uppercase">
                          {ca.name}
                          {ca.is_organising_team_candidate && (
                            <span className="ml-2 text-xs text-green-400">(OT)</span>
                          )}
                        </td>
                        <td className="p-4 font-mono text-orange-500">{ca.ca_code}</td>
                        <td className="p-4 font-sans text-white/80 text-sm">{ca.college}</td>
                        <td className="p-4 text-center font-mono text-orange-500 font-bold">
                          {ca.performance_score || 0}
                        </td>
                        <td className="p-4 text-center font-mono text-blue-400">
                          {ca.verified_registrations || 0}
                        </td>
                        <td className="p-4 text-center font-mono text-green-400">
                          {ca.approved_tasks || 0}
                        </td>
                        <td className="p-4 text-center">
                          {ca.is_organising_team_candidate ? (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold">
                              OT Candidate
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-white/10 text-white/60 border border-white/20 text-xs font-bold">
                              Active
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Registrations Over Time Chart */}
      {registrationsOverTime.length > 0 && (
        <div className="relative group">
          <div className="absolute inset-0 bg-green-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative p-px" style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}>
            <div
              className="absolute inset-0 bg-white/20 group-hover:bg-green-500/50 transition-colors duration-300"
              style={{ clipPath: cardClipPath }}
            />
            <div className="relative bg-[#0A090F] p-8" style={{ clipPath: cardClipPath }}>
              <h2 className="text-2xl font-hackwise text-white uppercase mb-6 flex items-center gap-2">
                <Calendar size={28} className="text-green-500" />
                Registrations Over Time (Last 30 Days)
              </h2>
              <div className="space-y-2">
                {registrationsOverTime.map((item, index) => {
                  const maxCount = Math.max(...registrationsOverTime.map(i => i.count));
                  const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-24 font-mono text-sm text-white/60">
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                      <div className="flex-1 bg-white/5 rounded-full h-6 relative overflow-hidden">
                        <div
                          className="bg-green-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-white">
                          {item.count} {item.count === 1 ? 'registration' : 'registrations'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    green: 'text-green-500 bg-green-500/10 border-green-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  };

  return (
    <div className={`p-6 border rounded-lg ${colors[color]} backdrop-blur-sm transition-transform hover:scale-[1.02]`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-mono uppercase tracking-wider opacity-80 mb-1">{label}</p>
          <h3 className="text-3xl font-mono font-bold">{value.toLocaleString()}</h3>
        </div>
        <div className="text-2xl">
          <Icon />
        </div>
      </div>
    </div>
  );
}

