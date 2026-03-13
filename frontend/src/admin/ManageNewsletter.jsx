import React, { useState, useEffect, useCallback } from 'react';

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

/* ─── HELPERS ─────────────────────────────────────────────────────────────── */
const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

/* ─── SKELETON ────────────────────────────────────────────────────────────── */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28" /></td>
  </tr>
);

/* ─── MAIN COMPONENT ──────────────────────────────────────────────────────── */
const ManageNewsletter = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [search, setSearch]           = useState('');
  const [copied, setCopied]           = useState(false);

  const token = localStorage.getItem('admin_token');
  const authHeaders = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
  };

  /* ── fetch ── */
  const fetchSubscribers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res  = await fetch(`${backendURL}/api/v1/newsletter`, { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to fetch subscribers');
      const raw = data.data;
      setSubscribers(Array.isArray(raw) ? raw : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubscribers(); }, []);

  /* ── filtered list ── */
  const visible = subscribers.filter((s) =>
    !search || s.email.toLowerCase().includes(search.toLowerCase())
  );

  /* ── copy all emails ── */
  const handleCopyAll = async () => {
    const emails = visible.map((s) => s.email).join(', ');
    await navigator.clipboard.writeText(emails);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── stats ── */
  const thisMonth = subscribers.filter((s) => {
    if (!s.createdAt) return false;
    const d = new Date(s.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const stats = [
    { label: 'Total Subscribers', value: subscribers.length, cls: 'text-gray-800'  },
    { label: 'Joined This Month',  value: thisMonth,           cls: 'text-green-600' },
    { label: 'Showing',            value: visible.length,      cls: 'text-blue-600'  },
  ];

  /* ════════════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Newsletter</h2>
          <p className="text-sm text-gray-500 mt-0.5">Everyone who has subscribed to church updates</p>
        </div>
        <button
          onClick={fetchSubscribers}
          className="border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800
                     px-4 py-2.5 rounded-lg text-sm transition-all"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
            <p className={`text-3xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide leading-snug">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchSubscribers} className="text-sm underline ml-4">Retry</button>
        </div>
      )}

      {/* Search + Copy bar */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          placeholder="Search by email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400
                     px-3.5 py-2 text-sm focus:outline-none focus:border-red-400 w-56 transition-colors"
        />

        {/* Copy emails */}
        {!loading && visible.length > 0 && (
          <button
            onClick={handleCopyAll}
            className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                        border transition-all
                        ${copied
                          ? 'border-green-400 text-green-600 bg-green-50'
                          : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800'}`}
          >
            {copied ? '✓ Copied!' : `📋 Copy ${visible.length} email${visible.length !== 1 ? 's' : ''}`}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Email Address', 'Subscribed On'].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <><SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-14 text-center text-gray-400 italic">
                    {subscribers.length === 0
                      ? 'No subscribers yet.'
                      : 'No emails match your search.'}
                  </td>
                </tr>
              ) : (
                visible.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                    {/* Email */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {/* Avatar initial */}
                        <div className="w-8 h-8 rounded-full bg-red-100 border border-red-200 flex items-center
                                        justify-center text-red-600 text-xs font-bold flex-shrink-0 uppercase">
                          {s.email[0]}
                        </div>
                        <span className="text-sm font-mono text-gray-800">{s.email}</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {fmtDate(s.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && !error && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400 font-mono">
              Showing {visible.length} of {subscribers.length} subscribers
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageNewsletter;