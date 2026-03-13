import React, { useState, useEffect, useCallback } from 'react';
import SermonModal from '../components/SermonModal';
import ChoirModal from '../components/ChoirModal';

/* ─── CONFIG ─────────────────────────────────────────────────────────────── */
const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

/* ─── APPOINTMENT HELPERS ────────────────────────────────────────────────── */
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

const APT_STATUS = {
  pending: {
    label: 'Pending',
    badge: 'bg-amber-100 text-amber-700 border border-amber-300',
    dot: 'bg-amber-500',
    drawerActive: 'bg-amber-50 border-amber-400 text-amber-700',
    actionBtn: 'text-amber-600 hover:text-amber-900',
  },
  confirmed: {
    label: 'Confirmed',
    badge: 'bg-green-100 text-green-700 border border-green-300',
    dot: 'bg-green-500',
    drawerActive: 'bg-green-50 border-green-400 text-green-700',
    actionBtn: 'text-green-600 hover:text-green-900',
  },
  cancelled: {
    label: 'Cancelled',
    badge: 'bg-red-100 text-red-700 border border-red-300',
    dot: 'bg-red-400',
    drawerActive: 'bg-red-50 border-red-400 text-red-700',
    actionBtn: 'text-red-600 hover:text-red-900',
  },
};

const APT_MODE = {
  'in-person': { label: 'In-Person', cls: 'bg-orange-100 text-orange-700 border border-orange-200' },
  virtual:     { label: 'Virtual',   cls: 'bg-violet-100 text-violet-700 border border-violet-200' },
};

/* ─── SMALL REUSABLE BITS ────────────────────────────────────────────────── */
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
      ${active ? activeClass : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700'}`}
  >
    {label}
  </button>
);

const AptSkeletonRow = () => (
  <tr className="animate-pulse">
    {[...Array(5)].map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </td>
    ))}
  </tr>
);

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
const AdminPage = () => {
  const [activeSection, setActiveSection] = useState('sermons');

  /* ── Sermon states ── */
  const [sermons, setSermons] = useState([]);
  const [loadingSermons, setLoadingSermons] = useState(true);
  const [errorSermons, setErrorSermons] = useState(null);
  const [selectedSermon, setSelectedSermon] = useState(null);
  const [showViewSermonModal, setShowViewSermonModal] = useState(false);
  const [showSermonModal, setShowSermonModal] = useState(false);
  const [editingSermon, setEditingSermon] = useState(null);

  /* ── Choir states ── */
  const [choirEvents, setChoirEvents] = useState([]);
  const [loadingChoir, setLoadingChoir] = useState(true);
  const [errorChoir, setErrorChoir] = useState(null);
  const [editingChoir, setEditingChoir] = useState(null);
  const [showChoirModal, setShowChoirModal] = useState(false);

  /* ── Appointment states ── */
  const [appointments, setAppointments]       = useState([]);
  const [loadingApt, setLoadingApt]           = useState(true);
  const [errorApt, setErrorApt]               = useState(null);
  const [selectedApt, setSelectedApt]         = useState(null);
  const [updatingApt, setUpdatingApt]         = useState(null);
  const [aptFilterStatus, setAptFilterStatus] = useState('all');
  const [aptFilterMode, setAptFilterMode]     = useState('all');
  const [aptSearch, setAptSearch]             = useState('');

  const token = localStorage.getItem('admin_token');
  const authHeaders = token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };

  /* ════════════════════════════════════════════════════════════════════════
     FETCH FUNCTIONS
  ════════════════════════════════════════════════════════════════════════ */
  const fetchSermons = async () => {
    try {
      setLoadingSermons(true);
      const res = await fetch(`${backendURL}/api/v1/sermons`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch sermons');
      const data = await res.json();
      setSermons(data.data?.sermons || []);
      setErrorSermons(null);
    } catch (err) {
      setErrorSermons('Failed to fetch sermons');
    } finally {
      setLoadingSermons(false);
    }
  };

  const fetchChoirEvents = async () => {
    try {
      setLoadingChoir(true);
      const res = await fetch(`${backendURL}/api/v1/choir`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch choir events');
      const data = await res.json();
      setChoirEvents(data.data || []);
      setErrorChoir(null);
    } catch (err) {
      setErrorChoir('Failed to fetch choir events');
    } finally {
      setLoadingChoir(false);
    }
  };

  const fetchAppointments = useCallback(async () => {
    try {
      setLoadingApt(true);
      setErrorApt(null);
      const res = await fetch(`${backendURL}/api/v1/appointments`, {
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message ?? 'Failed to load appointments');
      setAppointments(data.data ?? []);
    } catch (err) {
      setErrorApt(err.message);
    } finally {
      setLoadingApt(false);
    }
  }, []);

  useEffect(() => {
    fetchSermons();
    fetchChoirEvents();
    fetchAppointments();
  }, []);

  /* ════════════════════════════════════════════════════════════════════════
     SERMON HANDLERS
  ════════════════════════════════════════════════════════════════════════ */
  const handleViewSermon   = (sermon) => { setSelectedSermon(sermon); setShowViewSermonModal(true); };
  const handleAddSermon    = () => { setEditingSermon(null); setShowSermonModal(true); };
  const handleEditSermon   = (sermon) => { setEditingSermon(sermon); setShowSermonModal(true); };

  const handleDeleteSermon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sermon?')) return;
    try {
      const res = await fetch(`${backendURL}/api/v1/sermons/delete/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error();
      setSermons((prev) => prev.filter((s) => s._id !== id));
      alert('Sermon deleted successfully');
    } catch {
      alert('Failed to delete sermon');
    }
  };

  const handleSermonSuccess = (resultSermon) => {
    if (editingSermon) {
      setSermons((prev) => prev.map((s) => (s._id === resultSermon._id ? resultSermon : s)));
    } else {
      setSermons((prev) => [resultSermon, ...prev]);
    }
    setShowSermonModal(false);
    setEditingSermon(null);
  };

  /* ════════════════════════════════════════════════════════════════════════
     CHOIR HANDLERS
  ════════════════════════════════════════════════════════════════════════ */
  const handleAddChoir  = () => { setEditingChoir(null); setShowChoirModal(true); };
  const handleEditChoir = (event) => { setEditingChoir(event); setShowChoirModal(true); };

  const handleDeleteChoir = async (id) => {
    if (!window.confirm('Are you sure you want to delete this choir event?')) return;
    try {
      const res = await fetch(`${backendURL}/api/v1/choir/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error();
      setChoirEvents((prev) => prev.filter((e) => e._id !== id));
      alert('Event deleted successfully');
    } catch {
      alert('Failed to delete event');
    }
  };

  const handleChoirAdded   = (newEvent)     => { setChoirEvents([newEvent, ...choirEvents]); setShowChoirModal(false); };
  const handleChoirUpdated = (updatedEvent) => {
    setChoirEvents((prev) => prev.map((e) => (e._id === updatedEvent._id ? updatedEvent : e)));
    setShowChoirModal(false);
    setEditingChoir(null);
  };

  /* ════════════════════════════════════════════════════════════════════════
     APPOINTMENT HANDLERS
  ════════════════════════════════════════════════════════════════════════ */
  const updateAppointmentStatus = async (id, status) => {
    setUpdatingApt(id);
    try {
      const res = await fetch(`${backendURL}/api/v1/appointments/${id}`, {
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
      setUpdatingApt(null);
    }
  };

  /* ── derived filtered list ── */
  const visibleApts = appointments.filter((a) => {
    const matchStatus = aptFilterStatus === 'all' || a.status === aptFilterStatus;
    const matchMode   = aptFilterMode   === 'all' || a.appointmentMode === aptFilterMode;
    const q = aptSearch.toLowerCase();
    const matchSearch = !q || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.phone.includes(q);
    return matchStatus && matchMode && matchSearch;
  });

  /* ── appointment stats ── */
  const aptStats = [
    { label: 'Total',     value: appointments.length,                                          cls: 'text-gray-800'  },
    { label: 'Pending',   value: appointments.filter((a) => a.status === 'pending').length,   cls: 'text-amber-600' },
    { label: 'Confirmed', value: appointments.filter((a) => a.status === 'confirmed').length, cls: 'text-green-600' },
    { label: 'Cancelled', value: appointments.filter((a) => a.status === 'cancelled').length, cls: 'text-red-500'   },
  ];

  /* ════════════════════════════════════════════════════════════════════════
     MISC
  ════════════════════════════════════════════════════════════════════════ */
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.reload();
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-full" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-5/6" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
      <td className="px-6 py-4 text-center"><div className="h-8 bg-gray-200 rounded w-24 mx-auto" /></td>
    </tr>
  );

  /* ════════════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex md:flex-col md:w-72 bg-gradient-to-b from-brand-red to-red-800 text-white shadow-xl">
        <div className="p-6 border-b border-red-700">
          <h2 className="text-2xl font-bold tracking-tight">Resurrection Admin</h2>
          <p className="text-sm text-red-200 mt-1">Church Dashboard</p>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {[
            { key: 'sermons',      label: '📖 Sermons' },
            { key: 'choir',        label: '🎤 Choir Schedule' },
            { key: 'appointments', label: '📅 Appointments' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3
                ${activeSection === key
                  ? 'bg-white/20 text-white font-semibold'
                  : 'hover:bg-white/10 text-red-100'}`}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-red-700 text-sm text-red-200">
          Logged in •{' '}
          <button className="underline hover:text-white" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile Header */}
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center md:hidden">
          <h1 className="text-xl font-bold text-brand-red">Admin Dashboard</h1>
          <select
            value={activeSection}
            onChange={(e) => setActiveSection(e.target.value)}
            className="bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="sermons">Sermons</option>
            <option value="choir">Choir Schedule</option>
            <option value="appointments">Appointments</option>
          </select>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">

          {/* ══════════════ SERMONS SECTION ══════════════ */}
          {activeSection === 'sermons' && (
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h2 className="text-3xl font-bold text-gray-800">Manage Sermons</h2>
                <button
                  onClick={handleAddSermon}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg shadow-md transition flex items-center gap-2 font-medium"
                >
                  + New Sermon
                </button>
              </div>

              {errorSermons && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r">
                  {errorSermons}
                </div>
              )}

              <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Title', 'Description', 'Audio', 'Actions'].map((h) => (
                          <th key={h} className={`px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider ${h === 'Actions' ? 'text-center' : 'text-left'}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loadingSermons ? (
                        <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
                      ) : sermons.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                            No sermons found. Add your first sermon!
                          </td>
                        </tr>
                      ) : (
                        sermons.map((sermon) => (
                          <tr key={sermon._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{sermon.title}</td>
                            <td className="px-6 py-4 text-gray-600 max-w-md truncate">{sermon.description}</td>
                            <td className="px-6 py-4">
                              {sermon.sermon_url ? (
                                <a href={sermon.sermon_url} target="_blank" rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 hover:underline text-sm">
                                  Listen →
                                </a>
                              ) : (
                                <span className="text-gray-400 text-sm">No audio</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                              <button onClick={() => handleEditSermon(sermon)} className="text-amber-600 hover:text-amber-900 mr-3">Edit</button>
                              <button onClick={() => handleDeleteSermon(sermon._id)} className="text-red-600 hover:text-red-900">Delete</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ CHOIR SECTION ══════════════ */}
          {activeSection === 'choir' && (
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h2 className="text-3xl font-bold text-gray-800">Choir Schedule</h2>
                <button
                  onClick={handleAddChoir}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg shadow-md transition flex items-center gap-2 font-medium"
                >
                  + New Event
                </button>
              </div>

              {errorChoir && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r">
                  {errorChoir}
                </div>
              )}

              <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Date', 'Type', 'Title', 'Time', 'Actions'].map((h) => (
                          <th key={h} className={`px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider ${h === 'Actions' ? 'text-center' : 'text-left'}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loadingChoir ? (
                        <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
                      ) : choirEvents.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                            No choir events found. Add your first event!
                          </td>
                        </tr>
                      ) : (
                        choirEvents.map((e) => (
                          <tr key={e._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                              {e.month != null && e.day != null
                                ? new Date(e.year || new Date().getFullYear(), e.month, e.day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                                : '—'}
                            </td>
                            <td className="px-6 py-4 capitalize text-gray-700">{e.type || '—'}</td>
                            <td className="px-6 py-4 text-gray-900">{e.title || '—'}</td>
                            <td className="px-6 py-4 text-gray-700">{e.time || '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                              <button onClick={() => handleEditChoir(e)} className="text-amber-600 hover:text-amber-900 mr-4">Edit</button>
                              <button onClick={() => handleDeleteChoir(e._id)} className="text-red-600 hover:text-red-900">Delete</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ APPOINTMENTS SECTION ══════════════ */}
          {activeSection === 'appointments' && (
            <div className="max-w-7xl mx-auto flex gap-6">

              {/* Left: table + filters */}
              <div className="flex-1 min-w-0 flex flex-col gap-5">

                {/* Page title */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">Appointments</h2>
                    <p className="text-sm text-gray-500 mt-0.5">View and update all appointment requests</p>
                  </div>
                  <button
                    onClick={fetchAppointments}
                    className="border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800 px-4 py-2 rounded-lg text-sm transition-all"
                  >
                    ↻ Refresh
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {aptStats.map((s) => (
                    <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
                      <p className={`text-3xl font-bold ${s.cls}`}>{s.value}</p>
                      <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Error */}
                {errorApt && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r flex items-center justify-between">
                    <span>{errorApt}</span>
                    <button onClick={fetchAppointments} className="text-sm underline ml-4">Retry</button>
                  </div>
                )}

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Search */}
                  <input
                    placeholder="Search name, email, phone…"
                    value={aptSearch}
                    onChange={(e) => setAptSearch(e.target.value)}
                    className="border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 px-3.5 py-2 text-sm focus:outline-none focus:border-red-400 w-52 transition-colors"
                  />

                  {/* Status pills */}
                  <div className="flex gap-1.5">
                    <FilterPill active={aptFilterStatus === 'all'}       onClick={() => setAptFilterStatus('all')}       label="All"       activeClass="border-red-400 text-red-600 bg-red-50" />
                    <FilterPill active={aptFilterStatus === 'pending'}   onClick={() => setAptFilterStatus('pending')}   label="Pending"   activeClass="border-amber-400 text-amber-600 bg-amber-50" />
                    <FilterPill active={aptFilterStatus === 'confirmed'} onClick={() => setAptFilterStatus('confirmed')} label="Confirmed" activeClass="border-green-400 text-green-600 bg-green-50" />
                    <FilterPill active={aptFilterStatus === 'cancelled'} onClick={() => setAptFilterStatus('cancelled')} label="Cancelled" activeClass="border-red-400 text-red-600 bg-red-50" />
                  </div>

                  {/* Mode pills */}
                  <div className="flex gap-1.5">
                    <FilterPill active={aptFilterMode === 'all'}       onClick={() => setAptFilterMode('all')}       label="All Modes"  activeClass="border-red-400 text-red-600 bg-red-50" />
                    <FilterPill active={aptFilterMode === 'in-person'} onClick={() => setAptFilterMode('in-person')} label="In-Person"  activeClass="border-orange-400 text-orange-600 bg-orange-50" />
                    <FilterPill active={aptFilterMode === 'virtual'}   onClick={() => setAptFilterMode('virtual')}   label="Virtual"    activeClass="border-violet-400 text-violet-600 bg-violet-50" />
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {['Person', 'Slot', 'Mode', 'Status', 'Actions'].map((h) => (
                            <th key={h} className={`px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider ${h === 'Actions' ? 'text-center' : 'text-left'}`}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {loadingApt ? (
                          <><AptSkeletonRow /><AptSkeletonRow /><AptSkeletonRow /></>
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
                                      disabled={updatingApt === a._id}
                                      onClick={() => updateAppointmentStatus(a._id, 'confirmed')}
                                      className="text-green-600 hover:text-green-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                      {updatingApt === a._id ? '…' : 'Confirm'}
                                    </button>
                                  )}
                                  {a.status !== 'cancelled' && (
                                    <button
                                      disabled={updatingApt === a._id}
                                      onClick={() => updateAppointmentStatus(a._id, 'cancelled')}
                                      className="text-red-600 hover:text-red-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                      {updatingApt === a._id ? '…' : 'Cancel'}
                                    </button>
                                  )}
                                  {a.status !== 'pending' && (
                                    <button
                                      disabled={updatingApt === a._id}
                                      onClick={() => updateAppointmentStatus(a._id, 'pending')}
                                      className="text-amber-600 hover:text-amber-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                      {updatingApt === a._id ? '…' : 'Pending'}
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
                {!loadingApt && !errorApt && (
                  <p className="text-xs text-gray-400 font-mono">
                    Showing {visibleApts.length} of {appointments.length} appointments
                  </p>
                )}
              </div>

              {/* ── Detail Drawer ── */}
              {selectedApt && (
                <aside className="w-72 flex-shrink-0 bg-white border border-gray-200 rounded-xl shadow-sm p-5 self-start sticky top-6">

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base leading-tight">{selectedApt.name}</h3>
                      <div className="mt-2"><StatusBadge status={selectedApt.status} /></div>
                    </div>
                    <button
                      onClick={() => setSelectedApt(null)}
                      className="text-gray-400 hover:text-gray-700 text-xl leading-none transition-colors mt-0.5"
                    >
                      ×
                    </button>
                  </div>

                  {/* Detail rows */}
                  {[
                    { label: 'EMAIL', value: selectedApt.email,                            mono: true },
                    { label: 'PHONE', value: selectedApt.phone,                            mono: true },
                    { label: 'MODE',  value: APT_MODE[selectedApt.appointmentMode]?.label ?? selectedApt.appointmentMode },
                    {
                      label: 'SLOT',
                      value: selectedApt.slotId
                        ? `${fmtDate(selectedApt.slotId.date)} · ${fmt12(selectedApt.slotId.startTime)} – ${fmt12(selectedApt.slotId.endTime)}`
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
                  {selectedApt.message && (
                    <div className="py-3 border-b border-gray-100">
                      <p className="text-[10px] text-gray-400 tracking-widest font-mono mb-1">MESSAGE</p>
                      <p className="text-gray-600 text-sm leading-relaxed">{selectedApt.message}</p>
                    </div>
                  )}

                  {/* Status update */}
                  <div className="mt-4">
                    <p className="text-[10px] text-gray-400 tracking-widest font-mono mb-3">UPDATE STATUS</p>
                    <div className="flex flex-col gap-2">
                      {['pending', 'confirmed', 'cancelled'].map((s) => {
                        const cfg      = APT_STATUS[s];
                        const isActive = selectedApt.status === s;
                        return (
                          <button
                            key={s}
                            disabled={isActive || updatingApt === selectedApt._id}
                            onClick={() => updateAppointmentStatus(selectedApt._id, s)}
                            className={[
                              'flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl border text-sm font-medium text-left transition-all',
                              'disabled:cursor-not-allowed',
                              isActive
                                ? cfg.drawerActive
                                : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700',
                            ].join(' ')}
                          >
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? cfg.dot : 'bg-gray-300'}`} />
                            {cfg.label}
                            {isActive && <span className="ml-auto text-[10px] text-gray-400 font-mono">current</span>}
                            {updatingApt === selectedApt._id && !isActive && (
                              <span className="ml-auto text-xs text-gray-400">…</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </aside>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── Modals ── */}
      {showViewSermonModal && (
        <SermonModal
          sermon={selectedSermon}
          onClose={() => { setShowViewSermonModal(false); setSelectedSermon(null); }}
        />
      )}
      {showSermonModal && (
        <SermonModal
          sermon={editingSermon}
          onClose={() => { setShowSermonModal(false); setEditingSermon(null); }}
          onSuccess={handleSermonSuccess}
        />
      )}
      {showChoirModal && (
        <ChoirModal
          event={editingChoir}
          onAdd={handleChoirAdded}
          onUpdate={handleChoirUpdated}
          onClose={() => { setShowChoirModal(false); setEditingChoir(null); }}
        />
      )}
    </div>
  );
};

export default AdminPage;