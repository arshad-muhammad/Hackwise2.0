'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Check, 
  X, 
  FileText, 
  Image as ImageIcon, 
  Calendar,
  User,
  Award,
  MessageSquare,
  ArrowLeft
} from 'lucide-react';

export default function TaskReviewPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id;

  const [task, setTask] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);
  const [reviewData, setReviewData] = useState({
    status: 'APPROVED',
    admin_feedback: '',
    points_awarded: null,
  });

  useEffect(() => {
    fetchData();
  }, [taskId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch task details
      const taskRes = await fetch('/api/admin/ca/tasks');
      const tasks = await taskRes.json();
      const currentTask = tasks.find(t => t.id === parseInt(taskId));
      setTask(currentTask);

      // Fetch submissions
      const submissionsRes = await fetch(`/api/admin/ca/tasks/submissions?task_id=${taskId}`);
      const subs = await submissionsRes.json();
      setSubmissions(subs);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (submissionId) => {
    if (!reviewData.status) {
      alert('Please select a status');
      return;
    }

    setReviewing(submissionId);
    try {
      const res = await fetch('/api/admin/ca/tasks/submissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id: submissionId,
          status: reviewData.status,
          admin_feedback: reviewData.admin_feedback || null,
          points_awarded: reviewData.points_awarded || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Submission ${reviewData.status.toLowerCase()} successfully! Points awarded: ${data.points_awarded || 0}`);
        setReviewData({ status: 'APPROVED', admin_feedback: '', points_awarded: null });
        setReviewing(null);
        fetchData();
      } else {
        alert(data.error || 'Failed to review submission');
      }
    } catch (error) {
      console.error('Error reviewing submission:', error);
      alert('Error reviewing submission');
    } finally {
      setReviewing(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      APPROVED: 'bg-green-500/20 text-green-400 border-green-500/30',
      REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return styles[status] || styles.PENDING;
  };

  const cardClipPath = 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)';
  const btnClipPath = 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A090F] text-white p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-[#0A090F] text-white p-8">
        <div className="text-center">Task not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A090F] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/ca/tasks')}
            className="mb-4 flex items-center gap-2 text-white/60 hover:text-white font-mono text-sm uppercase transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Tasks
          </button>
          
          <div className="inline-block border border-white/20 bg-[#0A090F] px-8 py-4">
            <h1 className="text-3xl md:text-4xl font-hackwise text-white uppercase tracking-wider">
              Review Submissions
            </h1>
            <p className="text-white/60 font-mono text-sm mt-2">{task.title}</p>
          </div>
        </div>

        {/* Task Info */}
        <div className="mb-8 p-6 bg-white/5 border border-white/10 rounded-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-white/60 font-mono">Type:</span>
              <span className="ml-2 text-white">{task.task_type}</span>
            </div>
            <div>
              <span className="text-white/60 font-mono">Points:</span>
              <span className="ml-2 text-white">{task.points_on_completion}</span>
            </div>
            <div>
              <span className="text-white/60 font-mono">Submissions:</span>
              <span className="ml-2 text-white">{submissions.length}</span>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-6">
          {submissions.length === 0 ? (
            <div className="text-center text-white/60 font-mono py-12">
              No submissions yet for this task.
            </div>
          ) : (
            submissions.map((submission) => (
              <div key={submission.id} className="relative group">
                <div className="absolute inset-0 bg-orange-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative p-px" style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}>
                  <div
                    className="absolute inset-0 bg-white/20 group-hover:bg-orange-500/50 transition-colors duration-300"
                    style={{ clipPath: cardClipPath }}
                  />
                  
                  <div
                    className="relative bg-[#0A090F] p-6"
                    style={{ clipPath: cardClipPath }}
                  >
                    {/* Submission Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <User size={18} className="text-white/60" />
                          <span className="font-hackwise text-white uppercase">{submission.ca_name}</span>
                          <span className="text-white/40 font-mono text-xs">({submission.ca_code})</span>
                        </div>
                        <div className="text-sm text-white/60 font-mono">
                          {submission.college} • {submission.ca_email}
                        </div>
                      </div>
                      <div className={`px-3 py-1 border font-mono text-xs uppercase ${getStatusBadge(submission.status)}`}>
                        {submission.status}
                      </div>
                    </div>

                    {/* Submission Content */}
                    {submission.submission_text && (
                      <div className="mb-4 p-4 bg-white/5 rounded border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText size={16} className="text-white/60" />
                          <span className="font-mono text-xs text-white/60 uppercase">Text Submission</span>
                        </div>
                        <p className="text-white/80 font-sans text-sm whitespace-pre-wrap">
                          {submission.submission_text}
                        </p>
                      </div>
                    )}

                    {/* Files */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {submission.file_url && (
                        <div className="p-4 bg-white/5 rounded border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText size={16} className="text-white/60" />
                            <span className="font-mono text-xs text-white/60 uppercase">File</span>
                          </div>
                          <a
                            href={submission.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-500 hover:text-orange-400 font-sans text-sm break-all"
                          >
                            View File
                          </a>
                        </div>
                      )}
                      
                      {submission.screenshot_url && (
                        <div className="p-4 bg-white/5 rounded border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <ImageIcon size={16} className="text-white/60" />
                            <span className="font-mono text-xs text-white/60 uppercase">Screenshot</span>
                          </div>
                          <a
                            href={submission.screenshot_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-500 hover:text-orange-400 font-sans text-sm break-all"
                          >
                            View Screenshot
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Submission Info */}
                    <div className="flex gap-4 text-xs text-white/60 font-mono mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        Submitted: {new Date(submission.submitted_at).toLocaleString()}
                      </div>
                      {submission.points_awarded !== null && (
                        <div className="flex items-center gap-1">
                          <Award size={14} />
                          Points: {submission.points_awarded}
                        </div>
                      )}
                    </div>

                    {/* Admin Feedback */}
                    {submission.admin_feedback && (
                      <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare size={16} className="text-blue-400" />
                          <span className="font-mono text-xs text-blue-400 uppercase">Admin Feedback</span>
                        </div>
                        <p className="text-white/80 font-sans text-sm">{submission.admin_feedback}</p>
                      </div>
                    )}

                    {/* Review Form (only for PENDING) */}
                    {submission.status === 'PENDING' && (
                      <div className="border-t border-white/10 pt-4 mt-4">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-mono text-white/60 mb-2 uppercase">
                              Review Status
                            </label>
                            <select
                              value={reviewData.status}
                              onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 text-white px-4 py-2 font-mono text-sm"
                            >
                              <option value="APPROVED">Approve</option>
                              <option value="REJECTED">Reject</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-mono text-white/60 mb-2 uppercase">
                              Points Awarded (leave empty for auto-calculation)
                            </label>
                            <input
                              type="number"
                              value={reviewData.points_awarded || ''}
                              onChange={(e) => setReviewData({ ...reviewData, points_awarded: e.target.value ? parseInt(e.target.value) : null })}
                              className="w-full bg-white/5 border border-white/10 text-white px-4 py-2 font-mono text-sm"
                              placeholder="Auto"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-mono text-white/60 mb-2 uppercase">
                              Feedback (Optional)
                            </label>
                            <textarea
                              value={reviewData.admin_feedback}
                              onChange={(e) => setReviewData({ ...reviewData, admin_feedback: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 text-white px-4 py-2 font-mono text-sm h-24"
                              placeholder="Add feedback for the CA..."
                            />
                          </div>

                          <button
                            onClick={() => handleReview(submission.id)}
                            disabled={reviewing === submission.id}
                            className={`px-6 py-3 font-mono font-bold uppercase transition-colors flex items-center gap-2 disabled:opacity-50 ${
                              reviewData.status === 'APPROVED'
                                ? 'bg-green-500 text-black hover:bg-green-600'
                                : 'bg-red-500 text-white hover:bg-red-600'
                            }`}
                            style={{ clipPath: btnClipPath }}
                          >
                            {reviewing === submission.id ? (
                              'Processing...'
                            ) : reviewData.status === 'APPROVED' ? (
                              <>
                                <Check size={18} />
                                Approve Submission
                              </>
                            ) : (
                              <>
                                <X size={18} />
                                Reject Submission
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

