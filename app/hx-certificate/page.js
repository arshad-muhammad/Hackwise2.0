'use client';

import { useState } from 'react';
import {
  Download,
  Search,
  Award,
  AlertCircle,
  Loader2,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function HxCertificate() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleDownload = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setStatus('error');
      setErrorMsg('Please enter your full name.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch(
        `/api/hx-certificates/download?name=${encodeURIComponent(trimmed)}`
      );

      if (!res.ok) {
        const data = await res.json();
        setStatus('error');
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate_${trimmed.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/50 hover:text-orange-500 transition-colors mb-8 font-mono text-sm uppercase tracking-wider"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <div
            className="bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-10"
            style={{
              clipPath:
                'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)',
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                <Award size={20} className="text-orange-500" />
              </div>
              <h1 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-wider">
                Certificate
              </h1>
            </div>
            <p className="text-white/50 font-mono text-sm mb-8 ml-[52px]">
              Hackwise X &mdash; Download your certificate
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-white/70 font-mono text-xs uppercase tracking-wider mb-2">
                  Full Name (as printed on certificate)
                </label>
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (status !== 'idle' && status !== 'loading') setStatus('idle');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && status !== 'loading' && handleDownload()}
                    placeholder="Enter your full name..."
                    className="w-full bg-black/40 border border-white/10 p-4 pl-12 font-mono text-white placeholder:text-white/20 focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={handleDownload}
                disabled={status === 'loading'}
                className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-orange-500/50 disabled:cursor-not-allowed text-black font-bold font-mono uppercase tracking-wider py-4 flex items-center justify-center gap-3 transition-colors cursor-pointer"
                style={{
                  clipPath:
                    'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)',
                }}
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Download Certificate
                  </>
                )}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {status === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 bg-red-500/10 border border-red-500/20 p-4 flex items-start gap-3"
                >
                  <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-400 font-mono text-sm">{errorMsg}</p>
                </motion.div>
              )}

              {status === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 bg-green-500/10 border border-green-500/20 p-4 flex items-start gap-3"
                >
                  <CheckCircle2 size={20} className="text-green-400 shrink-0 mt-0.5" />
                  <p className="text-green-400 font-mono text-sm">
                    Certificate downloaded successfully!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="text-center text-white/30 font-mono text-xs mt-6 uppercase tracking-wider">
            Enter your name exactly as you given while registering
          </p>
        </motion.div>
      </div>
    </div>
  );
}
