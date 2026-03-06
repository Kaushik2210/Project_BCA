import Schedule from "../models/schedule.model.js";

//
// @desc    Get all schedule days
// @route   GET /api/v1/schedule
// @access  Public
//
export const getSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.find().sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: schedule.length,
      data: schedule
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule'
    });
  }
};

//
// @desc    Create schedule day
// @route   POST /api/v1/schedule
// @access  Private (Admin)
//
export const createSchedule = async (req, res) => {
  try {
    const { date, events } = req.body;

    const newDay = await Schedule.create({ date, events });

    res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      data: newDay
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to create schedule'
    });
  }
};

//
// @desc    Update schedule day
// @route   PUT /api/v1/schedule/:id
// @access  Private (Admin)
//
export const updateSchedule = async (req, res) => {
  try {
    const updated = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Schedule updated successfully',
      data: updated
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update schedule'
    });
  }
};

//
// @desc    Delete schedule day
// @route   DELETE /api/v1/schedule/:id
// @access  Private (Admin)
//
export const deleteSchedule = async (req, res) => {
  try {
    const deleted = await Schedule.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete schedule'
    });
  }
};
