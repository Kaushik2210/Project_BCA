// Import React hooks for state and side effects.
import React, { useState, useEffect } from 'react';
// Import the ChoirModal component for add/edit dialogs.
import ChoirModal from '../components/ChoirModal.jsx';
// Import auth utility to retrieve the JWT token.
import { getToken } from "../utils/auth.js";

// Backend API base URL with local fallback.
const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// =========================================================================
// SkeletonRow — Animated placeholder rows shown during data loading.
// Each cell has a pulsing gray bar to indicate content is coming.
// =========================================================================
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-full" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-5/6" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
    <td className="px-6 py-4 text-center"><div className="h-8 bg-gray-200 rounded w-24 mx-auto" /></td>
  </tr>
);

// =========================================================================
// ManageChoirSchedule — Admin panel for managing choir events (practices & performances).
// Features: Table display with CRUD operations, modal-based add/edit.
// =========================================================================
const ManageChoirSchedule = () => {
  // State for the list of choir events.
  const [choirEvents, setChoirEvents]     = useState([]);
  // Loading state for skeleton display.
  const [loading, setLoading]             = useState(true);
  // Error state for displaying API errors.
  const [error, setError]                 = useState(null);
  // Tracks the choir event being edited (null = adding new).
  const [editingChoir, setEditingChoir]   = useState(null);
  // Controls visibility of the ChoirModal.
  const [showModal, setShowModal]         = useState(false);

  // Retrieve the JWT token for authenticated requests.
  const token = getToken();

  // Fetch all choir events from the backend API.
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

  // Fetch choir events on component mount.
  useEffect(() => { fetchChoirEvents(); }, []);

  // Handler: Open modal in "add" mode (no event pre-filled).
  const handleAdd  = () => { setEditingChoir(null); setShowModal(true); };
  // Handler: Open modal in "edit" mode with the selected event's data.
  const handleEdit = (event) => { setEditingChoir(event); setShowModal(true); };
  // Handler: Close the modal and reset editing state.
  const handleClose = () => { setShowModal(false); setEditingChoir(null); };

  // Handler: Delete a choir event by its MongoDB _id.
  const handleDelete = async (id) => {
    // Native browser confirmation prompt before destructive action.
    if (!window.confirm('Are you sure you want to delete this choir event?')) return;
    try {
      const res = await fetch(`${backendURL}/api/v1/choir/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error();
      // Optimistic UI update: remove the event from local state without re-fetching.
      setChoirEvents((prev) => prev.filter((e) => e._id !== id));
      alert('Event deleted successfully');
    } catch {
      alert('Failed to delete event');
    }
  };

  // Callback: Called by ChoirModal after a new event is successfully created.
  const handleAdded = (newEvent) => {
    // Prepend the new event to the array (shows newest first).
    setChoirEvents((prev) => [newEvent, ...prev]);
    handleClose();
  };

  // Callback: Called by ChoirModal after an existing event is successfully updated.
  const handleUpdated = (updatedEvent) => {
    // Replace the old event data in the array with the updated version.
    setChoirEvents((prev) =>
      prev.map((e) => (e._id === updatedEvent._id ? updatedEvent : e))
    );
    handleClose();
  };

  // Helper: Format a choir event's date fields (year, month, day) into a readable string.
  // The month is 0-indexed in the data model (Jan = 0), matching JavaScript's Date constructor.
  const formatDate = (e) => {
    if (e.month == null || e.day == null) return '—';
    return new Date(
      e.year || new Date().getFullYear(),
      e.month,      // 0-indexed month
      e.day
    ).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto">

      {/* Page Header with "New Event" button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Choir Schedule</h2>
        <button
          onClick={handleAdd}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg shadow-md transition flex items-center gap-2 font-medium"
        >
          + New Event
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r">
          {error}
        </div>
      )}

      {/* Choir Events Data Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* Table Header */}
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
            {/* Table Body */}
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
                    {/* `capitalize` makes "practice" → "Practice" */}
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

      {/* Choir Modal — conditionally rendered when showModal is true */}
      {showModal && (
        <ChoirModal
          event={editingChoir}     // null for add, event object for edit
          onAdd={handleAdded}      // callback for new events
          onUpdate={handleUpdated} // callback for updated events
          onClose={handleClose}    // callback to close the modal
        />
      )}
    </div>
  );
};

export default ManageChoirSchedule;