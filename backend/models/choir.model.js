// Import mongoose and its Schema class.
import mongoose, { Schema } from 'mongoose';

// Define the Choir event schema — stores individual choir practice sessions and events by date.
const ChoirSchema = new Schema({
  year: { 
    type: Number, 
    required: true,
    min: [2000, 'Year must be 2000 or later'],   // Custom error message for validation failures
    max: [2100, 'Year cannot exceed 2100']        // Upper limit for year
  },
  month: { 
    type: Number, 
    required: true,
    min: 0,       // JavaScript months are 0-indexed (0 = January)
    max: 11       // 11 = December
  },
  day: { 
    type: Number, 
    required: true,
    min: 1,       // Day of the month starts at 1
    max: 31       // Maximum possible day
  },
  type: { 
    type: String, 
    enum: ['practice', 'event'],   // Only 'practice' or 'event' are valid types
    required: true 
  },
  title: { 
    type: String, 
    required: true,
    trim: true    // Auto-strip whitespace
  },
  time: { 
    type: String, 
    required: true,
    trim: true    // Auto-strip whitespace
  }
}, { 
  timestamps: true   // Adds createdAt and updatedAt automatically
});

// NOTE: A compound index on { year, month, day } could optimize date-based queries.
// Currently commented out for flexibility.
//ChoirSchema.index({ year: 1, month: 1, day: 1 });

// Compile and export the model bound to the 'Choir' collection.
const Choir = mongoose.model('Choir', ChoirSchema);
export { Choir };