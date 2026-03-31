// Import React and the 'useState' hook from the React library.
// 'useState' allows us to add state (local component memory) to a functional component.
import React, { useState } from 'react';

// Define the ScheduleModal functional component.
// It accepts three props (arguments passed from the parent component):
// 1. `schedule`: The existing schedule data if editing, or null if creating a new one.
// 2. `onClose`: A function to close (hide) the modal.
// 3. `onSave`: A function to execute when the form is fully valid and submitted.
const ScheduleModal = ({ schedule, onClose, onSave }) => {
    
    // State 1: `date`. Initialize with the existing schedule date if provided, otherwise an empty string.
    // `setDate` is the function we call to update this specific piece of state.
    const [date, setDate] = useState(schedule?.date || '');
    
    // State 2: `events`. An array of event objects. 
    // If we're editing, use the existing events array.
    // If we're creating a new block, provide a default array containing one empty event template.
    const [events, setEvents] = useState(schedule?.events || [{ time: '', title: '' }]);
    
    // State 3: `error`. Used to store form validation error messages (like "Date is required").
    // Starts as `null` meaning no errors exist yet.
    const [error, setError] = useState(null);

    // Function to handle clicking the "Add Another Event" button.
    const addEvent = () => {
        // `setEvents` updates the array.
        // We use the spread operator `...events` to copy all existing events, 
        // and then append a brand new empty event `{ time: '', title: '' }` to the end.
        setEvents([...events, { time: '', title: '' }]);
    };

    // Function to remove a specific event from the array based on its index (position).
    const removeEvent = (index) => {
        // Safety check: Don't allow the user to delete the very last event row.
        // A schedule block MUST have at least 1 event.
        if (events.length > 1) {
            // `filter` creates a new array hiding any items that don't pass the test.
            // The test `i !== index` removes the exact item the user clicked to delete.
            setEvents(events.filter((_, i) => i !== index));
        }
    };

    // Function to handle typing into an event title or time input field.
    // Takes the `index` (which row), the `field` ('time' or 'title'), and the newly typed `value`.
    const updateEvent = (index, field, value) => {
        // Create a shallow copy of the events array because we are NEVER allowed to mutate React state directly.
        const updated = [...events];
        // Access the specific event by index, then target its specific property using bracket notation `[field]`, and update it.
        updated[index][field] = value;
        // Save the freshly updated array back into the component state.
        setEvents(updated);
    };

    // The primary validation and submission handler function. Runs when "Save Schedule" is clicked.
    const handleSubmit = () => {
        // Step 1: Clear out any old error messages from a previous failed submission attempt.
        setError(null);
        
        // Trim whitespace off the start and end of the typed date to prevent messy inputs like "   Monday   ".
        const trimmedDate = date.trim();
        
        // Validation check: Did they leave the date blank?
        if (!trimmedDate) {
            // Render an error message and instantly Abort the save process (`return`).
            setError('Date is required');
            return;
        }
        
        // Validation check: Ensure the date length is physically reasonable (between 3 and 30 characters).
        if (trimmedDate.length < 3 || trimmedDate.length > 30) {
            // Abort save if out of bounds.
            setError('Date must be between 3 and 30 characters');
            return;
        }

        // Standard javascript 'for' loop to iterate through every single event row in our array for validation.
        for (let i = 0; i < events.length; i++) {
            // Grab the current event being checked.
            const ev = events[i];
            // Clean up its title.
            const trimmedTitle = ev.title.trim();
            // Clean up its time string, using `?.` (optional chaining) safely in case it's undefined.
            const timeTrimmed = ev.time?.trim();
            
            // Validation: Both fields inside an event row must be filled out.
            if (!timeTrimmed || !trimmedTitle) {
                // `i + 1` makes the error human-readable (e.g., "Event #1" instead of "Event #0").
                setError(`Event #${i + 1} requires both time and title`);
                return; // Abort the whole save process.
            }
            
            // Validation: Title string length boundaries.
            if (trimmedTitle.length < 3 || trimmedTitle.length > 50) {
                setError(`Event #${i + 1} title must be between 3 and 50 characters`);
                return;
            }
            
            // Business Rule Validation: No overnight events. 
            // The browser's `<input type="time">` returns a 24hr string like "14:30".
            // We split it by the colon to get ["14", "30"], map them to Javascript Numbers, and destructure off the `hours` variable.
            const [hours] = timeTrimmed.split(':').map(Number);
            
            // If the hour is 0 (Midnight) through 5 (5:59 AM), trigger a hard error.
            if (hours < 6) {
                setError(`Event #${i + 1} cannot be scheduled between midnight and 6:00 AM`);
                return;
            }
        }

        // If the code successfully makes it past all the `return` abort traps above, the data is officially 100% clean!
        // We call the `onSave` prop function that the Parent component provided.
        // We pass up an object containing our trimmed date cleanly formatted.
        // We use `.map()` on the events array to ensure every block's text string is trimmed of trailing spaces before saving to the database.
        onSave({ 
            date: trimmedDate, 
            events: events.map(e => ({ ...e, title: e.title.trim(), time: e.time.trim() })) 
        });
    };

    // The UI Render Return block (JSX).
    return (
        // Outermost overlay background (the dark faded area behind the pop-up box).
        // `fixed inset-0` stretches it perfectly across the screen to trap clicks. `z-50` puts it visually on top of everything.
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            
            {/* The white Modal Box floating in the center. Built with max-width and internal scrolling (`overflow-y-auto`). */}
            <div className="bg-white p-6 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                
                {/* Dynamically render the header text. If 'schedule' data was passed in, we are Editing. If missing, we are Adding. */}
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    {schedule ? 'Edit Schedule' : 'Add Schedule'}
                </h2>

                {/* Conditional Rendering: If the `error` state string is NOT null, physically render this red alert box showing the exact error text. */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* --- DATE INPUT FIELD SECTION --- */}
                <div className="mb-6">
                    <div className="flex justify-between mb-1">
                        {/* Label explicitly marking Date as a required field */}
                        <label className="block text-sm font-semibold text-gray-700">Date *</label>
                        
                        {/* Character counter. Uses a Javascript Template Literal to dynamically apply a red text color class if they type over 30 characters. */}
                        <span className={`text-xs ${date.length > 30 ? 'text-red-500' : 'text-gray-500'}`}>
                            {date.length}/30
                        </span>
                    </div>
                    {/* The date physical input element */}
                    <input
                        // Advanced Dynamic CSS: If the user has started typing (length > 0) AND the trimmed length is under our minimum limit of 3...
                        // We instantly flag the input border as Red (invalid). Otherwise, keep it standard gray/blue.
                        className={`w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 ${
                            date.length > 0 && date.trim().length < 3
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder="Date (e.g. JANUARY 17)"
                        // The input physically reads its displayed text from our component's `date` state. (Controlled Component Pattern).
                        value={date}
                        // HTML5 attribute to strictly block typing past 30 chars.
                        maxLength="30"
                        // Event Listener: Every time a keystroke happens, immediately save the new string to the `date` state variable.
                        onChange={e => setDate(e.target.value)}
                    />
                </div>

                {/* --- EVENTS ARRAY SECTION --- */}
                <label className="block text-sm font-semibold text-gray-700 mb-2">Events *</label>
                
                {/* ITERATOR: Look at our `events` array state. For each item inside, generate a visual row box. */}
                {/* `i` is the array index (0, 1, 2). */}
                {events.map((event, i) => (
                    
                    // The main row wrapper. Needs a unique `key` prop so React's rendering engine can track row list changes uniquely without glitches.
                    <div key={i} className="flex flex-col md:flex-row gap-3 mb-4 border border-gray-200 p-4 rounded-lg bg-gray-50 relative">
                        
                        {/* Conditional Rendering: Only show the red "Delete (X)" button if there is MORE than 1 event row on screen currently. */}
                        {events.length > 1 && (
                            <button
                                // Fire the `removeEvent` function passing the specific index `i` of this generated row to delete it.
                                onClick={() => removeEvent(i)}
                                // Absolute positioning to pin the X button slightly outside the top-right corner of the gray box.
                                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-lg hover:bg-red-600 shadow"
                                title="Remove event"
                                // Good practice: Mark as 'button' type so it doesn't accidentally submit nearest forms.
                                type="button"
                            >
                                ×
                            </button>
                        )}

                        {/* Event Time Input Area */}
                        <div className="w-full md:w-1/3">
                            <input
                                // Enforce native browser Time picker interface plugin.
                                type="time"
                                // Dynamic CSS check to instantly flag the box red if they selected a time before 6 AM.
                                className={`w-full border rounded p-2 focus:outline-none focus:ring-2 ${
                                    event.time && Number(event.time.split(':')[0]) < 6
                                        ? 'border-red-500 focus:ring-red-500 text-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                                // HTML5 suggestion attribute to soft-block earlier times in the UI modal.
                                min="06:00"
                                // Bound value.
                                value={event.time}
                                // Send changes through our custom multi-purpose updater function targeting the 'time' object property exactly on row `i`.
                                onChange={e => updateEvent(i, 'time', e.target.value)}
                            />
                            
                            {/* If they did pick a time magically before 6 AM, reveal this instant red helper text underneath to explain what went wrong. */}
                            {event.time && Number(event.time.split(':')[0]) < 6 && (
                                <p className="text-xs text-red-500 mt-1">Please select a time after 6:00 AM</p>
                            )}
                        </div>

                        {/* Event Title String Input Area */}
                        <div className="w-full flex-1">
                            <input
                                // Dynamic CSS validator logic again: flag red instantaneously if under 3 characters once typing starts.
                                className={`w-full border rounded p-2 focus:outline-none focus:ring-2 ${
                                    event.title.length > 0 && event.title.trim().length < 3
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                                placeholder="Event Title"
                                value={event.title}
                                maxLength="50"
                                // Updating the 'title' property on row index `i`.
                                onChange={e => updateEvent(i, 'title', e.target.value)}
                            />
                            
                            {/* Inner Title Character Counter. Flips red if approaching exactly 50 chars dynamically. */}
                            <div className="flex justify-end mt-1">
                                <span className={`text-xs ${event.title.length > 50 ? 'text-red-500' : 'text-gray-500'}`}>
                                    {event.title.length}/50
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Function Button: Append a new blank event block to the array length. */}
                <button onClick={addEvent} className="text-blue-600 font-medium hover:text-blue-800 transition mb-6">
                    + Add Another Event
                </button>

                {/* Bottom Footer Actions block for final submission. */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    {/* Cancel Action Button wrapper, simply calls the parent-provided 'onClose' prop to kill the modal immediately, tossing unsaved changes. */}
                    <button onClick={onClose} className="px-5 py-2 text-gray-700 hover:bg-gray-100 rounded transition">
                        Cancel
                    </button>
                    
                    {/* Primary Save Action Button. Triggers the massive validation routine `handleSubmit` configured at the top. */}
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

// Expose the finished Component logic to be imported securely into the Admin Panel codebase.
export default ScheduleModal;
