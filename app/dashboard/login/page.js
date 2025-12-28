'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Key, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DecryptedText from '@/app/components/DecryptedText';

export default function TeamLogin() {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/team/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_key: key.trim().toUpperCase() }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-[#0A090F]/80 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/20 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="text-center mb-10 relative z-10">
          <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-orange-500 shadow-lg">
            <Key size={32} />
          </div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">TEAM LOGIN</h1>
          <p className="text-white/50">Enter your unique team access key</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-xs font-mono text-white/40 ml-1">ACCESS KEY</label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="XXXXXX"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-center text-2xl font-mono tracking-[0.5em] uppercase focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all placeholder:tracking-normal placeholder:text-white/20"
              autoFocus
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 py-2 rounded-lg"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading || !key}
            className="w-full bg-orange-500 text-black font-bold font-mono py-4 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            style={{
              clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)"
            }}
          >
            {loading ? <Loader2 className="animate-spin" /> : <><DecryptedText text="ENTER DASHBOARD" sequential speed={40} className="font-bold" /> <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
