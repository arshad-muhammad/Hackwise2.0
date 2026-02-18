'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  X, 
  Play, 
  Upload, 
  Image as ImageIcon, 
  Video,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2
} from 'lucide-react';

const categories = ['All', 'Day 1', 'Day 2', 'Day 3', 'Tech Events', 'Hackathon', 'Winners', 'Fun Moments'];

export default function GalleryPage() {
  const [media, setMedia] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [stats, setStats] = useState({
    hackers: 160,
    hours: 24,
    prize: 60,
    photos: 0,
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const observerRef = useRef(null);
  const lastMediaRef = useCallback((node) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prev) => prev + 1);
      }
    });
    if (node) observerRef.current.observe(node);
  }, [loading, hasMore]);

  // Fetch media
  useEffect(() => {
    fetchMedia();
  }, [selectedCategory, page]);

  // Fetch featured
  useEffect(() => {
    fetchFeatured();
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(page === 1);
      const response = await fetch(
        `/api/gallery?category=${selectedCategory}&page=${page}&limit=20`
      );
      const data = await response.json();
      
      if (page === 1) {
        setMedia(data.media || []);
      } else {
        setMedia((prev) => [...prev, ...(data.media || [])]);
      }
      
      setHasMore(data.pagination?.totalPages > page);
      setStats((prev) => ({ ...prev, photos: data.stats?.totalMedia || 0 }));
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeatured = async () => {
    try {
      const response = await fetch('/api/gallery?featured=true&limit=8');
      const data = await response.json();
      setFeatured(data.media || []);
    } catch (error) {
      console.error('Error fetching featured:', error);
    }
  };

  // Animated counters
  useEffect(() => {
    const counters = ['hackers', 'hours', 'prize', 'photos'];
    counters.forEach((key) => {
      const target = stats[key];
      const duration = 2000;
      const increment = target / (duration / 16);
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setStats((prev) => ({ ...prev, [key]: Math.round(target) }));
          clearInterval(timer);
        } else {
          setStats((prev) => ({ ...prev, [key]: Math.round(current) }));
        }
      }, 16);
    });
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    // Validate file before upload
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('caption', document.getElementById('caption')?.value || '');
    formData.append('category', document.getElementById('category')?.value || 'Hackathon');
    formData.append('teamName', document.getElementById('teamName')?.value || '');

    setUploading(true);
    setUploadProgress(0);

    try {
      // Use fetch API with better error handling
      const response = await fetch('/api/gallery', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUploading(false);
        setUploadProgress(100);
        setShowUpload(false);
        // Reset form
        if (fileInputRef.current) fileInputRef.current.value = '';
        const captionInput = document.getElementById('caption');
        if (captionInput) captionInput.value = '';
        const teamNameInput = document.getElementById('teamName');
        if (teamNameInput) teamNameInput.value = '';
        // Refresh media
        setPage(1);
        fetchMedia();
        alert('Upload successful! Your media is pending approval.');
      } else {
        setUploading(false);
        const errorMsg = data.error || 'Upload failed. Please try again.';
        alert(errorMsg);
        console.error('Upload error:', data);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      alert(`Upload failed: ${error.message || 'Network error. Please check your connection.'}`);
    }
  };

  const openModal = (item, index) => {
    setSelectedMedia({ ...item, index });
  };

  const closeModal = () => {
    setSelectedMedia(null);
  };

  const navigateMedia = (direction) => {
    if (!selectedMedia) return;
    const currentIndex = media.findIndex((m) => m.id === selectedMedia.id);
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < media.length) {
      setSelectedMedia({ ...media[newIndex], index: newIndex });
    }
  };

  // Swipe handlers for mobile
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      navigateMedia('next');
    }
    if (isRightSwipe) {
      navigateMedia('prev');
    }
  };

  const handleKeyPress = (e) => {
    if (selectedMedia) {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') navigateMedia('prev');
      if (e.key === 'ArrowRight') navigateMedia('next');
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedMedia]);

  return (
    <div className="min-h-screen bg-[#0A090F] text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A090F] via-[#0A090F] to-black/50"></div>
        
        <div className="container mx-auto px-6 md:px-12 lg:px-24 py-20 md:py-32 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* Left: Text Content */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-hackwise uppercase tracking-wider mb-2 leading-tight">
                  HACKWISE
                </h1>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-hackwise uppercase tracking-wider mb-4 leading-tight">
                  <span className="text-orange-500">2.0</span>
                </h2>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-hackwise uppercase tracking-wider text-orange-500 mb-6 leading-tight">
                  Captured Moments
                </h3>
              </motion.div>
              
              <motion.p
                className="text-base md:text-lg lg:text-xl text-white/70 font-display leading-relaxed"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Relive the energy. Feel the grind.
              </motion.p>

              {/* Animated Counters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8">
                {[
                  { label: 'Hackers', value: stats.hackers, suffix: '+' },
                  { label: 'Hours', value: stats.hours, suffix: '' },
                  { label: 'Prize Pool', value: stats.prize, suffix: 'K' },
                  { label: 'Photos', value: stats.photos, suffix: '+' },
                ].map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 md:p-6 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1, duration: 0.6 }}
                  >
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-orange-500 mb-1 md:mb-2">
                      {stat.value}{stat.suffix}
                    </div>
                    <div className="text-xs md:text-sm text-white/60 uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: Featured Image/Video */}
            <motion.div
              className="relative w-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              {featured[0] ? (
                <div 
                  className="relative aspect-video rounded-xl md:rounded-2xl overflow-hidden border border-white/20 group cursor-pointer"
                  onClick={() => openModal(featured[0], 0)}
                >
                  {featured[0].media_type === 'video' ? (
                    <video
                      src={featured[0].cloudinary_url}
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={featured[0].cloudinary_url}
                      alt={featured[0].caption || 'Featured'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4 md:p-8">
                    <div>
                      <div className="text-orange-500 text-xs md:text-sm uppercase tracking-widest mb-1 md:mb-2">
                        Editor's Pick
                      </div>
                      <div className="text-base md:text-xl lg:text-2xl font-display line-clamp-2">
                        {featured[0].caption || 'Featured Moment'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-video rounded-xl md:rounded-2xl overflow-hidden border border-white/20 bg-white/5 flex items-center justify-center p-8">
                  <div className="text-white/40 text-center">
                    <ImageIcon size={40} className="mx-auto mb-3 md:mb-4 opacity-50" />
                    <p className="text-xs md:text-sm uppercase tracking-wider">Featured Media Coming Soon</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      {featured.length > 0 && (
        <section className="py-24 px-6 md:px-12 lg:px-24">
          <motion.h2
            className="text-4xl md:text-5xl font-hackwise uppercase mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Editor's Picks
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.slice(1, 9).map((item, idx) => (
              <motion.div
                key={item.id}
                className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => openModal(item, idx)}
                whileHover={{ scale: 1.05, borderColor: 'rgba(249, 115, 22, 0.5)' }}
              >
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
                    alt={item.caption || 'Featured'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <p className="text-white text-sm">{item.caption || 'Featured'}</p>
                </div>
                {item.media_type === 'video' && (
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs flex items-center gap-1">
                    <Play size={12} />
                    <span>Video</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Filter Bar (Sticky) */}
      <div className="sticky top-0 z-40 bg-[#0A090F]/95 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 md:px-12 lg:px-24 py-4">
          <div className="flex items-center justify-between gap-4 overflow-x-auto">
            <div className="flex items-center gap-2 flex-1">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                const count = cat === 'All' ? stats.photos : 0;
                
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setPage(1);
                      setMedia([]);
                    }}
                    className="relative px-6 py-3 text-sm uppercase tracking-wider font-mono transition-colors whitespace-nowrap"
                  >
                    <span className={isActive ? 'text-orange-500' : 'text-white/60 hover:text-white'}>
                      {cat}
                    </span>
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                        layoutId="activeFilter"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    {count > 0 && (
                      <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowUpload(true)}
              className="px-6 py-3 bg-orange-500/20 border border-orange-500/50 text-orange-500 uppercase tracking-wider text-sm font-mono hover:bg-orange-500/30 transition-colors whitespace-nowrap flex items-center gap-2"
            >
              <Upload size={16} />
              Upload
            </button>
          </div>
        </div>
      </div>

      {/* Main Gallery Grid */}
      <section className="py-12 px-6 md:px-12 lg:px-24">
        {loading && media.length === 0 ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="animate-spin text-orange-500" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {media.map((item, idx) => (
              <motion.div
                key={item.id}
                ref={idx === media.length - 1 ? lastMediaRef : null}
                className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm cursor-pointer"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx % 20 * 0.05 }}
                onClick={() => openModal(item, idx)}
                whileHover={{ y: -8, borderColor: 'rgba(249, 115, 22, 0.5)' }}
              >
                {item.media_type === 'video' ? (
                  <>
                    <video
                      src={item.cloudinary_url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="text-white ml-1" size={24} />
                      </div>
                    </div>
                    {item.duration && (
                      <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs">
                        {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                      </div>
                    )}
                  </>
                ) : (
                  <img
                    src={item.cloudinary_url}
                    alt={item.caption || 'Gallery'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                )}
                {item.caption && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white text-sm">{item.caption}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
        
        {!hasMore && media.length > 0 && (
          <div className="text-center py-12 text-white/40 text-sm uppercase tracking-wider">
            End of Gallery
          </div>
        )}
      </section>

      {/* Upload Section Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !uploading && setShowUpload(false)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div
              className="relative bg-[#0A090F] border border-white/20 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-hackwise uppercase">Upload Media</h2>
                <button
                  onClick={() => setShowUpload(false)}
                  className="text-white/60 hover:text-white transition-colors"
                  disabled={uploading}
                >
                  <X size={24} />
                </button>
              </div>

              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                  dragActive
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-white/20 hover:border-white/40'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
                
                {uploading ? (
                  <div className="space-y-4">
                    <Loader2 className="animate-spin text-orange-500 mx-auto" size={48} />
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        className="bg-orange-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-white/60">Uploading... {Math.round(uploadProgress)}%</p>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto mb-4 text-white/40" size={48} />
                    <p className="text-white/60 mb-2">
                      Drag & drop your file here, or{' '}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-orange-500 hover:text-orange-400 underline"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-xs text-white/40">
                      Images: Max 10MB (jpg, png, webp) | Videos: Max 30MB (mp4, webm)
                    </p>
                  </>
                )}
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2 uppercase tracking-wider">
                    Caption
                  </label>
                  <input
                    id="caption"
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500/50"
                    placeholder="Describe this moment..."
                    disabled={uploading}
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2 uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    id="category"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500/50"
                    disabled={uploading}
                  >
                    {categories.slice(1).map((cat) => (
                      <option key={cat} value={cat} className="bg-[#0A090F]">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2 uppercase tracking-wider">
                    Team Name (Optional)
                  </label>
                  <input
                    id="teamName"
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500/50"
                    placeholder="Your team name..."
                    disabled={uploading}
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="text-orange-500 mt-0.5" size={20} />
                <div className="text-sm text-white/80">
                  <p className="font-semibold mb-1">Pending Approval</p>
                  <p className="text-white/60">
                    All uploads are reviewed before publishing.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 z-10 text-white/80 hover:text-white transition-colors"
            >
              <X size={32} />
            </button>

            <motion.div
              className="relative max-w-7xl max-h-[90vh] w-full mx-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {selectedMedia.media_type === 'video' ? (
                <video
                  src={selectedMedia.cloudinary_url}
                  className="w-full h-full max-h-[90vh] object-contain rounded-lg"
                  controls
                  autoPlay
                />
              ) : (
                <img
                  src={selectedMedia.cloudinary_url}
                  alt={selectedMedia.caption || 'Gallery'}
                  className="w-full h-full max-h-[90vh] object-contain rounded-lg"
                />
              )}

              {selectedMedia.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 rounded-b-lg">
                  <p className="text-white text-lg">{selectedMedia.caption}</p>
                </div>
              )}

              <div className="absolute bottom-6 right-6 flex gap-4">
                <a
                  href={selectedMedia.cloudinary_url}
                  download
                  className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-lg text-white hover:bg-white/20 transition-colors flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download size={20} />
                  Download
                </a>
              </div>

              {media.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateMedia('prev');
                    }}
                    disabled={selectedMedia.index === 0}
                    className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm border border-white/20 p-3 rounded-full text-white hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateMedia('next');
                    }}
                    disabled={selectedMedia.index === media.length - 1}
                    className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm border border-white/20 p-3 rounded-full text-white hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

