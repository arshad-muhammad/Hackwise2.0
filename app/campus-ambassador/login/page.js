'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DecryptedText from '@/app/components/DecryptedText';

export default function CALoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    ca_code: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/ca/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ca_code: formData.ca_code.toUpperCase().trim(),
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/campus-ambassador/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cardClipPath = "polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)";
  const btnClipPath = "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)";

  return (
    <section className="section-container border-t border-white/10 pb-32">
      <div className="max-w-md mx-auto">
        <div className="relative group">
          <div className="absolute inset-0 bg-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative p-px" style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}>
            <div
              className="absolute inset-0 bg-white/20 group-hover:bg-orange-500/50 transition-colors duration-300"
              style={{ clipPath: cardClipPath }}
            />
            <div className="relative bg-[#0A090F] p-8 md:p-12" style={{ clipPath: cardClipPath }}>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center text-black font-bold text-xl font-hackwise">
                  CA
                </div>
                <div>
                  <h1 className="text-2xl font-hackwise text-white uppercase tracking-wider">
                    CA Dashboard Login
                  </h1>
                  <p className="text-sm text-white/60 font-sans">Enter your CA code and password</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-500/10 border-l-4 border-red-500 text-red-500 text-sm font-mono">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-mono text-orange-500/80 mb-2 uppercase tracking-wide">
                    CA Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="ca_code"
                    value={formData.ca_code}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white font-mono focus:outline-none focus:border-orange-500/50 transition-colors uppercase"
                    placeholder="KVGCE001"
                    autoComplete="username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono text-orange-500/80 mb-2 uppercase tracking-wide">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white font-sans focus:outline-none focus:border-orange-500/50 transition-colors"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full block group cursor-pointer"
                  >
                    <div
                      className="absolute inset-0 bg-orange-500/50 group-hover:bg-orange-500 transition-colors duration-300"
                      style={{ clipPath: btnClipPath }}
                    />
                    <div
                      className="relative bg-[#0A090F] m-[1px] py-4 text-center transition-all duration-300"
                      style={{ clipPath: btnClipPath }}
                    >
                      <div className="absolute inset-0 bg-white/5 group-hover:bg-orange-500/10 transition-colors duration-300" />
                      <span className="relative text-white font-sans font-bold text-lg uppercase tracking-wide">
                        {loading ? 'Logging in...' : 'Login'}
                      </span>
                    </div>
                  </button>
                </div>

                <div className="text-center pt-4 border-t border-white/10">
                  <p className="text-sm text-white/60 font-sans">
                    Don't have a CA code?{' '}
                    <a href="/campus-ambassador" className="text-orange-500 hover:underline">
                      Apply Now
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

