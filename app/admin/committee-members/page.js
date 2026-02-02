'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, X, Save } from 'lucide-react';

const CARD_CLIP = 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)';
const BTN_CLIP = 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)';

export default function CommitteeMembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    role: '',
    bio: '',
    email: '',
    linkedin_url: '',
    github_url: '',
    twitter_url: '',
    portfolio_url: '',
    image_url: '',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/admin/committee-members');
      const data = await res.json();
      setMembers(data.members || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      alert('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      role: '',
      bio: '',
      email: '',
      linkedin_url: '',
      github_url: '',
      twitter_url: '',
      portfolio_url: '',
      image_url: '',
      display_order: 0,
      is_active: true,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const data = await res.json();
      
      // Validate that we got a proper URL (not base64)
      if (!data.url || data.url.startsWith('data:')) {
        throw new Error('Invalid image URL received');
      }
      
      setForm({ ...form, image_url: data.url });
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Failed to upload image: ${error.message || 'Unknown error'}`);
    }
  };
  
  // Helper function to check if URL is valid (not base64)
  const isValidImageUrl = (url) => {
    if (!url) return false;
    if (url.startsWith('data:')) return false; // Reject base64
    if (url.startsWith('http://') || url.startsWith('https://')) return true;
    if (url.startsWith('/')) return true; // Allow relative paths
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId
        ? '/api/admin/committee-members'
        : '/api/admin/committee-members';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { ...form, id: editingId } : form;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save member');
      }

      resetForm();
      fetchMembers();
    } catch (error) {
      console.error('Save error:', error);
      alert(error.message || 'Failed to save member');
    }
  };

  const handleEdit = (member) => {
    setForm({
      name: member.name || '',
      role: member.role || '',
      bio: member.bio || '',
      email: member.email || '',
      linkedin_url: member.linkedin_url || '',
      github_url: member.github_url || '',
      twitter_url: member.twitter_url || '',
      portfolio_url: member.portfolio_url || '',
      image_url: member.image_url || '',
      display_order: member.display_order || 0,
      is_active: member.is_active !== undefined ? member.is_active : true,
    });
    setEditingId(member.id);
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this member?')) return;

    try {
      const res = await fetch(`/api/admin/committee-members?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete member');

      fetchMembers();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete member');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-hackwise text-white uppercase tracking-wider mb-2">
          Committee <span className="text-orange-500">Members</span>
        </h1>
        <p className="text-white/60 font-mono text-sm">Manage organizing committee members</p>
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="mb-8 bg-white/5 border border-white/10 p-6 backdrop-blur-sm relative">
          <div className="absolute top-0 right-0 p-4">
            <button
              onClick={resetForm}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-mono focus:outline-none focus:border-orange-500/60"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                  Role *
                </label>
                <input
                  type="text"
                  required
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-mono focus:outline-none focus:border-orange-500/60"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                  Bio
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-sans focus:outline-none focus:border-orange-500/60"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-mono focus:outline-none focus:border-orange-500/60"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={form.display_order}
                  onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-mono focus:outline-none focus:border-orange-500/60"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={form.linkedin_url}
                  onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-mono focus:outline-none focus:border-orange-500/60"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={form.github_url}
                  onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-mono focus:outline-none focus:border-orange-500/60"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                  Twitter URL
                </label>
                <input
                  type="url"
                  value={form.twitter_url}
                  onChange={(e) => setForm({ ...form, twitter_url: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-mono focus:outline-none focus:border-orange-500/60"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                  Portfolio URL
                </label>
                <input
                  type="url"
                  value={form.portfolio_url}
                  onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2 text-white font-mono focus:outline-none focus:border-orange-500/60"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                  Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="/uploads/image.jpg or https://..."
                    className="flex-1 bg-white/5 border border-white/10 px-4 py-2 text-white font-mono focus:outline-none focus:border-orange-500/60"
                  />
                  <label className="relative inline-flex items-center justify-center cursor-pointer">
                    <div
                      className="absolute inset-0 bg-orange-500/80 hover:bg-orange-500 transition-colors duration-300"
                      style={{ clipPath: BTN_CLIP }}
                    />
                    <div
                      className="relative m-[1px] px-4 py-2 transition-all duration-300"
                      style={{ clipPath: BTN_CLIP }}
                    >
                      <Upload size={16} className="text-white" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) handleImageUpload(file);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                {form.image_url && isValidImageUrl(form.image_url) && (
                  <div className="mt-2 w-32 h-32 border border-white/10 overflow-hidden">
                    <img
                      src={form.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                {form.image_url && !isValidImageUrl(form.image_url) && (
                  <div className="mt-2 p-2 bg-red-500/10 border border-red-500/50 text-red-400 text-xs">
                    Invalid image URL. Please upload a new image.
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-xs font-mono text-white/60 uppercase">Active</span>
                </label>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="relative inline-flex items-center justify-center group cursor-pointer"
              >
                <div
                  className="absolute inset-0 bg-orange-500/80 group-hover:bg-orange-500 transition-colors duration-300"
                  style={{ clipPath: BTN_CLIP }}
                />
                <div
                  className="relative m-[1px] px-6 py-3 text-center transition-all duration-300"
                  style={{ clipPath: BTN_CLIP }}
                >
                  <span className="relative text-white font-mono font-bold text-sm uppercase tracking-[0.3em] flex items-center gap-2">
                    <Save size={16} />
                    {editingId ? 'Update' : 'Create'} Member
                  </span>
                </div>
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors font-mono text-sm uppercase"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Button */}
      {!isAdding && (
        <div className="mb-6">
          <button
            onClick={() => setIsAdding(true)}
            className="relative inline-flex items-center justify-center group cursor-pointer"
          >
            <div
              className="absolute inset-0 bg-orange-500/80 group-hover:bg-orange-500 transition-colors duration-300"
              style={{ clipPath: BTN_CLIP }}
            />
            <div
              className="relative m-[1px] px-6 py-3 text-center transition-all duration-300"
              style={{ clipPath: BTN_CLIP }}
            >
              <span className="relative text-white font-mono font-bold text-sm uppercase tracking-[0.3em] flex items-center gap-2">
                <Plus size={16} />
                Add Member
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Members List */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto animate-spin" />
          <p className="mt-4 text-white/60 font-mono">Loading members...</p>
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/10 p-8">
          <p className="text-white/60 font-mono">No members found. Add your first member above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white/5 border border-white/10 p-6 backdrop-blur-sm relative group hover:border-orange-500/30 transition-colors duration-300"
              style={{ clipPath: CARD_CLIP }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-hackwise text-white uppercase mb-1">{member.name}</h3>
                  <p className="text-sm text-orange-400 font-mono">{member.role}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(member)}
                    className="p-2 bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all text-white/60 hover:text-white"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="p-2 bg-white/5 border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 transition-all text-white/60 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {member.image_url && isValidImageUrl(member.image_url) && (
                <div className="mb-4 aspect-square overflow-hidden border border-white/10">
                  <img
                    src={member.image_url}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              {member.image_url && !isValidImageUrl(member.image_url) && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 text-red-400 text-xs text-center">
                  Invalid image URL. Please edit and upload a new image.
                </div>
              )}
              {member.bio && (
                <p className="text-xs text-white/70 line-clamp-3 mb-2">{member.bio}</p>
              )}
              <div className="flex items-center gap-2 text-xs text-white/50 font-mono">
                <span>Order: {member.display_order}</span>
                <span>•</span>
                <span className={member.is_active ? 'text-green-400' : 'text-red-400'}>
                  {member.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

