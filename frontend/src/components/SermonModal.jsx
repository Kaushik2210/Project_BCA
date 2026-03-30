import React, { useState, useEffect } from 'react';
const backendURL=import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const SermonModal = ({sermon = null,onClose,onSuccess}) => {
  const isEdit = !!sermon;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [audioFile, setAudioFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize form values when editing
  useEffect(() => {
    if (isEdit && sermon) {
      setFormData({
        title: sermon.title || '',
        description: sermon.description || '',
      });
      setAudioFile(null); // reset — new file is optional in edit mode
    } else {
      // Reset for add mode
      setFormData({ title: '', description: '' });
      setAudioFile(null);
    }
  }, [sermon, isEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setAudioFile(e.target.files[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const title = formData.title.trim();
    const description = formData.description.trim();

    if (!title || !description) {
      setError('Title and description are required');
      return;
    }
    if (title.length < 3 || title.length > 50) {
      setError('Title must be between 3 and 50 characters');
      return;
    }
    if (description.length < 10 || description.length > 500) {
      setError('Description must be between 10 and 500 characters');
      return;
    }
    if (!isEdit && !audioFile) {
      setError('Audio file is required when adding a new sermon');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const form = new FormData();
      form.append('title', formData.title.trim());
      form.append('description', formData.description.trim());
      if (audioFile) {
        form.append('audio', audioFile);
      }

      const token = localStorage.getItem('admin_token');
      let response;

      if (isEdit) {
        // Edit / Update
        response = await fetch(
          `${backendURL}/api/v1/sermons/edit/${sermon._id}`,
          {
            method: 'PUT',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: form,
          }
        );
      } else {
        // Add / Create
        response = await fetch(`${backendURL}/api/v1/sermons/post`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: form,
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEdit ? 'update' : 'add'} sermon`);
      }

      const data = await response.json();

      // Prepare the sermon object to pass back to parent
      const resultSermon = isEdit
        ? {
            ...sermon,
            title: formData.title,
            description: formData.description,
            // Update URL only if a new file was uploaded and returned
            ...(data.data?.sermon_url && { sermon_url: data.data.sermon_url }),
            ...(data.data?.sermon_public_id && { sermon_public_id: data.data.sermon_public_id }),
          }
        : {
            _id: data.data?._id || Date.now().toString(),
            title: formData.title,
            description: formData.description,
            sermon_url: data.data?.sermon_url || '',
            sermon_public_id: data.data?.sermon_public_id || '',
            createdAt: new Date().toISOString(), // optimistic fallback
          };

      onSuccess(resultSermon);
      onClose();
    } catch (err) {
      setError(err.message || `Failed to ${isEdit ? 'update' : 'add'} sermon`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const modalTitle = isEdit ? 'Edit Sermon' : 'Add New Sermon';
  const buttonText = loading
    ? isEdit ? 'Updating...' : 'Adding...'
    : isEdit ? 'Update Sermon' : 'Add Sermon';
  const buttonColorClass = isEdit ? 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300' : 'bg-green-500 hover:bg-green-600 disabled:bg-green-300';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-gray-100 border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{modalTitle}</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-sm font-semibold text-black">
                Title *
              </label>
              <span className={`text-xs ${formData.title.length > 50 ? 'text-red-500' : 'text-gray-500'}`}>
                {formData.title.length}/50
              </span>
            </div>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              maxLength="50"
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 text-black ${
                formData.title.length > 0 && formData.title.trim().length < 3
                  ? 'border-red-400 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Sermon title (3-50 characters)"
              required
            />
            {formData.title.length > 0 && formData.title.trim().length < 3 && (
              <p className="text-xs text-red-500 mt-1">Title must be at least 3 characters</p>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-sm font-semibold text-black">
                Description *
              </label>
              <span className={`text-xs ${formData.description.length > 500 ? 'text-red-500' : 'text-gray-500'}`}>
                {formData.description.length}/500
              </span>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              maxLength="500"
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 text-black ${
                formData.description.length > 0 && formData.description.trim().length < 10
                  ? 'border-red-400 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Sermon description (10-500 characters)"
              required
            />
            {formData.description.length > 0 && formData.description.trim().length < 10 && (
              <p className="text-xs text-red-500 mt-1">Description must be at least 10 characters</p>
            )}
          </div>

          {/* Audio File */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Sermon Audio {isEdit ? '(Optional)' : '*'}
            </label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              required={!isEdit}
            />
            {audioFile && (
              <p className="text-sm text-green-600 mt-2">
                {isEdit ? 'New file selected: ' : 'File selected: '}
                {audioFile.name}
              </p>
            )}
            {isEdit && !audioFile && (
              <p className="text-sm text-gray-500 mt-2">
                Leave empty to keep current audio file
              </p>
            )}
          </div>

          {/* Current Audio (only in edit mode) */}
          {isEdit && sermon?.sermon_url && (
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Current Sermon Audio
              </label>
              <audio controls className="w-full">
                <source src={sermon.sermon_url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

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
              className={`${buttonColorClass} text-white px-6 py-2 rounded transition`}
              disabled={loading}
            >
              {buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SermonModal;