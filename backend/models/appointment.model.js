// Import model and Schema from mongoose.
import { model, Schema } from "mongoose";

// Define the Appointment schema — stores details of booked appointments.
const appointmentSchema = new Schema({
    slotId: {
        type: Schema.Types.ObjectId,  // References the Slot document's _id (foreign key relationship)
        ref: 'Slot',                   // Tells Mongoose which model to use when populating this reference
        required: true                 // Every appointment must be linked to a time slot
    },
    name: {
        type: String,
        required: true      // Full name of the person booking the appointment
    },
    email: {
        type: String,
        required: true      // Contact email of the person
    },
    phone: {
        type: String,
        required: true      // Phone number for the appointment
    },
    appointmentMode: {
        type: String,
        enum: ['in-person', 'virtual'],  // Only these two modes are allowed
        required: true                    // Must specify how the meeting will happen
    },
    message: {
        type: String,
        default: ""          // Optional additional message, defaults to empty
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],  // Only these three statuses are valid
        default: 'pending'                              // New appointments start as 'pending'
    },
})

// Create a compound unique index on slotId + email.
// This prevents the same person from booking the same time slot twice.
appointmentSchema.index({ slotId: 1, email: 1 }, { unique: true })

// Compile and export the model bound to the 'Appointment' collection.
const Appointment = model('Appointment', appointmentSchema);
export { Appointment };