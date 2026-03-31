// Import custom error and response formatting classes.
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

// Import the Appointment Mongoose model for the 'appointments' collection.
import { Appointment } from "../models/appointment.model.js";

// Import the async handler wrapper.
import { asyncHandler } from "../utils/asyncHandler.js";

// Import the Slot model to manage appointment time slots.
import { Slot } from "../models/slot.model.js";

// Import the Zod validation schema that enforces rules on appointment booking data.
import { bookAppointmentSchema } from "../schema/appointment.schema.js";

// =========================================================================
// @desc    Book a new appointment
// @route   POST /api/v1/appointment
// @access  Public (any visitor can book an appointment)
// =========================================================================
const bookAppointment = asyncHandler(async (req, res) => {
    // Validate the entire request body against the Zod schema.
    // This checks name, email, phone format, required fields, etc. all at once.
    const validation = bookAppointmentSchema.safeParse(req.body);

    // If validation failed, join all error messages into one string and return 400.
    if (!validation.success) {
        return res.status(400).json(new ApiError(400, validation.error.errors.map(e => e.message).join(", ")).toJSON());
    }

    // Destructure the validated fields from the request body.
    const { slotId, name, email, phone, appointmentMode, message } = req.body;

    // ATOMIC UPDATE: Use `findOneAndUpdate` to find an unbooked slot AND mark it as booked in a single operation.
    // This prevents a race condition where two users could book the same slot simultaneously.
    // The query `{ _id: slotId, isBooked: false }` only matches if the slot exists AND is still available.
    const slot = await Slot.findOneAndUpdate(
        { _id: slotId, isBooked: false },       // Filter: find this specific unbooked slot
        { $set: { isBooked: true } },            // Update: mark it as booked
        { new: true }                            // Option: return the updated document (not the old one)
    );

    // If no slot was returned, either the slot doesn't exist or it was already booked by someone else.
    if (!slot) {
        return res.status(400).json(new ApiError(400, "Slot already booked or not found").toJSON());
    }

    // Create the appointment document in the database with all the user's details.
    const appointment = await Appointment.create({
        slotId,           // Reference to the time slot that was just booked
        name,             // User's full name
        email,            // User's email address
        phone,            // User's phone number
        appointmentMode,  // Either 'in-person' or 'online'
        message           // Optional message from the user
    });

    // Link the appointment back to the slot by storing the appointment's ID on the slot document.
    slot.appointmentId = appointment._id;
    // Persist this update to the slot.
    await slot.save();

    // Return HTTP 201 (Created) with the new appointment data.
    return res.status(201).json(new ApiResponse(201, "Appointment created successfully", appointment));
});

// =========================================================================
// @desc    Get all appointments with their linked slot details
// @route   GET /api/v1/appointment
// @access  Private (Admin only)
// =========================================================================
const getAppointments = asyncHandler(async (req, res) => {
  // Fetch all appointments from the database.
  // `.populate('slotId', 'date startTime endTime')` replaces the slotId reference with the actual slot document data.
  // This is a Mongoose "JOIN" equivalent — it embeds the slot's date and time fields directly into each appointment object.
  // `.lean()` returns plain JS objects instead of Mongoose documents, improving performance.
  const appointments = await Appointment.find().populate('slotId', 'date startTime endTime').lean();

  // Return the fully populated appointment list.
  return res.status(200).json(new ApiResponse(200, appointments, "Appointments retrieved successfully"));
});

// =========================================================================
// @desc    Update an appointment's status (pending → confirmed or cancelled)
// @route   PATCH /api/v1/appointment/:id
// @access  Private (Admin only)
// =========================================================================
const updateAppointmentStatus = asyncHandler(async (req, res) => {
    // Extract the appointment ID from the URL parameter.
    const { id } = req.params;
    // Extract the new status from the request body.
    const { status } = req.body;

    // Whitelist validation: Only allow these three specific status values.
    if(!['pending', 'confirmed', 'cancelled'].includes(status)){
        return res.status(400).json(new ApiError(400, "Invalid status").toJSON());
    }

    // Find the appointment document by ID.
    const appointment = await Appointment.findById(id);

    // If not found, return 404.
    if(!appointment){
        return res.status(404).json(new ApiError(404, "Appointment not found").toJSON());
    }

    // SPECIAL LOGIC: If the admin is cancelling the appointment, free up the time slot.
    if(status === "cancelled"){
        // Find the slot linked to this appointment.
        const slot = await Slot.findById(appointment.slotId);

        // If the slot exists, reset its booking status so it becomes available again.
        if(slot){
            slot.isBooked = false;        // Mark slot as available
            slot.appointmentId = null;    // Remove the appointment reference
            await slot.save();            // Persist changes
        }
    }

    // Update the appointment's status field.
    appointment.status = status;
    // Save the updated appointment to the database.
    await appointment.save();

    // Return the updated appointment.
    return res.status(200).json(new ApiResponse(200, "Appointment status updated successfully", appointment));
})

// Export all three controller functions.
export { bookAppointment, getAppointments, updateAppointmentStatus };
