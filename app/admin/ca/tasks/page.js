'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Calendar,
  Users,
  FileText,
} from 'lucide-react';

export default function CATasksAdminPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    task_type: 'TEXT',
    deadline: '',
    points_on_completion: 5,
    bonus_points_early: 2,
    early_submission_hours: 24,
  });
  const [allCAs, setAllCAs] = useState([]);
  const [selectedCAs, setSelectedCAs] = useState([]);
  const [assignToAll, setAssignToAll] = useState(true);

  useEffect(() => {
    fetchTasks();
    fetchCAs();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/admin/ca/tasks?is_active=true');
      const data = await res.json();
      setTasks(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
      setLoading(false);
    }
  };

  const fetchCAs = async () => {
    try {
      const res = await fetch('/api/admin/ca?status=APPROVED');
      const data = await res.json();
      setAllCAs(data);
    } catch (error) {
      console.error('Failed to fetch CAs', error);
    }
  };

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/admin/ca/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskForm,
          deadline: new Date(taskForm.deadline).toISOString(),
          assign_to_all: assignToAll,
          assigned_ca_ids: assignToAll ? null : selectedCAs,
        }),
      });

      if (res.ok) {
        alert('Task created successfully!');
        setShowCreateModal(false);
        setTaskForm({
          title: '',
          description: '',
          task_type: 'TEXT',
          deadline: '',
          points_on_completion: 5,
          bonus_points_early: 2,
          early_submission_hours: 24,
        });
        fetchTasks();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Failed to create task', error);
      alert('Error creating task');
    }
  };

  const handleAssign = async (taskId) => {
    try {
      const res = await fetch('/api/admin/ca/tasks/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: taskId,
          assign_to_all: assignToAll,
          ca_ids: assignToAll ? null : selectedCAs,
        }),
      });

      if (res.ok) {
        alert('Task assigned successfully!');
        fetchTasks();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to assign task');
      }
    } catch (error) {
      console.error('Failed to assign task', error);
      alert('Error assigning task');
    }
  };

  const cardClipPath = "polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)";
  const btnClipPath = "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)";

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-display font-bold uppercase tracking-tight text-white">
            CA Task <span className="text-orange-500">Management</span>
          </h1>
          <p className="text-white/60 mt-2 font-mono text-sm">Create and assign tasks to Campus Ambassadors</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-orange-500 text-black font-mono font-bold hover:bg-orange-600 transition-colors flex items-center gap-2"
          style={{ clipPath: btnClipPath }}
        >
          <Plus size={20} />
          CREATE TASK
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-white/60 font-mono py-12">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-white/60 font-mono py-12">No tasks created yet</div>
        ) : (
          tasks.map((task) => (
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
                        <span>•</span>
                        <span>Assigned: {task.assigned_count || 0} CAs</span>
                        <span>•</span>
                        <span>Submissions: {task.submission_count || 0}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAssign(task.id)}
                        className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono text-xs hover:bg-blue-500/30 transition-colors uppercase"
                        style={{ clipPath: btnClipPath }}
                      >
                        Assign
                      </button>
                      <a
                        href={`/admin/ca/tasks/${task.id}/review`}
                        className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 font-mono text-xs hover:bg-green-500/30 transition-colors uppercase"
                        style={{ clipPath: btnClipPath }}
                      >
                        Review
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60 font-mono">
                    <Calendar size={14} />
                    <span>Deadline: {new Date(task.deadline).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A090F] border border-white/10 p-8 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-hackwise text-white uppercase mb-6">Create New Task</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-mono text-orange-500/80 mb-2 uppercase">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white font-sans focus:outline-none focus:border-orange-500/50 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-mono text-orange-500/80 mb-2 uppercase">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white font-sans focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-mono text-orange-500/80 mb-2 uppercase">
                    Task Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={taskForm.task_type}
                    onChange={(e) => setTaskForm({ ...taskForm, task_type: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white font-sans focus:outline-none focus:border-orange-500/50 transition-colors"
                  >
                    <option value="TEXT">TEXT</option>
                    <option value="FILE">FILE</option>
                    <option value="SCREENSHOT">SCREENSHOT</option>
                    <option value="MIXED">MIXED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-mono text-orange-500/80 mb-2 uppercase">
                    Deadline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={taskForm.deadline}
                    onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white font-sans focus:outline-none focus:border-orange-500/50 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-mono text-orange-500/80 mb-2 uppercase">
                    Base Points
                  </label>
                  <input
                    type="number"
                    value={taskForm.points_on_completion}
                    onChange={(e) => setTaskForm({ ...taskForm, points_on_completion: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white font-sans focus:outline-none focus:border-orange-500/50 transition-colors"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-mono text-orange-500/80 mb-2 uppercase">
                    Early Bonus
                  </label>
                  <input
                    type="number"
                    value={taskForm.bonus_points_early}
                    onChange={(e) => setTaskForm({ ...taskForm, bonus_points_early: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white font-sans focus:outline-none focus:border-orange-500/50 transition-colors"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-mono text-orange-500/80 mb-2 uppercase">
                    Early Hours
                  </label>
                  <input
                    type="number"
                    value={taskForm.early_submission_hours}
                    onChange={(e) => setTaskForm({ ...taskForm, early_submission_hours: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white font-sans focus:outline-none focus:border-orange-500/50 transition-colors"
                    min="1"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <label className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={assignToAll}
                    onChange={(e) => setAssignToAll(e.target.checked)}
                    className="w-4 h-4 text-orange-500 bg-white/5 border-white/10"
                  />
                  <span className="text-white/80 font-sans">Assign to all approved CAs</span>
                </label>

                {!assignToAll && (
                  <div>
                    <label className="block text-sm font-mono text-orange-500/80 mb-2 uppercase">
                      Select CAs
                    </label>
                    <div className="max-h-40 overflow-y-auto bg-white/5 border border-white/10 p-4 space-y-2">
                      {allCAs.map((ca) => (
                        <label key={ca.id} className="flex items-center gap-2 text-white/80 font-sans text-sm">
                          <input
                            type="checkbox"
                            checked={selectedCAs.includes(ca.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCAs([...selectedCAs, ca.id]);
                              } else {
                                setSelectedCAs(selectedCAs.filter(id => id !== ca.id));
                              }
                            }}
                            className="w-4 h-4 text-orange-500 bg-white/5 border-white/10"
                          />
                          <span>{ca.name} ({ca.ca_code})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setTaskForm({
                      title: '',
                      description: '',
                      task_type: 'TEXT',
                      deadline: '',
                      points_on_completion: 5,
                      bonus_points_early: 2,
                      early_submission_hours: 24,
                    });
                    setSelectedCAs([]);
                    setAssignToAll(true);
                  }}
                  className="px-6 py-2 text-white/60 hover:text-white font-mono uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="px-6 py-2 bg-orange-500 text-black font-mono font-bold hover:bg-orange-600 transition-colors uppercase"
                  style={{ clipPath: btnClipPath }}
                >
                  CREATE TASK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

