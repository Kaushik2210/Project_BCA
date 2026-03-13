import React, { useState, useEffect, useCallback } from 'react';

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

/* ─── HELPERS ─────────────────────────────────────────────────────────────── */
const fmtDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

/* ─── SKELETON ────────────────────────────────────────────────────────────── */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-4"><div className="h-4 w-4 bg-gray-200 rounded" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-2/3" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-full" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
    <td className="px-6 py-4 text-center"><div className="h-7 bg-gray-200 rounded w-20 mx-auto" /></td>
  </tr>
);

/* ─── MAIN COMPONENT ──────────────────────────────────────────────────────── */
const ManagePrayers = () => {
  const [prayers, setPrayers]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [selected, setSelected]         = useState(new Set());   // ids checked for bulk delete
  const [marking, setMarking]           = useState(null);        // id currently being marked
  const [deleting, setDeleting]         = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');       // 'all' | 'prayed' | 'pending'
  const [search, setSearch]             = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Add prayer form
  const [showForm, setShowForm]   = useState(false);
  const [formName, setFormName]   = useState('');
  const [formDesc, setFormDesc]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const token = localStorage.getItem('admin_token');
  const authHeaders = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
  };

  /* ── fetch ── */
  const fetchPrayers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res  = await fetch(`${backendURL}/api/v1/prayers`, { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to fetch prayers');
      setPrayers(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPrayers(); }, []);

  /* ── filtered list ── */
  const visible = prayers.filter((p) => {
    const matchStatus = filterStatus === 'all'
      || (filterStatus === 'prayed'  &&  p.prayed)
      || (filterStatus === 'pending' && !p.prayed);
    const q = search.toLowerCase();
    const matchSearch = !q
      || p.name.toLowerCase().includes(q)
      || (p.description ?? '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  /* ── stats ── */
  const stats = [
    { label: 'Total',   value: prayers.length,                        cls: 'text-gray-800'  },
    { label: 'Pending', value: prayers.filter((p) => !p.prayed).length, cls: 'text-amber-600' },
    { label: 'Prayed',  value: prayers.filter((p) =>  p.prayed).length, cls: 'text-green-600' },
  ];

  /* ── selection helpers ── */
  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === visible.length && visible.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(visible.map((p) => p._id)));
    }
  };

  const allChecked = visible.length > 0 && selected.size === visible.length;
  const someChecked = selected.size > 0 && selected.size < visible.length;

  /* ── mark as prayed ── */
  const handleMarkPrayed = async (id) => {
    setMarking(id);
    try {
      const res  = await fetch(`${backendURL}/api/v1/prayers/${id}/prayed`, {
        method: 'PUT',
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to update');
      setPrayers((prev) => prev.map((p) => p._id === id ? { ...p, prayed: true } : p));
    } catch (err) {
      alert(err.message);
    } finally {
      setMarking(null);
    }
  };

  /* ── bulk delete ── */
  const handleBulkDelete = async () => {
    setDeleting(true);
    try {
      const ids = [...selected];
      const res  = await fetch(`${backendURL}/api/v1/prayers`, {
        method: 'DELETE',
        headers: authHeaders,
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Delete failed');
      setPrayers((prev) => prev.filter((p) => !selected.has(p._id)));
      setSelected(new Set());
      setShowDeleteConfirm(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  /* ── add prayer ── */
  const handleAddPrayer = async (e) => {
    e.preventDefault();
    if (!formName.trim()) { setFormError('Name is required.'); return; }
    setSubmitting(true);
    setFormError('');
    try {
      const res  = await fetch(`${backendURL}/api/v1/prayers`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ name: formName.trim(), description: formDesc.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to create prayer');
      setPrayers((prev) => [data.data, ...prev]);
      setFormName('');
      setFormDesc('');
      setShowForm(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ════════════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Prayer Requests</h2>
          <p className="text-sm text-gray-500 mt-0.5">Review, pray over, and manage submitted requests</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchPrayers}
            className="border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800
                       px-4 py-2.5 rounded-lg text-sm transition-all"
          >
            ↻ Refresh
          </button>
          <button
            onClick={() => { setShowForm(true); setFormError(''); }}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg shadow-md
                       transition flex items-center gap-2 font-medium text-sm"
          >
            + Add Prayer
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
            <p className={`text-3xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchPrayers} className="text-sm underline ml-4">Retry</button>
        </div>
      )}

      {/* ── Filters + Bulk action bar ── */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          placeholder="Search name or description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400
                     px-3.5 py-2 text-sm focus:outline-none focus:border-red-400 w-56 transition-colors"
        />

        {/* Status filter pills */}
        {[
          { key: 'all',     label: 'All'     },
          { key: 'pending', label: 'Pending' },
          { key: 'prayed',  label: 'Prayed'  },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer
              ${filterStatus === key
                ? key === 'prayed'
                  ? 'border-green-400 text-green-600 bg-green-50'
                  : key === 'pending'
                  ? 'border-amber-400 text-amber-600 bg-amber-50'
                  : 'border-red-400 text-red-600 bg-red-50'
                : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700'}`}
          >
            {label}
          </button>
        ))}

        {/* Bulk delete button — only shows when items are selected */}
        {selected.size > 0 && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="ml-auto flex items-center gap-2 bg-red-50 border border-red-300 text-red-600
                       hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          >
            🗑 Delete {selected.size} selected
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* Select all checkbox */}
                <th className="px-4 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => { if (el) el.indeterminate = someChecked; }}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-gray-300 text-red-600
                               focus:ring-red-400 cursor-pointer accent-red-600"
                  />
                </th>
                {['Name', 'Description', 'Submitted', 'Status', 'Action'].map((h) => (
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
                    {prayers.length === 0
                      ? 'No prayer requests yet.'
                      : 'No requests match your filters.'}
                  </td>
                </tr>
              ) : (
                visible.map((p) => (
                  <tr
                    key={p._id}
                    className={`transition-colors
                      ${selected.has(p._id) ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selected.has(p._id)}
                        onChange={() => toggleOne(p._id)}
                        className="w-4 h-4 rounded border-gray-300 text-red-600
                                   focus:ring-red-400 cursor-pointer accent-red-600"
                      />
                    </td>

                    {/* Name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                    </td>

                    {/* Description */}
                    <td className="px-6 py-4 max-w-sm">
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {p.description || <span className="italic text-gray-400">No description</span>}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                      {fmtDate(p.createdAt)}
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {p.prayed ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                                         text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Prayed
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
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {!p.prayed ? (
                        <button
                          disabled={marking === p._id}
                          onClick={() => handleMarkPrayed(p._id)}
                          className="inline-flex items-center gap-1.5 border border-green-400 text-green-600
                                     hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed
                                     rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                        >
                          {marking === p._id ? (
                            <>
                              <span className="w-3 h-3 border-2 border-green-400 border-t-transparent
                                               rounded-full animate-spin" />
                              Saving…
                            </>
                          ) : (
                            <>🙏 Mark Prayed</>
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

        {/* Table footer */}
        {!loading && !error && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-400 font-mono">
              Showing {visible.length} of {prayers.length} requests
            </p>
            {selected.size > 0 && (
              <p className="text-xs text-red-500 font-medium">
                {selected.size} selected
              </p>
            )}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          ADD PRAYER MODAL
      ════════════════════════════════════════════════════════════════════ */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Add Prayer Request</h3>
              <button
                onClick={() => { setShowForm(false); setFormName(''); setFormDesc(''); setFormError(''); }}
                className="text-gray-400 hover:text-gray-700 text-xl leading-none transition-colors"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddPrayer} className="px-6 py-5 flex flex-col gap-4">
              {formError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {formError}
                </p>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Person's name"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-800
                             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400/30
                             focus:border-red-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Prayer Request
                </label>
                <textarea
                  rows={4}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Describe the prayer need…"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-800
                             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400/30
                             focus:border-red-400 transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setFormName(''); setFormDesc(''); setFormError(''); }}
                  className="flex-1 border border-gray-300 text-gray-700 hover:border-gray-400
                             rounded-xl py-2.5 text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50
                             disabled:cursor-not-allowed text-white rounded-xl py-2.5
                             text-sm font-semibold transition-colors shadow-sm"
                >
                  {submitting ? 'Saving…' : 'Add Prayer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          BULK DELETE CONFIRM MODAL
      ════════════════════════════════════════════════════════════════════ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-full max-w-sm text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">
              Delete {selected.size} {selected.size === 1 ? 'Prayer' : 'Prayers'}?
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              This action cannot be undone. The selected prayer requests will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 border border-gray-300 text-gray-700 hover:border-gray-400
                           rounded-xl py-2.5 text-sm font-medium transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50
                           disabled:cursor-not-allowed text-white rounded-xl py-2.5
                           text-sm font-semibold transition-colors shadow-sm"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ManagePrayers;