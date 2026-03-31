// Import Schema and model from mongoose.
import { Schema, model } from "mongoose";
// Note: the 'boolean' import from zod below is unused but remains in the original code.
import { boolean } from "zod";

// Define the Prayer schema — stores prayer requests submitted by visitors.
const prayerSchema = new Schema({
    name: {
        type: String,
        required: true      // Name of the person requesting prayer
    },
    description: {
        type: String,
        required: true,     // The prayer request text/description
    },
    prayed: {
        type: Boolean,
        required: false,    // Not required on creation
        default: false      // Defaults to false; admin sets to true when the prayer has been prayed for
    }
}, { 
    timestamps: true   // Adds createdAt and updatedAt fields automatically
})

// Compile and export the model bound to the 'Prayer' collection.
const Prayer = model("Prayer", prayerSchema)
export default Prayer