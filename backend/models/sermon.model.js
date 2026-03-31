// Import mongoose for schema definition.
import mongoose from "mongoose";

// Define the Sermon schema — each sermon document stores audio metadata.
const sermonSchema = mongoose.Schema({
    title: {
        type: String,       // Title of the sermon
        trim: true,         // Automatically strip leading/trailing whitespace
    },
    description: {
        type: String,       // A short description of the sermon content
        trim: true          // Auto-trim whitespace
    },
    sermon_url: {
        type: String,       // The Cloudinary HTTPS URL where the audio file is hosted
        trim: true,
        required: true      // A sermon MUST have an audio URL
    },
    sermon_public_id: {
        type: String,       // Cloudinary's unique public ID for this file (needed for deletion/updates)
        trim: true,
        required: true      // Required so we can manage the file on Cloudinary later
    }
})

// Compile and export the model bound to the 'Sermon' collection.
const Sermon = mongoose.model('Sermon', sermonSchema);
export default Sermon;