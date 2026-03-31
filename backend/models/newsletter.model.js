// Import Schema and model from mongoose.
import { Schema, model } from "mongoose";

// Define the Newsletter schema — stores email addresses of subscribers.
const newsletterSchema = new Schema({
    email: {
        type: String,
        required: true,     // Email is mandatory
        unique: true        // Each email can only subscribe once (prevents duplicates)
    }
}, { 
    timestamps: true   // Adds createdAt field to know when they subscribed
})

// Compile and export the model bound to the 'Newsletter' collection.
const Newsletter = model("Newsletter", newsletterSchema);
export { Newsletter };