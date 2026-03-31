// Import React hooks for state and side effects.
import React, { useState, useEffect } from 'react';
// Import the SermonModal component for add/edit dialogs.
import SermonModal from '../components/SermonModal.jsx';
// Import the getToken utility to retrieve the JWT from localStorage.
import { getToken } from "../utils/auth.js";

// Backend API base URL with local fallback.
const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// =========================================================================
// SkeletonRow — A placeholder "loading" row displayed while data is being fetched.
// Uses Tailwind's `animate-pulse` to create a subtle flashing effect.
// =========================================================================
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-full" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-5/6" /></td>
    <td className="px-6 py-4 text-center"><div className="h-8 bg-gray-200 rounded w-24 mx-auto" /></td>
  </tr>
);

// =========================================================================
// ManageSermons — Admin panel for viewing, adding, editing, and deleting sermons.
// Fetches sermon data from the backend API and renders it in a table.
// =========================================================================
const ManageSermons = () => {
  // State for the list of sermons fetched from the API.
  const [sermons, setSermons]                     = useState([]);
  // Loading state for showing skeleton placeholders.
  const [loading, setLoading]                     = useState(true);
  // Error state for displaying error messages.
  const [error, setError]                         = useState(null);
  // Tracks the sermon currently being edited (null = adding a new one).
  const [editingSermon, setEditingSermon]         = useState(null);
  // Tracks the sermon currently being viewed in detail.
  const [selectedSermon, setSelectedSermon]       = useState(null);
  // Controls visibility of the add/edit modal.
  const [showSermonModal, setShowSermonModal]     = useState(false);
  // Controls visibility of the view/preview modal.
  const [showViewModal, setShowViewModal]         = useState(false);

  // Retrieve the JWT token for authenticated API requests.
  const token = getToken();

  // Fetch all sermons from the backend API.
  const fetchSermons = async () => {
    try {
      setLoading(true);
      // Send a GET request with the Authorization header.
      const res = await fetch(`${backendURL}/api/v1/sermons`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch sermons');
      const data = await res.json();
      // Extract the sermons array from the API response structure.
      setSermons(data.data?.sermons || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch sermons');
    } finally {
      setLoading(false);
    }
  };

  // Fetch sermons on component mount (empty dependency array = run once).
  useEffect(() => { fetchSermons(); }, []);

  // Handler: Open the modal in "add" mode (no sermon pre-loaded).
  const handleAdd  = () => { setEditingSermon(null); setShowSermonModal(true); };
  // Handler: Open the modal in "edit" mode with the selected sermon data.
  const handleEdit = (sermon) => { setEditingSermon(sermon); setShowSermonModal(true); };
  // Handler: Open the view modal for previewing a sermon.
  const handleView = (sermon) => { setSelectedSermon(sermon); setShowViewModal(true); };

  // Handler: Delete a sermon by its MongoDB _id.
  const handleDelete = async (id) => {
    // Show a native browser confirmation dialog before proceeding.
    if (!window.confirm('Are you sure you want to delete this sermon?')) return;
    try {
      // Send a DELETE request to the backend.
      const res = await fetch(`${backendURL}/api/v1/sermons/delete/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error();
      // Optimistic UI update: Remove the sermon from local state immediately
      // instead of re-fetching the entire list (faster user experience).
      setSermons((prev) => prev.filter((s) => s._id !== id));
      alert('Sermon deleted successfully');
    } catch {
      alert('Failed to delete sermon');
    }
  };

  // Callback passed to SermonModal — updates local state after add/edit success.
  const handleSuccess = (resultSermon) => {
    if (editingSermon) {
      // EDIT: Replace the old sermon in the array with the updated one.
      setSermons((prev) => prev.map((s) => (s._id === resultSermon._id ? resultSermon : s)));
    } else {
      // ADD: Prepend the new sermon to the beginning of the array (most recent first).
      setSermons((prev) => [resultSermon, ...prev]);
    }
    setShowSermonModal(false);
    setEditingSermon(null);
  };

  return (
    <div className="max-w-7xl mx-auto">

      {/* Page Header with "New Sermon" button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Manage Sermons</h2>
        <button
          onClick={handleAdd}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg shadow-md transition flex items-center gap-2 font-medium"
        >
          + New Sermon
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r">
          {error}
        </div>
      )}

      {/* Sermons Data Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* Table Header */}
            <thead className="bg-gray-50">
              <tr>
                {['Title', 'Description', 'Audio', 'Actions'].map((h) => (
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
            {/* Table Body — conditionally renders skeleton, empty state, or data rows */}
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                /* Show 3 skeleton placeholder rows during loading */
                <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
              ) : sermons.length === 0 ? (
                /* Empty state message when no sermons exist */
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                    No sermons found. Add your first sermon!
                  </td>
                </tr>
              ) : (
                /* Map through the sermons array and render one row per sermon */
                sermons.map((sermon) => (
                  <tr key={sermon._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {sermon.title}
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-md truncate">
                      {sermon.description}
                    </td>
                    <td className="px-6 py-4">
                      {sermon.sermon_url ? (
                        /* Link to the Cloudinary-hosted audio file */
                        <a
                          href={sermon.sermon_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                        >
                          Listen →
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">No audio</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleEdit(sermon)}
                        className="text-amber-600 hover:text-amber-900 mr-3 transition-colors"
                      >
                        Edit
                      </button>
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(sermon._id)}
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

      {/* View Modal — opens when viewing a sermon's details */}
      {showViewModal && (
        <SermonModal
          sermon={selectedSermon}
          onClose={() => { setShowViewModal(false); setSelectedSermon(null); }}
        />
      )}

      {/* Add / Edit Modal — opens for creating or editing a sermon */}
      {showSermonModal && (
        <SermonModal
          sermon={editingSermon}
          onClose={() => { setShowSermonModal(false); setEditingSermon(null); }}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default ManageSermons;