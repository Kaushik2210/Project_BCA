// Import custom error and response formatting classes.
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

// Import the Slot Mongoose model to interact with the 'slots' collection in MongoDB.
import { Slot } from "../models/slot.model.js";

// Import the async handler wrapper.
import { asyncHandler } from "../utils/asyncHandler.js";

// =========================================================================
// @desc    Get available (unbooked) slots for a specific date
// @route   GET /api/v1/slot?date=YYYY-MM-DD
// @access  Public (visitors can see available time slots)
// =========================================================================
const getSlotsByDate = asyncHandler(async (req, res) => {
    // Extract the 'date' query parameter from the URL (e.g., ?date=2026-04-01).
    const { date } = req.query;
    
    // Query MongoDB for all slots on that date that are NOT yet booked.
    const slots = await Slot.find({ date, isBooked: false });

    // If no available slots were found, return 404.
    if(!slots){
        return res.status(404).json(new ApiError(404, "No slots are available for the given date"));
    }

    // Transform the raw Mongoose documents into a simpler format for the frontend.
    // Each item becomes an object like { "slotId123": "09:00-10:00" }.
    const slotsAvailable = [];

    slots.forEach((slot) => {
        // Use the slot's MongoDB _id as the key, and combine startTime-endTime as the value.
        slotsAvailable.push({ [`${slot._id}`]: `${slot.startTime}-${slot.endTime}` });
    })

    // Return the formatted list of available slots.
    return res.status(200).json(new ApiResponse(200, slotsAvailable, "slots are available"));
})

// =========================================================================
// @desc    Create new time slots for a given date (supports bulk creation)
// @route   POST /api/v1/slot
// @access  Private (Admin only)
// =========================================================================
const createSlot = asyncHandler(async (req, res) => {
    // Extract the date and array of slot time ranges from the request body.
    const { date, slots } = req.body;

    // Array to collect any slots that conflict with existing ones.
    const errorSlot = [];

    // Loop through each slot the admin wants to create.
    for(let i = 0; i < slots.length; i++){
        // Get the current slot's start and end times.
        const currentSlot = slots[i];

        // OVERLAP CHECK: Query the database for any existing slot on the same date
        // whose time range overlaps with the new slot.
        // Logic: An overlap exists if an existing slot starts BEFORE the new one ends
        //        AND ends AFTER the new one starts.
        const conflict = await Slot.findOne({
            date,
            startTime: { $lt: currentSlot.endTime },   // Existing starts before new ends
            endTime: { $gt: currentSlot.startTime }     // Existing ends after new starts
        });

        // If a conflict was found, add it to the error list (don't create this slot).
        if(conflict){
            errorSlot.push(conflict);
        } else {
            // No conflict — create and save the new slot document.
            const newSlot = new Slot({ date, startTime: currentSlot.startTime, endTime: currentSlot.endTime });
            await newSlot.save();
        }
    }

    // If any conflicts were detected, return HTTP 409 (Conflict) with the conflicting slot details.
    if(errorSlot.length !== 0){
        return res.status(409).json(new ApiError(409, "Slots are in conflict with existing slots", errorSlot))
    }

    // All slots were created successfully.
    return res.status(201).json(new ApiResponse(201, "Slots created successfully"));
})

// Export both controller functions.
export { getSlotsByDate, createSlot };
