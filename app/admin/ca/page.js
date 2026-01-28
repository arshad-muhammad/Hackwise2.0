'use client';
import { useState, useEffect } from 'react';
import { 
  Search, 
  Check, 
  X,
  Copy,
  ExternalLink,
  Mail,
  Phone,
  Building,
  Award,
  TrendingUp,
  UserCheck,
  UserX,
  Users
} from 'lucide-react';

export default function CAAdminPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [pointsAdjustment, setPointsAdjustment] = useState({ points: '', reason: '' });
  const [adjustingPoints, setAdjustingPoints] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, search]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') {
        params.append('status', statusFilter);
      }
      if (search) {
        params.append('search', search);
      }

      const res = await fetch(`/api/admin/ca?${params.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      setApplications(data);
    } catch (error) {
      console.error('Failed to fetch CA applications', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!confirm('Approve this Campus Ambassador application?')) return;

    setProcessing(true);
    try {
      const res = await fetch('/api/admin/ca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action: 'approve',
          admin_notes: adminNotes,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Application approved! CA Code: ${data.ca_code}\nReferral Link: ${data.referral_link}`);
        setSelectedApp(null);
        setAdminNotes('');
        setPointsAdjustment({ points: '', reason: '' });
        fetchApplications();
      } else {
        alert(data.error || 'Failed to approve application');
      }
    } catch (error) {
      console.error('Failed to approve application', error);
      alert('Error approving application');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Reject this Campus Ambassador application?')) return;

    setProcessing(true);
    try {
      const res = await fetch('/api/admin/ca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action: 'reject',
          admin_notes: adminNotes,
        }),
      });

      if (res.ok) {
        alert('Application rejected');
        setSelectedApp(null);
        setAdminNotes('');
        setPointsAdjustment({ points: '', reason: '' });
        fetchApplications();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to reject application');
      }
    } catch (error) {
      console.error('Failed to reject application', error);
      alert('Error rejecting application');
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleAdjustPoints = async () => {
    if (!selectedApp || !selectedApp.id) return;

    const points = parseInt(pointsAdjustment.points, 10);
    if (isNaN(points) || points === 0) {
      alert('Please enter a valid number of points to adjust');
      return;
    }

    if (!pointsAdjustment.reason || pointsAdjustment.reason.trim().length === 0) {
      alert('Please provide a reason for the adjustment');
      return;
    }

    if (!confirm(`Adjust points by ${points > 0 ? '+' : ''}${points}? Current score: ${selectedApp.performance_score || 0}`)) {
      return;
    }

    setAdjustingPoints(true);
    try {
      const res = await fetch(`/api/admin/ca/${selectedApp.id}/points`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          points,
          reason: pointsAdjustment.reason.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Points adjusted successfully!\nPrevious: ${data.previous_score}\nAdjustment: ${data.points_adjusted > 0 ? '+' : ''}${data.points_adjusted}\nNew Score: ${data.new_score}`);
        
        // Update selectedApp with new score
        setSelectedApp({
          ...selectedApp,
          performance_score: data.new_score,
        });
        
        // Refresh applications list
        fetchApplications();
        
        // Reset form
        setPointsAdjustment({ points: '', reason: '' });
      } else {
        alert(data.error || 'Failed to adjust points');
      }
    } catch (error) {
      console.error('Failed to adjust points', error);
      alert('Error adjusting points');
    } finally {
      setAdjustingPoints(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      APPROVED: 'bg-green-500/20 text-green-400 border-green-500/30',
      REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return badges[status] || 'bg-white/10 text-white/60 border-white/20';
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'PENDING').length,
    approved: applications.filter(a => a.status === 'APPROVED').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold uppercase tracking-tight text-white">
          Campus Ambassador <span className="text-orange-500">Management</span>
        </h1>
        <p className="text-white/60 mt-2 font-mono text-sm">Review and manage CA applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Applications" value={stats.total} icon={UserCheck} color="blue" />
        <StatCard label="Pending" value={stats.pending} icon={TrendingUp} color="yellow" />
        <StatCard label="Approved" value={stats.approved} icon={Award} color="green" />
        <StatCard label="Rejected" value={stats.rejected} icon={UserX} color="red" />
      </div>

      {/* Filters */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="p-4 border-b border-white/10 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2 flex-1 w-full">
            <Search className="text-orange-500" size={20} />
            <input
              type="text"
              placeholder="SEARCH BY NAME, EMAIL, COLLEGE, OR CA CODE..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none focus:outline-none flex-1 text-white font-mono placeholder:text-white/20"
            />
          </div>
          <div className="flex gap-2">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 font-mono text-sm uppercase transition-colors ${
                  statusFilter === status
                    ? 'bg-orange-500 text-black font-bold'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
                style={{
                  clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)',
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Applications Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-white/40 font-mono text-sm uppercase tracking-wider">
              <tr>
                <th className="p-4 font-normal">Name</th>
                <th className="p-4 font-normal">Contact</th>
                <th className="p-4 font-normal">College</th>
                <th className="p-4 font-normal">Status</th>
                <th className="p-4 font-normal">CA Code</th>
                <th className="p-4 font-normal">Performance</th>
                <th className="p-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 font-mono text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-white/40">
                    LOADING APPLICATIONS...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-white/40">
                    NO APPLICATIONS FOUND
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-white/5 transition-colors group cursor-pointer"
                    onClick={() => {
                      setSelectedApp(app);
                      setAdminNotes(app.admin_notes || '');
                      setPointsAdjustment({ points: '', reason: '' });
                    }}
                  >
                    <td className="p-4">
                      <div className="font-bold text-white">{app.name}</div>
                      <div className="text-xs text-white/40 mt-1">
                        {app.branch} • {app.year || 'N/A'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-1 text-white/80">
                          <Mail size={12} />
                          {app.email}
                        </div>
                        <div className="flex items-center gap-1 text-white/60">
                          <Phone size={12} />
                          {app.phone}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-white/80">
                        <Building size={14} />
                        <span>{app.college}</span>
                      </div>
                      {app.college_abbreviation && (
                        <div className="text-xs text-white/40 mt-1">
                          ({app.college_abbreviation})
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold border ${getStatusBadge(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {app.ca_code ? (
                        <div className="flex items-center gap-2">
                          <span className="text-orange-500 font-bold tracking-wider">
                            {app.ca_code}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(app.ca_code);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-white"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-white/20 italic">Not assigned</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-xs">
                        <div className="text-white/80">
                          Score: <span className="text-orange-500 font-bold">{app.performance_score || 0}</span>
                        </div>
                        <div className="text-white/60 mt-1">
                          {app.verified_registrations || 0} regs • {app.approved_tasks || 0} tasks
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {app.status === 'PENDING' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedApp(app);
                                setAdminNotes(app.admin_notes || '');
                                setPointsAdjustment({ points: '', reason: '' });
                              }}
                              className="p-2 hover:bg-green-500/10 rounded text-green-400 hover:text-green-300 transition-colors"
                              title="Review"
                            >
                              <Check size={18} />
                            </button>
                          </>
                        )}
                        {app.referral_link && (
                          <a
                            href={app.referral_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 hover:bg-blue-500/10 rounded text-blue-400 hover:text-blue-300 transition-colors"
                            title="View Referral Link"
                          >
                            <ExternalLink size={18} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A090F] border border-white/10 p-8 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-3xl font-display font-bold mb-6 text-white uppercase">
              Review Application: <span className="text-orange-500">{selectedApp.name}</span>
            </h2>

            <div className="space-y-6">
              {/* Application Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-white/40 uppercase mb-1 block">Name</label>
                  <div className="text-white font-mono">{selectedApp.name}</div>
                </div>
                <div>
                  <label className="text-xs font-mono text-white/40 uppercase mb-1 block">Email</label>
                  <div className="text-white font-mono">{selectedApp.email}</div>
                </div>
                <div>
                  <label className="text-xs font-mono text-white/40 uppercase mb-1 block">Phone</label>
                  <div className="text-white font-mono">{selectedApp.phone}</div>
                </div>
                <div>
                  <label className="text-xs font-mono text-white/40 uppercase mb-1 block">College</label>
                  <div className="text-white font-mono">{selectedApp.college}</div>
                  {selectedApp.college_abbreviation && (
                    <div className="text-xs text-white/60 mt-1">
                      Abbreviation: {selectedApp.college_abbreviation}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-mono text-white/40 uppercase mb-1 block">Branch</label>
                  <div className="text-white font-mono">{selectedApp.branch || 'N/A'}</div>
                </div>
                <div>
                  <label className="text-xs font-mono text-white/40 uppercase mb-1 block">Year</label>
                  <div className="text-white font-mono">{selectedApp.year || 'N/A'}</div>
                </div>
              </div>

              {/* Why Interested */}
              <div>
                <label className="text-xs font-mono text-white/40 uppercase mb-2 block">
                  Why Interested?
                </label>
                <div className="bg-white/5 border border-white/10 p-4 rounded text-white/80 font-sans text-sm">
                  {selectedApp.why_interested}
                </div>
              </div>

              {/* Previous Experience */}
              {selectedApp.previous_experience && (
                <div>
                  <label className="text-xs font-mono text-white/40 uppercase mb-2 block">
                    Previous Experience
                  </label>
                  <div className="bg-white/5 border border-white/10 p-4 rounded text-white/80 font-sans text-sm">
                    {selectedApp.previous_experience}
                  </div>
                </div>
              )}

              {/* Social Media Links */}
              {selectedApp.social_media_links && (
                <div>
                  <label className="text-xs font-mono text-white/40 uppercase mb-2 block">
                    Social Media Links
                  </label>
                  <div className="bg-white/5 border border-white/10 p-4 rounded text-sm space-y-1">
                    {JSON.parse(selectedApp.social_media_links || '{}') && Object.entries(
                      JSON.parse(selectedApp.social_media_links || '{}')
                    ).map(([platform, url]) => (
                      <div key={platform} className="text-white/80">
                        <span className="text-orange-500 capitalize">{platform}:</span>{' '}
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                          {url}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <label className="text-xs font-mono text-white/40 uppercase mb-2 block">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white font-mono focus:outline-none focus:border-orange-500 transition-colors resize-none"
                  placeholder="Add notes for this application..."
                />
              </div>

              {/* Current Status */}
              {selectedApp.ca_code && (
                <div className="bg-green-500/10 border border-green-500/30 p-4 rounded space-y-3">
                  <div className="text-green-400 font-mono text-sm">
                    <strong>CA Code:</strong> {selectedApp.ca_code}
                  </div>
                  {selectedApp.referral_link && (
                    <div className="text-white/80 font-mono text-sm">
                      <strong>Referral Link:</strong>{' '}
                      <a
                        href={selectedApp.referral_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {selectedApp.referral_link}
                      </a>
                      <button
                        onClick={() => copyToClipboard(selectedApp.referral_link)}
                        className="ml-2 text-white/60 hover:text-white"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  )}
                  {selectedApp.status === 'APPROVED' && (
                    <div className="pt-2">
                      <a
                        href={`/admin/ca/${selectedApp.id}/registrations`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors font-mono text-sm uppercase"
                      >
                        <Users size={16} />
                        View Registrations ({selectedApp.verified_registrations || 0})
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Performance Score & Manual Adjustment */}
              {selectedApp.status === 'APPROVED' && (
                <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-mono text-white/40 uppercase mb-1 block">
                        Performance Score
                      </label>
                      <div className="text-2xl font-bold text-orange-500 font-mono">
                        {selectedApp.performance_score || 0}
                      </div>
                      <div className="text-xs text-white/60 mt-1 font-mono">
                        {selectedApp.verified_registrations || 0} teams • {selectedApp.approved_tasks || 0} tasks
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <label className="text-xs font-mono text-white/40 uppercase mb-2 block">
                      Manual Points Adjustment
                    </label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={pointsAdjustment.points}
                          onChange={(e) => setPointsAdjustment({ ...pointsAdjustment, points: e.target.value })}
                          placeholder="+10 or -5"
                          className="flex-1 bg-white/5 border border-white/10 px-4 py-2 text-white font-mono focus:outline-none focus:border-orange-500 transition-colors"
                        />
                        <button
                          onClick={handleAdjustPoints}
                          disabled={adjustingPoints || !pointsAdjustment.points || !pointsAdjustment.reason}
                          className="px-6 py-2 bg-orange-500 text-black font-mono font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm"
                          style={{
                            clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)',
                          }}
                        >
                          {adjustingPoints ? 'Adjusting...' : 'Adjust'}
                        </button>
                      </div>
                      <textarea
                        value={pointsAdjustment.reason}
                        onChange={(e) => setPointsAdjustment({ ...pointsAdjustment, reason: e.target.value })}
                        placeholder="Reason for adjustment (required)..."
                        rows={2}
                        className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none"
                      />
                      <p className="text-xs text-white/40 font-mono">
                        Enter positive number to add points, negative to subtract. Changes are logged.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-white/10">
              <button
                onClick={() => {
                  setSelectedApp(null);
                  setAdminNotes('');
                  setPointsAdjustment({ points: '', reason: '' });
                }}
                className="px-8 py-3 text-white/60 hover:text-white font-mono font-bold transition-colors uppercase"
              >
                Close
              </button>
              {selectedApp.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleReject(selectedApp.id)}
                    disabled={processing}
                    className="px-8 py-3 bg-red-500/20 text-red-400 border border-red-500/30 font-mono font-bold hover:bg-red-500/30 transition-colors uppercase disabled:opacity-50"
                    style={{
                      clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
                    }}
                  >
                    <X size={18} className="inline mr-2" />
                    REJECT
                  </button>
                  <button
                    onClick={() => handleApprove(selectedApp.id)}
                    disabled={processing}
                    className="px-8 py-3 bg-green-500 text-black font-mono font-bold hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                    style={{
                      clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
                    }}
                  >
                    <Check size={18} />
                    APPROVE
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    yellow: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    green: 'text-green-500 bg-green-500/10 border-green-500/20',
    red: 'text-red-500 bg-red-500/10 border-red-500/20',
  };

  return (
    <div className={`p-6 border rounded-lg ${colors[color]} backdrop-blur-sm transition-transform hover:scale-[1.02]`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-mono uppercase tracking-wider opacity-80 mb-1">{label}</p>
          <h3 className="text-4xl font-mono font-bold">{value}</h3>
        </div>
        <div className="text-2xl">
          <Icon />
        </div>
      </div>
    </div>
  );
}

