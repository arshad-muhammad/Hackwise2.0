'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Icons are now using remixicon classes directly
import DecryptedText from '@/app/components/DecryptedText';

export default function CADashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/ca/dashboard');
      if (res.status === 401) {
        router.push('/campus-ambassador/login');
        return;
      }
      const data = await res.json();
      setDashboardData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/ca/logout', { method: 'POST' });
      router.push('/campus-ambassador/login');
    } catch (error) {
      router.push('/campus-ambassador/login');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const cardClipPath = "polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)";
  const btnClipPath = "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)";

  if (loading) {
    return (
      <section className="section-container border-t border-white/10 pb-32">
        <div className="text-center text-white/60 font-mono">Loading dashboard...</div>
      </section>
    );
  }

  if (!dashboardData) {
    return (
      <section className="section-container border-t border-white/10 pb-32">
        <div className="text-center text-white/60 font-mono">Failed to load dashboard</div>
      </section>
    );
  }

  const { ca, registrations, tasks, leaderboard, current_rank } = dashboardData;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
    { id: 'registrations', label: 'Registrations', icon: 'ri-group-line' },
    { id: 'tasks', label: 'Tasks', icon: 'ri-file-text-line' },
    { id: 'leaderboard', label: 'Leaderboard', icon: 'ri-trophy-line' },
  ];

  return (
    <section className="section-container border-t border-white/10 pb-32">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-hackwise text-white uppercase tracking-wider mb-2">
              CA Dashboard
            </h1>
            <p className="text-white/60 font-mono text-sm">
              Welcome, <span className="text-orange-500 font-bold">{ca.name}</span> ({ca.ca_code})
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-500/20 text-red-400 border border-red-500/30 font-mono text-sm hover:bg-red-500/30 transition-colors uppercase"
            style={{ clipPath: btnClipPath }}
          >
            <i className="ri-logout-box-line inline mr-2 text-base" />
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Performance Score"
          value={ca.performance_score || 0}
          icon="ri-award-line"
          color="orange"
        />
        <StatCard
          label="Registrations"
          value={ca.verified_registrations || 0}
          icon="ri-group-line"
          color="blue"
        />
        <StatCard
          label="Approved Tasks"
          value={ca.approved_tasks || 0}
          icon="ri-checkbox-circle-line"
          color="green"
        />
        <StatCard
          label="Current Rank"
          value={current_rank ? `#${current_rank}` : 'N/A'}
          icon="ri-line-chart-line"
          color="purple"
        />
        </div>

        {/* Referral Link Card */}
        {ca.referral_link && (
          <div className="relative group mb-8">
            <div className="absolute inset-0 bg-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative p-px" style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}>
              <div
                className="absolute inset-0 bg-white/20 group-hover:bg-orange-500/50 transition-colors duration-300"
                style={{ clipPath: cardClipPath }}
              />
              <div className="relative bg-[#0A090F] p-6" style={{ clipPath: cardClipPath }}>
                <h3 className="text-lg font-hackwise text-white uppercase mb-4">Your Referral Link</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={ca.referral_link}
                    readOnly
                    className="flex-1 bg-white/5 border border-white/10 px-4 py-2 text-white font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(ca.referral_link)}
                    className="px-4 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 transition-colors"
                    title="Copy link"
                  >
                    <i className="ri-file-copy-line text-lg" />
                  </button>
                  <a
                    href={ca.referral_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors"
                    title="Open link"
                  >
                    <i className="ri-external-link-line text-lg" />
                  </a>
                </div>
                <p className="text-xs text-white/50 mt-2 font-sans">
                  Share this link to track registrations. Each verified registration increases your performance score.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          {tabs.map((tab) => {
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-mono text-sm uppercase transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                <i className={`${tab.icon} inline mr-2 text-base`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <OverviewTab ca={ca} registrations={registrations} tasks={tasks} />
          )}
          {activeTab === 'registrations' && (
            <RegistrationsTab registrations={registrations} />
          )}
          {activeTab === 'tasks' && (
            <TasksTab tasks={tasks} onRefresh={fetchDashboard} />
          )}
          {activeTab === 'leaderboard' && (
            <LeaderboardTab leaderboard={leaderboard} currentCaCode={ca.ca_code} />
          )}
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, icon, color }) {
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
          <h3 className="text-3xl font-mono font-bold">{value}</h3>
        </div>
        <div className="text-2xl">
          <i className={icon} />
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ ca, registrations, tasks }) {
  const cardClipPath = "polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative p-px" style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}>
            <div
              className="absolute inset-0 bg-white/20 group-hover:bg-blue-500/50 transition-colors duration-300"
              style={{ clipPath: cardClipPath }}
            />
            <div className="relative bg-[#0A090F] p-6" style={{ clipPath: cardClipPath }}>
              <h3 className="text-xl font-hackwise text-white uppercase mb-4 flex items-center gap-2">
                <i className="ri-group-line text-blue-500 text-2xl" />
                Registrations Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-white/80">
                  <span>Total Registrations:</span>
                  <span className="text-orange-500 font-bold">{registrations?.length || 0}</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Verified:</span>
                  <span className="text-green-500 font-bold">
                    {registrations?.filter(r => r.is_verified).length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative p-px" style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}>
            <div
              className="absolute inset-0 bg-white/20 group-hover:bg-orange-500/50 transition-colors duration-300"
              style={{ clipPath: cardClipPath }}
            />
            <div className="relative bg-[#0A090F] p-6" style={{ clipPath: cardClipPath }}>
              <h3 className="text-xl font-hackwise text-white uppercase mb-4 flex items-center gap-2">
                <i className="ri-file-text-line text-orange-500 text-2xl" />
                Tasks Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-white/80">
                  <span>Assigned Tasks:</span>
                  <span className="text-orange-500 font-bold">{tasks?.length || 0}</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Completed:</span>
                  <span className="text-green-500 font-bold">
                    {tasks?.filter(t => t.submission_status === 'APPROVED').length || 0}
                  </span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Pending:</span>
                  <span className="text-yellow-500 font-bold">
                    {tasks?.filter(t => t.submission_status === 'PENDING' || !t.has_submission).length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {ca.is_organising_team_candidate && (
        <div className="relative group">
          <div className="absolute inset-0 bg-green-500/20 blur-xl opacity-50 transition-opacity duration-500" />
          <div className="relative p-px" style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}>
            <div
              className="absolute inset-0 bg-white/20 group-hover:bg-green-500/50 transition-colors duration-300"
              style={{ clipPath: cardClipPath }}
            />
            <div className="relative bg-[#0A090F] p-6" style={{ clipPath: cardClipPath }}>
              <div className="flex items-center gap-3">
                <i className="ri-trophy-fill text-yellow-500 text-3xl" />
                <div>
                  <h3 className="text-xl font-hackwise text-white uppercase">
                    Organising Team Candidate
                  </h3>
                  <p className="text-white/60 font-sans text-sm mt-1">
                    Congratulations! You're eligible for the Hackwise 2.0 Organising Team selection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RegistrationsTab({ registrations }) {
  const cardClipPath = "polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)";

  if (!registrations || registrations.length === 0) {
    return (
      <div className="text-center text-white/60 font-mono py-12">
        No registrations yet. Share your referral link to get started!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {registrations.map((reg) => (
        <div key={reg.id} className="relative group">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative p-px" style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}>
            <div
              className="absolute inset-0 bg-white/20 group-hover:bg-blue-500/50 transition-colors duration-300"
              style={{ clipPath: cardClipPath }}
            />
            <div className="relative bg-[#0A090F] p-6" style={{ clipPath: cardClipPath }}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-hackwise text-white uppercase mb-2">{reg.team_name}</h3>
                  <div className="flex gap-4 text-sm text-white/60 font-sans">
                    <span>Members: {reg.member_count}</span>
                    <span>•</span>
                    <span>{new Date(reg.registration_date).toLocaleDateString()}</span>
                  </div>
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
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TasksTab({ tasks, onRefresh }) {
  const cardClipPath = "polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)";
  const btnClipPath = "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)";
  const [selectedTask, setSelectedTask] = useState(null);
  const [submissionData, setSubmissionData] = useState({
    submission_text: '',
    file: null,
    screenshot: null,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    return await res.json();
  };

  const handleSubmit = async (taskId) => {
    setSubmitting(true);
    try {
      let fileUrl = null;
      let screenshotUrl = null;

      if (submissionData.file) {
        const { url } = await handleFileUpload(submissionData.file);
        fileUrl = url;
      }

      if (submissionData.screenshot) {
        const { url } = await handleFileUpload(submissionData.screenshot);
        screenshotUrl = url;
      }

      const res = await fetch('/api/ca/tasks/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: taskId,
          submission_text: submissionData.submission_text,
          file_url: fileUrl,
          screenshot_url: screenshotUrl,
        }),
      });

      if (res.ok) {
        alert('Task submitted successfully!');
        setSelectedTask(null);
        setSubmissionData({ submission_text: '', file: null, screenshot: null });
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Error submitting task');
    } finally {
      setSubmitting(false);
    }
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center text-white/60 font-mono py-12">
        No tasks assigned yet. Check back later!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task.id} className="relative group">
          <div className="absolute inset-0 bg-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative p-px" style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}>
            <div
              className="absolute inset-0 bg-white/20 group-hover:bg-orange-500/50 transition-colors duration-300"
              style={{ clipPath: cardClipPath }}
            />
            <div className="relative bg-[#0A090F] p-6" style={{ clipPath: cardClipPath }}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-hackwise text-white uppercase mb-2">{task.title}</h3>
                  <p className="text-white/70 font-sans text-sm mb-2">{task.description}</p>
                  <div className="flex gap-4 text-xs text-white/60 font-mono">
                    <span>Type: {task.task_type}</span>
                    <span>•</span>
                    <span>Points: {task.points_on_completion}</span>
                    {task.is_early_submission && (
                      <>
                        <span>•</span>
                        <span className="text-green-400">+{task.bonus_points_early} early bonus</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 rounded text-xs font-bold ${
                      task.submission_status === 'APPROVED'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : task.submission_status === 'REJECTED'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : task.has_submission
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-white/10 text-white/60 border border-white/20'
                    }`}
                  >
                    {task.submission_status || 'Not Submitted'}
                  </span>
                  {task.is_overdue && !task.has_submission && (
                    <span className="text-xs text-red-400 font-mono">OVERDUE</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-white/60 font-mono mb-4">
                <i className="ri-calendar-line text-sm" />
                <span>Deadline: {new Date(task.deadline).toLocaleString()}</span>
              </div>

              {task.admin_feedback && (
                <div className="bg-white/5 border-l-4 border-orange-500 p-3 mb-4">
                  <p className="text-sm text-white/80 font-sans">
                    <span className="text-orange-500 font-semibold">Admin Feedback:</span> {task.admin_feedback}
                  </p>
                </div>
              )}

              {!task.has_submission && !task.is_overdue && (
                <button
                  onClick={() => setSelectedTask(task)}
                  className="px-6 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 font-mono text-sm hover:bg-orange-500/30 transition-colors uppercase"
                  style={{ clipPath: btnClipPath }}
                >
                  Submit Task
                </button>
              )}

              {task.has_submission && (
                <div className="text-xs text-white/60 font-mono">
                  Submitted: {new Date(task.submitted_at).toLocaleString()}
                  {task.points_awarded > 0 && (
                    <span className="text-green-400 ml-2">Points: {task.points_awarded}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Submission Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A090F] border border-white/10 p-8 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-hackwise text-white uppercase mb-6">
              Submit: {selectedTask.title}
            </h2>

            <div className="space-y-4">
              {(selectedTask.task_type === 'TEXT' || selectedTask.task_type === 'MIXED') && (
                <div>
                  <label className="block text-sm font-mono text-orange-500/80 mb-2 uppercase">
                    Submission Text
                  </label>
                  <textarea
                    value={submissionData.submission_text}
                    onChange={(e) => setSubmissionData({ ...submissionData, submission_text: e.target.value })}
                    rows={6}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white font-sans focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
                  />
                </div>
              )}

              {(selectedTask.task_type === 'FILE' || selectedTask.task_type === 'MIXED') && (
                <div>
                  <label className="block text-sm font-mono text-orange-500/80 mb-2 uppercase">
                    Upload File
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setSubmissionData({ ...submissionData, file: e.target.files[0] })}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white font-sans focus:outline-none focus:border-orange-500/50 transition-colors"
                  />
                </div>
              )}

              {(selectedTask.task_type === 'SCREENSHOT' || selectedTask.task_type === 'MIXED') && (
                <div>
                  <label className="block text-sm font-mono text-orange-500/80 mb-2 uppercase">
                    Upload Screenshot
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSubmissionData({ ...submissionData, screenshot: e.target.files[0] })}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white font-sans focus:outline-none focus:border-orange-500/50 transition-colors"
                  />
                </div>
              )}

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => {
                    setSelectedTask(null);
                    setSubmissionData({ submission_text: '', file: null, screenshot: null });
                  }}
                  className="px-6 py-2 text-white/60 hover:text-white font-mono uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmit(selectedTask.id)}
                  disabled={submitting}
                  className="px-6 py-2 bg-orange-500 text-black font-mono font-bold hover:bg-orange-600 transition-colors uppercase disabled:opacity-50"
                  style={{ clipPath: btnClipPath }}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LeaderboardTab({ leaderboard, currentCaCode }) {
  const cardClipPath = "polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)";

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="text-center text-white/60 font-mono py-12">
        No leaderboard data available yet.
      </div>
    );
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return <i className="ri-trophy-fill text-yellow-500 text-2xl" />;
    if (rank === 2) return <i className="ri-trophy-fill text-gray-400 text-2xl" />;
    if (rank === 3) return <i className="ri-trophy-fill text-orange-600 text-2xl" />;
    return <span className="text-white/40 font-mono">#{rank}</span>;
  };

  return (
    <div className="space-y-3">
      {leaderboard.map((ca, index) => {
        const rank = index + 1;
        const isCurrent = ca.ca_code === currentCaCode;

        return (
          <div
            key={ca.id}
            className={`relative group ${
              isCurrent ? 'ring-2 ring-orange-500' : ''
            }`}
          >
            <div className="absolute inset-0 bg-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative p-px" style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}>
              <div
                className={`absolute inset-0 transition-colors duration-300 ${
                  isCurrent ? 'bg-orange-500/50' : 'bg-white/20 group-hover:bg-orange-500/50'
                }`}
                style={{ clipPath: cardClipPath }}
              />
              <div className="relative bg-[#0A090F] p-6" style={{ clipPath: cardClipPath }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center">
                      {getRankIcon(rank)}
                    </div>
                    <div>
                      <h3 className="text-lg font-hackwise text-white uppercase">
                        {ca.name} {isCurrent && <span className="text-orange-500">(You)</span>}
                      </h3>
                      <p className="text-sm text-white/60 font-mono">{ca.ca_code}</p>
                    </div>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <div className="text-orange-500 font-bold text-lg">{ca.performance_score}</div>
                      <div className="text-white/60 text-xs">Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-400 font-bold text-lg">{ca.verified_registrations}</div>
                      <div className="text-white/60 text-xs">Regs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-400 font-bold text-lg">{ca.approved_tasks}</div>
                      <div className="text-white/60 text-xs">Tasks</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


