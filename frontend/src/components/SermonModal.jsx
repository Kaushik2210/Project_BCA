// Import React and hooks for state management and side effects.
import React, { useState, useEffect } from 'react';
// Retrieve the backend URL from Vite's environment variables, with local fallback.
const backendURL=import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// =========================================================================
// SermonModal — A reusable modal dialog for both adding AND editing sermons.
// Props:
//   sermon: If provided, the modal is in "edit" mode. If null, it's in "add" mode.
//   onClose: Callback to close/hide the modal.
//   onSuccess: Callback to pass the saved sermon data back to the parent component.
// =========================================================================
const SermonModal = ({sermon = null,onClose,onSuccess}) => {
  // Determine if we're in "edit" mode based on whether a sermon object was passed.
  // The double-bang (!!) converts the value to a boolean (null → false, object → true).
  const isEdit = !!sermon;

  // Form data state — tracks the text fields (title, description).
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  // State for the selected audio file (new upload).
  const [audioFile, setAudioFile] = useState(null);
  // Loading state — disables the submit button during API calls.
  const [loading, setLoading] = useState(false);
  // Error state — displays validation or server error messages.
  const [error, setError] = useState(null);

  // useEffect: Populate form fields when in edit mode, or reset for add mode.
  // Runs whenever the `sermon` or `isEdit` props change.
  useEffect(() => {
    if (isEdit && sermon) {
      // Pre-fill the form with the existing sermon data for editing.
      setFormData({
        title: sermon.title || '',
        description: sermon.description || '',
      });
      setAudioFile(null); // Reset file input — new file is optional when editing.
    } else {
      // Reset all fields for adding a new sermon.
      setFormData({ title: '', description: '' });
      setAudioFile(null);
    }
  }, [sermon, isEdit]);

  // Generic handler for text input changes (uses the input's `name` attribute as the key).
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Spread the existing formData and update only the changed field.
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handler for file input changes — stores the selected file object or null.
  const handleFileChange = (e) => {
    setAudioFile(e.target.files[0] || null);
  };

  // Form submission handler — validates inputs and sends data to the backend.
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: Trim whitespace from text fields.
    const title = formData.title.trim();
    const description = formData.description.trim();

    // Check required fields.
    if (!title || !description) {
      setError('Title and description are required');
      return;
    }
    // Validate title length (3-50 characters).
    if (title.length < 3 || title.length > 50) {
      setError('Title must be between 3 and 50 characters');
      return;
    }
    // Validate description length (10-500 characters).
    if (description.length < 10 || description.length > 500) {
      setError('Description must be between 10 and 500 characters');
      return;
    }
    // When adding a new sermon, an audio file is required.
    if (!isEdit && !audioFile) {
      setError('Audio file is required when adding a new sermon');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create a FormData object for multipart/form-data encoding.
      // This is required because we're uploading a binary audio file alongside text data.
      // Unlike JSON, FormData can carry files in the same request.
      const form = new FormData();
      form.append('title', formData.title.trim());
      form.append('description', formData.description.trim());
      // Only append the audio file if one was selected.
      if (audioFile) {
        form.append('audio', audioFile);
      }

      // Retrieve the admin JWT token from localStorage for authentication.
      const token = localStorage.getItem('admin_token');
      let response;

      if (isEdit) {
        // EDIT MODE: Send a PUT request to update the existing sermon by its _id.
        response = await fetch(
          `${backendURL}/api/v1/sermons/edit/${sermon._id}`,
          {
            method: 'PUT',
            // Include the Authorization header with the JWT Bearer token.
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            // Note: Do NOT set 'Content-Type' when sending FormData — the browser sets it
            // automatically with the correct multipart boundary string.
            body: form,
          }
        );
      } else {
        // ADD MODE: Send a POST request to create a new sermon.
        response = await fetch(`${backendURL}/api/v1/sermons/post`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: form,
        });
      }

      // Check if the server returned an error.
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEdit ? 'update' : 'add'} sermon`);
      }

      // Parse the successful response.
      const data = await response.json();

      // Construct the sermon object to pass back to the parent component.
      const resultSermon = isEdit
        ? {
            // In edit mode, merge existing data with updated fields.
            ...sermon,
            title: formData.title,
            description: formData.description,
            // Only update the URL if the server returned a new one (i.e., new file was uploaded).
            ...(data.data?.sermon_url && { sermon_url: data.data.sermon_url }),
            ...(data.data?.sermon_public_id && { sermon_public_id: data.data.sermon_public_id }),
          }
        : {
            // In add mode, create a fresh sermon object with the response data.
            _id: data.data?._id || Date.now().toString(),
            title: formData.title,
            description: formData.description,
            sermon_url: data.data?.sermon_url || '',
            sermon_public_id: data.data?.sermon_public_id || '',
            createdAt: new Date().toISOString(), // Optimistic fallback timestamp.
          };

      // Notify parent component of success and close the modal.
      onSuccess(resultSermon);
      onClose();
    } catch (err) {
      // Display the error message and log it for debugging.
      setError(err.message || `Failed to ${isEdit ? 'update' : 'add'} sermon`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic labels based on whether we're in edit or add mode.
  const modalTitle = isEdit ? 'Edit Sermon' : 'Add New Sermon';
  const buttonText = loading
    ? isEdit ? 'Updating...' : 'Adding...'
    : isEdit ? 'Update Sermon' : 'Add Sermon';
  // Dynamic button color: blue for edit, green for add.
  const buttonColorClass = isEdit ? 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300' : 'bg-green-500 hover:bg-green-600 disabled:bg-green-300';

  return (
    /* Full-screen overlay backdrop */
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Modal content container */}
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Sticky Header — stays visible when scrolling within the modal */}
        <div className="sticky top-0 bg-gray-100 border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{modalTitle}</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Title Input with Character Counter */}
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
            {/* Inline validation message */}
            {formData.title.length > 0 && formData.title.trim().length < 3 && (
              <p className="text-xs text-red-500 mt-1">Title must be at least 3 characters</p>
            )}
          </div>

          {/* Description Textarea with Character Counter */}
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

          {/* Audio File Upload Input */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              {/* Label changes based on mode: required for add, optional for edit */}
              Sermon Audio {isEdit ? '(Optional)' : '*'}
            </label>
            <input
              type="file"
              accept="audio/*" // Only allow audio file types in the file picker.
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              required={!isEdit} // Required only for new sermons.
            />
            {/* Show the name of the selected file */}
            {audioFile && (
              <p className="text-sm text-green-600 mt-2">
                {isEdit ? 'New file selected: ' : 'File selected: '}
                {audioFile.name}
              </p>
            )}
            {/* In edit mode, inform the user they can keep the existing file */}
            {isEdit && !audioFile && (
              <p className="text-sm text-gray-500 mt-2">
                Leave empty to keep current audio file
              </p>
            )}
          </div>

          {/* Current Audio Preview (only shown in edit mode when the sermon has audio) */}
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

          {/* Action Buttons */}
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