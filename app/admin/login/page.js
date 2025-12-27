'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });

      if (res.ok) {
        router.push('/admin');
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.1),transparent_70%)]" />

      <div className="w-full max-w-md relative z-10">
        {/* Decorative Elements */}
        <div className="absolute -top-12 -left-12 w-24 h-24 border-l-2 border-t-2 border-orange-500/20" />
        <div className="absolute -bottom-12 -right-12 w-24 h-24 border-r-2 border-b-2 border-orange-500/20" />

        <div className="relative group">
          {/* Border Wrapper */}
          <div 
            className="absolute inset-0 bg-white/10"
            style={{
              clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)'
            }}
          />
          
          <div 
            className="p-8 bg-black/90 backdrop-blur-xl relative"
            style={{
              clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)',
              margin: '1px' // This reveals the border wrapper underneath
            }}
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-[20px] h-[1px] bg-orange-500/50" />
            <div className="absolute top-0 left-0 h-[20px] w-[1px] bg-orange-500/50" />
            <div className="absolute bottom-0 right-0 w-[20px] h-[1px] bg-orange-500/50" />
            <div className="absolute bottom-0 right-0 h-[20px] w-[1px] bg-orange-500/50" />

            <h1 className="text-3xl font-mono font-bold mb-2 text-center text-white tracking-widest uppercase">
              System <span className="text-orange-500">Access</span>
            </h1>
            <p className="text-center text-white/40 text-xs font-mono mb-8 uppercase tracking-[0.2em]">Restricted Area Level 5</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative group/input">
                <label className="block text-xs font-mono text-orange-500/80 mb-2 uppercase tracking-wider">Authentication Key</label>
                
                {/* Input Border Wrapper */}
                <div className="relative">
                  <div 
                    className="absolute inset-0 bg-white/10"
                    style={{
                      clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
                    }}
                  />
                  <input
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="w-full bg-black/50 rounded-none px-4 py-3 text-white font-mono focus:outline-none focus:bg-orange-500/5 transition-all placeholder:text-white/20 relative z-10 block"
                    placeholder="ENTER_SECURE_KEY"
                    autoFocus
                    style={{
                      clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
                      margin: '1px',
                      width: 'calc(100% - 2px)'
                    }}
                  />
                </div>
                
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/20 group-focus-within/input:border-orange-500 transition-colors pointer-events-none z-20" />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border-l-2 border-red-500 text-red-500 text-xs font-mono uppercase tracking-wide">
                  Warning: {error}
                </div>
              )}

              <div className="relative w-full h-[58px]">
                {/* Button Border Wrapper */}
                <div 
                  className="absolute inset-0 bg-orange-500/50"
                  style={{
                    clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)'
                  }}
                />
                
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute inset-[1px] bg-black overflow-hidden group w-[calc(100%-2px)] h-[calc(100%-2px)]"
                  style={{
                    clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)'
                  }}
                >
                  <div className="absolute inset-0 bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors" />
                  <div className="absolute inset-0 bg-orange-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  
                  <div className="relative px-6 py-4 flex items-center justify-between transition-colors h-full">
                    <span className="font-mono font-bold uppercase tracking-widest text-orange-500 group-hover:text-white transition-colors">
                      {loading ? 'Verifying...' : 'Initialize'}
                    </span>
                    <span className="font-mono text-xs text-orange-500/60 group-hover:text-white/60 transition-colors">
                      [ENTER]
                    </span>
                  </div>
                  
                  {/* Scanline effect */}
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-orange-500/30 animate-[scan_2s_ease-in-out_infinite] opacity-0 group-hover:opacity-100" />
                </button>
              </div>
            </form>

            <div className="mt-8 flex justify-between items-center text-[10px] font-mono text-white/20 uppercase">
              <span>Secured by N-Protocol</span>
              <span>v2.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
