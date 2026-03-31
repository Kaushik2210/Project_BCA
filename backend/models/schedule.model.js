// Import the full mongoose library to access Schema, model, and type utilities.
import mongoose from 'mongoose';

// =========================================================================
// SUB-SCHEMA: eventSchema
// Defines the shape of each individual event WITHIN a schedule day.
// This is embedded (nested) inside the main scheduleSchema below.
// =========================================================================
const eventSchema = new mongoose.Schema({
  time: {
    type: String,       // The time of the event (e.g., "09:00 AM")
    required: true      // Every event must have a time
  },
  title: {
    type: String,       // The name/description of the event (e.g., "Sunday Service")
    required: true      // Every event must have a title
  }
});

// =========================================================================
// MAIN SCHEMA: scheduleSchema
// Represents a single day on the church schedule (e.g., "JANUARY 17").
// Each day can contain multiple events (stored as an array of eventSchema).
// =========================================================================
const scheduleSchema = new mongoose.Schema({
  date: {
    type: String,       // A display-friendly date string like "JANUARY 17"
    required: true      // The date field is mandatory
  },
  // An array of embedded sub-documents using the eventSchema defined above.
  // MongoDB stores these as nested objects directly inside the schedule document.
  events: [eventSchema]
}, {
  // Enable automatic `createdAt` and `updatedAt` timestamp fields on every document.
  timestamps: true
});

// Compile the schema into a Model bound to the 'Schedule' collection in MongoDB.
const Schedule = mongoose.model('Schedule', scheduleSchema);

// Export the model as the default export.
export default Schedule;
