import React, { useState, useEffect, useCallback } from 'react';

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

/* ─── HELPERS ─────────────────────────────────────────────────────────────── */
const fmtDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

const fmtTime = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
};

/* ─── SKELETON ────────────────────────────────────────────────────────────── */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-2/3" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-full" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-full" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
    <td className="px-6 py-4 text-center"><div className="h-7 bg-gray-200 rounded w-24 mx-auto" /></td>
  </tr>
);

/* ─── MAIN COMPONENT ──────────────────────────────────────────────────────── */
const ManageContacts = () => {
  const [contacts, setContacts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [marking, setMarking]           = useState(null);   // id currently being updated
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'replied' | 'pending'
  const [search, setSearch]             = useState('');
  const [selected, setSelected]         = useState(null);  // contact open in detail drawer

  const token = localStorage.getItem('admin_token');
  const authHeaders = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
  };

  /* ── fetch ── */
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res  = await fetch(`${backendURL}/api/v1/contact`, { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to fetch contacts');
      setContacts(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContacts(); }, []);

  /* ── mark as replied ── */
  const handleMarkReplied = async (id) => {
    setMarking(id);
    try {
      const res  = await fetch(`${backendURL}/api/v1/contact/${id}/reply`, {
        method: 'PUT',
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to update');
      setContacts((prev) =>
        prev.map((c) => c._id === id ? { ...c, replied: true } : c)
      );
      if (selected?._id === id) setSelected((prev) => ({ ...prev, replied: true }));
    } catch (err) {
      alert(err.message);
    } finally {
      setMarking(null);
    }
  };

  /* ── filtered list ── */
  const visible = contacts.filter((c) => {
    const matchStatus = filterStatus === 'all'
      || (filterStatus === 'replied'  &&  c.replied)
      || (filterStatus === 'pending'  && !c.replied);
    const q = search.toLowerCase();
    const matchSearch = !q
      || c.name.toLowerCase().includes(q)
      || c.email.toLowerCase().includes(q)
      || (c.message ?? '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  /* ── stats ── */
  const stats = [
    { label: 'Total',   value: contacts.length,                          cls: 'text-gray-800'  },
    { label: 'Pending', value: contacts.filter((c) => !c.replied).length, cls: 'text-amber-600' },
    { label: 'Replied', value: contacts.filter((c) =>  c.replied).length, cls: 'text-green-600' },
  ];

  /* ════════════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="max-w-7xl mx-auto flex gap-6">

      {/* ══ LEFT PANEL ══ */}
      <div className="flex-1 min-w-0 flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Contact Messages</h2>
            <p className="text-sm text-gray-500 mt-0.5">View and respond to messages from your community</p>
          </div>
          <button
            onClick={fetchContacts}
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
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchContacts} className="text-sm underline ml-4">Retry</button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            placeholder="Search name, email, message…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400
                       px-3.5 py-2 text-sm focus:outline-none focus:border-red-400 w-56 transition-colors"
          />

          {[
            { key: 'all',     label: 'All',     active: 'border-red-400 text-red-600 bg-red-50'     },
            { key: 'pending', label: 'Pending', active: 'border-amber-400 text-amber-600 bg-amber-50' },
            { key: 'replied', label: 'Replied', active: 'border-green-400 text-green-600 bg-green-50' },
          ].map(({ key, label, active }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer
                ${filterStatus === key
                  ? active
                  : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'Email', 'Message', 'Received', 'Status', 'Action'].map((h) => (
                    <th
                      key={h}
                      className={`px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider
                        ${h === 'Action' || h === 'Status' ? 'text-center' : 'text-left'}`}
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
                    <td colSpan={6} className="px-6 py-14 text-center text-gray-400 italic">
                      {contacts.length === 0
                        ? 'No contact messages yet.'
                        : 'No messages match your filters.'}
                    </td>
                  </tr>
                ) : (
                  visible.map((c) => (
                    <tr
                      key={c._id}
                      onClick={() => setSelected(selected?._id === c._id ? null : c)}
                      className={`transition-colors cursor-pointer
                        ${selected?._id === c._id ? 'bg-red-50' : 'hover:bg-gray-50'}
                        ${!c.replied ? 'font-medium' : ''}`}
                    >
                      {/* Name */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {/* Unread dot */}
                          {!c.replied && (
                            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                          )}
                          <p className="text-gray-900 text-sm">{c.name}</p>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-gray-600 text-sm font-mono">{c.email}</p>
                      </td>

                      {/* Message preview */}
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-gray-500 text-sm line-clamp-1">
                          {c.message || <span className="italic text-gray-400">No message</span>}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-gray-500 text-sm">{fmtDate(c.createdAt)}</p>
                        <p className="text-gray-400 text-xs font-mono">{fmtTime(c.createdAt)}</p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {c.replied ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                                           text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Replied
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                                           text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td
                        className="px-6 py-4 whitespace-nowrap text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {!c.replied ? (
                          <button
                            disabled={marking === c._id}
                            onClick={() => handleMarkReplied(c._id)}
                            className="inline-flex items-center gap-1.5 border border-green-400 text-green-600
                                       hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed
                                       rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                          >
                            {marking === c._id ? (
                              <>
                                <span className="w-3 h-3 border-2 border-green-400 border-t-transparent
                                                 rounded-full animate-spin" />
                                Saving…
                              </>
                            ) : (
                              '✓ Mark Replied'
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Done</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          {!loading && !error && (
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400 font-mono">
                Showing {visible.length} of {contacts.length} messages
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ══ DETAIL DRAWER ══ */}
      {selected && (
        <aside className="w-80 flex-shrink-0 bg-white border border-gray-200 rounded-xl shadow-sm p-5
                          self-start sticky top-6 flex flex-col gap-1">

          {/* Drawer header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900 text-base leading-tight">{selected.name}</h3>
              <p className="text-xs font-mono text-gray-500 mt-0.5">{selected.email}</p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-gray-400 hover:text-gray-700 text-xl leading-none transition-colors mt-0.5"
            >
              ×
            </button>
          </div>

          {/* Status badge */}
          <div className="mb-1">
            {selected.replied ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                               text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Replied
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                               text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Awaiting reply
              </span>
            )}
          </div>

          {/* Detail rows */}
          {[
            { label: 'EMAIL',     value: selected.email,              mono: true  },
            { label: 'RECEIVED',  value: `${fmtDate(selected.createdAt)} · ${fmtTime(selected.createdAt)}` },
          ].map((row) => (
            <div key={row.label} className="py-3 border-b border-gray-100">
              <p className="text-[10px] text-gray-400 tracking-widest font-mono mb-1">{row.label}</p>
              <p className={`text-gray-800 text-sm break-all ${row.mono ? 'font-mono' : ''}`}>
                {row.value || '—'}
              </p>
            </div>
          ))}

          {/* Message */}
          <div className="py-3 border-b border-gray-100">
            <p className="text-[10px] text-gray-400 tracking-widest font-mono mb-2">MESSAGE</p>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {selected.message || <span className="italic text-gray-400">No message provided</span>}
            </p>
          </div>

          {/* Reply shortcut */}
          <div className="pt-4 flex flex-col gap-2">
            <a
              href={`mailto:${selected.email}?subject=Re: Your message to Resurrection Church`}
              className="w-full flex items-center justify-center gap-2 bg-brand-red hover:opacity-90
                         text-white rounded-xl py-2.5 text-sm font-semibold transition-all shadow-sm"
              style={{ backgroundColor: '#b91c1c' }}
            >
              ✉ Reply via Email
            </a>

            {!selected.replied && (
              <button
                disabled={marking === selected._id}
                onClick={() => handleMarkReplied(selected._id)}
                className="w-full flex items-center justify-center gap-2 border border-green-400 text-green-600
                           hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed
                           rounded-xl py-2.5 text-sm font-medium transition-all"
              >
                {marking === selected._id ? (
                  <>
                    <span className="w-3 h-3 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  '✓ Mark as Replied'
                )}
              </button>
            )}
          </div>
        </aside>
      )}

      <style>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ManageContacts;