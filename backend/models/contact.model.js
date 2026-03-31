// Import Schema and model from mongoose.
import { Schema, model } from "mongoose";

// Define the Contact schema — stores messages submitted via the website's contact form.
const ContactSchema = new Schema({
    name: {
        type: String,
        required: true      // Submitter's name is required
    },
    email: {
        type: String,
        required: true      // Submitter's email is required for replying
    },
    message: {
        type: String,
        required: true      // The actual message content is required
    },
    replied: {
        type: Boolean,
        default: false      // Tracks whether an admin has replied to this message (defaults to not replied)
    }
});

// Compile and export the model bound to the 'Contact' collection.
const Contact = model("Contact", ContactSchema);
export { Contact };
