'use client';

import { useState } from 'react';
import { ShieldCheck, XCircle, Search } from 'lucide-react';
import DecryptedText from '../components/DecryptedText.jsx';

const CARD_CLIP =
  'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)';
const BTN_CLIP =
  'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)';

export default function VerifyPage() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error | notfound
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    setResult(null);

    if (!code.trim()) {
      setStatus('error');
      setMessage('Please enter a certificate code');
      return;
    }

    try {
      const res = await fetch(`/api/verify?code=${encodeURIComponent(code.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setStatus('notfound');
        setMessage(data.message || data.error || 'Certificate not found');
        return;
      }

      setStatus('success');
      setResult(data.certificate);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  const normalizedPreview =
    code.trim() === ''
      ? 'HW2-2026-XXXX'
      : code.trim().toUpperCase().startsWith('HW2-2026-')
      ? code.trim().toUpperCase()
      : `HW2-2026-${code.trim().toUpperCase()}`;

  return (
    <section className="section-container border-t border-white/10 pb-24 pt-28">
      <div className="max-w-5xl mx-auto">
        <div className="w-full flex justify-center mb-10">
          <div className="inline-block border border-white/20 bg-[#0A090F]/90 px-8 py-4 backdrop-blur-md">
            <h1 className="text-3xl md:text-5xl font-hackwise text-white uppercase tracking-wider text-center">
              Verify <span className="text-orange-500">Certificate</span>
            </h1>
            <p className="mt-3 text-xs md:text-sm text-white/60 font-mono text-center">
              Enter the Hackwise 2.0 certificate code printed on your certificate to check its
              authenticity.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Form */}
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative p-px" style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}>
              <div
                className="absolute inset-0 bg-white/20 group-hover:bg-blue-500/50 transition-colors duration-300"
                style={{ clipPath: CARD_CLIP }}
              />
              <div
                className="relative bg-[#0A090F] p-6 md:p-8 space-y-6"
                style={{ clipPath: CARD_CLIP }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-500/20 border border-blue-500/40">
                    <Search className="text-blue-400" size={18} />
                  </div>
                  <div>
                    <h2 className="text-xl font-hackwise text-white uppercase">
                      Enter Certificate Code
                    </h2>
                    <p className="text-[11px] text-white/50 font-mono">
                      Format: <span className="text-orange-400">HW2-2026-XXXX</span>
                    </p>
                  </div>
                </div>

                {status === 'error' && message && (
                  <div className="p-3 bg-red-500/10 border-l-4 border-red-500 text-red-400 text-xs font-mono">
                    {message}
                  </div>
                )}
                {status === 'notfound' && message && (
                  <div className="p-3 bg-yellow-500/10 border-l-4 border-yellow-500 text-yellow-300 text-xs font-mono">
                    {message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-white/60">
                      Certificate Code
                    </label>
                    <input
                      type="text"
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 text-base text-white font-mono uppercase tracking-[0.3em] focus:outline-none focus:border-orange-500/60 placeholder:text-white/25"
                      placeholder="HW2-2026-XXXX"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                    <p className="text-[10px] text-white/40 font-mono">
                      You can paste the full code or just the ending part after{' '}
                      <span className="text-orange-400">HW2-2026-</span>.
                    </p>
                  </div>

                  <div className="space-y-1 pt-1">
                    <p className="text-[11px] font-mono text-white/40 uppercase tracking-[0.25em]">
                      Normalized Code
                    </p>
                    <p className="text-sm font-mono text-orange-400 tracking-[0.25em]">
                      {normalizedPreview}
                    </p>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="relative inline-flex items-center justify-center w-full group cursor-pointer"
                    >
                      <div
                        className="absolute inset-0 bg-orange-500/80 group-hover:bg-orange-500 transition-colors duration-300"
                        style={{ clipPath: BTN_CLIP }}
                      />
                      <div
                        className="relative m-[1px] py-3 text-center transition-all duration-300"
                        style={{ clipPath: BTN_CLIP }}
                      >
                        <span className="relative text-white font-mono font-bold text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                          <DecryptedText
                            text={status === 'loading' ? 'Checking...' : 'Verify Certificate'}
                            sequential
                            speed={50}
                          />
                        </span>
                      </div>
                    </button>
                  </div>
                </form>

                <div className="pt-2 border-t border-white/10 mt-2">
                  <p className="text-[10px] text-white/35 font-mono">
                    This verification tool is powered by the official{' '}
                    <span className="text-orange-400">Hackwise 2.0</span> system hosted by{' '}
                    <span className="text-white">Sphere Hive</span>. Only certificates with codes
                    generated by the organizers will be marked as{' '}
                    <span className="text-green-400">authentic</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Result */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/10 blur-xl pointer-events-none" />
              <div className="relative border border-white/15 bg-white/5 rounded-lg p-6 md:p-8 min-h-[220px] flex flex-col justify-center">
                {status === 'idle' && (
                  <div className="text-center space-y-3">
                    <ShieldCheck className="mx-auto text-white/20" size={40} />
                    <h3 className="text-lg font-mono text-white/80 uppercase tracking-[0.2em]">
                      Awaiting Code
                    </h3>
                    <p className="text-xs text-white/50 font-sans max-w-xs mx-auto">
                      Enter your certificate code on the left to see if it&apos;s an official
                      Hackwise 2.0 certificate.
                    </p>
                  </div>
                )}

                {status === 'loading' && (
                  <div className="text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto animate-spin" />
                    <p className="text-sm font-mono text-white/70">Verifying with server...</p>
                  </div>
                )}

                {status === 'success' && result && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 flex items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40">
                        <ShieldCheck className="text-emerald-400" size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-mono text-emerald-400 uppercase tracking-[0.25em]">
                          Authentic Certificate
                        </p>
                        <p className="text-sm font-mono text-white/80">
                          Verified by Hackwise 2.0 System
                        </p>
                      </div>
                    </div>

                    <div className="border border-emerald-500/40 bg-emerald-500/5 rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-mono text-white/40 uppercase">
                          Code
                        </span>
                        <span className="text-xs font-mono text-orange-400 tracking-[0.25em] text-right">
                          {result.code}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-white/10 mt-2 space-y-1">
                        <p className="text-xs font-mono text-white/60">Recipient</p>
                        <p className="text-base font-mono text-white">
                          {result.recipient_name || 'Unnamed Recipient'}
                        </p>
                      </div>

                      {result.team_name && (
                        <div className="space-y-1 mt-2">
                          <p className="text-xs font-mono text-white/60">Team / Info</p>
                          <p className="text-xs font-sans text-white/80 break-words">
                            {result.team_name}
                          </p>
                        </div>
                      )}

                      {result.details && (
                        <div className="space-y-1 mt-2">
                          <p className="text-xs font-mono text-white/60">Notes</p>
                          <p className="text-xs font-sans text-white/70 break-words">
                            {result.details}
                          </p>
                        </div>
                      )}

                      {result.created_at && (
                        <div className="space-y-1 mt-2">
                          <p className="text-xs font-mono text-white/60">Issued On</p>
                          <p className="text-xs font-mono text-white/70">
                            {new Date(result.created_at).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    <p className="text-[10px] text-white/40 font-mono">
                      If this information does not match your certificate, please contact the
                      organizers on the official{' '}
                      <span className="text-orange-400">Hackwise 2.0</span> channels.
                    </p>
                  </div>
                )}

                {(status === 'error' || status === 'notfound') && message && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 flex items-center justify-center rounded-full bg-red-500/20 border border-red-500/40">
                        <XCircle className="text-red-400" size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-mono text-red-400 uppercase tracking-[0.25em]">
                          Not Verified
                        </p>
                        <p className="text-sm font-mono text-white/80">
                          We couldn&apos;t confirm this certificate.
                        </p>
                      </div>
                    </div>
                    <div className="border border-red-500/40 bg-red-500/5 rounded-lg p-4">
                      <p className="text-xs text-red-200 font-mono">{message}</p>
                    </div>
                    <p className="text-[10px] text-white/40 font-mono">
                      Make sure you typed the code exactly as printed, including{' '}
                      <span className="text-orange-400">HW2-2026-</span>. If you believe this is an
                      error, reach out to the organizers.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


