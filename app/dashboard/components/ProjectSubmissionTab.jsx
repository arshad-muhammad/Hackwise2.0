import { useState, useEffect } from 'react';
import { 
  Upload, 
  Github, 
  Globe, 
  FileText, 
  CheckCircle2, 
  ExternalLink,
  Code,
  Lock,
  AlertTriangle
} from 'lucide-react';
import DecryptedText from '@/app/components/DecryptedText';

export default function ProjectSubmissionTab({ identity }) {
  const [isOpen, setIsOpen] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    description: '',
    github_link: '',
    live_link: ''
  });

  useEffect(() => {
    fetchSubmissionData();
  }, []);

  const fetchSubmissionData = async () => {
    try {
      const res = await fetch('/api/team/submission');
      const data = await res.json();
      setIsOpen(data.isOpen);
      setSubmission(data.submission);
      if (data.submission) {
        setForm({
            description: data.submission.description || '',
            github_link: data.submission.github_link || '',
            live_link: data.submission.live_link || ''
        });
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    return await res.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identity || identity.role !== 'LEAD') return;
    setSubmitting(true);

    try {
      let pptUrl = submission?.ppt_url;
      let sourceUrl = submission?.source_code_url;

      const pptFile = document.getElementById('ppt-upload').files[0];
      const sourceFile = document.getElementById('source-upload').files[0];

      if (pptFile) {
        const { url } = await handleFileUpload(pptFile);
        pptUrl = url;
      }

      if (sourceFile) {
        const { url } = await handleFileUpload(sourceFile);
        sourceUrl = url;
      }

      const res = await fetch('/api/team/submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          ppt_url: pptUrl,
          source_code_url: sourceUrl
        })
      });

      if (res.ok) {
        fetchSubmissionData();
        alert('Project submitted successfully!');
      } else {
        const err = await res.json();
        alert(err.error || 'Submission failed');
      }
    } catch (error) {
      console.error(error);
      alert('Error submitting project');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-white/40">Loading submission status...</div>;

  if (!isOpen) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 w-full max-w-2xl mx-auto">
        <div className="relative group">
            <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full animate-pulse"></div>
            <div className="w-24 h-24 rounded-full bg-black/50 border border-red-500/50 flex items-center justify-center mb-8 relative z-10 backdrop-blur-md">
                <Lock size={40} className="text-red-500" />
            </div>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 uppercase tracking-tight">
            <DecryptedText text="SYSTEM LOCKED" sequential speed={40} />
        </h2>
        
        <div className="bg-red-500/10 border border-red-500/20 px-6 py-4 rounded-xl flex items-center gap-3 mb-6">
            <AlertTriangle className="text-red-500" size={20} />
            <span className="font-mono text-red-400 font-bold uppercase tracking-wider text-sm">Submission Portal Not Open</span>
        </div>

        <p className="text-white/40 font-mono max-w-md mx-auto leading-relaxed">
            Project submissions are currently closed. Please wait for further instructions from the administrators via announcements.
        </p>
      </div>
    );
  }

  // View Mode (if submitted and not lead, or just showing current state)
  // Actually, let's allow lead to always edit if open. Members just view.
  const isLead = identity?.role === 'LEAD';

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">PROJECT SUBMISSION</h2>
        <p className="text-white/60 font-mono">Submit your final project details below.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
        {submission && !isLead ? (
            // Read Only View for Members
            <div className="space-y-8">
                <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-4 py-2 rounded-full w-fit mx-auto mb-8">
                    <CheckCircle2 size={18} />
                    <span className="font-mono text-sm font-bold">SUBMITTED</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-orange-500 font-mono text-xs uppercase font-bold mb-2">Description</h3>
                        <p className="text-white/80 bg-black/20 p-4 rounded-xl text-sm leading-relaxed">
                            {submission.description}
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-black/20 p-4 rounded-xl">
                            <h3 className="text-white/40 font-mono text-xs uppercase mb-2">Links</h3>
                            <div className="space-y-2">
                                {submission.github_link && (
                                    <a href={submission.github_link} target="_blank" className="flex items-center gap-2 text-white hover:text-orange-500 transition-colors">
                                        <Github size={16} /> GitHub Repo
                                    </a>
                                )}
                                {submission.live_link && (
                                    <a href={submission.live_link} target="_blank" className="flex items-center gap-2 text-white hover:text-orange-500 transition-colors">
                                        <Globe size={16} /> Live Demo
                                    </a>
                                )}
                            </div>
                        </div>
                        <div className="bg-black/20 p-4 rounded-xl">
                            <h3 className="text-white/40 font-mono text-xs uppercase mb-2">Files</h3>
                            <div className="space-y-2">
                                {submission.source_code_url && (
                                    <a href={submission.source_code_url} target="_blank" className="flex items-center gap-2 text-blue-400 hover:text-blue-300">
                                        <ExternalLink size={16} /> Source Code
                                    </a>
                                )}
                                {submission.ppt_url && (
                                    <a href={submission.ppt_url} target="_blank" className="flex items-center gap-2 text-blue-400 hover:text-blue-300">
                                        <ExternalLink size={16} /> Presentation
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            // Edit Form for Lead
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Description */}
                <div>
                    <label className="block text-xs font-mono text-white/40 mb-2 uppercase">Project Description</label>
                    <textarea 
                        value={form.description}
                        onChange={e => setForm({...form, description: e.target.value})}
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-orange-500 h-32 resize-none"
                        placeholder="Describe your project briefly..."
                        required={!submission}
                        disabled={!isLead}
                    />
                </div>

                {/* Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-mono text-white/40 mb-2 uppercase flex items-center gap-2">
                            <Github size={14} /> GitHub Link
                        </label>
                        <input 
                            type="url"
                            value={form.github_link}
                            onChange={e => setForm({...form, github_link: e.target.value})}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                            placeholder="https://github.com/..."
                            required={!submission}
                            disabled={!isLead}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-mono text-white/40 mb-2 uppercase flex items-center gap-2">
                            <Globe size={14} /> Live Demo Link (Optional)
                        </label>
                        <input 
                            type="url"
                            value={form.live_link}
                            onChange={e => setForm({...form, live_link: e.target.value})}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                            placeholder="https://..."
                            disabled={!isLead}
                        />
                    </div>
                </div>

                {/* File Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-mono text-white/40 mb-2 uppercase flex items-center gap-2">
                            <FileText size={14} /> Presentation (PPT/PDF)
                        </label>
                        <div className="relative">
                            <input 
                                id="ppt-upload"
                                type="file"
                                accept=".pdf,.ppt,.pptx"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white/60 focus:outline-none focus:border-orange-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-orange-500 file:text-black hover:file:bg-orange-600"
                                disabled={!isLead}
                            />
                            {submission?.ppt_url && <p className="text-xs text-green-400 mt-1 absolute right-2 top-4">Current: Uploaded</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-mono text-white/40 mb-2 uppercase flex items-center gap-2">
                            <Code size={14} /> Source Code (ZIP)
                        </label>
                        <div className="relative">
                            <input 
                                id="source-upload"
                                type="file"
                                accept=".zip,.rar,.7z"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white/60 focus:outline-none focus:border-orange-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-orange-500 file:text-black hover:file:bg-orange-600"
                                disabled={!isLead}
                            />
                             {submission?.source_code_url && <p className="text-xs text-green-400 mt-1 absolute right-2 top-4">Current: Uploaded</p>}
                        </div>
                    </div>
                </div>

                {isLead ? (
                    <div className="flex justify-end pt-6 border-t border-white/10">
                        <button 
                            type="submit"
                            disabled={submitting}
                            className="bg-orange-500 text-black px-8 py-4 font-bold font-mono hover:scale-[1.02] transition-transform flex items-center gap-2 disabled:opacity-50"
                            style={{
                                clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)"
                            }}
                        >
                            {submitting ? 'SUBMITTING...' : <DecryptedText text={submission ? "UPDATE SUBMISSION" : "SUBMIT PROJECT"} sequential speed={40} />}
                        </button>
                    </div>
                ) : (
                     <div className="bg-white/5 p-4 rounded-xl text-center text-sm text-white/40 mt-4">
                       Only Team Lead can submit/edit project details.
                     </div>
                )}
            </form>
        )}
      </div>
    </div>
  );
}

