'use client';

import { useEffect, useState } from 'react';

export default function RegistrationStatusToggle() {
  const [closed, setClosed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/admin/settings/registration');
        if (res.ok) {
          const data = await res.json();
          setClosed(Boolean(data.closed));
        }
      } catch (err) {
        console.error('Failed to fetch registration setting', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  const toggle = async () => {
    if (saving) return;
    const next = !closed;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ closed: next }),
      });

      if (res.ok) {
        setClosed(next);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to update registration setting');
      }
    } catch (err) {
      console.error('Failed to update registration setting', err);
      alert('Error updating registration setting');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex justify-between items-center py-2 border-b border-white/10">
      <div className="flex flex-col">
        <span className="text-white/60">Hackwise Registration</span>
        <span className="text-xs text-white/40 font-mono">
          Controls landing page countdown vs. “Registration Closed” banner
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`font-mono text-xs ${
            closed ? 'text-red-400' : 'text-green-400'
          }`}
        >
          {loading ? '...' : closed ? 'Closed' : 'Open'}
        </span>
        <button
          type="button"
          onClick={toggle}
          disabled={loading || saving}
          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
            closed ? 'bg-red-500' : 'bg-green-500'
          } ${loading || saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
              closed ? 'translate-x-8' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
}


