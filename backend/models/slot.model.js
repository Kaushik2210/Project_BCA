// Import model and Schema from mongoose.
import { model, Schema } from "mongoose";

// Define the Slot schema — represents available time slots for appointments.
const slotSchema = new Schema({
  date: {
    type: Date,         // JavaScript Date object — stores the full date for the slot
    required: true      // A slot must have a date
  },
  startTime: {
    type: String,       // Start time as a string (e.g., "09:00")
    required: true      // Required to define the slot window
  },
  endTime: {
    type: String,       // End time as a string (e.g., "10:00")
    required: true      // Required to define the slot window
  },
  isBooked: {
    type: Boolean,
    default: false      // Slot starts as available (unbooked)
  },
  appointmentId: {
    type: Schema.Types.ObjectId,  // References the Appointment document that booked this slot
    ref: "Appointment",            // Links to the Appointment model for population
    default: null                  // Null when the slot is unbooked
  }
});

// Create a compound unique index on date + startTime + endTime.
// This prevents duplicate slots from being created for the same time window on the same date.
slotSchema.index({ date: 1, startTime: 1, endTime: 1 }, { unique: true });

// Compile and export the model bound to the 'Slot' collection.
const Slot = model('Slot', slotSchema);
export { Slot };