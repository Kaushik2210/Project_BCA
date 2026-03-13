import React, { useState, useEffect, useCallback } from 'react';

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

/* ─── HELPERS ─────────────────────────────────────────────────────────────── */
const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

const fmt12 = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hh}:${String(m).padStart(2, '0')} ${ampm}`;
};

/* ─── CONFIG ──────────────────────────────────────────────────────────────── */
const APT_STATUS = {
  pending: {
    label: 'Pending',
    badge: 'bg-amber-100 text-amber-700 border border-amber-300',
    dot: 'bg-amber-500',
    drawerActive: 'bg-amber-50 border-amber-400 text-amber-700',
  },
  confirmed: {
    label: 'Confirmed',
    badge: 'bg-green-100 text-green-700 border border-green-300',
    dot: 'bg-green-500',
    drawerActive: 'bg-green-50 border-green-400 text-green-700',
  },
  cancelled: {
    label: 'Cancelled',
    badge: 'bg-red-100 text-red-700 border border-red-300',
    dot: 'bg-red-400',
    drawerActive: 'bg-red-50 border-red-400 text-red-700',
  },
};

const APT_MODE = {
  'in-person': { label: 'In-Person', cls: 'bg-orange-100 text-orange-700 border border-orange-200' },
  virtual:     { label: 'Virtual',   cls: 'bg-violet-100 text-violet-700 border border-violet-200' },
};

/* ─── SUB-COMPONENTS ──────────────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const s = APT_STATUS[status] ?? APT_STATUS.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

const ModeBadge = ({ mode }) => {
  const m = APT_MODE[mode] ?? { label: mode, cls: 'bg-gray-100 text-gray-600 border border-gray-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${m.cls}`}>
      {m.label}
    </span>
  );
};

const FilterPill = ({ active, onClick, label, activeClass }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer
      ${active
        ? activeClass
        : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700'}`}
  >
    {label}
  </button>
);

const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[...Array(5)].map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </td>
    ))}
  </tr>
);

/* ─── DETAIL DRAWER ───────────────────────────────────────────────────────── */
const DetailDrawer = ({ appointment, onClose, onUpdateStatus, updating }) => {
  const a = appointment;

  return (
    <aside className="w-72 flex-shrink-0 bg-white border border-gray-200 rounded-xl shadow-sm p-5 self-start sticky top-6">

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-base leading-tight">{a.name}</h3>
          <div className="mt-2">
            <StatusBadge status={a.status} />
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 text-xl leading-none transition-colors mt-0.5"
        >
          ×
        </button>
      </div>

      {/* Detail rows */}
      {[
        { label: 'EMAIL', value: a.email, mono: true },
        { label: 'PHONE', value: a.phone, mono: true },
        { label: 'MODE',  value: APT_MODE[a.appointmentMode]?.label ?? a.appointmentMode },
        {
          label: 'SLOT',
          value: a.slotId
            ? `${fmtDate(a.slotId.date)} · ${fmt12(a.slotId.startTime)} – ${fmt12(a.slotId.endTime)}`
            : '—',
        },
      ].map((row) => (
        <div key={row.label} className="py-3 border-b border-gray-100">
          <p className="text-[10px] text-gray-400 tracking-widest font-mono mb-1">{row.label}</p>
          <p className={`text-gray-800 text-sm break-all ${row.mono ? 'font-mono' : ''}`}>
            {row.value || '—'}
          </p>
        </div>
      ))}

      {/* Message */}
      {a.message && (
        <div className="py-3 border-b border-gray-100">
          <p className="text-[10px] text-gray-400 tracking-widest font-mono mb-1">MESSAGE</p>
          <p className="text-gray-600 text-sm leading-relaxed">{a.message}</p>
        </div>
      )}

      {/* Status update */}
      <div className="mt-4">
        <p className="text-[10px] text-gray-400 tracking-widest font-mono mb-3">UPDATE STATUS</p>
        <div className="flex flex-col gap-2">
          {['pending', 'confirmed', 'cancelled'].map((s) => {
            const cfg      = APT_STATUS[s];
            const isActive = a.status === s;
            return (
              <button
                key={s}
                disabled={isActive || updating === a._id}
                onClick={() => onUpdateStatus(a._id, s)}
                className={[
                  'flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl border text-sm font-medium text-left transition-all',
                  'disabled:cursor-not-allowed',
                  isActive
                    ? cfg.drawerActive
                    : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700',
                ].join(' ')}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? cfg.dot : 'bg-gray-300'}`} />
                {cfg.label}
                {isActive && (
                  <span className="ml-auto text-[10px] text-gray-400 font-mono">current</span>
                )}
                {updating === a._id && !isActive && (
                  <span className="ml-auto text-xs text-gray-400">…</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

/* ─── MAIN COMPONENT ──────────────────────────────────────────────────────── */
const ManageAppointments = () => {
  const [appointments, setAppointments]       = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);
  const [selectedApt, setSelectedApt]         = useState(null);
  const [updating, setUpdating]               = useState(null);
  const [filterStatus, setFilterStatus]       = useState('all');
  const [filterMode, setFilterMode]           = useState('all');
  const [search, setSearch]                   = useState('');

  const token = localStorage.getItem('admin_token');
  const authHeaders = token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };

  /* ── fetch ── */
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res  = await fetch(`${backendURL}/api/v1/appointments`, { headers: authHeaders });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message ?? 'Failed to load appointments');
      setAppointments(data.data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAppointments(); }, []);

  /* ── update status ── */
  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      const res  = await fetch(`${backendURL}/api/v1/appointments/${id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message ?? 'Update failed');
      setAppointments((prev) => prev.map((a) => (a._id === id ? { ...a, status } : a)));
      if (selectedApt?._id === id) setSelectedApt((prev) => ({ ...prev, status }));
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(null);
    }
  };

  /* ── derived list ── */
  const visibleApts = appointments.filter((a) => {
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchMode   = filterMode   === 'all' || a.appointmentMode === filterMode;
    const q           = search.toLowerCase();
    const matchSearch = !q
      || a.name.toLowerCase().includes(q)
      || a.email.toLowerCase().includes(q)
      || a.phone.includes(q);
    return matchStatus && matchMode && matchSearch;
  });

  /* ── stats ── */
  const stats = [
    { label: 'Total',     value: appointments.length,                                          cls: 'text-gray-800'  },
    { label: 'Pending',   value: appointments.filter((a) => a.status === 'pending').length,   cls: 'text-amber-600' },
    { label: 'Confirmed', value: appointments.filter((a) => a.status === 'confirmed').length, cls: 'text-green-600' },
    { label: 'Cancelled', value: appointments.filter((a) => a.status === 'cancelled').length, cls: 'text-red-500'   },
  ];

  /* ── render ── */
  return (
    <div className="max-w-7xl mx-auto flex gap-6">

      {/* ── Left panel ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-5">

        {/* Page title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Appointments</h2>
            <p className="text-sm text-gray-500 mt-0.5">View and update all appointment requests</p>
          </div>
          <button
            onClick={fetchAppointments}
            className="border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800
                       px-4 py-2 rounded-lg text-sm transition-all"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
            <button onClick={fetchAppointments} className="text-sm underline ml-4">Retry</button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <input
            placeholder="Search name, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400
                       px-3.5 py-2 text-sm focus:outline-none focus:border-red-400 w-52 transition-colors"
          />

          {/* Status pills */}
          <div className="flex gap-1.5">
            <FilterPill active={filterStatus === 'all'}       onClick={() => setFilterStatus('all')}       label="All"       activeClass="border-red-400 text-red-600 bg-red-50" />
            <FilterPill active={filterStatus === 'pending'}   onClick={() => setFilterStatus('pending')}   label="Pending"   activeClass="border-amber-400 text-amber-600 bg-amber-50" />
            <FilterPill active={filterStatus === 'confirmed'} onClick={() => setFilterStatus('confirmed')} label="Confirmed" activeClass="border-green-400 text-green-600 bg-green-50" />
            <FilterPill active={filterStatus === 'cancelled'} onClick={() => setFilterStatus('cancelled')} label="Cancelled" activeClass="border-red-400 text-red-600 bg-red-50" />
          </div>

          {/* Mode pills */}
          <div className="flex gap-1.5">
            <FilterPill active={filterMode === 'all'}       onClick={() => setFilterMode('all')}       label="All Modes" activeClass="border-red-400 text-red-600 bg-red-50" />
            <FilterPill active={filterMode === 'in-person'} onClick={() => setFilterMode('in-person')} label="In-Person" activeClass="border-orange-400 text-orange-600 bg-orange-50" />
            <FilterPill active={filterMode === 'virtual'}   onClick={() => setFilterMode('virtual')}   label="Virtual"   activeClass="border-violet-400 text-violet-600 bg-violet-50" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Person', 'Slot', 'Mode', 'Status', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className={`px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider
                        ${h === 'Actions' ? 'text-center' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
                ) : visibleApts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                      No appointments match your filters.
                    </td>
                  </tr>
                ) : (
                  visibleApts.map((a) => (
                    <tr
                      key={a._id}
                      onClick={() => setSelectedApt(selectedApt?._id === a._id ? null : a)}
                      className={`transition-colors cursor-pointer
                        ${selectedApt?._id === a._id ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                    >
                      {/* Person */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900 text-sm">{a.name}</p>
                        <p className="text-gray-500 text-xs font-mono mt-0.5">{a.email}</p>
                        <p className="text-gray-400 text-xs font-mono">{a.phone}</p>
                      </td>

                      {/* Slot */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {a.slotId ? (
                          <>
                            <p className="text-gray-900 text-sm">{fmtDate(a.slotId.date)}</p>
                            <p className="text-gray-500 text-xs font-mono mt-0.5">
                              {fmt12(a.slotId.startTime)} – {fmt12(a.slotId.endTime)}
                            </p>
                          </>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>

                      {/* Mode */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ModeBadge mode={a.appointmentMode} />
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={a.status} />
                      </td>

                      {/* Actions */}
                      <td
                        className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-3">
                          {a.status !== 'confirmed' && (
                            <button
                              disabled={updating === a._id}
                              onClick={() => updateStatus(a._id, 'confirmed')}
                              className="text-green-600 hover:text-green-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                              {updating === a._id ? '…' : 'Confirm'}
                            </button>
                          )}
                          {a.status !== 'cancelled' && (
                            <button
                              disabled={updating === a._id}
                              onClick={() => updateStatus(a._id, 'cancelled')}
                              className="text-red-600 hover:text-red-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                              {updating === a._id ? '…' : 'Cancel'}
                            </button>
                          )}
                          {a.status !== 'pending' && (
                            <button
                              disabled={updating === a._id}
                              onClick={() => updateStatus(a._id, 'pending')}
                              className="text-amber-600 hover:text-amber-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                              {updating === a._id ? '…' : 'Pending'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Count */}
        {!loading && !error && (
          <p className="text-xs text-gray-400 font-mono">
            Showing {visibleApts.length} of {appointments.length} appointments
          </p>
        )}
      </div>

      {/* ── Detail drawer ── */}
      {selectedApt && (
        <DetailDrawer
          appointment={selectedApt}
          onClose={() => setSelectedApt(null)}
          onUpdateStatus={updateStatus}
          updating={updating}
        />
      )}
    </div>
  );
};

export default ManageAppointments;