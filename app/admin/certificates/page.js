'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, PlusCircle, RefreshCw, Edit2, Trash2, Save, X } from 'lucide-react';
import DecryptedText from '../../components/DecryptedText.jsx';

const CARD_CLIP =
  'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)';
const BTN_CLIP =
  'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)';

export default function CertificatesAdminPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    recipient_name: '',
    team_name: '',
    suffix: '',
    details: '',
  });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    recipient_name: '',
    team_name: '',
    details: '',
  });
  const [editSaving, setEditSaving] = useState(false);

  const fullCode =
    form.suffix.trim() !== ''
      ? `HW2-2026-${form.suffix.trim().toUpperCase()}`
      : 'HW2-2026-XXXX';

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/certificates');
      if (!res.ok) throw new Error('Failed to fetch certificates');
      const data = await res.json();
      setCertificates(data || []);
    } catch (e) {
      console.error(e);
      setError('Could not load certificates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleRandomSuffix = () => {
    const random = Math.floor(1000 + Math.random() * 9000); // 4-digit
    setForm((prev) => ({ ...prev, suffix: String(random) }));
  };

  const startEdit = (cert) => {
    setEditingId(cert.id);
    setEditForm({
      recipient_name: cert.recipient_name || '',
      team_name: cert.team_name || '',
      details: cert.details || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      recipient_name: '',
      team_name: '',
      details: '',
    });
  };

  const handleSaveEdit = async (id) => {
    if (!editForm.recipient_name.trim()) {
      setError('Recipient name is required');
      return;
    }

    setEditSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/certificates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          recipient_name: editForm.recipient_name.trim(),
          team_name: editForm.team_name.trim() || null,
          details: editForm.details.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update certificate');
      }

      setSuccess('Certificate updated successfully');
      cancelEdit();
      fetchCertificates();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to update certificate');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (typeof window !== 'undefined') {
      const ok = window.confirm('Delete this certificate? This cannot be undone.');
      if (!ok) return;
    }

    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/certificates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete certificate');
      }
      setSuccess('Certificate deleted');
      fetchCertificates();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to delete certificate');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.recipient_name.trim()) {
      setError('Recipient name is required');
      return;
    }
    if (!form.suffix.trim()) {
      setError('Code suffix is required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_name: form.recipient_name.trim(),
          team_name: form.team_name.trim() || null,
          suffix: form.suffix.trim().toUpperCase(),
          details: form.details.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create certificate');
      }

      setSuccess(`Certificate created with code ${data.code}`);
      setForm({
        recipient_name: '',
        team_name: '',
        suffix: '',
        details: '',
      });
      fetchCertificates();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to create certificate');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-500/20 border border-orange-500/40">
            <ShieldCheck className="text-orange-400" size={20} />
          </div>
          <div>
            <h2 className="text-3xl font-mono font-bold text-white uppercase">
              Certificates <span className="text-orange-500">Manager</span>
            </h2>
            <p className="text-xs text-white/40 font-mono">
              Generate unique verification codes to embed in printed / digital certificates.
            </p>
          </div>
        </div>
        <button
          onClick={fetchCertificates}
          className="inline-flex items-center gap-2 px-3 py-2 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-xs uppercase tracking-wider text-white/60 hover:text-white transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative p-px" style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}>
            <div
              className="absolute inset-0 bg-white/20 group-hover:bg-orange-500/50 transition-colors duration-300"
              style={{ clipPath: CARD_CLIP }}
            />
            <div
              className="relative bg-[#0A090F] p-6 md:p-8 space-y-6"
              style={{ clipPath: CARD_CLIP }}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-hackwise text-white uppercase">
                  <DecryptedText text="Create Certificate Code" sequential speed={40} />
                </h3>
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-[0.25em]">
                  HW2-2026-XXXX
                </span>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border-l-4 border-red-500 text-red-400 text-xs font-mono">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-500/10 border-l-4 border-green-500 text-green-400 text-xs font-mono">
                  {success}
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-white/60">
                    Recipient Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 px-4 py-2 text-sm text-white font-sans focus:outline-none focus:border-orange-500/60"
                    placeholder="Full name to print on certificate"
                    value={form.recipient_name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, recipient_name: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-mono text-white/60">
                    Team / Track / Extra Info
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 px-4 py-2 text-sm text-white font-sans focus:outline-none focus:border-orange-500/60"
                    placeholder="Team name, track, or role (optional)"
                    value={form.team_name}
                    onChange={(e) => setForm((prev) => ({ ...prev, team_name: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-3 items-end">
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-white/60">
                      Code Suffix <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2 text-xs font-mono text-white/40">
                      <span className="px-2 py-1 bg-white/5 border border-white/10 rounded">
                        HW2-2026-
                      </span>
                      <span>What you type here will be appended to the prefix.</span>
                    </div>
                    <input
                      type="text"
                      className="w-full bg-white/5 border border-white/10 px-4 py-2 text-sm text-white font-mono uppercase tracking-[0.2em] focus:outline-none focus:border-orange-500/60"
                      placeholder="0001 or WINNER1"
                      value={form.suffix}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, suffix: e.target.value.toUpperCase() }))
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRandomSuffix}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white/10 border border-white/10 text-xs font-mono uppercase tracking-wider text-white/70 hover:bg-white/20 hover:text-white transition-colors rounded"
                  >
                    <PlusCircle size={14} />
                    Random
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-mono text-white/60">
                    Internal Notes (optional)
                  </label>
                  <textarea
                    className="w-full bg-white/5 border border-white/10 px-4 py-2 text-sm text-white font-sans focus:outline-none focus:border-orange-500/60 h-20 resize-none"
                    placeholder="Any notes you want to store with this certificate (jury notes, prize, etc.)"
                    value={form.details}
                    onChange={(e) => setForm((prev) => ({ ...prev, details: e.target.value }))}
                  />
                </div>

                <div className="space-y-1 pt-1">
                  <p className="text-[11px] font-mono text-white/40 uppercase tracking-[0.25em]">
                    Preview Code
                  </p>
                  <p className="text-lg font-mono text-orange-400 tracking-[0.25em]">
                    {fullCode}
                  </p>
                  <p className="text-[10px] text-white/30 font-mono">
                    Paste this exact code on printed / digital certificates. Visitors can verify it
                    on <span className="text-orange-400">/verify</span>.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
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
                          text={saving ? 'Saving...' : 'Create Certificate Code'}
                          sequential
                          speed={50}
                        />
                      </span>
                    </div>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* List Card */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-mono text-white uppercase">
              Existing <span className="text-orange-500">Certificates</span>
            </h3>
            <span className="text-xs text-white/40 font-mono">
              Total: {certificates.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[32rem] overflow-y-auto pr-1">
            {loading && (
              <div className="text-orange-400 font-mono text-sm">Loading certificates...</div>
            )}

            {!loading && certificates.length === 0 && (
              <div className="text-white/40 font-mono text-sm border border-dashed border-white/20 rounded-lg p-6 text-center">
                No certificates yet. Create one on the left and they will appear here.
              </div>
            )}

            {certificates.map((cert) => {
              const isEditing = editingId === cert.id;
              return (
                <div
                  key={cert.id || cert.code}
                  className="border border-white/10 bg-white/5 rounded-lg p-4 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-white/40 uppercase">Code</span>
                        <span className="text-xs font-mono text-orange-400 tracking-[0.25em]">
                          {cert.code}
                        </span>
                      </div>

                      {isEditing ? (
                        <div className="space-y-2 mt-2">
                          <input
                            type="text"
                            className="w-full bg-black/40 border border-white/15 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500/60"
                            value={editForm.recipient_name}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                recipient_name: e.target.value,
                              }))
                            }
                            placeholder="Recipient name"
                          />
                          <input
                            type="text"
                            className="w-full bg-black/40 border border-white/15 px-3 py-2 text-xs text-white font-sans focus:outline-none focus:border-orange-500/60"
                            value={editForm.team_name}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                team_name: e.target.value,
                              }))
                            }
                            placeholder="Team / info (optional)"
                          />
                          <textarea
                            className="w-full bg-black/40 border border-white/15 px-3 py-2 text-xs text-white font-sans focus:outline-none focus:border-orange-500/60 h-16 resize-none"
                            value={editForm.details}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                details: e.target.value,
                              }))
                            }
                            placeholder="Notes (optional)"
                          />
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-mono text-white">
                            {cert.recipient_name || 'Unnamed Recipient'}
                          </p>
                          {cert.team_name && (
                            <p className="text-xs text-white/50 font-sans">
                              Team / Info: {cert.team_name}
                            </p>
                          )}
                          {cert.details && (
                            <p className="text-xs text-white/60 font-sans border-t border-white/10 pt-2 mt-2">
                              {cert.details}
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex flex-col items-end text-right gap-2">
                      <div className="text-right">
                        <span className="text-[10px] text-white/40 font-mono uppercase block">
                          Created
                        </span>
                        <span className="text-[11px] text-white/60 font-mono">
                          {cert.created_at
                            ? new Date(cert.created_at).toLocaleString()
                            : '—'}
                        </span>
                      </div>

                      <div className="flex gap-1 mt-1">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(cert.id)}
                              disabled={editSaving}
                              className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                            >
                              <Save size={14} />
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={editSaving}
                              className="p-1.5 text-white/50 hover:bg-white/10 rounded transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(cert)}
                              className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(cert.id)}
                              className="p-1.5 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


