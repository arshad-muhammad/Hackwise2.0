'use client';
import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Check, 
  X,
  Key,
  ExternalLink,
  MessageCircle,
  Save,
  CreditCard,
  Building,
  Phone,
  GraduationCap,
  Download
} from 'lucide-react';
import DecryptedText from '@/app/components/DecryptedText';

export default function TeamsAdminPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  
  // Edit Modal State
  const [editingTeam, setEditingTeam] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [members, setMembers] = useState([]); 
  
  // Member Editing State
  const [editingMember, setEditingMember] = useState(null);
  const [memberForm, setMemberForm] = useState({});

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await fetch('/api/admin/teams', { cache: 'no-store' });
      const data = await res.json();
      setTeams(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch teams', error);
      setLoading(false);
    }
  };

  const createTeam = async () => {
    if (!newTeamName.trim()) return;
    try {
      const res = await fetch('/api/admin/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_name: newTeamName }),
      });
      if (res.ok) {
        setNewTeamName('');
        setIsCreating(false);
        fetchTeams();
      }
    } catch (error) {
      console.error('Failed to create team', error);
    }
  };

  const handleEditClick = async (team) => {
    setEditingTeam(team);
    setEditForm({ ...team });
    setMembers([]); 
    setEditingMember(null);
    
    try {
        const res = await fetch(`/api/admin/teams?id=${team.id}`);
        if (!res.ok) throw new Error('Failed to fetch details');
        const data = await res.json();
        
        setMembers(data.members || []);
        setEditForm(prev => ({ ...prev, ...data })); 
    } catch (error) {
        console.error('Failed to fetch team details', error);
    }
  };

  const saveEdit = async () => {
    try {
      const res = await fetch(`/api/admin/teams/${editingTeam.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      
      if (res.ok) {
        setEditingTeam(null);
        fetchTeams();
      } else {
        const err = await res.json();
        console.error('Update failed:', err);
        alert('Failed to save changes: ' + (err.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to update team', error);
      alert('Failed to save changes: Network error');
    }
  };

  const deleteTeam = async (id) => {
    if (!confirm('Are you sure you want to delete this team?')) return;
    try {
      const res = await fetch(`/api/admin/teams/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchTeams();
      }
    } catch (error) {
      console.error('Failed to delete team', error);
    }
  };

  const updatePaymentStatus = (status) => {
      setEditForm({...editForm, payment_status: status});
  };

  // Member Functions
  const startEditMember = (member) => {
    setEditingMember(member);
    setMemberForm({...member});
  };

  const cancelEditMember = () => {
    setEditingMember(null);
    setMemberForm({});
  };

  const saveMember = async () => {
    try {
      const res = await fetch('/api/admin/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberForm),
      });

      if (res.ok) {
        // Update local list
        setMembers(members.map(m => m.id === memberForm.id ? memberForm : m));
        setEditingMember(null);
      } else {
        alert('Failed to update member');
      }
    } catch (error) {
      console.error(error);
      alert('Error updating member');
    }
  };

  const deleteMember = async (id) => {
    if (!confirm('Delete this member?')) return;
    try {
        const res = await fetch(`/api/admin/members?id=${id}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            setMembers(members.filter(m => m.id !== id));
        } else {
            alert('Failed to delete member');
        }
    } catch (error) {
        console.error(error);
    }
  };

  const exportData = async () => {
    try {
        // Fetch all teams with full details (members included)
        // We'll use a new API or just iterate client side if data is small. 
        // For better performance, let's create a dedicated export API or use existing listing + individual fetch (slow).
        // Best approach: Client-side CSV generation from current `teams` state is insufficient because `teams` state usually lacks full member details (only summary).
        // So we need to fetch all data.
        
        const res = await fetch('/api/admin/export');
        if (!res.ok) throw new Error('Failed to fetch export data');
        const csvBlob = await res.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(csvBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hackwise_teams_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Export failed', error);
        alert('Failed to export data');
    }
  };

  const filteredTeams = teams.filter(team => 
    team.team_name?.toLowerCase().includes(search.toLowerCase()) ||
    team.access_key?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-display font-bold uppercase tracking-tight text-white">
            Team Management
          </h1>
          <p className="text-white/60 mt-2 font-mono text-sm">Manage teams, keys, and progress</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-orange-500 text-black px-6 py-3 font-bold font-mono hover:scale-105 transition-transform"
          style={{
            clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)"
          }}
        >
          <Plus size={20} />
          <DecryptedText text="CREATE TEAM" sequential speed={40} />
        </button>
        <button
          onClick={exportData}
          className="flex items-center gap-2 bg-white/10 text-white px-6 py-3 font-bold font-mono hover:bg-white/20 transition-colors ml-4"
          style={{
            clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)"
          }}
        >
          <Download size={20} />
          <span className="hidden md:inline">EXPORT CSV</span>
        </button>
      </div>

      {isCreating && (
        <div className="bg-white/5 border border-white/10 p-6 rounded-xl animate-in fade-in slide-in-from-top-4 backdrop-blur-md">
          <h3 className="text-xl font-display font-bold mb-6 text-white">Create New Team</h3>
          <div className="flex gap-4">
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="ENTER TEAM NAME"
              className="flex-1 bg-white/5 border border-white/10 rounded-none px-6 py-3 text-white font-mono focus:outline-none focus:border-orange-500 transition-colors placeholder:text-white/20"
            />
            <button
              onClick={createTeam}
              className="bg-orange-500 text-black px-8 py-3 font-bold font-mono hover:bg-orange-600 transition-colors"
              style={{
                clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)"
              }}
            >
              CREATE
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="bg-white/10 text-white px-8 py-3 font-bold font-mono hover:bg-white/20 transition-colors"
              style={{
                clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)"
              }}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="p-4 border-b border-white/10 flex items-center gap-4">
          <Search className="text-orange-500" size={20} />
          <input
            type="text"
            placeholder="SEARCH TEAMS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none focus:outline-none flex-1 text-white font-mono placeholder:text-white/20"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-white/40 font-mono text-sm uppercase tracking-wider">
              <tr>
                <th className="p-4 font-normal">Team Name</th>
                <th className="p-4 font-normal">Access Key</th>
                <th className="p-4 font-normal">Lead Info</th>
                <th className="p-4 font-normal">Round 1</th>
                <th className="p-4 font-normal">Payment</th>
                <th className="p-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 font-mono text-sm">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-white/40">LOADING TEAMS...</td></tr>
              ) : filteredTeams.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-white/40">NO TEAMS FOUND</td></tr>
              ) : (
                filteredTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 font-bold text-white text-base">{team.team_name}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-orange-500 bg-orange-500/10 w-fit px-3 py-1 rounded">
                        <Key size={14} />
                        <span className="tracking-widest">{team.access_key}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {team.lead_name ? (
                        <div className="text-sm">
                          <div className="text-white">{team.lead_name}</div>
                          <div className="text-white/40">{team.lead_email}</div>
                        </div>
                      ) : (
                        <span className="text-white/20 italic">Not registered</span>
                      )}
                    </td>
                    <td className="p-4">
                      {team.round1_submission_url ? (
                        <div className="flex flex-col gap-2">
                          <a href={team.round1_submission_url} target="_blank" className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1">
                            <ExternalLink size={12} /> View Submission
                          </a>
                          <span className="text-white/60">Marks: <span className="text-white font-bold">{team.round1_marks || '-'}</span></span>
                        </div>
                      ) : (
                        <span className="text-white/20">No submission</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        team.payment_status === 'PAID' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {team.payment_status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditClick(team)}
                          className="p-2 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => deleteTeam(team.id)}
                          className="p-2 hover:bg-red-500/10 rounded text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal (Expanded) */}
      {editingTeam && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A090F] border border-white/10 p-8 rounded-3xl w-full max-w-6xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-3xl font-display font-bold mb-8 text-white uppercase flex justify-between items-center">
                <span>Edit Team: <span className="text-orange-500">{editingTeam.team_name}</span></span>
                <button onClick={() => setEditingTeam(null)} className="text-white/40 hover:text-white"><X size={32}/></button>
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Col: Team Details */}
              <div className="space-y-8">
                  {/* Lead Info */}
                  <div>
                    <h3 className="font-mono text-sm text-orange-500 font-bold uppercase tracking-wider border-b border-white/10 pb-2 mb-4">Lead Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-mono text-white/40 uppercase mb-1 block">Lead Name</label>
                            <div className="flex gap-4 items-center">
                                {editForm.logo_url && (
                                    <img src={editForm.logo_url} alt="Logo" className="w-12 h-12 rounded object-cover bg-white/10" />
                                )}
                                <input 
                                    type="text"
                                    value={editForm.lead_name || ''}
                                    onChange={e => setEditForm({...editForm, lead_name: e.target.value})}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-none px-4 py-3 text-white font-mono focus:outline-none focus:border-orange-500 transition-colors"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-mono text-white/40 uppercase mb-1 block">Lead Phone</label>
                            <input 
                                type="text"
                                value={editForm.lead_phone || ''}
                                onChange={e => setEditForm({...editForm, lead_phone: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 text-white font-mono focus:outline-none focus:border-orange-500 transition-colors"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-mono text-white/40 uppercase mb-1 block">Lead Email</label>
                            <input 
                                type="text"
                                value={editForm.lead_email || ''}
                                onChange={e => setEditForm({...editForm, lead_email: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 text-white font-mono focus:outline-none focus:border-orange-500 transition-colors"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-mono text-white/40 uppercase mb-1 block">College</label>
                            <input 
                                type="text"
                                value={editForm.lead_college || ''}
                                onChange={e => setEditForm({...editForm, lead_college: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 text-white font-mono focus:outline-none focus:border-orange-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-mono text-white/40 uppercase mb-1 block">Branch</label>
                            <input 
                                type="text"
                                value={editForm.lead_branch || ''}
                                onChange={e => setEditForm({...editForm, lead_branch: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 text-white font-mono focus:outline-none focus:border-orange-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-mono text-white/40 uppercase mb-1 block">Year</label>
                            <input 
                                type="text"
                                value={editForm.lead_year || ''}
                                onChange={e => setEditForm({...editForm, lead_year: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 text-white font-mono focus:outline-none focus:border-orange-500 transition-colors"
                            />
                        </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div>
                    <h3 className="font-mono text-sm text-orange-500 font-bold uppercase tracking-wider border-b border-white/10 pb-2 mb-4">Payment Verification</h3>
                    <div className="bg-white/5 p-6 rounded-xl space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-white/60">Current Status:</span>
                            <span className={`font-bold ${editForm.payment_status === 'PAID' ? 'text-green-400' : 'text-yellow-400'}`}>
                                {editForm.payment_status}
                            </span>
                        </div>
                        
                        {editForm.transaction_id && (
                            <div className="bg-black/20 p-4 rounded text-sm font-mono space-y-2">
                                <p><span className="text-white/40">Transaction ID:</span> <span className="text-white">{editForm.transaction_id}</span></p>
                                {editForm.payment_screenshot_url && (
                                    <p>
                                        <a href={editForm.payment_screenshot_url} target="_blank" className="text-blue-400 underline flex items-center gap-1">
                                            <ExternalLink size={12}/> View Screenshot
                                        </a>
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <button 
                                onClick={() => updatePaymentStatus('PAID')}
                                className={`py-3 font-bold border border-green-500/30 rounded hover:bg-green-500/10 transition-colors ${editForm.payment_status === 'PAID' ? 'bg-green-500/20 text-green-400' : 'text-white/60'}`}
                            >
                                <Check size={16} className="inline mr-2"/> APPROVE
                            </button>
                            <button 
                                onClick={() => updatePaymentStatus('PENDING')}
                                className={`py-3 font-bold border border-red-500/30 rounded hover:bg-red-500/10 transition-colors ${editForm.payment_status === 'PENDING' ? 'bg-red-500/20 text-red-400' : 'text-white/60'}`}
                            >
                                <X size={16} className="inline mr-2"/> REJECT/PENDING
                            </button>
                        </div>
                    </div>
                  </div>
              </div>

              {/* Right Col: Project & Members */}
              <div className="space-y-8">
                  {/* Members List */}
                  <div>
                    <h3 className="font-mono text-sm text-orange-500 font-bold uppercase tracking-wider border-b border-white/10 pb-2 mb-4">Team Members</h3>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {members.map(member => (
                            <div key={member.id} className="bg-white/5 p-4 border border-white/5 rounded-lg group">
                                {editingMember?.id === member.id ? (
                                    <div className="space-y-3">
                                        <input 
                                            value={memberForm.name || ''} 
                                            onChange={e => setMemberForm({...memberForm, name: e.target.value})}
                                            className="w-full bg-white/10 border border-white/20 px-3 py-2 rounded text-sm"
                                            placeholder="Name"
                                        />
                                        <input 
                                            value={memberForm.email || ''} 
                                            onChange={e => setMemberForm({...memberForm, email: e.target.value})}
                                            className="w-full bg-white/10 border border-white/20 px-3 py-2 rounded text-sm"
                                            placeholder="Email"
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input 
                                                value={memberForm.phone || ''} 
                                                onChange={e => setMemberForm({...memberForm, phone: e.target.value})}
                                                className="bg-white/10 border border-white/20 px-3 py-2 rounded text-xs"
                                                placeholder="Phone"
                                            />
                                            <input 
                                                value={memberForm.college || ''} 
                                                onChange={e => setMemberForm({...memberForm, college: e.target.value})}
                                                className="bg-white/10 border border-white/20 px-3 py-2 rounded text-xs"
                                                placeholder="College"
                                            />
                                            <input 
                                                value={memberForm.branch || ''} 
                                                onChange={e => setMemberForm({...memberForm, branch: e.target.value})}
                                                className="bg-white/10 border border-white/20 px-3 py-2 rounded text-xs"
                                                placeholder="Branch"
                                            />
                                            <input 
                                                value={memberForm.year || ''} 
                                                onChange={e => setMemberForm({...memberForm, year: e.target.value})}
                                                className="bg-white/10 border border-white/20 px-3 py-2 rounded text-xs"
                                                placeholder="Year"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2 pt-2">
                                            <button onClick={cancelEditMember} className="px-3 py-1 text-xs text-white/50 hover:text-white">Cancel</button>
                                            <button onClick={saveMember} className="bg-orange-500 text-black px-3 py-1 rounded text-xs font-bold">Save</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-white">{member.name} {member.role === 'LEAD' && <span className="text-orange-500 text-xs ml-2">(LEAD)</span>}</p>
                                            <p className="text-sm text-white/60">{member.email}</p>
                                            <p className="text-xs font-mono text-white/40 mt-1">{member.phone} | {member.college}</p>
                                            <p className="text-xs font-mono text-white/40">{member.branch} • {member.year}</p>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEditMember(member)} className="text-white/40 hover:text-white p-1">
                                                <Edit2 size={14}/>
                                            </button>
                                            <button onClick={() => deleteMember(member.id)} className="text-red-400/40 hover:text-red-400 p-1">
                                                <Trash2 size={14}/>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                  </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-white/10 sticky bottom-0 bg-[#0A090F] z-10">
              <button 
                onClick={() => setEditingTeam(null)}
                className="px-8 py-3 text-white/60 hover:text-white font-mono font-bold transition-colors uppercase"
              >
                Cancel
              </button>
              <button 
                onClick={saveEdit}
                className="bg-orange-500 text-black px-8 py-3 font-bold font-mono hover:bg-orange-600 transition-colors flex items-center gap-2"
                style={{
                  clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)"
                }}
              >
                <Save size={18} /> SAVE CHANGES
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
