'use client';
import { useState, useEffect } from 'react';
import { 
  FileText, 
  ExternalLink, 
  Download, 
  Github, 
  Globe, 
  Search,
  Eye,
  ToggleLeft,
  ToggleRight,
  X,
  Trash2
} from 'lucide-react';
import DecryptedText from '@/app/components/DecryptedText';

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isSubmissionEnabled, setIsSubmissionEnabled] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subRes, settingsRes] = await Promise.all([
        fetch('/api/admin/submissions'),
        fetch('/api/admin/settings/submission')
      ]);
      
      const subData = await subRes.json();
      const settingsData = await settingsRes.json();
      
      setSubmissions(subData);
      setIsSubmissionEnabled(settingsData.enabled);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data', error);
      setLoading(false);
    }
  };

  const toggleSubmission = async () => {
    try {
      const newState = !isSubmissionEnabled;
      await fetch('/api/admin/settings/submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newState })
      });
      setIsSubmissionEnabled(newState);
    } catch (error) {
      console.error('Failed to toggle submission', error);
    }
  };

  const deleteSubmission = async (id) => {
    if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) return;
    
    try {
      const res = await fetch(`/api/admin/submissions?id=${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setSubmissions(submissions.filter(sub => sub.id !== id));
        if (selectedSubmission?.id === id) {
            setSelectedSubmission(null);
        }
      } else {
        alert('Failed to delete submission');
      }
    } catch (error) {
      console.error('Failed to delete submission', error);
      alert('Error deleting submission');
    }
  };

  const filteredSubmissions = submissions.filter(sub => 
    sub.team_name?.toLowerCase().includes(search.toLowerCase()) ||
    sub.lead_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-display font-bold uppercase tracking-tight text-white">
            Project Submissions
          </h1>
          <p className="text-white/60 mt-2 font-mono text-sm">Manage and review team projects</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-xl">
            <span className="text-sm font-mono uppercase text-white/60">Submission Status:</span>
            <button 
                onClick={toggleSubmission}
                className={`flex items-center gap-2 px-4 py-2 rounded font-bold font-mono transition-colors ${
                    isSubmissionEnabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}
            >
                {isSubmissionEnabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                {isSubmissionEnabled ? 'OPEN' : 'CLOSED'}
            </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="p-4 border-b border-white/10 flex items-center gap-4">
          <Search className="text-orange-500" size={20} />
          <input
            type="text"
            placeholder="SEARCH SUBMISSIONS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none focus:outline-none flex-1 text-white font-mono placeholder:text-white/20"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-white/40 font-mono text-sm uppercase tracking-wider">
              <tr>
                <th className="p-4 font-normal">Team</th>
                <th className="p-4 font-normal">Submitted At</th>
                <th className="p-4 font-normal">Links</th>
                <th className="p-4 font-normal">Files</th>
                <th className="p-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 font-mono text-sm">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-white/40">LOADING...</td></tr>
              ) : filteredSubmissions.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-white/40">NO SUBMISSIONS YET</td></tr>
              ) : (
                filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                        <div className="font-bold text-white text-base">{sub.team_name}</div>
                        <div className="text-xs text-white/40 mt-1">Lead: {sub.lead_name}</div>
                    </td>
                    <td className="p-4 text-white/60">
                        {new Date(sub.created_at).toLocaleString()}
                    </td>
                    <td className="p-4">
                        <div className="flex gap-3">
                            {sub.github_link && (
                                <a href={sub.github_link} target="_blank" className="text-white/60 hover:text-white" title="GitHub">
                                    <Github size={18} />
                                </a>
                            )}
                            {sub.live_link && (
                                <a href={sub.live_link} target="_blank" className="text-white/60 hover:text-white" title="Live Demo">
                                    <Globe size={18} />
                                </a>
                            )}
                        </div>
                    </td>
                    <td className="p-4">
                        <div className="flex flex-col gap-1 text-xs">
                            {sub.source_code_url && (
                                <a href={sub.source_code_url} target="_blank" className="text-blue-400 hover:underline flex items-center gap-1">
                                    <Download size={12} /> Source Code
                                </a>
                            )}
                            {sub.ppt_url && (
                                <a href={sub.ppt_url} target="_blank" className="text-blue-400 hover:underline flex items-center gap-1">
                                    <Download size={12} /> Presentation
                                </a>
                            )}
                        </div>
                    </td>
                    <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={() => setSelectedSubmission(sub)}
                                className="bg-white/5 hover:bg-white/10 px-3 py-2 rounded text-white text-xs font-bold transition-colors flex items-center gap-2"
                            >
                                <Eye size={14} /> VIEW
                            </button>
                            <button 
                                onClick={() => deleteSubmission(sub.id)}
                                className="bg-red-500/10 hover:bg-red-500/20 px-3 py-2 rounded text-red-400 text-xs font-bold transition-colors flex items-center gap-2"
                                title="Delete Submission"
                            >
                                <Trash2 size={14} />
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

      {/* Details Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#0A090F] border border-white/10 p-8 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                <button 
                    onClick={() => setSelectedSubmission(null)}
                    className="absolute top-6 right-6 text-white/40 hover:text-white"
                >
                    <X size={24} />
                </button>
                
                <h2 className="text-2xl font-display font-bold mb-1 text-white uppercase">{selectedSubmission.team_name}</h2>
                <p className="text-white/40 font-mono text-sm mb-6">Submitted on {new Date(selectedSubmission.created_at).toLocaleString()}</p>
                
                <div className="space-y-6">
                    <div>
                        <h3 className="text-orange-500 font-mono text-xs uppercase font-bold mb-2">Description</h3>
                        <p className="text-white/80 leading-relaxed bg-white/5 p-4 rounded-xl text-sm">
                            {selectedSubmission.description || "No description provided."}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <h3 className="text-white/40 font-mono text-xs uppercase mb-3">Links</h3>
                            <div className="space-y-2">
                                {selectedSubmission.github_link ? (
                                    <a href={selectedSubmission.github_link} target="_blank" className="flex items-center gap-2 text-white hover:text-orange-500 transition-colors">
                                        <Github size={16} /> GitHub Repo
                                    </a>
                                ) : <span className="text-white/20 italic">No GitHub link</span>}
                                
                                {selectedSubmission.live_link ? (
                                    <a href={selectedSubmission.live_link} target="_blank" className="flex items-center gap-2 text-white hover:text-orange-500 transition-colors">
                                        <Globe size={16} /> Live Demo
                                    </a>
                                ) : <span className="text-white/20 italic">No Live link</span>}
                            </div>
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <h3 className="text-white/40 font-mono text-xs uppercase mb-3">Files</h3>
                            <div className="space-y-2">
                                {selectedSubmission.source_code_url ? (
                                    <a href={selectedSubmission.source_code_url} target="_blank" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                                        <Download size={16} /> Source Code (ZIP)
                                    </a>
                                ) : <span className="text-white/20 italic">No Source Code</span>}
                                
                                {selectedSubmission.ppt_url ? (
                                    <a href={selectedSubmission.ppt_url} target="_blank" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                                        <Download size={16} /> Presentation (PPT/PDF)
                                    </a>
                                ) : <span className="text-white/20 italic">No Presentation</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

