import React, { useState } from 'react';

const EditSermonModal = ({ sermon, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        title: sermon?.title || '',
        description: sermon?.description || '',
    });
    const [audioFile, setAudioFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setAudioFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title.trim() || !formData.description.trim()) {
            setError('Title and description are required');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const form = new FormData();
            form.append('title', formData.title);
            form.append('description', formData.description);
            
            if (audioFile) {
                form.append('audio', audioFile);
            }

            const token = localStorage.getItem('admin_token');
            const response = await fetch(
                `http://localhost:8000/api/v1/sermons/edit/${sermon._id}`,
                {
                    method: 'PUT',
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    body: form
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update sermon');
            }

            // Update the sermon with new data
            const updatedSermon = {
                ...sermon,
                title: formData.title,
                description: formData.description,
            };

            onUpdate(updatedSermon);
        } catch (err) {
            setError(err.message || 'Failed to update sermon');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!sermon) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gray-100 border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Edit Sermon</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-600 hover:text-gray-800 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-black mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            placeholder="Sermon title"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-black mb-2">
                            Description *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            placeholder="Sermon description"
                            required
                        ></textarea>
                    </div>

                    {/* Audio File */}
                    <div>
                        <label className="block text-sm font-semibold text-black mb-2">
                            Sermon Audio (Optional)
                        </label>
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={handleFileChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        />
                        {audioFile ? (
                            <p className="text-sm text-green-600 mt-2">
                                New file selected: {audioFile.name}
                            </p>
                        ) : (
                            <p className="text-sm text-gray-500 mt-2">
                                Leave empty to keep current audio file
                            </p>
                        )}
                    </div>

                    {/* Current Audio */}
                    <div>
                        <label className="block text-sm font-semibold text-black mb-2">
                            Current Sermon Audio
                        </label>
                        <audio controls className="w-full">
                            <source src={sermon.sermon_url} type="audio/mpeg" />
                            Your browser does not support the audio element.
                        </audio>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-4 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded transition"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition disabled:bg-blue-300"
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Update Sermon'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditSermonModal;
