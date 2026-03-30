import React, { useState } from 'react';

const ScheduleModal = ({ schedule, onClose, onSave }) => {
    const [date, setDate] = useState(schedule?.date || '');
    const [events, setEvents] = useState(schedule?.events || [{ time: '', title: '' }]);
    const [error, setError] = useState(null);

    const addEvent = () => {
        setEvents([...events, { time: '', title: '' }]);
    };

    const removeEvent = (index) => {
        if (events.length > 1) {
            setEvents(events.filter((_, i) => i !== index));
        }
    };

    const updateEvent = (index, field, value) => {
        const updated = [...events];
        updated[index][field] = value;
        setEvents(updated);
    };

    const handleSubmit = () => {
        setError(null);
        const trimmedDate = date.trim();
        if (!trimmedDate) {
            setError('Date is required');
            return;
        }
        if (trimmedDate.length < 3 || trimmedDate.length > 30) {
            setError('Date must be between 3 and 30 characters');
            return;
        }

        for (let i = 0; i < events.length; i++) {
            const ev = events[i];
            const trimmedTitle = ev.title.trim();
            const timeTrimmed = ev.time?.trim();
            
            if (!timeTrimmed || !trimmedTitle) {
                setError(`Event #${i + 1} requires both time and title`);
                return;
            }
            if (trimmedTitle.length < 3 || trimmedTitle.length > 50) {
                setError(`Event #${i + 1} title must be between 3 and 50 characters`);
                return;
            }
            
            // Validate time strictly preventing 00:00 to 05:59
            const [hours] = timeTrimmed.split(':').map(Number);
            if (hours < 6) {
                setError(`Event #${i + 1} cannot be scheduled between midnight and 6:00 AM`);
                return;
            }
        }

        onSave({ date: trimmedDate, events: events.map(e => ({ ...e, title: e.title.trim(), time: e.time.trim() })) });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    {schedule ? 'Edit Schedule' : 'Add Schedule'}
                </h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="mb-6">
                    <div className="flex justify-between mb-1">
                        <label className="block text-sm font-semibold text-gray-700">Date *</label>
                        <span className={`text-xs ${date.length > 30 ? 'text-red-500' : 'text-gray-500'}`}>
                            {date.length}/30
                        </span>
                    </div>
                    <input
                        className={`w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 ${
                            date.length > 0 && date.trim().length < 3
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder="Date (e.g. JANUARY 17)"
                        value={date}
                        maxLength="30"
                        onChange={e => setDate(e.target.value)}
                    />
                </div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">Events *</label>
                {events.map((event, i) => (
                    <div key={i} className="flex flex-col md:flex-row gap-3 mb-4 border border-gray-200 p-4 rounded-lg bg-gray-50 relative">
                        {events.length > 1 && (
                            <button
                                onClick={() => removeEvent(i)}
                                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-lg hover:bg-red-600 shadow"
                                title="Remove event"
                                type="button"
                            >
                                ×
                            </button>
                        )}
                        <div className="w-full md:w-1/3">
                            <input
                                type="time"
                                className={`w-full border rounded p-2 focus:outline-none focus:ring-2 ${
                                    event.time && Number(event.time.split(':')[0]) < 6
                                        ? 'border-red-500 focus:ring-red-500 text-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                                min="06:00"
                                value={event.time}
                                onChange={e => updateEvent(i, 'time', e.target.value)}
                            />
                            {event.time && Number(event.time.split(':')[0]) < 6 && (
                                <p className="text-xs text-red-500 mt-1">Please select a time after 6:00 AM</p>
                            )}
                        </div>
                        <div className="w-full flex-1">
                            <input
                                className={`w-full border rounded p-2 focus:outline-none focus:ring-2 ${
                                    event.title.length > 0 && event.title.trim().length < 3
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                                placeholder="Event Title"
                                value={event.title}
                                maxLength="50"
                                onChange={e => updateEvent(i, 'title', e.target.value)}
                            />
                            <div className="flex justify-end mt-1">
                                <span className={`text-xs ${event.title.length > 50 ? 'text-red-500' : 'text-gray-500'}`}>
                                    {event.title.length}/50
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                <button onClick={addEvent} className="text-blue-600 font-medium hover:text-blue-800 transition mb-6">
                    + Add Another Event
                </button>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button onClick={onClose} className="px-5 py-2 text-gray-700 hover:bg-gray-100 rounded transition">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
                    >
                        Save Schedule
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleModal;
