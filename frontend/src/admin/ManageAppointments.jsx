import React, { useState, useEffect, useCallback } from 'react';

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════════════ */
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
  const hh   = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hh}:${String(m).padStart(2, '0')} ${ampm}`;
};

const todayISO = () => new Date().toISOString().split('T')[0];

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════════════════ */
const APT_STATUS = {
  pending: {
    label: 'Pending',
    badge: 'bg-amber-100 text-amber-700 border border-amber-300',
    dot:   'bg-amber-500',
    btn:   'border-amber-400 text-amber-700 bg-amber-50',
  },
  confirmed: {
    label: 'Confirmed',
    badge: 'bg-green-100 text-green-700 border border-green-300',
    dot:   'bg-green-500',
    btn:   'border-green-400 text-green-700 bg-green-50',
  },
  cancelled: {
    label: 'Cancelled',
    badge: 'bg-red-100 text-red-700 border border-red-300',
    dot:   'bg-red-400',
    btn:   'border-red-400 text-red-700 bg-red-50',
  },
};

const APT_MODE = {
  'in-person': { label: 'In-Person', cls: 'bg-orange-100 text-orange-700 border border-orange-200' },
  virtual:     { label: 'Virtual',   cls: 'bg-violet-100 text-violet-700 border border-violet-200' },
};

/* ═══════════════════════════════════════════════════════════════════════════
   SHARED MICRO-COMPONENTS
═══════════════════════════════════════════════════════════════════════════ */
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
  const m = APT_MODE[mode];
  if (!m) return null;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${m.cls}`}>
      {m.label}
    </span>
  );
};

const FilterPill = ({ label, active, onClick, activeClass }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer
      ${active ? activeClass : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700'}`}
  >
    {label}
  </button>
);

const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[...Array(6)].map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-4 bg-gray-200 rounded w-full" />
      </td>
    ))}
  </tr>
);

/* ═══════════════════════════════════════════════════════════════════════════
   TAB 1 — SLOT GENERATOR
═══════════════════════════════════════════════════════════════════════════ */
const emptySlotRow = () => ({ startTime: '', endTime: '' });

const SlotGenerator = () => {
  const [date, setDate]       = useState(todayISO());
  const [rows, setRows]       = useState([emptySlotRow()]);
  const [saving, setSaving]   = useState(false);
  const [result, setResult]   = useState(null); // { ok, message }
  const [formErr, setFormErr] = useState('');

  const token = localStorage.getItem('admin_token');
  const authHeaders = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
  };

  const setRow = (idx, field, val) =>
    setRows((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r));

  const addRow    = () => setRows((prev) => [...prev, emptySlotRow()]);
  const removeRow = (idx) => setRows((prev) => prev.filter((_, i) => i !== idx));

  /* Quick presets */
  const applyPreset = (preset) => {
    const presets = {
      morning: [
        { startTime: '09:00', endTime: '09:30' },
        { startTime: '09:30', endTime: '10:00' },
        { startTime: '10:00', endTime: '10:30' },
        { startTime: '10:30', endTime: '11:00' },
      ],
      afternoon: [
        { startTime: '13:00', endTime: '13:30' },
        { startTime: '13:30', endTime: '14:00' },
        { startTime: '14:00', endTime: '14:30' },
        { startTime: '14:30', endTime: '15:00' },
      ],
      fullDay: [
        { startTime: '09:00', endTime: '09:30' },
        { startTime: '09:30', endTime: '10:00' },
        { startTime: '10:00', endTime: '10:30' },
        { startTime: '10:30', endTime: '11:00' },
        { startTime: '13:00', endTime: '13:30' },
        { startTime: '13:30', endTime: '14:00' },
        { startTime: '14:00', endTime: '14:30' },
        { startTime: '14:30', endTime: '15:00' },
      ],
    };
    setRows(presets[preset]);
    setResult(null);
    setFormErr('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErr('');
    setResult(null);

    const valid = rows.filter((r) => r.startTime && r.endTime);
    if (!date) { setFormErr('Please select a date.'); return; }
    if (valid.length === 0) { setFormErr('Add at least one slot with start and end times.'); return; }
    const bad = valid.find((r) => r.startTime >= r.endTime);
    if (bad) { setFormErr(`Start time must be before end time (${bad.startTime} – ${bad.endTime}).`); return; }

    setSaving(true);
    try {
      const res  = await fetch(`${backendURL}/api/v1/slots`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ date, slots: valid }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setResult({ ok: false, message: data.message ?? 'Some slots conflict with existing ones.' });
      } else if (!res.ok) {
        throw new Error(data.message ?? 'Failed to create slots');
      } else {
        setResult({ ok: true, message: `${valid.length} slot${valid.length !== 1 ? 's' : ''} created successfully!` });
        setRows([emptySlotRow()]);
      }
    } catch (err) {
      setResult({ ok: false, message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const inputCls = `border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800
    focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 transition-colors bg-white`;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-800">Generate Appointment Slots</h3>
        <p className="text-sm text-gray-500 mt-0.5">Create time slots for a specific date that people can book</p>
      </div>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider self-center mr-1">Quick Presets:</span>
        {[
          { key: 'morning',   label: '🌅 Morning (9–11 AM)'     },
          { key: 'afternoon', label: '☀️ Afternoon (1–3 PM)'    },
          { key: 'fullDay',   label: '📅 Full Day'               },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => applyPreset(key)}
            className="px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-600
                       hover:border-red-400 hover:text-red-600 rounded-lg transition-all"
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-5">

        {/* Date picker */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={date}
            min={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            className={`${inputCls} w-48`}
          />
        </div>

        {/* Slot rows */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Time Slots <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={addRow}
              className="text-xs text-red-600 hover:text-red-800 font-medium border border-red-300
                         hover:border-red-400 px-2.5 py-1 rounded-lg transition-all"
            >
              + Add Slot
            </button>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[1fr_1fr_32px] gap-2 mb-1 px-1">
            <span className="text-xs text-gray-400 font-mono">Start Time</span>
            <span className="text-xs text-gray-400 font-mono">End Time</span>
          </div>

          <div className="flex flex-col gap-2">
            {rows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_1fr_32px] gap-2 items-center bg-gray-50 rounded-xl p-3 border border-gray-200">
                <input
                  type="time"
                  value={row.startTime}
                  onChange={(e) => setRow(idx, 'startTime', e.target.value)}
                  className={inputCls}
                />
                <input
                  type="time"
                  value={row.endTime}
                  onChange={(e) => setRow(idx, 'endTime', e.target.value)}
                  className={inputCls}
                />
                {rows.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    className="text-gray-400 hover:text-red-500 text-lg leading-none transition-colors"
                  >
                    ×
                  </button>
                ) : <div />}
              </div>
            ))}
          </div>
        </div>

        {/* Errors / result */}
        {formErr && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formErr}</p>
        )}
        {result && (
          <p className={`text-sm rounded-lg px-3 py-2 border
            ${result.ok
              ? 'text-green-700 bg-green-50 border-green-200'
              : 'text-red-600 bg-red-50 border-red-200'}`}>
            {result.ok ? '✓ ' : '✗ '}{result.message}
          </p>
        )}

        {/* Summary + submit */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            {rows.filter((r) => r.startTime && r.endTime).length} slot{rows.filter((r) => r.startTime && r.endTime).length !== 1 ? 's' : ''} ready to create
          </p>
          <button
            type="submit"
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed
                       text-white rounded-xl px-6 py-2.5 text-sm font-semibold transition-colors shadow-sm"
          >
            {saving ? 'Creating…' : 'Create Slots'}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   DETAIL DRAWER
═══════════════════════════════════════════════════════════════════════════ */
const DetailDrawer = ({ apt, onClose, onStatusChange, updating }) => {
  const slot = apt.slotId;

  return (
    <aside className="w-80 flex-shrink-0 bg-white border border-gray-200 rounded-xl shadow-sm p-5
                      self-start sticky top-0 flex flex-col gap-1">

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-bold text-gray-900 text-base leading-tight">{apt.name}</h3>
          <p className="text-xs font-mono text-gray-500 mt-0.5">{apt.email}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 text-xl leading-none transition-colors mt-0.5"
        >
          ×
        </button>
      </div>

      {/* Badges */}
      <div className="flex gap-2 flex-wrap mb-1">
        <StatusBadge status={apt.status} />
        <ModeBadge   mode={apt.appointmentMode} />
      </div>

      {/* Fields */}
      {[
        { label: 'PHONE',   value: apt.phone,  mono: true },
        { label: 'DATE',    value: slot?.date ? fmtDate(slot.date) : '—' },
        { label: 'TIME',    value: slot ? `${fmt12(slot.startTime)} – ${fmt12(slot.endTime)}` : '—' },
      ].map((row) => (
        <div key={row.label} className="py-2.5 border-b border-gray-100">
          <p className="text-[10px] text-gray-400 tracking-widest font-mono mb-0.5">{row.label}</p>
          <p className={`text-gray-800 text-sm ${row.mono ? 'font-mono' : ''}`}>{row.value || '—'}</p>
        </div>
      ))}

      {/* Message */}
      <div className="py-2.5 border-b border-gray-100">
        <p className="text-[10px] text-gray-400 tracking-widest font-mono mb-0.5">MESSAGE</p>
        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
          {apt.message || <span className="italic text-gray-400">No message</span>}
        </p>
      </div>

      {/* Status actions */}
      <div className="pt-3 flex flex-col gap-2">
        <p className="text-[10px] text-gray-400 tracking-widest font-mono">UPDATE STATUS</p>
        {['confirmed', 'pending', 'cancelled']
          .filter((s) => s !== apt.status)
          .map((s) => {
            const cfg = APT_STATUS[s];
            return (
              <button
                key={s}
                disabled={updating}
                onClick={() => onStatusChange(apt._id, s)}
                className={`w-full flex items-center justify-center gap-2 border rounded-xl
                            py-2.5 text-sm font-medium transition-all disabled:opacity-40
                            disabled:cursor-not-allowed hover:opacity-80 ${cfg.btn}`}
              >
                {updating ? (
                  <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : null}
                Mark {cfg.label}
              </button>
            );
          })}
      </div>
    </aside>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   TAB 2 — APPOINTMENTS
═══════════════════════════════════════════════════════════════════════════ */
const AppointmentManager = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [updating, setUpdating]         = useState(false);
  const [selected, setSelected]         = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMode, setFilterMode]     = useState('all');
  const [search, setSearch]             = useState('');

  const token = localStorage.getItem('admin_token');
  const authHeaders = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
  };

  /* ── fetch ── */
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res  = await fetch(`${backendURL}/api/v1/appointments`, { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to fetch appointments');
      setAppointments(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAppointments(); }, []);

  /* ── update status ── */
  const handleStatusChange = async (id, status) => {
    setUpdating(true);
    try {
      const res  = await fetch(`${backendURL}/api/v1/appointments/${id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Update failed');
      setAppointments((prev) => prev.map((a) => a._id === id ? { ...a, status } : a));
      if (selected?._id === id) setSelected((prev) => ({ ...prev, status }));
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  /* ── filtered ── */
  const visible = appointments.filter((a) => {
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchMode   = filterMode   === 'all' || a.appointmentMode === filterMode;
    const q = search.toLowerCase();
    const matchSearch = !q
      || a.name.toLowerCase().includes(q)
      || a.email.toLowerCase().includes(q)
      || (a.phone ?? '').includes(q);
    return matchStatus && matchMode && matchSearch;
  });

  /* ── stats ── */
  const counts = appointments.reduce(
    (acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; },
    { pending: 0, confirmed: 0, cancelled: 0 }
  );

  return (
    <div className="flex gap-6">
      {/* Main panel */}
      <div className="flex-1 min-w-0 flex flex-col gap-5">

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total',     value: appointments.length, cls: 'text-gray-800'  },
            { label: 'Pending',   value: counts.pending,       cls: 'text-amber-600' },
            { label: 'Confirmed', value: counts.confirmed,     cls: 'text-green-600' },
            { label: 'Cancelled', value: counts.cancelled,     cls: 'text-red-500'   },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
              <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
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
          <input
            placeholder="Search name, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400
                       px-3.5 py-2 text-sm focus:outline-none focus:border-red-400 w-52 transition-colors"
          />

          {/* Status pills */}
          {[
            { key: 'all',       label: 'All',       active: 'border-red-400 text-red-600 bg-red-50'     },
            { key: 'pending',   label: 'Pending',   active: 'border-amber-400 text-amber-600 bg-amber-50' },
            { key: 'confirmed', label: 'Confirmed', active: 'border-green-400 text-green-600 bg-green-50' },
            { key: 'cancelled', label: 'Cancelled', active: 'border-red-400 text-red-600 bg-red-50'      },
          ].map(({ key, label, active }) => (
            <FilterPill
              key={key}
              label={label}
              active={filterStatus === key}
              onClick={() => setFilterStatus(key)}
              activeClass={active}
            />
          ))}

          <span className="w-px h-4 bg-gray-300" />

          {/* Mode pills */}
          {[
            { key: 'all',        label: 'All Modes',  active: 'border-gray-500 text-gray-700 bg-gray-100'       },
            { key: 'in-person',  label: 'In-Person',  active: 'border-orange-400 text-orange-700 bg-orange-50'  },
            { key: 'virtual',    label: 'Virtual',    active: 'border-violet-400 text-violet-700 bg-violet-50'  },
          ].map(({ key, label, active }) => (
            <FilterPill
              key={key}
              label={label}
              active={filterMode === key}
              onClick={() => setFilterMode(key)}
              activeClass={active}
            />
          ))}

          <button
            onClick={fetchAppointments}
            className="ml-auto border border-gray-300 text-gray-600 hover:border-gray-400
                       text-sm px-3 py-1.5 rounded-lg transition-all"
          >
            ↻
          </button>
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
                      className={`px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider
                        ${h === 'Actions' || h === 'Status' || h === 'Mode' ? 'text-center' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
                ) : visible.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-14 text-center text-gray-400 italic">
                      {appointments.length === 0
                        ? 'No appointments yet.'
                        : 'No appointments match your filters.'}
                    </td>
                  </tr>
                ) : (
                  visible.map((apt) => {
                    const slot = apt.slotId;
                    return (
                      <tr
                        key={apt._id}
                        onClick={() => setSelected(selected?._id === apt._id ? null : apt)}
                        className={`cursor-pointer transition-colors
                          ${selected?._id === apt._id ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                      >
                        {/* Person */}
                        <td className="px-4 py-4">
                          <p className="font-semibold text-gray-900 text-sm">{apt.name}</p>
                          <p className="text-xs font-mono text-gray-500">{apt.email}</p>
                          <p className="text-xs text-gray-400">{apt.phone}</p>
                        </td>

                        {/* Slot */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-700">{slot?.date ? fmtDate(slot.date) : '—'}</p>
                          <p className="text-xs text-gray-500 font-mono">
                            {slot ? `${fmt12(slot.startTime)} – ${fmt12(slot.endTime)}` : '—'}
                          </p>
                        </td>

                        {/* Mode */}
                        <td className="px-4 py-4 text-center whitespace-nowrap">
                          <ModeBadge mode={apt.appointmentMode} />
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4 text-center whitespace-nowrap">
                          <StatusBadge status={apt.status} />
                        </td>

                        {/* Actions */}
                        <td
                          className="px-4 py-4 text-center whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            {apt.status !== 'confirmed' && (
                              <button
                                disabled={updating}
                                onClick={() => handleStatusChange(apt._id, 'confirmed')}
                                className="text-xs border border-green-400 text-green-600 hover:bg-green-50
                                           disabled:opacity-40 rounded-lg px-2.5 py-1.5 transition-all font-medium"
                              >
                                Confirm
                              </button>
                            )}
                            {apt.status !== 'cancelled' && (
                              <button
                                disabled={updating}
                                onClick={() => handleStatusChange(apt._id, 'cancelled')}
                                className="text-xs border border-red-400 text-red-600 hover:bg-red-50
                                           disabled:opacity-40 rounded-lg px-2.5 py-1.5 transition-all font-medium"
                              >
                                Cancel
                              </button>
                            )}
                            {apt.status !== 'pending' && (
                              <button
                                disabled={updating}
                                onClick={() => handleStatusChange(apt._id, 'pending')}
                                className="text-xs border border-amber-400 text-amber-600 hover:bg-amber-50
                                           disabled:opacity-40 rounded-lg px-2.5 py-1.5 transition-all font-medium"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!loading && !error && (
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400 font-mono">
                Showing {visible.length} of {appointments.length} appointments
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <DetailDrawer
          apt={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          updating={updating}
        />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   TAB 3 — SLOT VIEWER
═══════════════════════════════════════════════════════════════════════════ */
const SlotViewer = () => {
  const [date, setDate]     = useState(todayISO());
  const [slots, setSlots]   = useState(null);   // null = not fetched yet
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const token = localStorage.getItem('admin_token');
  const authHeaders = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
  };

  const fetchSlots = async (d) => {
    if (!d) return;
    setLoading(true);
    setError(null);
    setSlots(null);
    try {
      const res  = await fetch(`${backendURL}/api/v1/slots?date=${d}`, { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to fetch slots');
      // Backend returns [{ [id]: "startTime-endTime" }, ...]
      // Normalise into [{ id, startTime, endTime }]
      const raw = Array.isArray(data.data) ? data.data : [];
      const normalised = raw.map((entry) => {
        const [id, range] = Object.entries(entry)[0];
        const [startTime, endTime] = range.split('-');
        return { id, startTime: startTime?.trim(), endTime: endTime?.trim() };
      });
      setSlots(normalised);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch when date changes
  useEffect(() => { fetchSlots(date); }, [date]);

  const booked   = slots?.filter((s) => s.isBooked)   ?? [];
  const available = slots?.filter((s) => !s.isBooked) ?? [];

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-800">View Slots by Date</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          See all available slots generated for a specific day
        </p>
      </div>

      {/* Date picker row */}
      <div className="flex items-end gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
            Select Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800
                       focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400
                       transition-colors bg-white"
          />
        </div>
        <button
          onClick={() => fetchSlots(date)}
          disabled={loading}
          className="border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800
                     px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-40"
        >
          {loading ? '…' : '↻ Refresh'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white border border-gray-200 rounded-xl p-4 h-20" />
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && slots !== null && (
        <>
          {/* Summary bar */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Slots', value: slots.length,      cls: 'text-gray-800'  },
              { label: 'Available',   value: slots.length,      cls: 'text-green-600' },
              { label: 'Booked',      value: 0,                 cls: 'text-red-500'   },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
                <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>

          {slots.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-14 text-center shadow-sm">
              <p className="text-3xl mb-3">🕐</p>
              <p className="text-gray-500 font-medium">No available slots for this date.</p>
              <p className="text-gray-400 text-sm mt-1">
                Switch to the <span className="font-semibold">Slot Generator</span> tab to add some.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              {/* Table header */}
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Available Slots — {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
                <span className="text-xs bg-green-100 text-green-700 border border-green-300
                                 font-semibold px-2.5 py-1 rounded-full">
                  {slots.length} open
                </span>
              </div>

              {/* Slot grid */}
              <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex flex-col items-center justify-center gap-1 border border-green-200
                               bg-green-50 rounded-xl p-4 text-center"
                  >
                    {/* Time range */}
                    <span className="text-sm font-bold text-green-800 font-mono">
                      {fmt12(slot.startTime)}
                    </span>
                    <span className="text-xs text-green-600 font-mono">→ {fmt12(slot.endTime)}</span>
                    {/* Duration */}
                    <span className="mt-1 text-[10px] text-green-500 bg-green-100 border border-green-200
                                     rounded-full px-2 py-0.5 font-mono">
                      {(() => {
                        const [sh, sm] = slot.startTime.split(':').map(Number);
                        const [eh, em] = slot.endTime.split(':').map(Number);
                        const mins = (eh * 60 + em) - (sh * 60 + sm);
                        return mins > 0 ? `${mins} min` : '—';
                      })()}
                    </span>
                    <span className="text-[10px] text-green-600 font-semibold uppercase tracking-wide mt-0.5">
                      Available
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   ROOT — TABBED SHELL
═══════════════════════════════════════════════════════════════════════════ */
const TABS = [
  { key: 'appointments', label: '📅 Appointments'  },
  { key: 'slots',        label: '🕐 Slot Generator' },
  { key: 'view',         label: '🗓 View Slots'     },
];

const ManageAppointments = () => {
  const [tab, setTab] = useState('appointments');

  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Appointments</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage bookings and generate available time slots
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all
              ${tab === key
                ? 'bg-white shadow text-gray-900'
                : 'text-gray-500 hover:text-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {tab === 'appointments' && <AppointmentManager />}
      {tab === 'slots'        && <SlotGenerator />}
      {tab === 'view'         && <SlotViewer />}
    </div>
  );
};

export default ManageAppointments;