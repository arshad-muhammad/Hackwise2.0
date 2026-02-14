'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ShieldCheck, PlusCircle, RefreshCw, Edit2, Trash2, Save, X, Image as ImageIcon, Droplets, Download } from 'lucide-react';
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

  // Template management state
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templateError, setTemplateError] = useState('');
  const [templateSuccess, setTemplateSuccess] = useState('');
  const [templateSaving, setTemplateSaving] = useState(false);
  const [activeField, setActiveField] = useState('name'); // 'name' | 'team' | 'code'
  const fileInputRef = useRef(null);
  const [drawState, setDrawState] = useState(null); // { field, startX, startY, currentX, currentY } in px
  const [editingTemplateId, setEditingTemplateId] = useState(null);

  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'PARTICIPANT',
    image_url: '',
    image_width: null,
    image_height: null,
    config: {
      name: {
        x: 50,
        y: 40,
        fontSize: 32,
        color: '#000000',
        fontFamily: 'system',
        align: 'center',
        boxWidth: 40,
        boxHeight: 10,
      },
      team: {
        x: 50,
        y: 55,
        fontSize: 24,
        color: '#000000',
        fontFamily: 'system',
        align: 'center',
        boxWidth: 40,
        boxHeight: 8,
      },
      code: {
        x: 50,
        y: 70,
        fontSize: 18,
        color: '#000000',
        fontFamily: 'monospace',
        align: 'center',
        boxWidth: 40,
        boxHeight: 6,
      },
    },
  });

  // Selected template when creating a certificate
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

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
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setTemplatesLoading(true);
    setTemplateError('');
    try {
      const res = await fetch('/api/admin/certificate-templates');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load templates');
      }
      setTemplates(data.templates || []);
    } catch (e) {
      console.error(e);
      setTemplateError(e.message || 'Could not load templates');
    } finally {
      setTemplatesLoading(false);
    }
  };

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
          template_id: selectedTemplateId || null,
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
      setSelectedTemplateId(null);
      fetchCertificates();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to create certificate');
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateImageMouseDown = (e) => {
    if (!templateForm.image_url) return;
    if (e.button !== 0) return; // left click only

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDrawState({
      field: activeField,
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
      rectWidth: rect.width,
      rectHeight: rect.height,
    });
  };

  const handleTemplateImageMouseMove = (e) => {
    if (!drawState) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDrawState((prev) => ({
      ...prev,
      currentX: x,
      currentY: y,
      rectWidth: rect.width,
      rectHeight: rect.height,
    }));
  };

  const handleTemplateImageMouseUp = () => {
    if (!drawState) return;

    const { field, startX, startY, currentX, currentY, rectWidth, rectHeight } = drawState;
    const x1 = Math.max(0, Math.min(rectWidth, startX));
    const y1 = Math.max(0, Math.min(rectHeight, startY));
    const x2 = Math.max(0, Math.min(rectWidth, currentX));
    const y2 = Math.max(0, Math.min(rectHeight, currentY));

    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.max(4, Math.abs(x2 - x1));
    const height = Math.max(4, Math.abs(y2 - y1));

    const xPercent = (left / rectWidth) * 100;
    const yPercent = (top / rectHeight) * 100;
    const wPercent = (width / rectWidth) * 100;
    const hPercent = (height / rectHeight) * 100;

    setTemplateForm((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: {
          ...prev.config[field],
          x: Math.max(0, Math.min(100, xPercent)),
          y: Math.max(0, Math.min(100, yPercent)),
          boxWidth: Math.max(1, Math.min(100, wPercent)),
          boxHeight: Math.max(1, Math.min(100, hPercent)),
        },
      },
    }));

    setDrawState(null);
  };

  const handleTemplateFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTemplateError('');
    setTemplateSuccess('');
    setTemplateSaving(true);

    try {
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setTemplateForm((prev) => ({
        ...prev,
        image_url: data.url,
        image_width: data.width || null,
        image_height: data.height || null,
      }));
      setTemplateSuccess('Template image uploaded. Now click on the image to mark text positions.');
    } catch (err) {
      console.error(err);
      setTemplateError(err.message || 'Failed to upload image');
    } finally {
      setTemplateSaving(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    setTemplateError('');
    setTemplateSuccess('');

    if (!templateForm.name.trim()) {
      setTemplateError('Template name is required');
      return;
    }
    if (!templateForm.image_url) {
      setTemplateError('Please upload a certificate background image');
      return;
    }

    setTemplateSaving(true);
    try {
      const payload = {
        ...templateForm,
        config: templateForm.config,
      };

      const method = editingTemplateId ? 'PUT' : 'POST';
      const body = editingTemplateId ? { id: editingTemplateId, ...payload } : payload;

      const res = await fetch('/api/admin/certificate-templates', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save template');
      }

      setTemplateSuccess(editingTemplateId ? 'Template updated successfully' : 'Template saved successfully');
      setTemplateForm({
        name: '',
        type: 'PARTICIPANT',
        image_url: '',
        image_width: null,
        image_height: null,
        config: {
          name: {
            x: 50,
            y: 40,
            fontSize: 32,
            color: '#000000',
            fontFamily: 'system',
            align: 'center',
            boxWidth: 40,
            boxHeight: 10,
          },
          team: {
            x: 50,
            y: 55,
            fontSize: 24,
            color: '#000000',
            fontFamily: 'system',
            align: 'center',
            boxWidth: 40,
            boxHeight: 8,
          },
          code: {
            x: 50,
            y: 70,
            fontSize: 18,
            color: '#000000',
            fontFamily: 'monospace',
            align: 'center',
            boxWidth: 40,
            boxHeight: 6,
          },
        },
      });
      setEditingTemplateId(null);
      fetchTemplates();
    } catch (err) {
      console.error(err);
      setTemplateError(err.message || 'Failed to save template');
    } finally {
      setTemplateSaving(false);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (typeof window !== 'undefined') {
      const ok = window.confirm('Delete this template? Existing certificates will still verify but will not show this visual template.');
      if (!ok) return;
    }

    setTemplateError('');
    setTemplateSuccess('');

    try {
      const res = await fetch('/api/admin/certificate-templates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete template');
      }
      fetchTemplates();
    } catch (err) {
      console.error(err);
      setTemplateError(err.message || 'Failed to delete template');
    }
  };

  const templateNameById = useMemo(() => {
    const map = new Map();
    templates.forEach((t) => {
      map.set(t.id, t.name);
    });
    return map;
  }, [templates]);

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

      {/* Templates Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="relative group">
          <div className="absolute inset-0 bg-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative p-px" style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}>
            <div
              className="absolute inset-0 bg-white/20 group-hover:bg-purple-500/50 transition-colors duration-300"
              style={{ clipPath: CARD_CLIP }}
            />
            <div
              className="relative bg-[#0A090F] p-6 md:p-8 space-y-6"
              style={{ clipPath: CARD_CLIP }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center rounded-full bg-purple-500/20 border border-purple-500/40">
                    <ImageIcon className="text-purple-400" size={18} />
                  </div>
                  <div>
                    <h3 className="text-xl font-hackwise text-white uppercase">
                      Certificate Templates
                    </h3>
                    <p className="text-[11px] text-white/50 font-mono">
                      Upload background images and mark where name, team, and code should appear.
                    </p>
                  </div>
                </div>
              </div>

              {templateError && (
                <div className="p-3 bg-red-500/10 border-l-4 border-red-500 text-red-400 text-xs font-mono">
                  {templateError}
                </div>
              )}
              {templateSuccess && (
                <div className="p-3 bg-green-500/10 border-l-4 border-green-500 text-green-400 text-xs font-mono">
                  {templateSuccess}
                </div>
              )}

              <form onSubmit={handleCreateTemplate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-white/60">
                      Template Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full bg-white/5 border border-white/10 px-3 py-2 text-sm text-white font-sans focus:outline-none focus:border-purple-500/60"
                      placeholder="e.g. Participant Default"
                      value={templateForm.name}
                      onChange={(e) =>
                        setTemplateForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-white/60">
                      Template Type
                    </label>
                    <select
                      className="w-full bg-white/5 border border-white/10 px-3 py-2 text-xs text-white font-mono uppercase tracking-[0.2em] focus:outline-none focus:border-purple-500/60"
                      value={templateForm.type}
                      onChange={(e) =>
                        setTemplateForm((prev) => ({ ...prev, type: e.target.value }))
                      }
                    >
                      <option value="PARTICIPANT">PARTICIPANT</option>
                      <option value="WINNER">WINNER</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-mono text-white/60">
                    Background Image <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-white/10 border border-white/10 text-xs font-mono uppercase tracking-wider text-white/70 hover:bg-white/20 hover:text-white transition-colors rounded"
                      disabled={templateSaving}
                    >
                      <ImageIcon size={14} />
                      {templateForm.image_url ? 'Change Image' : 'Upload Image'}
                    </button>
                    {templateForm.image_url && (
                      <span className="text-[11px] text-white/50 font-mono truncate max-w-[200px]">
                        {templateForm.image_url}
                      </span>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleTemplateFileChange}
                  />
                  <p className="text-[10px] text-white/40 font-mono">
                    Use a high-resolution PNG or JPG of your certificate design.
                  </p>
                </div>

                {templateForm.image_url && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-white/60 uppercase">
                          Click to place text
                        </span>
                        <div className="flex gap-1 text-[10px] font-mono">
                          <button
                            type="button"
                            onClick={() => setActiveField('name')}
                            className={`px-2 py-1 rounded border text-xs ${
                              activeField === 'name'
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                : 'bg-white/5 border-white/10 text-white/60'
                            }`}
                          >
                            Name
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveField('team')}
                            className={`px-2 py-1 rounded border text-xs ${
                              activeField === 'team'
                                ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                                : 'bg-white/5 border-white/10 text-white/60'
                            }`}
                          >
                            Team
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveField('code')}
                            className={`px-2 py-1 rounded border text-xs ${
                              activeField === 'code'
                                ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                                : 'bg-white/5 border-white/10 text-white/60'
                            }`}
                          >
                            Code
                          </button>
                        </div>
                      </div>
                      <span className="text-[10px] text-white/40 font-mono flex items-center gap-1">
                        <Droplets size={12} className="text-white/40" />
                        Mark roughly where each text should appear.
                      </span>
                    </div>

                    <div
                      className="relative border border-white/15 bg-black/40 rounded-md overflow-hidden cursor-crosshair max-h-72"
                      onMouseDown={handleTemplateImageMouseDown}
                      onMouseMove={handleTemplateImageMouseMove}
                      onMouseUp={handleTemplateImageMouseUp}
                      onMouseLeave={handleTemplateImageMouseUp}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={templateForm.image_url}
                        alt="Certificate template preview"
                        className="w-full h-auto block select-none pointer-events-none"
                      />

                      {['name', 'team', 'code'].map((fieldKey) => {
                        const fieldConfig = templateForm.config[fieldKey];
                        if (!fieldConfig) return null;
                        const color =
                          fieldKey === 'name'
                            ? '#22c55e'
                            : fieldKey === 'team'
                            ? '#38bdf8'
                            : '#f97316';
                        const label =
                          fieldKey === 'name'
                            ? 'Name'
                            : fieldKey === 'team'
                            ? 'Team'
                            : 'Code';

                        const boxWidth = fieldConfig.boxWidth || 30;
                        const boxHeight = fieldConfig.boxHeight || 8;

                        return (
                          <div
                            key={fieldKey}
                            className="absolute text-[10px] font-mono flex items-center justify-center"
                            style={{
                              top: `${fieldConfig.y}%`,
                              left: `${fieldConfig.x}%`,
                              width: `${boxWidth}%`,
                              height: `${boxHeight}%`,
                              backgroundColor: 'rgba(0,0,0,0.45)',
                              border: `1px solid ${color}`,
                              color,
                              pointerEvents: 'none',
                            }}
                          >
                            {label}
                          </div>
                        );
                      })}

                      {drawState && (
                        <div
                          className="absolute border border-dashed border-white/70 bg-white/5 pointer-events-none"
                          style={{
                            left: `${Math.min(drawState.startX, drawState.currentX)}px`,
                            top: `${Math.min(drawState.startY, drawState.currentY)}px`,
                            width: `${Math.max(
                              1,
                              Math.abs(drawState.currentX - drawState.startX)
                            )}px`,
                            height: `${Math.max(
                              1,
                              Math.abs(drawState.currentY - drawState.startY)
                            )}px`,
                          }}
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] font-mono text-white/70">
                      {['name', 'team', 'code'].map((fieldKey) => {
                        const fieldConfig = templateForm.config[fieldKey];
                        const label =
                          fieldKey === 'name'
                            ? 'Name'
                            : fieldKey === 'team'
                            ? 'Team'
                            : 'Code';
                        return (
                          <div key={fieldKey} className="space-y-1">
                            <p className="uppercase text-white/50">{label} Text</p>
                            <div className="flex gap-2 items-center">
                              <span className="text-white/40">X:</span>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={Number(fieldConfig.x.toFixed(1))}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  setTemplateForm((prev) => ({
                                    ...prev,
                                    config: {
                                      ...prev.config,
                                      [fieldKey]: {
                                        ...prev.config[fieldKey],
                                        x: Math.max(0, Math.min(100, value)),
                                      },
                                    },
                                  }));
                                }}
                                className="w-16 bg-black/40 border border-white/15 px-1 py-1 text-[11px] text-white"
                              />
                              <span className="text-white/40">Y:</span>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={Number(fieldConfig.y.toFixed(1))}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  setTemplateForm((prev) => ({
                                    ...prev,
                                    config: {
                                      ...prev.config,
                                      [fieldKey]: {
                                        ...prev.config[fieldKey],
                                        y: Math.max(0, Math.min(100, value)),
                                      },
                                    },
                                  }));
                                }}
                                className="w-16 bg-black/40 border border-white/15 px-1 py-1 text-[11px] text-white"
                              />
                            </div>
                            <div className="flex flex-wrap gap-2 items-center mt-1">
                              <span className="text-white/40">Size:</span>
                              <input
                                type="number"
                                min={8}
                                max={72}
                                value={fieldConfig.fontSize}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value || '0', 10) || 0;
                                  setTemplateForm((prev) => ({
                                    ...prev,
                                    config: {
                                      ...prev.config,
                                      [fieldKey]: {
                                        ...prev.config[fieldKey],
                                        fontSize: Math.max(8, Math.min(72, value)),
                                      },
                                    },
                                  }));
                                }}
                                className="w-16 bg-black/40 border border-white/15 px-1 py-1 text-[11px] text-white"
                              />
                              <span className="text-white/40">Color:</span>
                              <input
                                type="color"
                                value={fieldConfig.color}
                                onChange={(e) => {
                                  const value = e.target.value || '#000000';
                                  setTemplateForm((prev) => ({
                                    ...prev,
                                    config: {
                                      ...prev.config,
                                      [fieldKey]: {
                                        ...prev.config[fieldKey],
                                        color: value,
                                      },
                                    },
                                  }));
                                }}
                                className="w-10 h-6 bg-black/40 border border-white/15 p-0"
                              />
                              <span className="text-white/40">Align:</span>
                              <select
                                value={fieldConfig.align || 'center'}
                                onChange={(e) => {
                                  const value = e.target.value || 'center';
                                  setTemplateForm((prev) => ({
                                    ...prev,
                                    config: {
                                      ...prev.config,
                                      [fieldKey]: {
                                        ...prev.config[fieldKey],
                                        align: value,
                                      },
                                    },
                                  }));
                                }}
                                className="bg-black/40 border border-white/15 px-1 py-1 text-[11px] text-white"
                              >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={templateSaving}
                    className="relative inline-flex items-center justify-center w-full group cursor-pointer"
                  >
                    <div
                      className="absolute inset-0 bg-purple-500/80 group-hover:bg-purple-500 transition-colors duration-300"
                      style={{ clipPath: BTN_CLIP }}
                    />
                    <div
                      className="relative m-[1px] py-3 text-center transition-all duration-300"
                      style={{ clipPath: BTN_CLIP }}
                    >
                      <span className="relative text-white font-mono font-bold text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                        <DecryptedText
                          text={templateSaving ? 'Saving Template...' : editingTemplateId ? 'Update Template' : 'Save Template'}
                          sequential
                          speed={50}
                        />
                      </span>
                    </div>
                  </button>
                  {editingTemplateId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTemplateId(null);
                        setTemplateForm({
                          name: '',
                          type: 'PARTICIPANT',
                          image_url: '',
                          image_width: null,
                          image_height: null,
                          config: {
                            name: {
                              x: 50,
                              y: 40,
                              fontSize: 32,
                              color: '#000000',
                              fontFamily: 'system',
                              align: 'center',
                              boxWidth: 40,
                              boxHeight: 10,
                            },
                            team: {
                              x: 50,
                              y: 55,
                              fontSize: 24,
                              color: '#000000',
                              fontFamily: 'system',
                              align: 'center',
                              boxWidth: 40,
                              boxHeight: 8,
                            },
                            code: {
                              x: 50,
                              y: 70,
                              fontSize: 18,
                              color: '#000000',
                              fontFamily: 'monospace',
                              align: 'center',
                              boxWidth: 40,
                              boxHeight: 6,
                            },
                          },
                        });
                      }}
                      className="px-3 py-2 text-xs font-mono uppercase tracking-[0.2em] text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-mono text-white uppercase">
              Existing <span className="text-purple-400">Templates</span>
            </h3>
            <span className="text-xs text-white/40 font-mono">
              {templatesLoading ? 'Loading...' : `Total: ${templates.length}`}
            </span>
          </div>

          <div className="space-y-3 max-h-[26rem] overflow-y-auto pr-1">
            {!templatesLoading && templates.length === 0 && (
              <div className="text-white/40 font-mono text-sm border border-dashed border-white/20 rounded-lg p-6 text-center">
                No templates yet. Upload a certificate design on the left to create one.
              </div>
            )}

            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="border border-white/10 bg-white/5 rounded-lg p-4 flex items-center justify-between gap-3"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-mono text-white">{tpl.name}</p>
                  <p className="text-[11px] text-white/50 font-mono uppercase tracking-[0.2em]">
                    {tpl.type || 'OTHER'}
                  </p>
                  {tpl.image_url && (
                    <p className="text-[10px] text-white/40 font-mono break-all">
                      {tpl.image_url}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingTemplateId(tpl.id);
                      let cfg = tpl.config || {};
                      if (typeof cfg === 'string') {
                        try {
                          cfg = JSON.parse(cfg);
                        } catch {
                          cfg = {};
                        }
                      }
                      setTemplateForm({
                        name: tpl.name || '',
                        type: tpl.type || 'OTHER',
                        image_url: tpl.image_url || '',
                        image_width: tpl.image_width || null,
                        image_height: tpl.image_height || null,
                        config: {
                          name: {
                            x: cfg?.name?.x ?? 50,
                            y: cfg?.name?.y ?? 40,
                            fontSize: cfg?.name?.fontSize ?? 32,
                            color: cfg?.name?.color ?? '#000000',
                            fontFamily: cfg?.name?.fontFamily ?? 'system',
                            align: cfg?.name?.align ?? 'center',
                            boxWidth: cfg?.name?.boxWidth ?? 40,
                            boxHeight: cfg?.name?.boxHeight ?? 10,
                          },
                          team: {
                            x: cfg?.team?.x ?? 50,
                            y: cfg?.team?.y ?? 55,
                            fontSize: cfg?.team?.fontSize ?? 24,
                            color: cfg?.team?.color ?? '#000000',
                            fontFamily: cfg?.team?.fontFamily ?? 'system',
                            align: cfg?.team?.align ?? 'center',
                            boxWidth: cfg?.team?.boxWidth ?? 40,
                            boxHeight: cfg?.team?.boxHeight ?? 8,
                          },
                          code: {
                            x: cfg?.code?.x ?? 50,
                            y: cfg?.code?.y ?? 70,
                            fontSize: cfg?.code?.fontSize ?? 18,
                            color: cfg?.code?.color ?? '#000000',
                            fontFamily: cfg?.code?.fontFamily ?? 'monospace',
                            align: cfg?.code?.align ?? 'center',
                            boxWidth: cfg?.code?.boxWidth ?? 40,
                            boxHeight: cfg?.code?.boxHeight ?? 6,
                          },
                        },
                      });
                      setTemplateSuccess('Loaded template for editing');
                    }}
                    className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded transition-colors text-xs font-mono uppercase tracking-[0.2em]"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.open(`/api/admin/certificate-templates/export?template_id=${tpl.id}`, '_blank');
                      }
                    }}
                    className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded transition-colors text-xs font-mono uppercase tracking-[0.2em]"
                    title="Download all certificates using this template"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(tpl.id)}
                    className="p-1.5 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Certificates Manager */}
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

                <div className="space-y-2">
                  <label className="block text-xs font-mono text-white/60">
                    Certificate Template
                  </label>
                  <select
                    className="w-full bg-white/5 border border-white/10 px-4 py-2 text-xs text-white font-mono uppercase tracking-[0.15em] focus:outline-none focus:border-orange-500/60"
                    value={selectedTemplateId || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedTemplateId(value ? Number(value) : null);
                    }}
                  >
                    <option value="">No visual template (text-only verification)</option>
                    {templates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.name} {tpl.type ? `(${tpl.type})` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-white/40 font-mono">
                    Optional. If selected, this code will be linked to the chosen template and
                    displayed visually on the public verify page.
                  </p>
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

                      {cert.template_name && (
                        <div className="flex items-center gap-2 flex-wrap mt-1">
                          <span className="text-[10px] font-mono text-white/40 uppercase">
                            Template
                          </span>
                          <span className="text-[11px] font-mono text-purple-300">
                            {cert.template_name}
                            {cert.template_type ? ` (${cert.template_type})` : ''}
                          </span>
                        </div>
                      )}

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


