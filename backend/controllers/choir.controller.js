// Import the Choir Mongoose model to interact with the 'choirs' collection in MongoDB.
import { Choir } from "../models/choir.model.js";

// =========================================================================
// @desc    Get choir events (optionally filtered by month and/or year)
// @route   GET /api/v1/choir?month=3&year=2026
// @access  Public
// =========================================================================
const getEvents = async (req, res) => {
  try {
    // Extract optional 'month' and 'year' query parameters from the URL.
    const { month, year } = req.query;

    // Build a dynamic filter object. Start empty and add fields only if provided.
    const filter = {};

    // If a month was provided, parse it to an integer and add to the filter.
    if (month) {
      filter.month = parseInt(month);
    }
    // If a year was provided, parse it to an integer and add to the filter.
    if (year) {
      filter.year = parseInt(year);
    }

    // Query MongoDB with the filter. Sort results chronologically (year → month → day).
    // `.lean()` returns plain JS objects instead of Mongoose documents for better performance.
    const events = await Choir.find(filter)
      .sort({ year: 1, month: 1, day: 1 })
      .lean();

    // Return the events array.
    res.json({ success: true, data: events });
  } catch (err) {
    // Log the error for server-side debugging.
    console.error('Error fetching choir events:', err);
    // Return a 500 Internal Server Error.
    res.status(500).json({ success: false, message: 'Server error while fetching events' });
  }
};

// =========================================================================
// @desc    Create a new choir event
// @route   POST /api/v1/choir
// @access  Private (Admin only)
// =========================================================================
const createEvent = async (req, res) => {
  try {
    // Destructure all required fields from the request body.
    const { year, month, day, type, title, time } = req.body;

    // Validate that all required fields are present.
    // `== null` catches both null and undefined values.
    if (year == null || month == null || day == null || !type || !title || !time) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: year, month, day, type, title, time',
      });
    }

    // Validate that date values are within acceptable numeric ranges.
    if (
      typeof year !== 'number' ||
      year < 2000 ||      // Year must be 2000 or later
      year > 2100 ||      // Year must be 2100 or earlier
      month < 0 ||        // Month is 0-indexed (0 = January)
      month > 11 ||       // Month max is 11 (December)
      day < 1 ||          // Day starts at 1
      day > 31            // Day max is 31
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date values: year (2000–2100), month (0–11), day (1–31)',
      });
    }

    // Create the new choir event document, trimming whitespace from string fields.
    const newEvent = await Choir.create({
      year: Number(year),
      month: Number(month),
      day: Number(day),
      type,
      title: title.trim(),
      time: time.trim(),
    });

    // Return HTTP 201 (Created) with the new event.
    res.status(201).json({ success: true, data: newEvent });
  } catch (err) {
    console.error('Error creating choir event:', err);
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to create event (invalid or duplicate data)',
    });
  }
};

// =========================================================================
// @desc    Update an existing choir event
// @route   PUT /api/v1/choir/:id
// @access  Private (Admin only)
// =========================================================================
const updateEvent = async (req, res) => {
  try {
    // Extract the event ID from the URL parameter.
    const { id } = req.params;
    // Spread the request body into a new object for safe modification.
    const updateData = { ...req.body };

    // Check if ANY date field is being updated.
    const hasDateUpdate = 'year' in updateData || 'month' in updateData || 'day' in updateData;
    // If updating dates, ALL three fields (year, month, day) must be provided together.
    if (hasDateUpdate) {
      if (
        updateData.year == null ||
        updateData.month == null ||
        updateData.day == null
      ) {
        return res.status(400).json({
          success: false,
          message: 'When updating date, year, month, and day must all be provided',
        });
      }

      // Parse and validate each date component.
      const y = Number(updateData.year);
      const m = Number(updateData.month);
      const d = Number(updateData.day);

      if (isNaN(y) || y < 2000 || y > 2100) {
        return res.status(400).json({ success: false, message: 'Invalid year (2000–2100)' });
      }
      if (isNaN(m) || m < 0 || m > 11) {
        return res.status(400).json({ success: false, message: 'Invalid month (0–11)' });
      }
      if (isNaN(d) || d < 1 || d > 31) {
        return res.status(400).json({ success: false, message: 'Invalid day (1–31)' });
      }

      // Normalize to proper Number types.
      updateData.year = y;
      updateData.month = m;
      updateData.day = d;
    }

    // Trim whitespace from string fields if they are being updated.
    if (updateData.title) updateData.title = updateData.title.trim();
    if (updateData.time) updateData.time = updateData.time.trim();

    // Find and update the event in one atomic operation.
    // `new: true` returns the updated document. `runValidators: true` enforces schema validation on the update.
    const updatedEvent = await Choir.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    // If no document was found with that ID.
    if (!updatedEvent) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Return the updated event.
    res.json({ success: true, data: updatedEvent });
  } catch (err) {
    console.error('Error updating choir event:', err);
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to update event',
    });
  }
};

// =========================================================================
// @desc    Delete a choir event permanently
// @route   DELETE /api/v1/choir/:id
// @access  Private (Admin only)
// =========================================================================
const deleteEvent = async (req, res) => {
  try {
    // Extract the event ID from the URL parameter.
    const { id } = req.params;
    // Find and delete the event in one atomic operation.
    const deletedEvent = await Choir.findByIdAndDelete(id);

    // If no event was found/deleted.
    if (!deletedEvent) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Confirm successful deletion.
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting choir event:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Export all four CRUD functions.
export { getEvents, createEvent, updateEvent, deleteEvent };