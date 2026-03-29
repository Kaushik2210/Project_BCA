import React, { useState, useEffect } from 'react';
import SermonModal from '../components/SermonModal.jsx';
import { getToken } from "../utils/auth.js";

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-full" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-5/6" /></td>
    <td className="px-6 py-4 text-center"><div className="h-8 bg-gray-200 rounded w-24 mx-auto" /></td>
  </tr>
);

const ManageSermons = () => {
  const [sermons, setSermons]                     = useState([]);
  const [loading, setLoading]                     = useState(true);
  const [error, setError]                         = useState(null);
  const [editingSermon, setEditingSermon]         = useState(null);
  const [selectedSermon, setSelectedSermon]       = useState(null);
  const [showSermonModal, setShowSermonModal]     = useState(false);
  const [showViewModal, setShowViewModal]         = useState(false);

  const token = getToken();

  /* ── fetch ── */
  const fetchSermons = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${backendURL}/api/v1/sermons`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch sermons');
      const data = await res.json();
      setSermons(data.data?.sermons || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch sermons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSermons(); }, []);

  /* ── handlers ── */
  const handleAdd  = () => { setEditingSermon(null); setShowSermonModal(true); };
  const handleEdit = (sermon) => { setEditingSermon(sermon); setShowSermonModal(true); };
  const handleView = (sermon) => { setSelectedSermon(sermon); setShowViewModal(true); };

  const handleDelete = async (id) => {
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

  const handleSuccess = (resultSermon) => {
    if (editingSermon) {
      setSermons((prev) => prev.map((s) => (s._id === resultSermon._id ? resultSermon : s)));
    } else {
      setSermons((prev) => [resultSermon, ...prev]);
    }
    setShowSermonModal(false);
    setEditingSermon(null);
  };

  /* ── render ── */
  return (
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Manage Sermons</h2>
        <button
          onClick={handleAdd}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg shadow-md transition flex items-center gap-2 font-medium"
        >
          + New Sermon
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
            <tbody className="divide-y divide-gray-100">
              {loading ? (
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
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {sermon.title}
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-md truncate">
                      {sermon.description}
                    </td>
                    <td className="px-6 py-4">
                      {sermon.sermon_url ? (
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
                      <button
                        onClick={() => handleEdit(sermon)}
                        className="text-amber-600 hover:text-amber-900 mr-3 transition-colors"
                      >
                        Edit
                      </button>
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

      {/* View Modal */}
      {showViewModal && (
        <SermonModal
          sermon={selectedSermon}
          onClose={() => { setShowViewModal(false); setSelectedSermon(null); }}
        />
      )}

      {/* Add / Edit Modal */}
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