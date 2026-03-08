import React, { useState, useEffect } from 'react';
import SermonModal from '../components/SermonModal';
import ChoirModal from '../components/ChoirModal';

const AdminPage = () => {
  const [activeSection, setActiveSection] = useState('sermons');

  // Sermon states
  const [sermons, setSermons] = useState([]);
  const [loadingSermons, setLoadingSermons] = useState(true);
  const [errorSermons, setErrorSermons] = useState(null);
  const [selectedSermon, setSelectedSermon] = useState(null);
  const [showViewSermonModal, setShowViewSermonModal] = useState(false);
  const [showSermonModal, setShowSermonModal] = useState(false);
  const [editingSermon, setEditingSermon] = useState(null);

  // Choir states
  const [choirEvents, setChoirEvents] = useState([]);
  const [loadingChoir, setLoadingChoir] = useState(true);
  const [errorChoir, setErrorChoir] = useState(null);
  const [editingChoir, setEditingChoir] = useState(null);
  const [showChoirModal, setShowChoirModal] = useState(false);

  const token = localStorage.getItem('admin_token');
  const backendURL=import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  // Fetch functions
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
      console.error(err);
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
      console.error(err);
    } finally {
      setLoadingChoir(false);
    }
  };

  useEffect(() => {
    fetchSermons();
    fetchChoirEvents();
  }, []);

  // Sermon handlers
  const handleViewSermon = (sermon) => {
    setSelectedSermon(sermon);
    setShowViewSermonModal(true);
  };

  const handleAddSermon = () => {
    setEditingSermon(null);
    setShowSermonModal(true);
  };

  const handleEditSermon = (sermon) => {
    setEditingSermon(sermon);
    setShowSermonModal(true);
  };

  const handleDeleteSermon = async (id) => {
    if (window.confirm('Are you sure you want to delete this sermon?')) {
      try {
        const res = await fetch(`${backendURL}/api/v1/sermons/delete/${id}`, {
          method: 'DELETE',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Failed to delete sermon');
        setSermons(sermons.filter((s) => s._id !== id));
        alert('Sermon deleted successfully');
      } catch (err) {
        alert('Failed to delete sermon');
      }
    }
  };

  const handleSermonSuccess = (resultSermon) => {
    if (editingSermon) {
      setSermons((prev) =>
        prev.map((s) => (s._id === resultSermon._id ? resultSermon : s))
      );
    } else {
      setSermons((prev) => [resultSermon, ...prev]);
    }
    setShowSermonModal(false);
    setEditingSermon(null);
  };

  // Choir handlers
  const handleAddChoir = () => {
    setEditingChoir(null);
    setShowChoirModal(true);
  };

  const handleEditChoir = (event) => {
    setEditingChoir(event);
    setShowChoirModal(true);
  };

  const handleDeleteChoir = async (id) => {
    if (window.confirm('Are you sure you want to delete this choir event?')) {
      try {
        const res = await fetch(`${backendURL}/api/v1/choir/${id}`, {
          method: 'DELETE',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Failed to delete event');
        setChoirEvents(choirEvents.filter((e) => e._id !== id));
        alert('Event deleted successfully');
      } catch (err) {
        alert('Failed to delete event');
      }
    }
  };

  const handleChoirAdded = (newEvent) => {
    setChoirEvents([newEvent, ...choirEvents]);
    setShowChoirModal(false);
  };

  const handleChoirUpdated = (updatedEvent) => {
    setChoirEvents(choirEvents.map((e) => (e._id === updatedEvent._id ? updatedEvent : e)));
    setShowChoirModal(false);
    setEditingChoir(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.reload();
  };

  // Loading skeleton row (used for both tables)
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-full"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-5/6"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
      <td className="px-6 py-4 text-center"><div className="h-8 bg-gray-200 rounded w-24 mx-auto"></div></td>
    </tr>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-72 bg-gradient-to-b from-brand-red to-red-800 text-white shadow-xl">
        <div className="p-6 border-b border-red-700">
          <h2 className="text-2xl font-bold tracking-tight">Resurrection Admin</h2>
          <p className="text-sm text-red-200 mt-1">Church Dashboard</p>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => setActiveSection('sermons')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
              activeSection === 'sermons' ? 'bg-white/20 text-white font-semibold' : 'hover:bg-white/10 text-red-100'
            }`}
          >
            📖 Sermons
          </button>
          <button
            onClick={() => setActiveSection('choir')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
              activeSection === 'choir' ? 'bg-white/20 text-white font-semibold' : 'hover:bg-white/10 text-red-100'
            }`}
          >
            🎤 Choir Schedule
          </button>
        </nav>
        <div className="p-6 border-t border-red-700 text-sm text-red-200">
          Logged in •{' '}
          <button className="underline hover:text-white" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
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
          </select>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
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
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Audio
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loadingSermons ? (
                        <>
                          <SkeletonRow />
                          <SkeletonRow />
                          <SkeletonRow />
                        </>
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
                                onClick={() => handleEditSermon(sermon)}
                                className="text-amber-600 hover:text-amber-900 mr-3"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteSermon(sermon._id)}
                                className="text-red-600 hover:text-red-900"
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
            </div>
          )}

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
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loadingChoir ? (
                        <>
                          <SkeletonRow />
                          <SkeletonRow />
                          <SkeletonRow />
                        </>
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
                                ? new Date(e.year || new Date().getFullYear(), e.month, e.day).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : '—'}
                            </td>
                            <td className="px-6 py-4 capitalize text-gray-700">{e.type || '—'}</td>
                            <td className="px-6 py-4 text-gray-900">{e.title || '—'}</td>
                            <td className="px-6 py-4 text-gray-700">{e.time || '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                              <button
                                onClick={() => handleEditChoir(e)}
                                className="text-amber-600 hover:text-amber-900 mr-4"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteChoir(e._id)}
                                className="text-red-600 hover:text-red-900"
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
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showViewSermonModal && (
        <SermonModal
          sermon={selectedSermon}
          onClose={() => {
            setShowViewSermonModal(false);
            setSelectedSermon(null);
          }}
        />
      )}

      {showSermonModal && (
        <SermonModal
          sermon={editingSermon}
          onClose={() => {
            setShowSermonModal(false);
            setEditingSermon(null);
          }}
          onSuccess={handleSermonSuccess}
        />
      )}

      {showChoirModal && (
        <ChoirModal
          event={editingChoir}
          onAdd={handleChoirAdded}
          onUpdate={handleChoirUpdated}
          onClose={() => {
            setShowChoirModal(false);
            setEditingChoir(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminPage;   