// Import React and useState for form state management.
import React, { useState } from 'react';
// Retrieve the backend URL from Vite's environment variables, with local fallback.
const backendURL=import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// =========================================================================
// ChoirModal — A reusable modal dialog for both adding AND editing choir events.
// Props:
//   event: If provided, the modal is in "edit" mode. If null, it's in "add" mode.
//   onAdd: Callback to notify parent when a new event is added.
//   onUpdate: Callback to notify parent when an existing event is updated.
//   onClose: Callback to close/hide the modal.
// =========================================================================
const ChoirModal = ({ event, onAdd, onUpdate, onClose }) => {
  // Retrieve JWT token from localStorage for authenticated API requests.
  const token = localStorage.getItem('admin_token');

  // Calculate the initial date string for the date input field.
  // For editing: reconstruct a yyyy-mm-dd string from the event's year, month, and day.
  // For adding: default to today's date using ISO string format.
  const initialDate = event
    ? `${event.year}-${String(event.month + 1).padStart(2, '0')}-${String(event.day).padStart(2, '0')}`
    : new Date().toISOString().split('T')[0];

  // Form state variables — pre-filled from the event prop in edit mode.
  const [title, setTitle] = useState(event?.title || '');
  const [type, setType] = useState(event?.type || 'practice');  // 'practice' or 'event'
  const [date, setDate] = useState(initialDate);   // yyyy-mm-dd string format
  const [time, setTime] = useState(event?.time || '');
  const [error, setError] = useState(null);

  // Form submission handler — validates inputs and sends data to the backend.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Trim the title for validation.
    const trimmedTitle = title.trim();

    // Validation: All fields are required.
    if (!trimmedTitle || !date || !time || !type) {
      setError('All fields are required');
      return;
    }

    // Validation: Title must be 3-50 characters.
    if (trimmedTitle.length < 3 || trimmedTitle.length > 50) {
      setError('Title must be between 3 and 50 characters');
      return;
    }

    // Time validation: Prevent scheduling events between midnight and 5:59 AM.
    // Split the time string (e.g., "06:30") on ':' and extract the hours.
    const [hours] = time.split(':').map(Number);
    if (hours < 6) {
      setError('Events cannot be scheduled between midnight and 6:00 AM');
      return;
    }

    // Parse the date string (yyyy-mm-dd) into separate year, month, and day values.
    const [yearStr, monthStr, dayStr] = date.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr) - 1; // JavaScript months are 0-indexed (Jan = 0)
    const day = Number(dayStr);

    // Construct the payload object to send to the backend.
    const payload = {
      title: title.trim(),
      type,
      year,
      month,
      day,
      time,
    };

    try {
      let res;
      if (event) {
        // EDIT MODE: Send a PUT request to update the existing event by its _id.
        res = await fetch(`${backendURL}/api/v1/choir/${event._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            // Conditionally include the Authorization header with the JWT token.
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(payload), // Convert payload to JSON string.
        });
      } else {
        // ADD MODE: Send a POST request to create a new choir event.
        res = await fetch(`${backendURL}/api/v1/choir`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(payload),
        });
      }

      // Check if the HTTP response indicates an error.
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to save event');
      }

      // Parse the successful response.
      const responseData = await res.json();

      // Double-check the custom `success` flag from our API.
      if (!responseData.success) {
        throw new Error(responseData.message || 'Operation failed');
      }

      // Extract the saved event object from the response.
      const savedEvent = responseData.data;

      // Call the appropriate parent callback depending on the mode.
      if (event) {
        onUpdate(savedEvent); // Notify parent to update the event in its list.
      } else {
        onAdd(savedEvent);    // Notify parent to add the new event to its list.
      }

      // Close the modal.
      onClose()
    }catch (err) {
      console.error(err);
      setError('Error saving event: ' + err.message);
    }
  };

  return (
    /* Full-screen overlay backdrop — semi-transparent white */
    <div className="fixed inset-0 flex items-center justify-center bg-white/50 z-50 p-4">
      {/* Modal content container */}
      <div className="bg-brand-beige rounded-xl p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Dynamic title based on add/edit mode */}
        <h2 className="text-2xl font-bold mb-6 text-brand-red">
          {event ? 'Edit Choir Event' : 'Add Choir Event'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Title Input with Character Counter */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="block font-semibold text-white">Title *</label>
              <span className={`text-xs ${title.length > 50 ? 'text-red-500' : 'text-gray-300'}`}>
                {title.length}/50
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength="50"
              className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 text-white ${
                title.length > 0 && title.trim().length < 3
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-brand-red'
              }`}
              required
              placeholder="Event title (3-50 characters)"
            />
            {/* Inline validation warning */}
            {title.length > 0 && title.trim().length < 3 && (
              <p className="text-xs text-red-500 mt-1">Title must be at least 3 characters</p>
            )}
          </div>

          {/* Event Type Dropdown */}
          <div>
            <label className="block mb-1 font-semibold text-white">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-red"
            >
              <option className="text-black" value="practice">Practice</option>
              <option className="text-black" value="event">Event</option>
            </select>
          </div>

          {/* Date Picker — restricted to today through next year */}
          <div>
            <label className="block mb-1 font-semibold text-white">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-red"
              required
              min={new Date().toISOString().split('T')[0]} // Cannot select past dates.
              max={new Date().getFullYear() + 1 + '-12-31'} // Max one year in the future.
            />
          </div>

          {/* Time Picker with Early Morning Validation */}
          <div>
            <label className="block mb-1 font-semibold text-white">Time *</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 ${
                time && Number(time.split(':')[0]) < 6 
                  ? 'border-red-500 focus:ring-red-500 text-red-500' 
                  : 'border-gray-300 focus:ring-brand-red'
              }`}
              required
              min="06:00" // HTML5 hint for the time picker.
            />
            {/* Warning message for times before 6 AM */}
            {time && Number(time.split(':')[0]) < 6 && (
              <p className="text-xs text-red-500 mt-1">Please select a time after 6:00 AM</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-brand-red hover:bg-red-700 text-white rounded-lg transition font-medium"
            >
              {event ? 'Update Event' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChoirModal;