import { Choir } from "../models/choir.model.js";

// GET all events (optionally filter by month and/or year)
const getEvents = async (req, res) => {
  try {
    const { month, year } = req.query;

    const filter = {};

    if (month) {
      filter.month = parseInt(month);
    }
    if (year) {
      filter.year = parseInt(year);
    }

    // Sort by year → month → day for chronological order
    const events = await Choir.find(filter)
      .sort({ year: 1, month: 1, day: 1 })
      .lean(); // lean() for better performance if you don't need Mongoose documents

    res.json({ success: true, data: events });
  } catch (err) {
    console.error('Error fetching choir events:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching events' });
  }
};

// CREATE a new choir event
const createEvent = async (req, res) => {
  try {
    const { year, month, day, type, title, time } = req.body;

    // Required fields validation
    if (year == null || month == null || day == null || !type || !title || !time) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: year, month, day, type, title, time',
      });
    }

    // Basic numeric/date validation
    if (
      typeof year !== 'number' ||
      year < 2000 ||
      year > 2100 ||
      month < 0 ||
      month > 11 ||
      day < 1 ||
      day > 31
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date values: year (2000–2100), month (0–11), day (1–31)',
      });
    }

    // Optional: more strict day validation per month could be added later

    const newEvent = await Choir.create({
      year: Number(year),
      month: Number(month),
      day: Number(day),
      type,
      title: title.trim(),
      time: time.trim(),
    });

    res.status(201).json({ success: true, data: newEvent });
  } catch (err) {
    console.error('Error creating choir event:', err);
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to create event (invalid or duplicate data)',
    });
  }
};

// UPDATE an existing choir event
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // If any date field is being updated, require all three
    const hasDateUpdate = 'year' in updateData || 'month' in updateData || 'day' in updateData;
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

      // Validate numbers
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

      // Normalize to numbers
      updateData.year = y;
      updateData.month = m;
      updateData.day = d;
    }

    // Trim strings if present
    if (updateData.title) updateData.title = updateData.title.trim();
    if (updateData.time) updateData.time = updateData.time.trim();

    const updatedEvent = await Choir.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedEvent) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({ success: true, data: updatedEvent });
  } catch (err) {
    console.error('Error updating choir event:', err);
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to update event',
    });
  }
};

// DELETE an event
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEvent = await Choir.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting choir event:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export { getEvents, createEvent, updateEvent, deleteEvent };