import React, { useState } from 'react';
const backendURL=import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
const ChoirModal = ({ event, onAdd, onUpdate, onClose }) => {
  const token = localStorage.getItem('admin_token');

  // For new event → default to today
  // For existing event → reconstruct full date from year/month/day
  const initialDate = event
    ? `${event.year}-${String(event.month + 1).padStart(2, '0')}-${String(event.day).padStart(2, '0')}`
    : new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState(event?.title || '');
  const [type, setType] = useState(event?.type || 'practice');
  const [date, setDate] = useState(initialDate);   // yyyy-mm-dd string
  const [time, setTime] = useState(event?.time || '');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();

    if (!trimmedTitle || !date || !time || !type) {
      setError('All fields are required');
      return;
    }

    if (trimmedTitle.length < 3 || trimmedTitle.length > 50) {
      setError('Title must be between 3 and 50 characters');
      return;
    }

    // Time validation (prevent 00:00 to 05:59)
    const [hours] = time.split(':').map(Number);
    if (hours < 6) {
      setError('Events cannot be scheduled between midnight and 6:00 AM');
      return;
    }

    // Parse the date string (yyyy-mm-dd)
    const [yearStr, monthStr, dayStr] = date.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr) - 1; // JS months are 0-based
    const day = Number(dayStr);

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
        // Edit
        res = await fetch(`${backendURL}/api/v1/choir/${event._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Add
        res = await fetch(`${backendURL}/api/v1/choir`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(payload),
        });
      }

      // In handleSubmit, after await res.json()
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to save event');
      }

      const responseData = await res.json();

      if (!responseData.success) {
        throw new Error(responseData.message || 'Operation failed');
      }

      const savedEvent = responseData.data; // <-- this is the actual choir event object

      if (event) {
        onUpdate(savedEvent);
      } else {
        onAdd(savedEvent);
      }

      onClose()
    }catch (err) {
      console.error(err);
      setError('Error saving event: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/50 z-50 p-4">
      <div className="bg-brand-beige rounded-xl p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-brand-red">
          {event ? 'Edit Choir Event' : 'Add Choir Event'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

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
            {title.length > 0 && title.trim().length < 3 && (
              <p className="text-xs text-red-500 mt-1">Title must be at least 3 characters</p>
            )}
          </div>

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

          <div>
            <label className="block mb-1 font-semibold text-white">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-red"
              required
              min={new Date().toISOString().split('T')[0]}
              max={new Date().getFullYear() + 1 + '-12-31'}
            />
          </div>

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
              min="06:00"
            />
            {time && Number(time.split(':')[0]) < 6 && (
              <p className="text-xs text-red-500 mt-1">Please select a time after 6:00 AM</p>
            )}
          </div>

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