import React, { useState, useEffect } from 'react';
import ChoirModal from '../components/ChoirModal.jsx';
import { getToken } from "../utils/auth.js";

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-full" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-5/6" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
    <td className="px-6 py-4 text-center"><div className="h-8 bg-gray-200 rounded w-24 mx-auto" /></td>
  </tr>
);

const ManageChoirSchedule = () => {
  const [choirEvents, setChoirEvents]     = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [editingChoir, setEditingChoir]   = useState(null);
  const [showModal, setShowModal]         = useState(false);

  const token = getToken();

  /* ── fetch ── */
  const fetchChoirEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${backendURL}/api/v1/choir`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch choir events');
      const data = await res.json();
      setChoirEvents(data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch choir events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchChoirEvents(); }, []);

  /* ── handlers ── */
  const handleAdd  = () => { setEditingChoir(null); setShowModal(true); };
  const handleEdit = (event) => { setEditingChoir(event); setShowModal(true); };
  const handleClose = () => { setShowModal(false); setEditingChoir(null); };

  const handleDelete = async (id) => {
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

  const handleAdded = (newEvent) => {
    setChoirEvents((prev) => [newEvent, ...prev]);
    handleClose();
  };

  const handleUpdated = (updatedEvent) => {
    setChoirEvents((prev) =>
      prev.map((e) => (e._id === updatedEvent._id ? updatedEvent : e))
    );
    handleClose();
  };

  const formatDate = (e) => {
    if (e.month == null || e.day == null) return '—';
    return new Date(
      e.year || new Date().getFullYear(),
      e.month,
      e.day
    ).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  /* ── render ── */
  return (
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Choir Schedule</h2>
        <button
          onClick={handleAdd}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg shadow-md transition flex items-center gap-2 font-medium"
        >
          + New Event
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Date', 'Type', 'Title', 'Time', 'Actions'].map((h) => (
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
                      {formatDate(e)}
                    </td>
                    <td className="px-6 py-4 capitalize text-gray-700">{e.type || '—'}</td>
                    <td className="px-6 py-4 text-gray-900">{e.title || '—'}</td>
                    <td className="px-6 py-4 text-gray-700">{e.time || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => handleEdit(e)}
                        className="text-amber-600 hover:text-amber-900 mr-4 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(e._id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ChoirModal
          event={editingChoir}
          onAdd={handleAdded}
          onUpdate={handleUpdated}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

export default ManageChoirSchedule;