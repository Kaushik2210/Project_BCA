import React, { useState, useEffect } from 'react';
import SermonModal from '../components/SermonModal';
import EditSermonModal from '../components/EditSermonModal';
import AddSermonModal from '../components/AddSermonModal';

const AdminPage = () => {
    const [sermons, setSermons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSermon, setSelectedSermon] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingSermon, setEditingSermon] = useState(null);

    // Fetch sermons
    const fetchSermons = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('admin_token');
            const response = await fetch('http://localhost:8000/api/v1/sermons/', {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (!response.ok) throw new Error('Failed to fetch sermons');
            const data = await response.json();
            setSermons(data.data?.sermons || []);
            setError(null);
        } catch (err) {
            setError('Failed to fetch sermons');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSermons();
    }, []);

    // View sermon
    const handleView = (sermon) => {
        setSelectedSermon(sermon);
        setShowViewModal(true);
    };

    // Edit sermon
    const handleEdit = (sermon) => {
        setEditingSermon(sermon);
        setShowEditModal(true);
    };

    // Delete sermon
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this sermon?')) {
            try {
                const token = localStorage.getItem('admin_token');
                const response = await fetch(`http://localhost:8000/api/v1/sermons/delete/${id}`, {
                    method: 'DELETE',
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                if (!response.ok) throw new Error('Failed to delete sermon');
                setSermons(sermons.filter(sermon => sermon._id !== id));
            } catch (err) {
                alert('Failed to delete sermon');
                console.error(err);
            }
        }
    };

    // Handle update after edit
    const handleSermonUpdated = (updatedSermon) => {
        setSermons(sermons.map(s => s._id === updatedSermon._id ? updatedSermon : s));
        setShowEditModal(false);
        setEditingSermon(null);
    };

    // Handle new sermon added
    const handleSermonAdded = (newSermon) => {
        setSermons([newSermon, ...sermons]);
        setShowAddModal(false);
    };

    return (
        <div className="w-full min-h-screen bg-brand-beige">
            
            <div className="container mx-auto px-4 py-12">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-white-800 mb-2">Admin Dashboard</h1>
                        <p className="text-gray-600">Manage all sermons</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded transition font-semibold"
                    >
                        + Add Sermon
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-lg shadow">
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Audio URL</th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sermons.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                            No sermons found
                                        </td>
                                    </tr>
                                ) : (
                                    sermons.map((sermon) => (
                                        <tr key={sermon._id} className="border-b hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 text-sm text-gray-900">{sermon.title}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                                {sermon.description}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <a 
                                                    href={sermon.sermon_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 truncate block max-w-xs"
                                                >
                                                    View Audio
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm">
                                                <button
                                                    onClick={() => handleView(sermon)}
                                                    className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2 transition"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(sermon)}
                                                    className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded mr-2 transition"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(sermon._id)}
                                                    className="inline-block bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
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
                )}
            </div>

            {/* View Sermon Modal */}
            {showViewModal && (
                <SermonModal
                    sermon={selectedSermon}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedSermon(null);
                    }}
                />
            )}

            {/* Edit Sermon Modal */}
            {showEditModal && (
                <EditSermonModal
                    sermon={editingSermon}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingSermon(null);
                    }}
                    onUpdate={handleSermonUpdated}
                />
            )}

            {/* Add Sermon Modal */}
            {showAddModal && (
                <AddSermonModal
                    onClose={() => setShowAddModal(false)}
                    onAdd={handleSermonAdded}
                />
            )}

          
        </div>
    );
};

export default AdminPage;
