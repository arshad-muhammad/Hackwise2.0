'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trash2, 
  Check, 
  X, 
  Star, 
  StarOff, 
  Image as ImageIcon, 
  Video,
  Loader2,
  Search,
  Filter
} from 'lucide-react';

export default function AdminGalleryPage() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'approved', 'pending'
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchMedia();
  }, [statusFilter, page]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/gallery?status=${statusFilter === 'all' ? '' : statusFilter}&page=${page}&limit=50`
      );
      
      if (response.status === 401) {
        window.location.href = '/admin/login';
        return;
      }

      const data = await response.json();
      setMedia(data.media || []);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this media? This action cannot be undone.')) {
      return;
    }

    setDeleting(id);
    try {
      const response = await fetch(`/api/gallery?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMedia((prev) => prev.filter((m) => m.id !== id));
      } else {
        alert('Failed to delete media');
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      alert('Failed to delete media');
    } finally {
      setDeleting(null);
    }
  };

  const handleUpdate = async (id, updates) => {
    setUpdating(id);
    try {
      const response = await fetch('/api/admin/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });

      if (response.ok) {
        setMedia((prev) =>
          prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
        );
      } else {
        alert('Failed to update media');
      }
    } catch (error) {
      console.error('Error updating media:', error);
      alert('Failed to update media');
    } finally {
      setUpdating(null);
    }
  };

  const filteredMedia = media.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.caption?.toLowerCase().includes(query) ||
      item.team_name?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-hackwise uppercase mb-2">Gallery Management</h1>
        <p className="text-white/60">Manage and moderate gallery media</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2 flex-1 min-w-[200px]">
          <Search size={18} className="text-white/40" />
          <input
            type="text"
            placeholder="Search by caption, team, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-white flex-1"
          />
        </div>

        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2">
          <Filter size={18} className="text-white/40" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-transparent border-none outline-none text-white"
          >
            <option value="all" className="bg-[#0A090F]">All Media</option>
            <option value="approved" className="bg-[#0A090F]">Approved</option>
            <option value="pending" className="bg-[#0A090F]">Pending</option>
          </select>
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="animate-spin text-orange-500" size={48} />
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="text-center py-32 text-white/40">
          <p>No media found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMedia.map((item) => (
            <motion.div
              key={item.id}
              className="group relative bg-white/5 border border-white/10 rounded-xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ borderColor: 'rgba(249, 115, 22, 0.5)' }}
            >
              {/* Media Preview */}
              <div className="relative aspect-square">
                {item.media_type === 'video' ? (
                  <video
                    src={item.cloudinary_url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={item.cloudinary_url}
                    alt={item.caption || 'Media'}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Status Badge */}
                <div className="absolute top-2 left-2">
                  {item.is_approved ? (
                    <span className="bg-green-500/80 backdrop-blur-sm px-2 py-1 rounded text-xs uppercase">
                      Approved
                    </span>
                  ) : (
                    <span className="bg-orange-500/80 backdrop-blur-sm px-2 py-1 rounded text-xs uppercase">
                      Pending
                    </span>
                  )}
                </div>

                {/* Type Badge */}
                <div className="absolute top-2 right-2">
                  {item.media_type === 'video' ? (
                    <Video size={16} className="text-white bg-black/50 backdrop-blur-sm p-1.5 rounded" />
                  ) : (
                    <ImageIcon size={16} className="text-white bg-black/50 backdrop-blur-sm p-1.5 rounded" />
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                {item.caption && (
                  <p className="text-sm text-white/80 line-clamp-2">{item.caption}</p>
                )}
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span className="uppercase">{item.category}</span>
                  {item.team_name && <span>{item.team_name}</span>}
                </div>
                <div className="text-xs text-white/40">
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {!item.is_approved && (
                    <button
                      onClick={() => handleUpdate(item.id, { is_approved: true })}
                      disabled={updating === item.id}
                      className="p-2 bg-green-500/20 border border-green-500/50 rounded text-green-500 hover:bg-green-500/30 transition-colors disabled:opacity-50"
                      title="Approve"
                    >
                      {updating === item.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Check size={16} />
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => handleUpdate(item.id, { is_featured: !item.is_featured })}
                    disabled={updating === item.id}
                    className={`p-2 rounded transition-colors disabled:opacity-50 ${
                      item.is_featured
                        ? 'bg-orange-500/20 border border-orange-500/50 text-orange-500 hover:bg-orange-500/30'
                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                    title={item.is_featured ? 'Remove from featured' : 'Add to featured'}
                  >
                    {updating === item.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : item.is_featured ? (
                      <Star size={16} />
                    ) : (
                      <StarOff size={16} />
                    )}
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deleting === item.id}
                  className="p-2 bg-red-500/20 border border-red-500/50 rounded text-red-500 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  {deleting === item.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredMedia.length > 0 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          >
            Previous
          </button>
          <span className="text-white/60">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={filteredMedia.length < 50}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

