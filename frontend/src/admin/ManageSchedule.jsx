import React, { useState, useEffect, useCallback } from 'react';

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

/* ─── SKELETON ────────────────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="animate-pulse bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
    <div className="flex justify-between items-center mb-4">
      <div className="h-5 bg-gray-200 rounded w-32" />
      <div className="flex gap-2">
        <div className="h-8 w-16 bg-gray-200 rounded-lg" />
        <div className="h-8 w-16 bg-gray-200 rounded-lg" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
    </div>
  </div>
);

/* ─── EMPTY EVENT ─────────────────────────────────────────────────────────── */
const emptyEvent = () => ({ time: '', title: '' });

/* ─── MODAL ───────────────────────────────────────────────────────────────── */
const ScheduleModal = ({ initial, onClose, onSave, saving }) => {
  const [date, setDate]     = useState(initial?.date ?? '');
  const [events, setEvents] = useState(
    initial?.events?.length ? initial.events.map((e) => ({ time: e.time, title: e.title })) : [emptyEvent()]
  );
  const [formError, setFormError] = useState('');

  const setEventField = (idx, field, val) =>
    setEvents((prev) => prev.map((e, i) => i === idx ? { ...e, [field]: val } : e));

  const addEvent    = () => setEvents((prev) => [...prev, emptyEvent()]);
  const removeEvent = (idx) => setEvents((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date.trim()) { setFormError('Date label is required.'); return; }
    const validEvents = events.filter((ev) => ev.time.trim() || ev.title.trim());
    if (validEvents.length === 0) { setFormError('Add at least one event.'); return; }
    const incomplete = validEvents.find((ev) => !ev.time.trim() || !ev.title.trim());
    if (incomplete) { setFormError('Each event needs both a time and a title.'); return; }
    setFormError('');
    onSave({ date: date.trim().toUpperCase(), events: validEvents });
  };

  const inputCls = `w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800
    placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400
    transition-colors bg-white`;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-bold text-gray-900 text-lg">
            {initial ? 'Edit Schedule Day' : 'Add Schedule Day'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-5 overflow-y-auto flex-1">

          {formError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {formError}
            </p>
          )}

          {/* Date label */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Date Label <span className="text-red-500">*</span>
            </label>
            <input
              className={inputCls}
              placeholder='e.g. JANUARY 17 or EVERY SUNDAY'
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">Will be stored in uppercase automatically.</p>
          </div>

          {/* Events */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Events <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addEvent}
                className="text-xs text-red-600 hover:text-red-800 font-medium border border-red-300
                           hover:border-red-400 px-2.5 py-1 rounded-lg transition-all"
              >
                + Add Event
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {events.map((ev, idx) => (
                <div key={idx} className="flex gap-2 items-start bg-gray-50 rounded-xl p-3 border border-gray-200">
                  {/* Time */}
                  <div className="w-32 flex-shrink-0">
                    <input
                      className={inputCls}
                      placeholder="e.g. 9:00 AM"
                      value={ev.time}
                      onChange={(e) => setEventField(idx, 'time', e.target.value)}
                    />
                  </div>
                  {/* Title */}
                  <div className="flex-1">
                    <input
                      className={inputCls}
                      placeholder="Event title"
                      value={ev.title}
                      onChange={(e) => setEventField(idx, 'title', e.target.value)}
                    />
                  </div>
                  {/* Remove */}
                  {events.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEvent(idx)}
                      className="text-gray-400 hover:text-red-500 text-lg leading-none mt-2 transition-colors flex-shrink-0"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 border border-gray-300 text-gray-700 hover:border-gray-400
                         rounded-xl py-2.5 text-sm font-medium transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50
                         disabled:cursor-not-allowed text-white rounded-xl py-2.5
                         text-sm font-semibold transition-colors shadow-sm"
            >
              {saving ? 'Saving…' : initial ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── DELETE CONFIRM ──────────────────────────────────────────────────────── */
const DeleteConfirm = ({ label, onCancel, onConfirm, deleting }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-full max-w-sm text-center">
      <div className="text-4xl mb-3">🗑️</div>
      <h3 className="font-bold text-gray-900 text-lg mb-1">Delete "{label}"?</h3>
      <p className="text-gray-500 text-sm mb-6">
        All events under this day will be permanently removed.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={deleting}
          className="flex-1 border border-gray-300 text-gray-700 hover:border-gray-400
                     rounded-xl py-2.5 text-sm font-medium transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
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
);

/* ─── MAIN COMPONENT ──────────────────────────────────────────────────────── */
const ManageSchedule = () => {
  const [schedule, setSchedule]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [saving, setSaving]           = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [showModal, setShowModal]     = useState(false);
  const [editingDay, setEditingDay]   = useState(null);   // null = create mode
  const [deleteTarget, setDeleteTarget] = useState(null); // { _id, date }
  const [search, setSearch]           = useState('');

  const token = localStorage.getItem('admin_token');
  const authHeaders = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
  };

  /* ── fetch ── */
  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res  = await fetch(`${backendURL}/api/v1/schedule`, { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to fetch schedule');
      setSchedule(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSchedule(); }, []);

  /* ── create ── */
  const handleCreate = async (payload) => {
    setSaving(true);
    try {
      const res  = await fetch(`${backendURL}/api/v1/schedule`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to create');
      setSchedule((prev) => [...prev, data.data]);
      setShowModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ── update ── */
  const handleUpdate = async (payload) => {
    setSaving(true);
    try {
      const res  = await fetch(`${backendURL}/api/v1/schedule/${editingDay._id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to update');
      setSchedule((prev) => prev.map((d) => d._id === editingDay._id ? data.data : d));
      setShowModal(false);
      setEditingDay(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ── delete ── */
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res  = await fetch(`${backendURL}/api/v1/schedule/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to delete');
      setSchedule((prev) => prev.filter((d) => d._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  /* ── open modal helpers ── */
  const openCreate = () => { setEditingDay(null); setShowModal(true); };
  const openEdit   = (day) => { setEditingDay(day); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingDay(null); };

  /* ── filtered list ── */
  const visible = schedule.filter((d) => {
    const q = search.toLowerCase();
    return !q
      || d.date.toLowerCase().includes(q)
      || d.events.some((e) => e.title.toLowerCase().includes(q) || e.time.toLowerCase().includes(q));
  });

  /* ── stats ── */
  const totalEvents = schedule.reduce((acc, d) => acc + (d.events?.length ?? 0), 0);

  /* ════════════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Schedule</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage church service times and events by day</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchSchedule}
            className="border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800
                       px-4 py-2.5 rounded-lg text-sm transition-all"
          >
            ↻ Refresh
          </button>
          <button
            onClick={openCreate}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg shadow-md
                       transition flex items-center gap-2 font-medium text-sm"
          >
            + Add Day
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Schedule Days', value: schedule.length,  cls: 'text-gray-800'  },
          { label: 'Total Events',  value: totalEvents,       cls: 'text-red-600'   },
          { label: 'Showing',       value: visible.length,    cls: 'text-blue-600'  },
        ].map((s) => (
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
          <button onClick={fetchSchedule} className="text-sm underline ml-4">Retry</button>
        </div>
      )}

      {/* Search */}
      <input
        placeholder="Search by date or event title…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400
                   px-3.5 py-2 text-sm focus:outline-none focus:border-red-400 w-64 transition-colors"
      />

      {/* Schedule cards */}
      {loading ? (
        <div className="flex flex-col gap-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-16 text-center text-gray-400 shadow-sm">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-base font-medium">
            {schedule.length === 0 ? 'No schedule days yet.' : 'No results match your search.'}
          </p>
          {schedule.length === 0 && (
            <button
              onClick={openCreate}
              className="mt-4 text-sm text-red-600 hover:text-red-800 underline underline-offset-2"
            >
              Add your first day
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((day) => (
            <div
              key={day._id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden
                         hover:shadow-md transition-shadow"
            >
              {/* Card header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                  <h3 className="font-bold text-gray-900 text-base tracking-wide">{day.date}</h3>
                  <span className="text-xs text-gray-400 bg-white border border-gray-200 rounded-full px-2.5 py-0.5">
                    {day.events?.length ?? 0} {day.events?.length === 1 ? 'event' : 'events'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(day)}
                    className="text-amber-600 hover:text-amber-900 text-sm font-medium
                               border border-amber-300 hover:border-amber-400 rounded-lg px-3 py-1.5 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ _id: day._id, date: day.date })}
                    className="text-red-500 hover:text-red-800 text-sm font-medium
                               border border-red-300 hover:border-red-400 rounded-lg px-3 py-1.5 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Events list */}
              <div className="divide-y divide-gray-100">
                {!day.events || day.events.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-gray-400 italic">No events added.</p>
                ) : (
                  day.events.map((ev, idx) => (
                    <div key={ev._id ?? idx} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                      {/* Time */}
                      <span className="w-24 flex-shrink-0 text-xs font-mono font-semibold text-red-600
                                       bg-red-50 border border-red-100 rounded-lg px-2 py-1 text-center">
                        {ev.time}
                      </span>
                      {/* Title */}
                      <span className="text-sm text-gray-800 font-medium">{ev.title}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Row count */}
      {!loading && !error && schedule.length > 0 && (
        <p className="text-xs text-gray-400 font-mono">
          Showing {visible.length} of {schedule.length} schedule days
        </p>
      )}

      {/* ── Modals ── */}
      {showModal && (
        <ScheduleModal
          initial={editingDay}
          onClose={closeModal}
          onSave={editingDay ? handleUpdate : handleCreate}
          saving={saving}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          label={deleteTarget.date}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </div>
  );
};

export default ManageSchedule;