import React, { useState } from 'react';

const ScheduleModal = ({ schedule, onClose, onSave }) => {
    const [date, setDate] = useState(schedule?.date || '');
    const [events, setEvents] = useState(schedule?.events || [{ time: '', title: '' }]);

    const addEvent = () => {
        setEvents([...events, { time: '', title: '' }]);
    };

    const updateEvent = (index, field, value) => {
        const updated = [...events];
        updated[index][field] = value;
        setEvents(updated);
    };

    const handleSubmit = () => {
        onSave({ date, events });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
            <div className="bg-white p-6 rounded w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">
                    {schedule ? 'Edit Schedule' : 'Add Schedule'}
                </h2>

                <input
                    className="w-full border p-2 mb-4"
                    placeholder="Date (e.g. JANUARY 17)"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                />

                {events.map((event, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                        <input
                            className="border p-2 flex-1"
                            placeholder="Time"
                            value={event.time}
                            onChange={e => updateEvent(i, 'time', e.target.value)}
                        />
                        <input
                            className="border p-2 flex-1"
                            placeholder="Title"
                            value={event.title}
                            onChange={e => updateEvent(i, 'title', e.target.value)}
                        />
                    </div>
                ))}

                <button onClick={addEvent} className="text-blue-600 mb-4">
                    + Add Event
                </button>

                <div className="flex justify-end gap-2">
                    <button onClick={onClose}>Cancel</button>
                    <button
                        onClick={handleSubmit}
                        className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleModal;
