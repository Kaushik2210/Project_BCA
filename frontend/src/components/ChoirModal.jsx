import React, { useState } from 'react';

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date || !time) {
      alert('Please select both date and time');
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
        res = await fetch(`http://localhost:8000/api/v1/choir/${event._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Add
        res = await fetch('http://localhost:8000/api/v1/choir', {
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
      alert('Error saving event: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-brand-beige rounded-xl p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-brand-red">
          {event ? 'Edit Choir Event' : 'Add Choir Event'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 font-semibold text-white">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-red"
              required
              placeholder="Event title"
            />
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
            <label className="block mb-1 font-semibold text-white">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-red"
              required
            />
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