'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Camera,
  Download,
  Image as ImageIcon,
  Loader2,
  Play,
  Upload,
  X,
} from 'lucide-react';

const filters = ['All', 'Images', 'Videos'];

export default function GalleryClient() {
  const [media, setMedia] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('All'); // All | Images | Videos
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [showCapture, setShowCapture] = useState(false);
  const [captureMode, setCaptureMode] = useState('photo'); // photo | video
  const [captureError, setCaptureError] = useState('');
  const [capturedFile, setCapturedFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [stats, setStats] = useState({
    hackers: 160,
    hours: 24,
    prize: 60,
    photos: 0,
    totalImages: 0,
    totalVideos: 0,
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);
  const observerRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const lastMediaRef = useCallback(
    (node) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) setPage((prev) => prev + 1);
      });
      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    void fetchMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilter, page]);

  useEffect(() => {
    void fetchFeatured();
  }, []);

  async function fetchMedia() {
    try {
      setLoading(page === 1);
      const type =
        selectedFilter === 'Images' ? 'image' : selectedFilter === 'Videos' ? 'video' : 'all';
      const res = await fetch(
        `/api/gallery?type=${type}&page=${page}&limit=20`
      );
      const data = await res.json();
      if (page === 1) setMedia(data.media || []);
      else setMedia((prev) => [...prev, ...(data.media || [])]);
      setHasMore((data.pagination?.totalPages || 0) > page);
      // Update counts so badges + hero stay correct
      setStats((prev) => ({
        ...prev,
        photos: data.stats?.totalMedia || 0,
        totalImages: data.stats?.totalImages || 0,
        totalVideos: data.stats?.totalVideos || 0,
      }));
    } catch (e) {
      console.error('Error fetching media:', e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchFeatured() {
    try {
      const res = await fetch('/api/gallery?featured=true&limit=8');
      const data = await res.json();
      setFeatured(data.media || []);
    } catch (e) {
      console.error('Error fetching featured:', e);
    }
  }

  // Simple counter animation on mount
  useEffect(() => {
    const keys = ['hackers', 'hours', 'prize', 'photos'];
    keys.forEach((key) => {
      const target = stats[key];
      const duration = 1200;
      const step = Math.max(1, Math.round(target / (duration / 16)));
      let current = 0;
      const t = setInterval(() => {
        current = Math.min(target, current + step);
        setStats((prev) => ({ ...prev, [key]: current }));
        if (current >= target) clearInterval(t);
      }, 16);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openModal(item, index) {
    setSelectedMedia({ ...item, index });
  }
  function closeModal() {
    setSelectedMedia(null);
  }

  function navigateMedia(direction) {
    if (!selectedMedia) return;
    const currentIndex = media.findIndex((m) => m.id === selectedMedia.id);
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < media.length) setSelectedMedia({ ...media[newIndex], index: newIndex });
  }

  useEffect(() => {
    function onKey(e) {
      if (!selectedMedia) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') navigateMedia('prev');
      if (e.key === 'ArrowRight') navigateMedia('next');
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedMedia, media]);

  const minSwipeDistance = 50;
  function onTouchStart(e) {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }
  function onTouchMove(e) {
    setTouchEnd(e.targetTouches[0].clientX);
  }
  function onTouchEnd() {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) navigateMedia('next');
    if (distance < -minSwipeDistance) navigateMedia('prev');
  }

  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    if (e.type === 'dragleave') setDragActive(false);
  }

  async function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) await handleFileUpload(e.dataTransfer.files[0]);
  }

  async function handleFileSelect(e) {
    if (e.target.files && e.target.files[0]) await handleFileUpload(e.target.files[0]);
  }

  async function handleFileUpload(file) {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('caption', document.getElementById('caption')?.value || '');
    formData.append('teamName', document.getElementById('teamName')?.value || '');

    setUploading(true);
    setUploadProgress(15);
    try {
      const res = await fetch('/api/gallery', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.success) {
        setUploadProgress(100);
        setShowUpload(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        const captionInput = document.getElementById('caption');
        if (captionInput) captionInput.value = '';
        const teamNameInput = document.getElementById('teamName');
        if (teamNameInput) teamNameInput.value = '';
        setPage(1);
        await fetchMedia();
        alert('Upload successful! Your media is pending approval.');
      } else {
        alert(data.error || 'Upload failed. Please try again.');
      }
    } catch (e) {
      console.error('Upload error:', e);
      alert(`Upload failed: ${e?.message || 'Network error'}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  async function openCapture() {
    setCaptureError('');
    setCapturedFile(null);
    setCaptureMode('photo');
    setIsRecording(false);
    setShowCapture(true);

    // Ask permission only after click
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (e) {
      console.error('Camera permission error:', e);
      setCaptureError('Camera access denied or unavailable. Please allow camera permissions and try again.');
    }
  }

  function closeCapture() {
    setShowCapture(false);
    setCapturedFile(null);
    setCaptureError('');
    setIsRecording(false);

    // Stop stream tracks
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    streamRef.current = null;
    recorderRef.current = null;
    chunksRef.current = [];
  }

  async function snapPhoto() {
    setCaptureError('');
    const video = videoRef.current;
    if (!video) return;

    try {
      const canvas = document.createElement('canvas');
      const w = video.videoWidth || 1280;
      const h = video.videoHeight || 720;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, w, h);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
      if (!blob) throw new Error('Failed to capture image');

      const file = new File([blob], `hackwise-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setCapturedFile(file);
    } catch (e) {
      console.error('Snap error:', e);
      setCaptureError('Failed to capture photo. Please try again.');
    }
  }

  async function toggleRecording() {
    setCaptureError('');
    const stream = streamRef.current;
    if (!stream) {
      setCaptureError('Camera stream not ready.');
      return;
    }

    if (isRecording) {
      try {
        recorderRef.current?.stop();
      } catch {}
      setIsRecording(false);
      return;
    }

    chunksRef.current = [];
    let mimeType = '';
    if (window.MediaRecorder?.isTypeSupported?.('video/webm;codecs=vp9')) mimeType = 'video/webm;codecs=vp9';
    else if (window.MediaRecorder?.isTypeSupported?.('video/webm;codecs=vp8')) mimeType = 'video/webm;codecs=vp8';
    else mimeType = 'video/webm';

    try {
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const file = new File([blob], `hackwise-capture-${Date.now()}.webm`, { type: 'video/webm' });
        setCapturedFile(file);
        chunksRef.current = [];
      };

      recorder.start(250);
      setIsRecording(true);
    } catch (e) {
      console.error('Recorder error:', e);
      setCaptureError('Video recording is not supported on this device/browser.');
    }
  }

  async function uploadCaptured() {
    if (!capturedFile) return;
    await handleFileUpload(capturedFile);
    closeCapture();
  }

  return (
    <div className="min-h-screen bg-[#0A090F] text-white">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-[#0A090F] via-[#0A090F] to-black/60" />
        <div className="container mx-auto px-6 md:px-12 lg:px-24 py-20 md:py-32 relative z-10">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <motion.div
                initial={{ opacity: 0, x: -26 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.7 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-hackwise uppercase tracking-wider leading-tight">
                  HACKWISE <span className="text-orange-500">2.0</span>
                </h1>
                <h2 className="mt-3 text-2xl md:text-3xl lg:text-4xl font-hackwise uppercase tracking-wider text-orange-500 leading-tight">
                  Captured Moments
                </h2>
              </motion.div>

              <motion.p
                className="text-base md:text-lg lg:text-xl text-white/70 font-display leading-relaxed max-w-xl"
                initial={{ opacity: 0, x: -26 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
              >
                Relive the energy. Feel the grind.
              </motion.p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 pt-2">
                {[
                  { label: 'Hackers', value: stats.hackers, suffix: '+' },
                  { label: 'Hours', value: stats.hours, suffix: '' },
                  { label: 'Prize Pool', value: stats.prize, suffix: 'K' },
                  { label: 'Photos', value: stats.photos, suffix: '+' },
                ].map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/3 backdrop-blur-xl p-4 md:p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_18px_50px_rgba(0,0,0,0.55)]"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 + idx * 0.08, duration: 0.55 }}
                    whileHover={{ y: -6 }}
                  >
                    {/* subtle sheen */}
                    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-orange-500/10 blur-2xl" />
                      <div className="absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-white/5 blur-2xl" />
                    </div>

                    {/* hairline accent */}
                    <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-linear-to-r from-orange-500/40 via-white/10 to-transparent opacity-70" />

                    <div className="relative">
                      <div className="text-[11px] md:text-xs text-white/55 uppercase tracking-[0.18em]">
                        {stat.label}
                      </div>
                      <div className="mt-2 flex items-baseline gap-1">
                        <div className="text-2xl md:text-3xl font-semibold tracking-tight bg-linear-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                          {stat.value}
                        </div>
                        <div className="text-sm md:text-base font-semibold text-orange-400/90">
                          {stat.suffix}
                        </div>
                      </div>
                      <div className="mt-2 h-px w-10 bg-white/10" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="relative w-full"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.7 }}
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
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent flex items-end p-4 md:p-8">
                    <div>
                      <div className="text-orange-500 text-xs md:text-sm uppercase tracking-widest mb-1 md:mb-2">
                        Editor’s Pick
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
                    <p className="text-xs md:text-sm uppercase tracking-wider">Featured media coming soon</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* FILTER BAR */}
      <div className="sticky top-0 z-40 bg-[#0A090F]/95 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 md:px-12 lg:px-24 py-4">
          <div className="flex items-center justify-between gap-4 overflow-x-auto">
            <div className="flex items-center gap-2 flex-1">
              {filters.map((tab) => {
                const isActive = selectedFilter === tab;
                const count =
                  tab === 'All'
                    ? stats.photos
                    : tab === 'Images'
                    ? stats.totalImages
                    : stats.totalVideos;
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setSelectedFilter(tab);
                      setPage(1);
                      setMedia([]);
                    }}
                    className="relative px-5 py-3 text-sm uppercase tracking-wider font-mono transition-colors whitespace-nowrap"
                  >
                    <span className={isActive ? 'text-orange-500' : 'text-white/60 hover:text-white'}>{tab}</span>
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                        layoutId="activeFilter"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 520, damping: 34 }}
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

            <div className="flex items-center gap-3">
              {/* Capture button */}
              {/* Stroke is the clipped outer layer (bg + p-px), not a rectangular border */}
              <div className="cut-btn bg-white/20 p-px">
                <button
                  onClick={openCapture}
                  className="cut-btn-inner px-5 py-3 bg-white/5 hover:bg-white/10 transition-colors text-white/80 uppercase tracking-wider text-sm font-mono whitespace-nowrap flex items-center gap-2"
                >
                  <Camera size={16} />
                  Capture
                </button>
              </div>

              {/* Upload button */}
              <div className="cut-btn bg-orange-500/50 p-px">
                <button
                  onClick={() => setShowUpload(true)}
                  className="cut-btn-inner px-6 py-3 bg-orange-500/15 hover:bg-orange-500/25 transition-colors text-orange-500 uppercase tracking-wider text-sm font-mono whitespace-nowrap flex items-center gap-2"
                >
                  <Upload size={16} />
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GRID */}
      <section className="py-12 px-6 md:px-12 lg:px-24">
        {loading && media.length === 0 ? (
          <div className="flex items-center justify-center py-28">
            <Loader2 className="animate-spin text-orange-500" size={44} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {media.map((item, idx) => (
              <motion.div
                key={item.id}
                ref={idx === media.length - 1 ? lastMediaRef : null}
                className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm cursor-pointer"
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (idx % 20) * 0.03 }}
                onClick={() => openModal(item, idx)}
                whileHover={{ y: -8, borderColor: 'rgba(249, 115, 22, 0.5)' }}
              >
                {item.media_type === 'video' ? (
                  <>
                    <video src={item.cloudinary_url} className="w-full h-full object-cover" muted playsInline />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="text-white ml-1" size={22} />
                      </div>
                    </div>
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
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white text-sm line-clamp-2">{item.caption}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {!hasMore && media.length > 0 && (
          <div className="text-center py-12 text-white/40 text-sm uppercase tracking-wider">End of Gallery</div>
        )}
      </section>

      {/* UPLOAD MODAL */}
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
              initial={{ scale: 0.96, y: 18 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 18 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-hackwise uppercase">Upload Media</h2>
                <button
                  onClick={() => setShowUpload(false)}
                  className="text-white/60 hover:text-white transition-colors"
                  disabled={uploading}
                >
                  <X size={22} />
                </button>
              </div>

              <div
                className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
                  dragActive ? 'border-orange-500 bg-orange-500/10' : 'border-white/20 hover:border-white/40'
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
                    <Loader2 className="animate-spin text-orange-500 mx-auto" size={44} />
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        className="bg-orange-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.25 }}
                      />
                    </div>
                    <p className="text-white/60">Uploading…</p>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto mb-4 text-white/40" size={44} />
                    <p className="text-white/60 mb-2">
                      Drag & drop your file here, or{' '}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-orange-500 hover:text-orange-400 underline"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-xs text-white/40">Images: Max 10MB | Videos: Max 30MB</p>
                  </>
                )}
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2 uppercase tracking-wider">Caption</label>
                  <input
                    id="caption"
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500/50"
                    placeholder="Describe this moment…"
                    disabled={uploading}
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2 uppercase tracking-wider">Team Name (Optional)</label>
                  <input
                    id="teamName"
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500/50"
                    placeholder="Your team name…"
                    disabled={uploading}
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="text-orange-500 mt-0.5" size={18} />
                <div className="text-sm text-white/80">
                  <p className="font-semibold mb-1">Pending Approval</p>
                  <p className="text-white/60">All uploads are reviewed before publishing.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CAPTURE MODAL */}
      <AnimatePresence>
        {showCapture && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !uploading && closeCapture()}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div
              className="relative bg-[#0A090F] border border-white/20 rounded-2xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.96, y: 18 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 18 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-2xl font-hackwise uppercase">Capture</h2>
                  <p className="text-white/50 text-xs uppercase tracking-widest mt-1">
                    Permission requested only after clicking capture
                  </p>
                </div>
                <button
                  onClick={closeCapture}
                  className="text-white/60 hover:text-white transition-colors"
                  disabled={uploading}
                >
                  <X size={22} />
                </button>
              </div>

              {captureError && (
                <div className="mb-4 border border-red-500/30 bg-red-500/10 text-red-200 text-sm rounded-lg p-3">
                  {captureError}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-white/15 bg-black/40">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted={captureMode === 'photo'}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="cut-btn bg-white/15 p-px">
                      <button
                        onClick={() => setCaptureMode('photo')}
                        className={`cut-btn-inner px-4 py-2 text-xs uppercase tracking-wider font-mono transition-colors ${
                          captureMode === 'photo' ? 'bg-white/10 text-white' : 'bg-white/0 text-white/60 hover:text-white'
                        }`}
                      >
                        Photo
                      </button>
                    </div>
                    <div className="cut-btn bg-white/15 p-px">
                      <button
                        onClick={() => setCaptureMode('video')}
                        className={`cut-btn-inner px-4 py-2 text-xs uppercase tracking-wider font-mono transition-colors ${
                          captureMode === 'video' ? 'bg-white/10 text-white' : 'bg-white/0 text-white/60 hover:text-white'
                        }`}
                      >
                        Video
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {captureMode === 'photo' ? (
                      <div className="cut-btn bg-orange-500/50 p-px">
                        <button
                          onClick={snapPhoto}
                          className="cut-btn-inner px-5 py-3 bg-orange-500/15 hover:bg-orange-500/25 transition-colors text-orange-500 uppercase tracking-wider text-sm font-mono whitespace-nowrap"
                        >
                          Take Photo
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`cut-btn p-px ${
                          isRecording ? 'bg-red-500/60' : 'bg-orange-500/50'
                        }`}
                      >
                        <button
                          onClick={toggleRecording}
                          className={`cut-btn-inner px-5 py-3 transition-colors uppercase tracking-wider text-sm font-mono whitespace-nowrap ${
                            isRecording ? 'bg-red-500/15 hover:bg-red-500/25 text-red-200' : 'bg-orange-500/15 hover:bg-orange-500/25 text-orange-500'
                          }`}
                        >
                          {isRecording ? 'Stop Recording' : 'Start Recording'}
                        </button>
                      </div>
                    )}

                    {capturedFile && (
                      <div className="cut-btn bg-white/20 p-px">
                        <button
                          onClick={() => setCapturedFile(null)}
                          className="cut-btn-inner px-4 py-3 bg-white/0 hover:bg-white/10 transition-colors text-white/80 uppercase tracking-wider text-sm font-mono whitespace-nowrap"
                        >
                          Retake
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="text-xs uppercase tracking-widest text-white/50 mb-3">Preview</div>
                    {!capturedFile ? (
                      <div className="text-white/40 text-sm">
                        Capture a photo or record a video to preview it here.
                      </div>
                    ) : capturedFile.type.startsWith('image') ? (
                      <img
                        src={URL.createObjectURL(capturedFile)}
                        alt="Captured"
                        className="w-full rounded-lg border border-white/10"
                      />
                    ) : (
                      <video
                        src={URL.createObjectURL(capturedFile)}
                        controls
                        className="w-full rounded-lg border border-white/10"
                      />
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-white/60 mb-2 uppercase tracking-wider">Caption</label>
                      <input
                        id="caption"
                        type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500/50"
                        placeholder="Describe this moment…"
                        disabled={uploading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-2 uppercase tracking-wider">Team Name (Optional)</label>
                      <input
                        id="teamName"
                        type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500/50"
                        placeholder="Your team name…"
                        disabled={uploading}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <div className="text-xs text-white/50">
                      Allowed: jpg, png, webp, mp4, webm
                    </div>
                    <div className={`cut-btn p-px ${capturedFile ? 'bg-orange-500/50' : 'bg-white/15'}`}>
                      <button
                        onClick={uploadCaptured}
                        disabled={!capturedFile || uploading}
                        className={`cut-btn-inner px-6 py-3 transition-colors uppercase tracking-wider text-sm font-mono whitespace-nowrap flex items-center gap-2 ${
                          capturedFile ? 'bg-orange-500/15 hover:bg-orange-500/25 text-orange-500' : 'bg-white/0 text-white/30'
                        }`}
                      >
                        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        Upload Capture
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULLSCREEN MODAL */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <button onClick={closeModal} className="absolute top-6 right-6 z-10 text-white/80 hover:text-white transition-colors">
              <X size={30} />
            </button>

            <motion.div
              className="relative max-w-7xl max-h-[90vh] w-full mx-6"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
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
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 to-transparent p-6 rounded-b-lg">
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
                  <Download size={18} />
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
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateMedia('next');
                    }}
                    disabled={selectedMedia.index === media.length - 1}
                    className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm border border-white/20 p-3 rounded-full text-white hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={22} />
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


