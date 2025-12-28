'use client';
import { useState, useEffect } from 'react';
import { Send, Users, Megaphone, Trash2, Edit2, Save, X } from 'lucide-react';
import DecryptedText from '@/app/components/DecryptedText';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState({ title: '', message: '', target_team_id: '' });
  const [loading, setLoading] = useState(true);
  
  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', message: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [annRes, teamRes] = await Promise.all([
        fetch('/api/admin/announcements'),
        fetch('/api/admin/teams')
      ]);
      setAnnouncements(await annRes.json());
      setTeams(await teamRes.json());
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        target_team_id: form.target_team_id || null
      })
    });
    setForm({ title: '', message: '', target_team_id: '' });
    fetchData();
  };

  const startEdit = (ann) => {
    setEditingId(ann.id);
    setEditForm({ title: ann.title, message: ann.message });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: '', message: '' });
  };

  const saveEdit = async (id) => {
    try {
      await fetch('/api/admin/announcements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editForm })
      });
      setEditingId(null);
      fetchData();
    } catch (error) {
      console.error('Update failed', error);
    }
  };

  const deleteAnnouncement = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await fetch(`/api/admin/announcements?id=${id}`, {
        method: 'DELETE'
      });
      fetchData();
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold uppercase tracking-tight text-white">
          Announcements
        </h1>
        <p className="text-white/60 mt-2 font-mono text-sm">Broadcast messages to all teams or specific ones</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 border border-white/10 p-6 rounded-xl sticky top-8 backdrop-blur-sm">
            <h3 className="text-lg font-display font-bold mb-6 flex items-center gap-2 text-orange-500 uppercase tracking-wider">
              <Megaphone size={20} />
              New Announcement
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-white/40 uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 text-white font-mono focus:outline-none focus:border-orange-500 transition-colors placeholder:text-white/20"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/40 uppercase mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={e => setForm({...form, message: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 text-white font-mono focus:outline-none focus:border-orange-500 transition-colors placeholder:text-white/20"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/40 uppercase mb-1">Target Audience</label>
                <select
                  value={form.target_team_id}
                  onChange={e => setForm({...form, target_team_id: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 text-white font-mono focus:outline-none focus:border-orange-500 transition-colors appearance-none"
                >
                  <option value="" className="bg-black">All Teams (Broadcast)</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id} className="bg-black">{team.team_name}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-orange-500 text-black py-4 font-bold font-mono hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                style={{
                  clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)"
                }}
              >
                <Send size={18} /> <DecryptedText text="SEND MESSAGE" sequential speed={40} />
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-display font-bold uppercase tracking-tight text-white mb-6">History</h3>
          {loading ? (
             <div className="text-white/40 font-mono text-sm">LOADING...</div>
          ) : announcements.length === 0 ? (
             <div className="text-white/40 font-mono text-sm">NO ANNOUNCEMENTS SENT YET.</div>
          ) : (
            announcements.map(ann => (
              <div key={ann.id} className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm hover:border-white/20 transition-colors group">
                {editingId === ann.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={editForm.title}
                            onChange={e => setEditForm({...editForm, title: e.target.value})}
                            className="w-full bg-white/10 border border-white/20 px-4 py-2 rounded focus:border-orange-500 outline-none text-white font-bold"
                            placeholder="Title"
                        />
                        <textarea
                            rows={3}
                            value={editForm.message}
                            onChange={e => setEditForm({...editForm, message: e.target.value})}
                            className="w-full bg-white/10 border border-white/20 px-4 py-2 rounded focus:border-orange-500 outline-none text-white/70"
                            placeholder="Message"
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={cancelEdit} className="px-4 py-2 text-white/60 hover:text-white text-sm">Cancel</button>
                            <button onClick={() => saveEdit(ann.id)} className="px-4 py-2 bg-orange-500 text-black font-bold rounded flex items-center gap-2 text-sm hover:bg-orange-600">
                                <Save size={16}/> Save
                            </button>
                        </div>
                    </div>
                ) : (
                    // View Mode
                    <>
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-bold text-lg font-display text-white">{ann.title}</h4>
                          <div className="flex items-center gap-3">
                              <span className={`text-xs px-3 py-1 rounded font-mono font-bold tracking-wider ${
                                ann.target_team_id 
                                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                                  : 'bg-green-500/10 text-green-400 border border-green-500/20'
                              }`}>
                                {ann.target_team_id ? `TO: ${ann.team_name}` : 'BROADCAST'}
                              </span>
                              
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => startEdit(ann)} className="p-2 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors">
                                      <Edit2 size={16} />
                                  </button>
                                  <button onClick={() => deleteAnnouncement(ann.id)} className="p-2 hover:bg-red-500/10 rounded text-red-400 hover:text-red-300 transition-colors">
                                      <Trash2 size={16} />
                                  </button>
                              </div>
                          </div>
                        </div>
                        <p className="text-white/70 whitespace-pre-wrap font-sans leading-relaxed">{ann.message}</p>
                        <p className="text-xs text-white/30 mt-4 font-mono">
                          {new Date(ann.created_at).toLocaleString()}
                        </p>
                    </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
